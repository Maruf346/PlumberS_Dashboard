// src/pages/clients/ClientProfilePage.jsx
// GET    /api/clients/detail/{id}/   → load
// PATCH  /api/clients/{id}/          → edit (via drawer)
// DELETE /api/clients/{id}/          → delete
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }              from 'react'
import { useParams, useNavigate, Link }     from 'react-router-dom'

import PeopleStatusBadge   from '@/components/shared/PeopleStatusBadge'
import DeletePersonModal   from '@/components/people/DeletePersonModal'
import AddEditClientDrawer from '@/pages/clients/AddEditClientDrawer'
import { apiFetch }        from '@/utils/apiFetch'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconArrowLeft()    { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconMail()         { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M1 5l6.5 4L14 5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconPhone()        { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 8.5 7 9 9.25 10.75L10.5 9 14 10.5v3c0 .553-4-1-7-4S1 5 3 2z" stroke="#62748e" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconMapPin()       { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1C5.015 1 3 3.015 3 5.5c0 3.75 4.5 8.5 4.5 8.5S12 9.25 12 5.5C12 3.015 9.985 1 7.5 1z" stroke="#62748e" strokeWidth="1.1"/><circle cx="7.5" cy="5.5" r="1.5" fill="#62748e"/></svg> }
function IconUser()         { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="2.5" stroke="#62748e" strokeWidth="1.1"/><path d="M2 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconKey()          { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="5.5" cy="7" r="3.5" stroke="#62748e" strokeWidth="1.1"/><path d="M8 9.5L13.5 15M11 12l1.5 1.5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconEdit()         { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2l2.5 2.5-7 7H3.5V9l7-7z" stroke="#314158" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconTrash()        { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 4h12M5 4V2.5h5V4M3 4l1 9h7l1-9" stroke="#c10007" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconExternalLink() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5.5 2.5H2v8.5h8.5V7.5M7 2.5h4v4M11 2.5L5.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconBriefcase()    { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="5" width="13" height="8" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5 5V3.5A1.5 1.5 0 016.5 2h2A1.5 1.5 0 0110 3.5V5" stroke="#62748e" strokeWidth="1.1"/><path d="M1 9h13" stroke="#62748e" strokeWidth="1.1"/></svg> }
function IconChev()         { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }

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

// ── Status badge colour mapping (job status) ──────────────────────────────────
function JobStatusBadge({ status }) {
  const map = {
    'completed':   { bg: '#dcfce7', text: '#16a34a', label: 'Completed' },
    'in_progress': { bg: '#dbeafe', text: '#1d4ed8', label: 'In Progress' },
    'pending':     { bg: '#fef9c3', text: '#854d0e', label: 'Pending' },
    'cancelled':   { bg: '#fee2e2', text: '#b91c1c', label: 'Cancelled' },
    'scheduled':   { bg: '#e0e7ff', text: '#4338ca', label: 'Scheduled' },
  }
  const s = map[status?.toLowerCase()] ?? { bg: '#f1f5f9', text: '#62748e', label: status ?? 'Unknown' }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {s.label}
    </span>
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
export default function ClientProfilePage() {
  const { clientId } = useParams()
  const navigate     = useNavigate()

  const [client,     setClient]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  // ── Fetch client detail ───────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, ok, status } = await apiFetch(`clients/detail/${clientId}/`)
      if (ok && data) {
        setClient(data)
      } else if (status === 404) {
        setNotFound(true)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [clientId])

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    const { ok } = await apiFetch(`clients/${clientId}/`, { method: 'DELETE' })
    if (ok) navigate('/admin/clients')
    setDeleting(false)
  }

  // ── After edit save — refetch ──────────────────────────────────────────────
  const handleSave = async () => {
    const { data, ok } = await apiFetch(`clients/detail/${clientId}/`)
    if (ok && data) setClient(data)
    setEditOpen(false)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return <Spinner />

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (notFound || !client) {
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
            <p className="text-[#62748e] text-[14px] mt-1">This client doesn't exist or has been removed.</p>
          </div>
          <Link to="/admin/clients"
            className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] transition-colors">
            ← Back to Clients
          </Link>
        </div>
      </div>
    )
  }

  const mapsUrl = client.maps_url ?? null

  return (
    <>
      {deleteOpen && (
        <DeletePersonModal
          person={client}
          type="client"
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
          loading={deleting}
        />
      )}

      <div className="relative min-h-full">
        {/* Edit drawer */}
        {editOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-[#0f172b]/10 cursor-pointer hidden xl:block" onClick={() => setEditOpen(false)} />
            <div className="fixed right-0 top-0 h-full z-40">
              <AddEditClientDrawer
                mode="edit"
                initialData={client}
                onClose={() => setEditOpen(false)}
                onSave={handleSave}
              />
            </div>
          </>
        )}

        <div className="p-6 lg:p-8 max-w-[960px] flex flex-col gap-6">

          {/* ── Page header — NO uuid shown ── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/clients')}
                className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#314158] transition-colors">
                <IconArrowLeft />
              </button>
              <div>
                <h1 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">Client Profile</h1>
                <p className="text-[#62748e] text-[13px] mt-0.5">{client.name}</p>
              </div>
            </div>
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
              {/* Avatar */}
              <div className="shrink-0">
                {client.profile_picture ? (
                  <img src={client.profile_picture} alt={client.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#e2e8f0]" />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-[26px] select-none"
                    style={{ backgroundColor: getColor(client.name) }}>
                    {getInitials(client.name)}
                  </div>
                )}
              </div>

              {/* Name / status — removed uuid + lastActive */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-[#0f172b] font-bold text-[20px] leading-[28px]">{client.name}</h2>
                  <PeopleStatusBadge status={client.is_active ? 'Active' : 'Inactive'} />
                </div>
                <p className="text-[#62748e] text-[13px] mt-0.5 flex items-center gap-1.5">
                  <IconUser />
                  Contact: <span className="font-medium text-[#314158]">{client.contact_person_name}</span>
                </p>

                {/* Only show email + phone — removed lastActive row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4">
                  {[
                    { icon: IconMail,  val: client.email },
                    { icon: IconPhone, val: client.phone },
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
                  <p className="text-[22px] font-bold text-[#f54900]">{client.job_count ?? 0}</p>
                  <p className="text-[11px] text-[#62748e] mt-0.5 whitespace-nowrap">Assigned Jobs</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Details grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Contact & Location */}
            <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)] flex flex-col">
              <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px] mb-1">Contact & Location</h3>
              <p className="text-[#90a1b9] text-[12px] mb-4">Primary contact details and site address</p>

              <InfoRow icon={IconMail} label="Email">
                <a href={`mailto:${client.email}`} className="text-[#1447e6] hover:underline">{client.email}</a>
              </InfoRow>
              <InfoRow icon={IconPhone} label="Phone">
                <a href={`tel:${client.phone}`} className="text-[#1447e6] hover:underline">{client.phone}</a>
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
                <span className="font-medium text-[#0f172b]">{client.contact_person_name}</span>
                <span className="text-[#62748e] text-[12px] block mt-0.5">On-site representative</span>
              </InfoRow>
            </div>

            {/* Site Access */}
            <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)] flex flex-col">
              <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px] mb-1">Site Access</h3>
              <p className="text-[#90a1b9] text-[12px] mb-4">Gate codes, access instructions and restrictions</p>

              {client.site_access ? (
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-7 h-7 rounded-[6px] bg-[#fff3ee] border border-[#ffd5c2] flex items-center justify-center shrink-0 mt-0.5">
                    <IconKey />
                  </div>
                  <p className="text-[#314158] text-[14px] leading-[22px] whitespace-pre-wrap flex-1">{client.site_access}</p>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[#90a1b9] text-[13px] italic">No site access info recorded.</p>
                </div>
              )}

              {mapsUrl && (
                <div className="mt-4 pt-4 border-t border-[#f1f5f9]">
                  <p className="text-[11px] text-[#90a1b9] font-bold uppercase tracking-[0.5px] mb-2">Site Location</p>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] hover:bg-[#f1f5f9] transition-colors group">
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

          {/* ── Assigned Jobs ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
              <div>
                <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px]">Assigned Jobs</h3>
                <p className="text-[#90a1b9] text-[12px] mt-0.5">
                  {client.job_count ?? 0} job{(client.job_count ?? 0) !== 1 ? 's' : ''} linked to this client
                </p>
              </div>
            </div>

            {!client.jobs || client.jobs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#90a1b9] text-[14px]">No jobs assigned to this client yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f1f5f9]">
                {client.jobs.map(job => (
                  <Link
                    key={job.id}
                    to={`/admin/jobs/${job.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-[8px] bg-[#fff3ee] border border-[#ffd5c2] flex items-center justify-center shrink-0">
                      <IconBriefcase />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0f172b] font-semibold text-[14px] truncate">{job.title ?? job.name ?? `Job #${job.id}`}</p>
                      {job.scheduled_date && (
                        <p className="text-[#90a1b9] text-[12px] mt-0.5">
                          {new Date(job.scheduled_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <JobStatusBadge status={job.status} />
                    <IconChev />
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}