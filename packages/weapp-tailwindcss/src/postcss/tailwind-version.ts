import type { Result, Root } from 'postcss'
import type { WeappTailwindcssPostcssPluginOptions } from '../postcss'
import { DEFAULT_TAILWINDCSS_GENERATOR_MAJOR_VERSION, readInstalledPackageMajorVersion } from '../tailwindcss/version'
import { resolvePostcssProjectRoot } from './context'

function hasTailwindV4CssSyntax(root: Root) {
  let hasV4Syntax = false
  root.walkAtRules((rule) => {
    if (rule.name === 'theme' || rule.name === 'source' || rule.name === 'custom-variant') {
      hasV4Syntax = true
    }
    if (rule.name === 'import' && /(['"])tailwindcss\1/.test(rule.params)) {
      hasV4Syntax = true
    }
  })
  return hasV4Syntax
}

export function resolvePostcssTailwindVersion(
  root: Root,
  result: Result,
  options: WeappTailwindcssPostcssPluginOptions,
) {
  const packageName = options.packageName ?? 'tailwindcss'
  const installedVersion = readInstalledPackageMajorVersion(packageName, resolvePostcssProjectRoot(result, options))
  if (installedVersion) {
    return installedVersion
  }
  if (options.version) {
    return options.version
  }
  if (packageName === '@tailwindcss/postcss' || packageName.includes('tailwindcss4')) {
    return 4
  }
  if (packageName.includes('tailwindcss3')) {
    return 3
  }
  if (hasTailwindV4CssSyntax(root)) {
    return 4
  }
  return DEFAULT_TAILWINDCSS_GENERATOR_MAJOR_VERSION
}
