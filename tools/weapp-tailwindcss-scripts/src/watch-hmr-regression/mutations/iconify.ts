import type {
  CliOptions,
  IconifyHotUpdateConfig,
  IconifyHotUpdateMetrics,
  IconifyHotUpdatePayload,
  PluginProcessSample,
  WatchCase,
  WatchSession,
} from '../types'
import path from 'node:path'
import process from 'node:process'
import { replaceWxml } from '../../core/replace-wxml'
import { formatPath } from '../cli'
import {
  getMtime,
  readFileIfExists,
  writeFilePreserveEol,
} from '../text'
import {
  collectPluginProcessMetrics,
  expandOutputFileEntries,
  readJoinedOutputFiles,
  waitForClassOutputBaseline,
  waitForCompileSettled,
  waitForOutputFilesUpdatedWithDiagnostics,
} from './shared'

const DEFAULT_ICON_CLASS_TOKENS = [
  'i-[mdi--github-circle]',
  'i-[mdi--star]',
  'i-[svg-spinners--180-ring-with-bg]',
]
const DEFAULT_BEFORE_CONTENT_CLASS = 'before:content-[\'现在，让我们开始神奇的_tailwindcss_开发之旅吧！\']'
const DEFAULT_AFTER_CONTENT_CLASS = 'before:content-[\'现在，让我们继续神奇的_tailwindcss_HMR_回归之旅吧！\']'

interface IconifyOutputs {
  wxml: string
  js: string
  globalStyle: string
}

async function collectOutputMtimes(files: string[]) {
  const resolvedFiles = await expandOutputFileEntries(files)
  const entries = await Promise.all(
    resolvedFiles.map(async file => [file, await getMtime(file)] as const),
  )
  return new Map(entries)
}

async function loadOutputs(watchCase: WatchCase, globalStyleOutputs: string[]): Promise<IconifyOutputs> {
  const [wxml, js, globalStyle] = await Promise.all([
    readFileIfExists(watchCase.outputWxml),
    readFileIfExists(watchCase.outputJs),
    readJoinedOutputFiles(globalStyleOutputs),
  ])
  return {
    wxml: wxml ?? '',
    js: js ?? '',
    globalStyle,
  }
}

function insertDefaultIconifyProbe(source: string, config: IconifyHotUpdateConfig, payload: IconifyHotUpdatePayload) {
  const extension = path.extname(config.sourceFile)
  const classLiteral = payload.classLiteral
  if (extension === '.tsx' || extension === '.jsx') {
    return `${source}\n// ${payload.marker} ${classLiteral}\n`
  }
  if (extension === '.ts' || extension === '.js') {
    return `${source}\nconst __twWatchIconifyHmr = '${payload.marker} ${classLiteral}'\n`
  }
  if (source.includes('</template>')) {
    return source.replace(
      '</template>',
      `  <view class="${classLiteral}">${payload.marker}-iconify</view>\n</template>`,
    )
  }
  return `${source.trimEnd()}\n<view class="${classLiteral}">${payload.marker}-iconify</view>\n`
}

function resolveConfig(config: IconifyHotUpdateConfig) {
  const iconClassTokens = config.iconClassTokens ?? DEFAULT_ICON_CLASS_TOKENS
  const beforeContentClass = config.beforeContentClass ?? DEFAULT_BEFORE_CONTENT_CLASS
  const afterContentClass = config.afterContentClass ?? DEFAULT_AFTER_CONTENT_CLASS
  return {
    iconClassTokens,
    beforeContentClass,
    afterContentClass,
  }
}

function assertIconifyStyleOutput(
  watchCase: WatchCase,
  phase: string,
  outputs: IconifyOutputs,
  params: {
    iconEscapedClasses: string[]
    contentEscapedClass: string
    globalStyleOutputs: string[]
  },
) {
  const preservedIconEscapedClasses = params.iconEscapedClasses.filter(escaped => outputs.globalStyle.includes(escaped))
  if (preservedIconEscapedClasses.length !== params.iconEscapedClasses.length) {
    const missing = params.iconEscapedClasses.filter(escaped => !preservedIconEscapedClasses.includes(escaped))
    throw new Error(
      `[${watchCase.label}] iconify HMR ${phase} missing icon selectors in global style outputs: ${missing.join(', ')}, outputs=${params.globalStyleOutputs.map(formatPath).join(', ')}`,
    )
  }

  const verifiedContentEscapedClasses = outputs.globalStyle.includes(params.contentEscapedClass)
    ? [params.contentEscapedClass]
    : []
  if (verifiedContentEscapedClasses.length === 0) {
    throw new Error(
      `[${watchCase.label}] iconify HMR ${phase} missing content selector in global style outputs: ${params.contentEscapedClass}, outputs=${params.globalStyleOutputs.map(formatPath).join(', ')}`,
    )
  }

  return {
    preservedIconEscapedClasses,
    verifiedContentEscapedClasses,
  }
}

export async function runIconifyHotUpdate(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  config: IconifyHotUpdateConfig,
  sourceOriginal: string,
  globalStyleOutputs: string[],
): Promise<IconifyHotUpdateMetrics> {
  await waitForClassOutputBaseline(watchCase, options, session, 'content', globalStyleOutputs)

  const resolved = resolveConfig(config)
  const marker = `tw-watch-iconify-${watchCase.name}-${Date.now().toString().slice(-6)}`
  const classLiteral = [...resolved.iconClassTokens, resolved.beforeContentClass].join(' ')
  const payload: IconifyHotUpdatePayload = {
    marker,
    classLiteral,
    iconClassTokens: resolved.iconClassTokens,
    beforeContentClass: resolved.beforeContentClass,
    afterContentClass: resolved.afterContentClass,
  }
  const sourceWithProbe = config.mutate
    ? config.mutate(sourceOriginal, payload)
    : insertDefaultIconifyProbe(sourceOriginal, config, payload)
  if (sourceWithProbe === sourceOriginal) {
    throw new Error(`[${watchCase.label}] iconify HMR probe mutation produced no source change`)
  }
  if (!sourceWithProbe.includes(resolved.beforeContentClass)) {
    throw new Error(`[${watchCase.label}] iconify HMR probe source is missing before content class`)
  }
  const sourceWithUpdatedContent = sourceWithProbe.replace(resolved.beforeContentClass, resolved.afterContentClass)
  if (sourceWithUpdatedContent === sourceWithProbe) {
    throw new Error(`[${watchCase.label}] iconify HMR content replacement produced no source change`)
  }

  const iconEscapedClasses = resolved.iconClassTokens.map(token => replaceWxml(token))
  const beforeContentEscapedClass = replaceWxml(resolved.beforeContentClass)
  const afterContentEscapedClass = replaceWxml(resolved.afterContentClass)
  const outputFiles = [watchCase.outputWxml, watchCase.outputJs, ...globalStyleOutputs]

  const baselineOutputMtimes = await collectOutputMtimes(outputFiles)
  const injectStartedAt = Date.now()
  process.stdout.write(
    `[watch-hmr] ${watchCase.label} iconify-hmr phase=inject dirty=${formatPath(config.sourceFile)} icons=${resolved.iconClassTokens.join(' | ')}\n`,
  )
  await writeFilePreserveEol(config.sourceFile, sourceWithProbe, sourceOriginal)
  await waitForOutputFilesUpdatedWithDiagnostics(
    watchCase,
    outputFiles,
    baselineOutputMtimes,
    options,
    session,
    injectStartedAt,
    async () => {
      assertIconifyStyleOutput(watchCase, 'inject', await loadOutputs(watchCase, globalStyleOutputs), {
        iconEscapedClasses,
        contentEscapedClass: beforeContentEscapedClass,
        globalStyleOutputs,
      })
      return true
    },
    {
      label: `iconify-hmr phase=inject source=${formatPath(config.sourceFile)}`,
    },
  )
  await waitForCompileSettled(watchCase, options, session, injectStartedAt)

  const injectedOutputMtimes = await collectOutputMtimes(outputFiles)
  const hotUpdateStartedAt = Date.now()
  let preservedIconEscapedClasses: string[] = []
  let verifiedContentEscapedClasses: string[] = []
  process.stdout.write(
    `[watch-hmr] ${watchCase.label} iconify-hmr phase=content dirty=${formatPath(config.sourceFile)} content=${resolved.afterContentClass}\n`,
  )
  await writeFilePreserveEol(config.sourceFile, sourceWithUpdatedContent, sourceOriginal)
  const hotUpdateOutputDiagnostics = await waitForOutputFilesUpdatedWithDiagnostics(
    watchCase,
    outputFiles,
    injectedOutputMtimes,
    options,
    session,
    hotUpdateStartedAt,
    async () => {
      const result = assertIconifyStyleOutput(watchCase, 'content', await loadOutputs(watchCase, globalStyleOutputs), {
        iconEscapedClasses,
        contentEscapedClass: afterContentEscapedClass,
        globalStyleOutputs,
      })
      preservedIconEscapedClasses = result.preservedIconEscapedClasses
      verifiedContentEscapedClasses = result.verifiedContentEscapedClasses
      return true
    },
    {
      label: `iconify-hmr phase=content source=${formatPath(config.sourceFile)}`,
    },
  )
  await waitForCompileSettled(watchCase, options, session, hotUpdateStartedAt)
  const hotUpdatePluginMetrics = collectPluginProcessMetrics(session, hotUpdateStartedAt)

  const updatedOutputMtimes = await collectOutputMtimes(outputFiles)
  const rollbackStartedAt = Date.now()
  process.stdout.write(
    `[watch-hmr] ${watchCase.label} iconify-hmr phase=rollback dirty=${formatPath(config.sourceFile)}\n`,
  )
  await writeFilePreserveEol(config.sourceFile, sourceOriginal, sourceOriginal)
  const rollbackOutputDiagnostics = await waitForOutputFilesUpdatedWithDiagnostics(
    watchCase,
    outputFiles,
    updatedOutputMtimes,
    options,
    session,
    rollbackStartedAt,
    async () => {
      const outputs = await loadOutputs(watchCase, globalStyleOutputs)
      return !outputs.wxml.includes(marker) && !outputs.js.includes(marker)
    },
    {
      label: `iconify-hmr phase=rollback source=${formatPath(config.sourceFile)}`,
    },
  )
  await waitForCompileSettled(watchCase, options, session, rollbackStartedAt)
  const rollbackPluginMetrics = collectPluginProcessMetrics(session, rollbackStartedAt)

  return {
    sourceFile: config.sourceFile,
    marker,
    beforeContentClass: resolved.beforeContentClass,
    afterContentClass: resolved.afterContentClass,
    iconClassTokens: resolved.iconClassTokens,
    contentClassTokens: [resolved.beforeContentClass, resolved.afterContentClass],
    preservedIconEscapedClasses,
    verifiedContentEscapedClasses,
    globalStyleOutputs,
    hotUpdateOutputMs: hotUpdateOutputDiagnostics.elapsedMs,
    hotUpdateEffectiveMs: hotUpdateOutputDiagnostics.elapsedMs,
    hotUpdateOutputDiagnostics,
    hotUpdatePluginProcessMs: hotUpdatePluginMetrics.totalMs,
    hotUpdatePluginProcessSamples: hotUpdatePluginMetrics.samples as PluginProcessSample[],
    rollbackOutputMs: rollbackOutputDiagnostics.elapsedMs,
    rollbackEffectiveMs: rollbackOutputDiagnostics.elapsedMs,
    rollbackOutputDiagnostics,
    rollbackPluginProcessMs: rollbackPluginMetrics.totalMs,
    rollbackPluginProcessSamples: rollbackPluginMetrics.samples as PluginProcessSample[],
  }
}
