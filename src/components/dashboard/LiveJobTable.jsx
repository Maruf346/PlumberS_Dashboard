// src/components/dashboard/LiveJobTable.jsx — real API data
// Columns: Job ID, Client, Assigned To, Vehicle, Status, Safety
// Click row → /admin/jobs/:id   |   View All → /admin/jobs

import { useNavigate, Link } from 'react-router-dom'
import StatusBadge           from '@/components/shared/StatusBadge'

function IconArrowUpRight() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4.5 11.5l7-7M5 4.5h6.5V11" stroke="#155dfc" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

function Avatar({ name }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  return (
    <div className="w-6 h-6 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
      <span className="text-[11px] font-bold text-[#45556c] leading-none">{initials}</span>
    </div>
  )
}

// Safety badge based on safety_form_count
function SafetyChip({ count }) {
  if (count === 0) return (
    <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-semibold bg-[#f1f5f9] text-[#62748e]">No Forms</span>
  )
  return (
    <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#007a55]">{count} Form{count > 1 ? 's' : ''}</span>
  )
}

// Skeleton row
function SkeletonRow() {
  return (
    <tr className="border-b border-[#f1f5f9]">
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-6 py-[14.5px]">
          <div className="h-4 bg-[#f1f5f9] rounded animate-pulse" style={{ width: i === 1 ? '60px' : i === 2 ? '100px' : '80px' }} />
        </td>
      ))}
    </tr>
  )
}

export default function LiveJobTable({ jobs, loading }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-6 h-[68px] border-b border-[#f1f5f9]">
        <h3 className="text-[#1d293d] font-bold text-[18px] leading-[28px]">Live Job Status</h3>
        <Link to="/admin/jobs"
          className="flex items-center gap-1 text-[#155dfc] text-[14px] leading-[20px] hover:opacity-80 transition-opacity">
          View All <IconArrowUpRight />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              {['Job ID', 'Client', 'Assigned To', 'Vehicle', 'Status', 'Safety'].map(col => (
                <th key={col} className="px-6 py-3 text-left text-[13px] font-bold text-[#62748e] leading-[20px] whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [0,1,2,3,4].map(i => <SkeletonRow key={i} />)
            ) : jobs.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-[#90a1b9] text-[14px]">No jobs found.</td></tr>
            ) : jobs.map(job => (
              <tr key={job.id}
                onClick={() => navigate(`/admin/jobs/${job.id}`)}
                className="border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer">

                <td className="px-6 py-[14px]">
                  <span className="text-[#0f172b] text-[13px] font-bold font-['Consolas',monospace]">{job.job_id}</span>
                </td>

                <td className="px-6 py-[14px]">
                  <div>
                    <p className="text-[#45556c] text-[13px] leading-[18px] font-medium">{job.client_name}</p>
                    {job.client_address && (
                      <p className="text-[#90a1b9] text-[11px] leading-[15px] mt-0.5 truncate max-w-[140px]">{job.client_address}</p>
                    )}
                  </div>
                </td>

                <td className="px-6 py-[14px]">
                  {job.assigned_to ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={job.assigned_to.full_name} />
                      <span className="text-[#314158] text-[13px]">{job.assigned_to.full_name}</span>
                    </div>
                  ) : <span className="text-[#90a1b9] text-[13px] italic">Unassigned</span>}
                </td>

                <td className="px-6 py-[14px]">
                  <span className="text-[#45556c] text-[12px] font-['Consolas',monospace]">
                    {job.vehicle_name ?? '—'}
                  </span>
                </td>

                <td className="px-6 py-[14px]">
                  <StatusBadge status={job.status} />
                </td>

                <td className="px-6 py-[14px]">
                  <SafetyChip count={job.safety_form_count ?? 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
