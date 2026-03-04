// src/components/shared/PageHeader.jsx

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Title + subtitle */}
      <div>
        <h1 className="text-[#0f172b] font-bold text-[24px] leading-[32px]">{title}</h1>
        {subtitle && (
          <p className="text-[#62748e] text-[14px] leading-[20px] mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Action buttons slot */}
      {children && (
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}
