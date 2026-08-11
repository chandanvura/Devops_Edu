import type { TopicContent } from '@/types'
import { terraformApplyFlow } from './flows'

export const terraformContent: Record<string, TopicContent> = {
  'hcl-and-providers': {
    eyebrow: 'Terraform · Beginner',
    title: 'HCL & Providers',
    intro: 'Providers are plugins that translate HCL resource blocks into API calls against a specific platform.',
    sections: [
      {
        title: 'Resources vs data sources',
        body: ['A <code>resource</code> block declares something Terraform should create and manage. A <code>data</code> block reads existing information Terraform does not manage — a lookup, not a creation.'],
      },
      {
        title: 'Providers are plugins, not built-ins',
        body: ['Every provider (aws, google, kubernetes, helm) is a separate binary Terraform downloads on init, communicating over a plugin protocol. This is why <code>terraform init</code> needs network access and why providers version independently of Terraform core.'],
      },
    ],
    commands: [
      { command: 'terraform init', output: 'Initializing provider plugins...\n- Installing hashicorp/aws v5.60.0...\nTerraform has been successfully initialized!' },
      { command: 'terraform providers', output: 'Providers required by configuration:\n.\n└── provider[registry.terraform.io/hashicorp/aws] 5.60.0' },
    ],
    quiz: [
      { id: 'q1', prompt: 'What is a data source for?', choices: ['Creating new infrastructure', 'Reading information about existing infrastructure Terraform does not manage', 'Storing state', 'Defining variables'], correctIndex: 1, explanation: 'data blocks are read-only lookups — e.g. fetching an existing VPC ID to reference, without Terraform taking ownership of it.', difficulty: 'easy' },
    ],
  },

  'plan-apply-lifecycle': {
    eyebrow: 'Terraform · Beginner',
    title: 'plan → apply lifecycle',
    intro: 'Terraform never mutates infrastructure directly during plan — plan is a pure diff, apply is the only step that calls write APIs.',
    flow: terraformApplyFlow,
    graph: {
      nodes: [
        { id: 'vpc', label: 'aws_vpc.main', sublabel: 'network root' },
        { id: 'subnet', label: 'aws_subnet.app', sublabel: 'depends on vpc' },
        { id: 'igw', label: 'aws_internet_gateway.main', sublabel: 'depends on vpc' },
        { id: 'sg', label: 'aws_security_group.app', sublabel: 'depends on vpc' },
        { id: 'rt', label: 'aws_route_table.public', sublabel: 'depends on igw' },
        { id: 'instance', label: 'aws_instance.web', sublabel: 'depends on subnet, sg' },
        { id: 'eip', label: 'aws_eip.web', sublabel: 'depends on instance' },
      ],
      edges: [
        { from: 'vpc', to: 'subnet' },
        { from: 'vpc', to: 'igw' },
        { from: 'vpc', to: 'sg' },
        { from: 'igw', to: 'rt' },
        { from: 'subnet', to: 'instance' },
        { from: 'sg', to: 'instance' },
        { from: 'instance', to: 'eip' },
      ],
    },
    sections: [
      {
        title: "What's happening",
        body: [
          'Terraform builds a dependency graph from resource references (implicit) and depends_on (explicit), then walks it to determine safe parallel execution order — independent resources apply concurrently, dependent ones wait.',
          'plan reads current state, compares it to desired config, and shows exactly what would change — without calling any create/update/delete API. apply re-confirms that diff is still accurate, then executes it against the real provider API.',
        ],
      },
      {
        title: 'Reading the graph above',
        body: ['aws_subnet, aws_internet_gateway, and aws_security_group all depend only on the VPC, so Terraform applies them in parallel. aws_instance waits on both its subnet and security group; aws_eip waits on the instance. This is exactly the DAG `terraform graph` would show for this configuration.'],
      },
    ],
    commands: [
      { command: 'terraform graph', output: 'digraph {\n  aws_subnet.app -> aws_vpc.main\n  aws_instance.web -> aws_subnet.app\n  aws_instance.web -> aws_security_group.app\n}' },
      { command: 'terraform plan -out=tfplan', output: 'Plan: 3 to add, 1 to change, 0 to destroy.' },
      { command: 'terraform apply tfplan', output: 'aws_instance.web: Creating...\naws_instance.web: Creation complete after 34s\nApply complete! Resources: 3 added, 1 changed, 0 destroyed.' },
    ],
    mistakes: ['Running terraform apply without a saved plan file in CI — between plan and apply, someone else\'s change can land, and apply will silently re-plan against a different state.'],
    quiz: [
      { id: 'q1', prompt: 'Why does terraform apply -f a saved plan matter for CI safety?', choices: ['It runs faster', 'It guarantees apply executes exactly what was reviewed, not a re-computed diff against possibly-changed state', 'It skips provider authentication', 'It disables state locking'], correctIndex: 1, explanation: 'Without a saved plan, apply recomputes the diff fresh — if state changed between review and apply, you approve one thing and execute another.', difficulty: 'medium' },
    ],
  },

  'state-and-backend': {
    eyebrow: 'Terraform · Intermediate',
    title: 'State & Remote Backends',
    intro: 'State is Terraform\'s only record of what it manages — losing it means Terraform no longer knows what it owns.',
    sections: [
      {
        title: 'Why remote state and locking matter',
        body: ['Local state files break the moment two people run Terraform against the same config — remote backends (S3+DynamoDB, Terraform Cloud, GCS) store state centrally and lock it during apply so concurrent runs cannot corrupt it.'],
        bullets: [
          '<strong class="text-mist-100">Drift</strong> — reality changed outside Terraform (manual console edit); next plan shows an unexpected diff',
          '<strong class="text-mist-100">State locking</strong> — prevents two applies from writing state simultaneously',
          '<strong class="text-mist-100">terraform import</strong> — brings existing, unmanaged infrastructure under Terraform\'s state',
        ],
      },
    ],
    commands: [
      { command: 'terraform state list', output: 'aws_instance.web\naws_s3_bucket.assets' },
      { command: 'terraform state show aws_instance.web', output: 'resource "aws_instance" "web" {\n  id = "i-0abc123"\n  ...\n}' },
    ],
    quiz: [
      { id: 'q1', prompt: 'Someone manually deletes a resource in the AWS console that Terraform manages. What does the next plan show?', choices: ['An error, Terraform refuses to run', 'Nothing, Terraform assumes it still exists', 'A plan to recreate it, since state says it should exist but it does not', 'Terraform automatically restores it without asking'], correctIndex: 2, explanation: 'On refresh, Terraform detects the resource is gone and plans to recreate it to match desired state — this is drift detection in action.', difficulty: 'medium' },
    ],
  },

  modules: {
    eyebrow: 'Terraform · Intermediate',
    title: 'Modules',
    intro: 'A module is just a directory of .tf files with input variables and outputs — the root config and every module are the same mechanism.',
    sections: [
      {
        title: 'Composition, not inheritance',
        body: ['Modules compose by passing outputs of one as inputs to another. There is no shared mutable state between modules beyond what you explicitly wire through variables and outputs — this makes them predictable to reason about.'],
      },
    ],
    commands: [{ command: '# calling a module', output: 'module "vpc" {\n  source = "./modules/vpc"\n  cidr   = "10.0.0.0/16"\n}' }],
  },

  workspaces: {
    eyebrow: 'Terraform · Advanced',
    title: 'Workspaces',
    intro: 'Workspaces let one configuration manage multiple state files — commonly misused as an environment strategy when a separate config per environment is often safer.',
    sections: [
      {
        title: 'Where workspaces fit',
        body: ['They are best for short-lived, structurally identical variations (e.g. per-PR preview environments) — not for prod vs staging, where drift in providers, variables, or approvals process usually argues for fully separate configs and state.'],
      },
    ],
    commands: [
      { command: 'terraform workspace new feature-123', output: 'Created and switched to workspace "feature-123"!' },
      { command: 'terraform workspace list', output: 'default\n* feature-123\nstaging' },
    ],
  },

  'best-practices': {
    eyebrow: 'Terraform · Advanced',
    title: 'Best Practices',
    intro: 'The patterns that keep a Terraform codebase reviewable at scale.',
    sections: [
      {
        title: 'Production checklist',
        bullets: [
          'Always require a plan output attached to the PR before merge — never apply from a laptop',
          'Pin provider versions with a lock file (<code>.terraform.lock.hcl</code>) committed to version control',
          'Use remote state with locking for every environment, no exceptions',
          'Keep modules small and single-purpose; avoid one giant "everything" module',
        ],
        body: [],
      },
    ],
    quiz: [
      { id: 'q1', prompt: 'Why commit .terraform.lock.hcl?', choices: ["It's optional metadata", 'It pins exact provider versions/hashes so every run resolves identically, preventing surprise upgrades', 'It stores secrets', 'It replaces the state file'], correctIndex: 1, explanation: 'Without the lock file, a provider could resolve to a newer version between runs, introducing untested behavior changes.', difficulty: 'medium' },
    ],
  },
}
