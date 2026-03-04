// src/components/people/PeopleEmptyState.jsx

function PeopleIllustration() {
  return (
    <svg width="110" height="90" viewBox="0 0 110 90" fill="none" aria-hidden="true">
      {/* Background circles */}
      <circle cx="55" cy="45" r="38" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5"/>
      {/* Center person */}
      <circle cx="55" cy="36" r="10" fill="#e2e8f0"/>
      <path d="M34 66c0-11.598 9.402-18 21-18s21 6.402 21 18" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
      {/* Side people - smaller */}
      <circle cx="22" cy="42" r="7" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1"/>
      <path d="M8 62c0-7.732 6.268-12 14-12" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="88" cy="42" r="7" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1"/>
      <path d="M102 62c0-7.732-6.268-12-14-12" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Plus badge */}
      <circle cx="76" cy="26" r="10" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
      <path d="M76 21v10M71 26h10" stroke="#f54900" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

export default function PeopleEmptyState({ type = 'manager', hasFilters, onClear, onAdd }) {
  const label = type === 'manager' ? 'manager' : 'staff member'
  const labelPlural = type === 'manager' ? 'managers' : 'staff'

  return (
    <tr>
      <td colSpan={10} className="py-20 px-6">
        <div className="flex flex-col items-center justify-center gap-4 max-w-xs mx-auto text-center">
          <PeopleIllustration />

          <div>
            <p className="text-[#0f172b] font-bold text-[17px] leading-[26px]">
              {hasFilters ? `No ${labelPlural} match your filters` : `No ${labelPlural} yet`}
            </p>
            <p className="text-[#90a1b9] text-[14px] leading-[20px] mt-1">
              {hasFilters
                ? 'Try adjusting your search or filter criteria.'
                : `Add your first ${label} to get started with team management.`}
            </p>
          </div>

          {hasFilters ? (
            <button
              onClick={onClear}
              className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] transition-colors"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-[9px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold rounded-[10px] transition-colors"
            >
              <IconPlus />
              Add {type === 'manager' ? 'Manager' : 'Staff'}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
