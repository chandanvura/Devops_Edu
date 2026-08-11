import type { FlowDefinition } from '@/types'

export const kubectlApplyFlow: FlowDefinition = {
  id: 'kubectl-apply',
  title: 'kubectl apply -f deployment.yaml',
  description: 'From your terminal to a running container — every hop the object takes',
  nodes: [
    { id: 'kubectl', label: 'kubectl', sublabel: 'client-side' },
    { id: 'apiserver', label: 'API Server', sublabel: 'authn/authz', via: 'HTTPS + kubeconfig' },
    { id: 'admission', label: 'Admission', sublabel: 'validate/mutate', via: 'webhook chain' },
    { id: 'etcd', label: 'etcd', sublabel: 'desired state', via: 'gRPC write' },
    { id: 'scheduler', label: 'Scheduler', sublabel: 'picks node', via: 'watch etcd' },
    { id: 'kubelet', label: 'kubelet', sublabel: 'on chosen node', via: 'watch API server' },
    { id: 'cri', label: 'Container Runtime', sublabel: 'containerd', via: 'CRI gRPC' },
    { id: 'running', label: 'Pod Running', sublabel: 'status → API', via: 'PATCH status' },
  ],
}

export const controlPlaneFlow: FlowDefinition = {
  id: 'control-plane',
  title: 'Control plane, at rest',
  description: 'The reconciliation loop every controller runs, forever',
  nodes: [
    { id: 'desired', label: 'etcd', sublabel: 'desired state' },
    { id: 'controller', label: 'Controller Manager', sublabel: 'watch + diff', via: 'watch' },
    { id: 'apiserver2', label: 'API Server', sublabel: 'proposed change', via: 'PATCH' },
    { id: 'actual', label: 'Cluster', sublabel: 'actual state', via: 'apply' },
  ],
}

export const serviceRoutingFlow: FlowDefinition = {
  id: 'service-routing',
  title: 'Service → Pod routing',
  description: 'ClusterIP is virtual — kube-proxy programs the real path',
  nodes: [
    { id: 'client', label: 'Client Pod', sublabel: 'curl svc-name' },
    { id: 'dns', label: 'CoreDNS', sublabel: 'svc → ClusterIP', via: 'DNS' },
    { id: 'iptables', label: 'kube-proxy', sublabel: 'iptables/IPVS rules', via: 'TCP SYN' },
    { id: 'pod', label: 'Backend Pod', sublabel: 'DNAT to pod IP', via: 'DNAT' },
  ],
}
