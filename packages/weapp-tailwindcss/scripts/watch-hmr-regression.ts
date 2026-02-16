import type { Buffer } from 'node:buffer'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { spawn } from 'node:child_process'
import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { replaceWxml } from '../src/wxml/shared'

type WatchProjectGroup = 'demo' | 'apps'
type ConcreteWatchCaseName = 'taro' | 'uni' | 'mpx' | 'rax' | 'mina' | 'weapp-vite' | 'uni-app-vue3-vite' | 'uni-app-tailwindcss-v4' | 'taro-vite-tailwindcss-v4' | 'taro-app-vite' | 'taro-webpack-tailwindcss-v4' | 'taro-vue3-app' | 'taro-webpack' | 'vite-native-ts'
type WatchCaseName = ConcreteWatchCaseName | 'both' | 'all' | 'demo' | 'apps'
type MutationRoundName = 'baseline-arbitrary' | 'complex-corpus'
type MutationKind = 'template' | 'script' | 'style'

interface CliOptions {
  caseName: WatchCaseName
  timeoutMs: number
  pollMs: number
  skipBuild: boolean
  quietSass: boolean
  reportFile?: string
  maxHotUpdateMs?: number
}

interface ClassMutationPayload {
  marker: string
  classLiteral: string
  classVariableName: string
}

interface StyleMutationPayload {
  marker: string
  styleNeedle: string
}

interface MutationRoundConfig {
  name: MutationRoundName
  buildClassTokens: (seed: string) => string[]
}

interface MutationScenario extends ClassMutationPayload {
  roundName: MutationRoundName
  classTokens: string[]
  escapedClasses: string[]
  freshEscapedClasses: string[]
  mutatedSource: string
}

interface ClassMutationConfig {
  sourceFile: string
  verifyEscapedIn: Array<'wxml' | 'js'>
  verifyClassLiteralIn?: Array<'wxml' | 'js'>
  mutate: (source: string, payload: ClassMutationPayload) => string
}

interface StyleMutationConfig {
  sourceFile: string
  mutate: (source: string, payload: StyleMutationPayload) => string
}

interface WatchCase {
  name: ConcreteWatchCaseName
  label: string
  project: string
  group: WatchProjectGroup
  minGlobalStyleEscapedClasses?: number
  cwd: string
  devScript: string
  env?: Record<string, string>
  outputWxml: string
  outputJs: string
  outputStyleCandidates: string[]
  globalStyleCandidates: string[]
  templateMutation: ClassMutationConfig
  scriptMutation: ClassMutationConfig
  styleMutation: StyleMutationConfig
}

interface WatchSession {
  child: ChildProcessWithoutNullStreams
  ensureRunning: () => void
  lastCompileSuccessAt: () => number
  logs: () => string
  stop: () => Promise<void>
}

interface OutputMtime {
  wxml: number
  js: number
}

interface MutationRoundMetrics {
  roundName: MutationRoundName
  marker: string
  classLiteral: string
  classTokens: string[]
  escapedClasses: string[]
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  totalMs: number
}

interface WatchCaseRoundComparison {
  baselineRoundName: MutationRoundName
  candidateRoundName: MutationRoundName
  hotUpdateDeltaMs: number
  rollbackDeltaMs: number
  hotUpdateRatio: number
  rollbackRatio: number
}

interface ClassMutationMetrics {
  mutationKind: 'template' | 'script'
  sourceFile: string
  marker: string
  classLiteral: string
  classTokens: string[]
  escapedClasses: string[]
  rounds: MutationRoundMetrics[]
  roundComparison?: WatchCaseRoundComparison
  verifyEscapedIn: Array<'wxml' | 'js'>
  verifyClassLiteralIn: Array<'wxml' | 'js'>
  globalStyleOutputs: string[]
  minRequiredGlobalStyleEscapedClasses: number
  verifiedGlobalStyleEscapedClasses: string[]
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
}

interface StyleMutationMetrics {
  mutationKind: 'style'
  sourceFile: string
  outputStyle: string
  marker: string
  styleNeedle: string
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  rollbackNeedleCleared: boolean
}

type WatchCaseMutationMetrics = ClassMutationMetrics | StyleMutationMetrics

interface WatchSummary {
  count: number
  hotUpdateAvgMs: number
  hotUpdateMaxMs: number
  hotUpdateMinMs: number
  rollbackAvgMs: number
  rollbackMaxMs: number
  rollbackMinMs: number
}

interface WatchCaseMetrics {
  name: WatchCase['name']
  label: string
  project: string
  projectGroup: WatchProjectGroup
  marker: string
  classLiteral: string
  classTokens: string[]
  escapedClasses: string[]
  rounds: MutationRoundMetrics[]
  roundComparison?: WatchCaseRoundComparison
  verifyEscapedIn: Array<'wxml' | 'js'>
  verifyClassLiteralIn: Array<'wxml' | 'js'>
  globalStyleOutputs: string[]
  mutationMetrics: WatchCaseMutationMetrics[]
  summaryByMutationKind: Partial<Record<MutationKind, WatchSummary>>
  initialReadyMs: number
  hotUpdateOutputMs: number
  hotUpdateEffectiveMs: number
  rollbackOutputMs: number
  rollbackEffectiveMs: number
  totalMs: number
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
  summaryByRound: Partial<Record<MutationRoundName, WatchSummary>>
  summaryByGroup: Partial<Record<WatchProjectGroup, WatchSummary>>
  summaryByProject: Record<string, WatchSummary>
  summaryByMutationKind: Partial<Record<MutationKind, WatchSummary>>
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
    caseName: (parseArg('--case', argv) ?? 'all') as CliOptions['caseName'],
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

const compileSuccessLinePatterns = [
  /compiled successfully/i,
  /build complete/i,
  /watching for changes/i,
  /ready in \d+/i,
  /built in \d+/i,
] as const

const compileFailureLinePatterns = [
  /build failed with \d+ error/i,
  /\[unhandleable_error\]/i,
  /unable to start fsevent stream/i,
  /err_pnpm_recursive_run_first_fail/i,
  /error:\s*listen eperm/i,
  /error:\s*listen emfile/i,
] as const

function stripAnsiControlSequences(line: string) {
  let output = ''
  for (let index = 0; index < line.length; index += 1) {
    const current = line.charCodeAt(index)
    const next = line.charCodeAt(index + 1)

    if (current !== 27 || next !== 91) {
      output += line[index]
      continue
    }

    index += 2
    while (index < line.length) {
      const code = line.charCodeAt(index)
      const isUpper = code >= 65 && code <= 90
      const isLower = code >= 97 && code <= 122
      if (isUpper || isLower) {
        break
      }
      index += 1
    }
  }
  return output
}

function normalizeLogLine(line: string) {
  return stripAnsiControlSequences(line).replace(/\u200B/g, '').trim()
}

function isCompileSuccessLine(line: string) {
  const normalized = normalizeLogLine(line)
  for (const pattern of compileSuccessLinePatterns) {
    if (pattern.test(normalized)) {
      return true
    }
  }
  return false
}

function resolveCompileFatalError(line: string) {
  const normalized = normalizeLogLine(line)
  for (const pattern of compileFailureLinePatterns) {
    if (pattern.test(normalized)) {
      return normalized
    }
  }

  // Some toolchains prefix fatal lines with `ERROR` but include extra symbols/text.
  if (/error/i.test(normalized) && /emfile/i.test(normalized)) {
    return normalized
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

function createWatchSession(
  cwd: string,
  devScript: string,
  options: Pick<CliOptions, 'quietSass'>,
  env: Record<string, string> = {},
): WatchSession {
  const lines: string[] = []
  let lastCompileSuccessAt = 0
  let compileFatalError: string | undefined
  const child = spawn(resolvePnpmCommand(), ['run', devScript], {
    cwd,
    env: {
      ...process.env,
      WEAPP_TW_WATCH_REGRESSION: '1',
      ...env,
    },
    detached: process.platform !== 'win32',
    stdio: 'pipe',
  })

  const killWatchProcess = (signal: NodeJS.Signals) => {
    const childPid = child.pid
    if (childPid != null && process.platform !== 'win32') {
      try {
        process.kill(-childPid, signal)
        return
      }
      catch {
      }
    }

    try {
      child.kill(signal)
    }
    catch {
    }
  }

  let collecting = true
  const rawCollect = createLineCollector('watch', lines, 240, {
    quietSass: options.quietSass,
  })
  const collect = (chunk: Buffer | string) => {
    if (!collecting) {
      return
    }

    const text = chunk.toString()
    for (const line of text.split(/\r?\n/)) {
      if (!line) {
        continue
      }
      if (isCompileSuccessLine(line)) {
        lastCompileSuccessAt = Date.now()
      }
      if (!compileFatalError) {
        compileFatalError = resolveCompileFatalError(line)
      }
    }

    rawCollect(chunk)
  }

  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  const ensureRunning = () => {
    if (compileFatalError) {
      throw new Error(`watch process reported fatal error: ${compileFatalError}`)
    }
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

    killWatchProcess('SIGINT')

    let startedAt = Date.now()
    while (child.exitCode == null && Date.now() - startedAt < 3000) {
      await sleep(100)
    }

    if (child.exitCode != null) {
      return
    }

    killWatchProcess('SIGTERM')

    startedAt = Date.now()
    while (child.exitCode == null && Date.now() - startedAt < 2000) {
      await sleep(100)
    }

    if (child.exitCode == null) {
      killWatchProcess('SIGKILL')
    }
  }

  return {
    child,
    ensureRunning,
    lastCompileSuccessAt: () => lastCompileSuccessAt,
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

function assertContainsOneOf(source: string, expected: string[], hint: string) {
  for (const value of expected) {
    if (source.includes(value)) {
      return
    }
  }
  throw new Error(`${hint}: expected to contain one of ${expected.join(' | ')}`)
}

function insertBeforeClosingTag(source: string, closingTag: string, snippet: string) {
  const index = source.lastIndexOf(closingTag)
  if (index === -1) {
    throw new Error(`closing tag ${closingTag} not found`)
  }
  return `${source.slice(0, index)}\n${snippet}\n${source.slice(index)}`
}

function insertBeforeAnchor(source: string, anchor: string, snippet: string) {
  const index = source.indexOf(anchor)
  if (index === -1) {
    throw new Error(`anchor ${anchor} not found`)
  }
  return `${source.slice(0, index)}${snippet}${source.slice(index)}`
}

function appendTrailingSnippet(source: string, snippet: string) {
  if (source.endsWith('\n')) {
    return `${source}${snippet}\n`
  }
  return `${source}\n${snippet}\n`
}

function createStyleRuleSnippet(payload: StyleMutationPayload) {
  const numericSeed = payload.marker.replace(/\D/g, '')
  const colorSeed = (numericSeed.slice(-6) || '123456').padStart(6, '0').slice(0, 6)
  return `${payload.styleNeedle} { color: #${colorSeed}; }`
}

function mutateScriptByDataAnchor(source: string, dataAnchor: string, payload: ClassMutationPayload, indent = '    ') {
  if (!source.includes(dataAnchor)) {
    throw new Error(`script data anchor not found: ${dataAnchor}`)
  }
  return source.replace(
    dataAnchor,
    `${dataAnchor}\n${indent}${payload.classVariableName}: '${payload.classLiteral}',\n${indent}__twWatchScriptMarker: '${payload.marker}',`,
  )
}

function mutateTsxScriptByReturnAnchor(source: string, payload: ClassMutationPayload, returnAnchor = '  return (') {
  const snippet = [
    `  const ${payload.classVariableName} = '${payload.classLiteral}'`,
    `  const __twWatchScriptMarker = '${payload.marker}'`,
    '',
  ].join('\n')
  const withScriptConst = insertBeforeAnchor(source, returnAnchor, snippet)
  const viewSnippet = `      <View className={${payload.classVariableName}}>${payload.marker}-script</View>`

  const closingCandidates = [
    '    </>',
    '  </>',
    '    </View>',
    '  </View>',
  ]

  for (const closingTag of closingCandidates) {
    if (withScriptConst.includes(closingTag)) {
      return insertBeforeClosingTag(withScriptConst, closingTag, viewSnippet)
    }
  }

  throw new Error('tsx closing tag not found for script mutation')
}

function mutateVueScriptSetupArrayByAnchor(
  source: string,
  arrayAnchor: string,
  payload: ClassMutationPayload,
) {
  if (!source.includes(arrayAnchor)) {
    throw new Error(`vue script setup array anchor not found: ${arrayAnchor}`)
  }

  return source.replace(
    arrayAnchor,
    `${arrayAnchor}\n  '${payload.classLiteral}',\n  '${payload.marker}',`,
  )
}

function mutateVueRefStringLiteral(
  source: string,
  refName: string,
  payload: ClassMutationPayload,
) {
  const pattern = new RegExp(`(const\\s+${refName}\\s*=\\s*ref\\(')([^']*)('\\))`)
  if (!pattern.test(source)) {
    throw new Error(`vue ref string literal not found: ${refName}`)
  }

  return source.replace(
    pattern,
    (_match, head: string, value: string, tail: string) => {
      return `${head}${value} ${payload.classLiteral} ${payload.marker}${tail}`
    },
  )
}

function mutateSfcStyleBlock(source: string, payload: StyleMutationPayload) {
  if (!source.includes('</style>')) {
    throw new Error('style closing tag </style> not found')
  }
  return insertBeforeClosingTag(source, '</style>', createStyleRuleSnippet(payload))
}

function insertIntoVueTemplateRoot(source: string, snippet: string) {
  const templateStart = source.indexOf('<template>')
  const templateEnd = source.lastIndexOf('</template>')
  if (templateStart === -1 || templateEnd === -1) {
    throw new Error('template block not found')
  }

  const templateBlock = source.slice(templateStart, templateEnd + '</template>'.length)
  const rootClosingTagMatches = [...templateBlock.matchAll(/\n {2}<\/[a-zA-Z][\w-]*>\s*\n<\/template>/g)]
  const rootClosingTagMatch = rootClosingTagMatches.at(-1)
  if (rootClosingTagMatch?.index == null) {
    throw new Error('vue template root closing tag not found')
  }

  const insertIndex = templateStart + rootClosingTagMatch.index
  return `${source.slice(0, insertIndex)}\n${snippet}${source.slice(insertIndex)}`
}

function buildCases(baseCwd: string): WatchCase[] {
  const taroCase: WatchCase = {
    name: 'taro',
    label: 'demo/taro-app',
    project: 'demo/taro-app',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-app'),
    devScript: 'dev:weapp',
    outputWxml: path.resolve(baseCwd, 'demo/taro-app/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-app/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-app/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-app/dist/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app/src/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const uniCase: WatchCase = {
    name: 'uni',
    label: 'demo/uni-app',
    project: 'demo/uni-app',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/uni-app'),
    devScript: 'dev:mp-weixin',
    outputWxml: path.resolve(baseCwd, 'demo/uni-app/dist/dev/mp-weixin/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/uni-app/dist/dev/mp-weixin/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/uni-app/dist/dev/mp-weixin/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/uni-app/dist/dev/mp-weixin/common/main.wxss'),
      path.resolve(baseCwd, 'demo/uni-app/dist/dev/mp-weixin/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app/src/pages/index/index.vue'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertIntoVueTemplateRoot(source, snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '      className: \'bg-[#123456]\',', payload, '      ')
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app/src/pages/index/index.vue'),
      mutate(source, payload) {
        return mutateSfcStyleBlock(source, payload)
      },
    },
  }

  const mpxCase: WatchCase = {
    name: 'mpx',
    label: 'demo/mpx-app',
    project: 'demo/mpx-app',
    group: 'demo',
    // MPX watch output may keep newly introduced utility classes in page-level assets.
    // Do not hard-require hits in global utilities/app styles for this case.
    minGlobalStyleEscapedClasses: 0,
    cwd: path.resolve(baseCwd, 'demo/mpx-app'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'demo/mpx-app/dist/wx/pages/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/mpx-app/dist/wx/pages/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/mpx-app/dist/wx/app.wxss'),
      path.resolve(baseCwd, 'demo/mpx-app/dist/wx/pages/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/mpx-app/dist/wx/styles/utilities8aaa9530.wxss'),
      path.resolve(baseCwd, 'demo/mpx-app/dist/wx/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-app/src/pages/index.mpx'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</template>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-app/src/pages/index.mpx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '    classNames: \'text-[#123456] text-[50px] bg-[#fff]\',', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/mpx-app/src/app.mpx'),
      mutate(source, payload) {
        return mutateSfcStyleBlock(source, payload)
      },
    },
  }

  const raxCase: WatchCase = {
    name: 'rax',
    label: 'demo/rax-app',
    project: 'demo/rax-app',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/rax-app'),
    devScript: 'start',
    env: {
      PORT: '39333',
    },
    outputWxml: path.resolve(baseCwd, 'demo/rax-app/build/wechat-miniprogram/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/rax-app/build/wechat-miniprogram/bundle.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/rax-app/build/wechat-miniprogram/bundle.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/rax-app/build/wechat-miniprogram/bundle.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/rax-app/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/rax-app/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/rax-app/src/pages/index/index.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const minaCase: WatchCase = {
    name: 'mina',
    label: 'demo/native-mina',
    project: 'demo/native-mina',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/native-mina'),
    devScript: 'start',
    outputWxml: path.resolve(baseCwd, 'demo/native-mina/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/native-mina/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/native-mina/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/native-mina/dist/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/native-mina/src/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/native-mina/src/pages/index/index.js'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '  data: {', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/native-mina/src/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const weappViteCase: WatchCase = {
    name: 'weapp-vite',
    label: 'demo/native-ts (weapp-vite)',
    project: 'demo/native-ts',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/native-ts'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'demo/native-ts/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/native-ts/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/native-ts/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/native-ts/dist/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/native-ts/miniprogram/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/native-ts/miniprogram/pages/index/index.ts'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '  data: {', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/native-ts/miniprogram/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const uniAppVue3ViteCase: WatchCase = {
    name: 'uni-app-vue3-vite',
    label: 'demo/uni-app-vue3-vite',
    project: 'demo/uni-app-vue3-vite',
    group: 'demo',
    minGlobalStyleEscapedClasses: 0,
    cwd: path.resolve(baseCwd, 'demo/uni-app-vue3-vite'),
    devScript: 'dev:mp-weixin',
    outputWxml: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/uni-app-vue3-vite/dist/dev/mp-weixin/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/src/pages/index/index.vue'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertIntoVueTemplateRoot(source, snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateVueScriptSetupArrayByAnchor(
          source,
          'const classArray = [',
          payload,
        )
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-vue3-vite/src/pages/index/index.vue'),
      mutate(source, payload) {
        return mutateSfcStyleBlock(source, payload)
      },
    },
  }

  const uniAppTailwindcssV4Case: WatchCase = {
    name: 'uni-app-tailwindcss-v4',
    label: 'demo/uni-app-tailwindcss-v4',
    project: 'demo/uni-app-tailwindcss-v4',
    group: 'demo',
    minGlobalStyleEscapedClasses: 0,
    cwd: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4'),
    devScript: 'dev:mp-weixin',
    outputWxml: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/dist/dev/mp-weixin/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/dist/dev/mp-weixin/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/dist/dev/mp-weixin/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/dist/dev/mp-weixin/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/src/pages/index/index.vue'),
      verifyEscapedIn: ['wxml'],
      verifyClassLiteralIn: [],
      mutate(source, payload) {
        const snippet = `    <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertIntoVueTemplateRoot(source, snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateVueRefStringLiteral(
          source,
          'className',
          payload,
        )
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/uni-app-tailwindcss-v4/src/main.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const taroViteTailwindcssV4Case: WatchCase = {
    name: 'taro-vite-tailwindcss-v4',
    label: 'demo/taro-vite-tailwindcss-v4',
    project: 'demo/taro-vite-tailwindcss-v4',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4'),
    devScript: 'dev:weapp',
    outputWxml: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/app-origin.wxss'),
      path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/app-origin.wxss'),
      path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/dist/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </View>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vite-tailwindcss-v4/src/pages/index/index.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const taroAppViteCase: WatchCase = {
    name: 'taro-app-vite',
    label: 'demo/taro-app-vite',
    project: 'demo/taro-app-vite',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-app-vite'),
    devScript: 'dev:weapp',
    outputWxml: path.resolve(baseCwd, 'demo/taro-app-vite/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-app-vite/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-app-vite/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-app-vite/dist/app-origin.wxss'),
      path.resolve(baseCwd, 'demo/taro-app-vite/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-app-vite/dist/app-origin.wxss'),
      path.resolve(baseCwd, 'demo/taro-app-vite/dist/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app-vite/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </View>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app-vite/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-app-vite/src/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const taroWebpackTailwindcssV4DemoCase: WatchCase = {
    name: 'taro-webpack-tailwindcss-v4',
    label: 'demo/taro-webpack-tailwindcss-v4',
    project: 'demo/taro-webpack-tailwindcss-v4',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4'),
    devScript: 'dev:weapp',
    outputWxml: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/dist/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-webpack-tailwindcss-v4/src/pages/index/index.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const taroVue3AppCase: WatchCase = {
    name: 'taro-vue3-app',
    label: 'demo/taro-vue3-app',
    project: 'demo/taro-vue3-app',
    group: 'demo',
    cwd: path.resolve(baseCwd, 'demo/taro-vue3-app'),
    devScript: 'dev:weapp',
    outputWxml: path.resolve(baseCwd, 'demo/taro-vue3-app/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'demo/taro-vue3-app/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-vue3-app/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-vue3-app/dist/app.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'demo/taro-vue3-app/dist/pages/index/index.wxss'),
      path.resolve(baseCwd, 'demo/taro-vue3-app/dist/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vue3-app/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertIntoVueTemplateRoot(source, snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vue3-app/src/pages/index/index.vue'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateVueScriptSetupArrayByAnchor(
          source,
          'const classArray = [',
          payload,
        )
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'demo/taro-vue3-app/src/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const taroWebpackCase: WatchCase = {
    name: 'taro-webpack',
    label: 'apps/taro-webpack-tailwindcss-v4',
    project: 'apps/taro-webpack-tailwindcss-v4',
    group: 'apps',
    cwd: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4'),
    devScript: 'dev:weapp',
    outputWxml: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/dist/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        const snippet = `      <View className='${payload.classLiteral}'>${payload.marker}-template</View>`
        return insertBeforeClosingTag(source, '    </>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/src/pages/index/index.tsx'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateTsxScriptByReturnAnchor(source, payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/taro-webpack-tailwindcss-v4/src/pages/index/index.css'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  const viteNativeTsCase: WatchCase = {
    name: 'vite-native-ts',
    label: 'apps/vite-native-ts',
    project: 'apps/vite-native-ts',
    group: 'apps',
    cwd: path.resolve(baseCwd, 'apps/vite-native-ts'),
    devScript: 'dev',
    outputWxml: path.resolve(baseCwd, 'apps/vite-native-ts/dist/pages/index/index.wxml'),
    outputJs: path.resolve(baseCwd, 'apps/vite-native-ts/dist/pages/index/index.js'),
    outputStyleCandidates: [
      path.resolve(baseCwd, 'apps/vite-native-ts/dist/pages/index/index.wxss'),
    ],
    globalStyleCandidates: [
      path.resolve(baseCwd, 'apps/vite-native-ts/dist/app.wxss'),
    ],
    templateMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts/miniprogram/pages/index/index.wxml'),
      verifyEscapedIn: ['wxml'],
      mutate(source, payload) {
        const snippet = `  <view class="${payload.classLiteral}">${payload.marker}-template</view>`
        return insertBeforeClosingTag(source, '</view>', snippet)
      },
    },
    scriptMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts/miniprogram/pages/index/index.ts'),
      verifyEscapedIn: [],
      verifyClassLiteralIn: ['js'],
      mutate(source, payload) {
        return mutateScriptByDataAnchor(source, '  data: {', payload)
      },
    },
    styleMutation: {
      sourceFile: path.resolve(baseCwd, 'apps/vite-native-ts/miniprogram/pages/index/index.scss'),
      mutate(source, payload) {
        return appendTrailingSnippet(source, createStyleRuleSnippet(payload))
      },
    },
  }

  return [
    taroCase,
    uniCase,
    uniAppVue3ViteCase,
    uniAppTailwindcssV4Case,
    mpxCase,
    taroViteTailwindcssV4Case,
    taroAppViteCase,
    taroWebpackTailwindcssV4DemoCase,
    taroVue3AppCase,
    raxCase,
    minaCase,
    weappViteCase,
    taroWebpackCase,
    viteNativeTsCase,
  ]
}

function pickCases(allCases: WatchCase[], caseName: CliOptions['caseName']) {
  if (caseName === 'all') {
    return allCases
  }

  if (caseName === 'demo' || caseName === 'apps') {
    return allCases.filter(item => item.group === caseName)
  }

  if (caseName === 'both') {
    return allCases.filter(item => item.name === 'taro' || item.name === 'uni')
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

async function waitForInitialWarmup(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  sessionStartedAt: number,
) {
  const warmupGraceMs = Math.min(5000, options.timeoutMs)
  return waitFor(
    async () => {
      if (session.lastCompileSuccessAt() > sessionStartedAt) {
        return true
      }

      const [wxmlMtime, jsMtime] = await Promise.all([
        getMtime(watchCase.outputWxml),
        getMtime(watchCase.outputJs),
      ])
      if (wxmlMtime > sessionStartedAt || jsMtime > sessionStartedAt) {
        return true
      }

      // Some watch toolchains reuse existing outputs without touching mtimes on initial attach.
      // If both outputs exist and the watcher has stayed alive for a short grace period,
      // proceed and let later mutation checks enforce real hot-update behavior.
      return wxmlMtime > 0 && jsMtime > 0 && Date.now() - sessionStartedAt >= warmupGraceMs
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] initial watch warmup did not finish in time`,
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

function buildBaselineArbitraryClassTokens(seed: string) {
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

function buildComplexCorpusClassTokens(seed: string) {
  return [
    ...buildBaselineArbitraryClassTokens(seed),
    'group-[:nth-of-type(3)_&]:block',
    '[@supports(display:grid)]:grid',
    '[@media(any-hover:hover){&:hover}]:opacity-100',
    'data-[state=open]:opacity-100',
    'supports-[display:grid]:grid',
    '[mask-type:luminance]',
    `[--watch-hmr-offset:${seed}px]`,
  ]
}

function resolveMutationRoundConfigs(): MutationRoundConfig[] {
  return [
    {
      name: 'baseline-arbitrary',
      buildClassTokens: buildBaselineArbitraryClassTokens,
    },
    {
      name: 'complex-corpus',
      buildClassTokens: buildComplexCorpusClassTokens,
    },
  ]
}

function createClassMutationScenario(
  watchCase: WatchCase,
  mutationKind: 'template' | 'script',
  mutation: ClassMutationConfig,
  original: string,
  baselineWxml: string,
  baselineJs: string,
  baselineGlobalStyle: string,
  classVariableName: string,
  roundConfig: MutationRoundConfig,
): MutationScenario {
  const maxAttempts = 24

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const seedBase = Date.now().toString().slice(-6)
    const seed = `${seedBase}${attempt}`
    const classTokens = roundConfig.buildClassTokens(seed)
    const escapedClasses = classTokens.map(item => replaceWxml(item))
    const marker = `tw-watch-${watchCase.name}-${mutationKind}-${roundConfig.name}-${seed}`
    const classLiteral = classTokens.join(' ')

    const freshEscapedClasses = escapedClasses.filter((escaped) => {
      return !baselineWxml.includes(escaped) && !baselineJs.includes(escaped) && !baselineGlobalStyle.includes(escaped)
    })

    if (freshEscapedClasses.length < 3) {
      continue
    }

    if (baselineWxml.includes(marker) || baselineJs.includes(marker) || baselineGlobalStyle.includes(marker)) {
      continue
    }

    const mutatedSource = mutation.mutate(original, {
      marker,
      classLiteral,
      classVariableName,
    })

    if (mutatedSource === original) {
      continue
    }

    return {
      roundName: roundConfig.name,
      marker,
      classLiteral,
      classVariableName,
      classTokens,
      escapedClasses,
      freshEscapedClasses,
      mutatedSource,
    }
  }

  throw new Error(`[${watchCase.label}] failed to generate fresh mutation classes for ${mutationKind}/${roundConfig.name}`)
}

function createStyleMutationPayload(watchCase: WatchCase): StyleMutationPayload {
  const seed = `${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  const marker = `tw-watch-style-${watchCase.name}-${seed}`
  return {
    marker,
    styleNeedle: `.${marker}`,
  }
}

function buildRoundComparison(rounds: MutationRoundMetrics[]): WatchCaseRoundComparison | undefined {
  const baseline = rounds.find(item => item.roundName === 'baseline-arbitrary')
  const candidate = rounds.find(item => item.roundName === 'complex-corpus')

  if (!baseline || !candidate) {
    return undefined
  }

  return {
    baselineRoundName: baseline.roundName,
    candidateRoundName: candidate.roundName,
    hotUpdateDeltaMs: candidate.hotUpdateEffectiveMs - baseline.hotUpdateEffectiveMs,
    rollbackDeltaMs: candidate.rollbackEffectiveMs - baseline.rollbackEffectiveMs,
    hotUpdateRatio: Number((candidate.hotUpdateEffectiveMs / baseline.hotUpdateEffectiveMs).toFixed(3)),
    rollbackRatio: Number((candidate.rollbackEffectiveMs / baseline.rollbackEffectiveMs).toFixed(3)),
  }
}

async function resolveOutputFiles(
  watchCase: WatchCase,
  candidates: string[],
  label: string,
  options: CliOptions,
  session: WatchSession,
) {
  let resolved: string[] = []

  await waitFor(
    async () => {
      const nextResolved: string[] = []
      for (const file of candidates) {
        const content = await readFileIfExists(file)
        if (content != null) {
          nextResolved.push(file)
        }
      }
      resolved = nextResolved
      return resolved.length > 0
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] could not resolve ${label} output from candidates: ${candidates.map(formatPath).join(', ')}`,
      onTick: session.ensureRunning,
    },
  )

  if (resolved.length === 0) {
    throw new Error(`[${watchCase.label}] no resolved ${label} output`)
  }

  return resolved
}

async function readJoinedOutputFiles(files: string[]) {
  const parts = await Promise.all(files.map(file => readFileIfExists(file)))
  return parts.filter((item): item is string => item != null).join('\n')
}

function resolvePreferredRound(rounds: MutationRoundMetrics[]) {
  return rounds.find(item => item.roundName === 'complex-corpus')
    ?? rounds[rounds.length - 1]
}

async function runClassMutation(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  mutationKind: 'template' | 'script',
  mutation: ClassMutationConfig,
  sourceOriginal: string,
  globalStyleOutputs: string[],
): Promise<ClassMutationMetrics> {
  const classVariableName = '__twWatchClass'
  const sourcePath = mutation.sourceFile

  const [baselineWxml, baselineJs, baselineGlobalStyle] = await Promise.all([
    readFileIfExists(watchCase.outputWxml),
    readFileIfExists(watchCase.outputJs),
    readJoinedOutputFiles(globalStyleOutputs),
  ])

  if (!baselineWxml || !baselineJs || !baselineGlobalStyle) {
    throw new Error(`[${watchCase.label}] baseline outputs are missing for ${mutationKind}`)
  }

  const verifyClassLiteralIn = mutation.verifyClassLiteralIn ?? []
  const minRequiredGlobalStyleEscapedClasses = watchCase.minGlobalStyleEscapedClasses ?? 1
  const roundMetrics: MutationRoundMetrics[] = []
  const verifiedGlobalEscapedClasses = new Set<string>()
  let baselineMtime = {
    wxml: await getMtime(watchCase.outputWxml),
    js: await getMtime(watchCase.outputJs),
  }

  for (const roundConfig of resolveMutationRoundConfigs()) {
    const roundStartedAt = Date.now()

    const mutationScenario = createClassMutationScenario(
      watchCase,
      mutationKind,
      mutation,
      sourceOriginal,
      baselineWxml,
      baselineJs,
      baselineGlobalStyle,
      classVariableName,
      roundConfig,
    )

    const {
      marker,
      classLiteral,
      classTokens,
      escapedClasses,
      freshEscapedClasses,
      mutatedSource,
    } = mutationScenario

    for (const escaped of freshEscapedClasses) {
      assertNotContains(baselineWxml, escaped, `[${watchCase.label}] baseline wxml`)
      assertNotContains(baselineJs, escaped, `[${watchCase.label}] baseline js`)
      assertNotContains(baselineGlobalStyle, escaped, `[${watchCase.label}] baseline global style`)
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

    const [updatedWxml, updatedJs, updatedGlobalStyle] = await Promise.all([
      fs.readFile(watchCase.outputWxml, 'utf8'),
      fs.readFile(watchCase.outputJs, 'utf8'),
      readJoinedOutputFiles(globalStyleOutputs),
    ])

    for (const escaped of escapedClasses) {
      if (mutation.verifyEscapedIn.includes('wxml')) {
        assertContains(updatedWxml, escaped, `[${watchCase.label}] updated wxml`)
      }
      if (mutation.verifyEscapedIn.includes('js')) {
        assertContains(updatedJs, escaped, `[${watchCase.label}] updated js`)
      }
    }

    for (const [index, classToken] of classTokens.entries()) {
      const escapedToken = escapedClasses[index]
      const expectedValues = escapedToken ? [classToken, escapedToken] : [classToken]

      if (verifyClassLiteralIn.includes('wxml')) {
        assertContainsOneOf(
          updatedWxml,
          expectedValues,
          `[${watchCase.label}] updated wxml token literal`,
        )
      }
      if (verifyClassLiteralIn.includes('js')) {
        assertContainsOneOf(
          updatedJs,
          expectedValues,
          `[${watchCase.label}] updated js token literal`,
        )
      }
    }

    const matchedGlobalEscapedClasses = freshEscapedClasses.filter(escaped => updatedGlobalStyle.includes(escaped))
    if (matchedGlobalEscapedClasses.length < minRequiredGlobalStyleEscapedClasses) {
      throw new Error(
        `[${watchCase.label}] global style output has insufficient transformed classes: required=${minRequiredGlobalStyleEscapedClasses}, actual=${matchedGlobalEscapedClasses.length}, source=${formatPath(sourcePath)}`,
      )
    }

    for (const escaped of matchedGlobalEscapedClasses.slice(0, 3)) {
      verifiedGlobalEscapedClasses.add(escaped)
    }

    const updatedMtime = {
      wxml: await getMtime(watchCase.outputWxml),
      js: await getMtime(watchCase.outputJs),
    }

    const rollbackStartedAt = Date.now()
    await fs.writeFile(sourcePath, sourceOriginal, 'utf8')
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

    roundMetrics.push({
      roundName: roundConfig.name,
      marker,
      classLiteral,
      classTokens,
      escapedClasses,
      hotUpdateOutputMs,
      hotUpdateEffectiveMs,
      rollbackOutputMs,
      rollbackEffectiveMs,
      totalMs: Date.now() - roundStartedAt,
    })

    process.stdout.write(
      `[watch-hmr] ${watchCase.label} mutation=${mutationKind} round=${roundConfig.name} passed (hotUpdate=${hotUpdateEffectiveMs}ms, rollback=${rollbackEffectiveMs}ms)\n`,
    )

    baselineMtime = {
      wxml: await getMtime(watchCase.outputWxml),
      js: await getMtime(watchCase.outputJs),
    }
  }

  const preferredRound = resolvePreferredRound(roundMetrics)

  if (!preferredRound) {
    throw new Error(`[${watchCase.label}] no round metrics produced for mutation=${mutationKind}`)
  }

  return {
    mutationKind,
    sourceFile: sourcePath,
    marker: preferredRound.marker,
    classLiteral: preferredRound.classLiteral,
    classTokens: preferredRound.classTokens,
    escapedClasses: preferredRound.escapedClasses,
    rounds: roundMetrics,
    roundComparison: buildRoundComparison(roundMetrics),
    verifyEscapedIn: mutation.verifyEscapedIn,
    verifyClassLiteralIn,
    globalStyleOutputs,
    minRequiredGlobalStyleEscapedClasses,
    verifiedGlobalStyleEscapedClasses: Array.from(verifiedGlobalEscapedClasses),
    hotUpdateOutputMs: preferredRound.hotUpdateOutputMs,
    hotUpdateEffectiveMs: preferredRound.hotUpdateEffectiveMs,
    rollbackOutputMs: preferredRound.rollbackOutputMs,
    rollbackEffectiveMs: preferredRound.rollbackEffectiveMs,
  }
}

async function runStyleMutation(
  watchCase: WatchCase,
  options: CliOptions,
  session: WatchSession,
  styleMutation: StyleMutationConfig,
  sourceOriginal: string,
  outputStyleCandidates: string[],
): Promise<StyleMutationMetrics> {
  const payload = createStyleMutationPayload(watchCase)
  const sourcePath = styleMutation.sourceFile
  const mutatedSource = styleMutation.mutate(sourceOriginal, payload)

  if (mutatedSource === sourceOriginal) {
    throw new Error(`[${watchCase.label}] style mutation produced no source change`)
  }

  const collectOutputCandidateMtimes = async () => {
    const entries = await Promise.all(
      outputStyleCandidates.map(async (candidate) => {
        return [candidate, await getMtime(candidate)] as const
      }),
    )
    return new Map(entries)
  }

  const waitForOutputCandidateMtimeChanged = async (
    baselineMtimes: Map<string, number>,
    startedAt: number,
    phase: 'hot-update' | 'rollback',
  ) => {
    return waitFor(
      async () => {
        for (const candidate of outputStyleCandidates) {
          const baselineMtime = baselineMtimes.get(candidate) ?? 0
          const currentMtime = await getMtime(candidate)
          if (currentMtime > baselineMtime) {
            return true
          }
        }
        return false
      },
      {
        timeoutMs: options.timeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] style output candidates were not updated during ${phase}: ${outputStyleCandidates.map(formatPath).join(', ')}`,
        onTick: session.ensureRunning,
      },
      startedAt,
    )
  }

  const baselineOutputCandidateMtimes = await collectOutputCandidateMtimes()
  const hotUpdateStartedAt = Date.now()
  await fs.writeFile(sourcePath, mutatedSource, 'utf8')
  const hotUpdateOutputMs = await waitForOutputCandidateMtimeChanged(
    baselineOutputCandidateMtimes,
    hotUpdateStartedAt,
    'hot-update',
  )
  let resolvedOutputStyle: string | undefined
  const hotUpdateEffectiveMs = await waitFor(
    async () => {
      for (const candidate of outputStyleCandidates) {
        const content = await readFileIfExists(candidate)
        if (content?.includes(payload.styleNeedle)) {
          resolvedOutputStyle = candidate
          return true
        }
      }
      return false
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${watchCase.label}] style output candidates are missing needle ${payload.styleNeedle}: ${outputStyleCandidates.map(formatPath).join(', ')}`,
      onTick: session.ensureRunning,
    },
    hotUpdateStartedAt,
  )

  if (!resolvedOutputStyle) {
    throw new Error(`[${watchCase.label}] failed to resolve style output after mutation`)
  }

  const updatedStyle = await fs.readFile(resolvedOutputStyle, 'utf8')
  assertContains(updatedStyle, payload.styleNeedle, `[${watchCase.label}] updated style output (${formatPath(resolvedOutputStyle)})`)

  const outputCandidateMtimesAfterHotUpdate = await collectOutputCandidateMtimes()
  const rollbackStartedAt = Date.now()
  await fs.writeFile(sourcePath, sourceOriginal, 'utf8')
  const rollbackOutputMs = await waitForOutputCandidateMtimeChanged(
    outputCandidateMtimesAfterHotUpdate,
    rollbackStartedAt,
    'rollback',
  )
  let rollbackEffectiveMs = rollbackOutputMs
  let rollbackNeedleCleared = false
  try {
    rollbackEffectiveMs = await waitFor(
      async () => {
        for (const candidate of outputStyleCandidates) {
          const content = await readFileIfExists(candidate)
          if (content?.includes(payload.styleNeedle)) {
            return false
          }
        }
        return true
      },
      {
        timeoutMs: options.timeoutMs,
        pollMs: options.pollMs,
        message: `[${watchCase.label}] style output candidates still contain needle ${payload.styleNeedle}: ${outputStyleCandidates.map(formatPath).join(', ')}`,
        onTick: session.ensureRunning,
      },
      rollbackStartedAt,
    )
    rollbackNeedleCleared = true
  }
  catch {
    process.stdout.write(
      `[watch-hmr] ${watchCase.label} mutation=style rollback marker still present in candidate outputs, fallback to output latency metric\n`,
    )
  }

  process.stdout.write(
    `[watch-hmr] ${watchCase.label} mutation=style passed (hotUpdate=${hotUpdateEffectiveMs}ms, rollback=${rollbackEffectiveMs}ms)\n`,
  )

  return {
    mutationKind: 'style',
    sourceFile: sourcePath,
    outputStyle: resolvedOutputStyle,
    marker: payload.marker,
    styleNeedle: payload.styleNeedle,
    hotUpdateOutputMs,
    hotUpdateEffectiveMs,
    rollbackOutputMs,
    rollbackEffectiveMs,
    rollbackNeedleCleared,
  }
}

interface SummarySample {
  hotUpdateEffectiveMs: number
  rollbackEffectiveMs: number
}

function summarizeSamples(samples: SummarySample[]): WatchSummary {
  const count = samples.length
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

  const hotUpdateDurations = samples.map(item => item.hotUpdateEffectiveMs)
  const rollbackDurations = samples.map(item => item.rollbackEffectiveMs)
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

function summarizeMetrics(cases: WatchCaseMetrics[]): WatchSummary {
  return summarizeSamples(
    cases.map(item => ({
      hotUpdateEffectiveMs: item.hotUpdateEffectiveMs,
      rollbackEffectiveMs: item.rollbackEffectiveMs,
    })),
  )
}

function summarizeMetricsForRound(cases: WatchCaseMetrics[], roundName: MutationRoundName): WatchSummary {
  const projected = cases
    .map((item) => {
      return item.rounds.find(round => round.roundName === roundName)
    })
    .filter((item): item is MutationRoundMetrics => Boolean(item))
    .map((round) => {
      return {
        hotUpdateEffectiveMs: round.hotUpdateEffectiveMs,
        rollbackEffectiveMs: round.rollbackEffectiveMs,
      }
    })

  return summarizeSamples(projected)
}

function summarizeMetricsByRound(cases: WatchCaseMetrics[]) {
  const summaryByRound: Partial<Record<MutationRoundName, WatchSummary>> = {}
  for (const roundName of resolveMutationRoundConfigs().map(item => item.name)) {
    summaryByRound[roundName] = summarizeMetricsForRound(cases, roundName)
  }
  return summaryByRound
}

function summarizeMetricsByGroup(cases: WatchCaseMetrics[]) {
  const summaryByGroup: Partial<Record<WatchProjectGroup, WatchSummary>> = {}
  for (const groupName of ['demo', 'apps'] as const) {
    const groupCases = cases.filter(item => item.projectGroup === groupName)
    summaryByGroup[groupName] = summarizeMetrics(groupCases)
  }
  return summaryByGroup
}

function summarizeMetricsByProject(cases: WatchCaseMetrics[]) {
  const grouped: Record<string, WatchCaseMetrics[]> = {}
  for (const item of cases) {
    if (!grouped[item.project]) {
      grouped[item.project] = []
    }
    grouped[item.project].push(item)
  }

  const summaryByProject: Record<string, WatchSummary> = {}
  for (const [projectName, projectCases] of Object.entries(grouped)) {
    summaryByProject[projectName] = summarizeMetrics(projectCases)
  }

  return summaryByProject
}

function summarizeMutationMetricsByKind(mutations: WatchCaseMutationMetrics[]) {
  const summaryByMutationKind: Partial<Record<MutationKind, WatchSummary>> = {}

  for (const mutationKind of ['template', 'script', 'style'] as const) {
    const samples: SummarySample[] = []
    for (const item of mutations) {
      if (item.mutationKind !== mutationKind) {
        continue
      }

      if (item.mutationKind === 'style') {
        samples.push({
          hotUpdateEffectiveMs: item.hotUpdateEffectiveMs,
          rollbackEffectiveMs: item.rollbackEffectiveMs,
        })
        continue
      }

      const preferredRound = resolvePreferredRound(item.rounds)
      if (!preferredRound) {
        continue
      }
      samples.push({
        hotUpdateEffectiveMs: preferredRound.hotUpdateEffectiveMs,
        rollbackEffectiveMs: preferredRound.rollbackEffectiveMs,
      })
    }

    summaryByMutationKind[mutationKind] = summarizeSamples(samples)
  }

  return summaryByMutationKind
}

function summarizeMutationKindAcrossCases(cases: WatchCaseMetrics[]) {
  const allMutations = cases.flatMap(item => item.mutationMetrics)
  return summarizeMutationMetricsByKind(allMutations)
}

function resolveReportPath(baseCwd: string, file: string) {
  return path.isAbsolute(file) ? file : path.resolve(baseCwd, file)
}

function resolveRepositoryRootLabel(baseCwd: string) {
  const label = path.basename(baseCwd)
  return label || 'workspace'
}

async function writeReport(baseCwd: string, options: CliOptions, metrics: WatchCaseMetrics[]) {
  if (!options.reportFile) {
    return
  }

  const summary = summarizeMetrics(metrics)
  const summaryByRound = summarizeMetricsByRound(metrics)
  const summaryByGroup = summarizeMetricsByGroup(metrics)
  const summaryByProject = summarizeMetricsByProject(metrics)
  const summaryByMutationKind = summarizeMutationKindAcrossCases(metrics)
  const reportPath = resolveReportPath(baseCwd, options.reportFile)

  const report: WatchReport = {
    generatedAt: new Date().toISOString(),
    repositoryRoot: resolveRepositoryRootLabel(baseCwd),
    options: {
      caseName: options.caseName,
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      skipBuild: options.skipBuild,
      quietSass: options.quietSass,
      maxHotUpdateMs: options.maxHotUpdateMs,
    },
    summary,
    summaryByRound,
    summaryByGroup,
    summaryByProject,
    summaryByMutationKind,
    cases: metrics,
  }

  await fs.mkdir(path.dirname(reportPath), { recursive: true })
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  process.stdout.write(`[watch-hmr] report written: ${formatPath(reportPath)}\n`)
}

function resolveCaseSourceFiles(watchCase: WatchCase) {
  return Array.from(
    new Set([
      watchCase.templateMutation.sourceFile,
      watchCase.scriptMutation.sourceFile,
      watchCase.styleMutation.sourceFile,
    ]),
  )
}

async function runCase(watchCase: WatchCase, options: CliOptions): Promise<WatchCaseMetrics> {
  const caseStartedAt = Date.now()
  const sourceFiles = resolveCaseSourceFiles(watchCase)
  const sourceOriginals = new Map<string, string>()

  for (const sourceFile of sourceFiles) {
    sourceOriginals.set(sourceFile, await fs.readFile(sourceFile, 'utf8'))
  }

  const sessionStartedAt = Date.now()
  const session = createWatchSession(watchCase.cwd, watchCase.devScript, {
    quietSass: options.quietSass,
  }, watchCase.env)

  try {
    const outputsReadyMs = await waitForOutputsReady(watchCase, options, session)
    const warmupMs = await waitForInitialWarmup(watchCase, options, session, sessionStartedAt)
    const initialReadyMs = Math.max(outputsReadyMs, warmupMs)

    const globalStyleOutputs = await resolveOutputFiles(
      watchCase,
      watchCase.globalStyleCandidates,
      'global style',
      options,
      session,
    )

    const templateSourceOriginal = sourceOriginals.get(watchCase.templateMutation.sourceFile)
    if (templateSourceOriginal == null) {
      throw new Error(`[${watchCase.label}] missing template mutation source original`)
    }

    const scriptSourceOriginal = sourceOriginals.get(watchCase.scriptMutation.sourceFile)
    if (scriptSourceOriginal == null) {
      throw new Error(`[${watchCase.label}] missing script mutation source original`)
    }

    const styleSourceOriginal = sourceOriginals.get(watchCase.styleMutation.sourceFile)
    if (styleSourceOriginal == null) {
      throw new Error(`[${watchCase.label}] missing style mutation source original`)
    }

    const templateMetrics = await runClassMutation(
      watchCase,
      options,
      session,
      'template',
      watchCase.templateMutation,
      templateSourceOriginal,
      globalStyleOutputs,
    )

    const scriptMetrics = await runClassMutation(
      watchCase,
      options,
      session,
      'script',
      watchCase.scriptMutation,
      scriptSourceOriginal,
      globalStyleOutputs,
    )

    const styleMetrics = await runStyleMutation(
      watchCase,
      options,
      session,
      watchCase.styleMutation,
      styleSourceOriginal,
      watchCase.outputStyleCandidates,
    )

    const preferredRound = resolvePreferredRound(templateMetrics.rounds)
    if (!preferredRound) {
      throw new Error(`[${watchCase.label}] no preferred round produced for template mutation`)
    }

    const mutationMetrics: WatchCaseMutationMetrics[] = [
      templateMetrics,
      scriptMetrics,
      styleMetrics,
    ]

    const metrics: WatchCaseMetrics = {
      name: watchCase.name,
      label: watchCase.label,
      project: watchCase.project,
      projectGroup: watchCase.group,
      marker: preferredRound.marker,
      classLiteral: preferredRound.classLiteral,
      classTokens: preferredRound.classTokens,
      escapedClasses: preferredRound.escapedClasses,
      rounds: templateMetrics.rounds,
      roundComparison: templateMetrics.roundComparison,
      verifyEscapedIn: templateMetrics.verifyEscapedIn,
      verifyClassLiteralIn: templateMetrics.verifyClassLiteralIn,
      globalStyleOutputs,
      mutationMetrics,
      summaryByMutationKind: summarizeMutationMetricsByKind(mutationMetrics),
      initialReadyMs,
      hotUpdateOutputMs: preferredRound.hotUpdateOutputMs,
      hotUpdateEffectiveMs: preferredRound.hotUpdateEffectiveMs,
      rollbackOutputMs: preferredRound.rollbackOutputMs,
      rollbackEffectiveMs: preferredRound.rollbackEffectiveMs,
      totalMs: Date.now() - caseStartedAt,
    }

    process.stdout.write(
      `[watch-hmr] ${watchCase.label} passed (template=${templateMetrics.hotUpdateEffectiveMs}ms, script=${scriptMetrics.hotUpdateEffectiveMs}ms, style=${styleMetrics.hotUpdateEffectiveMs}ms)\n`,
    )

    return metrics
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const logs = session.logs()
    throw new Error(`${message}\n[${watchCase.label}] recent watch logs:\n${logs}`)
  }
  finally {
    for (const [sourcePath, original] of sourceOriginals.entries()) {
      try {
        await fs.writeFile(sourcePath, original, 'utf8')
      }
      catch {
      }
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

  for (const mutation of metrics.mutationMetrics) {
    if (mutation.mutationKind === 'style') {
      if (mutation.hotUpdateEffectiveMs > options.maxHotUpdateMs) {
        throw new Error(
          `[${metrics.label}] style hot update exceeded budget: ${mutation.hotUpdateEffectiveMs}ms > ${options.maxHotUpdateMs}ms`,
        )
      }
      continue
    }

    const preferredRound = resolvePreferredRound(mutation.rounds)
    if (preferredRound && preferredRound.hotUpdateEffectiveMs > options.maxHotUpdateMs) {
      throw new Error(
        `[${metrics.label}] ${mutation.mutationKind} hot update exceeded budget: ${preferredRound.hotUpdateEffectiveMs}ms > ${options.maxHotUpdateMs}ms`,
      )
    }
  }
}

function logSummary(
  summary: WatchSummary,
  summaryByRound: Partial<Record<MutationRoundName, WatchSummary>>,
  summaryByGroup: Partial<Record<WatchProjectGroup, WatchSummary>>,
  summaryByMutationKind: Partial<Record<MutationKind, WatchSummary>>,
) {
  process.stdout.write(
    `[watch-hmr] summary: cases=${summary.count}, hotUpdate(avg/min/max)=${summary.hotUpdateAvgMs}/${summary.hotUpdateMinMs}/${summary.hotUpdateMaxMs}ms, rollback(avg/min/max)=${summary.rollbackAvgMs}/${summary.rollbackMinMs}/${summary.rollbackMaxMs}ms\n`,
  )

  for (const [roundName, roundSummary] of Object.entries(summaryByRound)) {
    if (!roundSummary) {
      continue
    }
    process.stdout.write(
      `[watch-hmr] round ${roundName}: cases=${roundSummary.count}, hotUpdate(avg/min/max)=${roundSummary.hotUpdateAvgMs}/${roundSummary.hotUpdateMinMs}/${roundSummary.hotUpdateMaxMs}ms, rollback(avg/min/max)=${roundSummary.rollbackAvgMs}/${roundSummary.rollbackMinMs}/${roundSummary.rollbackMaxMs}ms\n`,
    )
  }

  for (const [groupName, groupSummary] of Object.entries(summaryByGroup)) {
    if (!groupSummary) {
      continue
    }
    process.stdout.write(
      `[watch-hmr] group ${groupName}: cases=${groupSummary.count}, hotUpdate(avg/min/max)=${groupSummary.hotUpdateAvgMs}/${groupSummary.hotUpdateMinMs}/${groupSummary.hotUpdateMaxMs}ms, rollback(avg/min/max)=${groupSummary.rollbackAvgMs}/${groupSummary.rollbackMinMs}/${groupSummary.rollbackMaxMs}ms\n`,
    )
  }

  for (const [kindName, kindSummary] of Object.entries(summaryByMutationKind)) {
    if (!kindSummary) {
      continue
    }
    process.stdout.write(
      `[watch-hmr] mutation ${kindName}: cases=${kindSummary.count}, hotUpdate(avg/min/max)=${kindSummary.hotUpdateAvgMs}/${kindSummary.hotUpdateMinMs}/${kindSummary.hotUpdateMaxMs}ms, rollback(avg/min/max)=${kindSummary.rollbackAvgMs}/${kindSummary.rollbackMinMs}/${kindSummary.rollbackMaxMs}ms\n`,
    )
  }
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
  const summaryByRound = summarizeMetricsByRound(metrics)
  const summaryByGroup = summarizeMetricsByGroup(metrics)
  const summaryByMutationKind = summarizeMutationKindAcrossCases(metrics)
  logSummary(summary, summaryByRound, summaryByGroup, summaryByMutationKind)
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
