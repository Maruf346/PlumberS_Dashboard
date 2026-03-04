// src/components/shared/MultiSelect.jsx
// Custom multi-select with pill tags — matches the form design system exactly.
// Props:
//   label, id, options [{ value, label }], value (array of values),
//   onChange (receives new array), placeholder, required, error, icon
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'

function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="#90a1b9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconX() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function MultiSelect({
  label,
  id,
  options      = [],
  value        = [],   // array of selected values
  onChange,            // (newArray) => void
  placeholder  = 'Select options…',
  required     = false,
  error,
  hint,
  icon: Icon,
  className    = '',
}) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const containerRef        = useRef(null)
  const searchRef           = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  const toggle = (optValue) => {
    const next = value.includes(optValue)
      ? value.filter(v => v !== optValue)
      : [...value, optValue]
    onChange(next)
  }

  const remove = (optValue, e) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== optValue))
  }

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedLabels = value.map(v => options.find(o => o.value === v)?.label).filter(Boolean)

  const borderCls = error
    ? 'border-[#c10007] bg-[#fef2f2] ring-[#c10007]/20'
    : open
      ? 'border-[#f54900]/60 ring-[#f54900]/20 ring-2'
      : 'border-[#e2e8f0] bg-white'

  return (
    <div ref={containerRef} className={`flex flex-col gap-[6px] ${className}`}>

      {/* Label */}
      <label
        htmlFor={id}
        className="text-[#0f172b] text-[14px] font-semibold leading-[20px] cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        {label}
        {required && <span className="text-[#f54900] ml-0.5">*</span>}
      </label>

      {/* Trigger box */}
      <div
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={0}
        onClick={() => setOpen(v => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(v => !v) }}}
        className={[
          'relative w-full min-h-[38px] rounded-[8px] border cursor-pointer',
          'transition-colors px-3 py-1.5',
          'flex flex-wrap items-center gap-1.5 pr-9',
          borderCls,
        ].join(' ')}
      >
        {/* Left icon */}
        {Icon && (
          <span className="text-[#90a1b9] shrink-0 mr-0.5">
            <Icon />
          </span>
        )}

        {/* Selected pills */}
        {selectedLabels.length > 0 ? (
          selectedLabels.map((lbl, i) => (
            <span
              key={value[i]}
              className="inline-flex items-center gap-1 bg-[#fff3ee] border border-[#ffd5c2] text-[#c73b00] text-[12px] font-medium px-2 py-[2px] rounded-full leading-4"
            >
              {lbl}
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => remove(value[i], e)}
                className="hover:text-[#a83200] transition-colors"
                aria-label={`Remove ${lbl}`}
              >
                <IconX />
              </button>
            </span>
          ))
        ) : (
          <span className="text-[#90a1b9] text-[14px] leading-5 select-none">{placeholder}</span>
        )}

        {/* Chevron */}
        <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
          <IconChevronDown />
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0px_8px_24px_rgba(15,23,43,0.12)] overflow-hidden">

            {/* Search inside dropdown */}
            <div className="px-3 pt-3 pb-2 border-b border-[#f1f5f9]">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full h-[32px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[6px] px-3 text-[13px] text-[#0f172b] placeholder:text-[#90a1b9] focus:outline-none focus:ring-1 focus:ring-[#f54900]/30"
                onClick={e => e.stopPropagation()}
              />
            </div>

            {/* Options list */}
            <div
              role="listbox"
              aria-multiselectable="true"
              className="max-h-[200px] overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-[13px] text-[#90a1b9] text-center">No options found</p>
              ) : filtered.map(opt => {
                const isSelected = value.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => { e.stopPropagation(); toggle(opt.value) }}
                    className={[
                      'flex items-center justify-between w-full px-3 py-2 text-left',
                      'text-[13px] leading-5 transition-colors',
                      isSelected
                        ? 'bg-[#fff3ee] text-[#c73b00] font-medium'
                        : 'text-[#314158] hover:bg-[#f8fafc]',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2.5">
                      {/* Avatar circle with initial */}
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                        style={{ backgroundColor: isSelected ? '#f54900' : '#90a1b9' }}
                      >
                        {opt.label.charAt(0)}
                      </span>
                      {opt.label}
                    </span>

                    {isSelected && (
                      <span className="text-[#f54900] shrink-0">
                        <IconCheck />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer — count + clear */}
            {value.length > 0 && (
              <div className="border-t border-[#f1f5f9] px-3 py-2 flex items-center justify-between">
                <span className="text-[12px] text-[#90a1b9]">
                  {value.length} selected
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange([]) }}
                  className="text-[12px] text-[#c10007] hover:text-[#a30006] font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error / hint */}
      {error && <p className="text-[#c10007] text-[12px] leading-[16px]">{error}</p>}
      {hint && !error && <p className="text-[#90a1b9] text-[12px] leading-[16px]">{hint}</p>}
    </div>
  )
}
