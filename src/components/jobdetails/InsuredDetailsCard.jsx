// src/components/jobdetails/InsuredDetailsCard.jsx
// Shows insured_name, insured_phone, insured_email, insured_address, site_access_info
// from the job detail response. Shown alongside ClientDetailsCard on JobDetailsPage.

function IconShield()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V4L8 1.5z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconUser()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="#90a1b9" strokeWidth="1.1"/><path d="M2 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconPhone()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 1.5h2.5l1.25 3-1.5 1C5.5 7 6 7.5 8.25 9.25l1-1.5 3 1.5v2.5c0 .5-3.5-.5-6-3s-3.5-5.5-3-6z" stroke="#90a1b9" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconMail()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1.2" stroke="#90a1b9" strokeWidth="1.1"/><path d="M1 5l6 4 6-4" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconMapPin()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.79 1 3 2.79 3 5c0 3.25 4 8 4 8s4-4.75 4-8c0-2.21-1.79-4-4-4z" stroke="#90a1b9" strokeWidth="1.1"/><circle cx="7" cy="5" r="1.3" fill="#90a1b9"/></svg> }
function IconKey()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5.5" cy="5.5" r="3" stroke="#90a1b9" strokeWidth="1.1"/><path d="M7.5 7.5l5 5M10.5 9.5l-1.5 1.5" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/></svg> }

function Row({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-[#f8fafc] last:border-b-0">
      <div className="w-6 h-6 rounded-[5px] bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center shrink-0 mt-0.5">
        <Icon />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-[#90a1b9] uppercase tracking-[0.4px]">{label}</p>
        <p className="text-[13px] text-[#314158] mt-0.5 leading-[18px]">{value}</p>
      </div>
    </div>
  )
}

export default function InsuredDetailsCard({ job }) {
  if (!job) return null

  const hasAny = job.insured_name || job.insured_phone || job.insured_email ||
                 job.insured_address || job.site_access_info

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] overflow-hidden h-full">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[#e2e8f0]">
        <IconShield />
        <h3 className="text-[#0f172b] font-bold text-[16px] leading-[27px]">Insured Details</h3>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {!hasAny ? (
          <p className="text-[#90a1b9] text-[13px] py-4 text-center italic">No insured details recorded.</p>
        ) : (
          <>
            <Row icon={IconUser}   label="Insured Name"    value={job.insured_name} />
            <Row icon={IconPhone}  label="Insured Phone"   value={job.insured_phone} />
            <Row icon={IconMail}   label="Insured Email"   value={job.insured_email} />
            <Row icon={IconMapPin} label="Insured Address" value={job.insured_address} />
            {job.site_access_info && (
              <div className="flex items-start gap-2.5 pt-2.5">
                <div className="w-6 h-6 rounded-[5px] bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-center shrink-0 mt-0.5">
                  <IconKey />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#90a1b9] uppercase tracking-[0.4px]">Site Access Info</p>
                  <p className="text-[13px] text-[#314158] mt-0.5 leading-[18px] whitespace-pre-wrap">{job.site_access_info}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}