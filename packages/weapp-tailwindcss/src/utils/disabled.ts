import type { UserDefinedOptions } from '@/types'

export interface ResolvedDisabledOptions {
  plugin: boolean
  rewriteCssImports: boolean
}

export function resolveDisabledOptions(disabled: UserDefinedOptions['disabled']): ResolvedDisabledOptions {
  if (disabled === true) {
    return { plugin: true, rewriteCssImports: false }
  }
  if (disabled === false || disabled == null) {
    return { plugin: false, rewriteCssImports: false }
  }
  return {
    plugin: disabled.plugin ?? false,
    rewriteCssImports: disabled.rewriteCssImports ?? false,
  }
}
