import fs from 'fs-extra'
import path from 'pathe'
import { createStyleHandler } from '@/index'

function getCase(name: string) {
  return fs.readFile(path.resolve(import.meta.dirname, `./fixtures/css/darkMode/${name}`), 'utf8')
}

describe('darkMode', () => {
  it(`darkMode default`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await getCase('default.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it(`darkMode: default uni-app x`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      uniAppX: true,
    })
    const code = await getCase('default.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it(`darkMode: 'class',`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await getCase('class.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it(`darkMode: 'class', uni-app x`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      uniAppX: true,
    })
    const code = await getCase('class.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it(`darkMode: 'selector',`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await getCase('selector.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it(`darkMode: 'selector', uni-app x`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      uniAppX: true,
    })
    const code = await getCase('selector.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it(`darkMode: ['selector', '[data-mode="dark"]'],`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await getCase('attr.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it('保留第三方属性选择器，不把它们当成主题切换兜底删除', async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const { css } = await styleHandler(`[dir="rtl"] .nut-toast,
.nut-rtl .nut-toast {
  left: auto;
  right: 0;
}`)
    expect(css).toContain('[dir="rtl"] .nut-toast')
    expect(css).toContain('.nut-rtl .nut-toast')
  })

  it(`darkMode: ['selector', '[data-mode="dark"]'], uni-app x`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
      uniAppX: true,
    })
    const code = await getCase('attr.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it(`darkMode: ['variant', '&:not(.light *)'],`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await getCase('variant0.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it(`darkMode: ['variant', '&:not(.light *)'], uni-app x`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await getCase('variant0.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })

  it(`darkMode: ['variant', ['@media ...', '&:is(.dark *)']]`, async () => {
    const styleHandler = createStyleHandler({
      isMainChunk: true,
    })
    const code = await getCase('variant1.css')
    const { css } = await styleHandler(code)
    expect(css).toMatchSnapshot()
  })
})
