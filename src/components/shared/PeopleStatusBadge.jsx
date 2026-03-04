// src/components/shared/PeopleStatusBadge.jsx
// Active / Inactive status pill for the People Management module.

const VARIANTS = {
  Active: {
    pill: 'bg-[#ecfdf5] border border-[#d0fae5] text-[#007a55]',
    dot:  'bg-[#007a55]',
  },
  Inactive: {
    pill: 'bg-[#f8fafc] border border-[#e2e8f0] text-[#62748e]',
    dot:  'bg-[#90a1b9]',
  },
}

export default function PeopleStatusBadge({ status }) {
  const v = VARIANTS[status] ?? VARIANTS['Inactive']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-[4px] rounded-full text-[12px] font-medium leading-[16px] whitespace-nowrap ${v.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.dot}`} />
      {status}
    </span>
  )
}
