import Ajv, { type ValidateFunction } from 'ajv'
import schemaBundle from '@/data/k8sSchemaBundle.json'

// Real Kubernetes OpenAPI v2 schema definitions (extracted from
// kubernetes/kubernetes release-1.31 api/openapi-spec/swagger.json, trimmed
// to only the kinds below + their transitive $ref dependencies — ~180
// definitions, 293KB). This validates against the actual upstream schema,
// not a hand-rolled required-field list.
const kindToDef: Record<string, string> = {
  Deployment: 'io.k8s.api.apps.v1.Deployment',
  Service: 'io.k8s.api.core.v1.Service',
  Pod: 'io.k8s.api.core.v1.Pod',
  ConfigMap: 'io.k8s.api.core.v1.ConfigMap',
  Ingress: 'io.k8s.api.networking.v1.Ingress',
  Job: 'io.k8s.api.batch.v1.Job',
  CronJob: 'io.k8s.api.batch.v1.CronJob',
  StatefulSet: 'io.k8s.api.apps.v1.StatefulSet',
}

const kindToApiVersion: Record<string, string[]> = {
  Deployment: ['apps/v1'],
  Service: ['v1'],
  Pod: ['v1'],
  ConfigMap: ['v1'],
  Ingress: ['networking.k8s.io/v1'],
  Job: ['batch/v1'],
  CronJob: ['batch/v1'],
  StatefulSet: ['apps/v1'],
}

// k8s's Swagger definitions use vendor extensions (x-kubernetes-*) and
// int32/int64 "formats" ajv doesn't know about — strict:false and
// validateFormats:false let real k8s schemas compile without ajv treating
// upstream's own spec as invalid.
const ajv = new Ajv({ strict: false, allErrors: true, validateFormats: false })
ajv.addSchema(schemaBundle, 'k8s')

const compiled = new Map<string, ValidateFunction>()
function validatorFor(kind: string): ValidateFunction | null {
  const defName = kindToDef[kind]
  if (!defName) return null
  if (!compiled.has(kind)) {
    compiled.set(kind, ajv.compile({ $ref: `k8s#/definitions/${defName}` }))
  }
  return compiled.get(kind)!
}

export interface ValidationResult {
  kind: string | null
  errors: string[]
  warnings: string[]
  knownKind: boolean
}

function formatError(instancePath: string, message?: string): string {
  const path = instancePath ? instancePath.replace(/^\//, '').replace(/\//g, '.') : '(root)'
  return `${path}: ${message ?? 'invalid'}`
}

export function validateK8sManifest(doc: unknown): ValidationResult {
  if (typeof doc !== 'object' || doc === null) {
    return { kind: null, errors: ['Document is not an object'], warnings: [], knownKind: false }
  }
  const kind = (doc as Record<string, unknown>).kind
  const apiVersion = (doc as Record<string, unknown>).apiVersion

  if (typeof kind !== 'string') {
    return { kind: null, errors: ['Missing required field: kind'], warnings: [], knownKind: false }
  }

  const validate = validatorFor(kind)
  if (!validate) {
    return {
      kind,
      errors: [],
      warnings: [`No schema loaded for kind "${kind}" — only syntax was checked, not structure. Supported: ${Object.keys(kindToDef).join(', ')}.`],
      knownKind: false,
    }
  }

  const warnings: string[] = []
  const expectedVersions = kindToApiVersion[kind]
  if (typeof apiVersion !== 'string') {
    warnings.push('Missing apiVersion (not enforced by the schema itself, but required by the real API server)')
  } else if (expectedVersions && !expectedVersions.includes(apiVersion)) {
    warnings.push(`apiVersion "${apiVersion}" is unusual for ${kind} — commonly ${expectedVersions.join(' or ')}`)
  }

  const ok = validate(doc)
  const errors = ok ? [] : (validate.errors ?? []).map((e) => formatError(e.instancePath, e.message))

  return { kind, errors, warnings, knownKind: true }
}

export const supportedKinds = Object.keys(kindToDef)
