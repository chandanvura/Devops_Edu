import { useRef, useState } from 'react'
import { Download, Upload, AlertTriangle } from 'lucide-react'
import { useProgress } from '@/store/progress'

export default function Sync() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; message: string } | null>(null)

  const completedCount = Object.values(useProgress((s) => s.completedTopics)).filter(Boolean).length
  const bookmarkCount = Object.values(useProgress((s) => s.bookmarks)).filter(Boolean).length
  const flashcardCount = Object.keys(useProgress((s) => s.flashcardsState)).length

  function exportData() {
    const state = useProgress.getState()
    const payload = {
      exportedAt: new Date().toISOString(),
      completedTopics: state.completedTopics,
      bookmarks: state.bookmarks,
      notes: state.notes,
      flashcardsState: state.flashcardsState,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `devops-university-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (typeof data !== 'object' || data === null) throw new Error('File is not a valid export')
        useProgress.setState((s) => ({
          completedTopics: { ...s.completedTopics, ...(data.completedTopics ?? {}) },
          bookmarks: { ...s.bookmarks, ...(data.bookmarks ?? {}) },
          notes: { ...s.notes, ...(data.notes ?? {}) },
          flashcardsState: { ...s.flashcardsState, ...(data.flashcardsState ?? {}) },
        }))
        setStatus({ type: 'ok', message: 'Imported and merged with your current progress on this device.' })
      } catch (e) {
        setStatus({ type: 'error', message: e instanceof Error ? e.message : 'Could not read that file.' })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-mist-100">Sync progress across devices</h1>
        <p className="mt-1 text-sm text-mist-500">
          This site has no backend and no accounts — progress lives only in this browser's storage.
          This is the honest workaround: export a file here, import it on another device.
        </p>
      </header>

      <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <p className="flex items-start gap-2 text-xs text-amber-300">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          Not real-time sync. If you make progress on two devices before exporting/importing, imports merge rather
          than overwrite — but simultaneous edits to the exact same item will just take whichever file you imported last.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-abyss-700 bg-abyss-900/40 p-5">
          <h2 className="mb-1 font-display text-sm font-semibold text-mist-100">Export</h2>
          <p className="mb-4 text-xs text-mist-500">
            {completedCount} completed · {bookmarkCount} bookmarked · {flashcardCount} flashcards tracked
          </p>
          <button
            onClick={exportData}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-signal-500 py-2.5 text-xs font-semibold text-abyss-950"
          >
            <Download size={14} /> Download progress file
          </button>
        </div>

        <div className="rounded-xl border border-abyss-700 bg-abyss-900/40 p-5">
          <h2 className="mb-1 font-display text-sm font-semibold text-mist-100">Import</h2>
          <p className="mb-4 text-xs text-mist-500">Load a previously exported file and merge it into this device.</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importData(file)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-abyss-700 py-2.5 text-xs font-semibold text-mist-300 hover:border-signal-500"
          >
            <Upload size={14} /> Choose file to import
          </button>
        </div>
      </div>

      {status && (
        <p className={`mt-4 text-xs ${status.type === 'ok' ? 'text-signal-400' : 'text-red-300'}`}>{status.message}</p>
      )}
    </div>
  )
}
