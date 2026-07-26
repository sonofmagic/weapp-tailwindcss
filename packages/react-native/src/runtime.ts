/* eslint-disable style/max-statements-per-line */

import type {
  NativeClassValue,
  NativePlatform,
  NativeStyleEnvironment,
  NativeStyleManifest,
  NativeStyleRule,
  NativeStyleRuntime,
} from './types'

let activeManifest: NativeStyleManifest | undefined
let activeEnvironment: NativeStyleEnvironment = {}

function flatten(value: NativeClassValue, result: string[]) {
  if (!value) { return }
  if (typeof value === 'string') {
    result.push(...value.split(/\s+/).filter(Boolean))
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) { flatten(item, result) }
    return
  }
  for (const [className, enabled] of Object.entries(value)) {
    if (enabled) { result.push(className) }
  }
}

function matches(rule: NativeStyleRule, environment: NativeStyleEnvironment) {
  if (rule.colorScheme && rule.colorScheme !== environment.colorScheme) { return false }
  if (!rule.platform) { return true }
  if (rule.platform === 'native') { return environment.platform !== 'web' }
  return rule.platform === environment.platform
}

function resolveStyle(value: NativeClassValue, manifest: NativeStyleManifest | undefined, environment: NativeStyleEnvironment) {
  const classNames: string[] = []
  flatten(value, classNames)
  const style: Record<string, unknown> = {}
  if (!manifest) { return style }
  for (const className of classNames) {
    for (const rule of manifest.rules[className] ?? []) {
      if (matches(rule, environment)) { Object.assign(style, rule.style) }
    }
  }
  return style
}

export function createNativeStyleRuntime(initialManifest?: NativeStyleManifest): NativeStyleRuntime {
  let manifest = initialManifest
  let environment = activeEnvironment
  const cache = new Map<string, Record<string, unknown>>()
  const runtime: NativeStyleRuntime = {
    tw(value, requestedEnvironment = {}) {
      const effectiveEnvironment = {
        ...environment,
        ...requestedEnvironment,
      }
      const key = `${JSON.stringify(value)}|${effectiveEnvironment.colorScheme ?? ''}|${effectiveEnvironment.platform ?? ''}`
      const cached = cache.get(key)
      if (cached) { return cached }
      const resolved = resolveStyle(value, manifest, effectiveEnvironment)
      cache.set(key, resolved)
      return resolved
    },
    setManifest(nextManifest) {
      manifest = nextManifest
      cache.clear()
      activeManifest = nextManifest
    },
    setEnvironment(nextEnvironment) {
      environment = nextEnvironment
      activeEnvironment = nextEnvironment
      cache.clear()
    },
    getManifest() {
      return manifest
    },
  }
  if (initialManifest) { activeManifest = initialManifest }
  return runtime
}

const defaultRuntime = createNativeStyleRuntime()

export function setManifest(manifest: NativeStyleManifest) {
  defaultRuntime.setManifest(manifest)
}

export function setEnvironment(environment: NativeStyleEnvironment) {
  defaultRuntime.setEnvironment(environment)
}

export function getManifest() {
  return activeManifest ?? defaultRuntime.getManifest()
}

export function tw(value: NativeClassValue, environment?: NativeStyleEnvironment) {
  return defaultRuntime.tw(value, environment)
}

export type { NativeClassValue, NativePlatform, NativeStyleEnvironment, NativeStyleManifest }
