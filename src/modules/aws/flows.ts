import type { FlowDefinition } from '@/types'

export const requestLifecycleFlow: FlowDefinition = {
  id: 'aws-request-lifecycle',
  title: 'Browser to pod, full path',
  description: 'Every hop a request takes to reach an application running on EKS',
  nodes: [
    { id: 'browser', label: 'Browser', sublabel: 'GET request' },
    { id: 'dns', label: 'Route 53', sublabel: 'DNS resolve', via: 'DNS' },
    { id: 'cdn', label: 'CloudFront', sublabel: 'edge cache', via: 'HTTPS/TLS' },
    { id: 'alb', label: 'ALB', sublabel: 'L7 load balancer', via: 'HTTPS' },
    { id: 'ingress', label: 'Ingress', sublabel: 'K8s routing rule', via: 'HTTP' },
    { id: 'service', label: 'Service', sublabel: 'ClusterIP', via: 'kube-proxy' },
    { id: 'pod', label: 'Pod', sublabel: 'app container', via: 'TCP' },
    { id: 'db', label: 'RDS', sublabel: 'database query', via: 'TCP 5432' },
  ],
}

export const vpcRoutingFlow: FlowDefinition = {
  id: 'vpc-routing',
  title: 'Private subnet reaching the internet',
  description: 'Public subnets route through an Internet Gateway; private subnets route outbound through a NAT Gateway',
  nodes: [
    { id: 'instance', label: 'EC2 Instance', sublabel: 'private subnet' },
    { id: 'rt', label: 'Route Table', sublabel: '0.0.0.0/0 → NAT', via: 'lookup' },
    { id: 'nat', label: 'NAT Gateway', sublabel: 'public subnet', via: 'source NAT' },
    { id: 'igw', label: 'Internet Gateway', sublabel: 'attached to VPC', via: 'routed' },
    { id: 'internet', label: 'Internet', sublabel: 'destination', via: 'IP' },
  ],
}

export const iamEvalFlow: FlowDefinition = {
  id: 'iam-evaluation',
  title: 'IAM policy evaluation',
  description: 'Explicit deny always wins; without an explicit allow, the default is deny',
  nodes: [
    { id: 'request', label: 'API Request', sublabel: 'e.g. s3:GetObject' },
    { id: 'scp', label: 'Org SCPs', sublabel: 'explicit deny check', via: 'first gate' },
    { id: 'identity', label: 'Identity Policies', sublabel: 'attached to user/role', via: 'evaluate' },
    { id: 'resource', label: 'Resource Policy', sublabel: 'e.g. S3 bucket policy', via: 'evaluate' },
    { id: 'boundary', label: 'Permissions Boundary', sublabel: 'if set, caps max', via: 'evaluate' },
    { id: 'decision', label: 'Allow / Deny', sublabel: 'final decision', via: 'combine' },
  ],
}

export const snsFanoutFlow: FlowDefinition = {
  id: 'sns-fanout',
  title: 'SNS fanout to SQS',
  description: 'One event, many independent consumers, each with its own queue and retry policy',
  nodes: [
    { id: 'publisher', label: 'Publisher', sublabel: 'emits event' },
    { id: 'sns', label: 'SNS Topic', sublabel: 'fanout point', via: 'publish' },
    { id: 'sqs1', label: 'SQS: Email', sublabel: 'own retry policy', via: 'subscribe' },
    { id: 'sqs2', label: 'SQS: Analytics', sublabel: 'own retry policy', via: 'subscribe' },
    { id: 'lambda', label: 'Lambda', sublabel: 'processes queue', via: 'poll' },
  ],
}
