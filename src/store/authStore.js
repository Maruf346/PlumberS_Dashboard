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

  // ── Persist to sessionStorage — uncomment when backend ready ──────────────
  // sessionStorage.setItem('access',  tokens.access)
  // sessionStorage.setItem('refresh', tokens.refresh)
  // sessionStorage.setItem('user',    JSON.stringify(user))
  // ── End persist ───────────────────────────────────────────────────────────
}

export function clearAuth() {
  authStore.user            = null
  authStore.access          = null
  authStore.refresh         = null
  authStore.isAuthenticated = false

  // sessionStorage.clear()
}

// ── Dev-mode helper: check if user has a valid session ────────────────────────
// In prod this would read from sessionStorage / validate the access token.
export function isLoggedIn() {
  return authStore.isAuthenticated
}
