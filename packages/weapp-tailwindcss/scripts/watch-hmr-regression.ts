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
}

interface MutationPayload {
  marker: string
  classLiteral: string
  classVariableName: string
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
) {
  const startedAt = Date.now()
  while (Date.now() - startedAt <= options.timeoutMs) {
    if (await predicate()) {
      return
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
  await waitFor(
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
) {
  await waitFor(
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
  )
}

async function waitForMarkerState(
  watchCase: WatchCase,
  marker: string,
  expected: 'present' | 'absent',
  options: CliOptions,
  session: WatchSession,
) {
  await waitFor(
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
  )
}

async function runCase(watchCase: WatchCase, options: CliOptions) {
  const seed = Date.now().toString().slice(-6)
  const arbitraryClass = `text-[23.${seed}px]`
  const dottedClass = `space-y-2.${seed}`
  const classLiteral = `${arbitraryClass} ${dottedClass}`
  const classVariableName = '__twWatchClass'
  const escapedClasses = classLiteral.split(/\s+/g).map(item => replaceWxml(item))
  const marker = `tw-watch-${watchCase.name}-${seed}`

  const sourcePath = watchCase.sourceFile
  const original = await fs.readFile(sourcePath, 'utf8')
  const mutated = watchCase.mutate(original, {
    marker,
    classLiteral,
    classVariableName,
  })

  if (mutated === original) {
    throw new Error(`[${watchCase.label}] mutated source is identical to original`)
  }

  const session = createWatchSession(watchCase.cwd, watchCase.devScript, {
    quietSass: options.quietSass,
  })

  try {
    await waitForOutputsReady(watchCase, options, session)

    const [baselineWxml, baselineJs] = await Promise.all([
      readFileIfExists(watchCase.outputWxml),
      readFileIfExists(watchCase.outputJs),
    ])

    if (!baselineWxml || !baselineJs) {
      throw new Error(`[${watchCase.label}] baseline outputs are missing`)
    }

    for (const escaped of escapedClasses) {
      assertNotContains(baselineWxml, escaped, `[${watchCase.label}] baseline wxml`)
      assertNotContains(baselineJs, escaped, `[${watchCase.label}] baseline js`)
    }

    const baselineMtime = {
      wxml: await getMtime(watchCase.outputWxml),
      js: await getMtime(watchCase.outputJs),
    }

    await fs.writeFile(sourcePath, mutated, 'utf8')
    await waitForOutputsUpdated(watchCase, baselineMtime, options, session)
    await waitForMarkerState(watchCase, marker, 'present', options, session)

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

    await fs.writeFile(sourcePath, original, 'utf8')
    await waitForOutputsUpdated(watchCase, updatedMtime, options, session)
    await waitForMarkerState(watchCase, marker, 'absent', options, session)

    process.stdout.write(`[watch-hmr] ${watchCase.label} passed\n`)
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

  for (const watchCase of selected) {
    process.stdout.write(`[watch-hmr] start ${watchCase.label} (${watchCase.devScript})\n`)
    await runCase(watchCase, options)
  }

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
