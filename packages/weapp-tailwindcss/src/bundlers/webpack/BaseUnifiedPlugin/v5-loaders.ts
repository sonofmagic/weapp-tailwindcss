import type { TailwindV4CssSource } from '@tailwindcss-mangle/engine'
import type { Compiler } from 'webpack'
import type { WebpackCssSourceRegistration } from '../loaders/runtime-registry'
import type { TailwindRuntimeState } from '@/tailwindcss/runtime'
import type { AppType, InternalUserDefinedOptions } from '@/types'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pluginName } from '@/constants'
import { ensureMpxTailwindcssAliases, injectMpxCssRewritePreRules, isMpx, patchMpxLoaderResolve } from '@/shared/mpx'
import { deleteWebpackLoaderRuntime, setWebpackLoaderRuntime } from '../loaders/runtime-registry'
import { createLoaderAnchorFinders } from '../shared/loader-anchors'
import { hasLoaderEntry, isCssLikeModuleResource } from './shared'

interface SetupWebpackV5LoadersOptions {
  compiler: Compiler
  options: InternalUserDefinedOptions
  appType?: AppType | undefined
  weappTailwindcssPackageDir: string
  shouldRewriteCssImports: boolean
  runtimeLoaderPath?: string | undefined
  registerAutoCssSource?: ((source: TailwindV4CssSource) => Promise<void> | void) | undefined
  runtimeState: TailwindRuntimeState
  getClassSetInLoader: () => Promise<void>
  getRuntimeSetInLoader: () => Promise<Set<string>>
  markWebpackProcessedCssSource?: ((file: string) => void) | undefined
  registerWebpackCssSourceFile?: ((source: WebpackCssSourceRegistration) => void) | undefined
  getRuntimeWatchDependencies: () => {
    files: ReadonlySet<string>
    contexts: ReadonlySet<string>
  }
  runtimeRegistryKey?: string | undefined
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
    registerAutoCssSource,
    runtimeState,
    getClassSetInLoader,
    getRuntimeSetInLoader,
    markWebpackProcessedCssSource,
    registerWebpackCssSourceFile,
    getRuntimeWatchDependencies,
    runtimeRegistryKey = `weapp-tailwindcss-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    debug,
  } = options
  const isMpxApp = isMpx(appType)

  if (shouldRewriteCssImports && isMpxApp) {
    ensureMpxTailwindcssAliases(compiler, weappTailwindcssPackageDir)
  }

  const runtimeClassSetLoader = runtimeLoaderPath
    ?? path.resolve(__dirname, './weapp-tw-runtime-classset-loader.js')
  const shouldInjectRuntimeClassSetLoader = compilerOptions.generator?.target !== 'web'
  const runtimeCssImportRewriteLoader = shouldRewriteCssImports
    ? path.resolve(__dirname, './weapp-tw-css-import-rewrite-loader.js')
    : undefined
  const runtimeClassSetLoaderExists = fs.existsSync(runtimeClassSetLoader)
  const runtimeCssImportRewriteLoaderExists = runtimeCssImportRewriteLoader
    ? fs.existsSync(runtimeCssImportRewriteLoader)
    : false
  const runtimeLoaderRewriteOptions = shouldRewriteCssImports
    ? {
        pkgDir: weappTailwindcssPackageDir,
        compilerOptions,
        runtimeState,
        ...(appType === undefined ? {} : { appType }),
        ...(registerAutoCssSource === undefined ? {} : { registerCssSource: registerAutoCssSource }),
        getRuntimeSet: getRuntimeSetInLoader,
        ...(markWebpackProcessedCssSource === undefined ? {} : { markGeneratedCssSource: markWebpackProcessedCssSource }),
      }
    : undefined
  const classSetLoaderOptions = {
    getClassSet: getClassSetInLoader,
    getWatchDependencies: getRuntimeWatchDependencies,
    ...(registerWebpackCssSourceFile === undefined ? {} : { registerCssSourceFile: registerWebpackCssSourceFile }),
  }
  setWebpackLoaderRuntime(runtimeRegistryKey, {
    classSet: classSetLoaderOptions,
    ...(runtimeLoaderRewriteOptions === undefined ? {} : { cssImportRewrite: runtimeLoaderRewriteOptions }),
  })
  const cleanupWebpackLoaderRuntime = () => {
    deleteWebpackLoaderRuntime(runtimeRegistryKey)
  }
  compiler.hooks.watchClose?.tap?.(pluginName, cleanupWebpackLoaderRuntime)
  compiler.hooks.shutdown?.tap?.(pluginName, cleanupWebpackLoaderRuntime)
  const { findRewriteAnchor, findClassSetAnchor } = createLoaderAnchorFinders(appType)
  const cssImportRewriteLoaderOptions = runtimeLoaderRewriteOptions
    ? {
        tailwindcssImportRewriteRuntimeKey: runtimeRegistryKey,
      }
    : undefined

  if (runtimeCssImportRewriteLoader && shouldRewriteCssImports && cssImportRewriteLoaderOptions && isMpxApp) {
    // Ensure CSS files enter postcss-import after rewriting.
    injectMpxCssRewritePreRules(compiler, runtimeCssImportRewriteLoader, cssImportRewriteLoaderOptions)
  }

  const createRuntimeClassSetLoaderEntry = () => ({
    loader: runtimeClassSetLoader,
    options: {
      weappTailwindcssRuntimeKey: runtimeRegistryKey,
    },
    ident: null,
    type: null,
  })
  const createCssImportRewriteLoaderEntry = () => {
    if (!runtimeCssImportRewriteLoader || !cssImportRewriteLoaderOptions) {
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
      if (process.env['WEAPP_TW_LOADER_DEBUG'] && isCssModule) {
        debug('loader hook css module: %s loaders=%o anchors=%o', module.resource, loaderEntries.map((x: any) => x.loader), { rewriteAnchorIdx, classSetAnchorIdx })
      }
      if (process.env['WEAPP_TW_LOADER_DEBUG'] && typeof module.resource === 'string' && module.resource.includes('app.css')) {
        debug('app.css module loaders=%o anchors=%o', loaderEntries.map((x: any) => x.loader), { rewriteAnchorIdx, classSetAnchorIdx })
      }
      else if (process.env['WEAPP_TW_LOADER_DEBUG'] && typeof module.resource === 'string' && module.resource.endsWith('.css')) {
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
      if (
        shouldInjectRuntimeClassSetLoader
        && runtimeClassSetLoaderExists
        && !hasLoaderEntry(loaderEntries, runtimeClassSetLoader)
      ) {
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
