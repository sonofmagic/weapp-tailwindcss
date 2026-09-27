import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { measureWatchLifecycle } from '../src/watch-lifecycle.mjs'

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name)
  return index < 0 ? fallback : process.argv[index + 1]
}
const sourceRoot = path.resolve(arg('--source-root', fileURLToPath(new URL('../../..', import.meta.url))))
const warmups = Number(arg('--warmups', 2))
const runs = Number(arg('--runs', 7))
const kinds = arg('--bundlers', 'vite,webpack').split(',')
const sizes = arg('--sizes', '10,50,100').split(',').map(Number)
if (!Number.isInteger(warmups) || warmups < 0 || !Number.isInteger(runs) || runs < 1 || kinds.some(kind => !['vite', 'webpack'].includes(kind)) || sizes.some(size => !Number.isInteger(size) || size < 1)) {
  throw new Error('无效的采样配置')
}
const output = path.resolve(arg('--output', path.join(sourceRoot, '.tmp', 'watch-lifecycle.json')))
const report = {
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim(),
  dirty: Boolean(execFileSync('git', ['status', '--porcelain'], { cwd: sourceRoot, encoding: 'utf8' }).trim()),
  environment: { node: process.version, platform: process.platform, cpu: os.cpus()[0]?.model },
  cases: [],
}
try {
  for (const kind of kinds) {
    for (const size of sizes) {
      console.log(`[watch-lifecycle] ${kind} size=${size}`)
      report.cases.push(await measureWatchLifecycle({ sourceRoot, kind, size, warmups, runs }))
    }
  }
}
finally {
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
}
