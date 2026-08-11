import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Shell } from '@/components/layout/Shell'
import Home from '@/pages/Home'

// Route-level code splitting: Home ships eagerly (it's the landing page),
// everything else loads on demand so first paint stays light even as the
// content library (and reactflow, js-yaml, etc.) grows.
const ModulePage = lazy(() => import('@/pages/ModulePage'))
const TopicPage = lazy(() => import('@/pages/TopicPage'))
const Glossary = lazy(() => import('@/pages/Glossary'))
const Flashcards = lazy(() => import('@/pages/Flashcards'))
const InterviewMode = lazy(() => import('@/pages/InterviewMode'))
const Playground = lazy(() => import('@/pages/Playground'))
const Sync = lazy(() => import('@/pages/Sync'))

function PageFallback() {
  return <p className="text-sm text-mist-500">Loading…</p>
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="learn/:moduleSlug" element={<Suspense fallback={<PageFallback />}><ModulePage /></Suspense>} />
          <Route path="learn/:moduleSlug/:topicSlug" element={<Suspense fallback={<PageFallback />}><TopicPage /></Suspense>} />
          <Route path="glossary" element={<Suspense fallback={<PageFallback />}><Glossary /></Suspense>} />
          <Route path="flashcards" element={<Suspense fallback={<PageFallback />}><Flashcards /></Suspense>} />
          <Route path="interview" element={<Suspense fallback={<PageFallback />}><InterviewMode /></Suspense>} />
          <Route path="playground" element={<Suspense fallback={<PageFallback />}><Playground /></Suspense>} />
          <Route path="sync" element={<Suspense fallback={<PageFallback />}><Sync /></Suspense>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
