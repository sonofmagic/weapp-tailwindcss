import { getCompilerContext } from '@/context'
import { createJsHandler } from '@/js'
import { createGetCase, fixturesRootPath } from './util'

const getCase = createGetCase(fixturesRootPath)
const INVALID_UNI_APP_X_BASE_SELECTOR_RE = /(^|,)\s*(?:\*|view|text|::before|::after|:before|:after|::backdrop)\s*(?=,|\{)/m

describe('uni-app-x', () => {
  it('uvue.ts case 0', async () => {
    const jsHandler = createJsHandler({
      babelParserOptions: {
        sourceType: 'unambiguous',
        plugins: [
          'typescript',
        ],
      },
    })
    const set = new Set<string>()
    set.add('mt-[32.43rpx]')
    set.add('bg-[#322323]')
    set.add('text-[#844343]')
    const { code } = jsHandler(
      await getCase('uni-app-x/index.uvue.ts'),
      set,
      {

      },
    )
    expect(code).toMatchSnapshot()
  })

  it('uvue.ts case 1', async () => {
    const { jsHandler, styleHandler } = getCompilerContext({
      uniAppX: true,
    })
    const set = new Set<string>()
    set.add('mt-[32.43rpx]')
    set.add('bg-[#322323]')
    set.add('text-[#844343]')
    const { code } = jsHandler(
      await getCase('uni-app-x/index.uvue.ts'),
      set,
      {
        babelParserOptions: {
          sourceType: 'unambiguous',
          plugins: [
            'typescript',
          ],
        },
      },
    )
    expect(code).toMatchSnapshot()

    const { css } = await styleHandler(
      await getCase('uni-app-x/app.css'),
      {
        uniAppX: true,
      },
    )
    expect(css).toMatchSnapshot('css')
  })

  it('tailwindcss3 index.uvue.ts case 1', async () => {
    const { jsHandler, styleHandler } = getCompilerContext({
      uniAppX: true,
    })
    const set = new Set<string>()
    set.add('mt-[32.43rpx]')
    set.add('bg-[#322323]')
    set.add('text-[#844343]')
    const { code } = jsHandler(
      await getCase('uni-app-x/tw3-index.uvue.ts'),
      set,
      {
        babelParserOptions: {
          sourceType: 'unambiguous',
          plugins: [
            'typescript',
          ],
        },
      },
    )
    expect(code).toMatchSnapshot()

    const { css } = await styleHandler(
      await getCase('uni-app-x/App.uvue.css'),
      {
        uniAppX: true,
      },
    )
    expect(css).toContain('.mt-_b32_d43rpx_B')
    expect(css).toContain('.bg-_b_h322323_B')
    expect(css).not.toMatch(INVALID_UNI_APP_X_BASE_SELECTOR_RE)
    expect(css).not.toContain('--tw-border-spacing-x: 0;')
  })

  it.each(['app-android', 'app-ios'])('keeps @tailwind base usable on %s without pseudo-element selectors', async (platform) => {
    process.env.UNI_UTS_PLATFORM = platform
    const { styleHandler } = getCompilerContext({
      uniAppX: true,
    })

    const { css } = await styleHandler(
      await getCase('uni-app-x/App.uvue.css'),
      {
        uniAppX: true,
      },
    )

    expect(css).not.toMatch(INVALID_UNI_APP_X_BASE_SELECTOR_RE)
    expect(css).toContain('.mt-_b32_d43rpx_B')
    expect(css).toContain('.bg-_b_h322323_B')
  })

  it.each(['app-android', 'app-ios'])('pushes required --tw-* defaults down to utility classes on %s', async (platform) => {
    process.env.UNI_UTS_PLATFORM = platform
    const { styleHandler } = getCompilerContext({
      uniAppX: true,
    })

    const { css } = await styleHandler(`
view,text,:before,:after {
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
`, {
      uniAppX: true,
    })

    expect(css).not.toMatch(INVALID_UNI_APP_X_BASE_SELECTOR_RE)
    expect(css).toContain('.transform {')
    expect(css).toContain('--tw-translate-x: 0;')
    expect(css).toContain('--tw-scale-y: 1;')
    expect(css).toContain('.shadow {')
    expect(css).toContain('--tw-ring-offset-shadow: 0 0 rgba(0,0,0,0);')
    expect(css).toContain('--tw-shadow: 0 0 rgba(0,0,0,0);')
    expect(css).not.toContain('--tw-text-opacity:')
  })
})
