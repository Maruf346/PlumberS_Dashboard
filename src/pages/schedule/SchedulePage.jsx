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

const HOUR_HEIGHT      = 64   // px per hour in week view
const WEEK_START_HOUR  = 6    // 6 AM
const WEEK_END_HOUR    = 18   // 6 PM
const WEEK_HOURS       = WEEK_END_HOUR - WEEK_START_HOUR  // 12
const WEEK_START_MIN   = WEEK_START_HOUR * 60             // 360
const WEEK_END_MIN     = WEEK_END_HOUR   * 60             // 1080
const WEEK_GRID_H      = HOUR_HEIGHT * WEEK_HOURS         // 768 px

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysInMonth(year, month)     { return new Date(year, month + 1, 0).getDate() }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }

function parseISO(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d)) return null
  return {
    year:  d.getFullYear(),
    month: d.getMonth(),
    day:   d.getDate(),
    time:  `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
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
  return `${String(Math.floor(clamped / 60)).padStart(2,'0')}:${String(clamped % 60).padStart(2,'0')}`
}

// Snap to nearest 15-min mark, clamped within 6 AM–6 PM for start times
function snapStartTo15(totalMinutes) {
  const s = Math.round(totalMinutes / 15) * 15
  return Math.max(WEEK_START_MIN, Math.min(WEEK_END_MIN - 15, s))
}

// Snap end time — must be at least 15 min after start, max 6 PM
function snapEndTo15(totalMinutes) {
  return Math.round(totalMinutes / 15) * 15
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

// ── Start-time picker modal (month / day drag-drop only) ──────────────────────
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
            {saving ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Saving…</> : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Smart hover detail popup (month / day / week views) ───────────────────────
function JobDetailPopup({ job, position }) {
  if (!position) return null
  // Flip below the card if too close to top of viewport
  const showAbove  = position.top > 260
  const transform  = showAbove ? 'translate(-50%, calc(-100% - 8px))' : 'translate(-50%, 8px)'
  // Clamp horizontally so popup never goes off-screen
  const safeLeft   = Math.max(148, Math.min(position.left, window.innerWidth - 148))
  return (
    <div className="fixed z-[60] bg-white rounded-[12px] shadow-[0_10px_40px_rgba(15,23,43,0.3)] border border-[#e2e8f0] p-4 w-[280px]"
      style={{ top: position.top, left: safeLeft, transform, pointerEvents: 'none' }}>
      <div className="flex items-start gap-2 mb-3">
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
          <span className="text-[#62748e]">Assigned:</span>
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
          <span className="text-[9px] font-bold text-[#0f172b] line-clamp-1">{job.employeeName}</span>
        </div>
        <p className="text-[11px] font-bold text-[#0f172b] leading-[14px] break-words">{job.client}</p>
        {job.insuredAddress && job.insuredAddress !== '—' && (
          <p className="text-[10px] font-medium text-[#314158] leading-[13px] break-words line-clamp-2">{job.insuredAddress}</p>
        )}
        <div className="flex items-center justify-between gap-1">
          <span className="flex items-center gap-0.5 text-[9px] font-semibold text-[#0f172b]"><IconClock /> {job.scheduledTime}</span>
          <span className="text-[8px] font-bold px-1 py-0.5 rounded-full bg-white/60 text-[#0f172b]">{job.priority}</span>
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
        <p className="text-[#314158] text-[11px] font-medium truncate">{job.client}</p>
      </div>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${p}`}>{job.priority}</span>
    </div>
  )
}

// ── Week view: overlap layout algorithm ───────────────────────────────────────
function computeLayout(dayJobs) {
  if (!dayJobs.length) return []
  const enriched = dayJobs
    .map(j => ({
      job:      j,
      startMin: minutesFromTime(j.scheduledTime),
      endMin:   j.endTime ? minutesFromTime(j.endTime) : minutesFromTime(j.scheduledTime) + 60,
    }))
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin)

  const laneEnds = []
  const placed = enriched.map(item => {
    let lane = laneEnds.findIndex(end => end <= item.startMin)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = item.endMin
    return { ...item, lane }
  })

  return placed.map(p => {
    const overlapping = placed.filter(q => q.startMin < p.endMin && q.endMin > p.startMin)
    const totalCols   = Math.max(...overlapping.map(q => q.lane)) + 1
    return { job: p.job, lane: p.lane, totalCols }
  })
}

// ── Week view: individual job card ────────────────────────────────────────────
function WeekJobCard({
  job, top, height, lane, totalCols, isClippedTop, isClippedBottom,
  scrollRef, onDragStart, onClick, onResizeSave,
}) {
  const employeeColor = getEmployeeColor(job.employeeId)
  const statusConfig  = STATUS_CHIP[job.status] ?? DEFAULT_CHIP
  const [liveHeight,  setLiveHeight]  = useState(height)
  const [isResizing,  setIsResizing]  = useState(false)
  const [popupPos,    setPopupPos]    = useState(null)
  const currentHeightRef = useRef(height)
  const cardRef          = useRef(null)

  useEffect(() => {
    currentHeightRef.current = height
    setLiveHeight(height)
  }, [height])

  // ── Resize (scroll-aware, snaps to 15 min, saves immediately) ─────────────
  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const startY           = e.clientY
    const startH           = currentHeightRef.current
    const startMin         = minutesFromTime(job.scheduledTime)
    const initialScrollTop = scrollRef?.current?.scrollTop ?? 0

    setIsResizing(true)

    const onMove = (ev) => {
      const scrollDelta = (scrollRef?.current?.scrollTop ?? 0) - initialScrollTop
      const newH = Math.max(HOUR_HEIGHT / 4, startH + (ev.clientY - startY) + scrollDelta)
      currentHeightRef.current = newH
      setLiveHeight(newH)
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
      setIsResizing(false)
      // Snap end to nearest 15-min, min 15 min after start, max 6 PM
      const rawEndMin   = startMin + currentHeightRef.current / HOUR_HEIGHT * 60
      const snappedEnd  = snapEndTo15(rawEndMin)
      const clampedEnd  = Math.max(startMin + 15, Math.min(WEEK_END_MIN, snappedEnd))
      onResizeSave(timeFromMinutes(clampedEnd))
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup',   onUp)
  }, [job.scheduledTime, onResizeSave, scrollRef])

  // ── Hover popup ────────────────────────────────────────────────────────────
  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setPopupPos({ top: rect.top + window.scrollY, left: rect.left + rect.width / 2 + window.scrollX })
    }
  }

  const showClient   = liveHeight > 30
  const showTime     = liveHeight > 44
  const showEmployee = liveHeight > 58
  const showAddress  = liveHeight > 78

  const GAP      = 2
  const colPct   = 100 / totalCols
  const leftPct  = lane * colPct
  const widthPct = colPct

  return (
    <>
      <div
        ref={cardRef}
        draggable={!isResizing}
        onDragStart={e => { if (isResizing) return; e.stopPropagation(); onDragStart(e, job) }}
        onClick={e => { e.stopPropagation(); onClick(job) }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPopupPos(null)}
        style={{
          position: 'absolute',
          top,
          left:   `calc(${leftPct}% + ${lane === 0 ? GAP : GAP / 2}px)`,
          width:  `calc(${widthPct}% - ${lane === 0 || lane === totalCols - 1 ? GAP * 1.5 : GAP}px)`,
          height: liveHeight,
          zIndex: isResizing ? 30 : lane + 2,
        }}
        className={[
          'border flex flex-col overflow-hidden select-none transition-shadow',
          isClippedTop    ? 'rounded-t-none'    : 'rounded-t-[8px]',
          isClippedBottom ? 'rounded-b-none'    : 'rounded-b-[8px]',
          employeeColor.bg, employeeColor.border,
          isResizing
            ? 'cursor-ns-resize shadow-[0_4px_20px_rgba(15,23,43,0.2)]'
            : 'cursor-pointer hover:brightness-95 hover:shadow-[0_2px_8px_rgba(15,23,43,0.12)]',
        ].join(' ')}
      >
        {/* Clipped-top indicator */}
        {isClippedTop && (
          <div className="h-[3px] shrink-0 bg-current opacity-40 bg-stripes" />
        )}

        {/* Card body */}
        <div className="flex-1 px-1.5 pt-1 pb-0 min-h-0 overflow-hidden">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${statusConfig.border} ${statusConfig.bg} ${statusConfig.text}`}>
              {job.job_id}
            </span>
            {showEmployee && (
              <span className="text-[9px] font-bold text-[#0f172b] truncate">{job.employeeName}</span>
            )}
          </div>

          {showClient && (
            <p className="text-[10px] font-bold text-[#0f172b] leading-[13px] mt-0.5 truncate">{job.client}</p>
          )}

          {showTime && (
            <div className="flex items-center gap-0.5 text-[9px] font-semibold text-[#0f172b] mt-0.5">
              <IconClock />
              <span>{job.scheduledTime}{job.endTime ? ` – ${job.endTime}` : ''}</span>
            </div>
          )}

          {showAddress && job.insuredAddress !== '—' && (
            <p className="text-[9px] font-medium text-[#314158] mt-0.5 leading-[12px] line-clamp-2">{job.insuredAddress}</p>
          )}
        </div>

        {/* Clipped-bottom indicator */}
        {isClippedBottom && (
          <div className="h-[3px] shrink-0 bg-current opacity-40" />
        )}

        {/* Resize handle */}
        {!isClippedBottom && (
          <div
            onMouseDown={handleResizeMouseDown}
            onClick={e => e.stopPropagation()}
            className="h-3 cursor-ns-resize flex items-center justify-center shrink-0 hover:bg-black/5 transition-colors"
          >
            <div className="w-8 h-[3px] rounded-full bg-current opacity-20" />
          </div>
        )}
      </div>

      {popupPos && <JobDetailPopup job={job} position={popupPos} />}
    </>
  )
}

// ── Week view: current time red line ──────────────────────────────────────────
function CurrentTimeLine() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const totalMin = now.getHours() * 60 + now.getMinutes()
  if (totalMin < WEEK_START_MIN || totalMin >= WEEK_END_MIN) return null

  const top = (totalMin - WEEK_START_MIN) / 60 * HOUR_HEIGHT

  return (
    <div
      style={{ position: 'absolute', top, left: 0, right: 0, zIndex: 40, pointerEvents: 'none' }}
      className="flex items-center"
    >
      <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 -ml-[5px] shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" />
      <div className="flex-1 h-[2px] bg-red-500 opacity-90" />
    </div>
  )
}

// ── Week view: time grid ───────────────────────────────────────────────────────
function WeekView({ days, jobs, today, draggingJobRef, onDragStart, onJobClick, onWeekDrop, onWeekResizeSave }) {
  const scrollRef = useRef(null)
  const gridRef   = useRef(null)
  const [dragOverCol,  setDragOverCol]  = useState(null)
  const [dragOverMins, setDragOverMins] = useState(null)

  // Scroll to beginning of 6 AM area on mount
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [])

  // Convert mouse Y to snapped minutes (offset from WEEK_START_MIN, snap to 15)
  const getMinsFromEvent = useCallback((e) => {
    if (!scrollRef.current || !gridRef.current) return WEEK_START_MIN
    const scrollTop = scrollRef.current.scrollTop
    const gridTop   = gridRef.current.getBoundingClientRect().top
    const relY      = e.clientY - gridTop + scrollTop
    const rawMins   = relY / HOUR_HEIGHT * 60 + WEEK_START_MIN
    return snapStartTo15(rawMins)
  }, [])

  const isToday = (day) =>
    day.year  === today.getFullYear() &&
    day.month === today.getMonth()    &&
    day.day   === today.getDate()

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Sticky day headers */}
      <div className="flex border-b border-[#e2e8f0] bg-white shrink-0 z-10">
        <div className="w-[56px] shrink-0 border-r border-[#f1f5f9]" />
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

      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* paddingTop gives the first hour label breathing room */}
        <div className="flex" style={{ height: WEEK_GRID_H + 12, paddingTop: 12 }}>

          {/* Time gutter */}
          <div className="w-[56px] shrink-0 relative border-r border-[#f1f5f9]" style={{ height: '100%' }}>
            {Array.from({ length: WEEK_HOURS + 1 }, (_, i) => {
              const h = WEEK_START_HOUR + i
              return (
                <div key={h}
                  style={{ position: 'absolute', top: i * HOUR_HEIGHT - 8, right: 0, left: 0, paddingRight: 8 }}
                  className="flex items-start justify-end">
                  <span className="text-[10px] text-[#90a1b9] font-medium whitespace-nowrap leading-none">
                    {formatHourLabel(h)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Day columns */}
          <div ref={gridRef} className="flex-1 grid grid-cols-7 relative" style={{ height: '100%' }}>

            {/* Current time line — full-width, on top of all columns */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 40 }}>
              <CurrentTimeLine />
            </div>

            {days.map((day, colIdx) => {
              // Only jobs that overlap with [6 AM, 6 PM]
              const dayJobs = jobs.filter(j => {
                if (!j._isScheduled) return false
                if (j.scheduledDate?.year  !== day.year)  return false
                if (j.scheduledDate?.month !== day.month) return false
                if (j.scheduledDate?.day   !== day.day)   return false
                const s = minutesFromTime(j.scheduledTime)
                const en = j.endTime ? minutesFromTime(j.endTime) : s + 60
                return en > WEEK_START_MIN && s < WEEK_END_MIN
              })

              const layout = computeLayout(dayJobs)
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
                    const snappedMins = getMinsFromEvent(e)
                    setDragOverCol(null)
                    setDragOverMins(null)
                    onWeekDrop(day, timeFromMinutes(snappedMins))
                  }}
                  onDragEnd={() => setDragOverCol(null)}
                >
                  {/* Hour lines */}
                  {Array.from({ length: WEEK_HOURS }, (_, i) => (
                    <div key={i} style={{ top: i * HOUR_HEIGHT }}
                      className="absolute left-0 right-0 border-t border-[#e2e8f0] pointer-events-none" />
                  ))}
                  {/* 15-min sub-lines (×3 per hour: at 15, 30, 45 min) */}
                  {Array.from({ length: WEEK_HOURS }, (_, i) => [1, 2, 3].map(q => (
                    <div key={`${i}-${q}`}
                      style={{ top: i * HOUR_HEIGHT + q * (HOUR_HEIGHT / 4) }}
                      className={`absolute left-0 right-0 pointer-events-none ${
                        q === 2
                          ? 'border-t border-dashed border-[#e9ecef]'   // 30-min slightly visible
                          : 'border-t border-dashed border-[#f3f4f6]'   // 15/45-min very subtle
                      }`}
                    />
                  )))}
                  {/* Bottom boundary */}
                  <div style={{ top: WEEK_HOURS * HOUR_HEIGHT }}
                    className="absolute left-0 right-0 border-t border-[#e2e8f0] pointer-events-none" />

                  {/* Job cards */}
                  {layout.map(({ job, lane, totalCols }) => {
                    const startMin     = minutesFromTime(job.scheduledTime)
                    const endMin       = job.endTime ? minutesFromTime(job.endTime) : startMin + 60
                    const clampedStart = Math.max(WEEK_START_MIN, startMin)
                    const clampedEnd   = Math.min(WEEK_END_MIN,   endMin)
                    const cardTop      = (clampedStart - WEEK_START_MIN) / 60 * HOUR_HEIGHT
                    const cardH        = Math.max(HOUR_HEIGHT / 4, (clampedEnd - clampedStart) / 60 * HOUR_HEIGHT)
                    return (
                      <WeekJobCard
                        key={job.id}
                        job={job}
                        top={cardTop}
                        height={cardH}
                        lane={lane}
                        totalCols={totalCols}
                        isClippedTop={startMin < WEEK_START_MIN}
                        isClippedBottom={endMin > WEEK_END_MIN}
                        scrollRef={scrollRef}
                        onDragStart={onDragStart}
                        onClick={onJobClick}
                        onResizeSave={(endTime) => onWeekResizeSave(job, endTime)}
                      />
                    )
                  })}

                  {/* Drop time indicator */}
                  {isOver && dragOverMins !== null && (
                    <div
                      style={{ top: (dragOverMins - WEEK_START_MIN) / 60 * HOUR_HEIGHT }}
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
  const [viewMode,  setViewMode]  = useState('week')

  // ── Data state ─────────────────────────────────────────────────────────────
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  // ── Drag state ─────────────────────────────────────────────────────────────
  const draggingJob     = useRef(null)
  const [dragOverDay,   setDragOverDay]   = useState(null)
  const [dragOverPanel, setDragOverPanel] = useState(false)

  // ── Modal state (month / day view only) ────────────────────────────────────
  const [pendingDrop, setPendingDrop] = useState(null)  // { job, date, prefillTime? }
  const [modalSaving, setModalSaving] = useState(false)

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

  // ── Navigation helpers — week starts Monday ────────────────────────────────
  const getWeekStart = (year, month, day) => {
    const d   = new Date(year, month, day)
    const dow = d.getDay() // 0=Sun, 1=Mon … 6=Sat
    d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
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
      j.scheduledDate?.year === year && j.scheduledDate?.month === month && j.scheduledDate?.day === day
    ).sort((a, b) => (a.scheduledTime > b.scheduledTime ? 1 : -1))

  const groupJobsByTime = (list) => {
    const groups = list.reduce((acc, job) => {
      const t = job.scheduledTime || '09:00'
      acc[t] = acc[t] || []
      acc[t].push(job)
      return acc
    }, {})
    return Object.keys(groups).sort().map(t => ({ time: t, jobs: groups[t] }))
  }

  const isToday = (year, month, day) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate()

  // ── Calendar grid cells ────────────────────────────────────────────────────
  let rows = []
  if (viewMode === 'month') {
    const firstDay  = firstDayOfMonth(viewYear, viewMonth)
    const totalDays = daysInMonth(viewYear, viewMonth)
    const prevDays  = daysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1)
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
    // Week starts Monday
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

  const handleDrop = (e, cell) => {
    e.preventDefault()
    setDragOverDay(null)
    const job = draggingJob.current
    draggingJob.current = null
    if (!job) return
    // Month/day view: show start-time picker
    setPendingDrop({ job, date: { year: cell.year, month: cell.month, day: cell.day } })
  }

  // ── Week drop — immediate save, no popup ───────────────────────────────────
  const handleWeekDrop = async (day, snappedTime) => {
    const job = draggingJob.current
    draggingJob.current = null
    if (!job) return

    const isoString = toISO(day.year, day.month, day.day, snappedTime)

    // Optimistic update
    setJobs(prev => prev.map(j =>
      j.id === job.id
        ? { ...j, scheduledDate: { year: day.year, month: day.month, day: day.day }, scheduledTime: snappedTime, _isScheduled: true }
        : j
    ))

    const { ok } = await apiFetch(`jobs/${job.id}/schedule/`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_datetime: isoString }),
    })
    if (!ok) setJobs(prev => prev.map(j => j.id === job.id ? job : j))
  }

  // ── Week resize — immediate save, no popup ────────────────────────────────
  const handleWeekResizeSave = async (job, endTime) => {
    if (!job.scheduledDate) return
    const isoStart = toISO(job.scheduledDate.year, job.scheduledDate.month, job.scheduledDate.day, job.scheduledTime)
    const isoEnd   = toISO(job.scheduledDate.year, job.scheduledDate.month, job.scheduledDate.day, endTime)

    // Optimistic update
    setJobs(prev => prev.map(j => j.id === job.id ? { ...j, endTime } : j))

    const { ok } = await apiFetch(`jobs/${job.id}/schedule/`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_datetime: isoStart, end_time: isoEnd }),
    })
    if (!ok) setJobs(prev => prev.map(j => j.id === job.id ? job : j))
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

  // ── Confirm start-time (month / day drop only) ─────────────────────────────
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

  const handleChipClick = (job) => navigate(`/admin/jobs/${job.id}`)

  const showPanel = viewMode === 'month' || viewMode === 'week'

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Start-time modal (month / day only) */}
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

      <div className="flex gap-0 h-full min-h-0">

        {/* ── LEFT: Unscheduled panel ── */}
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
                {dragOverPanel ? 'Release to unschedule' : 'Drag onto calendar · drag here to unschedule'}
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
                  ? 'Drop to schedule · drag bottom edge to set end time · snaps to 15 min'
                  : 'Drag and drop to reschedule jobs'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center bg-white border border-[#e2e8f0] rounded-[10px] p-[3px]">
                {['month','week','day'].map(mode => (
                  <button key={mode} onClick={() => setViewMode(mode)}
                    className={`px-4 py-[6px] rounded-[7px] text-[13px] font-semibold capitalize transition-all ${
                      viewMode === mode ? 'bg-[#0f172b] text-white shadow-sm' : 'text-[#62748e] hover:text-[#314158]'
                    }`}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-[10px] px-2 py-[5px]">
                <button onClick={prevView}
                  className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#314158] hover:bg-[#f8fafc] transition-colors">
                  <IconChevLeft />
                </button>
                <span className="text-[#0f172b] font-bold text-[14px] w-[168px] text-center select-none">
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
              <WeekView
                days={weekDays}
                jobs={jobs}
                today={today}
                draggingJobRef={draggingJob}
                onDragStart={handleDragStart}
                onJobClick={handleChipClick}
                onWeekDrop={handleWeekDrop}
                onWeekResizeSave={handleWeekResizeSave}
              />

            ) : (
              <>
                {/* Month / Day — day headers */}
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
                        const dayJobs  = scheduledOnDay(cell.year, cell.month, cell.day)
                        const isOver   = dragOverDay?.year === cell.year && dragOverDay?.month === cell.month && dragOverDay?.day === cell.day
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

          {/* Status legend */}
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
