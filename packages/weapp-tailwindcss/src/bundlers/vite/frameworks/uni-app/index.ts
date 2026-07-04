import type { ViteFrameworkCssPipelineContext, ViteFrameworkCssPipelineStrategy } from '../../shared/framework-strategy'
import type { InternalUserDefinedOptions, UserDefinedOptions } from '@/types'
import path from 'node:path'
import { transformWebCssCompat, transformWebCssSafeSelectors } from '@weapp-tailwindcss/postcss'
import { viteStyleInjectorDelegates } from '@/style-injector/internal'
import { createViteFrameworkPlugins } from '../../shared/create-framework-plugins'

function isUniAppWebviewStylePlatform(platform: string | undefined) {
  return platform === 'app' || platform === 'app-plus'
}

function isUniAppH5StylePlatform(platform: string | undefined) {
  const normalized = platform?.trim().toLowerCase()
  return normalized === 'h5' || normalized?.startsWith('web') === true
}

function isUniAppSafeSelectorStyleTarget(context: ViteFrameworkCssPipelineContext) {
  return isUniAppH5StylePlatform(context.resolveStylePlatform())
    || isUniAppWebviewStylePlatform(context.resolveStylePlatform())
}

function isUniAppWebviewAppBundle(bundleFiles: string[]) {
  return bundleFiles.some(file => path.basename(file.replace(/[?#].*$/, '')) === 'app-service.js')
}

function isUniAppWebviewOutDir(outDir: string | undefined) {
  const normalized = outDir ? path.basename(path.normalize(outDir)).trim().toLowerCase() : undefined
  return normalized === 'app' || normalized === 'app-plus'
}

const uniAppCssPipelineStrategy: ViteFrameworkCssPipelineStrategy = {
  getServeJsHandlerOptions(context) {
    return isUniAppSafeSelectorStyleTarget(context)
      ? { needEscaped: true }
      : undefined
  },
  shouldApplyWebCssCompat(context) {
    return isUniAppSafeSelectorStyleTarget(context)
  },
  includeTailwindGeneratedCssAssetsInRootCoverage(context) {
    return context.isWebGeneratorTarget && isUniAppWebviewAppBundle(context.bundleFiles)
  },
  resolveConfiguredCssEntryRootInjectionTarget(context) {
    if (context.isMiniProgramStyleOutputFile(context.outputFile) || !context.isConfiguredCssEntryFile(context.sourceFile)) {
      return
    }
    const rootCssFiles: string[] = []
    const matchedRootCssFiles: string[] = []
    for (const [bundleFile, output] of Object.entries(context.bundle)) {
      if (output.type !== 'asset') {
        continue
      }
      const file = output.fileName || bundleFile
      if (
        !context.opts.cssMatcher(file)
        || !context.isRootStyleOutputFile(file)
        || context.isMiniProgramStyleOutputFile(file)
      ) {
        continue
      }
      rootCssFiles.push(file)
      if (context.opts.mainCssChunkMatcher(file, context.opts.appType)) {
        matchedRootCssFiles.push(file)
      }
    }
    if (matchedRootCssFiles.length === 1) {
      return matchedRootCssFiles[0]
    }
    if (matchedRootCssFiles.length > 1) {
      return
    }
    return rootCssFiles.length === 1 ? rootCssFiles[0] : undefined
  },
  shouldApplyFinalWebviewCssCompat(context) {
    return isUniAppWebviewAppBundle(context.bundleFiles)
      || isUniAppWebviewOutDir(context.outDir)
  },
  shouldKeepRootMiniProgramStyleAsImportShell() {
    return true
  },
  shouldPreferExplicitWebCssTargets() {
    return true
  },
  shouldPreferMatchedRootWebOutputTarget() {
    return true
  },
  shouldRemoveDuplicateUnlinkedRootCssAssetsReferencedByHtml(context) {
    return context.isWebGeneratorTarget && isUniAppWebviewAppBundle(context.bundleFiles)
  },
  shouldSelectConfiguredCssEntryRootSource(context) {
    return context.currentGeneratorBranch.isWeb
      && context.opts.cssMatcher(context.outputFile)
      && context.isRootStyleOutputFile(context.outputFile)
  },
  shouldTransformServeJs(context) {
    return !context.currentGeneratorBranch.isWeb
      || isUniAppSafeSelectorStyleTarget(context)
  },
  transformGeneratedCss(css, context) {
    const webCss = context.shouldApplyWebCssCompat
      ? transformWebCssCompat(
          css,
          context.currentGeneratorBranch.isWeb
            ? context.currentGeneratorOptions.webCompat
            : context.currentGeneratorOptions.webCompat ?? true,
        )
      : css
    const safeCss = isUniAppSafeSelectorStyleTarget(context)
      ? transformWebCssSafeSelectors(webCss, { escapeMap: context.opts.escapeMap })
      : webCss
    return context.removeScopedPreflight(safeCss)
  },
}

export function createUniAppVitePlugins(options: UserDefinedOptions | InternalUserDefinedOptions = {}) {
  return createViteFrameworkPlugins(options, {
    frameworkName: 'uni-app',
    cssPipelineStrategy: uniAppCssPipelineStrategy,
    styleInjectorDelegate: viteStyleInjectorDelegates.uniApp,
  })
}
