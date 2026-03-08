// src/store/authStore.js
// In-memory auth state — no localStorage in dev mode.
// Replace with a proper auth context / token storage when going live.
//
// Shape:
//   { user: null | { id, full_name, email, phone, profile_picture, role },
//     access: null | string,
//     refresh: null | string,
//     isAuthenticated: boolean }
//
// Usage:
//   import { authStore, setAuth, clearAuth } from '@/store/authStore'
// ─────────────────────────────────────────────────────────────────────────────

export const authStore = {
  user:            null,
  access:          null,
  refresh:         null,
  isAuthenticated: false,
}

export function setAuth({ user, tokens }) {
  authStore.user            = user
  authStore.access          = tokens?.access  ?? null
  authStore.refresh         = tokens?.refresh ?? null
  authStore.isAuthenticated = true

  // Persist tokens + user to sessionStorage (cleared on tab/browser close)
  sessionStorage.setItem('access',  tokens.access)
  sessionStorage.setItem('refresh', tokens.refresh)
  sessionStorage.setItem('user',    JSON.stringify(user))
}

export function clearAuth() {
  authStore.user            = null
  authStore.access          = null
  authStore.refresh         = null
  authStore.isAuthenticated = false

  sessionStorage.clear()
}

// ── Check if user has a valid session ─────────────────────────────────────────
// Reads from sessionStorage so the session survives a page refresh.
// On first load, hydrates the in-memory authStore from sessionStorage.
export function isLoggedIn() {
  if (authStore.isAuthenticated) return true

  // Hydrate from sessionStorage on page refresh
  const access = sessionStorage.getItem('access')
  const user   = sessionStorage.getItem('user')
  if (access && user) {
    try {
      authStore.user            = JSON.parse(user)
      authStore.access          = access
      authStore.refresh         = sessionStorage.getItem('refresh')
      authStore.isAuthenticated = true
      return true
    } catch (_) {
      sessionStorage.clear()
    }
  }
  return false
}