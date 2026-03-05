// src/pages/clients/ClientProfilePage.jsx
// Client profile detail — /admin/clients/:clientId
// Shows all client fields with live Google Maps link, edit drawer, delete
// ─────────────────────────────────────────────────────────────────────────────

import { useState }                    from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import PeopleStatusBadge   from '@/components/shared/PeopleStatusBadge'
import DeletePersonModal   from '@/components/people/DeletePersonModal'
import AddEditClientDrawer from '@/pages/clients/AddEditClientDrawer'
import { CLIENTS }         from '@/data/peopleMock'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconArrowLeft()    { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconMail()         { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M1 5l6.5 4L14 5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconPhone()        { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 8.5 7 9 9.25 10.75L10.5 9 14 10.5v3c0 .553-4-1-7-4S1 5 3 2z" stroke="#62748e" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconMapPin()       { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1C5.015 1 3 3.015 3 5.5c0 3.75 4.5 8.5 4.5 8.5S12 9.25 12 5.5C12 3.015 9.985 1 7.5 1z" stroke="#62748e" strokeWidth="1.1"/><circle cx="7.5" cy="5.5" r="1.5" fill="#62748e"/></svg> }
function IconUser()         { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="#62748e" strokeWidth="1.1"/><path d="M2 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconKey()          { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="5.5" cy="7" r="3.5" stroke="#62748e" strokeWidth="1.1"/><path d="M8 9.5L13.5 15M11 12l1.5 1.5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconCalendar()     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="12" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5 1v2.5M10 1v2.5M1 6h13" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconEdit()         { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2l2.5 2.5-7 7H3.5V9l7-7z" stroke="#314158" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconTrash()        { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 4h12M5 4V2.5h5V4M3 4l1 9h7l1-9" stroke="#c10007" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconExternalLink() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5.5 2.5H2v8.5h8.5V7.5M7 2.5h4v4M11 2.5L5.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconBriefcase()    { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="5" width="13" height="8" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5 5V3.5A1.5 1.5 0 016.5 2h2A1.5 1.5 0 0110 3.5V5" stroke="#62748e" strokeWidth="1.1"/><path d="M1 9h13" stroke="#62748e" strokeWidth="1.1"/></svg> }

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildMapsUrl(address) {
  if (!address?.trim()) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
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

// ─────────────────────────────────────────────────────────────────────────────
export default function ClientProfilePage() {
  const { clientId } = useParams()
  const navigate     = useNavigate()

  // Local state — seeded from mock, editable in place
  const [client, setClient] = useState(() => CLIENTS.find(c => c.id === clientId) ?? null)
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // ── 404 ──────────────────────────────────────────────────────────────────
  if (!client) {
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
            <h2 className="text-[#0f172b] font-bold text-[18px]">Client not found</h2>
            <p className="text-[#62748e] text-[14px] mt-1">
              <span className="font-mono text-[#f54900]">{clientId}</span> doesn't exist or was removed.
            </p>
          </div>
          <Link to="/admin/clients"
            className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] transition-colors">
            ← Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  const mapsUrl = buildMapsUrl(client.address)

  const handleSave = (updated) => setClient(prev => ({ ...prev, ...updated }))

  const handleDelete = () => {
    // TODO: await axios.delete(`/api/clients/${client.id}`)
    navigate('/admin/clients')
  }

  return (
    <>
      {/* Delete modal */}
      {deleteOpen && (
        <DeletePersonModal
          person={client}
          type="client"
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
        />
      )}

      <div className="relative min-h-full">
        {/* Edit drawer backdrop */}
        {editOpen && (
          <div className="fixed inset-0 z-30 bg-[#0f172b]/10 cursor-pointer hidden xl:block" onClick={() => setEditOpen(false)} />
        )}
        {editOpen && (
          <div className="fixed right-0 top-0 h-full z-40">
            <AddEditClientDrawer
              mode="edit"
              initialData={client}
              onClose={() => setEditOpen(false)}
              onSave={handleSave}
            />
          </div>
        )}

        <div className="p-6 lg:p-8 max-w-[960px] flex flex-col gap-6">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/clients')}
                className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#314158] transition-colors">
                <IconArrowLeft />
              </button>
              <div>
                <h1 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">Client Profile</h1>
                <p className="text-[#62748e] text-[13px] mt-0.5">
                  <span className="font-mono text-[#f54900]">{client.id}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158] text-[13px] font-medium transition-colors">
                <IconEdit /> Edit
              </button>
              <button onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] border border-[#ffe2e2] bg-white hover:bg-[#fef2f2] text-[#c10007] text-[13px] font-medium transition-colors">
                <IconTrash /> Delete
              </button>
            </div>
          </div>

          {/* ── Profile hero card ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex items-start gap-5 flex-wrap">

              {/* Avatar / photo */}
              <div className="shrink-0">
                {client.profilePicture ? (
                  <img src={client.profilePicture} alt={client.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#e2e8f0]" />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-[26px] select-none"
                    style={{ backgroundColor: client.color }}>
                    {client.initials}
                  </div>
                )}
              </div>

              {/* Name / status / meta */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-[#0f172b] font-bold text-[20px] leading-[28px]">{client.name}</h2>
                  <PeopleStatusBadge status={client.status} />
                </div>
                <p className="text-[#62748e] text-[13px] mt-0.5 flex items-center gap-1.5">
                  <IconUser />
                  Contact: <span className="font-medium text-[#314158]">{client.contactPersonName}</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4">
                  {[
                    { icon: IconMail,     val: client.email     },
                    { icon: IconPhone,    val: client.phone     },
                    { icon: IconCalendar, val: `Joined ${client.joinedDate}` },
                    { icon: IconCalendar, val: `Active ${client.lastActive}` },
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
                <div className="bg-[#fff3ee] border border-[#ffd5c2] rounded-[10px] px-5 py-3 text-center min-w-[90px]">
                  <p className="text-[22px] font-bold text-[#f54900]">{client.assignedJobs}</p>
                  <p className="text-[11px] text-[#62748e] mt-0.5 whitespace-nowrap">Assigned Jobs</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Details grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Contact & Site */}
            <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)] flex flex-col">
              <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px] mb-1">Contact & Location</h3>
              <p className="text-[#90a1b9] text-[12px] mb-4">Primary contact details and site address</p>

              <InfoRow icon={IconMail} label="Email">
                <a href={`mailto:${client.email}`}
                  className="text-[#1447e6] hover:underline">{client.email}</a>
              </InfoRow>

              <InfoRow icon={IconPhone} label="Phone">
                <a href={`tel:${client.phone}`}
                  className="text-[#1447e6] hover:underline">{client.phone}</a>
              </InfoRow>

              <InfoRow icon={IconMapPin} label="Address">
                <span className="text-[#314158] leading-[20px]">{client.address}</span>
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#1447e6] text-[12px] font-medium hover:underline mt-1">
                    <IconExternalLink /> View on Google Maps
                  </a>
                )}
              </InfoRow>

              <InfoRow icon={IconUser} label="Contact Person">
                <span className="font-medium text-[#0f172b]">{client.contactPersonName}</span>
                <span className="text-[#62748e] text-[12px] block mt-0.5">On-site representative</span>
              </InfoRow>
            </div>

            {/* Site Access */}
            <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)] flex flex-col">
              <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px] mb-1">Site Access</h3>
              <p className="text-[#90a1b9] text-[12px] mb-4">Gate codes, access instructions and restrictions</p>

              {client.siteAccess ? (
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-7 h-7 rounded-[6px] bg-[#fff3ee] border border-[#ffd5c2] flex items-center justify-center shrink-0 mt-0.5">
                    <IconKey />
                  </div>
                  <p className="text-[#314158] text-[14px] leading-[22px] whitespace-pre-wrap flex-1">
                    {client.siteAccess}
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[#90a1b9] text-[13px] italic">No site access info recorded.</p>
                </div>
              )}

              {/* Quick map embed hint */}
              {client.address && (
                <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
                  <p className="text-[11px] text-[#90a1b9] font-bold uppercase tracking-[0.5px] mb-2">Site Location</p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] hover:bg-[#f1f5f9] transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-[6px] bg-[#dbeafe] flex items-center justify-center shrink-0">
                      <IconMapPin />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#314158] truncate">{client.address}</p>
                      <p className="text-[11px] text-[#1447e6]">Open in Google Maps →</p>
                    </div>
                    <IconExternalLink />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ── Jobs placeholder ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px]">Assigned Jobs</h3>
                <p className="text-[#90a1b9] text-[12px] mt-0.5">{client.assignedJobs} job{client.assignedJobs !== 1 ? 's' : ''} linked to this client</p>
              </div>
              <Link to="/admin/jobs"
                className="flex items-center gap-1.5 px-3 py-[7px] border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#314158] font-medium hover:bg-[#f8fafc] transition-colors">
                <IconBriefcase /> View Jobs
              </Link>
            </div>
            {client.assignedJobs === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#90a1b9] text-[14px]">No jobs assigned to this client yet.</p>
              </div>
            ) : (
              <div className="px-6 py-5 text-center">
                <p className="text-[#62748e] text-[13px]">
                  {client.assignedJobs} job{client.assignedJobs !== 1 ? 's' : ''} — navigate to
                  <Link to="/admin/jobs" className="text-[#f54900] hover:underline font-medium mx-1">Jobs</Link>
                  and filter by this client to view them.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
