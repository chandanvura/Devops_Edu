import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProgress } from '@/types'

export interface FlashcardState {
  level: number // 0 = just missed, higher = better known
  dueAt: number // ms epoch; card is "due" once now >= dueAt
}

interface ProgressState extends UserProgress {
  flashcardsState: Record<string, FlashcardState>
  toggleComplete: (topicKey: string) => void
  toggleBookmark: (topicKey: string) => void
  setNote: (topicKey: string, note: string) => void
  reviewFlashcard: (cardId: string, remembered: boolean) => void
  completionCount: () => number
}

// SM-2-lite interval ladder, in ms. Missing a card resets to level 0.
const INTERVALS_MS = [
  0,
  10 * 60 * 1000, // 10 min
  60 * 60 * 1000, // 1 hour
  24 * 60 * 60 * 1000, // 1 day
  3 * 24 * 60 * 60 * 1000, // 3 days
  7 * 24 * 60 * 60 * 1000, // 1 week
  30 * 24 * 60 * 60 * 1000, // 1 month
]

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedTopics: {},
      bookmarks: {},
      notes: {},
      flashcardsState: {},
      toggleComplete: (topicKey) =>
        set((s) => ({ completedTopics: { ...s.completedTopics, [topicKey]: !s.completedTopics[topicKey] } })),
      toggleBookmark: (topicKey) =>
        set((s) => ({ bookmarks: { ...s.bookmarks, [topicKey]: !s.bookmarks[topicKey] } })),
      setNote: (topicKey, note) => set((s) => ({ notes: { ...s.notes, [topicKey]: note } })),
      reviewFlashcard: (cardId, remembered) =>
        set((s) => {
          const prev = s.flashcardsState[cardId]
          const nextLevel = remembered ? Math.min((prev?.level ?? 0) + 1, INTERVALS_MS.length - 1) : 0
          return {
            flashcardsState: {
              ...s.flashcardsState,
              [cardId]: { level: nextLevel, dueAt: Date.now() + INTERVALS_MS[nextLevel] },
            },
          }
        }),
      completionCount: () => Object.values(get().completedTopics).filter(Boolean).length,
    }),
    { name: 'devops-university-progress' },
  ),
)
