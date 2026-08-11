import type { FlowDefinition } from '@/types'

export const argoSyncFlow: FlowDefinition = {
  id: 'argo-sync',
  title: 'GitOps sync loop',
  description: 'Pull-based: ArgoCD watches Git, not the other way around',
  nodes: [
    { id: 'commit', label: 'Git Commit', sublabel: 'manifest changed' },
    { id: 'repo', label: 'Git Repository', sublabel: 'source of truth', via: 'push' },
    { id: 'poll', label: 'ArgoCD', sublabel: 'polls / webhook', via: 'pull, ~3min or instant' },
    { id: 'diff', label: 'Diff', sublabel: 'desired vs live', via: 'compare' },
    { id: 'sync', label: 'Sync', sublabel: 'apply diff', via: 'kubectl apply-style' },
    { id: 'health', label: 'Health Check', sublabel: 'Healthy/Degraded', via: 'resource status' },
    { id: 'cluster', label: 'Cluster Updated', sublabel: 'matches Git', via: 'reconciled' },
  ],
}
