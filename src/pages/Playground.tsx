import { useState, useMemo } from 'react'
import * as yaml from 'js-yaml'
import { FlowDiagram } from '@/components/animation/FlowDiagram'
import { cn } from '@/lib/cn'
import { validateK8sManifest, supportedKinds } from '@/lib/k8sSchema'
import type { FlowDefinition } from '@/types'

import { dockerBuildFlow, dockerRunFlow, dockerNetworkFlow, buildkitFlow } from '@/modules/docker/flows'
import { kubectlApplyFlow, controlPlaneFlow, serviceRoutingFlow } from '@/modules/kubernetes/flows'
import { helmInstallFlow } from '@/modules/helm/flows'
import { terraformApplyFlow } from '@/modules/terraform/flows'
import { ansibleRunFlow } from '@/modules/ansible/flows'
import { jenkinsPipelineFlow } from '@/modules/jenkins/flows'
import { argoSyncFlow } from '@/modules/argocd/flows'
import { requestLifecycleFlow, vpcRoutingFlow, iamEvalFlow, snsFanoutFlow } from '@/modules/aws/flows'

const allFlows: { module: string; flow: FlowDefinition }[] = [
  { module: 'Docker', flow: dockerBuildFlow },
  { module: 'Docker', flow: dockerRunFlow },
  { module: 'Docker', flow: dockerNetworkFlow },
  { module: 'Docker', flow: buildkitFlow },
  { module: 'Kubernetes', flow: kubectlApplyFlow },
  { module: 'Kubernetes', flow: controlPlaneFlow },
  { module: 'Kubernetes', flow: serviceRoutingFlow },
  { module: 'Helm', flow: helmInstallFlow },
  { module: 'Terraform', flow: terraformApplyFlow },
  { module: 'Ansible', flow: ansibleRunFlow },
  { module: 'Jenkins', flow: jenkinsPipelineFlow },
  { module: 'ArgoCD', flow: argoSyncFlow },
  { module: 'AWS', flow: requestLifecycleFlow },
  { module: 'AWS', flow: vpcRoutingFlow },
  { module: 'AWS', flow: iamEvalFlow },
  { module: 'AWS', flow: snsFanoutFlow },
]

const sampleYaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: my-app:1.0.0
          ports:
            - containerPort: 8080
`

export default function Playground() {
  const [tab, setTab] = useState<'commands' | 'yaml'>('commands')
  const [selectedFlow, setSelectedFlow] = useState(allFlows[4]) // kubectl apply, flagship example
  const [yamlInput, setYamlInput] = useState(sampleYaml)

  const parsed = useMemo(() => {
    try {
      const doc = yaml.load(yamlInput) as Record<string, unknown> | undefined
      return { ok: true as const, doc }
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : String(e) }
    }
  }, [yamlInput])

  const validation = useMemo(() => (parsed.ok && parsed.doc ? validateK8sManifest(parsed.doc) : null), [parsed])

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-mist-100">Playground</h1>
        <p className="mt-1 text-sm text-mist-500">Browse every animated flow on the site, or validate a Kubernetes manifest against real structural rules.</p>
      </header>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab('commands')}
          className={cn('rounded-lg border px-4 py-2 text-xs', tab === 'commands' ? 'border-signal-500 bg-signal-500/10 text-signal-400' : 'border-abyss-700 text-mist-500')}
        >
          Command Playground
        </button>
        <button
          onClick={() => setTab('yaml')}
          className={cn('rounded-lg border px-4 py-2 text-xs', tab === 'yaml' ? 'border-signal-500 bg-signal-500/10 text-signal-400' : 'border-abyss-700 text-mist-500')}
        >
          YAML Playground
        </button>
      </div>

      {tab === 'commands' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {allFlows.map((f) => (
              <button
                key={f.flow.id}
                onClick={() => setSelectedFlow(f)}
                className={cn(
                  'shrink-0 rounded-lg border px-3 py-2 text-left text-xs',
                  selectedFlow.flow.id === f.flow.id ? 'border-signal-500 bg-signal-500/10 text-signal-400' : 'border-abyss-700 text-mist-500 hover:border-abyss-600',
                )}
              >
                <span className="block font-mono text-[9px] uppercase text-mist-500">{f.module}</span>
                {f.flow.title}
              </button>
            ))}
          </div>
          <FlowDiagram flow={selectedFlow.flow} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs text-mist-500">Paste or edit a manifest — parsed live, client-side, nothing leaves your browser.</p>
            <textarea
              value={yamlInput}
              onChange={(e) => setYamlInput(e.target.value)}
              spellCheck={false}
              className="h-96 w-full rounded-lg border border-abyss-700 bg-abyss-900 p-3 font-mono text-xs text-mist-100 focus:border-signal-500 focus:outline-none"
            />
          </div>
          <div>
            <p className="mb-2 text-xs text-mist-500">Validation — supports {supportedKinds.join(', ')}</p>
            {parsed.ok ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-signal-500/40 bg-signal-500/5 p-3">
                  <p className="mb-2 font-mono text-[10px] text-signal-400">✓ valid YAML syntax</p>
                  {typeof parsed.doc === 'object' && parsed.doc && 'kind' in parsed.doc && (
                    <p className="text-xs text-mist-300">
                      Detected <span className="text-mist-100">{String((parsed.doc as Record<string, unknown>).kind)}</span> object
                      {'metadata' in parsed.doc && typeof (parsed.doc as any).metadata?.name === 'string' && (
                        <> named <span className="text-mist-100">{(parsed.doc as any).metadata.name}</span></>
                      )}
                      .
                    </p>
                  )}
                </div>

                {validation && (
                  <div
                    className={cn(
                      'rounded-lg border p-3',
                      validation.errors.length > 0 ? 'border-red-500/40 bg-red-500/5' : 'border-abyss-700 bg-abyss-900/40',
                    )}
                  >
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-wide text-mist-500">
                      Structural check {validation.knownKind ? `(${validation.kind})` : ''}
                    </p>
                    {validation.errors.length === 0 && validation.warnings.length === 0 && (
                      <p className="text-xs text-signal-400">✓ passes required-field checks for {validation.kind}</p>
                    )}
                    {validation.errors.map((e, i) => (
                      <p key={i} className="text-xs text-red-300">✗ {e}</p>
                    ))}
                    {validation.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-400">⚠ {w}</p>
                    ))}
                  </div>
                )}

                <details className="text-xs text-mist-500">
                  <summary className="cursor-pointer">Parsed object (JSON)</summary>
                  <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap font-mono text-[10px] text-mist-500">
                    {JSON.stringify(parsed.doc, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="rounded-lg border border-red-500/40 bg-red-500/5 p-3">
                <p className="mb-1 font-mono text-[10px] text-red-300">✗ parse error</p>
                <p className="whitespace-pre-wrap font-mono text-[10px] text-red-300/80">{parsed.error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
