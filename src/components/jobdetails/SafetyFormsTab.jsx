// src/components/jobdetails/SafetyFormsTab.jsx
// Lists safety forms for the job, click to view submission detail modal
// GET /api/safety-forms/admin/job/{job_id}/submissions/
// GET /api/safety-forms/submission/{submission_id}/
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { apiFetch }            from '@/utils/apiFetch'

function IconShield()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V4L8 1.5z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconClose()   { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconChevron() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconUser()    { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2" stroke="#62748e" strokeWidth="1.1"/><path d="M1.5 12c0-2.5 2.239-4 5-4s5 1.5 5 4" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconCalendar(){ return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M4 1v2M9 1v2M1 5h11" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }

function fmtDt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Submission Detail Modal ───────────────────────────────────────────────────
function SubmissionModal({ submissionId, onClose }) {
  const [detail,  setDetail]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch(`safety-forms/submission/${submissionId}/`).then(({ data, ok }) => {
      if (ok && data) setDetail(data)
      setLoading(false)
    })
  }, [submissionId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[560px] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.25)] overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] shrink-0">
          <div>
            <h3 className="text-[#0f172b] font-bold text-[17px]">Safety Form Submission</h3>
            {detail && <p className="text-[#62748e] text-[13px] mt-0.5">{detail.template_name}</p>}
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc]"><IconClose /></button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/></div>
          ) : !detail ? (
            <p className="text-center text-[#90a1b9] py-8">Could not load submission.</p>
          ) : (
            <div className="flex flex-col gap-5">

              {/* Meta row */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px]">
                <div>
                  <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px]">Submitted By</p>
                  <div className="flex items-center gap-1.5 mt-1"><IconUser /><span className="text-[14px] font-medium text-[#0f172b]">{detail.employee_name}</span></div>
                  <p className="text-[12px] text-[#62748e] mt-0.5">{detail.employee_email}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px]">Submitted At</p>
                  <div className="flex items-center gap-1.5 mt-1"><IconCalendar /><span className="text-[13px] text-[#0f172b]">{fmtDt(detail.submitted_at)}</span></div>
                </div>
              </div>

              {/* Responses */}
              <div>
                <h4 className="text-[#0f172b] font-bold text-[14px] mb-3">Responses</h4>
                <div className="flex flex-col gap-3">
                  {(detail.responses ?? [])
                    .sort((a, b) => a.field_order - b.field_order)
                    .map(r => (
                      <div key={r.id} className="flex flex-col gap-1">
                        <p className="text-[12px] font-semibold text-[#62748e] uppercase tracking-[0.4px]">{r.field_label}</p>
                        {r.file ? (
                          <a href={r.file} target="_blank" rel="noopener noreferrer"
                            className="text-[#155dfc] text-[14px] underline break-all">View uploaded file</a>
                        ) : (
                          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] px-3 py-2.5">
                            <p className="text-[14px] text-[#0f172b]">{r.value || <span className="text-[#90a1b9] italic">No response</span>}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SafetyFormsTab ────────────────────────────────────────────────────────────
export default function SafetyFormsTab({ job }) {
  const [submissions,  setSubmissions]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [activeModal,  setActiveModal]  = useState(null)

  useEffect(() => {
    apiFetch(`safety-forms/admin/job/${job.id}/submissions/`).then(({ data, ok }) => {
      if (ok && data) setSubmissions(data.results ?? data ?? [])
      setLoading(false)
    })
  }, [job.id])

  // Safety forms assigned to job (from job detail)
  const assignedForms = job.safety_forms ?? []

  return (
    <>
      {activeModal && <SubmissionModal submissionId={activeModal} onClose={() => setActiveModal(null)} />}

      <div className="flex flex-col gap-6">

        {/* Assigned safety forms */}
        <div>
          <h4 className="text-[#0f172b] font-bold text-[14px] mb-3">Assigned Safety Forms</h4>
          {assignedForms.length === 0 ? (
            <p className="text-[#90a1b9] text-[14px]">No safety forms assigned to this job.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {assignedForms.map(form => {
                const subs = submissions.filter(s => s.template === form.id)
                return (
                  <div key={form.id} className="flex items-center justify-between gap-3 p-4 bg-white border border-[#e2e8f0] rounded-[10px]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-[8px] bg-[#f0f4ff] flex items-center justify-center shrink-0"><IconShield /></div>
                      <div className="min-w-0">
                        <p className="text-[#0f172b] font-semibold text-[14px] leading-[20px] truncate">{form.name}</p>
                        <p className="text-[#62748e] text-[12px] leading-[16px] mt-0.5">{form.field_count} fields · {subs.length} submission{subs.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    {subs.length > 0 ? (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#007a55] whitespace-nowrap">Submitted</span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#fff7ed] text-[#ca3500] whitespace-nowrap">Pending</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Submitted responses */}
        <div>
          <h4 className="text-[#0f172b] font-bold text-[14px] mb-3">
            Submissions {loading ? '' : `(${submissions.length})`}
          </h4>

          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/></div>
          ) : submissions.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-[#e2e8f0] rounded-[10px]">
              <p className="text-[#90a1b9] text-[14px]">No submissions yet for this job.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {submissions.map(sub => (
                <button key={sub.id} onClick={() => setActiveModal(sub.id)}
                  className="flex items-center justify-between gap-3 p-4 bg-white border border-[#e2e8f0] rounded-[10px] hover:border-[#cad5e2] hover:bg-[#fafafa] transition-colors text-left w-full group">
                  <div className="min-w-0">
                    <p className="text-[#0f172b] font-semibold text-[14px] truncate">{sub.template_name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-[12px] text-[#62748e]"><IconUser />{sub.employee_name}</span>
                      <span className="flex items-center gap-1 text-[12px] text-[#62748e]"><IconCalendar />{fmtDt(sub.submitted_at)}</span>
                      <span className="text-[12px] text-[#62748e]">{sub.response_count} responses</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-[#90a1b9] group-hover:text-[#314158] transition-colors"><IconChevron /></div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
