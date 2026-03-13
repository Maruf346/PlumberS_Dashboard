// src/components/jobdetails/LiveActivityCard.jsx
// Shows last 5 activities from job detail, "View Full Log" modal loads all
// Full log: GET /api/jobs/{id}/activity/
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { apiFetch } from '@/utils/apiFetch'

function IconClock() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#62748e" strokeWidth="1.2"/><path d="M8 4.5V8l2.5 2" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconClose() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }

// Activity type → dot color
const ACTIVITY_COLORS = {
  job_created:    'bg-[#1447e6]',
  job_assigned:   'bg-[#f54900]',
  job_updated:    'bg-[#fe9a00]',
  job_started:    'bg-[#007a55]',
  job_completed:  'bg-[#007a55]',
  status_changed: 'bg-[#8b5cf6]',
  note_added:     'bg-[#62748e]',
}

function fmtDt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function ActivityItem({ item, isLast }) {
  const dotColor = ACTIVITY_COLORS[item.activity_type] ?? 'bg-[#cad5e2]'
  return (
    <div className="flex items-start gap-4 pb-5 last:pb-0 relative">
      {!isLast && <div className="absolute left-[19px] top-[40px] bottom-0 w-px bg-[#e2e8f0]" />}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${dotColor}`}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="3" fill="white" fillOpacity="0.9"/>
        </svg>
      </div>
      <div className="pt-2 min-w-0">
        <p className="text-[14px] leading-[20px] font-medium text-[#0f172b]">{item.description}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-[12px] text-[#62748e] font-['Consolas',monospace]">{fmtDt(item.created_at)}</span>
          {item.actor_name && <><span className="text-[#cad5e2]">•</span><span className="text-[#90a1b9] text-[12px]">{item.actor_name}</span></>}
        </div>
      </div>
    </div>
  )
}

// ── Full Log Modal ────────────────────────────────────────────────────────────
function FullLogModal({ jobId, initialItems, onClose }) {
  const [items,   setItems]   = useState(initialItems)
  const [loading, setLoading] = useState(false)
  const [loaded,  setLoaded]  = useState(false)

  // Load all activities from API on first open
  useState(() => {
    setLoading(true)
    apiFetch(`jobs/${jobId}/activity/`).then(({ data, ok }) => {
      if (ok && data) setItems(data.results ?? data ?? initialItems)
      setLoading(false)
      setLoaded(true)
    })
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[480px] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.25)] overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] shrink-0">
          <h3 className="text-[#0f172b] font-bold text-[17px]">Full Activity Log</h3>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc]"><IconClose /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/></div>
          ) : items.length === 0 ? (
            <p className="text-center text-[#90a1b9] py-6">No activity recorded.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-[19px] top-[10px] bottom-[10px] w-px bg-[#e2e8f0]" />
              {items.map((item, i) => (
                <ActivityItem key={item.id ?? i} item={item} isLast={i === items.length - 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── LiveActivityCard ──────────────────────────────────────────────────────────
export default function LiveActivityCard({ jobId, activities }) {
  const [showModal, setShowModal] = useState(false)
  const preview = (activities ?? []).slice(0, 5)

  return (
    <>
      {showModal && (
        <FullLogModal jobId={jobId} initialItems={activities ?? []} onClose={() => setShowModal(false)} />
      )}

      <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden h-full flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <IconClock />
            <h3 className="text-[#0f172b] font-bold text-[16px] leading-[27px]">Activity Log</h3>
          </div>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shrink-0" />
            <span className="text-[13px] font-semibold text-[#22c55e]">Live</span>
          </span>
        </div>

        {/* Timeline (preview) */}
        <div className="flex-1 px-5 py-5 overflow-y-auto">
          {preview.length === 0 ? (
            <p className="text-[#90a1b9] text-[14px] text-center py-4">No activity yet.</p>
          ) : (
            <div className="relative">
              <div className="absolute left-[19px] top-[10px] bottom-[10px] w-px bg-[#e2e8f0]" />
              {preview.map((item, i) => (
                <ActivityItem key={item.id ?? i} item={item} isLast={i === preview.length - 1} />
              ))}
            </div>
          )}
        </div>

        {/* View full log */}
        <div className="border-t border-[#f1f5f9] px-4 py-4">
          <button onClick={() => setShowModal(true)}
            className="w-full text-[#314158] text-[14px] font-medium leading-[20px] py-[9px] rounded-[10px] bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors">
            View Full Log {activities?.length > 5 ? `(${activities.length})` : ''}
          </button>
        </div>
      </div>
    </>
  )
}
