// src/pages/jobdetails/JobDetailsPage.jsx — fully API integrated
// GET /api/jobs/{id}/
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate }           from 'react-router-dom'
import { apiFetch }                         from '@/utils/apiFetch'

import JobDetailHeader       from '@/components/jobdetails/JobDetailHeader'
import ClientDetailsCard     from '@/components/jobdetails/ClientDetailsCard'
import ScheduleAssignmentCard from '@/components/jobdetails/ScheduleAssignmentCard'
import LiveActivityCard      from '@/components/jobdetails/LiveActivityCard'
import JobTabNav             from '@/components/jobdetails/JobTabNav'
import LineItemsTab          from '@/components/jobdetails/LineItemsTab'
import SafetyFormsTab        from '@/components/jobdetails/SafetyFormsTab'
import ReportsTab            from '@/components/jobdetails/ReportsTab'
import DeleteJobModal        from '@/components/editjob/DeleteJobModal'

// ─────────────────────────────────────────────────────────────────────────────
export default function JobDetailsPage() {
  const { jobId }  = useParams()
  const navigate   = useNavigate()
  const [activeTab,    setActiveTab]    = useState('lineitems')
  const [job,          setJob]          = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [notFound,     setNotFound]     = useState(false)
  const [showDelete,   setShowDelete]   = useState(false)
  const [deleting,     setDeleting]     = useState(false)

  // ── Fetch job ──────────────────────────────────────────────────────────────
  const fetchJob = useCallback(async () => {
    setLoading(true)
    const { data, ok, status } = await apiFetch(`jobs/${jobId}/`)
    if (!ok) {
      if (status === 404) setNotFound(true)
      setLoading(false)
      return
    }
    setJob(data)
    setLoading(false)
  }, [jobId])

  useEffect(() => { fetchJob() }, [fetchJob])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    const { ok } = await apiFetch(`jobs/${jobId}/update/`, { method: 'DELETE' })
    if (ok) navigate('/admin/jobs')
    else setDeleting(false)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
          <p className="text-[#62748e] text-[14px]">Loading job details…</p>
        </div>
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <p className="text-[#0f172b] font-bold text-[20px]">Job not found</p>
        <p className="text-[#62748e] text-[14px]">The job you're looking for doesn't exist or has been deleted.</p>
        <button onClick={() => navigate('/admin/jobs')}
          className="px-4 py-[9px] bg-[#f54900] text-white text-[14px] font-semibold rounded-[10px] hover:bg-[#c73b00] transition-colors">
          Back to Jobs
        </button>
      </div>
    )
  }

  return (
    <>
      {showDelete && (
        <DeleteJobModal
          jobId={job.job_id}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}

      <div className="flex flex-col min-h-full">

        {/* Sticky header */}
        <div className="sticky top-0 z-10">
          <JobDetailHeader job={job} onDelete={() => setShowDelete(true)} />
        </div>

        {/* Main content */}
        <div className="p-8 flex flex-col gap-6 max-w-[1600px]">

          {/* Row 1: Three info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <ClientDetailsCard client={job.client} />
            <ScheduleAssignmentCard job={job} />
            <LiveActivityCard jobId={job.id} activities={job.activities ?? []} />
          </div>

          {/* Row 2: Tab section */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            <JobTabNav activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="p-6">
              {activeTab === 'lineitems'   && <LineItemsTab   job={job} onJobUpdate={fetchJob} />}
              {activeTab === 'safetyforms' && <SafetyFormsTab job={job} />}
              {activeTab === 'reports'     && <ReportsTab     job={job} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
