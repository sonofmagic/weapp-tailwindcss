import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { insertProbe } from '../../../scripts/ci/demo-matrix/probe.mjs'
import { authoredCss } from '../../../scripts/ci/demo-matrix/authored.mjs'
import { coverage } from '../../../scripts/ci/demo-matrix/catalog.mjs'
import { operations } from './model.mjs'
import { probeClasses } from '../../../scripts/ci/demo-matrix/probe.mjs'

export const roundFor = operation => operation === 'replace' ? 'replace' : operation === 'add' ? 'add' : operation === 'remove' || operation === 'restore' ? 'restore' : 'initial'

export async function prepareSteps(consumer, records) {
  const item = consumer.item
  const original = await readFile(path.join(consumer.project, item.source), 'utf8')
  const authored = coverage(item) === 'authored-styles'
  const configuration = records.find(row => row.key === 'options')?.value.options
  const cssFile = authored ? path.join(consumer.project, 'src/sub-normal/index.css') : configuration?.cssEntries?.[0]
  assert.ok(cssFile, '没有可验证的样式入口')
  const css = await readFile(cssFile, 'utf8').catch(error => { if (authored && error.code === 'ENOENT') return ''; throw error })
  const changes = new Map()
  for (const operation of ['initial', ...operations]) {
    const round = roundFor(operation)
    const probe = await insertProbe(original, item, round)
    // 每轮标识随源码一次写入；等待结果时同时核对本轮标识与样式。
    const className = probeClasses(item, round).height
    const text = probe.replace(`tw-matrix-${round}-height`, `tw-matrix-${round}-height COST_SEQUENCE`)
      .replace(`="${className}"`, `="${className} cost-author${authored ? '' : ' bg-cost-config'}"`)
    const style = `${css}\n${authored ? authoredCss(item, round) : ''}\n.cost-author{width:${operation === 'css' ? 43 : 41}px}\n${authored ? '' : `@theme { --color-cost-config: ${operation === 'config' ? '#654321' : '#123456'}; }`}\n`
    changes.set(operation, new Map([[item.source, text], [path.relative(consumer.project, cssFile), style]]))
  }
  return changes
}

export async function writeStep(consumer, files, marker) {
  for (const [file, content] of files) {
    const target = path.join(consumer.project, file)
    const next = content.replaceAll('COST_SEQUENCE', marker)
    if (await readFile(target, 'utf8').catch(error => { if (error.code === 'ENOENT') return null; throw error }) !== next) await writeFile(target, next)
  }
}
