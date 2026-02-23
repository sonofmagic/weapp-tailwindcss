#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { parseArg, resolvePath, resolveWorkspaceRoot, sanitizeTextPaths } from './shared.mjs'

function deepSanitize(value, workspaceRoot) {
  if (typeof value === 'string') {
    return sanitizeTextPaths(value, workspaceRoot)
  }
  if (Array.isArray(value)) {
    return value.map(item => deepSanitize(item, workspaceRoot))
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(([key, item]) => [key, deepSanitize(item, workspaceRoot)])
    return Object.fromEntries(entries)
  }
  return value
}

async function main() {
  const argv = process.argv.slice(2)
  const workspaceRoot = resolveWorkspaceRoot(process.env.INIT_CWD ?? process.cwd())
  const input = resolvePath(
    workspaceRoot,
    parseArg('--input', argv),
    'benchmark/framework-compare/data/framework-matrix-raw.json',
  )
  const output = resolvePath(
    workspaceRoot,
    parseArg('--output', argv),
    path.relative(workspaceRoot, input),
  )

  const raw = await fs.readFile(input, 'utf8')
  const parsed = JSON.parse(raw)
  const sanitized = deepSanitize(parsed, workspaceRoot)
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `${JSON.stringify(sanitized, null, 2)}\n`, 'utf8')
  process.stdout.write(`[framework-matrix] sanitized raw saved: ${output}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
