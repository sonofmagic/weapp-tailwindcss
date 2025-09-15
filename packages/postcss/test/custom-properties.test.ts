import postcss from 'postcss'
import postcssCustomProperties from 'postcss-custom-properties'

describe('custom-properties', () => {
  const baseCss = `:root {
--color-blue-dark: rgb(0, 61, 184);
--color-blue-light: rgb(0, 217, 255);
--color-pink: rgb(255, 192, 211);
--text-color: var(--color-pink);
}

.element {
/* custom props */
--border-color: var(--color-blue-light);
/* props */
border: 1px solid var(--border-color);
color: var(--text-color);
}

.element--dark {
--border-color: var(--color-blue-dark);
}`
  it('should case 0', () => {
    const { css } = postcss([
      postcssCustomProperties({
        preserve: true,
      }),
    ]).process(baseCss, {
      from: undefined,
    })

    expect(css).toMatchSnapshot()
  })

  it('should case 1', () => {
    const HAS_VAR_FUNCTION_REGEX = /\bvar\(/i
    const { css } = postcss([
      // {

      // } satisfies postcss.Processor
      {
        postcssPlugin: 'postcss-custom-properties',
        prepare(css) {
          // https://github.com/csstools/postcss-plugins/blob/main/plugins/postcss-custom-properties/src/index.ts
          const ppp = postcssCustomProperties({
            preserve: true,
          }) as postcss.Plugin
          const hooks = ppp.prepare?.(css)
          return {
            Once: hooks?.Once,
            Declaration(decl) {
              if (!HAS_VAR_FUNCTION_REGEX.test(decl.value)) {
                return
              }
              hooks
                // @ts-ignore
                ?.Declaration
                ?.(decl)
            },
          }
        },
      },

    ]).process(baseCss, {
      from: undefined,
    })

    expect(css).toMatchSnapshot()
  })
})
