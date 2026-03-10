// src/pages/createjob/CreateJobPage.jsx
// Create New Job — drawer, mounted inside JobsPage
//
// API (commented out — uncomment when backend ready):
//   POST /api/jobs/create/
//   Payload: { job_name, job_details, priority, client_id, assigned_to_id,
//              assigned_manager_ids, vehicle_id, safety_form_ids,
//              report_template_ids }
//   NOTE: scheduled_datetime intentionally omitted — added via Scheduling page later
//
// Props:
//   onClose  — close the drawer
//   onSaved  — optional callback after successful save
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react'
import { apiFetch } from '@/utils/apiFetch'

import FormInput         from '@/components/shared/FormInput'
import FormTextarea      from '@/components/shared/FormTextarea'
import FormSelect        from '@/components/shared/FormSelect'
import MultiSelect       from '@/components/shared/MultiSelect'
import FormSectionHeader from '@/components/shared/FormSectionHeader'
import PdfUploadZone     from '@/components/shared/PdfUploadZone'

import { CLIENTS, MANAGERS, STAFF } from '@/data/peopleMock'
import { VEHICLES }                  from '@/data/fleetMock'

// ── Report template mocks (replace with API when ready) ──────────────────────
const REPORT_TEMPLATES = [
  { id: 'RPT-001', name: 'Plumbing Inspection Report'   },
  { id: 'RPT-002', name: 'Leak Assessment Report'        },
  { id: 'RPT-003', name: 'Drainage System Report'        },
  { id: 'RPT-004', name: 'Hot Water System Report'       },
  { id: 'RPT-005', name: 'Emergency Callout Report'      },
  { id: 'RPT-006', name: 'Preventive Maintenance Report' },
]

// ── Priority options ──────────────────────────────────────────────────────────
const PRIORITY_OPTIONS = [
  { value: 'low',      label: 'Low'      },
  { value: 'medium',   label: 'Medium'   },
  { value: 'high',     label: 'High'     },
  { value: 'urgent', label: 'Urgent' },
]

// ── Derived select option lists from mocks ────────────────────────────────────
const MANAGER_OPTIONS = MANAGERS.map(m => ({ value: m.id, label: m.name }))
const STAFF_OPTIONS   = STAFF.map(s => ({ value: s.id, label: s.name }))
const VEHICLE_OPTIONS = VEHICLES
  .filter(v => v.is_active)
  .map(v => ({ value: v.id, label: `${v.name} · ${v.plate}` }))
// SAFETY_FORM_OPTIONS fetched from API on mount (see safetyFormOptions state below)
const REPORT_TEMPLATE_OPTIONS = REPORT_TEMPLATES.map(r => ({ value: r.id, label: r.name }))

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconClose()      { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconUser()       { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#90a1b9" strokeWidth="1.2"/><path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconPhone()      { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 9 7 9.5 9.25 11.25L10.5 9.5 14 11v3c0 .553-4-1-7-4S1 5.5 3 2z" stroke="#90a1b9" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconMapPin()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5z" stroke="#90a1b9" strokeWidth="1.2"/><circle cx="8" cy="6" r="1.5" fill="#90a1b9"/></svg> }
function IconMail()       { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#90a1b9" strokeWidth="1.2"/><path d="M1.5 5.5l6.5 4 6.5-4" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconBriefcase()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="5" width="13" height="9" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5.5 5V3.5A1.5 1.5 0 017 2h2a1.5 1.5 0 011.5 1.5V5" stroke="#62748e" strokeWidth="1.2"/><path d="M1.5 9h13" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconFileText()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h6l3 3v9H4V2z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 2v3h3" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6 8h4M6 10.5h3" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconShield()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V4L8 1.5z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconClipboard()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="12" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5.5 3V2h5v1" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 8h6M5 11h4" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconUsers()      { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="#62748e" strokeWidth="1.2"/><path d="M1 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/><circle cx="12" cy="5.5" r="2" stroke="#62748e" strokeWidth="1.2"/><path d="M12 11c1.657 0 3 1.119 3 3" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconUserCog()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="5.5" r="2.5" stroke="#90a1b9" strokeWidth="1.2"/><path d="M1.5 14c0-2.761 2.462-5 5.5-5" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/><circle cx="12.5" cy="12.5" r="1" stroke="#90a1b9" strokeWidth="1.1"/><path d="M12.5 10.5v.5m0 3v.5m-1.73-3.23l.35.35m2.76 2.76l.35.35m-3.23.62h.5m3 0h.5m-3.23-3.23l.35-.35m2.76-2.76l.35-.35" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconUserCheck()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="5.5" r="2.5" stroke="#90a1b9" strokeWidth="1.2"/><path d="M1.5 14c0-2.761 2.462-5 5.5-5" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/><path d="M10.5 12l1.5 1.5 3-3" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconTruck()      { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 4h9v7H1zM10 6l3 2v3h-3V6z" stroke="#90a1b9" strokeWidth="1.2" strokeLinejoin="round"/><circle cx="3.5" cy="12" r="1.5" fill="#90a1b9"/><circle cx="11.5" cy="12" r="1.5" fill="#90a1b9"/></svg> }
function IconPaperclip()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 7.5l-5.657 5.657a4 4 0 01-5.657-5.657l5.657-5.657a2.5 2.5 0 013.536 3.536L5.722 11.03a1 1 0 01-1.415-1.414L9.964 4" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconSearch()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#90a1b9" strokeWidth="1.2"/><path d="M9.5 9.5L13 13" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconLock()       { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="6" width="9" height="6" rx="1.2" stroke="#90a1b9" strokeWidth="1.1"/><path d="M4 6V4.5a2.5 2.5 0 015 0V6" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconFlag()       { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2v12" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/><path d="M3 3h9l-2 3.5 2 3.5H3" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconChevron()    { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }

// ── Locked read-only field (populated from client selection) ──────────────────
function LockedField({ label, value, icon: Icon, placeholder }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-center gap-1.5">
        <label className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">{label}</label>
        <span className="flex items-center gap-1 text-[#90a1b9]"><IconLock /><span className="text-[11px]">Auto-filled</span></span>
      </div>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><Icon /></span>
        )}
        <div className={`w-full h-[38px] rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] ${Icon ? 'pl-9' : 'px-3'} pr-3 flex items-center`}>
          {value
            ? <span className="text-[14px] text-[#45556c] truncate">{value}</span>
            : <span className="text-[14px] text-[#cad5e2] italic">{placeholder}</span>
          }
        </div>
      </div>
    </div>
  )
}

// ── Client typeahead search ───────────────────────────────────────────────────
function ClientSearch({ value, onChange, error }) {
  // value = client id or ''
  const [query,    setQuery]    = useState('')
  const [open,     setOpen]     = useState(false)
  const [focused,  setFocused]  = useState(false)
  const ref = useRef(null)

  const selected = CLIENTS.find(c => c.id === value)

  const filtered = query.trim()
    ? CLIENTS.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase())
      )
    : CLIENTS

  // Close on outside click
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleSelect = (client) => {
    onChange(client.id)
    setQuery('')
    setOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setQuery('')
  }

  return (
    <div className="flex flex-col gap-[6px]" ref={ref}>
      <label className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">
        Client <span className="text-[#f54900]">*</span>
      </label>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <IconSearch />
        </span>

        {/* Show selected client pill or search input */}
        {selected && !focused ? (
          <div className={`w-full h-[38px] rounded-[8px] border flex items-center justify-between px-3 pl-9 ${error ? 'border-[#c10007] bg-[#fef2f2]' : 'border-[#e2e8f0] bg-white'}`}>
            <span className="text-[14px] text-[#0f172b] font-medium truncate">{selected.name}</span>
            <button type="button" onClick={handleClear}
              className="ml-2 text-[#90a1b9] hover:text-[#c10007] transition-colors shrink-0 text-[18px] leading-none">
              ×
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={query}
            placeholder={selected ? selected.name : 'Search client by name or email…'}
            onFocus={() => { setFocused(true); setOpen(true) }}
            onBlur={() => setFocused(false)}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            className={[
              'w-full h-[38px] rounded-[8px] border text-[14px] pl-9 pr-3 py-[9px]',
              'placeholder:text-[#90a1b9] text-[#0f172b] transition-colors',
              'focus:outline-none focus:ring-2',
              error
                ? 'border-[#c10007] bg-[#fef2f2] focus:ring-[#c10007]/20'
                : 'border-[#e2e8f0] bg-white focus:ring-[#f54900]/25 focus:border-[#f54900]/60',
            ].join(' ')}
          />
        )}

        {/* Dropdown */}
        {open && !selected && (
          <div className="absolute left-0 top-[42px] z-50 w-full bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0px_8px_24px_rgba(15,23,43,0.12)] max-h-[220px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-[#90a1b9]">No clients found.</div>
            ) : filtered.map(client => (
              <button
                key={client.id}
                type="button"
                onMouseDown={() => handleSelect(client)}
                className="flex items-center gap-3 w-full px-4 py-[10px] hover:bg-[#f8fafc] transition-colors text-left"
              >
                {/* Initials avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
                  style={{ backgroundColor: client.color ?? '#90a1b9' }}>
                  {client.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-[#0f172b] font-semibold truncate">{client.name}</p>
                  <p className="text-[11px] text-[#90a1b9] truncate">{client.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-[#c10007] text-[12px] leading-[16px]">{error}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CreateJobPage({ onClose, onSaved }) {
  const [form, setForm] = useState({
    client_id:            '',   // UUID selected from client search
    job_name:             '',
    job_details:          '',
    priority:             '',
    safety_form_ids:      [],   // array of template IDs
    report_template_ids:  [],   // array of report template IDs (optional)
    assigned_manager_ids: [],   // array of manager IDs
    assigned_to_id:       '',   // single staff ID
    vehicle_id:           '',   // single vehicle ID
  })
  const set    = field => value => setForm(prev => ({ ...prev, [field]: value }))
  const [errors, setErrors] = useState({})

  // Safety form options — fetched from API (replaces removed MOCK_TEMPLATES)
  const [safetyFormOptions, setSafetyFormOptions] = useState([])
  useEffect(() => {
    ;(async () => {
      const { data, ok } = await apiFetch('safety-forms/?all=true')
      if (ok && data) {
        const list = Array.isArray(data) ? data : (data.results ?? [])
        setSafetyFormOptions(list.map(t => ({ value: t.id, label: t.name })))
      }
    })()
  }, [])

  // Derive the selected client object for auto-fill
  const selectedClient = CLIENTS.find(c => c.id === form.client_id) ?? null

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.client_id)                   e.client_id            = 'Please select a client'
    if (!form.job_name.trim())             e.job_name             = 'Job name is required'
    if (!form.job_details.trim())          e.job_details          = 'Job details are required'
    if (!form.priority)                    e.priority             = 'Priority is required'
    if (form.safety_form_ids.length === 0) e.safety_form_ids      = 'Select at least one safety form'
    if (form.assigned_manager_ids.length === 0) e.assigned_manager_ids = 'Assign at least one manager'
    if (!form.assigned_to_id)             e.assigned_to_id       = 'Please assign a staff member'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return

    // ── API call — uncomment when backend ready ────────────────────────────
    //
    // const apiBase = import.meta.env.VITE_API_BASE_URL
    // const endpoint = `${apiBase}jobs/create/`
    //
    // const payload = {
    //   job_name:             form.job_name.trim(),
    //   job_details:          form.job_details.trim(),
    //   priority:             form.priority,
    //   client_id:            form.client_id,
    //   assigned_to_id:       form.assigned_to_id,
    //   assigned_manager_ids: form.assigned_manager_ids,
    //   vehicle_id:           form.vehicle_id || undefined,
    //   safety_form_ids:      form.safety_form_ids,
    //   report_template_ids:  form.report_template_ids,
    //   // scheduled_datetime: omitted — added via Scheduling page
    // }
    //
    // try {
    //   const res = await fetch(endpoint, {
    //     method:  'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body:    JSON.stringify(payload),
    //   })
    //   if (!res.ok) {
    //     const data = await res.json()
    //     if (data && typeof data === 'object') {
    //       const fieldErrors = {}
    //       for (const [key, val] of Object.entries(data)) {
    //         fieldErrors[key] = Array.isArray(val) ? val[0] : String(val)
    //       }
    //       setErrors(fieldErrors)
    //       return
    //     }
    //     throw new Error('Server error')
    //   }
    //   onSaved?.()
    //   onClose()
    //   return
    // } catch (err) {
    //   setErrors({ _global: 'Something went wrong. Please try again.' })
    //   return
    // }
    //
    // ── End API call ─────────────────────────────────────────────────────────

    onSaved?.()
    onClose()
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full xl:w-[512px] shrink-0 bg-white border-l border-[#e2e8f0] flex flex-col h-full shadow-[-4px_0px_32px_0px_rgba(15,23,43,0.12)]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-6 pt-5 pb-5 border-b border-[#e2e8f0] shrink-0">
        <div>
          <h2 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">Create New Job</h2>
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-1">Enter job details and assignment</p>
        </div>
        <button onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shrink-0 mt-0.5">
          <IconClose />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-7">

          {/* Global error */}
          {errors._global && (
            <div className="flex items-center gap-3 px-4 py-3 bg-[#fef2f2] border border-[#ffe2e2] rounded-[10px]">
              <p className="text-[#c10007] text-[13px] font-medium">{errors._global}</p>
            </div>
          )}

          {/* ── Section 1: Client Details ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconUser} title="Client Details" />

            {/* Client search typeahead */}
            <ClientSearch
              value={form.client_id}
              onChange={set('client_id')}
              error={errors.client_id}
            />

            {/* Auto-filled locked fields — populated from selected client */}
            <LockedField
              label="Phone Number"
              icon={IconPhone}
              value={selectedClient?.phone}
              placeholder="Auto-filled from client"
            />
            <LockedField
              label="Insured Address"
              icon={IconMapPin}
              value={selectedClient?.address}
              placeholder="Auto-filled from client"
            />
            <LockedField
              label="Insured Name"
              icon={IconUser}
              value={selectedClient?.name}
              placeholder="Auto-filled from client"
            />
            <LockedField
              label="Insured Email"
              icon={IconMail}
              value={selectedClient?.email}
              placeholder="Auto-filled from client"
            />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Section 2: Job Info ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconBriefcase} title="Job Info" />

            <FormInput
              label="Job Name" id="job_name"
              value={form.job_name} onChange={set('job_name')}
              placeholder="e.g. Emergency Pipe Repair — Level 3"
              required error={errors.job_name}
              icon={IconBriefcase}
            />

            <FormTextarea
              label="Job Details" id="job_details"
              value={form.job_details} onChange={set('job_details')}
              placeholder="Describe the job scope, requirements and any special instructions…"
              required rows={4} error={errors.job_details}
            />

            <FormSelect
              label="Priority" id="priority"
              value={form.priority} onChange={set('priority')}
              options={PRIORITY_OPTIONS}
              placeholder="Select priority…"
              required icon={IconFlag}
              error={errors.priority}
            />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Section 3: Safety & Reports ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconShield} title="Safety & Reports" />

            <MultiSelect
              label="Safety Requirement Form"
              id="safety_form_ids"
              options={safetyFormOptions}
              value={form.safety_form_ids}
              onChange={set('safety_form_ids')}
              placeholder="Select safety form template(s)…"
              required
              icon={IconShield}
              error={errors.safety_form_ids}
            />

            <MultiSelect
              label="Attached Report"
              id="report_template_ids"
              options={REPORT_TEMPLATE_OPTIONS}
              value={form.report_template_ids}
              onChange={set('report_template_ids')}
              placeholder="Select report template(s)… (optional)"
              icon={IconClipboard}
            />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Section 4: Assignment ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconUsers} title="Assignment" />

            <MultiSelect
              label="Assign Manager(s)"
              id="assigned_manager_ids"
              options={MANAGER_OPTIONS}
              value={form.assigned_manager_ids}
              onChange={set('assigned_manager_ids')}
              placeholder="Select one or more managers…"
              required
              icon={IconUserCog}
              error={errors.assigned_manager_ids}
            />

            <FormSelect
              label="Assign Staff"
              id="assigned_to_id"
              value={form.assigned_to_id}
              onChange={set('assigned_to_id')}
              options={STAFF_OPTIONS}
              placeholder="Select staff member…"
              required
              icon={IconUserCheck}
              error={errors.assigned_to_id}
            />

            <FormSelect
              label="Vehicle"
              id="vehicle_id"
              value={form.vehicle_id}
              onChange={set('vehicle_id')}
              options={VEHICLE_OPTIONS}
              placeholder="Select vehicle… (optional)"
              icon={IconTruck}
            />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Section 5: Attachments ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconPaperclip} title="Attachments" />
            <PdfUploadZone label="Attachments" maxSizeMB={10} />
          </section>

        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[#e2e8f0] px-6 py-5 flex items-center justify-end gap-3 bg-white shrink-0">
        <button onClick={onClose}
          className="px-5 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold bg-white hover:bg-[#f8fafc] transition-colors">
          Cancel
        </button>
        <button onClick={handleSubmit}
          className="px-5 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] active:bg-[#a83200] text-white text-[14px] font-semibold shadow-[0px_1px_3px_rgba(245,73,0,0.30)] transition-colors">
          Create Job
        </button>
      </div>
    </div>
  )
}