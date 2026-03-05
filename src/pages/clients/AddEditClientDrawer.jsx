// src/pages/clients/AddEditClientDrawer.jsx
// 512px right-side drawer — Add or Edit Client.
// Fields: name, phone, email, profile_picture (upload), address (→ maps link),
//         contact_person_name, site_access, status
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import FormInput             from '@/components/shared/FormInput'
import FormTextarea          from '@/components/shared/FormTextarea'
import FormSelect            from '@/components/shared/FormSelect'
import FormSectionHeader     from '@/components/shared/FormSectionHeader'
import { CLIENT_STATUS_OPTIONS } from '@/data/peopleMock'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconClose() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function IconUser() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#62748e" strokeWidth="1.2"/><path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg>
}
function IconMail() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#90a1b9" strokeWidth="1.2"/><path d="M1.5 5.5l6.5 4 6.5-4" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/></svg>
}
function IconPhone() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 9 7 9.5 9.25 11.25L10.5 9.5 14 11v3c0 .553-4-1-7-4S1 5.5 3 2z" stroke="#90a1b9" strokeWidth="1.2" strokeLinejoin="round"/></svg>
}
function IconMapPin() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5z" stroke="#90a1b9" strokeWidth="1.2"/><circle cx="8" cy="6" r="1.5" fill="#90a1b9"/></svg>
}
function IconContact() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#62748e" strokeWidth="1.2"/><path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/><path d="M12 2.5v4M10 4.5h4" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg>
}
function IconKey() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="7" r="3.5" stroke="#62748e" strokeWidth="1.2"/><path d="M8.5 9.5L14 15M11 12.5l1.5 1.5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg>
}
function IconCamera() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 6h16v11H2zM7 6l1.5-3h3L13 6" stroke="#90a1b9" strokeWidth="1.3" strokeLinejoin="round"/><circle cx="10" cy="11.5" r="2.5" stroke="#90a1b9" strokeWidth="1.3"/></svg>
}
function IconSave() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v8a1 1 0 01-1 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><rect x="5" y="9" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 2v3.5h4V2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
}
function IconExternalLink() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 2H2v8h8V7M7 2h3v3M10 2L5.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
}

// ── Avatar helpers ────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#06b6d4','#f54900','#84cc16']
function getInitials(name) {
  if (!name?.trim()) return '?'
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.trim().slice(0, 2).toUpperCase()
}
function getColor(name) {
  if (!name?.trim()) return '#90a1b9'
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

// ── Google Maps URL builder ───────────────────────────────────────────────────
function buildMapsUrl(address) {
  if (!address?.trim()) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AddEditClientDrawer({ mode = 'add', initialData = null, onClose, onSave }) {
  const isEdit = mode === 'edit' && !!initialData
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    name:              initialData?.name              ?? '',
    phone:             initialData?.phone             ?? '',
    email:             initialData?.email             ?? '',
    address:           initialData?.address           ?? '',
    contactPersonName: initialData?.contactPersonName ?? '',
    siteAccess:        initialData?.siteAccess        ?? '',
    status:            initialData?.status            ?? 'Active',
    profilePicture:    initialData?.profilePicture    ?? null,  // data URL or null
  })
  const set = (field) => (value) => setForm(prev => ({ ...prev, [field]: value }))
  const [errors, setErrors] = useState({})

  // ── Profile picture upload ─────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profilePicture: 'Please select a valid image file' }))
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setForm(prev => ({ ...prev, profilePicture: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const removePhoto = () => setForm(prev => ({ ...prev, profilePicture: null }))

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Client name is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    if (!form.address.trim()) e.address = 'Address is required'
    if (!form.contactPersonName.trim()) e.contactPersonName = 'Contact person name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    // TODO: Replace with real API
    // const saveClient = async (formData) => {
    //   const res = isEdit
    //     ? await axios.put(`/api/clients/${initialData.id}`, formData)
    //     : await axios.post('/api/clients', formData)
    //   return res.data
    // }

    onSave?.({ ...initialData, ...form })
    onClose?.()
  }

  const mapsUrl    = buildMapsUrl(form.address)
  const initials   = getInitials(form.name)
  const avatarColor = getColor(form.name)

  return (
    <div className="w-full xl:w-[512px] shrink-0 bg-white border-l border-[#e2e8f0] flex flex-col h-full shadow-[-4px_0px_24px_0px_rgba(15,23,43,0.08)]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-6 pt-5 pb-5 border-b border-[#e2e8f0] shrink-0">
        <div>
          <h2 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">
            {isEdit ? 'Edit Client' : 'Add Client'}
          </h2>
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-1">
            {isEdit ? `Editing ${initialData.name}` : 'Register a new client account'}
          </p>
        </div>
        <button onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shrink-0 mt-0.5">
          <IconClose />
        </button>
      </div>

      {/* ── Form body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-7">

          {/* ── Profile Picture ── */}
          <div className="flex items-center gap-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px]">
            {/* Avatar / photo */}
            <div className="relative shrink-0">
              {form.profilePicture ? (
                <img src={form.profilePicture} alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#e2e8f0]" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-[20px] select-none"
                  style={{ backgroundColor: avatarColor }}>
                  {initials}
                </div>
              )}
              {/* Camera badge */}
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[#e2e8f0] flex items-center justify-center hover:bg-[#f8fafc] transition-colors shadow-sm">
                <IconCamera />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[#0f172b] font-bold text-[16px] leading-[22px] truncate">
                {form.name || 'Client Name'}
              </p>
              <p className="text-[#90a1b9] text-[13px] leading-[18px] mt-0.5 truncate">
                {form.email || 'email@example.com'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => fileRef.current?.click()}
                  className="text-[12px] text-[#f54900] font-medium hover:text-[#c73b00] transition-colors">
                  {form.profilePicture ? 'Change photo' : 'Upload photo'}
                </button>
                {form.profilePicture && (
                  <>
                    <span className="text-[#e2e8f0]">·</span>
                    <button onClick={removePhoto}
                      className="text-[12px] text-[#c10007] font-medium hover:text-[#a30006] transition-colors">
                      Remove
                    </button>
                  </>
                )}
              </div>
              {errors.profilePicture && (
                <p className="text-[#c10007] text-[12px] mt-1">{errors.profilePicture}</p>
              )}
            </div>
          </div>

          {/* ── Contact Info ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconUser} title="Contact Info" />

            <FormInput label="Client / Company Name" id="name" value={form.name}
              onChange={set('name')} placeholder="e.g. Apex Industries"
              required icon={IconUser} error={errors.name} />

            <FormInput label="Email" id="email" type="email" value={form.email}
              onChange={set('email')} placeholder="e.g. contact@company.com"
              required icon={IconMail} error={errors.email} />

            <FormInput label="Phone" id="phone" type="tel" value={form.phone}
              onChange={set('phone')} placeholder="+1 (555) 000-0000"
              required icon={IconPhone} error={errors.phone} />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Site Info ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconMapPin} title="Site Info" />

            {/* Address + live maps link */}
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="address" className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">
                Address <span className="text-[#f54900]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#90a1b9]">
                  <IconMapPin />
                </span>
                <input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. 458 Industrial Ave, New York, NY"
                  className={[
                    'w-full h-[38px] rounded-[8px] border text-[14px] leading-[20px] text-[#0f172b] pl-9 pr-3 py-[9px] placeholder:text-[#90a1b9] transition-colors',
                    errors.address
                      ? 'border-[#c10007] bg-[#fef2f2] focus:outline-none focus:ring-2 focus:ring-[#c10007]/20'
                      : 'border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60',
                  ].join(' ')}
                />
              </div>
              {errors.address && <p className="text-[#c10007] text-[12px] leading-[16px]">{errors.address}</p>}
              {/* Live maps hyperlink — built from address value */}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] text-[#1447e6] hover:underline font-medium w-fit">
                  <IconExternalLink />
                  View on Google Maps
                </a>
              )}
              {!form.address.trim() && (
                <p className="text-[#90a1b9] text-[11px] leading-[16px]">
                  A Google Maps link will appear as you type the address.
                </p>
              )}
            </div>

            {/* Contact person */}
            <FormInput label="Contact Person (On-site Representative)" id="contactPersonName"
              value={form.contactPersonName} onChange={set('contactPersonName')}
              placeholder="e.g. Robert Chen" required icon={IconContact}
              error={errors.contactPersonName}
              hint="Name of the on-site representative we coordinate with" />

            {/* Site access */}
            <FormTextarea
              label="Site Access Info"
              id="siteAccess"
              value={form.siteAccess}
              onChange={set('siteAccess')}
              placeholder="e.g. Main gate code: 4421. Badges required above level 3..."
              rows={3}
              hint="Gate codes, access instructions, parking notes, restrictions"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <IconKey />
              </div>
            </FormTextarea>
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Account Status ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconContact} title="Account" />
            <FormSelect label="Status" id="status" value={form.status}
              onChange={set('status')} options={CLIENT_STATUS_OPTIONS}
              placeholder="Select status..." />
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
          {isEdit ? 'Save Changes' : 'Add Client'}
        </button>
      </div>
    </div>
  )
}
