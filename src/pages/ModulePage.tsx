import { Link, useParams, Navigate } from 'react-router-dom'
import { getModule } from '@/data/modules'
import { IconByName } from '@/components/ui/IconByName'
import { CheckCircle2, Circle, Sparkles, FlaskConical, HelpCircle } from 'lucide-react'
import { useProgress } from '@/store/progress'

export default function ModulePage() {
  const { moduleSlug = '' } = useParams()
  const mod = getModule(moduleSlug)
  const completed = useProgress((s) => s.completedTopics)

  if (!mod) return <Navigate to="/" replace />

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <IconByName name={mod.icon} size={26} style={{ color: mod.color }} />
        <div>
          <h1 className="font-display text-2xl font-semibold text-mist-100">{mod.title}</h1>
          <p className="text-sm text-mist-500">{mod.tagline}</p>
        </div>
      </div>

      {mod.topics.length === 0 ? (
        <p className="rounded-lg border border-dashed border-abyss-700 p-6 text-sm text-mist-500">
          This module is scaffolded and next in the build queue — not yet populated.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {mod.topics.map((t) => {
            const key = `${mod.slug}/${t.slug}`
            const done = completed[key]
            return (
              <Link
                key={t.slug}
                to={`/learn/${mod.slug}/${t.slug}`}
                className="flex items-start gap-3 rounded-xl border border-abyss-700 bg-abyss-900/40 p-4 hover:border-abyss-600"
              >
                {done ? (
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-signal-400" />
                ) : (
                  <Circle size={18} className="mt-0.5 shrink-0 text-mist-500" />
                )}
                <div>
                  <h3 className="font-display text-sm font-semibold text-mist-100">{t.title}</h3>
                  <p className="mt-0.5 text-xs text-mist-500">{t.blurb}</p>
                  <div className="mt-2 flex gap-3 text-[10px] text-mist-500">
                    {t.hasAnimation && <span className="flex items-center gap-1"><Sparkles size={11} /> animated</span>}
                    {t.hasLab && <span className="flex items-center gap-1"><FlaskConical size={11} /> lab</span>}
                    {t.hasQuiz && <span className="flex items-center gap-1"><HelpCircle size={11} /> quiz</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
