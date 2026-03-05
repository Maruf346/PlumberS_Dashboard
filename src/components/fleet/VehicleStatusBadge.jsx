// src/components/fleet/VehicleStatusBadge.jsx
// Status pills matching the Figma Fleet design exactly.
// Healthy  → circle-check icon, green pill
// Others   → triangle-alert icon, orange or red pill
// Also exports VehicleActiveBadge for the is_active field.
// ─────────────────────────────────────────────────────────────────────────────

function IconCheckCircle() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4 6.5l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconAlertTriangle() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1.5L11.5 10.5H1.5L6.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6.5 5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="6.5" cy="9" r="0.5" fill="currentColor"/>
    </svg>
  )
}

// ── Health status badge (Figma-matched) ───────────────────────────────────────
const VARIANTS = {
  healthy: {
    pill:  'bg-[#ecfdf5] text-[#007a55]',
    Icon:  IconCheckCircle,
    label: 'Healthy',
  },
  issue_reported: {
    pill:  'bg-[#fef2f2] text-[#c10007]',
    Icon:  IconAlertTriangle,
    label: 'Issue Reported',
  },
  inspection_due: {
    pill:  'bg-[#fff7ed] text-[#c73b00]',
    Icon:  IconAlertTriangle,
    label: 'Inspection Due',
  },
  service_overdue: {
    pill:  'bg-[#fef2f2] text-[#c10007]',
    Icon:  IconAlertTriangle,
    label: 'Service Overdue',
  },
}

export default function VehicleStatusBadge({ status }) {
  const v = VARIANTS[status] ?? VARIANTS['healthy']
  const { Icon } = v
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-[5px] rounded-full text-[12px] font-medium leading-[16px] whitespace-nowrap ${v.pill}`}>
      <Icon />
      {v.label}
    </span>
  )
}

// ── Active / Inactive badge (is_active field) ─────────────────────────────────
export function VehicleActiveBadge({ isActive }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-[4px] rounded-full text-[12px] font-medium leading-[16px] bg-[#ecfdf5] border border-[#d0fae5] text-[#007a55] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#007a55] shrink-0" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-[4px] rounded-full text-[12px] font-medium leading-[16px] bg-[#f8fafc] border border-[#e2e8f0] text-[#62748e] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#90a1b9] shrink-0" />
      Inactive
    </span>
  )
}