// src/components/shared/FormSectionHeader.jsx

export default function FormSectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-[#f1f5f9]">
      {Icon && (
        <span className="text-[#62748e] shrink-0">
          <Icon />
        </span>
      )}
      <h3 className="text-[#0f172b] font-bold text-[15px] leading-[20px]">{title}</h3>
    </div>
  )
}
