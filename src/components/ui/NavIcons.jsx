// src/components/ui/NavIcons.jsx
// Pure SVG icon set — 20×20 viewBox matching Figma sidebar icon slot.
// ─────────────────────────────────────────────────────────────────────────────

export function IconDashboard({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2"  y="2"  width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="11" y="2"  width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="2"  y="11" width="7" height="7" rx="1.5" fill="currentColor"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor"/>
    </svg>
  )
}

export function IconJobs({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 4a2 2 0 012-2h4a2 2 0 012 2v1h2a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1h2V4zm4-1a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1zm-5 5v1h10V8H5zm0 3v1h10v-1H5zm0 3v1h6v-1H5z"
        fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
    </svg>
  )
}

export function IconSchedule({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 2v4M13 2v4M2 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7"  cy="13" r="1" fill="currentColor"/>
      <circle cx="10" cy="13" r="1" fill="currentColor"/>
      <circle cx="13" cy="13" r="1" fill="currentColor"/>
    </svg>
  )
}

export function IconFleet({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 8.5l2.5-4h9l2.5 4m0 0v5H4v-5m12 0H4M1 8.5h18"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6.5"  cy="14.5" r="1.5" fill="currentColor"/>
      <circle cx="13.5" cy="14.5" r="1.5" fill="currentColor"/>
    </svg>
  )
}

export function IconSafety({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L3 5v5c0 4.418 2.982 8.165 7 9 4.018-.835 7-4.582 7-9V5l-7-3z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconEmployees({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 18c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="15" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M15 13c1.5 0 3 .9 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconManagers({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 18c0-3.5 3.134-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13.5 3.5l1 1-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    </svg>
  )
}

export function IconStaff({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1 18c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14.5" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14.5 13c2.761 0 5 1.79 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconReports({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M7 9h6M7 12h6M7 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconSettings({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.1 4.1l1.06 1.06M14.84 14.84l1.06 1.06M15.9 4.1l-1.06 1.06M5.16 14.84l-1.06 1.06"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function IconBell({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function IconChevronLeft({ className = '' }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}


export function IconClients({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8" cy="10" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 17c0-1.657 1.343-3 3-3s3 1.343 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M13 9h3M13 12h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6 5V3.5A1.5 1.5 0 017.5 2h5A1.5 1.5 0 0114 3.5V5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  )
}

// ── NAV_ICONS map — icon key → component ─────────────────────────────────────
export const NAV_ICONS = {
  dashboard:  IconDashboard,
  jobs:       IconJobs,
  schedule:   IconSchedule,
  fleet:      IconFleet,
  safety:     IconSafety,
  employees:  IconEmployees,
  managers:   IconManagers,
  staff:      IconStaff,
  clients:    IconClients,
  reports:    IconReports,
  settings:   IconSettings,
}