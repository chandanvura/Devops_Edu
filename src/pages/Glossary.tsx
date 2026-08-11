import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { glossary } from '@/data/glossary'

export default function Glossary() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return glossary
    return glossary.filter((g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q))
  }, [query])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof glossary>()
    for (const g of filtered) {
      if (!map.has(g.module)) map.set(g.module, [])
      map.get(g.module)!.push(g)
    }
    return map
  }, [filtered])

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-mist-100">Glossary</h1>
        <p className="mt-1 text-sm text-mist-500">Every term used across the site, in one searchable place.</p>
      </header>

      <div className="relative mb-8 max-w-md">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mist-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms…"
          className="w-full rounded-lg border border-abyss-700 bg-abyss-900 py-2 pl-8 pr-3 text-sm text-mist-100 placeholder:text-mist-500 focus:border-signal-500 focus:outline-none"
        />
      </div>

      {grouped.size === 0 && <p className="text-sm text-mist-500">No terms match "{query}".</p>}

      <div className="space-y-8">
        {[...grouped.entries()].map(([module, terms]) => (
          <section key={module}>
            <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-signal-400">{module}</h2>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {terms.map((g) => (
                <div key={g.term} className="rounded-lg border border-abyss-700 bg-abyss-900/40 p-4">
                  <dt className="font-display text-sm font-semibold text-mist-100">{g.term}</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-mist-500">{g.definition}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  )
}
