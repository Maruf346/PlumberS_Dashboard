// src/pages/jobs/JobsPage.jsx
// Figma frame 1:506 — Jobs Management
// URL params: ?search=&status=&manager=&date=&page=1&size=10
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useCallback, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import StatusBadge from '@/components/shared/StatusBadge'
import SafetyBadge from '@/components/shared/SafetyBadge'
import PriorityBadge from '@/components/shared/PriorityBadge'
import PageHeader from '@/components/shared/PageHeader'
import EnhancedTablePagination from '@/components/shared/EnhancedTablePagination'

import JobsListFilters from '@/components/jobs/JobsListFilters'
import JobsActionMenu from '@/components/jobs/JobsActionMenu'
import JobsEmptyState from '@/components/jobs/JobsEmptyState'
import CreateJobPage from '@/pages/createjob/CreateJobPage'

import { JOBS_FULL, MANAGERS, PAGE_SIZES, DEFAULT_PAGE_SIZE } from '@/data/jobsFullMock'

// ─── Inline icons ─────────────────────────────────────────────────────────────
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v8M5 7l3 3 3-3" stroke="#314158" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 11v1.5A1.5 1.5 0 003.5 14h9a1.5 1.5 0 001.5-1.5V11" stroke="#314158" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="0.8" y="1.8" width="11.4" height="10.4" rx="1.4" stroke="#90a1b9" strokeWidth="1.1" />
      <path d="M4.3 0.8v2M8.7 0.8v2M0.8 5h11.4" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}
function IconUser() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="4" r="2" stroke="#90a1b9" strokeWidth="1" />
      <path d="M1.5 11c0-2.5 2.015-4 4.5-4s4.5 1.5 4.5 4" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
function IconTruck() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 4h7v6H1z" stroke="#90a1b9" strokeWidth="1" strokeLinejoin="round" />
      <path d="M8 6l3 1.5V10H8z" stroke="#90a1b9" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="3.5" cy="10.5" r="1" fill="#90a1b9" />
      <circle cx="9.5" cy="10.5" r="1" fill="#90a1b9" />
    </svg>
  )
}
function Avatar({ initials }) {
  return (
    <div className="w-6 h-6 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0 font-bold text-[11px] text-[#45556c] leading-none select-none">
      {initials}
    </div>
  )
}

// ─── Status tabs ──────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Overdue', value: 'Overdue' },
]

// ─────────────────────────────────────────────────────────────────────────────
// JobsPage
// ─────────────────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // ── Read URL params ────────────────────────────────────────────────────────
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const manager = searchParams.get('manager') ?? ''
  const dateFilter = searchParams.get('date') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize = PAGE_SIZES.includes(Number(searchParams.get('size')))
    ? Number(searchParams.get('size'))
    : DEFAULT_PAGE_SIZE

  // ── URL param helpers ─────────────────────────────────────────────────────
  const setParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value); else next.delete(key)
      next.set('page', '1')
      return next
    })
  }, [setSearchParams])

  const setPage = useCallback((p) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
  }, [setSearchParams])

  const setSize = useCallback((s) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('size', String(s))
      next.set('page', '1')
      return next
    })
  }, [setSearchParams])

  const clearFilters = useCallback(() => setSearchParams({}), [setSearchParams])

  const hasActiveFilters = !!(search || status || manager || dateFilter)

  // ── Filtered jobs ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    // TODO: Replace with real API fetch
    // const fetchJobs = async () => {
    //   const res = await axios.get('/api/jobs', {
    //     params: { search, status, manager, date: dateFilter, page, size: pageSize }
    //   });
    //   setJobs(res.data.jobs);
    //   setTotal(res.data.total);
    // };

    return JOBS_FULL.filter(job => {
      if (search && ![job.id, job.client, job.address, job.staff, job.manager]
        .some(f => f.toLowerCase().includes(search.toLowerCase()))) return false
      if (status && job.status !== status) return false
      if (manager && job.manager !== manager) return false
      return true
    })
  }, [search, status, manager, dateFilter])

  // ── Tab counts ─────────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    const base = manager ? JOBS_FULL.filter(j => j.manager === manager) : JOBS_FULL
    return STATUS_TABS.reduce((acc, t) => {
      acc[t.value] = t.value ? base.filter(j => j.status === t.value).length : base.length
      return acc
    }, {})
  }, [manager])

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    /* Outer wrapper — relative so the drawer can be absolutely positioned */
    <div className="relative min-h-full">

      {/* ── Backdrop — darkens jobs list when drawer is open ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#0f172b]/40 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Create Job drawer — slides in from right over the page ── */}
      <div
        className={[
          'fixed top-0 right-0 z-40 h-screen',
          'transition-transform duration-300 ease-in-out',
          drawerOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <CreateJobPage
          onClose={() => setDrawerOpen(false)}
        />
      </div>

      {/* ── Page content ── */}
      <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px]">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <PageHeader title="Jobs Management" subtitle="Monitor and control active assignments">
          <button className="flex items-center gap-2 h-[38px] px-4 rounded-[10px] border border-[#e2e8f0] bg-white text-[#314158] text-[14px] font-medium hover:bg-[#f8fafc] transition-colors">
            <IconDownload /> Export
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.3)] whitespace-nowrap"
          >
            <IconPlus /> Create New Job
          </button>
        </PageHeader>

        {/* ── Status tabs ────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_TABS.map(tab => {
            const active = status === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setParam('status', tab.value)}
                className={[
                  'flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-[#0f172b] text-white'
                    : 'bg-white border border-[#e2e8f0] text-[#62748e] hover:bg-[#f8fafc]',
                ].join(' ')}
              >
                {tab.label}
                <span className={`inline-flex items-center justify-center rounded-full min-w-[20px] h-5 px-1.5 text-[11px] font-bold leading-none ${active ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#62748e]'}`}>
                  {tabCounts[tab.value]}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Table card ──────────────────────────────────────────────── */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">

          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-6 py-4 border-b border-[#f1f5f9]">
            <div className="shrink-0">
              <h2 className="text-[#1d293d] font-bold text-[16px] leading-[24px]">All Jobs</h2>
              <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5">
                {filtered.length} job{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <JobsListFilters
              search={search} onSearchChange={v => setParam('search', v)}
              status={status} onStatusChange={v => setParam('status', v)}
              manager={manager} onManagerChange={v => setParam('manager', v)}
              dateFilter={dateFilter} onDateChange={v => setParam('date', v)}
              managerOptions={MANAGERS}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="px-5 py-[13px] w-10">
                    <input type="checkbox" className="w-[13px] h-[13px] rounded border-[#cad5e2] accent-[#f54900] cursor-pointer" readOnly />
                  </th>
                  {['Job ID', 'Client Details', 'Schedule', 'Manager', 'Staff', 'Vehicle', 'Status', 'Safety', 'Priority', 'Created', ''].map((col, i) => (
                    <th key={i} className={`px-4 py-[13px] text-[13px] font-bold text-[#62748e] leading-[20px] whitespace-nowrap ${i === 10 ? 'text-right' : 'text-left'}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginated.length === 0 ? (
                  <JobsEmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
                ) : paginated.map(job => (
                  <tr
                    key={job.id}
                    onClick={() => navigate(`/admin/jobs/${job.id}`)}
                    className="border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer group"
                  >
                    {/* Checkbox */}
                    <td className="px-5 py-[15px]" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="w-[13px] h-[13px] rounded border-[#cad5e2] accent-[#f54900] cursor-pointer" />
                    </td>

                    {/* Job ID */}
                    <td className="px-4 py-[15px] whitespace-nowrap">
                      <span className="font-['Consolas',monospace] font-bold text-[13px] text-[#f54900]">{job.id}</span>
                    </td>

                    {/* Client + address */}
                    <td className="px-4 py-[15px]">
                      <p className="text-[#0f172b] text-[14px] font-medium leading-[20px] whitespace-nowrap">{job.client}</p>
                      <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5 whitespace-nowrap">{job.address}</p>
                    </td>

                    {/* Schedule */}
                    <td className="px-4 py-[15px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <IconCalendar />
                        <span className="text-[#45556c] text-[13px]">{job.schedule}</span>
                      </div>
                    </td>

                    {/* Manager */}
                    <td className="px-4 py-[15px]">
                      <div className="flex items-center gap-1.5">
                        <IconUser />
                        <span className="text-[#314158] text-[13px] whitespace-nowrap">{job.manager}</span>
                      </div>
                    </td>

                    {/* Staff */}
                    <td className="px-4 py-[15px]">
                      <div className="flex items-center gap-2">
                        <Avatar initials={job.staffInit} />
                        <span className="text-[#314158] text-[13px] whitespace-nowrap">{job.staff}</span>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="px-4 py-[15px] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <IconTruck />
                        <span className="font-['Consolas',monospace] text-[12px] text-[#45556c] bg-[#f1f5f9] px-2 py-0.5 rounded-[5px]">
                          {job.vehicle}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-[15px]"><StatusBadge status={job.status} /></td>

                    {/* Safety */}
                    <td className="px-4 py-[15px]"><SafetyBadge status={job.safety} /></td>

                    {/* Priority */}
                    <td className="px-4 py-[15px]"><PriorityBadge priority={job.priority} /></td>

                    {/* Created */}
                    <td className="px-4 py-[15px] whitespace-nowrap">
                      <span className="text-[#62748e] text-[12px]">{job.created}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-[15px] text-right" onClick={e => e.stopPropagation()}>
                      <JobsActionMenu jobId={job.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <EnhancedTablePagination
              currentPage={safePage}
              totalPages={totalPages}
              totalResults={filtered.length}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZES}
              onPageChange={setPage}
              onPageSizeChange={setSize}
            />
          )}
        </div>
      </div>
    </div>
  )
}