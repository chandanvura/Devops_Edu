import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { RotateCw, ThumbsUp, ThumbsDown, Shuffle } from 'lucide-react'
import { allFlashcards, shuffle } from '@/lib/deriveContent'
import { modules } from '@/data/modules'
import { useProgress } from '@/store/progress'

export default function Flashcards() {
  const all = useMemo(() => allFlashcards(), [])
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [shuffleSeed, setShuffleSeed] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const flashcardsState = useProgress((s) => s.flashcardsState)
  const reviewFlashcard = useProgress((s) => s.reviewFlashcard)

  // Due cards (never seen, or past their spaced-repetition interval) sort first;
  // not-yet-due cards fill in after, so the deck never runs dry.
  const deck = useMemo(() => {
    const now = Date.now()
    const filtered = moduleFilter === 'all' ? all : all.filter((c) => c.moduleTitle === moduleFilter)
    const due = filtered.filter((c) => !flashcardsState[c.id] || flashcardsState[c.id].dueAt <= now)
    const notDue = filtered.filter((c) => flashcardsState[c.id] && flashcardsState[c.id].dueAt > now)
    return [...shuffle(due), ...shuffle(notDue)]
    // shuffleSeed forces a fresh shuffle on demand without changing filter/state deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, moduleFilter, shuffleSeed])

  const [index, setIndex] = useState(0)
  const card = deck[index % Math.max(deck.length, 1)]
  const knownCount = Object.values(flashcardsState).filter((s) => s.level >= 2).length

  function next(remembered: boolean) {
    if (card) reviewFlashcard(card.id, remembered)
    setFlipped(false)
    setIndex((i) => (i + 1) % Math.max(deck.length, 1))
  }

  function reshuffle() {
    setShuffleSeed((s) => s + 1)
    setIndex(0)
    setFlipped(false)
  }

  if (!card) return <p className="text-sm text-mist-500">No cards for this filter.</p>

  const dueNow = deck.filter((c) => !flashcardsState[c.id] || flashcardsState[c.id].dueAt <= Date.now()).length

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-mist-100">Flashcards</h1>
          <p className="mt-1 text-sm text-mist-500">
            {dueNow} due now · {knownCount} well-known
          </p>
        </div>
        <button onClick={reshuffle} className="flex items-center gap-1.5 rounded-lg border border-abyss-700 px-3 py-1.5 text-xs text-mist-300 hover:border-signal-500">
          <Shuffle size={13} /> Reshuffle
        </button>
      </header>

      <select
        value={moduleFilter}
        onChange={(e) => {
          setModuleFilter(e.target.value)
          setIndex(0)
          setFlipped(false)
        }}
        className="mb-6 rounded-lg border border-abyss-700 bg-abyss-900 px-3 py-2 text-xs text-mist-100"
      >
        <option value="all">All modules</option>
        {modules.map((m) => (
          <option key={m.slug} value={m.title}>{m.title}</option>
        ))}
      </select>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="relative h-64 w-full [perspective:1200px]"
      >
        <motion.div
          className="relative h-full w-full rounded-2xl border border-abyss-700 bg-abyss-900 [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 [backface-visibility:hidden]">
            <span className="font-mono text-[10px] uppercase tracking-wide text-signal-400">{card.moduleTitle} · {card.topicTitle}</span>
            <p className="text-center text-sm text-mist-100">{card.front}</p>
            <span className="mt-2 flex items-center gap-1 text-[10px] text-mist-500"><RotateCw size={11} /> tap to flip</span>
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 [backface-visibility:hidden]"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <p className="whitespace-pre-line text-center text-sm text-signal-400">{card.back}</p>
          </div>
        </motion.div>
      </button>

      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => next(false)}
          className="flex items-center gap-1.5 rounded-lg border border-abyss-700 px-4 py-2 text-xs text-mist-300 hover:border-red-500/60 hover:text-red-300"
        >
          <ThumbsDown size={13} /> Still learning
        </button>
        <button
          onClick={() => next(true)}
          className="flex items-center gap-1.5 rounded-lg border border-abyss-700 px-4 py-2 text-xs text-mist-300 hover:border-signal-500 hover:text-signal-400"
        >
          <ThumbsUp size={13} /> Know it
        </button>
      </div>
      <p className="mt-4 text-center text-[10px] text-mist-500">
        "Know it" pushes this card further out (10min → 1hr → 1day → 3day → week → month). "Still learning" brings it right back.
      </p>
    </div>
  )
}
