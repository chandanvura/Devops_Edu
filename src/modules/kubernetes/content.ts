import type { TopicContent } from '@/types'
import { kubectlApplyFlow, controlPlaneFlow, serviceRoutingFlow } from './flows'

export const kubernetesContent: Record<string, TopicContent> = {
  architecture: {
    eyebrow: 'Kubernetes · Beginner',
    title: 'Cluster Architecture',
    intro: 'A cluster is a control plane that continuously reconciles desired state with actual state, plus worker nodes that run the workloads.',
    flow: controlPlaneFlow,
    sections: [
      {
        title: 'Control plane components',
        bullets: [
          '<strong class="text-mist-100">API server</strong> — the only component that talks to etcd; handles authn/authz and admission',
          '<strong class="text-mist-100">etcd</strong> — distributed, consistent key-value store holding every object\'s desired state',
          '<strong class="text-mist-100">Scheduler</strong> — watches for pods with no assigned node, picks one based on resource requests, affinity, taints',
          '<strong class="text-mist-100">Controller manager</strong> — runs the reconciliation loops (Deployment, ReplicaSet, Node, Job controllers), as one process',
          '<strong class="text-mist-100">Cloud controller manager</strong> — talks to the cloud provider API for load balancers, node lifecycle, routes',
        ],
        body: [],
      },
      {
        title: 'Node components',
        bullets: [
          '<strong class="text-mist-100">kubelet</strong> — watches the API server for pods assigned to its node, drives the container runtime to match',
          '<strong class="text-mist-100">kube-proxy</strong> — programs iptables/IPVS rules so Service IPs route to the right pod IPs',
          '<strong class="text-mist-100">Container runtime</strong> — containerd or CRI-O, implements the CRI that kubelet calls',
        ],
        body: [],
      },
    ],
    commands: [
      { command: 'kubectl get componentstatuses', output: 'NAME                 STATUS    MESSAGE\nscheduler            Healthy   ok\ncontroller-manager   Healthy   ok\netcd-0               Healthy   ok' },
      { command: 'kubectl get nodes -o wide', output: 'NAME     STATUS   ROLES           VERSION\nnode-a   Ready    control-plane   v1.31.0\nnode-b   Ready    <none>          v1.31.0' },
    ],
    quiz: [
      { id: 'q1', prompt: "What is etcd's role in the cluster?", choices: ['It runs your containers', 'It is the single source of truth for cluster desired state, a distributed key-value store', 'It schedules pods onto nodes', 'It proxies service traffic'], correctIndex: 1, explanation: 'etcd stores every object\'s desired state. Only the API server talks to it directly; everything else watches the API server.', difficulty: 'easy' },
      { id: 'q2', prompt: 'If you kubectl edit a Deployment directly, what actually reconciles the change?', choices: ['kubectl pushes the change to every node directly', 'The scheduler updates the running pods in place', 'A controller notices actual state has drifted and acts to close the gap', 'Nothing — Deployments are immutable'], correctIndex: 2, explanation: 'Every controller runs a continuous watch-diff-act reconciliation loop.', difficulty: 'medium' },
    ],
  },

  'kubectl-apply-lifecycle': {
    eyebrow: 'Kubernetes · Beginner',
    title: 'kubectl apply — request lifecycle',
    intro: 'What actually happens between pressing enter and a container running, hop by hop.',
    flow: kubectlApplyFlow,
    flowStepDuration: 1200,
    sections: [
      {
        title: "What's happening",
        body: [
          "kubectl diffs your manifest against the live object (a three-way merge using the last-applied-configuration annotation) and sends an HTTPS request to the API server, authenticated via your kubeconfig's client cert or token.",
          'The API server runs authentication, then authorization (RBAC), then admission control — mutating webhooks first, then validating webhooks — before the object is ever persisted. Only then does it write to etcd.',
          'The scheduler and kubelet never talk to etcd directly. Every component watches the API server\'s watch stream and reacts — this is why the API server is the only true gatekeeper in the cluster.',
        ],
      },
    ],
    commands: [
      { command: 'kubectl apply -f deployment.yaml -v=8', output: '... POST /apis/apps/v1/namespaces/default/deployments\n... admission webhook "mutate.sidecar" mutated object\n... admission webhook "validate.policy" allowed object\n... 201 Created' },
      { command: 'kubectl get events --sort-by=.lastTimestamp', output: '2m   Normal   Scheduled   pod/app-7d9f   assigned to node-b\n2m   Normal   Pulled      pod/app-7d9f   image pulled\n2m   Normal   Started     pod/app-7d9f   container started' },
    ],
    mistakes: [
      'Assuming <code>kubectl apply</code> is synchronous — it returns once etcd is written, not once the pod is running.',
      'Debugging "pod stuck pending" by checking kubelet logs, when the actual blocker is the scheduler finding no matching node.',
      'Not knowing admission webhooks exist, then being confused when a manifest gets silently mutated or rejected.',
    ],
    quiz: [
      { id: 'q1', prompt: 'After etcd persists a new Pod object, what actually assigns it to a node?', choices: ['kubelet, by polling etcd directly', 'The scheduler, which watches for unscheduled pods and writes a binding', 'The API server, at write time', 'Admission controllers'], correctIndex: 1, explanation: 'The scheduler watches for pods with empty .spec.nodeName, scores nodes, and writes the binding through the API server.', difficulty: 'medium' },
      { id: 'q2', prompt: 'Why can a manifest pass schema validation but still get rejected?', choices: ['It cannot', 'Admission webhooks can reject or alter the object after schema checks pass', 'etcd rejects large objects unrelated to schema', 'kubectl blocks it client-side first'], correctIndex: 1, explanation: 'Admission control runs after schema validation: mutating webhooks can modify the object, then validating webhooks (e.g. OPA/Gatekeeper) can still reject it.', difficulty: 'hard' },
    ],
  },

  'pods-and-controllers': {
    eyebrow: 'Kubernetes · Beginner',
    title: 'Pods, ReplicaSets & Deployments',
    intro: 'Deployments never touch pods directly — they manage ReplicaSets, which manage pods. Understanding that chain explains rollouts and rollbacks.',
    sections: [
      {
        title: 'The ownership chain',
        body: [
          'A Deployment creates a ReplicaSet. The ReplicaSet creates and maintains the pod count. When you update a Deployment\'s pod template, it creates a NEW ReplicaSet and scales it up while scaling the old one down — a rolling update.',
          'A rollback is just re-pointing the Deployment at a previous ReplicaSet revision, which is why old ReplicaSets are kept around (scaled to 0) rather than deleted.',
        ],
      },
    ],
    commands: [
      { command: 'kubectl rollout status deployment/app', output: 'Waiting for rollout: 2 of 4 new replicas updated...\ndeployment "app" successfully rolled out' },
      { command: 'kubectl rollout undo deployment/app', output: 'deployment.apps/app rolled back' },
      { command: 'kubectl get rs -l app=myapp', output: 'NAME             DESIRED   CURRENT   READY\napp-7d9f8c6b4    4         4         4\napp-5f6b8d9a1    0         0         0' },
    ],
    mistakes: ['Editing pods directly to "fix" something — the controller notices the drift and reverts it on the next reconcile.'],
    quiz: [
      { id: 'q1', prompt: 'A Deployment update is stuck at "1 of 3 new replicas updated". Most likely cause?', choices: ['The Deployment YAML has a syntax error', 'The new pod is failing readiness probes, so the rollout pauses to avoid taking down more old pods', 'etcd is full', 'ReplicaSets cannot exceed 2 replicas'], correctIndex: 1, explanation: 'Rolling updates respect maxUnavailable/maxSurge and will not proceed past a failing readiness probe on the new revision.', difficulty: 'medium' },
    ],
  },

  'services-and-ingress': {
    eyebrow: 'Kubernetes · Intermediate',
    title: 'Services & Ingress',
    intro: 'A Service is a stable virtual IP in front of a changing set of pods; Ingress is an L7 router in front of Services.',
    flow: serviceRoutingFlow,
    sections: [
      {
        title: 'Why Services exist',
        body: [
          'Pods are ephemeral — their IPs change on every restart. A Service gives a stable ClusterIP and DNS name; kube-proxy keeps iptables/IPVS rules updated as pods come and go, based on the Service\'s label selector.',
          'Ingress sits above Services, doing host/path-based HTTP routing, TLS termination, and load balancing across multiple Services — something a single Service alone cannot do.',
        ],
      },
    ],
    commands: [
      { command: 'kubectl get endpoints my-service', output: 'NAME         ENDPOINTS\nmy-service   10.244.1.5:8080,10.244.2.9:8080' },
      { command: 'kubectl describe ingress app-ingress', output: 'Rules:\n  Host        Path   Backend\n  app.example.com   /   app-service:80' },
    ],
    mistakes: ['Forgetting a Service\'s selector must exactly match pod labels — a typo means an empty endpoints list and silent 503s.'],
    quiz: [
      { id: 'q1', prompt: 'How does kube-proxy know which pods back a Service?', choices: ['DNS lookup at request time', 'It reads a static list from the Deployment', 'It watches Endpoints/EndpointSlice objects, updated from the Service label selector', 'It asks etcd directly'], correctIndex: 2, explanation: 'The endpoints controller matches the Service selector against pod labels and writes Endpoints/EndpointSlice objects, which kube-proxy watches to program routing rules.', difficulty: 'medium' },
    ],
  },

  scheduling: {
    eyebrow: 'Kubernetes · Intermediate',
    title: 'Scheduling',
    intro: 'The scheduler filters nodes that can run a pod, then scores the survivors to pick the best one.',
    sections: [
      {
        title: 'Filter then score',
        body: ['Filtering eliminates nodes that fail hard constraints: insufficient resources, taints without matching tolerations, node selector mismatches. Scoring then ranks remaining nodes by spread, affinity preference, and resource balance.'],
        bullets: [
          '<strong class="text-mist-100">Node affinity/anti-affinity</strong> — prefer or require nodes matching labels',
          '<strong class="text-mist-100">Pod affinity/anti-affinity</strong> — co-locate or spread pods relative to other pods',
          '<strong class="text-mist-100">Taints & tolerations</strong> — nodes repel pods unless the pod explicitly tolerates the taint',
        ],
      },
    ],
    commands: [
      { command: 'kubectl taint nodes node-a dedicated=gpu:NoSchedule', output: 'node/node-a tainted' },
      { command: 'kubectl describe pod app-xyz | grep -A2 Events', output: 'Warning  FailedScheduling  0/3 nodes are available: 3 node(s) had untolerated taint' },
    ],
    mistakes: ['Confusing taints (repel pods from a node) with node affinity (attract pods to a node) — they solve opposite problems and are often needed together.'],
  },

  debugging: {
    eyebrow: 'Kubernetes · Intermediate',
    title: 'Debugging Pods',
    intro: 'Most pod failures fall into a handful of patterns once you know where to look.',
    sections: [
      {
        title: 'Common failure patterns',
        bullets: [
          '<strong class="text-mist-100">CrashLoopBackOff</strong> — the container starts then exits; check <code>kubectl logs --previous</code> for the exit reason',
          '<strong class="text-mist-100">OOMKilled</strong> — process exceeded its memory limit; check <code>kubectl describe pod</code> for "Reason: OOMKilled"',
          '<strong class="text-mist-100">Pending</strong> — scheduler cannot place it; check <code>Events</code> for insufficient resources or taints',
          '<strong class="text-mist-100">ImagePullBackOff</strong> — bad image name/tag or missing registry credentials',
        ],
        body: [],
      },
    ],
    commands: [
      { command: 'kubectl logs app-xyz --previous', output: 'Error: connect ECONNREFUSED 127.0.0.1:5432\n    at TCPConnectWrap.afterConnect' },
      { command: 'kubectl describe pod app-xyz', output: 'State: Terminated\nReason: OOMKilled\nExit Code: 137' },
    ],
    mistakes: ['Restarting the pod repeatedly instead of reading <code>--previous</code> logs, which get lost after enough restarts.'],
  },

  'rbac-and-security': {
    eyebrow: 'Kubernetes · Advanced',
    title: 'RBAC & Pod Security',
    intro: 'RBAC controls who can do what to which objects; Pod Security Standards control what a running pod is allowed to do.',
    sections: [
      {
        title: 'RBAC building blocks',
        bullets: [
          '<strong class="text-mist-100">Role / ClusterRole</strong> — defines a set of permissions (verbs on resources)',
          '<strong class="text-mist-100">RoleBinding / ClusterRoleBinding</strong> — grants a Role to a user, group, or ServiceAccount',
        ],
        body: ['Role is namespace-scoped; ClusterRole is cluster-wide (or reusable across namespaces via RoleBinding).'],
      },
      {
        title: 'Pod Security Standards',
        body: ['Replaced PodSecurityPolicy. Three levels — privileged, baseline, restricted — enforced per namespace via labels, checked by a built-in admission controller.'],
      },
    ],
    commands: [
      { command: 'kubectl auth can-i delete pods --as=system:serviceaccount:default:ci-bot', output: 'no' },
      { command: 'kubectl label namespace prod pod-security.kubernetes.io/enforce=restricted', output: 'namespace/prod labeled' },
    ],
    quiz: [
      { id: 'q1', prompt: 'A ServiceAccount needs to list pods in one namespace only. What do you grant?', choices: ['A ClusterRole + ClusterRoleBinding', 'A Role + RoleBinding scoped to that namespace', 'Cluster-admin, then restrict later', 'Nothing — ServiceAccounts have full access by default'], correctIndex: 1, explanation: 'Role + RoleBinding is namespace-scoped and follows least privilege; a ClusterRole would grant access cluster-wide unless bound via a namespaced RoleBinding, which is more indirection than needed here.', difficulty: 'medium' },
    ],
  },

  'interview-questions': {
    eyebrow: 'Kubernetes · Interview Prep',
    title: 'Interview Questions',
    intro: 'From fundamentals to production debugging and architecture rounds.',
    sections: [],
    quiz: [
      { id: 'q1', prompt: 'What is the difference between a Deployment and a StatefulSet?', choices: ['No difference', 'StatefulSet gives pods stable identity (name, storage) and ordered rollout; Deployment pods are interchangeable', 'Deployment is for stateless-only images, enforced by Kubernetes', 'StatefulSet cannot be scaled'], correctIndex: 1, explanation: 'StatefulSets provide stable network identity and per-pod persistent storage, with ordered, graceful deployment/scaling — needed for databases and clustered apps.', difficulty: 'medium' },
      { id: 'q2', prompt: 'Liveness probe is failing but the app is actually healthy and just slow to start. What happens, and what is the fix?', choices: ['Nothing, liveness probes are advisory', 'Kubernetes keeps killing and restarting the container in a loop; fix by adding/raising a startupProbe or initialDelaySeconds', 'The pod is marked Pending forever', 'The Service removes the pod from DNS permanently'], correctIndex: 1, explanation: 'A liveness probe failing during slow startup causes repeated restarts. A startupProbe (or longer initialDelaySeconds) gives the app time to become ready before liveness checks begin.', difficulty: 'hard' },
      { id: 'q3', prompt: 'Two pods in the same namespace can\'t reach each other despite both being Running. First thing to check?', choices: ['Restart both pods', 'NetworkPolicy objects that might be denying the traffic', 'Node CPU usage', 'The Deployment replica count'], correctIndex: 1, explanation: 'NetworkPolicies are deny-by-default once any policy selects a pod. A missing allow rule for the expected traffic is the most common cause of "healthy but unreachable" pods.', difficulty: 'medium' },
    ],
  },
}
