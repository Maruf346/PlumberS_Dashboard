// src/pages/jobdetails/JobDetailsPage.jsx
// Figma frame 1:3449 — Job Details
// ─────────────────────────────────────────────────────────────────────────────

import { useState }              from 'react'
import { useParams }             from 'react-router-dom'

import JobDetailHeader          from '@/components/jobdetails/JobDetailHeader'
import ClientDetailsCard        from '@/components/jobdetails/ClientDetailsCard'
import ScheduleAssignmentCard   from '@/components/jobdetails/ScheduleAssignmentCard'
import LiveActivityCard         from '@/components/jobdetails/LiveActivityCard'
import JobTabNav                from '@/components/jobdetails/JobTabNav'
import JobScopeTab              from '@/components/jobdetails/JobScopeTab'
import FilesPhotosTab           from '@/components/jobdetails/FilesPhotosTab'
import NotesTab                 from '@/components/jobdetails/NotesTab'

import { JOB_DETAIL_MOCK }      from '@/data/jobsMockData'

// ─────────────────────────────────────────────────────────────────────────────
// JobDetailsPage
// ─────────────────────────────────────────────────────────────────────────────

export default function JobDetailsPage() {
  const { jobId } = useParams()
  const [activeTab, setActiveTab] = useState('scope')

  // TODO: Replace with real API call
  // const fetchJobDetails = async () => {
  //   const res = await axios.get(`/api/jobs/${jobId}`);
  //   setJob(res.data);
  // };
  // useEffect(() => { fetchJobDetails() }, [jobId])

  // Use mock data (keyed by jobId if needed, falling back to default)
  const job = JOB_DETAIL_MOCK

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Sticky top status header ────────────────────────────────── */}
      <div className="sticky top-0 z-10">
        <JobDetailHeader job={job} />
      </div>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="p-8 flex flex-col gap-6 max-w-[1600px]">

        {/* ── Row 1: Three info cards ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <ClientDetailsCard        client={job.client}  />
          <ScheduleAssignmentCard   schedule={job.schedule} assignee={job.assignee} vehicle={job.vehicle} />
          <LiveActivityCard         activity={job.activity} />
        </div>

        {/* ── Row 2: Tab section ──────────────────────────────────── */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">

          {/* Tab navigation bar */}
          <JobTabNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'scope' && <JobScopeTab job={job} />}
            {activeTab === 'files' && <FilesPhotosTab />}
            {activeTab === 'notes' && <NotesTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
