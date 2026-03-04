// src/components/jobdetails/ClientDetailsCard.jsx

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="#62748e" strokeWidth="1.2"/>
      <path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconMapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5z" stroke="#90a1b9" strokeWidth="1.2"/>
      <circle cx="8" cy="6" r="1.5" fill="#90a1b9"/>
    </svg>
  )
}
function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 9 7 9.5 9.25 11.25L10.5 9.5 14 11v3c0 .553-4-1-7-4S1 5.5 3 2z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}

export default function ClientDetailsCard({ client }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden h-full">

      {/* ── Card header ── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <IconUser />
          <h3 className="text-[#0f172b] font-bold text-[16px] leading-[27px]">Client Details</h3>
        </div>
        <button className="text-[#155dfc] text-[13px] leading-[16px] hover:underline font-medium">
          View Profile
        </button>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col gap-5">

        {/* Company name + address */}
        <div>
          <p className="text-[#0f172b] font-bold text-[18px] leading-[28px]">{client.name}</p>
          <div className="flex items-start gap-1.5 mt-2">
            <IconMapPin />
            <p className="text-[#62748e] text-[13px] leading-[20px]">{client.address}</p>
          </div>
        </div>

        {/* Contact + Site Access row */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#f1f5f9]">
          <div>
            <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px] leading-[16px]">Contact Person</p>
            <p className="text-[#0f172b] text-[14px] leading-[20px] font-medium mt-1">{client.contactPerson}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px] leading-[16px]">Site Access</p>
            <p className="text-[#0f172b] text-[14px] leading-[20px] font-medium mt-1">{client.siteAccess}</p>
          </div>
        </div>

        {/* Call button */}
        <button className="w-full flex items-center justify-center gap-2 bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold leading-[20px] py-[9px] rounded-[10px] transition-colors">
          <IconPhone />
          Call
        </button>
      </div>
    </div>
  )
}
