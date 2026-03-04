// src/components/shared/SafetyBadge.jsx

export function IconCheckCircle({ className = '' }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#009966" strokeWidth="1.2"/>
      <path d="M5 8l2 2 4-4" stroke="#009966" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconAlertTriangle({ className = '' }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L1.5 13.5h13L8 2z" stroke="#fe9a00" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M8 6v3.5" stroke="#fe9a00" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r="0.5" fill="#fe9a00"/>
    </svg>
  )
}

export default function SafetyBadge({ status }) {
  if (status === 'Passed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] leading-[16px] text-[#009966]">
        <IconCheckCircle />
        Passed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] leading-[16px] text-[#fe9a00]">
      <IconAlertTriangle />
      Pending
    </span>
  )
}
