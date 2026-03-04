// src/components/jobdetails/JobScopeTab.jsx
import { useState } from 'react'

// ── Checklist item ──────────────────────────────────────────────────────────
function ChecklistItem({ task, done: initialDone }) {
  const [checked, setChecked] = useState(initialDone)

  return (
    <label className="flex items-center gap-3 py-[9px] px-2 rounded-[8px] hover:bg-[#f8fafc] cursor-pointer transition-colors group">
      {/* Custom checkbox */}
      <div
        onClick={() => setChecked(v => !v)}
        className={[
          'w-5 h-5 rounded-[4px] flex items-center justify-center shrink-0 border transition-colors',
          checked
            ? 'bg-[#f54900] border-[#f54900]'
            : 'border-[#cad5e2] bg-white group-hover:border-[#f54900]/50',
        ].join(' ')}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6l2.5 2.5L9.5 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className={`text-[14px] leading-[20px] select-none ${checked ? 'text-[#90a1b9] line-through' : 'text-[#0f172b]'}`}>
        {task}
      </span>
    </label>
  )
}

// ── Line items table ────────────────────────────────────────────────────────
function LineItemsTable({ items, total }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-[#e2e8f0]">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
            <th className="px-4 py-[9px] text-left text-[13px] font-bold text-[#62748e] leading-[20px]">Item</th>
            <th className="px-4 py-[9px] text-center text-[13px] font-bold text-[#62748e] leading-[20px]">Qty</th>
            <th className="px-4 py-[9px] text-right text-[13px] font-bold text-[#62748e] leading-[20px]">Unit Price</th>
            <th className="px-4 py-[9px] text-right text-[13px] font-bold text-[#62748e] leading-[20px]">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, idx) => (
            <tr key={idx} className="border-b border-[#f1f5f9] last:border-b-0 hover:bg-[#fafafa] transition-colors">
              <td className="px-4 py-[11px] text-[#0f172b] text-[14px] leading-[20px]">{row.item}</td>
              <td className="px-4 py-[11px] text-[#45556c] text-[14px] leading-[20px] text-center">{row.qty}</td>
              <td className="px-4 py-[11px] text-[#45556c] text-[14px] leading-[20px] text-right font-['Consolas',monospace]">
                ${row.unitPrice.toFixed(2)}
              </td>
              <td className="px-4 py-[11px] text-[#0f172b] text-[14px] leading-[20px] text-right font-semibold font-['Consolas',monospace]">
                ${row.total.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[#f8fafc] border-t border-[#e2e8f0]">
            <td colSpan={3} className="px-4 py-[11px] text-right text-[14px] font-bold text-[#0f172b] leading-[20px]">
              Total Estimated
            </td>
            <td className="px-4 py-[11px] text-right text-[14px] font-bold text-[#0f172b] leading-[20px] font-['Consolas',monospace]">
              ${total.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── JobScopeTab ─────────────────────────────────────────────────────────────
export default function JobScopeTab({ job }) {
  const completedCount = job.checklist.filter(c => c.done).length
  const totalCount     = job.checklist.length

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start">

      {/* ── Left: Description + Line Items ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">

        {/* Description */}
        <div>
          <h4 className="text-[#0f172b] font-bold text-[14px] leading-[20px] mb-3">Description</h4>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] p-4">
            <p className="text-[#45556c] text-[14px] leading-[24px]">{job.description}</p>
          </div>
        </div>

        {/* Line Items */}
        <div>
          <h4 className="text-[#0f172b] font-bold text-[14px] leading-[20px] mb-3">Line Items</h4>
          <LineItemsTable items={job.lineItems} total={job.totalEstimated} />
        </div>
      </div>

      {/* ── Right: Task Checklist ── */}
      <div className="w-full xl:w-[366px] shrink-0">
        <div className="bg-white border border-[#e2e8f0] rounded-[14px] p-5">
          {/* Checklist header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[#0f172b] font-bold text-[14px] leading-[20px]">Task Checklist</h4>
            <span className="text-[12px] text-[#62748e] leading-[16px] font-medium">
              {completedCount}/{totalCount} Completed
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-[#f54900] rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>

          {/* Checklist items */}
          <div className="flex flex-col">
            {job.checklist.map((item, idx) => (
              <ChecklistItem key={idx} task={item.task} done={item.done} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
