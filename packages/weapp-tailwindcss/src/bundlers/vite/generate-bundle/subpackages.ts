import type { OutputAsset, OutputChunk } from 'rollup'
import type { BundleSnapshot } from '../bundle-state'
import type { TailwindSourceEntry } from '@/tailwindcss/source-scan'
import path from 'node:path'
import { normalizeOutputPathKey } from '../../shared/module-graph'
import { slash } from '../utils'
import { collectChunkModuleIds } from './sfc-style-source'

function readBundleAssetSource(output: OutputAsset | OutputChunk) {
  if ('type' in output && output.type !== 'asset') {
    return undefined
  }
  const source = (output as OutputAsset | { source?: unknown }).source
  if (typeof source === 'string') {
    return source
  }
  if (typeof source === 'function') {
    const value = (source as () => unknown).call(output)
    return typeof value === 'string' ? value : value?.toString()
  }
  if (source != null && typeof (source as { toString?: unknown }).toString === 'function') {
    return source.toString()
  }
  return undefined
}

export function normalizePackageRoot(root: string) {
  return normalizeOutputPathKey(root).replace(/\/+$/, '')
}

export function collectMiniProgramSubpackageRoots(bundle: Record<string, OutputAsset | OutputChunk>) {
  let hasAppJson = false
  const roots = new Set<string>()
  for (const [file, output] of Object.entries(bundle)) {
    const outputFile = output.fileName || file
    if (path.basename(outputFile) !== 'app.json') {
      continue
    }
    const source = readBundleAssetSource(output)
    if (!source) {
      continue
    }
    hasAppJson = true
    try {
      const appJson = JSON.parse(source) as {
        subPackages?: Array<{ root?: unknown }> | undefined
        subpackages?: Array<{ root?: unknown }> | undefined
      }
      const subPackages = Array.isArray(appJson.subPackages)
        ? appJson.subPackages
        : Array.isArray(appJson.subpackages)
          ? appJson.subpackages
          : []
      for (const subPackage of subPackages) {
        if (typeof subPackage.root !== 'string' || subPackage.root.length === 0) {
          continue
        }
        roots.add(normalizePackageRoot(subPackage.root))
      }
    }
    catch {
    }
  }
  return hasAppJson ? roots : undefined
}

export function isSubpackageOutputFile(file: string, subpackageRoots: Set<string>) {
  const normalizedFile = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  for (const root of subpackageRoots) {
    if (
      root.length > 0
      && (
        normalizedFile === root
        || normalizedFile.startsWith(`${root}/`)
        || normalizedFile.endsWith(`/${root}`)
        || normalizedFile.includes(`/${root}/`)
      )
    ) {
      return true
    }
  }
  return false
}

function resolveSubpackageSourceRootFromModuleId(moduleId: string, subpackageRoot: string) {
  const file = slash(path.resolve(moduleId.replace(/[?#].*$/, '')))
  const normalizedRoot = normalizePackageRoot(subpackageRoot)
  const rootSegment = `/${normalizedRoot}/`
  const rootIndex = file.lastIndexOf(rootSegment)
  if (rootIndex >= 0) {
    return file.slice(0, rootIndex + rootSegment.length - 1)
  }
  const rootSuffix = `/${normalizedRoot}`
  if (file.endsWith(rootSuffix)) {
    return file
  }
  return undefined
}

export function collectMiniProgramSubpackageSourceEntries(
  snapshot: BundleSnapshot,
  subpackageRoots: Set<string>,
  sourceBaseRoots: Array<string | undefined>,
) {
  const sourceRoots = new Set<string>()
  const sourceEntries: TailwindSourceEntry[] = []
  for (const entry of snapshot.entries) {
    if (entry.output.type !== 'chunk' || !isSubpackageOutputFile(entry.file, subpackageRoots)) {
      continue
    }
    const matchedSubpackageRoot = [...subpackageRoots].find(root => isSubpackageOutputFile(entry.file, new Set([root])))
    if (!matchedSubpackageRoot) {
      continue
    }
    for (const moduleId of collectChunkModuleIds(entry.output)) {
      if (!path.isAbsolute(moduleId.replace(/[?#].*$/, ''))) {
        continue
      }
      const sourceRoot = resolveSubpackageSourceRootFromModuleId(moduleId, matchedSubpackageRoot)
      if (sourceRoot) {
        sourceRoots.add(sourceRoot)
      }
    }
  }
  sourceEntries.push(...[...sourceRoots].map<TailwindSourceEntry>(sourceRoot => ({
    base: sourceRoot,
    negated: false,
    pattern: '**/*',
  })))
  const resolvedBaseRoots = sourceBaseRoots
    .filter((baseRoot): baseRoot is string => typeof baseRoot === 'string' && baseRoot.length > 0)
    .map(baseRoot => path.resolve(baseRoot))
    .filter((baseRoot, index, roots) => roots.indexOf(baseRoot) === index)
  for (const baseRoot of resolvedBaseRoots) {
    for (const subpackageRoot of subpackageRoots) {
      sourceEntries.push({
        base: baseRoot,
        negated: false,
        pattern: `**/${normalizePackageRoot(subpackageRoot)}/**`,
      })
    }
  }
  return sourceEntries
}
