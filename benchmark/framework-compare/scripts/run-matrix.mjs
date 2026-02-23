#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { CONTROLLED_VUE_SFC_SOURCE, createScenario, FRAMEWORK_CASES } from './config.mjs'
import { runRuntimeRounds, summarizeRuntime } from './runtime.mjs'
import {
  parseArg,
  parseBoolean,
  parseCsvSet,
  parseNumber,
  readText,
  resolvePath,
  resolveWorkspaceRoot,
  runPnpmOnce,
  sanitizeTextPaths,
  sleep,
  spawnPnpm,
  stopChild,
  summarize,
  waitFor,
  writeJson,
} from './shared.mjs'

function parseBatchScales(argv) {
  const raw = parseArg('--ref-batch-scales', argv)
  if (raw) {
    const values = raw
      .split(',')
      .map(item => Number(item.trim()))
      .filter(item => Number.isFinite(item) && item > 0)
      .map(item => Math.trunc(item))
    if (values.length) {
      return [...new Set(values)].sort((a, b) => a - b)
    }
  }

  const singleBatch = parseNumber('--ref-batch-size', argv, Number.NaN)
  if (Number.isFinite(singleBatch) && singleBatch > 0) {
    return [Math.trunc(singleBatch)]
  }

  return [10, 100, 1000, 10000, 1000000]
}

function resolveOptions(argv) {
  const workspaceRoot = resolveWorkspaceRoot(process.env.INIT_CWD ?? process.cwd())
  return {
    workspaceRoot,
    buildRuns: parseNumber('--build-runs', argv, 3),
    hmrRuns: parseNumber('--hmr-runs', argv, 5),
    runtimeRuns: parseNumber('--runtime-runs', argv, 3),
    hmrWatchRetries: parseNumber('--hmr-watch-retries', argv, 0),
    hmrTimeoutMs: parseNumber('--hmr-timeout', argv, 120000),
    refBatchScales: parseBatchScales(argv),
    refOpsPerRound: parseNumber('--ref-ops-per-round', argv, 160),
    refMaxElementsPerRound: parseNumber('--ref-max-elements-per-round', argv, 5000000),
    timeoutMs: parseNumber('--timeout', argv, 240000),
    runtimeTimeoutMs: parseNumber('--runtime-timeout', argv, 45000),
    pollMs: parseNumber('--poll', argv, 180),
    resetDelayMs: parseNumber('--reset-delay', argv, 280),
    skipHmr: parseBoolean('--skip-hmr', argv),
    skipRuntime: parseBoolean('--skip-runtime', argv),
    onlySet: parseCsvSet('--only', argv),
    outFile: resolvePath(
      workspaceRoot,
      parseArg('--out', argv),
      'benchmark/framework-compare/data/framework-matrix-raw.json',
    ),
  }
}

function resolveCasePaths(workspaceRoot, caseMeta) {
  const projectRoot = path.resolve(workspaceRoot, caseMeta.project)
  return {
    projectRoot,
    sourcePath: path.resolve(projectRoot, caseMeta.hmrSourceFile),
    outputPath: path.resolve(projectRoot, caseMeta.hmrOutputFile),
  }
}

function assertVueScenario(caseMeta) {
  if (!caseMeta.hmrSourceFile.endsWith('.vue')) {
    throw new Error(`[${caseMeta.key}] hmrSourceFile must be .vue for controlled-variable benchmark`)
  }
}

async function fileContains(file, token) {
  const content = await readText(file)
  return content.includes(token)
}

function createSeed(roundIndex) {
  const suffix = String(roundIndex + 1).padStart(2, '0')
  return `${Date.now().toString().slice(-6)}${suffix}`
}

async function runBuildRounds(caseMeta, casePaths, options) {
  const buildMs = []
  for (let index = 0; index < options.buildRuns; index += 1) {
    const result = await runPnpmOnce(
      casePaths.projectRoot,
      ['run', caseMeta.buildScript],
      options.timeoutMs,
    )
    buildMs.push(result.elapsedMs)
    process.stdout.write(
      `[framework-matrix] ${caseMeta.key} build ${index + 1}/${options.buildRuns}: ${result.elapsedMs.toFixed(2)}ms\n`,
    )
  }
  return buildMs
}

async function runHmrRounds(caseMeta, casePaths, options) {
  const original = await fs.readFile(casePaths.sourcePath, 'utf8')
  const child = spawnPnpm(casePaths.projectRoot, ['run', caseMeta.devScript], 'pipe')
  const logs = []

  const collectLog = (chunk) => {
    const text = chunk.toString('utf8')
    for (const line of text.split(/\r?\n/)) {
      if (!line) {
        continue
      }
      logs.push(line)
      if (logs.length > 300) {
        logs.shift()
      }
    }
  }

  child.stdout.on('data', collectLog)
  child.stderr.on('data', collectLog)

  try {
    await waitFor(
      async () => {
        const output = await readText(casePaths.outputPath)
        return output.length > 120
      },
      {
        timeoutMs: options.hmrTimeoutMs,
        pollMs: options.pollMs,
        timeoutMessage: `[${caseMeta.key}] dev warmup timeout`,
      },
    )

    const hmrMs = []
    for (let roundIndex = 0; roundIndex < options.hmrRuns; roundIndex += 1) {
      const scenario = createScenario(createSeed(roundIndex))
      const mutatedSource = caseMeta.mutateSource(original, scenario)
      await fs.writeFile(casePaths.sourcePath, mutatedSource, 'utf8')

      const elapsedMs = await waitFor(
        async () => fileContains(casePaths.outputPath, scenario.marker),
        {
          timeoutMs: options.hmrTimeoutMs,
          pollMs: options.pollMs,
          timeoutMessage: `[${caseMeta.key}] hmr timeout marker=${scenario.marker}`,
        },
      )

      hmrMs.push(elapsedMs)
      process.stdout.write(
        `[framework-matrix] ${caseMeta.key} hmr ${roundIndex + 1}/${options.hmrRuns}: ${elapsedMs.toFixed(2)}ms\n`,
      )

      await fs.writeFile(casePaths.sourcePath, original, 'utf8')
      await sleep(options.resetDelayMs)
    }

    return hmrMs
  }
  catch (error) {
    const tailLogs = logs.slice(-80).join('\n')
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`[${caseMeta.key}] hmr failed: ${message}\n${tailLogs}`)
  }
  finally {
    await fs.writeFile(casePaths.sourcePath, original, 'utf8')
    await stopChild(child)
  }
}

async function runHmrWatchWithRetry(caseMeta, casePaths, options) {
  const failures = []
  const attempts = Math.max(1, options.hmrWatchRetries + 1)

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await runHmrRounds(caseMeta, casePaths, options)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push(`attempt ${attempt}: ${message}`)
      if (attempt < attempts) {
        await sleep(600)
      }
    }
  }

  throw new Error(failures.join('\n\n'))
}

async function runHmrFallbackRounds(caseMeta, casePaths, options) {
  const original = await fs.readFile(casePaths.sourcePath, 'utf8')
  const hmrMs = []

  try {
    for (let roundIndex = 0; roundIndex < options.hmrRuns; roundIndex += 1) {
      const scenario = createScenario(createSeed(roundIndex))
      const mutatedSource = caseMeta.mutateSource(original, scenario)
      await fs.writeFile(casePaths.sourcePath, mutatedSource, 'utf8')
      const result = await runPnpmOnce(
        casePaths.projectRoot,
        ['run', caseMeta.buildScript],
        options.timeoutMs,
      )
      hmrMs.push(result.elapsedMs)
      process.stdout.write(
        `[framework-matrix] ${caseMeta.key} hmr-fallback ${roundIndex + 1}/${options.hmrRuns}: ${result.elapsedMs.toFixed(2)}ms\n`,
      )
      await fs.writeFile(casePaths.sourcePath, original, 'utf8')
      await sleep(options.resetDelayMs)
    }

    return hmrMs
  }
  finally {
    await fs.writeFile(casePaths.sourcePath, original, 'utf8')
  }
}

async function runCase(caseMeta, options) {
  assertVueScenario(caseMeta)
  const casePaths = resolveCasePaths(options.workspaceRoot, caseMeta)
  const sourceOriginal = await fs.readFile(casePaths.sourcePath, 'utf8')
  const row = {
    key: caseMeta.key,
    label: caseMeta.label,
    project: caseMeta.project,
    buildScript: caseMeta.buildScript,
    devScript: caseMeta.devScript,
    buildMs: [],
    hmrMs: [],
    hmrMode: null,
    runtimeRounds: [],
    runtimeMode: options.skipRuntime ? null : 'ref-bulk-value-update',
    summary: {
      build: null,
      hmr: null,
      runtime: null,
    },
    errors: {},
  }

  try {
    await fs.writeFile(casePaths.sourcePath, CONTROLLED_VUE_SFC_SOURCE, 'utf8')
    await sleep(60)

    try {
      row.buildMs = await runBuildRounds(caseMeta, casePaths, options)
      row.summary.build = summarize(row.buildMs)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      row.errors.build = sanitizeTextPaths(message, options.workspaceRoot)
    }

    if (!options.skipHmr) {
      try {
        row.hmrMs = await runHmrWatchWithRetry(caseMeta, casePaths, options)
        row.hmrMode = 'watch'
        row.summary.hmr = summarize(row.hmrMs)
      }
      catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        row.errors.hmrWatch = sanitizeTextPaths(message, options.workspaceRoot)

        try {
          row.hmrMs = await runHmrFallbackRounds(caseMeta, casePaths, options)
          row.hmrMode = 'fallback-build'
          row.summary.hmr = summarize(row.hmrMs)
        }
        catch (fallbackError) {
          const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
          row.errors.hmrFallback = sanitizeTextPaths(fallbackMessage, options.workspaceRoot)
        }
      }
    }

    if (!options.skipRuntime) {
      try {
        row.runtimeRounds = await runRuntimeRounds(caseMeta, casePaths, options)
        row.summary.runtime = summarizeRuntime(row.runtimeRounds)
      }
      catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        row.errors.runtime = sanitizeTextPaths(message, options.workspaceRoot)
      }
    }
  }
  finally {
    await fs.writeFile(casePaths.sourcePath, sourceOriginal, 'utf8')
  }

  return row
}

async function main() {
  const options = resolveOptions(process.argv.slice(2))
  const selectedCases = options.onlySet
    ? FRAMEWORK_CASES.filter(item => options.onlySet?.has(item.key))
    : FRAMEWORK_CASES

  if (!selectedCases.length) {
    throw new Error('no framework case selected')
  }

  const rows = []
  for (const caseMeta of selectedCases) {
    process.stdout.write(`[framework-matrix] start ${caseMeta.key}\n`)
    const row = await runCase(caseMeta, options)
    rows.push(row)
    process.stdout.write(`[framework-matrix] finish ${caseMeta.key}\n`)
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    options: {
      buildRuns: options.buildRuns,
      hmrRuns: options.hmrRuns,
      hmrWatchRetries: options.hmrWatchRetries,
      hmrTimeoutMs: options.hmrTimeoutMs,
      runtimeRuns: options.runtimeRuns,
      refBatchScales: options.refBatchScales,
      refOpsPerRound: options.refOpsPerRound,
      refMaxElementsPerRound: options.refMaxElementsPerRound,
      timeoutMs: options.timeoutMs,
      runtimeTimeoutMs: options.runtimeTimeoutMs,
      pollMs: options.pollMs,
      skipHmr: options.skipHmr,
      skipRuntime: options.skipRuntime,
      outFile: path.relative(options.workspaceRoot, options.outFile),
    },
    cases: selectedCases.map(item => ({
      key: item.key,
      label: item.label,
      project: item.project,
      buildScript: item.buildScript,
      devScript: item.devScript,
      hmrSourceFile: item.hmrSourceFile,
      hmrOutputFile: item.hmrOutputFile,
      runtimeRefPackage: item.runtimeRefPackage,
    })),
    rows,
  }

  await writeJson(options.outFile, payload)
  process.stdout.write(`[framework-matrix] raw report saved: ${options.outFile}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
