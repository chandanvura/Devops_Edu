import { NavLink } from 'react-router-dom'
import { modules } from '@/data/modules'
import { IconByName } from '@/components/ui/IconByName'
import { BookOpen, Layers, GraduationCap, TerminalSquare, RefreshCw, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const tools = [
  { to: '/playground', label: 'Playground', Icon: TerminalSquare },
  { to: '/flashcards', label: 'Flashcards', Icon: Layers },
  { to: '/interview', label: 'Interview Mode', Icon: GraduationCap },
  { to: '/glossary', label: 'Glossary', Icon: BookOpen },
  { to: '/sync', label: 'Sync progress', Icon: RefreshCw },
]

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* desktop rail */}
      <aside className="hidden w-60 shrink-0 border-r border-abyss-700 bg-abyss-900/40 lg:block">
        <NavList onNavigate={() => {}} />
      </aside>

      {/* mobile off-canvas */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-abyss-700 bg-abyss-950 p-3">
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="mb-2 ml-auto flex items-center justify-center rounded-lg p-2 text-mist-500 hover:text-mist-100"
            >
              <X size={18} />
            </button>
            <NavList onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}

function NavList({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="sticky top-16 flex flex-col gap-0.5 p-3 lg:p-0">
      {modules.map((m) => (
        <NavLink
          key={m.slug}
          to={`/learn/${m.slug}`}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-abyss-800 text-mist-100'
                : 'text-mist-500 hover:bg-abyss-800/60 hover:text-mist-300',
            )
          }
        >
          <IconByName name={m.icon} size={16} style={{ color: m.color }} />
          {m.title}
          {m.topics.length === 0 && (
            <span className="ml-auto rounded-full border border-abyss-600 px-1.5 py-0.5 text-[9px] text-mist-500">
              soon
            </span>
          )}
        </NavLink>
      ))}

      <div className="my-2 border-t border-abyss-700" />

      {tools.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-abyss-800 text-mist-100'
                : 'text-mist-500 hover:bg-abyss-800/60 hover:text-mist-300',
            )
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
