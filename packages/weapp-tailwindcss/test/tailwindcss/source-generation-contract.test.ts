import path from 'node:path'
import { expect } from 'vitest'
import { sourceGenerationContract } from '../../../test-helper/src/source-generation-contract'
import { createWeappTailwindcssGenerator, resolveTailwindV4Source } from '@/generator'
import plugin from '@/postcss'
import { postcss } from '@weapp-tailwindcss/postcss/transform'

for (const scanMode of [undefined, 'compiled'] as const) {
  sourceGenerationContract(`核心 ${scanMode ?? '兼容扫描'}`, {
    async generate(root, css) {
      const generator = createWeappTailwindcssGenerator(await resolveTailwindV4Source({ base: root, projectRoot: root, css }))
      try { return await generator.generate({ target: 'web', scanSources: true, ...(scanMode ? { scanMode } : {}), incrementalCache: false }) }
      finally { generator.dispose?.() }
    },
  }, expect, path.resolve(__dirname, '../../../..'))
}
sourceGenerationContract('PostCSS 适配器', {
  async generate(root, css) {
    const result = await postcss([plugin({ base: root, projectRoot: root, generator: { target: 'web' } })]).process(css, { from: path.join(root, 'input.css') })
    return { css: result.css }
  },
}, expect, path.resolve(__dirname, '../../../..'))
