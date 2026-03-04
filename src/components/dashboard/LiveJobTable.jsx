// src/components/dashboard/LiveJobTable.jsx
import { Link } from 'react-router-dom'
import StatusBadge from '@/components/shared/StatusBadge'
import SafetyBadge from '@/components/shared/SafetyBadge'

// ── Dots menu icon ──
function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="3"  cy="8" r="1.2" fill="#94a3b8"/>
      <circle cx="8"  cy="8" r="1.2" fill="#94a3b8"/>
      <circle cx="13" cy="8" r="1.2" fill="#94a3b8"/>
    </svg>
  )
}

// ── Arrow icon for "View All" ──
function IconArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4.5 11.5l7-7M5 4.5h6.5V11" stroke="#155dfc" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Avatar initial badge ──
function Avatar({ initial }) {
  return (
    <div className="w-6 h-6 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
      <span className="text-[12px] font-bold text-[#45556c] leading-none">{initial}</span>
    </div>
  )
}

// ── Table data ──
const JOBS = [
  { id: 'JB-1024', client: 'Apex Industries',       assignee: 'Mike Ross',    initial: 'M', vehicle: 'Van-04',   status: 'In Progress', safety: 'Passed'  },
  { id: 'JB-1025', client: 'City Center Mall',      assignee: 'Sarah Lee',    initial: 'S', vehicle: 'Truck-02', status: 'Pending',     safety: 'Pending' },
  { id: 'JB-1023', client: 'Westside Apartments',   assignee: 'John Doe',     initial: 'J', vehicle: 'Van-01',   status: 'Completed',   safety: 'Passed'  },
  { id: 'JB-1022', client: 'Harbor Warehouse',      assignee: 'David Kim',    initial: 'D', vehicle: 'Truck-05', status: 'Overdue',     safety: 'Passed'  },
  { id: 'JB-1026', client: 'Tech Park',             assignee: 'Emily Chen',   initial: 'E', vehicle: 'Van-07',   status: 'In Progress', safety: 'Passed'  },
]

export default function LiveJobTable() {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between px-6 h-[77px] border-b border-[#f1f5f9]">
        <h3 className="text-[#1d293d] font-bold text-[18px] leading-[28px]">Live Job Status</h3>
        <Link
          to="/admin/jobs"
          className="flex items-center gap-1 text-[#155dfc] text-[14px] leading-[20px] hover:opacity-80 transition-opacity"
        >
          View All <IconArrowUpRight />
        </Link>
      </div>

      {/* ── Scrollable table wrapper ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#62748e] leading-[20px] whitespace-nowrap">Job ID</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#62748e] leading-[20px]">Client</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#62748e] leading-[20px]">Assigned To</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#62748e] leading-[20px]">Vehicle</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#62748e] leading-[20px]">Status</th>
              <th className="px-6 py-4 text-left text-[14px] font-bold text-[#62748e] leading-[20px]">Safety</th>
              <th className="px-6 py-4 text-right text-[14px] font-bold text-[#62748e] leading-[20px]">Action</th>
            </tr>
          </thead>

          <tbody>
            {JOBS.map((job, idx) => (
              <tr
                key={job.id}
                className={`border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#fafafa] transition-colors ${idx === JOBS.length - 1 ? '' : ''}`}
              >
                {/* Job ID */}
                <td className="px-6 py-[14.5px]">
                  <span className="text-[#0f172b] text-[14px] leading-[20px] font-['Consolas',monospace]">
                    {job.id}
                  </span>
                </td>

                {/* Client */}
                <td className="px-6 py-[14.5px]">
                  <span className="text-[#45556c] text-[14px] leading-[20px]">{job.client}</span>
                </td>

                {/* Assigned To */}
                <td className="px-6 py-[14.5px]">
                  <div className="flex items-center gap-2">
                    <Avatar initial={job.initial} />
                    <span className="text-[#314158] text-[14px] leading-[20px]">{job.assignee}</span>
                  </div>
                </td>

                {/* Vehicle */}
                <td className="px-6 py-[14.5px]">
                  <span className="text-[#45556c] text-[12px] leading-[16px] font-['Consolas',monospace]">
                    {job.vehicle}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-[14.5px]">
                  <StatusBadge status={job.status} />
                </td>

                {/* Safety */}
                <td className="px-6 py-[14.5px]">
                  <SafetyBadge status={job.safety} />
                </td>

                {/* Action */}
                <td className="px-6 py-[14.5px] text-right">
                  <button className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[#f1f5f9] transition-colors">
                    <IconDots />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
