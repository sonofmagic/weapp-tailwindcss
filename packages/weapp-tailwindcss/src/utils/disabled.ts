import type { UserDefinedOptions } from '@/types'

export interface ResolvedPluginDisabledState {
  plugin: boolean
}

export function resolvePluginDisabledState(disabled: UserDefinedOptions['disabled']): ResolvedPluginDisabledState {
  if (disabled === true) {
    return { plugin: true }
  }
  if (disabled === false || disabled == null) {
    return { plugin: false }
  }
  return {
    plugin: disabled.plugin ?? false,
  }
}
