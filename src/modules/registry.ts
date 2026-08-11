import type { TopicContent } from '@/types'
import { dockerContent } from './docker/content'
import { kubernetesContent } from './kubernetes/content'
import { helmContent } from './helm/content'
import { terraformContent } from './terraform/content'
import { ansibleContent } from './ansible/content'
import { jenkinsContent } from './jenkins/content'
import { argocdContent } from './argocd/content'
import { awsContent } from './aws/content'

function namespace(moduleSlug: string, content: Record<string, TopicContent>) {
  return Object.fromEntries(Object.entries(content).map(([slug, c]) => [`${moduleSlug}/${slug}`, c]))
}

// One flat lookup: "module/topic" -> content. Every topic renders through
// GenericTopicPage — adding topic #49 means adding a data object here via
// a module's content.ts, never a new component.
export const topicContent: Record<string, TopicContent> = {
  ...namespace('docker', dockerContent),
  ...namespace('kubernetes', kubernetesContent),
  ...namespace('helm', helmContent),
  ...namespace('terraform', terraformContent),
  ...namespace('ansible', ansibleContent),
  ...namespace('jenkins', jenkinsContent),
  ...namespace('argocd', argocdContent),
  ...namespace('aws', awsContent),
}
