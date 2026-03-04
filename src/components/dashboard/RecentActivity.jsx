// src/components/dashboard/RecentActivity.jsx

const ACTIVITIES = [
  {
    actor:  'Mike Ross',
    action: ' completed job ',
    target: 'JB-1024',
    time:   '10m ago',
  },
  {
    actor:  'System',
    action: ' flagged vehicle ',
    target: 'Truck-05',
    time:   '32m ago',
  },
  {
    actor:  'Sarah Lee',
    action: ' submitted safety check ',
    target: 'Van-01',
    time:   '1h ago',
  },
]

function ActivityItem({ actor, action, target, time, isLast }) {
  return (
    <div className="relative pl-5">
      {/* Timeline dot */}
      <div className="absolute left-0 top-[5px] w-[10px] h-[10px] rounded-full bg-[#cad5e2] border-2 border-white" />

      {/* Content */}
      <div className="mb-0">
        <p className="text-[#0f172b] text-[14px] leading-[20px]">
          <span className="font-bold">{actor}</span>
          <span className="text-[#45556c]">{action}</span>
          <span className="font-['Consolas',monospace] text-[#f54900] text-[12px]">{target}</span>
        </p>
        <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5">{time}</p>
      </div>
    </div>
  )
}

export default function RecentActivity() {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] pt-[25px] px-[25px] pb-[25px]">
      <h3 className="text-[#1d293d] font-bold text-[18px] leading-[28px] mb-4">Recent Activity</h3>

      {/* Timeline */}
      <div className="border-l border-[#e2e8f0] pl-[17px] flex flex-col gap-6">
        {ACTIVITIES.map((item, idx) => (
          <ActivityItem key={idx} {...item} isLast={idx === ACTIVITIES.length - 1} />
        ))}
      </div>
    </div>
  )
}
