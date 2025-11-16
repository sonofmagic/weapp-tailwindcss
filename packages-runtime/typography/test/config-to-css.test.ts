/* eslint-disable ts/no-require-imports */
const typographyPlugin: any = require('../src/index')

describe('configToCss helper', () => {
  it('handles non-nested values for modern targets and modifiers', () => {
    const configToCss = typographyPlugin._configToCss

    const result = configToCss({
      css: {
        '> p': { color: 'red' },
      },
    }, {
      target: 'modern',
      className: 'prose',
      modifier: 'lg',
      prefix: (value: string) => value,
      mode: 'class',
      classPrefix: '',
    })

    const [[selector, value]] = Object.entries(result)
    expect(selector).toContain('.prose-lg')
    expect(value).toEqual({ color: 'red' })
  })
})
