// src/components/jobdetails/ClientDetailsCard.jsx — real API data

function IconUser()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#62748e" strokeWidth="1.2"/><path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconMapPin() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5z" stroke="#90a1b9" strokeWidth="1.2"/><circle cx="8" cy="6" r="1.5" fill="#90a1b9"/></svg> }
function IconPhone()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 9 7 9.5 9.25 11.25L10.5 9.5 14 11v3c0 .553-4-1-7-4S1 5.5 3 2z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconExternalLink() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M7 1h4m0 0v4M11 1L5.5 6.5" stroke="#155dfc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }

export default function ClientDetailsCard({ client }) {
  if (!client) return null

  const handleCall = () => { if (client.phone) window.open(`tel:${client.phone}`) }
  const handleMaps = () => { if (client.maps_url) window.open(client.maps_url, '_blank') }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <IconUser />
          <h3 className="text-[#0f172b] font-bold text-[16px] leading-[27px]">Client Details</h3>
        </div>
        <a href={`/admin/clients/${client.id}`}
          className="text-[#155dfc] text-[13px] leading-[16px] hover:underline font-medium">
          View Profile
        </a>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-5">

        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          {client.profile_picture ? (
            <img src={client.profile_picture} alt={client.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0 text-[16px] font-bold text-[#45556c]">
              {client.name?.slice(0,2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-[#0f172b] font-bold text-[17px] leading-[24px]">{client.name}</p>
            {client.email && <p className="text-[#62748e] text-[13px] mt-0.5">{client.email}</p>}
          </div>
        </div>

        {/* Address */}
        {client.address && (
          <button onClick={handleMaps} className="flex items-start gap-2 text-left group">
            <IconMapPin />
            <div className="min-w-0">
              <p className="text-[#62748e] text-[13px] leading-[20px] group-hover:text-[#155dfc] transition-colors">{client.address}</p>
              {client.maps_url && (
                <span className="flex items-center gap-1 text-[#155dfc] text-[12px] mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconExternalLink /> Open in Maps
                </span>
              )}
            </div>
          </button>
        )}

        {/* Contact person + phone */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#f1f5f9]">
          <div>
            <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px]">Contact Person</p>
            <p className="text-[#0f172b] text-[14px] font-medium mt-1">{client.contact_person_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px]">Phone</p>
            <p className="text-[#0f172b] text-[14px] font-medium mt-1">{client.phone ?? '—'}</p>
          </div>
        </div>

        {/* Call button */}
        <button onClick={handleCall} disabled={!client.phone}
          className="w-full flex items-center justify-center gap-2 bg-[#f54900] hover:bg-[#c73b00] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[14px] font-semibold py-[9px] rounded-[10px] transition-colors">
          <IconPhone /> Call
        </button>
      </div>
    </div>
  )
}
