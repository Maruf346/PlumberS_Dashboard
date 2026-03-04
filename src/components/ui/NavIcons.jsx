// src/components/ui/NavIcons.jsx
// Pure SVG icon components — no external dependency.
// Each renders a 20×20 viewBox to match the Figma sidebar icon slot.

export function IconDashboard({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  )
}

export function IconJobs({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M6 4a2 2 0 012-2h4a2 2 0 012 2v1h2a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h2V4zm4-1a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1zm-5 5v1h10V8H5zm0 3v1h10v-1H5zm0 3v1h6v-1H5z"
        fill="currentColor" fillRule="evenodd" clipRule="evenodd"
      />
    </svg>
  )
}

export function IconSchedule({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M7 2v4M13 2v4M2 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7" cy="13" r="1" fill="currentColor"/>
      <circle cx="10" cy="13" r="1" fill="currentColor"/>
      <circle cx="13" cy="13" r="1" fill="currentColor"/>
    </svg>
  )
}

export function IconFleet({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M2 7l2.5-4h9L16 7m0 0v6H4V7m12 0H4M7 13v2m6-2v2M1 7h18"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="6.5" cy="15.5" r="1.5" fill="currentColor"/>
      <circle cx="13.5" cy="15.5" r="1.5" fill="currentColor"/>
    </svg>
  )
}

export function IconSafety({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2L3 5v5c0 4.418 2.982 8.165 7 9 4.018-.835 7-4.582 7-9V5l-7-3z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconEmployees({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M2 18c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="15" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M15 13c1.5 0 3 .9 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

export function IconCreateManager({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M3 18c0-3 2.686-5.5 6-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="15.5" cy="15.5" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M15.5 14v3M14 15.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconReports({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 9h6M7 12h6M7 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconSettings({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path
        d="M10 2.5A.75.75 0 0110 2v0a8 8 0 00-2.83.52l-.53.22a.75.75 0 01-.96-.38l-.2-.4A.75.75 0 004.78 2h0a8 8 0 00-2 1.16.75.75 0 01-.06 1.1l.3.26a.75.75 0 010 1.06l-.3.26a.75.75 0 01.06 1.1A8 8 0 002 10h0a.75.75 0 01.72-.5h.46a.75.75 0 01.72.5 8 8 0 00.52 1.26.75.75 0 01-.14 1l-.3.22a.75.75 0 00.06 1.1A8 8 0 005.22 15a.75.75 0 001.1-.06l.22-.3a.75.75 0 011-.14A8 8 0 0010 15.28a.75.75 0 01.5.72v.46a.75.75 0 00.5.72A8 8 0 0013 17a.75.75 0 01.72-.5V17a8 8 0 00.52-1.26.75.75 0 011-.14l.22.3a.75.75 0 001.1.06 8 8 0 001.16-2 .75.75 0 00-.38-.96l-.4-.2a.75.75 0 01-.38-.96A8 8 0 0017 10a.75.75 0 01.72-.5h.46A.75.75 0 0018 9V9a8 8 0 00-.52-1.83.75.75 0 01.38-.96l.4-.2a.75.75 0 00.38-.96A8 8 0 0017.5 3.5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
    </svg>
  )
}

export function IconBell({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M8.5 17a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconSearch({ className = '' }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export function IconMenu({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconClose({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconLogout({ className = '' }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// Map icon key → component (used in sidebar)
export const NAV_ICONS = {
  dashboard:     IconDashboard,
  jobs:          IconJobs,
  schedule:      IconSchedule,
  fleet:         IconFleet,
  safety:        IconSafety,
  employees:     IconEmployees,
  createManager: IconCreateManager,
  reports:       IconReports,
  settings:      IconSettings,
}