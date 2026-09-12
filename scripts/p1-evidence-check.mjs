/* eslint-disable node/prefer-global/process, style/max-statements-per-line */
import fs from 'node:fs'
import path from 'node:path'

const file = process.argv[2]
if (!file) { throw new Error('用法: node scripts/p1-evidence-check.mjs <metadata.json>') }
const metadata = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'))
const missing = ['issue', 'status', 'tests'].filter(field => metadata[field] === undefined)
const statuses = ['verified', 'partial', 'superseded', 'not-reproducible']
if (!statuses.includes(metadata.status)) { missing.push('status(verified|partial|superseded|not-reproducible)') }
for (const field of ['fixture', 'e2e', 'benchmark', 'staticSnapshot', 'releaseNote']) {
  const values = metadata[field] === undefined ? [] : (Array.isArray(metadata[field]) ? metadata[field] : [metadata[field]])
  for (const value of values) {
    if (typeof value === 'string' && !/^https?:\/\//.test(value) && !fs.existsSync(path.resolve(value))) { missing.push(`${field}:${value}`) }
  }
}
if (missing.length) { console.error(`证据 metadata 校验失败: ${missing.join(', ')}`); process.exitCode = 1 }
else {
  process.stdout.write('证据 metadata 校验通过\n')
}
