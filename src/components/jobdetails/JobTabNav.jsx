// src/components/jobdetails/JobTabNav.jsx

function IconClipboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 1h6v4H5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconImage() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="5.5" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1.5 11l4-3 3 3 2-2 3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconMessageSquare() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2h12v10H9l-4 3v-3H2V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}

const TABS = [
  { id: 'scope',  label: 'Job Scope & Checklist',   Icon: IconClipboard   },
  { id: 'files',  label: 'Files & Photos',           Icon: IconImage       },
  { id: 'notes',  label: 'Notes & Communications',   Icon: IconMessageSquare },
]

export default function JobTabNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex items-end gap-0 border-b border-[#e2e8f0] overflow-x-auto">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={[
              'flex items-center gap-2 px-6 py-[15px] text-[14px] font-medium leading-[20px]',
              'whitespace-nowrap border-b-2 transition-colors shrink-0',
              isActive
                ? 'border-[#f54900] text-[#f54900]'
                : 'border-transparent text-[#62748e] hover:text-[#0f172b] hover:border-[#e2e8f0]',
            ].join(' ')}
          >
            <Icon />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
