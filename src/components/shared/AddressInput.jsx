import { useState, useEffect, useRef, useCallback } from 'react'
import debounce from 'lodash.debounce'
import FormInput from './FormInput'

export default function AddressInput({ label, id, value, onChange, placeholder = '', icon }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const ref = useRef(null)

  const apiKey = import.meta.env.VITE_AWS_LOCATION_API_KEY
  const region = import.meta.env.VITE_AWS_LOCATION_REGION || 'ap-southeast-2'
  const index = import.meta.env.VITE_AWS_LOCATION_INDEX

  const fetchSuggestions = async (q) => {
    if (!apiKey || !index) return setResults([])
    try {
      const base = `https://places.geo.${region}.amazonaws.com/places/v0/indexes/${index}/search/suggestions`
      const url = `${base}?text=${encodeURIComponent(q)}&key=${apiKey}`
      const res = await fetch(url)
      if (!res.ok) return setResults([])
      const json = await res.json()
      setResults(Array.isArray(json.Results) ? json.Results : [])
    } catch (e) {
      setResults([])
    }
  }

  const debounced = useCallback(debounce((q) => {
    if (q.length < 3) return setResults([])
    fetchSuggestions(q)
  }, 300), [apiKey, region, index])

  useEffect(() => {
    return () => debounced.cancel && debounced.cancel()
  }, [debounced])

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      return
    }
    debounced(query)
  }, [query, debounced])

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleSelect = (text) => {
    onChange?.(text)
    setQuery(text)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-[6px]" ref={ref}>
      <label htmlFor={id} className="text-[#0f172b] text-[14px] font-semibold leading-[20px]">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">{icon && icon()}</div>
        <input id={id} type="text" value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={['w-full h-[38px] rounded-[8px] border text-[14px] pl-9 pr-3 py-[9px] placeholder:text-[#90a1b9] text-[#0f172b] focus:outline-none focus:ring-2',
            'border-[#e2e8f0] bg-white focus:ring-[#f54900]/25 focus:border-[#f54900]/60'].join(' ')} />

        {open && results && results.length > 0 && (
          <div className="absolute left-0 top-[42px] z-50 w-full bg-white border border-[#e2e8f0] rounded-[10px] shadow-[0px_8px_24px_rgba(15,23,43,0.12)] max-h-[220px] overflow-y-auto py-1">
            {results.map((r, i) => (
              <button key={r.PlaceId ?? i} type="button" onMouseDown={() => handleSelect(r.Text)}
                className="flex items-center gap-3 w-full px-4 py-[10px] hover:bg-[#f8fafc] text-left">
                <div className="min-w-0">
                  <p className="text-[13px] text-[#0f172b] font-semibold truncate">{r.Text}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
