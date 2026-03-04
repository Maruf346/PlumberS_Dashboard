// src/components/jobs/JobsEmptyState.jsx
import { Link } from 'react-router-dom'

function EmptyIllustration() {
  return (
    <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
      {/* clipboard body */}
      <rect x="20" y="16" width="80" height="72" rx="6" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1.5"/>
      {/* clipboard header */}
      <rect x="38" y="10" width="44" height="18" rx="4" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1.2"/>
      {/* lines */}
      <rect x="32" y="42" width="40" height="4" rx="2" fill="#cbd5e1"/>
      <rect x="32" y="54" width="56" height="4" rx="2" fill="#e2e8f0"/>
      <rect x="32" y="66" width="32" height="4" rx="2" fill="#e2e8f0"/>
      {/* search magnifier */}
      <circle cx="84" cy="68" r="14" fill="white" stroke="#e2e8f0" strokeWidth="1.5"/>
      <circle cx="84" cy="66" r="7" stroke="#cbd5e1" strokeWidth="2"/>
      <path d="M89 71l5 5" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
      {/* small orange dot */}
      <circle cx="60" cy="88" r="3" fill="#f54900" opacity="0.3"/>
      <circle cx="50" cy="88" r="2" fill="#f54900" opacity="0.2"/>
      <circle cx="70" cy="88" r="2" fill="#f54900" opacity="0.2"/>
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

export default function JobsEmptyState({ hasFilters, onClear }) {
  return (
    <tr>
      <td colSpan={10} className="py-20 px-6">
        <div className="flex flex-col items-center justify-center gap-4 max-w-sm mx-auto text-center">
          <EmptyIllustration />

          <div>
            <p className="text-[#0f172b] font-bold text-[18px] leading-[28px]">
              {hasFilters ? 'No jobs match your filters' : 'No jobs yet'}
            </p>
            <p className="text-[#90a1b9] text-[14px] leading-[20px] mt-1">
              {hasFilters
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first job to get started with assignment tracking.'}
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
            <Link
              to="/admin/create-job"
              className="inline-flex items-center gap-2 px-4 py-[9px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold rounded-[10px] transition-colors"
            >
              <IconPlus />
              Create New Job
            </Link>
          )}
        </div>
      </td>
    </tr>
  )
}
