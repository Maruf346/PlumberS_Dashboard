// src/components/jobdetails/ReportsTab.jsx
// Lists reports for a job, click to view submitted report, download PDF
// GET /api/jobs/{job_id}/reports/
// GET /api/reports/{job_report_id}/submission/
// GET /api/reports/{job_report_id}/download/
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { apiFetch }            from '@/utils/apiFetch'

function IconClipboard() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="12" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5.5 3V2h5v1" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 8h6M5 11h4" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconClose()     { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconDownload()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v7.5M4.5 7l2.5 2.5L9.5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M1.5 11v.5A1.5 1.5 0 003 13h8a1.5 1.5 0 001.5-1.5V11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconChevron()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconCalendar()  { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M4 1v2M9 1v2M1 5h11" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }

function fmtDt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}


// ── Report Submission Modal ───────────────────────────────────────────────────
function ReportModal({ report, onClose }) {
  const [detail,  setDetail]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!report.is_submitted) { setLoading(false); return }
    apiFetch(`reports/${report.job_report_id}/submission/`).then(({ data, ok }) => {
      if (ok && data) setDetail(data)
      setLoading(false)
    })
  }, [report.job_report_id, report.is_submitted])

  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const token = sessionStorage.getItem('access')
      const base  = (import.meta.env.VITE_API_BASE_URL ?? '/api/').replace(/\/$/, '')
      const url   = `${base}/reports/${report.job_report_id}/download/`

      const res = await fetch(url, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })

      if (!res.ok) { setDownloading(false); return }

      // Read response as blob (binary PDF data)
      const blob = await res.blob()

      // Try to get filename from Content-Disposition header, fall back to a sensible default
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename[^;=\n]*=["']?([^"';\n]+)/)
      const filename = match?.[1]?.trim() || `report-${report.job_report_id}.pdf`

      // Create a temporary object URL and trigger browser download
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href     = objectUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(objectUrl)
    } catch (_) {
      // Silent fail — user will see nothing happened, which is acceptable
    }
    setDownloading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[560px] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.25)] overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] shrink-0">
          <div>
            <h3 className="text-[#0f172b] font-bold text-[17px]">{report.report_type_display}</h3>
            <div className="flex items-center gap-2 mt-1">
              {report.is_submitted
                ? <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-[#007a55]">Submitted</span>
                : <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#fff7ed] text-[#ca3500]">Pending</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {report.is_submitted && (
              <button onClick={handleDownload} disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#e2e8f0] text-[#314158] text-[13px] font-medium hover:bg-[#f8fafc] transition-colors disabled:opacity-60">
                {downloading
                  ? <><div className="w-3 h-3 rounded-full border-2 border-[#314158]/30 border-t-[#314158] animate-spin"/>Downloading…</>
                  : <><IconDownload /> Download PDF</>}
              </button>
            )}
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc]"><IconClose /></button>
          </div>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!report.is_submitted ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <IconClipboard />
              <p className="text-[#62748e] text-[14px] text-center">This report has not been submitted yet by the assigned employee.</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/></div>
          ) : !detail ? (
            <p className="text-center text-[#90a1b9] py-8">Could not load report data.</p>
          ) : (
            <div className="flex flex-col gap-5">

              {/* Meta */}
              <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px]">Submitted By</p>
                  <p className="text-[14px] font-medium text-[#0f172b] mt-1">{detail.submitted_by ?? detail.data?.submitted_by_name ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px]">Submitted At</p>
                  <div className="flex items-center gap-1.5 mt-1"><IconCalendar /><span className="text-[13px] text-[#0f172b]">{fmtDt(report.submitted_at)}</span></div>
                </div>
              </div>

              {/* Report data fields */}
              {detail.data && typeof detail.data === 'object' && (() => {
                const d = detail.data
                // Collect simple string/number fields (skip nested objects/arrays except photos)
                const simpleEntries = Object.entries(d).filter(([k, v]) =>
                  k !== 'photos' && k !== 'snapshot' && k !== 'id' &&
                  k !== 'submitted_by' && k !== 'created_at' &&
                  (typeof v === 'string' || typeof v === 'number') && v !== ''
                )
                // Photos
                const photos = d.photos && typeof d.photos === 'object' ? d.photos : null
                // Snapshot fields (site info)
                const snapshot = d.snapshot && typeof d.snapshot === 'object' ? d.snapshot : null

                return (
                  <div className="flex flex-col gap-4">
                    {/* Simple report fields */}
                    {simpleEntries.length > 0 && (
                      <div>
                        <h4 className="text-[#0f172b] font-bold text-[14px] mb-3">Report Details</h4>
                        <div className="flex flex-col gap-2">
                          {simpleEntries.map(([k, v]) => (
                            <div key={k} className="flex items-start gap-3 py-2 border-b border-[#f1f5f9] last:border-b-0">
                              <p className="text-[12px] font-semibold text-[#90a1b9] uppercase tracking-[0.4px] w-[140px] shrink-0 pt-0.5">{k.replace(/_/g, ' ')}</p>
                              <p className="text-[13px] text-[#0f172b]">{String(v)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Site snapshot */}
                    {snapshot && (
                      <div>
                        <h4 className="text-[#0f172b] font-bold text-[14px] mb-2">Site Information</h4>
                        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-3 flex flex-col gap-1.5">
                          {Object.entries(snapshot)
                            .filter(([, v]) => v && String(v).trim() !== '')
                            .map(([k, v]) => (
                              <div key={k} className="flex items-start gap-2">
                                <span className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.4px] w-[120px] shrink-0 pt-0.5">{k.replace(/_/g, ' ')}</span>
                                <span className="text-[12px] text-[#45556c]">{String(v)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Photos */}
                    {photos && Object.keys(photos).length > 0 && (
                      <div>
                        <h4 className="text-[#0f172b] font-bold text-[14px] mb-2">Photos</h4>
                        <div className="flex flex-col gap-3">
                          {Object.entries(photos).map(([category, photoList]) => (
                            Array.isArray(photoList) && photoList.length > 0 && (
                              <div key={category}>
                                <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.4px] mb-2">{category.replace(/_/g, ' ')}</p>
                                <div className="flex flex-wrap gap-2">
                                  {photoList.map(photo => (
                                    <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer"
                                      className="block w-[100px] h-[80px] rounded-[8px] overflow-hidden border border-[#e2e8f0] hover:border-[#f54900]/50 transition-colors">
                                      <img src={photo.url} alt={category} className="w-full h-full object-cover" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ReportsTab ────────────────────────────────────────────────────────────────
export default function ReportsTab({ job }) {
  const [reports,     setReports]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeReport, setActiveReport] = useState(null)

  useEffect(() => {
    // Use reports embedded in the job detail response directly.
    // job.reports contains the correct job_report_id field from GET /api/jobs/{id}/
    // The separate /api/jobs/{id}/reports/ endpoint can return differently-shaped objects
    // (missing job_report_id), so we skip it and use the embedded data.
    setReports(job.reports ?? [])
    setLoading(false)
  }, [job.id, job.reports])

  return (
    <>
      {activeReport && <ReportModal report={activeReport} onClose={() => setActiveReport(null)} />}

      <div className="flex flex-col gap-4">
        <h4 className="text-[#0f172b] font-bold text-[14px]">
          Job Reports {!loading && `(${reports.length})`}
        </h4>

        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/></div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-[#e2e8f0] rounded-[10px]">
            <p className="text-[#90a1b9] text-[14px]">No reports have been assigned to this job.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {reports.map(report => (
              <button key={report.job_report_id} onClick={() => setActiveReport(report)}
                className="flex items-center justify-between gap-3 p-4 bg-white border border-[#e2e8f0] rounded-[10px] hover:border-[#cad5e2] hover:bg-[#fafafa] transition-colors text-left w-full group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center shrink-0">
                    <IconClipboard />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#0f172b] font-semibold text-[14px] truncate">{report.report_type_display}</p>
                    {report.is_submitted && report.submitted_at && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <IconCalendar />
                        <span className="text-[12px] text-[#62748e]">Submitted {fmtDt(report.submitted_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {report.is_submitted
                    ? <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#007a55]">Submitted</span>
                    : <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#fff7ed] text-[#ca3500]">Pending</span>}
                  <div className="text-[#90a1b9] group-hover:text-[#314158] transition-colors"><IconChevron /></div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
