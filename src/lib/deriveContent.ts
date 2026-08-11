import { topicContent } from '@/modules/registry'
import { modules } from '@/data/modules'
import type { QuizQuestion } from '@/types'

export interface PoolQuestion extends QuizQuestion {
  moduleSlug: string
  moduleTitle: string
  topicSlug: string
  topicTitle: string
}

/** Every quiz question across every topic, flattened and tagged with its source. */
export function allQuestions(): PoolQuestion[] {
  const out: PoolQuestion[] = []
  for (const [key, content] of Object.entries(topicContent)) {
    const [moduleSlug, topicSlug] = key.split('/')
    const mod = modules.find((m) => m.slug === moduleSlug)
    if (!mod || !content.quiz) continue
    for (const q of content.quiz) {
      out.push({ ...q, moduleSlug, moduleTitle: mod.title, topicSlug, topicTitle: content.title })
    }
  }
  return out
}

export interface Flashcard {
  id: string
  front: string
  back: string
  moduleTitle: string
  topicTitle: string
}

/** Every quiz question reframed as a flashcard: prompt on front, correct answer + why on the back. */
export function allFlashcards(): Flashcard[] {
  return allQuestions().map((q) => ({
    id: q.id + '-' + q.moduleSlug + '-' + q.topicSlug,
    front: q.prompt,
    back: `${q.choices[q.correctIndex]}\n\n${q.explanation}`,
    moduleTitle: q.moduleTitle,
    topicTitle: q.topicTitle,
  }))
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
