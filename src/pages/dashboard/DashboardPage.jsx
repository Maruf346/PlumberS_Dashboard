// src/pages/dashboard/DashboardPage.jsx — fully API integrated
// GET /api/jobs/dashboard/          → stat cards
// GET /api/jobs/                    → live job table
// GET /api/inspections/?has_issue=true → fleet alerts
// GET /api/jobs/activities/recent/  → recent activity
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { apiFetch }            from '@/utils/apiFetch'

import StatCard         from '@/components/shared/StatCard'
import WorkloadChart    from '@/components/dashboard/WorkloadChart'
import LiveJobTable     from '@/components/dashboard/LiveJobTable'
import FleetAlertsPanel from '@/components/dashboard/FleetAlertsPanel'
import RecentActivity   from '@/components/dashboard/RecentActivity'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconBriefcase() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 5a2 2 0 012-2h4a2 2 0 012 2v1H6V5z" stroke="#1447e6" strokeWidth="1.3"/><rect x="2" y="6" width="16" height="11" rx="1.5" stroke="#1447e6" strokeWidth="1.3"/><path d="M2 10h16" stroke="#1447e6" strokeWidth="1.3"/></svg>
}
function IconCalendar() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" stroke="#008236" strokeWidth="1.3"/><path d="M2 8h16M7 2v2M13 2v2" stroke="#008236" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
function IconShield() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 5.5V10c0 4.1 2.9 7.9 7 9 4.1-1.1 7-4.9 7-9V5.5L10 2z" stroke="#ca3500" strokeWidth="1.3"/><circle cx="10" cy="10" r="1" fill="#ca3500"/><path d="M10 7v2" stroke="#ca3500" strokeWidth="1.3" strokeLinecap="round"/></svg>
}
function IconTruckStat() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 6h10v9H2z" stroke="#c10007" strokeWidth="1.3" strokeLinejoin="round"/><path d="M12 9l4 2v4h-4z" stroke="#c10007" strokeWidth="1.3" strokeLinejoin="round"/><circle cx="5" cy="15.5" r="1.5" fill="#c10007"/><circle cx="14" cy="15.5" r="1.5" fill="#c10007"/></svg>
}
function IconOverdue() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 17H2L10 2Z" stroke="#c10007" strokeWidth="1.3" strokeLinejoin="round"/><path d="M10 8v4" stroke="#c10007" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10" cy="14.5" r="0.8" fill="#c10007"/></svg>
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats,      setStats]      = useState(null)
  const [jobs,       setJobs]       = useState([])
  const [inspections, setInspections] = useState([])
  const [activity,   setActivity]   = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch('jobs/dashboard/'),
      apiFetch('jobs/?page_size=10'),
      apiFetch('inspections/?has_issue=true&page_size=5'),
      apiFetch('jobs/activities/recent/'),
    ]).then(([s, j, ins, act]) => {
      if (s.ok   && s.data)   setStats(s.data)
      if (j.ok   && j.data)   setJobs(j.data.results ?? [])
      if (ins.ok && ins.data) setInspections(ins.data.results ?? [])
      if (act.ok && act.data) setActivity(Array.isArray(act.data) ? act.data : act.data.results ?? [])
      setLoading(false)
    })
  }, [])

  // Build stat card data from API response
  const statCards = [
    {
      label: 'Total Jobs',
      value: stats?.total_jobs       ?? '—',
      badge: stats ? `${stats.pending_jobs} pending` : null,
      badgeVariant: 'blue',
      icon: <IconBriefcase />,
    },
    {
      label: 'Jobs Today',
      value: stats?.jobs_today       ?? '—',
      badge: stats?.jobs_today > 0 ? 'Today' : 'None',
      badgeVariant: 'green',
      icon: <IconCalendar />,
    },
    {
      label: 'Pending Safety',
      value: stats?.pending_safety_forms ?? '—',
      badge: stats?.pending_safety_forms > 0 ? 'Action Req' : 'Clear',
      badgeVariant: stats?.pending_safety_forms > 0 ? 'orange' : 'green',
      icon: <IconShield />,
    },
    {
      label: 'Fleet Issues',
      value: stats?.fleet_issues     ?? '—',
      badge: stats?.fleet_issues > 0 ? 'Critical' : 'Clear',
      badgeVariant: stats?.fleet_issues > 0 ? 'red' : 'green',
      icon: <IconTruckStat />,
    },
    {
      label: 'Overdue',
      value: stats?.overdue_jobs     ?? '—',
      badge: stats?.overdue_jobs > 0 ? 'Overdue' : 'On Track',
      badgeVariant: stats?.overdue_jobs > 0 ? 'red' : 'green',
      icon: <IconOverdue />,
    },
  ]

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1600px]">

      {/* ── Row 1: Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(stat => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* ── Row 2: Main content ── */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* Left column */}
        <div className="flex flex-col gap-6 flex-1 min-w-0 w-full">

          {/* Workload Overview chart */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] pt-[25px] px-[25px] pb-[30px]">
            <h3 className="text-[#1d293d] font-bold text-[18px] leading-[28px] mb-5">
              Workload Overview
            </h3>
            <WorkloadChart stats={stats} loading={loading} />
          </div>

          {/* Live Job Status table */}
          <LiveJobTable jobs={jobs} loading={loading} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6 w-full xl:w-[388px] shrink-0">
          <FleetAlertsPanel inspections={inspections} loading={loading} />
          <RecentActivity   activity={activity}       loading={loading} />
        </div>
      </div>
    </div>
  )
}
