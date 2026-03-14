// src/components/dashboard/FleetAlertsPanel.jsx — real inspections API data
// GET /api/inspections/?has_issue=true
// Capped height so it doesn't push RecentActivity too far down

import { useNavigate } from 'react-router-dom'

function IconTruck() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 5h8v7H1zM9 7l3 2v3H9z" stroke="#c10007" strokeWidth="1.2" strokeLinejoin="round"/><circle cx="3.5" cy="12.5" r="1" fill="#c10007"/><circle cx="11.5" cy="12.5" r="1" fill="#c10007"/></svg>
}

function IconClock() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#62748e" strokeWidth="1"/><path d="M6 3.5V6l2 1.5" stroke="#62748e" strokeWidth="1" strokeLinecap="round"/></svg>
}

function fmtAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function AlertCard({ inspection, onViewDetails }) {
  return (
    <div className="bg-[rgba(254,242,242,0.6)] border border-[#ffe2e2] rounded-[10px] p-3.5 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-[#ffe2e2] flex items-center justify-center shrink-0 mt-0.5">
        <IconTruck />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[#1d293d] text-[13px] font-bold leading-[18px] truncate">
            {inspection.vehicle_name} <span className="font-['Consolas',monospace] font-normal text-[11px] text-[#90a1b9]">({inspection.vehicle_plate})</span>
          </span>
          <span className="flex items-center gap-1 text-[#62748e] text-[11px] whitespace-nowrap shrink-0">
            <IconClock /> {fmtAgo(inspection.inspected_at)}
          </span>
        </div>
        <p className="text-[#45556c] text-[12px] leading-[18px] mb-1.5">
          {inspection.issue_count} issue{inspection.issue_count !== 1 ? 's' : ''} · by {inspection.inspected_by_name}
          {inspection.notes ? ` · ${inspection.notes}` : ''}
        </p>
        <button
          onClick={() => onViewDetails(inspection.vehicle)}
          className="text-[#e7000b] text-[11px] font-bold leading-[16px] hover:underline">
          View Details
        </button>
      </div>
    </div>
  )
}

function SkeletonAlert() {
  return (
    <div className="border border-[#ffe2e2] rounded-[10px] p-3.5 flex gap-3">
      <div className="w-8 h-8 rounded-full bg-[#f1f5f9] animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 bg-[#f1f5f9] rounded animate-pulse w-3/4" />
        <div className="h-3 bg-[#f1f5f9] rounded animate-pulse w-1/2" />
      </div>
    </div>
  )
}

export default function FleetAlertsPanel({ inspections, loading }) {
  const navigate = useNavigate()

  const hasIssues = inspections.filter(i => i.has_open_issue)
  const count = loading ? '…' : hasIssues.length

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-[25px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#1d293d] font-bold text-[18px] leading-[28px]">Fleet Alerts</h3>
        {!loading && (
          <span className={`text-[12px] font-bold leading-[16px] px-2 py-1 rounded-full ${count > 0 ? 'bg-[#ffe2e2] text-[#c10007]' : 'bg-[#ecfdf5] text-[#007a55]'}`}>
            {count} {count === 1 ? 'Issue' : 'Issues'}
          </span>
        )}
      </div>

      {/* Alert list — capped at max-h so RecentActivity stays visible */}
      <div className="flex flex-col gap-3 max-h-[280px] overflow-y-auto">
        {loading ? (
          [0,1,2].map(i => <SkeletonAlert key={i} />)
        ) : hasIssues.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-[#22c55e] font-semibold text-[14px]">All clear</p>
            <p className="text-[#90a1b9] text-[12px] mt-1">No fleet issues detected</p>
          </div>
        ) : hasIssues.map(ins => (
          <AlertCard
            key={ins.id}
            inspection={ins}
            onViewDetails={vehicleId => navigate(`/admin/fleet/${vehicleId}`)}
          />
        ))}
      </div>
    </div>
  )
}
