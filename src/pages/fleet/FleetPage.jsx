// src/pages/fleet/FleetPage.jsx
// Figma: Fleet Control — /admin/fleet
// Layout: "Fleet Control" header + Filter Status / Add Vehicle buttons,
//         3 stat cards, standalone search bar, clean table.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import VehicleStatusBadge    from '@/components/fleet/VehicleStatusBadge'
import AddEditVehicleDrawer  from '@/pages/fleet/AddEditVehicleDrawer'
import EnhancedTablePagination from '@/components/shared/EnhancedTablePagination'

import {
  VEHICLES as INITIAL_VEHICLES,
  VEHICLE_STATUS_OPTIONS,
  FLEET_PAGE_SIZES,
  FLEET_DEFAULT_PAGE_SIZE,
} from '@/data/fleetMock'

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function IconTruck() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M1 6h13v11H1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M14 9l4 2.5V17h-4V9z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="5"  cy="18.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="16" cy="18.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
}
function IconWrench() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M18 4a4 4 0 00-4.3 5.2L7 16.5a2 2 0 002.8 2.8l6.7-6.7A4 4 0 0018 4zM6 18a.8.8 0 110-1.6.8.8 0 010 1.6z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  )
}
function IconAlertTriangle() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L20.5 19H1.5L11 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M11 8v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="11" cy="15.5" r="0.75" fill="currentColor"/>
    </svg>
  )
}
function IconFilter() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M1.5 3h12M4 7.5h7M6.5 12h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 2v11M2 7.5h11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function IconVehicleSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 5h9v7H1z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M10 7l3 2v3h-3V7z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="3.5" cy="13" r="1.5" fill="white"/>
      <circle cx="11.5" cy="13" r="1.5" fill="white"/>
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="#90a1b9" strokeWidth="1.3"/>
      <path d="M11 11l3.5 3.5" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
function IconDots() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="4"  cy="9" r="1.3" fill="#94a3b8"/>
      <circle cx="9"  cy="9" r="1.3" fill="#94a3b8"/>
      <circle cx="14" cy="9" r="1.3" fill="#94a3b8"/>
    </svg>
  )
}
function IconEdit()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2l2.5 2.5-7 7H2.5V9l7-7z" stroke="#314158" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconToggle() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="12" height="6" rx="3" stroke="#62748e" strokeWidth="1.1"/><circle cx="4" cy="7" r="2" fill="#62748e"/></svg> }
function IconTrash()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3.5h11M4 3.5V2h6v1.5M3 3.5l.8 9h6.4l.8-9" stroke="#c10007" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconXSmall() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="#62748e" strokeWidth="1.3" strokeLinecap="round"/></svg> }

// ── Stat card component ───────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="flex-1 bg-white border border-[#e2e8f0] rounded-[14px] px-6 py-5 flex items-center gap-5 shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
      <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}
        style={{ color: iconColor }}>
        <Icon />
      </div>
      <div>
        <p className="text-[#62748e] text-[13px] leading-[18px]">{label}</p>
        <p className="text-[#0f172b] font-bold text-[28px] leading-[36px] mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ── 3-dot action menu ─────────────────────────────────────────────────────────
function VehicleActionMenu({ vehicle, onEdit, onToggleActive, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const stop = (fn) => (e) => { e.stopPropagation(); setOpen(false); fn?.() }

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#f1f5f9] transition-colors"
      >
        <IconDots />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-[160px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0px_8px_24px_rgba(15,23,43,0.12)] py-1 overflow-hidden">
          <button onClick={stop(onEdit)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-[#314158] hover:bg-[#f8fafc] transition-colors">
            <IconEdit /> Edit
          </button>
          <button onClick={stop(onToggleActive)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-[#314158] hover:bg-[#f8fafc] transition-colors">
            <IconToggle /> {vehicle.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <div className="h-px bg-[#f1f5f9] mx-2 my-1" />
          <button onClick={stop(onDelete)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-[#c10007] hover:bg-[#fef2f2] transition-colors">
            <IconTrash /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ── Delete modal ──────────────────────────────────────────────────────────────
function DeleteVehicleModal({ vehicle, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/40 backdrop-blur-sm"
      onClick={onCancel}>
      <div className="w-full max-w-[400px] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.25)] overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4 px-6 pt-6 pb-4">
          <div className="w-11 h-11 rounded-full bg-[#fef2f2] border border-[#ffe2e2] flex items-center justify-center shrink-0 text-[#c10007]">
            <IconAlertTriangle />
          </div>
          <div>
            <h3 className="text-[#0f172b] font-bold text-[17px] leading-[24px]">Remove Vehicle</h3>
            <p className="text-[#62748e] text-[14px] leading-[22px] mt-1">
              Remove <span className="font-bold text-[#0f172b]">{vehicle?.name}</span> ({vehicle?.plate}) from the fleet? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="mx-6 mb-5 bg-[#fef2f2] border border-[#ffe2e2] rounded-[8px] px-4 py-3">
          <p className="text-[#c10007] text-[13px] leading-[20px]">
            All inspection records, maintenance history and job assignments linked to this vehicle will be permanently unlinked.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f1f5f9]">
          <button onClick={onCancel}
            className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-[9px] bg-[#c10007] hover:bg-[#a30006] text-white text-[14px] font-semibold rounded-[10px] transition-colors shadow-[0px_1px_3px_rgba(193,0,7,0.3)]">
            Remove Vehicle
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Filter Status dropdown ────────────────────────────────────────────────────
function FilterStatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const current = VEHICLE_STATUS_OPTIONS.find(o => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={[
          'flex items-center gap-2 h-[38px] px-4 rounded-[10px] border text-[14px] font-medium transition-colors',
          value
            ? 'border-[#0f172b] bg-[#0f172b] text-white'
            : 'border-[#e2e8f0] bg-white text-[#314158] hover:bg-[#f8fafc]',
        ].join(' ')}
      >
        <IconFilter />
        {current ? current.label : 'Filter Status'}
        {value && (
          <span
            onClick={(e) => { e.stopPropagation(); onChange('') }}
            className="ml-1 hover:opacity-70 transition-opacity"
          >
            <IconXSmall />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[42px] z-50 w-[200px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0px_8px_24px_rgba(15,23,43,0.12)] py-1.5 overflow-hidden">
          <button
            onClick={() => { onChange(''); setOpen(false) }}
            className={`flex items-center w-full px-3 py-2 text-[13px] transition-colors ${!value ? 'bg-[#f8fafc] font-semibold text-[#0f172b]' : 'text-[#62748e] hover:bg-[#f8fafc]'}`}
          >
            All Statuses
          </button>
          {VEHICLE_STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`flex items-center w-full px-3 py-2 text-[13px] transition-colors ${value === opt.value ? 'bg-[#f8fafc] font-semibold text-[#0f172b]' : 'text-[#314158] hover:bg-[#f8fafc]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function nextServiceDisplay(current, next) {
  if (!next) return '—'
  const remaining = next - (current ?? 0)
  if (remaining < 0) return `${remaining.toLocaleString()} km`
  return `${remaining.toLocaleString()} km`
}

// ─────────────────────────────────────────────────────────────────────────────
export default function FleetPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search   = searchParams.get('search') ?? ''
  const status   = searchParams.get('status') ?? ''
  const page     = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const pageSize = FLEET_PAGE_SIZES.includes(Number(searchParams.get('size')))
                     ? Number(searchParams.get('size'))
                     : FLEET_DEFAULT_PAGE_SIZE

  const setSearch = useCallback((v) => {
    setSearchParams(prev => {
      const n = new URLSearchParams(prev)
      if (v) n.set('search', v); else n.delete('search')
      n.set('page', '1')
      return n
    })
  }, [setSearchParams])

  const setStatus = useCallback((v) => {
    setSearchParams(prev => {
      const n = new URLSearchParams(prev)
      if (v) n.set('status', v); else n.delete('status')
      n.set('page', '1')
      return n
    })
  }, [setSearchParams])

  const setPage = useCallback((p) => {
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n })
  }, [setSearchParams])

  const setSize = useCallback((s) => {
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('size', String(s)); n.set('page', '1'); return n })
  }, [setSearchParams])

  // ── Local data ─────────────────────────────────────────────────────────────
  const [vehicles,     setVehicles]     = useState(INITIAL_VEHICLES)
  const [drawerMode,   setDrawerMode]   = useState(null)
  const [editTarget,   setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const openAdd     = () => { setEditTarget(null); setDrawerMode('add') }
  const openEdit    = (v) => { setEditTarget(v);   setDrawerMode('edit') }
  const closeDrawer = () => { setDrawerMode(null); setEditTarget(null) }

  const handleSave = (data) => {
    if (drawerMode === 'edit') {
      setVehicles(prev => prev.map(v => v.id === data.id ? { ...v, ...data } : v))
    } else {
      setVehicles(prev => [{
        ...data,
        id:             `VEH-${String(Date.now()).slice(-4)}`,
        status:         'healthy',
        last_inspection: null,
        created_at:     new Date().toISOString().slice(0, 10),
      }, ...prev])
    }
  }

  const handleToggleActive = (vehicle) =>
    setVehicles(prev => prev.map(v => v.id === vehicle.id ? { ...v, is_active: !v.is_active } : v))

  const handleDelete = () => {
    setVehicles(prev => prev.filter(v => v.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:          vehicles.length,
    maintenance_due: vehicles.filter(v => v.status === 'inspection_due' || v.status === 'service_overdue').length,
    critical:        vehicles.filter(v => v.status === 'issue_reported').length,
  }), [vehicles])

  // ── Filter + paginate ──────────────────────────────────────────────────────
  const filtered = useMemo(() => vehicles.filter(v => {
    if (status && v.status !== status) return false
    if (search) {
      const q = search.toLowerCase()
      if (![v.name, v.plate, v.make, v.model_name].some(f => f?.toLowerCase().includes(q))) return false
    }
    return true
  }), [vehicles, search, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {deleteTarget && (
        <DeleteVehicleModal
          vehicle={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="min-h-full flex">
        <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 min-w-0">

          {/* ── Page header ── */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-[#0f172b] font-bold text-[26px] leading-[34px]">Fleet Control</h1>
              <p className="text-[#62748e] text-[14px] leading-[20px] mt-1">
                Vehicle health, assignments, and maintenance
              </p>
            </div>

            {/* Header action buttons — Figma exact */}
            <div className="flex items-center gap-3 shrink-0">
              <FilterStatusDropdown value={status} onChange={setStatus} />
              <button
                onClick={openAdd}
                className="flex items-center gap-2 h-[38px] px-4 rounded-[10px] bg-[#0f172b] hover:bg-[#1d293d] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(15,23,43,0.25)] whitespace-nowrap"
              >
                <IconVehicleSmall />
                Add Vehicle
              </button>
            </div>
          </div>

          {/* ── 3 stat cards — Figma layout ── */}
          <div className="flex gap-4 flex-wrap">
            <StatCard
              icon={IconTruck}
              iconBg="bg-[#ecfdf5]"
              iconColor="#007a55"
              label="Total Fleet"
              value={stats.total}
            />
            <StatCard
              icon={IconWrench}
              iconBg="bg-[#fff7ed]"
              iconColor="#c73b00"
              label="Maintenance Due"
              value={stats.maintenance_due}
            />
            <StatCard
              icon={IconAlertTriangle}
              iconBg="bg-[#fef2f2]"
              iconColor="#c10007"
              label="Critical Issues"
              value={stats.critical}
            />
          </div>

          {/* ── Main table card ── */}
          <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">

            {/* Search bar */}
            <div className="px-6 pt-5 pb-4 border-b border-[#f1f5f9]">
              <div className="relative max-w-[420px]">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search vehicle or plate..."
                  className="w-full h-[40px] pl-10 pr-4 border border-[#e2e8f0] rounded-[10px] text-[14px] text-[#0f172b] placeholder:text-[#90a1b9] bg-white focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50 transition-colors"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#f1f5f9]">
                    {['Vehicle', 'Plate', 'Status', 'Last Inspection', 'Next Service', 'Assigned To', 'Action'].map((col, i) => (
                      <th
                        key={col}
                        className={[
                          'px-6 py-[14px] text-[13px] font-semibold text-[#62748e] leading-[18px] whitespace-nowrap',
                          i === 6 ? 'text-right' : 'text-left',
                        ].join(' ')}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-[#f8fafc] border-2 border-[#e2e8f0] flex items-center justify-center text-[#cad5e2]">
                            <IconTruck />
                          </div>
                          <div>
                            <p className="text-[#0f172b] font-bold text-[16px]">
                              {search || status ? 'No vehicles match your search' : 'No vehicles yet'}
                            </p>
                            <p className="text-[#90a1b9] text-[13px] mt-1">
                              {search || status ? 'Try a different search term or filter.' : 'Click "Add Vehicle" to register your first vehicle.'}
                            </p>
                          </div>
                          {!(search || status) && (
                            <button onClick={openAdd}
                              className="flex items-center gap-2 px-4 py-2 bg-[#0f172b] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#1d293d] transition-colors">
                              <IconVehicleSmall /> Add Vehicle
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : paginated.map((vehicle, idx) => {
                    const remaining = vehicle.next_service_km != null
                      ? vehicle.next_service_km - (vehicle.current_odometer_km ?? 0)
                      : null
                    const nextServiceStr = remaining != null
                      ? `${remaining.toLocaleString()} km`
                      : '—'
                    const isOverdue = remaining != null && remaining < 0

                    return (
                      <tr
                        key={vehicle.id}
                        className={[
                          'border-b border-[#f8fafc] last:border-b-0 hover:bg-[#fafafa] transition-colors',
                          idx % 2 === 0 ? '' : '',
                        ].join(' ')}
                      >
                        {/* Vehicle name */}
                        <td className="px-6 py-[18px]">
                          <span className="text-[#0f172b] text-[14px] font-semibold">{vehicle.name}</span>
                        </td>

                        {/* Plate */}
                        <td className="px-6 py-[18px]">
                          <span className="text-[#45556c] text-[14px] font-mono">{vehicle.plate}</span>
                        </td>

                        {/* Status badge */}
                        <td className="px-6 py-[18px]">
                          <VehicleStatusBadge status={vehicle.status} />
                        </td>

                        {/* Last Inspection */}
                        <td className="px-6 py-[18px]">
                          <span className="text-[#45556c] text-[14px]">
                            {vehicle.last_inspection ?? <span className="text-[#90a1b9] italic">Never</span>}
                          </span>
                        </td>

                        {/* Next Service — red if overdue */}
                        <td className="px-6 py-[18px]">
                          <span className={`text-[14px] font-medium ${isOverdue ? 'text-[#c10007]' : 'text-[#45556c]'}`}>
                            {nextServiceStr}
                          </span>
                        </td>

                        {/* Assigned To */}
                        <td className="px-6 py-[18px]">
                          {vehicle.assigned_to ? (
                            <span className="text-[#314158] text-[14px]">{vehicle.assigned_to}</span>
                          ) : (
                            <span className="text-[#90a1b9] text-[14px] italic">Unassigned</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-6 py-[18px]">
                          <VehicleActionMenu
                            vehicle={vehicle}
                            onEdit={() => openEdit(vehicle)}
                            onToggleActive={() => handleToggleActive(vehicle)}
                            onDelete={() => setDeleteTarget(vehicle)}
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
                pageSizeOptions={FLEET_PAGE_SIZES}
                onPageChange={setPage}
                onPageSizeChange={setSize}
              />
            )}
          </div>

        </div>

        {/* ── Drawer overlay — slides in from right ── */}
        {drawerMode && (
          <>
            <div
              className="fixed inset-0 z-30 bg-[#0f172b]/40 backdrop-blur-[2px] transition-opacity duration-300"
              onClick={closeDrawer}
            />
            <div className="fixed right-0 top-0 h-full z-40">
              <AddEditVehicleDrawer
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