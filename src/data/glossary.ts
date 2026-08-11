export interface GlossaryTerm {
  term: string
  module: string
  definition: string
}

export const glossary: GlossaryTerm[] = [
  // Docker
  { term: 'Layer', module: 'Docker', definition: 'A read-only filesystem diff produced by one Dockerfile instruction, identified by a content hash and cached by that hash.' },
  { term: 'Union Filesystem', module: 'Docker', definition: 'The mechanism that merges an image\'s stacked layers into one coherent view at runtime (e.g. overlay2).' },
  { term: 'Namespace', module: 'Docker', definition: 'A Linux kernel feature that gives a process an isolated view of a resource — PID, network, mount, UTS, etc.' },
  { term: 'cgroup', module: 'Docker', definition: 'Control group — a Linux kernel feature that limits and accounts for a process\'s resource usage (CPU, memory, I/O).' },
  { term: 'BuildKit', module: 'Docker', definition: 'Docker\'s modern build engine — parses a Dockerfile into a dependency graph and executes independent stages in parallel with persistent cache mounts.' },
  { term: 'runc', module: 'Docker', definition: 'The low-level OCI-compliant runtime that actually creates namespaces/cgroups and execs the container process.' },

  // Kubernetes
  { term: 'etcd', module: 'Kubernetes', definition: 'The distributed, consistent key-value store holding all cluster desired state. Only the API server talks to it directly.' },
  { term: 'Reconciliation loop', module: 'Kubernetes', definition: 'The watch-diff-act pattern every controller runs continuously to converge actual state toward desired state.' },
  { term: 'Admission controller', module: 'Kubernetes', definition: 'A plugin that intercepts API requests after auth but before persistence, able to mutate or validate/reject the object.' },
  { term: 'CrashLoopBackOff', module: 'Kubernetes', definition: 'A pod status meaning the container keeps starting and exiting; Kubernetes backs off retry timing exponentially.' },
  { term: 'ReplicaSet', module: 'Kubernetes', definition: 'Ensures a specified number of identical pod replicas are running; owned and managed by a Deployment.' },
  { term: 'CoreDNS', module: 'Kubernetes', definition: 'The default in-cluster DNS server, resolving Service and Pod names to their ClusterIPs.' },
  { term: 'Taint / Toleration', module: 'Kubernetes', definition: 'A taint repels pods from a node unless the pod has a matching toleration explicitly allowing it to schedule there.' },
  { term: 'CRD', module: 'Kubernetes', definition: 'Custom Resource Definition — extends the Kubernetes API with a new object kind the cluster understands natively.' },

  // Helm
  { term: 'Chart', module: 'Helm', definition: 'A packaged, versioned bundle of Kubernetes manifest templates plus default configuration values.' },
  { term: 'Release', module: 'Helm', definition: 'A specific deployed instance of a chart with a given set of values, tracked as a Secret in the cluster.' },
  { term: 'Hook', module: 'Helm', definition: 'A Kubernetes Job triggered at a specific point in a release lifecycle, like pre-install or post-upgrade.' },

  // Terraform
  { term: 'State', module: 'Terraform', definition: "Terraform's record of what infrastructure it manages and its last-known attributes — the only link between config and reality." },
  { term: 'Provider', module: 'Terraform', definition: 'A plugin that translates HCL resource blocks into API calls against a specific platform (AWS, GCP, Kubernetes, etc).' },
  { term: 'Drift', module: 'Terraform', definition: "A mismatch between Terraform's state and actual infrastructure, usually caused by manual out-of-band changes." },
  { term: 'Module (Terraform)', module: 'Terraform', definition: 'A reusable directory of .tf files with defined input variables and outputs, composed like a function.' },

  // Ansible
  { term: 'Playbook', module: 'Ansible', definition: 'An ordered YAML list of plays and tasks describing the desired state of managed hosts.' },
  { term: 'Idempotency', module: 'Ansible', definition: 'The property that running the same task twice produces the same end state, with the second run reporting no change.' },
  { term: 'Handler', module: 'Ansible', definition: 'A task that only runs when explicitly notified by another task that reported a change.' },
  { term: 'Ansible Vault', module: 'Ansible', definition: 'A tool for encrypting secret values at rest inside playbooks and variable files.' },

  // Jenkins
  { term: 'Agent (Jenkins)', module: 'Jenkins', definition: 'A machine or ephemeral pod that actually executes pipeline steps, isolated from the controller.' },
  { term: 'Executor', module: 'Jenkins', definition: 'A slot on an agent capable of running one build step at a time.' },
  { term: 'Shared Library', module: 'Jenkins', definition: 'Versioned, reusable Groovy pipeline code that many Jenkinsfiles can import and call.' },

  // ArgoCD
  { term: 'GitOps', module: 'ArgoCD', definition: 'A deployment model where Git is the source of truth and an in-cluster agent pulls and reconciles toward it, rather than CI pushing changes directly.' },
  { term: 'Sync', module: 'ArgoCD', definition: 'The act of applying the diff between Git-declared manifests and the live cluster state.' },
  { term: 'App of Apps', module: 'ArgoCD', definition: 'A pattern where one root Application declares many child Applications, managing a whole fleet declaratively.' },

  // AWS
  { term: 'VPC', module: 'AWS', definition: 'Virtual Private Cloud — an isolated network environment within AWS where you control IP ranges, subnets, and routing.' },
  { term: 'NAT Gateway', module: 'AWS', definition: 'Allows outbound-only internet access for private subnet resources without exposing them to inbound internet traffic.' },
  { term: 'IAM Policy Evaluation', module: 'AWS', definition: 'The logic combining SCPs, identity policies, resource policies, and permission boundaries — default deny, explicit deny always wins.' },
  { term: 'ALB', module: 'AWS', definition: 'Application Load Balancer — an AWS-managed Layer 7 load balancer that routes HTTP(S) traffic based on host/path rules.' },
]
