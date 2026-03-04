// src/hooks/useSidebar.js
import { useState, useEffect, useCallback } from 'react'

const MOBILE_BREAKPOINT = 768 // px

export function useSidebar() {
  const [isOpen, setIsOpen]       = useState(true)   // desktop: always open
  const [isMobile, setIsMobile]   = useState(false)

  // Detect mobile on mount + resize
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
      if (!mobile) setIsOpen(true)   // reset to open on desktop
      else setIsOpen(false)          // closed by default on mobile
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const toggle = useCallback(() => setIsOpen(v => !v), [])
  const close  = useCallback(() => setIsOpen(false),   [])
  const open   = useCallback(() => setIsOpen(true),    [])

  return { isOpen, isMobile, toggle, close, open }
}