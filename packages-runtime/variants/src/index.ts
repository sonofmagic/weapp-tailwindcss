import type { CreateOptions } from '@weapp-tailwindcss/runtime'
import type {
  CnOptions,
  CnReturn,
  createTV as TailwindVariantsCreateTV,
  tv as TailwindVariantsTv,
  TV,
  TVConfig,
  TWMConfig,
  TWMergeConfig,
} from 'tailwind-variants'
import { create as createMergeRuntime } from '@weapp-tailwindcss/merge'
import { resolveTransformers } from '@weapp-tailwindcss/runtime'
import { defaultConfig, cnBase as tailwindVariantsCnBase } from 'tailwind-variants'
// @ts-expect-error upstream does not ship typed chunks.
import { c as createTailwindVariantsFactory } from 'tailwind-variants/dist/chunk-IFWU2MEM.js'

type TailwindVariantsCn = <T extends CnOptions>(...classes: T) => (config?: TWMConfig) => CnReturn

type TailwindVariantsFactory = (
  cn: TailwindVariantsCn,
) => {
  tv: typeof TailwindVariantsTv
  createTV: typeof TailwindVariantsCreateTV
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

  const cn: TailwindVariantsCn = (...classes) => {
    const aggregated = tailwindVariantsCnBase(...classes)

    return (config?: TWMConfig) => {
      if (aggregated == null) {
        return aggregated
      }

      const normalized = transformers.unescape(aggregated)

      const shouldMerge = config?.twMerge ?? true
      if (!shouldMerge) {
        return transformers.escape(normalized)
      }

      const mergeFn = getMergeFn(config?.twMergeConfig)
      return mergeFn(normalized)
    }
  }

  const factory = (createTailwindVariantsFactory as TailwindVariantsFactory)(cn)

  const cnBase = (...classes: Parameters<typeof tailwindVariantsCnBase>) => {
    const aggregated = tailwindVariantsCnBase(...classes)
    if (aggregated == null) {
      return aggregated
    }

    const normalized = transformers.unescape(aggregated)
    return transformers.escape(normalized)
  }

  return {
    cnBase,
    cn,
    tv: factory.tv as TV,
    createTV: factory.createTV,
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
