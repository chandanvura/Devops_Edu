import type { TopicContent } from '@/types'
import { dockerBuildFlow, dockerRunFlow, dockerNetworkFlow, buildkitFlow } from './flows'

export const dockerContent: Record<string, TopicContent> = {
  internals: {
    eyebrow: 'Docker · Intermediate',
    title: 'Docker Internals',
    intro: 'A container is not a lightweight VM — it is a regular Linux process with namespaces for isolation and cgroups for resource limits.',
    flow: dockerRunFlow,
    sections: [
      {
        title: 'What isolation actually is',
        body: [
          'Namespaces control what a process can see: PID namespace gives it its own process tree, net namespace its own network stack, mnt namespace its own filesystem mounts, uts its own hostname.',
          'cgroups (control groups) limit what a process can use: CPU shares, memory ceilings, I/O bandwidth. A container hitting its memory cgroup limit gets OOM-killed by the kernel, not by Docker.',
        ],
      },
      {
        title: 'The daemon chain',
        body: ['dockerd never runs containers itself. It delegates to containerd, which delegates to runc, which does the actual namespace/cgroup setup via Linux syscalls and then execs your process.'],
        bullets: [
          '<code>dockerd</code> — API, image management, networking, orchestrates containerd',
          '<code>containerd</code> — pulls images, manages container lifecycle, implements CRI',
          '<code>runc</code> — the actual OCI runtime; creates namespaces/cgroups, execs the process, then exits',
        ],
      },
    ],
    commands: [
      { command: 'docker inspect --format "{{.State.Pid}}" mycontainer', output: '48213' },
      { command: 'cat /proc/48213/cgroup', output: '0::/system.slice/docker-<id>.scope' },
      { command: 'ls -la /proc/48213/ns/', output: 'net -> net:[4026532xxx]\npid -> pid:[4026532xxx]\nmnt -> mnt:[4026532xxx]' },
    ],
    mistakes: [
      'Thinking containers are VMs — they share the host kernel, so a kernel exploit inside a container can affect the host.',
      'Not setting memory limits, then being surprised the OOM killer takes down an unrelated process on a loaded host.',
    ],
    quiz: [
      {
        id: 'q1',
        prompt: 'What actually creates the namespaces and cgroups for a new container?',
        choices: ['dockerd', 'containerd', 'runc', 'the Linux kernel scheduler'],
        correctIndex: 2,
        explanation: 'runc is the low-level OCI runtime that calls the namespace/cgroup syscalls directly, then execs the container process and exits — containerd supervises it afterward via containerd-shim.',
        difficulty: 'medium',
      },
    ],
  },

  'images-and-layers': {
    eyebrow: 'Docker · Beginner',
    title: 'Images & Layers',
    intro: "How a Dockerfile becomes a layered, content-addressable image — and why layer order is a performance decision, not a style choice.",
    flow: dockerBuildFlow,
    sections: [
      {
        title: "What's happening",
        body: [
          'Every image is a stack of read-only layers, each identified by a content hash. The daemon diffs each instruction\'s filesystem changes and stores only that diff — the union filesystem presents the stack as one merged view at runtime.',
          "A cache hit reuses an existing layer by hash instead of re-executing the instruction. The first instruction whose inputs changed invalidates its own layer and every layer built on top of it.",
        ],
      },
    ],
    commands: [
      { command: 'docker build -t app:latest .', output: '[+] Building 12.4s (9/9) FINISHED\n => [1/4] FROM node:20-slim   0.0s\n => CACHED [2/4] WORKDIR /app   0.0s\n => [3/4] COPY package*.json ./   0.3s\n => [4/4] RUN npm ci --omit=dev   8.1s' },
      { command: 'docker history app:latest', output: 'IMAGE          CREATED BY                     SIZE\nsha256:3f2a…   RUN npm ci --omit=dev         142MB\nsha256:9c1e…   COPY package*.json ./          2.1kB' },
    ],
    mistakes: [
      'Copying the whole build context before installing dependencies, busting the cache on every code change.',
      'Not using a <code>.dockerignore</code>, sending <code>node_modules</code> or <code>.git</code> into the build context.',
      'Chaining unrelated <code>RUN</code> commands into layers that are hard to cache independently.',
    ],
    quiz: [
      {
        id: 'q1',
        prompt: 'Why does reordering COPY before RUN npm install commonly break build caching?',
        choices: ['It does not', 'Any file change in an earlier layer invalidates that layer and every layer after it', 'npm install cannot run inside a layer', 'COPY instructions are never cached'],
        correctIndex: 1,
        explanation: 'Docker caches layers top-down. If COPY runs before npm install, every code change invalidates the dependency-install layer too, forcing a full reinstall on every build.',
        difficulty: 'medium',
      },
    ],
  },

  networking: {
    eyebrow: 'Docker · Intermediate',
    title: 'Networking',
    intro: 'Bridge, host, overlay, and macvlan drivers each trade off isolation, performance, and multi-host reach differently.',
    flow: dockerNetworkFlow,
    sections: [
      {
        title: 'The four drivers',
        bullets: [
          '<strong class="text-mist-100">bridge</strong> — default, per-host virtual switch (docker0), NAT to reach outside, good default for single-host',
          '<strong class="text-mist-100">host</strong> — no network namespace isolation, container shares the host\'s network stack directly, fastest but no port isolation',
          '<strong class="text-mist-100">overlay</strong> — VXLAN-based, spans multiple hosts, used for Swarm services and multi-host container-to-container traffic',
          '<strong class="text-mist-100">macvlan</strong> — container gets its own MAC address, appears as a physical device on the network, used when containers need to be directly routable',
        ],
        body: [],
      },
    ],
    commands: [
      { command: 'docker network inspect bridge --format "{{json .IPAM.Config}}"', output: '[{"Subnet":"172.17.0.0/16","Gateway":"172.17.0.1"}]' },
      { command: 'docker run --rm nginx ip route', output: 'default via 172.17.0.1 dev eth0' },
    ],
    mistakes: [
      'Using <code>host</code> networking for convenience in production, then losing per-container port isolation and security boundaries.',
      'Assuming <code>bridge</code> networks span hosts — they do not; use <code>overlay</code> for multi-host.',
    ],
    quiz: [
      {
        id: 'q1',
        prompt: 'Which driver lets a container appear as a physically distinct device on the LAN with its own MAC address?',
        choices: ['bridge', 'host', 'overlay', 'macvlan'],
        correctIndex: 3,
        explanation: 'macvlan assigns each container a unique MAC, making it look like a separate physical host on the network — useful for legacy apps that expect to bind directly to the LAN.',
        difficulty: 'medium',
      },
    ],
  },

  'build-with-buildkit': {
    eyebrow: 'Docker · Advanced',
    title: 'BuildKit',
    intro: 'The modern build engine: parallel stage execution, persistent cache mounts, and a DAG solver instead of a linear instruction list.',
    flow: buildkitFlow,
    sections: [
      {
        title: 'Why it is faster',
        body: [
          'Classic docker build executes instructions strictly in order. BuildKit parses the Dockerfile into a dependency graph (LLB) and runs independent stages concurrently.',
          'Cache mounts (<code>--mount=type=cache</code>) persist a directory (like <code>~/.npm</code> or <code>~/.cargo</code>) across builds even when the layer above it changes — something classic layer caching cannot do.',
        ],
      },
    ],
    commands: [
      { command: 'DOCKER_BUILDKIT=1 docker build .', output: '[+] Building 4.2s (11/11) FINISHED' },
      { command: '# Dockerfile cache mount syntax', output: 'RUN --mount=type=cache,target=/root/.npm npm ci' },
    ],
    mistakes: ['Forgetting <code>--mount=type=cache</code> only helps repeat local builds — CI runners with ephemeral caches need explicit cache export/import (<code>--cache-to</code>/<code>--cache-from</code>).'],
  },

  security: {
    eyebrow: 'Docker · Advanced',
    title: 'Security',
    intro: 'Rootless mode, image scanning, and least-privilege defaults close the gap between "it runs" and "it is safe to run".',
    sections: [
      {
        title: 'Rootless Docker',
        body: ['Runs the daemon and containers as an unprivileged user, mapped via user namespaces. Even a container escape lands the attacker as a non-root host user, not root.'],
      },
      {
        title: 'Scanning and hardening',
        bullets: [
          '<code>docker scout</code> (formerly Docker Scan) — CVE scanning against known image layers',
          'Docker Bench for Security — checks the daemon and containers against CIS benchmark rules',
          'Run as non-root inside the image (<code>USER</code> instruction), drop capabilities you don\'t need',
        ],
        body: [],
      },
    ],
    commands: [
      { command: 'docker scout cves app:latest', output: '✗ 3 vulnerabilities found (1 critical, 2 high)' },
      { command: 'docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE app', output: '' },
    ],
    mistakes: ['Running containers as root by default because the base image ships that way — always add a <code>USER</code> instruction.'],
    quiz: [
      {
        id: 'q1',
        prompt: 'What does rootless Docker primarily protect against?',
        choices: ['Slow builds', 'A container escape granting the attacker root on the host', 'Network eavesdropping', 'Image tag confusion'],
        correctIndex: 1,
        explanation: 'With user namespace remapping, container root maps to a non-privileged host user, so an escape does not hand over host root.',
        difficulty: 'medium',
      },
    ],
  },

  'interview-questions': {
    eyebrow: 'Docker · Interview Prep',
    title: 'Interview Questions',
    intro: 'From fundamentals to production debugging scenarios.',
    sections: [],
    quiz: [
      { id: 'q1', prompt: 'What is the difference between CMD and ENTRYPOINT?', choices: ['They are identical', 'ENTRYPOINT sets the fixed executable, CMD supplies default arguments that can be overridden', 'CMD runs at build time, ENTRYPOINT at run time', 'ENTRYPOINT only works in Compose'], correctIndex: 1, explanation: 'ENTRYPOINT defines what always runs; CMD provides default args to it, overridable via `docker run image <args>`.', difficulty: 'easy' },
      { id: 'q2', prompt: 'A container keeps restarting with exit code 137. What does that indicate?', choices: ['A syntax error in the Dockerfile', 'The process was killed, typically by the OOM killer hitting a memory cgroup limit', 'The image failed to pull', 'A network timeout'], correctIndex: 1, explanation: 'Exit 137 = 128+9 (SIGKILL). Combined with restarts, it strongly suggests the container is exceeding its memory limit and being OOM-killed.', difficulty: 'hard' },
      { id: 'q3', prompt: 'Why use multi-stage builds?', choices: ['To run tests faster', 'To keep build-time dependencies (compilers, dev tools) out of the final image, shrinking size and attack surface', 'They are required by Docker Hub', 'To support multiple architectures only'], correctIndex: 1, explanation: 'Multi-stage builds let you compile in one stage with a full toolchain, then COPY only the built artifact into a minimal final stage.', difficulty: 'medium' },
    ],
  },
}
