import type { TopicContent } from '@/types'
import { argoSyncFlow } from './flows'

export const argocdContent: Record<string, TopicContent> = {
  'gitops-model': {
    eyebrow: 'ArgoCD · Beginner',
    title: 'The GitOps Model',
    intro: 'Git is the single source of truth for desired state; the cluster is continuously reconciled toward whatever Git says, not the other way around.',
    sections: [
      {
        title: 'Push vs pull deployment',
        body: [
          'A traditional CI pipeline pushes changes to the cluster directly — CI needs cluster credentials, and there is no automatic drift detection if someone changes the cluster out-of-band.',
          'GitOps inverts this: an in-cluster agent (ArgoCD) pulls from Git and applies changes. The cluster never needs to expose credentials to CI, and any manual drift gets caught and reported (or auto-corrected) on the next reconcile.',
        ],
      },
    ],
    quiz: [
      { id: 'q1', prompt: 'In the GitOps model, what triggers a deployment?', choices: ['CI directly calling kubectl apply', 'A change merged to the Git repo that ArgoCD is watching', 'A human clicking deploy in a dashboard, always', 'A cron job unrelated to Git'], correctIndex: 1, explanation: 'ArgoCD pulls from Git and reconciles — the deployment mechanism is the Git commit itself, not a CI push step.', difficulty: 'easy' },
    ],
  },

  'sync-lifecycle': {
    eyebrow: 'ArgoCD · Beginner',
    title: 'Sync lifecycle',
    intro: 'From a Git commit to a reconciled, healthy cluster.',
    flow: argoSyncFlow,
    sections: [
      {
        title: "What's happening",
        body: ['ArgoCD detects a change (via polling, ~3 minutes by default, or instantly via a repo webhook), computes a diff between the Git-declared manifests and what is actually running, and — if auto-sync is enabled, or a human clicks Sync — applies exactly that diff. It then watches resource status to determine Healthy vs Progressing vs Degraded.'],
      },
    ],
    commands: [
      { command: 'argocd app diff my-app', output: '===== apps/Deployment my-app ======\n-  replicas: 2\n+  replicas: 3' },
      { command: 'argocd app sync my-app', output: 'GroupVersionKind: apps/Deployment  Status: Synced  Health: Healthy' },
    ],
    mistakes: ['Enabling auto-sync with self-heal on a namespace where other tools also write objects — ArgoCD will fight them, reverting changes it does not own.'],
  },

  'app-of-apps': {
    eyebrow: 'ArgoCD · Intermediate',
    title: 'App of Apps',
    intro: 'An ArgoCD Application whose only job is to declare other Applications — a pattern for managing many apps from one Git-declared root.',
    sections: [
      {
        title: 'Why this pattern',
        body: ['Instead of manually creating dozens of Application objects via CLI or UI, one root Application in Git points to a directory of Application manifests. Adding a new app becomes a Git commit, not a manual step — the entire fleet is declarative.'],
      },
    ],
    commands: [{ command: 'argocd app list', output: 'NAME        SYNC STATUS   HEALTH\nroot-app    Synced         Healthy\nservice-a   Synced         Healthy\nservice-b   OutOfSync      Degraded' }],
  },

  'health-and-diff': {
    eyebrow: 'ArgoCD · Intermediate',
    title: 'Health & Diff',
    intro: 'ArgoCD ships built-in health checks for common Kubernetes kinds, and lets you define custom ones (in Lua) for CRDs it does not understand out of the box.',
    sections: [
      {
        title: 'What "Healthy" actually checks',
        bullets: [
          '<strong class="text-mist-100">Deployment</strong> — Healthy once <code>status.replicas == status.updatedReplicas == status.availableReplicas</code>',
          '<strong class="text-mist-100">Job</strong> — Healthy once <code>status.succeeded</code> reaches the required completions',
          '<strong class="text-mist-100">Custom resources</strong> — need a Lua health-check script if ArgoCD does not know the CRD',
        ],
        body: [],
      },
    ],
    quiz: [
      { id: 'q1', prompt: 'A custom CRD always shows "Healthy" the instant it is created, even if it is actually still provisioning. Why?', choices: ['ArgoCD is broken', 'ArgoCD has no built-in health check for that CRD, so it defaults to reporting Healthy on successful apply', 'The CRD is misconfigured', 'Health checks are disabled by default'], correctIndex: 1, explanation: 'Without a Lua health-check definition for a custom resource, ArgoCD falls back to treating "applied successfully" as healthy, which is often misleading for async-provisioning resources.', difficulty: 'hard' },
    ],
  },

  'progressive-delivery': {
    eyebrow: 'ArgoCD · Advanced',
    title: 'Progressive Delivery',
    intro: 'Argo Rollouts extends beyond ArgoCD\'s basic sync to canary and blue/green strategies, shifting traffic gradually and rolling back automatically on failed metrics.',
    sections: [
      {
        title: 'Canary vs blue/green',
        body: ['Canary shifts a small percentage of live traffic to the new version, watches metrics (error rate, latency), and ramps up gradually. Blue/green runs both versions fully scaled and switches traffic all at once — faster rollback, but double the resource cost while both run.'],
      },
    ],
    commands: [{ command: 'kubectl argo rollouts get rollout my-app', output: 'Name: my-app\nStrategy: Canary\nStep: 2/5\nSetWeight: 40\nActualWeight: 40' }],
  },

  'rbac-and-notifications': {
    eyebrow: 'ArgoCD · Advanced',
    title: 'RBAC & Notifications',
    intro: 'Projects scope which repos, clusters, and namespaces an Application is allowed to touch — the multi-tenancy boundary in ArgoCD.',
    sections: [
      {
        title: 'Projects as a security boundary',
        body: ['Without Projects, any Application could deploy to any cluster/namespace the ArgoCD controller has access to. A Project restricts source repos, destination clusters/namespaces, and which resource kinds are allowed — the actual multi-tenant isolation layer.'],
      },
    ],
    commands: [{ command: 'argocd proj create team-a --dest https://kubernetes.default.svc,team-a-ns --src https://github.com/org/team-a-repo', output: 'Project team-a created' }],
  },
}
