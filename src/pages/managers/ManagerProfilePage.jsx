// src/pages/managers/ManagerProfilePage.jsx
// GET    /api/user/admin/managers/{id}/         → load detail
// PATCH  /api/user/admin/manager/{id}/update/   → edit (via drawer)
// DELETE /api/user/admin/manager/{id}/delete/   → delete
//
// Detail response fields used:
//   full_name, email, phone, profile_picture, is_active,
//   job_count, assigned_staff_count, notes, assigned_jobs[], created_at
//
// Fields commented out (no backend data):
//   role, joinedDate display (created_at used instead), lastActive
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }              from 'react'
import { useParams, useNavigate, Link }     from 'react-router-dom'

import PersonAvatar      from '@/components/shared/PersonAvatar'
import PeopleStatusBadge from '@/components/shared/PeopleStatusBadge'
import DeletePersonModal from '@/components/people/DeletePersonModal'
import AddEditManagerDrawer from '@/pages/managers/AddEditManagerDrawer'
import { apiFetch }      from '@/utils/apiFetch'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconArrowLeft()  { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconMail()       { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="3" width="13" height="9" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M1 5l6.5 4L14 5" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconPhone()      { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 8.5 7 9 9.25 10.75L10.5 9 14 10.5v3c0 .553-4-1-7-4S1 5 3 2z" stroke="#62748e" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
// function IconBriefcase() — role field not in detail API, kept for future use
function IconCalendar()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="12" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5 1v2.5M10 1v2.5M1 6h13" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconEdit()       { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2l2.5 2.5-7 7H3.5V9l7-7z" stroke="#314158" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconTrash()      { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1.5 4h12M5 4V2.5h5V4M3 4l1 9h7l1-9" stroke="#c10007" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconBriefcase2() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="5" width="13" height="8" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M5 5V3.5A1.5 1.5 0 016.5 2h2A1.5 1.5 0 0110 3.5V5" stroke="#62748e" strokeWidth="1.1"/><path d="M1 9h13" stroke="#62748e" strokeWidth="1.1"/></svg> }
function IconChev()       { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }

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

// ── Job status badge ──────────────────────────────────────────────────────────
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
      style={{ backgroundColor: s.bg, color: s.text }}>{s.label}</span>
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
export default function ManagerProfilePage() {
  const { managerId } = useParams()
  const navigate      = useNavigate()

  const [manager,    setManager]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [notFound,   setNotFound]   = useState(false)
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  // ── Load manager detail ───────────────────────────────────────────────────
  const load = async () => {
    setLoading(true)
    const { data, ok, status } = await apiFetch(`user/admin/managers/${managerId}/`)
    if (ok && data) {
      setManager(data)
    } else if (status === 404) {
      setNotFound(true)
    } else {
      setNotFound(true)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [managerId])

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true)
    const { ok } = await apiFetch(`user/admin/manager/${managerId}/delete/`, { method: 'DELETE' })
    if (ok) navigate('/admin/managers')
    setDeleting(false)
  }

  // ── After edit save — refetch ─────────────────────────────────────────────
  const handleSave = async () => {
    setEditOpen(false)
    await load()
  }

  if (loading) return <Spinner />

  if (notFound || !manager) {
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
            <h2 className="text-[#0f172b] font-bold text-[18px]">Manager not found</h2>
            <p className="text-[#62748e] text-[14px] mt-1">This manager doesn't exist or has been removed.</p>
          </div>
          <Link to="/admin/managers"
            className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] transition-colors">
            ← Back to Managers
          </Link>
        </div>
      </div>
    )
  }

  const avatarSrc = manager.profile_picture

  return (
    <>
      {deleteOpen && (
        <DeletePersonModal
          person={{ ...manager, name: manager.full_name }}
          type="manager"
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
              <AddEditManagerDrawer
                mode="edit"
                initialData={manager}
                onClose={() => setEditOpen(false)}
                onSave={handleSave}
              />
            </div>
          </>
        )}

        <div className="p-6 lg:p-8 max-w-[900px] flex flex-col gap-6">

          {/* ── Page header — no ID shown per requirements ── */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin/managers')}
                className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#314158] transition-colors">
                <IconArrowLeft />
              </button>
              <div>
                <h1 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">Manager Profile</h1>
                {/* Manager ID commented out per requirements */}
                {/* <p className="text-[#62748e] text-[13px] mt-0.5 font-['Consolas',monospace] text-[#f54900]">{manager.id}</p> */}
                <p className="text-[#62748e] text-[13px] mt-0.5">{manager.full_name}</p>
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

          {/* ── Profile card ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
            <div className="flex items-start gap-5 flex-wrap">

              {/* Avatar */}
              {avatarSrc ? (
                <img src={avatarSrc} alt={manager.full_name}
                  className="w-[72px] h-[72px] rounded-full object-cover border-2 border-[#e2e8f0] shrink-0" />
              ) : (
                <PersonAvatar
                  initials={getInitials(manager.full_name)}
                  color={getColor(manager.full_name)}
                  size="xl"
                />
              )}

              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-[#0f172b] font-bold text-[20px] leading-[28px]">{manager.full_name}</h2>
                  {/* <PeopleStatusBadge status={manager.is_active ? 'Active' : 'Inactive'} /> */}
                </div>
                {/* role not in detail API — commented out
                <p className="text-[#62748e] text-[14px] mt-1">{manager.role}</p> */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {[
                    { icon: IconMail,     val: manager.email },
                    { icon: IconPhone,    val: manager.phone },
                    // role not available in detail response — commented out
                    // { icon: IconBriefcase, val: manager.role },
                    { icon: IconCalendar, val: manager.created_at
                        ? `Joined ${new Date(manager.created_at).toLocaleDateString('en-AU', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : null },
                    // lastActive not available — commented out
                    // { icon: IconCalendar, val: `Active ${manager.lastActive}` },
                  ].filter(r => r.val).map(({ icon: Icon, val }, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Icon />
                      <span className="text-[#45556c] text-[13px]">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Notes — shown if present */}
                {manager.notes && (
                  <p className="text-[#62748e] text-[13px] mt-3 leading-[20px] italic">"{manager.notes}"</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-4 flex-wrap">
                {[
                  { label: 'Assigned Jobs', value: manager.job_count          ?? 0, color: '#f54900' },
                  { label: 'Staff Members', value: manager.assigned_staff_count ?? 0, color: '#3b82f6' },
                ].map(s => (
                  <div key={s.label} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-center min-w-[90px]">
                    <p className="text-[22px] font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[11px] text-[#62748e] mt-0.5 whitespace-nowrap">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Assigned Jobs — from detail API ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
            <div className="px-6 py-4 border-b border-[#f1f5f9]">
              <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px]">Assigned Jobs</h3>
              <p className="text-[#90a1b9] text-[12px] mt-0.5">
                {manager.job_count ?? 0} job{(manager.job_count ?? 0) !== 1 ? 's' : ''} assigned to this manager
              </p>
            </div>

            {!manager.assigned_jobs || manager.assigned_jobs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#90a1b9] text-[14px]">No jobs assigned yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#f1f5f9]">
                {manager.assigned_jobs.map(job => (
                  <Link
                    key={job.id}
                    to={`/admin/jobs/${job.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-[8px] bg-[#fff3ee] border border-[#ffd5c2] flex items-center justify-center shrink-0">
                      <IconBriefcase2 />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0f172b] font-semibold text-[14px] truncate">
                        {job.title ?? job.name ?? `Job #${job.job_id}`}
                      </p>
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

          {/* Assigned Staff section — commented out (no staff-per-manager endpoint available)
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
            <div className="px-6 py-4 border-b border-[#f1f5f9]">
              <h3 className="text-[#1d293d] font-bold text-[15px]">Assigned Staff</h3>
              <p className="text-[#90a1b9] text-[12px] mt-0.5">{manager.assigned_staff_count} members</p>
            </div>
            ...staff list here...
          </div>
          */}

        </div>
      </div>
    </>
  )
}