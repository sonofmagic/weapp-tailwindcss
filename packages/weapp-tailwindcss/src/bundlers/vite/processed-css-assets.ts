import type { OutputAsset, OutputBundle } from 'rollup'
import type { InternalUserDefinedOptions } from '@/types'
import { stripBundlerGeneratedCssMarkers } from '../shared/generated-css-marker'
import { mergeMarkedUserLayerComponentsCss } from '../shared/generator-css/user-layer-order'
import { normalizeOutputPathKey } from '../shared/module-graph'

interface CssAssetMarkerMatcher {
  (asset: OutputAsset, file?: string): boolean
}

interface CssAssetProcessedMarker {
  (asset: OutputAsset, file?: string): void
}

interface CssAssetResultRecorder {
  (file: string, css: string): void
}

interface CssAssetResultsGetter {
  (): Iterable<[string, string]>
}

interface CollectViteProcessedCssAssetOptions {
  isViteProcessedCssAsset?: CssAssetMarkerMatcher | undefined
  markCssAssetProcessed?: CssAssetProcessedMarker | undefined
  recordCssAssetResult?: CssAssetResultRecorder | undefined
  recordViteProcessedCssAssetResult?: CssAssetResultRecorder | undefined
  debug?: ((format: string, ...args: unknown[]) => void) | undefined
}

interface InjectViteProcessedCssAssetOptions {
  opts: InternalUserDefinedOptions
  getViteProcessedCssAssetResults?: CssAssetResultsGetter | undefined
  markCssAssetProcessed?: CssAssetProcessedMarker | undefined
  recordCssAssetResult?: CssAssetResultRecorder | undefined
  debug?: ((format: string, ...args: unknown[]) => void) | undefined
  onUpdate?: ((file: string, original: string, generated: string) => void) | undefined
}

const CSS_OUTPUT_FILE_RE = /\.(?:css|wxss|acss|ttss|qss|jxss|tyss)(?:$|[?#])/i

function isCssOutputFile(file: string) {
  return CSS_OUTPUT_FILE_RE.test(file)
}

function getAssetFile(bundleFile: string, asset: OutputAsset) {
  return asset.fileName || bundleFile
}

function readAssetSource(asset: OutputAsset) {
  return typeof asset.source === 'string'
    ? asset.source
    : asset.source.toString()
}

function appendCss(baseCss: string, css: string) {
  if (baseCss.length === 0) {
    return css
  }
  if (css.length === 0) {
    return baseCss
  }
  return `${baseCss}\n${css}`
}

export function collectViteProcessedCssAssetResults(
  bundle: OutputBundle,
  options: CollectViteProcessedCssAssetOptions,
) {
  let collected = 0
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (!isCssOutputFile(file) || !options.isViteProcessedCssAsset?.(output, file)) {
      continue
    }
    const rawSource = readAssetSource(output)
    const nextCss = stripBundlerGeneratedCssMarkers(rawSource)
    if (nextCss !== rawSource) {
      output.source = nextCss
    }
    options.markCssAssetProcessed?.(output, file)
    options.recordCssAssetResult?.(file, nextCss)
    options.recordViteProcessedCssAssetResult?.(file, nextCss)
    options.debug?.('collect vite-processed css asset: %s bytes=%d', file, nextCss.length)
    collected++
  }
  return collected
}

export function injectViteProcessedCssIntoMainCssAssets(
  bundle: OutputBundle,
  options: InjectViteProcessedCssAssetOptions,
) {
  const viteCssResults = [...(options.getViteProcessedCssAssetResults?.() ?? [])]
    .filter(([, css]) => css.length > 0)
  if (viteCssResults.length === 0) {
    return 0
  }

  let injected = 0
  for (const [bundleFile, output] of Object.entries(bundle)) {
    if (output.type !== 'asset') {
      continue
    }
    const file = getAssetFile(bundleFile, output)
    if (
      !options.opts.cssMatcher(file)
      || !options.opts.mainCssChunkMatcher(file, options.opts.appType)
    ) {
      continue
    }
    const mainFileKey = normalizeOutputPathKey(file)
    const originalSource = readAssetSource(output)
    let nextCss = originalSource
    for (const [sourceFile, sourceCss] of viteCssResults) {
      const sourceFileKey = normalizeOutputPathKey(sourceFile)
      if (
        sourceFileKey === mainFileKey
        || options.opts.mainCssChunkMatcher(sourceFile, options.opts.appType)
      ) {
        continue
      }
      const css = stripBundlerGeneratedCssMarkers(sourceCss).trim()
      if (css.length === 0) {
        continue
      }
      const mergedLayerCss = mergeMarkedUserLayerComponentsCss(nextCss, css)
      if (mergedLayerCss.merged) {
        nextCss = mergedLayerCss.css
        continue
      }
      if (nextCss.includes(css)) {
        continue
      }
      nextCss = appendCss(nextCss, css)
    }
    if (nextCss === originalSource) {
      continue
    }
    output.source = nextCss
    options.markCssAssetProcessed?.(output, file)
    options.recordCssAssetResult?.(file, nextCss)
    options.onUpdate?.(file, originalSource, nextCss)
    options.debug?.('inject vite-processed css into main css asset: %s bytes=%d', file, nextCss.length)
    injected++
  }
  return injected
}
