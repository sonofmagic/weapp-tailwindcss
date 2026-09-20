import type {
  TailwindV4CompiledSourceRoot,
  TailwindV4DesignSystem,
  TailwindV4ResolvedSource,
  TailwindV4SourcePattern,
} from './types.ts'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { withGenerationModuleCache } from './module-cache.ts'
import { prepareGenerationModuleRequests } from './module-requests.ts'

interface TailwindV4CompiledSource {
  sources: TailwindV4SourcePattern[]
  root: TailwindV4CompiledSourceRoot
  build: (candidates: string[]) => string
}

interface TailwindV4NodeModule {
  loadModule?: (id: string, base: string, onDependency: (dependency: string) => void) => Promise<{ module: unknown }>
  compile: (css: string, options: {
    base: string
    onDependency: (dependency: string) => void
    customCssResolver?: (id: string, base: string) => Promise<string | false | undefined>
  }) => Promise<TailwindV4CompiledSource>
  __unstable__loadDesignSystem: (css: string, options: { base: string }) => Promise<TailwindV4DesignSystem>
}

const nodeModulePromiseCache = new Map<string, Promise<TailwindV4NodeModule>>()
const designSystemPromiseCache = new Map<string, Promise<TailwindV4DesignSystem>>()

function unique(values: Iterable<string>) {
  return Array.from(new Set(Array.from(values).filter(Boolean).map(value => path.resolve(value))))
}

function createRequireBase(base: string) {
  return path.join(base, 'package.json')
}

function isRelativeSpecifier(id: string) {
  return id.startsWith('./') || id.startsWith('../') || id === '.' || id === '..'
}

function isAbsoluteSpecifier(id: string) {
  return path.isAbsolute(id)
}

function isCssSpecifier(id: string) {
  return path.extname(id) === '.css'
}

function createCssResolutionCandidates(id: string) {
  if (isCssSpecifier(id)) {
    return [id]
  }
  return [`${id}/index.css`, id]
}

function createFallbackCssResolver(baseCandidates: string[]) {
  const bases = unique(baseCandidates)
  return async (id: string) => {
    if (isRelativeSpecifier(id) || isAbsoluteSpecifier(id)) {
      return undefined
    }

    for (const base of bases) {
      const requireFromBase = createRequire(createRequireBase(base))
      for (const candidate of createCssResolutionCandidates(id)) {
        try {
          return requireFromBase.resolve(candidate)
        }
        catch {}
      }
    }
    return undefined
  }
}

async function importResolvedModule(resolved: string): Promise<TailwindV4NodeModule> {
  return import(pathToFileURL(resolved).href) as unknown as Promise<TailwindV4NodeModule>
}

async function importTailwindNodeFromBase(base: string): Promise<TailwindV4NodeModule | undefined> {
  try {
    const resolved = createRequire(createRequireBase(base)).resolve('@tailwindcss/node')
    return await importResolvedModule(resolved)
  }
  catch {
    return undefined
  }
}

async function importFallbackTailwindNode(): Promise<TailwindV4NodeModule> {
  return import('@tailwindcss/node') as unknown as Promise<TailwindV4NodeModule>
}

export async function loadTailwindV4NodeModule(baseCandidates: string[]): Promise<TailwindV4NodeModule> {
  const bases = unique(baseCandidates)
  const cacheKey = JSON.stringify(bases)
  const cached = nodeModulePromiseCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const promise = (async () => {
    for (const base of bases) {
      const loaded = await importTailwindNodeFromBase(base)
      if (loaded) {
        return loaded
      }
    }

    return importFallbackTailwindNode()
  })()

  nodeModulePromiseCache.set(cacheKey, promise)
  promise.catch(() => {
    if (nodeModulePromiseCache.get(cacheKey) === promise) {
      nodeModulePromiseCache.delete(cacheKey)
    }
  })
  return promise
}

function createDesignSystemCacheKey(css: string, bases: string[]) {
  return JSON.stringify({
    css,
    bases: unique(bases),
  })
}

export function getTailwindV4DesignSystemCacheKey(source: Pick<TailwindV4ResolvedSource, 'css' | 'base' | 'baseFallbacks'>) {
  return createDesignSystemCacheKey(source.css, [source.base, ...source.baseFallbacks])
}

async function createTailwindV4DesignSystem(source: TailwindV4ResolvedSource): Promise<TailwindV4DesignSystem> {
  const bases = unique([source.base, ...source.baseFallbacks])
  if (bases.length === 0) {
    throw new Error('No base directories provided for Tailwind CSS v4 design system.')
  }
  const node = await loadTailwindV4NodeModule([source.projectRoot, ...bases])
  let lastError: unknown

  for (const base of bases) {
    try {
      const prepared = prepareGenerationModuleRequests(source.css, base)
      return await withGenerationModuleCache(node, () => node.__unstable__loadDesignSystem(prepared.css, { base }), prepared.files)
    }
    catch (error) {
      lastError = error
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }
  throw new Error('Failed to load Tailwind CSS v4 design system.')
}

export async function loadTailwindV4DesignSystem(
  source: TailwindV4ResolvedSource,
  options?: { cache?: boolean },
): Promise<TailwindV4DesignSystem> {
  if (options?.cache === false) {
    return createTailwindV4DesignSystem(source)
  }

  const cacheKey = getTailwindV4DesignSystemCacheKey(source)
  const cached = designSystemPromiseCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const promise = createTailwindV4DesignSystem(source)

  designSystemPromiseCache.set(cacheKey, promise)
  promise.catch(() => {
    if (designSystemPromiseCache.get(cacheKey) === promise) {
      designSystemPromiseCache.delete(cacheKey)
    }
  })
  return promise
}

export async function compileTailwindV4Source(source: TailwindV4ResolvedSource) {
  const bases = unique([source.base, ...source.baseFallbacks])
  if (bases.length === 0) {
    throw new Error('No base directories provided for Tailwind CSS v4 compiler.')
  }

  const node = await loadTailwindV4NodeModule([source.projectRoot, ...bases])
  let lastError: unknown

  for (const base of bases) {
    const dependencies = new Set(source.dependencies)
    try {
      const prepared = prepareGenerationModuleRequests(source.css, base)
      const onDependency = (dependency: string) => dependencies.add(path.resolve(dependency))
      const compiled = await withGenerationModuleCache(node, () => node.compile(prepared.css, {
        base,
        customCssResolver: createFallbackCssResolver([source.projectRoot, ...bases]),
        onDependency,
      }), prepared.files, onDependency)
      return {
        compiled,
        dependencies,
      }
    }
    catch (error) {
      lastError = error
    }
  }

  if (lastError instanceof Error) {
    throw lastError
  }
  throw new Error('Failed to compile Tailwind CSS v4 source.')
}
