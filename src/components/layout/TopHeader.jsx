// src/components/layout/TopHeader.jsx
import { useLocation } from 'react-router-dom'
import { pageTitles }  from '@/routes/adminRoutes'
import { IconMenu, IconSearch, IconBell } from '@/components/ui/NavIcons'

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

export default function TopHeader({ onMenuToggle, sidebarCollapsed, isMobile }) {
  const { title } = useBreadcrumb()

  // Left offset mirrors AdminLayout's mainLeft
  const leftCls = isMobile
    ? 'left-0'
    : sidebarCollapsed
      ? 'left-[72px]'
      : 'left-[256px]'

  return (
    <header className={[
      'fixed top-0 right-0 z-10 h-[61px]',
      'bg-white border-b border-[#e2e8f0]',
      'flex items-center justify-between px-6 gap-4',
      'transition-[left] duration-300 ease-in-out',
      leftCls,
    ].join(' ')}>

      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          className="md:hidden text-[#62748e] hover:text-[#0f172b] p-1 -ml-1 rounded transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <IconMenu className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
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

      {/* Right: search + bell + avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search */}
        <div className="relative hidden sm:block">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#90a1b9] pointer-events-none w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[13px] text-[#0f172b] pl-9 pr-4 py-1.5 w-[220px] placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/40 transition"
          />
        </div>

        <div className="h-6 w-px bg-[#e2e8f0] hidden sm:block" />

        {/* Bell */}
        <button className="relative p-1.5 rounded-[8px] hover:bg-[#f8fafc] transition-colors text-[#62748e] hover:text-[#0f172b]">
          <IconBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#0f172b] flex items-center justify-center text-white text-[11px] font-bold select-none cursor-pointer hover:bg-[#1d293d] transition-colors">
          AD
        </div>
      </div>
    </header>
  )
}