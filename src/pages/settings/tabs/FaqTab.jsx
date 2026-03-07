// src/pages/settings/tabs/FaqTab.jsx
// FAQ management — list, add, edit inline, delete
//
// APIs (commented out):
//   GET    /api/supports/faq/manage/         → list
//   POST   /api/supports/faq/manage/         → create { question, answer }
//   PATCH  /api/supports/faq/manage/{id}/    → update { question, answer }
//   DELETE /api/supports/faq/manage/{id}/    → delete
import { useState } from 'react'
import { MOCK_FAQS } from '../settingsMock'

function IconPlus()   { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconEdit()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2l2.5 2.5L5 11.5H2.5V9L9.5 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconTrash()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5h4V4M3 4l.8 8h6.4L11 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconCheck()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconX()      { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> }
function IconChev()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 5.5l3.5 3.5L11 5.5" stroke="#90a1b9" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> }

let _nextId = 6

function FaqRow({ item, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  return (
    <div className="border-b border-[#f1f5f9] last:border-0">
      <div className="flex items-start gap-3 px-5 py-4">
        <button onClick={() => setOpen(v => !v)} className="flex-1 text-left min-w-0">
          <div className="flex items-start gap-2">
            <span className={`mt-0.5 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}><IconChev /></span>
            <p className="text-[#0f172b] font-semibold text-[14px] leading-[20px]">{item.question}</p>
          </div>
          {open && <p className="text-[#62748e] text-[13px] leading-[21px] mt-2 ml-5">{item.answer}</p>}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(item)} className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#62748e] hover:bg-[#f1f5f9] hover:text-[#0f172b] transition-colors"><IconEdit /></button>
          {!confirming
            ? <button onClick={() => setConfirming(true)} className="w-7 h-7 flex items-center justify-center rounded-[6px] text-[#90a1b9] hover:bg-[#fef2f2] hover:text-[#c10007] transition-colors"><IconTrash /></button>
            : <div className="flex items-center gap-1 ml-1">
                <span className="text-[11px] text-[#c10007] font-medium">Delete?</span>
                <button onClick={() => onDelete(item.id)} className="w-6 h-6 flex items-center justify-center rounded-[5px] bg-[#c10007] text-white hover:bg-[#9b0005]"><IconCheck /></button>
                <button onClick={() => setConfirming(false)} className="w-6 h-6 flex items-center justify-center rounded-[5px] border border-[#e2e8f0] text-[#62748e] hover:bg-[#f8fafc]"><IconX /></button>
              </div>
          }
        </div>
      </div>
    </div>
  )
}

function FaqForm({ initial, onSave, onCancel, saving }) {
  const [q, setQ] = useState(initial?.question ?? '')
  const [a, setA] = useState(initial?.answer ?? '')
  return (
    <div className="flex flex-col gap-3 px-5 py-4 bg-[#f8fafc] border-b border-[#e2e8f0]">
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-[#0f172b]">Question <span className="text-[#f54900]">*</span></label>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Enter the FAQ question…"
          className="h-[38px] px-3 rounded-[8px] border border-[#e2e8f0] bg-white text-[14px] text-[#0f172b] focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors"/>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-semibold text-[#0f172b]">Answer <span className="text-[#f54900]">*</span></label>
        <textarea value={a} onChange={e => setA(e.target.value)} rows={3} placeholder="Enter the answer…"
          className="px-3 py-2.5 rounded-[8px] border border-[#e2e8f0] bg-white text-[14px] text-[#0f172b] focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors resize-none"/>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#e2e8f0] text-[#314158] text-[12px] font-semibold hover:bg-white transition-colors"><IconX /> Cancel</button>
        <button onClick={() => onSave({ question: q.trim(), answer: a.trim() })} disabled={!q.trim() || !a.trim() || saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-[7px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[12px] font-semibold transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : <><IconCheck /> {initial ? 'Update' : 'Add FAQ'}</>}
        </button>
      </div>
    </div>
  )
}

export default function FaqTab() {
  const [items,    setItems]    = useState(MOCK_FAQS)
  const [adding,   setAdding]   = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [saving,   setSaving]   = useState(false)

  const handleAdd = async ({ question, answer }) => {
    setSaving(true)

    // // API: POST /api/supports/faq/manage/
    // const res  = await fetch(`${import.meta.env.VITE_API_BASE_URL}supports/faq/manage/`, {
    //   method: 'POST', headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ question, answer }),
    // })
    // const data = await res.json()
    // setItems(p => [...p, data])

    await new Promise(r => setTimeout(r, 400))
    setItems(p => [...p, { id: `FAQ-00${_nextId++}`, question, answer }])
    setSaving(false); setAdding(false)
  }

  const handleUpdate = async ({ question, answer }) => {
    setSaving(true)

    // // API: PATCH /api/supports/faq/manage/{id}/
    // await fetch(`${import.meta.env.VITE_API_BASE_URL}supports/faq/manage/${editing.id}/`, {
    //   method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ question, answer }),
    // })

    await new Promise(r => setTimeout(r, 400))
    setItems(p => p.map(i => i.id === editing.id ? { ...i, question, answer } : i))
    setSaving(false); setEditing(null)
  }

  const handleDelete = (id) => {
    // // API: DELETE /api/supports/faq/manage/{id}/
    // await fetch(`${import.meta.env.VITE_API_BASE_URL}supports/faq/manage/${id}/`, { method: 'DELETE' })
    setItems(p => p.filter(i => i.id !== id))
  }

  return (
    <div className="max-w-[800px] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[#62748e] text-[13px]">{items.length} FAQ{items.length !== 1 ? 's' : ''}</p>
        {!adding && (
          <button onClick={() => { setAdding(true); setEditing(null) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[13px] font-semibold transition-colors shadow-[0_1px_3px_rgba(245,73,0,0.3)]">
            <IconPlus /> Add FAQ
          </button>
        )}
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden">
        {adding && <FaqForm onSave={handleAdd} onCancel={() => setAdding(false)} saving={saving}/>}
        {items.length === 0 && !adding
          ? <div className="flex flex-col items-center justify-center py-16"><p className="text-[#90a1b9] text-[14px]">No FAQs yet. Add one above.</p></div>
          : items.map(item => (
            editing?.id === item.id
              ? <FaqForm key={item.id} initial={item} onSave={handleUpdate} onCancel={() => setEditing(null)} saving={saving}/>
              : <FaqRow key={item.id} item={item} onEdit={setEditing} onDelete={handleDelete}/>
          ))
        }
      </div>
    </div>
  )
}
