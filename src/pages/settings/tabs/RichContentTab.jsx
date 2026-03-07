// src/pages/settings/tabs/RichContentTab.jsx
// Reusable tab for Terms, Privacy, About Us — all single-instance GET+PATCH
// Props: title, getEndpoint, patchEndpoint, mockData
//
// To disable mock: pass useMock={false} — the component will then call the real API
import { useState } from 'react'

function IconEdit()  { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconCheck() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5l3.5 3.5 6.5-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconX()     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 3l9 9M12 3L3 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconClock() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#90a1b9" strokeWidth="1.1"/><path d="M6.5 4v3l2 1.5" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/></svg> }

// Simple rich-text preview: strip HTML tags for plain rendering, keep basic structure
function HtmlPreview({ html }) {
  return (
    <div className="prose prose-sm max-w-none text-[14px] text-[#45556c] leading-[24px]"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        lineHeight: '1.75',
      }}
    />
  )
}

export default function RichContentTab({ title, getEndpoint, patchEndpoint, mockData, useMock = true }) {
  const [content,  setContent]  = useState(mockData.content)
  const [editing,  setEditing]  = useState(false)
  const [draft,    setDraft]    = useState(mockData.content)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const updatedAt = mockData.updated_at

  // // API load — uncomment when ready:
  // useEffect(() => {
  //   if (useMock) return
  //   fetch(`${import.meta.env.VITE_API_BASE_URL}${getEndpoint}`)
  //     .then(r => r.json()).then(d => { setContent(d.content); setDraft(d.content) })
  // }, [])

  const handleSave = async () => {
    setSaving(true)

    // ── API call — uncomment when ready ────────────────────────────────────
    // if (!useMock) {
    //   await fetch(`${import.meta.env.VITE_API_BASE_URL}${patchEndpoint}`, {
    //     method:  'PATCH',
    //     headers: { 'Content-Type': 'application/json' },
    //     body:    JSON.stringify({ content: draft }),
    //   })
    // }
    // ── End API call ───────────────────────────────────────────────────────

    await new Promise(r => setTimeout(r, 500))
    setContent(draft); setSaving(false); setEditing(false)
    setSuccess(true); setTimeout(() => setSuccess(false), 2500)
  }

  return (
    <div className="max-w-[800px] flex flex-col gap-5">

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[#ecfdf5] border border-[#bbf7d0] rounded-[10px]">
          <IconCheck /><p className="text-[#007a55] text-[13px] font-semibold">{title} saved successfully.</p>
        </div>
      )}

      <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-3">
            <h3 className="text-[#0f172b] font-bold text-[15px]">{title}</h3>
            <div className="flex items-center gap-1.5 text-[#90a1b9]">
              <IconClock />
              <span className="text-[11px]">Last updated {new Date(updatedAt).toLocaleDateString('en-AU', { day:'numeric', month:'short', year:'numeric' })}</span>
            </div>
          </div>
          {!editing && (
            <button onClick={() => { setDraft(content); setEditing(true) }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#e2e8f0] text-[#314158] text-[13px] font-semibold hover:bg-[#f8fafc] transition-colors">
              <IconEdit /> Edit
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!editing ? (
            <HtmlPreview html={content} />
          ) : (
            <div className="flex flex-col gap-4">
              {/* Note about CKEditor */}
              <div className="flex items-start gap-2 px-3 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px]">
                <p className="text-[12px] text-[#62748e] leading-[18px]">
                  <span className="font-semibold text-[#0f172b]">Note:</span> This textarea accepts HTML content. When connected to the backend, this will be replaced with a CKEditor 5 rich text editor (CKEditor5Field).
                </p>
              </div>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                rows={16}
                className="w-full px-4 py-3 rounded-[10px] border border-[#e2e8f0] text-[13px] text-[#314158] font-mono leading-[22px] focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors resize-y"
                placeholder="Enter HTML content..."
              />
              <div className="flex gap-3">
                <button onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#e2e8f0] text-[#314158] text-[13px] font-semibold hover:bg-[#f8fafc] transition-colors">
                  <IconX /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-[8px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[13px] font-semibold transition-colors disabled:opacity-60">
                  {saving ? 'Saving…' : <><IconCheck /> Save</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
