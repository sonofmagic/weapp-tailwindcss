import type { IStyleHandlerOptions } from '@/types'
import { createStyleHandler } from '@/handler'

describe('calc external variable configuration', () => {
  it.each([
    ['array', ['--scale']],
    ['regexp', [/^--scale$/]],
    ['object', { includeCustomProperties: ['--scale'] }],
    ['boolean', true],
  ] as const)('resolves mapped values with %s options at both entry points', async (_, cssCalc) => {
    for (const nested of [false, true]) {
      const handler = createStyleHandler({
        ...(nested ? { cssOptions: { cssCalc } } : { cssCalc }),
        customPropertyValues: new Map([['--scale', '3rpx']]),
      } as Partial<IStyleHandlerOptions>)
      const { css } = await handler('.x { gap: calc(var(--scale) * 2); padding: calc(var(--other) * 2) }')
      expect(css).toContain('gap: 6rpx')
      expect(css).toMatch(/padding: calc\(var\(--other\)\s*\*\s*2\)/)
    }
  })
})
