// src/components/shared/PdfUploadZone.jsx
import { useRef, useState } from 'react'

function IconUploadCloud() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.5 14.5l3.5-3.5 3.5 3.5M10 11V17"
        stroke="#90a1b9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M16.5 14A4.5 4.5 0 0013 6h-.9A7 7 0 102.5 13"
        stroke="#90a1b9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

function IconFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2h6l3 3v9H4V2z" stroke="#f54900" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M10 2v3h3" stroke="#f54900" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6 8h4M6 10.5h3" stroke="#f54900" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export default function PdfUploadZone({ label = 'Attachments', maxSizeMB = 10 }) {
  const inputRef          = useRef(null)
  const [files, setFiles] = useState([])
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (incoming) => {
    const pdfs = Array.from(incoming).filter(f => f.type === 'application/pdf')
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...pdfs.filter(f => !names.has(f.name))]
    })
  }

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name))

  const formatSize = (bytes) => {
    if (bytes < 1024)       return `${bytes} B`
    if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-col gap-[6px]">
      {/* Label */}
      <label className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">
        {label}
      </label>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={[
          'w-full rounded-[10px] border-2 border-dashed',
          'flex flex-col items-center justify-center gap-2',
          'py-8 px-4 cursor-pointer transition-colors',
          dragOver
            ? 'border-[#f54900] bg-[#fff3ee]'
            : 'border-[#e2e8f0] bg-[#f8fafc] hover:border-[#f54900]/40 hover:bg-[#fff8f5]',
        ].join(' ')}
      >
        {/* Upload icon circle */}
        <div className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center">
          <IconUploadCloud />
        </div>

        <p className="text-[#0f172b] text-[14px] font-medium leading-[20px]">
          Click to upload PDF
        </p>
        <p className="text-[#90a1b9] text-[12px] leading-[16px]">
          PDF files up to {maxSizeMB}MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-2 mt-1">
          {files.map(file => (
            <li
              key={file.name}
              className="flex items-center justify-between gap-3 bg-white border border-[#e2e8f0] rounded-[8px] px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <IconFile />
                <span className="text-[13px] text-[#314158] truncate">{file.name}</span>
                <span className="text-[12px] text-[#90a1b9] shrink-0">{formatSize(file.size)}</span>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeFile(file.name) }}
                className="text-[#90a1b9] hover:text-[#c10007] transition-colors shrink-0"
              >
                <IconX />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
