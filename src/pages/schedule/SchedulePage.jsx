// src/pages/schedule/SchedulePage.jsx
// Schedule — full month calendar with drag-and-drop job scheduling
//
// Drag an unscheduled job from the left panel onto any calendar day to schedule it.
// Drag an already-scheduled job chip to a new day to reschedule it.
//
// API (commented out — uncomment when backend ready):
//   PATCH /api/jobs/{id}/schedule/
//   Body: { "scheduled_datetime": "2026-03-05T19:07:37.085Z" }
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import { useNavigate }       from 'react-router-dom'
import { JOBS_FULL }         from '@/data/jobsFullMock'

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function firstDayOfMonth(year, month) { return new Date(year, month, 1).getDay() }

// Parse "Oct 24, 2023" → { year, month (0-based), day }
function parseSchedule(str) {
  if (!str) return null
  const d = new Date(str)
  if (isNaN(d)) return null
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() }
}

// Build ISO datetime string for a given date + optional time
function toISO(year, month, day, time = '09:00') {
  const [h, m] = time.split(':').map(Number)
  return new Date(year, month, day, h, m).toISOString()
}

// ── Status → chip colour map (Figma-exact) ────────────────────────────────────
const STATUS_CHIP = {
  'Pending':     { bg: 'bg-[#eff6ff]', border: 'border-[#bfdbfe]', text: 'text-[#1d4ed8]', dot: 'bg-[#3b82f6]', time: 'text-[#3b82f6]' },
  'In Progress': { bg: 'bg-[#fff7ed]', border: 'border-[#fed7aa]', text: 'text-[#c73b00]', dot: 'bg-[#f54900]', time: 'text-[#f54900]' },
  'Completed':   { bg: 'bg-[#ecfdf5]', border: 'border-[#bbf7d0]', text: 'text-[#007a55]', dot: 'bg-[#10b981]', time: 'text-[#10b981]' },
  'Overdue':     { bg: 'bg-[#fef2f2]', border: 'border-[#fecaca]', text: 'text-[#c10007]', dot: 'bg-[#ef4444]', time: 'text-[#ef4444]' },
}
const DEFAULT_CHIP = { bg: 'bg-[#f8fafc]', border: 'border-[#e2e8f0]', text: 'text-[#314158]', dot: 'bg-[#90a1b9]', time: 'text-[#90a1b9]' }

// ── Priority badge colours ─────────────────────────────────────────────────────
const PRIORITY_COLOR = {
  High:   'bg-[#fef2f2] text-[#c10007]',
  Medium: 'bg-[#fff7ed] text-[#c73b00]',
  Low:    'bg-[#f0fdf4] text-[#007a55]',
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconChevLeft()  { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconChevRight() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconClock()     { return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.1"/><path d="M5.5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconGrip()      { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="4" cy="3" r="1" fill="currentColor"/><circle cx="8" cy="3" r="1" fill="currentColor"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="9" r="1" fill="currentColor"/><circle cx="8" cy="9" r="1" fill="currentColor"/></svg> }
function IconBriefcase() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="4" width="11" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.1"/><path d="M4.5 4V3A1.5 1.5 0 016 1.5h1A1.5 1.5 0 018.5 3v1" stroke="currentColor" strokeWidth="1.1"/></svg> }
function IconCalPlus()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 1.5v2M10 1.5v2M1 6.5h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M7.5 9v3M6 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconX()         { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }

// ── Time picker modal (shown on drop) ─────────────────────────────────────────
function TimePickerModal({ job, date, onConfirm, onCancel }) {
  const [time, setTime] = useState('09:00')
  const label = `${MONTHS[date.month].slice(0,3)} ${date.day}, ${date.year}`
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172b]/40 backdrop-blur-sm"
      onClick={onCancel}>
      <div className="bg-white rounded-[16px] shadow-[0_20px_60px_rgba(15,23,43,0.22)] w-[340px] overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
          <div>
            <h3 className="text-[#0f172b] font-bold text-[16px]">Schedule Job</h3>
            <p className="text-[#90a1b9] text-[12px] mt-0.5">{job.id} · {job.client}</p>
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
          <button onClick={onCancel}
            className="flex-1 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold hover:bg-[#f8fafc] transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(time)}
            className="flex-1 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0_1px_3px_rgba(245,73,0,0.3)]">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Job chip (on calendar) ────────────────────────────────────────────────────
function JobChip({ job, onDragStart, onClick }) {
  const c = STATUS_CHIP[job.status] ?? DEFAULT_CHIP
  const timeStr = job.scheduledTime ?? '09:00'
  return (
    <div
      draggable
      onDragStart={e => { e.stopPropagation(); onDragStart(e, job) }}
      onClick={e => { e.stopPropagation(); onClick(job) }}
      className={`flex flex-col px-2 py-1.5 rounded-[6px] border cursor-grab active:cursor-grabbing hover:brightness-95 transition-all select-none ${c.bg} ${c.border}`}
    >
      <span className={`text-[11px] font-bold leading-[15px] truncate ${c.text}`}>
        {job.id}: {job.client}
      </span>
      <span className={`flex items-center gap-1 text-[10px] mt-0.5 ${c.time}`}>
        <IconClock /> {timeStr}
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
        <p className="text-[#0f172b] text-[12px] font-bold truncate">{job.id}</p>
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

  // ── Calendar state ─────────────────────────────────────────────────────────
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(2025)   // default Oct 2025 to match mock data
  const [viewMonth, setViewMonth] = useState(9)       // 0-based; 9 = October
  const [viewMode,  setViewMode]  = useState('month') // 'month' | 'week' | 'day'

  // ── Jobs state: each job carries optional scheduledDate { year, month, day } + scheduledTime ──
  const [jobs, setJobs] = useState(() =>
    JOBS_FULL.map(j => {
      const parsed = parseSchedule(j.schedule)
      return {
        ...j,
        scheduledDate: parsed,
        scheduledTime: '09:00',
        _isScheduled:  !!parsed,
      }
    })
  )

  // ── Drag state ─────────────────────────────────────────────────────────────
  const draggingJob = useRef(null)
  const [dragOverDay, setDragOverDay] = useState(null)   // { year, month, day }

  // ── Time-picker modal state ────────────────────────────────────────────────
  const [pendingDrop, setPendingDrop] = useState(null) // { job, date }

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

  // ── Calendar grid rows ─────────────────────────────────────────────────────
  const firstDay    = firstDayOfMonth(viewYear, viewMonth)
  const totalDays   = daysInMonth(viewYear, viewMonth)
  const prevDays    = daysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1)
  const totalCells  = Math.ceil((firstDay + totalDays) / 7) * 7
  const cells = Array.from({ length: totalCells }, (_, i) => {
    if (i < firstDay) {
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1
      const prevYear  = viewMonth === 0 ? viewYear - 1 : viewYear
      return { day: prevDays - firstDay + i + 1, month: prevMonth, year: prevYear, current: false }
    }
    const d = i - firstDay + 1
    if (d > totalDays) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear
      return { day: d - totalDays, month: nextM, year: nextY, current: false }
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
  const handleDragLeave = () => setDragOverDay(null)
  const handleDrop = (e, cell) => {
    e.preventDefault()
    setDragOverDay(null)
    const job = draggingJob.current
    draggingJob.current = null
    if (!job) return
    const date = { year: cell.year, month: cell.month, day: cell.day }
    // Open time picker modal
    setPendingDrop({ job, date })
  }
  const handleDragEnd = () => { draggingJob.current = null; setDragOverDay(null) }

  // ── Confirm scheduling after time pick ────────────────────────────────────
  const confirmSchedule = (time) => {
    const { job, date } = pendingDrop
    setPendingDrop(null)

    setJobs(prev => prev.map(j =>
      j.id === job.id
        ? { ...j, scheduledDate: date, scheduledTime: time, _isScheduled: true }
        : j
    ))

    // ── API call — uncomment when backend ready ──────────────────────────
    // const apiBase    = import.meta.env.VITE_API_BASE_URL
    // const endpoint   = `${apiBase}jobs/${job.id}/schedule/`
    // const isoString  = toISO(date.year, date.month, date.day, time)
    //
    // try {
    //   await fetch(endpoint, {
    //     method:  'PATCH',
    //     headers: { 'Content-Type': 'application/json' },
    //     body:    JSON.stringify({ scheduled_datetime: isoString }),
    //   })
    // } catch (err) {
    //   console.error('Failed to schedule job:', err)
    //   // Optionally revert optimistic update here
    // }
    // ── End API call ─────────────────────────────────────────────────────
  }

  // ── Unschedule (right-click chip to remove from calendar) ─────────────────
  const handleChipClick = (job) => {
    // Navigate to job detail on click
    navigate(`/admin/jobs/${job.id}`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Time picker modal */}
      {pendingDrop && (
        <TimePickerModal
          job={pendingDrop.job}
          date={pendingDrop.date}
          onConfirm={confirmSchedule}
          onCancel={() => setPendingDrop(null)}
        />
      )}

      <div className="flex gap-0 min-h-full">

        {/* ── LEFT: Unscheduled jobs panel ── */}
        <div className="w-[220px] shrink-0 border-r border-[#e2e8f0] bg-white flex flex-col">
          <div className="px-4 py-4 border-b border-[#f1f5f9]">
            <div className="flex items-center gap-2">
              <span className="text-[#62748e]"><IconBriefcase /></span>
              <h3 className="text-[#0f172b] font-bold text-[13px]">Unscheduled</h3>
              <span className="ml-auto text-[11px] font-bold text-white bg-[#f54900] rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                {unscheduled.length}
              </span>
            </div>
            <p className="text-[#90a1b9] text-[11px] mt-1 leading-[16px]">Drag a job onto the calendar to schedule it</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {unscheduled.length === 0 ? (
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
              {/* Month/Week/Day toggle */}
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

            {/* Calendar rows */}
            <div className="flex flex-col divide-y divide-[#f1f5f9]">
              {rows.map((row, ri) => (
                <div key={ri} className="grid grid-cols-7 divide-x divide-[#f1f5f9]" style={{ minHeight: '120px' }}>
                  {row.map((cell, ci) => {
                    const dayJobs  = scheduledOnDay(cell.year, cell.month, cell.day)
                    const isOver   = dragOverDay?.year === cell.year && dragOverDay?.month === cell.month && dragOverDay?.day === cell.day
                    const todayDay = isToday(cell.year, cell.month, cell.day)

                    return (
                      <div
                        key={ci}
                        onDragOver={e => handleDragOver(e, cell)}
                        onDragLeave={handleDragLeave}
                        onDrop={e => handleDrop(e, cell)}
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

                        {/* Job chips — max 3 visible, then +N more */}
                        {dayJobs.slice(0, 3).map(j => (
                          <JobChip
                            key={j.id}
                            job={j}
                            onDragStart={handleDragStart}
                            onClick={handleChipClick}
                          />
                        ))}
                        {dayJobs.length > 3 && (
                          <span className="text-[10px] text-[#90a1b9] font-medium px-1">
                            +{dayJobs.length - 3} more
                          </span>
                        )}

                        {/* Drop target hint */}
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