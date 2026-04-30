// src/components/jobdetails/JobDetailHeader.jsx
// Edit button calls onEdit prop (opens drawer).
// Status dropdown calls PATCH /api/jobs/{id}/admin-status/ and fires onStatusChange.

import { useState, useRef, useEffect } from 'react'
import { useNavigate }                  from 'react-router-dom'
import { apiFetch }                     from '@/utils/apiFetch'

function IconArrowLeft() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconPrinter()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="5" rx="1" stroke="#314158" strokeWidth="1.2"/><path d="M3 6h10v6H3z" stroke="#314158" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 9h6M5 11h4" stroke="#314158" strokeWidth="1.2" strokeLinecap="round"/><path d="M3 8H1V5h14v3h-2" stroke="#314158" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconEdit()      { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="#314158" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconTrash()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="#c10007" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconChevron()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 5.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconCheck()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> }

const STATUS_DOT = {
  'scheduled':          'bg-[#06b6d4]',
  'pending':            'bg-[#8b5cf6]',
  'in_progress':        'bg-[#16a34a]',
  'on_hold':            'bg-[#f59e0b]',
  'to_invoice':         'bg-[#fb7185]',
  'completed':          'bg-[#6b7280]',
  'cancelled':          'bg-[#7c3aed]',
  'emergency_make_safe': 'bg-[#dc2626]',
  'overdue':            'bg-[#b91c1c]',
}
const STATUS_PILL = {
  'scheduled':          'bg-[#ecfeff] text-[#0c4a6e]',
  'pending':            'bg-[#f5f3ff] text-[#6d28d9]',
  'in_progress':        'bg-[#dcfce7] text-[#166534]',
  'on_hold':            'bg-[#fef3c7] text-[#92400e]',
  'to_invoice':         'bg-[#fde8ef] text-[#be185d]',
  'completed':          'bg-[#f3f4f6] text-[#475569]',
  'cancelled':          'bg-[#f3e8ff] text-[#6d28d9]',
  'emergency_make_safe': 'bg-[#fee2e2] text-[#b91c1c]',
  'overdue':            'bg-[#fef2f2] text-[#c10007]',
}
const STATUS_LABEL = {
  'scheduled':          'Scheduled',
  'pending':            'To be booked',
  'in_progress':        'In Progress',
  'on_hold':            'On Hold',
  'to_invoice':         'To Invoice',
  'completed':          'Completed',
  'cancelled':          'Cancelled',
  'emergency_make_safe': 'Emergency Make Safe',
  'overdue':            'Overdue',
}
const PRIORITY_STYLES = {
  'low':      'bg-[#f0fdf4] text-[#007a55] border border-[#d0fae5]',
  'medium':   'bg-[#eff6ff] text-[#1447e6] border border-[#dbeafe]',
  'high':     'bg-[#fff7ed] text-[#ca3500] border border-[#fed7aa]',
  'critical': 'bg-[#fef2f2] text-[#c10007] border border-[#ffe2e2]',
}
const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }

// Status options with colours for the dropdown items
const STATUS_OPTIONS = [
  { value: 'scheduled',          label: 'Scheduled',          dot: 'bg-[#06b6d4]', text: 'text-[#0c4a6e]' },
  { value: 'pending',            label: 'To be booked',       dot: 'bg-[#8b5cf6]', text: 'text-[#6d28d9]' },
  { value: 'in_progress',        label: 'In Progress',        dot: 'bg-[#16a34a]', text: 'text-[#166534]' },
  { value: 'on_hold',            label: 'On Hold',            dot: 'bg-[#f59e0b]', text: 'text-[#92400e]' },
  { value: 'to_invoice',         label: 'To Invoice',         dot: 'bg-[#fb7185]', text: 'text-[#be185d]' },
  { value: 'completed',          label: 'Completed',          dot: 'bg-[#6b7280]', text: 'text-[#475569]' },
  { value: 'cancelled',          label: 'Cancelled',          dot: 'bg-[#7c3aed]', text: 'text-[#6d28d9]' },
  { value: 'emergency_make_safe', label: 'Emergency Make Safe', dot: 'bg-[#dc2626]', text: 'text-[#b91c1c]' },
  { value: 'overdue',            label: 'Overdue',            dot: 'bg-[#b91c1c]', text: 'text-[#c10007]' },
]

// ── Status change dropdown ────────────────────────────────────────────────────
function StatusDropdown({ jobId, currentStatus, onStatusChange }) {
  const [open,    setOpen]    = useState(false)
  const [saving,  setSaving]  = useState(null) // value being saved
  const [error,   setError]   = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleSelect = async (value) => {
    if (value === currentStatus || saving) return
    setOpen(false)
    setSaving(value)
    setError('')

    const { ok } = await apiFetch(`jobs/${jobId}/admin-status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: value }),
    })

    if (ok) {
      onStatusChange?.(value)
    } else {
      setError('Failed to update status')
      // Re-show error briefly then clear
      setTimeout(() => setError(''), 3000)
    }
    setSaving(null)
  }

  const isSaving = saving !== null
  const displayStatus = saving ?? currentStatus

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => !isSaving && setOpen(v => !v)}
        disabled={isSaving}
        className={[
          'flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border text-[13px] font-medium transition-colors',
          error
            ? 'border-[#fecaca] bg-[#fef2f2] text-[#c10007]'
            : 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158]',
          isSaving ? 'opacity-70 cursor-wait' : 'cursor-pointer',
        ].join(' ')}
      >
        {isSaving ? (
          <>
            <div className="w-3 h-3 rounded-full border-2 border-[#314158]/20 border-t-[#314158] animate-spin"/>
            Updating…
          </>
        ) : error ? (
          <>{error}</>
        ) : (
          <>
            <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[displayStatus] ?? 'bg-[#cad5e2]'}`} />
            {STATUS_LABEL[displayStatus] ?? displayStatus}
            <IconChevron />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && !isSaving && (
        <div className="absolute right-0 top-[38px] z-50 w-[168px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0px_8px_24px_rgba(15,23,43,0.12)] py-1 overflow-hidden">
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold text-[#90a1b9] uppercase tracking-[0.5px]">
            Set Status
          </p>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-[13px] transition-colors ${
                opt.value === currentStatus
                  ? 'bg-[#f8fafc] font-semibold'
                  : 'hover:bg-[#f8fafc]'
              }`}
            >
              <span className={`flex items-center gap-2 ${opt.text}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                {opt.label}
              </span>
              {opt.value === currentStatus && (
                <span className="text-[#007a55]"><IconCheck /></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── JobDetailHeader ───────────────────────────────────────────────────────────
export default function JobDetailHeader({ job, onEdit, onDelete, onStatusChange }) {
  const navigate = useNavigate()
  if (!job) return null

  return (
    <div className="bg-white border-b border-[#e2e8f0] px-8 py-4 flex items-center justify-between gap-4 flex-wrap">

      {/* Left: back + identity */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate('/admin/jobs')}
          className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158] transition-colors shrink-0">
          <IconArrowLeft />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-[22px] leading-[28px] text-[#0f172b] font-['Consolas',monospace] whitespace-nowrap">{job.job_id}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-[3px] rounded-full text-[13px] font-medium ${STATUS_PILL[job.status] ?? 'bg-[#f1f5f9] text-[#62748e]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[job.status] ?? 'bg-[#cad5e2]'}`} />
              {STATUS_LABEL[job.status] ?? job.status}
            </span>
            {job.priority && (
              <span className={`inline-flex items-center px-3 py-[3px] rounded-full text-[13px] font-medium ${PRIORITY_STYLES[job.priority] ?? PRIORITY_STYLES['low']}`}>
                {PRIORITY_LABEL[job.priority] ?? job.priority} Priority
              </span>
            )}
          </div>
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-0.5 truncate max-w-[500px]">{job.job_name}</p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* <button className="flex items-center justify-center w-8 h-8 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors">
          <IconPrinter />
        </button>
        <div className="w-px h-6 bg-[#e2e8f0]" /> */}

        {/* Status change dropdown */}
        <StatusDropdown
          jobId={job.id}
          currentStatus={job.status}
          onStatusChange={onStatusChange}
        />

        <div className="w-px h-6 bg-[#e2e8f0]" />

        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158] text-[13px] font-medium transition-colors">
          <IconEdit /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#ffe2e2] bg-[#fef2f2] hover:bg-[#ffe2e2] text-[#c10007] text-[13px] font-medium transition-colors">
          <IconTrash /> Delete
        </button>
      </div>
    </div>
  )
}