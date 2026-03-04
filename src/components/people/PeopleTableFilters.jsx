// src/components/people/PeopleTableFilters.jsx
// Search + status dropdown + clear — reused by ManagersPage and StaffPage.

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="#90a1b9" strokeWidth="1.3"/>
      <path d="M10.5 10.5l3 3" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 5.5l3.5 3.5 3.5-3.5" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="#62748e" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

const STATUS_OPTIONS = [
  { value: 'Active',   label: 'Active'   },
  { value: 'Inactive', label: 'Inactive' },
]

export default function PeopleTableFilters({
  search, onSearchChange,
  status, onStatusChange,
  hasActiveFilters,
  onClearFilters,
  searchPlaceholder = 'Search by name, email or phone...',
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">

      {/* Search */}
      <div className="relative flex-1 min-w-[200px] sm:max-w-[320px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <IconSearch />
        </span>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={[
            'w-full h-[38px] bg-white border border-[#e2e8f0] rounded-[8px]',
            'pl-9 pr-3 text-[13px] leading-[20px] text-[#0f172b]',
            'placeholder:text-[#90a1b9]',
            'focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50',
            'transition-colors',
          ].join(' ')}
        />
      </div>

      {/* Status */}
      <div className="relative">
        <select
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className={[
            'h-[38px] appearance-none bg-white border border-[#e2e8f0] rounded-[8px]',
            'pl-3 pr-8 text-[13px] leading-[20px] transition-colors cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50',
            'w-full sm:w-auto',
            status ? 'text-[#0f172b]' : 'text-[#90a1b9]',
          ].join(' ')}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <IconChevronDown />
        </span>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 h-[38px] px-3 rounded-[8px] border border-[#e2e8f0] bg-white text-[#62748e] text-[13px] font-medium hover:bg-[#f8fafc] transition-colors whitespace-nowrap"
        >
          <IconX />
          Clear Filters
        </button>
      )}
    </div>
  )
}
