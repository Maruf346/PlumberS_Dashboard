// src/pages/editjob/EditJobPage.jsx
// Edit Job — reuses Create Job form architecture in prefilled edit mode.
// Route: /admin/jobs/:jobId/edit
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect }    from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import FormInput              from '@/components/shared/FormInput'
import FormTextarea           from '@/components/shared/FormTextarea'
import FormSelect             from '@/components/shared/FormSelect'
import FormSectionHeader      from '@/components/shared/FormSectionHeader'
import PdfUploadZone          from '@/components/shared/PdfUploadZone'
import StatusBadge            from '@/components/shared/StatusBadge'

import EditJobNotFound        from '@/components/editjob/EditJobNotFound'
import EditJobExistingFiles   from '@/components/editjob/EditJobExistingFiles'
import DeleteJobModal         from '@/components/editjob/DeleteJobModal'

import { JOBS_FULL }          from '@/data/jobsFullMock'
import {
  SAFETY_OPTIONS, INSURED_OPTIONS, CONTACT_OPTIONS,
  MANAGER_OPTIONS, STAFF_OPTIONS,
  STATUS_OPTIONS, PRIORITY_OPTIONS, VEHICLE_OPTIONS,
  managerToValue, staffToValue, clientToInsuredValue,
} from '@/data/formOptions'

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
function IconArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 15L7.5 10l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="#62748e" strokeWidth="1.2"/>
      <path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
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
function IconPaperclip() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.5 7.5l-6 6a4 4 0 01-5.657-5.657l6-6a2.5 2.5 0 013.536 3.536l-6 6a1 1 0 01-1.414-1.414l5.293-5.293"
        stroke="#62748e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconSliders() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="5"  cy="4"  r="1.5" fill="white" stroke="#62748e" strokeWidth="1.2"/>
      <circle cx="11" cy="8"  r="1.5" fill="white" stroke="#62748e" strokeWidth="1.2"/>
      <circle cx="7"  cy="12" r="1.5" fill="white" stroke="#62748e" strokeWidth="1.2"/>
    </svg>
  )
}
function IconTruck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5h9v7H2z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M11 8l3 1.5V12h-3z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="5"  cy="12.5" r="1.5" fill="#62748e"/>
      <circle cx="12.5" cy="12.5" r="1.5" fill="#62748e"/>
    </svg>
  )
}
function IconUserCog() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="5" r="2.5" stroke="#90a1b9" strokeWidth="1.2"/>
      <path d="M1.5 14c0-2.485 2.462-4.5 5.5-4.5" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="12.5" cy="12" r="1" fill="#90a1b9"/>
      <path d="M12.5 9v1M12.5 14v1M10.2 10.2l.7.7M14.1 13.1l.7.7M9.5 12h1M14.5 12h1M10.2 13.8l.7-.7M14.1 10.9l.7-.7"
        stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )
}
function IconUserCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="5" r="2.5" stroke="#90a1b9" strokeWidth="1.2"/>
      <path d="M1.5 14c0-2.485 2.462-4.5 5.5-4.5" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10.5 11.5l1.5 1.5L15 10" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconSave() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v8a1 1 0 01-1 1z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <rect x="5" y="9" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5.5 2v3.5h4V2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 5l10 10M15 5L5 15" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ─── Mock extended job data (adds fields not in the list mock) ─────────────────
// Maps job IDs to richer form-level data. Falls back gracefully for unlisted jobs.
const JOB_FORM_DATA = {
  'JB-1024': {
    phone: '+1 (212) 555-0182', description: 'Perform scheduled quarterly maintenance on main commercial cooling tower units. Includes full inspection of all pipe junctions, pressure testing, leak identification and repair, and system sign-off documentation.',
    safetyReq: 'standard', insuredName: 'apex', insuredContact: 'robert-chen',
  },
  'JB-1025': {
    phone: '+1 (718) 555-0294', description: 'Emergency pipe repair in Level 3 food court area. High foot traffic area — full isolation required before work commences.',
    safetyReq: 'enhanced', insuredName: 'city-center', insuredContact: 'james-wu',
  },
  'JB-1022': {
    phone: '+1 (646) 555-0311', description: 'Full HVAC service and filter replacement across warehouse bays 1–4. Confined space entry required for ductwork inspection.',
    safetyReq: 'confined', insuredName: 'harbor', insuredContact: 'tony-marsh',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// EditJobPage
// ─────────────────────────────────────────────────────────────────────────────
export default function EditJobPage() {
  const { jobId }  = useParams()
  const navigate   = useNavigate()

  // Look up job in mock data
  const jobRecord  = JOBS_FULL.find(j => j.id === jobId)
  const jobExtra   = JOB_FORM_DATA[jobId] ?? {}

  // ── Delete confirm modal state ─────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // ── Controlled form state — prefilled from mock ────────────────────────────
  const [form, setForm] = useState(() => {
    if (!jobRecord) return {}
    return {
      clientName:     jobRecord.client,
      phone:          jobExtra.phone       ?? '+1 (555) 000-0000',
      address:        jobRecord.address,
      description:    jobExtra.description ?? `${jobRecord.client} — ${jobRecord.schedule} service.`,
      safetyReq:      jobExtra.safetyReq   ?? 'standard',
      insuredName:    jobExtra.insuredName  ?? clientToInsuredValue(jobRecord.client),
      insuredContact: jobExtra.insuredContact ?? 'robert-chen',
      manager:        managerToValue(jobRecord.manager),
      staff:          staffToValue(jobRecord.staff),
      vehicle:        jobRecord.vehicle,
      status:         jobRecord.status,
      priority:       jobRecord.priority,
    }
  })

  const set = (field) => (value) => setForm(prev => ({ ...prev, [field]: value }))

  // ── Validation ─────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.clientName?.trim()) e.clientName  = 'Client name is required'
    if (!form.phone?.trim())      e.phone       = 'Phone number is required'
    if (!form.address?.trim())    e.address     = 'Address is required'
    if (!form.description?.trim()) e.description = 'Job description is required'
    if (!form.safetyReq)          e.safetyReq   = 'Safety requirement is required'
    if (!form.manager)            e.manager     = 'Please assign a manager'
    if (!form.staff)              e.staff       = 'Please assign staff'
    if (!form.status)             e.status      = 'Status is required'
    if (!form.priority)           e.priority    = 'Priority is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    // TODO: Replace with real API update
    // const updateJob = async (id, formData) => {
    //   const res = await axios.put(`/api/jobs/${id}`, formData);
    //   navigate(`/admin/jobs/${id}`);
    // }
    // updateJob(jobId, form)

    navigate(`/admin/jobs/${jobId}`)
  }

  const handleDeleteConfirm = () => {
    // TODO: Replace with real API delete
    // const deleteJob = async (id) => {
    //   await axios.delete(`/api/jobs/${id}`);
    //   navigate('/admin/jobs');
    // }
    // deleteJob(jobId)

    navigate('/admin/jobs')
  }

  // ── Not-found guard ────────────────────────────────────────────────────────
  if (!jobRecord) {
    return <EditJobNotFound jobId={jobId} />
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteJobModal
          jobId={jobId}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Page layout — mirrors Create Job drawer panel pattern */}
      <div className="min-h-full flex">

        {/* ── Dimmed backdrop (desktop) — click to cancel ── */}
        <div
          className="hidden xl:flex flex-1 bg-[#0f172b]/10 cursor-pointer"
          onClick={() => navigate(`/admin/jobs/${jobId}`)}
        />

        {/* ── Drawer panel ── */}
        <div className="w-full xl:w-[512px] shrink-0 bg-white border-l border-[#e2e8f0] flex flex-col min-h-full shadow-[-4px_0px_24px_0px_rgba(15,23,43,0.08)]">

          {/* ── Panel header ─────────────────────────────────────────────── */}
          <div className="flex items-start justify-between px-6 pt-5 pb-5 border-b border-[#e2e8f0]">
            <div className="flex items-start gap-3 min-w-0">
              {/* Back button */}
              <button
                onClick={() => navigate(`/admin/jobs/${jobId}`)}
                className="flex items-center justify-center w-8 h-8 rounded-[8px] border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#314158] transition-colors shrink-0 mt-0.5"
              >
                <IconArrowLeft />
              </button>

              {/* Title block */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">Edit Job</h2>
                  <StatusBadge status={jobRecord.status} />
                </div>
                <p className="text-[#62748e] text-[13px] leading-[20px] mt-0.5">
                  Editing&nbsp;
                  <span className="font-['Consolas',monospace] font-bold text-[#f54900]">{jobId}</span>
                  &nbsp;·&nbsp;{jobRecord.client}
                </p>
              </div>
            </div>

            {/* Close × */}
            <button
              onClick={() => navigate(`/admin/jobs/${jobId}`)}
              className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shrink-0 mt-0.5"
            >
              <IconClose />
            </button>
          </div>

          {/* ── Scrollable form body ─────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex flex-col gap-7">

              {/* ══════════════════════════════════════
                  SECTION 1 — Client Details
              ══════════════════════════════════════ */}
              <section className="flex flex-col gap-4">
                <FormSectionHeader icon={IconUser} title="Client Details" />

                <FormInput
                  label="Client"
                  id="clientName"
                  value={form.clientName}
                  onChange={set('clientName')}
                  placeholder="e.g. Apex Industries"
                  required
                  icon={IconUser}
                  error={errors.clientName}
                />

                <FormInput
                  label="Phone Number"
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="(555) 123-4567"
                  required
                  icon={IconPhone}
                  error={errors.phone}
                />

                <FormInput
                  label="Address"
                  id="address"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="e.g. 458 Industrial Ave"
                  required
                  icon={IconMapPin}
                  error={errors.address}
                />
              </section>

              {/* Divider */}
              <div className="h-px bg-[#f1f5f9]" />

              {/* ══════════════════════════════════════
                  SECTION 2 — Job Details
              ══════════════════════════════════════ */}
              <section className="flex flex-col gap-4">
                <FormSectionHeader icon={IconFileText} title="Job Details" />

                <FormTextarea
                  label="Job Description"
                  id="description"
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Describe the job requirements..."
                  required
                  rows={4}
                  error={errors.description}
                />

                <FormSelect
                  label="Safety Requirement From"
                  id="safetyReq"
                  value={form.safetyReq}
                  onChange={set('safetyReq')}
                  options={SAFETY_OPTIONS}
                  placeholder="Select safety protocol..."
                  required
                  error={errors.safetyReq}
                />

                <FormSelect
                  label="Insured Name"
                  id="insuredName"
                  value={form.insuredName}
                  onChange={set('insuredName')}
                  options={INSURED_OPTIONS}
                  placeholder="Select insured entity..."
                />

                <FormSelect
                  label="Insured Contact Phone/E-mail"
                  id="insuredContact"
                  value={form.insuredContact}
                  onChange={set('insuredContact')}
                  options={CONTACT_OPTIONS}
                  placeholder="Select contact..."
                />
              </section>

              {/* Divider */}
              <div className="h-px bg-[#f1f5f9]" />

              {/* ══════════════════════════════════════
                  SECTION 3 — Assignment
              ══════════════════════════════════════ */}
              <section className="flex flex-col gap-4">
                <FormSectionHeader icon={IconUsers} title="Assignment" />

                <FormSelect
                  label="Assign Manager"
                  id="manager"
                  value={form.manager}
                  onChange={set('manager')}
                  options={MANAGER_OPTIONS}
                  placeholder="Select manager..."
                  required
                  icon={IconUserCog}
                  error={errors.manager}
                />

                <FormSelect
                  label="Assign Staff"
                  id="staff"
                  value={form.staff}
                  onChange={set('staff')}
                  options={STAFF_OPTIONS}
                  placeholder="Select staff member..."
                  required
                  icon={IconUserCheck}
                  error={errors.staff}
                />

                <FormSelect
                  label="Vehicle"
                  id="vehicle"
                  value={form.vehicle}
                  onChange={set('vehicle')}
                  options={VEHICLE_OPTIONS}
                  placeholder="Select vehicle..."
                  icon={IconTruck}
                />
              </section>

              {/* Divider */}
              <div className="h-px bg-[#f1f5f9]" />

              {/* ══════════════════════════════════════
                  SECTION 4 — Status & Priority
              ══════════════════════════════════════ */}
              <section className="flex flex-col gap-4">
                <FormSectionHeader icon={IconSliders} title="Status & Priority" />

                {/* Two-column grid on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Status"
                    id="status"
                    value={form.status}
                    onChange={set('status')}
                    options={STATUS_OPTIONS}
                    placeholder="Select status..."
                    required
                    error={errors.status}
                  />

                  <FormSelect
                    label="Priority"
                    id="priority"
                    value={form.priority}
                    onChange={set('priority')}
                    options={PRIORITY_OPTIONS}
                    placeholder="Select priority..."
                    required
                    error={errors.priority}
                  />
                </div>

                {/* Status preview */}
                {form.status && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px]">
                    <span className="text-[12px] text-[#62748e]">Current status:</span>
                    <StatusBadge status={form.status} />
                  </div>
                )}
              </section>

              {/* Divider */}
              <div className="h-px bg-[#f1f5f9]" />

              {/* ══════════════════════════════════════
                  SECTION 5 — Attachments
              ══════════════════════════════════════ */}
              <section className="flex flex-col gap-4">
                <FormSectionHeader icon={IconPaperclip} title="Attachments" />

                {/* Existing files (with remove) */}
                <EditJobExistingFiles jobId={jobId} />

                {/* Upload new */}
                <PdfUploadZone label="Upload New Files" maxSizeMB={10} />
              </section>

            </div>
          </div>

          {/* ── Sticky bottom action row ─────────────────────────────────── */}
          <div className="border-t border-[#e2e8f0] px-6 py-5 bg-white shrink-0">
            {/* Top row: Delete Job */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 text-[#c10007] text-[13px] font-semibold hover:text-[#a30006] transition-colors"
              >
                <IconTrash />
                Delete Job
              </button>

              {/* Unsaved changes indicator */}
              <span className="text-[11px] text-[#90a1b9] italic">
                Unsaved changes will be lost on cancel
              </span>
            </div>

            {/* Bottom row: Cancel + Save */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => navigate(`/admin/jobs/${jobId}`)}
                className="px-5 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold bg-white hover:bg-[#f8fafc] transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] active:bg-[#a83200] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.30)]"
              >
                <IconSave />
                Save Changes
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
