// src/components/dashboard/FleetAlertsPanel.jsx

function IconTruck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 5h8v7H1zM9 7l3 2v3H9z" stroke="#c10007" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="3.5" cy="12.5" r="1" fill="#c10007"/>
      <circle cx="11.5" cy="12.5" r="1" fill="#c10007"/>
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="#62748e" strokeWidth="1"/>
      <path d="M6 3.5V6l2 1.5" stroke="#62748e" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

const ALERTS = [
  { vehicle: 'Truck 12', issue: 'Inspection Due',       time: '2h ago' },
  { vehicle: 'Van 7',    issue: 'Service in 150km',     time: '4h ago' },
  { vehicle: 'Truck 5',  issue: 'Brake issue reported', time: '1d ago' },
]

function AlertCard({ vehicle, issue, time }) {
  return (
    <div className="bg-[rgba(254,242,242,0.5)] border border-[#ffe2e2] rounded-[10px] p-4 flex items-start gap-3">
      {/* Icon */}
      <div className="w-8 h-8 rounded-full bg-[#ffe2e2] flex items-center justify-center shrink-0 mt-0.5">
        <IconTruck />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[#1d293d] text-[14px] font-bold leading-[20px]">{vehicle}</span>
          <span className="flex items-center gap-1 text-[#62748e] text-[12px] leading-[16px] whitespace-nowrap shrink-0">
            <IconClock /> {time}
          </span>
        </div>
        <p className="text-[#45556c] text-[14px] leading-[20px] mb-2">{issue}</p>
        <button className="text-[#e7000b] text-[12px] font-bold leading-[16px] hover:underline">
          View Details
        </button>
      </div>
    </div>
  )
}

// ── Quick Actions ──
function QuickActions() {
  return (
    <div className="border-t border-[#f1f5f9] pt-6">
      <p className="text-[12px] font-bold text-[#90a1b9] leading-[16px] tracking-[0.6px] uppercase mb-4">
        Quick Actions
      </p>
      <div className="flex flex-col gap-2">
        {/* placeholder axios: POST /api/fleet/maintenance/schedule */}
        <button className="bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors text-[#314158] text-[14px] leading-[20px] px-4 py-3 rounded-[10px] text-left w-full">
          Schedule Maintenance
        </button>
        {/* placeholder axios: GET /api/fleet/report/download */}
        <button className="bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors text-[#314158] text-[14px] leading-[20px] px-4 py-3 rounded-[10px] text-left w-full">
          Download Fleet Report
        </button>
      </div>
    </div>
  )
}

export default function FleetAlertsPanel() {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] pt-[25px] px-[25px] pb-[1px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[#1d293d] font-bold text-[18px] leading-[28px]">Fleet Alerts</h3>
        <span className="bg-[#ffe2e2] text-[#c10007] text-[12px] font-bold leading-[16px] px-2 py-1 rounded-full">
          3 Active
        </span>
      </div>

      {/* ── Alert cards ── */}
      <div className="flex flex-col gap-4 mb-6">
        {ALERTS.map(alert => (
          <AlertCard key={alert.vehicle} {...alert} />
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <QuickActions />
    </div>
  )
}
