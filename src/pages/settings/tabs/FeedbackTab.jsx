// src/pages/settings/tabs/FeedbackTab.jsx
// User Feedback — list + detail drawer + delete
//
// APIs (commented out):
//   GET    /api/supports/feedback/        → paginated list
//   GET    /api/supports/feedback/{id}/   → detail
//   DELETE /api/supports/feedback/{id}/delete/
// To disable mock: remove MOCK_FEEDBACK import, uncomment API blocks
import { useState } from 'react'
import { MOCK_FEEDBACK } from '../settingsMock'

function IconMail()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1.3" stroke="#90a1b9" strokeWidth="1.1"/><path d="M1 5l6 3.5L13 5" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconGlobe()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#90a1b9" strokeWidth="1.1"/><path d="M7 1.5C7 1.5 5 4 5 7s2 5.5 2 5.5M7 1.5C7 1.5 9 4 9 7s-2 5.5-2 5.5M1.5 7h11" stroke="#90a1b9" strokeWidth="1.1"/></svg> }
function IconTrash()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M3 4l.8 8h6.4L11 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconChev()    { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconX()       { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 3l9 9M12 3L3 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconPhone()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 1.5h2.8l1.4 3-1.6 1.1C6 7.5 6.5 8 8.4 9.6L9.6 8l3 1.4v2.5c0 .5-3.5-.8-6-3.3S2 2.2 2.5 1.5z" stroke="#90a1b9" strokeWidth="1.1" strokeLinejoin="round"/></svg> }

function DetailDrawer({ item, onClose, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#0f172b]/30 backdrop-blur-[2px]" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-[480px] bg-white h-full flex flex-col shadow-[-4px_0_32px_rgba(15,23,43,0.12)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] shrink-0">
          <h3 className="text-[#0f172b] font-bold text-[17px]">Feedback Detail</h3>
          <button onClick={onClose} className="text-[#90a1b9] hover:text-[#314158] transition-colors"><IconX /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Sender info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#eff6ff] flex items-center justify-center shrink-0">
              <span className="text-[#3b82f6] font-bold text-[15px]">{item.first_name[0]}{item.last_name[0]}</span>
            </div>
            <div>
              <p className="text-[#0f172b] font-bold text-[15px]">{item.first_name} {item.last_name}</p>
              <p className="text-[#62748e] text-[12px]">{new Date(item.created_at).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: IconMail, label:'Email',    val: item.email },
              { icon: IconPhone,label:'Phone',    val: item.phone },
              { icon: IconGlobe,label:'Country',  val: item.country },
              { icon: IconGlobe,label:'Language', val: item.language },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-start gap-2 p-3 bg-[#f8fafc] rounded-[10px] border border-[#f1f5f9]">
                <Icon /><div><p className="text-[10px] text-[#90a1b9] font-semibold uppercase tracking-[0.4px]">{label}</p><p className="text-[13px] text-[#0f172b] font-medium mt-0.5 break-all">{val || '—'}</p></div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#90a1b9] uppercase tracking-[0.4px] mb-2">Message</p>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-4">
              <p className="text-[14px] text-[#314158] leading-[22px]">{item.message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#e2e8f0] shrink-0">
          {!confirming
            ? <button onClick={() => setConfirming(true)} className="flex items-center gap-2 w-full justify-center py-2.5 rounded-[10px] border border-[#fecaca] text-[#c10007] text-[13px] font-semibold hover:bg-[#fef2f2] transition-colors"><IconTrash /> Delete Feedback</button>
            : <div className="flex flex-col gap-2">
                <p className="text-[13px] text-[#62748e] text-center">Are you sure you want to delete this feedback?</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirming(false)} className="flex-1 py-2.5 rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[13px] font-semibold hover:bg-[#f8fafc] transition-colors">Cancel</button>
                  <button onClick={() => onDelete(item.id)} className="flex-1 py-2.5 rounded-[10px] bg-[#c10007] text-white text-[13px] font-semibold hover:bg-[#9b0005] transition-colors">Yes, Delete</button>
                </div>
              </div>
          }
        </div>
      </div>
    </div>
  )
}

export default function FeedbackTab() {
  const [items,    setItems]    = useState(MOCK_FEEDBACK)
  const [selected, setSelected] = useState(null)

  const handleDelete = (id) => {
    // // API: DELETE /api/supports/feedback/{id}/delete/
    // await fetch(`${import.meta.env.VITE_API_BASE_URL}supports/feedback/${id}/delete/`, { method: 'DELETE' })
    setItems(p => p.filter(i => i.id !== id))
    setSelected(null)
  }

  return (
    <>
      {selected && <DetailDrawer item={selected} onClose={() => setSelected(null)} onDelete={handleDelete}/>}
      <div className="max-w-[800px] flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[#62748e] text-[13px]">{items.length} feedback submission{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden">
          {items.length === 0
            ? <div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-[#90a1b9] text-[14px]">No feedback submissions yet.</p></div>
            : items.map((item, idx) => (
              <button key={item.id} onClick={() => setSelected(item)}
                className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-[#f8fafc] transition-colors text-left ${idx > 0 ? 'border-t border-[#f1f5f9]' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-[#eff6ff] flex items-center justify-center shrink-0">
                  <span className="text-[#3b82f6] font-bold text-[12px]">{item.first_name[0]}{item.last_name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0f172b] font-semibold text-[14px] truncate">{item.first_name} {item.last_name}</p>
                  <p className="text-[#90a1b9] text-[12px] truncate">{item.email} · {item.country}</p>
                </div>
                <span className="text-[11px] text-[#90a1b9] shrink-0">{new Date(item.created_at).toLocaleDateString('en-AU', { day:'numeric', month:'short' })}</span>
                <IconChev />
              </button>
            ))
          }
        </div>
      </div>
    </>
  )
}
