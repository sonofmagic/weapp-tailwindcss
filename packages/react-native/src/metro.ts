/* eslint-disable style/max-statements-per-line */

import type { NativeStyleManifest } from './types'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { compileNativeStylesheet } from './compiler'

export const VIRTUAL_MANIFEST_MODULE = '@weapp-tailwindcss/react-native/virtual'

export interface MetroConfigLike {
  resolver?: {
    sourceExts?: string[]
    resolveRequest?: (context: unknown, moduleName: string, platform?: string) => unknown
    [key: string]: unknown
  }
  transformer?: Record<string, unknown>
  transformerPath?: string
  watchFolders?: string[]
  server?: Record<string, unknown>
  [key: string]: unknown
}

export interface WeappReactNativeMetroOptions {
  projectRoot?: string | undefined
  input?: string | undefined
  css?: string | undefined
  manifest?: NativeStyleManifest | undefined
  classSet?: Iterable<string> | undefined
  sourceGlobs?: string[] | undefined
  watchFiles?: string[] | undefined
}

interface RegisteredManifest {
  version: number
  manifest: NativeStyleManifest
  virtualPath: string
  manifestPath: string
  ready: Promise<void>
  refresh: () => Promise<void>
}

const registry = new Map<string, RegisteredManifest>()
let nextId = 0

function resolveInput(input: string | undefined, projectRoot: string) {
  return input ? path.resolve(projectRoot, input) : undefined
}

function emptyManifest(): NativeStyleManifest {
  return { version: 1, classSet: [], rules: {}, variables: {}, warnings: [] }
}

function virtualModuleCode(manifest: NativeStyleManifest) {
  return `import { setEnvironment, setManifest, setStyleSheetFactory } from ${JSON.stringify('@weapp-tailwindcss/react-native/runtime')};\nimport { Appearance, Platform, StyleSheet } from 'react-native';\nsetStyleSheetFactory(StyleSheet.create);\nconst syncEnvironment = () => setEnvironment({ platform: Platform.OS, colorScheme: Appearance.getColorScheme() ?? 'light' });\nsetManifest(${JSON.stringify(manifest)});\nsyncEnvironment();\nAppearance.addChangeListener?.(({ colorScheme }) => setEnvironment({ platform: Platform.OS, colorScheme: colorScheme ?? 'light' }));\nexport default undefined;`
}

function writeVirtualModule(entry: RegisteredManifest) {
  fs.mkdirSync(path.dirname(entry.virtualPath), { recursive: true })
  fs.writeFileSync(entry.virtualPath, virtualModuleCode(entry.manifest), 'utf8')
  fs.writeFileSync(entry.manifestPath, JSON.stringify(entry.manifest), 'utf8')
}

async function compileOptions(options: WeappReactNativeMetroOptions, projectRoot: string) {
  if (options.manifest) { return options.manifest }
  if (options.input) {
    const tailwindModulePath = import.meta.url.endsWith('.ts') ? './tailwind.ts' : './tailwind.js'
    const { generateNativeStylesheet } = await import(/* @vite-ignore */ tailwindModulePath)
    return generateNativeStylesheet({
      projectRoot,
      cssEntries: [resolveInput(options.input, projectRoot)!],
      candidates: options.classSet,
      sourceGlobs: options.sourceGlobs,
    })
  }
  return compileNativeStylesheet(options.css ?? '', { classSet: options.classSet })
}

function register(options: WeappReactNativeMetroOptions) {
  const id = `weapp-tailwindcss-native-${nextId++}`
  const projectRoot = path.resolve(options.projectRoot ?? process.cwd())
  const entry: RegisteredManifest = {
    version: 0,
    manifest: options.manifest ?? (options.css ? compileNativeStylesheet(options.css, { classSet: options.classSet }) : emptyManifest()),
    virtualPath: path.join(os.tmpdir(), 'weapp-tailwindcss-native', `${id}.js`),
    manifestPath: path.join(os.tmpdir(), 'weapp-tailwindcss-native', `${id}.manifest.json`),
    ready: Promise.resolve(),
    refresh: async () => {},
  }
  registry.set(id, entry)
  writeVirtualModule(entry)

  let generation = 0
  entry.refresh = async () => {
    const currentGeneration = ++generation
    const manifest = await compileOptions(options, projectRoot)
    if (currentGeneration === generation) {
      entry.manifest = manifest
      entry.version++
      writeVirtualModule(entry)
    }
  }
  entry.ready = entry.refresh().catch((error) => {
    entry.manifest.warnings.push({ message: `生成 React Native manifest 失败：${error instanceof Error ? error.message : String(error)}` })
  })

  const sourceRoots = (options.sourceGlobs ?? [])
    .map(pattern => pattern.split(/[*{[]/, 1)[0]?.replace(/[/\\]$/, ''))
    .filter(Boolean)
  const watched = [...(options.watchFiles ?? []), ...(options.input ? [options.input] : []), ...sourceRoots]
  const watchers = watched.map((file) => {
    const target = path.resolve(projectRoot, file)
    try {
      const recursive = fs.statSync(target).isDirectory()
      return fs.watch(target, { persistent: false, recursive }, () => { void entry.refresh() })
    }
    catch {
      return undefined
    }
  })
  void watchers
  return { id, entry }
}

export function getRegisteredVirtualModule(filename: string) {
  for (const entry of registry.values()) {
    if (entry.virtualPath === filename) { return entry }
  }
  return undefined
}

export async function getRegisteredManifest(id: string) {
  const registered = registry.get(id)
  if (!registered) { return undefined }
  await registered.ready
  return registered.manifest
}

export function getVirtualModuleCode(filename: string) {
  const registered = getRegisteredVirtualModule(filename)
  if (!registered) { return undefined }
  return virtualModuleCode(registered.manifest)
}

export async function getVirtualModuleCodeAsync(filename: string) {
  const registered = getRegisteredVirtualModule(filename)
  if (!registered) { return undefined }
  await registered.ready
  return getVirtualModuleCode(filename)
}

export function withWeappTailwindcss<T extends MetroConfigLike>(config: T | Promise<T> | (() => T | Promise<T>), options: WeappReactNativeMetroOptions = {}): T | Promise<T> {
  if (typeof config === 'function' || (config && typeof (config as Promise<T>).then === 'function')) {
    return Promise.resolve(typeof config === 'function' ? config() : config).then(resolved => withWeappTailwindcss(resolved, options))
  }
  const resolvedConfig = config as T
  const { id, entry } = register(options)
  const originalResolver = resolvedConfig.resolver?.resolveRequest
  const sourceExts = resolvedConfig.resolver?.sourceExts ?? []
  const virtualResolver = (context: unknown, moduleName: string, platform?: string) => {
    if (moduleName === VIRTUAL_MANIFEST_MODULE) {
      return { type: 'sourceFile', filePath: entry.virtualPath }
    }
    return originalResolver?.(context, moduleName, platform)
      ?? (context as { resolveRequest?: (ctx: unknown, name: string, platform?: string) => unknown }).resolveRequest?.(context, moduleName, platform)
  }
  return {
    ...resolvedConfig,
    watchFolders: [...new Set([...(resolvedConfig.watchFolders ?? []), path.dirname(entry.virtualPath)])],
    transformerPath: fileURLToPath(new URL(import.meta.url.includes('.ts') ? './metro-transformer.ts' : './metro-transformer.js', import.meta.url)),
    transformer: {
      ...resolvedConfig.transformer,
      weappTailwindcssMetroId: id,
      weappTailwindcssOriginalTransformerPath: resolvedConfig.transformerPath,
      weappTailwindcssManifestPath: entry.manifestPath,
    },
    resolver: {
      ...resolvedConfig.resolver,
      sourceExts: sourceExts.includes('css') ? sourceExts : [...sourceExts, 'css'],
      resolveRequest: virtualResolver,
    },
  } as T
}
