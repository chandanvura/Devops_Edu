import { useState, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { allQuestions, shuffle } from '@/lib/deriveContent'
import { generateGlossaryQuestions } from '@/lib/generateQuestions'
import { modules } from '@/data/modules'
import { cn } from '@/lib/cn'
import type { QuizQuestion } from '@/types'

type Difficulty = 'all' | 'easy' | 'medium' | 'hard'
type Source = 'curated' | 'generated'

type SessionQuestion = QuizQuestion & { moduleTitle?: string }

export default function InterviewMode() {
  const pool = useMemo(() => allQuestions(), [])
  const [moduleFilter, setModuleFilter] = useState('all')
  const [difficulty, setDifficulty] = useState<Difficulty>('all')
  const [source, setSource] = useState<Source>('curated')
  const [session, setSession] = useState<SessionQuestion[] | null>(null)
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)

  const available = useMemo(
    () =>
      pool.filter(
        (q) =>
          (moduleFilter === 'all' || q.moduleTitle === moduleFilter) &&
          (difficulty === 'all' || q.difficulty === difficulty),
      ),
    [pool, moduleFilter, difficulty],
  )

  function start() {
    if (source === 'generated') {
      setSession(generateGlossaryQuestions(10))
    } else {
      setSession(shuffle(available).slice(0, Math.min(10, available.length)))
    }
    setCurrent(0)
    setScore(0)
    setPicked(null)
  }

  function answer(i: number) {
    if (picked !== null || !session) return
    setPicked(i)
    if (i === session[current].correctIndex) setScore((s) => s + 1)
  }

  function nextQuestion() {
    setPicked(null)
    setCurrent((c) => c + 1)
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-lg">
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-mist-100">Interview Mode</h1>
          <p className="mt-1 text-sm text-mist-500">
            {pool.length} questions across every module — easy fundamentals to production-debugging scenarios.
          </p>
        </header>

        <div className="space-y-4 rounded-xl border border-abyss-700 bg-abyss-900/40 p-5">
          <div>
            <label className="mb-1.5 block text-xs text-mist-500">Question source</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSource('curated')}
                className={cn('flex-1 rounded-lg border px-3 py-1.5 text-xs', source === 'curated' ? 'border-signal-500 bg-signal-500/10 text-signal-400' : 'border-abyss-700 text-mist-500')}
              >
                Curated bank
              </button>
              <button
                onClick={() => setSource('generated')}
                className={cn('flex-1 rounded-lg border px-3 py-1.5 text-xs', source === 'generated' ? 'border-signal-500 bg-signal-500/10 text-signal-400' : 'border-abyss-700 text-mist-500')}
              >
                Auto-generated
              </button>
            </div>
            {source === 'generated' && (
              <p className="mt-1.5 text-[10px] text-mist-500">
                Freshly built each session from the glossary — template-based, not model-generated (a static site
                can't safely call an LLM API without exposing a key).
              </p>
            )}
          </div>

          {source === 'curated' && (
            <>
              <div>
                <label className="mb-1.5 block text-xs text-mist-500">Module</label>
                <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="w-full rounded-lg border border-abyss-700 bg-abyss-900 px-3 py-2 text-sm text-mist-100">
                  <option value="all">All modules</option>
                  {modules.map((m) => <option key={m.slug} value={m.title}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-mist-500">Difficulty</label>
                <div className="flex gap-2">
                  {(['all', 'easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-1.5 text-xs capitalize',
                        difficulty === d ? 'border-signal-500 bg-signal-500/10 text-signal-400' : 'border-abyss-700 text-mist-500',
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-mist-500">{available.length} questions match this filter.</p>
            </>
          )}

          <button
            onClick={start}
            disabled={source === 'curated' && available.length === 0}
            className="w-full rounded-lg bg-signal-500 py-2.5 text-sm font-semibold text-abyss-950 disabled:opacity-40"
          >
            Start session ({source === 'generated' ? 10 : Math.min(10, available.length)} questions)
          </button>
        </div>
      </div>
    )
  }

  if (current >= session.length) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-display text-2xl font-semibold text-mist-100">Session complete</h1>
        <p className="mt-2 text-4xl font-display font-bold text-signal-400">{score}/{session.length}</p>
        <button onClick={() => setSession(null)} className="mt-6 flex items-center gap-1.5 mx-auto rounded-lg border border-abyss-700 px-4 py-2 text-xs text-mist-300 hover:border-signal-500">
          <RefreshCw size={13} /> New session
        </button>
      </div>
    )
  }

  const q = session[current]

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex items-center justify-between text-xs text-mist-500">
        <span>Question {current + 1} / {session.length}</span>
        <span>Score: {score}</span>
      </div>
      <div className="rounded-xl border border-abyss-700 bg-abyss-900/40 p-5">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-signal-400">{q.moduleTitle ?? 'Generated'} · {q.difficulty}</p>
        <p className="mb-4 text-sm text-mist-100">{q.prompt}</p>
        <div className="grid gap-2">
          {q.choices.map((c, i) => {
            const isCorrect = i === q.correctIndex
            const isPicked = picked === i
            return (
              <button
                key={i}
                onClick={() => answer(i)}
                className={cn(
                  'rounded-md border px-3 py-2 text-left text-xs',
                  picked !== null && isCorrect && 'border-signal-500 bg-signal-500/10 text-signal-400',
                  picked !== null && isPicked && !isCorrect && 'border-red-500/60 bg-red-500/10 text-red-300',
                  picked === null && 'border-abyss-700 text-mist-300 hover:border-abyss-600',
                  picked !== null && !isPicked && !isCorrect && 'border-abyss-700 text-mist-500',
                )}
              >
                {c}
              </button>
            )
          })}
        </div>
        {picked !== null && (
          <>
            <p className="mt-3 text-xs text-mist-500">{q.explanation}</p>
            <button onClick={nextQuestion} className="mt-4 w-full rounded-lg bg-signal-500 py-2 text-xs font-semibold text-abyss-950">
              {current + 1 === session.length ? 'Finish' : 'Next question'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
