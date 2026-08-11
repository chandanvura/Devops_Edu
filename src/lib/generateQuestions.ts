import { glossary } from '@/data/glossary'
import { shuffle } from './deriveContent'
import type { QuizQuestion } from '@/types'

/**
 * Builds fresh multiple-choice questions from the glossary every time it's
 * called: "which term does this definition describe?", with distractors
 * drawn from the same module. Genuinely generated per-session (not a fixed
 * bank), just template-based rather than LLM-based — a static site with no
 * backend has no safe way to call a real model without exposing an API key.
 */
export function generateGlossaryQuestions(count = 10): QuizQuestion[] {
  const pool = shuffle(glossary).slice(0, count)
  return pool.map((entry, i) => {
    const sameModule = glossary.filter((g) => g.module === entry.module && g.term !== entry.term)
    const distractors = shuffle(sameModule).slice(0, 3).map((d) => d.term)
    // pad with cross-module terms if a module has too few entries
    while (distractors.length < 3) {
      const filler = shuffle(glossary.filter((g) => g.term !== entry.term && !distractors.includes(g.term)))[0]
      if (!filler) break
      distractors.push(filler.term)
    }
    const choices = shuffle([entry.term, ...distractors])
    return {
      id: `gen-${i}-${entry.term}`,
      prompt: `Which ${entry.module} term does this describe: "${entry.definition}"`,
      choices,
      correctIndex: choices.indexOf(entry.term),
      explanation: `${entry.term} — ${entry.definition}`,
      difficulty: 'medium',
    }
  })
}
