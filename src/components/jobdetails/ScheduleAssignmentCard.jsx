// src/components/jobdetails/ScheduleAssignmentCard.jsx

function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="#62748e" strokeWidth="1.2"/>
      <path d="M5 1v3M11 1v3M1.5 6h13" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconTruck() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M2 6h10v9H2z" stroke="#62748e" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M12 9l4 2v4h-4z" stroke="#62748e" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="5" cy="15.5" r="1.5" fill="#62748e"/>
      <circle cx="14" cy="15.5" r="1.5" fill="#62748e"/>
    </svg>
  )
}
function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.5" stroke="#62748e" strokeWidth="1.3"/>
      <path d="M3 18c0-3.5 3.134-6 7-6s7 2.5 7 6" stroke="#62748e" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export default function ScheduleAssignmentCard({ schedule, assignee, vehicle }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden h-full">

      {/* ── Card header ── */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#e2e8f0]">
        <IconCalendar />
        <h3 className="text-[#0f172b] font-bold text-[16px] leading-[27px]">Schedule & Assignment</h3>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col gap-5">

        {/* Date / Time / Duration */}
        <div className="flex flex-col gap-3">
          {/* Date row */}
          <div className="flex items-center justify-between">
            <span className="text-[#62748e] text-[14px] leading-[20px]">Date</span>
            <span className="text-[#0f172b] font-semibold text-[14px] leading-[20px]">{schedule.date}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f54900] rounded-full transition-all duration-500"
              style={{ width: `${schedule.progressPct}%` }}
            />
          </div>

          {/* Duration */}
          <p className="text-[#90a1b9] text-[12px] leading-[16px]">
            Est. Duration: <span className="font-semibold text-[#62748e]">{schedule.duration}</span>
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-[#f1f5f9]" />

        {/* Assigned Technician */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
              <IconUser />
            </div>
            <div>
              <p className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">{assignee.name}</p>
              <p className="text-[#62748e] text-[12px] leading-[16px]">{assignee.role}</p>
            </div>
          </div>
          <button className="text-[#155dfc] text-[12px] font-semibold leading-[16px] hover:underline shrink-0">
            Reassign
          </button>
        </div>

        {/* Vehicle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
            <IconTruck />
          </div>
          <div>
            <p className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">{vehicle.label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008236] shrink-0" />
              <span className="text-[#008236] text-[12px] leading-[16px]">{vehicle.status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
