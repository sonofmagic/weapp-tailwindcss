import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { summarize } from './shared.mjs'

function parseWorkerResult(logs, key) {
  for (let index = logs.length - 1; index >= 0; index -= 1) {
    const line = logs[index].trim()
    if (!line.startsWith('{') || !line.endsWith('}')) {
      continue
    }
    try {
      return JSON.parse(line)
    }
    catch {}
  }
  throw new Error(`[${key}] runtime worker output parse failed`)
}

function runRuntimeWorker(caseMeta, casePaths, options, runtimeTask) {
  return new Promise((resolve, reject) => {
    const workerPath = path.resolve(
      options.workspaceRoot,
      'benchmark/framework-compare/scripts/runtime-worker.mjs',
    )
    const args = [
      workerPath,
      '--framework-key',
      caseMeta.key,
      '--package',
      caseMeta.runtimeRefPackage,
      '--module-root',
      casePaths.sourceProjectRoot,
      '--rounds',
      String(options.runtimeRuns),
      '--ops-per-round',
      String(runtimeTask.opsPerRound),
      '--batch-size',
      String(runtimeTask.batchSize),
    ]

    const child = spawn('node', args, {
      cwd: casePaths.projectRoot,
      env: { ...process.env },
      stdio: 'pipe',
    })
    const logs = []

    const onData = (chunk) => {
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

    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.once('error', reject)

    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error(`[${caseMeta.key}] runtime worker timeout ${options.runtimeTimeoutMs}ms`))
    }, options.runtimeTimeoutMs)

    child.once('close', (code) => {
      clearTimeout(timer)
      if (code !== 0) {
        const tail = logs.slice(-80).join('\n')
        reject(new Error(`[${caseMeta.key}] runtime worker failed code=${code}\n${tail}`))
        return
      }
      try {
        resolve(parseWorkerResult(logs, caseMeta.key))
      }
      catch (error) {
        reject(error)
      }
    })
  })
}

function resolveOpsPerRound(batchSize, options) {
  const byElementCap = Math.floor(options.refMaxElementsPerRound / batchSize)
  if (byElementCap <= 0) {
    return 1
  }
  return Math.max(1, Math.min(options.refOpsPerRound, byElementCap))
}

export async function runRuntimeRounds(caseMeta, casePaths, options) {
  const scaleResults = []
  for (const batchSize of options.refBatchScales) {
    const runtimeTask = {
      batchSize,
      opsPerRound: resolveOpsPerRound(batchSize, options),
    }
    const workerResult = await runRuntimeWorker(caseMeta, casePaths, options, runtimeTask)
    const rounds = Array.isArray(workerResult.roundResults) ? workerResult.roundResults : []
    const roundMedianSummary = summarize(rounds.map(item => item.opMedianMs))
    process.stdout.write(
      `[framework-matrix] ${caseMeta.key} runtime scale=${batchSize} ops=${runtimeTask.opsPerRound}: opMedian=${(roundMedianSummary?.median ?? 0).toFixed(4)}ms rounds=${rounds.length}\n`,
    )
    scaleResults.push({
      batchSize,
      opsPerRound: runtimeTask.opsPerRound,
      rounds,
    })
  }
  return scaleResults
}

export function summarizeRuntime(scaleResults) {
  if (!Array.isArray(scaleResults) || scaleResults.length === 0) {
    return null
  }

  const ordered = [...scaleResults]
    .filter(item => Number.isFinite(item?.batchSize))
    .sort((a, b) => a.batchSize - b.batchSize)

  if (!ordered.length) {
    return null
  }

  const scales = {}
  const scaleOrder = []
  for (const item of ordered) {
    const rounds = Array.isArray(item.rounds) ? item.rounds : []
    const key = String(item.batchSize)
    scales[key] = {
      batchSize: item.batchSize,
      opsPerRound: item.opsPerRound,
      count: rounds.length,
      opAvgMs: summarize(rounds.map(round => round.opAvgMs)),
      opMedianMs: summarize(rounds.map(round => round.opMedianMs)),
      roundTotalMs: summarize(rounds.map(round => round.roundTotalMs)),
    }
    scaleOrder.push(item.batchSize)
  }

  return {
    scaleOrder,
    scales,
  }
}
