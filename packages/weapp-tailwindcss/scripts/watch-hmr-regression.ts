import type { Buffer } from 'node:buffer'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { spawn } from 'node:child_process'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { replaceWxml } from '../src/wxml/shared'

interface CliOptions {
  caseName: 'taro' | 'uni' | 'both'
  timeoutMs: number
  pollMs: number
  skipBuild: boolean
  quietSass: boolean
  reportFile?: string
  maxHotUpdateMs?: number
}

interface MutationPayload {
  marker: string
  classLiteral: string
  classVariableName: string
}

interface MutationScenario extends MutationPayload {
  classTokens: string[]
  escapedClasses: string[]
  mutatedSource: string
}

interface WatchCase {
  name: 'taro' | 'uni'
  label: string
  cwd: string
  devScript: string
  sourceFile: string
  outputWxml: string
  outputJs: string
  verifyEscapedIn: Array<'wxml' | 'js'>
  mutate: (source: string, payload: MutationPayload) => string
}

interface WatchSession {
  child: ChildProcessWithoutNullStreams
  ensureRunning: () => void
  logs: () => string
  stop: () => Promise<void>
}

interface OutputMtime {
  wxml: number
  js: number
}

interface WatchCaseMetrics {
  name: WatchCase['name']
  label: string
  marker: string
  classLiteral: string
  classTokens: string[]
  escapedClasses: string[]
  verifyEscapedIn: Array<'wxml' | 'js'>
  initialReadyMs: number
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  totalMs: number
}

interface WatchSummary {
  count: number
  hotUpdateAvgMs: number
  hotUpdateMaxMs: number
  hotUpdateMinMs: number
  rollbackAvgMs: number
  rollbackMaxMs: number
  rollbackMinMs: number
}

interface WatchReport {
  generatedAt: string
  repositoryRoot: string
  options: {
    caseName: CliOptions['caseName']
    timeoutMs: number
    pollMs: number
    skipBuild: boolean
    quietSass: boolean
    maxHotUpdateMs?: number
  }
  summary: WatchSummary
  cases: WatchCaseMetrics[]
}

function parseArg(flag: string, argv: string[]) {
  const index = argv.indexOf(flag)
  if (index === -1) {
    return undefined
  }
  return argv[index + 1]
}

function parseNumber(value: string | undefined, fallback: number) {
  if (value == null) {
    return fallback
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function parseOptionalNumber(value: string | undefined) {
  if (value == null) {
    return undefined
  }
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : undefined
}

function parseBooleanFlag(flag: string, argv: string[]) {
  if (argv.includes(flag)) {
    return true
  }
  const envKey = `WEAPP_TW_WATCH_${flag.replaceAll('--', '').replaceAll('-', '_').toUpperCase()}`
  return process.env[envKey] === '1'
}

function resolveOptions(): CliOptions {
  const argv = process.argv.slice(2)
  return {
    caseName: (parseArg('--case', argv) ?? 'both') as CliOptions['caseName'],
    timeoutMs: parseNumber(parseArg('--timeout', argv), 180000),
    pollMs: parseNumber(parseArg('--poll', argv), 240),
    skipBuild: parseBooleanFlag('--skip-build', argv),
    quietSass: parseBooleanFlag('--quiet-sass', argv),
    reportFile: parseArg('--report', argv),
    maxHotUpdateMs: parseOptionalNumber(parseArg('--max-hot-update-ms', argv)),
  }
}

function resolvePnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
}

function formatPath(file: string) {
  return file.replace(/\\/g, '/')
}

function findWorkspaceRoot(start: string) {
  let cursor = path.resolve(start)
  while (true) {
    if (existsSync(path.join(cursor, 'pnpm-workspace.yaml'))) {
      return cursor
    }
    const parent = path.dirname(cursor)
    if (parent === cursor) {
      return path.resolve(start)
    }
    cursor = parent
  }
}

function resolveBaseCwd() {
  const start = process.env.INIT_CWD
    ? path.resolve(process.env.INIT_CWD)
    : process.cwd()
  return findWorkspaceRoot(start)
}

async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

const sassDeprecationLinePatterns = [
  /^DEPRECATION WARNING \[/,
  /More info: https:\/\/sass\.lang\.com\/d\//,
  /More info and automated migrator: https:\/\/sass\.lang\.com\/d\//,
  /^WARNING: \d+ repetitive deprecation warnings omitted\.$/,
  /^\s*[│╷╵^]/,
  /^\s*\d+\s*│/,
  /^\s*stdin\s+\d+:\d+\s+root stylesheet$/,
  /^\s*src\/\S+\s+\d+:\d+\s+@import$/,
] as const

function isSassDeprecationNoiseLine(line: string) {
  const normalized = line.replace(/\u200B/g, '')

  if (normalized.includes('sass-lang.com/d/')) {
    return true
  }

  if (normalized.includes('@import') && normalized.includes('│')) {
    return true
  }

  for (const pattern of sassDeprecationLinePatterns) {
    if (pattern.test(normalized)) {
      return true
    }
  }
  return false
}

function createLineCollector(
  prefix: string,
  lines: string[],
  limit = 240,
  options: { quietSass?: boolean } = {},
) {
  const quietSass = options.quietSass === true
  return (chunk: Buffer | string) => {
    const text = chunk.toString()
    for (const line of text.split(/\r?\n/)) {
      if (!line) {
        continue
      }

      if (quietSass && isSassDeprecationNoiseLine(line)) {
        continue
      }

      lines.push(line)
      if (lines.length > limit) {
        lines.shift()
      }
      process.stdout.write(`[${prefix}] ${line}\n`)
    }
  }
}

async function runCommand(cwd: string, args: string[], label: string) {
  const lines: string[] = []
  const child = spawn(resolvePnpmCommand(), args, {
    cwd,
    env: process.env,
    stdio: 'pipe',
  })

  const collect = createLineCollector(label, lines)
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  const exitCode = await new Promise<number>((resolve) => {
    child.on('close', (code) => {
      resolve(code ?? 1)
    })
  })

  if (exitCode !== 0) {
    throw new Error(`[${label}] command failed with code ${exitCode}\n${lines.join('\n')}`)
  }
}

async function ensureLocalPackageBuild(baseCwd: string) {
  const packageRoot = path.resolve(baseCwd, 'packages/weapp-tailwindcss')
  process.stdout.write('[watch-hmr] prepare local package build\n')
  await runCommand(packageRoot, ['run', 'build'], 'build')
}

function createWatchSession(cwd: string, devScript: string, options: Pick<CliOptions, 'quietSass'>): WatchSession {
  const lines: string[] = []
  const child = spawn(resolvePnpmCommand(), ['run', devScript], {
    cwd,
    env: {
      ...process.env,
      WEAPP_TW_WATCH_REGRESSION: '1',
    },
    stdio: 'pipe',
  })

  let collecting = true
  const rawCollect = createLineCollector('watch', lines, 240, {
    quietSass: options.quietSass,
  })
  const collect = (chunk: Buffer | string) => {
    if (!collecting) {
      return
    }
    rawCollect(chunk)
  }

  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  const ensureRunning = () => {
    if (child.exitCode != null) {
      throw new Error(`watch process exited unexpectedly with code ${child.exitCode}`)
    }
  }

  const stop = async () => {
    if (child.exitCode != null) {
      return
    }

    collecting = false
    child.stdout.off('data', collect)
    child.stderr.off('data', collect)

    child.kill('SIGINT')

    let startedAt = Date.now()
    while (child.exitCode == null && Date.now() - startedAt < 3000) {
      await sleep(100)
    }

    if (child.exitCode != null) {
      return
    }

    child.kill('SIGTERM')

    startedAt = Date.now()
    while (child.exitCode == null && Date.now() - startedAt < 2000) {
      await sleep(100)
    }

    if (child.exitCode == null) {
      child.kill('SIGKILL')
    }
  }

  return {
    child,
    ensureRunning,
    logs: () => lines.join('\n'),
    stop,
  }
}

async function readFileIfExists(file: string) {
  try {
    return await fs.readFile(file, 'utf8')
  }
  catch {
    return undefined
  }
}

async function getMtime(file: string) {
  try {
    const stats = await fs.stat(file)
    return stats.mtimeMs
  }
  catch {
    return 0
  }
}

async function waitFor(
  predicate: () => Promise<boolean> | boolean,
  options: {
    timeoutMs: number
    pollMs: number
    message: string
    onTick?: () => void
  },
  startedAt = Date.now(),
) {
  while (Date.now() - startedAt <= options.timeoutMs) {
    if (await predicate()) {
      return Date.now() - startedAt
    }
    options.onTick?.()
    await sleep(options.pollMs)
  }
  throw new Error(options.message)
}

function assertContains(source: string, expected: string, hint: string) {
  if (!source.includes(expected)) {
    throw new Error(`${hint}: expected to contain ${expected}`)
  }
}

function assertNotContains(source: string, unexpected: string, hint: string) {
  if (source.includes(unexpected)) {
    throw new Error(`${hint}: expected to not contain ${unexpected}`)
  }
}

function insertBeforeClosingTag(source: string, closingTag: string, snippet: string) {
  const index = source.lastIndexOf(closingTag)
  if (index === -1) {
    throw new Error(`closing tag ${closingTag} not found`)
  }
  return `${source.slice(0, index)}\n${snippet}\n${source.slice(index)}`
}

function buildCases(baseCwd: string): WatchCase[] {
  const taroCase: WatchCase = {
    name: 'taro',
    label: 'demo/taro-app',
    cwd: path.resolve(baseCwd, 'demo/taro-app'),
    devScript: 'dev:weapp',
    sourceFile: path.resolve(baseCwd, 'demo/taro-app/src/pages/index/index.tsx'),
    outputWxml: path.resolve(baseCwd, 'demo/taro-app/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-app/dist/pages/index/index.js'),
    verifyEscapedIn: ['js'],
    mutate(source, payload) {
      const varAnchor = '  const [flag] = useState(true)'
      if (!source.includes(varAnchor)) {
        throw new Error('taro source anchor not found')
      }
      const withVar = source.replace(
        varAnchor,
        `${varAnchor}\n  const ${payload.classVariableName} = '${payload.classLiteral}'`,
      )
      const snippet = [
        `      <View className='${payload.classLiteral}'>${payload.marker}-static</View>`,
        `      <View className={${payload.classVariableName}}>${payload.marker}-dynamic</View>`,
      ].join('\n')
      return insertBeforeClosingTag(withVar, '    </>', snippet)
    },
  }

  const uniCase: WatchCase = {
    name: 'uni',
    label: 'demo/uni-app',
    cwd: path.resolve(baseCwd, 'demo/uni-app'),
    devScript: 'dev:mp-weixin',
    sourceFile: path.resolve(baseCwd, 'demo/uni-app/src/pages/index/index.vue'),
    outputWxml: path.resolve(baseCwd, 'demo/uni-app/dist/dev/mp-weixin/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/uni-app/dist/dev/mp-weixin/pages/index/index.js'),
    verifyEscapedIn: ['wxml', 'js'],
    mutate(source, payload) {
      const dataAnchor = '      className: \'bg-[#123456]\','
      if (!source.includes(dataAnchor)) {
        throw new Error('uni source data anchor not found')
      }
      const withData = source.replace(
        dataAnchor,
        `${dataAnchor}\n      ${payload.classVariableName}: '${payload.classLiteral}',`,
      )
      const snippet = [
        `    <view class="${payload.classLiteral}">${payload.marker}-static</view>`,
        `    <view :class="${payload.classVariableName}">${payload.marker}-dynamic</view>`,
      ].join('\n')
      return insertBeforeClosingTag(withData, '\n  </view>\n</template>', snippet)
    },
  }

  return [taroCase, uniCase]
}

function pickCases(allCases: WatchCase[], caseName: CliOptions['caseName']) {
  if (caseName === 'both') {
    return allCases
  }
  return allCases.filter(item => item.name === caseName)
}

async function waitForOutputsReady(watchCase: WatchCase, options: CliOptions, session: WatchSession) {
  return waitFor(
    async () => {
      const [wxml, js] = await Promise.all([
        readFileIfExists(watchCase.outputWxml),
        readFileIfExists(watchCase.outputJs),
      ])
      return Boolean(wxml && js)
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] initial outputs were not generated in time`,
      onTick: session.ensureRunning,
    },
  )
}

async function waitForOutputsUpdated(
  watchCase: WatchCase,
  baseline: OutputMtime,
  options: CliOptions,
  session: WatchSession,
  startedAt = Date.now(),
) {
  return waitFor(
    async () => {
      const [wxmlMtime, jsMtime] = await Promise.all([
        getMtime(watchCase.outputWxml),
        getMtime(watchCase.outputJs),
      ])
      return wxmlMtime > baseline.wxml || jsMtime > baseline.js
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] outputs were not updated after source change`,
      onTick: session.ensureRunning,
    },
    startedAt,
  )
}

async function waitForMarkerState(
  watchCase: WatchCase,
  marker: string,
  expected: 'present' | 'absent',
  options: CliOptions,
  session: WatchSession,
  startedAt = Date.now(),
) {
  return waitFor(
    async () => {
      const [wxml, js] = await Promise.all([
        readFileIfExists(watchCase.outputWxml),
        readFileIfExists(watchCase.outputJs),
      ])
      if (!wxml || !js) {
        return false
      }
      const hasMarker = wxml.includes(marker) || js.includes(marker)
      return expected === 'present' ? hasMarker : !hasMarker
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: expected === 'present'
        ? `[${watchCase.label}] marker was not propagated to outputs`
        : `[${watchCase.label}] marker was not removed from outputs`,
      onTick: session.ensureRunning,
    },
    startedAt,
  )
}

function buildComplexClassTokens(seed: string) {
  const opacitySeed = seed.slice(0, 2)
  const decimalSeed = seed.slice(-1)

  return [
    `text-[23.${seed}px]`,
    'space-y-2.5',
    `w-[calc(100%_-_${seed}px)]`,
    `grid-cols-[200rpx_minmax(900rpx,_1fr)_${seed}px]`,
    `after:ml-[0.${seed}px]`,
    `text-black/[0.${opacitySeed}]`,
    `ring-[1.${decimalSeed}px]`,
  ]
}

function createMutationScenario(
  watchCase: WatchCase,
  original: string,
  baselineWxml: string,
  baselineJs: string,
  classVariableName: string,
): MutationScenario {
  const maxAttempts = 24

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const seedBase = Date.now().toString().slice(-6)
    const seed = `${seedBase}${attempt}`
    const classTokens = buildComplexClassTokens(seed)
    const escapedClasses = classTokens.map(item => replaceWxml(item))
    const marker = `tw-watch-${watchCase.name}-${seed}`
    const classLiteral = classTokens.join(' ')

    const hasCollision = escapedClasses.some((escaped) => {
      return baselineWxml.includes(escaped) || baselineJs.includes(escaped)
    })

    if (hasCollision) {
      continue
    }

    if (baselineWxml.includes(marker) || baselineJs.includes(marker)) {
      continue
    }

    const mutatedSource = watchCase.mutate(original, {
      marker,
      classLiteral,
      classVariableName,
    })

    if (mutatedSource === original) {
      continue
    }

    return {
      marker,
      classLiteral,
      classVariableName,
      classTokens,
      escapedClasses,
      mutatedSource,
    }
  }

  throw new Error(`[${watchCase.label}] failed to generate non-colliding mutation classes`)
}

function summarizeMetrics(cases: WatchCaseMetrics[]): WatchSummary {
  const count = cases.length
  if (count === 0) {
    return {
      count,
      hotUpdateAvgMs: 0,
      hotUpdateMaxMs: 0,
      hotUpdateMinMs: 0,
      rollbackAvgMs: 0,
      rollbackMaxMs: 0,
      rollbackMinMs: 0,
    }
  }

  const hotUpdateDurations = cases.map(item => item.hotUpdateEffectiveMs)
  const rollbackDurations = cases.map(item => item.rollbackEffectiveMs)

  const hotUpdateSum = hotUpdateDurations.reduce((sum, value) => sum + value, 0)
  const rollbackSum = rollbackDurations.reduce((sum, value) => sum + value, 0)

  return {
    count,
    hotUpdateAvgMs: Math.round(hotUpdateSum / count),
    hotUpdateMaxMs: Math.max(...hotUpdateDurations),
    hotUpdateMinMs: Math.min(...hotUpdateDurations),
    rollbackAvgMs: Math.round(rollbackSum / count),
    rollbackMaxMs: Math.max(...rollbackDurations),
    rollbackMinMs: Math.min(...rollbackDurations),
  }
}

function resolveReportPath(baseCwd: string, file: string) {
  return path.isAbsolute(file) ? file : path.resolve(baseCwd, file)
}

async function writeReport(baseCwd: string, options: CliOptions, metrics: WatchCaseMetrics[]) {
  if (!options.reportFile) {
    return
  }

  const summary = summarizeMetrics(metrics)
  const reportPath = resolveReportPath(baseCwd, options.reportFile)

  const report: WatchReport = {
    generatedAt: new Date().toISOString(),
    repositoryRoot: formatPath(baseCwd),
    options: {
      caseName: options.caseName,
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      skipBuild: options.skipBuild,
      quietSass: options.quietSass,
      maxHotUpdateMs: options.maxHotUpdateMs,
    },
    summary,
    cases: metrics,
  }

  await fs.mkdir(path.dirname(reportPath), { recursive: true })
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  process.stdout.write(`[watch-hmr] report written: ${formatPath(reportPath)}\n`)
}

async function runCase(watchCase: WatchCase, options: CliOptions): Promise<WatchCaseMetrics> {
  const caseStartedAt = Date.now()
  const classVariableName = '__twWatchClass'

  const sourcePath = watchCase.sourceFile
  const original = await fs.readFile(sourcePath, 'utf8')

  const session = createWatchSession(watchCase.cwd, watchCase.devScript, {
    quietSass: options.quietSass,
  })

  try {
    const initialReadyMs = await waitForOutputsReady(watchCase, options, session)

    const [baselineWxml, baselineJs] = await Promise.all([
      readFileIfExists(watchCase.outputWxml),
      readFileIfExists(watchCase.outputJs),
    ])

    if (!baselineWxml || !baselineJs) {
      throw new Error(`[${watchCase.label}] baseline outputs are missing`)
    }

    const mutation = createMutationScenario(
      watchCase,
      original,
      baselineWxml,
      baselineJs,
      classVariableName,
    )

    const {
      marker,
      classLiteral,
      classTokens,
      escapedClasses,
      mutatedSource,
    } = mutation

    for (const escaped of escapedClasses) {
      assertNotContains(baselineWxml, escaped, `[${watchCase.label}] baseline wxml`)
      assertNotContains(baselineJs, escaped, `[${watchCase.label}] baseline js`)
    }

    const baselineMtime = {
      wxml: await getMtime(watchCase.outputWxml),
      js: await getMtime(watchCase.outputJs),
    }

    const hotUpdateStartedAt = Date.now()
    await fs.writeFile(sourcePath, mutatedSource, 'utf8')
    const hotUpdateOutputMs = await waitForOutputsUpdated(
      watchCase,
      baselineMtime,
      options,
      session,
      hotUpdateStartedAt,
    )
    const hotUpdateEffectiveMs = await waitForMarkerState(
      watchCase,
      marker,
      'present',
      options,
      session,
      hotUpdateStartedAt,
    )

    const [updatedWxml, updatedJs] = await Promise.all([
      fs.readFile(watchCase.outputWxml, 'utf8'),
      fs.readFile(watchCase.outputJs, 'utf8'),
    ])

    for (const escaped of escapedClasses) {
      if (watchCase.verifyEscapedIn.includes('wxml')) {
        assertContains(updatedWxml, escaped, `[${watchCase.label}] updated wxml`)
      }
      if (watchCase.verifyEscapedIn.includes('js')) {
        assertContains(updatedJs, escaped, `[${watchCase.label}] updated js`)
      }
    }

    const updatedMtime = {
      wxml: await getMtime(watchCase.outputWxml),
      js: await getMtime(watchCase.outputJs),
    }

    const rollbackStartedAt = Date.now()
    await fs.writeFile(sourcePath, original, 'utf8')
    const rollbackOutputMs = await waitForOutputsUpdated(
      watchCase,
      updatedMtime,
      options,
      session,
      rollbackStartedAt,
    )
    const rollbackEffectiveMs = await waitForMarkerState(
      watchCase,
      marker,
      'absent',
      options,
      session,
      rollbackStartedAt,
    )

    const metrics: WatchCaseMetrics = {
      name: watchCase.name,
      label: watchCase.label,
      marker,
      classLiteral,
      classTokens,
      escapedClasses,
      verifyEscapedIn: watchCase.verifyEscapedIn,
      initialReadyMs,
      hotUpdateOutputMs,
      hotUpdateEffectiveMs,
      rollbackOutputMs,
      rollbackEffectiveMs,
      totalMs: Date.now() - caseStartedAt,
    }

    process.stdout.write(
      `[watch-hmr] ${watchCase.label} passed (hotUpdate=${metrics.hotUpdateEffectiveMs}ms, rollback=${metrics.rollbackEffectiveMs}ms)\n`,
    )

    return metrics
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const logs = session.logs()
    throw new Error(`${message}\n[${watchCase.label}] recent watch logs:\n${logs}`)
  }
  finally {
    try {
      await fs.writeFile(sourcePath, original, 'utf8')
    }
    catch {
    }
    await session.stop()
  }
}

function assertHotUpdateBudget(metrics: WatchCaseMetrics, options: CliOptions) {
  if (options.maxHotUpdateMs == null) {
    return
  }

  if (metrics.hotUpdateEffectiveMs > options.maxHotUpdateMs) {
    throw new Error(
      `[${metrics.label}] hot update exceeded budget: ${metrics.hotUpdateEffectiveMs}ms > ${options.maxHotUpdateMs}ms`,
    )
  }
}

function logSummary(summary: WatchSummary) {
  process.stdout.write(
    `[watch-hmr] summary: cases=${summary.count}, hotUpdate(avg/min/max)=${summary.hotUpdateAvgMs}/${summary.hotUpdateMinMs}/${summary.hotUpdateMaxMs}ms, rollback(avg/min/max)=${summary.rollbackAvgMs}/${summary.rollbackMinMs}/${summary.rollbackMaxMs}ms\n`,
  )
}

async function main() {
  const options = resolveOptions()
  const baseCwd = resolveBaseCwd()
  process.stdout.write(`[watch-hmr] repository root: ${formatPath(baseCwd)}\n`)

  if (!options.skipBuild) {
    await ensureLocalPackageBuild(baseCwd)
  }

  const allCases = buildCases(baseCwd)
  const selected = pickCases(allCases, options.caseName)

  if (selected.length === 0) {
    throw new Error(`no watch case matched --case=${options.caseName}`)
  }

  process.stdout.write(`[watch-hmr] running cases: ${selected.map(item => item.label).join(', ')}\n`)

  const metrics: WatchCaseMetrics[] = []

  for (const watchCase of selected) {
    process.stdout.write(`[watch-hmr] start ${watchCase.label} (${watchCase.devScript})\n`)
    const caseMetrics = await runCase(watchCase, options)
    assertHotUpdateBudget(caseMetrics, options)
    metrics.push(caseMetrics)
  }

  const summary = summarizeMetrics(metrics)
  logSummary(summary)
  await writeReport(baseCwd, options, metrics)

  process.stdout.write('[watch-hmr] all cases passed\n')
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[watch-hmr] failed: ${message}`)
  process.exitCode = 1
})

process.on('SIGINT', () => {
  process.exitCode = 130
})

process.on('SIGTERM', () => {
  process.exitCode = 143
})

process.on('unhandledRejection', (reason) => {
  console.error('[watch-hmr] unhandled rejection:', reason)
  process.exitCode = 1
})

process.on('uncaughtException', (error) => {
  console.error('[watch-hmr] uncaught exception:', error)
  process.exitCode = 1
})
