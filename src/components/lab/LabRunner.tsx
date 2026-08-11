import { useState } from 'react'
import { Check, Terminal } from 'lucide-react'
import type { TopicCommand } from '@/types'
import { cn } from '@/lib/cn'

function normalize(s: string) {
  return s.trim().replace(/\s+/g, ' ')
}

export function LabRunner({ steps }: { steps: TopicCommand[] }) {
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [revealed, setRevealed] = useState<boolean[]>(() => steps.map(() => false))
  const [attempted, setAttempted] = useState(false)

  const step = steps[index]
  const isCorrect = normalize(input) === normalize(step.command)
  const done = revealed.every(Boolean)

  function submit() {
    setAttempted(true)
    if (isCorrect) {
      setRevealed((r) => {
        const next = [...r]
        next[index] = true
        return next
      })
    }
  }

  function next() {
    setInput('')
    setAttempted(false)
    setIndex((i) => Math.min(i + 1, steps.length - 1))
  }

  function skip() {
    setRevealed((r) => {
      const next = [...r]
      next[index] = true
      return next
    })
    setAttempted(false)
  }

  if (done) {
    return (
      <div className="rounded-xl border border-signal-500/40 bg-signal-500/5 p-6 text-center">
        <Check size={22} className="mx-auto mb-2 text-signal-400" />
        <p className="text-sm text-mist-100">Lab complete — every command run.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-abyss-700 bg-abyss-900/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-mist-500">
          <Terminal size={12} /> Step {index + 1} / {steps.length}
        </span>
        <button onClick={skip} className="text-[10px] text-mist-500 underline hover:text-mist-300">
          reveal &amp; skip
        </button>
      </div>

      <p className="mb-3 text-xs text-mist-300">Type the command for this step, then press Enter.</p>

      <div className="overflow-hidden rounded-lg border border-abyss-700 bg-abyss-900 font-mono text-xs">
        <div className="flex items-center gap-1.5 border-b border-abyss-700 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-red-500/60" />
          <span className="h-2 w-2 rounded-full bg-amber-400/60" />
          <span className="h-2 w-2 rounded-full bg-signal-500/60" />
        </div>
        <div className="flex items-center px-3 py-2">
          <span className="text-mist-500">$&nbsp;</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="flex-1 bg-transparent text-signal-400 outline-none"
            placeholder="type here…"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        {revealed[index] && step.output && (
          <pre className="whitespace-pre-wrap border-t border-abyss-700 px-3 py-2 text-mist-500">{step.output}</pre>
        )}
      </div>

      {attempted && !isCorrect && !revealed[index] && (
        <p className="mt-2 text-[11px] text-amber-400">Not quite — check the command and try again, or reveal it.</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={submit}
          className={cn('rounded-lg px-4 py-1.5 text-xs font-semibold', 'bg-signal-500 text-abyss-950')}
        >
          Run
        </button>
        {revealed[index] && (
          <button onClick={next} className="rounded-lg border border-abyss-700 px-4 py-1.5 text-xs text-mist-300 hover:border-signal-500">
            Next step
          </button>
        )}
      </div>
    </div>
  )
}
