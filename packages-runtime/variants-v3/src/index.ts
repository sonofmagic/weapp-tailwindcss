import type { CreateOptions } from '@weapp-tailwindcss/runtime'
import type {
  CnOptions,
  CnReturn,
  TV,
  TVConfig,
  TWMConfig,
} from 'tailwind-variant-v3'
import { create as createMergeRuntime } from '@weapp-tailwindcss/merge-v3'
import { resolveTransformers } from '@weapp-tailwindcss/runtime'
import {
  defaultConfig,
  cnBase as tailwindVariantCnBase,
  createTV as tailwindVariantCreateTV,
  tv as tailwindVariantTv,
} from 'tailwind-variant-v3'

type TailwindVariantCn = <T extends CnOptions>(...classes: T) => (config?: TWMConfig) => CnReturn

type TailwindVariantComponent = ((props?: unknown) => unknown) & Record<PropertyKey, unknown>

type TailwindVariantResult<TComponent extends TailwindVariantComponent> = ReturnType<TComponent>

type TailwindVariantOptions = Parameters<typeof tailwindVariantTv>[0]

type TailwindVariantConfig = Parameters<typeof tailwindVariantTv>[1]

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

  const { twMergeConfig: _ignoredConfig, twMergeAdapter: _ignoredAdapter, ...rest } = config
  return {
    ...rest,
    twMerge: false,
  }
}

function copyComponentMetadata(target: TailwindVariantComponent, source: TailwindVariantComponent) {
  const descriptors = Object.getOwnPropertyDescriptors(source)

  delete descriptors.length
  delete descriptors.name
  delete descriptors.prototype

  Object.defineProperties(target, descriptors)
}

function wrapComponent<TComponent extends TailwindVariantComponent>(
  component: TComponent,
  config: TVConfig,
  mergeClassList: (value: CnReturn, config?: TWMConfig) => CnReturn,
): TComponent {
  const wrapped = ((props?: unknown) => {
    const result = component(props) as TailwindVariantResult<TComponent>

    if (result == null || typeof result === 'string') {
      return mergeClassList(result as CnReturn, config)
    }

    const slotEntries = Reflect.ownKeys(result) as Array<keyof TailwindVariantResult<TComponent>>
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

    return slots as TailwindVariantResult<TComponent>
  }) as TComponent

  copyComponentMetadata(wrapped, component)

  return wrapped
}

function createVariantsRuntime(options?: CreateOptions) {
  const transformers = resolveTransformers(options)
  const mergeRuntime = createMergeRuntime(options)

  let cachedConfig: TWMConfig['twMergeConfig']
  let cachedMergeFn = mergeRuntime.twMerge

  const getMergeFn = (config?: TWMConfig['twMergeConfig']) => {
    if (!config) {
      return mergeRuntime.twMerge
    }

    if (config === cachedConfig) {
      return cachedMergeFn
    }

    cachedConfig = config
    cachedMergeFn = mergeRuntime.extendTailwindMerge(config)
    return cachedMergeFn
  }

  const mergeClassList = (value: CnReturn, config?: TWMConfig) => {
    if (value == null) {
      return value
    }

    const shouldMerge = config?.twMerge ?? true
    if (!shouldMerge) {
      return transformers.escape(value)
    }

    const mergeFn = getMergeFn(config?.twMergeConfig)
    return transformers.escape(mergeFn(value))
  }

  const cn: TailwindVariantCn = (...classes) => {
    const aggregated = tailwindVariantCnBase(...classes)

    return (config?: TWMConfig) => mergeClassList(aggregated, config)
  }

  const cnBase = (...classes: CnOptions) => {
    const aggregated = tailwindVariantCnBase(...classes)
    if (aggregated == null) {
      return aggregated
    }

    return transformers.escape(aggregated)
  }

  const tv = ((options: TailwindVariantOptions, config?: TailwindVariantConfig) => {
    const mergedConfig = mergeConfigs(config)
    const upstreamConfig = disableTailwindMerge(config)
    const component = tailwindVariantTv(
      options as TailwindVariantOptions,
      upstreamConfig as TailwindVariantConfig,
    ) as unknown as TailwindVariantComponent
    return wrapComponent(component, mergedConfig, mergeClassList)
  }) as unknown as TV

  const createTVRuntime: typeof tailwindVariantCreateTV = (configProp?: TVConfig) => {
    const tailwindCreate = tailwindVariantCreateTV(disableTailwindMerge(configProp))

    return ((options: TailwindVariantOptions, config?: TailwindVariantConfig) => {
      const mergedConfig = mergeConfigs(configProp, config)
      const component = config
        ? tailwindCreate(
            options as TailwindVariantOptions,
            disableTailwindMerge(config) as TailwindVariantConfig,
          )
        : tailwindCreate(options as TailwindVariantOptions)
      return wrapComponent(component as unknown as TailwindVariantComponent, mergedConfig, mergeClassList)
    }) as unknown as ReturnType<typeof tailwindVariantCreateTV>
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
}
