import type { OutputAsset, OutputBundle } from 'rollup'
import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { normalizeOutputPathKey } from '@/bundlers/shared/module-graph'
import { AssetEmissionPlan } from '@/compiler'
import { parseImportRequest } from '../../shared/generator-css/directives'
import { isPureLocalCssImportWrapper } from '../../shared/generator-css/local-imports'
import { applyViteAssetEmissionPlan } from './asset-emission-plan'

export function isRootMiniProgramStyleOutputFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  return !normalized.includes('/')
    && /\.(?:wxss|acss|ttss|qss|jxss|tyss)$/i.test(normalized)
}

export function createRelativeCssImportRequest(targetFile: string, importedFile: string) {
  const normalizedTargetFile = normalizeOutputPathKey(targetFile.replace(/[?#].*$/, ''))
  const normalizedImportedFile = normalizeOutputPathKey(importedFile.replace(/[?#].*$/, ''))
  const targetDir = path.posix.dirname(normalizedTargetFile)
  const baseDir = targetDir === '.' ? '' : targetDir
  const relative = path.posix.relative(baseDir, normalizedImportedFile)
  return relative.startsWith('.') ? relative : `./${relative}`
}

export function createCssImportShell(targetFile: string, importedFile: string) {
  return `@import "${createRelativeCssImportRequest(targetFile, importedFile)}";\n`
}

export function resolveSingleCssImportOutputFile(targetFile: string, css: string) {
  let importedFile: string | undefined
  try {
    const root = postcss.parse(css)
    root.walkAtRules('import', (atRule) => {
      if (importedFile !== undefined) {
        return
      }
      const request = parseImportRequest(atRule.params)
      if (!request || /^(?:https?:)?\/\//i.test(request) || request.startsWith('data:')) {
        return
      }
      const cleanRequest = request.replace(/[?#].*$/, '')
      if (!/\.(?:css|wxss|acss|ttss|qss|jxss|tyss)$/i.test(cleanRequest)) {
        return
      }
      const targetDir = path.posix.dirname(normalizeOutputPathKey(targetFile))
      importedFile = normalizeOutputPathKey(path.posix.join(targetDir === '.' ? '' : targetDir, cleanRequest))
    })
  }
  catch {
  }
  return importedFile
}

export function createRootMiniProgramOriginStyleOutputFile(file: string) {
  const normalized = normalizeOutputPathKey(file.replace(/[?#].*$/, ''))
  if (/(?:^|\/)[^/]+-origin\.[^.]+$/i.test(normalized)) {
    return normalized
  }
  return normalized.replace(/(\.[^.]+)$/, '-origin$1')
}

export function shouldKeepRootMiniProgramStyleAsImportShell(enabled: boolean | undefined) {
  return enabled === true
}

export function shouldPreserveFrameworkRootMiniProgramImportShell(options: {
  css: string
  file: string
  isWebGeneratorTarget: boolean
  matchesCss: boolean
  shouldKeep: () => boolean | undefined
}) {
  return !options.isWebGeneratorTarget
    && options.matchesCss
    && isRootMiniProgramStyleOutputFile(options.file)
    && isPureLocalCssImportWrapper(options.css)
    && shouldKeepRootMiniProgramStyleAsImportShell(options.shouldKeep())
}

export function restoreFrameworkRootMiniProgramImportShellAssets(
  bundle: OutputBundle,
  options: {
    debug?: ((format: string, ...args: unknown[]) => void) | undefined
    isWebGeneratorTarget: boolean
    matchesCss: (file: string) => boolean
    onUpdate?: ((file: string, oldVal: string, newVal: string) => void) | undefined
    recordCssAssetResult?: ((file: string, css: string) => void) | undefined
    shouldKeep: (file: string, css: string) => boolean | undefined
    targetByFile: ReadonlyMap<string, string>
  },
) {
  if (options.isWebGeneratorTarget || options.targetByFile.size === 0) {
    return 0
  }
  const plan = new AssetEmissionPlan()
  const writeTargets = new Map<string, OutputAsset>()
  let restored = 0
  for (const [sourceFile, targetFile] of options.targetByFile) {
    if (
      !options.matchesCss(sourceFile)
      || !options.matchesCss(targetFile)
      || !isRootMiniProgramStyleOutputFile(sourceFile)
      || !isRootMiniProgramStyleOutputFile(targetFile)
      || normalizeOutputPathKey(sourceFile) === normalizeOutputPathKey(targetFile)
    ) {
      continue
    }
    const output = Object.entries(bundle).find(([bundleFile, candidate]) =>
      candidate.type === 'asset'
      && normalizeOutputPathKey(candidate.fileName || bundleFile) === normalizeOutputPathKey(sourceFile),
    )?.[1]
    if (output?.type !== 'asset') {
      continue
    }
    const rawSource = output.source.toString()
    if (!shouldKeepRootMiniProgramStyleAsImportShell(options.shouldKeep(sourceFile, rawSource))) {
      continue
    }
    const nextSource = createCssImportShell(sourceFile, targetFile)
    if (rawSource === nextSource) {
      continue
    }
    plan.write(sourceFile, nextSource)
    writeTargets.set(sourceFile, output)
    options.recordCssAssetResult?.(sourceFile, nextSource)
    options.onUpdate?.(sourceFile, rawSource, nextSource)
    options.debug?.('restore framework root css import shell: %s -> %s', sourceFile, targetFile)
    restored++
  }
  applyViteAssetEmissionPlan(plan, {
    bundle,
    writeTargets,
  })
  return restored
}

export function shouldMoveRootMiniProgramStyleToImportShellOrigin(enabled: boolean | undefined) {
  return enabled === true
}
