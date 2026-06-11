import { createStyleHandler } from '@/index'
import { normalizeTailwindcssV4EmptyVarFallback } from '@/compat/tailwindcss-v4'

describe('compat', () => {
  describe('normalizeTailwindcssV4EmptyVarFallback', () => {
    it('should not modify strings without var(--tw-)', () => {
      const input = 'color: red; margin: var(--custom-var);'
      const result = normalizeTailwindcssV4EmptyVarFallback(input)
      expect(result).toBe(input)
    })

    it('should add space after comma in var(--tw-) with empty fallback', () => {
      const input = 'color: var(--tw-text-color,);'
      const result = normalizeTailwindcssV4EmptyVarFallback(input)
      expect(result).toBe('color: var(--tw-text-color, );')
    })

    it('should add space after var() function if there is content after without space', () => {
      const input = 'margin: var(--tw-margin)0px;'
      const result = normalizeTailwindcssV4EmptyVarFallback(input)
      expect(result).toBe('margin: var(--tw-margin) 0px;')
    })

    it('should not add extra space after var() function if there is already space', () => {
      const input = 'margin: var(--tw-margin) 0px;'
      const result = normalizeTailwindcssV4EmptyVarFallback(input)
      expect(result).toBe(input)
    })

    it('should handle transform property with multiple empty var fallbacks (Issues#625)', () => {
      const input = 'transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);'
      const result = normalizeTailwindcssV4EmptyVarFallback(input)
      expect(result).toBe('transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );')
    })

    it('should handle multiple var() functions in one line', () => {
      const input = 'padding: var(--tw-padding-x,) var(--tw-padding-y,);'
      const result = normalizeTailwindcssV4EmptyVarFallback(input)
      expect(result).toBe('padding: var(--tw-padding-x, ) var(--tw-padding-y, );')
    })

    it('should handle complex expressions with nested functions', () => {
      const input = 'background: linear-gradient(var(--tw-gradient-stops,),var(--tw-gradient-from) var(--tw-gradient-position,),var(--tw-gradient-to,));'
      const result = normalizeTailwindcssV4EmptyVarFallback(input)
      expect(result).toBe('background: linear-gradient(var(--tw-gradient-stops, ), var(--tw-gradient-from) var(--tw-gradient-position, ), var(--tw-gradient-to, ));')
    })

    it('should leave var() with non-empty fallback unchanged', () => {
      const input = 'color: var(--tw-text-color, blue);'
      const result = normalizeTailwindcssV4EmptyVarFallback(input)
      expect(result).toBe(input)
    })

    it('should leave var() at end of line unchanged', () => {
      const input = 'color: var(--tw-text-color);'
      const result = normalizeTailwindcssV4EmptyVarFallback(input)
      expect(result).toBe(input)
    })

    it('should handle multiple declarations in one string', () => {
      const input = 'color: var(--tw-text-color,); margin: var(--tw-margin)0px; padding: var(--tw-padding, )10px;'
      const result = normalizeTailwindcssV4EmptyVarFallback(input)
      expect(result).toBe('color: var(--tw-text-color, ); margin: var(--tw-margin) 0px; padding: var(--tw-padding, ) 10px;')
    })
  })
  it('styleHandler calc', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssPresetEnv: {
        features: {
          'custom-properties': true,
          'nested-calc': true,
        },
        // browsers: ['defaults'],
      },
    })
    const { css } = await styleHandler(`
:root{
--spacing: 8rpx;
--radius-3xl: 48rpx;
--radius-4xl: calc(var(--spacing) * 8);
}`,
    )
    expect(css).toMatchSnapshot()
  })

  it('downgrades modern rgb syntax via preset env defaults', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(`
.a{
  color: rgb(245 247 255 / var(--tw-bg-opacity));
  background: rgb(59 130 246 / 0.5);
}
`)
    expect(css).toContain('color: rgba(245, 247, 255, var(--tw-bg-opacity));')
    expect(css).toContain('background: rgba(59, 130, 246, 0.5);')
  })

  it('still downgrades rgb() notation when color-functional-notation preserves modern syntax', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      cssPresetEnv: {
        features: {
          'color-functional-notation': { preserve: true },
        },
      },
    })
    const { css } = await styleHandler(`
.b{
  border-color: rgb(37 99 235 / var(--tw-border-opacity));
}
`)
    expect(css).toContain('border-color: rgba(37, 99, 235, var(--tw-border-opacity));')
  })
})
