import { readdir, readFile, stat } from 'node:fs/promises'
import os from 'node:os'
import process from 'node:process'
import { execa } from 'execa'
import path from 'pathe'

interface DevToolsLogFile {
  file: string
  mtimeMs: number
}

const LOG_FILE_NAMES = new Set(['stderr.log', 'stdout.log', 'launch.log', 'report.log'])

function readNumberEnv(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) {
    return fallback
  }
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function getDevToolsSupportDir() {
  return process.env['E2E_IDE_DEVTOOLS_SUPPORT_DIR']
    ?? path.join(os.homedir(), 'Library/Application Support/微信开发者工具')
}

function getMaxLogFiles() {
  return Math.max(1, readNumberEnv('E2E_IDE_DIAGNOSTIC_LOG_FILES', 8))
}

function getLogTailLines() {
  return Math.max(1, readNumberEnv('E2E_IDE_DIAGNOSTIC_LOG_LINES', 80))
}

function getProcessLineMaxChars() {
  return Math.max(80, readNumberEnv('E2E_IDE_DIAGNOSTIC_PROCESS_CHARS', 240))
}

function truncateLine(line: string, maxChars: number) {
  if (line.length <= maxChars) {
    return line
  }
  return `${line.slice(0, maxChars - 3)}...`
}

async function pathExists(file: string) {
  try {
    await stat(file)
    return true
  }
  catch {
    return false
  }
}

async function collectLogFilesFromDir(dir: string, depth: number, output: DevToolsLogFile[]) {
  if (depth < 0) {
    return
  }

  let entries: string[]
  try {
    entries = await readdir(dir)
  }
  catch {
    return
  }

  await Promise.all(entries.map(async (entry) => {
    const file = path.join(dir, entry)
    let stats
    try {
      stats = await stat(file)
    }
    catch {
      return
    }

    if (stats.isDirectory()) {
      await collectLogFilesFromDir(file, depth - 1, output)
      return
    }

    if (!stats.isFile()) {
      return
    }

    if (LOG_FILE_NAMES.has(entry) || (entry.endsWith('.log') && file.includes(`${path.sep}WeappLog${path.sep}`))) {
      output.push({ file, mtimeMs: stats.mtimeMs })
    }
  }))
}

async function collectRecentDevToolsLogFiles() {
  const supportDir = getDevToolsSupportDir()
  if (!await pathExists(supportDir)) {
    return []
  }

  const files: DevToolsLogFile[] = []
  await collectLogFilesFromDir(supportDir, 4, files)
  return files
    .sort((left, right) => right.mtimeMs - left.mtimeMs)
    .slice(0, getMaxLogFiles())
}

async function tailFile(file: string, lineCount: number) {
  try {
    const content = await readFile(file, 'utf8')
    return content.split(/\r?\n/).filter(line => line.length > 0).slice(-lineCount).join('\n').trim()
  }
  catch (error) {
    return `failed to read ${file}: ${error instanceof Error ? error.message : String(error)}`
  }
}

async function collectDevToolsProcesses() {
  if (process.env['E2E_IDE_DIAGNOSTIC_PROCESSES'] === '0') {
    return ''
  }

  try {
    const result = await execa('ps', ['-Ao', 'pid,ppid,stat,etime,command'], {
      timeout: 5000,
    })
    return result.stdout
      .split(/\r?\n/)
      .filter(line => /wechatwebdevtools|微信开发者工具|frameworkIdeProbe|pnpm e2e:ide|vitest run -c \.\/e2e\/vitest\.e2e\.config\.ts/.test(line))
      .map(line => truncateLine(line, getProcessLineMaxChars()))
      .join('\n')
      .trim()
  }
  catch (error) {
    return `failed to collect process list: ${error instanceof Error ? error.message : String(error)}`
  }
}

export async function collectFrameworkIdeDiagnostics(caseName: string) {
  const sections = [`[e2e:ide] diagnostics for ${caseName}`]
  const processSummary = await collectDevToolsProcesses()
  if (processSummary) {
    sections.push(`\n[processes]\n${processSummary}`)
  }

  const logFiles = await collectRecentDevToolsLogFiles()
  if (logFiles.length === 0) {
    sections.push(`\n[devtools logs]\nNo WeChat DevTools log files found under ${getDevToolsSupportDir()}`)
  }
  else {
    const tails = await Promise.all(logFiles.map(async ({ file, mtimeMs }) => {
      const relative = path.relative(getDevToolsSupportDir(), file)
      const content = await tailFile(file, getLogTailLines())
      return `\n[devtools log: ${relative} mtime=${new Date(mtimeMs).toISOString()}]\n${content || '(empty)'}`
    }))
    sections.push(...tails)
  }

  return sections.join('\n')
}
