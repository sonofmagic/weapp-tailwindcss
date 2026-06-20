import type { ProjectEntry } from '../e2e/shared.ts'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { createHash as createNodeHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { E2E_PROJECTS } from '../e2e/projectEntries.ts'
import { getProjectCssSnapshotFiles } from '../e2e/shared.ts'
import { collectCssSnapshots, normalizeCssTextSnapshot } from '../e2e/snapshotUtils.ts'

type PluginHtmlMode = 'with-plugin-html' | 'without-plugin-html'

interface CssArtifact {
  fileName: string
  artifact: string
  bytes: number
  lines: number
  selectors: number
  hasTaroSelector: boolean
  hasWeappEscapedArbitrarySelector: boolean
  h5AliasSelectors: number
  rawHtmlTagSelectors: number
  cursorDeclarations: number
  sha256: string
}

interface ModeResult {
  mode: PluginHtmlMode
  status: 'passed' | 'failed'
  command: string
  durationMs: number
  artifacts: CssArtifact[]
  error?: string
}

interface ProjectReport {
  project: string
  cssFiles: string[]
  modes: ModeResult[]
  comparison: {
    sameArtifactCount: boolean
    sameHashes: boolean
    changedFiles: string[]
    onlyWithPluginHtml: string[]
    onlyWithoutPluginHtml: string[]
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const demoRoot = path.resolve(repoRoot, 'demo')
const snapshotRoot = path.resolve(repoRoot, 'e2e/__snapshots__/taro-plugin-html-style-output')

const TARO_PROJECTS = E2E_PROJECTS.filter(project => project.name.startsWith('taro-'))

function isTruthyEnv(name: string) {
  const value = process.env[name]
  return value === '1' || value === 'true'
}

function getSelectedProjects() {
  const only = process.env.WEAPP_TW_TARO_PLUGIN_HTML_PROJECTS
  if (!only) {
    return TARO_PROJECTS
  }
  const selected = new Set(only.split(',').map(item => item.trim()).filter(Boolean))
  return TARO_PROJECTS.filter(project => selected.has(project.name))
}

function toSafeArtifactName(fileName: string) {
  const normalized = fileName.replace(/\\/g, '/').replace(/^\.\//, '')
  return normalized
    .split('/')
    .filter(Boolean)
    .map(segment => segment.replace(/[^\w.-]/g, '-'))
    .join('__') || 'output.wxss'
}

function countSelectors(css: string) {
  const matches = css.match(/[{}]/g)
  return matches ? matches.filter(item => item === '{').length : 0
}

function countMatches(css: string, pattern: RegExp) {
  return css.match(pattern)?.length ?? 0
}

function createHash(input: string) {
  return createNodeHash('sha256').update(input).digest('hex')
}

function normalizeReportText(input: string) {
  return `${input.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').trimEnd()}\n`
}

async function removeDir(target: string) {
  await fs.rm(target, { recursive: true, force: true })
}

async function runCommand(project: ProjectEntry, mode: PluginHtmlMode) {
  const cwd = path.resolve(demoRoot, project.name)
  const start = Date.now()
  const env = {
    ...process.env,
    TARO_BUILD_STRICT: '1',
    WEAPP_TW_TARO_PLUGIN_HTML: mode === 'with-plugin-html' ? '1' : '0',
  }

  return await new Promise<ModeResult>((resolve) => {
    const child = spawn('pnpm', ['run', 'build:weapp'], {
      cwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const chunks: Buffer[] = []
    child.stdout.on('data', chunk => chunks.push(Buffer.from(chunk)))
    child.stderr.on('data', chunk => chunks.push(Buffer.from(chunk)))
    child.on('error', (error) => {
      resolve({
        mode,
        status: 'failed',
        command: 'pnpm run build:weapp',
        durationMs: Date.now() - start,
        artifacts: [],
        error: error.message,
      })
    })
    child.on('close', (code, signal) => {
      const output = Buffer.concat(chunks).toString('utf8')
      resolve({
        mode,
        status: code === 0 ? 'passed' : 'failed',
        command: 'pnpm run build:weapp',
        durationMs: Date.now() - start,
        artifacts: [],
        error: code === 0
          ? undefined
          : normalizeReportText(output).slice(-4000) || `exit ${signal ?? code}`,
      })
    })
  })
}

async function collectProjectArtifacts(project: ProjectEntry, mode: PluginHtmlMode) {
  const projectRoot = path.resolve(demoRoot, project.name)
  const modeRoot = path.join(snapshotRoot, project.name, mode)
  const artifactRoot = path.join(modeRoot, 'artifacts')
  await removeDir(modeRoot)
  await fs.mkdir(artifactRoot, { recursive: true })

  const artifacts: CssArtifact[] = []
  for (const cssEntry of getProjectCssSnapshotFiles(project)) {
    const snapshots = await collectCssSnapshots(projectRoot, cssEntry.cssFile, {
      rootSnapshotName: cssEntry.snapshotName,
    })
    for (const snapshot of snapshots) {
      const normalized = `${normalizeCssTextSnapshot(snapshot.content).trimEnd()}\n`
      const artifactName = toSafeArtifactName(snapshot.fileName)
      const artifactPath = path.join(artifactRoot, artifactName)
      await fs.writeFile(artifactPath, normalized, 'utf8')
      artifacts.push({
        fileName: snapshot.fileName,
        artifact: path.relative(modeRoot, artifactPath).replace(/\\/g, '/'),
        bytes: Buffer.byteLength(normalized),
        lines: normalized.split('\n').length - 1,
        selectors: countSelectors(normalized),
        hasTaroSelector: /\btaro-|\.taro\b|taro-[\w-]+/.test(normalized),
        hasWeappEscapedArbitrarySelector: /_[abcpqsl]\b|_b[^{}]+_B/.test(normalized),
        h5AliasSelectors: countMatches(normalized, /\.h5-[\w-]+/g),
        rawHtmlTagSelectors: countMatches(normalized, /(?:^|[\s>+~,])(li|img|input|textarea|video|i|div)(?=[\s.#:[>{,+~])/gm),
        cursorDeclarations: countMatches(normalized, /\bcursor\s*:/g),
        sha256: createHash(normalized),
      })
    }
  }
  return artifacts
}

function compareModes(withResult: ModeResult, withoutResult: ModeResult) {
  const withByFile = new Map(withResult.artifacts.map(item => [item.fileName, item]))
  const withoutByFile = new Map(withoutResult.artifacts.map(item => [item.fileName, item]))
  const allFiles = [...new Set([...withByFile.keys(), ...withoutByFile.keys()])].sort()
  const changedFiles: string[] = []
  const onlyWithPluginHtml: string[] = []
  const onlyWithoutPluginHtml: string[] = []

  for (const file of allFiles) {
    const withArtifact = withByFile.get(file)
    const withoutArtifact = withoutByFile.get(file)
    if (!withArtifact) {
      onlyWithoutPluginHtml.push(file)
      continue
    }
    if (!withoutArtifact) {
      onlyWithPluginHtml.push(file)
      continue
    }
    if (withArtifact.sha256 !== withoutArtifact.sha256) {
      changedFiles.push(file)
    }
  }

  return {
    sameArtifactCount: withResult.artifacts.length === withoutResult.artifacts.length,
    sameHashes: changedFiles.length === 0 && onlyWithPluginHtml.length === 0 && onlyWithoutPluginHtml.length === 0,
    changedFiles,
    onlyWithPluginHtml,
    onlyWithoutPluginHtml,
  }
}

function renderModeReadme(project: string, result: ModeResult) {
  const rows = result.artifacts.map(item =>
    `| \`${item.fileName}\` | [${item.artifact}](${item.artifact}) | ${item.bytes} | ${item.lines} | ${item.selectors} | ${item.h5AliasSelectors} | ${item.rawHtmlTagSelectors} | ${item.cursorDeclarations} | ${item.hasTaroSelector} | ${item.hasWeappEscapedArbitrarySelector} | \`${item.sha256}\` |`)

  return normalizeReportText([
    `# ${project} ${result.mode}`,
    '',
    `Status: ${result.status}`,
    `Command: \`${result.command}\``,
    `Duration: ${result.durationMs}ms`,
    '',
    '| File | Artifact | Bytes | Lines | Selectors | h5-* aliases | Raw HTML tags | Cursor declarations | Taro selector | Weapp escaped arbitrary selector | Hash |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |',
    ...rows,
    result.error ? ['', '## Error', '', '```text', result.error, '```'] : '',
  ].filter(Boolean).join('\n'))
}

function sumArtifacts(artifacts: CssArtifact[], key: 'h5AliasSelectors' | 'rawHtmlTagSelectors' | 'cursorDeclarations') {
  return artifacts.reduce((total, artifact) => total + artifact[key], 0)
}

function renderProjectReadme(report: ProjectReport) {
  const withResult = report.modes.find(item => item.mode === 'with-plugin-html')
  const withoutResult = report.modes.find(item => item.mode === 'without-plugin-html')
  const rows = report.modes.flatMap(result => result.artifacts.map(item =>
    `| ${result.mode} | \`${item.fileName}\` | [${result.mode}/${item.artifact}](${result.mode}/${item.artifact}) | ${item.bytes} | ${item.selectors} | ${item.h5AliasSelectors} | ${item.rawHtmlTagSelectors} | ${item.cursorDeclarations} | \`${item.sha256}\` |`))
  const withArtifacts = withResult?.artifacts ?? []
  const withoutArtifacts = withoutResult?.artifacts ?? []

  return normalizeReportText([
    `# ${report.project} Plugin HTML Style Output`,
    '',
    '## Core Report',
    '',
    `- with-plugin-html: ${withResult?.status ?? 'missing'}`,
    `- without-plugin-html: ${withoutResult?.status ?? 'missing'}`,
    `- same hashes: ${report.comparison.sameHashes}`,
    `- changed files: ${report.comparison.changedFiles.length === 0 ? '-' : report.comparison.changedFiles.map(file => `\`${file}\``).join(', ')}`,
    `- only with plugin-html: ${report.comparison.onlyWithPluginHtml.length === 0 ? '-' : report.comparison.onlyWithPluginHtml.map(file => `\`${file}\``).join(', ')}`,
    `- only without plugin-html: ${report.comparison.onlyWithoutPluginHtml.length === 0 ? '-' : report.comparison.onlyWithoutPluginHtml.map(file => `\`${file}\``).join(', ')}`,
    `- h5-* aliases: ${sumArtifacts(withArtifacts, 'h5AliasSelectors')} / ${sumArtifacts(withoutArtifacts, 'h5AliasSelectors')}`,
    `- raw HTML tag selectors: ${sumArtifacts(withArtifacts, 'rawHtmlTagSelectors')} / ${sumArtifacts(withoutArtifacts, 'rawHtmlTagSelectors')}`,
    `- cursor declarations: ${sumArtifacts(withArtifacts, 'cursorDeclarations')} / ${sumArtifacts(withoutArtifacts, 'cursorDeclarations')}`,
    '',
    '## File Index',
    '',
    '| Mode | File | Artifact | Bytes | Selectors | h5-* aliases | Raw HTML tags | Cursor declarations | Hash |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- |',
    ...rows,
  ].join('\n'))
}

function renderRootReadme(reports: ProjectReport[]) {
  const rows = reports.map((report) => {
    const withStatus = report.modes.find(item => item.mode === 'with-plugin-html')?.status ?? 'missing'
    const withoutStatus = report.modes.find(item => item.mode === 'without-plugin-html')?.status ?? 'missing'
    return `| [${report.project}](${report.project}/README.md) | ${withStatus} | ${withoutStatus} | ${report.comparison.sameHashes} | ${report.comparison.changedFiles.length} |`
  })

  return normalizeReportText([
    '# Taro Plugin HTML Style Output',
    '',
    '## Core Report',
    '',
    `对 ${reports.length} 个 Taro demo 分别执行 \`with-plugin-html\` 与 \`without-plugin-html\` 的 \`build:weapp\`，样式产物按项目和模式保存到子目录。`,
    '',
    '| Project | With plugin-html | Without plugin-html | Same hashes | Changed files |',
    '| --- | --- | --- | --- | ---: |',
    ...rows,
    '',
    '## File Index',
    '',
    '- 每个项目目录下的 `README.md` 是该项目核心对比报告。',
    '- 完整样式产物在 `with-plugin-html/artifacts/` 与 `without-plugin-html/artifacts/`。',
    '- 结构化结果在 `report.json`。',
  ].join('\n'))
}

async function writeProjectReport(report: ProjectReport) {
  const projectRoot = path.join(snapshotRoot, report.project)
  for (const mode of report.modes) {
    await fs.writeFile(path.join(projectRoot, mode.mode, 'README.md'), renderModeReadme(report.project, mode), 'utf8')
  }
  await fs.writeFile(path.join(projectRoot, 'README.md'), renderProjectReadme(report), 'utf8')
}

async function processProject(project: ProjectEntry) {
  const projectRoot = path.resolve(demoRoot, project.name)
  await removeDir(path.join(projectRoot, 'dist'))
  const withResult = await runCommand(project, 'with-plugin-html')
  if (withResult.status === 'passed') {
    withResult.artifacts = await collectProjectArtifacts(project, 'with-plugin-html')
  }

  await removeDir(path.join(projectRoot, 'dist'))
  const withoutResult = await runCommand(project, 'without-plugin-html')
  if (withoutResult.status === 'passed') {
    withoutResult.artifacts = await collectProjectArtifacts(project, 'without-plugin-html')
  }

  const report: ProjectReport = {
    project: project.name,
    cssFiles: getProjectCssSnapshotFiles(project).map(item => item.cssFile),
    modes: [withResult, withoutResult],
    comparison: compareModes(withResult, withoutResult),
  }
  await writeProjectReport(report)
  return report
}

async function main() {
  const projects = getSelectedProjects()
  if (projects.length === 0) {
    throw new Error('No Taro projects selected')
  }
  if (!isTruthyEnv('WEAPP_TW_KEEP_TARO_PLUGIN_HTML_SNAPSHOTS')) {
    await removeDir(snapshotRoot)
  }
  await fs.mkdir(snapshotRoot, { recursive: true })

  const reports: ProjectReport[] = []
  for (const project of projects) {
    process.stdout.write(`[taro-plugin-html] ${project.name}\n`)
    reports.push(await processProject(project))
  }

  await fs.writeFile(path.join(snapshotRoot, 'report.json'), `${JSON.stringify(reports, null, 2)}\n`, 'utf8')
  await fs.writeFile(path.join(snapshotRoot, 'README.md'), renderRootReadme(reports), 'utf8')

  const failed = reports.flatMap(report => report.modes.filter(mode => mode.status === 'failed').map(mode => `${report.project}:${mode.mode}`))
  if (failed.length > 0) {
    throw new Error(`Taro plugin-html style snapshots failed: ${failed.join(', ')}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
