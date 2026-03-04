// src/components/jobs/JobsTable.jsx
import { Link } from 'react-router-dom'
import StatusBadge from '@/components/shared/StatusBadge'

// ── Icons ────────────────────────────────────────────────────────────────────

function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="3"  cy="8" r="1.2" fill="#94a3b8"/>
      <circle cx="8"  cy="8" r="1.2" fill="#94a3b8"/>
      <circle cx="13" cy="8" r="1.2" fill="#94a3b8"/>
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="#90a1b9" strokeWidth="1.1"/>
      <path d="M5 1v3M9 1v3M1 6h12" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  )
}

// ── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initial }) {
  return (
    <div className="w-7 h-7 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
      <span className="text-[12px] font-bold text-[#45556c] leading-none select-none">
        {initial}
      </span>
    </div>
  )
}

// ── Table header cell ─────────────────────────────────────────────────────────

function Th({ children, align = 'left' }) {
  return (
    <th
      className={[
        'px-6 py-4 text-[13px] font-bold text-[#62748e] leading-[20px] whitespace-nowrap bg-[#f8fafc]',
        align === 'right' ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      {children}
    </th>
  )
}

// ── JobsTable ─────────────────────────────────────────────────────────────────

export default function JobsTable({ jobs }) {
  if (!jobs.length) {
    return (
      <div className="flex items-center justify-center py-20 text-[#90a1b9] text-[14px]">
        No jobs found matching your search.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px]">

        {/* ── Head ── */}
        <thead>
          <tr className="border-b border-[#e2e8f0]">
            <Th>Job ID</Th>
            <Th>Client</Th>
            <Th>Schedule</Th>
            <Th>Assigned To</Th>
            <Th>Vehicle</Th>
            <Th>Status</Th>
            <Th align="right">Action</Th>
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {jobs.map((job, idx) => (
            <tr
              key={job.id}
              className={[
                'border-b border-[#f1f5f9] last:border-b-0',
                'hover:bg-[#fafafa] transition-colors group',
              ].join(' ')}
            >
              {/* Job ID */}
              <td className="px-6 py-[18px] whitespace-nowrap">
                <Link
                  to={`/admin/jobs/${job.id}`}
                  className="font-['Consolas',monospace] font-bold text-[13px] leading-[20px] text-[#f54900] hover:underline"
                >
                  {job.id}
                </Link>
              </td>

              {/* Client + address stacked */}
              <td className="px-6 py-[18px]">
                <p className="text-[#0f172b] text-[14px] leading-[20px] font-medium whitespace-nowrap">
                  {job.client}
                </p>
                <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5 whitespace-nowrap">
                  {job.address}
                </p>
              </td>

              {/* Schedule */}
              <td className="px-6 py-[18px] whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <IconCalendar />
                  <span className="text-[#45556c] text-[13px] leading-[20px]">
                    {job.schedule}
                  </span>
                </div>
              </td>

              {/* Assigned To */}
              <td className="px-6 py-[18px]">
                <div className="flex items-center gap-2">
                  <Avatar initial={job.initial} />
                  <span className="text-[#314158] text-[14px] leading-[20px] whitespace-nowrap">
                    {job.assignee}
                  </span>
                </div>
              </td>

              {/* Vehicle */}
              <td className="px-6 py-[18px] whitespace-nowrap">
                <span className="font-['Consolas',monospace] text-[12px] leading-[16px] text-[#45556c] bg-[#f1f5f9] px-2 py-1 rounded-[6px]">
                  {job.vehicle}
                </span>
              </td>

              {/* Status */}
              <td className="px-6 py-[18px]">
                <StatusBadge status={job.status} />
              </td>

              {/* Action */}
              <td className="px-6 py-[18px] text-right">
                <button className="inline-flex items-center justify-center w-7 h-7 rounded-[6px] hover:bg-[#f1f5f9] transition-colors opacity-0 group-hover:opacity-100">
                  <IconDots />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
