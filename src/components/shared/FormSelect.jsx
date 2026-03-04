// src/components/shared/FormSelect.jsx

function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="#90a1b9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function FormSelect({
  label,
  id,
  value,
  onChange,
  options = [],          // [{ value, label }]
  placeholder = 'Select…',
  required = false,
  disabled = false,
  icon: Icon,
  error,
  hint,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      {/* Label */}
      <label
        htmlFor={id}
        className="text-[#0f172b] text-[14px] font-semibold leading-[20px]"
      >
        {label}
        {required && <span className="text-[#f54900] ml-0.5">*</span>}
      </label>

      {/* Select wrapper */}
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#90a1b9] z-10">
            <Icon />
          </span>
        )}

        <select
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={[
            'w-full h-[38px] rounded-[8px] border text-[14px] leading-[20px]',
            'appearance-none',
            'pr-9 py-[9px] transition-colors',
            Icon ? 'pl-9' : 'pl-3',
            value === ''
              ? 'text-[#90a1b9]'
              : 'text-[#0f172b]',
            error
              ? 'border-[#c10007] bg-[#fef2f2] focus:outline-none focus:ring-2 focus:ring-[#c10007]/20'
              : 'border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60',
            disabled
              ? 'bg-[#f8fafc] text-[#90a1b9] cursor-not-allowed border-[#e2e8f0]'
              : 'cursor-pointer',
          ].join(' ')}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Chevron right */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <IconChevronDown />
        </span>
      </div>

      {/* Hint / Error */}
      {error  && <p className="text-[#c10007] text-[12px] leading-[16px]">{error}</p>}
      {hint && !error && <p className="text-[#90a1b9] text-[12px] leading-[16px]">{hint}</p>}
    </div>
  )
}
