import type { DemoCoverageEntry } from '../e2e/demoCoverageMatrix'
import type { DemoE2eMemoryReport, DemoE2eMemorySample, DemoE2eMemoryStepReport, DemoE2eMemorySummary } from './demo-e2e-memory'
import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { DEMO_COVERAGE_MATRIX } from '../e2e/demoCoverageMatrix'
import {
  HOT_UPDATE_COVERED_PROJECTS,
} from '../e2e/e2eMatrix'
import {
  createDemoE2eMemoryReport,

  sampleProcessTree,
  summarizeMemorySamples,
} from './demo-e2e-memory'

const DEFAULT_OUT_DIR = 'e2e/benchmark/demo-weapp-memory'
const WHITESPACE_RE = /\s+/

interface WeappMemoryCase {
  name: string
  framework: string
  builder: string
  tailwindcss: string
  sourceShape: string
  platform: string
  buildCommand: string[]
  automatedStatic: boolean
  automatedHmr: boolean
  localStaticCommand?: string[]
  localStaticEnv?: Record<string, string>
  localHmrCommand?: string[]
  localHmrEnv?: Record<string, string>
  reason?: string
}

export interface StageReport {
  stage: 'build' | 'hmr'
  status: 'passed' | 'failed' | 'skipped'
  command: string[]
  summary: DemoE2eMemorySummary
  samples: DemoE2eMemorySample[]
  startedAt?: string
  endedAt?: string
  exitCode?: number
  reason?: string
  reportFile?: string
}

export interface ProjectReport {
  name: string
  framework: string
  builder: string
  tailwindcss: string
  sourceShape: string
  platform: string
  status: 'passed' | 'failed' | 'partial' | 'skipped'
  stages: StageReport[]
  recommendations: string[]
}

export interface WeappMemoryReport {
  generatedAt: string
  repositoryRoot: string
  cases: ProjectReport[]
  summary: {
    projectCount: number
    passedProjectCount: number
    failedProjectCount: number
    skippedProjectCount: number
    peakBuildRssMb: number
    peakHmrRssMb: number
    peakRssMb: number
    maxRssDeltaMb: number
  }
}

function hasFlag(name: string) {
  return process.argv.slice(2).includes(name)
}

function getArgValue(name: string) {
  const args = process.argv.slice(2)
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}

function resolveOutDir() {
  return getArgValue('--out-dir') ?? DEFAULT_OUT_DIR
}

function shouldIncludeLocal() {
  return hasFlag('--include-local') || process.env['DEMO_WEAPP_MEMORY_INCLUDE_LOCAL'] === '1'
}

function shouldMergeExisting() {
  return hasFlag('--merge-existing') || process.env['DEMO_WEAPP_MEMORY_MERGE_EXISTING'] === '1'
}

function shouldRebuildFromRaw() {
  return hasFlag('--from-raw') || process.env['DEMO_WEAPP_MEMORY_FROM_RAW'] === '1'
}

function parseStageFilter() {
  const value = getArgValue('--stage') ?? process.env['DEMO_WEAPP_MEMORY_STAGE']
  if (!value) {
    return undefined
  }
  const stages = new Set(value.split(',').map(item => item.trim()).filter(Boolean))
  for (const stage of stages) {
    if (stage !== 'build' && stage !== 'hmr') {
      throw new Error(`Invalid --stage value: ${stage}`)
    }
  }
  return stages as Set<'build' | 'hmr'>
}

function parseOnlyFilter() {
  const value = getArgValue('--case') ?? process.env['DEMO_WEAPP_MEMORY_CASE']
  if (!value) {
    return undefined
  }
  return new Set(value.split(',').map(item => item.trim()).filter(Boolean))
}

function resolveWeappPlatformName(platform: string) {
  return platform === 'wx' ? 'weapp' : platform
}

function packageName(name: string) {
  return `@weapp-tailwindcss-demo/${name}`
}

function buildScriptCommand(name: string, buildScript?: string) {
  if (!buildScript) {
    return []
  }
  return ['pnpm', '--filter', packageName(name), 'run', ...buildScript.split(WHITESPACE_RE).filter(Boolean)]
}

function getBuildScript(entry: DemoCoverageEntry, platform: DemoCoverageEntry['platforms'][number]) {
  return platform.buildScript ?? (entry.builder === 'vite-hbuilderx' || entry.builder === 'hbuilderx' ? 'build:mp-weixin' : undefined)
}

export function createBuildEnv(item: WeappMemoryCase) {
  if (item.framework.startsWith('taro')) {
    return {
      TARO_BUILD_STRICT: '1',
      WEAPP_TW_SKIP_INTERACTIVE_TARO_BUILD: '0',
    }
  }
  return {}
}

export function collectWeappCases(): WeappMemoryCase[] {
  const only = parseOnlyFilter()
  return DEMO_COVERAGE_MATRIX
    .filter(entry => !entry.name.startsWith('web/'))
    .map((entry): WeappMemoryCase | undefined => {
      const platform = entry.platforms.find(item => item.platform === 'weapp' || item.platform === 'wx' || item.platform === 'mp-weixin')
      if (!platform) {
        return undefined
      }
      return {
        name: entry.name,
        framework: entry.framework,
        builder: entry.builder,
        tailwindcss: entry.tailwindcss,
        sourceShape: entry.sourceShape,
        platform: resolveWeappPlatformName(platform.platform),
        buildCommand: buildScriptCommand(entry.name, getBuildScript(entry, platform)),
        automatedStatic: platform.staticCoverage === 'automated',
        automatedHmr: platform.hmrCoverage === 'automated' && HOT_UPDATE_COVERED_PROJECTS.has(entry.name),
        ...(entry.builder.includes('hbuilderx')
          ? {
              localStaticCommand: ['pnpm', 'e2e:multiplatform-build'],
              localStaticEnv: {
                E2E_MULTIPLATFORM_BUILD_CASE: `${entry.name} mp-weixin`,
              },
              localHmrCommand: ['pnpm', 'e2e:hbuilderx:local:mp'],
              localHmrEnv: {
                E2E_HBUILDERX_LOCAL: '1',
                E2E_HBUILDERX_CASE_GROUP: 'mp',
                E2E_HBUILDERX_CASE: entry.name,
              },
            }
          : {}),
        ...(platform.reason ? { reason: platform.reason } : {}),
      }
    })
    .filter((item): item is WeappMemoryCase => Boolean(item))
    .filter(item => !only || only.has(item.name))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function formatDuration(ms: number) {
  const seconds = Math.round(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const restSeconds = seconds % 60
  return minutes === 0 ? `${restSeconds}s` : `${minutes}m${String(restSeconds).padStart(2, '0')}s`
}

function commandText(command: string[]) {
  return command.map(part => part.includes(' ') ? JSON.stringify(part) : part).join(' ')
}

async function runMeasuredCommand(options: {
  name: string
  stage: 'build' | 'hmr'
  command: string[]
  env: Record<string, string>
  outDir: string
}): Promise<StageReport> {
  const startedAt = Date.now()
  const samples: DemoE2eMemorySample[] = []
  process.stdout.write(`[demo-weapp-memory] ${options.name} ${options.stage}: ${commandText(options.command)}\n`)
  const child = spawn(options.command[0]!, options.command.slice(1), {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...options.env,
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

  const summary = summarizeMemorySamples(samples)
  const stageReport: StageReport = {
    stage: options.stage,
    status: exitCode === 0 ? 'passed' : 'failed',
    command: options.command,
    summary,
    samples,
    startedAt: new Date(startedAt).toISOString(),
    endedAt: new Date().toISOString(),
    exitCode,
    ...(spawnError instanceof Error ? { reason: spawnError.message } : {}),
  }

  const stepReport: DemoE2eMemoryStepReport = {
    name: `${options.name} ${options.stage}`,
    command: options.command,
    exitCode,
    startedAt: stageReport.startedAt!,
    endedAt: stageReport.endedAt!,
    local: false,
    summary,
    samples,
  }
  const rawReport = createDemoE2eMemoryReport({
    repositoryRoot: process.cwd(),
    includeLocal: false,
    exitCode,
    steps: [stepReport],
  })
  const rawFile = path.join(options.outDir, 'raw', `${options.name}-${options.stage}.json`)
  await mkdir(path.dirname(rawFile), { recursive: true })
  await writeFile(rawFile, `${JSON.stringify(rawReport, null, 2)}\n`, 'utf8')
  stageReport.reportFile = path.relative(process.cwd(), rawFile)

  process.stdout.write(
    `[demo-weapp-memory] ${options.name} ${options.stage} ${stageReport.status}: peakRSS=${summary.peakRssMb}MB rssDelta=${summary.rssDeltaMb}MB samples=${summary.count}\n`,
  )
  return stageReport
}

export function createSkippedStage(stage: 'build' | 'hmr', reason: string): StageReport {
  return {
    stage,
    status: 'skipped',
    command: [],
    summary: summarizeMemorySamples([]),
    samples: [],
    reason,
  }
}

export function createMemoryRecommendations(project: ProjectReport) {
  const build = project.stages.find(stage => stage.stage === 'build')
  const hmr = project.stages.find(stage => stage.stage === 'hmr')
  const recommendations = [
    '优先用当前报告里的 peak RSS / RSS delta 锁定阶段：build 峰值高先查首轮 Tailwind 候选扫描与构建器产物缓存，HMR delta 高先查 watch 生命周期缓存是否持续增长。',
    '打开 WEAPP_TW_HMR_MEMORY_DEBUG=1 后，对照 HMR raw report 中的 memory debug / plugin process samples，优先定位 heapUsedMb 或单个插件阶段 RSS 峰值最高的 bundler phase。',
    '检查 weapp-tailwindcss 配置是否把 content/@source 扫描范围放大到 dist、node_modules、unpackage 或跨 demo 目录；微信端只保留真实源码和必要分包入口。',
    '对 v4 demo 优先确认 Tailwind CSS 入口发现是否复用构建图缓存，避免每次热更新重新解析全部 CSS entry；对 v3 demo 优先确认 classNameSet 没有被 vendor 普通字符串放大。',
    'HMR 阶段如果 peak process count 异常偏高，先收敛框架 dev server 子进程和 IDE/CLI 自动打开逻辑，再比较单进程 max RSS 与总 RSS 的差异。',
  ]

  if (build && hmr && hmr.summary.rssDeltaMb > build.summary.rssDeltaMb) {
    recommendations.unshift('本 demo 的 HMR RSS 增长高于 build，优先审计 watchChange/handleHotUpdate 缓存释放、runtime class set 增量刷新和构建器模块图引用。')
  }
  if (build && build.summary.peakRssMb >= 4096) {
    recommendations.unshift('build 峰值已经接近或超过 4GB，建议先缩小 Tailwind content/@source 范围，并拆分或延迟加载大型候选集合。')
  }
  if (hmr && hmr.summary.peakRssMb >= 4096) {
    recommendations.unshift('HMR 峰值已经接近或超过 4GB，建议增加连续热更新轮次后的 heap snapshot，对比 Tailwind runtime、CSS AST、ModuleInfo/loader result 缓存留存。')
  }
  if (project.builder.includes('hbuilderx')) {
    recommendations.unshift('该 demo 依赖 HBuilderX，本机环境下建议单独记录 IDE 进程 RSS；本脚本只统计当前命令进程树，IDE 外部常驻进程需要用系统采样补充。')
  }
  return recommendations
}

export function resolveProjectStatus(stages: StageReport[]): ProjectReport['status'] {
  const measuredStages = stages.filter(stage => stage.status !== 'skipped')
  if (measuredStages.length === 0) {
    return 'skipped'
  }
  if (measuredStages.some(stage => stage.status === 'failed')) {
    return 'failed'
  }
  if (measuredStages.every(stage => stage.status === 'passed')) {
    return 'passed'
  }
  if (stages.some(stage => stage.status === 'skipped')) {
    return 'partial'
  }
  return 'passed'
}

async function readRawStageReport(item: WeappMemoryCase, stage: 'build' | 'hmr', outDir: string): Promise<StageReport | undefined> {
  const rawFile = path.join(outDir, 'raw', `${item.name}-${stage}.json`)
  try {
    const rawReport = JSON.parse(await readFile(rawFile, 'utf8')) as DemoE2eMemoryReport
    const step = rawReport.steps[0]
    return {
      stage,
      status: rawReport.exitCode === 0 ? 'passed' : 'failed',
      command: step?.command ?? [],
      summary: step?.summary ?? rawReport.summary,
      samples: step?.samples ?? [],
      startedAt: step?.startedAt,
      endedAt: step?.endedAt,
      exitCode: rawReport.exitCode,
      reportFile: path.relative(process.cwd(), rawFile),
    }
  }
  catch {
    return undefined
  }
}

function createMissingRawStage(item: WeappMemoryCase, stage: 'build' | 'hmr'): StageReport {
  if (item.builder.includes('hbuilderx')) {
    return createSkippedStage(stage, item.reason ?? `该微信小程序端 ${stage} 依赖本机 HBuilderX；传入 --include-local 可尝试执行。`)
  }
  if (stage === 'build' && !item.automatedStatic) {
    return createSkippedStage(stage, item.reason ?? '该微信小程序端构建在覆盖矩阵中不是 automated；传入 --include-local 可尝试本机依赖链路。')
  }
  if (stage === 'hmr' && !item.automatedHmr) {
    return createSkippedStage(stage, item.reason ?? '该微信小程序端 HMR 在覆盖矩阵中不是 automated；传入 --include-local 可尝试本机依赖链路。')
  }
  return createSkippedStage(stage, `未找到 raw/${item.name}-${stage}.json；请运行对应 ${stage} 阶段后再执行 --from-raw 重建汇总。`)
}

async function createProjectFromRawReports(item: WeappMemoryCase, outDir: string): Promise<ProjectReport> {
  const stages = await Promise.all((['build', 'hmr'] as const).map(async (stage) => {
    return await readRawStageReport(item, stage, outDir) ?? createMissingRawStage(item, stage)
  }))
  const project: ProjectReport = {
    name: item.name,
    framework: item.framework,
    builder: item.builder,
    tailwindcss: item.tailwindcss,
    sourceShape: item.sourceShape,
    platform: item.platform,
    status: resolveProjectStatus(stages),
    stages,
    recommendations: [],
  }
  project.recommendations = createMemoryRecommendations(project)
  return project
}

async function runProject(item: WeappMemoryCase, outDir: string): Promise<ProjectReport> {
  const stages: StageReport[] = []
  const includeLocal = shouldIncludeLocal()
  const stageFilter = parseStageFilter()
  const shouldRunBuild = !stageFilter || stageFilter.has('build')
  const shouldRunHmr = !stageFilter || stageFilter.has('hmr')

  if (!shouldRunBuild) {
    stages.push(createSkippedStage('build', '本次通过 --stage 跳过 build 阶段。'))
  }
  else if (item.builder.includes('hbuilderx')) {
    if (includeLocal && item.localStaticCommand) {
      stages.push(await runMeasuredCommand({
        name: item.name,
        stage: 'build',
        command: item.localStaticCommand,
        env: item.localStaticEnv ?? {},
        outDir,
      }))
    }
    else {
      stages.push(createSkippedStage('build', item.reason ?? '该微信小程序端构建依赖本机 HBuilderX；传入 --include-local 可尝试执行。'))
    }
  }
  else if (item.automatedStatic) {
    stages.push(await runMeasuredCommand({
      name: item.name,
      stage: 'build',
      command: item.buildCommand,
      env: createBuildEnv(item),
      outDir,
    }))
  }
  else {
    stages.push(createSkippedStage('build', item.reason ?? '该微信小程序端构建在覆盖矩阵中不是 automated；传入 --include-local 可尝试本机依赖链路。'))
  }

  if (!shouldRunHmr) {
    stages.push(createSkippedStage('hmr', '本次通过 --stage 跳过 HMR 阶段。'))
  }
  else if (item.builder.includes('hbuilderx')) {
    if (includeLocal && item.localHmrCommand) {
      stages.push(await runMeasuredCommand({
        name: item.name,
        stage: 'hmr',
        command: item.localHmrCommand,
        env: {
          ...(item.localHmrEnv ?? {}),
          WEAPP_TW_HMR_MEMORY_DEBUG: '1',
        },
        outDir,
      }))
    }
    else {
      stages.push(createSkippedStage('hmr', item.reason ?? '该微信小程序端 HMR 依赖本机 HBuilderX；传入 --include-local 可尝试执行。'))
    }
  }
  else if (item.automatedHmr) {
    stages.push(await runMeasuredCommand({
      name: item.name,
      stage: 'hmr',
      command: ['pnpm', 'e2e:hot-update:demo'],
      env: {
        E2E_HOT_UPDATE_CASE_NAME: item.name,
        E2E_WATCH_MAX_MEMORY_RSS_MB: process.env['E2E_WATCH_MAX_MEMORY_RSS_MB'] ?? '0',
        E2E_WATCH_MAX_MEMORY_RSS_DELTA_MB: process.env['E2E_WATCH_MAX_MEMORY_RSS_DELTA_MB'] ?? '0',
        E2E_WATCH_MAX_MEMORY_HEAP_USED_MB: process.env['E2E_WATCH_MAX_MEMORY_HEAP_USED_MB'] ?? '0',
        WEAPP_TW_HMR_MEMORY_DEBUG: '1',
      },
      outDir,
    }))
  }
  else {
    stages.push(createSkippedStage('hmr', item.reason ?? '该微信小程序端 HMR 在覆盖矩阵中不是 automated；传入 --include-local 可尝试本机依赖链路。'))
  }

  const project: ProjectReport = {
    name: item.name,
    framework: item.framework,
    builder: item.builder,
    tailwindcss: item.tailwindcss,
    sourceShape: item.sourceShape,
    platform: item.platform,
    status: resolveProjectStatus(stages),
    stages,
    recommendations: [],
  }
  project.recommendations = createMemoryRecommendations(project)
  return project
}

export function summarizeReport(cases: ProjectReport[]): WeappMemoryReport['summary'] {
  const buildStages = cases.flatMap(item => item.stages.filter(stage => stage.stage === 'build'))
  const hmrStages = cases.flatMap(item => item.stages.filter(stage => stage.stage === 'hmr'))
  const measuredStages = cases.flatMap(item => item.stages.filter(stage => stage.status !== 'skipped'))
  return {
    projectCount: cases.length,
    passedProjectCount: cases.filter(item => item.status === 'passed').length,
    failedProjectCount: cases.filter(item => item.status === 'failed').length,
    skippedProjectCount: cases.filter(item => item.status === 'skipped').length,
    peakBuildRssMb: Math.max(0, ...buildStages.map(stage => stage.summary.peakRssMb)),
    peakHmrRssMb: Math.max(0, ...hmrStages.map(stage => stage.summary.peakRssMb)),
    peakRssMb: Math.max(0, ...measuredStages.map(stage => stage.summary.peakRssMb)),
    maxRssDeltaMb: Math.max(0, ...measuredStages.map(stage => stage.summary.rssDeltaMb)),
  }
}

export function renderProjectMarkdown(project: ProjectReport) {
  const lines = [
    `# ${project.name} 微信小程序端内存报告`,
    '',
    `- framework: ${project.framework}`,
    `- builder: ${project.builder}`,
    `- tailwindcss: ${project.tailwindcss}`,
    `- source_shape: ${project.sourceShape}`,
    `- platform: ${project.platform}`,
    `- status: ${project.status}`,
    '',
    '## 阶段汇总',
    '',
    '| stage | status | samples | baseline RSS | peak RSS | RSS delta | max process RSS | peak processes | duration | command |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
  ]
  for (const stage of project.stages) {
    lines.push([
      stage.stage,
      stage.status,
      String(stage.summary.count),
      `${stage.summary.baselineRssMb}MB`,
      `${stage.summary.peakRssMb}MB`,
      `${stage.summary.rssDeltaMb}MB`,
      `${stage.summary.peakMaxProcessRssMb}MB`,
      String(stage.summary.peakProcessCount),
      formatDuration(stage.summary.durationMs),
      stage.command.length ? `\`${commandText(stage.command)}\`` : (stage.reason ?? ''),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'))
  }
  lines.push('', '## 优化建议', '')
  for (const recommendation of project.recommendations) {
    lines.push(`- ${recommendation}`)
  }
  lines.push('')
  return lines.join('\n')
}

export function renderIndexMarkdown(report: WeappMemoryReport) {
  const lines = [
    '# Demo 微信小程序端内存报告汇总',
    '',
    `- generated_at: ${report.generatedAt}`,
    `- repository_root: \`${report.repositoryRoot}\``,
    `- projects: ${report.summary.projectCount}`,
    `- passed: ${report.summary.passedProjectCount}`,
    `- failed: ${report.summary.failedProjectCount}`,
    `- skipped: ${report.summary.skippedProjectCount}`,
    `- peak build RSS: ${report.summary.peakBuildRssMb}MB`,
    `- peak HMR RSS: ${report.summary.peakHmrRssMb}MB`,
    `- peak RSS: ${report.summary.peakRssMb}MB`,
    `- max RSS delta: ${report.summary.maxRssDeltaMb}MB`,
    '',
    '| demo | status | build peak RSS | HMR peak RSS | max RSS delta | report |',
    '| --- | --- | ---: | ---: | ---: | --- |',
  ]
  for (const project of report.cases) {
    const build = project.stages.find(stage => stage.stage === 'build')
    const hmr = project.stages.find(stage => stage.stage === 'hmr')
    const maxDelta = Math.max(0, ...project.stages.map(stage => stage.summary.rssDeltaMb))
    lines.push([
      project.name,
      project.status,
      `${build?.summary.peakRssMb ?? 0}MB`,
      `${hmr?.summary.peakRssMb ?? 0}MB`,
      `${maxDelta}MB`,
      `[${project.name}](./projects/${project.name}.md)`,
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'))
  }
  lines.push('')
  return lines.join('\n')
}

async function readExistingReport(outDir: string): Promise<WeappMemoryReport | undefined> {
  if (!shouldMergeExisting()) {
    return undefined
  }
  const file = path.join(outDir, 'summary.json')
  try {
    const { readFile } = await import('node:fs/promises')
    return JSON.parse(await readFile(file, 'utf8')) as WeappMemoryReport
  }
  catch {
    return undefined
  }
}

export function mergeProjectReports(existing: ProjectReport[], next: ProjectReport[]) {
  const merged = new Map(existing.map(project => [project.name, project]))
  for (const project of next) {
    const measuredNextStages = project.stages.filter(stage => stage.status !== 'skipped')
    const current = merged.get(project.name)
    if (!current) {
      merged.set(project.name, project)
      continue
    }
    const stages = current.stages.map((stage) => {
      const replacement = measuredNextStages.find(item => item.stage === stage.stage)
      return replacement ?? stage
    })
    for (const stage of measuredNextStages) {
      if (!stages.some(item => item.stage === stage.stage)) {
        stages.push(stage)
      }
    }
    const mergedProject: ProjectReport = {
      ...current,
      ...project,
      stages,
      status: resolveProjectStatus(stages),
      recommendations: [],
    }
    mergedProject.recommendations = createMemoryRecommendations(mergedProject)
    merged.set(project.name, mergedProject)
  }
  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name))
}

async function writeReports(report: WeappMemoryReport, outDir: string) {
  await mkdir(path.join(outDir, 'projects'), { recursive: true })
  const jsonFile = path.join(outDir, 'summary.json')
  const indexFile = path.join(outDir, 'README.md')
  await writeFile(jsonFile, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await writeFile(indexFile, renderIndexMarkdown(report), 'utf8')
  for (const project of report.cases) {
    await writeFile(path.join(outDir, 'projects', `${project.name}.md`), renderProjectMarkdown(project), 'utf8')
  }
  return { jsonFile, indexFile }
}

async function main() {
  const outDir = path.resolve(resolveOutDir())
  const existingReport = await readExistingReport(outDir)
  const cases = collectWeappCases()
  if (cases.length === 0) {
    throw new Error('No weapp demo cases matched.')
  }
  await mkdir(outDir, { recursive: true })

  if (shouldRebuildFromRaw()) {
    const reports = await Promise.all(cases.map(item => createProjectFromRawReports(item, outDir)))
    const { indexFile } = await writeReports({
      generatedAt: new Date().toISOString(),
      repositoryRoot: process.cwd(),
      cases: reports,
      summary: summarizeReport(reports),
    }, outDir)
    process.stdout.write(`[demo-weapp-memory] report rebuilt from raw files: ${path.relative(process.cwd(), indexFile)}\n`)
    if (reports.some(report => report.status === 'failed')) {
      process.exitCode = 1
    }
    return
  }

  const reports: ProjectReport[] = []
  let hasFailure = false
  for (const item of cases) {
    const report = await runProject(item, outDir)
    reports.push(report)
    const partialReport: WeappMemoryReport = {
      generatedAt: new Date().toISOString(),
      repositoryRoot: process.cwd(),
      cases: existingReport ? mergeProjectReports(existingReport.cases, reports) : reports,
      summary: summarizeReport(existingReport ? mergeProjectReports(existingReport.cases, reports) : reports),
    }
    await writeReports(partialReport, outDir)
    if (report.status === 'failed') {
      hasFailure = true
      if (!hasFlag('--continue-on-error')) {
        break
      }
    }
  }

  const finalCases = existingReport ? mergeProjectReports(existingReport.cases, reports) : reports
  const { indexFile } = await writeReports({
    generatedAt: new Date().toISOString(),
    repositoryRoot: process.cwd(),
    cases: finalCases,
    summary: summarizeReport(finalCases),
  }, outDir)
  process.stdout.write(`[demo-weapp-memory] report written: ${path.relative(process.cwd(), indexFile)}\n`)
  if (hasFailure) {
    process.exitCode = 1
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
    process.exitCode = 1
  })
}
