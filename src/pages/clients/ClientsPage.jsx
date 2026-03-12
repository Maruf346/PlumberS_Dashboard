// src/pages/clients/ClientsPage.jsx
// GET  /api/clients/?search=&is_active=&page=&page_size=
// POST /api/clients/create/
// PATCH /api/clients/{id}/  (toggle active)
// DELETE /api/clients/{id}/
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useSearchParams }      from 'react-router-dom'

import PageHeader              from '@/components/shared/PageHeader'
import PeopleStatusBadge       from '@/components/shared/PeopleStatusBadge'
import EnhancedTablePagination from '@/components/shared/EnhancedTablePagination'
import PeopleTableFilters      from '@/components/people/PeopleTableFilters'
import PeopleActionMenu        from '@/components/people/PeopleActionMenu'
import DeletePersonModal       from '@/components/people/DeletePersonModal'
import AddEditClientDrawer     from '@/pages/clients/AddEditClientDrawer'
import { apiFetch }            from '@/utils/apiFetch'
import { PEOPLE_PAGE_SIZES, PEOPLE_DEFAULT_PAGE_SIZE } from '@/data/peopleMock'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconPlus()         { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg> }
function IconMail()         { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2.5" width="11" height="8" rx="1.2" stroke="#90a1b9" strokeWidth="1"/><path d="M1 4l5.5 3.5L12 4" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/></svg> }
function IconPhone()        { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 1.5h2.5l1.25 3-1.5 1C5.5 7 6 7.5 8 9.25l1-1.5L12 8.5v2.5c0 .5-3.5-.5-6-3s-3.5-5.5-3-6z" stroke="#90a1b9" strokeWidth="1" strokeLinejoin="round"/></svg> }
function IconMapPin()       { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1C4.567 1 3 2.567 3 4.5 3 7.25 6.5 12 6.5 12S10 7.25 10 4.5C10 2.567 8.433 1 6.5 1z" stroke="#90a1b9" strokeWidth="1"/><circle cx="6.5" cy="4.5" r="1.2" fill="#90a1b9"/></svg> }
function IconUser()         { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.2" stroke="#90a1b9" strokeWidth="1"/><path d="M1.5 11.5c0-2.761 2.239-4.5 5-4.5s5 1.739 5 4.5" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/></svg> }
function IconExternalLink() { return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M4.5 2H2v7h7V6.5M6.5 2H9v2.5M9 2L4.5 6.5" stroke="#1447e6" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }

// ── Status tabs ───────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'All',      value: '' },
  { label: 'Active',   value: 'true' },
  { label: 'Inactive', value: 'false' },
]

// ── Avatar ────────────────────────────────────────────────────────────────────
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

function ClientAvatar({ client }) {
  if (client.profile_picture) {
    return <img src={client.profile_picture} alt={client.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#e2e8f0]" />
  }
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] leading-none text-white shrink-0 select-none"
      style={{ backgroundColor: getColor(client.name) }}>
      {getInitials(client.name)}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ClientsPage() {
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

  // ── API data state ─────────────────────────────────────────────────────────
  const [clients,    setClients]    = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  // ── Drawer + delete ────────────────────────────────────────────────────────
  const [drawerMode,   setDrawerMode]   = useState(null)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  // ── Fetch clients from API ─────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.set('page',      String(page))
    params.set('page_size', String(pageSize))
    if (search)   params.set('search',    search)
    if (isActive) params.set('is_active', isActive)   // 'true' or 'false'

    const { data, ok } = await apiFetch(`clients/?${params.toString()}`)
    if (ok && data) {
      setClients(data.results ?? [])
      setTotalCount(data.count ?? 0)
    } else {
      setError('Failed to load clients. Please refresh.')
    }
    setLoading(false)
  }, [page, pageSize, search, isActive])

  useEffect(() => { fetchClients() }, [fetchClients])

  // ── Tab counts (derived from total + active filter) ───────────────────────
  // We only have the current page's data, so show total for current filter
  // and omit individual counts for inactive tabs (would need separate calls)
  const tabCounts = { '': totalCount }

  // ── Add client ─────────────────────────────────────────────────────────────
  const handleSave = async (formData) => {
    // AddEditClientDrawer calls this after a successful API call
    // Just re-fetch to get fresh server data
    await fetchClients()
  }

  // ── Toggle active/inactive (PATCH) ────────────────────────────────────────
  const handleToggleStatus = async (client) => {
    const newActive = !client.is_active
    // Optimistic update
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, is_active: newActive } : c))

    const { ok } = await apiFetch(`clients/${client.id}/`, {
      method: 'PATCH',
      body:   JSON.stringify({ is_active: newActive }),
    })
    if (!ok) {
      // Revert on failure
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, is_active: client.is_active } : c))
    }
  }

  // ── Delete client ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { ok } = await apiFetch(`clients/${deleteTarget.id}/`, { method: 'DELETE' })
    if (ok) {
      setDeleteTarget(null)
      await fetchClients()
    }
    setDeleting(false)
  }

  const openAdd     = () => { setEditTarget(null);  setDrawerMode('add')  }
  const openEdit    = (c) => { setEditTarget(c);    setDrawerMode('edit') }
  const closeDrawer = () => { setDrawerMode(null);  setEditTarget(null)   }

  const hasActiveFilters = !!(search || isActive)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {deleteTarget && (
        <DeletePersonModal
          person={deleteTarget}
          type="client"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="min-h-full flex">
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] min-w-0">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[#0f172b] font-bold text-[24px] leading-[32px]">Clients</h1>
              <p className="text-[#62748e] text-[14px] leading-[20px] mt-1">Manage your client accounts and site information</p>
            </div>
            <button onClick={openAdd}
              className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.3)] whitespace-nowrap shrink-0">
              <IconPlus /> Add Client
            </button>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-1 border-b border-[#e2e8f0]">
            {STATUS_TABS.map(tab => (
              <button key={tab.value}
                onClick={() => setParam('status', tab.value)}
                className={[
                  'px-4 py-2.5 text-[14px] font-medium transition-colors relative whitespace-nowrap',
                  isActive === tab.value
                    ? 'text-[#f54900] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#f54900] after:rounded-t'
                    : 'text-[#62748e] hover:text-[#314158]',
                ].join(' ')}>
                {tab.label}
                {tab.value === '' && totalCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-[#f1f5f9] text-[#62748e] text-[11px] font-bold rounded-full">
                    {totalCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filters */}
          <PeopleTableFilters
            search={search}
            onSearchChange={v => setParam('search', v)}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            searchPlaceholder="Search clients by name, email, phone…"
          />

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-[10px]">
              <p className="text-[#c10007] text-[13px] font-semibold">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1.8fr_1.4fr_1fr_80px] gap-4 px-6 py-3 border-b border-[#f1f5f9] bg-[#f8fafc]">
              {['CLIENT','CONTACT','ADDRESS','STATUS','ACTIONS'].map(h => (
                <span key={h} className="text-[11px] font-bold text-[#90a1b9] uppercase tracking-[0.6px]">{h}</span>
              ))}
            </div>

            {loading ? <Spinner /> : clients.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[#90a1b9] text-[14px]">
                  {hasActiveFilters ? 'No clients match your filters.' : 'No clients yet. Add your first client above.'}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-3 text-[#f54900] text-[13px] font-medium hover:underline">
                    Clear filters
                  </button>
                )}
              </div>
            ) : clients.map((client, idx) => (
              <div key={client.id}
                className={`grid grid-cols-[2fr_1.8fr_1.4fr_1fr_80px] gap-4 px-6 py-4 items-center hover:bg-[#f8fafc] transition-colors cursor-pointer ${idx > 0 ? 'border-t border-[#f1f5f9]' : ''}`}
                onClick={() => navigate(`/admin/clients/${client.id}`)}>

                {/* Client name + email */}
                <div className="flex items-center gap-3 min-w-0">
                  <ClientAvatar client={client} />
                  <div className="min-w-0">
                    <p className="text-[#0f172b] font-semibold text-[14px] truncate">{client.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <IconMail />
                      <span className="text-[#90a1b9] text-[12px] truncate">{client.email}</span>
                    </div>
                  </div>
                </div>

                {/* Contact person + phone */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <IconUser />
                    <span className="text-[#314158] text-[13px] truncate">{client.contact_person_name || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <IconPhone />
                    <span className="text-[#90a1b9] text-[12px] truncate">{client.phone}</span>
                  </div>
                </div>

                {/* Address + maps link */}
                <div className="min-w-0" onClick={e => e.stopPropagation()}>
                  <div className="flex items-start gap-1">
                    <IconMapPin />
                    <span className="text-[#314158] text-[12px] line-clamp-2 leading-[18px]">{client.address || '—'}</span>
                  </div>
                  {client.maps_url && (
                    <a href={client.maps_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#1447e6] text-[11px] font-medium hover:underline mt-0.5">
                      <IconExternalLink /> Maps
                    </a>
                  )}
                </div>

                {/* Status badge */}
                <div>
                  <PeopleStatusBadge status={client.is_active ? 'Active' : 'Inactive'} />
                  <p className="text-[11px] text-[#90a1b9] mt-1">{client.job_count ?? 0} job{client.job_count !== 1 ? 's' : ''}</p>
                </div>

                {/* Actions */}
                <div onClick={e => e.stopPropagation()}>
                  <PeopleActionMenu
                    personId={client.id}
                    type="client"
                    onEdit={() => openEdit(client)}
                    onToggleStatus={() => handleToggleStatus(client)}
                    onDelete={() => setDeleteTarget(client)}
                    isActive={client.is_active}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {!loading && totalCount > 0 && (
            <EnhancedTablePagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalCount={totalCount}
              pageSizes={PEOPLE_PAGE_SIZES}
              onPageChange={setPage}
              onPageSizeChange={setSize}
            />
          )}

        </div>

        {/* Drawer */}
        {drawerMode && (
          <>
            <div className="fixed inset-0 z-30 bg-[#0f172b]/10 hidden xl:block" onClick={closeDrawer}/>
            <div className="fixed right-0 top-0 h-full z-40">
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