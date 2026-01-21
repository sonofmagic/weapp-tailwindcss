import type { ClassValue, CreateTVFactory, TV, TVConfig } from './types'
import { defaultConfig } from './constants'
import { hasSlotOverrides, hasVariantOverrides } from './helpers'
import { cn, cnBase, createClassMerger, updateTailwindMergeConfig } from './merge'
import { flatMergeArrays, isEmptyObject, mergeObjects } from './utils'
import {
  createVariantContext,
  getCompoundSlotClassNameBySlot,
  getCompoundVariantClassNamesBySlot,
  getCompoundVariantsValue,
  getVariantClassNames,
  getVariantClassNamesBySlotKey,
  resolveResponsiveSettings,
} from './variants'

interface TVExtendShape {
  base?: ClassValue
  variants?: Record<string, any>
  defaultVariants?: Record<string, any>
  slots?: Record<string, any>
  compoundVariants?: any[]
  compoundSlots?: any[]
}

type TVExtend = TVExtendShape | null

interface TVOptions {
  base?: ClassValue
  extend?: TVExtend
  slots?: Record<string, any> | undefined
  variants?: Record<string, any>
  compoundVariants?: any[]
  compoundSlots?: any[]
  defaultVariants?: Record<string, any>
}

interface TVProps extends Record<string, any> {
  class?: ClassValue
  className?: ClassValue
}

interface SlotPropsArg extends Record<string, any> {
  class?: ClassValue
  className?: ClassValue
}

function mergeSlotDefinitions(
  baseSlots: Record<string, any>,
  overrideSlots: Record<string, any>,
) {
  const merged = { ...baseSlots }

  for (const key in overrideSlots) {
    if (!Object.prototype.hasOwnProperty.call(overrideSlots, key)) {
      continue
    }

    merged[key]
      = key in merged ? cnBase(merged[key], overrideSlots[key]) : overrideSlots[key]
  }

  return merged
}

function assertArray(value: unknown, propName: string): asserts value is any[] {
  if (value && !Array.isArray(value)) {
    throw new TypeError(
      `The "${propName}" prop must be an array. Received: ${typeof value}`,
    )
  }
}

export function tvImplementation(options: TVOptions, configProp?: TVConfig) {
  const {
    extend = null,
    slots: slotProps = {},
    variants: variantsProps = {},
    compoundVariants: compoundVariantsProps = [],
    compoundSlots = [],
    defaultVariants: defaultVariantsProps = {},
  } = options

  const config: TVConfig = { ...defaultConfig, ...configProp }

  const base = extend?.base
    ? cnBase(extend.base, options?.base)
    : options?.base

  const variants = extend?.variants && !isEmptyObject(extend.variants)
    ? mergeObjects(variantsProps, extend.variants)
    : variantsProps

  const defaultVariants = extend?.defaultVariants && !isEmptyObject(extend.defaultVariants)
    ? { ...extend.defaultVariants, ...defaultVariantsProps }
    : defaultVariantsProps

  updateTailwindMergeConfig(config)

  const extendSlots = extend?.slots ?? {}
  const isExtendedSlotsEmpty = isEmptyObject(extendSlots)
  const hasOwnSlots = !isEmptyObject(slotProps)

  const componentSlots: Record<string, any> = hasOwnSlots
    ? {
        base: cnBase(options?.base, isExtendedSlotsEmpty && extend?.base),
        ...slotProps,
      }
    : {}

  const slots: Record<string, any> = isExtendedSlotsEmpty
    ? componentSlots
    : mergeSlotDefinitions(
        { ...extendSlots },
        isEmptyObject(componentSlots) ? { base: options?.base } : componentSlots,
      )

  const hasSlots = !isEmptyObject(slots)

  const compoundVariants = isEmptyObject(extend?.compoundVariants)
    ? compoundVariantsProps
    : flatMergeArrays(extend?.compoundVariants, compoundVariantsProps)

  const variantKeys = variants && !isEmptyObject(variants) ? Object.keys(variants) : []
  const responsiveState = resolveResponsiveSettings(config.responsiveVariants, variantKeys)
  const mergeClasses = createClassMerger(config)
  let cachedDefaultResult: any
  let hasCachedDefaultResult = false

  const component = (propsParam?: TVProps) => {
    if (!propsParam && hasCachedDefaultResult) {
      return cachedDefaultResult
    }

    const props: Record<string, any> = propsParam ?? {}

    assertArray(compoundVariants, 'compoundVariants')
    assertArray(compoundSlots, 'compoundSlots')

    if (!variantKeys.length && !hasSlots) {
      return cn(base, propsParam?.class, propsParam?.className)(config)
    }

    const context = createVariantContext({
      variants: variants ?? {},
      defaultVariants,
      variantKeys,
      compoundVariants,
      compoundSlots,
      config,
      props,
      variantResponsiveSettings: responsiveState.variantResponsiveSettings,
      ...(responsiveState.globalResponsiveSetting === undefined
        ? {}
        : { globalResponsiveSetting: responsiveState.globalResponsiveSetting }),
    })

    const baseVariantClassNames = getVariantClassNames(context)
    const baseCompoundVariants = getCompoundVariantsValue(context)

    if (!hasSlots) {
      const result = mergeClasses(
        base,
        baseVariantClassNames,
        baseCompoundVariants,
        propsParam?.class,
        propsParam?.className,
      )

      if (!propsParam) {
        cachedDefaultResult = result
        hasCachedDefaultResult = true
      }

      return result
    }

    const slotKeys = Object.keys(slots)
    const baseCompoundVariantsBySlot = getCompoundVariantClassNamesBySlot(context) ?? {}
    const baseCompoundSlotClasses = getCompoundSlotClassNameBySlot(context) ?? {}

    const baseSlotOutputs = new Map<string, ReturnType<typeof mergeClasses>>()

    for (const slotKey of slotKeys) {
      baseSlotOutputs.set(
        slotKey,
        mergeClasses(
          slots[slotKey],
          getVariantClassNamesBySlotKey(context, slotKey, null),
          baseCompoundVariantsBySlot[slotKey],
          baseCompoundSlotClasses[slotKey],
        ),
      )
    }

    const slotsFns: Record<
      string,
      (slotPropsArg?: SlotPropsArg) => ReturnType<typeof mergeClasses>
    > = {}

    for (const slotKey of slotKeys) {
      const cached = baseSlotOutputs.get(slotKey)

      slotsFns[slotKey] = (slotPropsArg?: SlotPropsArg) => {
        if (!slotPropsArg || !hasSlotOverrides(slotPropsArg)) {
          return cached
        }

        if (!hasVariantOverrides(slotPropsArg)) {
          return mergeClasses(cached, slotPropsArg.class, slotPropsArg.className)
        }

        const variantOverrides = getVariantClassNamesBySlotKey(context, slotKey, slotPropsArg)
        const compoundVariantOverrides
          = (getCompoundVariantClassNamesBySlot(context, slotPropsArg) ?? {})[slotKey]
        const compoundSlotOverrides
          = (getCompoundSlotClassNameBySlot(context, slotPropsArg) ?? {})[slotKey]

        return mergeClasses(
          slots[slotKey],
          variantOverrides,
          compoundVariantOverrides,
          compoundSlotOverrides,
          slotPropsArg.class,
          slotPropsArg.className,
        )
      }
    }

    if (!propsParam) {
      cachedDefaultResult = slotsFns
      hasCachedDefaultResult = true
    }

    return slotsFns
  }

  const componentWithMeta = component as any
  componentWithMeta.variantKeys = variantKeys
  componentWithMeta.extend = extend
  componentWithMeta.base = base
  componentWithMeta.slots = slots
  componentWithMeta.variants = variants
  componentWithMeta.defaultVariants = defaultVariants
  componentWithMeta.compoundSlots = compoundSlots
  componentWithMeta.compoundVariants = compoundVariants

  return componentWithMeta
}

function createTVImplementation(configProp: TVConfig) {
  return (options: Parameters<TV>[0], config?: TVConfig) =>
    tvImplementation(
      options,
      (config ? mergeObjects(configProp, config) : configProp) as TVConfig,
    )
}

export const tv = tvImplementation as unknown as TV
export const createTV
  = ((configProp: TVConfig) => createTVImplementation(configProp)) as unknown as CreateTVFactory
