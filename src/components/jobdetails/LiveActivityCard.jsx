// src/components/jobdetails/LiveActivityCard.jsx

function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="#62748e" strokeWidth="1.2"/>
      <path d="M8 4.5V8l2.5 2" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export default function LiveActivityCard({ activity }) {
  const done  = activity.filter(a => a.done)
  const total = activity.length

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden h-full flex flex-col">

      {/* ── Card header ── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2">
          <IconClock />
          <h3 className="text-[#0f172b] font-bold text-[16px] leading-[27px]">Live Activity</h3>
        </div>
        {/* Live badge */}
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse shrink-0" />
          <span className="text-[13px] font-semibold text-[#22c55e] leading-[16px]">Live</span>
        </span>
      </div>

      {/* ── Timeline ── */}
      <div className="flex-1 px-5 py-5 overflow-y-auto">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-[10px] bottom-[10px] w-px bg-[#e2e8f0]" />

          <div className="flex flex-col gap-0">
            {activity.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                {/* Dot */}
                <div className={[
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10',
                  item.done
                    ? 'bg-[#f54900]'
                    : 'bg-[#f1f5f9] border-2 border-[#e2e8f0]',
                ].join(' ')}>
                  {item.done ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#cad5e2]" />
                  )}
                </div>

                {/* Content */}
                <div className="pt-2 min-w-0">
                  <p className={`text-[14px] leading-[20px] font-medium ${item.done ? 'text-[#0f172b]' : 'text-[#62748e]'}`}>
                    {item.event}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[12px] leading-[16px] text-[#62748e] font-['Consolas',monospace]">
                      {item.time}
                    </span>
                    <span className="text-[#cad5e2] text-[12px]">•</span>
                    <span className="text-[#90a1b9] text-[12px] leading-[16px]">{item.actor}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── View full log button ── */}
      <div className="border-t border-[#f1f5f9] px-4 py-4">
        <button className="w-full text-[#314158] text-[14px] font-medium leading-[20px] py-[9px] rounded-[10px] bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors">
          View Full Log
        </button>
      </div>
    </div>
  )
}
