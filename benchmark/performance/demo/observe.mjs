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

export const browserTarget = item => isWeb(item) || item.name.startsWith('web/')

export async function inspectOutput(consumer, output, operation, marker) {
  const files = await fg(['**/*.{js,html,wxml,axml,ttml,qml,qxml,swan,ddml,jxml,ksml,xhsml,ux,bundle}'], { cwd: output, absolute: true })
  const contents = await Promise.all(files.map(file => readFile(file, 'utf8')))
  assert.ok(contents.some(text => text.includes(marker)), `缺少本轮 marker ${marker}`)
  if (coverage(consumer.item) === 'native-build') return inspectNative(output)
  if (consumer.mode === 'native') return { marker, structure: true, styleEquivalent: false }
  let extra
  const probes = await inspectFiles(output, consumer.item, roundFor(operation), browserTarget(consumer.item) ? undefined : (styles, consumed) => { extra = inspectExtraStyles(styles, consumed, consumer.item, operation) })
  return extra ? { probes, extra } : probes
}

export async function observePage(url, session, directory) {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } })
  const errors = []
  const pending = new Set()
  let documents = 0
  let transportReady = false
  page.on('pageerror', error => errors.push(error.message))
  page.on('websocket', socket => {
    const version = documents
    socket.on('framereceived', ({ payload }) => {
      try {
        if (version === documents && ['connected', 'ok', 'still-ok', 'warnings'].includes(JSON.parse(String(payload)).type)) transportReady = true
      }
      catch { /* 业务 WebSocket 不参与构建工具的握手验证。 */ }
    })
  })
  page.on('request', request => {
    // hash/history 路由变化不属于文档重载，也不能使已有 HMR 通道失效。
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) { documents++; transportReady = false }
    if (['script', 'stylesheet'].includes(request.resourceType())) pending.add(request)
  })
  page.on('requestfinished', request => pending.delete(request))
  page.on('requestfailed', request => { pending.delete(request); errors.push(`${request.url()}: ${request.failure()?.errorText}`) })
  try {
    await waitFor(async () => {
      const response = await fetch(url, { signal: AbortSignal.timeout(2000) })
      assert.ok(response.ok)
    }, session)
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    return {
      documents: () => documents,
      waitForTransport: () => waitFor(() => assert.ok(transportReady, '开发更新通道尚未握手'), session),
      async inspect(consumer, operation, marker) {
        const round = roundFor(operation)
        const result = await page.evaluate(({ expected, round, marker }) => {
          const first = document.getElementById('tw-matrix-height')
          if (!first?.textContent.includes(marker)) throw new Error('本轮页面 marker 尚未生效')
          const computed = {}
          for (const [key, name] of Object.entries(expected)) {
            const element = document.getElementById(`tw-matrix-${key}`)
            if (!element || element.dataset.twMatrix !== round) throw new Error(`本轮节点缺失：${key}`)
            const css = getComputedStyle(element)
            computed[key] = { name, classes: [...element.classList], width: css.width, height: css.height, marginTop: css.marginTop, display: css.display, color: css.color, background: css.backgroundColor }
          }
          if (round === 'restore' && document.getElementById('tw-matrix-added')) throw new Error('移除节点仍存在')
          const styles = []
          for (const sheet of document.styleSheets) {
            try { styles.push([...sheet.cssRules].map(rule => rule.cssText).join('\n')) }
            catch { /* 不读取跨域第三方样式。 */ }
          }
          const topology = [...document.body.querySelectorAll('*')].filter(element => !['SCRIPT', 'STYLE'].includes(element.tagName)).map(element => {
            const css = getComputedStyle(element)
            return { tag: element.tagName, children: element.children.length, height: css.height, width: css.width, color: css.color, background: css.backgroundColor, display: css.display }
          })
          return { computed, styles, topology, ready: document.readyState, hot: globalThis.__WEAPP_TW_MATRIX_HMR_STATUS__?.() }
        }, { expected: probeClasses(consumer.item, round), round, marker })
        assert.equal(pending.size, 0, '仍有模块或样式请求')
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
        await writeFile(path.join(directory, 'browser-errors.json'), JSON.stringify(errors))
        await browser.close()
      },
    }
  }
  catch (error) { await browser.close(); throw error }
}
