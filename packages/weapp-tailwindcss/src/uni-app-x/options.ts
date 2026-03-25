import type { UserDefinedOptions } from '@/types'

export interface ResolvedUniAppXComponentLocalStylesOptions {
  enabled: boolean
  onlyWhenStyleIsolationVersion2: boolean
}

export interface ResolvedUniAppXOptions {
  enabled: boolean
  componentLocalStyles: ResolvedUniAppXComponentLocalStylesOptions
}

function resolveComponentLocalStyles(
  option: UserDefinedOptions['uniAppX'],
): ResolvedUniAppXComponentLocalStylesOptions {
  if (option === false) {
    return {
      enabled: false,
      onlyWhenStyleIsolationVersion2: true,
    }
  }

  if (option === true || option === undefined) {
    return {
      enabled: false,
      onlyWhenStyleIsolationVersion2: true,
    }
  }

  const componentLocalStyles = option.componentLocalStyles
  if (componentLocalStyles === false) {
    return {
      enabled: false,
      onlyWhenStyleIsolationVersion2: true,
    }
  }

  if (componentLocalStyles === true || componentLocalStyles === undefined) {
    return {
      enabled: true,
      onlyWhenStyleIsolationVersion2: true,
    }
  }

  return {
    enabled: componentLocalStyles.enabled !== false,
    onlyWhenStyleIsolationVersion2: componentLocalStyles.onlyWhenStyleIsolationVersion2 !== false,
  }
}

export function resolveUniAppXOptions(option: UserDefinedOptions['uniAppX']): ResolvedUniAppXOptions {
  if (typeof option === 'object' && option) {
    return {
      enabled: option.enabled !== false,
      componentLocalStyles: resolveComponentLocalStyles(option),
    }
  }

  return {
    enabled: Boolean(option),
    componentLocalStyles: resolveComponentLocalStyles(option),
  }
}

export function isUniAppXEnabled(option: UserDefinedOptions['uniAppX']) {
  return resolveUniAppXOptions(option).enabled
}
