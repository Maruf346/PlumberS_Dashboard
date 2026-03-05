// src/pages/fleet/AddEditVehicleDrawer.jsx
// 512px right-side drawer — Add or Edit Vehicle.
// Fields mirror the Django Vehicle model exactly:
//   name, plate, picture (upload), status (read-only hint on edit),
//   current_odometer_km, next_service_km, make, model_name, year, notes, is_active
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import FormInput             from '@/components/shared/FormInput'
import FormTextarea          from '@/components/shared/FormTextarea'
import FormSectionHeader     from '@/components/shared/FormSectionHeader'
import VehicleStatusBadge   from '@/components/fleet/VehicleStatusBadge'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconClose()    { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconTruck()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 4h9v8H1zM10 6l3 2v4h-3V6z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/><circle cx="3.5" cy="13" r="1.5" fill="#62748e"/><circle cx="11.5" cy="13" r="1.5" fill="#62748e"/></svg> }
function IconGauge()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="#62748e" strokeWidth="1.2"/><path d="M8 8L5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/><path d="M4.5 11.5a5 5 0 017 0" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconWrench()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 3a3 3 0 00-3.27 3.94L4.6 12.07a1.5 1.5 0 102.12 2.12l5.13-5.13A3 3 0 0013 3zM3.5 13.5a.5.5 0 110-1 .5.5 0 010 1z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconTag()      { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8.5 2H3a1 1 0 00-1 1v5.5l6.5 6.5 5-5L8.5 2z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/><circle cx="5.5" cy="6.5" r="1" fill="#62748e"/></svg> }
function IconCalendar() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5 1.5v2M11 1.5v2M1.5 7h13" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconCamera()   { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 6h16v11H2zM7 6l1.5-3h3L13 6" stroke="#90a1b9" strokeWidth="1.3" strokeLinejoin="round"/><circle cx="10" cy="11.5" r="2.5" stroke="#90a1b9" strokeWidth="1.3"/></svg> }
function IconSave()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v8a1 1 0 01-1 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><rect x="5" y="9" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 2v3.5h4V2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconInfo()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#90a1b9" strokeWidth="1.1"/><path d="M7 6.5v4" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/><circle cx="7" cy="4.5" r="0.6" fill="#90a1b9"/></svg> }

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 w-full group cursor-pointer"
    >
      <span className="text-[#0f172b] text-[14px] font-semibold leading-[20px] select-none">{label}</span>
      {/* Track — 44px wide × 24px tall */}
      <span
        className={[
          'relative inline-flex items-center w-[44px] h-[24px] rounded-full shrink-0 transition-colors duration-200',
          checked ? 'bg-[#f54900]' : 'bg-[#cbd5e1]',
        ].join(' ')}
      >
        {/* Thumb — 18px, 3px inset, slides 20px */}
        <span
          className={[
            'absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-[0px_1px_3px_rgba(0,0,0,0.20)] transition-transform duration-200',
            checked ? 'translate-x-[23px]' : 'translate-x-[3px]',
          ].join(' ')}
        />
      </span>
    </button>
  )
}

// ── Odometer progress bar ─────────────────────────────────────────────────────
function OdometerBar({ current, next }) {
  if (!current || !next) return null
  const pct     = Math.min(100, Math.round((current / next) * 100))
  const overdue = current >= next
  const color   = overdue ? '#c10007' : pct >= 85 ? '#f54900' : '#007a55'
  const remaining = next - current
  return (
    <div className="mt-2 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-[#62748e] uppercase tracking-[0.5px]">
          Service Progress
        </span>
        <span className="text-[12px] font-semibold" style={{ color }}>
          {overdue ? `${Math.abs(remaining).toLocaleString()} km overdue` : `${remaining.toLocaleString()} km remaining`}
        </span>
      </div>
      <div className="h-[6px] bg-[#e2e8f0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-[#90a1b9]">{current.toLocaleString()} km current</span>
        <span className="text-[10px] text-[#90a1b9]">{next.toLocaleString()} km target</span>
      </div>
    </div>
  )
}

// ── Year options ──────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => {
  const y = currentYear - i
  return { value: String(y), label: String(y) }
})

// ── Vehicle type icon ─────────────────────────────────────────────────────────
function VehicleTypeIcon({ name }) {
  const isVan = name?.toLowerCase().includes('van')
  if (isVan) {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="3" y="13" width="28" height="16" rx="3" fill="#314158"/>
        <rect x="31" y="18" width="7" height="8" rx="1.5" fill="#314158"/>
        <circle cx="10" cy="31" r="4" fill="#62748e"/><circle cx="10" cy="31" r="2" fill="#e2e8f0"/>
        <circle cx="29" cy="31" r="4" fill="#62748e"/><circle cx="29" cy="31" r="2" fill="#e2e8f0"/>
        <rect x="8" y="16" width="12" height="7" rx="1" fill="#90a1b9"/>
        <rect x="22" y="17" width="6" height="6" rx="0.8" fill="#90a1b9"/>
      </svg>
    )
  }
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="14" width="22" height="14" rx="2.5" fill="#314158"/>
      <path d="M4 20h22" stroke="#62748e" strokeWidth="0.8"/>
      <rect x="26" y="17" width="11" height="8" rx="1.5" fill="#314158"/>
      <circle cx="11" cy="30" r="4" fill="#62748e"/><circle cx="11" cy="30" r="2" fill="#e2e8f0"/>
      <circle cx="30" cy="30" r="4" fill="#62748e"/><circle cx="30" cy="30" r="2" fill="#e2e8f0"/>
      <rect x="6" y="15" width="9" height="5" rx="0.8" fill="#90a1b9"/>
      <rect x="17" y="15" width="7" height="5" rx="0.8" fill="#90a1b9"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AddEditVehicleDrawer({ mode = 'add', initialData = null, onClose, onSave }) {
  const isEdit  = mode === 'edit' && !!initialData
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    name:                initialData?.name                ?? '',
    plate:               initialData?.plate               ?? '',
    picture:             initialData?.picture             ?? null,
    current_odometer_km: initialData?.current_odometer_km ?? '',
    next_service_km:     initialData?.next_service_km     ?? '',
    make:                initialData?.make                ?? '',
    model_name:          initialData?.model_name          ?? '',
    year:                initialData?.year                ? String(initialData.year) : '',
    notes:               initialData?.notes               ?? '',
    is_active:           initialData?.is_active           ?? true,
  })

  const set = (field) => (value) => setForm(prev => ({ ...prev, [field]: value }))
  const [errors, setErrors] = useState({})

  // ── Picture upload ─────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, picture: 'Please select a valid image file' }))
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, picture: ev.target.result }))
      setErrors(prev => ({ ...prev, picture: undefined }))
    }
    reader.readAsDataURL(file)
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Vehicle name is required'
    if (!form.plate.trim()) e.plate = 'Number plate is required'
    if (form.current_odometer_km !== '' && isNaN(Number(form.current_odometer_km)))
      e.current_odometer_km = 'Must be a valid number'
    if (form.next_service_km !== '' && isNaN(Number(form.next_service_km)))
      e.next_service_km = 'Must be a valid number'
    if (form.year && (Number(form.year) < 1980 || Number(form.year) > currentYear + 1))
      e.year = `Year must be between 1980 and ${currentYear + 1}`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    // TODO: Replace with real API
    // const saveVehicle = async (formData) => {
    //   const res = isEdit
    //     ? await axios.put(`/api/fleet/vehicles/${initialData.id}/`, formData)
    //     : await axios.post('/api/fleet/vehicles/', formData)
    //   return res.data
    // }
    onSave?.({
      ...initialData,
      ...form,
      current_odometer_km: form.current_odometer_km !== '' ? Number(form.current_odometer_km) : null,
      next_service_km:     form.next_service_km !== ''     ? Number(form.next_service_km)     : null,
      year:                form.year !== ''                ? Number(form.year)                : null,
    })
    onClose?.()
  }

  const currentOdo  = form.current_odometer_km !== '' ? Number(form.current_odometer_km) : null
  const nextSvcKm   = form.next_service_km     !== '' ? Number(form.next_service_km)     : null

  return (
    <div className="w-full xl:w-[512px] shrink-0 bg-white border-l border-[#e2e8f0] flex flex-col h-full shadow-[-4px_0px_24px_0px_rgba(15,23,43,0.08)]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-6 pt-5 pb-5 border-b border-[#e2e8f0] shrink-0">
        <div>
          <h2 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">
            {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
          </h2>
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-1">
            {isEdit ? `Editing ${initialData.name} · ${initialData.plate}` : 'Register a new vehicle to the fleet'}
          </p>
        </div>
        <button onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shrink-0 mt-0.5"
          aria-label="Close">
          <IconClose />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-7">

          {/* ── Vehicle Preview Card ── */}
          <div className="flex items-center gap-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px]">
            {/* Photo or illustration */}
            <div className="relative shrink-0">
              {form.picture ? (
                <img src={form.picture} alt="Vehicle"
                  className="w-[72px] h-[52px] rounded-[8px] object-cover border border-[#e2e8f0]" />
              ) : (
                <div className="w-[72px] h-[52px] rounded-[8px] bg-[#1d293d] border border-[#314158] flex items-center justify-center">
                  <VehicleTypeIcon name={form.name} />
                </div>
              )}
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white border-2 border-[#e2e8f0] flex items-center justify-center hover:bg-[#f8fafc] transition-colors shadow-sm">
                <IconCamera />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Name / plate live preview */}
            <div className="flex-1 min-w-0">
              <p className="text-[#0f172b] font-bold text-[16px] leading-[22px] truncate">
                {form.name || <span className="text-[#90a1b9] font-normal">Vehicle Name</span>}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {form.plate ? (
                  <span className="inline-flex items-center px-2 py-0.5 bg-[#0f172b] text-white text-[11px] font-mono font-bold rounded-[4px] tracking-wider">
                    {form.plate}
                  </span>
                ) : (
                  <span className="text-[#90a1b9] text-[12px]">plate number</span>
                )}
                {form.make && form.model_name && (
                  <span className="text-[#62748e] text-[12px]">
                    {form.make} {form.model_name}{form.year ? ` · ${form.year}` : ''}
                  </span>
                )}
              </div>
              {isEdit && (
                <div className="mt-1.5">
                  <VehicleStatusBadge status={initialData.status} />
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => fileRef.current?.click()}
                  className="text-[12px] text-[#f54900] font-medium hover:text-[#c73b00] transition-colors">
                  {form.picture ? 'Change photo' : 'Upload photo'}
                </button>
                {form.picture && (
                  <>
                    <span className="text-[#e2e8f0]">·</span>
                    <button onClick={() => setForm(p => ({ ...p, picture: null }))}
                      className="text-[12px] text-[#c10007] font-medium hover:text-[#a30006] transition-colors">
                      Remove
                    </button>
                  </>
                )}
              </div>
              {errors.picture && <p className="text-[#c10007] text-[12px] mt-1">{errors.picture}</p>}
            </div>
          </div>

          {/* ── Identity ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconTag} title="Vehicle Identity" />

            {/* Name */}
            <FormInput label="Vehicle Name" id="name" value={form.name}
              onChange={set('name')} placeholder='e.g. Van-04, Ute-02'
              required icon={IconTruck} error={errors.name}
              hint='Displayed in job assignments and fleet list' />

            {/* Plate */}
            <FormInput label="Number Plate" id="plate" value={form.plate}
              onChange={(v) => set('plate')(v.toUpperCase())}
              placeholder='e.g. ABC-1234'
              required icon={IconTag} error={errors.plate}
              hint='Must be unique across all vehicles' />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Make / Model / Year ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconTruck} title="Vehicle Details" />
            <p className="text-[#90a1b9] text-[12px] -mt-2 leading-[18px]">All optional — used for service records.</p>

            {/* Make + Model side by side */}
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Make" id="make" value={form.make}
                onChange={set('make')} placeholder='e.g. Toyota'
                icon={IconTruck} />
              <FormInput label="Model" id="model_name" value={form.model_name}
                onChange={set('model_name')} placeholder='e.g. HiAce'
                icon={IconTruck} />
            </div>

            {/* Year */}
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="year" className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">
                Year
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#90a1b9]">
                  <IconCalendar />
                </span>
                <select
                  id="year"
                  value={form.year}
                  onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                  className={[
                    'w-full h-[38px] rounded-[8px] border text-[14px] leading-[20px] appearance-none pl-9 pr-9 py-[9px] transition-colors cursor-pointer',
                    form.year ? 'text-[#0f172b]' : 'text-[#90a1b9]',
                    errors.year
                      ? 'border-[#c10007] bg-[#fef2f2] focus:outline-none focus:ring-2 focus:ring-[#c10007]/20'
                      : 'border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60',
                  ].join(' ')}
                >
                  <option value="">Select year...</option>
                  {YEAR_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="#90a1b9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              {errors.year && <p className="text-[#c10007] text-[12px] leading-[16px]">{errors.year}</p>}
            </div>
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Service Tracking ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconGauge} title="Service Tracking" />

            <FormInput label="Current Odometer (km)" id="current_odometer_km"
              type="number" value={form.current_odometer_km}
              onChange={set('current_odometer_km')}
              placeholder='e.g. 42500'
              icon={IconGauge}
              error={errors.current_odometer_km}
              hint='Current odometer reading in kilometres' />

            <FormInput label="Next Service At (km)" id="next_service_km"
              type="number" value={form.next_service_km}
              onChange={set('next_service_km')}
              placeholder='e.g. 50000'
              icon={IconWrench}
              error={errors.next_service_km}
              hint='Odometer reading at which next service is due' />

            {/* Live odometer progress bar */}
            <OdometerBar current={currentOdo} next={nextSvcKm} />

            {/* Status read-only notice */}
            <div className="flex items-start gap-2.5 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px]">
              <IconInfo />
              <p className="text-[#62748e] text-[12px] leading-[18px]">
                <span className="font-semibold text-[#314158]">Vehicle status</span> is computed automatically by the system based on inspection history and odometer readings. It cannot be set manually.
              </p>
            </div>
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Notes ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconWrench} title="Notes" />
            <FormTextarea label="Notes" id="notes" value={form.notes}
              onChange={set('notes')}
              placeholder='Any relevant notes, known issues, modifications...'
              rows={3} />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Active toggle ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconTag} title="Fleet Status" />
            <div
              className={[
                'p-4 rounded-[10px] border transition-colors duration-200',
                form.is_active
                  ? 'bg-[#f0fdf4] border-[#bbf7d0]'
                  : 'bg-[#f8fafc] border-[#e2e8f0]',
              ].join(' ')}
            >
              <Toggle
                label="Active in Fleet"
                checked={form.is_active}
                onChange={(v) => setForm(p => ({ ...p, is_active: v }))}
              />
              <p className={[
                'text-[12px] leading-[18px] mt-2.5 transition-colors duration-200',
                form.is_active ? 'text-[#15803d]' : 'text-[#90a1b9]',
              ].join(' ')}>
                {form.is_active
                  ? 'This vehicle is active and available for job assignments.'
                  : 'This vehicle is inactive and will not appear in job assignment dropdowns.'}
              </p>
            </div>
          </section>

        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[#e2e8f0] px-6 py-5 flex items-center justify-end gap-3 bg-white shrink-0">
        <button onClick={onClose}
          className="px-5 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold bg-white hover:bg-[#f8fafc] transition-colors">
          Cancel
        </button>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.30)]">
          <IconSave />
          {isEdit ? 'Save Changes' : 'Add Vehicle'}
        </button>
      </div>
    </div>
  )
}