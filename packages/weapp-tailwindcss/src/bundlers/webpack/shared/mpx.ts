import type { AppType } from '@/types'
import path from 'node:path'
import { installTailwindcssCssRedirect } from './tailwindcss-css-redirect'

export function isMpx(appType?: AppType) {
  return appType === 'mpx'
}

export function getTailwindcssCssEntry(pkgDir: string) {
  return path.join(pkgDir, 'index.css')
}

export function ensureMpxTailwindcssAliases(compiler: any, pkgDir: string) {
  const tailwindcssCssEntry = getTailwindcssCssEntry(pkgDir)
  compiler.options = compiler.options || {}
  compiler.options.resolve = compiler.options.resolve || {}
  const alias = compiler.options.resolve.alias ?? {}
  if (Array.isArray(alias)) {
    alias.push(
      { name: 'tailwindcss', alias: tailwindcssCssEntry },
      { name: 'tailwindcss$', alias: tailwindcssCssEntry },
    )
  }
  else {
    compiler.options.resolve.alias = alias
    alias.tailwindcss = tailwindcssCssEntry
    alias.tailwindcss$ = tailwindcssCssEntry
  }
  return tailwindcssCssEntry
}

export function patchMpxLoaderResolve(
  loaderContext: any,
  pkgDir: string,
  enabled: boolean,
) {
  if (!enabled || typeof loaderContext.resolve !== 'function') {
    return
  }
  const originalResolve = loaderContext.resolve
  if ((originalResolve as any).__weappTwPatched) {
    return
  }
  const tailwindcssCssEntry = getTailwindcssCssEntry(pkgDir)
  const wrappedResolve = function (this: any, context: any, request: string, callback: any) {
    if (request === 'tailwindcss' || request === 'tailwindcss$') {
      return callback(null, tailwindcssCssEntry)
    }
    if (request?.startsWith('tailwindcss/')) {
      return callback(null, path.join(pkgDir, request.slice('tailwindcss/'.length)))
    }
    return originalResolve.call(this, context, request, callback)
  }
  ;(wrappedResolve as any).__weappTwPatched = true
  loaderContext.resolve = wrappedResolve as any
}

export function setupMpxTailwindcssRedirect(
  pkgDir: string,
  enabled: boolean,
) {
  if (enabled) {
    installTailwindcssCssRedirect(pkgDir)
  }
}
