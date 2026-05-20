// src/pages/schedule/SchedulePage.jsx
// Schedule — week/month/day calendar with drag-and-drop job scheduling
// API integrated:
//   GET  /api/jobs/                  → load all jobs (scheduled + unscheduled)
//   PATCH /api/jobs/{id}/schedule/   → { scheduled_datetime, end_time? }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate }                               from 'react-router-dom'
import { apiFetch }                                  from '@/utils/apiFetch'

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']
const HOUR_HEIGHT = 64 // px per hour in week view

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysInMonth(year, month)     { return new Date(year, month + 1, 0).getDate() }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }

function parseISO(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d)) return null
  return {
    year:    d.getFullYear(),
    month:   d.getMonth(),
    day:     d.getDate(),
    time:    `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
  }
}

function toISO(year, month, day, time = '09:00') {
  const [h, m] = time.split(':').map(Number)
  return new Date(year, month, day, h, m).toISOString()
}

function minutesFromTime(time) {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

function timeFromMinutes(totalMinutes) {
  const clamped = Math.max(0, Math.min(1439, totalMinutes))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}

function formatHourLabel(h) {
  if (h === 0)  return '12 AM'
  if (h < 12)   return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

// ── Data mapping ──────────────────────────────────────────────────────────────
function apiStatusToDisplay(s) {
  const map = {
    pending:             'To be booked',
    scheduled:           'Scheduled',
    in_progress:         'In Progress',
    on_hold:             'On Hold',
    to_invoice:          'To Invoice',
    completed:           'Completed',
    cancelled:           'Cancelled',
    emergency_make_safe: 'Emergency Make Safe',
    overdue:             'Overdue',
  }
  return map[s] ?? s ?? 'Pending'
}

function mapJob(j) {
  const parsed    = parseISO(j.scheduled_datetime)
  const parsedEnd = parseISO(j.end_time)
  return {
    id:             j.id,
    job_id:         j.job_id,
    client:         j.client_name ?? j.client?.name ?? '—',
    priority:       j.priority ? j.priority.charAt(0).toUpperCase() + j.priority.slice(1) : 'Low',
    status:         apiStatusToDisplay(j.status),
    rawStatus:      j.status,
    employeeName:   j.assigned_to?.full_name ?? 'Unassigned',
    employeeId:     j.assigned_to?.id ?? null,
    insuredAddress: j.insured_address ?? '—',
    scheduledDate:  parsed ? { year: parsed.year, month: parsed.month, day: parsed.day } : null,
    scheduledTime:  parsed?.time ?? '09:00',
    endTime:        parsedEnd?.time ?? null,
    _isScheduled:   !!parsed,
    _raw:           j,
  }
}

// ── Colour maps ───────────────────────────────────────────────────────────────
const STATUS_CHIP = {
  'To be booked':       { bg: 'bg-[#e0d7ff]', border: 'border-[#c4b5fd]', text: 'text-[#5b21b6]', dot: 'bg-[#7c3aed]' },
  'Scheduled':          { bg: 'bg-[#c7f9ff]', border: 'border-[#7dd3fc]', text: 'text-[#0f172a]', dot: 'bg-[#0891b2]' },
  'In Progress':        { bg: 'bg-[#bbf7d0]', border: 'border-[#86efac]', text: 'text-[#14532d]', dot: 'bg-[#16a34a]' },
  'On Hold':            { bg: 'bg-[#fde68a]', border: 'border-[#facc15]', text: 'text-[#92400e]', dot: 'bg-[#f59e0b]' },
  'To Invoice':         { bg: 'bg-[#fecdd3]', border: 'border-[#fb7185]', text: 'text-[#9d174d]', dot: 'bg-[#be185d]' },
  'Completed':          { bg: 'bg-[#d6d9dc]', border: 'border-[#94a3b8]', text: 'text-[#334155]', dot: 'bg-[#475569]' },
  'Cancelled':          { bg: 'bg-[#ddd6fe]', border: 'border-[#c4b5fd]', text: 'text-[#5b21b6]', dot: 'bg-[#7c3aed]' },
  'Emergency Make Safe':{ bg: 'bg-[#fecaca]', border: 'border-[#f87171]', text: 'text-[#991b1b]', dot: 'bg-[#dc2626]' },
  'Overdue':            { bg: 'bg-[#fecaca]', border: 'border-[#f87171]', text: 'text-[#991b1b]', dot: 'bg-[#b91c1c]' },
}
const DEFAULT_CHIP = { bg: 'bg-[#f8fafc]', border: 'border-[#e2e8f0]', text: 'text-[#314158]', dot: 'bg-[#90a1b9]' }

const EMPLOYEE_COLORS = [
  { bg: 'bg-[#dbeafe]', border: 'border-[#3b82f6]' },
  { bg: 'bg-[#fee2e2]', border: 'border-[#f54900]' },
  { bg: 'bg-[#ede9fe]', border: 'border-[#8b5cf6]' },
  { bg: 'bg-[#cffafe]', border: 'border-[#06b6d4]' },
  { bg: 'bg-[#d1fae5]', border: 'border-[#10b981]' },
  { bg: 'bg-[#fef3c7]', border: 'border-[#f59e0b]' },
  { bg: 'bg-[#fce7f3]', border: 'border-[#ec4899]' },
  { bg: 'bg-[#e0e7ff]', border: 'border-[#6366f1]' },
  { bg: 'bg-[#fee2ff]', border: 'border-[#d946ef]' },
  { bg: 'bg-[#fde68a]', border: 'border-[#d97706]' },
  { bg: 'bg-[#d9f99d]', border: 'border-[#4d7c0f]' },
  { bg: 'bg-[#f8fafc]', border: 'border-[#94a3b8]' },
  { bg: 'bg-[#f3e8ff]', border: 'border-[#a855f7]' },
  { bg: 'bg-[#e0f2fe]', border: 'border-[#0284c7]' },
  { bg: 'bg-[#fff7ed]', border: 'border-[#ea580c]' },
  { bg: 'bg-[#ffedd5]', border: 'border-[#d97706]' },
  { bg: 'bg-[#fdf2f8]', border: 'border-[#c026d3]' },
  { bg: 'bg-[#ecfccb]', border: 'border-[#65a30d]' },
  { bg: 'bg-[#eff6ff]', border: 'border-[#2563eb]' },
  { bg: 'bg-[#ede9fe]', border: 'border-[#7c3aed]' },
  { bg: 'bg-[#fff1f2]', border: 'border-[#be123c]' },
  { bg: 'bg-[#f8fafc]', border: 'border-[#0f172a]' },
  { bg: 'bg-[#fef2f2]', border: 'border-[#b91c1c]' },
  { bg: 'bg-[#ecfdf5]', border: 'border-[#047857]' },
]

function getEmployeeColor(employeeId) {
  if (!employeeId) return { bg: 'bg-[#f3f4f6]', border: 'border-[#d1d5db]' }
  const hash = String(employeeId).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return EMPLOYEE_COLORS[hash % EMPLOYEE_COLORS.length]
}

const PRIORITY_COLOR = {
  High:     'bg-[#fef2f2] text-[#c10007]',
  Medium:   'bg-[#fff7ed] text-[#c73b00]',
  Low:      'bg-[#f0fdf4] text-[#007a55]',
  Critical: 'bg-[#fef2f2] text-[#c10007]',
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconChevLeft()  { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconChevRight() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconClock()     { return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.1"/><path d="M5.5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconGrip()      { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="4" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="9" r="1" fill="currentColor"/><circle cx="8" cy="9" r="1" fill="currentColor"/></svg> }
function IconBriefcase() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="4" width="11" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.1"/><path d="M4.5 4V3A1.5 1.5 0 016 1.5h1A1.5 1.5 0 018.5 3v1" stroke="currentColor" strokeWidth="1.1"/></svg> }
function IconCalPlus()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 1.5v2M10 1.5v2M1 6.5h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M7.5 9v3M6 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconX()         { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }

// ── Start-time picker modal (month / week drag-drop) ──────────────────────────
function TimePickerModal({ job, date, prefillTime, saving, onConfirm, onCancel }) {
  const [time, setTime] = useState(prefillTime ?? job.scheduledTime ?? '09:00')
  const label = `${MONTHS[date.month].slice(0,3)} ${date.day}, ${date.year}`
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172b]/40 backdrop-blur-sm"
      onClick={onCancel}>
      <div className="bg-white rounded-[16px] shadow-[0_20px_60px_rgba(15,23,43,0.22)] w-[340px] overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
          <div>
            <h3 className="text-[#0f172b] font-bold text-[16px]">Schedule Job</h3>
            <p className="text-[#90a1b9] text-[12px] mt-0.5">{job.job_id} · {job.client}</p>
          </div>
          <button onClick={onCancel} className="text-[#90a1b9] hover:text-[#314158] transition-colors"><IconX /></button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
            <span className="text-[#62748e] text-[13px]">Date</span>
            <span className="text-[#0f172b] text-[13px] font-semibold">{label}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#0f172b] text-[13px] font-semibold">Start Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full h-[38px] px-3 rounded-[8px] border border-[#e2e8f0] text-[14px] text-[#0f172b] focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors" />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onCancel} disabled={saving}
            className="flex-1 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold hover:bg-[#f8fafc] transition-colors disabled:opacity-40">
            Cancel
          </button>
          <button onClick={() => onConfirm(time)} disabled={saving}
            className="flex-1 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0_1px_3px_rgba(245,73,0,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
            {saving
              ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Saving…</>
              : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── End-time picker modal (week view resize) ──────────────────────────────────
function EndTimeModal({ job, prefillTime, saving, onConfirm, onCancel }) {
  const [time, setTime] = useState(prefillTime || '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172b]/40 backdrop-blur-sm"
      onClick={onCancel}>
      <div className="bg-white rounded-[16px] shadow-[0_20px_60px_rgba(15,23,43,0.22)] w-[340px] overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
          <div>
            <h3 className="text-[#0f172b] font-bold text-[16px]">Set End Time</h3>
            <p className="text-[#90a1b9] text-[12px] mt-0.5">{job.job_id} · {job.client}</p>
          </div>
          <button onClick={onCancel} className="text-[#90a1b9] hover:text-[#314158] transition-colors"><IconX /></button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
            <span className="text-[#62748e] text-[13px]">Start Time</span>
            <span className="text-[#0f172b] text-[13px] font-semibold">{job.scheduledTime}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#0f172b] text-[13px] font-semibold">End Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full h-[38px] px-3 rounded-[8px] border border-[#e2e8f0] text-[14px] text-[#0f172b] focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors" />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onCancel} disabled={saving}
            className="flex-1 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold hover:bg-[#f8fafc] transition-colors disabled:opacity-40">
            Cancel
          </button>
          <button onClick={() => onConfirm(time)} disabled={saving || !time}
            className="flex-1 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0_1px_3px_rgba(245,73,0,0.3)] disabled:opacity-60 flex items-center justify-center gap-2">
            {saving
              ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Saving…</>
              : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Hover detail popup (month / day views) ────────────────────────────────────
function JobDetailPopup({ job, position }) {
  if (!position) return null
  return (
    <div className="fixed z-50 bg-white rounded-[12px] shadow-[0_10px_40px_rgba(15,23,43,0.3)] border border-[#e2e8f0] p-4 w-[280px]"
      style={{ top: position.top, left: position.left, transform: 'translate(-50%, calc(-100% - 8px))', pointerEvents: 'none' }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="inline-block text-[11px] font-bold px-2 py-1 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[#314158]">{job.job_id}</span>
          <p className="text-[13px] font-bold text-[#0f172b] mt-1.5">{job.client}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 text-[12px]">
        <div className="flex items-center justify-between">
          <span className="text-[#62748e]">Status:</span>
          <span className="font-semibold text-[#0f172b]">{job.status}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#62748e]">Priority:</span>
          <span className="font-semibold text-[#0f172b]">{job.priority}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#62748e]">Employee:</span>
          <span className="font-semibold text-[#0f172b]">{job.employeeName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#62748e]">Time:</span>
          <span className="font-semibold text-[#0f172b]">{job.scheduledTime}{job.endTime ? ` – ${job.endTime}` : ''}</span>
        </div>
        <div className="border-t border-[#f1f5f9] pt-2">
          <span className="text-[#62748e] text-[11px]">Address:</span>
          <p className="text-[#0f172b] font-semibold mt-0.5 leading-[16px]">{job.insuredAddress}</p>
        </div>
      </div>
    </div>
  )
}

// ── Month/Day job chip ─────────────────────────────────────────────────────────
function JobChip({ job, onDragStart, onClick }) {
  const statusConfig  = STATUS_CHIP[job.status] ?? DEFAULT_CHIP
  const employeeColor = getEmployeeColor(job.employeeId)
  const [popupPosition, setPopupPosition] = useState(null)
  const chipRef = useRef(null)

  const handleMouseEnter = () => {
    if (chipRef.current) {
      const rect = chipRef.current.getBoundingClientRect()
      setPopupPosition({ top: rect.top + window.scrollY, left: rect.left + rect.width / 2 + window.scrollX })
    }
  }

  return (
    <>
      <div ref={chipRef} draggable
        onDragStart={e => { e.stopPropagation(); onDragStart(e, job) }}
        onClick={e => { e.stopPropagation(); onClick(job) }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPopupPosition(null)}
        className={`flex flex-col gap-1.5 p-2 rounded-[12px] border cursor-grab active:cursor-grabbing hover:brightness-95 transition-all select-none min-h-fit ${employeeColor.bg} ${employeeColor.border}`}>
        <div className="flex items-center gap-1 flex-wrap">
          <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${statusConfig.border} ${statusConfig.bg} ${statusConfig.text}`}>
            {job.job_id}
          </span>
          <span className="text-[9px] font-semibold text-[#334155] line-clamp-1">{job.employeeName}</span>
        </div>
        <p className="text-[11px] font-semibold text-[#0f172b] leading-[14px] break-words">{job.client}</p>
        {job.insuredAddress && job.insuredAddress !== '—' && (
          <p className="text-[9px] text-[#62748e] leading-[12px] break-words line-clamp-2">{job.insuredAddress}</p>
        )}
        <div className="flex items-center justify-between gap-1">
          <span className="flex items-center gap-0.5 text-[9px] text-[#475569]"><IconClock /> {job.scheduledTime}</span>
          <span className="text-[8px] font-semibold px-1 py-0.5 rounded-full bg-white/50 text-[#314158]">{job.priority}</span>
        </div>
      </div>
      {popupPosition && <JobDetailPopup job={job} position={popupPosition} />}
    </>
  )
}

// ── Unscheduled panel row ─────────────────────────────────────────────────────
function UnscheduledRow({ job, onDragStart }) {
  const p = PRIORITY_COLOR[job.priority] ?? 'bg-[#f8fafc] text-[#62748e]'
  return (
    <div draggable onDragStart={e => onDragStart(e, job)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] border border-[#e2e8f0] bg-white hover:border-[#f54900]/40 hover:bg-[#fff9f7] cursor-grab active:cursor-grabbing transition-all select-none">
      <span className="text-[#cad5e2] shrink-0"><IconGrip /></span>
      <div className="flex-1 min-w-0">
        <p className="text-[#0f172b] text-[12px] font-bold truncate">{job.job_id}</p>
        <p className="text-[#62748e] text-[11px] truncate">{job.client}</p>
      </div>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${p}`}>{job.priority}</span>
    </div>
  )
}

// ── Week view: individual job card ────────────────────────────────────────────
function WeekJobCard({ job, top, height, onDragStart, onClick, onResizeEnd }) {
  const employeeColor  = getEmployeeColor(job.employeeId)
  const statusConfig   = STATUS_CHIP[job.status] ?? DEFAULT_CHIP
  const [liveHeight, setLiveHeight]   = useState(height)
  const [isResizing,  setIsResizing]  = useState(false)
  const currentHeightRef = useRef(height)

  // Sync when parent recalculates height (e.g. after save)
  useEffect(() => {
    currentHeightRef.current = height
    setLiveHeight(height)
  }, [height])

  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const startY  = e.clientY
    const startH  = currentHeightRef.current
    const startMin = minutesFromTime(job.scheduledTime)

    setIsResizing(true)

    const onMove = (ev) => {
      const newH = Math.max(30, startH + (ev.clientY - startY))
      currentHeightRef.current = newH
      setLiveHeight(newH)
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
      setIsResizing(false)
      const durationMin = Math.round(currentHeightRef.current / HOUR_HEIGHT * 60 / 5) * 5
      const endMin = Math.max(startMin + 15, Math.min(1439, startMin + durationMin))
      onResizeEnd(timeFromMinutes(endMin))
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
  }, [job.scheduledTime, onResizeEnd])

  const showClient   = liveHeight > 42
  const showTime     = liveHeight > 58
  const showEmployee = liveHeight > 76
  const showAddress  = liveHeight > 100

  return (
    <div
      draggable={!isResizing}
      onDragStart={e => { if (isResizing) return; e.stopPropagation(); onDragStart(e, job) }}
      onClick={e => { e.stopPropagation(); onClick(job) }}
      style={{ position: 'absolute', top, left: 3, right: 3, height: liveHeight, zIndex: isResizing ? 20 : 2 }}
      className={[
        'rounded-[8px] border flex flex-col overflow-hidden select-none transition-shadow',
        employeeColor.bg, employeeColor.border,
        isResizing
          ? 'cursor-ns-resize shadow-[0_4px_20px_rgba(15,23,43,0.2)]'
          : 'cursor-pointer hover:brightness-95 hover:shadow-[0_2px_8px_rgba(15,23,43,0.12)]',
      ].join(' ')}
    >
      {/* Card body */}
      <div className="flex-1 px-2 pt-1.5 pb-0 min-h-0 overflow-hidden">
        {/* Status badge + job id */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${statusConfig.border} ${statusConfig.bg} ${statusConfig.text}`}>
            {job.job_id}
          </span>
          {showEmployee && (
            <span className="text-[9px] font-semibold text-[#334155] truncate max-w-[80px]">{job.employeeName}</span>
          )}
        </div>

        {showClient && (
          <p className="text-[11px] font-semibold text-[#0f172b] leading-[14px] mt-1 truncate">{job.client}</p>
        )}

        {showTime && (
          <div className="flex items-center gap-0.5 text-[9px] text-[#475569] mt-0.5">
            <IconClock />
            <span>{job.scheduledTime}{job.endTime ? ` – ${job.endTime}` : ''}</span>
          </div>
        )}

        {showAddress && job.insuredAddress !== '—' && (
          <p className="text-[9px] text-[#62748e] mt-0.5 leading-[12px] line-clamp-2">{job.insuredAddress}</p>
        )}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        onClick={e => e.stopPropagation()}
        className="h-3 cursor-ns-resize flex items-center justify-center shrink-0 hover:bg-black/5 transition-colors"
        title="Drag to set end time"
      >
        <div className="w-8 h-[3px] rounded-full bg-current opacity-20" />
      </div>
    </div>
  )
}

// ── Week view: time grid ───────────────────────────────────────────────────────
function WeekView({ days, jobs, today, draggingJobRef, onDragStart, onJobClick, onWeekDrop, onResizeEnd }) {
  const scrollRef = useRef(null)
  const gridRef   = useRef(null)
  const [dragOverCol,  setDragOverCol]  = useState(null)
  const [dragOverMins, setDragOverMins] = useState(null)

  // Scroll to 7 AM on mount
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 7 * HOUR_HEIGHT - 32
  }, [])

  const getMinsFromEvent = useCallback((e) => {
    if (!scrollRef.current || !gridRef.current) return 0
    const scrollTop = scrollRef.current.scrollTop
    const gridTop   = gridRef.current.getBoundingClientRect().top
    const relY      = e.clientY - gridTop + scrollTop
    return Math.max(0, Math.min(23 * 60 + 45, Math.round(relY / HOUR_HEIGHT * 60 / 15) * 15))
  }, [])

  const isToday = (day) =>
    day.year  === today.getFullYear() &&
    day.month === today.getMonth()    &&
    day.day   === today.getDate()

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Sticky day headers */}
      <div className="flex border-b border-[#e2e8f0] bg-white shrink-0 z-10">
        {/* Gutter spacer */}
        <div className="w-[52px] shrink-0 border-r border-[#f1f5f9]" />
        {days.map((day, i) => (
          <div key={i} className={`flex-1 py-2 flex flex-col items-center border-r border-[#f1f5f9] last:border-r-0 ${isToday(day) ? 'bg-[#fff9f7]' : ''}`}>
            <span className="text-[10px] font-bold text-[#62748e] uppercase tracking-wide">
              {DAYS[new Date(day.year, day.month, day.day).getDay()]}
            </span>
            <span className={`mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-[13px] font-bold ${
              isToday(day) ? 'bg-[#f54900] text-white' : 'text-[#0f172b]'
            }`}>
              {day.day}
            </span>
          </div>
        ))}
      </div>

      {/* Scrollable time body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex" style={{ height: HOUR_HEIGHT * 24 }}>

          {/* Time gutter */}
          <div className="w-[52px] shrink-0 relative border-r border-[#f1f5f9]" style={{ height: HOUR_HEIGHT * 24 }}>
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} style={{ position: 'absolute', top: h * HOUR_HEIGHT - 8, right: 0, left: 0, paddingRight: 8 }}
                className="flex items-start justify-end">
                <span className="text-[10px] text-[#90a1b9] font-medium whitespace-nowrap leading-none">
                  {formatHourLabel(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div ref={gridRef} className="flex-1 grid grid-cols-7" style={{ height: HOUR_HEIGHT * 24 }}>
            {days.map((day, colIdx) => {
              const dayJobs = jobs.filter(j =>
                j._isScheduled &&
                j.scheduledDate?.year  === day.year  &&
                j.scheduledDate?.month === day.month &&
                j.scheduledDate?.day   === day.day
              )
              const isOver = dragOverCol === colIdx

              return (
                <div key={colIdx}
                  className={`relative border-r border-[#f1f5f9] last:border-r-0 transition-colors duration-75 ${isOver ? 'bg-[#fff9f7]' : ''}`}
                  onDragOver={e => {
                    if (!draggingJobRef.current) return
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                    setDragOverCol(colIdx)
                    setDragOverMins(getMinsFromEvent(e))
                  }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={e => {
                    e.preventDefault()
                    const mins = getMinsFromEvent(e)
                    setDragOverCol(null)
                    setDragOverMins(null)
                    onWeekDrop(day, timeFromMinutes(mins))
                  }}
                  onDragEnd={() => setDragOverCol(null)}
                >
                  {/* Hour lines */}
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} style={{ top: h * HOUR_HEIGHT }}
                      className="absolute left-0 right-0 border-t border-[#f1f5f9] pointer-events-none" />
                  ))}
                  {/* Half-hour lines */}
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={`hh${h}`} style={{ top: h * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                      className="absolute left-0 right-0 border-t border-[#f8fafc] pointer-events-none" />
                  ))}

                  {/* Job cards */}
                  {dayJobs.map(job => {
                    const startMin = minutesFromTime(job.scheduledTime)
                    const endMin   = job.endTime ? minutesFromTime(job.endTime) : startMin + 60
                    const cardTop  = startMin / 60 * HOUR_HEIGHT
                    const cardH    = Math.max(30, (endMin - startMin) / 60 * HOUR_HEIGHT)
                    return (
                      <WeekJobCard
                        key={job.id}
                        job={job}
                        top={cardTop}
                        height={cardH}
                        onDragStart={onDragStart}
                        onClick={onJobClick}
                        onResizeEnd={(prefillTime) => onResizeEnd(job, prefillTime)}
                      />
                    )
                  })}

                  {/* Drop time indicator */}
                  {isOver && dragOverMins !== null && (
                    <div
                      style={{ top: dragOverMins / 60 * HOUR_HEIGHT }}
                      className="absolute left-0 right-0 h-[2px] bg-[#f54900] pointer-events-none z-30"
                    >
                      <span className="absolute -top-[18px] left-1 text-[10px] text-[#f54900] font-bold bg-white px-1.5 py-0.5 rounded-md shadow-sm border border-[#f54900]/20">
                        {timeFromMinutes(dragOverMins)}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const navigate = useNavigate()
  const today    = new Date()

  // ── View state ─────────────────────────────────────────────────────────────
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewDay,   setViewDay]   = useState(today.getDate())
  const [viewMode,  setViewMode]  = useState('week') // default: week

  // ── Data state ─────────────────────────────────────────────────────────────
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  // ── Drag state ─────────────────────────────────────────────────────────────
  const draggingJob     = useRef(null)
  const [dragOverDay,   setDragOverDay]   = useState(null)
  const [dragOverPanel, setDragOverPanel] = useState(false)

  // ── Modal state ────────────────────────────────────────────────────────────
  const [pendingDrop,   setPendingDrop]   = useState(null)  // { job, date, prefillTime? }
  const [modalSaving,   setModalSaving]   = useState(false)
  const [pendingResize, setPendingResize] = useState(null)  // { job, prefillTime }
  const [resizeSaving,  setResizeSaving]  = useState(false)

  // ── Fetch all jobs (paginated) ─────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true)
    let allResults = []
    let endpoint   = 'jobs/?page_size=100'

    while (endpoint) {
      let result
      if (endpoint.startsWith('http')) {
        const token = sessionStorage.getItem('access')
        try {
          const res  = await fetch(endpoint, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
          const data = res.ok ? await res.json() : null
          result = { data, ok: res.ok }
        } catch { break }
      } else {
        result = await apiFetch(endpoint)
      }
      if (!result.ok || !result.data) break
      allResults = allResults.concat(result.data.results ?? [])
      endpoint   = result.data.next ?? null
    }

    setJobs(allResults.map(mapJob))
    setLoading(false)
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const getWeekStart = (year, month, day) => {
    const d = new Date(year, month, day)
    d.setDate(d.getDate() - d.getDay())
    return d
  }

  const prevView = () => {
    if (viewMode === 'month') {
      if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
      else setViewMonth(m => m - 1)
    } else if (viewMode === 'week') {
      const ws = getWeekStart(viewYear, viewMonth, viewDay)
      ws.setDate(ws.getDate() - 7)
      setViewYear(ws.getFullYear()); setViewMonth(ws.getMonth()); setViewDay(ws.getDate())
    } else {
      const d = new Date(viewYear, viewMonth, viewDay - 1)
      setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); setViewDay(d.getDate())
    }
  }

  const nextView = () => {
    if (viewMode === 'month') {
      if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
      else setViewMonth(m => m + 1)
    } else if (viewMode === 'week') {
      const ws = getWeekStart(viewYear, viewMonth, viewDay)
      ws.setDate(ws.getDate() + 7)
      setViewYear(ws.getFullYear()); setViewMonth(ws.getMonth()); setViewDay(ws.getDate())
    } else {
      const d = new Date(viewYear, viewMonth, viewDay + 1)
      setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); setViewDay(d.getDate())
    }
  }

  const getViewLabel = () => {
    if (viewMode === 'month') return `${MONTHS[viewMonth]} ${viewYear}`
    if (viewMode === 'week') {
      const ws = getWeekStart(viewYear, viewMonth, viewDay)
      const we = new Date(ws); we.setDate(we.getDate() + 6)
      return `${MONTHS[ws.getMonth()].slice(0,3)} ${ws.getDate()} – ${MONTHS[we.getMonth()].slice(0,3)} ${we.getDate()}`
    }
    return `${MONTHS[viewMonth]} ${viewDay}, ${viewYear}`
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const unscheduled = jobs.filter(j => !j._isScheduled)

  const scheduledOnDay = (year, month, day) =>
    jobs.filter(j =>
      j._isScheduled &&
      j.scheduledDate?.year  === year  &&
      j.scheduledDate?.month === month &&
      j.scheduledDate?.day   === day
    ).sort((a, b) => (a.scheduledTime > b.scheduledTime ? 1 : -1))

  const groupJobsByTime = (list) => {
    const groups = list.reduce((acc, job) => {
      const t = job.scheduledTime || '09:00'
      acc[t] = acc[t] || []
      acc[t].push(job)
      return acc
    }, {})
    return Object.keys(groups).sort().map(time => ({ time, jobs: groups[time] }))
  }

  const isToday = (year, month, day) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate()

  // ── Calendar grid cells ────────────────────────────────────────────────────
  let rows = []
  if (viewMode === 'month') {
    const firstDay   = firstDayOfMonth(viewYear, viewMonth)
    const totalDays  = daysInMonth(viewYear, viewMonth)
    const prevDays   = daysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1)
    const totalCells = Math.ceil((firstDay + totalDays) / 7) * 7
    const cells = Array.from({ length: totalCells }, (_, i) => {
      if (i < firstDay) {
        const pm = viewMonth === 0 ? 11 : viewMonth - 1
        const py = viewMonth === 0 ? viewYear - 1 : viewYear
        return { day: prevDays - firstDay + i + 1, month: pm, year: py, current: false }
      }
      const d = i - firstDay + 1
      if (d > totalDays) {
        const nm = viewMonth === 11 ? 0 : viewMonth + 1
        const ny = viewMonth === 11 ? viewYear + 1 : viewYear
        return { day: d - totalDays, month: nm, year: ny, current: false }
      }
      return { day: d, month: viewMonth, year: viewYear, current: true }
    })
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  } else if (viewMode === 'week') {
    const ws = getWeekStart(viewYear, viewMonth, viewDay)
    rows = [Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ws); d.setDate(d.getDate() + i)
      return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), current: true }
    })]
  } else {
    rows = [[{ day: viewDay, month: viewMonth, year: viewYear, current: true }]]
  }

  const weekDays = rows[0] ?? []

  // ── Drag handlers (month / day views) ─────────────────────────────────────
  const handleDragStart = (e, job) => {
    draggingJob.current = job
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDragOver  = (e, cell) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDay({ year: cell.year, month: cell.month, day: cell.day })
  }
  const handleDragLeave  = () => setDragOverDay(null)
  const handleDragEnd    = () => { draggingJob.current = null; setDragOverDay(null) }

  // Month/day cell drop — opens start-time picker (no prefill)
  const handleDrop = (e, cell) => {
    e.preventDefault()
    setDragOverDay(null)
    const job = draggingJob.current
    draggingJob.current = null
    if (!job) return
    setPendingDrop({ job, date: { year: cell.year, month: cell.month, day: cell.day } })
  }

  // Week grid drop — opens start-time picker with time pre-filled from Y position
  const handleWeekDrop = (day, prefillTime) => {
    const job = draggingJob.current
    draggingJob.current = null
    if (!job) return
    setPendingDrop({ job, date: { year: day.year, month: day.month, day: day.day }, prefillTime })
  }

  // ── Panel drag handlers (unschedule) ───────────────────────────────────────
  const handlePanelDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverPanel(true) }
  const handlePanelDragLeave = () => setDragOverPanel(false)
  const handlePanelDrop = async (e) => {
    e.preventDefault()
    setDragOverPanel(false)
    const job = draggingJob.current
    draggingJob.current = null
    if (!job || !job._isScheduled) return

    setJobs(prev => prev.map(j =>
      j.id === job.id ? { ...j, scheduledDate: null, scheduledTime: '09:00', endTime: null, _isScheduled: false } : j
    ))
    const { ok } = await apiFetch(`jobs/${job.id}/schedule/`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_datetime: null }),
    })
    if (!ok) setJobs(prev => prev.map(j => j.id === job.id ? job : j))
  }

  // ── Confirm start-time (drag-drop) ─────────────────────────────────────────
  const confirmSchedule = async (time) => {
    const { job, date } = pendingDrop
    const isoString     = toISO(date.year, date.month, date.day, time)

    setModalSaving(true)
    const { ok } = await apiFetch(`jobs/${job.id}/schedule/`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_datetime: isoString }),
    })
    if (ok) {
      setJobs(prev => prev.map(j =>
        j.id === job.id ? { ...j, scheduledDate: date, scheduledTime: time, _isScheduled: true } : j
      ))
      setPendingDrop(null)
    }
    setModalSaving(false)
  }

  // ── Confirm end-time (week view resize) ────────────────────────────────────
  const confirmEndTime = async (endTime) => {
    const { job } = pendingResize
    const isoStart = toISO(job.scheduledDate.year, job.scheduledDate.month, job.scheduledDate.day, job.scheduledTime)
    const isoEnd   = toISO(job.scheduledDate.year, job.scheduledDate.month, job.scheduledDate.day, endTime)

    setResizeSaving(true)
    const { ok } = await apiFetch(`jobs/${job.id}/schedule/`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_datetime: isoStart, end_time: isoEnd }),
    })
    if (ok) {
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, endTime } : j))
      setPendingResize(null)
    }
    setResizeSaving(false)
  }

  const handleChipClick = (job) => navigate(`/admin/jobs/${job.id}`)

  // ── Show unscheduled panel for month + week views ──────────────────────────
  const showPanel = viewMode === 'month' || viewMode === 'week'

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Start-time modal */}
      {pendingDrop && (
        <TimePickerModal
          job={pendingDrop.job}
          date={pendingDrop.date}
          prefillTime={pendingDrop.prefillTime}
          saving={modalSaving}
          onConfirm={confirmSchedule}
          onCancel={() => { if (!modalSaving) setPendingDrop(null) }}
        />
      )}

      {/* End-time modal (week resize) */}
      {pendingResize && (
        <EndTimeModal
          job={pendingResize.job}
          prefillTime={pendingResize.prefillTime}
          saving={resizeSaving}
          onConfirm={confirmEndTime}
          onCancel={() => { if (!resizeSaving) setPendingResize(null) }}
        />
      )}

      <div className="flex gap-0 h-full min-h-0">

        {/* ── LEFT: Unscheduled panel (month + week) ── */}
        {showPanel && (
          <div
            className={[
              'w-[220px] shrink-0 border-r flex flex-col transition-colors duration-100',
              dragOverPanel ? 'bg-[#fff4ee] border-[#f54900]/30' : 'bg-white border-[#e2e8f0]',
            ].join(' ')}
            onDragOver={handlePanelDragOver}
            onDragLeave={handlePanelDragLeave}
            onDrop={handlePanelDrop}
          >
            <div className="px-4 py-4 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2">
                <span className="text-[#62748e]"><IconBriefcase /></span>
                <h3 className="text-[#0f172b] font-bold text-[13px]">Unscheduled</h3>
                <span className="ml-auto text-[11px] font-bold text-white bg-[#f54900] rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {unscheduled.length}
                </span>
              </div>
              <p className="text-[#90a1b9] text-[11px] mt-1 leading-[16px]">
                {dragOverPanel
                  ? 'Release to unschedule'
                  : 'Drag onto calendar to schedule · drag here to unschedule'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
                </div>
              ) : dragOverPanel ? (
                <div className="flex items-center justify-center h-12 rounded-[8px] border-2 border-dashed border-[#f54900]/50 text-[#f54900] text-[11px] font-semibold">
                  Drop to unschedule
                </div>
              ) : unscheduled.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <span className="text-[#e2e8f0]"><IconCalPlus /></span>
                  <p className="text-[#cad5e2] text-[12px]">All jobs scheduled</p>
                </div>
              ) : unscheduled.map(job => (
                <UnscheduledRow key={job.id} job={job} onDragStart={handleDragStart} />
              ))}
            </div>
          </div>
        )}

        {/* ── RIGHT: Calendar ── */}
        <div className={`flex-1 min-w-0 flex flex-col gap-5 ${viewMode === 'week' ? 'p-4 pb-2' : 'p-6'}`}
          style={{ minHeight: 0 }}>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap shrink-0">
            <div>
              <h1 className="text-[#0f172b] font-bold text-[26px] leading-[34px]">Schedule</h1>
              <p className="text-[#62748e] text-[14px] mt-0.5">
                {viewMode === 'week'
                  ? 'Drag to reschedule · drag bottom handle to set end time'
                  : 'Drag and drop to reschedule jobs'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* View toggle */}
              <div className="flex items-center bg-white border border-[#e2e8f0] rounded-[10px] p-[3px]">
                {['month','week','day'].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`px-4 py-[6px] rounded-[7px] text-[13px] font-semibold capitalize transition-all ${
                      viewMode === mode
                        ? 'bg-[#0f172b] text-white shadow-sm'
                        : 'text-[#62748e] hover:text-[#314158]'
                    }`}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-[10px] px-2 py-[5px]">
                <button onClick={prevView}
                  className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#314158] hover:bg-[#f8fafc] transition-colors">
                  <IconChevLeft />
                </button>
                <span className="text-[#0f172b] font-bold text-[14px] w-[160px] text-center select-none">
                  {getViewLabel()}
                </span>
                <button onClick={nextView}
                  className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#314158] hover:bg-[#f8fafc] transition-colors">
                  <IconChevRight />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar card */}
          <div className={`bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)] ${viewMode === 'week' ? 'flex-1 min-h-0 flex flex-col' : ''}`}>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-7 h-7 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
                  <p className="text-[#90a1b9] text-[13px]">Loading schedule…</p>
                </div>
              </div>

            ) : viewMode === 'week' ? (
              // ── Week view: time grid ──────────────────────────────────────
              <WeekView
                days={weekDays}
                jobs={jobs}
                today={today}
                draggingJobRef={draggingJob}
                onDragStart={handleDragStart}
                onJobClick={handleChipClick}
                onWeekDrop={handleWeekDrop}
                onResizeEnd={(job, prefillTime) => setPendingResize({ job, prefillTime })}
              />

            ) : (
              // ── Month / Day view: classic grid ────────────────────────────
              <>
                {/* Day headers */}
                <div className={`grid border-b border-[#e2e8f0] ${viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}>
                  {rows[0]?.map(cell => (
                    <div key={`h-${cell.day}-${cell.month}`}
                      className="py-[10px] text-center text-[12px] font-bold text-[#62748e] uppercase tracking-[0.5px]">
                      {DAYS[new Date(cell.year, cell.month, cell.day).getDay()]}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col divide-y divide-[#f1f5f9]">
                  {rows.map((row, ri) => (
                    <div key={ri}
                      className={`grid divide-x divide-[#f1f5f9] ${viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'}`}
                      style={{ minHeight: viewMode === 'day' ? '500px' : '120px' }}>
                      {row.map((cell, ci) => {
                        const dayJobs = scheduledOnDay(cell.year, cell.month, cell.day)
                        const isOver  = dragOverDay?.year === cell.year && dragOverDay?.month === cell.month && dragOverDay?.day === cell.day
                        const todayDay = isToday(cell.year, cell.month, cell.day)
                        return (
                          <div key={ci}
                            onDragOver={e => handleDragOver(e, cell)}
                            onDragLeave={handleDragLeave}
                            onDrop={e => handleDrop(e, cell)}
                            onDragEnd={handleDragEnd}
                            className={[
                              'p-3 flex flex-col gap-2 transition-colors duration-100 min-h-[120px]',
                              !cell.current ? 'bg-[#fafafa]' : '',
                              isOver ? 'bg-[#fff4ee] ring-2 ring-inset ring-[#f54900]/30' : '',
                            ].join(' ')}>
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <span className={[
                                'text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded-full leading-none',
                                todayDay ? 'bg-[#f54900] text-white' : cell.current ? 'text-[#0f172b]' : 'text-[#cad5e2]',
                              ].join(' ')}>
                                {cell.day}
                              </span>
                              {viewMode !== 'day' && dayJobs.length > 0 && (
                                <span className="text-[10px] text-[#90a1b9] font-medium">{dayJobs.length} job{dayJobs.length > 1 ? 's' : ''}</span>
                              )}
                              {viewMode === 'day' && (
                                <span className="text-[11px] text-[#62748e] font-semibold">{MONTHS[cell.month]} {cell.day}, {cell.year}</span>
                              )}
                            </div>

                            {viewMode === 'day' ? (
                              <div className="flex flex-col gap-2">
                                {dayJobs.map(job => (
                                  <JobChip key={job.id} job={job} onDragStart={handleDragStart} onClick={handleChipClick} />
                                ))}
                                {dayJobs.length === 0 && (
                                  <div className="flex items-center justify-center h-32 text-[#cad5e2] text-[13px]">No jobs scheduled</div>
                                )}
                              </div>
                            ) : (
                              <>
                                {groupJobsByTime(dayJobs.slice(0, 3)).map(group => {
                                  const cols = group.jobs.length === 2 ? 'grid-cols-2' : group.jobs.length >= 3 ? 'grid-cols-3' : 'grid-cols-1'
                                  return (
                                    <div key={group.time} className={`grid gap-1 ${cols}`}>
                                      {group.jobs.map(job => (
                                        <JobChip key={job.id} job={job} onDragStart={handleDragStart} onClick={handleChipClick} />
                                      ))}
                                    </div>
                                  )
                                })}
                                {dayJobs.length > 3 && (
                                  <span className="text-[10px] text-[#90a1b9] font-medium px-1">+{dayJobs.length - 3} more</span>
                                )}
                              </>
                            )}

                            {isOver && (
                              <div className="flex items-center justify-center h-8 rounded-[6px] border-2 border-dashed border-[#f54900]/40 text-[#f54900] text-[11px] font-medium mt-auto">
                                Drop here
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 flex-wrap shrink-0">
            {Object.entries(STATUS_CHIP).map(([label, c]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                <span className="text-[12px] text-[#62748e]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
