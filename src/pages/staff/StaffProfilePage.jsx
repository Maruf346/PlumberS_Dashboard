// src/pages/staff/StaffProfilePage.jsx
// GET  /api/user/admin/users/{id}/          → load detail
// POST /api/user/admin/users/{id}/block/    → toggle active
// DELETE /api/user/admin/users/{id}/        → delete
//
// Sections: Profile hero | Employee Details | Emergency Contact |
//           Assigned Jobs | Certificates (with popup + download)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }              from 'react'
import { useParams, useNavigate, Link }     from 'react-router-dom'

import PersonAvatar      from '@/components/shared/PersonAvatar'
import PeopleStatusBadge from '@/components/shared/PeopleStatusBadge'
import DeletePersonModal from '@/components/people/DeletePersonModal'
import { apiFetch }      from '@/utils/apiFetch'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconArrowLeft()  { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconMail()       { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M1 5l6.5 4L14 5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconPhone()      { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 8.5 7 9 9.25 10.75L10.5 9 14 10.5v3c0 .553-4-1-7-4S1 5 3 2z" stroke="#62748e" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconBriefcase()  { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="5" width="13" height="8" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5 5V3.5A1.5 1.5 0 016.5 2h2A1.5 1.5 0 0110 3.5V5" stroke="#62748e" strokeWidth="1.1"/></svg> }
function IconCalendar()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="12" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5 1v2.5M10 1v2.5M1 6h13" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconBadge()      { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="10" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5.5 3V2h4v1" stroke="#62748e" strokeWidth="1.1"/><path d="M4 8h7M4 10.5h4.5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconTrash()      { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 4h12M5 4V2.5h5V4M3 4l1 9h7l1-9" stroke="#c10007" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconToggle()     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 7.5c0-3.038 2.462-5.5 5.5-5.5h2c3.038 0 5.5 2.462 5.5 5.5s-2.462 5.5-5.5 5.5h-2C3.462 13 1 10.538 1 7.5z" stroke="#314158" strokeWidth="1.1"/><circle cx="8.5" cy="7.5" r="2.5" fill="#314158"/></svg> }
function IconCar()        { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 9h12M3 9l1.5-4h6L12 9" stroke="#62748e" strokeWidth="1.1" strokeLinejoin="round"/><rect x="1.5" y="9" width="12" height="3" rx="1" stroke="#62748e" strokeWidth="1.1"/><circle cx="4.5" cy="12" r="1" fill="#62748e"/><circle cx="10.5" cy="12" r="1" fill="#62748e"/></svg> }
function IconId()         { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><circle cx="5" cy="7.5" r="1.5" stroke="#62748e" strokeWidth="1"/><path d="M8 6h4M8 9h3" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconChev()       { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconClose()      { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconDownload()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v8M4.5 7.5l3 3 3-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12h11" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IconExternal()   { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 2H2v9h9V8M7 2h4v4M11 2L6 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#06b6d4','#f54900']
function getColor(name) {
  if (!name?.trim()) return '#90a1b9'
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}
function getInitials(name) {
  if (!name?.trim()) return '?'
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name.trim().slice(0,2).toUpperCase()
}
function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Job status badge ──────────────────────────────────────────────────────────
function JobStatusBadge({ status }) {
  const map = {
    completed:   { bg: '#dcfce7', text: '#16a34a', label: 'Completed' },
    in_progress: { bg: '#dbeafe', text: '#1d4ed8', label: 'In Progress' },
    pending:     { bg: '#fef9c3', text: '#854d0e', label: 'Pending' },
    cancelled:   { bg: '#fee2e2', text: '#b91c1c', label: 'Cancelled' },
    scheduled:   { bg: '#e0e7ff', text: '#4338ca', label: 'Scheduled' },
  }
  const s = map[status?.toLowerCase()] ?? { bg: '#f1f5f9', text: '#62748e', label: status ?? 'Unknown' }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
  )
}

// ── Certificate popup modal ───────────────────────────────────────────────────
function CertModal({ cert, onClose }) {
  if (!cert) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/40" onClick={onClose}>
      <div className="bg-white rounded-[16px] shadow-[0_8px_40px_rgba(15,23,43,0.18)] w-full max-w-[480px] overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#f1f5f9]">
          <div>
            <h3 className="text-[#0f172b] font-bold text-[17px] leading-[24px]">{cert.name}</h3>
            {cert.issuing_organization && (
              <p className="text-[#62748e] text-[13px] mt-0.5">{cert.issuing_organization}</p>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shrink-0 mt-0.5">
            <IconClose />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {cert.description && (
            <p className="text-[#314158] text-[14px] leading-[22px]">{cert.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {cert.issue_date && (
              <div className="bg-[#f8fafc] rounded-[8px] px-4 py-3">
                <p className="text-[11px] font-bold text-[#90a1b9] uppercase tracking-[0.5px]">Issue Date</p>
                <p className="text-[#314158] text-[13px] font-semibold mt-0.5">{fmtDate(cert.issue_date)}</p>
              </div>
            )}
            {cert.expiration_date && (
              <div className="bg-[#f8fafc] rounded-[8px] px-4 py-3">
                <p className="text-[11px] font-bold text-[#90a1b9] uppercase tracking-[0.5px]">Expiry Date</p>
                <p className="text-[#314158] text-[13px] font-semibold mt-0.5">{fmtDate(cert.expiration_date)}</p>
              </div>
            )}
          </div>

          {/* Certificate file / media */}
          {cert.media && (
            <div className="flex items-center gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px]">
              <div className="w-8 h-8 rounded-[6px] bg-[#fff3ee] border border-[#ffd5c2] flex items-center justify-center shrink-0">
                <IconBadge />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#0f172b] truncate">Certificate File</p>
                <p className="text-[11px] text-[#90a1b9] truncate">{cert.media}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={cert.media} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] border border-[#e2e8f0] bg-white text-[#314158] text-[12px] font-medium hover:bg-[#f8fafc] transition-colors">
                  <IconExternal /> View
                </a>
                <a href={cert.media} download
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] bg-[#f54900] text-white text-[12px] font-medium hover:bg-[#c73b00] transition-colors">
                  <IconDownload /> Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#f1f5f9] last:border-b-0">
      <div className="w-7 h-7 rounded-[6px] bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center shrink-0 mt-0.5">
        <Icon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-[#90a1b9] uppercase tracking-[0.5px] leading-4">{label}</p>
        <div className="text-[14px] text-[#314158] leading-[20px] mt-0.5">{children}</div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function StaffProfilePage() {
  const { staffId } = useParams()
  const navigate    = useNavigate()

  const [member,     setMember]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [toggling,   setToggling]   = useState(false)
  const [activeCert, setActiveCert] = useState(null)  // certificate popup

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true)
    const { data, ok, status } = await apiFetch(`user/admin/users/${staffId}/`)
    if (ok && data) setMember(data)
    else if (status === 404) setNotFound(true)
    else setNotFound(true)
    setLoading(false)
  }

  useEffect(() => { load() }, [staffId])

  // ── Toggle block/unblock ──────────────────────────────────────────────────
  const handleToggle = async () => {
    setToggling(true)
    const prev = member.is_active
    setMember(m => ({ ...m, is_active: !m.is_active }))
    const { ok } = await apiFetch(`user/admin/users/${staffId}/block/`, { method: 'POST' })
    if (!ok) setMember(m => ({ ...m, is_active: prev }))
    setToggling(false)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    const { ok } = await apiFetch(`user/admin/users/${staffId}/`, { method: 'DELETE' })
    if (ok) navigate('/admin/staff')
    setDeleting(false)
  }

  if (loading) return <Spinner />

  if (notFound || !member) {
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
            <h2 className="text-[#0f172b] font-bold text-[18px]">Employee not found</h2>
            <p className="text-[#62748e] text-[14px] mt-1">This employee doesn't exist or has been removed.</p>
          </div>
          <Link to="/admin/staff"
            className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] transition-colors">
            ← Back to Employees
          </Link>
        </div>
      </div>
    )
  }

  const ep   = member.employee_profile ?? {}
  const jobs = Array.isArray(member.jobs) ? member.jobs : []
  const certs = Array.isArray(member.certificates) ? member.certificates : []
  const jobCount = typeof member.jobs_count === 'number' ? member.jobs_count : jobs.length

  return (
    <>
      {/* Certificate popup */}
      {activeCert && <CertModal cert={activeCert} onClose={() => setActiveCert(null)} />}

      {deleteOpen && (
        <DeletePersonModal
          person={{ ...member, name: member.full_name }}
          type="staff"
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
          loading={deleting}
        />
      )}

      <div className="p-6 lg:p-8 max-w-[900px] flex flex-col gap-6">

        {/* ── Header — no ID shown ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/staff')}
              className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#314158] transition-colors">
              <IconArrowLeft />
            </button>
            <div>
              <h1 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">Staff Profile</h1>
              {/* ID commented out: <p className="font-['Consolas',monospace] text-[#f54900] text-[13px]">{member.id}</p> */}
              <p className="text-[#62748e] text-[13px] mt-0.5">{member.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleToggle} disabled={toggling}
              className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158] text-[13px] font-medium transition-colors disabled:opacity-60">
              <IconToggle /> {toggling ? '…' : (member.is_active ? 'Deactivate' : 'Activate')}
            </button>
            <button onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#ffe2e2] bg-white hover:bg-[#fef2f2] text-[#c10007] text-[13px] font-medium transition-colors">
              <IconTrash /> Delete
            </button>
          </div>
        </div>

        {/* ── Profile card ── */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex items-start gap-5 flex-wrap">

            {/* Avatar */}
            {member.profile_picture ? (
              <img src={member.profile_picture} alt={member.full_name}
                className="w-[72px] h-[72px] rounded-full object-cover border-2 border-[#e2e8f0] shrink-0" />
            ) : (
              <PersonAvatar initials={getInitials(member.full_name)} color={getColor(member.full_name)} size="xl" />
            )}

            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-[#0f172b] font-bold text-[20px] leading-[28px]">{member.full_name}</h2>
                <PeopleStatusBadge status={member.is_active ? 'Active' : 'Inactive'} />
              </div>
              <p className="text-[#62748e] text-[14px] mt-1">{member.role || ep.profession || '—'}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {[
                  { icon: IconMail,     val: member.email },
                  { icon: IconPhone,    val: member.phone },
                  { icon: IconBriefcase, val: member.role || ep.profession },
                  { icon: IconCalendar, val: member.created_at ? `Joined ${fmtDate(member.created_at)}` : null },
                  // birth_date available but not shown to preserve layout — can uncomment:
                  // { icon: IconCalendar, val: member.birth_date ? `Born ${fmtDate(member.birth_date)}` : null },
                ].filter(r => r.val).map(({ icon: Icon, val }, i) => (
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
                <p className="text-[22px] font-bold text-[#f54900]">{jobCount}</p>
                <p className="text-[11px] text-[#62748e] mt-0.5 whitespace-nowrap">Assigned Jobs</p>
              </div>
              {certs.length > 0 && (
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-center min-w-[80px]">
                  <p className="text-[22px] font-bold text-[#3b82f6]">{certs.length}</p>
                  <p className="text-[11px] text-[#62748e] mt-0.5 whitespace-nowrap">Certificates</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Employee Profile Details ── */}
        {Object.keys(ep).length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Professional info */}
            <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
              <h3 className="text-[#1d293d] font-bold text-[15px] mb-1">Professional Info</h3>
              <p className="text-[#90a1b9] text-[12px] mb-4">Skills, ID and licence details</p>

              {ep.employee_id && (
                <InfoRow icon={IconId} label="Employee ID">
                  <span className="font-mono text-[13px]">{ep.employee_id}</span>
                </InfoRow>
              )}
              {ep.primary_skill && (
                <InfoRow icon={IconBriefcase} label="Primary Skill">
                  <span className="capitalize">{ep.primary_skill.replace(/_/g, ' ')}</span>
                </InfoRow>
              )}
              {ep.profession && (
                <InfoRow icon={IconBriefcase} label="Profession">
                  {ep.profession}
                </InfoRow>
              )}
              {(ep.drivers_license_number || ep.license_expiry_date) && (
                <InfoRow icon={IconId} label="Driver's Licence">
                  <span>{ep.drivers_license_number || '—'}</span>
                  {ep.license_expiry_date && (
                    <span className="block text-[12px] text-[#90a1b9] mt-0.5">Expires {fmtDate(ep.license_expiry_date)}</span>
                  )}
                  {ep.drivers_license_file && (
                    <a href={ep.drivers_license_file} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#1447e6] text-[12px] hover:underline mt-1">
                      <IconExternal /> View Licence
                    </a>
                  )}
                </InfoRow>
              )}
              {typeof ep.uses_company_vehicle === 'boolean' && (
                <InfoRow icon={IconCar} label="Company Vehicle">
                  <span className={ep.uses_company_vehicle ? 'text-[#16a34a]' : 'text-[#62748e]'}>
                    {ep.uses_company_vehicle ? 'Yes — uses company vehicle' : 'No'}
                  </span>
                </InfoRow>
              )}
            </div>

            {/* Emergency Contact */}
            {ep.emergency_contact && (
              <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
                <h3 className="text-[#1d293d] font-bold text-[15px] mb-1">Emergency Contact</h3>
                <p className="text-[#90a1b9] text-[12px] mb-4">In case of emergency</p>

                {ep.emergency_contact.name && (
                  <InfoRow icon={IconId} label="Name">
                    <span className="font-semibold text-[#0f172b]">{ep.emergency_contact.name}</span>
                  </InfoRow>
                )}
                {ep.emergency_contact.relation && (
                  <InfoRow icon={IconBriefcase} label="Relation">
                    <span className="capitalize">{ep.emergency_contact.relation}</span>
                  </InfoRow>
                )}
                {ep.emergency_contact.mobile && (
                  <InfoRow icon={IconPhone} label="Mobile">
                    <a href={`tel:${ep.emergency_contact.mobile}`} className="text-[#1447e6] hover:underline">
                      {ep.emergency_contact.mobile}
                    </a>
                  </InfoRow>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Assigned Jobs ── */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
            <div>
              <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px]">Assigned Jobs</h3>
              <p className="text-[#90a1b9] text-[12px] mt-0.5">{jobCount} job{jobCount !== 1 ? 's' : ''} assigned</p>
            </div>
          </div>
          {jobs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#90a1b9] text-[14px]">No jobs assigned yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#f1f5f9]">
              {jobs.map(job => (
                <Link key={job.id} to={`/admin/jobs/${job.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#fafafa] transition-colors">
                  <div className="w-8 h-8 rounded-[8px] bg-[#fff3ee] border border-[#ffd5c2] flex items-center justify-center shrink-0">
                    <IconBriefcase />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0f172b] font-semibold text-[14px] truncate">
                      {job.title ?? job.name ?? `Job #${job.id}`}
                    </p>
                    {job.scheduled_date && (
                      <p className="text-[#90a1b9] text-[12px] mt-0.5">{fmtDate(job.scheduled_date)}</p>
                    )}
                  </div>
                  <JobStatusBadge status={job.status} />
                  <IconChev />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Certificates ── */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
          <div className="px-6 py-4 border-b border-[#f1f5f9]">
            <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px]">Certificates</h3>
            <p className="text-[#90a1b9] text-[12px] mt-0.5">{certs.length} certificate{certs.length !== 1 ? 's' : ''}</p>
          </div>

          {certs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#90a1b9] text-[14px]">No certificates on record.</p>
            </div>
          ) : (
            <div className="px-6 py-4 flex flex-wrap gap-3">
              {certs.map(cert => (
                <button key={cert.id} onClick={() => setActiveCert(cert)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] hover:bg-[#f1f5f9] hover:border-[#cad5e2] transition-colors text-left group">
                  <div className="w-7 h-7 rounded-[6px] bg-[#fff3ee] border border-[#ffd5c2] flex items-center justify-center shrink-0">
                    <IconBadge />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#0f172b] text-[13px] font-semibold truncate">{cert.name}</p>
                    {cert.issuing_organization && (
                      <p className="text-[#90a1b9] text-[11px] truncate">{cert.issuing_organization}</p>
                    )}
                    {cert.expiration_date && (
                      <p className="text-[11px] text-[#62748e]">Exp. {fmtDate(cert.expiration_date)}</p>
                    )}
                  </div>
                  <svg className="ml-1 text-[#90a1b9] group-hover:text-[#314158] shrink-0" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4 2.5h5.5v5.5M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  )
}