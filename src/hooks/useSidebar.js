// src/hooks/useSidebar.js
// Manages sidebar open/collapsed state across mobile and desktop breakpoints.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'

const MOBILE_BP   = 768   // < 768px  → mobile overlay mode
const TABLET_BP   = 1280  // < 1280px → desktop collapsed mode (icon-only)

export function useSidebar() {
  // isOpen    — mobile: drawer visible | desktop: ignored
  // collapsed — desktop: icon-only rail | has no effect on mobile
  const [isOpen,    setIsOpen]    = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile,  setIsMobile]  = useState(false)
  const [isTablet,  setIsTablet]  = useState(false)

  useEffect(() => {
    const check = () => {
      const w       = window.innerWidth
      const mobile  = w < MOBILE_BP
      const tablet  = w >= MOBILE_BP && w < TABLET_BP
      setIsMobile(mobile)
      setIsTablet(tablet)
      if (mobile) {
        setIsOpen(false)   // always start closed on mobile
        setCollapsed(false)
      } else if (tablet) {
        setIsOpen(true)
        setCollapsed(true)  // auto-collapse on tablet
      } else {
        setIsOpen(true)
        // keep user preference on large screens
      }
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const toggle         = useCallback(() => {
    if (isMobile) setIsOpen(v => !v)
    else          setCollapsed(v => !v)
  }, [isMobile])

  const close          = useCallback(() => setIsOpen(false), [])
  const open           = useCallback(() => setIsOpen(true),  [])
  const toggleCollapse = useCallback(() => setCollapsed(v => !v), [])

  return {
    isOpen,
    collapsed,
    isMobile,
    isTablet,
    toggle,
    toggleCollapse,
    close,
    open,
  }
}