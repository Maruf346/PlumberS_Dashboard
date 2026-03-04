// src/pages/dashboard/DashboardPage.jsx
// Figma frame 1:3 — Dashboard
// ─────────────────────────────────────────────────────────────────────────────

import StatCard         from '@/components/shared/StatCard'
import WorkloadChart    from '@/components/dashboard/WorkloadChart'
import LiveJobTable     from '@/components/dashboard/LiveJobTable'
import FleetAlertsPanel from '@/components/dashboard/FleetAlertsPanel'
import RecentActivity   from '@/components/dashboard/RecentActivity'

// ─── Stat card icons ──────────────────────────────────────────────────────────

function IconBriefcase() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 5a2 2 0 012-2h4a2 2 0 012 2v1H6V5z" stroke="#1447e6" strokeWidth="1.3"/>
      <rect x="2" y="6" width="16" height="11" rx="1.5" stroke="#1447e6" strokeWidth="1.3"/>
      <path d="M2 10h16" stroke="#1447e6" strokeWidth="1.3"/>
    </svg>
  )
}

function IconCheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="#008236" strokeWidth="1.3"/>
      <path d="M6.5 10l2.5 2.5 5-5" stroke="#008236" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L3 5.5V10c0 4.1 2.9 7.9 7 9 4.1-1.1 7-4.9 7-9V5.5L10 2z" stroke="#ca3500" strokeWidth="1.3"/>
      <circle cx="10" cy="10" r="1" fill="#ca3500"/>
      <path d="M10 7v2" stroke="#ca3500" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

function IconTruckStat() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 6h10v9H2z" stroke="#c10007" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M12 9l4 2v4h-4z" stroke="#c10007" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="5"  cy="15.5" r="1.5" fill="#c10007"/>
      <circle cx="14" cy="15.5" r="1.5" fill="#c10007"/>
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="8"    cy="6.5" r="3"   stroke="#1447e6" strokeWidth="1.3"/>
      <path d="M2 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#1447e6" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="14.5" cy="7.5" r="2"   stroke="#1447e6" strokeWidth="1.3"/>
      <path d="M14.5 13c2 0 3.5 1.3 3.5 3.5"             stroke="#1447e6" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Stats data ───────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Active Jobs',     value: 12, badge: '+2',         badgeVariant: 'blue',   icon: <IconBriefcase /> },
  { label: 'Jobs Today',      value: 5,  badge: 'On Track',   badgeVariant: 'green',  icon: <IconCheckCircle /> },
  { label: 'Pending Safety',  value: 3,  badge: 'Action Req', badgeVariant: 'orange', icon: <IconShield /> },
  { label: 'Fleet Issues',    value: 2,  badge: 'Critical',   badgeVariant: 'red',    icon: <IconTruckStat /> },
  { label: 'On Duty',         value: 8,  badge: 'Full Staff',  badgeVariant: 'blue',  icon: <IconUsers /> },
]

// ─────────────────────────────────────────────────────────────────────────────
// DashboardPage
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  /*
   * placeholder axios calls — implement in Phase 3+:
   *
   * useEffect(() => {
   *   // GET /api/dashboard/stats
   *   api.get('/dashboard/stats').then(res => setStats(res.data))
   *   // GET /api/dashboard/jobs/live
   *   api.get('/dashboard/jobs/live').then(res => setJobs(res.data))
   *   // GET /api/fleet/alerts
   *   api.get('/fleet/alerts').then(res => setAlerts(res.data))
   *   // GET /api/dashboard/activity
   *   api.get('/dashboard/activity').then(res => setActivity(res.data))
   * }, [])
   */

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1600px]">

      {/* ── Row 1: Stats cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATS.map(stat => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* ── Row 2: Left column + Right panel ──────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* Left column */}
        <div className="flex flex-col gap-6 flex-1 min-w-0 w-full">

          {/* Workload Overview */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] pt-[25px] px-[25px] pb-[30px]">
            <h3 className="text-[#1d293d] font-bold text-[18px] leading-[28px] mb-5">
              Workload Overview
            </h3>
            <WorkloadChart />
          </div>

          {/* Live Job Status */}
          <LiveJobTable />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 w-full xl:w-[388px] shrink-0">
          <FleetAlertsPanel />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
