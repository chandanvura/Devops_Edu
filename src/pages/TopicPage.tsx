import { useParams, Navigate } from 'react-router-dom'
import { Bookmark, CheckCircle2 } from 'lucide-react'
import { getTopic } from '@/data/modules'
import { topicContent } from '@/modules/registry'
import { GenericTopicPage } from '@/components/ui/GenericTopicPage'
import { useProgress } from '@/store/progress'
import { cn } from '@/lib/cn'

export default function TopicPage() {
  const { moduleSlug = '', topicSlug = '' } = useParams()
  const topic = getTopic(moduleSlug, topicSlug)
  const key = `${moduleSlug}/${topicSlug}`
  const content = topicContent[key]

  const completed = useProgress((s) => s.completedTopics[key])
  const bookmarked = useProgress((s) => s.bookmarks[key])
  const toggleComplete = useProgress((s) => s.toggleComplete)
  const toggleBookmark = useProgress((s) => s.toggleBookmark)

  if (!topic) return <Navigate to={`/learn/${moduleSlug}`} replace />

  return (
    <div>
      <div className="mb-6 flex justify-end gap-2">
        <button
          onClick={() => toggleBookmark(key)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs',
            bookmarked ? 'border-amber-500 text-amber-400' : 'border-abyss-700 text-mist-500',
          )}
        >
          <Bookmark size={13} fill={bookmarked ? 'currentColor' : 'none'} />
          Bookmark
        </button>
        <button
          onClick={() => toggleComplete(key)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs',
            completed ? 'border-signal-500 text-signal-400' : 'border-abyss-700 text-mist-500',
          )}
        >
          <CheckCircle2 size={13} />
          {completed ? 'Completed' : 'Mark complete'}
        </button>
      </div>

      {content ? (
        <GenericTopicPage content={content} hasLab={topic.hasLab} />
      ) : (
        <div className="rounded-lg border border-dashed border-abyss-700 p-6">
          <h1 className="font-display text-xl font-semibold text-mist-100">{topic.title}</h1>
          <p className="mt-2 text-sm text-mist-500">
            Content for this topic is queued next in the build order — not written yet.
          </p>
        </div>
      )}
    </div>
  )
}
