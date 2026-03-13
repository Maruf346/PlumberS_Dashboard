// src/components/jobdetails/ScheduleAssignmentCard.jsx — real API data

function IconCalendar() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5 1v3M11 1v3M1.5 6h13" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconTruck()    { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 6h10v9H2z" stroke="#62748e" strokeWidth="1.3" strokeLinejoin="round"/><path d="M12 9l4 2v4h-4z" stroke="#62748e" strokeWidth="1.3" strokeLinejoin="round"/><circle cx="5" cy="15.5" r="1.5" fill="#62748e"/><circle cx="14" cy="15.5" r="1.5" fill="#62748e"/></svg> }
function IconUser()     { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="#62748e" strokeWidth="1.3"/><path d="M3 18c0-3.5 3.134-6 7-6s7 2.5 7 6" stroke="#62748e" strokeWidth="1.3" strokeLinecap="round"/></svg> }

function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function fmtTime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
}

export default function ScheduleAssignmentCard({ job }) {
  if (!job) return null

  const { assigned_to, assigned_managers, vehicle, scheduled_datetime } = job
  const hasSchedule = !!scheduled_datetime

  const vehicleStatusColor = {
    'active':         '#007a55',
    'inspection_due': '#c73b00',
    'out_of_service': '#c10007',
  }[vehicle?.status] ?? '#62748e'

  const vehicleStatusLabel = {
    'active':         'Active',
    'inspection_due': 'Inspection Due',
    'out_of_service': 'Out of Service',
  }[vehicle?.status] ?? (vehicle?.status ?? '—')

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden h-full">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#e2e8f0]">
        <IconCalendar />
        <h3 className="text-[#0f172b] font-bold text-[16px] leading-[27px]">Schedule & Assignment</h3>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-5">

        {/* Schedule */}
        <div className="flex flex-col gap-2">
          {hasSchedule ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[#62748e] text-[14px]">Date</span>
                <span className="text-[#0f172b] font-semibold text-[14px]">{fmtDate(scheduled_datetime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#62748e] text-[14px]">Time</span>
                <span className="text-[#0f172b] font-semibold text-[14px]">{fmtTime(scheduled_datetime)}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[#62748e] text-[14px]">Schedule</span>
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[#f1f5f9] text-[#62748e]">Not Scheduled</span>
            </div>
          )}
        </div>

        <div className="border-t border-[#f1f5f9]" />

        {/* Assigned Employee */}
        <div>
          <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px] mb-2">Assigned Employee</p>
          {assigned_to ? (
            <div className="flex items-center gap-3">
              {assigned_to.profile_picture ? (
                <img src={assigned_to.profile_picture} alt={assigned_to.full_name} className="w-10 h-10 rounded-full object-cover shrink-0"/>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0"><IconUser /></div>
              )}
              <div>
                <p className="text-[#0f172b] text-[14px] font-semibold">{assigned_to.full_name}</p>
                {assigned_to.email && <p className="text-[#62748e] text-[12px]">{assigned_to.email}</p>}
              </div>
            </div>
          ) : <p className="text-[#90a1b9] text-[14px] italic">Not assigned</p>}
        </div>

        {/* Assigned Managers */}
        {assigned_managers?.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px] mb-2">Manager{assigned_managers.length > 1 ? 's' : ''}</p>
            <div className="flex flex-col gap-2">
              {assigned_managers.map(m => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#e2e8f0] flex items-center justify-center text-[11px] font-bold text-[#45556c] shrink-0">
                    {m.full_name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <span className="text-[#314158] text-[13px] font-medium">{m.full_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle */}
        {vehicle && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0"><IconTruck /></div>
            <div>
              <p className="text-[#0f172b] text-[14px] font-semibold">{vehicle.name} <span className="font-['Consolas',monospace] text-[12px] text-[#62748e]">({vehicle.plate})</span></p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: vehicleStatusColor }} />
                <span className="text-[12px]" style={{ color: vehicleStatusColor }}>{vehicleStatusLabel}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
