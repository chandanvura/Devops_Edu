import type { FlowDefinition } from '@/types'

export const ansibleRunFlow: FlowDefinition = {
  id: 'ansible-run',
  title: 'ansible-playbook site.yml',
  description: 'Agentless, push-based: modules are shipped over SSH and executed remotely',
  nodes: [
    { id: 'control', label: 'Control Node', sublabel: 'your machine' },
    { id: 'inventory', label: 'Inventory', sublabel: 'target hosts', via: 'parse' },
    { id: 'ssh', label: 'SSH Connection', sublabel: 'per host, parallel', via: 'paramiko/OpenSSH' },
    { id: 'module', label: 'Python Module', sublabel: 'copied over', via: 'transfer' },
    { id: 'execute', label: 'Module Execution', sublabel: 'runs on target', via: 'python interpreter' },
    { id: 'result', label: 'JSON Result', sublabel: 'changed/ok/failed', via: 'stdout' },
  ],
}
