// src/components/editjob/EditJobNotFound.jsx
import { Link } from 'react-router-dom'

export default function EditJobNotFound({ jobId }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="flex flex-col items-center gap-5 max-w-sm text-center">
        <div className="w-20 h-20 rounded-full bg-[#f8fafc] border-2 border-[#e2e8f0] flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" stroke="#e2e8f0" strokeWidth="2"/>
            <path d="M18 11v10" stroke="#cad5e2" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="18" cy="25.5" r="1.5" fill="#cad5e2"/>
          </svg>
        </div>

        <div>
          <h2 className="text-[#0f172b] font-bold text-[20px] leading-[28px]">Job not found</h2>
          <p className="text-[#62748e] text-[14px] leading-[22px] mt-2">
            {jobId
              ? <>Job&nbsp;<span className="font-['Consolas',monospace] font-bold text-[#f54900]">{jobId}</span>&nbsp;doesn't exist or may have been deleted.</>
              : 'No job ID was provided in the URL.'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link to="/admin/jobs"
            className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] transition-colors">
            ← Back to Jobs
          </Link>
          <Link to="/admin/create-job"
            className="px-4 py-[9px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold rounded-[10px] transition-colors">
            Create New Job
          </Link>
        </div>
      </div>
    </div>
  )
}
