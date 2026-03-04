// src/components/shared/PersonAvatar.jsx
// Colored initial-circle avatar, shared across Managers and Staff tables/drawers.

export default function PersonAvatar({ initials, color = '#62748e', size = 'md', className = '' }) {
  const sizes = {
    sm:  'w-7 h-7 text-[11px]',
    md:  'w-9 h-9 text-[13px]',
    lg:  'w-12 h-12 text-[16px]',
    xl:  'w-16 h-16 text-[20px]',
  }
  const cls = sizes[size] ?? sizes.md

  return (
    <div
      className={`${cls} rounded-full flex items-center justify-center font-bold leading-none text-white shrink-0 select-none ${className}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}
