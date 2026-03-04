// src/components/people/PeopleActionMenu.jsx
// 3-dot context menu shared by Managers and Staff tables.
// Props: personId, type ('manager'|'staff'), onEdit, onToggleStatus, onDelete

import { useRef, useState, useEffect } from 'react'
import { useNavigate }                  from 'react-router-dom'

function IconDots() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="3"  cy="8" r="1.2" fill="#94a3b8"/>
      <circle cx="8"  cy="8" r="1.2" fill="#94a3b8"/>
      <circle cx="13" cy="8" r="1.2" fill="#94a3b8"/>
    </svg>
  )
}
function IconEye()      { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><ellipse cx="7" cy="7" rx="5.5" ry="3.5" stroke="#62748e" strokeWidth="1.1"/><circle cx="7" cy="7" r="1.5" fill="#62748e"/></svg> }
function IconEdit()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2l2.5 2.5-7 7H2.5V9l7-7z" stroke="#62748e" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconToggle()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="4" width="12" height="6" rx="3" stroke="#62748e" strokeWidth="1.1"/><circle cx="4" cy="7" r="2" fill="#62748e"/></svg> }
function IconTrash()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3.5h11M4 3.5V2h6v1.5M5 6v4.5M9 6v4.5M2.5 3.5l1 9h7l1-9" stroke="#c10007" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }

export default function PeopleActionMenu({
  personId,
  type = 'manager',      // 'manager' | 'staff'
  isActive = true,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)
  const navigate        = useNavigate()

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const stop = (fn) => (e) => { e.stopPropagation(); setOpen(false); fn?.() }

  const basePath = type === 'manager' ? '/admin/managers' : '/admin/staff'

  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-center w-7 h-7 rounded-[6px] hover:bg-[#f1f5f9] transition-colors"
      >
        <IconDots />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-[164px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0px_4px_16px_rgba(15,23,43,0.12)] py-1 overflow-hidden">
          {/* View */}
          <button
            onClick={stop(() => navigate(`${basePath}/${personId}`))}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-[#314158] hover:bg-[#f8fafc] transition-colors"
          >
            <IconEye /> View Profile
          </button>

          {/* Edit */}
          <button
            onClick={stop(onEdit)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-[#314158] hover:bg-[#f8fafc] transition-colors"
          >
            <IconEdit /> Edit
          </button>

          {/* Activate / Deactivate */}
          <button
            onClick={stop(onToggleStatus)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-[#314158] hover:bg-[#f8fafc] transition-colors"
          >
            <IconToggle /> {isActive ? 'Deactivate' : 'Activate'}
          </button>

          <div className="h-px bg-[#f1f5f9] mx-2 my-1" />

          {/* Delete */}
          <button
            onClick={stop(onDelete)}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-[#c10007] hover:bg-[#fef2f2] transition-colors"
          >
            <IconTrash /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
