// src/pages/jobs/JobsPage.jsx
// Jobs Management — fully API integrated
// GET /api/jobs/dashboard/  → stat cards
// GET /api/jobs/            → table (server-side filter + pagination)
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams }              from 'react-router-dom'

import StatusBadge             from '@/components/shared/StatusBadge'
import PriorityBadge           from '@/components/shared/PriorityBadge'
import PageHeader              from '@/components/shared/PageHeader'
import EnhancedTablePagination from '@/components/shared/EnhancedTablePagination'
import JobsListFilters         from '@/components/jobs/JobsListFilters'
import JobsActionMenu          from '@/components/jobs/JobsActionMenu'
import JobsEmptyState          from '@/components/jobs/JobsEmptyState'
import CreateJobPage           from '@/pages/createjob/CreateJobPage'
import DeleteJobModal          from '@/components/editjob/DeleteJobModal'
import { apiFetch }            from '@/utils/apiFetch'

import { PAGE_SIZES, DEFAULT_PAGE_SIZE } from '@/data/jobsFullMock'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconPlus()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg> }
function IconCalendar() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="0.8" y="1.8" width="11.4" height="10.4" rx="1.4" stroke="#90a1b9" strokeWidth="1.1"/><path d="M4.3 0.8v2M8.7 0.8v2M0.8 5h11.4" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconUser()     { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="2" stroke="#90a1b9" strokeWidth="1"/><path d="M1.5 11c0-2.5 2.015-4 4.5-4s4.5 1.5 4.5 4" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/></svg> }
function IconTruck()    { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 4h7v6H1z" stroke="#90a1b9" strokeWidth="1" strokeLinejoin="round"/><path d="M8 6l3 1.5V10H8z" stroke="#90a1b9" strokeWidth="1" strokeLinejoin="round"/><circle cx="3.5" cy="10.5" r="1" fill="#90a1b9"/><circle cx="9.5" cy="10.5" r="1" fill="#90a1b9"/></svg> }
function IconBriefcase(){ return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 5V3.5A1.5 1.5 0 017.5 2h3A1.5 1.5 0 0112 3.5V5" stroke="currentColor" strokeWidth="1.3"/></svg> }
function IconCheck()    { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3"/><path d="M5.5 9l2.5 2.5L12.5 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconAlert()    { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L16.5 15H1.5L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 7v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="9" cy="12.5" r=".6" fill="currentColor"/></svg> }

function Avatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() ?? '??'
  return <div className="w-6 h-6 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0 font-bold text-[11px] text-[#45556c]">{initials}</div>
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="flex-1 bg-white border border-[#e2e8f0] rounded-[12px] px-5 py-4 flex items-center gap-4 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] min-w-[140px]">
      <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center shrink-0 ${iconBg}`} style={{ color: iconColor }}>
        <Icon />
      </div>
      <div>
        <p className="text-[#62748e] text-[12px] leading-[16px]">{label}</p>
        <p className="text-[#0f172b] font-bold text-[24px] leading-[32px] mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  )
}

// ── Status tabs (values match API) ────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'All',         value: '' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Pending',     value: 'pending' },
  { label: 'Completed',   value: 'completed' },
  { label: 'Overdue',     value: 'overdue' },
]

// ── Manager filter options (fetched from API) ─────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─────────────────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ── URL params ─────────────────────────────────────────────────────────────
  const search   = searchParams.get('search')  ?? ''
  const status   = searchParams.get('status')  ?? ''
  const manager  = searchParams.get('manager') ?? ''
  const dateFilter = searchParams.get('date')  ?? ''
  const page     = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize = PAGE_SIZES.includes(Number(searchParams.get('size')))
                     ? Number(searchParams.get('size')) : DEFAULT_PAGE_SIZE

  const setParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value); else next.delete(key)
      next.set('page', '1')
      return next
    })
  }, [setSearchParams])

  const setPage = useCallback((p) => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n }), [setSearchParams])
  const setSize = useCallback((s) => setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('size', String(s)); n.set('page', '1'); return n }), [setSearchParams])
  const clearFilters = useCallback(() => setSearchParams({}), [setSearchParams])
  const hasActiveFilters = !!(search || status || manager || dateFilter)

  // ── Data state ─────────────────────────────────────────────────────────────
  const [jobs,         setJobs]         = useState([])
  const [totalCount,   setTotalCount]   = useState(0)
  const [dashStats,    setDashStats]    = useState(null)
  const [managers,     setManagers]     = useState([])
  const [loading,      setLoading]      = useState(true)

  // ── Tab counts from dashboard ──────────────────────────────────────────────
  const tabCounts = {
    '':            dashStats?.total_jobs      ?? 0,
    'in_progress': dashStats?.active_jobs     ?? 0,
    'pending':     dashStats?.pending_jobs    ?? 0,
    'completed':   dashStats?.completed_jobs  ?? 0,
    'overdue':     dashStats?.overdue_jobs    ?? 0,
  }

  // ── Fetch dashboard stats ──────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const { data, ok } = await apiFetch('jobs/dashboard/')
    if (ok && data) setDashStats(data)
  }, [])

  // ── Fetch manager list for filter ─────────────────────────────────────────
  useEffect(() => {
    apiFetch('user/admin/managerlist/').then(({ data, ok }) => {
      if (ok && data) setManagers((data.results ?? []).map(m => ({ value: m.id, label: m.full_name })))
    })
    fetchStats()
  }, [fetchStats])

  // ── Fetch jobs ─────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (search)     params.set('search',      search)
    if (status)     params.set('status',      status)
    if (manager)    params.set('assigned_to', manager)
    if (dateFilter) params.set('date',        dateFilter)
    const { data, ok } = await apiFetch(`jobs/?${params}`)
    if (ok && data) {
      setJobs(data.results ?? [])
      setTotalCount(data.count ?? 0)
    }
    setLoading(false)
  }, [search, status, manager, dateFilter, page, pageSize])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { ok } = await apiFetch(`jobs/${deleteTarget.id}/update/`, { method: 'DELETE' })
    if (ok) { setDeleteTarget(null); fetchJobs(); fetchStats() }
    setDeleting(false)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-full">

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteJobModal
          jobId={deleteTarget.job_id}
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Create drawer backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 bg-[#0f172b]/40 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      )}

      {/* Create drawer */}
      <div className={['fixed top-0 right-0 z-40 h-screen transition-transform duration-300 ease-in-out', drawerOpen ? 'translate-x-0' : 'translate-x-full'].join(' ')}>
        <CreateJobPage onClose={() => setDrawerOpen(false)} onSaved={() => { setDrawerOpen(false); fetchJobs(); fetchStats() }} />
      </div>

      <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px]">

        {/* Header */}
        <PageHeader title="Jobs Management" subtitle="Monitor and control active assignments">
          <button onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.3)] whitespace-nowrap">
            <IconPlus /> Create New Job
          </button>
        </PageHeader>

        {/* Stat cards */}
        <div className="flex gap-3 flex-wrap">
          <StatCard icon={IconBriefcase} iconBg="bg-[#f0f4ff]" iconColor="#1447e6" label="Total Jobs"      value={dashStats?.total_jobs} />
          <StatCard icon={IconCheck}     iconBg="bg-[#ecfdf5]" iconColor="#007a55" label="Completed"       value={dashStats?.completed_jobs} />
          <StatCard icon={IconAlert}     iconBg="bg-[#fef2f2]" iconColor="#c10007" label="Overdue"         value={dashStats?.overdue_jobs} />
          <StatCard icon={IconCalendar}  iconBg="bg-[#fff7ed]" iconColor="#c73b00" label="Pending"         value={dashStats?.pending_jobs} />
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_TABS.map(tab => {
            const active = status === tab.value
            return (
              <button key={tab.value} onClick={() => setParam('status', tab.value)}
                className={['flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors',
                  active ? 'bg-[#0f172b] text-white' : 'bg-white border border-[#e2e8f0] text-[#62748e] hover:bg-[#f8fafc]'].join(' ')}>
                {tab.label}
                <span className={`inline-flex items-center justify-center rounded-full min-w-[20px] h-5 px-1.5 text-[11px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#62748e]'}`}>
                  {tabCounts[tab.value] ?? 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* Table card */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-6 py-4 border-b border-[#f1f5f9]">
            <div className="shrink-0">
              <h2 className="text-[#1d293d] font-bold text-[16px] leading-[24px]">All Jobs</h2>
              <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5">{totalCount} job{totalCount !== 1 ? 's' : ''} found</p>
            </div>
            <JobsListFilters
              search={search}       onSearchChange={v => setParam('search', v)}
              status={status}       onStatusChange={v => setParam('status', v)}
              manager={manager}     onManagerChange={v => setParam('manager', v)}
              dateFilter={dateFilter} onDateChange={v => setParam('date', v)}
              managerOptions={managers}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  {['Job ID', 'Client Details', 'Schedule', 'Assigned To', 'Vehicle', 'Status', 'Priority', 'Created', ''].map((col, i) => (
                    <th key={i} className={`px-4 py-[13px] text-[13px] font-bold text-[#62748e] leading-[20px] whitespace-nowrap ${i === 8 ? 'text-right' : 'text-left'}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="py-16 text-center">
                    <div className="flex justify-center"><div className="w-7 h-7 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/></div>
                  </td></tr>
                ) : jobs.length === 0 ? (
                  <JobsEmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
                ) : jobs.map(job => (
                  <tr key={job.id} onClick={() => navigate(`/admin/jobs/${job.id}`)}
                    className="border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer group">

                    <td className="px-4 py-[15px] whitespace-nowrap">
                      <span className="font-['Consolas',monospace] font-bold text-[13px] text-[#f54900]">{job.job_id}</span>
                    </td>

                    <td className="px-4 py-[15px]">
                      <p className="text-[#0f172b] text-[14px] font-medium leading-[20px] whitespace-nowrap">{job.client_name}</p>
                      <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5 max-w-[200px] truncate">{job.client_address}</p>
                    </td>

                    <td className="px-4 py-[15px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <IconCalendar />
                        <span className="text-[#45556c] text-[13px]">
                          {job.scheduled_datetime ? fmtDate(job.scheduled_datetime) : <span className="text-[#90a1b9] italic">Unscheduled</span>}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-[15px]">
                      {job.assigned_to ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={job.assigned_to.full_name} />
                          <span className="text-[#314158] text-[13px] whitespace-nowrap">{job.assigned_to.full_name}</span>
                        </div>
                      ) : <span className="text-[#90a1b9] text-[13px] italic">Unassigned</span>}
                    </td>

                    <td className="px-4 py-[15px] whitespace-nowrap">
                      {job.has_fleet_issue ? (
                        <span className="flex items-center gap-1.5 text-[#c10007] text-[12px]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L11 10H1L6 1Z" stroke="#c10007" strokeWidth="1.1" strokeLinejoin="round"/><path d="M6 4.5v2.5" stroke="#c10007" strokeWidth="1.1" strokeLinecap="round"/></svg>
                          Fleet Issue
                        </span>
                      ) : <span className="text-[#90a1b9] text-[13px]">—</span>}
                    </td>

                    <td className="px-4 py-[15px]"><StatusBadge status={job.status} /></td>
                    <td className="px-4 py-[15px]"><PriorityBadge priority={job.priority} /></td>

                    <td className="px-4 py-[15px] whitespace-nowrap">
                      <span className="text-[#62748e] text-[12px]">{fmtDate(job.created_at)}</span>
                    </td>

                    <td className="px-4 py-[15px] text-right" onClick={e => e.stopPropagation()}>
                      <JobsActionMenu jobId={job.id} onDelete={() => setDeleteTarget(job)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalCount > 0 && (
            <EnhancedTablePagination
              currentPage={page} totalPages={totalPages} totalResults={totalCount}
              pageSize={pageSize} pageSizeOptions={PAGE_SIZES}
              onPageChange={setPage} onPageSizeChange={setSize}
            />
          )}
        </div>
      </div>
    </div>
  )
}