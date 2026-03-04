// src/components/dashboard/WorkloadChart.jsx
// Horizontal bar chart — no chart library, pure CSS/SVG.

const BARS = [
  { label: 'Completed',   value: 68, color: '#22c55e', max: 100 },
  { label: 'In Progress', value: 28, color: '#3b82f6', max: 100 },
  { label: 'Pending',     value: 18, color: '#94a3b8', max: 100 },
  { label: 'Overdue',     value: 5,  color: '#ef4444', max: 100 },
]

export default function WorkloadChart() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        {BARS.map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-3">
            {/* Y-axis label */}
            <span className="text-[12px] leading-[16px] text-[#64748b] font-['Inter',sans-serif] w-[80px] text-right shrink-0">
              {label}
            </span>

            {/* Track */}
            <div className="flex-1 h-[22px] bg-[#f1f5f9] rounded-sm overflow-hidden relative">
              {/* Fill */}
              <div
                className="h-full rounded-sm transition-all duration-700 ease-out"
                style={{ width: `${value}%`, backgroundColor: color }}
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
            <span className="text-[11px] text-[#94a3b8]">{tick}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
