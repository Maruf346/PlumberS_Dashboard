// src/components/jobs/JobsFilterBar.jsx
import SearchBar from '@/components/shared/SearchBar'

function IconFilter() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 5.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const STATUS_OPTIONS = ['All Status', 'In Progress', 'Pending', 'Completed', 'Overdue']

export default function JobsFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

      {/* Search */}
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search jobs, clients..."
      />

      {/* Status filter dropdown */}
      <div className="relative">
        <select
          value={statusFilter}
          onChange={e => onStatusChange(e.target.value)}
          className={[
            'appearance-none bg-white border border-[#e2e8f0] rounded-[10px]',
            'pl-4 pr-9 py-[9px]',
            'text-[14px] leading-[20px] text-[#314158]',
            'focus:outline-none focus:ring-2 focus:ring-[#f54900]/30 focus:border-[#f54900]/50',
            'cursor-pointer transition w-full sm:w-auto',
          ].join(' ')}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt} value={opt === 'All Status' ? '' : opt}>{opt}</option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#90a1b9]">
          <IconChevronDown />
        </span>
      </div>

      {/* Filter button */}
      <button
        className={[
          'flex items-center justify-center gap-2',
          'bg-white border border-[#e2e8f0] rounded-[10px]',
          'px-4 py-[9px]',
          'text-[14px] leading-[20px] text-[#314158] font-medium',
          'hover:bg-[#f8fafc] transition-colors whitespace-nowrap',
        ].join(' ')}
      >
        <IconFilter /> Filter
      </button>
    </div>
  )
}
