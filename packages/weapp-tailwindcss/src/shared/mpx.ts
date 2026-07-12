import type { AppType } from '@/types'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { installTailwindcssCssRedirect } from './tailwindcss-css-redirect'

const localRequire = createRequire(import.meta.url)
const MPX_STYLE_RESOURCE_QUERY_RE = /(?:^|[?&])type=styles(?:&|$)/
const MPX_WEBPACK_PLUGIN_PACKAGE_RE = /@mpxjs[\\/]webpack-plugin[\\/]package\.json$/
const MPX_WEBPACK_PLUGIN_LIB_RE = /^(.*[\\/]@mpxjs[\\/]webpack-plugin)[\\/]lib[\\/]/
const MPX_WEBPACK_PLUGIN_REQUEST_RE = /@mpxjs\/webpack-plugin\/([^!?]+)/g

function findMpxWebpackPluginDirFromRules(rules: any): string | undefined {
  const visit = (value: any): string | undefined => {
    if (typeof value === 'string') {
      return value.match(MPX_WEBPACK_PLUGIN_LIB_RE)?.[1]
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        const result = visit(item)
        if (result) {
          return result
        }
      }
      return undefined
    }
    if (value && typeof value === 'object') {
      for (const key of ['loader', 'use', 'rules', 'oneOf']) {
        const result = visit(value[key])
        if (result) {
          return result
        }
      }
    }
    return undefined
  }
  return visit(rules)
}

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

function resolveMpxWebpackPluginDir(compiler: any) {
  const rulePluginDir = findMpxWebpackPluginDirFromRules([
    compiler?._module?.loaders,
    compiler?.loaders,
    compiler?.options?.module?.rules,
  ])
  if (rulePluginDir) {
    return rulePluginDir
  }
  const candidates = [
    compiler?.context,
    compiler?.options?.context,
    process.cwd(),
  ].filter((item): item is string => typeof item === 'string' && item.length > 0)

  for (const candidate of candidates) {
    try {
      const projectRequire = createRequire(path.join(candidate, 'package.json'))
      return path.dirname(projectRequire.resolve('@mpxjs/webpack-plugin/package.json'))
    }
    catch {
    }
  }

  const cachedPackageJson = Object.keys(localRequire.cache).find(file => MPX_WEBPACK_PLUGIN_PACKAGE_RE.test(file))
  if (cachedPackageJson) {
    return path.dirname(cachedPackageJson)
  }

  try {
    return path.dirname(localRequire.resolve('@mpxjs/webpack-plugin/package.json'))
  }
  catch {
    return undefined
  }
}

export function rewriteMpxWebpackPluginRequests(
  request: string,
  mpxWebpackPluginDir: string,
  pathImpl: Pick<typeof path, 'join'> = path,
) {
  return request.replace(MPX_WEBPACK_PLUGIN_REQUEST_RE, (_full, subpath: string) => {
    return pathImpl.join(mpxWebpackPluginDir, ...subpath.split('/'))
  })
}

export function patchMpxWebpackPluginRequests(compiler: any, mpxWebpackPluginDir: string | undefined) {
  if (!mpxWebpackPluginDir || !compiler) {
    return false
  }
  const pluginName = 'weapp-tailwindcss-mpx-loader-resolve'
  const patchedCompilers = new WeakSet<object>()
  const install = (targetCompiler: any) => {
    if (!targetCompiler || typeof targetCompiler !== 'object' || patchedCompilers.has(targetCompiler)) {
      return
    }
    patchedCompilers.add(targetCompiler)
    ensureResolveLoaderAlias(targetCompiler, mpxWebpackPluginDir)
    targetCompiler.hooks?.normalModuleFactory?.tap?.(pluginName, (normalModuleFactory: any) => {
      normalModuleFactory.hooks.beforeResolve.tap(pluginName, (resolveData: any) => {
        if (typeof resolveData?.request === 'string') {
          resolveData.request = rewriteMpxWebpackPluginRequests(resolveData.request, mpxWebpackPluginDir)
        }
      })
    })
    targetCompiler.hooks?.compilation?.tap?.(pluginName, (compilation: any) => {
      compilation.hooks?.childCompiler?.tap?.(pluginName, (childCompiler: any) => {
        install(childCompiler)
      })
    })
  }
  install(compiler)
  return true
}

function isMpxWebpackPluginRequest(request: string | undefined) {
  return request === '@mpxjs/webpack-plugin' || Boolean(request?.startsWith('@mpxjs/webpack-plugin/'))
}

function resolveMpxWebpackPluginRequest(request: string, mpxWebpackPluginDir: string) {
  if (request === '@mpxjs/webpack-plugin') {
    return mpxWebpackPluginDir
  }
  return path.join(mpxWebpackPluginDir, request.slice('@mpxjs/webpack-plugin/'.length))
}

function addMpxWebpackPluginAlias(alias: any, pkgDir: string) {
  const recordLoader = path.join(pkgDir, 'lib/record-loader')
  const styleCompiler = path.join(pkgDir, 'lib/style-compiler/index')
  const stripConditionalLoader = path.join(pkgDir, 'lib/style-compiler/strip-conditional-loader')
  if (Array.isArray(alias)) {
    alias.push(
      { name: '@mpxjs/webpack-plugin/lib/record-loader', alias: recordLoader },
      { name: '@mpxjs/webpack-plugin/lib/style-compiler/index', alias: styleCompiler },
      { name: '@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader', alias: stripConditionalLoader },
      {
        name: /^@mpxjs\/webpack-plugin\//,
        alias: pkgDir,
      },
    )
  }
  else {
    alias['@mpxjs/webpack-plugin'] = pkgDir
    alias['@mpxjs/webpack-plugin$'] = pkgDir
    alias['@mpxjs/webpack-plugin/lib/record-loader'] = recordLoader
    alias['@mpxjs/webpack-plugin/lib/style-compiler/index'] = styleCompiler
    alias['@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader'] = stripConditionalLoader
  }
}

function ensureResolveLoaderAlias(compiler: any, mpxWebpackPluginDir: string) {
  compiler.options.resolveLoader = compiler.options.resolveLoader || {}
  const alias = compiler.options.resolveLoader.alias ?? {}
  compiler.options.resolveLoader.alias = alias
  addMpxWebpackPluginAlias(alias, mpxWebpackPluginDir)
}

export function patchMpxWebpackPluginNormalizeLib(_compiler: any, mpxWebpackPluginDir: string | undefined) {
  if (!mpxWebpackPluginDir) {
    return false
  }
  let normalize: { lib?: (file: string) => string }
  try {
    const pluginRequire = createRequire(path.join(mpxWebpackPluginDir, 'package.json'))
    normalize = pluginRequire(path.join(mpxWebpackPluginDir, 'lib/utils/normalize'))
  }
  catch {
    return false
  }

  if (typeof normalize.lib !== 'function') {
    return false
  }
  if ((normalize.lib as any).__weappTwPatched) {
    return true
  }

  const wrappedLib = (file: string) => path.join(mpxWebpackPluginDir, 'lib', file)
  ;(wrappedLib as any).__weappTwPatched = true
  ;(wrappedLib as any).__weappTwOriginal = normalize.lib
  normalize.lib = wrappedLib
  return true
}

export function ensureMpxTailwindcssAliases(compiler: any, pkgDir: string) {
  const tailwindcssCssEntry = getTailwindcssCssEntry(pkgDir)
  compiler.options = compiler.options || {}
  compiler.options.resolve = compiler.options.resolve || {}
  const mpxWebpackPluginDir = resolveMpxWebpackPluginDir(compiler)
  patchMpxWebpackPluginNormalizeLib(compiler, mpxWebpackPluginDir)
  patchMpxWebpackPluginRequests(compiler, mpxWebpackPluginDir)
  if (mpxWebpackPluginDir) {
    ensureResolveLoaderAlias(compiler, mpxWebpackPluginDir)
  }
  const alias = compiler.options.resolve.alias ?? {}
  compiler.options.resolve.alias = alias
  if (Array.isArray(alias)) {
    alias.push(
      { name: 'tailwindcss', alias: tailwindcssCssEntry },
      { name: 'tailwindcss$', alias: tailwindcssCssEntry },
    )
  }
  else {
    alias.tailwindcss = tailwindcssCssEntry
    alias.tailwindcss$ = tailwindcssCssEntry
  }
  if (mpxWebpackPluginDir) {
    addMpxWebpackPluginAlias(alias, mpxWebpackPluginDir)
  }
  return tailwindcssCssEntry
}

export function patchMpxLoaderResolve(
  loaderContext: any,
  pkgDir: string,
  enabled: boolean,
) {
  if (!enabled) {
    return
  }
  const tailwindcssCssEntry = getTailwindcssCssEntry(pkgDir)
  const mpxWebpackPluginDir = resolveMpxWebpackPluginDir(loaderContext)
  const originalResolve = loaderContext.resolve
  if (typeof originalResolve === 'function' && !(originalResolve as any).__weappTwPatched) {
    const wrappedResolve = function (this: any, context: any, request: string, callback: any) {
      if (request === 'tailwindcss' || request === 'tailwindcss$') {
        return callback(null, tailwindcssCssEntry)
      }
      if (request?.startsWith('tailwindcss/')) {
        return callback(null, path.join(pkgDir, request.slice('tailwindcss/'.length)))
      }
      if (mpxWebpackPluginDir && isMpxWebpackPluginRequest(request)) {
        return callback(null, resolveMpxWebpackPluginRequest(request, mpxWebpackPluginDir))
      }
      return originalResolve.call(this, context, request, callback)
    }
    ;(wrappedResolve as any).__weappTwPatched = true
    loaderContext.resolve = wrappedResolve as any
  }

  const originalImportModule = loaderContext.importModule
  if (mpxWebpackPluginDir && typeof originalImportModule === 'function' && !(originalImportModule as any).__weappTwPatched) {
    const wrappedImportModule = function (this: any, request: string, ...args: any[]) {
      const resolvedRequest = typeof request === 'string'
        ? rewriteMpxWebpackPluginRequests(request, mpxWebpackPluginDir)
        : request
      return originalImportModule.call(this, resolvedRequest, ...args)
    }
    ;(wrappedImportModule as any).__weappTwPatched = true
    loaderContext.importModule = wrappedImportModule as any
  }
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
