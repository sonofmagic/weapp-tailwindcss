import type { AppType } from '@/types'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { installTailwindcssCssRedirect } from './tailwindcss-css-redirect'

const require = createRequire(import.meta.url)
const MPX_STYLE_RESOURCE_QUERY_RE = /(?:^|[?&])type=styles(?:&|$)/

function isMpxStyleResourceQuery(query?: string) {
  if (typeof query !== 'string') {
    return false
  }
  return MPX_STYLE_RESOURCE_QUERY_RE.test(query)
}

export function isMpx(appType?: AppType) {
  return appType === 'mpx'
}

export function getTailwindcssCssEntry(pkgDir: string) {
  return path.join(pkgDir, 'index.css')
}

function isMpxWebpackPluginRequest(request: string | undefined) {
  return request === '@mpxjs/webpack-plugin' || Boolean(request?.startsWith('@mpxjs/webpack-plugin/'))
}

function ensureResolveLoaderAlias(compiler: any) {
  compiler.options.resolveLoader = compiler.options.resolveLoader || {}
  const alias = compiler.options.resolveLoader.alias ?? {}
  if (Array.isArray(alias)) {
    alias.push({
      name: /^@mpxjs\/webpack-plugin\//,
      alias: path.dirname(require.resolve('@mpxjs/webpack-plugin/package.json')),
    })
  }
  else {
    compiler.options.resolveLoader.alias = alias
    const pkgDir = path.dirname(require.resolve('@mpxjs/webpack-plugin/package.json'))
    alias['@mpxjs/webpack-plugin'] = pkgDir
    alias['@mpxjs/webpack-plugin$'] = pkgDir
  }
}

export function ensureMpxTailwindcssAliases(compiler: any, pkgDir: string) {
  const tailwindcssCssEntry = getTailwindcssCssEntry(pkgDir)
  compiler.options = compiler.options || {}
  compiler.options.resolve = compiler.options.resolve || {}
  ensureResolveLoaderAlias(compiler)
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
    if (isMpxWebpackPluginRequest(request)) {
      return originalResolve.call(this, process.cwd(), request, callback)
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

const CSS_EXT_RE = /\.css$/i

export function injectMpxCssRewritePreRules(
  compiler: any,
  loader: string | undefined,
  loaderOptions: any,
) {
  if (!loader) {
    return
  }
  const moduleOptions = (compiler.options.module ??= { rules: [] } as any)
  moduleOptions.rules = moduleOptions.rules || []
  const createRule = (match: { test?: RegExp, resourceQuery?: RegExp | ((query: string) => boolean) }) => ({
    ...match,
    enforce: 'pre' as const,
    use: [
      {
        loader,
        options: loaderOptions,
      },
    ],
  })
  moduleOptions.rules.unshift(
    createRule({ resourceQuery: (query: string) => isMpxStyleResourceQuery(query) }),
    createRule({
      test: CSS_EXT_RE,
      resourceQuery: (query: string) => !isMpxStyleResourceQuery(query),
    }),
  )
}
