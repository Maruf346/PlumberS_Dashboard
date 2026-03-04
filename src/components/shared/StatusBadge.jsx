// src/components/shared/StatusBadge.jsx

const VARIANTS = {
  'In Progress': {
    wrapper: 'bg-[#eff6ff] border border-[#dbeafe]',
    text:    'text-[#1447e6]',
  },
  'Pending': {
    wrapper: 'bg-[#f1f5f9] border border-[#e2e8f0]',
    text:    'text-[#45556c]',
  },
  'Completed': {
    wrapper: 'bg-[#ecfdf5] border border-[#d0fae5]',
    text:    'text-[#007a55]',
  },
  'Overdue': {
    wrapper: 'bg-[#fef2f2] border border-[#ffe2e2]',
    text:    'text-[#c10007]',
  },
}

export default function StatusBadge({ status }) {
  const v = VARIANTS[status] ?? VARIANTS['Pending']
  return (
    <span className={`inline-flex items-center px-[11px] py-[5px] rounded-full text-[12px] leading-[16px] font-medium ${v.wrapper} ${v.text}`}>
      {status}
    </span>
  )
}
