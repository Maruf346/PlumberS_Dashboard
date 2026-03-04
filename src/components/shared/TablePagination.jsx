// src/components/shared/TablePagination.jsx

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function TablePagination({
  currentPage,
  totalPages,
  totalResults,
  resultsPerPage,
  onPrev,
  onNext,
}) {
  const start = (currentPage - 1) * resultsPerPage + 1
  const end   = Math.min(currentPage * resultsPerPage, totalResults)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#f1f5f9]">
      {/* Results count */}
      <p className="text-[#62748e] text-[14px] leading-[20px]">
        Showing <span className="font-semibold text-[#0f172b]">{start}–{end}</span> of{' '}
        <span className="font-semibold text-[#0f172b]">{totalResults}</span> results
      </p>

      {/* Prev / Next */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className={[
            'flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] text-[14px] leading-[20px] font-medium',
            'border border-[#e2e8f0] transition-colors',
            currentPage === 1
              ? 'text-[#cad5e2] cursor-not-allowed bg-white'
              : 'text-[#314158] bg-white hover:bg-[#f8fafc] cursor-pointer',
          ].join(' ')}
        >
          <IconChevronLeft /> Previous
        </button>

        {/* Page indicator */}
        <span className="px-3 py-[7px] rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] text-[14px] font-semibold text-[#0f172b] min-w-[36px] text-center">
          {currentPage}
        </span>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className={[
            'flex items-center gap-1.5 px-3 py-[7px] rounded-[8px] text-[14px] leading-[20px] font-medium',
            'border border-[#e2e8f0] transition-colors',
            currentPage === totalPages
              ? 'text-[#cad5e2] cursor-not-allowed bg-white'
              : 'text-[#314158] bg-white hover:bg-[#f8fafc] cursor-pointer',
          ].join(' ')}
        >
          Next <IconChevronRight />
        </button>
      </div>
    </div>
  )
}
