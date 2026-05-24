// src/components/jobdetails/ScheduleNotesTab.jsx
// GET /api/jobs/{id}/overview/
// Shows all schedule notes + tasks linked to the job

import { useState, useEffect } from 'react'
import { apiFetch }            from '@/utils/apiFetch'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconCalendar() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.1"/><path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconClock()    { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.1"/><path d="M6 3.5v2.5l1.5 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconUser()     { return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.1"/><path d="M1 10.5c0-2.5 2.015-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconTask()     { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M3.5 6l2 2L8.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconEmptyNote() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#cad5e2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12h6M9 16h4" stroke="#cad5e2" strokeWidth="1.5" strokeLinecap="round"/></svg> }

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })
}

// ── Staff pill ─────────────────────────────────────────────────────────────────
function StaffPill({ staff }) {
  if (!staff) {
    return (
      <div className="flex items-center gap-1.5 text-[#90a1b9]">
        <div className="w-6 h-6 rounded-full bg-[#f1f5f9] border border-dashed border-[#cad5e2] flex items-center justify-center shrink-0">
          <IconUser />
        </div>
        <span className="text-[12px]">Unassigned</span>
      </div>
    )
  }
  const initials = staff.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '??'
  return (
    <div className="flex items-center gap-1.5">
      {staff.profile_picture
        ? <img src={staff.profile_picture} alt={staff.full_name} className="w-6 h-6 rounded-full object-cover border border-[#e2e8f0] shrink-0" />
        : <div className="w-6 h-6 rounded-full bg-[#e2e8f0] flex items-center justify-center text-[9px] font-bold text-[#45556c] shrink-0">{initials}</div>
      }
      <span className="text-[12px] font-medium text-[#314158]">{staff.full_name}</span>
    </div>
  )
}

// ── Single task row ────────────────────────────────────────────────────────────
function TaskCard({ task }) {
  const cost = task.estimated_cost ? parseFloat(task.estimated_cost) : 0
  return (
    <div className="flex items-start gap-3 p-3 rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0]">
      <div className="w-5 h-5 rounded-[4px] bg-[#f54900]/10 border border-[#f54900]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#f54900]">
        <IconTask />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[13px] font-semibold text-[#0f172b]">{task.name}</span>
          {cost > 0 && (
            <span className="text-[10px] font-bold text-[#007a55] bg-[#ecfdf5] border border-[#6ee7b7] px-1.5 py-0.5 rounded-full">
              ${cost.toFixed(2)}
            </span>
          )}
        </div>
        {task.description && task.description !== task.name && (
          <p className="text-[12px] text-[#62748e] leading-[16px] mb-2">{task.description}</p>
        )}
        <div className="flex items-center gap-4 flex-wrap">
          <StaffPill staff={task.staff ?? null} />
          {task.due_date && (
            <div className="flex items-center gap-1 text-[#62748e]">
              <IconCalendar />
              <span className="text-[11px]">Due {task.due_date}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Note card ─────────────────────────────────────────────────────────────────
function NoteCard({ note, index }) {
  const [tasksOpen, setTasksOpen] = useState(true)
  const hasTasks   = (note.tasks?.length ?? 0) > 0
  const firstStaff = note.staff?.[0] ?? null

  return (
    <div className="border border-[#e2e8f0] rounded-[12px] overflow-hidden bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="h-[3px] bg-gradient-to-r from-[#f54900] to-[#ff7a47]" />

      <div className="p-4">
        {/* Description + index badge */}
        <div className="flex items-start gap-3 mb-3">
          <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-[#f54900]/10 text-[#f54900] text-[10px] font-bold shrink-0 mt-0.5 border border-[#f54900]/20">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            {note.description
              ? <p className="text-[14px] font-semibold text-[#0f172b] leading-[20px]">{note.description}</p>
              : <p className="text-[14px] text-[#90a1b9] italic">No description</p>
            }
          </div>
        </div>

        {/* Schedule + staff row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[12px] text-[#62748e] bg-[#f8fafc] border border-[#e2e8f0] rounded-[7px] px-2.5 py-1.5">
            <span className="text-[#cad5e2]"><IconCalendar /></span>
            {note.scheduled_datetime ? (
              <>
                <span className="text-[#45556c] font-medium">{fmtDate(note.scheduled_datetime)}</span>
                <span className="text-[#cad5e2] mx-0.5">·</span>
                <span className="text-[#cad5e2]"><IconClock /></span>
                <span>{fmtTime(note.scheduled_datetime)}</span>
                {note.end_time && (
                  <>
                    <span className="text-[#cad5e2] mx-0.5">–</span>
                    <span>{fmtTime(note.end_time)}</span>
                  </>
                )}
              </>
            ) : (
              <span className="italic text-[#90a1b9]">Not scheduled</span>
            )}
          </div>

          <StaffPill staff={firstStaff} />
        </div>
      </div>

      {/* Tasks section */}
      {hasTasks && (
        <div className="border-t border-[#f1f5f9]">
          <button
            onClick={() => setTasksOpen(o => !o)}
            className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-[#fafafa] transition-colors text-left">
            <span className="text-[#cad5e2]"><IconTask /></span>
            <span className="text-[11px] font-bold text-[#62748e] uppercase tracking-[0.4px]">Tasks</span>
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#f1f5f9] text-[10px] font-bold text-[#62748e]">
              {note.tasks.length}
            </span>
            <svg
              className={`ml-auto transition-transform duration-150 ${tasksOpen ? 'rotate-90' : ''}`}
              width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 3l3 3-3 3" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {tasksOpen && (
            <div className="px-4 pb-4 flex flex-col gap-2">
              {note.tasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ScheduleNotesTab({ job, onCountLoad }) {
  const [overview, setOverview] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    apiFetch(`jobs/${job.id}/overview/`).then(({ data, ok }) => {
      if (ok && data) {
        setOverview(data)
        onCountLoad?.(data.notes_count ?? 0)
      }
      setLoading(false)
    })
  }, [job.id]) // eslint-disable-line

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
          <p className="text-[#90a1b9] text-[13px]">Loading notes…</p>
        </div>
      </div>
    )
  }

  const notes = overview?.notes ?? []

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
          <IconEmptyNote />
        </div>
        <p className="text-[#0f172b] font-semibold text-[14px]">No schedule notes yet</p>
        <p className="text-[#62748e] text-[13px] max-w-[280px] leading-[18px]">
          Notes will appear here once added from the Schedule page.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <h3 className="text-[#0f172b] font-bold text-[15px]">Schedule Notes</h3>
        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#f54900] text-white text-[11px] font-bold">
          {notes.length}
        </span>
        {(overview?.tasks_count ?? 0) > 0 && (
          <span className="text-[12px] text-[#62748e]">
            · {overview.tasks_count} task{overview.tasks_count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {notes.map((note, i) => (
          <NoteCard key={note.note_id} note={note} index={i} />
        ))}
      </div>
    </div>
  )
}
