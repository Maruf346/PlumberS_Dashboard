// src/components/layout/AdminLayout.jsx
import { Outlet }    from 'react-router-dom'
import Sidebar       from './Sidebar'
import TopHeader     from './TopHeader'
import { useSidebar } from '@/hooks/useSidebar'

export default function AdminLayout() {
  const { isOpen, collapsed, isMobile, toggle, toggleCollapse, close } = useSidebar()

  // Main content left offset:
  //   Mobile  → 0 (sidebar overlays)
  //   Tablet/Desktop collapsed → 72px
  //   Desktop expanded → 256px
  const mainLeft = isMobile
    ? 'ml-0'
    : collapsed
      ? 'ml-[72px]'
      : 'ml-[256px]'

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <Sidebar
        isOpen={isOpen}
        collapsed={collapsed}
        isMobile={isMobile}
        onClose={close}
        onToggleCollapse={toggleCollapse}
      />

      <TopHeader
        onMenuToggle={toggle}
        sidebarCollapsed={collapsed}
        isMobile={isMobile}
      />

      <main className={[
        'min-h-screen pt-[61px]',
        'transition-[margin] duration-300 ease-in-out',
        mainLeft,
      ].join(' ')}>
        <div className="h-full min-h-[calc(100vh-61px)] overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}