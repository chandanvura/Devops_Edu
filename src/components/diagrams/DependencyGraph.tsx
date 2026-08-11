import { useMemo } from 'react'
import ReactFlow, { Background, Controls, MarkerType, type Edge, type Node } from 'reactflow'
import 'reactflow/dist/style.css'
import type { DependencyGraphSpec } from '@/types'

/** Longest-path layering: root nodes (no incoming edges) sit at level 0,
 *  every other node sits one level past its deepest dependency. */
function layout(spec: DependencyGraphSpec): { nodes: Node[]; edges: Edge[] } {
  const level = new Map<string, number>()
  const incoming = new Map<string, string[]>()
  for (const n of spec.nodes) incoming.set(n.id, [])
  for (const e of spec.edges) incoming.get(e.to)?.push(e.from)

  function levelOf(id: string, seen = new Set<string>()): number {
    if (level.has(id)) return level.get(id)!
    if (seen.has(id)) return 0 // cycle guard
    seen.add(id)
    const deps = incoming.get(id) ?? []
    const l = deps.length === 0 ? 0 : Math.max(...deps.map((d) => levelOf(d, seen))) + 1
    level.set(id, l)
    return l
  }
  for (const n of spec.nodes) levelOf(n.id)

  const byLevel = new Map<number, string[]>()
  for (const n of spec.nodes) {
    const l = level.get(n.id)!
    if (!byLevel.has(l)) byLevel.set(l, [])
    byLevel.get(l)!.push(n.id)
  }

  const colWidth = 220
  const rowHeight = 90
  const nodes: Node[] = spec.nodes.map((n) => {
    const l = level.get(n.id)!
    const col = byLevel.get(l)!
    const row = col.indexOf(n.id)
    return {
      id: n.id,
      position: { x: l * colWidth, y: row * rowHeight - ((col.length - 1) * rowHeight) / 2 },
      data: { label: (
        <div>
          <div style={{ fontWeight: 600, fontSize: 12 }}>{n.label}</div>
          {n.sublabel && <div style={{ fontSize: 10, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>{n.sublabel}</div>}
        </div>
      ) },
      style: {
        background: 'var(--color-abyss-800)',
        border: '1px solid var(--color-abyss-600)',
        borderRadius: 10,
        color: 'var(--color-mist-100)',
        width: 180,
      },
    }
  })

  const edges: Edge[] = spec.edges.map((e) => ({
    id: `${e.from}-${e.to}`,
    source: e.from,
    target: e.to,
    animated: true,
    style: { stroke: 'var(--color-signal-500)' },
    markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-signal-500)' },
  }))

  return { nodes, edges }
}

export function DependencyGraph({ spec }: { spec: DependencyGraphSpec }) {
  const { nodes, edges } = useMemo(() => layout(spec), [spec])

  return (
    <div className="h-96 overflow-hidden rounded-xl border border-abyss-700 bg-abyss-900/60">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="var(--color-abyss-700)" gap={24} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
