// src/pages/settings/tabs/RichContentTab.jsx
// Reusable tab for Terms, Privacy, About Us — single-instance GET + PATCH
//
// REQUIRES (run once):
//   npm install @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
//
// Props:
//   title           — section heading
//   getEndpoint     — e.g. "supports/terms/"
//   patchEndpoint   — e.g. "supports/admin/terms/"
//   mockData        — { content: string, updated_at: string }
//   useMock         — true (default) = use mock data; false = call real API
//
// The `key` prop MUST be set on this component at the call site (in SettingsPage)
// to force a full remount when switching tabs. Without it, useState keeps the
// previous tab's content because React reuses the same component instance.
//
// To go live: pass useMock={false} — the useEffect and handleSave API blocks
// will activate automatically.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, Suspense, lazy } from 'react'

// ── CKEditor lazy-loaded to avoid SSR issues and keep initial bundle light ────
// If the npm package isn't installed yet, the editor falls back gracefully
// to a plain textarea (see EditorFallback below).
let CKEditorComponent = null
let ClassicEditorClass = null

try {
  // Dynamic import — will only resolve after `npm install` has been run
  const { CKEditor }    = await import('@ckeditor/ckeditor5-react').catch(() => ({}))
  const { default: CE } = await import('@ckeditor/ckeditor5-build-classic').catch(() => ({}))
  if (CKEditor && CE) {
    CKEditorComponent  = CKEditor
    ClassicEditorClass = CE
  }
} catch (_) {
  // Package not installed — fallback textarea will be used
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconEdit()  { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconCheck() { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5l3.5 3.5 6.5-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconX()     { return <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 3l9 9M12 3L3 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconClock() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="#90a1b9" strokeWidth="1.1"/><path d="M6.5 4v3l2 1.5" stroke="#90a1b9" strokeWidth="1.1" strokeLinecap="round"/></svg> }

// ── HTML preview (view mode) — renders backend HTML properly styled ────────────
function HtmlPreview({ html }) {
  return (
    <div
      className="ck-content-preview"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        // Base typography
        fontSize:   '14px',
        lineHeight: '1.75',
        color:      '#45556c',
        // Headings
      }}
    />
  )
}

// ── Fallback plain textarea (used if CKEditor package isn't installed yet) ────
function EditorFallback({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2 px-3 py-2.5 bg-[#fffbeb] border border-[#fde68a] rounded-[8px]">
        <p className="text-[12px] text-[#92400e] leading-[18px]">
          <span className="font-semibold">CKEditor not installed.</span> Run{' '}
          <code className="bg-[#fef3c7] px-1 py-0.5 rounded text-[11px] font-mono">
            npm install @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
          </code>{' '}
          then restart the dev server to enable the rich text editor. Until then, edit raw HTML below.
        </p>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={16}
        className="w-full px-4 py-3 rounded-[10px] border border-[#e2e8f0] text-[13px] text-[#314158] font-mono leading-[22px] focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors resize-y"
        placeholder="Enter HTML content..."
      />
    </div>
  )
}

// ── CKEditor wrapper — only rendered when package is available ────────────────
function RichEditor({ value, onChange }) {
  if (!CKEditorComponent || !ClassicEditorClass) {
    return <EditorFallback value={value} onChange={onChange} />
  }

  return (
    <div className="ck-editor-wrap">
      <CKEditorComponent
        editor={ClassicEditorClass}
        data={value}
        config={{
          toolbar: {
            items: [
              'heading', '|',
              'bold', 'italic', 'underline', 'strikethrough', '|',
              'bulletedList', 'numberedList', '|',
              'alignment', '|',
              'link', 'blockQuote', '|',
              'indent', 'outdent', '|',
              'undo', 'redo',
            ],
            shouldNotGroupWhenFull: true,   // ← prevents collapsing into ⋮ overflow menu
          },
          heading: {
            options: [
              { model: 'paragraph',  title: 'Paragraph',  class: 'ck-heading_paragraph'   },
              { model: 'heading1',   title: 'Heading 1',  view: 'h1', class: 'ck-heading_heading1' },
              { model: 'heading2',   title: 'Heading 2',  view: 'h2', class: 'ck-heading_heading2' },
              { model: 'heading3',   title: 'Heading 3',  view: 'h3', class: 'ck-heading_heading3' },
            ],
          },
        }}
        onChange={(_, editor) => onChange(editor.getData())}
      />
    </div>
  )
}

// ── CKEditor scoped styles injected once ──────────────────────────────────────
const PREVIEW_STYLES = `
  /* Preview HTML rendering */
  .ck-content-preview h1 { font-size: 1.5rem; font-weight: 700; color: #0f172b; margin: 1.25rem 0 0.5rem; }
  .ck-content-preview h2 { font-size: 1.2rem; font-weight: 700; color: #0f172b; margin: 1.1rem 0 0.4rem; }
  .ck-content-preview h3 { font-size: 1rem;   font-weight: 700; color: #314158; margin: 1rem 0 0.35rem; }
  .ck-content-preview p  { margin: 0 0 0.75rem; }
  .ck-content-preview ul, .ck-content-preview ol { padding-left: 1.5rem; margin: 0 0 0.75rem; }
  .ck-content-preview li { margin-bottom: 0.3rem; }
  .ck-content-preview blockquote { border-left: 3px solid #f54900; padding-left: 1rem; color: #62748e; margin: 0.75rem 0; }
  .ck-content-preview a  { color: #f54900; text-decoration: underline; }
  .ck-content-preview strong { color: #0f172b; font-weight: 700; }

  /* CKEditor toolbar theme overrides */
  .ck-editor-wrap .ck.ck-editor__top .ck-sticky-panel .ck-sticky-panel__content { border-radius: 10px 10px 0 0 !important; border-color: #e2e8f0 !important; background: #f8fafc !important; }
  .ck-editor-wrap .ck.ck-editor__main > .ck-editor__editable { border-radius: 0 0 10px 10px !important; border-color: #e2e8f0 !important; min-height: 280px; font-size: 14px; color: #314158; line-height: 1.75; padding: 1rem 1.25rem; }
  .ck-editor-wrap .ck.ck-editor__main > .ck-editor__editable:focus { border-color: rgba(245,73,0,0.4) !important; box-shadow: 0 0 0 3px rgba(245,73,0,0.1) !important; outline: none !important; }
  .ck-editor-wrap .ck.ck-toolbar { background: #f8fafc !important; border-color: #e2e8f0 !important; padding: 4px 8px !important; }
  .ck-editor-wrap .ck.ck-button:hover:not(.ck-disabled) { background: #fff4ee !important; color: #f54900 !important; }
  .ck-editor-wrap .ck.ck-button.ck-on { background: #fff4ee !important; color: #f54900 !important; }
  .ck-editor-wrap .ck.ck-dropdown__button:focus { border-color: rgba(245,73,0,0.4) !important; }
`

let stylesInjected = false
function injectStyles() {
  if (stylesInjected) return
  const el = document.createElement('style')
  el.textContent = PREVIEW_STYLES
  document.head.appendChild(el)
  stylesInjected = true
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RichContentTab({ title, getEndpoint, patchEndpoint, mockData, useMock = true }) {
  // Inject scoped styles once on first render
  injectStyles()

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
  //     .then(r => r.json())
  //     .then(d => { setContent(d.content); setDraft(d.content) })
  // }, [])

  const handleEdit = () => {
    setDraft(content)
    setEditing(true)
  }

  const handleCancel = () => {
    setDraft(content)
    setEditing(false)
  }

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
    setContent(draft)
    setSaving(false)
    setEditing(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
  }

  return (
    <div className="max-w-[800px] flex flex-col gap-5">

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-[#ecfdf5] border border-[#bbf7d0] rounded-[10px]">
          <IconCheck />
          <p className="text-[#007a55] text-[13px] font-semibold">{title} saved successfully.</p>
        </div>
      )}

      <div className="bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden">

        {/* ── Card header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f1f5f9]">
          <div className="flex items-center gap-3">
            <h3 className="text-[#0f172b] font-bold text-[15px]">{title}</h3>
            <div className="flex items-center gap-1.5 text-[#90a1b9]">
              <IconClock />
              <span className="text-[11px]">
                Last updated {new Date(updatedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          {!editing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#e2e8f0] text-[#314158] text-[13px] font-semibold hover:bg-[#f8fafc] transition-colors"
            >
              <IconEdit /> Edit
            </button>
          )}
        </div>

        {/* ── Content area ── */}
        <div className="p-6">
          {!editing ? (
            // ── View mode: render HTML as formatted content ────────────────
            <HtmlPreview html={content} />
          ) : (
            // ── Edit mode: CKEditor (or fallback textarea) ─────────────────
            <div className="flex flex-col gap-4">
              <RichEditor value={draft} onChange={setDraft} />
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] border border-[#e2e8f0] text-[#314158] text-[13px] font-semibold hover:bg-[#f8fafc] transition-colors"
                >
                  <IconX /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-[8px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[13px] font-semibold transition-colors disabled:opacity-60"
                >
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