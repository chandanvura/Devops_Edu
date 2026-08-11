import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Terminal, Menu } from 'lucide-react'
import { searchIndex } from '@/data/modules'
import { useProgress } from '@/store/progress'

export function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const completed = useProgress((s) => s.completionCount())

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return searchIndex()
      .filter((r) => r.title.toLowerCase().includes(q) || r.blurb.toLowerCase().includes(q))
      .slice(0, 6)
  }, [query])

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-abyss-700 bg-abyss-950/85 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-4 px-4">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg p-1.5 text-mist-300 hover:text-mist-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="flex items-center gap-2 font-display text-sm font-semibold text-mist-100">
          <Terminal size={18} className="text-signal-400" />
          <span className="hidden sm:inline">Visual DevOps University</span>
        </Link>

        <div className="relative ml-auto w-full max-w-sm">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, commands, YAML…"
            className="w-full rounded-lg border border-abyss-700 bg-abyss-900 py-2 pl-8 pr-3 text-xs text-mist-100 placeholder:text-mist-500 focus:border-signal-500 focus:outline-none"
          />
          {results.length > 0 && (
            <ul className="absolute left-0 right-0 top-11 rounded-lg border border-abyss-700 bg-abyss-900 shadow-xl">
              {results.map((r) => (
                <li key={r.path}>
                  <button
                    onClick={() => {
                      navigate(r.path)
                      setQuery('')
                    }}
                    className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-abyss-800"
                  >
                    <span className="text-xs font-medium text-mist-100">{r.title}</span>
                    <span className="text-[10px] text-mist-500">{r.moduleTitle} · {r.blurb}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="hidden items-center gap-1.5 text-[11px] text-mist-500 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-500" />
          {completed} topics completed
        </div>
      </div>
    </header>
  )
}
