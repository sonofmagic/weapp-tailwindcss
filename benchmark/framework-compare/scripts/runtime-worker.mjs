#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

function parseArg(flag, argv, fallback) {
  const index = argv.indexOf(flag)
  if (index === -1) {
    return fallback
  }
  return argv[index + 1] ?? fallback
}

function parseNumberArg(flag, argv, fallback) {
  const raw = parseArg(flag, argv, undefined)
  if (raw == null) {
    return fallback
  }
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function buildPayload(seed, batchSize) {
  const list = Array.from({ length: batchSize })
  for (let index = 0; index < batchSize; index += 1) {
    list[index] = seed + index
  }
  return list
}

function mean(values) {
  if (!values.length) {
    return 0
  }
  return values.reduce((acc, item) => acc + item, 0) / values.length
}

function median(values) {
  if (!values.length) {
    return 0
  }
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  return sorted[middle]
}

function pickEntryFromExports(value) {
  if (!value) {
    return null
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value !== 'object') {
    return null
  }
  if (typeof value.default === 'string') {
    return value.default
  }
  if (typeof value.import === 'string') {
    return value.import
  }
  if (value.import && typeof value.import === 'object' && typeof value.import.default === 'string') {
    return value.import.default
  }
  return null
}

async function resolvePackageEntryPath(packageName) {
  const packageDir = path.join(process.cwd(), 'node_modules', packageName)
  const packageJsonPath = path.join(packageDir, 'package.json')
  const raw = await fs.readFile(packageJsonPath, 'utf8')
  const pkg = JSON.parse(raw)

  const exportEntry = pickEntryFromExports(pkg.exports?.['.'] ?? pkg.exports)
  const candidates = [
    exportEntry,
    pkg.module,
    pkg.main,
    'index.mjs',
    'index.js',
  ].filter(item => typeof item === 'string' && item.length > 0)

  for (const candidate of candidates) {
    const absPath = path.resolve(packageDir, candidate)
    try {
      const stats = await fs.stat(absPath)
      if (stats.isFile()) {
        return absPath
      }
    }
    catch {}
  }

  throw new Error(`cannot resolve runtime package entry for "${packageName}"`)
}

async function main() {
  const argv = process.argv.slice(2)
  const packageName = parseArg('--package', argv, '')
  const frameworkKey = parseArg('--framework-key', argv, 'unknown')
  const rounds = Math.max(1, parseNumberArg('--rounds', argv, 3))
  const opsPerRound = Math.max(1, parseNumberArg('--ops-per-round', argv, 160))
  const batchSize = Math.max(1, parseNumberArg('--batch-size', argv, 2500))

  if (!packageName) {
    throw new Error('missing --package')
  }

  const entryPath = await resolvePackageEntryPath(packageName)
  const runtimeModule = await import(pathToFileURL(entryPath).href)
  const ref = runtimeModule?.ref ?? runtimeModule?.default?.ref
  if (typeof ref !== 'function') {
    throw new TypeError(`[${frameworkKey}] package "${packageName}" has no ref export`)
  }

  const roundResults = []
  for (let roundIndex = 0; roundIndex < rounds; roundIndex += 1) {
    const state = ref(buildPayload(roundIndex, batchSize))
    const opLatencyMs = []
    let checksum = 0
    const roundStartedAt = performance.now()

    for (let opIndex = 0; opIndex < opsPerRound; opIndex += 1) {
      const seed = (roundIndex * opsPerRound) + opIndex + 1
      const nextValue = buildPayload(seed, batchSize)
      const opStartedAt = performance.now()
      state.value = nextValue
      const current = state.value
      checksum += current[0] + current[current.length - 1]
      opLatencyMs.push(performance.now() - opStartedAt)
    }

    roundResults.push({
      round: roundIndex + 1,
      checksum,
      roundTotalMs: performance.now() - roundStartedAt,
      opAvgMs: mean(opLatencyMs),
      opMedianMs: median(opLatencyMs),
      opMinMs: Math.min(...opLatencyMs),
      opMaxMs: Math.max(...opLatencyMs),
    })
  }

  process.stdout.write(
    `${JSON.stringify({
      frameworkKey,
      packageName,
      rounds,
      opsPerRound,
      batchSize,
      roundResults,
    })}\n`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
