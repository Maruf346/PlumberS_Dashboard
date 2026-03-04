// src/pages/jobs/JobsPage.jsx
// Figma frame 1:506 — Jobs
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { Link }              from 'react-router-dom'

import PageHeader       from '@/components/shared/PageHeader'
import JobsFilterBar    from '@/components/jobs/JobsFilterBar'
import JobsTable        from '@/components/jobs/JobsTable'
import TablePagination  from '@/components/shared/TablePagination'

import { JOBS_MOCK, RESULTS_PER_PAGE } from '@/data/jobsMockData'

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// JobsPage
// ─────────────────────────────────────────────────────────────────────────────

export default function JobsPage() {

  // ── Local state ─────────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage,  setCurrentPage]  = useState(1)

  // ── Derived: filtered + paginated jobs ──────────────────────────────────────
  const filteredJobs = useMemo(() => {
    // TODO: Replace with real API call
    // const fetchJobs = async () => {
    //   const res = await axios.get('/api/jobs', {
    //     params: { search, status: statusFilter, page: currentPage }
    //   });
    //   setJobs(res.data.jobs);
    //   setTotal(res.data.total);
    // };

    return JOBS_MOCK.filter(job => {
      const matchSearch = search.trim() === '' || [
        job.id, job.client, job.assignee, job.vehicle,
      ].some(field => field.toLowerCase().includes(search.toLowerCase()))

      const matchStatus = statusFilter === '' || job.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / RESULTS_PER_PAGE))

  const handleSearchChange = (val) => { setSearch(val);       setCurrentPage(1) }
  const handleStatusChange = (val) => { setStatusFilter(val); setCurrentPage(1) }

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE,
  )

  // ── Status summary counts ─────────────────────────────────────────────────
  const counts = useMemo(() => ({
    all:        JOBS_MOCK.length,
    inProgress: JOBS_MOCK.filter(j => j.status === 'In Progress').length,
    pending:    JOBS_MOCK.filter(j => j.status === 'Pending').length,
    completed:  JOBS_MOCK.filter(j => j.status === 'Completed').length,
    overdue:    JOBS_MOCK.filter(j => j.status === 'Overdue').length,
  }), [])

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1600px]">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <PageHeader
        title="Jobs"
        subtitle="Manage and track all plumbing job assignments"
      >
        <Link
          to="/admin/create-job"
          className={[
            'inline-flex items-center gap-2',
            'bg-[#f54900] hover:bg-[#c73b00] active:bg-[#a83200]',
            'text-white text-[14px] font-semibold leading-[20px]',
            'px-4 py-[9px] rounded-[10px]',
            'transition-colors shadow-[0px_1px_3px_0px_rgba(245,73,0,0.3)]',
            'whitespace-nowrap',
          ].join(' ')}
        >
          <IconPlus />
          Create New Job
        </Link>
      </PageHeader>

      {/* ── Status summary tabs ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: 'All Jobs',    value: '',            count: counts.all        },
          { label: 'In Progress', value: 'In Progress', count: counts.inProgress },
          { label: 'Pending',     value: 'Pending',     count: counts.pending    },
          { label: 'Completed',   value: 'Completed',   count: counts.completed  },
          { label: 'Overdue',     value: 'Overdue',     count: counts.overdue    },
        ].map(tab => {
          const isActive = statusFilter === tab.value
          return (
            <button
              key={tab.label}
              onClick={() => handleStatusChange(tab.value)}
              className={[
                'flex items-center gap-2 px-3 py-1.5 rounded-[8px]',
                'text-[13px] leading-[20px] font-medium transition-colors',
                isActive
                  ? 'bg-[#0f172b] text-white'
                  : 'bg-white border border-[#e2e8f0] text-[#62748e] hover:bg-[#f8fafc]',
              ].join(' ')}
            >
              {tab.label}
              <span className={[
                'inline-flex items-center justify-center rounded-full min-w-[20px] h-5 px-1.5',
                'text-[11px] font-bold leading-none',
                isActive ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#62748e]',
              ].join(' ')}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Table card ──────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-b border-[#f1f5f9]">
          <div>
            <h2 className="text-[#1d293d] font-bold text-[16px] leading-[24px]">All Jobs</h2>
            <p className="text-[#90a1b9] text-[13px] leading-[20px] mt-0.5">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <JobsFilterBar
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* ── Table ── */}
        <JobsTable jobs={paginatedJobs} />

        {/* ── Pagination ── */}
        {filteredJobs.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={filteredJobs.length}
            resultsPerPage={RESULTS_PER_PAGE}
            onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
            onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          />
        )}
      </div>
    </div>
  )
}
