// src/pages/safety/SafetyFormsPage.jsx
// Safety Forms Manager — /admin/safety-forms
//
// API endpoints wired:
//   GET  safety-forms/field-types/                       → populate type dropdown
//   GET  safety-forms/?all=true                          → list all templates (incl. inactive)
//   GET  safety-forms/{id}/                              → load selected template + fields
//   POST safety-forms/create/                            → create template
//   PATCH safety-forms/{id}/update/                      → update template metadata (Save Changes)
//   DELETE safety-forms/{id}/update/                     → delete template
//   POST safety-forms/{template_id}/fields/add/          → add field (returns real ID)
//   PATCH safety-forms/{template_id}/fields/{field_id}/  → update field (called on input blur)
//   DELETE safety-forms/{template_id}/fields/{field_id}/ → delete field
//   POST safety-forms/{template_id}/fields/reorder/      → reorder after drag-drop
//
// Field editing strategy: all edits are kept local (every keystroke).
// PATCH is fired on input onBlur to avoid request-per-keystroke thrashing.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback, useEffect } from 'react'
import { apiFetch } from '@/utils/apiFetch'

// Fallback field types used if /field-types/ API is unreachable
const FALLBACK_FIELD_TYPES = [
  { value: 'text',         label: 'Text'         },
  { value: 'textarea',     label: 'Text Area'     },
  { value: 'number',       label: 'Number'        },
  { value: 'checkbox',     label: 'Checkbox'      },
  { value: 'select',       label: 'Select'        },
  { value: 'multi_select', label: 'Multi Select'  },
  { value: 'date',         label: 'Date'          },
  { value: 'time',         label: 'Time'          },
  { value: 'file',         label: 'File Upload'   },
]

const TYPES_WITH_OPTIONS = ['select', 'multi_select']

// Icons (all unchanged from original)
function IconPlus()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> }
function IconDoc()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h6l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5.5 8h5M5.5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconDrag()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="4.5" r="1" fill="currentColor"/><circle cx="5.5" cy="8" r="1" fill="currentColor"/><circle cx="5.5" cy="11.5" r="1" fill="currentColor"/><circle cx="9.5" cy="4.5" r="1" fill="currentColor"/><circle cx="9.5" cy="8" r="1" fill="currentColor"/><circle cx="9.5" cy="11.5" r="1" fill="currentColor"/></svg> }
function IconTrash()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3.5h11M4 3.5V2h6v1.5M3 3.5l.8 9h6.4l.8-9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconChevron() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 5.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconSave()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v8a1 1 0 01-1 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><rect x="5" y="9" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 2v3.5h4V2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconEye()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3"/></svg> }
function IconX()       { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }

// Spinner dot for loading states
function Spin() {
  return <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
}

// Toggle (unchanged from original, + disabled prop)
function Toggle({ checked, onChange, size = 'md', disabled = false }) {
  const track = size === 'sm' ? 'w-[36px] h-[20px]' : 'w-[44px] h-[24px]'
  const thumb = size === 'sm'
    ? `w-[14px] h-[14px] top-[3px] ${checked ? 'translate-x-[19px]' : 'translate-x-[3px]'}`
    : `w-[18px] h-[18px] top-[3px] ${checked ? 'translate-x-[23px]' : 'translate-x-[3px]'}`
  return (
    <button type="button" role="switch" aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ${track} ${checked ? 'bg-[#f54900]' : 'bg-[#cbd5e1]'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span className={`absolute rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.20)] transition-transform duration-200 ${thumb}`} />
    </button>
  )
}

// Create Template Modal — wired to POST /safety-forms/create/
function CreateTemplateModal({ onClose, onCreate }) {
  const [form,   setForm]   = useState({ name: '', description: '', is_active: true })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Template name is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleCreate = async () => {
    if (!validate()) return
    setSaving(true)
    const { data, ok } = await apiFetch('safety-forms/create/', {
      method: 'POST',
      body: JSON.stringify({
        name:        form.name.trim(),
        description: form.description.trim(),
        is_active:   form.is_active,
      }),
    })
    if (ok && data) {
      onCreate({ ...data, fields: data.fields ?? [] })
      onClose()
    } else {
      const nameErr = data?.name
      if (nameErr) setErrors({ name: Array.isArray(nameErr) ? nameErr[0] : nameErr })
      else setErrors({ _global: 'Failed to create template. Please try again.' })
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[460px] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.22)] overflow-hidden" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f5f9]">
          <div>
            <h2 className="text-[#0f172b] font-bold text-[18px]">New Inspection Template</h2>
            <p className="text-[#90a1b9] text-[13px] mt-0.5">Create a blank form template</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#f8fafc] transition-colors"><IconX /></button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {errors._global && (
            <div className="px-4 py-3 bg-[#fef2f2] border border-[#ffe2e2] rounded-[10px]">
              <p className="text-[#c10007] text-[13px]">{errors._global}</p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#0f172b] text-[14px] font-semibold">Template Name <span className="text-[#f54900]">*</span></label>
            <input autoFocus value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Daily Vehicle Check"
              className={`w-full h-[38px] px-3 rounded-[8px] border text-[14px] text-[#0f172b] placeholder:text-[#90a1b9] transition-colors focus:outline-none focus:ring-2 ${errors.name ? 'border-[#c10007] bg-[#fef2f2] focus:ring-[#c10007]/20' : 'border-[#e2e8f0] focus:ring-[#f54900]/25 focus:border-[#f54900]/60'}`} />
            {errors.name && <p className="text-[#c10007] text-[12px]">{errors.name}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[#0f172b] text-[14px] font-semibold">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of this form's purpose…"
              className="w-full px-3 py-2 rounded-[8px] border border-[#e2e8f0] text-[14px] text-[#0f172b] placeholder:text-[#90a1b9] resize-none focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors" />
          </div>
          <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
            <div>
              <p className="text-[#0f172b] text-[13px] font-semibold">Active</p>
              <p className="text-[#90a1b9] text-[12px]">Activate this template immediately</p>
            </div>
            <Toggle checked={form.is_active} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f1f5f9]">
          <button onClick={onClose} className="px-4 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold hover:bg-[#f8fafc] transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={saving}
            className="flex items-center gap-2 px-5 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.3)] disabled:opacity-60">
            {saving ? <><Spin /> Creating…</> : 'Create Template'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Delete Template Confirmation
function DeleteTemplateModal({ template, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[400px] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.22)] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5">
          <h2 className="text-[#0f172b] font-bold text-[18px]">Delete Template</h2>
          <p className="text-[#62748e] text-[14px] mt-2">
            Are you sure you want to delete <strong className="text-[#0f172b]">"{template.name}"</strong>?
            This will permanently remove the template and all its fields.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f1f5f9]">
          <button onClick={onClose} className="px-4 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold hover:bg-[#f8fafc] transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex items-center gap-2 px-5 py-[9px] rounded-[10px] bg-[#c10007] hover:bg-[#a30006] text-white text-[14px] font-semibold transition-colors disabled:opacity-60">
            {loading ? <><Spin /> Deleting…</> : 'Delete Template'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Field type dropdown (unchanged design, fieldTypes prop replaces hardcoded FIELD_TYPES)
function FieldTypeSelect({ value, onChange, fieldTypes }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = fieldTypes.find(t => t.value === value)

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full h-[34px] px-3 rounded-[7px] border border-[#e2e8f0] bg-white text-[13px] text-[#314158] hover:border-[#f54900]/40 transition-colors gap-2">
        <span className={current ? 'text-[#0f172b]' : 'text-[#90a1b9]'}>{current?.label ?? 'Select type…'}</span>
        <span className="text-[#90a1b9] shrink-0"><IconChevron /></span>
      </button>
      {open && (
        <div className="absolute left-0 top-[38px] z-50 w-[180px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0px_8px_24px_rgba(15,23,43,0.12)] py-1.5 overflow-hidden">
          {fieldTypes.map(t => (
            <button key={t.value} type="button" onClick={() => { onChange(t.value); setOpen(false) }}
              className={`flex items-center w-full px-3 py-[7px] text-[13px] transition-colors ${value === t.value ? 'bg-[#fff4ee] text-[#f54900] font-semibold' : 'text-[#314158] hover:bg-[#f8fafc]'}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Single field card
// - All edits are local (onChange → state update only)
// - onBlurField is called on input blur → triggers PATCH
// - onTypeChange / onRequiredChange call blur immediately (no blur event for these)
function FieldCard({ field, index, fieldTypes, onLocalUpdate, onBlurField, onDelete, onDragStart, onDragOver, onDrop, isDragOver, isDeleting }) {
  const showOptions = TYPES_WITH_OPTIONS.includes(field.field_type)

  return (
    <div draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(index) }}
      onDrop={() => onDrop(index)}
      className={`bg-white border rounded-[12px] px-4 py-4 transition-all duration-150 ${isDeleting ? 'opacity-40 pointer-events-none' : isDragOver ? 'border-[#f54900] shadow-[0_0_0_2px_rgba(245,73,0,0.15)]' : 'border-[#e2e8f0]'}`}>
      <div className="flex items-start gap-3">
        <span className="mt-[10px] text-[#cad5e2] hover:text-[#90a1b9] cursor-grab active:cursor-grabbing shrink-0"><IconDrag /></span>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Row 1: Label + Type + Required + Delete */}
          <div className="flex items-end gap-3">
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px]">Field Label</span>
              <input value={field.label}
                onChange={e => onLocalUpdate({ label: e.target.value })}
                onBlur={() => onBlurField(field)}
                placeholder="e.g. Vehicle Condition"
                className="w-full h-[34px] px-3 rounded-[7px] border border-[#e2e8f0] text-[13px] text-[#0f172b] placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50 transition-colors bg-white" />
            </div>

            <div className="w-[160px] shrink-0 flex flex-col gap-1">
              <span className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px]">Type</span>
              <FieldTypeSelect value={field.field_type} fieldTypes={fieldTypes}
                onChange={v => {
                  const updated = { ...field, field_type: v, options: '' }
                  onLocalUpdate({ field_type: v, options: '' })
                  setTimeout(() => onBlurField(updated), 0)
                }} />
            </div>

            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px]">REQ</span>
              <Toggle checked={field.is_required} size="sm"
                onChange={v => {
                  const updated = { ...field, is_required: v }
                  onLocalUpdate({ is_required: v })
                  setTimeout(() => onBlurField(updated), 0)
                }} />
            </div>

            <button type="button" onClick={onDelete} className="mb-[3px] text-[#cad5e2] hover:text-[#c10007] transition-colors shrink-0"><IconTrash /></button>
          </div>

          {/* Row 2: Options (select / multi_select only) */}
          {showOptions && (
            <div className="flex flex-col gap-1">
              <span className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px]">Options (comma separated)</span>
              <input value={field.options ?? ''}
                onChange={e => onLocalUpdate({ options: e.target.value })}
                onBlur={() => onBlurField(field)}
                placeholder="e.g. Good, Fair, Poor"
                className="w-full h-[34px] px-3 rounded-[7px] border border-[#e2e8f0] text-[13px] text-[#0f172b] placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50 transition-colors bg-white" />
            </div>
          )}

          {/* Row 3: Helper text */}
          <div className="flex flex-col gap-1">
            <span className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px]">Helper Text</span>
            <input value={field.helper_text ?? ''}
              onChange={e => onLocalUpdate({ helper_text: e.target.value })}
              onBlur={() => onBlurField(field)}
              placeholder="Optional guidance shown below the field…"
              className="w-full h-[34px] px-3 rounded-[7px] border border-[#e2e8f0] text-[13px] text-[#0f172b] placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50 transition-colors bg-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Preview Modal (unchanged from original)
function PreviewModal({ template, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[540px] max-h-[80vh] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.22)] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f5f9]">
          <div>
            <p className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px] mb-1">Form Preview</p>
            <h2 className="text-[#0f172b] font-bold text-[20px]">{template.name}</h2>
            {template.description && <p className="text-[#62748e] text-[13px] mt-0.5">{template.description}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#f8fafc] transition-colors"><IconX /></button>
        </div>
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {!template.fields?.length ? (
            <p className="text-[#90a1b9] text-[14px] text-center py-8">No fields added yet.</p>
          ) : template.fields.map((f, i) => (
            <div key={f.id ?? i} className="flex flex-col gap-1.5">
              <label className="text-[#0f172b] text-[14px] font-semibold">
                {f.label || <span className="text-[#90a1b9] italic">Unlabeled field</span>}
                {f.is_required && <span className="text-[#f54900] ml-0.5">*</span>}
              </label>
              {f.helper_text && <p className="text-[#90a1b9] text-[12px] -mt-0.5">{f.helper_text}</p>}
              {f.field_type === 'text'     && <input disabled placeholder="Text input…" className="h-[36px] px-3 border border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] text-[13px] text-[#90a1b9]" />}
              {f.field_type === 'textarea' && <textarea disabled rows={3} placeholder="Multi-line text…" className="px-3 py-2 border border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] text-[13px] text-[#90a1b9] resize-none" />}
              {f.field_type === 'number'   && <input disabled type="number" placeholder="0" className="h-[36px] px-3 border border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] text-[13px] text-[#90a1b9] w-[160px]" />}
              {f.field_type === 'date'     && <input disabled type="date" className="h-[36px] px-3 border border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] text-[13px] text-[#90a1b9] w-[200px]" />}
              {f.field_type === 'time'     && <input disabled type="time" className="h-[36px] px-3 border border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] text-[13px] text-[#90a1b9] w-[160px]" />}
              {f.field_type === 'file'     && <div className="h-[36px] px-3 border border-dashed border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] flex items-center text-[13px] text-[#90a1b9]">Choose file…</div>}
              {f.field_type === 'checkbox' && <label className="flex items-center gap-2 cursor-not-allowed"><input disabled type="checkbox" className="w-4 h-4 rounded" /><span className="text-[13px] text-[#62748e]">{f.label}</span></label>}
              {(f.field_type === 'select' || f.field_type === 'multi_select') && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {(f.options || '').split(',').map(o => o.trim()).filter(Boolean).map((opt, oi) => (
                    <span key={oi} className="px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-full text-[12px] text-[#62748e]">{opt}</span>
                  ))}
                  {!f.options && <span className="text-[#90a1b9] text-[13px] italic">No options defined</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SafetyFormsPage() {
  const [fieldTypes,         setFieldTypes]         = useState(FALLBACK_FIELD_TYPES)
  const [templates,          setTemplates]          = useState([])
  const [templatesLoading,   setTemplatesLoading]   = useState(true)
  const [selectedId,         setSelectedId]         = useState(null)
  const [selected,           setSelected]           = useState(null)
  const [templateLoading,    setTemplateLoading]    = useState(false)
  const [showCreateModal,    setShowCreateModal]    = useState(false)
  const [showPreview,        setShowPreview]        = useState(false)
  const [savedBanner,        setSavedBanner]        = useState(false)
  const [saving,             setSaving]             = useState(false)
  const [addingField,        setAddingField]        = useState(false)
  const [deletingFieldIds,   setDeletingFieldIds]   = useState(new Set())
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState(null)
  const [deletingTemplate,   setDeletingTemplate]   = useState(false)
  const [reordering,         setReordering]         = useState(false)

  const dragIndexRef    = useRef(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  // Always-current refs — lets async callbacks read latest values
  // without stale closure bugs from useCallback dependency arrays
  const selectedIdRef = useRef(null)
  const selectedRef   = useRef(null)
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  useEffect(() => { selectedRef.current   = selected   }, [selected])

  // 1. Fetch field types from API (falls back to static list on failure)
  useEffect(() => {
    ;(async () => {
      const { data, ok } = await apiFetch('safety-forms/field-types/')
      if (ok && Array.isArray(data) && data.length) setFieldTypes(data)
    })()
  }, [])

  // 2. Fetch template list
  // preserveId: select this id after load (used after create to keep new template selected)
  // autoSelectFirst: select first item if nothing selected yet (used on initial load)
  const fetchTemplates = useCallback(async ({ preserveId = null, autoSelectFirst = false } = {}) => {
    setTemplatesLoading(true)
    const { data, ok } = await apiFetch('safety-forms/?all=true')
    if (ok && data) {
      const list = Array.isArray(data) ? data : (data.results ?? [])
      setTemplates(list)
      if (preserveId) {
        setSelectedId(preserveId)
      } else if (autoSelectFirst && list.length) {
        setSelectedId(list[0].id)
      }
    }
    setTemplatesLoading(false)
  }, [])  // no deps needed — uses only setters and apiFetch

  useEffect(() => { fetchTemplates({ autoSelectFirst: true }) }, []) // eslint-disable-line

  // 3. Load full template (with fields) when selection changes
  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    ;(async () => {
      setTemplateLoading(true)
      setSelected(null)
      const { data, ok } = await apiFetch(`safety-forms/${selectedId}/`)
      if (!cancelled && ok && data) setSelected(data)
      if (!cancelled) setTemplateLoading(false)
    })()
    return () => { cancelled = true }
  }, [selectedId])

  // ── Template: create ──────────────────────────────────────────────────────
  // Re-fetch the list so the left panel always shows server-authoritative data.
  // Also set selectedId so the detail effect fires and loads the full template.
  const handleCreate = async (newTpl) => {
    // Immediately show the new template selected in the right panel
    setSelected({ ...newTpl, fields: newTpl.fields ?? [] })
    setSelectedId(newTpl.id)
    // Re-fetch the list so the left panel shows the real server data
    await fetchTemplates({ preserveId: newTpl.id })
  }

  // ── Template: save metadata (name + description + is_active) ─────────────
  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const { ok } = await apiFetch(`safety-forms/${selected.id}/update/`, {
      method: 'PATCH',
      body: JSON.stringify({
        name:        selected.name,
        description: selected.description ?? '',
        is_active:   selected.is_active,
      }),
    })
    if (ok) {
      setTemplates(prev => prev.map(t =>
        t.id === selected.id ? { ...t, name: selected.name, is_active: selected.is_active } : t
      ))
      setSavedBanner(true)
      setTimeout(() => setSavedBanner(false), 2500)
    }
    setSaving(false)
  }

  // ── Template: delete ──────────────────────────────────────────────────────
  const handleDeleteTemplate = async () => {
    if (!deleteTemplateTarget) return
    setDeletingTemplate(true)
    const { ok } = await apiFetch(`safety-forms/${deleteTemplateTarget.id}/update/`, { method: 'DELETE' })
    if (ok) {
      const remaining = templates.filter(t => t.id !== deleteTemplateTarget.id)
      setTemplates(remaining)
      setDeleteTemplateTarget(null)
      if (selectedId === deleteTemplateTarget.id) {
        const next = remaining[0] ?? null
        setSelectedId(next?.id ?? null)
        setSelected(null)
      }
    }
    setDeletingTemplate(false)
  }

  // ── Local template meta update (no API until Save Changes) ───────────────
  const updateMeta = useCallback((patch) => {
    setSelected(prev => prev ? { ...prev, ...patch } : prev)
  }, [])

  // ── Field: add ────────────────────────────────────────────────────────────
  // Uses selectedRef (a ref to the full selected object) so we can read
  // the current field count synchronously — no stale closures, no setState-to-read hacks.
  // Backend response shape: { message: "Field added.", data: { id, label, ... } }
  const addField = async () => {
    const templateId = selectedIdRef.current
    const currentSelected = selectedRef.current
    if (!templateId || !currentSelected) return
    setAddingField(true)

    const order = (currentSelected.fields?.length ?? 0) + 1
    const payload = { label: 'New Field', field_type: 'text', options: '', is_required: false, order, helper_text: '' }

    const { data, ok } = await apiFetch(`safety-forms/${templateId}/fields/add/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (ok && data) {
      // Backend wraps: { message: "Field added.", data: { id, label, field_type, ... } }
      const newField = data.data ?? data
      setSelected(prev => {
        if (!prev) return prev
        return { ...prev, fields: [...(prev.fields ?? []), newField] }
      })
    }
    setAddingField(false)
  }

  // ── Field: local update (every keystroke, no API) ─────────────────────────
  const updateFieldLocal = useCallback((fieldId, patch) => {
    setSelected(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === fieldId ? { ...f, ...patch } : f),
    }))
  }, [])

  // ── Field: blur → PATCH backend ───────────────────────────────────────────
  // Uses selectedIdRef so the closure never goes stale across re-renders.
  const handleFieldBlur = useCallback(async (fieldState) => {
    const templateId = selectedIdRef.current
    if (!templateId || !fieldState?.id) return
    await apiFetch(`safety-forms/${templateId}/fields/${fieldState.id}/`, {
      method: 'PATCH',
      body: JSON.stringify({
        label:       fieldState.label,
        field_type:  fieldState.field_type,
        options:     fieldState.options ?? '',
        is_required: fieldState.is_required,
        order:       fieldState.order,
        helper_text: fieldState.helper_text ?? '',
      }),
    })
  }, [])  // stable — reads selectedIdRef.current at call time

  // ── Field: delete ─────────────────────────────────────────────────────────
  const deleteField = useCallback(async (fieldId) => {
    const templateId = selectedIdRef.current
    if (!templateId) return
    setDeletingFieldIds(prev => new Set([...prev, fieldId]))
    const { ok } = await apiFetch(`safety-forms/${templateId}/fields/${fieldId}/`, { method: 'DELETE' })
    if (ok) {
      setSelected(prev => prev ? { ...prev, fields: prev.fields.filter(f => f.id !== fieldId) } : prev)
    }
    setDeletingFieldIds(prev => { const s = new Set(prev); s.delete(fieldId); return s })
  }, [])  // stable — reads selectedIdRef.current at call time

  // ── Drag-drop reorder ─────────────────────────────────────────────────────
  const handleDragStart = (index) => { dragIndexRef.current = index }
  const handleDragOver  = (index) => { setDragOverIndex(index) }
  const handleDrop      = async (dropIndex) => {
    const from = dragIndexRef.current
    const templateId = selectedIdRef.current
    if (from == null || from === dropIndex || !templateId) { setDragOverIndex(null); return }

    // Read current fields, reorder, optimistic update
    let reordered = []
    setSelected(prev => {
      if (!prev) return prev
      const fields = [...prev.fields]
      const [moved] = fields.splice(from, 1)
      fields.splice(dropIndex, 0, moved)
      reordered = fields.map((f, i) => ({ ...f, order: i + 1 }))
      return { ...prev, fields: reordered }
    })
    dragIndexRef.current = null
    setDragOverIndex(null)

    setReordering(true)
    await apiFetch(`safety-forms/${templateId}/fields/reorder/`, {
      method: 'POST',
      body: JSON.stringify({ fields: reordered.map(f => ({ id: f.id, order: f.order })) }),
    })
    setReordering(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {showCreateModal && <CreateTemplateModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />}
      {showPreview && selected && <PreviewModal template={selected} onClose={() => setShowPreview(false)} />}
      {deleteTemplateTarget && (
        <DeleteTemplateModal
          template={deleteTemplateTarget}
          onClose={() => setDeleteTemplateTarget(null)}
          onConfirm={handleDeleteTemplate}
          loading={deletingTemplate}
        />
      )}

      <div className="p-6 lg:p-8 flex flex-col gap-6 min-h-full">

        {/* Page header — unchanged layout */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[#0f172b] font-bold text-[26px] leading-[34px]">Safety Forms Manager</h1>
            <p className="text-[#62748e] text-[14px] mt-1">Configure inspection checklists and compliance forms</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {savedBanner && (
              <span className="text-[#007a55] text-[13px] font-semibold bg-[#ecfdf5] border border-[#d0fae5] px-3 py-1.5 rounded-[8px]">
                ✓ Changes saved
              </span>
            )}
            {reordering && (
              <span className="text-[#62748e] text-[13px] bg-[#f8fafc] border border-[#e2e8f0] px-3 py-1.5 rounded-[8px] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-[#e2e8f0] border-t-[#62748e] animate-spin" />
                Saving order…
              </span>
            )}
            <button onClick={() => setShowPreview(true)} disabled={!selected}
              className="flex items-center gap-2 h-[38px] px-4 rounded-[10px] border border-[#e2e8f0] bg-white text-[#314158] text-[14px] font-semibold hover:bg-[#f8fafc] transition-colors disabled:opacity-40">
              <IconEye /> Preview Form
            </button>
            <button onClick={handleSave} disabled={saving || !selected}
              className="flex items-center gap-2 h-[38px] px-4 rounded-[10px] bg-[#007a55] hover:bg-[#006144] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(0,122,85,0.30)] disabled:opacity-60">
              {saving ? <><Spin /> Saving…</> : <><IconSave /> Save Changes</>}
            </button>
          </div>
        </div>

        {/* Two-panel layout — unchanged structure */}
        <div className="flex gap-5 flex-1 min-h-0 items-start">

          {/* LEFT: Template list */}
          <div className="w-[300px] shrink-0 bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
              <h2 className="text-[#0f172b] font-bold text-[15px]">Inspection Templates</h2>
              <button onClick={() => setShowCreateModal(true)}
                className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-[#fff4ee] text-[#f54900] hover:bg-[#ffe8d9] transition-colors">
                <IconPlus />
              </button>
            </div>

            <div className="py-1.5">
              {templatesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin" />
                </div>
              ) : templates.length === 0 ? (
                <p className="text-[#90a1b9] text-[13px] text-center py-8 px-4">No templates yet. Click + to create one.</p>
              ) : templates.map(tpl => {
                const isActive = tpl.id === selectedId
                return (
                  <div key={tpl.id} className="group flex items-center gap-1">
                    <button onClick={() => { if (tpl.id !== selectedId) { setSelectedId(tpl.id); setSelected(null) } }}
                      className={`flex items-center gap-3 flex-1 min-w-0 px-4 py-[11px] text-left border-l-[3px] transition-colors ${isActive ? 'bg-[#fff4ee] border-l-[#f54900]' : 'border-l-transparent hover:bg-[#f8fafc]'}`}>
                      <span className={isActive ? 'text-[#f54900]' : 'text-[#90a1b9]'}><IconDoc /></span>
                      <span className={`text-[14px] font-medium leading-[20px] truncate ${isActive ? 'text-[#f54900]' : 'text-[#314158]'}`}>
                        {tpl.name}
                      </span>
                    </button>
                    {/* Delete template — visible on row hover */}
                    <button onClick={() => setDeleteTemplateTarget(tpl)}
                      className="mr-3 text-[#cad5e2] hover:text-[#c10007] transition-colors opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-[4px] hover:bg-[#fef2f2]"
                      title="Delete template">
                      <IconTrash />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT: Form builder */}
          {templateLoading ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="w-7 h-7 rounded-full border-2 border-[#e2e8f0] border-t-[#f54900] animate-spin" />
            </div>
          ) : selected ? (
            <div className="flex-1 min-w-0 bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">
              <div className="px-6 py-5 flex flex-col gap-5">

                {/* Form title + Active toggle — unchanged layout */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-[#90a1b9] text-[11px] font-bold uppercase tracking-[0.6px]">Form Title</span>
                    <input value={selected.name} onChange={e => updateMeta({ name: e.target.value })}
                      className="text-[#0f172b] font-bold text-[22px] leading-[30px] bg-transparent border-none outline-none focus:bg-[#f8fafc] focus:px-2 focus:rounded-[6px] transition-all placeholder:text-[#cad5e2] w-full"
                      placeholder="Form title…" />
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 mt-4">
                    <span className="text-[#314158] text-[14px] font-medium">Active</span>
                    <Toggle checked={selected.is_active} onChange={v => updateMeta({ is_active: v })} />
                  </div>
                </div>

                <div className="h-px bg-[#f1f5f9]" />

                {/* Field cards */}
                <div className="flex flex-col gap-4">
                  {!selected.fields?.length ? (
                    <div className="py-10 text-center border-2 border-dashed border-[#e2e8f0] rounded-[12px]">
                      <p className="text-[#90a1b9] text-[14px] font-medium">No fields yet</p>
                      <p className="text-[#cad5e2] text-[13px] mt-1">Click "Add New Field" below to get started</p>
                    </div>
                  ) : (
                    selected.fields
                      .slice()
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                      .map((field, index) => (
                        <FieldCard
                          key={field.id}
                          field={field}
                          index={index}
                          fieldTypes={fieldTypes}
                          onLocalUpdate={patch => updateFieldLocal(field.id, patch)}
                          onBlurField={handleFieldBlur}
                          onDelete={() => deleteField(field.id)}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          isDragOver={dragOverIndex === index}
                          isDeleting={deletingFieldIds.has(field.id)}
                        />
                      ))
                  )}
                </div>

                {/* + Add New Field button — unchanged style */}
                <button onClick={addField} disabled={addingField}
                  className="flex items-center justify-center gap-2 w-full h-[48px] rounded-[12px] border-2 border-dashed border-[#e2e8f0] text-[#90a1b9] hover:border-[#f54900]/40 hover:text-[#f54900] hover:bg-[#fff9f7] transition-colors text-[14px] font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
                  {addingField
                    ? <><div className="w-4 h-4 rounded-full border-2 border-[#f54900]/30 border-t-[#f54900] animate-spin" /> Adding…</>
                    : <><IconPlus /> Add New Field</>
                  }
                </button>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-20 text-[#90a1b9] text-[14px]">
              {templates.length === 0
                ? 'Create a template using the + button on the left.'
                : 'Select a template from the left to start editing.'}
            </div>
          )}

        </div>
      </div>
    </>
  )
}