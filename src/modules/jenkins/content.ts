import type { TopicContent } from '@/types'
import { jenkinsPipelineFlow } from './flows'

export const jenkinsContent: Record<string, TopicContent> = {
  architecture: {
    eyebrow: 'Jenkins · Beginner',
    title: 'Master/Agent Architecture',
    intro: 'The controller schedules and orchestrates; agents actually execute build steps, isolating untrusted build code from the controller.',
    sections: [
      {
        title: 'Why split controller and agents',
        body: ['Running builds directly on the controller exposes it to whatever a build script does — a compromised dependency in a build could reach Jenkins\' own credentials store. Agents (static, SSH-connected, or ephemeral Kubernetes pods) execute the actual work; the controller only schedules and aggregates results.'],
        bullets: [
          '<strong class="text-mist-100">Executor</strong> — a slot on an agent that can run one build step at a time',
          '<strong class="text-mist-100">Label</strong> — tags an agent by capability (e.g. <code>docker</code>, <code>gpu</code>), pipelines request agents by label',
        ],
      },
    ],
    commands: [{ command: 'curl -s http://jenkins/computer/api/json', output: '{"computer":[{"displayName":"agent-1","numExecutors":4,"offline":false}]}' }],
    quiz: [
      { id: 'q1', prompt: 'Why avoid running builds directly on the Jenkins controller?', choices: ['It is slower', 'Untrusted build code gets exposed to the controller\'s stored credentials and full system access', 'The controller cannot run Docker', 'Controllers have no CPU'], correctIndex: 1, explanation: 'Isolating execution to agents limits the blast radius if a build script is malicious or a dependency is compromised.', difficulty: 'medium' },
    ],
  },

  'pipeline-lifecycle': {
    eyebrow: 'Jenkins · Beginner',
    title: 'Pipeline: commit to deploy',
    intro: 'The full path from a git push to a deployed artifact.',
    flow: jenkinsPipelineFlow,
    sections: [
      {
        title: "What's happening",
        body: ['A repo webhook notifies Jenkins on push, the controller enqueues a build and assigns it to an agent matching the pipeline\'s requested label, and the agent runs each declared stage in order — failing fast if any stage (like tests) fails, which prevents a broken build from reaching the deploy stage.'],
      },
    ],
    commands: [
      { command: '# Declarative pipeline stage', output: "stage('Test') {\n  steps {\n    sh 'npm test'\n  }\n}" },
    ],
    mistakes: ['Not failing the pipeline on non-zero exit from a shell step because output was piped through something that swallows the exit code.'],
  },

  'declarative-vs-scripted': {
    eyebrow: 'Jenkins · Intermediate',
    title: 'Declarative vs Scripted',
    intro: 'Declarative pipelines trade flexibility for structure and readability; scripted pipelines are full Groovy, more powerful but harder to review.',
    sections: [
      {
        title: 'When to reach for scripted',
        body: ['Declarative covers the vast majority of pipelines and is the recommended default. Scripted is worth the complexity only when you need real control flow — dynamic stage generation, complex conditionals — that declarative\'s constrained syntax cannot express cleanly.'],
      },
    ],
    commands: [{ command: '# scripted pipeline', output: "node {\n  stage('Build') {\n    sh 'make build'\n  }\n}" }],
  },

  'credentials-and-plugins': {
    eyebrow: 'Jenkins · Intermediate',
    title: 'Credentials & Plugins',
    intro: 'Jenkins\' plugin ecosystem is also its biggest attack surface — thousands of community plugins with varying maintenance quality.',
    sections: [
      {
        title: 'Credential handling',
        body: ['Credentials are stored encrypted and referenced by ID in pipelines, never hardcoded — Jenkins masks known credential values in console output automatically, but only for values it knows about.'],
      },
    ],
    commands: [{ command: '# referencing a credential in a pipeline', output: "withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'USER', passwordVariable: 'PASS')]) {\n  sh 'docker login -u $USER -p $PASS'\n}" }],
    quiz: [
      { id: 'q1', prompt: 'Why use withCredentials() instead of an env var set directly in the Jenkinsfile?', choices: ['No difference', "Jenkins masks the credential's value in console logs only when injected via withCredentials", 'It runs faster', 'It is required for Docker builds'], correctIndex: 1, explanation: 'Values hardcoded or exported manually are not tracked as credentials and will appear in plaintext in build logs.', difficulty: 'medium' },
    ],
  },

  'kubernetes-agents': {
    eyebrow: 'Jenkins · Advanced',
    title: 'Kubernetes Agents',
    intro: 'Each build gets a fresh, ephemeral pod as its agent — no state leaks between builds, no manually-maintained static agent fleet.',
    sections: [
      {
        title: 'Trade-offs',
        body: ['Pod startup adds latency to every build compared to a warm static agent, but you get perfect build isolation and the agent fleet scales to zero when idle — a strong fit for variable, bursty CI load.'],
      },
    ],
    commands: [{ command: '# Kubernetes plugin pod template snippet', output: "podTemplate(containers: [\n  containerTemplate(name: 'docker', image: 'docker:24-dind')\n]) { ... }" }],
  },

  'shared-libraries': {
    eyebrow: 'Jenkins · Advanced',
    title: 'Shared Libraries',
    intro: 'Shared libraries let many repos\' Jenkinsfiles call common, versioned pipeline logic instead of copy-pasting stages everywhere.',
    sections: [
      {
        title: 'Why this matters at scale',
        body: ['Without a shared library, updating a security scan step means editing every repo\'s Jenkinsfile individually. With one, it is a single library change that every consuming pipeline picks up on next run (or a pinned version, if you want controlled rollout).'],
      },
    ],
    commands: [{ command: '# using a shared library', output: "@Library('my-shared-lib@v2.1.0') _\n\nstandardPipeline(dockerImage: 'app')" }],
  },
}
