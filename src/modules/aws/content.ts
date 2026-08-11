import type { TopicContent } from '@/types'
import { requestLifecycleFlow, vpcRoutingFlow, iamEvalFlow, snsFanoutFlow } from './flows'

export const awsContent: Record<string, TopicContent> = {
  'vpc-networking': {
    eyebrow: 'AWS · Beginner',
    title: 'VPC Networking',
    intro: 'Public subnets route to the internet through an Internet Gateway; private subnets go outbound (only) through a NAT Gateway.',
    flow: vpcRoutingFlow,
    sections: [
      {
        title: 'The core distinction',
        body: [
          'A subnet is "public" only because its route table sends 0.0.0.0/0 to an Internet Gateway — it is a route table property, not an inherent subnet property.',
          'NAT Gateway allows outbound-only internet access for private subnets (e.g. pulling package updates) without exposing instances to inbound internet traffic — the NAT Gateway itself sits in a public subnet.',
        ],
      },
      {
        title: 'Security groups vs NACLs',
        bullets: [
          '<strong class="text-mist-100">Security Group</strong> — stateful, instance-level, allow-only rules',
          '<strong class="text-mist-100">Network ACL</strong> — stateless, subnet-level, supports explicit allow AND deny rules',
        ],
        body: [],
      },
    ],
    commands: [
      { command: 'aws ec2 describe-route-tables --filters Name=vpc-id,Values=vpc-0abc', output: 'Routes: [{"DestinationCidrBlock":"0.0.0.0/0","NatGatewayId":"nat-0xyz"}]' },
    ],
    quiz: [
      { id: 'q1', prompt: 'Why does a NAT Gateway live in a public subnet even though it serves private subnets?', choices: ['It does not matter where it lives', 'It needs its own route to the Internet Gateway to translate and forward private-subnet traffic outbound', 'NAT Gateways cannot be placed in private subnets by AWS policy for pricing reasons only', 'It is a historical accident with no technical reason'], correctIndex: 1, explanation: 'The NAT Gateway itself needs an outbound path via the IGW, which only public subnets have.', difficulty: 'medium' },
    ],
  },

  'iam-deep-dive': {
    eyebrow: 'AWS · Intermediate',
    title: 'IAM Deep Dive',
    intro: 'Every AWS API call is evaluated against multiple policy types — understanding the evaluation order explains most "access denied" surprises.',
    flow: iamEvalFlow,
    sections: [
      {
        title: 'The evaluation logic',
        body: [
          'The default is implicit deny. An identity policy or resource policy must explicitly allow the action, or the request is denied. But an explicit deny anywhere — in an SCP, identity policy, or resource policy — always overrides any allow, no matter where it appears.',
          'Permissions boundaries do not grant access on their own; they cap the maximum permissions an identity policy can grant, used to constrain what a role can be given even by someone with IAM admin rights.',
        ],
      },
    ],
    commands: [{ command: 'aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::123:role/app --action-names s3:GetObject', output: 'EvalDecision: allowed' }],
    quiz: [
      { id: 'q1', prompt: 'A role has an identity policy allowing s3:GetObject on a bucket, but the bucket policy does not mention the role at all. Cross-account access?', choices: ['Always denied — resource policy must explicitly allow cross-account principals too', 'Always allowed if the identity policy allows it', 'Depends only on the S3 bucket ACL', 'Depends on the region'], correctIndex: 0, explanation: 'For cross-account access, both the identity policy on the caller\'s side AND the resource policy on the resource\'s side must allow the action — same-account access can rely on the identity policy alone in many cases, but cross-account requires the resource policy to name the principal.', difficulty: 'hard' },
    ],
  },

  'request-lifecycle': {
    eyebrow: 'AWS · Beginner',
    title: 'Request Lifecycle',
    intro: 'The full path a browser request takes to reach an application running on EKS, and back.',
    flow: requestLifecycleFlow,
    sections: [
      {
        title: "What's happening at each hop",
        body: [
          'Route 53 resolves the domain to a CloudFront distribution. CloudFront serves cached content directly on a cache hit, or forwards to the origin (an ALB) on a miss, terminating TLS at the edge for lower latency.',
          'The ALB does L7 routing and health checks, forwarding to the Kubernetes Ingress controller, which routes based on host/path rules to the correct Service, which kube-proxy resolves to a specific pod IP.',
        ],
      },
    ],
    commands: [{ command: 'curl -w "%{time_total}\\n" -o /dev/null -s https://app.example.com', output: '0.087' }],
    quiz: [
      { id: 'q1', prompt: 'On a CloudFront cache miss, where does TLS get re-terminated before reaching the application?', choices: ['Never — TLS is only handled once at CloudFront', 'At the ALB, which can terminate TLS again for the origin connection', 'At the pod directly', 'At Route 53'], correctIndex: 1, explanation: 'It is common to terminate TLS at CloudFront (client-facing) and again at the ALB (origin-facing), giving encrypted hops end-to-end while still allowing edge caching and inspection at CloudFront.', difficulty: 'medium' },
    ],
  },

  'compute-eks-ecs-lambda': {
    eyebrow: 'AWS · Intermediate',
    title: 'EKS, ECS & Lambda',
    intro: 'Three different points on the same spectrum: how much orchestration control you want versus how much operational burden you are willing to own.',
    sections: [
      {
        title: 'Choosing between them',
        bullets: [
          '<strong class="text-mist-100">EKS</strong> — managed Kubernetes control plane; full K8s ecosystem access, most operational responsibility, best for complex/portable workloads',
          '<strong class="text-mist-100">ECS</strong> — AWS-native container orchestration, simpler mental model than K8s, tightly integrated with other AWS services, less portable',
          '<strong class="text-mist-100">Lambda</strong> — no servers or clusters at all; pay per invocation, cold-start latency trade-off, best for event-driven/bursty workloads',
        ],
        body: [],
      },
    ],
    quiz: [
      { id: 'q1', prompt: 'A workload runs for 50ms, triggered a few times a day by an S3 upload event. Best fit?', choices: ['EKS, for full control', 'ECS with always-on tasks', 'Lambda — near-zero idle cost for infrequent, short-lived, event-driven work', 'A dedicated EC2 instance'], correctIndex: 2, explanation: 'Lambda\'s per-invocation billing and native event-source integrations (like S3 triggers) fit infrequent, short workloads far better than paying for an always-on cluster or instance.', difficulty: 'easy' },
    ],
  },

  'storage-and-databases': {
    eyebrow: 'AWS · Intermediate',
    title: 'Storage & Databases',
    intro: 'S3 for objects, RDS/Aurora for relational, DynamoDB for key-value at scale — each with a fundamentally different consistency and scaling model.',
    sections: [
      {
        title: 'Picking the right one',
        bullets: [
          '<strong class="text-mist-100">S3</strong> — object storage, virtually unlimited scale, eventual-then-strong read-after-write consistency',
          '<strong class="text-mist-100">RDS</strong> — managed traditional relational databases (Postgres, MySQL), vertical scaling, familiar SQL',
          '<strong class="text-mist-100">Aurora</strong> — AWS-native relational engine, storage decoupled from compute, faster failover/replication than stock RDS',
          '<strong class="text-mist-100">DynamoDB</strong> — managed key-value/document store, near-infinite horizontal scale, requires access-pattern-first schema design',
        ],
        body: [],
      },
    ],
    commands: [{ command: 'aws dynamodb describe-table --table-name Sessions --query "Table.BillingModeSummary"', output: '{"BillingMode": "PAY_PER_REQUEST"}' }],
  },

  'messaging-sns-sqs': {
    eyebrow: 'AWS · Advanced',
    title: 'SNS, SQS & EventBridge',
    intro: 'SNS fans one event out to many independent subscribers; SQS decouples producer and consumer with a durable buffer; EventBridge adds content-based routing rules on top.',
    flow: snsFanoutFlow,
    sections: [
      {
        title: 'Composing them',
        body: ['A common pattern is SNS → multiple SQS queues: one publish fans out to N independently-consumed, independently-retried queues, so a slow or failing consumer never blocks the others. EventBridge adds pattern-matching rules on top, routing events to different targets based on event content rather than a fixed topic subscription.'],
      },
    ],
    commands: [{ command: 'aws sqs get-queue-attributes --queue-url $URL --attribute-names ApproximateNumberOfMessages', output: '{"Attributes": {"ApproximateNumberOfMessages": "42"}}' }],
  },
}
