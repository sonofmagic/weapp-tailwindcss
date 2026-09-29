import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import { chromium } from 'playwright'
import { coverage, isWeb } from '../../../scripts/ci/demo-matrix/catalog.mjs'
import { inspectFiles, inspectStyles } from '../../../scripts/ci/demo-matrix/output.mjs'
import { inspectNative } from '../../../scripts/ci/demo-matrix/native.mjs'
import { probeClasses } from '../../../scripts/ci/demo-matrix/probe.mjs'
import { roundFor } from './steps.mjs'
import { waitFor } from './process.mjs'
import { inspectExtraStyles } from './style-evidence.mjs'
import { trackBrowserState } from './browser-state.mjs'
import { waitForTaroComponents } from './component-ready.mjs'
import { comparableCss } from './semantic-css.mjs'
import { readPageSnapshot } from './page-snapshot.mjs'

export const browserTarget = item => isWeb(item) || item.name.startsWith('web/')

export async function inspectOutput(consumer, output, operation, marker) {
  const files = await fg(['**/*.{js,html,wxml,axml,ttml,qml,qxml,swan,ddml,jxml,ksml,xhsml,ux,bundle}'], { cwd: output, absolute: true })
  const contents = await Promise.all(files.map(file => readFile(file, 'utf8')))
  assert.ok(contents.some(text => text.includes(marker)), `缺少本轮 marker ${marker}`)
  if (coverage(consumer.item) === 'native-build') return inspectNative(output)
  if (consumer.mode === 'native') return { marker, structure: true, styleEquivalent: false }
  let extra
  let comparisonProbes
  const probes = await inspectFiles(output, consumer.item, roundFor(operation), browserTarget(consumer.item) ? undefined : (styles, consumed) => {
    extra = inspectExtraStyles(styles, consumed, consumer.item, operation)
    comparisonProbes = inspectStyles(styles.map(comparableCss), consumer.item, roundFor(operation), consumed)
  })
  return extra ? { probes, comparisonProbes: { ...probes, ...comparisonProbes }, extra } : probes
}

export async function observePage(url, session, directory) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
  await page.addInitScript({ content: `globalThis.__WEAPP_DEMO_COST_COMPONENT_READY__ = (${waitForTaroComponents.toString()})` })
  const state = trackBrowserState(page)
  const { errors, pending } = state
  let lastObservation
  try {
    await waitFor(async () => {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) })
      assert.ok(response.ok)
    }, session)
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    return {
      documents: state.documents,
      waitForTransport: () => waitFor(() => assert.ok(state.transportReady(), '开发更新通道尚未握手'), session),
      async inspect(consumer, operation, marker) {
        const round = roundFor(operation)
        const result = await page.evaluate(readPageSnapshot, { expected: probeClasses(consumer.item, round), round, marker, family: consumer.item.family })
        lastObservation = { mode: consumer.mode, operation, marker, result, url: page.url(), pending: [...pending].map(request => request.url()) }
        assert.equal(pending.size, 0, `仍有模块或样式请求：${[...pending].map(request => request.url()).join(', ')}`)
        assert.equal(result.ready, 'complete')
        assert.ok(!result.hot || result.hot === 'idle', 'HMR 尚未完成')
        assert.deepEqual(errors, [], '浏览器运行错误')
        if (consumer.mode !== 'native') {
          inspectStyles(result.styles, consumer.item, round, Object.fromEntries(Object.values(result.computed).map(value => [value.name, value.classes])))
          if (isWeb(consumer.item)) {
            assert.ok(Number.parseFloat(result.computed.height.height) > 0, '样式未实际生效')
            assert.equal(result.computed.display.display, 'flex')
            assert.equal(result.computed.height.width, `${operation === 'css' ? 43 : 41}px`)
            if (coverage(consumer.item) !== 'authored-styles') assert.equal(result.computed.height.background, operation === 'config' ? 'rgb(101, 67, 33)' : 'rgb(18, 52, 86)')
          }
        }
        return { computed: result.computed, topology: result.topology }
      },
      async close() {
        try {
          await writeFile(path.join(directory, `browser-observation-${session.pid}.json`), JSON.stringify({ ...lastObservation, errors }))
        }
        finally { await browser.close() }
      },
    }
  }
  catch (error) { await browser.close(); throw error }
}
