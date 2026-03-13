// src/components/jobdetails/JobDetailHeader.jsx — real API job data

import { Link }   from 'react-router-dom'

function IconArrowLeft() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconPrinter()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="1" width="10" height="5" rx="1" stroke="#314158" strokeWidth="1.2"/><path d="M3 6h10v6H3z" stroke="#314158" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 9h6M5 11h4" stroke="#314158" strokeWidth="1.2" strokeLinecap="round"/><path d="M3 8H1V5h14v3h-2" stroke="#314158" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconEdit()      { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-9 9H2v-3l9-9z" stroke="#314158" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconTrash()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="#c10007" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }

const STATUS_DOT = {
  'pending':     'bg-[#fe9a00]',
  'in_progress': 'bg-[#1447e6]',
  'completed':   'bg-[#007a55]',
  'overdue':     'bg-[#c10007]',
}
const STATUS_PILL = {
  'pending':     'bg-[#fff7ed] text-[#ca3500]',
  'in_progress': 'bg-[#eff6ff] text-[#1447e6]',
  'completed':   'bg-[#ecfdf5] text-[#007a55]',
  'overdue':     'bg-[#fef2f2] text-[#c10007]',
}
const STATUS_LABEL = {
  'pending':     'Pending',
  'in_progress': 'In Progress',
  'completed':   'Completed',
  'overdue':     'Overdue',
}
const PRIORITY_STYLES = {
  'low':      'bg-[#f0fdf4] text-[#007a55] border border-[#d0fae5]',
  'medium':   'bg-[#eff6ff] text-[#1447e6] border border-[#dbeafe]',
  'high':     'bg-[#fff7ed] text-[#ca3500] border border-[#fed7aa]',
  'critical': 'bg-[#fef2f2] text-[#c10007] border border-[#ffe2e2]',
}
const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }

export default function JobDetailHeader({ job, onDelete }) {
  if (!job) return null

  return (
    <div className="bg-white border-b border-[#e2e8f0] px-8 py-4 flex items-center justify-between gap-4 flex-wrap">

      {/* Left: back + identity */}
      <div className="flex items-center gap-3 min-w-0">
        <Link to="/admin/jobs"
          className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158] transition-colors shrink-0">
          <IconArrowLeft />
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bold text-[22px] leading-[28px] text-[#0f172b] font-['Consolas',monospace] whitespace-nowrap">{job.job_id}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-[3px] rounded-full text-[13px] font-medium ${STATUS_PILL[job.status] ?? 'bg-[#f1f5f9] text-[#62748e]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[job.status] ?? 'bg-[#cad5e2]'}`} />
              {STATUS_LABEL[job.status] ?? job.status}
            </span>
            {job.priority && (
              <span className={`inline-flex items-center px-3 py-[3px] rounded-full text-[13px] font-medium ${PRIORITY_STYLES[job.priority] ?? PRIORITY_STYLES['low']}`}>
                {PRIORITY_LABEL[job.priority] ?? job.priority} Priority
              </span>
            )}
          </div>
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-0.5 truncate max-w-[500px]">{job.job_name}</p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="flex items-center justify-center w-8 h-8 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] transition-colors">
          <IconPrinter />
        </button>
        <div className="w-px h-6 bg-[#e2e8f0]" />
        <Link to={`/admin/jobs/${job.id}/edit`}
          className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158] text-[13px] font-medium transition-colors">
          <IconEdit /> Edit
        </Link>
        <button onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#ffe2e2] bg-[#fef2f2] hover:bg-[#ffe2e2] text-[#c10007] text-[13px] font-medium transition-colors">
          <IconTrash /> Delete
        </button>
      </div>
    </div>
  )
}