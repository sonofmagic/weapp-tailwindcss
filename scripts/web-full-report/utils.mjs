import { spawnSync } from 'node:child_process'
import fssync from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { gzipSync } from 'node:zlib'

export function createPaths(repoRoot, outputArg) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportRoot = outputArg
    ? path.resolve(repoRoot, outputArg)
    : path.join(repoRoot, 'demo', 'web', 'report', 'web-full-report', timestamp)
  return {
    reportRoot,
    compareOutput: path.join(reportRoot, 'compare'),
    logsDir: path.join(reportRoot, 'logs'),
    hmrOutFile: path.join(reportRoot, 'hmr.json'),
    reportJsonFile: path.join(reportRoot, 'report.json'),
    readmeFile: path.join(reportRoot, 'README.md'),
  }
}

export function parseArgs(argv) {
  const args = {
    output: process.env.WEB_FULL_REPORT_OUTPUT,
  }
  for (let index = 0; index < argv.length; index++) {
    const item = argv[index]
    if (item === '--output' || item === '-o') {
      args.output = argv[++index]
      continue
    }
    if (item.startsWith('--output=')) {
      args.output = item.slice('--output='.length)
      continue
    }
    if (item === '--help' || item === '-h') {
      args.help = true
    }
  }
  return args
}

export function helpText() {
  return [
    'Usage: pnpm demo:web:full-report [--output <dir>]',
    '',
    'Runs demo/web build, compare screenshots/CSS checks, HMR timing checks,',
    'then writes README.md, report.json, hmr.json and logs.',
    '',
    'Default output: demo/web/report/web-full-report/<timestamp>',
  ].join('\n')
}

export function rel(repoRoot, file) {
  return path.relative(repoRoot, file) || '.'
}

export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function runCapture(command, args, options = {}) {
  const startedAt = Date.now()
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? options.repoRoot,
    env: {
      ...process.env,
      NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--max-old-space-size=8192',
      ...(options.env ?? {}),
    },
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 1024 * 1024 * 80,
  })
  return {
    command: [command, ...args],
    cwd: rel(options.repoRoot, options.cwd ?? options.repoRoot),
    exitCode: result.status,
    signal: result.signal,
    durationMs: Date.now() - startedAt,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}

export async function runCommandRecord(context, name, command, args, options = {}) {
  const result = runCapture(command, args, {
    ...options,
    repoRoot: context.repoRoot,
  })
  const logFile = path.join(context.logsDir, `${name}.log`)
  await fs.writeFile(logFile, [
    `$ ${[command, ...args].join(' ')}`,
    `cwd: ${result.cwd}`,
    `exitCode: ${result.exitCode}`,
    `durationMs: ${result.durationMs}`,
    '',
    '--- stdout ---',
    result.stdout,
    '',
    '--- stderr ---',
    result.stderr,
  ].join('\n'))
  return {
    name,
    command: result.command,
    cwd: result.cwd,
    exitCode: result.exitCode,
    signal: result.signal,
    durationMs: result.durationMs,
    logFile: rel(context.repoRoot, logFile),
  }
}

async function gzipSize(file) {
  return gzipSync(await fs.readFile(file)).length
}

async function listFiles(repoRoot, dir) {
  const out = []
  async function walk(current) {
    let entries = []
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    }
    catch {
      return
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
      }
      else if (entry.isFile()) {
        const stat = await fs.stat(full)
        out.push({
          file: rel(repoRoot, full),
          relativeFile: path.relative(dir, full),
          size: stat.size,
          gzipSize: await gzipSize(full),
        })
      }
    }
  }
  await walk(dir)
  return out.sort((a, b) => b.size - a.size)
}

export async function collectArtifacts(repoRoot, project, target) {
  const outputDir = path.join(repoRoot, 'demo', 'web', project, target === 'weapp' ? 'dist-weapp' : 'dist')
  const files = await listFiles(repoRoot, outputDir)
  const cssFiles = files.filter(item => item.relativeFile.endsWith('.css'))
  const cssTexts = []
  for (const file of cssFiles) {
    cssTexts.push(await fs.readFile(path.join(repoRoot, file.file), 'utf8'))
  }
  const css = cssTexts.join('\n')
  return {
    outputDir: rel(repoRoot, outputDir),
    exists: fssync.existsSync(outputDir),
    fileCount: files.length,
    totalSize: files.reduce((sum, item) => sum + item.size, 0),
    totalGzipSize: files.reduce((sum, item) => sum + item.gzipSize, 0),
    cssFileCount: cssFiles.length,
    cssTotalSize: cssFiles.reduce((sum, item) => sum + item.size, 0),
    largestFiles: files.slice(0, 8),
    cssChecks: target === 'weapp' ? createWeappCssChecks(css) : undefined,
  }
}

export function createWeappCssChecks(css) {
  const hasRawArbitrarySelector = css.split(/[,{]/).some(part => part.trimStart().startsWith('.') && part.includes('['))
  const checks = [
    ['contains normal utility selector', /\.p-6\s*\{/.test(css)],
    ['contains responsive utility selector', /\.md_cgrid-cols-4\s*\{/.test(css)],
    ['contains escaped hex arbitrary selector', /\.bg-_b_h123456_B\s*\{/.test(css)],
    ['contains escaped arbitrary property selector', /\._bbox-shadow_c0_2_d5px_7_d5px_rgba_p18_m52_m86_m0_d35_P_B\s*\{/.test(css)],
    ['contains escaped decimal arbitrary radius selector', /\.rounded-_b18_d5px_B\s*\{/.test(css)],
    ['contains escaped important decimal padding selector', /\._ep-_b18_d5px_B\s*\{/.test(css)],
    ['does not emit raw arbitrary selectors', !hasRawArbitrarySelector],
    ['does not leave Tailwind directives uncompiled', !/@(?:tailwind|source|import)\b/.test(css)],
  ].map(([name, pass]) => ({ name, pass }))
  return {
    failedCount: checks.filter(item => !item.pass).length,
    checks,
  }
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return '-'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`
}

export function statusText(exitCode) {
  return exitCode === 0 ? 'passed' : `failed (${exitCode})`
}

export function checksSummary(checks) {
  if (!checks) {
    return '-'
  }
  return checks.failedCount === 0 ? 'passed' : `failed ${checks.failedCount}`
}
