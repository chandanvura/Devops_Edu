import type { TopicContent } from '@/types'
import { helmInstallFlow } from './flows'

export const helmContent: Record<string, TopicContent> = {
  'charts-and-templates': {
    eyebrow: 'Helm · Beginner',
    title: 'Charts & Templates',
    intro: 'A chart is a directory convention: Chart.yaml for metadata, values.yaml for defaults, templates/ for Go-templated Kubernetes manifests.',
    sections: [
      {
        title: 'Anatomy of a chart',
        bullets: [
          '<code>Chart.yaml</code> — name, version, apiVersion, dependencies',
          '<code>values.yaml</code> — default configuration values, overridable at install time',
          '<code>templates/</code> — YAML manifests with <code>{{ .Values.x }}</code> placeholders',
          '<code>templates/_helpers.tpl</code> — named template snippets (labels, naming conventions) reused across files',
        ],
        body: [],
      },
      {
        title: 'Templating is just text substitution',
        body: ['Helm renders templates client-side using Go\'s text/template before anything touches the cluster. Helm never understands Kubernetes semantics at render time — it only produces text that happens to be valid YAML.'],
      },
    ],
    commands: [
      { command: 'helm template ./chart --values values-prod.yaml', output: '# renders to stdout, no cluster contact\napiVersion: apps/v1\nkind: Deployment\n...' },
      { command: 'helm lint ./chart', output: '==> Linting ./chart\n1 chart(s) linted, 0 chart(s) failed' },
    ],
    quiz: [
      { id: 'q1', prompt: 'Where does template rendering happen?', choices: ['Inside the cluster, by a controller', 'Client-side, before anything is sent to the API server', 'Inside etcd', 'On the container registry'], correctIndex: 1, explanation: 'helm template/install/upgrade all render locally on the machine running the helm CLI, producing plain YAML before any API call.', difficulty: 'easy' },
    ],
  },

  'install-lifecycle': {
    eyebrow: 'Helm · Beginner',
    title: 'helm install — release lifecycle',
    intro: 'From values merge to a tracked release object in the cluster.',
    flow: helmInstallFlow,
    sections: [
      {
        title: "What's happening",
        body: ['Helm merges values in strict precedence — chart defaults, then parent chart overrides, then -f files in order given, then --set flags last (highest priority) — renders every template, then applies the resulting manifests as one atomic unit, recording the release state as a Secret in the cluster for later helm upgrade/rollback.'],
      },
    ],
    commands: [
      { command: 'helm install my-app ./chart -f values-prod.yaml --set replicaCount=3', output: 'NAME: my-app\nSTATUS: deployed\nREVISION: 1' },
      { command: 'helm get manifest my-app', output: '---\n# Source: chart/templates/deployment.yaml\napiVersion: apps/v1\n...' },
    ],
    mistakes: ['Assuming --set persists — it only applies to that one command; a subsequent helm upgrade without --set reverts to values.yaml.'],
  },

  'values-and-overrides': {
    eyebrow: 'Helm · Intermediate',
    title: 'Values & Overrides',
    intro: 'Precedence order determines which value wins when the same key is set in multiple places.',
    sections: [
      {
        title: 'Precedence, lowest to highest',
        bullets: [
          "Chart's own <code>values.yaml</code>",
          'Parent chart values for a subchart (via <code>subchart-name:</code> key)',
          '<code>-f file.yaml</code> flags, in the order given, later files win',
          '<code>--set key=value</code> flags — always win over files',
        ],
        body: [],
      },
    ],
    quiz: [
      { id: 'q1', prompt: 'You pass both -f prod.yaml and --set replicaCount=1 for the same key. Which wins?', choices: ['prod.yaml, files always win', '--set, it has the highest precedence', 'Whichever came first on the command line', 'Neither — Helm errors on conflict'], correctIndex: 1, explanation: '--set overrides everything else regardless of order on the command line.', difficulty: 'easy' },
    ],
  },

  hooks: {
    eyebrow: 'Helm · Advanced',
    title: 'Hooks',
    intro: 'Hooks run Kubernetes jobs at specific points in a release\'s lifecycle — migrations before install, cleanup after deletion.',
    sections: [
      {
        title: 'Common hook points',
        bullets: [
          '<code>pre-install</code> / <code>post-install</code>',
          '<code>pre-upgrade</code> / <code>post-upgrade</code>',
          '<code>pre-delete</code> / <code>post-delete</code>',
          '<code>helm.sh/hook-weight</code> annotation controls execution order among hooks at the same point',
        ],
        body: [],
      },
    ],
    commands: [{ command: '# hook annotation example', output: 'metadata:\n  annotations:\n    "helm.sh/hook": pre-upgrade\n    "helm.sh/hook-weight": "1"' }],
  },

  'oci-registry': {
    eyebrow: 'Helm · Intermediate',
    title: 'OCI Registries',
    intro: 'Modern Helm distributes charts as OCI artifacts in the same registries that store container images, replacing the older ChartMuseum HTTP index model.',
    sections: [
      {
        title: 'Why OCI won',
        body: ['One registry, one auth model, one set of tooling for both images and charts — no separate ChartMuseum server to run and secure.'],
      },
    ],
    commands: [
      { command: 'helm push my-chart-1.2.0.tgz oci://registry.example.com/charts', output: 'Pushed: registry.example.com/charts/my-chart:1.2.0' },
      { command: 'helm install my-app oci://registry.example.com/charts/my-chart --version 1.2.0', output: 'NAME: my-app\nSTATUS: deployed' },
    ],
  },

  'best-practices': {
    eyebrow: 'Helm · Advanced',
    title: 'Best Practices',
    intro: 'Patterns that separate charts that survive production from charts that only work in the demo.',
    sections: [
      {
        title: 'Production checklist',
        bullets: [
          'Pin dependency chart versions exactly — never use a floating range in production',
          'Set resource requests/limits in values.yaml with safe defaults, not left empty',
          'Use <code>helm diff</code> (plugin) before every upgrade to see the actual change, not just trust the values file',
          'Keep <code>values.schema.json</code> to validate inputs and catch typos before render',
        ],
        body: [],
      },
    ],
    quiz: [
      { id: 'q1', prompt: 'Why pin exact subchart versions instead of a range like ^1.0.0?', choices: ['Helm does not support ranges', 'A range can silently pull in a breaking change on the next install in a new environment', 'It makes charts render faster', 'Pinning is required by Helm Hub'], correctIndex: 1, explanation: 'Unlike a lockfile-driven package manager with CI reproducibility guarantees, an unpinned Helm dependency range can resolve differently between environments and time, causing drift.', difficulty: 'medium' },
    ],
  },
}
