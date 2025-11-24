import type { CreateOptions } from '@weapp-tailwindcss/runtime'
import type {
  CnOptions,
  CnReturn,
  TV,
  TVConfig,
  TWMConfig,
  TWMergeConfig,
} from 'tailwind-variants'
import { create as createMergeRuntime } from '@weapp-tailwindcss/merge'
import { resolveTransformers } from '@weapp-tailwindcss/runtime'
import {
  defaultConfig,
  createTV as tailwindVariantsCreateTV,
  cx as tailwindVariantsCx,
  tv as tailwindVariantsTv,
} from 'tailwind-variants'

type TailwindVariantsCn = <T extends CnOptions>(...classes: T) => (config?: TWMConfig) => CnReturn

type TailwindVariantsComponent = ReturnType<typeof tailwindVariantsTv>

type TailwindVariantsResult = ReturnType<TailwindVariantsComponent>

function mergeConfigs(...configs: (TVConfig | undefined)[]): TVConfig {
  const baseTwMergeConfig = defaultConfig.twMergeConfig
    ? { ...defaultConfig.twMergeConfig }
    : undefined

  return configs.reduce<TVConfig>((acc, config) => {
    if (!config) {
      return acc
    }

    const nextTwMergeConfig = config.twMergeConfig
      ? {
          ...(acc.twMergeConfig ?? {}),
          ...config.twMergeConfig,
        }
      : acc.twMergeConfig

    return {
      ...acc,
      ...config,
      twMergeConfig: nextTwMergeConfig,
    }
  }, {
    ...defaultConfig,
    twMergeConfig: baseTwMergeConfig,
  })
}

function disableTailwindMerge(config?: TVConfig): TVConfig {
  if (!config) {
    return { twMerge: false }
  }

  const { twMergeConfig: _ignored, ...rest } = config
  return {
    ...rest,
    twMerge: false,
  }
}

function copyComponentMetadata(target: TailwindVariantsComponent, source: TailwindVariantsComponent) {
  const descriptors = Object.getOwnPropertyDescriptors(source)

  delete descriptors.length
  delete descriptors.name
  delete descriptors.prototype

  Object.defineProperties(target, descriptors)
}

function wrapComponent(
  component: TailwindVariantsComponent,
  config: TVConfig,
  mergeClassList: (value: CnReturn, config?: TWMConfig) => CnReturn,
): TailwindVariantsComponent {
  const wrapped = ((props?: unknown) => {
    const result = component(props) as TailwindVariantsResult

    if (result == null || typeof result === 'string') {
      return mergeClassList(result as CnReturn, config)
    }

    const slotEntries = Reflect.ownKeys(result) as Array<keyof typeof result>
    const slots: Record<PropertyKey, any> = {}

    for (const key of slotEntries) {
      const slotFn = (result as Record<PropertyKey, any>)[key]
      if (typeof slotFn !== 'function') {
        slots[key] = slotFn
        continue
      }

      slots[key] = (...slotArgs: any[]) => {
        return mergeClassList(slotFn(...slotArgs), config)
      }
    }

    return slots as typeof result
  }) as TailwindVariantsComponent

  copyComponentMetadata(wrapped, component)

  return wrapped
}

function createVariantsRuntime(options?: CreateOptions) {
  const transformers = resolveTransformers(options)
  const tailwindMergeRuntime = createMergeRuntime(options)

  let cachedConfig: TWMConfig['twMergeConfig']
  let cachedMergeFn = tailwindMergeRuntime.twMerge

  const getMergeFn = (config?: TWMConfig['twMergeConfig']) => {
    if (!config) {
      return tailwindMergeRuntime.twMerge
    }

    if (config === cachedConfig) {
      return cachedMergeFn
    }

    cachedConfig = config
    cachedMergeFn = tailwindMergeRuntime.extendTailwindMerge(config)
    return cachedMergeFn
  }

  const mergeClassList = (value: CnReturn, config?: TWMConfig) => {
    if (value == null) {
      return value
    }

    const normalized = transformers.unescape(value)

    const shouldMerge = config?.twMerge ?? true
    if (!shouldMerge) {
      return transformers.escape(normalized)
    }

    const mergeFn = getMergeFn(config?.twMergeConfig)
    return mergeFn(normalized)
  }

  const cn: TailwindVariantsCn = (...classes) => {
    const aggregated = tailwindVariantsCx(...classes)

    return (config?: TWMConfig) => mergeClassList(aggregated, config)
  }

  const cnBase = (...classes: Parameters<typeof tailwindVariantsCx>) => {
    const aggregated = tailwindVariantsCx(...classes)
    if (aggregated == null) {
      return aggregated
    }

    const normalized = transformers.unescape(aggregated)
    return transformers.escape(normalized)
  }

  const tv: TV = ((options, config) => {
    const mergedConfig = mergeConfigs(config)
    const upstreamConfig = disableTailwindMerge(config)
    const component = tailwindVariantsTv(options, upstreamConfig)
    return wrapComponent(component, mergedConfig, mergeClassList)
  }) as TV

  const createTVRuntime: typeof tailwindVariantsCreateTV = (configProp?: TVConfig) => {
    const tailwindCreate = tailwindVariantsCreateTV(disableTailwindMerge(configProp))

    return (options, config) => {
      const mergedConfig = mergeConfigs(configProp, config)
      const component = config
        ? tailwindCreate(options, disableTailwindMerge(config))
        : tailwindCreate(options)
      return wrapComponent(component, mergedConfig, mergeClassList)
    }
  }

  return {
    cnBase,
    cn,
    tv,
    createTV: createTVRuntime,
  }
}

function create(options?: CreateOptions) {
  return createVariantsRuntime(options)
}

const variantsRuntime = create()

const {
  cnBase,
  cn,
  tv,
  createTV,
} = variantsRuntime

export {
  cn,
  cnBase,
  create,
  createTV,
  defaultConfig,
  tv,
}

export type {
  CnOptions,
  CnReturn,
  TV,
  TVConfig,
  TWMConfig,
  TWMergeConfig,
}
