// src/pages/managers/ManagersPage.jsx
// GET /api/user/admin/managerlist/?search=&is_active=&page=
// POST /api/user/admin/managers/create/   (via drawer)
// PATCH /api/user/admin/manager/{id}/update/  (via drawer)
// DELETE /api/user/admin/manager/{id}/delete/
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useSearchParams }      from 'react-router-dom'

import PageHeader              from '@/components/shared/PageHeader'
import PersonAvatar            from '@/components/shared/PersonAvatar'
import PeopleStatusBadge       from '@/components/shared/PeopleStatusBadge'
import EnhancedTablePagination from '@/components/shared/EnhancedTablePagination'
import PeopleTableFilters      from '@/components/people/PeopleTableFilters'
import PeopleEmptyState        from '@/components/people/PeopleEmptyState'
import DeletePersonModal       from '@/components/people/DeletePersonModal'
import AddEditManagerDrawer    from '@/pages/managers/AddEditManagerDrawer'
import { apiFetch }            from '@/utils/apiFetch'
import { PEOPLE_PAGE_SIZES, PEOPLE_DEFAULT_PAGE_SIZE } from '@/data/peopleMock'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconPlus()      { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg> }
function IconMail()      { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2.5" width="11" height="8" rx="1.2" stroke="#90a1b9" strokeWidth="1"/><path d="M1 4l5.5 3.5L12 4" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/></svg> }
function IconPhone()     { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 1.5h2.5l1.25 3-1.5 1C5.5 7 6 7.5 8 9.25l1-1.5L12 8.5v2.5c0 .5-3.5-.5-6-3s-3.5-5.5-3-6z" stroke="#90a1b9" strokeWidth="1" strokeLinejoin="round"/></svg> }
function IconBriefcase() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="4" width="11" height="8" rx="1.2" stroke="#90a1b9" strokeWidth="1"/><path d="M4.5 4V3A1.5 1.5 0 016 1.5h1A1.5 1.5 0 018.5 3v1" stroke="#90a1b9" strokeWidth="1"/></svg> }
function IconClipboard() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="2" width="10" height="10" rx="1.2" stroke="#90a1b9" strokeWidth="1"/><path d="M4 2V1h5v1" stroke="#90a1b9" strokeWidth="1"/><path d="M4 6h5M4 8.5h3" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/></svg> }

// ── Status tabs — maps to is_active query param ───────────────────────────────
const STATUS_TABS = [
  { label: 'All',      value: '' },
  { label: 'Active',   value: 'true' },
  { label: 'Inactive', value: 'false' },
]

// ── Avatar helpers ────────────────────────────────────────────────────────────
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

function ManagerAvatar({ mgr }) {
  if (mgr.profile_picture) {
    return <img src={mgr.profile_picture} alt={mgr.full_name}
      className="w-9 h-9 rounded-full object-cover border border-[#e2e8f0] shrink-0" />
  }
  return <PersonAvatar initials={getInitials(mgr.full_name)} color={getColor(mgr.full_name)} size="md" />
}

function Spinner() {
  return (
    <tr><td colSpan={7} className="px-5 py-20 text-center">
      <div className="flex justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
      </div>
    </td></tr>
  )
}

// ── Inline action menu (edit + delete only — no deactivate per requirements) ──
function ManagerActionMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative flex justify-end">
      <button onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#f1f5f9] text-[#90a1b9] hover:text-[#314158] transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3.5" r="1.2" fill="currentColor"/>
          <circle cx="8" cy="8"   r="1.2" fill="currentColor"/>
          <circle cx="8" cy="12.5" r="1.2" fill="currentColor"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-[152px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0_4px_16px_rgba(15,23,43,0.12)] py-1 overflow-hidden">
            <button onClick={e => { e.stopPropagation(); setOpen(false); onEdit() }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#314158] hover:bg-[#f8fafc] transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2l2.5 2.5-7 7H2.5V9l7-7z" stroke="#314158" strokeWidth="1.1" strokeLinejoin="round"/></svg>
              Edit
            </button>
            <div className="h-px bg-[#f1f5f9] mx-2"/>
            <button onClick={e => { e.stopPropagation(); setOpen(false); onDelete() }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#c10007] hover:bg-[#fef2f2] transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M3 4l.8 8h6.4L11 4" stroke="#c10007" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ManagersPage() {
  const navigate                        = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const search    = searchParams.get('search')   ?? ''
  const isActive  = searchParams.get('status')   ?? ''   // 'true' | 'false' | ''
  const page      = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize  = PEOPLE_PAGE_SIZES.includes(Number(searchParams.get('size')))
                      ? Number(searchParams.get('size'))
                      : PEOPLE_DEFAULT_PAGE_SIZE

  const setParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value); else next.delete(key)
      next.set('page', '1')
      return next
    })
  }, [setSearchParams])

  const setPage = useCallback((p) => {
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n })
  }, [setSearchParams])

  const setSize = useCallback((s) => {
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('size', String(s)); n.set('page','1'); return n })
  }, [setSearchParams])

  const clearFilters = useCallback(() => setSearchParams({}), [setSearchParams])
  const hasActiveFilters = !!(search || isActive)

  // ── API state ──────────────────────────────────────────────────────────────
  const [managers,    setManagers]    = useState([])
  const [totalCount,  setTotalCount]  = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  // ── Drawer / delete state ──────────────────────────────────────────────────
  const [drawerMode,   setDrawerMode]   = useState(null)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  // ── Fetch managers ─────────────────────────────────────────────────────────
  const fetchManagers = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (search)   params.set('search',    search)
    if (isActive) params.set('is_active', isActive)

    const { data, ok } = await apiFetch(`user/admin/managerlist/?${params.toString()}`)
    if (ok && data) {
      setManagers(data.results ?? [])
      setTotalCount(data.count ?? 0)
    } else {
      setError('Failed to load managers. Please refresh.')
    }
    setLoading(false)
  }, [page, search, isActive])

  useEffect(() => { fetchManagers() }, [fetchManagers])

  // ── Tab counts ─────────────────────────────────────────────────────────────
  // Only total count is available from one API call; individual tab counts
  // would require separate requests — show total on "All" tab only
  const tabCounts = { '': totalCount, 'true': null, 'false': null }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openAdd     = () => { setEditTarget(null);  setDrawerMode('add')  }
  const openEdit    = (mgr) => { setEditTarget(mgr); setDrawerMode('edit') }
  const closeDrawer = () => { setDrawerMode(null); setEditTarget(null) }

  const handleSave = async () => { await fetchManagers() }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { ok } = await apiFetch(`user/admin/manager/${deleteTarget.id}/delete/`, { method: 'DELETE' })
    if (ok) {
      setDeleteTarget(null)
      await fetchManagers()
    }
    setDeleting(false)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {deleteTarget && (
        <DeletePersonModal
          person={{ ...deleteTarget, name: deleteTarget.full_name }}
          type="manager"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="min-h-full flex">
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] min-w-0">

          {/* Header */}
          <PageHeader title="Managers" subtitle="Manage your field operations managers">
            <button onClick={openAdd}
              className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.3)] whitespace-nowrap">
              <IconPlus /> Add Manager
            </button>
          </PageHeader>

          {/* Status tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_TABS.map(tab => {
              const active = isActive === tab.value
              const count  = tabCounts[tab.value]
              return (
                <button key={tab.value} onClick={() => setParam('status', tab.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors ${active ? 'bg-[#0f172b] text-white' : 'bg-white border border-[#e2e8f0] text-[#62748e] hover:bg-[#f8fafc]'}`}>
                  {tab.label}
                  {count !== null && (
                    <span className={`inline-flex items-center justify-center rounded-full min-w-[20px] h-5 px-1.5 text-[11px] font-bold leading-none ${active ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#62748e]'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-[10px]">
              <p className="text-[#c10007] text-[13px] font-semibold">{error}</p>
            </div>
          )}

          {/* Table card */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-6 py-4 border-b border-[#f1f5f9]">
              <div className="shrink-0">
                <h2 className="text-[#1d293d] font-bold text-[16px] leading-[24px]">All Managers</h2>
                <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5">
                  {loading ? 'Loading…' : `${totalCount} manager${totalCount !== 1 ? 's' : ''} found`}
                </p>
              </div>
              <PeopleTableFilters
                search={search}   onSearchChange={v => setParam('search', v)}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                searchPlaceholder="Search by name, email or phone..."
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="px-5 py-[13px] w-10">
                      <input type="checkbox" className="w-[13px] h-[13px] rounded border-[#cad5e2] accent-[#f54900] cursor-pointer" readOnly/>
                    </th>
                    {['Manager','Email','Phone','Role','Jobs',''].map((col, i) => (
                      <th key={i} className={`px-4 py-[13px] text-[13px] font-bold text-[#62748e] leading-[20px] whitespace-nowrap ${i === 6 ? 'text-right' : 'text-left'}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? <Spinner /> : managers.length === 0 ? (
                    <PeopleEmptyState
                      type="manager"
                      hasFilters={hasActiveFilters}
                      onClear={clearFilters}
                      onAdd={openAdd}
                    />
                  ) : managers.map(mgr => (
                    <tr key={mgr.id}
                      onClick={() => navigate(`/admin/managers/${mgr.id}`)}
                      className="border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer">

                      {/* Checkbox */}
                      <td className="px-5 py-[14px]" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="w-[13px] h-[13px] rounded border-[#cad5e2] accent-[#f54900] cursor-pointer"/>
                      </td>

                      {/* Avatar + name  — ID commented out per requirements */}
                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-3">
                          <ManagerAvatar mgr={mgr} />
                          <div>
                            <p className="text-[#0f172b] text-[14px] font-semibold leading-[20px] whitespace-nowrap">{mgr.full_name}</p>
                            {/* <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5 font-['Consolas',monospace]">{mgr.id}</p> */}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-1.5">
                          <IconMail />
                          <span className="text-[#45556c] text-[13px] whitespace-nowrap">{mgr.email}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-[14px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <IconPhone />
                          <span className="text-[#45556c] text-[13px]">{mgr.phone}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-1.5">
                          <IconBriefcase />
                          <span className="text-[#314158] text-[13px] whitespace-nowrap">{mgr.role ?? '—'}</span>
                        </div>
                      </td>

                      {/* Job count */}
                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-1.5">
                          <IconClipboard />
                          <span className="text-[13px] font-semibold text-[#314158]">{mgr.job_count ?? 0}</span>
                          <span className="text-[12px] text-[#90a1b9]">jobs</span>
                        </div>
                      </td>

                      {/* Status */}
                      {/* <td className="px-4 py-[14px]">
                        <PeopleStatusBadge status={mgr.is_active ? 'Active' : 'Inactive'} />
                      </td> */}

                      {/* Actions — no deactivate per requirements */}
                      <td className="px-4 py-[14px] text-right" onClick={e => e.stopPropagation()}>
                        <ManagerActionMenu
                          onEdit={() => openEdit(mgr)}
                          onDelete={() => setDeleteTarget(mgr)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalCount > 0 && (
              <EnhancedTablePagination
                page={page}
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount}
                totalResults={totalCount}
                pageSize={pageSize}
                pageSizeOptions={PEOPLE_PAGE_SIZES}
                onPageChange={setPage}
                onPageSizeChange={setSize}
              />
            )}
          </div>
        </div>

        {/* Drawer */}
        {drawerMode && (
          <>
            <div className="hidden xl:block fixed inset-0 z-30 bg-[#0f172b]/10 cursor-pointer" onClick={closeDrawer} />
            <div className="fixed right-0 top-0 h-full z-40 flex">
              <AddEditManagerDrawer
                mode={drawerMode}
                initialData={editTarget}
                onClose={closeDrawer}
                onSave={handleSave}
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}