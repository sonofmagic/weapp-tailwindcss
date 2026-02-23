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

function runRuntimeWorker(caseMeta, casePaths, options) {
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
      '--rounds',
      String(options.runtimeRuns),
      '--ops-per-round',
      String(options.refOpsPerRound),
      '--batch-size',
      String(options.refBatchSize),
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

export async function runRuntimeRounds(caseMeta, casePaths, options) {
  const workerResult = await runRuntimeWorker(caseMeta, casePaths, options)
  const rounds = Array.isArray(workerResult.roundResults) ? workerResult.roundResults : []
  for (const round of rounds) {
    process.stdout.write(
      `[framework-matrix] ${caseMeta.key} runtime round=${round.round}: opMedian=${round.opMedianMs.toFixed(4)}ms opAvg=${round.opAvgMs.toFixed(4)}ms total=${round.roundTotalMs.toFixed(2)}ms\n`,
    )
  }
  return rounds
}

export function summarizeRuntime(rounds) {
  if (!Array.isArray(rounds) || rounds.length === 0) {
    return null
  }

  const opAvgValues = rounds.map(item => item.opAvgMs)
  const opMedianValues = rounds.map(item => item.opMedianMs)
  const roundTotalValues = rounds.map(item => item.roundTotalMs)
  const allOpValues = rounds.flatMap((item) => {
    if (!Array.isArray(item.opLatencyMs)) {
      return []
    }
    return item.opLatencyMs
  })

  return {
    count: rounds.length,
    opAvgMs: summarize(opAvgValues),
    opMedianMs: summarize(opMedianValues),
    roundTotalMs: summarize(roundTotalValues),
    allOpsMs: summarize(allOpValues),
  }
}
