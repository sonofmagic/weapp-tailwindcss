import fs from 'fs-extra'
import path from 'pathe'
import { createStyleHandler } from '@/index'

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
    expect(css).toContain('* {')
    expect(css).toContain('--tw-border-spacing-x: 0;')
    expect(css).toContain('.mt-_b32_d43rpx_B')
    expect(css).toContain('.bg-_b_h322323_B')
    expect(css).not.toContain('::before')
    expect(css).not.toContain('::after')
    expect(css).not.toContain('::backdrop')
  })

  it('removes unsupported pseudo elements from base output while keeping universal vars', async () => {
    const styleHandler = createStyleHandler({
      uniAppX: true,
    })
    const { css } = await styleHandler(
      `*, ::before, ::after {
        --tw-border-spacing-x: 0;
        --tw-border-spacing-y: 0;
      }
      ::backdrop {
        --tw-ring-offset-width: 0px;
      }
      .after\\:content-\\[\\"x\\"\\]::after {
        --tw-content: "x";
        content: var(--tw-content);
      }
      .border-\\[\\#999\\] {
        border-color: rgb(153 153 153 / 1);
      }`,
      {
        isMainChunk: true,
      },
    )

    expect(css).not.toContain('::before')
    expect(css).not.toContain('::after')
    expect(css).not.toContain(':before')
    expect(css).not.toContain(':after')
    expect(css).not.toContain('::backdrop')
    expect(css).toContain('* {')
    expect(css).toContain('--tw-border-spacing-x: 0;')
    expect(css).toContain('.border-_b_h999_B')
  })
})
