import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { expect, it } from 'vitest'
import { repo } from '../../../../scripts/ci/demo-matrix/catalog.mjs'
import { selectCases } from '../model.mjs'
import { consumerManifest, withoutIntegration } from '../published.mjs'

it('Mpx 样式注入 demo 的三组消费项目声明 Babel 实际生成的 runtime 依赖', async () => {
  const item = selectCases('style-injector-mpx:wx')[0]
  const config = JSON.parse(await readFile(path.join(repo, 'demo', item.name, 'babel.config.json'), 'utf8'))
  // 未启用 corejs 的 transform-runtime 生成 @babel/runtime/helpers 导入。
  expect(config.plugins).toContain('@babel/plugin-transform-runtime')
  const { manifest } = await consumerManifest(item, { version: '5.5.11' })
  for (const consumer of [manifest, withoutIntegration(manifest, { authored: true })]) expect(consumer.dependencies['@babel/runtime']).toMatch(/^7\./)
})
