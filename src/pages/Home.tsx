import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { modules } from '@/data/modules'
import { IconByName } from '@/components/ui/IconByName'
import { FlowDiagram } from '@/components/animation/FlowDiagram'

// Signature element: the hero itself is a live FlowDiagram running the
// site's own request lifecycle (Browser -> DNS -> ... -> Response), auto-
// playing on load. Instead of illustrating the product with a static
// graphic, the hero *is* the product's core interaction.
export default function Home() {
  return (
    <div className="space-y-20">
      <section className="grid-overlay -mx-4 rounded-2xl border border-abyss-700 px-4 py-14 lg:-mx-8 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-signal-400"
        >
          $ learn --how-it-actually-works
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="max-w-2xl font-display text-4xl font-semibold leading-tight text-mist-100 sm:text-5xl"
        >
          Watch DevOps happen, packet by packet.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 max-w-xl text-sm text-mist-500"
        >
          Every diagram on this site animates. This is the request that just loaded this page —
          press play.
        </motion.p>

        <div className="mt-8">
          <FlowDiagram flow={heroFlow} />
        </div>
      </section>

      <section>
        <h2 className="mb-1 font-display text-xl font-semibold text-mist-100">Learning paths</h2>
        <p className="mb-6 text-sm text-mist-500">Eight modules, beginner to production-ready.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => (
            <Link
              key={m.slug}
              to={`/learn/${m.slug}`}
              className="group rounded-xl border border-abyss-700 bg-abyss-900/40 p-5 transition-colors hover:border-abyss-600"
            >
              <IconByName name={m.icon} size={20} style={{ color: m.color }} />
              <h3 className="mt-3 font-display text-sm font-semibold text-mist-100">{m.title}</h3>
              <p className="mt-1 text-xs text-mist-500">{m.tagline}</p>
              <p className="mt-3 text-[10px] font-mono text-mist-500">
                {m.topics.length > 0 ? `${m.topics.length} topics` : 'coming next'}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

const heroFlow = {
  id: 'page-load',
  title: 'This page, loading',
  description: 'Browser request → edge → app shell → rendered UI',
  nodes: [
    { id: 'browser', label: 'Browser', sublabel: 'GET /', via: undefined },
    { id: 'dns', label: 'DNS', sublabel: 'resolve host', via: 'DNS' },
    { id: 'cdn', label: 'GitHub CDN', sublabel: 'static assets', via: 'HTTPS/TLS' },
    { id: 'app', label: 'React App', sublabel: 'hydrate + route', via: 'HTTP/2' },
    { id: 'render', label: 'Rendered', sublabel: 'you are here', via: 'DOM' },
  ],
}
