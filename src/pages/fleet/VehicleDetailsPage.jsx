// src/pages/fleet/VehicleDetailsPage.jsx
// /admin/fleet/:vehicleId  — Vehicle detail view
// Sections: hero card, vehicle specs, service tracking,
//           inspection history table, maintenance log table, notes
// ─────────────────────────────────────────────────────────────────────────────

import { useState }                    from 'react'
import { useParams, useNavigate }       from 'react-router-dom'

import VehicleStatusBadge, { VehicleActiveBadge } from '@/components/fleet/VehicleStatusBadge'
import AddEditVehicleDrawer                        from '@/pages/fleet/AddEditVehicleDrawer'

import {
  VEHICLES,
  VEHICLE_INSPECTIONS,
  VEHICLE_MAINTENANCE,
} from '@/data/fleetMock'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconArrowLeft()  { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconEdit()       { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2l2.5 2.5-7 7H3.5V9l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconTruck()      { return <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M2 8h16v13H2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M18 11l6 3.5V21h-6V11z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><circle cx="7"  cy="22.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/><circle cx="21" cy="22.5" r="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M5 11h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconGauge()      { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="6" stroke="#62748e" strokeWidth="1.2"/><path d="M7.5 7.5L5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/><path d="M3.5 11.5a5.5 5.5 0 018 0" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconWrench()     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M13 2.5a3 3 0 00-3.2 3.7L4 12l1.5 1.5 5.7-5.7A3 3 0 0013 2.5z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconCalendar()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2.5" width="13" height="11" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5 1.5v2M10 1.5v2M1 6.5h13" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconUser()       { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="#62748e" strokeWidth="1.2"/><path d="M1.5 13.5c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconTag()        { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M8 1.5H2a.5.5 0 00-.5.5v6L8.5 15l6-6L8 1.5z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/><circle cx="4.5" cy="5.5" r="1" fill="#62748e"/></svg> }
function IconClipboard()  { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2" y="3" width="11" height="11" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5 3V2h5v1" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 7h5M5 10h3" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconCheck()      { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2"/><path d="M4 6.5l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconAlert()      { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5L11.5 10.5H1.5L6.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6.5 5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6.5" cy="9" r="0.5" fill="currentColor"/></svg> }
function IconInfo()       { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#90a1b9" strokeWidth="1.1"/><path d="M7 6.5v3.5" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/><circle cx="7" cy="4.5" r="0.55" fill="#90a1b9"/></svg> }

// ── Maintenance status badge ───────────────────────────────────────────────────
const MAINT_VARIANTS = {
  scheduled:   { pill: 'bg-[#eff6ff] text-[#1d4ed8]',  label: 'Scheduled'   },
  in_progress: { pill: 'bg-[#fff7ed] text-[#c73b00]',  label: 'In Progress' },
  completed:   { pill: 'bg-[#ecfdf5] text-[#007a55]',  label: 'Completed'   },
  cancelled:   { pill: 'bg-[#f8fafc] text-[#62748e]',  label: 'Cancelled'   },
}
function MaintenanceBadge({ status }) {
  const v = MAINT_VARIANTS[status] ?? MAINT_VARIANTS.completed
  return (
    <span className={`inline-flex items-center px-2.5 py-[4px] rounded-full text-[12px] font-medium whitespace-nowrap ${v.pill}`}>
      {v.label}
    </span>
  )
}

// ── Odometer service bar ──────────────────────────────────────────────────────
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
          {overdue
            ? `${Math.abs(remaining).toLocaleString()} km overdue`
            : `${remaining.toLocaleString()} km remaining`}
        </span>
      </div>
      <div className="h-[8px] bg-[#f1f5f9] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[11px] text-[#90a1b9]">{current.toLocaleString()} km current</span>
        <span className="text-[11px] text-[#90a1b9]">{next.toLocaleString()} km service due</span>
      </div>
    </div>
  )
}

// ── Spec row ──────────────────────────────────────────────────────────────────
function SpecRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#f8fafc] last:border-b-0">
      <span className="shrink-0"><Icon /></span>
      <span className="text-[#90a1b9] text-[13px] w-[130px] shrink-0">{label}</span>
      <span className={`text-[#0f172b] text-[13px] font-medium ${mono ? "font-mono" : ""}`}>
        {value ?? <span className="text-[#cad5e2] italic font-normal">—</span>}
      </span>
    </div>
  )
}

// ── Section card shell ────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
export default function VehicleDetailsPage() {
  const { vehicleId } = useParams()
  const navigate       = useNavigate()

  // Simulates: GET /api/fleet/vehicles/:id/
  const vehicle      = VEHICLES.find(v => v.id === vehicleId)
  const inspections  = VEHICLE_INSPECTIONS[vehicleId]  ?? []
  const maintenance  = VEHICLE_MAINTENANCE[vehicleId]  ?? []

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [liveVehicle, setLiveVehicle] = useState(vehicle)

  // ── 404 ─────────────────────────────────────────────────────────────────────
  if (!vehicle) {
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

  const v         = liveVehicle
  const remaining = v.next_service_km != null ? v.next_service_km - (v.current_odometer_km ?? 0) : null

  return (
    <>
      <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[1000px]">

        {/* ── Page header ── */}
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

        {/* ── Hero card ── */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.08)]">
          <div className="flex items-start gap-5 flex-wrap">

            {/* Vehicle illustration / photo */}
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

              {/* Plate */}
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

              {/* Meta row */}
              <div className="flex flex-wrap gap-4 mt-3">
                {[
                  { icon: IconUser,     val: v.assigned_to ?? 'Unassigned', muted: !v.assigned_to },
                  { icon: IconCalendar, val: `Added ${v.created_at}` },
                  { icon: IconCalendar, val: `Last inspection: ${v.last_inspection ?? 'Never'}` },
                ].map(({ icon: Icon, val, muted }, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Icon />
                    <span className={`text-[13px] ${muted ? 'text-[#90a1b9] italic' : 'text-[#45556c]'}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat chips */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Inspections',  value: inspections.length,  color: '#3b82f6' },
                { label: 'Maint. Logs',  value: maintenance.length,  color: '#f54900' },
              ].map(s => (
                <div key={s.label} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-center min-w-[80px]">
                  <p className="text-[22px] font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[11px] text-[#62748e] mt-0.5 whitespace-nowrap">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Service progress bar */}
          {v.current_odometer_km && v.next_service_km && (
            <div className="mt-5 pt-5 border-t border-[#f1f5f9]">
              <ServiceBar current={v.current_odometer_km} next={v.next_service_km} />
            </div>
          )}
        </div>

        {/* ── Two-column detail row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Vehicle Specs */}
          <Card title="Vehicle Specs" subtitle="Make, model and registration details">
            <div className="-my-1">
              <SpecRow icon={IconTruck}    label="Name"          value={v.name} />
              <SpecRow icon={IconTag}      label="Plate"         value={v.plate}      mono />
              <SpecRow icon={IconTruck}    label="Make"          value={v.make} />
              <SpecRow icon={IconTruck}    label="Model"         value={v.model_name} />
              <SpecRow icon={IconCalendar} label="Year"          value={v.year} />
              <SpecRow icon={IconCalendar} label="Added to Fleet" value={v.created_at} />
            </div>
          </Card>

          {/* Service Tracking */}
          <Card title="Service Tracking" subtitle="Odometer readings and service intervals">
            <div className="-my-1">
              <SpecRow icon={IconGauge}  label="Current Odometer" value={v.current_odometer_km ? `${v.current_odometer_km.toLocaleString()} km` : null} />
              <SpecRow icon={IconWrench} label="Next Service At"  value={v.next_service_km ? `${v.next_service_km.toLocaleString()} km` : null} />
              <SpecRow icon={IconGauge}  label="Remaining"
                value={remaining != null
                  ? <span style={{ color: remaining < 0 ? '#c10007' : remaining < 2000 ? '#f54900' : '#007a55', fontWeight: 600 }}>
                      {remaining < 0 ? `${Math.abs(remaining).toLocaleString()} km overdue` : `${remaining.toLocaleString()} km`}
                    </span>
                  : null
                }
              />
              <SpecRow icon={IconCalendar} label="Last Inspection" value={v.last_inspection} />
              <SpecRow icon={IconUser}     label="Assigned To"
                value={v.assigned_to
                  ? v.assigned_to
                  : <span className="text-[#90a1b9] italic font-normal">Unassigned</span>
                }
              />
            </div>
          </Card>
        </div>

        {/* ── Notes ── */}
        {v.notes && (
          <Card title="Notes">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0"><IconInfo /></span>
              <p className="text-[#45556c] text-[14px] leading-[22px] whitespace-pre-wrap">{v.notes}</p>
            </div>
          </Card>
        )}

        {/* ── Inspection History ── */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">
          <div className="px-6 py-4 border-b border-[#f1f5f9]">
            <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px]">Inspection History</h3>
            <p className="text-[#90a1b9] text-[12px] mt-0.5">{inspections.length} record{inspections.length !== 1 ? 's' : ''}</p>
          </div>

          {inspections.length === 0 ? (
            <div className="py-10 text-center text-[#90a1b9] text-[14px]">No inspection records yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    {['Date', 'Inspector', 'Odometer', 'Result', 'Issues / Notes'].map((col, i) => (
                      <th key={col} className={`px-5 py-[11px] text-[12px] font-bold text-[#62748e] whitespace-nowrap ${i === 4 ? 'text-left w-full' : 'text-left'}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inspections.map(ins => (
                    <tr key={ins.id} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-[14px] text-[13px] text-[#45556c] whitespace-nowrap">{ins.date}</td>
                      <td className="px-5 py-[14px] text-[13px] text-[#314158] font-medium whitespace-nowrap">{ins.inspector}</td>
                      <td className="px-5 py-[14px] text-[13px] font-mono text-[#45556c] whitespace-nowrap">{ins.odometer_km.toLocaleString()} km</td>
                      <td className="px-5 py-[14px] whitespace-nowrap">
                        {ins.passed ? (
                          <span className="inline-flex items-center gap-1.5 text-[#007a55] text-[12px] font-medium">
                            <span className="text-[#007a55]"><IconCheck /></span> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[#c10007] text-[12px] font-medium">
                            <span className="text-[#c10007]"><IconAlert /></span> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-[14px] text-[13px] text-[#62748e] max-w-[280px]">
                        {ins.issues?.length > 0 && (
                          <ul className="mb-1">
                            {ins.issues.map((issue, i) => (
                              <li key={i} className="text-[#c10007] font-medium text-[12px]">· {issue}</li>
                            ))}
                          </ul>
                        )}
                        {ins.notes && <p className="text-[#90a1b9] text-[12px]">{ins.notes}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Maintenance Log ── */}
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">
          <div className="px-6 py-4 border-b border-[#f1f5f9]">
            <h3 className="text-[#1d293d] font-bold text-[15px] leading-[22px]">Maintenance Log</h3>
            <p className="text-[#90a1b9] text-[12px] mt-0.5">{maintenance.length} record{maintenance.length !== 1 ? 's' : ''}</p>
          </div>

          {maintenance.length === 0 ? (
            <div className="py-10 text-center text-[#90a1b9] text-[14px]">No maintenance records yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px]">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                    {['Date', 'Type', 'Workshop', 'Status', 'Cost', 'Notes'].map((col, i) => (
                      <th key={col} className={`px-5 py-[11px] text-[12px] font-bold text-[#62748e] whitespace-nowrap ${i === 5 ? 'text-left w-full' : 'text-left'}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {maintenance.map(m => (
                    <tr key={m.id} className="border-b border-[#f8fafc] last:border-0 hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-[14px] text-[13px] text-[#45556c] whitespace-nowrap">{m.date}</td>
                      <td className="px-5 py-[14px] text-[13px] text-[#314158] font-medium whitespace-nowrap">{m.type}</td>
                      <td className="px-5 py-[14px] text-[13px] text-[#62748e] whitespace-nowrap">{m.workshop}</td>
                      <td className="px-5 py-[14px] whitespace-nowrap"><MaintenanceBadge status={m.status} /></td>
                      <td className="px-5 py-[14px] text-[13px] font-mono text-[#45556c] whitespace-nowrap">
                        {m.cost != null ? `$${m.cost.toLocaleString()}` : <span className="text-[#cad5e2]">—</span>}
                      </td>
                      <td className="px-5 py-[14px] text-[12px] text-[#90a1b9] max-w-[220px]">{m.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── Edit drawer ── */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-[#0f172b]/40 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full z-40">
            <AddEditVehicleDrawer
              mode="edit"
              initialData={v}
              onClose={() => setDrawerOpen(false)}
              onSave={(data) => {
                setLiveVehicle(prev => ({ ...prev, ...data }))
                setDrawerOpen(false)
              }}
            />
          </div>
        </>
      )}
    </>
  )
}