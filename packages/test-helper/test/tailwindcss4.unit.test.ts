import { createRequire } from 'node:module'
import postcss from 'postcss'
import { describe, expect, it, vi } from 'vitest'
import { generateCss } from '../src/tailwindcss4'

const tailwindcssPostcss = vi.hoisted(() => vi.fn(() => ({
  postcssPlugin: 'mock-tailwindcss-v4',
})))

vi.mock('@tailwindcss/postcss', () => ({
  default: tailwindcssPostcss,
}))

const require = createRequire(import.meta.url)

describe('tailwindcss4 test helper', () => {
  it('uses tailwindcss root imports by default before postcss processing', async () => {
    const result = await generateCss('/project/app')

    expect(tailwindcssPostcss).toHaveBeenCalledWith({
      base: '/project/app',
    })
    expect(result.css).toBe(`@import "${require.resolve('weapp-tailwindcss/index.css')}";`)
  })

  it('rewrites tailwindcss$ and url subpath imports when resolvable', async () => {
    const result = await generateCss('/project/app', {
      css: [
        '@import "tailwindcss$";',
        '@import url("tailwindcss/index.css");',
      ].join('\n'),
    })

    expect(result.css).toContain(`@import "${require.resolve('weapp-tailwindcss/index.css')}";`)
    expect(result.css).toContain(`@import url("${require.resolve('weapp-tailwindcss/index.css')}");`)
  })

  it('keeps unrelated and unresolved imports unchanged', async () => {
    const result = await generateCss('/project/app', {
      css: [
        '@import "local.css";',
        '@import "tailwindcss/does-not-exist.css";',
      ].join('\n'),
    })

    expect(result.css).toContain('@import "local.css";')
    expect(result.css).toContain('@import "tailwindcss/does-not-exist.css";')
  })

  it('runs custom postcss plugins after comment removal', async () => {
    const appendRule = {
      postcssPlugin: 'append-rule',
      Once(root: postcss.Root) {
        root.append({
          selector: '.generated',
          nodes: [
            {
              prop: 'color',
              value: 'red',
            },
          ],
        })
      },
    }

    const result = await generateCss('/project/app', {
      css: '/* removed */',
      postcssPlugins: [appendRule],
    })

    expect(result.css).toBe('.generated {\n    color: red\n}')
  })
})
