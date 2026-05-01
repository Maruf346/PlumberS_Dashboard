// src/pages/schedule/SchedulePage.jsx
// Schedule — month calendar with drag-and-drop job scheduling
// API integrated:
//   GET  /api/jobs/                  → load all jobs (scheduled + unscheduled)
//   PATCH /api/jobs/{id}/schedule/   → { scheduled_datetime: ISO | null }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate }                               from 'react-router-dom'
import { apiFetch }                                  from '@/utils/apiFetch'

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

function daysInMonth(year, month)   { return new Date(year, month + 1, 0).getDate() }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }

// Parse ISO datetime string → { year, month (0-based), day, time "HH:MM" }
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

// Build ISO datetime string for a given date + time string "HH:MM"
function toISO(year, month, day, time = '09:00') {
  const [h, m] = time.split(':').map(Number)
  return new Date(year, month, day, h, m).toISOString()
}

// Map API job → internal shape used by calendar
function mapJob(j) {
  const parsed = parseISO(j.scheduled_datetime)
  return {
    // keep original id (UUID) for API calls and navigation
    id:             j.id,
    job_id:         j.job_id,           // display label e.g. "JB-1024"
    client:         j.client_name ?? j.client?.name ?? '—',
    priority:       j.priority ? j.priority.charAt(0).toUpperCase() + j.priority.slice(1) : 'Low',
    status:         apiStatusToDisplay(j.status),
    rawStatus:      j.status,           // keep raw status for color mapping
    employeeName:   j.assigned_to?.full_name ?? 'Unassigned',
    employeeId:     j.assigned_to?.id ?? null,
    scheduledDate:  parsed ? { year: parsed.year, month: parsed.month, day: parsed.day } : null,
    scheduledTime:  parsed?.time ?? '09:00',
    _isScheduled:   !!parsed,
    _raw:           j,
  }
}

function apiStatusToDisplay(s) {
  const map = {
    pending:            'To be booked',
    scheduled:          'Scheduled',
    in_progress:        'In Progress',
    on_hold:            'On Hold',
    to_invoice:         'To Invoice',
    completed:          'Completed',
    cancelled:          'Cancelled',
    emergency_make_safe: 'Emergency Make Safe',
    overdue:            'Overdue',
  }
  return map[s] ?? s ?? 'Pending'
}

// ── Status → chip colour map ───────────────────────────────────────────────────
const STATUS_CHIP = {
  'To be booked':   { bg: 'bg-[#f5f3ff]', border: 'border-[#e9d5ff]', text: 'text-[#6d28d9]', dot: 'bg-[#8b5cf6]' },
  'Scheduled':      { bg: 'bg-[#ecfeff]', border: 'border-[#cffafe]', text: 'text-[#0c4a6e]', dot: 'bg-[#06b6d4]' },
  'In Progress':    { bg: 'bg-[#dcfce7]', border: 'border-[#bbf7d0]', text: 'text-[#166534]', dot: 'bg-[#16a34a]' },
  'On Hold':        { bg: 'bg-[#fef3c7]', border: 'border-[#fde68a]', text: 'text-[#92400e]', dot: 'bg-[#f59e0b]' },
  'To Invoice':     { bg: 'bg-[#fde8ef]', border: 'border-[#fbcfe8]', text: 'text-[#be185d]', dot: 'bg-[#fb7185]' },
  'Completed':      { bg: 'bg-[#f3f4f6]', border: 'border-[#e5e7eb]', text: 'text-[#475569]', dot: 'bg-[#6b7280]' },
  'Cancelled':      { bg: 'bg-[#f3e8ff]', border: 'border-[#e9d5ff]', text: 'text-[#6d28d9]', dot: 'bg-[#7c3aed]' },
  'Emergency Make Safe': { bg: 'bg-[#fee2e2]', border: 'border-[#fecaca]', text: 'text-[#b91c1c]', dot: 'bg-[#dc2626]' },
  'Overdue':        { bg: 'bg-[#fef2f2]', border: 'border-[#fecaca]', text: 'text-[#c10007]', dot: 'bg-[#b91c1c]' },
}
const DEFAULT_CHIP = { bg: 'bg-[#f8fafc]', border: 'border-[#e2e8f0]', text: 'text-[#314158]', dot: 'bg-[#90a1b9]', time: 'text-[#90a1b9]' }

// ── Employee color palette ─────────────────────────────────────────────────────
const EMPLOYEE_COLORS = [
  'bg-[#dbeafe] border-[#3b82f6]',  // blue
  'bg-[#fee2e2] border-[#f54900]',  // orange
  'bg-[#ede9fe] border-[#8b5cf6]',  // purple
  'bg-[#cffafe] border-[#06b6d4]',  // cyan
  'bg-[#d1fae5] border-[#10b981]',  // emerald
  'bg-[#fef3c7] border-[#f59e0b]',  // amber
  'bg-[#fce7f3] border-[#ec4899]',  // pink
  'bg-[#e0e7ff] border-[#6366f1]',  // indigo
]

function getEmployeeColor(employeeId) {
  if (!employeeId) return 'bg-[#f3f4f6] border-[#d1d5db]' // gray for unassigned
  const hash = employeeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const idx = hash % EMPLOYEE_COLORS.length
  return EMPLOYEE_COLORS[idx]
}

// ── Priority badge colours ─────────────────────────────────────────────────────
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

// ── Time picker modal ─────────────────────────────────────────────────────────
function TimePickerModal({ job, date, saving, onConfirm, onCancel }) {
  const [time, setTime] = useState(job.scheduledTime ?? '09:00')
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

// ── Job chip (on calendar) ────────────────────────────────────────────────────
function JobChip({ job, onDragStart, onClick }) {
  const statusConfig = STATUS_CHIP[job.status] ?? DEFAULT_CHIP
  const employeeColor = getEmployeeColor(job.employeeId)
  return (
    <div
      draggable
      onDragStart={e => { e.stopPropagation(); onDragStart(e, job) }}
      onClick={e => { e.stopPropagation(); onClick(job) }}
      className={`flex flex-col gap-2 p-2 rounded-[14px] border cursor-grab active:cursor-grabbing hover:brightness-95 transition-all select-none ${employeeColor}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/90 ${statusConfig.border} ${statusConfig.text}`}>
          {job.job_id}
        </span>
        <span className="text-[10px] font-semibold text-[#334155] truncate">
          {job.employeeName}
        </span>
      </div>
      <p className="text-[12px] font-semibold text-[#0f172b] leading-[15px] truncate">
        {job.client}
      </p>
      <span className="flex items-center gap-1 text-[10px] text-[#475569]">
        <IconClock /> {job.scheduledTime}
      </span>
    </div>
  )
}

// ── Unscheduled job row (left panel) ──────────────────────────────────────────
function UnscheduledRow({ job, onDragStart }) {
  const p = PRIORITY_COLOR[job.priority] ?? 'bg-[#f8fafc] text-[#62748e]'
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, job)}
      className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] border border-[#e2e8f0] bg-white hover:border-[#f54900]/40 hover:bg-[#fff9f7] cursor-grab active:cursor-grabbing transition-all select-none"
    >
      <span className="text-[#cad5e2] shrink-0"><IconGrip /></span>
      <div className="flex-1 min-w-0">
        <p className="text-[#0f172b] text-[12px] font-bold truncate">{job.job_id}</p>
        <p className="text-[#62748e] text-[11px] truncate">{job.client}</p>
      </div>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${p}`}>
        {job.priority}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const navigate = useNavigate()
  const today = new Date()

  // ── Calendar view state ────────────────────────────────────────────────────
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewMode,  setViewMode]  = useState('month')

  // ── Jobs state ─────────────────────────────────────────────────────────────
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  // ── Drag state ─────────────────────────────────────────────────────────────
  const draggingJob  = useRef(null)
  const [dragOverDay,   setDragOverDay]   = useState(null)
  const [dragOverPanel, setDragOverPanel] = useState(false)

  // ── Time-picker modal state ────────────────────────────────────────────────
  const [pendingDrop, setPendingDrop] = useState(null) // { job, date }
  const [modalSaving, setModalSaving] = useState(false)

  // ── Fetch ALL jobs — loop every page until next is null ─────────────────────
  // Backend paginates at 5 per page by default. We collect all pages so the
  // calendar shows every job regardless of total count.
  const fetchJobs = useCallback(async () => {
    setLoading(true)
    let allResults = []
    let endpoint = 'jobs/?page_size=100' // request large pages to minimise round-trips

    while (endpoint) {
      let result
      if (endpoint.startsWith('http')) {
        // 'next' from API is a full URL — fetch it directly with auth header
        const token = sessionStorage.getItem('access')
        try {
          const res = await fetch(endpoint, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          })
          const data = res.ok ? await res.json() : null
          result = { data, ok: res.ok }
        } catch (_) { break }
      } else {
        result = await apiFetch(endpoint)
      }

      if (!result.ok || !result.data) break
      allResults = allResults.concat(result.data.results ?? [])
      endpoint = result.data.next ?? null  // null when last page reached
    }

    setJobs(allResults.map(mapJob))
    setLoading(false)
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
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

  const groupJobsByTime = (jobsList) => {
    const groups = jobsList.reduce((acc, job) => {
      const time = job.scheduledTime || '09:00'
      acc[time] = acc[time] || []
      acc[time].push(job)
      return acc
    }, {})

    return Object.keys(groups).sort().map(time => ({
      time,
      jobs: groups[time],
    }))
  }

  // ── Calendar grid ──────────────────────────────────────────────────────────
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
  const rows = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

  const isToday = (year, month, day) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate()

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = (e, job) => {
    draggingJob.current = job
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDragOver = (e, cell) => {
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
    // Open time picker — confirm will fire the API call
    setPendingDrop({ job, date: { year: cell.year, month: cell.month, day: cell.day } })
  }

  // ── Panel drag handlers (drop onto panel = unschedule) ─────────────────────
  const handlePanelDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverPanel(true) }
  const handlePanelDragLeave = () => setDragOverPanel(false)
  const handlePanelDrop = async (e) => {
    e.preventDefault()
    setDragOverPanel(false)
    const job = draggingJob.current
    draggingJob.current = null
    if (!job || !job._isScheduled) return

    // Optimistic update
    setJobs(prev => prev.map(j =>
      j.id === job.id
        ? { ...j, scheduledDate: null, scheduledTime: '09:00', _isScheduled: false }
        : j
    ))

    // API call — send null to unschedule
    const { ok } = await apiFetch(`jobs/${job.id}/schedule/`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_datetime: null }),
    })
    if (!ok) {
      // Revert optimistic update on failure
      setJobs(prev => prev.map(j => j.id === job.id ? job : j))
    }
  }

  // ── Confirm scheduling after time pick ────────────────────────────────────
  const confirmSchedule = async (time) => {
    const { job, date } = pendingDrop
    const isoString = toISO(date.year, date.month, date.day, time)

    setModalSaving(true)

    const { ok } = await apiFetch(`jobs/${job.id}/schedule/`, {
      method: 'PATCH',
      body: JSON.stringify({ scheduled_datetime: isoString }),
    })

    if (ok) {
      // Apply confirmed update to state
      setJobs(prev => prev.map(j =>
        j.id === job.id
          ? { ...j, scheduledDate: date, scheduledTime: time, _isScheduled: true }
          : j
      ))
      setPendingDrop(null)
    }
    // If API fails, leave modal open so user can retry or cancel
    setModalSaving(false)
  }

  const handleChipClick = (job) => {
    navigate(`/admin/jobs/${job.id}`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {pendingDrop && (
        <TimePickerModal
          job={pendingDrop.job}
          date={pendingDrop.date}
          saving={modalSaving}
          onConfirm={confirmSchedule}
          onCancel={() => { if (!modalSaving) setPendingDrop(null) }}
        />
      )}

      <div className="flex gap-0 min-h-full">

        {/* ── LEFT: Unscheduled jobs panel ── */}
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
                : 'Drag a job here to unschedule · Drag onto calendar to schedule'}
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

        {/* ── RIGHT: Calendar ── */}
        <div className="flex-1 min-w-0 flex flex-col p-6 gap-5">

          {/* Page header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[#0f172b] font-bold text-[26px] leading-[34px]">Schedule</h1>
              <p className="text-[#62748e] text-[14px] mt-0.5">Drag and drop to reassign jobs</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Month/Week/Day toggle 
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
              */}

              {/* Month navigation */}
              <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-[10px] px-2 py-[5px]">
                <button onClick={prevMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#314158] hover:bg-[#f8fafc] transition-colors">
                  <IconChevLeft />
                </button>
                <span className="text-[#0f172b] font-bold text-[14px] w-[130px] text-center select-none">
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button onClick={nextMonth}
                  className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#314158] hover:bg-[#f8fafc] transition-colors">
                  <IconChevRight />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar card */}
          <div className="flex-1 bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-[#e2e8f0]">
              {DAYS.map(d => (
                <div key={d} className="py-[10px] text-center text-[12px] font-bold text-[#62748e] uppercase tracking-[0.5px]">
                  {d}
                </div>
              ))}
            </div>

            {/* Loading overlay */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-7 h-7 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
                  <p className="text-[#90a1b9] text-[13px]">Loading schedule…</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[#f1f5f9]">
                {rows.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-7 divide-x divide-[#f1f5f9]" style={{ minHeight: '120px' }}>
                    {row.map((cell, ci) => {
                      const dayJobs = scheduledOnDay(cell.year, cell.month, cell.day)
                      const isOver  = dragOverDay?.year === cell.year && dragOverDay?.month === cell.month && dragOverDay?.day === cell.day
                      const todayDay = isToday(cell.year, cell.month, cell.day)

                      return (
                        <div
                          key={ci}
                          onDragOver={e => handleDragOver(e, cell)}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, cell)}
                          onDragEnd={handleDragEnd}
                          className={[
                            'p-2 flex flex-col gap-1.5 transition-colors duration-100 min-h-[120px]',
                            !cell.current ? 'bg-[#fafafa]' : '',
                            isOver ? 'bg-[#fff4ee] ring-2 ring-inset ring-[#f54900]/30' : '',
                          ].join(' ')}
                        >
                          {/* Day number */}
                          <div className="flex items-center justify-between">
                            <span className={[
                              'text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded-full leading-none',
                              todayDay
                                ? 'bg-[#f54900] text-white'
                                : cell.current
                                  ? 'text-[#0f172b]'
                                  : 'text-[#cad5e2]',
                            ].join(' ')}>
                              {cell.day}
                            </span>
                            {dayJobs.length > 0 && (
                              <span className="text-[10px] text-[#90a1b9] font-medium">
                                {dayJobs.length} job{dayJobs.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          {/* Job chips — max 3 visible, same-time groups display side-by-side */}
                          {groupJobsByTime(dayJobs.slice(0, 3)).map(group => {
                            const cols = group.jobs.length === 2 ? 'grid-cols-2' : group.jobs.length >= 3 ? 'grid-cols-3' : 'grid-cols-1'
                            return (
                              <div key={group.time} className={`grid gap-1 ${cols}`}>
                                {group.jobs.map(job => (
                                  <JobChip
                                    key={job.id}
                                    job={job}
                                    onDragStart={handleDragStart}
                                    onClick={handleChipClick}
                                  />
                                ))}
                              </div>
                            )
                          })}
                          {dayJobs.length > 3 && (
                            <span className="text-[10px] text-[#90a1b9] font-medium px-1">
                              +{dayJobs.length - 3} more
                            </span>
                          )}

                          {/* Drop hint */}
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
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 flex-wrap">
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