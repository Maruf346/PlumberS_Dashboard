// src/components/editjob/DeleteJobModal.jsx

function IconAlertTriangle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="#c10007" strokeWidth="1.6" strokeLinejoin="round" fill="#fef2f2"/>
      <path d="M12 9v4M12 17h.01" stroke="#c10007" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

export default function DeleteJobModal({ jobId, loading, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172b]/40 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-[400px] bg-white rounded-[16px] shadow-[0px_20px_60px_rgba(15,23,43,0.25)] overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start gap-4 px-6 pt-6 pb-4">
          <div className="w-11 h-11 rounded-full bg-[#fef2f2] border border-[#ffe2e2] flex items-center justify-center shrink-0">
            <IconAlertTriangle />
          </div>
          <div className="min-w-0">
            <h3 className="text-[#0f172b] font-bold text-[17px] leading-[24px]">Delete Job</h3>
            <p className="text-[#62748e] text-[14px] leading-[22px] mt-1">
              Are you sure you want to delete&nbsp;
              <span className="font-['Consolas',monospace] font-bold text-[#f54900]">{jobId}</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Warning box */}
        <div className="mx-6 mb-5 bg-[#fef2f2] border border-[#ffe2e2] rounded-[8px] px-4 py-3">
          <p className="text-[#c10007] text-[13px] leading-[20px]">
            All associated files, safety records, reports, line items and activity logs will be permanently deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f1f5f9]">
          <button onClick={onCancel} disabled={loading}
            className="px-4 py-[9px] bg-white border border-[#e2e8f0] text-[#314158] text-[14px] font-semibold rounded-[10px] hover:bg-[#f8fafc] disabled:opacity-40 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex items-center gap-2 px-4 py-[9px] bg-[#c10007] hover:bg-[#a30006] text-white text-[14px] font-semibold rounded-[10px] disabled:opacity-60 transition-colors shadow-[0px_1px_3px_rgba(193,0,7,0.3)]">
            {loading ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>Deleting…</> : 'Delete Job'}
          </button>
        </div>
      </div>
    </div>
  )
}
