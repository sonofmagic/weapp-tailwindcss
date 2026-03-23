import type { IStyleHandlerOptions } from './types'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { fingerprintOptions } from './fingerprint'

const BASE_CACHE_KEY = 'base'
const SIMPLE_OVERRIDE_UNSET = '__unset__'

function getSimpleOverrideCacheKey(options: Partial<IStyleHandlerOptions>) {
  let isMainChunk = SIMPLE_OVERRIDE_UNSET
  let majorVersion = SIMPLE_OVERRIDE_UNSET
  let cssRemoveProperty = SIMPLE_OVERRIDE_UNSET
  let cssRemoveHoverPseudoClass = SIMPLE_OVERRIDE_UNSET
  let uniAppX = SIMPLE_OVERRIDE_UNSET
  let cssPreflightRange = SIMPLE_OVERRIDE_UNSET
  let injectAdditionalCssVarScope = SIMPLE_OVERRIDE_UNSET
  let rem2rpx = SIMPLE_OVERRIDE_UNSET
  let px2rpx = SIMPLE_OVERRIDE_UNSET
  let unitsToPx = SIMPLE_OVERRIDE_UNSET
  let cssCalc = SIMPLE_OVERRIDE_UNSET
  let cssChildCombinatorReplaceValue = SIMPLE_OVERRIDE_UNSET
  let cssPreflight = SIMPLE_OVERRIDE_UNSET

  for (const key of Object.keys(options) as Array<keyof IStyleHandlerOptions>) {
    const value = options[key]
    switch (key) {
      case 'isMainChunk':
        if (typeof value !== 'boolean') {
          return undefined
        }
        isMainChunk = value ? '1' : '0'
        break
      case 'majorVersion':
        if (typeof value !== 'number') {
          return undefined
        }
        majorVersion = String(value)
        break
      case 'cssRemoveProperty':
        if (typeof value !== 'boolean') {
          return undefined
        }
        cssRemoveProperty = value ? '1' : '0'
        break
      case 'cssRemoveHoverPseudoClass':
        if (typeof value !== 'boolean') {
          return undefined
        }
        cssRemoveHoverPseudoClass = value ? '1' : '0'
        break
      case 'uniAppX':
        if (typeof value !== 'boolean') {
          return undefined
        }
        uniAppX = value ? '1' : '0'
        break
      case 'cssPreflightRange':
        if (typeof value !== 'string') {
          return undefined
        }
        cssPreflightRange = value
        break
      case 'injectAdditionalCssVarScope':
        if (typeof value !== 'boolean') {
          return undefined
        }
        injectAdditionalCssVarScope = value ? '1' : '0'
        break
      case 'rem2rpx':
        if (typeof value !== 'boolean') {
          return undefined
        }
        rem2rpx = value ? '1' : '0'
        break
      case 'px2rpx':
        if (typeof value !== 'boolean') {
          return undefined
        }
        px2rpx = value ? '1' : '0'
        break
      case 'unitsToPx':
        if (typeof value !== 'boolean') {
          return undefined
        }
        unitsToPx = value ? '1' : '0'
        break
      case 'cssCalc':
        if (typeof value !== 'boolean') {
          return undefined
        }
        cssCalc = value ? '1' : '0'
        break
      case 'cssChildCombinatorReplaceValue':
        if (typeof value !== 'string') {
          return undefined
        }
        cssChildCombinatorReplaceValue = value
        break
      case 'cssPreflight':
        if (value !== false) {
          return undefined
        }
        cssPreflight = '0'
        break
      default:
        return undefined
    }
  }

  return [
    'simple',
    isMainChunk,
    majorVersion,
    cssRemoveProperty,
    cssRemoveHoverPseudoClass,
    uniAppX,
    cssPreflightRange,
    injectAdditionalCssVarScope,
    rem2rpx,
    px2rpx,
    unitsToPx,
    cssCalc,
    cssChildCombinatorReplaceValue,
    cssPreflight,
  ].join(':')
}

function hasOverrides(options?: Partial<IStyleHandlerOptions>): options is Partial<IStyleHandlerOptions> {
  return Boolean(options && Object.keys(options).length > 0)
}

export interface OptionsResolver {
  resolve: (overrides?: Partial<IStyleHandlerOptions>) => IStyleHandlerOptions
}

export function createOptionsResolver(baseOptions: IStyleHandlerOptions): OptionsResolver {
  const cacheByKey = new Map<string, IStyleHandlerOptions>()
  const cacheByRef = new WeakMap<Partial<IStyleHandlerOptions>, IStyleHandlerOptions>()
  const cacheKeyByRef = new WeakMap<Partial<IStyleHandlerOptions>, string>()
  const emptyOverrideRefs = new WeakSet<Partial<IStyleHandlerOptions>>()
  cacheByKey.set(BASE_CACHE_KEY, baseOptions)

  const resolve = (overrides?: Partial<IStyleHandlerOptions>) => {
    if (!overrides) {
      return baseOptions
    }

    const refCached = cacheByRef.get(overrides)
    if (refCached) {
      return refCached
    }

    if (emptyOverrideRefs.has(overrides)) {
      return baseOptions
    }

    if (!hasOverrides(overrides)) {
      emptyOverrideRefs.add(overrides)
      return baseOptions
    }

    let key = cacheKeyByRef.get(overrides)
    if (!key) {
      key = getSimpleOverrideCacheKey(overrides) ?? fingerprintOptions(overrides)
      cacheKeyByRef.set(overrides, key)
    }

    const cached = cacheByKey.get(key)
    if (cached) {
      cacheByRef.set(overrides, cached)
      return cached
    }

    const merged = defuOverrideArray<
      IStyleHandlerOptions,
      Partial<IStyleHandlerOptions>[]
    >(
      { ...overrides } as IStyleHandlerOptions,
      baseOptions,
    )
    cacheByKey.set(key, merged)
    cacheByRef.set(overrides, merged)
    return merged
  }

  return {
    resolve,
  }
}
