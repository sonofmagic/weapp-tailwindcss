import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { createStyleHandler } = require('../packages/postcss') as {
  createStyleHandler: (options?: {
    appType?: string
    uniAppX?: boolean
    unitsToPx?: boolean
  }) => (source: string) => Promise<{ css: string }>
}

describe('issue #1021 unitsToPx CJS regression', () => {
  it('loads the CJS entry and transforms unitsToPx in a uni-app x style pipeline', async () => {
    const handler = createStyleHandler({
      appType: 'uni-app-x',
      uniAppX: true,
      unitsToPx: true,
    })

    await expect(handler('a{width:1rem;height:2vw;}')).resolves.toMatchObject({
      css: 'a{width:16px;height:7.5px;}',
    })
  })
})
