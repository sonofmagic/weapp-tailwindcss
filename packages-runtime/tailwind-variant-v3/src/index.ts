import type { TVGeneratedScreens } from './generated'
import type {
  CnOptions,
  CnReturn,
  CreateTVFactory,
  TV,
  TVConfig,
  TWMConfig,
} from './types'
import { extendTailwindMerge, twMerge as twMergeBase } from 'tailwind-merge'
import {
  falsyToString,
  flatArray,
  flatMergeArrays,
  isEmptyObject,
  isEqual,
  mergeObjects,
  removeExtraSpaces,
} from './utils'

export type { TVGeneratedScreens } from './generated'
export type {
  ClassProp,
  ClassValue,
  CnOptions,
  CnReturn,
  CreateTVFactory,
  isTrueOrArray,
  OmitUndefined,
  StringToBoolean,
  TV,
  TVCompoundSlots,
  TVCompoundVariants,
  TVConfig,
  TVDefaultVariants,
  TVProps,
  TVReturnProps,
  TVReturnType,
  TVScreenPropsValue,
  TVVariantKeys,
  TVVariants,
  TWMConfig,
  VariantProps,
  WithInitialScreen,
} from './types'

export const defaultConfig: TVConfig = {
  twMerge: true,
  twMergeConfig: {},
  responsiveVariants: false,
}

export function voidEmpty<T>(value: T): T | undefined {
  return value || undefined
}

export function cnBase(...classes: CnOptions): CnReturn {
  return voidEmpty(flatArray(classes).filter(Boolean).join(' '))
}

type TailwindMergeConfig = NonNullable<TWMConfig['twMergeConfig']> | Record<string, never>

let cachedTwMerge: typeof twMergeBase | null = null
let cachedTwMergeConfig: TailwindMergeConfig = {}
let didTwMergeConfigChange = false

export function cn<T extends CnOptions>(...classes: T) {
  return (config: TWMConfig = defaultConfig) => {
    if (!config.twMerge) {
      return cnBase(...classes)
    }

    if (!cachedTwMerge || didTwMergeConfigChange) {
      didTwMergeConfigChange = false
      const activeMergeConfig = cachedTwMergeConfig as Record<string, any>

      cachedTwMerge = isEmptyObject(activeMergeConfig)
        ? twMergeBase
        : extendTailwindMerge({
            ...activeMergeConfig,
            extend: {
              // Support for legacy tailwind-merge config shape
              theme: activeMergeConfig.theme,
              classGroups: activeMergeConfig.classGroups,
              conflictingClassGroupModifiers: activeMergeConfig.conflictingClassGroupModifiers,
              conflictingClassGroups: activeMergeConfig.conflictingClassGroups,
              // Support for new tailwind-merge config shape
              ...activeMergeConfig.extend,
            },
          })
    }

    return voidEmpty(cachedTwMerge(cnBase(...classes)))
  }
}

function joinObjects(obj1: Record<string, any>, obj2: Record<string, any>) {
  for (const key in obj2) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      obj1[key] = cnBase(obj1[key] as any, obj2[key])
    }
    else {
      obj1[key] = obj2[key]
    }
  }

  return obj1
}

function tvImplementation(options: Record<string, any>, configProp?: TVConfig) {
  const {
    extend = null,
    slots: slotProps = {},
    variants: variantsProps = {},
    compoundVariants: compoundVariantsProps = [],
    compoundSlots = [],
    defaultVariants: defaultVariantsProps = {},
  } = options

  const config: TVConfig = { ...defaultConfig, ...configProp }

  const base = extend?.base ? cnBase(extend.base, options?.base) : options?.base
  const variants
    = extend?.variants && !isEmptyObject(extend.variants)
      ? mergeObjects(variantsProps, extend.variants)
      : variantsProps
  const defaultVariants
    = extend?.defaultVariants && !isEmptyObject(extend.defaultVariants)
      ? { ...extend.defaultVariants, ...defaultVariantsProps }
      : defaultVariantsProps

  // save twMergeConfig to the cache
  const incomingMergeConfig = config.twMergeConfig

  if (incomingMergeConfig && !isEmptyObject(incomingMergeConfig)) {
    if (!isEqual(incomingMergeConfig, cachedTwMergeConfig)) {
      didTwMergeConfigChange = true
      cachedTwMergeConfig = incomingMergeConfig as TailwindMergeConfig
    }
  }

  const isExtendedSlotsEmpty = isEmptyObject(extend?.slots)
  const componentSlots = !isEmptyObject(slotProps)
    ? {
        // add "base" to the slots object
        base: cnBase(options?.base, isExtendedSlotsEmpty && extend?.base),
        ...slotProps,
      }
    : {}

  // merge slots with the "extended" slots
  const slots = isExtendedSlotsEmpty
    ? componentSlots
    : joinObjects(
        { ...extend?.slots },
        isEmptyObject(componentSlots) ? { base: options?.base } : componentSlots,
      )

  // merge compoundVariants with the "extended" compoundVariants
  const compoundVariants = isEmptyObject(extend?.compoundVariants)
    ? compoundVariantsProps
    : flatMergeArrays(extend?.compoundVariants, compoundVariantsProps)

  const component = (propsParam?: Record<string, any>) => {
    const props = propsParam ?? {}

    if (isEmptyObject(variants) && isEmptyObject(slotProps) && isExtendedSlotsEmpty) {
      return cn(base, propsParam?.class, propsParam?.className)(config)
    }

    if (compoundVariants && !Array.isArray(compoundVariants)) {
      throw new TypeError(
        `The "compoundVariants" prop must be an array. Received: ${typeof compoundVariants}`,
      )
    }

    if (compoundSlots && !Array.isArray(compoundSlots)) {
      throw new TypeError(
        `The "compoundSlots" prop must be an array. Received: ${typeof compoundSlots}`,
      )
    }

    const getScreenVariantValues = (
      screen: string,
      screenVariantValue: any,
      acc: any = [],
      slotKey?: string,
    ) => {
      let result: any = acc

      if (typeof screenVariantValue === 'string') {
        result = result.concat(
          removeExtraSpaces(screenVariantValue)
            .split(' ')
            .map(v => `${screen}:${v}`),
        )
      }
      else if (Array.isArray(screenVariantValue)) {
        result = result.concat(
          screenVariantValue.reduce((acc, v) => {
            return acc.concat(`${screen}:${v}`)
          }, []),
        )
      }
      else if (typeof screenVariantValue === 'object' && typeof slotKey === 'string') {
        for (const key in screenVariantValue) {
          if (Object.prototype.hasOwnProperty.call(screenVariantValue, key) && key === slotKey) {
            const value = screenVariantValue[key]

            if (value && typeof value === 'string') {
              const fixedValue = removeExtraSpaces(value)

              if (result[slotKey]) {
                result[slotKey] = result[slotKey].concat(
                  fixedValue.split(' ').map(v => `${screen}:${v}`),
                )
              }
              else {
                result[slotKey] = fixedValue.split(' ').map(v => `${screen}:${v}`)
              }
            }
            else if (Array.isArray(value) && value.length > 0) {
              result[slotKey] = value.reduce((acc, v) => {
                return acc.concat(`${screen}:${v}`)
              }, [])
            }
          }
        }
      }

      return result
    }

    const getVariantValue = (
      variant: string,
      vrs: Record<string, any> = variants,
      slotKey: string | null = null,
      slotProps: Record<string, any> | null = null,
    ) => {
      const variantObj = vrs[variant]

      if (!variantObj || isEmptyObject(variantObj)) {
        return null
      }

      const variantProp = slotProps?.[variant] ?? propsParam?.[variant]

      if (variantProp === null) {
        return null
      }

      const variantKey = falsyToString(variantProp)

      // responsive variants
      const responsiveVarsEnabled
        = (Array.isArray(config.responsiveVariants) && config.responsiveVariants.length > 0)
          || config.responsiveVariants === true

      let defaultVariantProp = defaultVariants?.[variant]
      let screenValues: any = []

      if (typeof variantKey === 'object' && responsiveVarsEnabled) {
        const variantKeyEntries = Object.entries(variantKey as Record<string, any>)

        for (const [screen, screenVariantKey] of variantKeyEntries) {
          const variantObjRecord = variantObj as Record<string, any>
          const screenVariantValue = variantObjRecord[String(screenVariantKey)]

          if (screen === 'initial') {
            defaultVariantProp = screenVariantKey
            continue
          }

          // if the screen is not in the responsiveVariants array, skip it
          if (
            Array.isArray(config.responsiveVariants)
            && !config.responsiveVariants.includes(screen as TVGeneratedScreens)
          ) {
            continue
          }

          screenValues = getScreenVariantValues(
            screen,
            screenVariantValue,
            screenValues,
            slotKey ?? undefined,
          )
        }
      }

      // If there is a variant key and it's not an object (screen variants),
      // we use the variant key and ignore the default variant.
      const key
        = variantKey != null && typeof variantKey != 'object'
          ? variantKey
          : falsyToString(defaultVariantProp)

      const value = variantObj[key || 'false']

      if (
        typeof screenValues === 'object'
        && typeof slotKey === 'string'
        && screenValues[slotKey]
      ) {
        return joinObjects(screenValues, value)
      }

      if (screenValues.length > 0) {
        screenValues.push(value)

        if (slotKey === 'base') {
          return screenValues.join(' ')
        }

        return screenValues
      }

      return value
    }

    const getVariantClassNames = () => {
      if (!variants) {
        return null
      }

      return Object.keys(variants).map(vk => getVariantValue(vk, variants))
    }

    const getVariantClassNamesBySlotKey = (
      slotKey: string,
      slotProps: Record<string, any> | null,
    ) => {
      if (!variants || typeof variants !== 'object') {
        return null
      }

      const result: any[] = []

      for (const variant in variants) {
        const variantValue = getVariantValue(variant, variants, slotKey, slotProps)

        const value
          = slotKey === 'base' && typeof variantValue === 'string'
            ? variantValue
            : variantValue && (variantValue as Record<string, any>)[slotKey]

        if (value) {
          result[result.length] = value
        }
      }

      return result
    }

    const propsWithoutUndefined: Record<string, unknown> = {}

    for (const prop in props) {
      if (props[prop] !== undefined) {
        propsWithoutUndefined[prop] = props[prop]
      }
    }

    const getCompleteProps = (key: string, slotProps: Record<string, any> | null) => {
      const initialProp
        = typeof propsParam?.[key] === 'object'
          ? {
              [key]: props[key]?.initial,
            }
          : {}

      return {
        ...defaultVariants,
        ...propsWithoutUndefined,
        ...initialProp,
        ...slotProps,
      }
    }

    const getCompoundVariantsValue = (
      cv: any[] = [],
      slotProps: Record<string, any> | null = null,
    ) => {
      const result: any[] = []

      for (const { class: tvClass, className: tvClassName, ...compoundVariantOptions } of cv) {
        let isValid = true

        for (const [key, value] of Object.entries(compoundVariantOptions)) {
          const completePropsValue = getCompleteProps(key, slotProps)[key]

          if (Array.isArray(value)) {
            if (!value.includes(completePropsValue)) {
              isValid = false
              break
            }
          }
          else {
            const isBlankOrFalse = (v: unknown) => v == null || v === false

            if (isBlankOrFalse(value) && isBlankOrFalse(completePropsValue)) {
              continue
            }

            if (completePropsValue !== value) {
              isValid = false
              break
            }
          }
        }

        if (isValid) {
          tvClass && result.push(tvClass)
          tvClassName && result.push(tvClassName)
        }
      }

      return result
    }

    const getCompoundVariantClassNamesBySlot = (slotProps: Record<string, any> | null) => {
      const compoundClassNames = getCompoundVariantsValue(compoundVariants, slotProps)

      if (!Array.isArray(compoundClassNames)) {
        return compoundClassNames
      }

      const result: Record<string, any> = {}

      for (const className of compoundClassNames) {
        if (typeof className === 'string') {
          result.base = cn(result.base, className)(config)
        }

        if (typeof className === 'object') {
          for (const [slot, slotClassName] of Object.entries(className)) {
            result[slot] = cn(result[slot], slotClassName)(config)
          }
        }
      }

      return result
    }

    const getCompoundSlotClassNameBySlot = (slotProps: Record<string, any> | null) => {
      if (compoundSlots.length < 1) {
        return null
      }

      const result: Record<string, any> = {}

      for (const {
        slots = [],
        class: slotClass,
        className: slotClassName,
        ...slotVariants
      } of compoundSlots) {
        if (!isEmptyObject(slotVariants)) {
          let isValid = true

          for (const key of Object.keys(slotVariants)) {
            const completePropsValue = getCompleteProps(key, slotProps)[key]

            if (
              completePropsValue === undefined
              || (Array.isArray(slotVariants[key])
                ? !slotVariants[key].includes(completePropsValue)
                : slotVariants[key] !== completePropsValue)
            ) {
              isValid = false
              break
            }
          }

          if (!isValid) {
            continue
          }
        }

        for (const slotName of slots) {
          result[slotName] = result[slotName] || []
          result[slotName].push([slotClass, slotClassName])
        }
      }

      return result
    }

    // with slots
    if (!isEmptyObject(slotProps) || !isExtendedSlotsEmpty) {
      const slotsFns: Record<string, any> = {}

      if (typeof slots === 'object' && !isEmptyObject(slots)) {
        for (const slotKey of Object.keys(slots)) {
          slotsFns[slotKey] = (slotPropsArg?: Record<string, any>) =>
            cn(
              slots[slotKey],
              getVariantClassNamesBySlotKey(slotKey, slotPropsArg ?? null),
              (getCompoundVariantClassNamesBySlot(slotPropsArg ?? null) ?? {})[slotKey],
              (getCompoundSlotClassNameBySlot(slotPropsArg ?? null) ?? {})[slotKey],
              slotPropsArg?.class,
              slotPropsArg?.className,
            )(config)
        }
      }

      return slotsFns
    }

    // normal variants
    return cn(
      base,
      getVariantClassNames(),
      getCompoundVariantsValue(compoundVariants),
      propsParam?.class,
      propsParam?.className,
    )(config)
  }

  const getVariantKeys = () => {
    if (!variants || typeof variants !== 'object') {
      return
    }

    return Object.keys(variants)
  }

  const componentWithMeta = component as any
  componentWithMeta.variantKeys = getVariantKeys()
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
