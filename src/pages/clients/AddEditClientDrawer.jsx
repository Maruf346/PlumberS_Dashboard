// src/pages/clients/AddEditClientDrawer.jsx
// POST /api/clients/create/    (add)
// PATCH /api/clients/{id}/     (edit)
// profile_picture sent as multipart/form-data when file selected
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import FormInput             from '@/components/shared/FormInput'
import FormTextarea          from '@/components/shared/FormTextarea'
import FormSelect            from '@/components/shared/FormSelect'
import FormSectionHeader     from '@/components/shared/FormSectionHeader'
import { apiFetch }          from '@/utils/apiFetch'
import { CLIENT_STATUS_OPTIONS } from '@/data/peopleMock'

function IconClose()        { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconUser()         { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#62748e" strokeWidth="1.2"/><path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconMail()         { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#90a1b9" strokeWidth="1.2"/><path d="M1.5 5.5l6.5 4 6.5-4" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconPhone()        { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 9 7 9.5 9.25 11.25L10.5 9.5 14 11v3c0 .553-4-1-7-4S1 5.5 3 2z" stroke="#90a1b9" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconMapPin()       { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5S12.5 9.75 12.5 6c0-2.485-2.015-4.5-4.5-4.5z" stroke="#90a1b9" strokeWidth="1.2"/><circle cx="8" cy="6" r="1.5" fill="#90a1b9"/></svg> }
function IconContact()      { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#62748e" strokeWidth="1.2"/><path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/><path d="M12 2.5v4M10 4.5h4" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconKey()          { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="7" r="3.5" stroke="#62748e" strokeWidth="1.2"/><path d="M8.5 9.5L14 15M11 12.5l1.5 1.5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconCamera()       { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 6h16v11H2zM7 6l1.5-3h3L13 6" stroke="#90a1b9" strokeWidth="1.3" strokeLinejoin="round"/><circle cx="10" cy="11.5" r="2.5" stroke="#90a1b9" strokeWidth="1.3"/></svg> }
function IconSave()         { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v8a1 1 0 01-1 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><rect x="5" y="9" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 2v3.5h4V2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconExternalLink() { return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 2H2v8h8V7M7 2h3v3M10 2L5.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }

const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#06b6d4','#f54900','#84cc16']
function getInitials(name) {
  if (!name?.trim()) return '?'
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length-1][0]).toUpperCase() : name.trim().slice(0,2).toUpperCase()
}
function getColor(name) {
  if (!name?.trim()) return '#90a1b9'
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}
function buildMapsUrl(address) {
  if (!address?.trim()) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AddEditClientDrawer({ mode = 'add', initialData = null, onClose, onSave }) {
  const isEdit  = mode === 'edit' && !!initialData
  const fileRef = useRef(null)
  const picFile = useRef(null)   // actual File object for multipart upload

  const [form, setForm] = useState({
    name:                initialData?.name                ?? '',
    phone:               initialData?.phone               ?? '',
    email:               initialData?.email               ?? '',
    address:             initialData?.address             ?? '',
    contact_person_name: initialData?.contact_person_name ?? '',
    site_access:         initialData?.site_access         ?? '',
    is_active:           initialData?.is_active           ?? true,
    profile_picture_url: initialData?.profile_picture     ?? null,  // existing URL (view only)
    profile_picture_preview: null,                                  // new selection preview
  })
  const set = (field) => (value) => setForm(prev => ({ ...prev, [field]: value }))

  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)
  const [apiErr,  setApiErr]  = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profile_picture: 'Please select a valid image file' }))
      return
    }
    picFile.current = file
    const reader = new FileReader()
    reader.onload = (ev) => setForm(prev => ({ ...prev, profile_picture_preview: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    picFile.current = null
    setForm(prev => ({ ...prev, profile_picture_preview: null, profile_picture_url: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())                e.name                = 'Client name is required'
    if (!form.phone.trim())               e.phone               = 'Phone number is required'
    if (!form.email.trim())               e.email               = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    if (!form.address.trim())             e.address             = 'Address is required'
    if (!form.contact_person_name.trim()) e.contact_person_name = 'Contact person name is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setApiErr(null)

    let fetchOptions
    if (picFile.current) {
      // multipart/form-data when a new photo was selected
      const fd = new FormData()
      fd.append('name',                form.name.trim())
      fd.append('phone',               form.phone.trim())
      fd.append('email',               form.email.trim())
      fd.append('address',             form.address.trim())
      fd.append('contact_person_name', form.contact_person_name.trim())
      fd.append('site_access',         form.site_access.trim())
      fd.append('is_active',           String(form.is_active))
      fd.append('profile_picture',     picFile.current)
      fetchOptions = { method: isEdit ? 'PATCH' : 'POST', body: fd, headers: {} }
    } else {
      const payload = {
        name:                form.name.trim(),
        phone:               form.phone.trim(),
        email:               form.email.trim(),
        address:             form.address.trim(),
        contact_person_name: form.contact_person_name.trim(),
        site_access:         form.site_access.trim(),
        is_active:           form.is_active,
      }
      fetchOptions = { method: isEdit ? 'PATCH' : 'POST', body: JSON.stringify(payload) }
    }

    const endpoint = isEdit ? `clients/${initialData.id}/` : 'clients/create/'
    const { data, ok, status } = await apiFetch(endpoint, fetchOptions)

    if (ok && data) {
      await onSave?.(data)
      onClose?.()
    } else {
      setApiErr(
        data?.detail ??
        data?.name?.[0] ??
        data?.email?.[0] ??
        data?.phone?.[0] ??
        (typeof data === 'object' ? JSON.stringify(data) : null) ??
        `Failed to ${isEdit ? 'update' : 'create'} client (${status}).`
      )
    }
    setSaving(false)
  }

  const mapsUrl     = buildMapsUrl(form.address)
  const avatarSrc   = form.profile_picture_preview ?? form.profile_picture_url
  const initials    = getInitials(form.name)
  const avatarColor = getColor(form.name)

  return (
    <div className="w-full xl:w-[512px] shrink-0 bg-white border-l border-[#e2e8f0] flex flex-col h-full shadow-[-4px_0px_24px_0px_rgba(15,23,43,0.08)]">

      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-5 border-b border-[#e2e8f0] shrink-0">
        <div>
          <h2 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">
            {isEdit ? 'Edit Client' : 'Add Client'}
          </h2>
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-1">
            {isEdit ? `Editing ${initialData.name}` : 'Register a new client account'}
          </p>
        </div>
        <button onClick={onClose} className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shrink-0 mt-0.5">
          <IconClose />
        </button>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-7">

          {/* API error */}
          {apiErr && (
            <div className="px-3 py-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-[8px]">
              <p className="text-[#c10007] text-[13px]">{apiErr}</p>
            </div>
          )}

          {/* Profile Picture */}
          <div className="flex items-center gap-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px]">
            <div className="relative shrink-0">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[#e2e8f0]" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-[20px] select-none"
                  style={{ backgroundColor: avatarColor }}>
                  {initials}
                </div>
              )}
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[#e2e8f0] flex items-center justify-center hover:bg-[#f8fafc] transition-colors shadow-sm">
                <IconCamera />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#0f172b] font-bold text-[16px] truncate">{form.name || 'Client Name'}</p>
              <p className="text-[#90a1b9] text-[13px] truncate">{form.email || 'email@example.com'}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => fileRef.current?.click()} className="text-[12px] text-[#f54900] font-medium hover:text-[#c73b00] transition-colors">
                  {avatarSrc ? 'Change photo' : 'Upload photo'}
                </button>
                {avatarSrc && (
                  <><span className="text-[#e2e8f0]">·</span>
                  <button onClick={removePhoto} className="text-[12px] text-[#c10007] font-medium hover:text-[#a30006] transition-colors">Remove</button></>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconUser} title="Contact Info" />
            <FormInput label="Client / Company Name" id="name" value={form.name} onChange={set('name')}
              placeholder="e.g. Apex Industries" required icon={IconUser} error={errors.name} />
            <FormInput label="Email" id="email" type="email" value={form.email} onChange={set('email')}
              placeholder="e.g. contact@company.com" required icon={IconMail} error={errors.email} />
            <FormInput label="Phone" id="phone" type="tel" value={form.phone} onChange={set('phone')}
              placeholder="+61 4 XXXX XXXX" required icon={IconPhone} error={errors.phone} />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* Site Info */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconMapPin} title="Site Info" />
            <div className="flex flex-col gap-[6px]">
              <label htmlFor="address" className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">
                Address <span className="text-[#f54900]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#90a1b9]"><IconMapPin /></span>
                <input id="address" type="text" value={form.address}
                  onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. 458 Industrial Ave, Adelaide SA"
                  className={['w-full h-[38px] rounded-[8px] border text-[14px] text-[#0f172b] pl-9 pr-3 placeholder:text-[#90a1b9] transition-colors',
                    errors.address ? 'border-[#c10007] bg-[#fef2f2] focus:outline-none focus:ring-2 focus:ring-[#c10007]/20'
                    : 'border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60'].join(' ')} />
              </div>
              {errors.address && <p className="text-[#c10007] text-[12px]">{errors.address}</p>}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] text-[#1447e6] hover:underline font-medium w-fit">
                  <IconExternalLink /> View on Google Maps
                </a>
              )}
            </div>
            <FormInput label="Contact Person (On-site Representative)" id="contact_person_name"
              value={form.contact_person_name} onChange={set('contact_person_name')}
              placeholder="e.g. Robert Chen" required icon={IconContact}
              error={errors.contact_person_name}
              hint="Name of the on-site representative we coordinate with" />
            <FormTextarea label="Site Access Info" id="site_access" value={form.site_access}
              onChange={set('site_access')}
              placeholder="e.g. Main gate code: 4421. Badges required above level 3..."
              rows={3} hint="Gate codes, access instructions, parking notes" />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* Account */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconContact} title="Account" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-semibold text-[#0f172b]">Status</label>
              <div className="flex gap-3">
                {[{ label: 'Active', value: true }, { label: 'Inactive', value: false }].map(opt => (
                  <button key={String(opt.value)} type="button"
                    onClick={() => setForm(prev => ({ ...prev, is_active: opt.value }))}
                    className={['flex-1 py-2 rounded-[8px] border text-[13px] font-semibold transition-colors',
                      form.is_active === opt.value
                        ? 'border-[#f54900] bg-[#fff4ee] text-[#f54900]'
                        : 'border-[#e2e8f0] bg-white text-[#62748e] hover:bg-[#f8fafc]'].join(' ')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#e2e8f0] px-6 py-5 flex items-center justify-end gap-3 bg-white shrink-0">
        <button onClick={onClose}
          className="px-5 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold bg-white hover:bg-[#f8fafc] transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.30)] disabled:opacity-60">
          {saving
            ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/> Saving…</>
            : <><IconSave /> {isEdit ? 'Save Changes' : 'Add Client'}</>
          }
        </button>
      </div>
    </div>
  )
}