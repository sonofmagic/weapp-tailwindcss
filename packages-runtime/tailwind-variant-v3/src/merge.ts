import type { TailwindMergeConfig } from './constants'
import type { ClassValue, TVConfig, TWMConfig } from './types'
import { extendTailwindMerge, twMerge as twMergeBase } from 'tailwind-merge'

import { defaultConfig } from './constants'
import { isEmptyObject, isEqual } from './utils'

export type ClassMerger = (...classes: ClassValue[]) => string | undefined

let cachedTwMerge: typeof twMergeBase | null = null
let cachedTwMergeConfig: TailwindMergeConfig = {}
let didTwMergeConfigChange = false

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

    if (!cachedTwMerge || didTwMergeConfigChange) {
      didTwMergeConfigChange = false
      const activeMergeConfig = cachedTwMergeConfig as Record<string, any>

      cachedTwMerge = isEmptyObject(activeMergeConfig)
        ? twMergeBase
        : extendTailwindMerge({
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
