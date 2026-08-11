import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { QuizQuestion } from '@/types'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 font-display text-lg font-semibold text-mist-100">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-mist-300">{children}</div>
    </section>
  )
}

/** Terminal-styled command/output block — used for "Real Commands" sections. */
export function CommandBlock({ command, output }: { command: string; output?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-abyss-700 bg-abyss-900 font-mono text-xs">
      <div className="flex items-center gap-1.5 border-b border-abyss-700 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-500/60" />
        <span className="h-2 w-2 rounded-full bg-amber-400/60" />
        <span className="h-2 w-2 rounded-full bg-signal-500/60" />
      </div>
      <div className="px-3 py-2">
        <p className="text-signal-400">
          <span className="text-mist-500">$ </span>
          {command}
        </p>
        {output && <pre className="mt-1 whitespace-pre-wrap text-mist-500">{output}</pre>}
      </div>
    </div>
  )
}

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  return (
    <div className="space-y-4">
      {questions.map((q) => {
        const picked = answers[q.id]
        const isRevealed = revealed[q.id]
        return (
          <div key={q.id} className="rounded-lg border border-abyss-700 p-4">
            <p className="mb-3 text-sm text-mist-100">{q.prompt}</p>
            <div className="grid gap-2">
              {q.choices.map((choice, i) => {
                const isCorrect = i === q.correctIndex
                const isPicked = picked === i
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setAnswers((a) => ({ ...a, [q.id]: i }))
                      setRevealed((r) => ({ ...r, [q.id]: true }))
                    }}
                    className={cn(
                      'rounded-md border px-3 py-2 text-left text-xs transition-colors',
                      isRevealed && isCorrect && 'border-signal-500 bg-signal-500/10 text-signal-400',
                      isRevealed && isPicked && !isCorrect && 'border-red-500/60 bg-red-500/10 text-red-300',
                      !isRevealed && 'border-abyss-700 text-mist-300 hover:border-abyss-600',
                      isRevealed && !isPicked && !isCorrect && 'border-abyss-700 text-mist-500',
                    )}
                  >
                    {choice}
                  </button>
                )
              })}
            </div>
            {isRevealed && <p className="mt-2 text-xs text-mist-500">{q.explanation}</p>}
          </div>
        )
      })}
    </div>
  )
}
