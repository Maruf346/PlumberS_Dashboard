// src/components/jobs/JobsListFilters.jsx — updated for API manager options

function IconSearch()       { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#90a1b9" strokeWidth="1.3"/><path d="M10.5 10.5l3 3" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IconChevronDown()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 5.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconCalendar()     { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="11" rx="1.5" stroke="#62748e" strokeWidth="1.1"/><path d="M4.5 1v2.5M9.5 1v2.5M1 5.5h12" stroke="#62748e" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconX()            { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="#62748e" strokeWidth="1.3" strokeLinecap="round"/></svg> }

function FilterSelect({ value, onChange, options, placeholder, icon: Icon }) {
  return (
    <div className="relative">
      {Icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><Icon /></span>}
      <select value={value} onChange={e => onChange(e.target.value)}
        className={['h-[38px] appearance-none bg-white border border-[#e2e8f0] rounded-[8px]',
          'pr-8 py-[9px] text-[13px] transition-colors cursor-pointer',
          Icon ? 'pl-8' : 'pl-3',
          value ? 'text-[#0f172b]' : 'text-[#90a1b9]',
          'focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50 w-full sm:w-auto'].join(' ')}>
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#90a1b9]"><IconChevronDown /></span>
    </div>
  )
}

const STATUS_OPTS = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending',     label: 'Pending'      },
  { value: 'completed',   label: 'Completed'    },
  { value: 'overdue',     label: 'Overdue'      },
]

const DATE_OPTS = [
  { value: 'today',      label: 'Today'      },
  { value: 'this-week',  label: 'This Week'  },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
]

export default function JobsListFilters({
  search, onSearchChange, status, onStatusChange,
  manager, onManagerChange, dateFilter, onDateChange,
  managerOptions, hasActiveFilters, onClearFilters,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">

      <div className="relative flex-1 min-w-[200px] sm:max-w-[340px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"><IconSearch /></span>
        <input type="text" value={search} onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by Job ID, name, or client…"
          className="w-full h-[38px] bg-white border border-[#e2e8f0] rounded-[8px] pl-9 pr-3 text-[13px] text-[#0f172b] placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50 transition-colors" />
      </div>

      <FilterSelect value={status}     onChange={onStatusChange}  options={STATUS_OPTS}    placeholder="Status"  />
      {/* Manager filter — commented out: backend assigned_to param filters by employee UUID, not manager UUID
      <FilterSelect value={manager}    onChange={onManagerChange} options={managerOptions} placeholder="Manager" />
      */}
      {/* Date filter commented out — backend 'date' param expects YYYY-MM-DD (single day), not range keywords like 'this-week'.
           Re-enable when backend supports date range params (e.g. scheduled_date_after / scheduled_date_before).
      <FilterSelect value={dateFilter} onChange={onDateChange} options={DATE_OPTS} placeholder="Date" icon={IconCalendar} />
      */}

      {hasActiveFilters && (
        <button onClick={onClearFilters}
          className="flex items-center gap-1.5 h-[38px] px-3 rounded-[8px] border border-[#e2e8f0] bg-white text-[#62748e] text-[13px] font-medium hover:bg-[#f8fafc] transition-colors whitespace-nowrap">
          <IconX /> Clear Filters
        </button>
      )}
    </div>
  )
}
