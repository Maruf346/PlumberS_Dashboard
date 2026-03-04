// src/components/jobdetails/FilesPhotosTab.jsx
import { Link, useParams } from 'react-router-dom'

function IconUpload() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M10 22l6-6 6 6M16 16v10" stroke="#cad5e2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M27 22.7A7 7 0 0021 10h-1.1A11 11 0 104 21" stroke="#cad5e2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function FilesPhotosTab() {
  const { jobId } = useParams()

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <IconUpload />
      <div className="text-center">
        <p className="text-[#0f172b] font-semibold text-[16px] leading-[24px]">Files & Photos</p>
        <p className="text-[#90a1b9] text-[14px] leading-[20px] mt-1">
          Upload and manage files, photos, and documents for this job.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <button className="px-4 py-[9px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold rounded-[10px] transition-colors">
          Upload Files
        </button>
        <Link
          to={`/admin/jobs/${jobId}/files`}
          className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-medium rounded-[10px] hover:bg-[#f8fafc] transition-colors"
        >
          View All Files
        </Link>
      </div>
    </div>
  )
}
