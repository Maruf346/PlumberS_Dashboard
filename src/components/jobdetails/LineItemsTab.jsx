// src/components/jobdetails/LineItemsTab.jsx
// Replaces JobScopeTab — shows job description + editable line items
// POST/PATCH/DELETE /api/jobs/{id}/line-items/   /api/jobs/{id}/line-items/{item_id}/
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { apiFetch } from '@/utils/apiFetch'

function IconPlus()  { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg> }
function IconEdit()  { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 1.5l3 3-7 7H1.5v-3l7-7z" stroke="#62748e" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconTrash() { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3h10M4 3V1.5h5V3M4.5 5.5v4M8.5 5.5v4M2 3l1 9h7l1-9" stroke="#c10007" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function IconSave()  { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 11H2a.5.5 0 01-.5-.5v-9A.5.5 0 012 1h7l2.5 2.5v7a.5.5 0 01-.5.5z" stroke="white" strokeWidth="1.1" strokeLinejoin="round"/><rect x="4" y="7.5" width="5" height="4" rx=".3" stroke="white" strokeWidth="1"/><path d="M4.5 1v3h3V1" stroke="white" strokeWidth="1.1" strokeLinejoin="round"/></svg> }
function IconX()     { return <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 2.5l8 8M10.5 2.5l-8 8" stroke="#62748e" strokeWidth="1.2" strokeLinecap="round"/></svg> }

// ── Editable row (add/edit mode) ─────────────────────────────────────────────
function EditRow({ initial, onSave, onCancel, saving }) {
  const [item,       setItem]      = useState(initial?.item       ?? '')
  const [quantity,   setQuantity]  = useState(initial?.quantity   ?? '')
  const [unit_price, setUnitPrice] = useState(initial?.unit_price ?? '')

  const inputCls = "w-full h-[32px] border border-[#e2e8f0] rounded-[6px] px-2 text-[13px] text-[#0f172b] focus:outline-none focus:ring-1 focus:ring-[#f54900]/30 focus:border-[#f54900]/50 bg-white"

  return (
    <tr className="border-b border-[#f1f5f9] bg-[#fff7f5]">
      <td className="px-4 py-2"><input className={inputCls} value={item} onChange={e => setItem(e.target.value)} placeholder="Item description" /></td>
      <td className="px-4 py-2 w-[90px]"><input className={inputCls + ' text-center'} value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" type="number" min="0" step="0.01"/></td>
      <td className="px-4 py-2 w-[110px]"><input className={inputCls + ' text-right'} value={unit_price} onChange={e => setUnitPrice(e.target.value)} placeholder="0.00" type="number" min="0" step="0.01"/></td>
      <td className="px-4 py-2 w-[100px] text-right text-[13px] text-[#45556c] font-['Consolas',monospace]">
        {quantity && unit_price ? `$${(parseFloat(quantity) * parseFloat(unit_price)).toFixed(2)}` : '—'}
      </td>
      <td className="px-4 py-2 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onSave({ item, quantity, unit_price })} disabled={saving || !item.trim()}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#f54900] hover:bg-[#c73b00] text-white text-[12px] font-semibold rounded-[6px] disabled:opacity-40 transition-colors">
            {saving ? <div className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin"/> : <IconSave/>}
            {saving ? '' : 'Save'}
          </button>
          <button onClick={onCancel}
            className="flex items-center justify-center w-6 h-6 rounded-[5px] hover:bg-[#f1f5f9] transition-colors">
            <IconX />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── LineItemsTab ──────────────────────────────────────────────────────────────
export default function LineItemsTab({ job, onJobUpdate }) {
  const [lineItems,  setLineItems]  = useState(job.line_items ?? [])
  const [editingId,  setEditingId]  = useState(null)
  const [addingNew,  setAddingNew]  = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const grandTotal = lineItems.reduce((sum, li) => sum + (parseFloat(li.total) || 0), 0)

  // ── Add ───────────────────────────────────────────────────────────────────
  const handleAdd = async ({ item, quantity, unit_price }) => {
    if (!item.trim()) return
    setSaving(true)
    const { data, ok } = await apiFetch(`jobs/${job.id}/line-items/`, {
      method: 'POST',
      body: JSON.stringify({ item, quantity: String(quantity), unit_price: String(unit_price), order: lineItems.length }),
    })
    if (ok && data) {
      // Compute total locally in case the API doesn't return it on the new item
      const newItem = { ...data, total: data.total ?? (parseFloat(quantity || 0) * parseFloat(unit_price || 0)) }
      setLineItems(prev => [...prev, newItem])
      setAddingNew(false)
      // Refresh job so tab remounts (switching tabs and back) see the latest line_items
      onJobUpdate?.()
    }
    setSaving(false)
  }

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async (id, { item, quantity, unit_price }) => {
    setSaving(true)
    const { data, ok } = await apiFetch(`jobs/${job.id}/line-items/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ item, quantity: String(quantity), unit_price: String(unit_price) }),
    })
    if (ok && data) {
      const updated = { ...data, total: data.total ?? (parseFloat(quantity || 0) * parseFloat(unit_price || 0)) }
      setLineItems(prev => prev.map(li => li.id === id ? updated : li))
      setEditingId(null)
      onJobUpdate?.() // keep job prop in sync for tab remounts
    }
    setSaving(false)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeletingId(id)
    const { ok } = await apiFetch(`jobs/${job.id}/line-items/${id}/`, { method: 'DELETE' })
    if (ok) {
      setLineItems(prev => prev.filter(li => li.id !== id))
      // Refresh job so the deleted item doesn't reappear when switching tabs and back
      onJobUpdate?.()
    }
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Description */}
      {job.job_details && (
        <div>
          <h4 className="text-[#0f172b] font-bold text-[14px] leading-[20px] mb-3">Description</h4>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-4">
            <p className="text-[#45556c] text-[14px] leading-[24px]">{job.job_details}</p>
          </div>
        </div>
      )}

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[#0f172b] font-bold text-[14px] leading-[20px]">Line Items</h4>
          {!addingNew && (
            <button onClick={() => { setAddingNew(true); setEditingId(null) }}
              className="flex items-center gap-1.5 text-[13px] text-[#f54900] font-semibold hover:text-[#c73b00] transition-colors">
              <IconPlus /> Add Item
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-[10px] border border-[#e2e8f0]">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <th className="px-4 py-[9px] text-left text-[13px] font-bold text-[#62748e]">Item</th>
                <th className="px-4 py-[9px] text-center text-[13px] font-bold text-[#62748e]">Qty</th>
                <th className="px-4 py-[9px] text-right text-[13px] font-bold text-[#62748e]">Unit Price</th>
                <th className="px-4 py-[9px] text-right text-[13px] font-bold text-[#62748e]">Total</th>
                <th className="px-4 py-[9px]" />
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 && !addingNew && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#90a1b9] text-[14px]">No line items yet. Click "Add Item" to get started.</td></tr>
              )}

              {lineItems.map(li => editingId === li.id ? (
                <EditRow key={li.id}
                  initial={li}
                  saving={saving}
                  onSave={vals => handleUpdate(li.id, vals)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <tr key={li.id} className="border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#fafafa] group">
                  <td className="px-4 py-[11px] text-[#0f172b] text-[14px]">{li.item}</td>
                  <td className="px-4 py-[11px] text-[#45556c] text-[14px] text-center">{li.quantity}</td>
                  <td className="px-4 py-[11px] text-[#45556c] text-[14px] text-right font-['Consolas',monospace]">${parseFloat(li.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-[11px] text-[#0f172b] text-[14px] text-right font-semibold font-['Consolas',monospace]">${parseFloat(li.total).toFixed(2)}</td>
                  <td className="px-4 py-[11px] text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(li.id); setAddingNew(false) }}
                        className="flex items-center justify-center w-6 h-6 rounded-[5px] hover:bg-[#f1f5f9]">
                        <IconEdit />
                      </button>
                      <button onClick={() => handleDelete(li.id)} disabled={deletingId === li.id}
                        className="flex items-center justify-center w-6 h-6 rounded-[5px] hover:bg-[#fef2f2] disabled:opacity-40">
                        {deletingId === li.id ? <div className="w-3 h-3 rounded-full border border-[#c10007]/30 border-t-[#c10007] animate-spin"/> : <IconTrash />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Add new row */}
              {addingNew && (
                <EditRow saving={saving} onSave={handleAdd} onCancel={() => setAddingNew(false)} />
              )}
            </tbody>

            {lineItems.length > 0 && (
              <tfoot>
                <tr className="bg-[#f8fafc] border-t border-[#e2e8f0]">
                  <td colSpan={3} className="px-4 py-[11px] text-right text-[14px] font-bold text-[#0f172b]">Grand Total</td>
                  <td className="px-4 py-[11px] text-right text-[14px] font-bold text-[#0f172b] font-['Consolas',monospace]">${grandTotal.toFixed(2)}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
