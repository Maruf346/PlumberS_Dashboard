// src/components/shared/SearchBar.jsx

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="#90a1b9" strokeWidth="1.3"/>
      <path d="M10.5 10.5l3 3" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <IconSearch />
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          'bg-white border border-[#e2e8f0] rounded-[10px]',
          'pl-9 pr-4 py-[9px]',
          'text-[14px] leading-[20px] text-[#0f172b]',
          'placeholder:text-[#90a1b9]',
          'w-full sm:w-[280px]',
          'focus:outline-none focus:ring-2 focus:ring-[#f54900]/30 focus:border-[#f54900]/50',
          'transition',
        ].join(' ')}
      />
    </div>
  )
}
