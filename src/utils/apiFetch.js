// src/utils/apiFetch.js
// Central authenticated fetch wrapper for all API calls.
//
// Features:
//   • Automatically attaches Authorization: Bearer <access_token>
//   • On 401 → clears auth + redirects to /login (token expired)
//   • Returns { data, ok, status } — never throws on API errors,
//     only throws on genuine network failures
// ─────────────────────────────────────────────────────────────────────────────

import { authStore, clearAuth } from '@/store/authStore'

const BASE = import.meta.env.VITE_API_BASE_URL  // e.g. "https://api.example.com/api/"

export async function apiFetch(endpoint, options = {}) {
  const token = authStore.access ?? sessionStorage.getItem('access')

  // Don't set Content-Type for FormData — browser sets it automatically
  // with the correct multipart boundary. For everything else use JSON.
  const isFormData = options.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers,
  })

  // 401 = token expired / invalid → force logout
  if (res.status === 401) {
    clearAuth()
    window.location.replace('/login')
    return { data: null, ok: false, status: 401 }
  }

  // 204 No Content (e.g. DELETE success) — no body to parse
  if (res.status === 204) {
    return { data: null, ok: true, status: 204 }
  }

  let data = null
  try {
    data = await res.json()
  } catch (_) {
    // Non-JSON response (shouldn't happen with this backend)
  }

  return { data, ok: res.ok, status: res.status }
}

// ── Resolve image URL to absolute URL ─────────────────────────────────────────
// Convert relative image paths (/media/...) to absolute URLs using API base domain
// Handles both relative paths and already-absolute URLs
export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null
  
  // Already absolute URL
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // Relative path — extract base domain from API URL and prepend
  if (imageUrl.startsWith('/')) {
    try {
      const url = new URL(BASE)
      return `${url.origin}${imageUrl}`
    } catch {
      // Fallback if BASE is invalid
      return imageUrl
    }
  }
  
  return imageUrl
}