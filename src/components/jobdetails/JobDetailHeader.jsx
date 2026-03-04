// src/components/jobdetails/JobDetailHeader.jsx
import { Link, useNavigate } from 'react-router-dom'

function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconPrinter() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="1" width="10" height="5" rx="1" stroke="#314158" strokeWidth="1.2"/>
      <path d="M3 6h10v6H3z" stroke="#314158" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M5 9h6M5 11h4" stroke="#314158" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M3 8H1V5h14v3h-2" stroke="#314158" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}
function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="#314158" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}
function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="#c10007" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const PRIORITY_STYLES = {
  'High Priority':   'bg-[#fff7ed] text-[#ca3500] border border-[#fed7aa]',
  'Medium Priority': 'bg-[#eff6ff] text-[#1447e6] border border-[#dbeafe]',
  'Low Priority':    'bg-[#f0fdf4] text-[#007a55] border border-[#d0fae5]',
}

const STATUS_DOT = {
  'In Progress': 'bg-[#1447e6]',
  'Pending':     'bg-[#fe9a00]',
  'Completed':   'bg-[#007a55]',
  'Overdue':     'bg-[#c10007]',
}
const STATUS_PILL = {
  'In Progress': 'bg-[#eff6ff] text-[#1447e6]',
  'Pending':     'bg-[#fff7ed] text-[#ca3500]',
  'Completed':   'bg-[#ecfdf5] text-[#007a55]',
  'Overdue':     'bg-[#fef2f2] text-[#c10007]',
}

export default function JobDetailHeader({ job }) {
  return (
    <div className="bg-white border-b border-[#e2e8f0] px-8 py-4 flex items-center justify-between gap-4 flex-wrap">

      {/* ── Left: back + job identity ── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Back button */}
        <Link
          to="/admin/jobs"
          className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158] transition-colors shrink-0"
        >
          <IconArrowLeft />
        </Link>

        {/* Job identity */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Job ID */}
            <h1 className="font-bold text-[22px] leading-[28px] text-[#0f172b] font-['Consolas',monospace] whitespace-nowrap">
              {job.id}
            </h1>

            {/* Status pill */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-[3px] rounded-full text-[13px] font-medium leading-[16px] ${STATUS_PILL[job.status]}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[job.status]}`} />
              {job.status}
            </span>

            {/* Priority pill */}
            <span className={`inline-flex items-center px-3 py-[3px] rounded-full text-[13px] font-medium leading-[16px] ${PRIORITY_STYLES[job.priority] ?? PRIORITY_STYLES['High Priority']}`}>
              {job.priority}
            </span>
          </div>

          {/* Title */}
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-0.5 truncate max-w-[500px]">
            {job.title}
          </p>
        </div>
      </div>

      {/* ── Right: actions ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Print */}
        <button className="flex items-center justify-center w-8 h-8 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors">
          <IconPrinter />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#e2e8f0]" />

        {/* Edit */}
        <Link
          to={`/admin/jobs/${job.id}/edit`}
          className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158] text-[13px] font-medium transition-colors"
        >
          <IconEdit /> Edit
        </Link>

        {/* Delete */}
        <button className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#ffe2e2] bg-[#fef2f2] hover:bg-[#ffe2e2] text-[#c10007] text-[13px] font-medium transition-colors">
          <IconTrash /> Delete
        </button>
      </div>
    </div>
  )
}