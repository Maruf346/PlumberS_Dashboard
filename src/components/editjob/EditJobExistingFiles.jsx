// src/components/editjob/EditJobExistingFiles.jsx
import { useState } from 'react'

function IconFilePdf() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
      <path d="M2 1.5h8.5l3.5 3.5V18a.5.5 0 01-.5.5H2A.5.5 0 011.5 18V2A.5.5 0 012 1.5z"
        stroke="#f54900" strokeWidth="1.1" strokeLinejoin="round" fill="#fff3ee"/>
      <path d="M10.5 1.5v3.5H14" stroke="#f54900" strokeWidth="1.1" strokeLinejoin="round"/>
      <text x="3" y="14.5" fontSize="4" fontFamily="monospace" fill="#f54900" fontWeight="bold">PDF</text>
    </svg>
  )
}
function IconDownloadSm() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v7.5M4.5 7l2.5 2.5L9.5 7" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1.5 11v.5A1.5 1.5 0 003 13h8a1.5 1.5 0 001.5-1.5V11" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconTrashSm() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 3.5h11M4.5 3.5V2h5v1.5M5 6v5M9 6v5M2.5 3.5l.9 8.5h7.2l.9-8.5"
        stroke="#c10007" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const FILES_BY_JOB = {
  'JB-1024': [
    { id: 'f1', name: 'Safety_Assessment_JB1024.pdf',   size: '1.2 MB', date: 'Oct 20, 2023' },
    { id: 'f2', name: 'Site_Access_Permit_Apex.pdf',    size: '842 KB', date: 'Oct 21, 2023' },
    { id: 'f3', name: 'Insurance_Certificate_2023.pdf', size: '2.1 MB', date: 'Oct 20, 2023' },
  ],
  'JB-1025': [
    { id: 'f4', name: 'CityCenter_Site_Brief.pdf',      size: '680 KB', date: 'Oct 21, 2023' },
  ],
  'JB-1022': [
    { id: 'f5', name: 'Harbor_Safety_Permit.pdf',       size: '1.5 MB', date: 'Oct 17, 2023' },
    { id: 'f6', name: 'Hazmat_Clearance_Harbor.pdf',    size: '990 KB', date: 'Oct 17, 2023' },
  ],
}

export default function EditJobExistingFiles({ jobId }) {
  const initial = FILES_BY_JOB[jobId] ?? []
  const [files, setFiles] = useState(initial)

  if (!files.length) return null

  return (
    <div className="flex flex-col gap-2 mb-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#62748e] uppercase tracking-[0.6px] leading-[16px]">
          Existing files
        </p>
        <span className="text-[11px] text-[#90a1b9]">{files.length} file{files.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {files.map(f => (
          <div
            key={f.id}
            className="flex items-center justify-between gap-3 bg-white border border-[#e2e8f0] rounded-[8px] px-3 py-2.5 hover:border-[#cad5e2] transition-colors group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="shrink-0"><IconFilePdf /></div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#314158] truncate leading-[18px]">{f.name}</p>
                <p className="text-[11px] text-[#90a1b9] leading-[14px] mt-0.5">
                  {f.size}&nbsp;·&nbsp;Uploaded {f.date}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" title="Download"
                className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] hover:bg-[#f1f5f9] transition-colors">
                <IconDownloadSm />
              </button>
              <button type="button" title="Remove"
                onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}
                className="flex items-center justify-center w-[28px] h-[28px] rounded-[6px] hover:bg-[#fef2f2] transition-colors">
                <IconTrashSm />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
