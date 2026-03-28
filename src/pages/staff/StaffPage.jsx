// src/pages/staff/StaffPage.jsx
// GET /api/user/admin/employeelist/?search=&is_active=&page=&page_size=
// DELETE /api/user/admin/users/{id}/
// POST /api/user/admin/users/{id}/block/  (toggle active/inactive)
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
import { apiFetch }            from '@/utils/apiFetch'
import { PEOPLE_PAGE_SIZES, PEOPLE_DEFAULT_PAGE_SIZE } from '@/data/peopleMock'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconMail()      { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2.5" width="11" height="8" rx="1.2" stroke="#90a1b9" strokeWidth="1"/><path d="M1 4l5.5 3.5L12 4" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/></svg> }
function IconBriefcase() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="4" width="11" height="8" rx="1.2" stroke="#90a1b9" strokeWidth="1"/><path d="M4.5 4V3A1.5 1.5 0 016 1.5h1A1.5 1.5 0 018.5 3v1" stroke="#90a1b9" strokeWidth="1"/></svg> }
function IconPhone()     { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 1.5h2.5l1.25 3-1.5 1C5.5 7 6 7.5 8 9.25l1-1.5L12 8.5v2.5c0 .5-3.5-.5-6-3s-3.5-5.5-3-6z" stroke="#90a1b9" strokeWidth="1" strokeLinejoin="round"/></svg> }

// ── Status tabs ───────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { label: 'All',      value: '' },
  { label: 'Active',   value: 'true' },
  { label: 'Inactive', value: 'false' },
]

// ── Avatar helper ─────────────────────────────────────────────────────────────
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

function EmployeeAvatar({ emp }) {
  if (emp.profile_picture) {
    return <img src={emp.profile_picture} alt={emp.full_name}
      className="w-9 h-9 rounded-full object-cover border border-[#e2e8f0] shrink-0" />
  }
  return <PersonAvatar initials={getInitials(emp.full_name)} color={getColor(emp.full_name)} size="md" />
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

function StaffActionMenu({ emp, onToggle, onDelete }) {
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
          <div className="absolute right-0 top-9 z-20 w-[160px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0_4px_16px_rgba(15,23,43,0.12)] py-1 overflow-hidden">
            <button onClick={e => { e.stopPropagation(); setOpen(false); onToggle() }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[#314158] hover:bg-[#f8fafc] transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7c0-2.761 2.239-5 5-5s5 2.239 5 5-2.239 5-5 5-5-2.239-5-5z" stroke="#62748e" strokeWidth="1.1"/><path d="M5 7h4" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg>
              {emp.is_active ? 'Deactivate' : 'Activate'}
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
export default function StaffPage() {
  const navigate                        = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const search    = searchParams.get('search')  ?? ''
  const isActive  = searchParams.get('status')  ?? ''
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
  const [staff,        setStaff]       = useState([])
  const [totalCount,   setTotalCount]  = useState(0)
  const [loading,      setLoading]     = useState(true)
  const [error,        setError]       = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]    = useState(false)
  const [toggling,     setToggling]    = useState(null)

  // ── Fetch employees ────────────────────────────────────────────────────────
  // FIX: added pageSize to params sent to API + added to dependency array
  const fetchStaff = useCallback(async () => {
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    params.set('page',      String(page))
    params.set('page_size', String(pageSize))  // ← was missing, caused backend to always return 5
    if (search)   params.set('search',    search)
    if (isActive) params.set('is_active', isActive)

    const { data, ok } = await apiFetch(`user/admin/employeelist/?${params.toString()}`)
    if (ok && data) {
      setStaff(data.results ?? [])
      setTotalCount(data.count ?? 0)
    } else {
      setError('Failed to load employees. Please refresh.')
    }
    setLoading(false)
  }, [page, pageSize, search, isActive])  // ← pageSize added to deps

  useEffect(() => { fetchStaff() }, [fetchStaff])

  // ── Toggle block/unblock ──────────────────────────────────────────────────
  const handleToggle = async (emp) => {
    setToggling(emp.id)
    setStaff(prev => prev.map(s => s.id === emp.id ? { ...s, is_active: !s.is_active } : s))
    const { ok } = await apiFetch(`user/admin/users/${emp.id}/block/`, { method: 'POST' })
    if (!ok) {
      setStaff(prev => prev.map(s => s.id === emp.id ? { ...s, is_active: emp.is_active } : s))
    }
    setToggling(null)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { ok } = await apiFetch(`user/admin/users/${deleteTarget.id}/`, { method: 'DELETE' })
    if (ok) {
      setDeleteTarget(null)
      await fetchStaff()
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
          type="staff"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="min-h-full flex">
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 max-w-[1600px] min-w-0">

          <PageHeader title="Employees" subtitle="Manage your employees, their roles and access levels.">
            {/* Add Staff button — no create endpoint available
            <button className="...">Add Staff</button> */}
          </PageHeader>

          {/* Status tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_TABS.map(tab => {
              const active = isActive === tab.value
              return (
                <button key={tab.value} onClick={() => setParam('status', tab.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors ${active ? 'bg-[#0f172b] text-white' : 'bg-white border border-[#e2e8f0] text-[#62748e] hover:bg-[#f8fafc]'}`}>
                  {tab.label}
                  {tab.value === '' && (
                    <span className={`inline-flex items-center justify-center rounded-full min-w-[20px] h-5 px-1.5 text-[11px] font-bold leading-none ${active ? 'bg-white/20 text-white' : 'bg-[#f1f5f9] text-[#62748e]'}`}>
                      {totalCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {error && (
            <div className="px-4 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-[10px]">
              <p className="text-[#c10007] text-[13px] font-semibold">{error}</p>
            </div>
          )}

          <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-6 py-4 border-b border-[#f1f5f9]">
              <div className="shrink-0">
                <h2 className="text-[#1d293d] font-bold text-[16px] leading-[24px]">All Employees</h2>
                <p className="text-[#90a1b9] text-[12px] leading-[16px] mt-0.5">
                  {loading ? 'Loading…' : `${totalCount} member${totalCount !== 1 ? 's' : ''} found`}
                </p>
              </div>
              <PeopleTableFilters
                search={search}   onSearchChange={v => setParam('search', v)}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                searchPlaceholder="Search by name, email or role..."
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <th className="px-5 py-[13px] w-10">
                      <input type="checkbox" className="w-[13px] h-[13px] rounded border-[#cad5e2] accent-[#f54900] cursor-pointer" readOnly/>
                    </th>
                    {['Employee', 'Email', 'Phone', 'Role', 'Status', ''].map((col, i) => (
                      <th key={i} className={`px-4 py-[13px] text-[13px] font-bold text-[#62748e] leading-[20px] whitespace-nowrap ${i === 5 ? 'text-right' : 'text-left'}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? <Spinner /> : staff.length === 0 ? (
                    <PeopleEmptyState
                      type="staff"
                      hasFilters={hasActiveFilters}
                      onClear={clearFilters}
                      onAdd={() => {}}
                    />
                  ) : staff.map(emp => (
                    <tr key={emp.id}
                      onClick={() => navigate(`/admin/staff/${emp.id}`)}
                      className="border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#fafafa] transition-colors cursor-pointer">

                      <td className="px-5 py-[14px]" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="w-[13px] h-[13px] rounded border-[#cad5e2] accent-[#f54900] cursor-pointer"/>
                      </td>

                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar emp={emp} />
                          <div>
                            <p className="text-[#0f172b] text-[14px] font-semibold leading-[20px] whitespace-nowrap">{emp.full_name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-1.5">
                          <IconMail />
                          <span className="text-[#45556c] text-[13px] whitespace-nowrap">{emp.email}</span>
                        </div>
                      </td>

                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-1.5">
                          <IconPhone />
                          <span className="text-[#45556c] text-[13px] whitespace-nowrap">{emp.phone || '—'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-[14px]">
                        <div className="flex items-center gap-1.5">
                          <IconBriefcase />
                          <span className="text-[#314158] text-[13px] whitespace-nowrap">{emp.role || '—'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-[14px]">
                        <PeopleStatusBadge status={emp.is_active ? 'Active' : 'Inactive'} />
                      </td>

                      <td className="px-4 py-[14px] text-right" onClick={e => e.stopPropagation()}>
                        <StaffActionMenu
                          emp={emp}
                          onToggle={() => handleToggle(emp)}
                          onDelete={() => setDeleteTarget(emp)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
      </div>
    </>
  )
}