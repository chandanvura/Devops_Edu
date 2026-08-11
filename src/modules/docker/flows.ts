import type { FlowDefinition } from '@/types'

export const dockerRunFlow: FlowDefinition = {
  id: 'docker-run',
  title: 'docker run — from CLI to isolated process',
  description: 'The daemon, containerd, and runc handoff that creates a container',
  nodes: [
    { id: 'cli', label: 'docker CLI', sublabel: 'docker run nginx' },
    { id: 'daemon', label: 'dockerd', sublabel: 'daemon API', via: 'REST/gRPC' },
    { id: 'containerd', label: 'containerd', sublabel: 'image + lifecycle', via: 'CRI/gRPC' },
    { id: 'runc', label: 'runc', sublabel: 'OCI runtime', via: 'shim' },
    { id: 'namespaces', label: 'Namespaces', sublabel: 'pid, net, mnt, uts', via: 'clone()' },
    { id: 'cgroups', label: 'cgroups', sublabel: 'CPU/mem limits', via: 'cgroupfs' },
    { id: 'process', label: 'Container Process', sublabel: 'PID 1 inside', via: 'exec' },
  ],
}

export const dockerNetworkFlow: FlowDefinition = {
  id: 'docker-network',
  title: 'Bridge network — container to internet',
  description: 'Default bridge mode: veth pair, NAT via iptables MASQUERADE',
  nodes: [
    { id: 'container', label: 'Container', sublabel: 'eth0 172.17.0.2' },
    { id: 'veth', label: 'veth pair', sublabel: 'virtual cable', via: 'L2' },
    { id: 'bridge', label: 'docker0', sublabel: 'bridge interface', via: 'switch' },
    { id: 'iptables', label: 'iptables', sublabel: 'MASQUERADE', via: 'NAT' },
    { id: 'host', label: 'Host NIC', sublabel: 'eth0', via: 'routed' },
    { id: 'internet', label: 'Internet', sublabel: 'destination', via: 'IP' },
  ],
}

export const buildkitFlow: FlowDefinition = {
  id: 'buildkit',
  title: 'BuildKit — parallel, cache-aware build',
  description: 'DAG-based builder: independent stages build concurrently, cache mounts persist across builds',
  nodes: [
    { id: 'frontend', label: 'Dockerfile', sublabel: 'parsed to LLB' },
    { id: 'dag', label: 'Build DAG', sublabel: 'dependency graph', via: 'solve' },
    { id: 'stage1', label: 'Stage: deps', sublabel: 'cache mount', via: 'parallel' },
    { id: 'stage2', label: 'Stage: build', sublabel: 'cache mount', via: 'parallel' },
    { id: 'merge', label: 'Final Stage', sublabel: 'COPY --from', via: 'merge' },
    { id: 'export', label: 'Exporter', sublabel: 'OCI image', via: 'export' },
  ],
}
export const dockerBuildFlow: FlowDefinition = {
  id: 'docker-build',
  title: 'docker build — layer by layer',
  description: 'Each Dockerfile instruction that changes the filesystem produces a new, cached layer',
  nodes: [
    { id: 'dockerfile', label: 'Dockerfile', sublabel: 'instructions' },
    { id: 'context', label: 'Build Context', sublabel: 'sent to daemon', via: 'tar stream' },
    { id: 'layer1', label: 'FROM', sublabel: 'base layer', via: 'cache check' },
    { id: 'layer2', label: 'RUN', sublabel: 'deps installed', via: 'cache miss' },
    { id: 'layer3', label: 'COPY', sublabel: 'app code', via: 'new layer' },
    { id: 'image', label: 'Final Image', sublabel: 'layers merged', via: 'UnionFS' },
    { id: 'registry', label: 'Registry', sublabel: 'pushed', via: 'HTTPS' },
  ],
}
