import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { benchmarkProjects as projects } from './projects.mjs'

const defaultVersions = [
  { version: '4.9.8', root: '/tmp/weapp-tailwindcss-4.9.8' },
  { version: '4.10.2', root: '/tmp/weapp-tailwindcss-4.10.2' },
]

function parseNumber(flag, fallback) {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) {
    return fallback
  }
  const raw = process.argv[idx + 1]
  const n = Number(raw)
  return Number.isFinite(n) ? n : fallback
}

function parseString(flag, fallback) {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) {
    return fallback
  }
  return process.argv[idx + 1] ?? fallback
}

async function parseVersions() {
  const versionsFile = parseString('--versions-file', '')
  if (!versionsFile) {
    return defaultVersions
  }

  const versions = JSON.parse(await fs.readFile(path.resolve(versionsFile), 'utf8'))
  if (!Array.isArray(versions) || versions.length < 2) {
    throw new TypeError('--versions-file must contain at least two version roots')
  }

  return versions.map((item) => {
    if (typeof item?.version !== 'string' || typeof item?.root !== 'string') {
      throw new TypeError('--versions-file entries must include string version and root')
    }
    return {
      version: item.version,
      root: path.resolve(item.root),
    }
  })
}

function now() {
  return performance.now()
}

function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

function stddev(values) {
  const m = mean(values)
  return Math.sqrt(values.reduce((acc, v) => acc + ((v - m) ** 2), 0) / values.length)
}

function summarize(values) {
  if (values.length === 0) {
    return undefined
  }
  const sorted = [...values].sort((a, b) => a - b)
  return {
    mean: mean(values),
    median: median(values),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stddev: stddev(values),
  }
}

function summarizeSteady(values) {
  return summarize(values.slice(1)) ?? summarize(values)
}

function spawnPnpm(cwd, args, stdio = 'pipe') {
  return spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', args, {
    cwd,
    stdio,
    detached: process.platform !== 'win32',
    env: { ...process.env },
  })
}

function spawnPnpmWithEnv(cwd, args, env = {}, stdio = 'pipe') {
  return spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', args, {
    cwd,
    stdio,
    detached: process.platform !== 'win32',
    env: { ...process.env, ...env },
  })
}

const localUrlRE = /(?:Local|Loopback|Listening at):\s*(https?:\/\/\S+)/i
const devReadyLogRE = /compiled successfully|Compiled successfully|built in [\d.]+m?s?|Build complete|Watching for changes|ready in \d+/i

async function readText(file) {
  try {
    return await fs.readFile(file, 'utf8')
  }
  catch {
    return ''
  }
}

async function exists(file) {
  try {
    await fs.access(file)
    return true
  }
  catch {
    return false
  }
}

async function statMtimeMs(file) {
  try {
    return (await fs.stat(file)).mtimeMs
  }
  catch {
    return 0
  }
}

async function waitFor(check, timeoutMs, intervalMs = 120) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await check()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }
  return false
}

async function findFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('unable to resolve free port')))
        return
      }
      const { port } = address
      server.close(() => resolve(port))
    })
  })
}

function appendQuery(url, key, value) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`
}

function trimTrailingSlash(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function resolveDevServerCommand(projectMeta, port) {
  if (Array.isArray(projectMeta.devServerCommand) && projectMeta.devServerCommand.length > 0) {
    return projectMeta.devServerCommand.map(item => String(item).replaceAll('{port}', String(port)))
  }

  if (projectMeta.devScript === 'dev:h5') {
    return ['exec', 'uni', '--host', '127.0.0.1', '--port', String(port), '--strictPort']
  }

  if (projectMeta.devScript === 'dev') {
    return ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort']
  }

  return ['run', projectMeta.devScript]
}

function resolveServerProbeUrls(projectMeta, baseUrl, marker) {
  const base = trimTrailingSlash(baseUrl)
  if (Array.isArray(projectMeta.serverProbePaths) && projectMeta.serverProbePaths.length > 0) {
    return projectMeta.serverProbePaths.map(item => appendQuery(`${base}${item}`, 'twbench', marker))
  }
  const modulePath = projectMeta.serverModulePath ?? `/${projectMeta.sourceFile}`
  return [appendQuery(`${base}${modulePath}`, 'twbench', marker)]
}

async function fetchText(url) {
  const response = await fetch(url, {
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  return await response.text()
}

function resolveLoggedBaseUrls(logs, fallbackUrl) {
  const urls = new Set([fallbackUrl])
  for (const line of logs) {
    const matched = line.match(localUrlRE)?.[1]
    if (matched) {
      urls.add(matched)
    }
  }
  return Array.from(urls)
}

function hasDevReadyLog(logs) {
  return logs.some(line => devReadyLogRE.test(line))
}

async function fetchProbeText(url) {
  const html = await fetchText(url)
  const assetUrls = []
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const assetPath = match[1]
    if (!assetPath || assetPath.startsWith('http') || assetPath.startsWith('//') || assetPath.startsWith('data:')) {
      continue
    }
    assetUrls.push(new URL(assetPath, url).toString())
  }

  const assetTexts = []
  for (const assetUrl of assetUrls) {
    try {
      assetTexts.push(await fetchText(appendQuery(assetUrl, 'twbench_asset', Date.now())))
    }
    catch {
    }
  }
  return `${html}\n${assetTexts.join('\n')}`
}

function stopChild(child) {
  return new Promise((resolve) => {
    if (child.exitCode != null) {
      resolve()
      return
    }

    let done = false
    const finish = () => {
      if (done) {
        return
      }
      done = true
      resolve()
    }

    child.once('close', finish)

    try {
      if (child.pid && process.platform !== 'win32') {
        process.kill(-child.pid, 'SIGINT')
      }
      else {
        child.kill('SIGINT')
      }
    }
    catch {}

    setTimeout(() => {
      try {
        if (child.pid && process.platform !== 'win32') {
          process.kill(-child.pid, 'SIGTERM')
        }
        else {
          child.kill('SIGTERM')
        }
      }
      catch {}
    }, 1200)

    setTimeout(() => {
      try {
        if (child.pid && process.platform !== 'win32') {
          process.kill(-child.pid, 'SIGKILL')
        }
        else {
          child.kill('SIGKILL')
        }
      }
      catch {}
      finish()
    }, 4000)
  })
}

async function runBuildOnce(cwd, buildScript, timeoutMs, buildEnv = {}) {
  const start = now()
  const child = spawnPnpmWithEnv(cwd, ['run', buildScript], buildEnv, 'pipe')
  let logs = ''
  child.stdout.on('data', (chunk) => {
    logs += chunk.toString('utf8')
  })
  child.stderr.on('data', (chunk) => {
    logs += chunk.toString('utf8')
  })

  const code = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      try {
        if (child.pid && process.platform !== 'win32') {
          process.kill(-child.pid, 'SIGKILL')
        }
        else {
          child.kill('SIGKILL')
        }
      }
      catch {}
      reject(new Error(`build timeout ${timeoutMs}ms`))
    }, timeoutMs)

    child.once('error', reject)
    child.once('close', (exitCode) => {
      clearTimeout(timer)
      resolve(exitCode ?? 1)
    })
  })

  if (code !== 0) {
    throw new Error(`build failed code=${code}\n${logs.slice(-4000)}`)
  }
  if (logs.includes('[uni-build-guard]') && logs.includes('已跳过 uni-app 的真实构建')) {
    throw new Error(`build skipped by uni-build-guard; set project buildEnv.UNI_BUILD_STRICT=1 for benchmark builds\n${logs.slice(-4000)}`)
  }

  return now() - start
}

function injectContent(original, marker, injectType) {
  if (injectType === 'vue') {
    const next = original.replace('</template>', `\n  <view data-tw-bench="${marker}" class="bg-[#123456]">bench</view>\n</template>`)
    if (next === original) {
      throw new Error('inject failed: </template> not found')
    }
    return next
  }

  if (injectType === 'jsx') {
    const next = original.replace(/className=(['"])(.*?)\1/, (full, quote, classes) => {
      return `data-tw-bench=${quote}${marker}${quote} ${full.replace(classes, `${classes} bg-[#123456]`)}`
    })
    if (next === original) {
      throw new Error('inject failed: className="..." or className=\'...\' not found')
    }
    return next
  }

  const replaced = original.replace(/class="([^"]*)"/, (_full, classes) => {
    return `data-tw-bench="${marker}" class="${classes} bg-[#123456]"`
  })
  if (replaced === original) {
    return `${original}\n<view data-tw-bench="${marker}" class="bg-[#123456]">bench</view>\n`
  }
  return replaced
}

async function runHmrRounds({
  cwd,
  sourceFile,
  outputTemplate,
  outputProbeTemplates = [],
  devScript,
  injectType,
  devEnv,
  rounds,
  timeoutMs,
  pollIntervalMs,
}) {
  const sourcePath = path.join(cwd, sourceFile)
  const outputPath = path.join(cwd, outputTemplate)
  const probePaths = [outputPath, ...outputProbeTemplates.map(item => path.join(cwd, item))]
  const original = await fs.readFile(sourcePath, 'utf8')
  const initialOutputMtime = await statMtimeMs(outputPath)

  const child = spawnPnpmWithEnv(cwd, ['run', devScript], devEnv, 'pipe')
  const logs = []
  const collect = (buf) => {
    const text = buf.toString('utf8')
    for (const line of text.split(/\r?\n/)) {
      if (!line) {
        continue
      }
      logs.push(line)
      if (logs.length > 600) {
        logs.shift()
      }
    }
  }
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  try {
    const ready = await waitFor(async () => {
      if (child.exitCode != null) {
        throw new Error(`dev exited early code=${child.exitCode}\n${logs.slice(-120).join('\n')}`)
      }
      if (!(await exists(outputPath))) {
        return false
      }
      if ((await statMtimeMs(outputPath) <= initialOutputMtime) && !hasDevReadyLog(logs)) {
        return false
      }
      const text = await readText(outputPath)
      return text.trim().length > 0
    }, timeoutMs, pollIntervalMs)

    if (!ready) {
      throw new Error(`dev warmup timeout ${timeoutMs}ms\n${logs.slice(-120).join('\n')}`)
    }

    const times = []

    for (let i = 0; i < rounds; i += 1) {
      const marker = `twbench${Date.now()}${i}`
      const next = injectContent(original, marker, injectType)
      const start = now()
      await fs.writeFile(sourcePath, next, 'utf8')

      const ok = await waitFor(async () => {
        if (child.exitCode != null) {
          throw new Error(`dev exited during hmr round=${i + 1} code=${child.exitCode}\n${logs.slice(-120).join('\n')}`)
        }
        for (const probePath of probePaths) {
          const text = await readText(probePath)
          if (text.includes(marker)) {
            return true
          }
        }
        return false
      }, timeoutMs, pollIntervalMs)

      if (!ok) {
        throw new Error(`hmr round ${i + 1} timeout ${timeoutMs}ms marker=${marker}\n${logs.slice(-120).join('\n')}`)
      }

      times.push(now() - start)

      await fs.writeFile(sourcePath, original, 'utf8')
      await new Promise(resolve => setTimeout(resolve, injectType === 'wxml-class' ? 900 : 260))
    }

    await fs.writeFile(sourcePath, original, 'utf8')
    return times
  }
  finally {
    await stopChild(child)
    await fs.writeFile(sourcePath, original, 'utf8')
  }
}

async function runDevServerHmrRounds({
  cwd,
  projectMeta,
  rounds,
  timeoutMs,
  pollIntervalMs,
}) {
  const sourcePath = path.join(cwd, projectMeta.sourceFile)
  const original = await fs.readFile(sourcePath, 'utf8')
  const port = await findFreePort()
  const child = spawnPnpmWithEnv(cwd, resolveDevServerCommand(projectMeta, port), {
    BROWSER: 'none',
    ...projectMeta.devEnv,
  }, 'pipe')
  const logs = []
  const collect = (buf) => {
    const text = buf.toString('utf8')
    for (const line of text.split(/\r?\n/)) {
      if (!line) {
        continue
      }
      logs.push(line)
      if (logs.length > 600) {
        logs.shift()
      }
    }
  }
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)

  try {
    let baseUrl = `http://127.0.0.1:${port}/`
    const ready = await waitFor(async () => {
      if (child.exitCode != null) {
        throw new Error(`dev server exited early code=${child.exitCode}\n${logs.slice(-120).join('\n')}`)
      }
      for (const candidate of resolveLoggedBaseUrls(logs, `http://127.0.0.1:${port}/`)) {
        try {
          const text = await fetchText(candidate)
          if (text.trim().length > 0) {
            baseUrl = candidate
            return true
          }
        }
        catch {
        }
      }
      return false
    }, timeoutMs, pollIntervalMs)

    if (!ready) {
      throw new Error(`dev server warmup timeout ${timeoutMs}ms\n${logs.slice(-120).join('\n')}`)
    }

    const times = []
    for (let i = 0; i < rounds; i += 1) {
      const marker = `twbench${Date.now()}${i}`
      const next = injectContent(original, marker, projectMeta.injectType)
      const probeUrls = resolveServerProbeUrls(projectMeta, baseUrl, marker)
      const start = now()
      await fs.writeFile(sourcePath, next, 'utf8')

      let lastError = ''
      const ok = await waitFor(async () => {
        if (child.exitCode != null) {
          throw new Error(`dev server exited during hmr round=${i + 1} code=${child.exitCode}\n${logs.slice(-120).join('\n')}`)
        }
        for (const url of probeUrls) {
          try {
            const text = await fetchProbeText(url)
            if (text.includes(marker)) {
              return true
            }
            lastError = `${url} marker not found`
          }
          catch (error) {
            lastError = error instanceof Error ? `${url} ${error.message}` : `${url} ${String(error)}`
          }
        }
        return false
      }, timeoutMs, pollIntervalMs)

      if (!ok) {
        throw new Error(`dev server hmr round ${i + 1} timeout ${timeoutMs}ms marker=${marker}\n${lastError}\n${logs.slice(-120).join('\n')}`)
      }

      times.push(now() - start)

      await fs.writeFile(sourcePath, original, 'utf8')
      await new Promise(resolve => setTimeout(resolve, 260))
    }

    await fs.writeFile(sourcePath, original, 'utf8')
    return times
  }
  finally {
    await stopChild(child)
    await fs.writeFile(sourcePath, original, 'utf8')
  }
}

async function runCase(versionMeta, projectMeta, options) {
  const cwd = path.join(versionMeta.root, projectMeta.project)
  const buildMs = []

  const buildMode = projectMeta.buildMode ?? 'build'
  if (buildMode === 'unsupported') {
    process.stdout.write(`[${versionMeta.version}/${projectMeta.key}] build skipped: ${projectMeta.buildNote}\n`)
  }
  else {
    for (let i = 0; i < options.buildRuns; i += 1) {
      const ms = await runBuildOnce(cwd, projectMeta.buildScript, options.timeoutMs, projectMeta.buildEnv)
      buildMs.push(ms)
      process.stdout.write(`[${versionMeta.version}/${projectMeta.key}] build ${i + 1}/${options.buildRuns}: ${ms.toFixed(2)}ms\n`)
    }
  }

  const hmrMode = projectMeta.hmrMode ?? 'watch'
  const hmrMs = []
  if (hmrMode === 'unsupported' || hmrMode === 'fallback-build') {
    process.stdout.write(`[${versionMeta.version}/${projectMeta.key}] hmr skipped: ${projectMeta.hmrNote}\n`)
  }
  else {
    if (projectMeta.hmrDriver === 'dev-server') {
      hmrMs.push(...await runDevServerHmrRounds({
        cwd,
        projectMeta,
        rounds: options.hmrRuns,
        timeoutMs: options.timeoutMs,
        pollIntervalMs: options.pollIntervalMs,
      }))
    }
    else {
      hmrMs.push(...await runHmrRounds({
        cwd,
        sourceFile: projectMeta.sourceFile,
        outputTemplate: projectMeta.outputTemplate,
        outputProbeTemplates: projectMeta.outputProbeTemplates,
        devScript: projectMeta.devScript,
        injectType: projectMeta.injectType,
        devEnv: projectMeta.devEnv,
        rounds: options.hmrRuns,
        timeoutMs: options.timeoutMs,
        pollIntervalMs: options.pollIntervalMs,
      }))
    }

    hmrMs.forEach((ms, idx) => {
      process.stdout.write(`[${versionMeta.version}/${projectMeta.key}] hmr ${idx + 1}/${options.hmrRuns} mode=${hmrMode}: ${ms.toFixed(2)}ms\n`)
    })
  }

  return {
    version: versionMeta.version,
    root: versionMeta.root,
    ...projectMeta,
    buildMs,
    hmrMs,
    buildMode,
    hmrMode,
    summary: {
      build: summarize(buildMs),
      hmr: summarize(hmrMs),
      buildSteady: summarizeSteady(buildMs),
      hmrSteady: summarizeSteady(hmrMs),
    },
  }
}

async function main() {
  const buildRuns = parseNumber('--build-runs', 3)
  const hmrRuns = parseNumber('--hmr-runs', 5)
  const timeoutMs = parseNumber('--timeout', 180000)
  const pollIntervalMs = parseNumber('--poll-interval', 120)
  const output = parseString('--out', 'benchmark/version-compare/data/matrix-raw.json')
  const only = parseString('--only', '')
  const versions = await parseVersions()

  const options = { buildRuns, hmrRuns, timeoutMs, pollIntervalMs }
  const rows = []
  const selectedProjects = only
    ? projects.filter((item) => {
        const onlyItems = only.split(',').map(v => v.trim()).filter(Boolean)
        return onlyItems.includes(item.key) || onlyItems.includes(item.project)
      })
    : projects

  for (const versionMeta of versions) {
    for (const projectMeta of selectedProjects) {
      try {
        const row = await runCase(versionMeta, projectMeta, options)
        rows.push(row)
      }
      catch (error) {
        rows.push({
          version: versionMeta.version,
          root: versionMeta.root,
          ...projectMeta,
          error: error instanceof Error ? error.message : String(error),
        })
        process.stdout.write(`[${versionMeta.version}/${projectMeta.key}] ERROR\n`)
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    options,
    versions,
    projects,
    rows,
  }

  await fs.writeFile(path.resolve(output), JSON.stringify(report, null, 2), 'utf8')
  process.stdout.write(`matrix raw -> ${path.resolve(output)}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
