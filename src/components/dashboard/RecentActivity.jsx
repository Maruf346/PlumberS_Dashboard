// src/components/dashboard/RecentActivity.jsx — real activity feed
// GET /api/jobs/activities/recent/
// Uses time_ago from API response directly

import { useNavigate } from 'react-router-dom'

const ACTIVITY_COLORS = {
  job_created:       { dot: 'bg-[#1447e6]',  label: 'Created' },
  job_updated:       { dot: 'bg-[#fe9a00]',  label: 'Updated' },
  job_assigned:      { dot: 'bg-[#f54900]',  label: 'Assigned' },
  job_started:       { dot: 'bg-[#007a55]',  label: 'Started' },
  job_completed:     { dot: 'bg-[#22c55e]',  label: 'Completed' },
  job_rescheduled:   { dot: 'bg-[#8b5cf6]',  label: 'Rescheduled' },
  status_changed:    { dot: 'bg-[#94a3b8]',  label: 'Status Changed' },
  note_added:        { dot: 'bg-[#62748e]',  label: 'Note Added' },
}

function ActivityItem({ item, isLast }) {
  const navigate = useNavigate()
  const color = ACTIVITY_COLORS[item.activity_type] ?? { dot: 'bg-[#cad5e2]', label: '' }

  return (
    <div className="relative pl-5">
      {/* Timeline dot */}
      <div className={`absolute left-0 top-[5px] w-[10px] h-[10px] rounded-full border-2 border-white ${color.dot}`} />

      <div>
        <p className="text-[#0f172b] text-[13px] leading-[19px]">
          <span className="font-bold">{item.actor_name}</span>
          <span className="text-[#45556c]"> · </span>
          <button
            onClick={() => navigate(`/admin/jobs/${item.job_uuid}`)}
            className="font-['Consolas',monospace] text-[#f54900] text-[12px] hover:underline">
            {item.job_id}
          </button>
          <span className="text-[#45556c] text-[12px]"> {item.job_name}</span>
        </p>
        <p className="text-[#90a1b9] text-[11px] leading-[16px] mt-0.5">{item.time_ago}</p>
      </div>
    </div>
  )
}

function SkeletonItem() {
  return (
    <div className="relative pl-5">
      <div className="absolute left-0 top-[5px] w-[10px] h-[10px] rounded-full bg-[#e2e8f0]" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 bg-[#f1f5f9] rounded animate-pulse w-4/5" />
        <div className="h-3 bg-[#f1f5f9] rounded animate-pulse w-1/4" />
      </div>
    </div>
  )
}

export default function RecentActivity({ activity, loading }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-[25px]">
      <h3 className="text-[#1d293d] font-bold text-[18px] leading-[28px] mb-4">Recent Activity</h3>

      <div className="border-l border-[#e2e8f0] pl-[17px] flex flex-col gap-5">
        {loading ? (
          [0,1,2,3].map(i => <SkeletonItem key={i} />)
        ) : activity.length === 0 ? (
          <p className="text-[#90a1b9] text-[13px]">No recent activity.</p>
        ) : activity.slice(0, 8).map((item, idx) => (
          <ActivityItem key={item.id ?? idx} item={item} isLast={idx === activity.length - 1} />
        ))}
      </div>
    </div>
  )
}
