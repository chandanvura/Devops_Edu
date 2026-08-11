import type { FlowDefinition } from '@/types'

export const jenkinsPipelineFlow: FlowDefinition = {
  id: 'jenkins-pipeline',
  title: 'Commit to deploy',
  description: 'A push triggers a webhook, which fans out through build, test, package, and deploy stages',
  nodes: [
    { id: 'push', label: 'Git Push', sublabel: 'developer commits' },
    { id: 'webhook', label: 'Webhook', sublabel: 'repo → Jenkins', via: 'HTTPS POST' },
    { id: 'controller', label: 'Jenkins Controller', sublabel: 'schedules build', via: 'queue' },
    { id: 'agent', label: 'Agent', sublabel: 'checkout + build', via: 'JNLP/SSH' },
    { id: 'test', label: 'Unit Tests', sublabel: 'pass/fail gate', via: 'exec' },
    { id: 'image', label: 'Docker Build', sublabel: 'image produced', via: 'build' },
    { id: 'registry', label: 'Push Image', sublabel: 'to registry', via: 'HTTPS' },
    { id: 'deploy', label: 'Deploy Trigger', sublabel: 'Helm/ArgoCD', via: 'webhook/API' },
  ],
}
