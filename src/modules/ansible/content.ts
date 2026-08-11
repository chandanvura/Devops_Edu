import type { TopicContent } from '@/types'
import { ansibleRunFlow } from './flows'

export const ansibleContent: Record<string, TopicContent> = {
  architecture: {
    eyebrow: 'Ansible · Beginner',
    title: 'Architecture',
    intro: 'No agent runs on managed hosts — Ansible connects over SSH, copies a Python module, executes it, and removes it.',
    flow: ansibleRunFlow,
    sections: [
      {
        title: 'Why agentless matters',
        body: ['There is nothing to install, upgrade, or secure on target hosts beyond an SSH server and Python — which is why Ansible is common for bootstrapping bare servers that don\'t have anything else running yet.'],
      },
    ],
    commands: [{ command: 'ansible all -m ping -i inventory.ini', output: 'web1 | SUCCESS => {"changed": false, "ping": "pong"}\nweb2 | SUCCESS => {"changed": false, "ping": "pong"}' }],
    quiz: [
      { id: 'q1', prompt: 'What does a managed host need installed permanently for Ansible to work?', choices: ['An Ansible agent daemon', 'Nothing beyond SSH access and a Python interpreter', 'Docker', 'A message queue client'], correctIndex: 1, explanation: 'Ansible is agentless — it pushes modules over SSH at run time and cleans up afterward, unlike Puppet/Chef which run a persistent agent.', difficulty: 'easy' },
    ],
  },

  'playbooks-and-roles': {
    eyebrow: 'Ansible · Beginner',
    title: 'Playbooks & Roles',
    intro: 'A playbook is an ordered list of tasks; a role is a reusable, conventionally-structured bundle of tasks, handlers, templates, and variables.',
    sections: [
      {
        title: 'Handlers only run on change',
        body: ['A handler (e.g. "restart nginx") only fires if a task notifies it AND that task actually reported changed. This is why editing a config file idempotently and then conditionally restarting a service is the standard pattern, rather than unconditionally restarting every run.'],
      },
    ],
    commands: [
      { command: 'ansible-playbook site.yml --check --diff', output: 'TASK [nginx : configure vhost] ***\nchanged: [web1]\n--- before\n+++ after\n-  server_name old.example.com;\n+  server_name new.example.com;' },
    ],
    quiz: [
      { id: 'q1', prompt: 'A task notifies a handler but reports "ok" (no change). Does the handler run?', choices: ['Yes, always', 'No — handlers only fire when the notifying task reports changed', 'Only on the first run', 'Only if --force is passed'], correctIndex: 1, explanation: 'Handlers are change-triggered by design, avoiding unnecessary restarts on idempotent no-op runs.', difficulty: 'medium' },
    ],
  },

  inventory: {
    eyebrow: 'Ansible · Intermediate',
    title: 'Inventory',
    intro: 'Static inventory files work for stable fleets; dynamic inventory scripts/plugins query a source of truth (cloud API, CMDB) at run time.',
    sections: [
      {
        title: 'Groups and variables',
        body: ['Hosts belong to groups, and variables can be set per-host or per-group, with group_vars/ and host_vars/ directories letting you avoid cluttering the inventory file itself.'],
      },
    ],
    commands: [{ command: 'ansible-inventory --graph', output: '@all:\n  |--@web:\n  |  |--web1\n  |  |--web2\n  |--@db:\n  |  |--db1' }],
  },

  vault: {
    eyebrow: 'Ansible · Intermediate',
    title: 'Ansible Vault',
    intro: 'Encrypts secrets at rest inside YAML files so they can be committed to version control safely.',
    sections: [
      {
        title: 'How it fits in',
        body: ['Vault encrypts entire files or individual string values with AES256, decrypted at run time using a password or key file — never stored in the repo.'],
      },
    ],
    commands: [
      { command: 'ansible-vault encrypt secrets.yml', output: 'Encryption successful' },
      { command: 'ansible-playbook site.yml --ask-vault-pass', output: 'Vault password: ****' },
    ],
    mistakes: ['Committing the vault password itself into the same repo as the encrypted file — defeats the purpose.'],
  },

  idempotency: {
    eyebrow: 'Ansible · Intermediate',
    title: 'Idempotency',
    intro: 'Running the same playbook twice should produce the same end state, with the second run reporting no changes.',
    sections: [
      {
        title: 'Why this matters',
        body: ['Idempotency is what makes playbooks safe to run repeatedly — in cron, in CI, or by hand for drift correction — without worrying about duplicate side effects. Modules like <code>apt</code>, <code>copy</code>, and <code>template</code> are idempotent by design; raw <code>shell</code>/<code>command</code> tasks are not, unless you add explicit guards.'],
      },
    ],
    quiz: [
      { id: 'q1', prompt: 'Why is `shell: useradd bob` a bad idempotency pattern?', choices: ['It is fine, Ansible handles it automatically', 'It fails on the second run because the user already exists — use the `user` module instead, which checks first', 'shell tasks cannot create users', 'It requires vault encryption'], correctIndex: 1, explanation: 'Raw shell/command tasks execute unconditionally every run. The dedicated `user` module checks current state first and only acts if needed — that is what makes it idempotent.', difficulty: 'medium' },
    ],
  },

  'production-examples': {
    eyebrow: 'Ansible · Advanced',
    title: 'Production Patterns',
    intro: 'Collections package roles, modules, and plugins for distribution via Ansible Galaxy — the same reuse story Helm charts provide for Kubernetes.',
    sections: [
      {
        title: 'Scaling beyond one playbook',
        bullets: [
          'Pin collection versions in <code>requirements.yml</code> for reproducible CI runs',
          'Use <code>--limit</code> and tags to run subsets of a large playbook safely',
          'Run playbooks through CI with <code>--check --diff</code> as a required PR gate before real application',
        ],
        body: [],
      },
    ],
    commands: [{ command: 'ansible-galaxy install -r requirements.yml', output: 'Starting galaxy collection install process\ncommunity.general:8.5.0 was installed successfully' }],
  },
}
