import type { HmrContext, ModuleNode } from 'vite'
import path from 'node:path'
import { isSourceStyleRequest } from '../shared/style-requests'
import { cleanUrl, slash } from './utils'

export function resolveHotTailwindCssModules(ctx: HmrContext, tailwindRootCssModuleIds: Set<string>) {
  const modules: ModuleNode[] = []
  const seenModules = new Set<ModuleNode>()
  const collectModule = (mod: ModuleNode | undefined) => {
    if (mod == null || seenModules.has(mod)) {
      return
    }
    const modId = mod.id ?? mod.url
    if (!isSourceStyleRequest(modId)) {
      return
    }
    seenModules.add(mod)
    ctx.server.moduleGraph.invalidateModule(mod)
    modules.push(mod)
  }
  for (const id of tailwindRootCssModuleIds) {
    const candidates = [
      ctx.server.moduleGraph.getModuleById(id),
      ctx.server.moduleGraph.getModuleById(cleanUrl(id)),
      ...(ctx.server.moduleGraph.getModulesByFile(id) ?? []),
      ...(ctx.server.moduleGraph.getModulesByFile(cleanUrl(id)) ?? []),
    ]
    for (const mod of candidates) {
      collectModule(mod)
    }
  }
  return modules
}

export function resolveHotSourceModules(ctx: HmrContext) {
  const modules: ModuleNode[] = []
  const seenModules = new Set<ModuleNode>()
  const collectModule = (mod: ModuleNode | undefined) => {
    if (mod == null || seenModules.has(mod)) {
      return
    }
    const modId = mod.id ?? mod.url
    if (isSourceStyleRequest(modId)) {
      return
    }
    seenModules.add(mod)
    modules.push(mod)
  }

  for (const mod of ctx.modules) {
    collectModule(mod)
  }
  for (const mod of ctx.server.moduleGraph.getModulesByFile(ctx.file) ?? []) {
    collectModule(mod)
  }
  for (const mod of ctx.server.moduleGraph.getModulesByFile(cleanUrl(ctx.file)) ?? []) {
    collectModule(mod)
  }
  collectModule(ctx.server.moduleGraph.getModuleById?.(ctx.file))
  collectModule(ctx.server.moduleGraph.getModuleById?.(cleanUrl(ctx.file)))

  return modules
}

function resolveModuleHotUrl(mod: ModuleNode) {
  if (typeof mod.url === 'string' && mod.url.length > 0) {
    return mod.url
  }
  if (typeof mod.id === 'string' && mod.id.startsWith('/')) {
    return mod.id
  }
  return undefined
}

function resolveCssHotUrl(id: string, root: string) {
  const file = cleanUrl(id)
  if (/^\/(?![A-Z]:)/i.test(file) && !file.startsWith(slash(root))) {
    return file
  }
  const normalizedRoot = slash(path.resolve(root))
  const normalizedFile = slash(path.resolve(file))
  if (!normalizedFile.startsWith(`${normalizedRoot}/`)) {
    return undefined
  }
  return `/${slash(path.relative(normalizedRoot, normalizedFile))}`
}

function includesHotModule(modules: ModuleNode[], target: ModuleNode) {
  const targetUrl = resolveModuleHotUrl(target)
  const targetId = target.id
  return modules.some((mod) => {
    if (mod === target) {
      return true
    }
    return (
      targetUrl !== undefined
      && resolveModuleHotUrl(mod) === targetUrl
    ) || (
      typeof targetId === 'string'
      && targetId.length > 0
      && mod.id === targetId
    )
  })
}

export function hasSelfAcceptingNonStyleHotModule(modules: ModuleNode[]) {
  return modules.some((mod) => {
    const modId = mod.id ?? mod.url
    return !isSourceStyleRequest(modId) && mod.isSelfAccepting === true
  })
}

export function sendSupplementalCssHotUpdates(ctx: HmrContext, cssModules: ModuleNode[], fallbackCssIds: Iterable<string> = []) {
  const seenUrls = new Set<string>()
  const updates = cssModules
    .filter(mod => !includesHotModule(ctx.modules, mod))
    .map((mod) => {
      const hotUrl = resolveModuleHotUrl(mod)
      if (!hotUrl || seenUrls.has(hotUrl)) {
        return undefined
      }
      seenUrls.add(hotUrl)
      return {
        type: 'css-update' as const,
        timestamp: ctx.timestamp,
        path: hotUrl,
        acceptedPath: hotUrl,
      }
    })
    .filter((update): update is NonNullable<typeof update> => update !== undefined)
  for (const id of fallbackCssIds) {
    const hotUrl = resolveCssHotUrl(id, ctx.server.config.root)
    if (!hotUrl || seenUrls.has(hotUrl)) {
      continue
    }
    seenUrls.add(hotUrl)
    updates.push({
      type: 'css-update',
      timestamp: ctx.timestamp,
      path: hotUrl,
      acceptedPath: hotUrl,
    })
  }
  if (updates.length === 0) {
    return
  }
  queueMicrotask(() => {
    ctx.server.ws?.send?.({
      type: 'update',
      updates,
    })
  })
}

export function sendFullReloadForUnresolvedHotUpdate(ctx: HmrContext) {
  ctx.server.ws?.send?.({
    type: 'full-reload',
    path: '*',
    triggeredBy: ctx.file,
  })
}
