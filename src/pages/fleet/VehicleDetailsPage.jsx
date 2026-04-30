// src/pages/fleet/VehicleDetailsPage.jsx
// /admin/fleet/:vehicleId — Vehicle detail view
// API integrated:
//   GET /api/fleet/{id}/                            → vehicle detail
//   GET /api/inspections/vehicle/{id}/history/      → inspection list
//   GET /api/inspections/{id}/                      → inspection detail modal
// Maintenance Log section is commented out (not needed for now)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate }            from 'react-router-dom'

import VehicleStatusBadge, { VehicleActiveBadge } from '@/components/fleet/VehicleStatusBadge'
import AddEditVehicleDrawer                        from '@/pages/fleet/AddEditVehicleDrawer'
import { apiFetch }                                from '@/utils/apiFetch'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconArrowLeft()  { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconEdit()       { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2l2.5 2.5-7 7H3.5V9l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconTruck()      { return <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M2 8h16v13H2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M18 11l6 3.5V21h-6V11z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="7"  cy="22.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/><circle cx="21" cy="22.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M5 11h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconGauge()      { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="#62748e" strokeWidth="1.2"/><path d="M7.5 7.5L5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/><path d="M3.5 11.5a5.5 5.5 0 018 0" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconWrench()     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 2.5a3 3 0 00-3.2 3.7L4 12l1.5 1.5 5.7-5.7A3 3 0 0013 2.5z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconCalendar()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2.5" width="13" height="11" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5 1.5v2M10 1.5v2M1 6.5h13" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconTag()        { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M8 1.5H2a.5.5 0 00-.5.5v6L8.5 15l6-6L8 1.5z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/><circle cx="4.5" cy="5.5" r="1" fill="#62748e"/></svg> }
function IconClipboard()  { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="3" width="11" height="11" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5 3V2h5v1" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 7h5M5 10h3" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconCheck()      { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 6.5l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconAlert()      { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5L11.5 10.5H1.5L6.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6.5 5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6.5" cy="9" r="0.5" fill="currentColor"/></svg> }
function IconInfo()       { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#90a1b9" strokeWidth="1.1"/><path d="M7 6.5v3.5" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/><circle cx="7" cy="4.5" r="0.55" fill="#90a1b9"/></svg> }
function IconClose()      { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconCamera()     { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 4h11v7H1zM4.5 4l1-2h2l1 2" stroke="#62748e" strokeWidth="1.1" strokeLinejoin="round"/><circle cx="6.5" cy="7.5" r="1.5" stroke="#62748e" strokeWidth="1.1"/></svg> }
function IconChevronRight() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 3l4 3.5L5 10" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtDateTime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── ServiceBar (unchanged design) ────────────────────────────────────────────
function ServiceBar({ current, next }) {
  if (!current || !next) return null
  const pct      = Math.min(100, Math.round((current / next) * 100))
  const remaining = next - current
  const overdue   = remaining < 0
  const color     = overdue ? '#c10007' : pct >= 85 ? '#f54900' : '#007a55'
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-[#62748e] uppercase tracking-[0.4px]">Service Progress</span>
        <span className="text-[12px] font-bold" style={{ color }}>
          {overdue ? `${Math.abs(remaining).toLocaleString()} km overdue` : `${remaining.toLocaleString()} km remaining`}
        </span>
      </div>
      <div className="h-[8px] bg-[#f1f5f9] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[11px] text-[#90a1b9]">{current.toLocaleString()} km current</span>
        <span className="text-[11px] text-[#90a1b9]">{next.toLocaleString()} km service due</span>
      </div>
    </div>
  )
}

// ── SpecRow (unchanged design) ────────────────────────────────────────────────
function SpecRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#f8fafc] last:border-b-0">
      <span className="shrink-0"><Icon /></span>
      <span className="text-[#90a1b9] text-[13px] w-[130px] shrink-0">{label}</span>
      <span className={`text-[#0f172b] text-[13px] font-medium ${mono ? 'font-mono' : ''}`}>
        {value ?? <span className="text-[#cad5e2] italic font-normal">—</span>}
      </span>
    </div>
  )
}

// ── Card shell (unchanged design) ─────────────────────────────────────────────
function Card({ title, subtitle, children, action }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
        <div>
          <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px]">{title}</h3>
          {subtitle && <p className="text-[#90a1b9] text-[12px] mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

// ── CATEGORY_LABEL map ────────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  lights:        'Lights',
  tyres:         'Tyres',
  brakes:        'Brakes',
  engine:        'Engine',
  body:          'Body / Exterior',
  interior:      'Interior',
  fluids:        'Fluids',
  safety_gear:   'Safety Gear',
  documentation: 'Documentation',
}
function catLabel(cat) { return CATEGORY_LABELS[cat] ?? cat }

// ── Inspection Detail Modal ───────────────────────────────────────────────────
function InspectionDetailModal({ inspectionId, onClose }) {
  const [detail,  setDetail]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(false)
      const { data, ok } = await apiFetch(`inspections/${inspectionId}/`)
      if (!cancelled) {
        if (ok && data) setDetail(data)
        else setError(true)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [inspectionId])

  // Trap scroll behind modal
    // ── Fetch assigned employee ────────────────────────────────────────────────
  useEffect(() => {
    apiFetch(`fleet/${vehicleId}/assigned-employee/`).then(({ data, ok }) => {
      setAssignedEmp(ok && data && data.employee_id ? data : null)
    })
  }, [vehicleId])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-[640px] max-h-[90vh] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.25)] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9] shrink-0">
          <div>
            <h3 className="text-[#0f172b] font-bold text-[17px] leading-[24px]">Inspection Detail</h3>
            {detail && (
              <p className="text-[#90a1b9] text-[12px] mt-0.5 font-mono">{detail.id}</p>
            )}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors">
            <IconClose />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-7 h-7 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-[#c10007] text-[14px]">Failed to load inspection detail.</div>
          ) : detail ? (
            <div className="flex flex-col gap-5">

              {/* Summary row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-[0.5px] mb-1">Inspected By</p>
                  <p className="text-[#0f172b] text-[14px] font-semibold">{detail.inspected_by_name ?? '—'}</p>
                </div>
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-[0.5px] mb-1">Date &amp; Time</p>
                  <p className="text-[#0f172b] text-[14px] font-semibold">{fmtDateTime(detail.inspected_at)}</p>
                </div>
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-[0.5px] mb-1">Items Checked</p>
                  <p className="text-[#0f172b] text-[14px] font-semibold">{detail.completed_items_count ?? '—'}</p>
                </div>
                <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3">
                  <p className="text-[11px] font-semibold text-[#62748e] uppercase tracking-[0.5px] mb-1">Issues Found</p>
                  <p className={`text-[14px] font-semibold ${Number(detail.issue_count) > 0 ? 'text-[#c10007]' : 'text-[#007a55]'}`}>
                    {detail.issue_count ?? '0'}
                  </p>
                </div>
              </div>

              {/* Overall result badge */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-[10px] border ${detail.has_open_issue ? 'bg-[#fef2f2] border-[#ffe2e2]' : 'bg-[#ecfdf5] border-[#bbf7d0]'}`}>
                <span className={detail.has_open_issue ? 'text-[#c10007]' : 'text-[#007a55]'}>
                  {detail.has_open_issue ? <IconAlert /> : <IconCheck />}
                </span>
                <p className={`text-[14px] font-semibold ${detail.has_open_issue ? 'text-[#c10007]' : 'text-[#007a55]'}`}>
                  {detail.has_open_issue ? 'Open issues found — requires attention' : 'All items passed — no open issues'}
                </p>
              </div>

              {/* Notes */}
              {detail.notes && (
                <div className="flex items-start gap-2.5 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px]">
                  <span className="mt-0.5 shrink-0"><IconInfo /></span>
                  <p className="text-[#45556c] text-[13px] leading-[20px]">{detail.notes}</p>
                </div>
              )}

              {/* Check items */}
              {detail.check_items?.length > 0 && (
                <div>
                  <p className="text-[#0f172b] font-bold text-[14px] mb-3">Check Items</p>
                  <div className="flex flex-col gap-2">
                    {detail.check_items.map(item => (
                      <div key={item.id}
                        className={`p-4 rounded-[10px] border ${item.is_ok ? 'bg-white border-[#e2e8f0]' : 'bg-[#fef2f2] border-[#ffe2e2]'}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className={item.is_ok ? 'text-[#007a55]' : 'text-[#c10007]'}>
                              {item.is_ok ? <IconCheck /> : <IconAlert />}
                            </span>
                            <span className="text-[#0f172b] text-[13px] font-semibold">{catLabel(item.category)}</span>
                          </div>
                          <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${item.is_ok ? 'bg-[#ecfdf5] text-[#007a55]' : 'bg-[#fef2f2] text-[#c10007]'}`}>
                            {item.is_ok ? 'OK' : 'Issue'}
                          </span>
                        </div>

                        {/* Issue detail */}
                        {!item.is_ok && item.issue_detail && (
                          <p className="text-[#c10007] text-[12px] mt-2 leading-[18px] pl-[22px]">{item.issue_detail}</p>
                        )}

                        {/* Photos */}
                        {item.photos?.length > 0 && (
                          <div className="flex gap-2 mt-3 pl-[22px] flex-wrap">
                            {item.photos.map(photo => (
                              <a key={photo.id} href={photo.photo} target="_blank" rel="noopener noreferrer"
                                className="relative w-[72px] h-[52px] rounded-[6px] overflow-hidden border border-[#e2e8f0] hover:opacity-80 transition-opacity group">
                                <img src={photo.photo} alt="Inspection photo"
                                  className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <span className="opacity-0 group-hover:opacity-100 text-white transition-opacity"><IconCamera /></span>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* Modal footer */}
        <div className="flex justify-end px-6 py-4 border-t border-[#f1f5f9] shrink-0">
          <button onClick={onClose}
            className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function VehicleDetailsPage() {
  const { vehicleId } = useParams()
  const navigate       = useNavigate()

  const [vehicle,        setVehicle]        = useState(null)
  const [inspections,    setInspections]    = useState([])
  const [inspTotal,      setInspTotal]      = useState(0)
  const [loadingVehicle, setLoadingVehicle] = useState(true)
  const [loadingInsp,    setLoadingInsp]    = useState(true)
  const [notFound,       setNotFound]       = useState(false)
  const [drawerOpen,     setDrawerOpen]     = useState(false)
  const [selectedInspId, setSelectedInspId] = useState(null)
  const [assignedEmp,    setAssignedEmp]    = useState(undefined) // undefined=loading, null=none

  // ── Fetch vehicle ─────────────────────────────────────────────────────────
  const fetchVehicle = useCallback(async () => {
    setLoadingVehicle(true)
    const { data, ok, status } = await apiFetch(`fleet/${vehicleId}/`)
    if (ok && data) {
      setVehicle(data)
    } else if (status === 404) {
      setNotFound(true)
    }
    setLoadingVehicle(false)
  }, [vehicleId])

  // ── Fetch inspection history ──────────────────────────────────────────────
  const fetchInspections = useCallback(async () => {
    setLoadingInsp(true)
    const { data, ok } = await apiFetch(`inspections/vehicle/${vehicleId}/history/`)
    if (ok && data) {
      setInspections(data.results ?? [])
      setInspTotal(data.count ?? (data.results ?? []).length)
    }
    setLoadingInsp(false)
  }, [vehicleId])

  useEffect(() => {
    fetchVehicle()
    fetchInspections()
  }, [fetchVehicle, fetchInspections])

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-[#f8fafc] border-2 border-[#e2e8f0] flex items-center justify-center text-[#cad5e2]">
            <IconTruck />
          </div>
          <div>
            <h2 className="text-[#0f172b] font-bold text-[18px]">Vehicle not found</h2>
            <p className="text-[#62748e] text-[14px] mt-1">
              <span className="font-mono text-[#f54900]">{vehicleId}</span> doesn't exist in the fleet.
            </p>
          </div>
          <button onClick={() => navigate('/admin/fleet')}
            className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] transition-colors">
            ← Back to Fleet
          </button>
        </div>
      </div>
    )
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loadingVehicle || !vehicle) {
    return (
      <div className="p-6 lg:p-8 max-w-[1000px]">
        <Spinner />
      </div>
    )
  }

  const v         = vehicle
  const remaining = v.next_service_km != null ? v.next_service_km - (v.current_odometer_km ?? 0) : null

  return (
    <>
      {/* Inspection detail modal */}
      {selectedInspId && (
        <InspectionDetailModal
          inspectionId={selectedInspId}
          onClose={() => setSelectedInspId(null)}
        />
      )}

      <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[1000px]">

        {/* Page header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/fleet')}
              className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#314158] transition-colors">
              <IconArrowLeft />
            </button>
            <div>
              <h1 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">Vehicle Details</h1>
              <p className="text-[#90a1b9] text-[12px] mt-0.5 font-mono">{v.id}</p>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 h-[36px] px-4 rounded-[10px] bg-white border border-[#e2e8f0] text-[#314158] text-[13px] font-semibold hover:bg-[#f8fafc] transition-colors">
            <IconEdit /> Edit Vehicle
          </button>
        </div>

        {/* Hero card */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex items-start gap-5 flex-wrap">

            {/* Photo or illustration */}
            <div className="w-[80px] h-[60px] rounded-[10px] bg-[#1d293d] flex items-center justify-center shrink-0 border border-[#314158]">
              {v.picture
                ? <img src={v.picture} alt={v.name} className="w-full h-full object-cover rounded-[10px]" />
                : <span className="text-[#90a1b9]"><IconTruck /></span>
              }
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-[180px]">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">{v.name}</h2>
                <VehicleStatusBadge status={v.status} />
                <VehicleActiveBadge isActive={v.is_active} />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-1 bg-[#0f172b] text-white text-[12px] font-mono font-bold rounded-[5px] tracking-widest">
                  {v.plate}
                </span>
                {v.make && v.model_name && (
                  <span className="text-[#62748e] text-[13px]">
                    {v.make} {v.model_name}{v.year ? ` · ${v.year}` : ''}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <IconCalendar />
                  <span className="text-[#45556c] text-[13px]">Added {fmtDate(v.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconCalendar />
                  <span className={`text-[13px] ${v.last_inspection_date ? 'text-[#45556c]' : 'text-[#90a1b9] italic'}`}>
                    Last inspection: {v.last_inspection_date ? fmtDate(v.last_inspection_date) : 'Never'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconCalendar />
                  <span className={`text-[13px] ${v.registration_due ? 'text-[#45556c]' : 'text-[#90a1b9] italic'}`}>
                    Registration due: {v.registration_due ? fmtDate(v.registration_due) : 'Never'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconCalendar />
                  <span className={`text-[13px] ${v.service_due ? 'text-[#45556c]' : 'text-[#90a1b9] italic'}`}>
                    Service due: {v.service_due ? fmtDate(v.service_due) : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat chip — inspections count only */}
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-center min-w-[80px]">
              <p className="text-[22px] font-bold text-[#3b82f6]">{inspTotal}</p>
              <p className="text-[11px] text-[#62748e] mt-0.5 whitespace-nowrap">Inspections</p>
            </div>
          </div>

          {/* Service progress */}
          {v.current_odometer_km && v.next_service_km && (
            <div className="mt-5 pt-5 border-t border-[#f1f5f9]">
              <ServiceBar current={v.current_odometer_km} next={v.next_service_km} />
            </div>
          )}

          {/* Assigned Employee */}
          <div className="mt-5 pt-5 border-t border-[#f1f5f9]">
            <p className="text-[11px] font-bold text-[#90a1b9] uppercase tracking-[0.5px] mb-3">Assigned Employee</p>
            {assignedEmp === undefined ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
                <span className="text-[13px] text-[#90a1b9]">Loading…</span>
              </div>
            ) : assignedEmp === null ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] border border-dashed border-[#e2e8f0] rounded-[10px]">
                <div className="w-9 h-9 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="#90a1b9" strokeWidth="1.2"/><path d="M2.5 16c0-3.314 2.91-6 6.5-6s6.5 2.686 6.5 6" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#62748e]">No employee assigned</p>
                  <p className="text-[12px] text-[#90a1b9]">Assign via the employee's profile page</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  {assignedEmp.profile_picture ? (
                    <img src={assignedEmp.profile_picture} alt={assignedEmp.full_name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#e2e8f0] shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0f172b] flex items-center justify-center text-white text-[12px] font-bold shrink-0 select-none">
                      {assignedEmp.full_name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() ?? '??'}
                    </div>
                  )}
                  <div>
                    <p className="text-[#0f172b] font-bold text-[15px] leading-[20px]">{assignedEmp.full_name}</p>
                    <div className="flex items-center gap-3 flex-wrap mt-0.5">
                      {assignedEmp.primary_skill && (
                        <span className="text-[12px] text-[#62748e] capitalize">{assignedEmp.primary_skill.replace(/_/g,' ')}</span>
                      )}
                      {assignedEmp.email && (
                        <span className="text-[12px] text-[#90a1b9]">{assignedEmp.email}</span>
                      )}
                      {assignedEmp.phone && (
                        <span className="text-[12px] text-[#90a1b9]">{assignedEmp.phone}</span>
                      )}
                    </div>
                  </div>
                </div>
                <a href={`/admin/staff/${assignedEmp.employee_id}`}
                  onClick={e => { e.preventDefault(); navigate(`/admin/staff/${assignedEmp.employee_id}`) }}
                  className="flex items-center gap-1.5 px-3 py-[6px] rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158] text-[12px] font-medium transition-colors whitespace-nowrap shrink-0">
                  View Profile
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 3l4 3-4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Two-column detail row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card title="Vehicle Specs" subtitle="Make, model and registration details">
            <div className="-my-1">
              <SpecRow icon={IconTruck}    label="Name"           value={v.name} />
              <SpecRow icon={IconTag}      label="Plate"          value={v.plate} mono />
              <SpecRow icon={IconTruck}    label="Make"           value={v.make} />
              <SpecRow icon={IconTruck}    label="Model"          value={v.model_name} />
              <SpecRow icon={IconCalendar} label="Year"           value={v.year} />
              <SpecRow icon={IconCalendar} label="Added to Fleet" value={fmtDate(v.created_at)} />
            </div>
          </Card>

          <Card title="Service Tracking" subtitle="Odometer readings and service intervals">
            <div className="-my-1">
              <SpecRow icon={IconGauge}    label="Current Odometer" value={v.current_odometer_km ? `${Number(v.current_odometer_km).toLocaleString()} km` : null} />
              <SpecRow icon={IconWrench}   label="Next Service At"  value={v.next_service_km ? `${Number(v.next_service_km).toLocaleString()} km` : null} />
              <SpecRow icon={IconGauge}    label="Remaining"
                value={remaining != null
                  ? <span style={{ color: remaining < 0 ? '#c10007' : remaining < 2000 ? '#f54900' : '#007a55', fontWeight: 600 }}>
                      {remaining < 0 ? `${Math.abs(remaining).toLocaleString()} km overdue` : `${remaining.toLocaleString()} km`}
                    </span>
                  : null
                }
              />
              <SpecRow icon={IconCalendar} label="Last Inspection"
                value={v.last_inspection_date ? fmtDate(v.last_inspection_date) : <span className="text-[#90a1b9] italic font-normal">Never</span>}
              />
              {/* <SpecRow icon={IconClipboard} label="Upcoming Maint."
                value={v.upcoming_maintenance ?? <span className="text-[#90a1b9] italic font-normal">None scheduled</span>}
              /> */}
            </div>
          </Card>
        </div>

        {/* Notes */}
        {v.notes && (
          <Card title="Notes">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0"><IconInfo /></span>
              <p className="text-[#45556c] text-[14px] leading-[22px] whitespace-pre-wrap">{v.notes}</p>
            </div>
          </Card>
        )}

        {/* Inspection History */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">
          <div className="px-6 py-4 border-b border-[#f1f5f9]">
            <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px]">Inspection History</h3>
            <p className="text-[#90a1b9] text-[12px] mt-0.5">{inspTotal} record{inspTotal !== 1 ? 's' : ''} — click any row to view full detail</p>
          </div>

          {loadingInsp ? (
            <Spinner />
          ) : inspections.length === 0 ? (
            <div className="py-10 text-center text-[#90a1b9] text-[14px]">No inspection records yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    {['Date', 'Inspector', 'Issues', 'Items Done', 'Result', ''].map((col, i) => (
                      <th key={i} className={`px-5 py-[11px] text-[12px] font-bold text-[#62748e] whitespace-nowrap text-left${i === 5 ? ' w-[32px]' : ''}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inspections.map(ins => (
                    <tr key={ins.id}
                      onClick={() => setSelectedInspId(ins.id)}
                      className="border-b border-[#f8fafc] last:border-0 hover:bg-[#f0f4ff] transition-colors cursor-pointer">
                      <td className="px-5 py-[14px] text-[13px] text-[#45556c] whitespace-nowrap">
                        {fmtDate(ins.inspected_at)}
                      </td>
                      <td className="px-5 py-[14px] text-[13px] text-[#314158] font-medium whitespace-nowrap">
                        {ins.inspected_by_name}
                      </td>
                      <td className="px-5 py-[14px] text-[13px] whitespace-nowrap">
                        {Number(ins.issue_count) > 0
                          ? <span className="text-[#c10007] font-semibold">{ins.issue_count}</span>
                          : <span className="text-[#007a55]">0</span>
                        }
                      </td>
                      <td className="px-5 py-[14px] text-[13px] text-[#45556c] whitespace-nowrap">
                        {ins.completed_items_count}
                      </td>
                      <td className="px-5 py-[14px] whitespace-nowrap">
                        {ins.has_open_issue ? (
                          <span className="inline-flex items-center gap-1.5 text-[#c10007] text-[12px] font-medium">
                            <IconAlert /> Issues Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[#007a55] text-[12px] font-medium">
                            <IconCheck /> Passed
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-[14px] text-[#90a1b9]">
                        <IconChevronRight />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Maintenance Log — commented out, not needed for now ──────────────
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">
          ...
        </div>
        */}

      </div>

      {/* Edit drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-[#0f172b]/40 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full z-40">
            <AddEditVehicleDrawer
              mode="edit"
              initialData={v}
              onClose={() => setDrawerOpen(false)}
              onSave={() => {
                setDrawerOpen(false)
                fetchVehicle()
              }}
            />
          </div>
        </>
      )}
    </>
  )
}