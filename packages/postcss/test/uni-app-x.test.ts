import fs from 'fs-extra'
import path from 'pathe'
import { createStyleHandler } from '@/index'

const INVALID_UNI_APP_X_BASE_SELECTOR_RE = /(^|,)\s*(?:\*|view|text|::before|::after|:before|:after|::backdrop)\s*(?=,|\{)/m

describe('uni-app-x', () => {
  it('css', async () => {
    const styleHandler = createStyleHandler({
      // uniAppX: true,
    })
    const { css } = await styleHandler(
      await fs.readFile(
        path.resolve(__dirname, './fixtures/css/uni-app-x.css'),
        'utf8',
      ),
      {
        isMainChunk: true,
      },
    )
    expect(css).toMatchSnapshot('css')
  })

  it('app.uvue.css', async () => {
    const styleHandler = createStyleHandler({
      uniAppX: true,
    })
    const { css } = await styleHandler(
      await fs.readFile(
        path.resolve(__dirname, './fixtures/css/App.uvue.css'),
        'utf8',
      ),
      {
        isMainChunk: true,
      },
    )
    expect(css).toContain('.mt-_b32_d43rpx_B')
    expect(css).toContain('.bg-_b_h322323_B')
    expect(css).not.toMatch(INVALID_UNI_APP_X_BASE_SELECTOR_RE)
    expect(css).not.toContain('--tw-border-spacing-x: 0;')
  })

  it('removes unsupported carrier selectors and pushes required defaults to utility classes', async () => {
    const styleHandler = createStyleHandler({
      uniAppX: true,
    })
    const { css } = await styleHandler(
      `view,text,:before,:after {
        --tw-translate-x: 0;
        --tw-translate-y: 0;
        --tw-rotate: 0;
        --tw-skew-x: 0;
        --tw-skew-y: 0;
        --tw-scale-x: 1;
        --tw-scale-y: 1;
        --tw-ring-offset-shadow: 0 0 #0000;
        --tw-ring-shadow: 0 0 #0000;
        --tw-shadow: 0 0 #0000;
      }
      .transform {
        transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
      }
      .shadow {
        box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
      }
      .bg-plain {
        color: rgb(0 0 0 / var(--tw-text-opacity, 1));
      }
      .border-\\[\\#999\\] {
        border-color: rgb(153 153 153 / 1);
      }`,
      {
        isMainChunk: true,
      },
    )

    expect(css).not.toMatch(INVALID_UNI_APP_X_BASE_SELECTOR_RE)
    expect(css).toContain('.transform {')
    expect(css).toContain('--tw-translate-x: 0;')
    expect(css).toContain('--tw-scale-y: 1;')
    expect(css).toContain('.shadow {')
    expect(css).toContain('--tw-ring-offset-shadow: 0 0 rgba(0,0,0,0);')
    expect(css).toContain('--tw-shadow: 0 0 rgba(0,0,0,0);')
    expect(css).not.toContain('--tw-text-opacity:')
    expect(css).toContain('.border-_b_h999_B')
  })

  it('filters unsupported uvue selectors and declarations with warnings', async () => {
    const styleHandler = createStyleHandler({
      uniAppX: true,
      uniAppXCssTarget: 'uvue',
      uniAppXUnsupported: 'warn',
    })
    const result = await styleHandler(
      `
      .space-y-4 > view + view {
        margin-top: 1rem;
      }
      .block {
        display: block;
      }
      .inline-flex {
        display: inline-flex;
      }
      .grid {
        display: grid;
      }
      .grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .gap-4 {
        gap: 1rem;
      }
      .gap-x-3 {
        column-gap: 0.75rem;
      }
      .gap-y-2 {
        row-gap: 0.5rem;
      }
      .min-h-screen {
        min-height: 100vh;
      }
      .flex {
        display: flex;
      }
      `,
      {
        isMainChunk: true,
        postcssOptions: {
          options: {
            from: '/src/App.uvue',
          },
        },
      },
    )

    expect(result.css).not.toContain('.space-y-4')
    expect(result.css).not.toContain('display: block')
    expect(result.css).not.toContain('display: inline-flex')
    expect(result.css).not.toContain('display: grid')
    expect(result.css).not.toContain('grid-template-columns')
    expect(result.css).not.toContain('gap: 1rem')
    expect(result.css).not.toContain('column-gap: 0.75rem')
    expect(result.css).not.toContain('row-gap: 0.5rem')
    expect(result.css).not.toContain('min-height: 100vh')
    expect(result.css).toContain('.flex')
    expect(result.css).toContain('display: flex')

    const warningTexts = result.warnings().map(item => item.text)
    expect(warningTexts).toEqual(expect.arrayContaining([
      expect.stringContaining('space-y-4'),
      expect.stringContaining('block'),
      expect.stringContaining('inline-flex'),
      expect.stringContaining('grid'),
      expect.stringContaining('grid-cols-2'),
      expect.stringContaining('gap-4'),
      expect.stringContaining('gap-x-3'),
      expect.stringContaining('gap-y-2'),
      expect.stringContaining('min-h-screen'),
    ]))
    expect(warningTexts.every(item => item.includes('/src/App.uvue'))).toBe(true)
  })

  it('throws for unsupported uvue utility when mode is error', async () => {
    const styleHandler = createStyleHandler({
      uniAppX: true,
      uniAppXCssTarget: 'uvue',
      uniAppXUnsupported: 'error',
    })

    await expect(styleHandler('.block { display: block; }', {
      isMainChunk: true,
      postcssOptions: {
        options: {
          from: '/src/pages/index.uvue',
        },
      },
    })).rejects.toThrow(/uni-app x uvue unsupported utility: block/)
  })

  it('keeps original behaviour for non-uvue uni-app-x targets', async () => {
    const styleHandler = createStyleHandler({
      uniAppX: true,
    })
    const result = await styleHandler(
      `
      .space-y-4 > :not([hidden]) ~ :not([hidden]) {
        margin-top: 1rem;
      }
      .block {
        display: block;
      }
      `,
      {
        isMainChunk: true,
      },
    )

    expect(result.css).toContain('.space-y-4>view+view')
    expect(result.css).toContain('display: block')
  })
})
