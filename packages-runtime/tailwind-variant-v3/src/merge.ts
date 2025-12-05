import type { TailwindMergeConfig } from './constants'
import type { ClassValue, TailwindMergeAdapter, TVConfig, TWMConfig } from './types'
import { defaultConfig } from './constants'
import { isEmptyObject, isEqual } from './utils'
// eslint-disable-next-line perfectionist/sort-imports
import { createRequire } from 'node:module'

export type ClassMerger = (...classes: ClassValue[]) => string | undefined

const MERGE_MODULE_IDS = ['tailwind-merge'] as const
const requireFromThisModule = (() => {
  try {
    return createRequire(import.meta.url)
  }
  catch {
    return null
  }
})()

let cachedTwMerge: ((className: string) => string) | null = null
let cachedTwMergeConfig: TailwindMergeConfig = {}
let cachedAutoMergeAdapter: TailwindMergeAdapter | null = null
let cachedActiveAdapter: TailwindMergeAdapter | null = null
let didTwMergeConfigChange = false

function normalizeAdapter(mod: any): TailwindMergeAdapter | null {
  const candidates = [mod, mod?.default]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    if (typeof candidate === 'function') {
      return { twMerge: candidate }
    }

    const twMerge = candidate.twMerge
    const extendTailwindMerge = candidate.extendTailwindMerge

    if (typeof twMerge === 'function') {
      return {
        twMerge,
        extendTailwindMerge: typeof extendTailwindMerge === 'function' ? extendTailwindMerge : undefined,
      }
    }
  }

  return null
}

function tryRequire(moduleId: string) {
  if (!requireFromThisModule) {
    return null
  }

  try {
    return requireFromThisModule(moduleId)
  }
  catch (error: any) {
    if (error && (error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_MODULE_NOT_FOUND')) {
      return null
    }

    throw error
  }
}

function loadMergeAdapter(): TailwindMergeAdapter | null {
  if (cachedAutoMergeAdapter) {
    return cachedAutoMergeAdapter
  }

  for (const moduleId of MERGE_MODULE_IDS) {
    const adapter = normalizeAdapter(tryRequire(moduleId))

    if (adapter) {
      cachedAutoMergeAdapter = adapter
      return adapter
    }
  }

  return null
}

function resolveMergeAdapter(config: TWMConfig): TailwindMergeAdapter | null {
  return config.twMergeAdapter ?? loadMergeAdapter()
}

function createTailwindMerge(adapter: TailwindMergeAdapter | null) {
  if (!adapter) {
    return null
  }

  if (!adapter.extendTailwindMerge || isEmptyObject(cachedTwMergeConfig)) {
    return adapter.twMerge
  }

  const activeMergeConfig = cachedTwMergeConfig as Record<string, any>

  return adapter.extendTailwindMerge({
    ...activeMergeConfig,
    extend: {
      theme: activeMergeConfig.theme,
      classGroups: activeMergeConfig.classGroups,
      conflictingClassGroupModifiers: activeMergeConfig.conflictingClassGroupModifiers,
      conflictingClassGroups: activeMergeConfig.conflictingClassGroups,
      ...activeMergeConfig.extend,
    },
  })
}

function appendClassValue(value: ClassValue | ClassValue[] | null | undefined, acc: string[]) {
  if (!value) {
    return
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const str = `${value}`.trim()

    if (str) {
      acc.push(str)
    }

    return
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      appendClassValue(item as ClassValue, acc)
    }

    return
  }

  if (typeof value === 'object') {
    if (
      typeof (value as Record<string, any>).toString === 'function'
      && (value as Record<string, any>).toString !== Object.prototype.toString
    ) {
      const str = (value as Record<string, any>).toString()

      if (str && str !== '[object Object]') {
        acc.push(str)
        return
      }
    }

    for (const key in value as Record<string, any>) {
      if (Object.prototype.hasOwnProperty.call(value, key) && (value as Record<string, any>)[key]) {
        acc.push(key)
      }
    }

    return
  }

  if (value) {
    acc.push(String(value))
  }
}

export function cnBase<T extends ClassValue[]>(...classes: T) {
  const result: string[] = []

  for (const value of classes) {
    appendClassValue(value, result)
  }

  return result.length > 0 ? result.join(' ') : undefined
}

export function cn<T extends ClassValue[]>(...classes: T) {
  return (config: TWMConfig = defaultConfig) => {
    const className = cnBase(...classes)

    if (!className) {
      return undefined
    }

    if (!config.twMerge) {
      return className
    }

    const adapter = resolveMergeAdapter(config)
    const shouldRefreshAdapter = adapter !== cachedActiveAdapter

    if (!cachedTwMerge || didTwMergeConfigChange || shouldRefreshAdapter) {
      didTwMergeConfigChange = false
      cachedActiveAdapter = adapter
      cachedTwMerge = createTailwindMerge(adapter)
    }

    const merged = cachedTwMerge ? cachedTwMerge(className) : className

    return merged || undefined
  }
}

export function createClassMerger(config: TVConfig): ClassMerger {
  return (...classes: ClassValue[]) => cn(...classes)(config)
}

export function updateTailwindMergeConfig(config: TVConfig) {
  const incomingMergeConfig = config.twMergeConfig

  if (!incomingMergeConfig || isEmptyObject(incomingMergeConfig)) {
    return
  }

  if (!isEqual(incomingMergeConfig, cachedTwMergeConfig)) {
    didTwMergeConfigChange = true
    cachedTwMergeConfig = incomingMergeConfig as TailwindMergeConfig
  }
}
