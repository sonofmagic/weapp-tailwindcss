import type { DemoE2eMemorySample, DemoE2eMemoryStepReport } from './demo-e2e-memory'
import { spawn } from 'node:child_process'
import { copyFile, mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createDemoE2eMemoryReport, sampleProcessTree, summarizeMemorySamples } from './demo-e2e-memory'

type StepStatus = 'passed' | 'failed' | 'skipped'

interface LocalFullRunStep {
  name: string
  command: string[]
  env?: Record<string, string>
  optional?: boolean
  artifactFiles?: Array<{
    from: string
    to: string
  }>
  artifactGlobs?: Array<{
    fromDir: string
    pattern: RegExp
    toDir: string
  }>
}

interface StepReport {
  name: string
  status: StepStatus
  command: string[]
  startedAt?: string
  endedAt?: string
  exitCode?: number
  summary: ReturnType<typeof summarizeMemorySamples>
  copiedArtifacts: string[]
  reason?: string
}

interface LocalFullRunReport {
  generatedAt: string
  repositoryRoot: string
  profile: string
  steps: StepReport[]
  summary: {
    stepCount: number
    passedStepCount: number
    failedStepCount: number
    skippedStepCount: number
    peakRssMb: number
    maxRssDeltaMb: number
  }
}

const DEFAULT_OUT_ROOT = 'e2e/reports/local-full-run'

function formatTimestamp(date = new Date()) {
  return date.toISOString().replaceAll(':', '-').replaceAll('.', '-')
}

function getArgValue(name: string) {
  const args = process.argv.slice(2)
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

function hasFlag(name: string) {
  return process.argv.slice(2).includes(name)
}

function commandText(command: string[]) {
  return command.map(part => part.includes(' ') ? JSON.stringify(part) : part).join(' ')
}

function formatDuration(ms: number) {
  const seconds = Math.round(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const restSeconds = seconds % 60
  return minutes === 0 ? `${restSeconds}s` : `${minutes}m${String(restSeconds).padStart(2, '0')}s`
}

function formatMb(value: number) {
  return `${Math.round(value)}MB`
}

function parseListEnv(name: string) {
  return (process.env[name] ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function selectedCases(envName: string, defaultCases: string[]) {
  const explicit = parseListEnv(envName)
  return explicit.length > 0 ? explicit : defaultCases
}

function caseEnv(name: string, cases: string[]) {
  return cases.length > 0 ? { [name]: cases.join(',') } : {}
}

function buildProfileSteps(profile: string): LocalFullRunStep[] {
  const fastHmr = profile === 'smoke' || profile === 'hmr-smoke'
  const miniCases = selectedCases('LOCAL_FULL_REPORT_MINI_CASES', [
    'uni-app-vite-tailwindcss-v4',
    'weapp-vite-tailwindcss-v4',
    'mpx-tailwindcss-v4',
    'taro-webpack-react-tailwindcss-v4',
    'taro-webpack-vue3-tailwindcss-v4',
  ])
  const hbuilderxCases = selectedCases('LOCAL_FULL_REPORT_HBUILDERX_CASES', [
    'uni-app-vite-vue3-hbuilderx-tailwindcss-v4',
    'uni-app-x-hbuilderx-tailwindcss-v4',
  ])

  const steps: LocalFullRunStep[] = [
    {
      name: 'quality',
      command: ['pnpm', 'build:ci'],
    },
    {
      name: 'mini-program-hmr-memory',
      command: ['pnpm', 'e2e:demo:weapp-memory', '--stage', 'hmr', '--out-dir', path.join('.tmp', 'local-full-report-weapp-memory')],
      env: {
        DEMO_WEAPP_MEMORY_CASE: miniCases.join(','),
        WEAPP_TW_HMR_MEMORY_DEBUG: '1',
        ...(fastHmr ? { E2E_WATCH_MAIN_STYLE_ONLY: '1' } : {}),
      },
      artifactFiles: [
        {
          from: path.join('.tmp', 'local-full-report-weapp-memory', 'README.md'),
          to: 'weapp-memory/README.md',
        },
        {
          from: path.join('.tmp', 'local-full-report-weapp-memory', 'summary.json'),
          to: 'weapp-memory/summary.json',
        },
      ],
      artifactGlobs: [
        {
          fromDir: path.join('.tmp', 'local-full-report-weapp-memory', 'projects'),
          pattern: /\.md$/,
          toDir: path.join('weapp-memory', 'projects'),
        },
        {
          fromDir: 'e2e/benchmark/e2e-watch-hmr',
          pattern: /^hmr-full-report-.+\.(?:json|md)$/,
          toDir: 'hmr',
        },
      ],
    },
    {
      name: 'h5-hmr',
      command: ['pnpm', 'e2e:h5'],
    },
    {
      name: 'visual-weapp-h5-app',
      command: ['pnpm', 'exec', 'tsx', 'scripts/demo-visual-e2e-report.ts', '--fail-on-incomplete'],
      optional: true,
      artifactFiles: [
        {
          from: 'e2e/.artifacts/demo-visual/full/report.md',
          to: 'visual/report.md',
        },
        {
          from: 'e2e/.artifacts/demo-visual/full/report.json',
          to: 'visual/report.json',
        },
      ],
    },
    {
      name: 'hbuilderx-android',
      command: ['pnpm', 'e2e:hbuilderx:local:android'],
      env: caseEnv('E2E_HBUILDERX_CASE', hbuilderxCases),
      optional: true,
    },
    {
      name: 'hbuilderx-ios',
      command: ['pnpm', 'e2e:hbuilderx:local:ios'],
      env: caseEnv('E2E_HBUILDERX_CASE', hbuilderxCases),
      optional: true,
    },
    {
      name: 'hbuilderx-harmony',
      command: ['pnpm', 'e2e:hbuilderx:local:harmony'],
      env: caseEnv('E2E_HBUILDERX_CASE', hbuilderxCases),
      optional: true,
    },
  ]

  if (profile === 'hmr-smoke') {
    return steps.filter(step => step.name === 'mini-program-hmr-memory')
  }

  if (profile === 'smoke') {
    return steps.filter(step => ['quality', 'mini-program-hmr-memory', 'h5-hmr'].includes(step.name))
  }
  return steps
}

async function copyArtifact(root: string, artifact: NonNullable<LocalFullRunStep['artifactFiles']>[number]) {
  const source = path.resolve(artifact.from)
  const target = path.join(root, artifact.to)
  await mkdir(path.dirname(target), { recursive: true })
  await copyFile(source, target)
  return path.relative(process.cwd(), target)
}

async function copyArtifactGlobSince(root: string, glob: NonNullable<LocalFullRunStep['artifactGlobs']>[number], sinceMs: number) {
  const sourceDir = path.resolve(glob.fromDir)
  const entries = await readdir(sourceDir).catch(() => [])
  const copied: string[] = []
  for (const entry of entries.filter(name => glob.pattern.test(name)).sort()) {
    const source = path.join(sourceDir, entry)
    const sourceStat = await stat(source).catch(() => undefined)
    if (!sourceStat || sourceStat.mtimeMs < sinceMs) {
      continue
    }
    const target = path.join(root, glob.toDir, entry)
    await mkdir(path.dirname(target), { recursive: true })
    await copyFile(source, target)
    copied.push(path.relative(process.cwd(), target))
  }
  return copied
}

async function runMeasuredStep(step: LocalFullRunStep, outputDir: string): Promise<StepReport> {
  const startedAt = new Date()
  const startedAtMs = startedAt.getTime()
  const samples: DemoE2eMemorySample[] = []
  process.stdout.write(`[local-full-report] ${step.name}: ${commandText(step.command)}\n`)

  const child = spawn(step.command[0]!, step.command.slice(1), {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...(step.env ?? {}),
    },
    shell: process.platform === 'win32',
    stdio: 'inherit',
  })

  const record = () => {
    const sample = sampleProcessTree(child.pid)
    if (sample) {
      samples.push(sample)
    }
  }
  const timer = setInterval(record, 1000)
  timer.unref?.()
  record()

  let spawnError: unknown
  const exitCode = await new Promise<number>((resolve) => {
    let settled = false
    child.on('error', (error) => {
      spawnError = error
      if (!settled) {
        settled = true
        resolve(1)
      }
    })
    child.on('close', (code) => {
      if (!settled) {
        settled = true
        resolve(code ?? 1)
      }
    })
  })
  clearInterval(timer)
  record()

  const endedAt = new Date()
  const summary = summarizeMemorySamples(samples)
  const copiedArtifacts: string[] = []
  for (const artifact of step.artifactFiles ?? []) {
    try {
      copiedArtifacts.push(await copyArtifact(outputDir, artifact))
    }
    catch (error) {
      copiedArtifacts.push(`missing:${artifact.from}`)
      if (!step.optional) {
        process.stderr.write(`[local-full-report] artifact missing for ${step.name}: ${artifact.from}\n`)
      }
      if (error instanceof Error) {
        process.stderr.write(`[local-full-report] ${error.message}\n`)
      }
    }
  }
  for (const glob of step.artifactGlobs ?? []) {
    copiedArtifacts.push(...await copyArtifactGlobSince(outputDir, glob, startedAtMs))
  }

  const stepReport: StepReport = {
    name: step.name,
    status: exitCode === 0 ? 'passed' : 'failed',
    command: step.command,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    exitCode,
    summary,
    copiedArtifacts,
    ...(spawnError instanceof Error ? { reason: spawnError.message } : {}),
  }

  const rawStep: DemoE2eMemoryStepReport = {
    name: step.name,
    command: step.command,
    exitCode,
    startedAt: stepReport.startedAt!,
    endedAt: stepReport.endedAt!,
    local: true,
    summary,
    samples,
  }
  const rawReport = createDemoE2eMemoryReport({
    repositoryRoot: process.cwd(),
    includeLocal: true,
    exitCode,
    steps: [rawStep],
  })
  await mkdir(path.join(outputDir, 'raw'), { recursive: true })
  await writeFile(path.join(outputDir, 'raw', `${step.name}.json`), `${JSON.stringify(rawReport, null, 2)}\n`, 'utf8')

  process.stdout.write(
    `[local-full-report] ${step.name} ${stepReport.status}: peakRSS=${summary.peakRssMb}MB rssDelta=${summary.rssDeltaMb}MB duration=${formatDuration(summary.durationMs)}\n`,
  )
  return stepReport
}

function summarizeSteps(steps: StepReport[]): LocalFullRunReport['summary'] {
  const measured = steps.filter(step => step.status !== 'skipped')
  return {
    stepCount: steps.length,
    passedStepCount: steps.filter(step => step.status === 'passed').length,
    failedStepCount: steps.filter(step => step.status === 'failed').length,
    skippedStepCount: steps.filter(step => step.status === 'skipped').length,
    peakRssMb: Math.max(0, ...measured.map(step => step.summary.peakRssMb)),
    maxRssDeltaMb: Math.max(0, ...measured.map(step => step.summary.rssDeltaMb)),
  }
}

function renderMarkdown(report: LocalFullRunReport) {
  const lines = [
    '# 本机全端测试报告',
    '',
    `- generated_at: ${report.generatedAt}`,
    `- repository_root: \`${report.repositoryRoot}\``,
    `- profile: ${report.profile}`,
    `- steps: ${report.summary.stepCount}`,
    `- passed: ${report.summary.passedStepCount}`,
    `- failed: ${report.summary.failedStepCount}`,
    `- skipped: ${report.summary.skippedStepCount}`,
    `- peak RSS: ${formatMb(report.summary.peakRssMb)}`,
    `- max RSS delta: ${formatMb(report.summary.maxRssDeltaMb)}`,
    '',
    '## 命令与内存',
    '',
    '| step | status | samples | peak RSS | RSS delta | max process RSS | peak processes | duration | artifacts | command |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |',
  ]

  for (const step of report.steps) {
    lines.push([
      step.name,
      step.status,
      String(step.summary.count),
      formatMb(step.summary.peakRssMb),
      formatMb(step.summary.rssDeltaMb),
      formatMb(step.summary.peakMaxProcessRssMb),
      String(step.summary.peakProcessCount),
      formatDuration(step.summary.durationMs),
      step.copiedArtifacts.map(item => `\`${item}\``).join('<br>') || '-',
      `\`${commandText(step.command)}\``,
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'))
  }

  lines.push(
    '',
    '## 口径',
    '',
    '- 该报告统计本机命令进程树 RSS，不包含已在命令外常驻的 IDE/模拟器进程。',
    '- HMR 细分耗时请看同目录下复制或生成的 HMR report；端到端 HMR 与插件处理耗时是不同口径。',
    '- optional step 失败会保留在报告中，便于说明本机缺少 SDK/设备/IDE 时的覆盖边界。',
    '',
  )
  return `${lines.join('\n')}\n`
}

async function writeReport(report: LocalFullRunReport, outputDir: string) {
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'summary.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await writeFile(path.join(outputDir, 'README.md'), renderMarkdown(report), 'utf8')
}

async function main() {
  const profile = getArgValue('--profile') ?? process.env['LOCAL_FULL_REPORT_PROFILE'] ?? 'full'
  const timestamp = getArgValue('--timestamp') ?? formatTimestamp()
  const outputRoot = getArgValue('--out-root') ?? DEFAULT_OUT_ROOT
  const outputDir = path.resolve(outputRoot, timestamp)
  const stopOnFailure = hasFlag('--fail-fast')
  const steps = buildProfileSteps(profile)
  const reports: StepReport[] = []

  await mkdir(outputDir, { recursive: true })
  for (const step of steps) {
    const report = await runMeasuredStep(step, outputDir)
    reports.push(report)
    await writeReport({
      generatedAt: new Date().toISOString(),
      repositoryRoot: process.cwd(),
      profile,
      steps: reports,
      summary: summarizeSteps(reports),
    }, outputDir)
    if (report.status === 'failed' && stopOnFailure && !step.optional) {
      break
    }
  }

  const report: LocalFullRunReport = {
    generatedAt: new Date().toISOString(),
    repositoryRoot: process.cwd(),
    profile,
    steps: reports,
    summary: summarizeSteps(reports),
  }
  await writeReport(report, outputDir)

  const readme = path.join(outputDir, 'README.md')
  process.stdout.write(`[local-full-report] report written: ${path.relative(process.cwd(), readme)}\n`)

  if (reports.some(step => step.status === 'failed' && !steps.find(item => item.name === step.name)?.optional)) {
    process.exitCode = 1
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
