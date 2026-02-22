import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const versions = [
  { version: '4.9.8', root: '/tmp/weapp-tailwindcss-4.9.8' },
  { version: '4.10.2', root: '/tmp/weapp-tailwindcss-4.10.2' },
]

const projects = [
  {
    key: 'demo-uni-app-vue3-vite',
    project: 'demo/uni-app-vue3-vite',
    sourceFile: 'src/pages/index/index.vue',
    outputTemplate: 'dist/dev/mp-weixin/pages/index/index.wxml',
    devScript: 'dev',
    buildScript: 'build',
    injectType: 'vue',
  },
  {
    key: 'demo-uni-app-tailwindcss-v4',
    project: 'demo/uni-app-tailwindcss-v4',
    sourceFile: 'src/pages/index/index.vue',
    outputTemplate: 'dist/dev/mp-weixin/pages/index/index.wxml',
    devScript: 'dev',
    buildScript: 'build',
    injectType: 'vue',
  },
  {
    key: 'apps-vite-native-ts',
    project: 'apps/vite-native-ts',
    sourceFile: 'miniprogram/pages/index/index.wxml',
    outputTemplate: 'dist/pages/index/index.wxml',
    devScript: 'dev',
    buildScript: 'build',
    injectType: 'wxml-class',
  },
  {
    key: 'apps-vite-native',
    project: 'apps/vite-native',
    sourceFile: 'pages/index/index.wxml',
    outputTemplate: 'dist/pages/index/index.wxml',
    devScript: 'dev',
    buildScript: 'build',
    injectType: 'wxml-class',
  },
  {
    key: 'apps-vite-native-skyline',
    project: 'apps/vite-native-skyline',
    sourceFile: 'pages/index/index.wxml',
    outputTemplate: 'dist/pages/index/index.wxml',
    devScript: 'dev',
    buildScript: 'build',
    injectType: 'wxml-class',
  },
  {
    key: 'apps-vite-native-ts-skyline',
    project: 'apps/vite-native-ts-skyline',
    sourceFile: 'miniprogram/pages/index/index.wxml',
    outputTemplate: 'dist/pages/index/index.wxml',
    devScript: 'dev',
    buildScript: 'build',
    injectType: 'wxml-class',
  },
  {
    key: 'demo-native-ts',
    project: 'demo/native-ts',
    sourceFile: 'miniprogram/pages/index/index.wxml',
    outputTemplate: 'dist/pages/index/index.wxml',
    devScript: 'dev',
    buildScript: 'build',
    injectType: 'wxml-class',
  },
  {
    key: 'apps-weapp-wechat-zhihu',
    project: 'apps/weapp-wechat-zhihu',
    sourceFile: 'pages/index/index.wxml',
    outputTemplate: 'dist/pages/index/index.wxml',
    devScript: 'dev',
    buildScript: 'build',
    injectType: 'wxml-class',
  },
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
  const sorted = [...values].sort((a, b) => a - b)
  return {
    mean: mean(values),
    median: median(values),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    stddev: stddev(values),
  }
}

function spawnPnpm(cwd, args, stdio = 'pipe') {
  return spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', args, {
    cwd,
    stdio,
    detached: process.platform !== 'win32',
    env: { ...process.env },
  })
}

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

async function runBuildOnce(cwd, buildScript, timeoutMs) {
  const start = now()
  const child = spawnPnpm(cwd, ['run', buildScript], 'pipe')
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

  return now() - start
}

function injectContent(original, marker, injectType) {
  if (injectType === 'vue') {
    const next = original.replace('</template>', `\n  <view class="${marker} bg-[#123456]">bench</view>\n</template>`)
    if (next === original) {
      throw new Error('inject failed: </template> not found')
    }
    return next
  }

  const replaced = original.replace(/class="([^"]*)"/, (_full, classes) => {
    return `class="${classes} ${marker}"`
  })
  if (replaced === original) {
    return `${original}\n<view class="${marker}">bench</view>\n`
  }
  return replaced
}

async function runHmrRounds({
  cwd,
  sourceFile,
  outputTemplate,
  devScript,
  injectType,
  rounds,
  timeoutMs,
  pollIntervalMs,
}) {
  const sourcePath = path.join(cwd, sourceFile)
  const outputPath = path.join(cwd, outputTemplate)
  const original = await fs.readFile(sourcePath, 'utf8')

  const child = spawnPnpm(cwd, ['run', devScript], 'pipe')
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
        throw new Error(`dev exited early code=${child.exitCode}`)
      }
      if (!(await exists(outputPath))) {
        return false
      }
      const text = await readText(outputPath)
      return text.length > 120
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
          throw new Error(`dev exited during hmr round=${i + 1} code=${child.exitCode}`)
        }
        const text = await readText(outputPath)
        return text.includes(marker)
      }, timeoutMs, pollIntervalMs)

      if (!ok) {
        throw new Error(`hmr round ${i + 1} timeout ${timeoutMs}ms marker=${marker}`)
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

async function runCase(versionMeta, projectMeta, options) {
  const cwd = path.join(versionMeta.root, projectMeta.project)
  const buildMs = []

  for (let i = 0; i < options.buildRuns; i += 1) {
    const ms = await runBuildOnce(cwd, projectMeta.buildScript, options.timeoutMs)
    buildMs.push(ms)
    process.stdout.write(`[${versionMeta.version}/${projectMeta.key}] build ${i + 1}/${options.buildRuns}: ${ms.toFixed(2)}ms\n`)
  }

  const hmrMs = await runHmrRounds({
    cwd,
    sourceFile: projectMeta.sourceFile,
    outputTemplate: projectMeta.outputTemplate,
    devScript: projectMeta.devScript,
    injectType: projectMeta.injectType,
    rounds: options.hmrRuns,
    timeoutMs: options.timeoutMs,
    pollIntervalMs: options.pollIntervalMs,
  })

  hmrMs.forEach((ms, idx) => {
    process.stdout.write(`[${versionMeta.version}/${projectMeta.key}] hmr ${idx + 1}/${options.hmrRuns}: ${ms.toFixed(2)}ms\n`)
  })

  return {
    version: versionMeta.version,
    root: versionMeta.root,
    ...projectMeta,
    buildMs,
    hmrMs,
    summary: {
      build: summarize(buildMs),
      hmr: summarize(hmrMs),
      buildSteady: summarize(buildMs.slice(1)),
      hmrSteady: summarize(hmrMs.slice(1)),
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

  const options = { buildRuns, hmrRuns, timeoutMs, pollIntervalMs }
  const rows = []
  const selectedProjects = only
    ? projects.filter(item => only.split(',').map(v => v.trim()).filter(Boolean).includes(item.key))
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
