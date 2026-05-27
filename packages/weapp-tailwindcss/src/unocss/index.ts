import type { IArbitraryValues, IUnocssCompatibilityOptions, UserDefinedOptions } from '@/types'

function normalizeUnocssOptions(
  unocss: UserDefinedOptions['unocss'],
): IUnocssCompatibilityOptions | false {
  if (!unocss) {
    return false
  }
  if (unocss === true) {
    return {}
  }
  return unocss
}

export function resolveUnocssBareArbitraryValues(
  arbitraryValues: IArbitraryValues | undefined,
  unocss: UserDefinedOptions['unocss'],
): IArbitraryValues {
  const baseArbitraryValues = arbitraryValues ?? {}
  const options = normalizeUnocssOptions(unocss)
  if (!options) {
    return baseArbitraryValues
  }
  if (baseArbitraryValues.bareArbitraryValues !== undefined && baseArbitraryValues.bareArbitraryValues !== false) {
    return baseArbitraryValues
  }

  const bareArbitraryValues = options.bareArbitraryValues ?? true
  if (bareArbitraryValues === false) {
    return baseArbitraryValues
  }

  return {
    ...baseArbitraryValues,
    bareArbitraryValues,
  }
}
