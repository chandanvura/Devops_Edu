import { lazy, Suspense } from 'react'
import { FlowDiagram } from '@/components/animation/FlowDiagram'
import { Section, CommandBlock, Quiz } from '@/components/ui/TopicKit'
import { LabRunner } from '@/components/lab/LabRunner'
import type { TopicContent } from '@/types'

const DependencyGraph = lazy(() =>
  import('@/components/diagrams/DependencyGraph').then((m) => ({ default: m.DependencyGraph })),
)

export function GenericTopicPage({ content, hasLab }: { content: TopicContent; hasLab?: boolean }) {
  return (
    <article>
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-wide text-signal-400">{content.eyebrow}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-mist-100">{content.title}</h1>
        <p className="mt-2 text-sm text-mist-500">{content.intro}</p>
      </header>

      {content.flow && (
        <Section title="Animation">
          <FlowDiagram flow={content.flow} stepDuration={content.flowStepDuration ?? 1400} />
        </Section>
      )}

      {content.graph && (
        <Section title="Dependency graph">
          <Suspense fallback={<p className="text-xs text-mist-500">Loading graph…</p>}>
            <DependencyGraph spec={content.graph} />
          </Suspense>
        </Section>
      )}

      {content.sections.map((s) => (
        <Section key={s.title} title={s.title}>
          {s.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {s.bullets && (
            <ul className="list-disc space-y-1.5 pl-5">
              {s.bullets.map((b, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
              ))}
            </ul>
          )}
        </Section>
      ))}

      {content.commands && content.commands.length > 0 && (
        <Section title="Real commands">
          {content.commands.map((c, i) => (
            <CommandBlock key={i} command={c.command} output={c.output} />
          ))}
        </Section>
      )}

      {hasLab && content.commands && content.commands.length > 0 && (
        <Section title="Hands-on lab">
          <LabRunner steps={content.commands} />
        </Section>
      )}

      {content.mistakes && content.mistakes.length > 0 && (
        <Section title="Common mistakes">
          <ul className="list-disc space-y-1 pl-5">
            {content.mistakes.map((m, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: m }} />
            ))}
          </ul>
        </Section>
      )}

      {content.quiz && content.quiz.length > 0 && (
        <Section title="Quiz">
          <Quiz questions={content.quiz} />
        </Section>
      )}
    </article>
  )
}
