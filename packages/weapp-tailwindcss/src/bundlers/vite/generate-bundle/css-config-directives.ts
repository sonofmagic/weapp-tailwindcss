import type { InternalUserDefinedOptions } from '@/types'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { resolveTailwindV4CssSourceBase } from '@/tailwindcss/source-scan'
import { slash } from '../utils'
import { normalizeCssSourceForCompare } from './css-output'
import { hasMatchingStyleFileBase, isMatchingCssSourceFile } from './style-matching'

function isPackageJsonImportRequest(request: string) {
  return request.startsWith('#')
}

function normalizeMatchedCssSourcePath(file: string | undefined) {
  if (!file || !path.isAbsolute(file)) {
    return undefined
  }
  return path.resolve(file.replace(/[?#].*$/, ''))
}

function collectConfiguredTailwindV4CssSources(opts: InternalUserDefinedOptions) {
  const patcherCssSources = ((opts.tailwindcssPatcherOptions as any)?.tailwindcss?.v4?.cssSources ?? []) as NonNullable<NonNullable<InternalUserDefinedOptions['tailwindcss']>['v4']>['cssSources'] | undefined
  return [
    ...(opts.tailwindcss?.v4?.cssSources ?? []),
    ...(patcherCssSources ?? []),
  ]
}

function collectConfiguredCssEntries(opts: InternalUserDefinedOptions) {
  const patcherCssEntries = ((opts.tailwindcssPatcherOptions as any)?.tailwindcss?.v4?.cssEntries ?? []) as string[] | undefined
  return [
    ...(opts.cssEntries ?? []),
    ...(opts.tailwindcss?.v4?.cssEntries ?? []),
    ...(patcherCssEntries ?? []),
  ].filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
}

function collectCssConfigBaseCandidates(
  source: string,
  file: string,
  outputRoot: string,
  opts: InternalUserDefinedOptions,
) {
  const candidates: string[] = []
  const seen = new Set<string>()
  const addCandidate = (candidate: string | undefined) => {
    if (!candidate) {
      return
    }
    const normalized = path.resolve(candidate)
    if (seen.has(normalized)) {
      return
    }
    seen.add(normalized)
    candidates.push(normalized)
  }

  addCandidate(path.dirname(path.resolve(outputRoot, file.replace(/[?#].*$/, ''))))

  const normalizedSource = normalizeCssSourceForCompare(source)
  const patcherProjectRoot = typeof opts.tailwindcssPatcherOptions?.projectRoot === 'string'
    ? opts.tailwindcssPatcherOptions.projectRoot
    : undefined
  const sourceBaseFallback = opts.tailwindcss?.v4?.base
    ?? patcherProjectRoot
    ?? opts.tailwindcssBasedir
    ?? outputRoot
  const sourceRoot = opts.tailwindcssBasedir ?? patcherProjectRoot
  const configuredCssEntries = collectConfiguredCssEntries(opts)
  for (const cssEntry of configuredCssEntries) {
    const resolvedCssEntry = path.resolve(cssEntry)
    if (
      configuredCssEntries.length === 1
      || isMatchingCssSourceFile(file, resolvedCssEntry, outputRoot)
      || hasMatchingStyleFileBase(file, resolvedCssEntry, outputRoot, sourceRoot)
    ) {
      addCandidate(path.dirname(resolvedCssEntry))
    }
  }
  for (const cssSource of collectConfiguredTailwindV4CssSources(opts)) {
    const cssSourceFile = normalizeMatchedCssSourcePath(cssSource.file)
    const cssSourceCss = typeof cssSource.css === 'string'
      ? normalizeCssSourceForCompare(cssSource.css)
      : undefined
    if (
      cssSourceFile
      && !isMatchingCssSourceFile(file, cssSourceFile, outputRoot)
      && cssSourceCss !== normalizedSource
    ) {
      continue
    }
    addCandidate(cssSourceFile ? path.dirname(cssSourceFile) : undefined)
    addCandidate(resolveTailwindV4CssSourceBase(cssSource, sourceBaseFallback))
  }

  return candidates
}

export function normalizeRelativeCssConfigDirectives(
  source: string,
  file: string,
  outputRoot: string,
  opts: InternalUserDefinedOptions,
) {
  if (!source.includes('@config')) {
    return source
  }

  const baseCandidates = collectCssConfigBaseCandidates(source, file, outputRoot, opts)

  return source.replace(/@config\s+(["'])(.+?)\1\s*;?/g, (full, quote: string, request: string) => {
    if (path.isAbsolute(request) || isPackageJsonImportRequest(request)) {
      return full
    }

    for (const base of baseCandidates) {
      const configFile = path.resolve(base, request)
      if (existsSync(configFile)) {
        return `@config ${quote}${slash(configFile)}${quote};`
      }
    }

    return full
  })
}
