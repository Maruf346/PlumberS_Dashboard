// src/pages/errors/NotFoundPage.jsx
// Professional 404 page — shown for any unmatched /admin/* route
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate, useLocation, Link } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const badPath   = location.pathname

  return (
    <div className="min-h-full flex items-center justify-center p-8">
      <div className="flex flex-col items-center text-center max-w-[480px] gap-6">

        {/* Illustration */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-[#f8fafc] border-2 border-[#e2e8f0] flex items-center justify-center">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="24" stroke="#e2e8f0" strokeWidth="2.5"/>
              <path d="M22 34L34 22M34 22l-4-1 1-4M22 34l-4-1 1-4" stroke="#cad5e2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M26 20c0-1.105.895-2 2-2h0a4 4 0 014 4c0 2-2 3-2 5" stroke="#f54900" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="28" cy="32" r="1.4" fill="#f54900"/>
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 bg-[#f54900] text-white text-[12px] font-black px-2.5 py-1 rounded-full shadow-[0_2px_8px_rgba(245,73,0,0.4)] leading-none">
            404
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[#0f172b] font-black text-[32px] leading-[38px] tracking-tight">
            Page not found
          </h1>
          <p className="text-[#62748e] text-[15px] leading-[22px]">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="mt-1 inline-flex items-center gap-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] px-3 py-2 self-center">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1" y="2" width="11" height="9" rx="1.2" stroke="#90a1b9" strokeWidth="1"/>
              <path d="M3.5 5h2M3.5 7h5M3.5 9h3.5" stroke="#90a1b9" strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <code className="text-[12px] text-[#f54900] font-mono break-all">{badPath}</code>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-[10px] rounded-[10px] border border-[#e2e8f0] bg-white text-[#314158] text-[14px] font-semibold hover:bg-[#f8fafc] transition-colors">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M9 3L4.5 7.5 9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go back
          </button>
          <Link to="/admin/dashboard"
            className="flex items-center gap-2 px-5 py-[10px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0_1px_3px_rgba(245,73,0,0.3)]">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="white" strokeWidth="1.3"/>
              <rect x="8.5" y="1.5" width="5" height="5" rx="1" stroke="white" strokeWidth="1.3"/>
              <rect x="1.5" y="8.5" width="5" height="5" rx="1" stroke="white" strokeWidth="1.3"/>
              <rect x="8.5" y="8.5" width="5" height="5" rx="1" stroke="white" strokeWidth="1.3"/>
            </svg>
            Go to Dashboard
          </Link>
        </div>

        {/* Quick nav links */}
        <div className="pt-2 border-t border-[#f1f5f9] w-full">
          <p className="text-[11px] text-[#90a1b9] font-semibold uppercase tracking-[0.5px] mb-3">Quick Links</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { to: '/admin/jobs',     label: 'Jobs' },
              { to: '/admin/clients',  label: 'Clients' },
              { to: '/admin/staff',    label: 'Staff' },
              { to: '/admin/fleet',    label: 'Fleet' },
              { to: '/admin/settings', label: 'Settings' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="px-3 py-1.5 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[#314158] text-[12px] font-medium hover:bg-[#f1f5f9] transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
