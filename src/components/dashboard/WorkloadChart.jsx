// src/components/dashboard/WorkloadChart.jsx
// Horizontal bar chart — driven by real dashboard stats.
// Maps: completed_jobs, active_jobs (= In Progress), pending_jobs, overdue_jobs

function SkeletonBar() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[80px] h-4 bg-[#f1f5f9] rounded animate-pulse shrink-0" />
      <div className="flex-1 h-[22px] bg-[#f1f5f9] rounded animate-pulse" />
      <div className="w-6 h-4 bg-[#f1f5f9] rounded animate-pulse shrink-0" />
    </div>
  )
}

export default function WorkloadChart({ stats, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        {[0,1,2,3].map(i => <SkeletonBar key={i} />)}
      </div>
    )
  }

  const total = stats?.total_jobs || 1 // avoid divide-by-zero

  const bars = [
    { label: 'Completed',   value: stats?.completed_jobs  ?? 0, color: '#22c55e' },
    { label: 'In Progress', value: stats?.active_jobs     ?? 0, color: '#3b82f6' },
    { label: 'Pending',     value: stats?.pending_jobs    ?? 0, color: '#94a3b8' },
    { label: 'Overdue',     value: stats?.overdue_jobs    ?? 0, color: '#ef4444' },
  ]

  // Width as % of total, minimum 2% so a bar is always visible if value > 0
  const pct = (v) => v === 0 ? 0 : Math.max(2, Math.round((v / total) * 100))

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        {bars.map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-[12px] leading-[16px] text-[#64748b] font-['Inter',sans-serif] w-[80px] text-right shrink-0">
              {label}
            </span>
            <div className="flex-1 h-[22px] bg-[#f1f5f9] rounded-sm overflow-hidden relative">
              <div
                className="h-full rounded-sm transition-all duration-700 ease-out"
                style={{ width: `${pct(value)}%`, backgroundColor: color }}
              />
            </div>

            {/* Value label */}
            <span className="text-[12px] leading-[16px] text-[#64748b] w-6 text-right shrink-0">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* X-axis tick marks */}
      <div className="flex ml-[92px] mt-3 pr-8">
        {[0, 25, 50, 75, 100].map(tick => (
          <div key={tick} className="flex-1 text-center">
            <span className="text-[11px] text-[#94a3b8]">{tick}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
