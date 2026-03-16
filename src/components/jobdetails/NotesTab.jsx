// src/components/jobdetails/NotesTab.jsx
// Job Notes — ticketing-style chat
// GET    /api/jobs/{id}/notes/           → returns array directly (not paginated)
// POST   /api/jobs/{id}/notes/send/      → { message }  returns created note
// DELETE /api/jobs/{id}/notes/{note_id}/ → 204
// Polls every 15 s for new messages from other users.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { apiFetch } from '@/utils/apiFetch'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconSend()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14 2L2 6.5l5 2 2 5L14 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 8.5l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IconTrash()   { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3h10M4 3V1.5h5V3M3 3l.8 8h5.4L10 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconRefresh() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5A4.5 4.5 0 112.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M2.5 1.5v2.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }

// role → colour palette
const ROLE_STYLE = {
  admin:    { avatar: 'bg-[#0f172b] text-white',    bubble: 'bg-[#0f172b] text-white rounded-br-[4px]',    badge: 'bg-[#1d293d] text-[#93c5fd]'    },
  manager:  { avatar: 'bg-[#f54900] text-white',    bubble: 'bg-[#f54900] text-white rounded-br-[4px]',    badge: 'bg-[#c73b00] text-white'         },
  employee: { avatar: 'bg-[#e2e8f0] text-[#45556c]',bubble: 'bg-white border border-[#e2e8f0] text-[#0f172b] rounded-bl-[4px]', badge: 'bg-[#f1f5f9] text-[#62748e]' },
}
const DEFAULT_STYLE = ROLE_STYLE.employee

function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
}

function fmtDateLabel(iso) {
  const d = new Date(iso)
  const today     = new Date()
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString())     return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getInitials(name) {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.trim().slice(0, 2).toUpperCase()
}

// Safely coerce is_mine to boolean — API may return bool or string "true"/"false"
function isMineCoerce(val) {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string')  return val.toLowerCase() === 'true'
  return false
}

// ── Date separator ────────────────────────────────────────────────────────────
function DateSep({ label }) {
  return (
    <div className="flex items-center gap-3 py-1 select-none">
      <div className="flex-1 h-px bg-[#f1f5f9]" />
      <span className="text-[11px] font-semibold text-[#90a1b9] whitespace-nowrap px-1">{label}</span>
      <div className="flex-1 h-px bg-[#f1f5f9]" />
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ note, onDelete, deleting }) {
  const mine  = isMineCoerce(note.is_mine)
  const role  = note.sender_role?.toLowerCase() ?? 'employee'
  const style = ROLE_STYLE[role] ?? DEFAULT_STYLE

  return (
    <div className={`flex items-end gap-2 w-full ${mine ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mb-1 ${style.avatar}`}>
        {getInitials(note.sender_name)}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1 min-w-0 max-w-[68%] ${mine ? 'items-end' : 'items-start'}`}>

        {/* Name + role + time */}
        <div className={`flex items-center gap-1.5 flex-wrap px-0.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[12px] font-semibold text-[#0f172b] whitespace-nowrap">{note.sender_name}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full capitalize ${style.badge}`}>
            {note.sender_role}
          </span>
          <span className="text-[11px] text-[#90a1b9]">{fmtTime(note.created_at)}</span>
        </div>

        {/* Bubble row — bubble + delete btn */}
        <div className={`group flex items-end gap-1.5 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`px-3.5 py-2.5 rounded-[14px] text-[13.5px] leading-[20px] shadow-sm break-words ${style.bubble}`}>
            {note.message}
          </div>

          {/* Delete — only my messages, appears on hover */}
          {mine && (
            <button
              onClick={() => onDelete(note.id)}
              disabled={deleting === note.id}
              title="Delete"
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded-full bg-[#fef2f2] hover:bg-[#ffe2e2] text-[#c10007] disabled:opacity-40 shrink-0 mb-0.5"
            >
              {deleting === note.id
                ? <div className="w-3 h-3 rounded-full border border-[#c10007]/30 border-t-[#c10007] animate-spin"/>
                : <IconTrash />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── NotesTab ──────────────────────────────────────────────────────────────────
export default function NotesTab({ job }) {
  const [notes,    setNotes]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [message,  setMessage]  = useState('')
  const [sending,  setSending]  = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [error,    setError]    = useState('')
  const [lastPoll, setLastPoll] = useState(null) // timestamp of last poll for indicator

  const bottomRef   = useRef(null)
  const textareaRef = useRef(null)
  const isTabActive = useRef(true) // track if tab is mounted

  // ── Parse notes from any response shape ────────────────────────────────────
  // API returns { job_id, count, notes: [...] }
  // Also guard against direct array or {results:[]} shapes for safety
  const parseNotes = (data) => {
    if (!data) return []
    if (Array.isArray(data)) return data                   // direct array
    if (Array.isArray(data.notes)) return data.notes       // ← actual API shape
    if (Array.isArray(data.results)) return data.results   // paginated fallback
    return []
  }

  // ── Fetch all notes ─────────────────────────────────────────────────────────
  const fetchNotes = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const { data, ok } = await apiFetch(`jobs/${job.id}/notes/`)
      if (ok) {
        const list = parseNotes(data)
        setNotes(list)
        setLastPoll(new Date())
      }
    } catch (_) {}
    if (!silent) setLoading(false)
  }, [job.id])

  // Initial load
  useEffect(() => {
    isTabActive.current = true
    fetchNotes(false)
    return () => { isTabActive.current = false }
  }, [fetchNotes])

  // ── Poll every 15 s for new messages ───────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTabActive.current) fetchNotes(true) // silent = no loading spinner
    }, 15000)
    return () => clearInterval(interval)
  }, [fetchNotes])

  // ── Auto-scroll to bottom ───────────────────────────────────────────────────
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
  }, [])

  useEffect(() => {
    if (!loading && notes.length > 0) scrollToBottom('auto')
  }, [loading]) // only on initial load — instant scroll

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = message.trim()
    if (!text || sending) return
    setSending(true)
    setError('')

    const { data, ok } = await apiFetch(`jobs/${job.id}/notes/send/`, {
      method: 'POST',
      body: JSON.stringify({ message: text }),
    })

    if (ok && data) {
      // Append the returned note object — it has is_mine, sender_role etc. already set
      setNotes(prev => [...prev, data])
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) textareaRef.current.style.height = '36px'
      textareaRef.current?.focus()
      setTimeout(() => scrollToBottom('smooth'), 50)
    } else {
      setError('Failed to send. Please try again.')
    }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Delete note ──────────────────────────────────────────────────────────────
  const handleDelete = async (noteId) => {
    setDeleting(noteId)
    const { ok } = await apiFetch(`jobs/${job.id}/notes/${noteId}/`, { method: 'DELETE' })
    if (ok) setNotes(prev => prev.filter(n => n.id !== noteId))
    setDeleting(null)
  }

  // ── Build grouped list with date separators ─────────────────────────────────
  const grouped = []
  let lastDate = null
  for (const note of notes) {
    const label = fmtDateLabel(note.created_at)
    if (label !== lastDate) {
      grouped.push({ type: 'sep', label, key: `sep-${note.id}` })
      lastDate = label
    }
    grouped.push({ type: 'note', note, key: note.id })
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: '540px' }}>

      {/* ── Top bar — poll indicator ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#f1f5f9] bg-[#fafafa] shrink-0">
        <p className="text-[12px] text-[#90a1b9]">
          {loading ? 'Loading messages…' : `${notes.length} message${notes.length !== 1 ? 's' : ''}`}
        </p>
        <button
          onClick={() => fetchNotes(false)}
          disabled={loading}
          className="flex items-center gap-1.5 text-[12px] text-[#62748e] hover:text-[#f54900] transition-colors disabled:opacity-40"
        >
          <span className={loading ? 'animate-spin' : ''}><IconRefresh /></span>
          {lastPoll ? `Synced ${fmtTime(lastPoll.toISOString())}` : 'Refresh'}
        </button>
      </div>

      {/* ── Chat area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0 bg-[#f8fafc]">

        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
            <p className="text-[#90a1b9] text-[13px]">Loading messages…</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
            <div className="w-14 h-14 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center shadow-sm">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M13 2C7.477 2 3 6.25 3 11.5c0 2.6 1.05 4.95 2.8 6.7L4.5 22.5l5.1-1.65A10.5 10.5 0 0013 21c5.523 0 10-4.25 10-9.5S18.523 2 13 2z" stroke="#cad5e2" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-[#62748e] text-[14px] font-semibold">No messages yet</p>
            <p className="text-[#90a1b9] text-[13px] text-center max-w-[240px]">
              Start the conversation — messages are shared with all admins, managers, and the assigned employee.
            </p>
          </div>
        ) : (
          <>
            {grouped.map(item =>
              item.type === 'sep'
                ? <DateSep key={item.key} label={item.label} />
                : <Bubble key={item.key} note={item.note} onDelete={handleDelete} deleting={deleting} />
            )}
            <div ref={bottomRef} className="h-1" />
          </>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="px-4 py-2 bg-[#fef2f2] border-t border-[#fecaca] flex items-center justify-between shrink-0">
          <p className="text-[12px] text-[#c10007]">{error}</p>
          <button onClick={() => setError('')} className="text-[#c10007] text-[16px] leading-none">×</button>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="border-t border-[#e2e8f0] bg-white px-4 py-3 shrink-0">
        <div className={`flex items-end gap-2 rounded-[12px] border px-3 py-2 transition-all ${
          sending ? 'border-[#e2e8f0] bg-[#f8fafc]' : 'border-[#e2e8f0] bg-white focus-within:border-[#f54900]/50 focus-within:ring-2 focus-within:ring-[#f54900]/10'
        }`}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…  (Enter to send · Shift+Enter for new line)"
            rows={1}
            disabled={sending}
            style={{ resize: 'none', minHeight: '36px', maxHeight: '120px', height: '36px' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            className="flex-1 text-[13.5px] text-[#0f172b] placeholder:text-[#90a1b9] bg-transparent focus:outline-none leading-[21px] py-0.5 disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-[#f54900] hover:bg-[#c73b00] text-white transition-colors disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
          >
            {sending
              ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
              : <IconSend />}
          </button>
        </div>
        <p className="text-[11px] text-[#90a1b9] mt-1.5 px-0.5 select-none">
          Visible to admins, managers and the assigned employee · Polls every 15 s
        </p>
      </div>
    </div>
  )
}
