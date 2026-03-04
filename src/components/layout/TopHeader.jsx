// src/components/layout/TopHeader.jsx
import { useLocation } from 'react-router-dom'
import { pageTitles } from '@/routes/adminRoutes'
import { IconMenu, IconSearch, IconBell } from '@/components/ui/NavIcons'

function useBreadcrumb() {
  const { pathname } = useLocation()

  // e.g. /admin/safety-forms → ['admin', 'safety-forms']
  const segments = pathname.split('/').filter(Boolean)

  // Last meaningful segment = current page
  const lastSeg = segments[segments.length - 1] ?? 'dashboard'
  const title   = pageTitles[lastSeg] ?? capitalise(lastSeg)

  return { title }
}

function capitalise(str) {
  return str
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function TopHeader({ onMenuToggle }) {
  const { title } = useBreadcrumb()

  return (
    <header
      className={[
        'fixed top-0 right-0 z-10',
        'h-header',
        'left-0 md:left-sidebar',            // full-width on mobile, offset on desktop
        'bg-surface border-b border-border',
        'flex items-center justify-between',
        'px-8 gap-4',
      ].join(' ')}
    >
      {/* ── Left: menu toggle (mobile) + breadcrumb ── */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger — only visible on mobile */}
        <button
          className="md:hidden text-ink-muted hover:text-ink p-1 -ml-1 rounded transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <IconMenu />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-ghost whitespace-nowrap hidden sm:block">
            Admin Console
          </span>
          <span className="text-border text-base hidden sm:block">/</span>
          <span className="text-ink font-semibold capitalize whitespace-nowrap">
            {title}
          </span>
        </div>
      </div>

      {/* ── Right: search + notifications + avatar ── */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Global search */}
        <div className="relative hidden sm:block">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost pointer-events-none" />
          <input
            type="text"
            placeholder="Global Search..."
            className={[
              'bg-surface-muted rounded-btn text-sm text-ink',
              'pl-9 pr-4 py-1.5 w-[256px]',
              'placeholder:text-ink/50',
              'focus:outline-none focus:ring-2 focus:ring-brand/30',
              'transition',
            ].join(' ')}
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border hidden sm:block" />

        {/* Notifications */}
        <button className="relative p-1.5 rounded-btn hover:bg-surface-subtle transition-colors text-ink-subtle">
          <IconBell />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white text-xs font-bold select-none">
          AD
        </div>
      </div>
    </header>
  )
}