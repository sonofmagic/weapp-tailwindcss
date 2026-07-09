import type { ViteFrameworkCssPipelineContext, ViteFrameworkCssPipelineStrategy } from './shared/framework-strategy'
import { isPureLocalCssImportWrapper } from '../shared/generator-css/local-imports'
import { normalizeMiniProgramImportShell } from '../shared/generator-css/output-import-shell'
import { isRootMiniProgramStyleOutputFile, shouldKeepRootMiniProgramStyleAsImportShell } from './generate-bundle/root-style-output'

export function resolveViteServeRootMiniProgramImportShell(options: {
  css: string
  cssPipelineContext: ViteFrameworkCssPipelineContext
  cssPipelineStrategy?: ViteFrameworkCssPipelineStrategy | undefined
  isWebGeneratorTarget: boolean
  outputFile: string
}) {
  const {
    css,
    cssPipelineContext,
    cssPipelineStrategy,
    isWebGeneratorTarget,
    outputFile,
  } = options
  if (
    isWebGeneratorTarget
    || !isRootMiniProgramStyleOutputFile(outputFile)
    || !isPureLocalCssImportWrapper(css)
  ) {
    return undefined
  }
  const shouldPreserve = shouldKeepRootMiniProgramStyleAsImportShell(
    cssPipelineStrategy?.shouldKeepRootMiniProgramStyleAsImportShell?.({
      ...cssPipelineContext,
      css,
      file: outputFile,
    }),
  )
  return shouldPreserve
    ? normalizeMiniProgramImportShell(css)
    : undefined
}
