import { useEffect, useState } from 'react'

let CKEditorComponent = null
let ClassicEditorClass = null
let editorLoadPromise = null
let stylesInjected = false

function injectStyles() {
  if (stylesInjected) return
  stylesInjected = true
  const style = document.createElement('style')
  style.textContent = `
    .ck-editor-wrap .ck.ck-editor__main>.ck-editor__editable {
      min-height: 260px;
      border-radius: 0 0 10px 10px !important;
      border-color: #e2e8f0 !important;
      padding: 1rem 1.25rem;
      font-size: 14px;
      line-height: 1.75;
      color: #314158;
      background: white;
    }
    .ck-editor-wrap .ck.ck-editor__main>.ck-editor__editable:focus {
      outline: none !important;
      box-shadow: 0 0 0 3px rgba(245,73,0,0.1) !important;
      border-color: rgba(245,73,0,0.4) !important;
    }
    .ck-editor-wrap .ck.ck-toolbar {
      background: #f8fafc !important;
      border-color: #e2e8f0 !important;
      border-radius: 10px 10px 0 0 !important;
      padding: 4px 8px !important;
    }
    .ck-editor-wrap .ck.ck-button:hover:not(.ck-disabled) {
      background: #fff4ee !important;
      color: #f54900 !important;
    }
    .ck-editor-wrap .ck.ck-button.ck-on {
      background: #fff4ee !important;
      color: #f54900 !important;
    }
    .ck-editor-wrap .ck.ck-toolbar .ck.ck-toolbar__separator {
      background: rgba(99,102,241,0.2) !important;
    }
  `
  document.head.appendChild(style)
}

async function loadEditor() {
  if (CKEditorComponent && ClassicEditorClass) return true
  if (editorLoadPromise) return editorLoadPromise
  editorLoadPromise = (async () => {
    try {
      const { CKEditor } = await import('@ckeditor/ckeditor5-react').catch(() => ({}))
      const { default: CE } = await import('@ckeditor/ckeditor5-build-classic').catch(() => ({}))
      const { Underline: UnderlinePlugin } = await import('@ckeditor/ckeditor5-basic-styles').catch(() => ({}))

      if (CKEditor && CE) {
        if (UnderlinePlugin) {
          const plugins = CE.builtinPlugins || []
          if (!plugins.includes(UnderlinePlugin)) {
            CE.builtinPlugins = [...plugins, UnderlinePlugin]
            UnderlinePluginClass = UnderlinePlugin
          }
        }
        CKEditorComponent = CKEditor
        ClassicEditorClass = CE
        return true
      }
    } catch (_) {
      // ignore
    }
    return false
  })()
  return editorLoadPromise
}

function EditorFallback({ value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2 px-3 py-2.5 bg-[#fffbeb] border border-[#fde68a] rounded-[8px]">
        <p className="text-[12px] text-[#92400e] leading-[18px]">
          <span className="font-semibold">CKEditor not installed.</span> Run{' '}
          <code className="bg-[#fef3c7] px-1 py-0.5 rounded text-[11px] font-mono">
            npm install @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
          </code>{' '}
          then restart the dev server to enable rich text editing.
        </p>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[260px] px-4 py-3 rounded-[10px] border border-[#e2e8f0] text-[14px] text-[#314158] focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors resize-y"
      />
    </div>
  )
}

export default function RichTextEditor({ value, onChange, placeholder }) {
  const [ready, setReady] = useState(Boolean(CKEditorComponent && ClassicEditorClass))
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    if (ready) return
    let active = true
    loadEditor().then(ok => {
      if (!active) return
      if (ok) {
        injectStyles()
        setReady(true)
      } else {
        setLoadFailed(true)
      }
    })
    return () => { active = false }
  }, [ready])

  if (!ready) {
    if (loadFailed) {
      return <EditorFallback value={value} onChange={onChange} placeholder={placeholder} />
    }
    return <EditorFallback value={value} onChange={onChange} placeholder={placeholder} />
  }

  return (
    <div className="ck-editor-wrap">
      <CKEditorComponent
        editor={ClassicEditorClass}
        data={value ?? ''}
        config={{
          placeholder,
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
            shouldNotGroupWhenFull: true,
          },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', title: 'Heading 1', view: 'h1', class: 'ck-heading_heading1' },
              { model: 'heading2', title: 'Heading 2', view: 'h2', class: 'ck-heading_heading2' },
              { model: 'heading3', title: 'Heading 3', view: 'h3', class: 'ck-heading_heading3' },
            ],
          },
        }}
        onChange={(_, editor) => onChange(editor.getData())}
      />
    </div>
  )
}
