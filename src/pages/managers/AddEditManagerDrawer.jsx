// src/pages/managers/AddEditManagerDrawer.jsx
// Add:  POST  /api/user/admin/managers/create/
//       payload: multipart/form-data { first_name, last_name, profile_picture(file), email, phone, password, confirm_password }
// Edit: PATCH /api/user/admin/manager/{id}/update/
//       payload: multipart/form-data { first_name, last_name, phone, profile_picture(file) }
// profile_picture sent as actual File via FormData (backend rejects base64 strings)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import FormInput             from '@/components/shared/FormInput'
import FormSectionHeader     from '@/components/shared/FormSectionHeader'
import { apiFetch }          from '@/utils/apiFetch'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconClose()  { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconUser()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#62748e" strokeWidth="1.2"/><path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconMail()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#90a1b9" strokeWidth="1.2"/><path d="M1.5 5.5l6.5 4 6.5-4" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconPhone()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 9 7 9.5 9.25 11.25L10.5 9.5 14 11v3c0 .553-4-1-7-4S1 5.5 3 2z" stroke="#90a1b9" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconLock()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="7" width="11" height="7.5" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5 7V5a3 3 0 016 0v2" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconEye()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#62748e" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="#62748e" strokeWidth="1.2"/></svg> }
function IconEyeOff() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1l14 14M6.5 6.6A2 2 0 0010 10M4.2 4.3C2.4 5.4 1 8 1 8s2.5 5 7 5c1.4 0 2.7-.4 3.8-1M6 3.1C6.6 3 7.3 3 8 3c4.5 0 7 5 7 5s-.7 1.4-2 2.8" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconCamera() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 6h14v10H2z" stroke="#90a1b9" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6 6l1.5-3h3L12 6" stroke="#90a1b9" strokeWidth="1.2" strokeLinejoin="round"/><circle cx="9" cy="11" r="2.5" stroke="#90a1b9" strokeWidth="1.2"/></svg> }
function IconSave()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v8a1 1 0 01-1 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><rect x="5" y="9" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 2v3.5h4V2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }

// ── Password input with show/hide ─────────────────────────────────────────────
function PasswordInput({ label, id, value, onChange, error, hint }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id} className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">
        {label}<span className="text-[#f54900] ml-0.5">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#90a1b9]"><IconLock /></span>
        <input id={id} type={show ? 'text' : 'password'} value={value}
          onChange={e => onChange(e.target.value)} autoComplete="new-password"
          className={['w-full h-[38px] rounded-[8px] border text-[14px] text-[#0f172b] pl-9 pr-10 py-[9px] placeholder:text-[#90a1b9] transition-colors',
            error ? 'border-[#c10007] bg-[#fef2f2] focus:outline-none focus:ring-2 focus:ring-[#c10007]/20'
                  : 'border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60',
          ].join(' ')} />
        <button type="button" tabIndex={-1} onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90a1b9] hover:text-[#62748e] transition-colors">
          {show ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {error && <p className="text-[#c10007] text-[12px] leading-[16px]">{error}</p>}
      {hint && !error && <p className="text-[#90a1b9] text-[12px] leading-[16px]">{hint}</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AddEditManagerDrawer({ mode = 'add', initialData = null, onClose, onSave }) {
  const isEdit  = mode === 'edit' && !!initialData
  const fileRef = useRef(null)
  const picFile = useRef(null)   // actual File object for multipart upload

  // Split full_name into first/last if coming from detail API
  const defaultFirst = initialData?.first_name
    ?? (initialData?.full_name?.split(' ')[0] ?? '')
  const defaultLast  = initialData?.last_name
    ?? (initialData?.full_name?.split(' ').slice(1).join(' ') ?? '')

  const [form, setForm] = useState({
    first_name:          defaultFirst,
    last_name:           defaultLast,
    email:               initialData?.email           ?? '',
    phone:               initialData?.phone           ?? '',
    profile_picture_url: initialData?.profile_picture ?? null,  // existing URL
    profile_picture_preview: null,                               // new selection preview
    password:            '',
    confirm_password:    '',
  })
  const [errors,  setErrors]  = useState({})
  const [saving,  setSaving]  = useState(false)

  const set = field => value => setForm(prev => ({ ...prev, [field]: value }))

  // ── Profile picture — store File for multipart upload, data URL for preview ──
  const handleFile = e => {
    const file = e.target.files?.[0]
    if (!file) return
    picFile.current = file
    const reader = new FileReader()
    reader.onload = ev => {
      setForm(prev => ({ ...prev, profile_picture_preview: ev.target.result }))
      setErrors(prev => ({ ...prev, profile_picture: undefined }))
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    picFile.current = null
    setForm(prev => ({ ...prev, profile_picture_preview: null, profile_picture_url: null }))
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required'
    if (!form.last_name.trim())  e.last_name  = 'Last name is required'
    if (!form.email.trim())      e.email      = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    if (!form.phone.trim())      e.phone      = 'Phone number is required'
    if (!isEdit) {
      if (!form.password)                e.password         = 'Password is required'
      else if (form.password.length < 8) e.password         = 'Minimum 8 characters'
      if (!form.confirm_password)        e.confirm_password = 'Please confirm the password'
      else if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    // Always use FormData so profile_picture is sent as a real file field.
    // apiFetch detects FormData and skips Content-Type (browser sets multipart boundary).
    let data, ok, status

    if (isEdit) {
      // PATCH /api/user/admin/manager/{id}/update/
      const fd = new FormData()
      fd.append('first_name', form.first_name.trim())
      fd.append('last_name',  form.last_name.trim())
      fd.append('phone',      form.phone.trim())
      if (picFile.current) {
        fd.append('profile_picture', picFile.current)
      }
      ;({ data, ok, status } = await apiFetch(`user/admin/manager/${initialData.id}/update/`, {
        method: 'PATCH',
        body:   fd,
      }))
    } else {
      // POST /api/user/admin/managers/create/
      const fd = new FormData()
      fd.append('first_name',       form.first_name.trim())
      fd.append('last_name',        form.last_name.trim())
      fd.append('email',            form.email.trim().toLowerCase())
      fd.append('phone',            form.phone.trim())
      fd.append('password',         form.password)
      fd.append('confirm_password', form.confirm_password)
      if (picFile.current) {
        fd.append('profile_picture', picFile.current)
      }
      ;({ data, ok, status } = await apiFetch('user/admin/managers/create/', {
        method: 'POST',
        body:   fd,
      }))
    }

    if (ok && data) {
      await onSave?.(data)
      onClose?.()
    } else {
      // Surface field-level errors from backend
      if (data && typeof data === 'object') {
        const fieldErrors = {}
        for (const [key, val] of Object.entries(data)) {
          fieldErrors[key] = Array.isArray(val) ? val[0] : String(val)
        }
        setErrors(fieldErrors)
      } else {
        setErrors({ _global: `Something went wrong (${status}). Please try again.` })
      }
    }
    setSaving(false)
  }

  const initials = [form.first_name[0], form.last_name[0]].filter(Boolean).join('').toUpperCase() || '?'
  const avatarSrc = form.profile_picture_preview ?? form.profile_picture_url

  return (
    <div className="w-full xl:w-[512px] shrink-0 bg-white border-l border-[#e2e8f0] flex flex-col min-h-full shadow-[-4px_0px_24px_0px_rgba(15,23,43,0.08)]">

      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-5 border-b border-[#e2e8f0]">
        <div>
          <h2 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">
            {isEdit ? 'Edit Manager' : 'Add Manager'}
          </h2>
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-1">
            {isEdit ? `Editing ${initialData?.full_name ?? initialData?.name ?? 'manager'}` : 'Create a new manager account'}
          </p>
        </div>
        <button onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shrink-0 mt-0.5">
          <IconClose />
        </button>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-7">

          {/* Global error */}
          {errors._global && (
            <div className="flex items-center gap-3 px-4 py-3 bg-[#fef2f2] border border-[#ffe2e2] rounded-[10px]">
              <p className="text-[#c10007] text-[13px] font-medium">{errors._global}</p>
            </div>
          )}

          {/* Profile Picture */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconUser} title="Profile Picture" />
            <div className="flex items-center gap-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px]">
              <div className="relative shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#e2e8f0]" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#1d293d] flex items-center justify-center border-2 border-[#314158]">
                    <span className="text-white font-bold text-[18px] select-none">{initials}</span>
                  </div>
                )}
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-[#e2e8f0] flex items-center justify-center hover:bg-[#f8fafc] transition-colors shadow-sm">
                  <IconCamera />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </div>
              <div>
                <p className="text-[#0f172b] text-[13px] font-semibold">
                  {form.first_name || form.last_name ? `${form.first_name} ${form.last_name}`.trim() : 'Manager Name'}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="text-[12px] text-[#f54900] font-medium hover:text-[#c73b00] transition-colors">
                    {avatarSrc ? 'Change photo' : 'Upload photo'}
                  </button>
                  {avatarSrc && (
                    <><span className="text-[#e2e8f0]">·</span>
                    <button type="button" onClick={removePhoto}
                      className="text-[12px] text-[#c10007] font-medium hover:text-[#a30006] transition-colors">
                      Remove
                    </button></>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* Personal info */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconUser} title="Personal Information" />
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="First Name" id="first_name" value={form.first_name} onChange={set('first_name')}
                placeholder="e.g. Sarah" required icon={IconUser} error={errors.first_name} />
              <FormInput label="Last Name" id="last_name" value={form.last_name} onChange={set('last_name')}
                placeholder="e.g. Lee" required icon={IconUser} error={errors.last_name} />
            </div>
            <FormInput label="Email" id="email" type="email" value={form.email} onChange={set('email')}
              placeholder="e.g. sarah.lee@company.com" required icon={IconMail} error={errors.email}
              disabled={isEdit}
              hint={isEdit ? 'Email cannot be changed' : undefined} />
            <FormInput label="Phone" id="phone" type="tel" value={form.phone} onChange={set('phone')}
              placeholder="+61 4 XXXX XXXX" required icon={IconPhone} error={errors.phone} />
          </section>

          {/* Password — add mode only */}
          {!isEdit && (
            <>
              <div className="h-px bg-[#f1f5f9]" />
              <section className="flex flex-col gap-4">
                <FormSectionHeader icon={IconLock} title="Account Password" />
                <PasswordInput label="Password" id="password" value={form.password} onChange={set('password')}
                  error={errors.password} hint="Minimum 8 characters" />
                <PasswordInput label="Confirm Password" id="confirm_password" value={form.confirm_password}
                  onChange={set('confirm_password')} error={errors.confirm_password}
                  hint={form.confirm_password && form.password === form.confirm_password ? '✓ Passwords match' : undefined} />
              </section>
            </>
          )}

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
            ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
            : <><IconSave /> {isEdit ? 'Save Changes' : 'Add Manager'}</>
          }
        </button>
      </div>
    </div>
  )
}