import type { FlowDefinition } from '@/types'

export const terraformApplyFlow: FlowDefinition = {
  id: 'terraform-apply',
  title: 'terraform plan → apply',
  description: 'A dependency graph decides execution order, then real API calls make it true',
  nodes: [
    { id: 'hcl', label: 'HCL Config', sublabel: '.tf files' },
    { id: 'init', label: 'terraform init', sublabel: 'download providers', via: 'plugin protocol' },
    { id: 'graph', label: 'Dependency Graph', sublabel: 'resource ordering', via: 'DAG build' },
    { id: 'state', label: 'Read State', sublabel: 'current reality', via: 'backend read' },
    { id: 'plan', label: 'terraform plan', sublabel: 'diff desired vs state', via: 'compare' },
    { id: 'apply', label: 'terraform apply', sublabel: 'execute diff', via: 'confirm' },
    { id: 'api', label: 'Cloud Provider API', sublabel: 'AWS/GCP/Azure', via: 'REST' },
    { id: 'newstate', label: 'State Updated', sublabel: 'new reality recorded', via: 'write' },
  ],
}
