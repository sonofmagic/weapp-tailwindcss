import type { Compiler } from 'webpack'
import type { AppType, InternalUserDefinedOptions } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pluginName } from '@/constants'
import { ensureMpxTailwindcssAliases, injectMpxCssRewritePreRules, isMpx, patchMpxLoaderResolve } from '@/shared/mpx'
import { createLoaderAnchorFinders } from '../shared/loader-anchors'
import { hasLoaderEntry, isCssLikeModuleResource } from './shared'

interface SetupWebpackV5LoadersOptions {
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

export function setupWebpackV5Loaders(options: SetupWebpackV5LoadersOptions) {
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
    // Ensure CSS files enter postcss-import after rewriting.
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

  const { NormalModule } = compiler.webpack

  compiler.hooks.compilation.tap(pluginName, (compilation) => {
    NormalModule.getCompilationHooks(compilation).loader.tap(pluginName, (_loaderContext, module) => {
      const hasRuntimeLoader = runtimeClassSetLoaderExists || runtimeCssImportRewriteLoaderExists
      if (!hasRuntimeLoader) {
        return
      }
      patchMpxLoaderResolve(_loaderContext, weappTailwindcssPackageDir, shouldRewriteCssImports && isMpxApp)
      const loaderEntries = module.loaders || []
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
        cssImportRewriteLoaderOptions
        && runtimeCssImportRewriteLoaderExists
        && runtimeCssImportRewriteLoader
      ) {
        const existingIndex = loaderEntries.findIndex(entry => entry.loader?.includes?.(runtimeCssImportRewriteLoader))
        const rewriteLoaderEntry = existingIndex !== -1
          ? loaderEntries.splice(existingIndex, 1)[0]
          : createCssImportRewriteLoaderEntry()
        if (rewriteLoaderEntry) {
          // Keep rewrite loader just after the anchor (executes before it).
          const anchorIndex = findRewriteAnchor(loaderEntries)
          if (anchorIndex === -1) {
            anchorlessInsert(rewriteLoaderEntry, 'after')
          }
          else {
            loaderEntries.splice(anchorIndex + 1, 0, rewriteLoaderEntry)
          }
          rewriteAnchorIdx = findRewriteAnchor(loaderEntries)
        }
      }
      if (runtimeClassSetLoaderExists && !hasLoaderEntry(loaderEntries, runtimeClassSetLoader)) {
        const classSetLoaderEntry = createRuntimeClassSetLoaderEntry()
        const anchorIndex = findClassSetAnchor(loaderEntries)
        if (anchorIndex === -1) {
          anchorlessInsert(classSetLoaderEntry, 'before')
        }
        else {
          const insertIndex = anchorIndex === -1 ? rewriteAnchorIdx : anchorIndex
          loaderEntries.splice(insertIndex, 0, classSetLoaderEntry)
        }
      }
    })
  })
}
