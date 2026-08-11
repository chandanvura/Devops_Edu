import type { ModuleDefinition } from '@/types'

// Each module lists its topics here. Topic CONTENT (MDX/animations/labs)
// lives under src/modules/<slug>/. This file only drives navigation,
// search indexing, and the roadmap — keep it lightweight.
export const modules: ModuleDefinition[] = [
  {
    slug: 'docker',
    title: 'Docker',
    tagline: 'Images, layers, namespaces, cgroups, and the container runtime',
    color: 'var(--color-signal-500)',
    icon: 'Container',
    topics: [
      { slug: 'internals', title: 'Docker Internals', blurb: 'Namespaces, cgroups, union filesystem', level: 'intermediate', hasAnimation: true, hasLab: true, hasQuiz: true },
      { slug: 'images-and-layers', title: 'Images & Layers', blurb: 'How a Dockerfile becomes layered image', level: 'beginner', hasAnimation: true, hasLab: true, hasQuiz: true },
      { slug: 'networking', title: 'Networking', blurb: 'Bridge, host, overlay, macvlan', level: 'intermediate', hasAnimation: true, hasLab: false, hasQuiz: true },
      { slug: 'build-with-buildkit', title: 'BuildKit', blurb: 'Modern build engine, cache mounts', level: 'advanced', hasAnimation: true, hasLab: true, hasQuiz: false },
      { slug: 'security', title: 'Security', blurb: 'Rootless mode, Docker Bench, Scout', level: 'advanced', hasAnimation: false, hasLab: true, hasQuiz: true },
      { slug: 'interview-questions', title: 'Interview Questions', blurb: 'Easy to production-debugging scenarios', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: true },
    ],
  },
  {
    slug: 'kubernetes',
    title: 'Kubernetes',
    tagline: 'Control plane, scheduling, networking, and workload objects',
    color: 'var(--color-amber-500)',
    icon: 'Boxes',
    topics: [
      { slug: 'architecture', title: 'Cluster Architecture', blurb: 'API server, etcd, scheduler, controller manager, kubelet', level: 'beginner', hasAnimation: true, hasLab: false, hasQuiz: true },
      { slug: 'kubectl-apply-lifecycle', title: 'kubectl apply — request lifecycle', blurb: 'What happens between you pressing enter and a pod running', level: 'beginner', hasAnimation: true, hasLab: true, hasQuiz: true },
      { slug: 'pods-and-controllers', title: 'Pods, ReplicaSets & Deployments', blurb: 'Desired state reconciliation, rolling updates', level: 'beginner', hasAnimation: false, hasLab: true, hasQuiz: true },
      { slug: 'services-and-ingress', title: 'Services & Ingress', blurb: 'ClusterIP, kube-proxy, CoreDNS, ingress routing', level: 'intermediate', hasAnimation: true, hasLab: false, hasQuiz: true },
      { slug: 'scheduling', title: 'Scheduling', blurb: 'Affinity, taints/tolerations, node selectors', level: 'intermediate', hasAnimation: false, hasLab: true, hasQuiz: false },
      { slug: 'debugging', title: 'Debugging Pods', blurb: 'CrashLoopBackOff, OOMKilled, pending pods', level: 'intermediate', hasAnimation: false, hasLab: true, hasQuiz: false },
      { slug: 'rbac-and-security', title: 'RBAC & Pod Security', blurb: 'Roles, bindings, admission controllers', level: 'advanced', hasAnimation: false, hasLab: false, hasQuiz: true },
      { slug: 'interview-questions', title: 'Interview Questions', blurb: 'Easy to production-debugging scenarios', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: true },
    ],
  },
  {
    slug: 'helm',
    title: 'Helm',
    tagline: 'Charts, templating, releases, and OCI registries',
    color: 'var(--color-signal-400)',
    icon: 'Package',
    topics: [
      { slug: 'charts-and-templates', title: 'Charts & Templates', blurb: 'Chart structure, Go templating, values injection', level: 'beginner', hasAnimation: false, hasLab: true, hasQuiz: true },
      { slug: 'install-lifecycle', title: 'helm install — release lifecycle', blurb: 'Render, merge values, generate manifests, apply', level: 'beginner', hasAnimation: true, hasLab: true, hasQuiz: true },
      { slug: 'values-and-overrides', title: 'Values & Overrides', blurb: 'values.yaml precedence, --set, umbrella charts', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: true },
      { slug: 'hooks', title: 'Hooks', blurb: 'pre-install, post-upgrade, weighted execution order', level: 'advanced', hasAnimation: false, hasLab: false, hasQuiz: false },
      { slug: 'oci-registry', title: 'OCI Registries', blurb: 'Chart Museum vs OCI-native chart distribution', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: false },
      { slug: 'best-practices', title: 'Best Practices', blurb: 'Chart versioning, dependency management, production patterns', level: 'advanced', hasAnimation: false, hasLab: false, hasQuiz: true },
    ],
  },
  {
    slug: 'terraform',
    title: 'Terraform',
    tagline: 'HCL, state, providers, and dependency graphs',
    color: 'var(--color-mist-300)',
    icon: 'Layers3',
    topics: [
      { slug: 'hcl-and-providers', title: 'HCL & Providers', blurb: 'Resources, data sources, provider plugins', level: 'beginner', hasAnimation: false, hasLab: true, hasQuiz: true },
      { slug: 'plan-apply-lifecycle', title: 'plan → apply lifecycle', blurb: 'Dependency graph, diff, state reconciliation', level: 'beginner', hasAnimation: true, hasLab: true, hasQuiz: true },
      { slug: 'state-and-backend', title: 'State & Remote Backends', blurb: 'State file, locking, drift, remote backends', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: true },
      { slug: 'modules', title: 'Modules', blurb: 'Reusable, composable infrastructure', level: 'intermediate', hasAnimation: false, hasLab: true, hasQuiz: false },
      { slug: 'workspaces', title: 'Workspaces', blurb: 'Environment isolation within one config', level: 'advanced', hasAnimation: false, hasLab: false, hasQuiz: false },
      { slug: 'best-practices', title: 'Best Practices', blurb: 'State locking, module versioning, plan review', level: 'advanced', hasAnimation: false, hasLab: false, hasQuiz: true },
    ],
  },
  {
    slug: 'ansible',
    title: 'Ansible',
    tagline: 'Inventory, playbooks, roles, and idempotency',
    color: 'var(--color-amber-400)',
    icon: 'ScrollText',
    topics: [
      { slug: 'architecture', title: 'Architecture', blurb: 'Agentless, SSH-based push model', level: 'beginner', hasAnimation: true, hasLab: false, hasQuiz: true },
      { slug: 'playbooks-and-roles', title: 'Playbooks & Roles', blurb: 'Tasks, handlers, reusable role structure', level: 'beginner', hasAnimation: false, hasLab: true, hasQuiz: true },
      { slug: 'inventory', title: 'Inventory', blurb: 'Static vs dynamic inventory, groups, variables', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: false },
      { slug: 'vault', title: 'Ansible Vault', blurb: 'Encrypting secrets at rest in playbooks', level: 'intermediate', hasAnimation: false, hasLab: true, hasQuiz: false },
      { slug: 'idempotency', title: 'Idempotency', blurb: 'Why running twice must be safe', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: true },
      { slug: 'production-examples', title: 'Production Patterns', blurb: 'Collections, Galaxy, CI integration', level: 'advanced', hasAnimation: false, hasLab: false, hasQuiz: false },
    ],
  },
  {
    slug: 'jenkins',
    title: 'Jenkins',
    tagline: 'Pipelines, agents, and CI orchestration',
    color: 'var(--color-signal-500)',
    icon: 'GitBranch',
    topics: [
      { slug: 'architecture', title: 'Master/Agent Architecture', blurb: 'Controller, agents, executors', level: 'beginner', hasAnimation: false, hasLab: false, hasQuiz: true },
      { slug: 'pipeline-lifecycle', title: 'Pipeline: commit to deploy', blurb: 'Webhook → build → test → image → deploy', level: 'beginner', hasAnimation: true, hasLab: true, hasQuiz: true },
      { slug: 'declarative-vs-scripted', title: 'Declarative vs Scripted', blurb: 'Groovy DSL, syntax trade-offs', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: false },
      { slug: 'credentials-and-plugins', title: 'Credentials & Plugins', blurb: 'Secret storage, plugin ecosystem risk', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: true },
      { slug: 'kubernetes-agents', title: 'Kubernetes Agents', blurb: 'Ephemeral pod-based build agents', level: 'advanced', hasAnimation: false, hasLab: false, hasQuiz: false },
      { slug: 'shared-libraries', title: 'Shared Libraries', blurb: 'Reusable pipeline code across repos', level: 'advanced', hasAnimation: false, hasLab: false, hasQuiz: false },
    ],
  },
  {
    slug: 'argocd',
    title: 'ArgoCD',
    tagline: 'GitOps sync, diff, and progressive delivery',
    color: 'var(--color-mist-300)',
    icon: 'RefreshCw',
    topics: [
      { slug: 'gitops-model', title: 'The GitOps Model', blurb: 'Git as source of truth, pull-based reconciliation', level: 'beginner', hasAnimation: false, hasLab: false, hasQuiz: true },
      { slug: 'sync-lifecycle', title: 'Sync lifecycle', blurb: 'Detect drift, diff, apply, health check', level: 'beginner', hasAnimation: true, hasLab: true, hasQuiz: true },
      { slug: 'app-of-apps', title: 'App of Apps', blurb: 'Managing many Applications declaratively', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: false },
      { slug: 'health-and-diff', title: 'Health & Diff', blurb: 'How ArgoCD decides Healthy vs Degraded', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: true },
      { slug: 'progressive-delivery', title: 'Progressive Delivery', blurb: 'Canary and blue/green via Argo Rollouts', level: 'advanced', hasAnimation: false, hasLab: false, hasQuiz: false },
      { slug: 'rbac-and-notifications', title: 'RBAC & Notifications', blurb: 'Project-scoped access, sync notifications', level: 'advanced', hasAnimation: false, hasLab: false, hasQuiz: false },
    ],
  },
  {
    slug: 'aws',
    title: 'AWS',
    tagline: 'VPC, IAM, compute, storage, and managed services',
    color: 'var(--color-amber-500)',
    icon: 'Cloud',
    topics: [
      { slug: 'vpc-networking', title: 'VPC Networking', blurb: 'Subnets, route tables, IGW, NAT Gateway', level: 'beginner', hasAnimation: true, hasLab: false, hasQuiz: true },
      { slug: 'iam-deep-dive', title: 'IAM Deep Dive', blurb: 'Policy evaluation logic, roles vs users', level: 'intermediate', hasAnimation: true, hasLab: false, hasQuiz: true },
      { slug: 'request-lifecycle', title: 'Request Lifecycle', blurb: 'Browser → Route53 → CloudFront → ALB → EKS', level: 'beginner', hasAnimation: true, hasLab: false, hasQuiz: true },
      { slug: 'compute-eks-ecs-lambda', title: 'EKS, ECS & Lambda', blurb: 'Compute options and when to use each', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: true },
      { slug: 'storage-and-databases', title: 'Storage & Databases', blurb: 'S3, RDS, Aurora, DynamoDB trade-offs', level: 'intermediate', hasAnimation: false, hasLab: false, hasQuiz: false },
      { slug: 'messaging-sns-sqs', title: 'SNS, SQS & EventBridge', blurb: 'Fanout, queuing, and event-driven patterns', level: 'advanced', hasAnimation: true, hasLab: false, hasQuiz: false },
    ],
  },
]

export function getModule(slug: string) {
  return modules.find((m) => m.slug === slug)
}

export function getTopic(moduleSlug: string, topicSlug: string) {
  return getModule(moduleSlug)?.topics.find((t) => t.slug === topicSlug)
}

/** Flat index for instant search across every module + topic. */
export function searchIndex() {
  return modules.flatMap((m) =>
    m.topics.map((t) => ({
      moduleSlug: m.slug,
      moduleTitle: m.title,
      topicSlug: t.slug,
      title: t.title,
      blurb: t.blurb,
      path: `/learn/${m.slug}/${t.slug}`,
    })),
  )
}
