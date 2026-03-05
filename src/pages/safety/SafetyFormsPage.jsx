// src/pages/safety/SafetyFormsPage.jsx
// Safety Forms Manager — /admin/safety-forms
//
// Layout (Figma-exact):
//   Left panel  — Inspection Templates list + "+" to create template
//   Right panel — Selected template: title, Active toggle, field cards (drag-reorder), + Add Field
//
// API endpoints (all commented out — uncomment when backend ready):
//   POST /api/safety-forms/create/                          → create template
//   POST /api/safety-forms/{template_id}/fields/add/        → add field to template
//   POST /api/safety-forms/{template_id}/fields/reorder/    → reorder fields
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useCallback } from 'react'

// ── Field type choices (mirrors Django FieldType TextChoices) ─────────────────
const FIELD_TYPES = [
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

// Types that use the options (comma separated) input
const TYPES_WITH_OPTIONS = ['select', 'multi_select']

// ── Mock data — mirrors what the backend would return ─────────────────────────
export const MOCK_TEMPLATES = [
  {
    id:          'tpl-001',
    name:        'Daily Vehicle Check',
    description: 'Pre-shift vehicle inspection checklist',
    is_active:   true,
    fields: [
      { id: 'fld-001', label: 'Vehicle Condition',    field_type: 'multi_select', options: 'Good, Fair, Poor', is_required: true,  order: 1, helper_text: '' },
      { id: 'fld-002', label: 'Tire Pressure Checked?', field_type: 'checkbox',  options: '',                 is_required: true,  order: 2, helper_text: '' },
      { id: 'fld-003', label: 'Brake Fluid Level',    field_type: 'select',      options: 'OK, Low, Critical', is_required: false, order: 3, helper_text: '' },
      { id: 'fld-004', label: 'Damage Photos',        field_type: 'file',        options: '',                 is_required: true,  order: 4, helper_text: 'Upload any damage photos' },
    ],
  },
  {
    id:          'tpl-002',
    name:        'Site Hazard Assessment',
    description: 'On-site hazard identification form',
    is_active:   true,
    fields: [
      { id: 'fld-010', label: 'Site Address',         field_type: 'text',      options: '', is_required: true,  order: 1, helper_text: '' },
      { id: 'fld-011', label: 'Hazard Description',   field_type: 'textarea',  options: '', is_required: true,  order: 2, helper_text: 'Describe the hazard in detail' },
      { id: 'fld-012', label: 'Risk Level',           field_type: 'select',    options: 'Low, Medium, High, Critical', is_required: true, order: 3, helper_text: '' },
      { id: 'fld-013', label: 'Inspection Date',      field_type: 'date',      options: '', is_required: true,  order: 4, helper_text: '' },
    ],
  },
  {
    id:          'tpl-003',
    name:        'Incident Report',
    description: 'Workplace incident documentation',
    is_active:   true,
    fields: [
      { id: 'fld-020', label: 'Incident Date',        field_type: 'date',      options: '', is_required: true,  order: 1, helper_text: '' },
      { id: 'fld-021', label: 'Incident Time',        field_type: 'time',      options: '', is_required: true,  order: 2, helper_text: '' },
      { id: 'fld-022', label: 'Description',          field_type: 'textarea',  options: '', is_required: true,  order: 3, helper_text: '' },
      { id: 'fld-023', label: 'Witness Names',        field_type: 'text',      options: '', is_required: false, order: 4, helper_text: '' },
      { id: 'fld-024', label: 'Supporting Photos',    field_type: 'file',      options: '', is_required: false, order: 5, helper_text: '' },
    ],
  },
  {
    id:          'tpl-004',
    name:        'Equipment Log',
    description: 'Daily equipment usage and condition log',
    is_active:   false,
    fields: [
      { id: 'fld-030', label: 'Equipment Name',       field_type: 'text',      options: '', is_required: true,  order: 1, helper_text: '' },
      { id: 'fld-031', label: 'Hours Used',           field_type: 'number',    options: '', is_required: true,  order: 2, helper_text: '' },
      { id: 'fld-032', label: 'Condition',            field_type: 'select',    options: 'Good, Fair, Poor, Out of Service', is_required: true, order: 3, helper_text: '' },
    ],
  },
]

// ── Inline SVG icons ──────────────────────────────────────────────────────────
function IconPlus()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> }
function IconDoc()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h6l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M5.5 8h5M5.5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> }
function IconDrag()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="4.5" r="1" fill="currentColor"/><circle cx="5.5" cy="8"   r="1" fill="currentColor"/><circle cx="5.5" cy="11.5" r="1" fill="currentColor"/><circle cx="9.5" cy="4.5" r="1" fill="currentColor"/><circle cx="9.5" cy="8"   r="1" fill="currentColor"/><circle cx="9.5" cy="11.5" r="1" fill="currentColor"/></svg> }
function IconTrash()   { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3.5h11M4 3.5V2h6v1.5M3 3.5l.8 9h6.4l.8-9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconChevron() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 5.5l3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconSave()    { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h8l3 3v8a1 1 0 01-1 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><rect x="5" y="9" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 2v3.5h4V2" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg> }
function IconEye()     { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3"/></svg> }
function IconX()       { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="#314158" strokeWidth="1.5" strokeLinecap="round"/></svg> }

// ── Reusable toggle (Figma: green when on) ────────────────────────────────────
function Toggle({ checked, onChange, size = 'md' }) {
  const track = size === 'sm'
    ? 'w-[36px] h-[20px]'
    : 'w-[44px] h-[24px]'
  const thumb = size === 'sm'
    ? `w-[14px] h-[14px] top-[3px] ${checked ? 'translate-x-[19px]' : 'translate-x-[3px]'}`
    : `w-[18px] h-[18px] top-[3px] ${checked ? 'translate-x-[23px]' : 'translate-x-[3px]'}`
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 cursor-pointer ${track} ${checked ? 'bg-[#f54900]' : 'bg-[#cbd5e1]'}`}
    >
      <span className={`absolute rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.20)] transition-transform duration-200 ${thumb}`} />
    </button>
  )
}

// ── Create Template Modal ─────────────────────────────────────────────────────
function CreateTemplateModal({ onClose, onCreate }) {
  const [form, setForm]     = useState({ name: '', description: '', is_active: true })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Template name is required'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleCreate = () => {
    if (!validate()) return

    // ── API call — uncomment when backend ready ──────────────────────────
    // const apiBase = import.meta.env.VITE_API_BASE_URL
    // const res = await fetch(`${apiBase}safety-forms/create/`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     name:        form.name.trim(),
    //     description: form.description.trim(),
    //     is_active:   form.is_active,
    //   }),
    // })
    // const created = await res.json()
    // onCreate(created)
    // ── End API call ─────────────────────────────────────────────────────

    // Mock
    onCreate({
      id:          `tpl-${Date.now()}`,
      name:        form.name.trim(),
      description: form.description.trim(),
      is_active:   form.is_active,
      fields:      [],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-[460px] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.22)] overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f5f9]">
          <div>
            <h2 className="text-[#0f172b] font-bold text-[18px]">New Inspection Template</h2>
            <p className="text-[#90a1b9] text-[13px] mt-0.5">Create a blank form template</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#f8fafc] transition-colors">
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#0f172b] text-[14px] font-semibold">
              Template Name <span className="text-[#f54900]">*</span>
            </label>
            <input
              autoFocus
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Daily Vehicle Check"
              className={`w-full h-[38px] px-3 rounded-[8px] border text-[14px] text-[#0f172b] placeholder:text-[#90a1b9] transition-colors focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-[#c10007] bg-[#fef2f2] focus:ring-[#c10007]/20'
                  : 'border-[#e2e8f0] focus:ring-[#f54900]/25 focus:border-[#f54900]/60'
              }`}
            />
            {errors.name && <p className="text-[#c10007] text-[12px]">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#0f172b] text-[14px] font-semibold">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of this form's purpose…"
              className="w-full px-3 py-2 rounded-[8px] border border-[#e2e8f0] text-[14px] text-[#0f172b] placeholder:text-[#90a1b9] resize-none focus:outline-none focus:ring-2 focus:ring-[#f54900]/25 focus:border-[#f54900]/60 transition-colors"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
            <div>
              <p className="text-[#0f172b] text-[13px] font-semibold">Active</p>
              <p className="text-[#90a1b9] text-[12px]">Activate this template immediately</p>
            </div>
            <Toggle checked={form.is_active} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f1f5f9]">
          <button onClick={onClose}
            className="px-4 py-[9px] rounded-[10px] border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold hover:bg-[#f8fafc] transition-colors">
            Cancel
          </button>
          <button onClick={handleCreate}
            className="px-5 py-[9px] rounded-[10px] bg-[#f54900] hover:bg-[#c73b00] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(245,73,0,0.3)]">
            Create Template
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Field type dropdown (custom, inline — Figma style) ────────────────────────
function FieldTypeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = FIELD_TYPES.find(t => t.value === value)

  // close on outside click
  useState(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  })

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full h-[34px] px-3 rounded-[7px] border border-[#e2e8f0] bg-white text-[13px] text-[#314158] hover:border-[#f54900]/40 transition-colors gap-2"
      >
        <span className={current ? 'text-[#0f172b]' : 'text-[#90a1b9]'}>
          {current?.label ?? 'Select type…'}
        </span>
        <span className="text-[#90a1b9] shrink-0"><IconChevron /></span>
      </button>
      {open && (
        <div className="absolute left-0 top-[38px] z-50 w-[180px] bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0px_8px_24px_rgba(15,23,43,0.12)] py-1.5 overflow-hidden">
          {FIELD_TYPES.map(t => (
            <button key={t.value} type="button"
              onClick={() => { onChange(t.value); setOpen(false) }}
              className={`flex items-center w-full px-3 py-[7px] text-[13px] transition-colors ${
                value === t.value
                  ? 'bg-[#fff4ee] text-[#f54900] font-semibold'
                  : 'text-[#314158] hover:bg-[#f8fafc]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Single field card (Figma-exact) ───────────────────────────────────────────
function FieldCard({
  field, index,
  onUpdate, onDelete,
  onDragStart, onDragOver, onDrop,
  isDragOver,
}) {
  const showOptions = TYPES_WITH_OPTIONS.includes(field.field_type)

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(index) }}
      onDrop={() => onDrop(index)}
      className={`bg-white border rounded-[12px] px-4 py-4 transition-all duration-150 ${
        isDragOver
          ? 'border-[#f54900] shadow-[0_0_0_2px_rgba(245,73,0,0.15)]'
          : 'border-[#e2e8f0]'
      }`}
    >
      <div className="flex items-start gap-3">

        {/* Drag handle */}
        <span className="mt-[10px] text-[#cad5e2] hover:text-[#90a1b9] cursor-grab active:cursor-grabbing shrink-0">
          <IconDrag />
        </span>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Row 1: Field Label input + Type select + REQ toggle */}
          <div className="flex items-end gap-3">

            {/* Field label */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <span className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px]">Field Label</span>
              <input
                value={field.label}
                onChange={e => onUpdate({ label: e.target.value })}
                placeholder="e.g. Vehicle Condition"
                className="w-full h-[34px] px-3 rounded-[7px] border border-[#e2e8f0] text-[13px] text-[#0f172b] placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50 transition-colors bg-white"
              />
            </div>

            {/* Type dropdown */}
            <div className="w-[160px] shrink-0 flex flex-col gap-1">
              <span className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px]">Type</span>
              <FieldTypeSelect value={field.field_type} onChange={v => onUpdate({ field_type: v, options: '' })} />
            </div>

            {/* REQ toggle */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <span className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px]">REQ</span>
              <Toggle checked={field.is_required} onChange={v => onUpdate({ is_required: v })} size="sm" />
            </div>

            {/* Delete */}
            <button
              type="button"
              onClick={onDelete}
              className="mb-[3px] text-[#cad5e2] hover:text-[#c10007] transition-colors shrink-0"
            >
              <IconTrash />
            </button>
          </div>

          {/* Row 2: Options (only for select / multi_select) */}
          {showOptions && (
            <div className="flex flex-col gap-1">
              <span className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px]">
                Options (comma separated)
              </span>
              <input
                value={field.options}
                onChange={e => onUpdate({ options: e.target.value })}
                placeholder="e.g. Good, Fair, Poor"
                className="w-full h-[34px] px-3 rounded-[7px] border border-[#e2e8f0] text-[13px] text-[#0f172b] placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50 transition-colors bg-white"
              />
            </div>
          )}

          {/* Row 3: Helper text (always visible) */}
          <div className="flex flex-col gap-1">
            <span className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px]">Helper Text</span>
            <input
              value={field.helper_text}
              onChange={e => onUpdate({ helper_text: e.target.value })}
              placeholder="Optional guidance shown below the field…"
              className="w-full h-[34px] px-3 rounded-[7px] border border-[#e2e8f0] text-[13px] text-[#0f172b] placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-[#f54900]/20 focus:border-[#f54900]/50 transition-colors bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ template, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-[540px] max-h-[80vh] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.22)] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f5f9]">
          <div>
            <p className="text-[#90a1b9] text-[11px] font-semibold uppercase tracking-[0.5px] mb-1">Form Preview</p>
            <h2 className="text-[#0f172b] font-bold text-[20px]">{template.name}</h2>
            {template.description && <p className="text-[#62748e] text-[13px] mt-0.5">{template.description}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] hover:bg-[#f8fafc] transition-colors">
            <IconX />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {template.fields.length === 0 ? (
            <p className="text-[#90a1b9] text-[14px] text-center py-8">No fields added yet.</p>
          ) : template.fields.map((f, i) => (
            <div key={f.id ?? i} className="flex flex-col gap-1.5">
              <label className="text-[#0f172b] text-[14px] font-semibold">
                {f.label || <span className="text-[#90a1b9] italic">Unlabeled field</span>}
                {f.is_required && <span className="text-[#f54900] ml-0.5">*</span>}
              </label>
              {f.helper_text && <p className="text-[#90a1b9] text-[12px] -mt-0.5">{f.helper_text}</p>}

              {f.field_type === 'text'         && <input disabled placeholder="Text input…" className="h-[36px] px-3 border border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] text-[13px] text-[#90a1b9]" />}
              {f.field_type === 'textarea'     && <textarea disabled rows={3} placeholder="Multi-line text…" className="px-3 py-2 border border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] text-[13px] text-[#90a1b9] resize-none" />}
              {f.field_type === 'number'       && <input disabled type="number" placeholder="0" className="h-[36px] px-3 border border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] text-[13px] text-[#90a1b9] w-[160px]" />}
              {f.field_type === 'date'         && <input disabled type="date" className="h-[36px] px-3 border border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] text-[13px] text-[#90a1b9] w-[200px]" />}
              {f.field_type === 'time'         && <input disabled type="time" className="h-[36px] px-3 border border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] text-[13px] text-[#90a1b9] w-[160px]" />}
              {f.field_type === 'file'         && <div className="h-[36px] px-3 border border-dashed border-[#e2e8f0] rounded-[7px] bg-[#f8fafc] flex items-center text-[13px] text-[#90a1b9]">Choose file…</div>}
              {f.field_type === 'checkbox'     && <label className="flex items-center gap-2 cursor-not-allowed"><input disabled type="checkbox" className="w-4 h-4 rounded" /><span className="text-[13px] text-[#62748e]">{f.label}</span></label>}
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
  const [templates,       setTemplates]       = useState(MOCK_TEMPLATES)
  const [selectedId,      setSelectedId]      = useState(MOCK_TEMPLATES[0].id)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreview,     setShowPreview]     = useState(false)
  const [savedBanner,     setSavedBanner]     = useState(false)

  // Drag-and-drop state
  const dragIndexRef = useRef(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const selected = templates.find(t => t.id === selectedId)

  // ── Template helpers ───────────────────────────────────────────────────────
  const updateTemplate = useCallback((patch) => {
    setTemplates(prev => prev.map(t => t.id === selectedId ? { ...t, ...patch } : t))
  }, [selectedId])

  const addField = () => {
    const newField = {
      id:          `fld-${Date.now()}`,
      label:       '',
      field_type:  'text',
      options:     '',
      is_required: false,
      order:       (selected?.fields.length ?? 0) + 1,
      helper_text: '',
    }

    // ── API call — uncomment when backend ready ──────────────────────────
    // const apiBase = import.meta.env.VITE_API_BASE_URL
    // const res = await fetch(`${apiBase}safety-forms/${selectedId}/fields/add/`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     label:       newField.label,
    //     field_type:  newField.field_type,
    //     options:     newField.options,
    //     is_required: newField.is_required,
    //     order:       newField.order,
    //     helper_text: newField.helper_text,
    //   }),
    // })
    // const created = await res.json()
    // updateTemplate({ fields: [...selected.fields, { ...newField, id: created.id }] })
    // ── End API call ─────────────────────────────────────────────────────

    updateTemplate({ fields: [...(selected?.fields ?? []), newField] })
  }

  const updateField = (fieldId, patch) => {
    updateTemplate({
      fields: selected.fields.map(f => f.id === fieldId ? { ...f, ...patch } : f)
    })
  }

  const deleteField = (fieldId) => {
    updateTemplate({ fields: selected.fields.filter(f => f.id !== fieldId) })
  }

  // ── Save Changes ───────────────────────────────────────────────────────────
  const handleSave = () => {
    // ── API call — uncomment when backend ready ──────────────────────────
    // const apiBase = import.meta.env.VITE_API_BASE_URL
    // Patch template metadata:
    // await fetch(`${apiBase}safety-forms/${selectedId}/`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name: selected.name, description: selected.description, is_active: selected.is_active }),
    // })
    // ── End API call ─────────────────────────────────────────────────────

    setSavedBanner(true)
    setTimeout(() => setSavedBanner(false), 2500)
  }

  // ── Drag and drop reorder ──────────────────────────────────────────────────
  const handleDragStart = (index) => { dragIndexRef.current = index }
  const handleDragOver  = (index) => { setDragOverIndex(index) }
  const handleDrop      = (dropIndex) => {
    const from = dragIndexRef.current
    if (from == null || from === dropIndex) { setDragOverIndex(null); return }

    const fields = [...selected.fields]
    const [moved] = fields.splice(from, 1)
    fields.splice(dropIndex, 0, moved)

    // Reassign order values
    const reordered = fields.map((f, i) => ({ ...f, order: i + 1 }))
    updateTemplate({ fields: reordered })

    // ── API call — uncomment when backend ready ──────────────────────────
    // const apiBase = import.meta.env.VITE_API_BASE_URL
    // await fetch(`${apiBase}safety-forms/${selectedId}/fields/reorder/`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     fields: reordered.map(f => ({ id: f.id, order: f.order })),
    //   }),
    // })
    // ── End API call ─────────────────────────────────────────────────────

    dragIndexRef.current = null
    setDragOverIndex(null)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(tpl) => {
            setTemplates(prev => [...prev, tpl])
            setSelectedId(tpl.id)
          }}
        />
      )}
      {showPreview && selected && (
        <PreviewModal template={selected} onClose={() => setShowPreview(false)} />
      )}

      <div className="p-6 lg:p-8 flex flex-col gap-6 min-h-full">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[#0f172b] font-bold text-[26px] leading-[34px]">Safety Forms Manager</h1>
            <p className="text-[#62748e] text-[14px] mt-1">Configure inspection checklists and compliance forms</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {savedBanner && (
              <span className="text-[#007a55] text-[13px] font-semibold bg-[#ecfdf5] border border-[#d0fae5] px-3 py-1.5 rounded-[8px] transition-opacity">
                ✓ Changes saved
              </span>
            )}
            <button onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 h-[38px] px-4 rounded-[10px] border border-[#e2e8f0] bg-white text-[#314158] text-[14px] font-semibold hover:bg-[#f8fafc] transition-colors">
              <IconEye /> Preview Form
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-2 h-[38px] px-4 rounded-[10px] bg-[#007a55] hover:bg-[#006144] text-white text-[14px] font-semibold transition-colors shadow-[0px_1px_3px_rgba(0,122,85,0.30)]">
              <IconSave /> Save Changes
            </button>
          </div>
        </div>

        {/* ── Two-panel layout ── */}
        <div className="flex gap-5 flex-1 min-h-0 items-start">

          {/* ── LEFT: Template list ── */}
          <div className="w-[300px] shrink-0 bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
              <h2 className="text-[#0f172b] font-bold text-[15px]">Inspection Templates</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-[#fff4ee] text-[#f54900] hover:bg-[#ffe8d9] transition-colors"
              >
                <IconPlus />
              </button>
            </div>

            {/* Template rows */}
            <div className="py-1.5">
              {templates.map(tpl => {
                const isActive = tpl.id === selectedId
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedId(tpl.id)}
                    className={[
                      'flex items-center gap-3 w-full px-4 py-[11px] text-left transition-colors border-l-[3px]',
                      isActive
                        ? 'bg-[#fff4ee] border-l-[#f54900]'
                        : 'border-l-transparent hover:bg-[#f8fafc]',
                    ].join(' ')}
                  >
                    <span className={isActive ? 'text-[#f54900]' : 'text-[#90a1b9]'}>
                      <IconDoc />
                    </span>
                    <span className={`text-[14px] font-medium leading-[20px] ${isActive ? 'text-[#f54900]' : 'text-[#314158]'}`}>
                      {tpl.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── RIGHT: Form builder ── */}
          {selected ? (
            <div className="flex-1 min-w-0 bg-white border border-[#e2e8f0] rounded-[14px] overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.07)]">
              <div className="px-6 py-5 flex flex-col gap-5">

                {/* Form title row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-[#90a1b9] text-[11px] font-bold uppercase tracking-[0.6px]">Form Title</span>
                    <input
                      value={selected.name}
                      onChange={e => updateTemplate({ name: e.target.value })}
                      className="text-[#0f172b] font-bold text-[22px] leading-[30px] bg-transparent border-none outline-none focus:bg-[#f8fafc] focus:px-2 focus:rounded-[6px] transition-all placeholder:text-[#cad5e2] w-full"
                      placeholder="Form title…"
                    />
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 mt-4">
                    <span className="text-[#314158] text-[14px] font-medium">Active</span>
                    <Toggle checked={selected.is_active} onChange={v => updateTemplate({ is_active: v })} />
                  </div>
                </div>

                <div className="h-px bg-[#f1f5f9]" />

                {/* Field cards */}
                <div className="flex flex-col gap-4">
                  {selected.fields.length === 0 ? (
                    <div className="py-10 text-center border-2 border-dashed border-[#e2e8f0] rounded-[12px]">
                      <p className="text-[#90a1b9] text-[14px] font-medium">No fields yet</p>
                      <p className="text-[#cad5e2] text-[13px] mt-1">Click "Add New Field" below to get started</p>
                    </div>
                  ) : (
                    selected.fields.map((field, index) => (
                      <FieldCard
                        key={field.id}
                        field={field}
                        index={index}
                        onUpdate={patch => updateField(field.id, patch)}
                        onDelete={() => deleteField(field.id)}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        isDragOver={dragOverIndex === index}
                      />
                    ))
                  )}
                </div>

                {/* + Add New Field */}
                <button
                  onClick={addField}
                  className="flex items-center justify-center gap-2 w-full h-[48px] rounded-[12px] border-2 border-dashed border-[#e2e8f0] text-[#90a1b9] hover:border-[#f54900]/40 hover:text-[#f54900] hover:bg-[#fff9f7] transition-colors text-[14px] font-semibold"
                >
                  <IconPlus /> Add New Field
                </button>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-20 text-[#90a1b9] text-[14px]">
              Select a template from the left to start editing.
            </div>
          )}

        </div>
      </div>
    </>
  )
}