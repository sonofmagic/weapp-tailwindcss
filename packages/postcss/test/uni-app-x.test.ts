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
})
