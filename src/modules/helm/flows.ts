import type { FlowDefinition } from '@/types'

export const helmInstallFlow: FlowDefinition = {
  id: 'helm-install',
  title: 'helm install my-app ./chart',
  description: 'Templates are rendered client-side, then applied as a single unit',
  nodes: [
    { id: 'cli', label: 'helm CLI', sublabel: 'install my-app' },
    { id: 'chart', label: 'Chart.yaml', sublabel: 'templates/ + values.yaml', via: 'load' },
    { id: 'merge', label: 'Merge Values', sublabel: 'defaults ← -f ← --set', via: 'precedence' },
    { id: 'render', label: 'Render Templates', sublabel: 'Go templating', via: 'text/template' },
    { id: 'manifests', label: 'Final Manifests', sublabel: 'plain YAML', via: 'validated' },
    { id: 'apiserver', label: 'API Server', sublabel: 'kubectl-style apply', via: 'HTTPS' },
    { id: 'release', label: 'Release', sublabel: 'tracked in Secret', via: 'stored' },
  ],
}
