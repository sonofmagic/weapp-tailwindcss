import type { Compiler } from 'webpack4'
import type { AppType, InternalUserDefinedOptions } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pluginName } from '@/constants'
import { ensureMpxTailwindcssAliases, injectMpxCssRewritePreRules, isMpx, patchMpxLoaderResolve } from '@/shared/mpx'
import { createLoaderAnchorFinders } from '../shared/loader-anchors'
import { hasLoaderEntry, isCssLikeModuleResource } from './shared'

interface SetupWebpackV4LoadersOptions {
  compiler: Compiler
  options: InternalUserDefinedOptions
  appType?: AppType
  weappTailwindcssPackageDir: string
  shouldRewriteCssImports: boolean
  runtimeLoaderPath?: string
  runtimeCssImportRewriteLoaderPath?: string
  getClassSetInLoader: () => Promise<void>
  debug: (format: string, ...args: unknown[]) => void
}

export function setupWebpackV4Loaders(options: SetupWebpackV4LoadersOptions) {
  const {
    compiler,
    options: compilerOptions,
    appType,
    weappTailwindcssPackageDir,
    shouldRewriteCssImports,
    runtimeLoaderPath,
    runtimeCssImportRewriteLoaderPath,
    getClassSetInLoader,
    debug,
  } = options
  const isMpxApp = isMpx(appType)

  if (shouldRewriteCssImports && isMpxApp) {
    ensureMpxTailwindcssAliases(compiler, weappTailwindcssPackageDir)
  }

  const runtimeClassSetLoader = runtimeLoaderPath
    ?? path.resolve(__dirname, './weapp-tw-runtime-classset-loader.js')
  const runtimeCssImportRewriteLoader = shouldRewriteCssImports
    ? (runtimeCssImportRewriteLoaderPath
      ?? path.resolve(__dirname, './weapp-tw-css-import-rewrite-loader.js'))
    : undefined
  const runtimeClassSetLoaderExists = fs.existsSync(runtimeClassSetLoader)
  const runtimeCssImportRewriteLoaderExists = runtimeCssImportRewriteLoader
    ? fs.existsSync(runtimeCssImportRewriteLoader)
    : false
  const runtimeLoaderRewriteOptions = shouldRewriteCssImports
    ? {
        pkgDir: weappTailwindcssPackageDir,
        appType,
      }
    : undefined
  const classSetLoaderOptions = {
    getClassSet: getClassSetInLoader,
  }
  const { findRewriteAnchor, findClassSetAnchor } = createLoaderAnchorFinders(appType)
  const cssImportRewriteLoaderOptions = runtimeLoaderRewriteOptions
    ? {
        rewriteCssImports: runtimeLoaderRewriteOptions,
      }
    : undefined

  if (runtimeCssImportRewriteLoader && shouldRewriteCssImports && cssImportRewriteLoaderOptions && isMpxApp) {
    injectMpxCssRewritePreRules(compiler, runtimeCssImportRewriteLoader, cssImportRewriteLoaderOptions)
  }

  const createRuntimeClassSetLoaderEntry = () => ({
    loader: runtimeClassSetLoader,
    options: classSetLoaderOptions,
    ident: null,
    type: null,
  })
  const createCssImportRewriteLoaderEntry = () => {
    if (!runtimeCssImportRewriteLoader) {
      return null
    }
    return {
      loader: runtimeCssImportRewriteLoader,
      options: cssImportRewriteLoaderOptions,
      ident: null,
      type: null,
    }
  }

  compiler.hooks.compilation.tap(pluginName, (compilation) => {
    compilation.hooks.normalModuleLoader.tap(pluginName, (_loaderContext, module: any) => {
      const hasRuntimeLoader = runtimeClassSetLoaderExists || runtimeCssImportRewriteLoaderExists
      if (!hasRuntimeLoader) {
        return
      }
      if (shouldRewriteCssImports && isMpx(appType) && typeof _loaderContext.resolve === 'function') {
        patchMpxLoaderResolve(_loaderContext, weappTailwindcssPackageDir, true)
      }
      const loaderEntries: Array<{ loader?: string }> = module.loaders || []
      let rewriteAnchorIdx = findRewriteAnchor(loaderEntries)
      const classSetAnchorIdx = findClassSetAnchor(loaderEntries)

      const isCssModule = isCssLikeModuleResource(module.resource, compilerOptions.cssMatcher, appType)
      if (process.env.WEAPP_TW_LOADER_DEBUG && isCssModule) {
        debug('loader hook css module: %s loaders=%o anchors=%o', module.resource, loaderEntries.map((x: any) => x.loader), { rewriteAnchorIdx, classSetAnchorIdx })
      }
      if (process.env.WEAPP_TW_LOADER_DEBUG && typeof module.resource === 'string' && module.resource.includes('app.css')) {
        debug('app.css module loaders=%o anchors=%o', loaderEntries.map((x: any) => x.loader), { rewriteAnchorIdx, classSetAnchorIdx })
      }
      else if (process.env.WEAPP_TW_LOADER_DEBUG && typeof module.resource === 'string' && module.resource.endsWith('.css')) {
        debug('css module seen: %s loaders=%o anchors=%o', module.resource, loaderEntries.map((x: any) => x.loader), { rewriteAnchorIdx, classSetAnchorIdx })
      }

      if (rewriteAnchorIdx === -1 && classSetAnchorIdx === -1 && !isCssModule) {
        return
      }

      const anchorlessInsert = (entry: any, position: 'before' | 'after') => {
        if (position === 'after') {
          loaderEntries.push(entry)
        }
        else {
          loaderEntries.unshift(entry)
        }
      }

      if (
        runtimeLoaderRewriteOptions
        && runtimeCssImportRewriteLoaderExists
        && cssImportRewriteLoaderOptions
        && runtimeCssImportRewriteLoader
      ) {
        const existingIndex = loaderEntries.findIndex(entry =>
          entry.loader?.includes?.(runtimeCssImportRewriteLoader),
        )
        const rewriteEntry = existingIndex !== -1
          ? loaderEntries.splice(existingIndex, 1)[0]
          : createCssImportRewriteLoaderEntry()
        if (rewriteEntry) {
          const anchorIndex = findRewriteAnchor(loaderEntries)
          if (anchorIndex === -1) {
            anchorlessInsert(rewriteEntry, 'after')
          }
          else {
            loaderEntries.splice(anchorIndex + 1, 0, rewriteEntry)
          }
          rewriteAnchorIdx = findRewriteAnchor(loaderEntries)
        }
      }
      if (runtimeClassSetLoaderExists && !hasLoaderEntry(loaderEntries, runtimeClassSetLoader)) {
        const anchorIndex = findClassSetAnchor(loaderEntries)
        if (anchorIndex === -1) {
          anchorlessInsert(createRuntimeClassSetLoaderEntry(), 'before')
        }
        else {
          const insertIndex = anchorIndex === -1 ? rewriteAnchorIdx : anchorIndex
          loaderEntries.splice(insertIndex, 0, createRuntimeClassSetLoaderEntry())
        }
      }
    })
  })
}
