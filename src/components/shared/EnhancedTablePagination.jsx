// src/components/shared/EnhancedTablePagination.jsx
// Accepts both pageSizeOptions and pageSizes prop names (either works).
// Accepts both totalCount and totalResults prop names (either works).
// Accepts both page and currentPage prop names (either works).

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

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push('…')
    pages.push(total)
  } else if (current >= total - 3) {
    pages.push(1)
    pages.push('…')
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push('…')
    for (let i = current - 1; i <= current + 1; i++) pages.push(i)
    pages.push('…')
    pages.push(total)
  }
  return pages
}

export default function EnhancedTablePagination({
  // Accept either prop name for current page
  page,
  currentPage,
  totalPages,
  // Accept either prop name for total results
  totalCount,
  totalResults,
  pageSize,
  // Accept either prop name for page size options
  pageSizeOptions,
  pageSizes,
  onPageChange,
  onPageSizeChange,
}) {
  // Resolve aliased props — whichever is provided
  const resolvedPage    = currentPage ?? page ?? 1
  const resolvedTotal   = totalResults ?? totalCount ?? 0
  const resolvedOptions = pageSizeOptions ?? pageSizes ?? [5, 10, 15, 20]

  const start = totalResults === 0 ? 0 : (resolvedPage - 1) * pageSize + 1
  const end   = Math.min(resolvedPage * pageSize, resolvedTotal)
  const pages = getPageNumbers(resolvedPage, totalPages)

  const btnBase = 'inline-flex items-center justify-center min-w-[32px] h-8 px-1 rounded-[6px] text-[13px] font-medium transition-colors select-none'

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-[#f1f5f9]">

      {/* Results info + page size */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[#62748e] text-[13px] leading-[20px] whitespace-nowrap">
          {resolvedTotal === 0
            ? 'No results'
            : <>Showing <span className="font-semibold text-[#0f172b]">{start}–{end}</span> of{' '}
              <span className="font-semibold text-[#0f172b]">{resolvedTotal}</span></>
          }
        </p>

        {/* Page size selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#90a1b9] text-[12px]">Per page:</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange?.(Number(e.target.value))}
            className="h-[28px] bg-white border border-[#e2e8f0] rounded-[6px] px-2 text-[12px] text-[#314158] focus:outline-none focus:ring-1 focus:ring-[#f54900]/30 cursor-pointer"
          >
            {resolvedOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          onClick={() => onPageChange?.(resolvedPage - 1)}
          disabled={resolvedPage === 1}
          className={`${btnBase} border border-[#e2e8f0] gap-0.5 px-2 ${
            resolvedPage === 1
              ? 'text-[#cad5e2] cursor-not-allowed bg-white'
              : 'text-[#314158] bg-white hover:bg-[#f8fafc] cursor-pointer'
          }`}
        >
          <IconChevronLeft /> Prev
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="inline-flex items-center justify-center w-8 h-8 text-[#90a1b9] text-[13px] select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange?.(p)}
              className={`${btnBase} ${
                p === resolvedPage
                  ? 'bg-[#0f172b] text-white'
                  : 'text-[#45556c] hover:bg-[#f8fafc] border border-transparent hover:border-[#e2e8f0] cursor-pointer'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange?.(resolvedPage + 1)}
          disabled={resolvedPage === totalPages}
          className={`${btnBase} border border-[#e2e8f0] gap-0.5 px-2 ${
            resolvedPage === totalPages
              ? 'text-[#cad5e2] cursor-not-allowed bg-white'
              : 'text-[#314158] bg-white hover:bg-[#f8fafc] cursor-pointer'
          }`}
        >
          Next <IconChevronRight />
        </button>
      </div>
    </div>
  )
}