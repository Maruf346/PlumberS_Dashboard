// src/components/layout/TopHeader.jsx
// Topbar with:
//   - Breadcrumb
//   - Quick search (frontend nav links, no API needed)
//   - Notifications (WebSocket realtime + REST paginated drawer)
//   - Profile dropdown (name/role, View Profile, Logout)
// ─────────────────────────────────────────────────────────────────────────────

import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback }  from 'react'
import { pageTitles }    from '@/routes/adminRoutes'
import { IconMenu }      from '@/components/ui/NavIcons'
import { authStore, clearAuth } from '@/store/authStore'
import { apiFetch }      from '@/utils/apiFetch'

// ── Breadcrumb helper ─────────────────────────────────────────────────────────
function useBreadcrumb() {
  const { pathname } = useLocation()
  const segments     = pathname.split('/').filter(Boolean)
  const lastSeg      = segments[segments.length - 1] ?? 'dashboard'
  const title        = pageTitles[lastSeg] ?? capitalise(lastSeg)
  return { title }
}
function capitalise(str) {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ── NAV_LINKS for quick search ────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Dashboard',    path: '/admin/dashboard',   icon: '🏠' },
  { label: 'Jobs',         path: '/admin/jobs',         icon: '💼' },
  { label: 'Schedule',     path: '/admin/schedule',     icon: '📅' },
  { label: 'Fleet',        path: '/admin/fleet',        icon: '🚛' },
  { label: 'Safety Forms', path: '/admin/safety-forms', icon: '🛡️' },
  { label: 'Managers',     path: '/admin/managers',     icon: '👔' },
  { label: 'Employees',    path: '/admin/staff',        icon: '👷' },
  { label: 'Clients',      path: '/admin/clients',      icon: '🏢' },
  // { label: 'Reports',      path: '/admin/reports',      icon: '📊' },
  { label: 'Settings',     path: '/admin/settings',     icon: '⚙️' },
]

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconSearch({ className = '' }) { return <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3"/><path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IconBell()   { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 00-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M8.5 16.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IconClose()  { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconCheck()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconTrash()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3.5h11M4.5 3.5V2h5v1.5M5 6v5M9 6v5M2.5 3.5l.9 8.5h7.2l.9-8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconLogout() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2H2.5A1.5 1.5 0 001 3.5v9A1.5 1.5 0 002.5 14H6M10.5 11l3-3-3-3M13.5 8H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconSettings(){ return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }

// notification type → colour dot
const NOTIF_COLORS = {
  job_overdue:     'bg-[#c10007]',
  job_assigned:    'bg-[#f54900]',
  job_completed:   'bg-[#22c55e]',
  job_created:     'bg-[#1447e6]',
  safety_form:     'bg-[#8b5cf6]',
  fleet_issue:     'bg-[#fe9a00]',
}

function fmtAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Quick Search ───────────────────────────────────────────────────────────────
function QuickSearch() {
  const [query,   setQuery]   = useState('')
  const [open,    setOpen]    = useState(false)
  const navigate  = useNavigate()
  const ref       = useRef(null)

  const results = query.trim().length > 0
    ? NAV_LINKS.filter(l => l.label.toLowerCase().includes(query.toLowerCase()))
    : []

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#90a1b9] pointer-events-none" />
      <input
        type="text"
        placeholder="Search pages..."
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172b] pl-9 pr-4 py-1.5 w-[200px] placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/40 transition"
      />
      {open && results.length > 0 && (
        <div className="absolute top-[38px] left-0 w-[220px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0px_8px_24px_rgba(15,23,43,0.12)] py-1 z-50">
          {results.map(r => (
            <button key={r.path}
              onMouseDown={() => { navigate(r.path); setQuery(''); setOpen(false) }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-[#314158] hover:bg-[#f8fafc] transition-colors text-left">
              <span className="text-[15px]">{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Notification Drawer ───────────────────────────────────────────────────────
function NotificationDrawer({ onClose, onCountChange }) {
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]        = useState(true)
  const [loadingMore,   setLoadingMore]    = useState(false)
  const [nextPage,      setNextPage]       = useState(null)

  const loadPage = useCallback(async (page = 1, append = false) => {
    if (page === 1) setLoading(true); else setLoadingMore(true)
    const { data, ok } = await apiFetch(`notification/?page=${page}`)
    if (ok && data) {
      setNotifications(prev => append ? [...prev, ...(data.results ?? [])] : (data.results ?? []))
      setNextPage(data.next ? page + 1 : null)
    }
    setLoading(false)
    setLoadingMore(false)
  }, [])

  useEffect(() => { loadPage(1) }, [loadPage])

  const markRead = async (id) => {
    const { ok } = await apiFetch(`notification/${id}/mark-read/`, { method: 'POST' })
    if (ok) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      onCountChange?.()
    }
  }

  const markAllRead = async () => {
    const { ok } = await apiFetch('notification/mark-all-read/', { method: 'POST' })
    if (ok) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      onCountChange?.()
    }
  }

  const clearRead = async () => {
    const { ok } = await apiFetch('notification/clear-read/', { method: 'DELETE' })
    if (ok) {
      setNotifications(prev => prev.filter(n => !n.is_read))
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    // Backdrop
    <div className="fixed inset-0 z-40" onClick={onClose}>
      {/* Drawer panel */}
      <div
        className="absolute top-[61px] right-4 w-[480px] bg-white rounded-[14px] border border-[#e2e8f0] shadow-[0px_16px_48px_rgba(15,23,43,0.18)] flex flex-col overflow-hidden max-h-[calc(100vh-80px)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9] shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[#0f172b] font-bold text-[16px]">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[11px] font-bold text-white bg-[#f54900] rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1 text-[#155dfc] text-[12px] font-medium px-2 py-1 rounded-[6px] hover:bg-[#eff6ff] transition-colors">
                <IconCheck /> Mark all read
              </button>
            )}
            <button onClick={clearRead}
              className="flex items-center gap-1 text-[#90a1b9] text-[12px] px-2 py-1 rounded-[6px] hover:bg-[#f8fafc] hover:text-[#c10007] transition-colors">
              <IconTrash /> Clear read
            </button>
            <button onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-[6px] hover:bg-[#f8fafc] text-[#90a1b9] transition-colors">
              <IconClose />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin"/>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <span className="text-3xl">🔔</span>
              <p className="text-[#62748e] text-[14px] font-medium">All caught up!</p>
              <p className="text-[#90a1b9] text-[12px]">No notifications yet</p>
            </div>
          ) : (
            <>
              {notifications.map(n => {
                const dot = NOTIF_COLORS[n.notification_type] ?? 'bg-[#cad5e2]'
                return (
                  <div key={n.id}
                    onClick={() => { if (!n.is_read) markRead(n.id) }}
                    className={`flex items-start gap-3 px-5 py-4 border-b border-[#f8fafc] last:border-b-0 cursor-pointer transition-colors ${n.is_read ? 'bg-white hover:bg-[#fafafa]' : 'bg-[#fffbf9] hover:bg-[#fff4ee]'}`}>
                    {/* Dot */}
                    <div className="flex flex-col items-center gap-1 shrink-0 mt-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${dot} ${!n.is_read ? 'ring-2 ring-offset-1 ring-[#f54900]/30' : ''}`} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[13px] leading-[18px] ${n.is_read ? 'text-[#62748e]' : 'text-[#0f172b] font-semibold'}`}>
                          {n.title}
                        </p>
                        <span className="text-[11px] text-[#90a1b9] whitespace-nowrap shrink-0 mt-0.5">{fmtAgo(n.created_at)}</span>
                      </div>
                      <p className="text-[12px] text-[#62748e] leading-[17px] mt-0.5 line-clamp-2">{n.body}</p>
                      {!n.is_read && (
                        <span className="text-[11px] text-[#f54900] font-medium mt-1 block">Tap to mark read</span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Load more */}
              {nextPage && (
                <div className="px-5 py-3 border-t border-[#f1f5f9]">
                  <button
                    onClick={() => loadPage(nextPage, true)}
                    disabled={loadingMore}
                    className="w-full text-[#155dfc] text-[13px] font-medium py-2 rounded-[8px] bg-[#eff6ff] hover:bg-[#dbeafe] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {loadingMore ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-[#155dfc]/30 border-t-[#155dfc] animate-spin"/>Loading…</> : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Profile Dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ user, onClose }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    onClose()
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}user/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${authStore.access ?? sessionStorage.getItem('access')}`,
        },
        body: JSON.stringify({ refresh: authStore.refresh ?? sessionStorage.getItem('refresh') }),
      })
    } catch (_) {}
    clearAuth()
    navigate('/login', { replace: true })
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD'

  const roleLabel = { admin: 'Admin', manager: 'Manager', employee: 'Employee' }[user?.role] ?? user?.role ?? 'Admin'

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute top-[61px] right-4 w-[220px] bg-white border border-[#e2e8f0] rounded-[12px] shadow-[0px_8px_24px_rgba(15,23,43,0.14)] overflow-hidden py-1"
        onClick={e => e.stopPropagation()}
      >
        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f5f9]">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt={user.full_name} className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#0f172b] flex items-center justify-center text-white text-[12px] font-bold shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[#0f172b] text-[13px] font-bold leading-[18px] truncate">{user?.full_name ?? 'Admin'}</p>
            <p className="text-[#90a1b9] text-[11px] leading-[16px] truncate">{user?.email ?? ''}</p>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#eff6ff] text-[#1447e6] mt-0.5 inline-block">{roleLabel}</span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => { onClose(); navigate('/admin/settings') }}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-[#314158] hover:bg-[#f8fafc] transition-colors">
          <IconSettings /> View Profile
        </button>
        <div className="h-px bg-[#f1f5f9] mx-3 my-1" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-[#c10007] hover:bg-[#fef2f2] transition-colors">
          <IconLogout /> Logout
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TopHeader
// ─────────────────────────────────────────────────────────────────────────────
export default function TopHeader({ onMenuToggle, sidebarCollapsed, isMobile }) {
  const { title } = useBreadcrumb()

  // ── Read user from sessionStorage (survives refresh) ─────────────────────
  const [user] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('user') ?? 'null') } catch { return null }
  })

  // ── Notification state ────────────────────────────────────────────────────
  const [unreadCount,       setUnreadCount]       = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile,       setShowProfile]       = useState(false)
  const wsRef = useRef(null)

  // ── Fetch unread count via REST on mount ──────────────────────────────────
  const refreshCount = useCallback(async () => {
    const { data, ok } = await apiFetch('notification/unread-count/')
    if (ok && data) setUnreadCount(data.unread_count ?? 0)
  }, [])

  useEffect(() => { refreshCount() }, [refreshCount])

  // ── WebSocket connection for real-time notifications ──────────────────────
  useEffect(() => {
    const token = authStore.access ?? sessionStorage.getItem('access')
    if (!token) return

    // Derive WS base from VITE_API_BASE_URL
    // e.g. "https://api.example.com/api/" → "wss://api.example.com"
    // or   "http://localhost:8888/api/"   → "ws://localhost:8888"
    const apiBase  = import.meta.env.VITE_API_BASE_URL ?? ''
    const wsBase   = apiBase.replace(/^https?/, m => m === 'https' ? 'wss' : 'ws').replace(/\/api\/?$/, '')
    const wsUrl    = `${wsBase}/ws/notifications/?token=${token}`

    let ws
    try {
      ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'unread_count') {
            setUnreadCount(msg.count ?? 0)
          } else if (msg.type === 'notification') {
            // New notification arrived — bump count
            setUnreadCount(prev => prev + 1)
          }
        } catch (_) {}
      }

      ws.onerror = () => {}  // silent — REST fallback already shows count
    } catch (_) {}

    return () => {
      ws?.close()
      wsRef.current = null
    }
  }, [])

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'AD'

  const leftCls = isMobile
    ? 'left-0'
    : sidebarCollapsed
      ? 'left-[72px]'
      : 'left-[256px]'

  return (
    <>
      <header className={[
        'fixed top-0 right-0 z-10 h-[61px]',
        'bg-white border-b border-[#e2e8f0]',
        'flex items-center justify-between px-6 gap-4',
        'transition-[left] duration-300 ease-in-out',
        leftCls,
      ].join(' ')}>

        {/* Left: toggle + breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            className="md:hidden text-[#62748e] hover:text-[#0f172b] p-1 -ml-1 rounded transition-colors"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <IconMenu className="w-5 h-5" />
          </button>
          {!isMobile && (
            <button
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-[6px] text-[#62748e] hover:text-[#0f172b] hover:bg-[#f1f5f9] transition-colors"
              onClick={onMenuToggle}
              aria-label="Toggle sidebar"
            >
              <IconMenu className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2 text-sm ml-1">
            <span className="text-[#90a1b9] whitespace-nowrap hidden sm:block">Admin Console</span>
            <span className="text-[#e2e8f0] text-base hidden sm:block">/</span>
            <span className="text-[#0f172b] font-semibold capitalize whitespace-nowrap">{title}</span>
          </div>
        </div>

        {/* Right: search + divider + bell + avatar */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Quick search */}
          <QuickSearch />

          <div className="h-6 w-px bg-[#e2e8f0] hidden sm:block" />

          {/* Bell */}
          <button
            onClick={() => { setShowNotifications(v => !v); setShowProfile(false) }}
            className="relative p-1.5 rounded-[8px] hover:bg-[#f8fafc] transition-colors text-[#62748e] hover:text-[#0f172b]"
            aria-label="Notifications"
          >
            <IconBell />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#f54900] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Avatar / profile */}
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotifications(false) }}
            className="w-8 h-8 rounded-full overflow-hidden bg-[#0f172b] flex items-center justify-center text-white text-[11px] font-bold select-none hover:opacity-90 transition-opacity shrink-0"
            aria-label="Profile menu"
          >
            {user?.profile_picture
              ? <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
              : initials}
          </button>
        </div>
      </header>

      {/* Notification drawer */}
      {showNotifications && (
        <NotificationDrawer
          onClose={() => setShowNotifications(false)}
          onCountChange={refreshCount}
        />
      )}

      {/* Profile dropdown */}
      {showProfile && (
        <ProfileDropdown
          user={user}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  )
}