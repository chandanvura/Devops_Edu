import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react'
import type { FlowDefinition } from '@/types'
import { cn } from '@/lib/cn'

interface FlowDiagramProps {
  flow: FlowDefinition
  /** ms per hop; controls animation speed */
  stepDuration?: number
  className?: string
}

/**
 * Generic, data-driven request/control-plane flow animation.
 * Feed it a FlowDefinition (ordered nodes + edge protocol labels) and it
 * lays nodes out, draws connectors, and animates a "packet" traveling
 * node-to-node. Used for: login request lifecycle, `kubectl apply`,
 * `docker build`, `helm install`, `terraform apply`, Jenkins pipelines,
 * ArgoCD sync — any module's animation is just a FlowDefinition.
 */
export function FlowDiagram({ flow, stepDuration = 1400, className }: FlowDiagramProps) {
  const [activeIndex, setActiveIndex] = useState(0) // index of node packet is AT
  const [playing, setPlaying] = useState(false)
  const timerRef = useRef<number | undefined>(undefined)

  const lastIndex = flow.nodes.length - 1

  useEffect(() => {
    if (!playing) return
    if (activeIndex >= lastIndex) {
      setPlaying(false)
      return
    }
    timerRef.current = window.setTimeout(() => setActiveIndex((i) => i + 1), stepDuration)
    return () => window.clearTimeout(timerRef.current)
  }, [playing, activeIndex, lastIndex, stepDuration])

  const nodeWidth = 148
  const gap = 96
  const totalWidth = flow.nodes.length * nodeWidth + (flow.nodes.length - 1) * gap
  const y = 60

  const positions = useMemo(
    () => flow.nodes.map((_, i) => i * (nodeWidth + gap) + nodeWidth / 2),
    [flow.nodes],
  )

  function reset() {
    setPlaying(false)
    setActiveIndex(0)
  }
  function step() {
    setPlaying(false)
    setActiveIndex((i) => Math.min(i + 1, lastIndex))
  }

  return (
    <div className={cn('rounded-xl border border-abyss-700 bg-abyss-900/60 p-6', className)}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h4 className="font-display text-sm font-semibold text-mist-100">{flow.title}</h4>
          <p className="text-xs text-mist-500">{flow.description}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <ControlButton onClick={() => setPlaying((p) => !p)} label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </ControlButton>
          <ControlButton onClick={step} label="Step">
            <SkipForward size={14} />
          </ControlButton>
          <ControlButton onClick={reset} label="Reset">
            <RotateCcw size={14} />
          </ControlButton>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={totalWidth}
          height={y * 2}
          className="min-w-full"
          role="img"
          aria-label={flow.title}
        >
          {/* connectors */}
          {flow.nodes.slice(1).map((node, i) => {
            const x1 = positions[i] + nodeWidth / 2
            const x2 = positions[i + 1] - nodeWidth / 2
            const traveled = activeIndex > i
            return (
              <g key={node.id}>
                <line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke="var(--color-abyss-600)"
                  strokeWidth={2}
                />
                <motion.line
                  x1={x1}
                  y1={y}
                  x2={x2}
                  y2={y}
                  stroke="var(--color-signal-500)"
                  strokeWidth={2}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: traveled ? 1 : 0 }}
                  transition={{ duration: stepDuration / 1000, ease: 'linear' }}
                />
                {node.via && (
                  <text
                    x={(x1 + x2) / 2}
                    y={y - 10}
                    textAnchor="middle"
                    className="fill-mist-500 font-mono text-[10px] uppercase tracking-wide"
                  >
                    {node.via}
                  </text>
                )}
                {/* packet dot, only rendered while actively traveling this edge */}
                <AnimatePresence>
                  {playing && activeIndex === i + 1 && (
                    <motion.circle
                      r={5}
                      fill="var(--color-signal-400)"
                      initial={{ cx: x1, cy: y, opacity: 0 }}
                      animate={{ cx: x2, cy: y, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: stepDuration / 1000, ease: 'linear' }}
                    />
                  )}
                </AnimatePresence>
              </g>
            )
          })}

          {/* nodes */}
          {flow.nodes.map((node, i) => {
            const cx = positions[i]
            const active = i === activeIndex
            const done = i < activeIndex
            return (
              <g key={node.id} transform={`translate(${cx - nodeWidth / 2}, ${y - 26})`}>
                <motion.rect
                  width={nodeWidth}
                  height={52}
                  rx={10}
                  fill={active ? 'var(--color-signal-500)' : done ? 'var(--color-abyss-700)' : 'var(--color-abyss-800)'}
                  stroke={active ? 'var(--color-signal-400)' : 'var(--color-abyss-600)'}
                  strokeWidth={active ? 2 : 1}
                  animate={active ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                  transition={{ duration: 1, repeat: active ? Infinity : 0 }}
                  style={{ transformOrigin: `${nodeWidth / 2}px 26px` }}
                />
                <text
                  x={nodeWidth / 2}
                  y={22}
                  textAnchor="middle"
                  className={cn(
                    'font-display text-[12px] font-semibold',
                    active ? 'fill-abyss-950' : 'fill-mist-100',
                  )}
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    x={nodeWidth / 2}
                    y={38}
                    textAnchor="middle"
                    className={cn(
                      'font-mono text-[9px]',
                      active ? 'fill-abyss-900' : 'fill-mist-500',
                    )}
                  >
                    {node.sublabel}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {flow.nodes.map((node, i) => (
          <button
            key={node.id}
            onClick={() => {
              setPlaying(false)
              setActiveIndex(i)
            }}
            className={cn(
              'rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors',
              i === activeIndex
                ? 'border-signal-500 bg-signal-500/10 text-signal-400'
                : 'border-abyss-700 text-mist-500 hover:border-abyss-600',
            )}
          >
            {i + 1}. {node.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ControlButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-lg border border-abyss-700 p-2 text-mist-300 transition-colors hover:border-signal-500 hover:text-signal-400"
    >
      {children}
    </button>
  )
}
