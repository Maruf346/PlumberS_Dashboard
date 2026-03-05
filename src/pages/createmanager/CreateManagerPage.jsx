// src/pages/createmanager/CreateManagerPage.jsx
// Create Manager — POST /api/user/admin/managers/create/
// Fields: first_name, last_name, profile_picture, email, phone, password, confirm_password
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react'
import { useNavigate }      from 'react-router-dom'

import FormInput         from '@/components/shared/FormInput'
import FormSectionHeader from '@/components/shared/FormSectionHeader'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconUser()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="3" stroke="#62748e" strokeWidth="1.2"/><path d="M2 13.5c0-3 2.686-4.5 6-4.5s6 1.5 6 4.5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconMail()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M1.5 5.5l6.5 4 6.5-4" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconPhone()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h3.5l1.5 3.5-2 1.5C7 9 8 10 10 11l1.5-2L15 10.5V14c0 .553-5 0-8-3S1 5 3 2z" stroke="#62748e" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconLock()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="7" width="11" height="7.5" rx="1.5" stroke="#62748e" strokeWidth="1.2"/><path d="M5 7V5a3 3 0 016 0v2" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconEye()      { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#62748e" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="#62748e" strokeWidth="1.2"/></svg> }
function IconEyeOff()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1l14 14M6.5 6.6A2 2 0 0010 10M4.2 4.3C2.4 5.4 1 8 1 8s2.5 5 7 5c1.4 0 2.7-.4 3.8-1M6 3.1C6.6 3 7.3 3 8 3c4.5 0 7 5 7 5s-.7 1.4-2 2.8" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconCamera()   { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 6h16v11H2z" stroke="#90a1b9" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 6l1.5-3h3L13 6" stroke="#90a1b9" strokeWidth="1.3" strokeLinejoin="round"/><circle cx="10" cy="11.5" r="2.5" stroke="#90a1b9" strokeWidth="1.3"/></svg> }
function IconArrowLeft(){ return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconCheck()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconSpinner()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="10"/></svg> }

// ── Password visibility toggle wrapper ────────────────────────────────────────
function PasswordInput({ label, id, value, onChange, error, hint, showToggle = true }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id} className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">
        {label}<span className="text-[#f54900] ml-0.5">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#90a1b9]">
          <IconLock />
        </span>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={id === 'password' ? 'new-password' : 'new-password'}
          className={[
            'w-full h-[38px] rounded-[8px] border text-[14px] leading-[20px] text-[#0f172b]',
            'placeholder:text-[#90a1b9] transition-colors pl-9 pr-10 py-[9px]',
            error
              ? 'border-[#c10007] bg-[#fef2f2] focus:outline-none focus:ring-2 focus:ring-[#c10007]/20'
              : 'border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60',
          ].join(' ')}
        />
        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90a1b9] hover:text-[#62748e] transition-colors"
          >
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
      {error && <p className="text-[#c10007] text-[12px] leading-[16px]">{error}</p>}
      {hint && !error && <p className="text-[#90a1b9] text-[12px] leading-[16px]">{hint}</p>}
    </div>
  )
}

// ── Password strength meter ───────────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null

  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number',      pass: /\d/.test(password) },
    { label: 'Contains uppercase',     pass: /[A-Z]/.test(password) },
    { label: 'Contains special char',  pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length

  const barColor = score <= 1 ? '#c10007' : score === 2 ? '#f54900' : score === 3 ? '#f59e0b' : '#007a55'
  const barLabel = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong'

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-[#90a1b9] font-medium uppercase tracking-[0.4px]">Password strength</span>
        <span className="text-[11px] font-bold" style={{ color: barColor }}>{barLabel}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-[4px] flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? barColor : '#e2e8f0' }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {checks.map(c => (
          <span key={c.label} className={`text-[11px] flex items-center gap-1 ${c.pass ? 'text-[#007a55]' : 'text-[#90a1b9]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.pass ? 'bg-[#007a55]' : 'bg-[#cad5e2]'}`} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Success banner ────────────────────────────────────────────────────────────
function SuccessBanner({ name, onCreateAnother }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[#ecfdf5] border-2 border-[#d0fae5] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-[#007a55] flex items-center justify-center">
          <IconCheck />
        </div>
      </div>
      <div>
        <h2 className="text-[#0f172b] font-bold text-[20px]">Manager Created!</h2>
        <p className="text-[#62748e] text-[14px] mt-1">
          <span className="font-semibold text-[#0f172b]">{name}</span> has been added as a manager.
        </p>
      </div>
      <button onClick={onCreateAnother}
        className="px-5 py-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold rounded-[10px] transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.3)]">
        Create Another Manager
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  first_name:       '',
  last_name:        '',
  email:            '',
  phone:            '',
  password:         '',
  confirm_password: '',
  profile_picture:  null,   // data URL after FileReader
}

export default function CreateManagerPage() {
  const navigate  = useNavigate()
  const fileRef   = useRef(null)

  const [form,    setForm]    = useState(EMPTY_FORM)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = field => value => setForm(prev => ({ ...prev, [field]: value }))

  // ── Profile picture upload ─────────────────────────────────────────────────
  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profile_picture: 'Please select a valid image file.' }))
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      setForm(prev => ({ ...prev, profile_picture: ev.target.result }))
      setErrors(prev => ({ ...prev, profile_picture: undefined }))
    }
    reader.readAsDataURL(file)
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.first_name.trim())  e.first_name  = 'First name is required.'
    if (!form.last_name.trim())   e.last_name   = 'Last name is required.'

    if (!form.email.trim()) {
      e.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address.'
    }

    if (!form.phone.trim()) e.phone = 'Phone number is required.'

    if (!form.password) {
      e.password = 'Password is required.'
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters.'
    }

    if (!form.confirm_password) {
      e.confirm_password = 'Please confirm the password.'
    } else if (form.password !== form.confirm_password) {
      e.confirm_password = 'Passwords do not match.'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    // ── API call (uncomment when backend is ready) ──────────────────────────
    //
    // const apiBase = import.meta.env.VITE_API_BASE_URL   // http://127.0.0.1:8000/api/
    // const endpoint = `${apiBase}user/admin/managers/create/`
    //
    // try {
    //   const payload = {
    //     first_name:       form.first_name.trim(),
    //     last_name:        form.last_name.trim(),
    //     email:            form.email.trim().toLowerCase(),
    //     phone:            form.phone.trim(),
    //     password:         form.password,
    //     confirm_password: form.confirm_password,
    //     ...(form.profile_picture && { profile_picture: form.profile_picture }),
    //   }
    //   const res = await fetch(endpoint, {
    //     method:  'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body:    JSON.stringify(payload),
    //   })
    //   if (!res.ok) {
    //     const data = await res.json()
    //     // Map backend field errors back to form (e.g. { email: ["already exists"] })
    //     if (data && typeof data === 'object') {
    //       const fieldErrors = {}
    //       for (const [key, val] of Object.entries(data)) {
    //         fieldErrors[key] = Array.isArray(val) ? val[0] : String(val)
    //       }
    //       setErrors(fieldErrors)
    //       setLoading(false)
    //       return
    //     }
    //     throw new Error('Server error')
    //   }
    // } catch (err) {
    //   setErrors({ _global: 'Something went wrong. Please try again.' })
    //   setLoading(false)
    //   return
    // }
    //
    // ── End API call ─────────────────────────────────────────────────────────

    // Mock delay while API is not connected
    await new Promise(r => setTimeout(r, 800))

    setLoading(false)
    setSuccess(true)
  }

  const handleReset = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setSuccess(false)
  }

  const fullName = `${form.first_name} ${form.last_name}`.trim()

  // ── Initials avatar (shown when no photo) ─────────────────────────────────
  const initials = [form.first_name[0], form.last_name[0]].filter(Boolean).join('').toUpperCase() || '?'

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-[540px]">
        <SuccessBanner name={fullName || 'Manager'} onCreateAnother={handleReset} />
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8 max-w-[640px] flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] text-[#314158] transition-colors">
            <IconArrowLeft />
          </button>
          <div>
            <h1 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">Create Manager</h1>
            <p className="text-[#62748e] text-[13px] mt-0.5">Add a new manager account to the system</p>
          </div>
        </div>
      </div>

      {/* ── Global error banner ── */}
      {errors._global && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#fef2f2] border border-[#ffe2e2] rounded-[10px]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#c10007" strokeWidth="1.2"/><path d="M8 5v3.5" stroke="#c10007" strokeWidth="1.2" strokeLinecap="round"/><circle cx="8" cy="11" r="0.7" fill="#c10007"/></svg>
          <p className="text-[#c10007] text-[13px] font-medium">{errors._global}</p>
        </div>
      )}

      {/* ── Profile picture ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06)]">
        <FormSectionHeader icon={IconUser} title="Profile Picture" />
        <div className="flex items-center gap-5 mt-4">

          {/* Avatar preview */}
          <div className="relative shrink-0">
            {form.profile_picture ? (
              <img src={form.profile_picture} alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#e2e8f0]" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1d293d] border-2 border-[#314158] flex items-center justify-center">
                <span className="text-white font-bold text-[22px] select-none">{initials}</span>
              </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[#e2e8f0] flex items-center justify-center hover:bg-[#f8fafc] transition-colors shadow-sm">
              <IconCamera />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div>
            <p className="text-[#0f172b] text-[14px] font-semibold">Upload photo</p>
            <p className="text-[#90a1b9] text-[12px] mt-0.5 leading-[18px]">JPG, PNG or GIF · Max 5 MB</p>
            <div className="flex items-center gap-3 mt-2">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="text-[13px] text-[#f54900] font-medium hover:text-[#c73b00] transition-colors">
                {form.profile_picture ? 'Change photo' : 'Choose file'}
              </button>
              {form.profile_picture && (
                <>
                  <span className="text-[#e2e8f0]">·</span>
                  <button type="button" onClick={() => setForm(p => ({ ...p, profile_picture: null }))}
                    className="text-[13px] text-[#c10007] font-medium hover:text-[#a30006] transition-colors">
                    Remove
                  </button>
                </>
              )}
            </div>
            {errors.profile_picture && (
              <p className="text-[#c10007] text-[12px] mt-1">{errors.profile_picture}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Personal info ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-5">
        <FormSectionHeader icon={IconUser} title="Personal Information" />

        {/* First + Last name side by side */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="First Name" id="first_name"
            value={form.first_name} onChange={set('first_name')}
            placeholder="e.g. Sarah" required icon={IconUser}
            error={errors.first_name}
          />
          <FormInput
            label="Last Name" id="last_name"
            value={form.last_name} onChange={set('last_name')}
            placeholder="e.g. Lee" required icon={IconUser}
            error={errors.last_name}
          />
        </div>

        <FormInput
          label="Email Address" id="email" type="email"
          value={form.email} onChange={set('email')}
          placeholder="manager@company.com" required icon={IconMail}
          error={errors.email}
          hint="This will be the manager's login email."
        />

        <FormInput
          label="Phone Number" id="phone" type="tel"
          value={form.phone} onChange={set('phone')}
          placeholder="+1 (212) 555-0100" required icon={IconPhone}
          error={errors.phone}
        />
      </div>

      {/* ── Password ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-5">
        <FormSectionHeader icon={IconLock} title="Account Password" />

        <div>
          <PasswordInput
            label="Password" id="password"
            value={form.password} onChange={set('password')}
            error={errors.password}
          />
          <PasswordStrength password={form.password} />
        </div>

        <PasswordInput
          label="Confirm Password" id="confirm_password"
          value={form.confirm_password} onChange={set('confirm_password')}
          error={errors.confirm_password}
          hint={
            form.confirm_password && form.password === form.confirm_password
              ? '✓ Passwords match'
              : undefined
          }
        />
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button type="button" onClick={() => navigate(-1)}
          className="px-5 py-[10px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold bg-white hover:bg-[#f8fafc] transition-colors">
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={loading}
          className="flex items-center gap-2 px-6 py-[10px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.30)]">
          {loading ? <><IconSpinner /> Creating...</> : 'Create Manager'}
        </button>
      </div>

    </div>
  )
}