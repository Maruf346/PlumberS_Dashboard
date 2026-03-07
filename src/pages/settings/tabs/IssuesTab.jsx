// src/pages/settings/tabs/IssuesTab.jsx
// Issue Reports — list + detail drawer + delete
//
// APIs (commented out):
//   GET    /api/supports/issues/        → paginated list
//   GET    /api/supports/issues/{id}/   → detail
//   DELETE /api/supports/issues/{id}/delete/
import { useState } from 'react'
import { MOCK_ISSUES } from '../settingsMock'

function IconTrash()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M3 4l.8 8h6.4L11 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconChev()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconX()      { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 3l9 9M12 3L3 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconMail()   { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="3" width="11" height="7" rx="1.2" stroke="#90a1b9" strokeWidth="1.1"/><path d="M1 5l5.5 3L12 5" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/></svg> }
function IconPhoto()  { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="9" rx="1.3" stroke="#90a1b9" strokeWidth="1.1"/><circle cx="4.5" cy="5.5" r="1.2" stroke="#90a1b9" strokeWidth="1.1"/><path d="M1 9l3-3 2 2 2-2 4 4" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconAlert()  { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L1.5 13.5h13L8 2z" stroke="#f54900" strokeWidth="1.2" strokeLinejoin="round"/><path d="M8 7v3" stroke="#f54900" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.7" fill="#f54900"/></svg> }

function DetailDrawer({ item, onClose, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const photos = [item.photo_1, item.photo_2, item.photo_3, item.photo_4, item.photo_5].filter(Boolean)
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#0f172b]/30 backdrop-blur-[2px]" onClick={onClose}/>
      <div className="relative z-10 w-full max-w-[500px] bg-white h-full flex flex-col shadow-[-4px_0_32px_rgba(15,23,43,0.12)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] shrink-0">
          <h3 className="text-[#0f172b] font-bold text-[17px]">Issue Report</h3>
          <button onClick={onClose} className="text-[#90a1b9] hover:text-[#314158]"><IconX /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#fff7ed] border border-[#fed7aa] rounded-full mb-3">
              <IconAlert /><span className="text-[11px] font-semibold text-[#c73b00]">Issue Report</span>
            </div>
            <h4 className="text-[#0f172b] font-bold text-[17px] leading-[24px]">{item.title}</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-3 bg-[#f8fafc] rounded-[10px] border border-[#f1f5f9]">
              <span className="mt-0.5"><IconMail /></span>
              <div><p className="text-[10px] text-[#90a1b9] font-semibold uppercase tracking-[0.4px]">Submitted By</p><p className="text-[13px] text-[#0f172b] font-medium mt-0.5">{item.submitted_by}</p></div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-[#f8fafc] rounded-[10px] border border-[#f1f5f9]">
              <span className="mt-0.5"><IconMail /></span>
              <div><p className="text-[10px] text-[#90a1b9] font-semibold uppercase tracking-[0.4px]">Email</p><p className="text-[13px] text-[#0f172b] font-medium mt-0.5 break-all">{item.submitted_by_email}</p></div>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#90a1b9] uppercase tracking-[0.4px] mb-2">Description</p>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-4">
              <p className="text-[14px] text-[#314158] leading-[22px]">{item.description}</p>
            </div>
          </div>
          {photos.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold text-[#90a1b9] uppercase tracking-[0.4px] mb-2 flex items-center gap-1.5"><IconPhoto />{photos.length} Attached Photo{photos.length > 1 ? 's' : ''}</p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((src, i) => <img key={i} src={src} alt={`photo ${i+1}`} className="w-full aspect-square rounded-[8px] object-cover border border-[#e2e8f0]"/>)}
              </div>
            </div>
          )}
          {photos.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-[#f8fafc] rounded-[10px] border border-[#f1f5f9]">
              <IconPhoto /><p className="text-[12px] text-[#90a1b9]">No photos attached to this report.</p>
            </div>
          )}
          <p className="text-[11px] text-[#90a1b9]">Submitted {new Date(item.created_at).toLocaleDateString('en-AU', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
        </div>
        <div className="px-6 py-4 border-t border-[#e2e8f0] shrink-0">
          {!confirming
            ? <button onClick={() => setConfirming(true)} className="flex items-center gap-2 w-full justify-center py-2.5 rounded-[10px] border border-[#fecaca] text-[#c10007] text-[13px] font-semibold hover:bg-[#fef2f2] transition-colors"><IconTrash /> Delete Report</button>
            : <div className="flex flex-col gap-2">
                <p className="text-[13px] text-[#62748e] text-center">Are you sure you want to delete this issue report?</p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirming(false)} className="flex-1 py-2.5 rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[13px] font-semibold hover:bg-[#f8fafc]">Cancel</button>
                  <button onClick={() => onDelete(item.id)} className="flex-1 py-2.5 rounded-[10px] bg-[#c10007] text-white text-[13px] font-semibold hover:bg-[#9b0005]">Yes, Delete</button>
                </div>
              </div>
          }
        </div>
      </div>
    </div>
  )
}

export default function IssuesTab() {
  const [items,    setItems]    = useState(MOCK_ISSUES)
  const [selected, setSelected] = useState(null)

  const handleDelete = (id) => {
    // // API: DELETE /api/supports/issues/{id}/delete/
    // await fetch(`${import.meta.env.VITE_API_BASE_URL}supports/issues/${id}/delete/`, { method: 'DELETE' })
    setItems(p => p.filter(i => i.id !== id))
    setSelected(null)
  }

  return (
    <>
      {selected && <DetailDrawer item={selected} onClose={() => setSelected(null)} onDelete={handleDelete}/>}
      <div className="max-w-[800px] flex flex-col gap-4">
        <p className="text-[#62748e] text-[13px]">{items.length} issue report{items.length !== 1 ? 's' : ''}</p>
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden">
          {items.length === 0
            ? <div className="flex flex-col items-center justify-center py-16"><p className="text-[#90a1b9] text-[14px]">No issue reports submitted.</p></div>
            : items.map((item, idx) => (
              <button key={item.id} onClick={() => setSelected(item)}
                className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-[#f8fafc] transition-colors text-left ${idx > 0 ? 'border-t border-[#f1f5f9]' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-[#fff7ed] flex items-center justify-center shrink-0">
                  <IconAlert />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0f172b] font-semibold text-[14px] truncate">{item.title}</p>
                  <p className="text-[#90a1b9] text-[12px] truncate">{item.submitted_by} · {item.submitted_by_email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {parseInt(item.photo_count) > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-[#90a1b9]"><IconPhoto />{item.photo_count}</span>
                  )}
                  <span className="text-[11px] text-[#90a1b9]">{new Date(item.created_at).toLocaleDateString('en-AU', { day:'numeric', month:'short' })}</span>
                </div>
                <IconChev />
              </button>
            ))
          }
        </div>
      </div>
    </>
  )
}
