// src/pages/login/LoginPage.jsx
// Figma: Login Page — OpsControl Admin Console Login
//
// DEV MODE behaviour (active now):
//   Any non-empty email + password → sets in-memory auth + redirects to /admin/dashboard
//   No real API call is made.
//
// PRODUCTION: Uncomment the API block inside handleSubmit and remove the
//   dev-mode block above it.
//
// API: POST /api/users/admin/login/
//   Request:  { email, password }
//   Success:  { message, user: { id, full_name, email, phone, profile_picture, role }, tokens: { access, refresh } }
//   Error:    { detail: "Invalid email or password." }
// ─────────────────────────────────────────────────────────────────────────────

import { useState }       from 'react'
import { useNavigate }    from 'react-router-dom'
import { setAuth }        from '@/store/authStore'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconGrid() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3"  y="3"  width="9" height="9" rx="2" fill="white"/>
      <rect x="16" y="3"  width="9" height="9" rx="2" fill="white"/>
      <rect x="3"  y="16" width="9" height="9" rx="2" fill="white"/>
      <rect x="16" y="16" width="9" height="9" rx="2" fill="white"/>
    </svg>
  )
}
function IconMail() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <rect x="1.5" y="3.5" width="14" height="10" rx="1.5" stroke="#b0bec5" strokeWidth="1.3"/>
      <path d="M1.5 6l7 4.5 7-4.5" stroke="#b0bec5" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
function IconLock() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <rect x="3" y="7.5" width="11" height="8" rx="1.5" stroke="#b0bec5" strokeWidth="1.3"/>
      <path d="M5.5 7.5V5.5a3 3 0 016 0v2" stroke="#b0bec5" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8.5" cy="12" r="1.2" fill="#b0bec5"/>
    </svg>
  )
}
function IconEye({ off }) {
  return off ? (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M2 2l13 13M7.07 7.2A2.5 2.5 0 009.8 9.93M4.5 4.62C3.04 5.7 2 7 2 8.5c0 2.5 3 5.5 6.5 5.5a8 8 0 003.6-.9M6.5 3.1A8 8 0 018.5 3C12 3 15 6 15 8.5c0 1-.43 2.02-1.1 2.9" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M1.5 8.5C3 5 5.5 3 8.5 3s5.5 2 7 5.5c-1.5 3.5-4 5.5-7 5.5s-5.5-2-7-5.5z" stroke="#90a1b9" strokeWidth="1.3"/>
      <circle cx="8.5" cy="8.5" r="2.5" stroke="#90a1b9" strokeWidth="1.3"/>
    </svg>
  )
}
function IconArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 9h12M10 5l5 4-5 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconShield() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1L2 3.5v4c0 3 2 5 5 6 3-1 5-3 5-6v-4L7 1z" stroke="#b0bec5" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}
function IconAlertCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="#f54900" strokeWidth="1.3"/>
      <path d="M8 5v3.5" stroke="#f54900" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="0.8" fill="#f54900"/>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPass,  setShowPass]  = useState(false)
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')

    // ── Basic client-side validation ─────────────────────────────────────────
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)

    // ── Login API ─────────────────────────────────────────────────────────────
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL
      const res = await fetch(`${apiBase}users/admin/login/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Backend returns { detail: "Invalid email or password." }
        // or { detail: "You do not have permission to access the dashboard." }
        setError(data?.detail ?? 'Login failed. Please try again.')
        setLoading(false)
        return
      }

      // Store user + tokens (persisted to sessionStorage in authStore)
      setAuth({ user: data.user, tokens: data.tokens })

      setLoading(false)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError('Unable to reach the server. Please check your connection.')
      setLoading(false)
    }
    // ── End login API ─────────────────────────────────────────────────────────
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f1c2e] relative overflow-hidden">

      {/* ── Subtle background texture (dark grid) ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div className="bg-[#f4f6f9] rounded-[20px] shadow-[0px_32px_80px_rgba(0,0,0,0.5)] overflow-hidden">

          {/* ── Card body ── */}
          <div className="px-10 pt-10 pb-8 flex flex-col items-center gap-0">

            {/* Logo mark */}
            <div className="w-[60px] h-[60px] rounded-[16px] bg-[#f54900] flex items-center justify-center shadow-[0_4px_20px_rgba(245,73,0,0.45)] mb-5">
              <IconGrid />
            </div>

            {/* Brand name */}
            <h1 className="text-[#0f172b] font-extrabold text-[28px] leading-[34px] tracking-[-0.5px] text-center">
              Adelaide Plumbing and Gasfitting
            </h1>
            <p className="text-[#62748e] text-[14px] leading-[20px] mt-1 mb-7">
              Admin Console Login
            </p>

            {/* ── Error banner ── */}
            {error && (
              <div className="w-full flex items-center gap-2.5 px-4 py-3 rounded-[10px] bg-[#fff1ee] border border-[#fdd0c4] mb-5">
                <span className="shrink-0"><IconAlertCircle /></span>
                <p className="text-[#c73b00] text-[13px] leading-[18px] font-medium">{error}</p>
              </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4" noValidate>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#0f172b] text-[13px] font-semibold leading-[18px]">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <IconMail />
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="admin@company.com"
                    className={[
                      'w-full h-[46px] pl-10 pr-4 rounded-[10px] border bg-white',
                      'text-[14px] text-[#0f172b] placeholder:text-[#b0bec5]',
                      'focus:outline-none focus:ring-2 transition-colors',
                      error
                        ? 'border-[#f54900]/60 focus:ring-[#f54900]/20'
                        : 'border-[#dde3ec] focus:ring-[#f54900]/20 focus:border-[#f54900]/50',
                    ].join(' ')}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[#0f172b] text-[13px] font-semibold leading-[18px]">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <IconLock />
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="••••••••"
                    className={[
                      'w-full h-[46px] pl-10 pr-11 rounded-[10px] border bg-white',
                      'text-[14px] text-[#0f172b] placeholder:text-[#b0bec5] tracking-widest',
                      'focus:outline-none focus:ring-2 transition-colors',
                      error
                        ? 'border-[#f54900]/60 focus:ring-[#f54900]/20'
                        : 'border-[#dde3ec] focus:ring-[#f54900]/20 focus:border-[#f54900]/50',
                    ].join(' ')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#90a1b9] hover:text-[#314158] transition-colors"
                    tabIndex={-1}
                  >
                    <IconEye off={showPass} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={[
                  'w-full h-[50px] rounded-[12px] mt-1 flex items-center justify-center gap-2.5',
                  'text-white text-[15px] font-bold tracking-[0.1px]',
                  'shadow-[0px_4px_16px_rgba(245,73,0,0.4)] transition-all',
                  loading
                    ? 'bg-[#f54900]/70 cursor-not-allowed'
                    : 'bg-[#f54900] hover:bg-[#d94000] active:bg-[#c03800] active:shadow-none',
                ].join(' ')}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                      <path d="M9 2a7 7 0 017 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <IconArrowRight />
                  </>
                )}
              </button>
            </form>

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-center gap-2 py-5 border-t border-[#e2e8f0]">
            <IconShield />
            <p className="text-[#b0bec5] text-[12px]">
              Secured by Adelaide Plumbing and Gasfitting
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}