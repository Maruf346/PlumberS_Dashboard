// src/pages/clients/ClientsPage.jsx
// /admin/clients  — URL params: ?search=&status=&page=1&size=10
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useCallback, useState } from 'react'
import { useNavigate, useSearchParams }   from 'react-router-dom'

import PageHeader              from '@/components/shared/PageHeader'
import PeopleStatusBadge       from '@/components/shared/PeopleStatusBadge'
import EnhancedTablePagination from '@/components/shared/EnhancedTablePagination'
import PeopleTableFilters      from '@/components/people/PeopleTableFilters'
import PeopleActionMenu        from '@/components/people/PeopleActionMenu'
import DeletePersonModal       from '@/components/people/DeletePersonModal'
import AddEditClientDrawer     from '@/pages/clients/AddEditClientDrawer'

import {
  CLIENTS as INITIAL_CLIENTS,
  PEOPLE_PAGE_SIZES,
  PEOPLE_DEFAULT_PAGE_SIZE,
} from '@/data/peopleMock'

// ── Inline icons ──────────────────────────────────────────────────────────────
function IconPlus() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
}
function IconMail() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2.5" width="11" height="8" rx="1.2" stroke="#90a1b9" strokeWidth="1"/><path d="M1 4l5.5 3.5L12 4" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/></svg>
}
function IconPhone() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 1.5h2.5l1.25 3-1.5 1C5.5 7 6 7.5 8 9.25l1-1.5L12 8.5v2.5c0 .5-3.5-.5-6-3s-3.5-5.5-3-6z" stroke="#90a1b9" strokeWidth="1" strokeLinejoin="round"/></svg>
}
function IconMapPin() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1C4.567 1 3 2.567 3 4.5 3 7.25 6.5 12 6.5 12S10 7.25 10 4.5C10 2.567 8.433 1 6.5 1z" stroke="#90a1b9" strokeWidth="1"/><circle cx="6.5" cy="4.5" r="1.2" fill="#90a1b9"/></svg>
}
function IconClipboard() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1.5" y="2" width="10" height="10" rx="1.2" stroke="#90a1b9" strokeWidth="1"/><path d="M4 2V1h5v1" stroke="#90a1b9" strokeWidth="1"/><path d="M4 6h5M4 8.5h3" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/></svg>
}
function IconUser() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.2" stroke="#90a1b9" strokeWidth="1"/><path d="M1.5 11.5c0-2.761 2.239-4.5 5-4.5s5 1.739 5 4.5" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/></svg>
}
function IconExternalLink() {
  return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M4.5 2H2v7h7V6.5M6.5 2H9v2.5M9 2L4.5 6.5" stroke="#1447e6" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

// ── Status tabs ───────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'All',      value: '' },
  { label: 'Active',   value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

// ── Avatar ────────────────────────────────────────────────────────────────────
function ClientAvatar({ client, size = 'md' }) {
  const sizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-[13px]' }
  const cls   = sizes[size] ?? sizes.md
  if (client.profilePicture) {
    return (
      <img src={client.profilePicture} alt={client.name}
        className={`${cls} rounded-full object-cover shrink-0 border border-[#e2e8f0]`} />
    )
  }
  return (
    <div className={`${cls} rounded-full flex items-center justify-center font-bold leading-none text-white shrink-0 select-none`}
      style={{ backgroundColor: client.color }}>
      {client.initials}
    </div>
  )
}

// ── Maps link ─────────────────────────────────────────────────────────────────
function buildMapsUrl(address) {
  if (!address?.trim()) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const navigate                        = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

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

  // ── Local data state ───────────────────────────────────────────────────────
  const [clients, setClients] = useState(INITIAL_CLIENTS)

  // ── Drawer + delete state ──────────────────────────────────────────────────
  const [drawerMode,   setDrawerMode]   = useState(null)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openAdd     = () => { setEditTarget(null);  setDrawerMode('add')  }
  const openEdit    = (c) => { setEditTarget(c);    setDrawerMode('edit') }
  const closeDrawer = () => { setDrawerMode(null);  setEditTarget(null)   }

  const handleSave = (data) => {
    if (drawerMode === 'edit') {
      setClients(prev => prev.map(c => c.id === data.id ? { ...c, ...data } : c))
    } else {
      const initials = data.name.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
      const colors   = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#06b6d4','#f54900']
      const color    = colors[clients.length % colors.length]
      setClients(prev => [{
        ...data,
        id:           `CLT-${Date.now()}`,
        initials,
        color,
        assignedJobs: 0,
        joinedDate:   new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }),
        lastActive:   'Just now',
      }, ...prev])
    }
  }

  const handleToggleStatus = (client) => {
    setClients(prev => prev.map(c =>
      c.id === client.id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c
    ))
  }

  const handleDelete = () => {
    setClients(prev => prev.filter(c => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  // ── Filter + paginate ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return clients.filter(c => {
      if (status && c.status !== status) return false
      if (search && ![c.name, c.email, c.phone, c.contactPersonName, c.address]
            .some(f => f?.toLowerCase().includes(search.toLowerCase()))) return false
      return true
    })
  }, [clients, search, status])

  const tabCounts = useMemo(() => STATUS_TABS.reduce((acc, t) => {
    acc[t.value] = t.value ? clients.filter(c => c.status === t.value).length : clients.length
    return acc
  }, {}), [clients])

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
          type="client"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="min-h-full flex">
        {/* ── Main content ── */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] min-w-0">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[#0f172b] font-bold text-[24px] leading-[32px]">Clients</h1>
              <p className="text-[#62748e] text-[14px] leading-[20px] mt-1">Manage your client accounts and site information</p>
            </div>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.3)] whitespace-nowrap shrink-0"
            >
              <IconPlus /> Add Client
            </button>
          </div>

          {/* Status tabs */}
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

          {/* Table card */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] overflow-hidden">

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-6 py-4 border-b border-[#f1f5f9]">
              <div className="shrink-0">
                <h2 className="text-[#1d293d] font-bold text-[16px] leading-[24px]">All Clients</h2>
                <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5">
                  {filtered.length} client{filtered.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <PeopleTableFilters
                search={search}   onSearchChange={v => setParam('search', v)}
                status={status}   onStatusChange={v => setParam('status', v)}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                searchPlaceholder="Search by name, email, phone or contact..."
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="px-5 py-[13px] w-10">
                      <input type="checkbox" className="w-[13px] h-[13px] rounded border-[#cad5e2] accent-[#f54900] cursor-pointer" readOnly/>
                    </th>
                    {['Client','Email','Phone','Address','Contact Person','Jobs','Status',''].map((col, i) => (
                      <th key={i} className={`px-4 py-[13px] text-[13px] font-bold text-[#62748e] leading-[20px] whitespace-nowrap ${i === 7 ? 'text-right' : 'text-left'}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-[#f8fafc] border-2 border-[#e2e8f0] flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="14" rx="2" stroke="#cad5e2" strokeWidth="1.5"/><circle cx="9" cy="12" r="2.5" stroke="#cad5e2" strokeWidth="1.5"/><path d="M5 20c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#cad5e2" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 10h5M15 14h3" stroke="#cad5e2" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </div>
                          <div>
                            <p className="text-[#0f172b] font-bold text-[16px]">
                              {hasActiveFilters ? 'No clients match your filters' : 'No clients yet'}
                            </p>
                            <p className="text-[#90a1b9] text-[13px] mt-1">
                              {hasActiveFilters ? 'Try adjusting your search or filters.' : 'Add your first client to get started.'}
                            </p>
                          </div>
                          {hasActiveFilters
                            ? <button onClick={clearFilters} className="px-4 py-2 border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#314158] hover:bg-[#f8fafc] transition-colors">Clear Filters</button>
                            : <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[#f54900] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#c73b00] transition-colors"><IconPlus/>Add Client</button>
                          }
                        </div>
                      </td>
                    </tr>
                  ) : paginated.map(client => {
                    const mapsUrl = buildMapsUrl(client.address)
                    return (
                      <tr key={client.id}
                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                        className="border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer">

                        {/* Checkbox */}
                        <td className="px-5 py-[14px]" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" className="w-[13px] h-[13px] rounded border-[#cad5e2] accent-[#f54900] cursor-pointer"/>
                        </td>

                        {/* Avatar + name + ID */}
                        <td className="px-4 py-[14px]">
                          <div className="flex items-center gap-3">
                            <ClientAvatar client={client} />
                            <div>
                              <p className="text-[#0f172b] text-[14px] font-semibold leading-[20px] whitespace-nowrap">{client.name}</p>
                              <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5 font-mono">{client.id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-[14px]">
                          <div className="flex items-center gap-1.5">
                            <IconMail />
                            <span className="text-[#45556c] text-[13px] whitespace-nowrap">{client.email}</span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-[14px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <IconPhone />
                            <span className="text-[#45556c] text-[13px]">{client.phone}</span>
                          </div>
                        </td>

                        {/* Address → maps link */}
                        <td className="px-4 py-[14px]" onClick={e => e.stopPropagation()}>
                          <div className="flex items-start gap-1.5 max-w-[180px]">
                            <IconMapPin />
                            {mapsUrl ? (
                              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                                className="text-[#1447e6] text-[13px] leading-[18px] hover:underline line-clamp-2 flex items-start gap-1">
                                <span className="line-clamp-2">{client.address}</span>
                                <IconExternalLink />
                              </a>
                            ) : (
                              <span className="text-[#45556c] text-[13px] line-clamp-2">{client.address}</span>
                            )}
                          </div>
                        </td>

                        {/* Contact person */}
                        <td className="px-4 py-[14px]">
                          <div className="flex items-center gap-1.5">
                            <IconUser />
                            <span className="text-[#314158] text-[13px] whitespace-nowrap">{client.contactPersonName}</span>
                          </div>
                        </td>

                        {/* Jobs count */}
                        <td className="px-4 py-[14px]">
                          <div className="flex items-center gap-1.5">
                            <IconClipboard />
                            <span className="text-[13px] font-semibold text-[#314158]">{client.assignedJobs}</span>
                            <span className="text-[12px] text-[#90a1b9]">jobs</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-[14px]">
                          <PeopleStatusBadge status={client.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-[14px] text-right" onClick={e => e.stopPropagation()}>
                          <PeopleActionMenu
                            personId={client.id}
                            type="client"
                            isActive={client.status === 'Active'}
                            onEdit={() => openEdit(client)}
                            onToggleStatus={() => handleToggleStatus(client)}
                            onDelete={() => setDeleteTarget(client)}
                          />
                        </td>
                      </tr>
                    )
                  })}
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

        {/* ── Drawer ── */}
        {drawerMode && (
          <>
            <div className="hidden xl:block fixed inset-0 z-30 bg-[#0f172b]/10 cursor-pointer" onClick={closeDrawer} />
            <div className="fixed right-0 top-0 h-full z-40 flex">
              <AddEditClientDrawer
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
