// src/components/shared/PriorityBadge.jsx

const VARIANTS = {
  High:   { pill: 'bg-[#fef2f2] border border-[#ffe2e2] text-[#c10007]', dot: 'bg-[#c10007]' },
  high:   { pill: 'bg-[#fef2f2] border border-[#ffe2e2] text-[#c10007]', dot: 'bg-[#c10007]' },
  Medium: { pill: 'bg-[#fff7ed] border border-[#fed7aa] text-[#ca3500]', dot: 'bg-[#ca3500]' },
  medium: { pill: 'bg-[#fff7ed] border border-[#fed7aa] text-[#ca3500]', dot: 'bg-[#ca3500]' },
  Low:    { pill: 'bg-[#f0fdf4] border border-[#d0fae5] text-[#007a55]', dot: 'bg-[#007a55]' },
  low:    { pill: 'bg-[#f0fdf4] border border-[#d0fae5] text-[#007a55]', dot: 'bg-[#007a55]' },
}

export default function PriorityBadge({ priority }) {
  const v = VARIANTS[priority] ?? VARIANTS['Medium']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[12px] font-medium leading-[16px] whitespace-nowrap ${v.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot}`} />
      {priority}
    </span>
  )
}
