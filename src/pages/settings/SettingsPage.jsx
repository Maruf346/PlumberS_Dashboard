// src/pages/settings/SettingsPage.jsx
// Settings hub — left nav + right content panel
// ─────────────────────────────────────────────────────────────────────────────

import { useState }     from 'react'
import ProfileTab       from './tabs/ProfileTab'
import RichContentTab   from './tabs/RichContentTab'
import FeedbackTab      from './tabs/FeedbackTab'
import IssuesTab        from './tabs/IssuesTab'
import FaqTab           from './tabs/FaqTab'
import { MOCK_TERMS, MOCK_PRIVACY, MOCK_ABOUT } from './settingsMock'

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconUser()      { return <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="8.5" cy="6" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M2.5 15c0-3.5 2.7-6 6-6s6 2.5 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IconFileText()  { return <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M4 2h7l4 4v10H4V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M11 2v4h4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 9h5M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IconShield()    { return <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 2L2 5v5c0 4 3 6.5 6.5 7.5C13 16.5 16 14 16 10V5L8.5 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> }
function IconStar()      { return <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 2l2 4 4.5.6-3.25 3.15.77 4.5L8.5 12l-4.02 2.21.77-4.5L2 6.6l4.5-.6 2-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg> }
function IconAlert()     { return <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><path d="M8.5 2L1.5 14.5h14L8.5 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M8.5 7.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8.5" cy="12.5" r="0.8" fill="currentColor"/></svg> }
function IconHelp()      { return <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 6.5c0-1.1.9-2 2-2s2 .9 2 2c0 1.5-2 1.5-2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8.5" cy="12.5" r="0.8" fill="currentColor"/></svg> }
function IconInfo()      { return <svg width="17" height="17" viewBox="0 0 17 17" fill="none"><circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8.5 8v4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8.5" cy="5.5" r="0.8" fill="currentColor"/></svg> }
function IconChev()      { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }

// ── Nav sections ──────────────────────────────────────────────────────────────
const NAV = [
  {
    group: 'Account',
    items: [
      { id: 'profile',  label: 'My Profile',         icon: IconUser,     desc: 'Update your name, phone and photo' },
    ],
  },
  {
    group: 'Content',
    items: [
      { id: 'terms',    label: 'Terms & Conditions',  icon: IconFileText, desc: 'Edit platform terms of use' },
      { id: 'privacy',  label: 'Privacy Policy',      icon: IconShield,   desc: 'Edit the privacy policy' },
      { id: 'about',    label: 'About Us',             icon: IconInfo,     desc: 'Edit the About Us content' },
      { id: 'faqs',     label: 'FAQs',                icon: IconHelp,     desc: 'Manage frequently asked questions' },
    ],
  },
  {
    group: 'Support Inbox',
    items: [
      { id: 'feedback', label: 'User Feedback',       icon: IconStar,     desc: 'View feedback submitted by users' },
      { id: 'issues',   label: 'Issue Reports',       icon: IconAlert,    desc: 'View issues reported by users' },
    ],
  },
]

const ALL_ITEMS = NAV.flatMap(g => g.items)

// ── Badge counts (replace with real data when API ready) ─────────────────────
const BADGE = { feedback: 4, issues: 3 }

export default function SettingsPage() {
  const [activeId, setActiveId] = useState('profile')
  const active = ALL_ITEMS.find(i => i.id === activeId)

  const renderContent = () => {
    switch (activeId) {
      case 'profile':  return <ProfileTab />
      case 'terms':    return <RichContentTab key="terms"   title="Terms & Conditions" getEndpoint="supports/terms/"        patchEndpoint="supports/admin/terms/"    mockData={MOCK_TERMS}   />
      case 'privacy':  return <RichContentTab key="privacy" title="Privacy Policy"     getEndpoint="supports/privacy/"      patchEndpoint="supports/admin/privacy/"  mockData={MOCK_PRIVACY} />
      case 'about':    return <RichContentTab key="about"   title="About Us"           getEndpoint="supports/about-us/"     patchEndpoint="supports/admin/about-us/" mockData={MOCK_ABOUT}   />
      case 'faqs':     return <FaqTab />
      case 'feedback': return <FeedbackTab />
      case 'issues':   return <IssuesTab />
      default:         return null
    }
  }

  return (
    <div className="flex gap-0 min-h-full">

      {/* ── Left nav ── */}
      <div className="w-[240px] shrink-0 border-r border-[#e2e8f0] bg-white flex flex-col py-6 gap-6">
        {/* Page title */}
        <div className="px-5">
          <h1 className="text-[#0f172b] font-bold text-[20px] leading-[26px]">Settings</h1>
          <p className="text-[#90a1b9] text-[12px] mt-0.5">Manage your platform</p>
        </div>

        {/* Nav groups */}
        <nav className="flex flex-col gap-5 px-3">
          {NAV.map(group => (
            <div key={group.group}>
              <p className="text-[10px] font-bold text-[#90a1b9] uppercase tracking-[0.7px] px-3 mb-1.5">{group.group}</p>
              {group.items.map(item => {
                const Icon    = item.icon
                const isActive = item.id === activeId
                const badge   = BADGE[item.id]
                return (
                  <button key={item.id} onClick={() => setActiveId(item.id)}
                    className={[
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-[9px] text-left transition-all',
                      isActive
                        ? 'bg-[#fff4ee] text-[#f54900]'
                        : 'text-[#62748e] hover:bg-[#f8fafc] hover:text-[#314158]',
                    ].join(' ')}>
                    <span className="shrink-0"><Icon /></span>
                    <span className="flex-1 text-[13px] font-semibold leading-[18px]">{item.label}</span>
                    {badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#f54900] text-white' : 'bg-[#f1f5f9] text-[#62748e]'}`}>
                        {badge}
                      </span>
                    )}
                    {isActive && <span className="shrink-0"><IconChev /></span>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* ── Right content ── */}
      <div className="flex-1 min-w-0 overflow-y-auto p-8 bg-[#f8fafc]">
        {/* Section header */}
        <div className="mb-7">
          <h2 className="text-[#0f172b] font-bold text-[22px] leading-[30px]">{active?.label}</h2>
          <p className="text-[#62748e] text-[14px] mt-0.5">{active?.desc}</p>
        </div>

        {renderContent()}
      </div>
    </div>
  )
}