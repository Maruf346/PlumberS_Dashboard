// src/pages/jobdetails/JobDetailsPage.jsx
// Edit drawer is state-based overlay on this page — same pattern as JobsPage/CreateJobPage.
// No navigation to /edit route, so the background stays visible behind the drawer.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate }           from 'react-router-dom'
import { apiFetch }                         from '@/utils/apiFetch'

import JobDetailHeader        from '@/components/jobdetails/JobDetailHeader'
import ClientDetailsCard      from '@/components/jobdetails/ClientDetailsCard'
import InsuredDetailsCard     from '@/components/jobdetails/InsuredDetailsCard'
import ScheduleAssignmentCard from '@/components/jobdetails/ScheduleAssignmentCard'
import LiveActivityCard       from '@/components/jobdetails/LiveActivityCard'
import JobTabNav              from '@/components/jobdetails/JobTabNav'
import LineItemsTab           from '@/components/jobdetails/LineItemsTab'
import SafetyFormsTab         from '@/components/jobdetails/SafetyFormsTab'
import ReportsTab             from '@/components/jobdetails/ReportsTab'
import NotesTab              from '@/components/jobdetails/NotesTab'
import DeleteJobModal         from '@/components/editjob/DeleteJobModal'
import EditJobDrawer          from '@/pages/editjob/EditJobDrawer'

// ─────────────────────────────────────────────────────────────────────────────
export default function JobDetailsPage() {
  const { jobId }  = useParams()
  const navigate   = useNavigate()

  const [activeTab,  setActiveTab]  = useState('lineitems')
  const [job,        setJob]        = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [editOpen,   setEditOpen]   = useState(false)

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

  // ── Loading / not found ────────────────────────────────────────────────────
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
        <p className="text-[#62748e] text-[14px]">This job doesn't exist or has been deleted.</p>
        <button onClick={() => navigate('/admin/jobs')}
          className="px-4 py-[9px] bg-[#f54900] text-white text-[14px] font-semibold rounded-[10px] hover:bg-[#c73b00] transition-colors">
          Back to Jobs
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Delete modal */}
      {showDelete && (
        <DeleteJobModal
          jobId={job.job_id}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}

      {/* Edit drawer — fixed overlay, slides in from right OVER this page */}
      {editOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#0f172b]/40 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setEditOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className={[
        'fixed top-0 right-0 z-40 h-screen',
        'transition-transform duration-300 ease-in-out',
        editOpen ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}>
        <EditJobDrawer
          jobId={jobId}
          job={job}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); fetchJob() }}
          onDeleted={() => navigate('/admin/jobs')}
        />
      </div>

      {/* Page content (stays fully visible behind the drawer) */}
      <div className="flex flex-col min-h-full">

        <div className="sticky top-0 z-10">
          <JobDetailHeader
            job={job}
            onEdit={() => setEditOpen(true)}
            onDelete={() => setShowDelete(true)}
            onStatusChange={newStatus => setJob(prev => ({ ...prev, status: newStatus }))}
          />
        </div>

        <div className="p-8 flex flex-col gap-6 max-w-[1600px]">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <ClientDetailsCard client={job.client} />
              <InsuredDetailsCard job={job} />
            <ScheduleAssignmentCard job={job} />
            <LiveActivityCard jobId={job.id} activities={job.activities ?? []} />
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
            <JobTabNav activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="p-6">
              {activeTab === 'lineitems'   && <LineItemsTab   job={job} onJobUpdate={fetchJob} />}
              {activeTab === 'safetyforms' && <SafetyFormsTab job={job} />}
              {activeTab === 'reports'     && <ReportsTab     job={job} />}
              {activeTab === 'notes'       && <NotesTab       job={job} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
