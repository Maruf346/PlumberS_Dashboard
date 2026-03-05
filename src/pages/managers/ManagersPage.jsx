// src/pages/managers/ManagersPage.jsx
// Figma: Managers Management — /admin/managers
// URL params: ?search=&status=&page=1&size=10
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useCallback, useState } from 'react'
import { useNavigate, useSearchParams }   from 'react-router-dom'

import PageHeader              from '@/components/shared/PageHeader'
import PersonAvatar            from '@/components/shared/PersonAvatar'
import PeopleStatusBadge       from '@/components/shared/PeopleStatusBadge'
import EnhancedTablePagination from '@/components/shared/EnhancedTablePagination'

import PeopleTableFilters      from '@/components/people/PeopleTableFilters'
import PeopleActionMenu        from '@/components/people/PeopleActionMenu'
import PeopleEmptyState        from '@/components/people/PeopleEmptyState'
import DeletePersonModal       from '@/components/people/DeletePersonModal'
import AddEditManagerDrawer    from '@/pages/managers/AddEditManagerDrawer'

import {
  MANAGERS as INITIAL_MANAGERS,
  PEOPLE_PAGE_SIZES,
  PEOPLE_DEFAULT_PAGE_SIZE,
} from '@/data/peopleMock'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}
function IconMail() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1" y="2.5" width="11" height="8" rx="1.2" stroke="#90a1b9" strokeWidth="1"/>
      <path d="M1 4l5.5 3.5L12 4" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}
function IconPhone() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M2.5 1.5h2.5l1.25 3-1.5 1C5.5 7 6 7.5 8 9.25l1-1.5L12 8.5v2.5c0 .5-3.5-.5-6-3s-3.5-5.5-3-6z"
        stroke="#90a1b9" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  )
}
function IconBriefcase() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1" y="4" width="11" height="8" rx="1.2" stroke="#90a1b9" strokeWidth="1"/>
      <path d="M4.5 4V3A1.5 1.5 0 016 1.5h1A1.5 1.5 0 018.5 3v1" stroke="#90a1b9" strokeWidth="1"/>
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1.5" y="2" width="10" height="10" rx="1.2" stroke="#90a1b9" strokeWidth="1"/>
      <path d="M4 2V1h5v1" stroke="#90a1b9" strokeWidth="1"/>
      <path d="M4 6h5M4 8.5h3" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}

// ── Status tabs ───────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'All',      value: '' },
  { label: 'Active',   value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

// ─────────────────────────────────────────────────────────────────────────────
export default function ManagersPage() {
  const navigate                        = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // ── URL param state ────────────────────────────────────────────────────────
  const search   = searchParams.get('search') ?? ''
  const status   = searchParams.get('status') ?? ''
  const page     = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize = PEOPLE_PAGE_SIZES.includes(Number(searchParams.get('size')))
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

  const hasActiveFilters = !!(search || status)

  // ── Local data state (mock — no API) ──────────────────────────────────────
  const [managers, setManagers] = useState(INITIAL_MANAGERS)

  // ── Drawer state ──────────────────────────────────────────────────────────
  const [drawerMode,    setDrawerMode]    = useState(null)   // null | 'add' | 'edit'
  const [editTarget,    setEditTarget]    = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)

  const openAdd  = () => { setEditTarget(null);  setDrawerMode('add') }
  const openEdit = (mgr) => { setEditTarget(mgr); setDrawerMode('edit') }
  const closeDrawer = () => { setDrawerMode(null); setEditTarget(null) }

  const handleSave = (data) => {
    if (drawerMode === 'edit') {
      setManagers(prev => prev.map(m => m.id === data.id ? { ...m, ...data } : m))
    } else {
      const newMgr = { ...data, id: `MGR-${Date.now()}`, assignedJobs: 0, staffCount: 0,
        joinedDate: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
        lastActive: 'Just now', initials: data.name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase(),
        color: '#f54900' }
      setManagers(prev => [newMgr, ...prev])
    }
  }

  const handleToggleStatus = (mgr) => {
    setManagers(prev => prev.map(m =>
      m.id === mgr.id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m
    ))
  }

  const handleDelete = () => {
    setManagers(prev => prev.filter(m => m.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  // ── Filtering + pagination ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    // TODO: Replace with real API fetch
    // const fetchManagers = async () => {
    //   const res = await axios.get('/api/managers', { params: { search, status, page, size: pageSize } })
    //   setManagers(res.data.managers); setTotal(res.data.total)
    // }
    return managers.filter(m => {
      if (status && m.status !== status) return false
      if (search && ![m.name, m.email, m.phone, m.role]
            .some(f => f.toLowerCase().includes(search.toLowerCase()))) return false
      return true
    })
  }, [managers, search, status])

  const tabCounts = useMemo(() => STATUS_TABS.reduce((acc, t) => {
    acc[t.value] = t.value ? managers.filter(m => m.status === t.value).length : managers.length
    return acc
  }, {}), [managers])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Delete modal */}
      {deleteTarget && (
        <DeletePersonModal
          person={deleteTarget}
          type="manager"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Layout: backdrop + drawer */}
      <div className="min-h-full flex">
        {/* Main content */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] min-w-0">

          {/* ── Header ── */}
          <PageHeader title="Managers" subtitle="Manage your field operations managers">
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.3)] whitespace-nowrap"
            >
              <IconPlus /> Add Manager
            </button>
          </PageHeader>

          {/* ── Status tabs ── */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_TABS.map(tab => {
              const active = status === tab.value
              return (
                <button key={tab.value} onClick={() => setParam('status', tab.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors ${active ? 'bg-[#0f172b] text-white' : 'bg-white border border-[#e2e8f0] text-[#62748e] hover:bg-[#f8fafc]'}`}>
                  {tab.label}
                  <span className={`inline-flex items-center justify-center rounded-full min-w-[20px] h-5 px-1.5 text-[11px] font-bold leading-none ${active ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#62748e]'}`}>
                    {tabCounts[tab.value]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ── Table card ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-6 py-4 border-b border-[#f1f5f9]">
              <div className="shrink-0">
                <h2 className="text-[#1d293d] font-bold text-[16px] leading-[24px]">All Managers</h2>
                <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5">
                  {filtered.length} manager{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <PeopleTableFilters
                search={search}   onSearchChange={v => setParam('search', v)}
                status={status}   onStatusChange={v => setParam('status', v)}
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
                    {['Manager','Email','Phone','Role','Jobs','Status',''].map((col, i) => (
                      <th key={i}
                        className={`px-4 py-[13px] text-[13px] font-bold text-[#62748e] leading-[20px] whitespace-nowrap ${i === 6 ? 'text-right' : 'text-left'}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <PeopleEmptyState
                      type="manager"
                      hasFilters={hasActiveFilters}
                      onClear={clearFilters}
                      onAdd={openAdd}
                    />
                  ) : paginated.map(mgr => (
                    <tr
                      key={mgr.id}
                      onClick={() => navigate(`/admin/managers/${mgr.id}`)}
                      className="border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer"
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-[14px]" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="w-[13px] h-[13px] rounded border-[#cad5e2] accent-[#f54900] cursor-pointer"/>
                      </td>

                      {/* Avatar + name */}
                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-3">
                          <PersonAvatar initials={mgr.initials} color={mgr.color} size="md" />
                          <div>
                            <p className="text-[#0f172b] text-[14px] font-semibold leading-[20px] whitespace-nowrap">{mgr.name}</p>
                            <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5 font-['Consolas',monospace]">{mgr.id}</p>
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
                      {/* <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-1.5">
                          <IconBriefcase />
                          <span className="text-[#314158] text-[13px] whitespace-nowrap">{mgr.role}</span>
                        </div>
                      </td> */}

                      {/* Assigned jobs */}
                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-1.5">
                          <IconClipboard />
                          <span className="text-[13px] font-semibold text-[#314158]">{mgr.assignedJobs}</span>
                          <span className="text-[12px] text-[#90a1b9]">jobs</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-[14px]">
                        <PeopleStatusBadge status={mgr.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-[14px] text-right" onClick={e => e.stopPropagation()}>
                        <PeopleActionMenu
                          personId={mgr.id}
                          type="manager"
                          isActive={mgr.status === 'Active'}
                          onEdit={() => openEdit(mgr)}
                          onToggleStatus={() => handleToggleStatus(mgr)}
                          onDelete={() => setDeleteTarget(mgr)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <EnhancedTablePagination
                currentPage={safePage}
                totalPages={totalPages}
                totalResults={filtered.length}
                pageSize={pageSize}
                pageSizeOptions={PEOPLE_PAGE_SIZES}
                onPageChange={setPage}
                onPageSizeChange={setSize}
              />
            )}
          </div>
        </div>

        {/* ── Drawer panel ── */}
        {drawerMode && (
          <>
            {/* Backdrop — click to close */}
            <div
              className="hidden xl:block fixed inset-0 z-30 bg-[#0f172b]/10 cursor-pointer"
              onClick={closeDrawer}
            />
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
