// src/pages/managers/AddEditManagerDrawer.jsx
// Right-side 512px drawer — Add or Edit Manager.
// mode: 'add' | 'edit'   initialData: manager object | null
// ─────────────────────────────────────────────────────────────────────────────

import { useState }   from 'react'
import FormInput      from '@/components/shared/FormInput'
import FormSelect     from '@/components/shared/FormSelect'
import FormSectionHeader from '@/components/shared/FormSectionHeader'
import PersonAvatar   from '@/components/shared/PersonAvatar'
import { ROLE_OPTIONS_MANAGER, PEOPLE_STATUS_OPTIONS } from '@/data/peopleMock'

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
      <circle cx="8" cy="5.5" r="2.5" stroke="#62748e" strokeWidth="1.2"/>
      <path d="M2.5 14c0-3 2.462-5 5.5-5s5.5 2 5.5 5" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#90a1b9" strokeWidth="1.2"/>
      <path d="M1.5 5.5l6.5 4 6.5-4" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/>
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
function IconBriefcase() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="5" width="13" height="9" rx="1.5" stroke="#62748e" strokeWidth="1.2"/>
      <path d="M5.5 5V3.5A1.5 1.5 0 017 2h2a1.5 1.5 0 011.5 1.5V5" stroke="#62748e" strokeWidth="1.2"/>
      <path d="M1.5 9h13" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
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

// ── Avatar initials + color derived from name ─────────────────────────────────
const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#ef4444','#06b6d4','#f54900']

function getInitials(name) {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.trim().slice(0, 2).toUpperCase()
}
function getColor(name) {
  if (!name?.trim()) return '#90a1b9'
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AddEditManagerDrawer({ mode = 'add', initialData = null, onClose, onSave }) {
  const isEdit = mode === 'edit' && !!initialData

  const [form, setForm] = useState({
    name:   initialData?.name   ?? '',
    email:  initialData?.email  ?? '',
    phone:  initialData?.phone  ?? '',
    role:   initialData?.role   ?? '',
    status: initialData?.status ?? 'Active',
  })
  const set = (field) => (value) => setForm(prev => ({ ...prev, [field]: value }))

  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.role)         e.role  = 'Role is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    // TODO: Replace with real API
    // const saveManager = async (formData) => {
    //   const res = isEdit
    //     ? await axios.put(`/api/managers/${initialData.id}`, formData)
    //     : await axios.post('/api/managers', formData)
    //   return res.data
    // }

    onSave?.({ ...initialData, ...form })
    onClose?.()
  }

  const avatarInitials = getInitials(form.name)
  const avatarColor    = getColor(form.name)

  return (
    <div className="w-full xl:w-[512px] shrink-0 bg-white border-l border-[#e2e8f0] flex flex-col min-h-full shadow-[-4px_0px_24px_0px_rgba(15,23,43,0.08)]">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-6 pt-5 pb-5 border-b border-[#e2e8f0]">
        <div>
          <h2 className="text-[#0f172b] font-bold text-[22px] leading-[28px]">
            {isEdit ? 'Edit Manager' : 'Add Manager'}
          </h2>
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-1">
            {isEdit ? `Editing ${initialData.name}` : 'Create a new manager account'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#e2e8f0] hover:bg-[#f8fafc] transition-colors shrink-0 mt-0.5"
        >
          <IconClose />
        </button>
      </div>

      {/* ── Form body ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="flex flex-col gap-7">

          {/* Avatar preview */}
          <div className="flex items-center gap-4 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-[12px]">
            <PersonAvatar initials={avatarInitials} color={avatarColor} size="lg" />
            <div>
              <p className="text-[#0f172b] font-bold text-[16px] leading-[22px]">
                {form.name || 'Full Name'}
              </p>
              <p className="text-[#90a1b9] text-[13px] leading-[18px] mt-0.5">
                {form.role || 'Role not set'}
              </p>
            </div>
          </div>

          {/* ── Basic Info ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconUser} title="Basic Info" />

            <FormInput
              label="Full Name"
              id="name"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Sarah Lee"
              required
              icon={IconUser}
              error={errors.name}
            />
            <FormInput
              label="Email"
              id="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="e.g. sarah.lee@company.com"
              required
              icon={IconMail}
              error={errors.email}
            />
            <FormInput
              label="Phone"
              id="phone"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+1 (555) 000-0000"
              required
              icon={IconPhone}
              error={errors.phone}
            />
          </section>

          <div className="h-px bg-[#f1f5f9]" />

          {/* ── Role Info ── */}
          <section className="flex flex-col gap-4">
            <FormSectionHeader icon={IconBriefcase} title="Role Info" />

            <FormSelect
              label="Role"
              id="role"
              value={form.role}
              onChange={set('role')}
              options={ROLE_OPTIONS_MANAGER}
              placeholder="Select role..."
              required
              error={errors.role}
            />
            <FormSelect
              label="Status"
              id="status"
              value={form.status}
              onChange={set('status')}
              options={PEOPLE_STATUS_OPTIONS}
              placeholder="Select status..."
            />
          </section>

        </div>
      </div>

      {/* ── Bottom action row ─────────────────────────────────────── */}
      <div className="border-t border-[#e2e8f0] px-6 py-5 flex items-center justify-end gap-3 bg-white shrink-0">
        <button
          onClick={onClose}
          className="px-5 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold bg-white hover:bg-[#f8fafc] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.30)]"
        >
          <IconSave />
          {isEdit ? 'Save Changes' : 'Add Manager'}
        </button>
      </div>
    </div>
  )
}
