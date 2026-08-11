// Central type contracts. Every module (docker, kubernetes, ...) implements
// these shapes so layout, search, progress, and the animation engine can
// stay generic and never branch on "which tool is this".

export type ModuleSlug =
  | 'docker'
  | 'kubernetes'
  | 'helm'
  | 'terraform'
  | 'ansible'
  | 'jenkins'
  | 'argocd'
  | 'aws'

export interface TopicSummary {
  slug: string
  title: string
  /** one-line teaser shown in nav / search results */
  blurb: string
  /** rough learning tier, used for the roadmap + filters */
  level: 'beginner' | 'intermediate' | 'advanced'
  hasAnimation: boolean
  hasLab: boolean
  hasQuiz: boolean
}

export interface ModuleDefinition {
  slug: ModuleSlug
  title: string
  tagline: string
  color: string // CSS var reference, e.g. 'var(--color-signal-500)'
  icon: string // lucide-react icon name, resolved by IconByName
  topics: TopicSummary[]
}

/** One node in an animated request/control-plane flow. */
export interface FlowNode {
  id: string
  label: string
  sublabel?: string
  /** protocol/action shown on the connecting edge INTO this node */
  via?: string
  icon?: string
}

export interface FlowDefinition {
  id: string
  title: string
  description: string
  nodes: FlowNode[]
}

export interface QuizQuestion {
  id: string
  prompt: string
  choices: string[]
  correctIndex: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface TopicContentSection {
  title: string
  body: string[] // paragraphs
  bullets?: string[]
}

export interface TopicCommand {
  command: string
  output?: string
}

export interface DependencyGraphSpec {
  nodes: { id: string; label: string; sublabel?: string }[]
  edges: { from: string; to: string }[]
}

export interface TopicContent {
  eyebrow: string // "Docker · Beginner"
  title: string
  intro: string
  flow?: FlowDefinition
  flowStepDuration?: number
  graph?: DependencyGraphSpec
  sections: TopicContentSection[]
  commands?: TopicCommand[]
  mistakes?: string[]
  quiz?: QuizQuestion[]
}

export interface UserProgress {
  completedTopics: Record<string, boolean>
  bookmarks: Record<string, boolean>
  notes: Record<string, string>
}
