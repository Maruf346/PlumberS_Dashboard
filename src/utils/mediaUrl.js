// src/utils/mediaUrl.js
// Converts a server-relative media path (e.g. "/media/dps/Maruf.jpg")
// into a fully-qualified URL using the same origin as VITE_API_BASE_URL.
// If the path is already absolute (starts with http/https) it is returned as-is.
// Returns undefined for falsy values so it is safe to use directly in src attributes.

const _origin = (() => {
  try { return new URL(import.meta.env.VITE_API_BASE_URL).origin } catch { return '' }
})()

export function mediaUrl(path) {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  return `${_origin}${path.startsWith('/') ? '' : '/'}${path}`
}
