// src/pages/createjob/CreateJobPage.jsx
// Figma frame 1:2846 — Create New Job
//
// This component is now a DRAWER — rendered inline inside JobsPage.
// It is NOT a routed page. JobsPage mounts it as an overlay with a backdrop.
//
// Props:
//   onClose  — called when ×, Cancel, or backdrop is clicked
//   onSaved  — called after successful save (optional, for list refresh)
// ─────────────────────────────────────────────────────────────────────────────

import { useState }   from 'react'
import FormInput      from '@/components/shared/FormInput'
import FormTextarea   from '@/components/shared/FormTextarea'
import FormSelect     from '@/components/shared/FormSelect'
import MultiSelect    from '@/components/shared/MultiSelect'
import FormSectionHeader from '@/components/shared/FormSectionHeader'
import PdfUploadZone  from '@/components/shared/PdfUploadZone'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 5l10 10M15 5L5 15" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="#90a1b9" strokeWidth="1.2"/>
      <path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 9 7 9.5 9.25 11.25L10.5 9.5 14 11v3c0 .553-4-1-7-4S1 5.5 3 2z"
        stroke="#90a1b9" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}
function IconMapPin() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5z"
        stroke="#90a1b9" strokeWidth="1.2"/>
      <circle cx="8" cy="6" r="1.5" fill="#90a1b9"/>
    </svg>
  )
}
function IconFileText() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2h6l3 3v9H4V2z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M10 2v3h3" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M6 8h4M6 10.5h3" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="#62748e" strokeWidth="1.2"/>
      <path d="M1 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="12" cy="5.5" r="2" stroke="#62748e" strokeWidth="1.2"/>
      <path d="M12 11c1.657 0 3 1.119 3 3" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconUserCog() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="5.5" r="2.5" stroke="#90a1b9" strokeWidth="1.2"/>
      <path d="M1.5 14c0-2.761 2.462-5 5.5-5" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="12.5" cy="12.5" r="1" stroke="#90a1b9" strokeWidth="1.1"/>
      <path d="M12.5 10.5v.5m0 3v.5m-1.73-3.23l.35.35m2.76 2.76l.35.35m-3.23.62h.5m3 0h.5m-3.23-3.23l.35-.35m2.76-2.76l.35-.35"
        stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  )
}
function IconUserCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="5.5" r="2.5" stroke="#90a1b9" strokeWidth="1.2"/>
      <path d="M1.5 14c0-2.761 2.462-5 5.5-5" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10.5 12l1.5 1.5 3-3" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconPaperclip() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 7.5l-5.657 5.657a4 4 0 01-5.657-5.657l5.657-5.657a2.5 2.5 0 013.536 3.536L5.722 11.03a1 1 0 01-1.415-1.414L9.964 4" 
        stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconTruck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 4h9v7H1zM10 6l3 2v3h-3V6z" stroke="#90a1b9" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="3.5" cy="12" r="1.5" fill="#90a1b9"/>
      <circle cx="11.5" cy="12" r="1.5" fill="#90a1b9"/>
    </svg>
  )
}

// ── Options data ──────────────────────────────────────────────────────────────
const SAFETY_OPTIONS = [
  { value: 'standard',   label: 'Standard Safety Protocol'   },
  { value: 'enhanced',   label: 'Enhanced Safety Protocol'   },
  { value: 'confined',   label: 'Confined Space Entry'       },
  { value: 'electrical', label: 'Electrical Hazard Protocol' },
  { value: 'chemical',   label: 'Chemical Handling Protocol' },
]
const INSURED_OPTIONS = [
  { value: 'apex',        label: 'Apex Industries'      },
  { value: 'city-center', label: 'City Center Mall'     },
  { value: 'westside',    label: 'Westside Apartments'  },
  { value: 'harbor',      label: 'Harbor Warehouse'     },
  { value: 'techpark',    label: 'Tech Park'            },
]
const CONTACT_OPTIONS = [
  { value: 'robert-chen',   label: 'Robert Chen — +1 (212) 555-0182'   },
  { value: 'james-wu',      label: 'James Wu — +1 (212) 555-0193'      },
  { value: 'linda-alvarez', label: 'Linda Alvarez — +1 (212) 555-0207' },
  { value: 'tony-marsh',    label: 'Tony Marsh — +1 (212) 555-0241'    },
]
// Multi-select — managers (array of values)
const MANAGER_OPTIONS = [
  { value: 'sarah-lee',  label: 'Sarah Lee'  },
  { value: 'david-kim',  label: 'David Kim'  },
  { value: 'emily-chen', label: 'Emily Chen' },
  { value: 'tom-baker',  label: 'Tom Baker'  },
]
const STAFF_OPTIONS = [
  { value: 'mike-ross',  label: 'Mike Ross'  },
  { value: 'john-doe',   label: 'John Doe'   },
  { value: 'lisa-park',  label: 'Lisa Park'  },
  { value: 'chris-hall', label: 'Chris Hall' },
  { value: 'nina-webb',  label: 'Nina Webb'  },
]
const VEHICLE_OPTIONS = [
  { value: 'van-01',   label: 'Van-01'   },
  { value: 'van-02',   label: 'Van-02'   },
  { value: 'van-03',   label: 'Van-03'   },
  { value: 'truck-01', label: 'Truck-01' },
  { value: 'truck-02', label: 'Truck-02' },
]

// ─────────────────────────────────────────────────────────────────────────────
export default function CreateJobPage({ onClose, onSaved }) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    clientName:     '',
    phone:          '',
    address:        '',
    description:    '',
    safetyReq:      '',
    insuredName:    '',
    insuredContact: '',
    managers:       [],   // ← array for multi-select
    staff:          '',
    vehicle:        '',
  })
  const set    = (field) => (value) => setForm(prev => ({ ...prev, [field]: value }))
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.clientName.trim())    e.clientName  = 'Client name is required'
    if (!form.phone.trim())         e.phone       = 'Phone number is required'
    if (!form.address.trim())       e.address     = 'Address is required'
    if (!form.description.trim())   e.description = 'Job description is required'
    if (!form.safetyReq)            e.safetyReq   = 'Safety requirement is required'
    if (form.managers.length === 0) e.managers    = 'Please assign at least one manager'
    if (!form.staff)                e.staff       = 'Please assign staff'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    // TODO: Replace with real API
    // await axios.post('/api/jobs', form)
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
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-1">
            Enter job details and assignment
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shrink-0 mt-0.5"
          aria-label="Close"
        >
          <IconClose />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-7">

          {/* ── Client Details ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconUser} title="Client Details" />
            <FormInput label="Client" id="clientName" value={form.clientName}
              onChange={set('clientName')} placeholder="e.g. Apex Industries"
              required icon={IconUser} error={errors.clientName} />
            <FormInput label="Phone Number" id="phone" type="tel" value={form.phone}
              onChange={set('phone')} placeholder="(555) 123-4567"
              required icon={IconPhone} error={errors.phone} />
            <FormInput label="Address" id="address" value={form.address}
              onChange={set('address')} placeholder="e.g. 458 Industrial Ave"
              required icon={IconMapPin} error={errors.address} />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Job Details ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconFileText} title="Job Details" />
            <FormTextarea label="Job Description" id="description" value={form.description}
              onChange={set('description')} placeholder="Describe the job requirements..."
              required rows={4} error={errors.description} />
            <FormSelect label="Safety Requirement" id="safetyReq" value={form.safetyReq}
              onChange={set('safetyReq')} options={SAFETY_OPTIONS}
              placeholder="Select safety protocol..." required error={errors.safetyReq} />
            <FormSelect label="Insured Name" id="insuredName" value={form.insuredName}
              onChange={set('insuredName')} options={INSURED_OPTIONS}
              placeholder="Select insured entity..." />
            <FormSelect label="Insured Contact" id="insuredContact" value={form.insuredContact}
              onChange={set('insuredContact')} options={CONTACT_OPTIONS}
              placeholder="Select contact..." />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Assignment ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconUsers} title="Assignment" />

            {/* ▼ Multi-select managers */}
            <MultiSelect
              label="Assign Manager(s)"
              id="managers"
              options={MANAGER_OPTIONS}
              value={form.managers}
              onChange={set('managers')}
              placeholder="Select one or more managers..."
              required
              icon={IconUserCog}
              error={errors.managers}
            />

            <FormSelect label="Assign Staff" id="staff" value={form.staff}
              onChange={set('staff')} options={STAFF_OPTIONS}
              placeholder="Select staff member..." required
              icon={IconUserCheck} error={errors.staff} />

            <FormSelect label="Vehicle" id="vehicle" value={form.vehicle}
              onChange={set('vehicle')} options={VEHICLE_OPTIONS}
              placeholder="Select vehicle..." icon={IconTruck} />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Attachments ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconPaperclip} title="Attachments" />
            <PdfUploadZone label="Attachments" maxSizeMB={10} />
          </section>

        </div>
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-[#e2e8f0] px-6 py-5 flex items-center justify-end gap-3 bg-white shrink-0">
        <button
          onClick={onClose}
          className="px-5 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold bg-white hover:bg-[#f8fafc] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-5 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] active:bg-[#a83200] text-white text-[14px] font-semibold shadow-[0px_1px_3px_rgba(245,73,0,0.30)] transition-colors"
        >
          Create Job
        </button>
      </div>
    </div>
  )
}