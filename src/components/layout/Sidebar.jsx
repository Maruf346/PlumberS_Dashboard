// src/components/layout/Sidebar.jsx
// Figma frame 1:412 — exact 256px dark sidebar
// Behaviours:
//   Mobile  (<768px)  — off-canvas overlay, backdrop click to close
//   Tablet  (768–1279px) — auto icon-only rail (72px)
//   Desktop (≥1280px) — full 256px, collapsible to 72px icon rail
// ─────────────────────────────────────────────────────────────────────────────

import { NavLink } from 'react-router-dom'
import { navItems } from '@/routes/adminRoutes'
import { NAV_ICONS, IconLogout, IconChevronLeft, IconClose } from '@/components/ui/NavIcons'

// ── Logo ──────────────────────────────────────────────────────────────────────
function LogoFull() {
  return (
    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
      <div className="w-8 h-8 rounded-lg bg-[#f54900] flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15.5 2.5a3.5 3.5 0 00-3.45 4.13L5.3 13.38a3.5 3.5 0 104.24 4.24l6.75-6.75A3.5 3.5 0 0015.5 2.5zM4.5 16.5a1 1 0 110-2 1 1 0 010 2z" fill="white"/>
        </svg>
      </div>
      <span className="text-white font-bold text-[18px] leading-none tracking-tight whitespace-nowrap select-none">
        Plumber<span className="text-[#f54900]">S</span>
      </span>
    </div>
  )
}

function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-lg bg-[#f54900] flex items-center justify-center shrink-0">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M15.5 2.5a3.5 3.5 0 00-3.45 4.13L5.3 13.38a3.5 3.5 0 104.24 4.24l6.75-6.75A3.5 3.5 0 0015.5 2.5zM4.5 16.5a1 1 0 110-2 1 1 0 010 2z" fill="white"/>
      </svg>
    </div>
  )
}

// ── Nav item — full or icon-only ──────────────────────────────────────────────
function NavItem({ path, label, icon, isIconOnly, onClick }) {
  const Icon = NAV_ICONS[icon]
  return (
    <NavLink
      to={`/admin/${path}`}
      onClick={onClick}
      title={isIconOnly ? label : undefined}
      className={({ isActive }) => [
        'relative flex items-center h-10 rounded-[8px]',
        'text-[14px] font-normal leading-5 select-none',
        'transition-colors duration-150 cursor-pointer group',
        isIconOnly ? 'w-10 justify-center' : 'gap-3 px-3 w-full',
        isActive
          ? 'bg-[#f54900] text-white shadow-[0_4px_6px_-1px_rgba(126,42,12,0.25),0_2px_4px_-2px_rgba(126,42,12,0.25)]'
          : 'text-[#cad5e2] hover:bg-[#1d293d] hover:text-white',
      ].join(' ')}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}

      {/* Label */}
      {!isIconOnly && <span className="truncate">{label}</span>}

      {/* Tooltip when icon-only */}
      {isIconOnly && (
        <span className="absolute left-full ml-3 z-50 pointer-events-none px-2.5 py-1.5 rounded-[6px] bg-[#1d293d] border border-[#314158] text-white text-[12px] font-medium whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {label}
        </span>
      )}
    </NavLink>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
function SectionDivider({ collapsed }) {
  return (
    <div className={['my-1 border-t border-[#1d293d]', collapsed ? 'mx-2' : 'mx-1'].join(' ')} />
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, collapsed }) {
  if (collapsed) return null
  return (
    <p className="px-3 pt-3 pb-1 text-[11px] font-bold text-[#314158] uppercase tracking-[0.7px] leading-4 select-none">
      {label}
    </p>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar groups — mirrors current navItems order with section grouping
// ─────────────────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    items: ['dashboard'],
  },
  {
    label: 'Field Ops',
    items: ['jobs', 'schedule', 'fleet', 'safety-forms'],
  },
  {
    label: 'People',
    items: ['employees', 'managers', 'staff'],
  },
  {
    label: 'System',
    items: ['reports', 'settings'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, collapsed, isMobile, onClose, onToggleCollapse }) {
  const isIconOnly = collapsed && !isMobile

  // Build a path→navItem lookup
  const navMap = Object.fromEntries(navItems.map(item => [item.path, item]))

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-20 bg-[#0f172b]/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{ width: isIconOnly ? '72px' : '256px' }}
        className={[
          'fixed top-0 left-0 z-30 h-screen flex flex-col bg-[#0f172b] overflow-hidden',
          'shadow-[0px_20px_25px_rgba(0,0,0,0.10),0px_8px_10px_rgba(0,0,0,0.10)]',
          'transition-[width,transform] duration-300 ease-in-out',
          isMobile
            ? (isOpen ? 'translate-x-0' : '-translate-x-full')
            : 'translate-x-0',
        ].join(' ')}
        aria-label="Main navigation"
      >

        {/* ════ HEADER — 81px ════ */}
        <div
          className={[
            'h-[81px] flex items-center shrink-0 border-b border-[#1d293d]',
            isIconOnly ? 'justify-center px-0' : 'px-6 justify-between',
          ].join(' ')}
        >
          {isIconOnly ? (
            /* Icon-only: just the mark, click expands */
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="focus:outline-none"
            >
              <LogoMark />
            </button>
          ) : (
            <>
              <LogoFull />
              <button
                onClick={isMobile ? onClose : onToggleCollapse}
                className="flex items-center justify-center w-7 h-7 rounded-[6px] text-[#62748e] hover:text-white hover:bg-[#1d293d] transition-colors shrink-0 ml-2"
                aria-label={isMobile ? 'Close menu' : 'Collapse sidebar'}
              >
                {isMobile
                  ? <IconClose className="w-5 h-5" />
                  : <IconChevronLeft className="w-4 h-4" />
                }
              </button>
            </>
          )}
        </div>

        {/* ════ NAV — flex-1 scrollable ════ */}
        <nav
          className={[
            'flex-1 overflow-y-auto overflow-x-hidden flex flex-col',
            isIconOnly ? 'px-0 py-5 items-center gap-1' : 'px-3 py-5 gap-0.5',
          ].join(' ')}
        >
          {NAV_GROUPS.map((group, gi) => {
            // Resolve items (skip any not in navMap — future-proof)
            const items = group.items
              .map(p => navMap[p])
              .filter(Boolean)

            if (!items.length) return null

            return (
              <div key={gi} className={isIconOnly ? 'contents' : 'mb-1'}>
                {/* Section divider between groups */}
                {gi > 0 && <SectionDivider collapsed={isIconOnly} />}

                {/* Section label */}
                {group.label && <SectionLabel label={group.label} collapsed={isIconOnly} />}

                {/* Items */}
                {items.map(({ path, label, icon }) => (
                  <NavItem
                    key={path}
                    path={path}
                    label={label}
                    icon={icon}
                    isIconOnly={isIconOnly}
                    onClick={isMobile ? onClose : undefined}
                  />
                ))}
              </div>
            )
          })}
        </nav>

        {/* ════ USER FOOTER — 89px ════ */}
        <div
          className={[
            'border-t border-[#1d293d] shrink-0',
            isIconOnly
              ? 'h-[89px] flex items-center justify-center'
              : 'py-[17px] px-4',
          ].join(' ')}
        >
          {isIconOnly ? (
            /* Icon-only: avatar only */
            <div
              title="Admin User · admin@company.com"
              className="w-10 h-10 rounded-full bg-[#1d293d] border border-[#314158] flex items-center justify-center cursor-pointer hover:bg-[#314158] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3.5" stroke="#cad5e2" strokeWidth="1.3"/>
                <path d="M3 18c0-3.5 3.134-6 7-6s7 2.5 7 6" stroke="#cad5e2" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </div>
          ) : (
            /* Full: avatar + name/email + logout icon */
            <div className="flex items-center gap-3 px-2 py-2 rounded-[8px] hover:bg-[#1d293d] transition-colors cursor-pointer group">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#314158] border border-[#45556c] flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3.5" stroke="#cad5e2" strokeWidth="1.3"/>
                  <path d="M3 18c0-3.5 3.134-6 7-6s7 2.5 7 6" stroke="#cad5e2" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              {/* Name + email */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-[14px] font-medium leading-5 truncate">Admin User</p>
                <p className="text-[#62748e] text-[12px] leading-4 truncate">admin@company.com</p>
              </div>
              {/* Logout — appears on hover */}
              <button
                title="Sign out"
                className="text-[#62748e] hover:text-[#f54900] transition-colors p-1 rounded shrink-0 opacity-0 group-hover:opacity-100"
                onClick={e => e.stopPropagation()}
              >
                <IconLogout className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  )
}