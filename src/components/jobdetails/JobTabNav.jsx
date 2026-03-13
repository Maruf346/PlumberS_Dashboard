// src/components/jobdetails/JobTabNav.jsx
// Updated tabs: Line Items | Safety Forms | Reports

function IconClipboard()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 3V2h5v1" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconShield()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconFileText()   { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h6l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M6 8h4M6 10.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }

const TABS = [
  { id: 'lineitems',   label: 'Line Items',    Icon: IconClipboard },
  { id: 'safetyforms', label: 'Safety Forms',  Icon: IconShield    },
  { id: 'reports',     label: 'Reports',       Icon: IconFileText  },
]

export default function JobTabNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex items-end gap-0 border-b border-[#e2e8f0] overflow-x-auto">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id
        return (
          <button key={id} onClick={() => onTabChange(id)}
            className={['flex items-center gap-2 px-6 py-[15px] text-[14px] font-medium leading-[20px]',
              'whitespace-nowrap border-b-2 transition-colors shrink-0',
              isActive ? 'border-[#f54900] text-[#f54900]' : 'border-transparent text-[#62748e] hover:text-[#0f172b] hover:border-[#e2e8f0]'].join(' ')}>
            <Icon />{label}
          </button>
        )
      })}
    </nav>
  )
}