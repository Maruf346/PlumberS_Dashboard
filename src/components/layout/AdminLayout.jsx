// src/components/layout/AdminLayout.jsx
import { Outlet } from 'react-router-dom'
import Sidebar    from './Sidebar'
import TopHeader  from './TopHeader'
import { useSidebar } from '@/hooks/useSidebar'

export default function AdminLayout() {
  const { isOpen, isMobile, toggle, close } = useSidebar()

  return (
    <div className="min-h-screen bg-surface-subtle">
      {/* ── Sidebar ── */}
      <Sidebar
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={close}
      />

      {/* ── Top Header ── */}
      <TopHeader onMenuToggle={toggle} />

      {/* ── Main content area ── */}
      {/*
        On desktop: offset left by sidebar width (256px), top by header height (61px).
        On mobile: no left offset (sidebar overlays).
      */}
      <main
        className={[
          'min-h-screen pt-header',
          'transition-all duration-300 ease-in-out',
          isMobile ? 'ml-0' : 'ml-sidebar',
        ].join(' ')}
      >
        {/*
          Inner scrollable content wrapper.
          Pages control their own padding/layout.
        */}
        <div className="h-full min-h-[calc(100vh-61px)] overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}