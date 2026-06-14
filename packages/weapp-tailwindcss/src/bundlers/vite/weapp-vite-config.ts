import type { OutputBundle, OutputChunk } from 'rollup'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { normalizeOutputPathKey } from '../shared/module-graph'

interface ViteConfigWithWeapp {
  root?: unknown
  weapp?: {
    srcRoot?: unknown
  } | undefined
}

function resolveSourceRootCandidate(root: string, value: string | undefined) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined
  }
  const resolved = path.isAbsolute(value) ? value : path.resolve(root, value)
  return existsSync(resolved) ? resolved : undefined
}

export function resolveWeappViteSourceRoot(config: unknown, _appType?: unknown) {
  const viteConfig = config as ViteConfigWithWeapp | undefined
  const root = typeof viteConfig?.root === 'string' && viteConfig.root.length > 0
    ? path.resolve(viteConfig.root)
    : process.cwd()
  const configuredSrcRoot = resolveSourceRootCandidate(root, viteConfig?.weapp?.srcRoot as string | undefined)
  if (configuredSrcRoot) {
    return configuredSrcRoot
  }
  const envSrcRoot = resolveSourceRootCandidate(root, process.env.UNI_INPUT_DIR)
    ?? resolveSourceRootCandidate(root, process.env.UNI_INPUT_ROOT)
    ?? resolveSourceRootCandidate(root, process.env.UNI_APP_INPUT_DIR)
  if (envSrcRoot) {
    return envSrcRoot
  }
  return undefined
}

function stripFileExtension(file: string) {
  return file.replace(/[?#].*$/, '').replace(/\.[^.\\/]+$/u, '')
}

function isUsefulModuleId(id: string) {
  return !id.includes('\0')
    && !id.includes('/node_modules/')
    && !id.includes('\\node_modules\\')
    && !/[?&]type=style\b/u.test(id)
}

function collectChunkModuleIds(chunk: OutputChunk) {
  const ids = new Set<string>()
  if (typeof chunk.facadeModuleId === 'string' && chunk.facadeModuleId.length > 0) {
    ids.add(chunk.facadeModuleId)
  }
  for (const id of chunk.moduleIds ?? []) {
    if (typeof id === 'string' && id.length > 0) {
      ids.add(id)
    }
  }
  return ids
}

function resolveSourceRootFromChunk(root: string, fileName: string, chunk: OutputChunk) {
  const outputBase = stripFileExtension(normalizeOutputPathKey(fileName))
  if (!outputBase.includes('/')) {
    return undefined
  }
  for (const id of collectChunkModuleIds(chunk)) {
    if (!isUsefulModuleId(id)) {
      continue
    }
    const cleanId = id.replace(/[?#].*$/, '')
    const relativeModule = normalizeOutputPathKey(path.relative(root, cleanId))
    if (
      relativeModule.length === 0
      || relativeModule === '.'
      || relativeModule.startsWith('../')
      || path.isAbsolute(relativeModule)
    ) {
      continue
    }
    const moduleBase = stripFileExtension(relativeModule)
    if (!moduleBase.endsWith(outputBase)) {
      continue
    }
    const sourceRoot = moduleBase.slice(0, moduleBase.length - outputBase.length).replace(/\/+$/u, '')
    if (sourceRoot.length === 0) {
      continue
    }
    const resolved = path.resolve(root, sourceRoot)
    if (existsSync(resolved)) {
      return resolved
    }
  }
}

export function resolveSourceRootFromBundleGraph(config: unknown, bundle: OutputBundle) {
  const viteConfig = config as ViteConfigWithWeapp | undefined
  const root = typeof viteConfig?.root === 'string' && viteConfig.root.length > 0
    ? path.resolve(viteConfig.root)
    : process.cwd()
  const sourceRoots = new Set<string>()
  for (const output of Object.values(bundle)) {
    if (output.type !== 'chunk') {
      continue
    }
    const sourceRoot = resolveSourceRootFromChunk(root, output.fileName, output)
    if (sourceRoot) {
      sourceRoots.add(sourceRoot)
    }
  }
  return sourceRoots.size === 1 ? [...sourceRoots][0] : undefined
}
