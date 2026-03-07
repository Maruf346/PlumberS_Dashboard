// src/pages/settings/tabs/ProfileTab.jsx
// Admin profile — view and edit full_name, phone, profile_picture
//
// APIs (commented out — using mock data now):
//   GET   /api/user/admin/profile/  → load profile
//   PATCH /api/user/admin/profile/  → { full_name, phone, profile_picture }
// To disable mock: remove MOCK_PROFILE import and uncomment API blocks
import { useState, useRef } from 'react'
import { MOCK_PROFILE } from '../settingsMock'

function IconUser()   { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="#90a1b9" strokeWidth="1.3"/><path d="M3 18c0-4 3-7 7-7s7 3 7 7" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IconPhone()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5-1.75 1.25C6.5 9 7 9.5 9.25 11.25L10.5 9.5 14 11v3c0 .553-4-1-7-4S1 5.5 3 2z" stroke="#90a1b9" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconMail()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="#90a1b9" strokeWidth="1.2"/><path d="M1.5 6l7 4 6.5-4" stroke="#90a1b9" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconCamera() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4.5" width="14" height="10" rx="1.5" stroke="white" strokeWidth="1.2"/><circle cx="8" cy="10" r="2.5" stroke="white" strokeWidth="1.2"/><path d="M5.5 4.5L6.5 2.5h3l1 2" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconEdit()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconCheck()  { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5l3.5 3.5 6.5-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconX()      { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 3l9 9M12 3L3 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#f1f5f9] last:border-0">
      <span className="mt-0.5 shrink-0"><Icon /></span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[#90a1b9] uppercase tracking-[0.5px]">{label}</p>
        <p className="text-[14px] text-[#0f172b] font-medium mt-0.5 break-all">{value || <span className="text-[#cad5e2] italic">Not set</span>}</p>
      </div>
    </div>
  )
}

export default function ProfileTab() {
  // ── Load profile (mock) ──────────────────────────────────────────────────
  // To use API: remove MOCK_PROFILE below, uncomment the useEffect block
  const [profile, setProfile] = useState(MOCK_PROFILE)

  // // API load — uncomment when ready:
  // useEffect(() => {
  //   const load = async () => {
  //     const res  = await fetch(`${import.meta.env.VITE_API_BASE_URL}user/admin/profile/`)
  //     const data = await res.json()
  //     setProfile(data)
  //     setForm({ full_name: data.full_name, phone: data.phone ?? '' })
  //   }
  //   load()
  // }, [])

  const [editing, setEditing]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const [success, setSuccess]   = useState(false)
  const [form,    setForm]      = useState({ full_name: MOCK_PROFILE.full_name, phone: MOCK_PROFILE.phone ?? '' })
  const [avatar,  setAvatar]    = useState(null)  // data URL preview
  const fileRef = useRef(null)

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)

    // ── API call — uncomment when ready ────────────────────────────────────
    // try {
    //   const payload = { full_name: form.full_name, phone: form.phone }
    //   if (avatar) payload.profile_picture = avatar
    //   const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}user/admin/profile/`, {
    //     method:  'PATCH',
    //     headers: { 'Content-Type': 'application/json' },
    //     body:    JSON.stringify(payload),
    //   })
    //   const data = await res.json()
    //   setProfile(data)
    // } catch (err) { console.error(err) }
    // ── End API call ───────────────────────────────────────────────────────

    await new Promise(r => setTimeout(r, 500))
    setProfile(p => ({ ...p, full_name: form.full_name, phone: form.phone, profile_picture: avatar ?? p.profile_picture }))
    setSaving(false); setEditing(false); setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
  }

  const initials = profile.full_name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() ?? 'AU'
  const avatarSrc = avatar ?? profile.profile_picture

  return (
    <div className="max-w-[640px] flex flex-col gap-6">

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-[#ecfdf5] border border-[#bbf7d0] rounded-[10px]">
          <IconCheck /><p className="text-[#007a55] text-[13px] font-semibold">Profile updated successfully.</p>
        </div>
      )}

      {/* Avatar + name card */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6 flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[#f54900] flex items-center justify-center">
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover"/>
              : <span className="text-white font-bold text-[26px]">{initials}</span>}
          </div>
          {editing && (
            <button onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#0f172b] flex items-center justify-center shadow-md hover:bg-[#314158] transition-colors">
              <IconCamera />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#0f172b] font-bold text-[20px] leading-[26px] truncate">{profile.full_name}</p>
          <p className="text-[#62748e] text-[13px] mt-0.5">{profile.email}</p>
          <p className="text-[11px] text-[#90a1b9] mt-1">Member since {new Date(profile.created_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#e2e8f0] text-[#314158] text-[13px] font-semibold hover:bg-[#f8fafc] transition-colors shrink-0">
            <IconEdit /> Edit Profile
          </button>
        )}
      </div>

      {/* Details card */}
      <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-6">
        <h3 className="text-[#0f172b] font-bold text-[15px] mb-4">Account Details</h3>

        {!editing ? (
          <>
            <InfoRow icon={IconUser}  label="Full Name"     value={profile.full_name} />
            <InfoRow icon={IconMail}  label="Email Address" value={profile.email} />
            <InfoRow icon={IconPhone} label="Phone"         value={profile.phone} />
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Full name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-semibold text-[#0f172b]">Full Name <span className="text-[#f54900]">*</span></label>
              <input value={form.full_name} onChange={e => setForm(p => ({...p, full_name: e.target.value}))}
                className="h-[38px] px-3 rounded-[8px] border border-[#e2e8f0] text-[14px] text-[#0f172b] focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors"/>
            </div>
            {/* Email — read only */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-semibold text-[#0f172b]">Email Address</label>
              <input value={profile.email} disabled
                className="h-[38px] px-3 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] text-[14px] text-[#90a1b9] cursor-not-allowed"/>
              <p className="text-[11px] text-[#90a1b9]">Email cannot be changed here.</p>
            </div>
            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-semibold text-[#0f172b]">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                placeholder="+61 4 XXXX XXXX"
                className="h-[38px] px-3 rounded-[8px] border border-[#e2e8f0] text-[14px] text-[#0f172b] focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors"/>
            </div>
            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setEditing(false); setAvatar(null); setForm({ full_name: profile.full_name, phone: profile.phone ?? '' }) }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#e2e8f0] text-[#314158] text-[13px] font-semibold hover:bg-[#f8fafc] transition-colors">
                <IconX /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 rounded-[8px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[13px] font-semibold transition-colors disabled:opacity-60">
                {saving ? 'Saving…' : <><IconCheck /> Save Changes</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
