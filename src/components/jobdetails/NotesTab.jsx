// src/components/jobdetails/NotesTab.jsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const NOTES_MOCK = [
  {
    author:  'Mike Ross',
    initial: 'MR',
    time:    'Today, 10:15 AM',
    content: 'Leak identified at junction point near valve bank 3. Ordering replacement PVC fittings. ETA 2 hours.',
  },
  {
    author:  'Sarah Lee',
    initial: 'SL',
    time:    'Today, 09:30 AM',
    content: 'Safety form submitted and approved. Site access confirmed with gate security.',
  },
]

export default function NotesTab() {
  const { jobId } = useParams()
  const [note, setNote] = useState('')

  return (
    <div className="flex flex-col gap-5">

      {/* Existing notes */}
      <div className="flex flex-col gap-4">
        {NOTES_MOCK.map((n, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0 text-[12px] font-bold text-[#45556c]">
              {n.initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#0f172b] text-[14px] font-semibold">{n.author}</span>
                <span className="text-[#90a1b9] text-[12px]">{n.time}</span>
              </div>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[10px] px-4 py-3">
                <p className="text-[#45556c] text-[14px] leading-[22px]">{n.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New note input */}
      <div className="flex flex-col gap-2">
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note or communication log..."
          rows={3}
          className="w-full bg-white border border-[#e2e8f0] rounded-[10px] px-4 py-3 text-[14px] leading-[22px] text-[#0f172b] placeholder:text-[#90a1b9] focus:outline-none focus:ring-2 focus:ring-[#f54900]/30 focus:border-[#f54900]/50 resize-none transition"
        />
        <div className="flex justify-between items-center">
          <Link to={`/admin/jobs/${jobId}/notes`} className="text-[#155dfc] text-[13px] hover:underline">
            View all communications →
          </Link>
          <button
            disabled={!note.trim()}
            className="px-4 py-[7px] bg-[#f54900] hover:bg-[#c73b00] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-[8px] transition-colors"
          >
            Add Note
          </button>
        </div>
      </div>
    </div>
  )
}
