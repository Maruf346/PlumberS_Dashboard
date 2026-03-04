// src/pages/staff/StaffProfilePage.jsx
// Staff member profile detail view — /admin/staff/:staffId
// ─────────────────────────────────────────────────────────────────────────────

import { useParams, useNavigate, Link }  from 'react-router-dom'

import PersonAvatar      from '@/components/shared/PersonAvatar'
import PeopleStatusBadge from '@/components/shared/PeopleStatusBadge'
import { STAFF, MANAGERS } from '@/data/peopleMock'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconMail()  { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M1 5l6.5 4L14 5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconPhone() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 8.5 7 9 9.25 10.75L10.5 9 14 10.5v3c0 .553-4-1-7-4S1 5 3 2z" stroke="#62748e" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconBriefcase() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="5" width="13" height="8" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5 5V3.5A1.5 1.5 0 016.5 2h2A1.5 1.5 0 0110 3.5V5" stroke="#62748e" strokeWidth="1.1"/></svg> }
function IconCalendar() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="12" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5 1v2.5M10 1v2.5M1 6h13" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconBadge() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="10" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5.5 3V2h4v1" stroke="#62748e" strokeWidth="1.1"/><path d="M4 8h7M4 10.5h4.5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }

export default function StaffProfilePage() {
  const { staffId } = useParams()
  const navigate    = useNavigate()

  const member  = STAFF.find(s => s.id === staffId)

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#f8fafc] border-2 border-[#e2e8f0] flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#e2e8f0" strokeWidth="2"/>
              <path d="M14 9v7" stroke="#cad5e2" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="19.5" r="1.2" fill="#cad5e2"/>
            </svg>
          </div>
          <div>
            <h2 className="text-[#0f172b] font-bold text-[18px]">Staff member not found</h2>
            <p className="text-[#62748e] text-[14px] mt-1">
              <span className="font-['Consolas',monospace] text-[#f54900]">{staffId}</span> doesn't exist.
            </p>
          </div>
          <Link to="/admin/staff"
            className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] transition-colors">
            ← Back to Staff
          </Link>
        </div>
      </div>
    )
  }

  const manager = MANAGERS.find(m => m.id === member.managerId)

  return (
    <div className="p-6 lg:p-8 max-w-[900px] flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/staff')}
            className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#314158] transition-colors"
          >
            <IconArrowLeft />
          </button>
          <div>
            <h1 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">Staff Profile</h1>
            <p className="text-[#62748e] text-[13px] mt-0.5">
              <span className="font-['Consolas',monospace] text-[#f54900]">{member.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Profile card ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
        <div className="flex items-start gap-5 flex-wrap">
          <PersonAvatar initials={member.initials} color={member.color} size="xl" />
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-[#0f172b] font-bold text-[20px] leading-[28px]">{member.name}</h2>
              <PeopleStatusBadge status={member.status} />
            </div>
            <p className="text-[#62748e] text-[14px] mt-1">{member.role}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                { icon: IconMail,      val: member.email },
                { icon: IconPhone,     val: member.phone },
                { icon: IconBriefcase, val: member.role  },
                { icon: IconCalendar,  val: `Joined ${member.joinedDate}` },
              ].map(({ icon: Icon, val }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon />
                  <span className="text-[#45556c] text-[13px]">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-center min-w-[80px]">
              <p className="text-[22px] font-bold text-[#f54900]">{member.assignedJobs}</p>
              <p className="text-[11px] text-[#62748e] mt-0.5 whitespace-nowrap">Assigned Jobs</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Manager card ── */}
      {manager && (
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
          <div className="px-6 py-4 border-b border-[#f1f5f9]">
            <h3 className="text-[#1d293d] font-bold text-[15px]">Assigned Manager</h3>
          </div>
          <Link
            to={`/admin/managers/${manager.id}`}
            className="flex items-center justify-between px-6 py-4 hover:bg-[#fafafa] transition-colors"
          >
            <div className="flex items-center gap-3">
              <PersonAvatar initials={manager.initials} color={manager.color} size="md" />
              <div>
                <p className="text-[#0f172b] font-semibold text-[14px]">{manager.name}</p>
                <p className="text-[#62748e] text-[12px] mt-0.5">{manager.role}</p>
              </div>
            </div>
            <PeopleStatusBadge status={manager.status} />
          </Link>
        </div>
      )}

      {/* ── Certifications ── */}
      {member.certifications?.length > 0 && (
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
          <div className="px-6 py-4 border-b border-[#f1f5f9]">
            <h3 className="text-[#1d293d] font-bold text-[15px]">Certifications</h3>
          </div>
          <div className="px-6 py-4 flex flex-wrap gap-2">
            {member.certifications.map(cert => (
              <span key={cert}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f1f5f9] border border-[#e2e8f0] rounded-full text-[12px] font-medium text-[#314158]">
                <IconBadge /> {cert}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
