// src/components/shared/StatCard.jsx

export default function StatCard({ label, value, badge, badgeVariant = 'blue', icon }) {
  const badgeStyles = {
    blue:   'bg-[#eff6ff] text-[#1447e6]',
    green:  'bg-[#f0fdf4] text-[#008236]',
    orange: 'bg-[#fff7ed] text-[#ca3500]',
    red:    'bg-[#fef2f2] text-[#c10007]',
    gray:   'bg-[#f1f5f9] text-[#45556c]',
  }

  const iconBgStyles = {
    blue:   'bg-[#eff6ff]',
    green:  'bg-[#f0fdf4]',
    orange: 'bg-[#fff7ed]',
    red:    'bg-[#fef2f2]',
    gray:   'bg-[#f1f5f9]',
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] flex items-start justify-between pt-[21px] pb-[1px] px-[21px] min-w-0">
      {/* Left: label + value + badge */}
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-[#62748e] text-[14px] leading-[20px] whitespace-nowrap">{label}</p>
        <div className="flex items-end gap-2 flex-wrap">
          <span className="text-[#0f172b] font-bold text-[30px] leading-[36px]">{value}</span>
          {badge && (
            <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[12px] leading-[16px] mb-1 whitespace-nowrap ${badgeStyles[badgeVariant]}`}>
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Right: icon box */}
      {icon && (
        <div className={`rounded-[10px] w-9 h-9 flex items-center justify-center shrink-0 ml-2 ${iconBgStyles[badgeVariant]}`}>
          {icon}
        </div>
      )}
    </div>
  )
}
