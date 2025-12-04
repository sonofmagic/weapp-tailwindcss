import type { TVConfig } from './types'
import { cnBase } from './merge'
import { falsyToString, isEmptyObject, removeExtraSpaces } from './utils'

export interface VariantContext {
  variants: Record<string, any>
  defaultVariants: Record<string, any>
  variantKeys: string[]
  compoundVariants: any[]
  compoundSlots: any[]
  config: TVConfig
  props: Record<string, any>
  propsWithoutUndefined: Record<string, any>
  initialVariantValues: Record<string, any>
  globalResponsiveSetting?: boolean | string[]
  variantResponsiveSettings: Record<string, boolean | string[] | undefined>
}

export function resolveResponsiveSettings(
  responsiveConfig: TVConfig['responsiveVariants'],
  variantKeys: string[],
) {
  const variantResponsiveSettings: Record<string, boolean | string[] | undefined> = {}
  let globalResponsiveSetting: boolean | string[] | undefined

  if (Array.isArray(responsiveConfig) || typeof responsiveConfig === 'boolean') {
    globalResponsiveSetting = responsiveConfig
  }
  else if (responsiveConfig && typeof responsiveConfig === 'object') {
    for (const key of variantKeys) {
      if (responsiveConfig[key] !== undefined) {
        variantResponsiveSettings[key] = responsiveConfig[key] as boolean | string[]
      }
    }
  }

  return {
    globalResponsiveSetting,
    variantResponsiveSettings,
  }
}

export function createVariantContext(
  context: Omit<VariantContext, 'propsWithoutUndefined' | 'initialVariantValues'>,
) {
  const propsWithoutUndefined: Record<string, any> = {}

  for (const prop in context.props) {
    if (context.props[prop] !== undefined) {
      propsWithoutUndefined[prop] = context.props[prop]
    }
  }

  const initialVariantValues: Record<string, any> = {}

  for (const key of context.variantKeys) {
    if (typeof context.props[key] === 'object' && !Array.isArray(context.props[key])) {
      initialVariantValues[key] = context.props[key]?.initial
    }
  }

  return {
    ...context,
    propsWithoutUndefined,
    initialVariantValues,
  }
}

type SlotProps = Record<string, any> | null | undefined

function getResponsiveSetting(context: VariantContext, variant: string) {
  return context.variantResponsiveSettings[variant] ?? context.globalResponsiveSetting
}

function getCompleteProps(context: VariantContext, key: string, slotProps: SlotProps) {
  const initialProp
    = typeof context.props[key] === 'object'
      ? {
          [key]: context.initialVariantValues[key],
        }
      : {}

  return {
    ...context.defaultVariants,
    ...context.propsWithoutUndefined,
    ...initialProp,
    ...slotProps,
  }
}

function getScreenVariantValues(
  screen: string,
  screenVariantValue: any,
  acc: any = [],
  slotKey?: string,
) {
  let result: any = acc

  if (typeof screenVariantValue === 'string') {
    const tokens = removeExtraSpaces(screenVariantValue)
      .split(' ')
      .filter(Boolean)
      .map(v => `${screen}:${v}`)

    result = result.concat(tokens)
  }
  else if (Array.isArray(screenVariantValue)) {
    result = result.concat(
      screenVariantValue.reduce<string[]>((arr, value) => {
        if (value) {
          arr.push(`${screen}:${value}`)
        }

        return arr
      }, []),
    )
  }
  else if (typeof screenVariantValue === 'object' && typeof slotKey === 'string') {
    for (const key in screenVariantValue) {
      if (Object.prototype.hasOwnProperty.call(screenVariantValue, key) && key === slotKey) {
        const value = screenVariantValue[key]

        if (typeof value === 'string') {
          const fixedValue = removeExtraSpaces(value)
          const tokens = fixedValue.split(' ').map(v => `${screen}:${v}`)

          if (result[slotKey]) {
            result[slotKey] = result[slotKey].concat(tokens)
          }
          else {
            result[slotKey] = tokens
          }
        }
        else if (Array.isArray(value) && value.length > 0) {
          result[slotKey] = value.reduce((acc: string[], v: string) => {
            if (v) {
              acc.push(`${screen}:${v}`)
            }

            return acc
          }, [])
        }
      }
    }
  }

  return result
}

function mergeSlotRecords(target: Record<string, any>, source: Record<string, any> | null) {
  if (!source || typeof source !== 'object') {
    return target
  }

  for (const key in source) {
    if (!Object.prototype.hasOwnProperty.call(source, key)) {
      continue
    }

    const value = source[key]

    if (value === undefined || value === null) {
      continue
    }

    target[key] = cnBase(target[key], value)
  }

  return target
}

function getVariantValue(
  context: VariantContext,
  variant: string,
  slotKey: string | null = null,
  slotProps: SlotProps = null,
) {
  const variantObj = context.variants?.[variant]

  if (!variantObj || isEmptyObject(variantObj)) {
    return null
  }

  const variantProp = slotProps?.[variant] ?? context.props[variant]

  if (variantProp === null) {
    return null
  }

  const variantKey = falsyToString(variantProp)
  const responsiveSetting = getResponsiveSetting(context, variant)
  const responsiveEnabled
    = (Array.isArray(responsiveSetting) && responsiveSetting.length > 0)
      || responsiveSetting === true

  let defaultVariantProp = context.defaultVariants?.[variant]
  let screenValues: any = []

  if (typeof variantKey === 'object' && responsiveEnabled) {
    for (const [screen, screenVariantKey] of Object.entries(variantKey as Record<string, any>)) {
      const variantObjRecord = variantObj as Record<string, any>
      const screenVariantValue = variantObjRecord[String(screenVariantKey)]

      if (screen === 'initial') {
        defaultVariantProp = screenVariantKey
        continue
      }

      if (
        Array.isArray(responsiveSetting)
        && !responsiveSetting.includes(screen as string)
      ) {
        continue
      }

      screenValues = getScreenVariantValues(screen, screenVariantValue, screenValues, slotKey ?? undefined)
    }
  }

  const key
    = variantKey != null && typeof variantKey !== 'object'
      ? variantKey
      : falsyToString(defaultVariantProp)

  const value = variantObj[key || 'false']

  if (
    typeof screenValues === 'object'
    && typeof slotKey === 'string'
    && screenValues[slotKey]
  ) {
    return mergeSlotRecords(screenValues, value)
  }

  if (Array.isArray(screenValues) && screenValues.length > 0) {
    screenValues.push(value)

    if (slotKey === 'base') {
      return screenValues.join(' ')
    }

    return screenValues
  }

  return value
}

export function getVariantClassNames(context: VariantContext, slotProps: SlotProps = null) {
  if (!context.variants || !context.variantKeys.length) {
    return null
  }

  return context.variantKeys.map(vk => getVariantValue(context, vk, null, slotProps))
}

export function getVariantClassNamesBySlotKey(
  context: VariantContext,
  slotKey: string,
  slotProps: SlotProps,
) {
  if (!context.variants || typeof context.variants !== 'object') {
    return null
  }

  const result: any[] = []

  for (const variant of context.variantKeys) {
    const variantValue = getVariantValue(context, variant, slotKey, slotProps)

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

export function getCompoundVariantsValue(context: VariantContext, slotProps: SlotProps = null) {
  if (!Array.isArray(context.compoundVariants) || context.compoundVariants.length === 0) {
    return []
  }

  const result: any[] = []

  for (const { class: tvClass, className: tvClassName, ...compoundVariantOptions } of context.compoundVariants) {
    let isValid = true

    for (const [key, value] of Object.entries(compoundVariantOptions)) {
      const completePropsValue = getCompleteProps(context, key, slotProps)[key]

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
      if (tvClass) {
        result.push(tvClass)
      }

      if (tvClassName) {
        result.push(tvClassName)
      }
    }
  }

  return result
}

export function getCompoundVariantClassNamesBySlot(
  context: VariantContext,
  slotProps: SlotProps = null,
) {
  const compoundClassNames = getCompoundVariantsValue(context, slotProps)

  if (!Array.isArray(compoundClassNames)) {
    return compoundClassNames
  }

  const result: Record<string, any> = {}

  for (const className of compoundClassNames) {
    if (typeof className === 'string') {
      result.base = cnBase(result.base, className)
    }

    if (typeof className === 'object') {
      for (const [slot, slotClassName] of Object.entries(className)) {
        result[slot] = cnBase(result[slot], slotClassName)
      }
    }
  }

  return result
}

export function getCompoundSlotClassNameBySlot(
  context: VariantContext,
  slotProps: SlotProps = null,
) {
  if (!Array.isArray(context.compoundSlots) || context.compoundSlots.length < 1) {
    return null
  }

  const result: Record<string, any> = {}

  for (const {
    slots = [],
    class: slotClass,
    className: slotClassName,
    ...slotVariants
  } of context.compoundSlots) {
    if (!isEmptyObject(slotVariants)) {
      let isValid = true

      for (const key of Object.keys(slotVariants)) {
        const completePropsValue = getCompleteProps(context, key, slotProps)[key]

        const val = slotVariants[key]

        if (
          completePropsValue === undefined
          || (Array.isArray(val)
            ? !val.includes(completePropsValue)
            : val !== completePropsValue)
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
