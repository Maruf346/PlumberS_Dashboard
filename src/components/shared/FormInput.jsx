// src/components/shared/FormInput.jsx

export default function FormInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
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

      {/* Input wrapper */}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#90a1b9]">
            <Icon />
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={[
            'w-full h-[38px] rounded-[8px] border text-[14px] leading-[20px] text-[#0f172b]',
            'placeholder:text-[#90a1b9]',
            'transition-colors',
            Icon ? 'pl-9 pr-3' : 'px-3',
            'py-[9px]',
            error
              ? 'border-[#c10007] bg-[#fef2f2] focus:outline-none focus:ring-2 focus:ring-[#c10007]/20'
              : 'border-[#e2e8f0] bg-white focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60',
            disabled
              ? 'bg-[#f8fafc] text-[#90a1b9] cursor-not-allowed border-[#e2e8f0]'
              : '',
          ].join(' ')}
        />
      </div>

      {/* Hint / Error */}
      {error  && <p className="text-[#c10007] text-[12px] leading-[16px]">{error}</p>}
      {hint && !error && <p className="text-[#90a1b9] text-[12px] leading-[16px]">{hint}</p>}
    </div>
  )
}
