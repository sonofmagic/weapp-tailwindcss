import { generateCss3, generateCss4 } from '@weapp-tailwindcss/test-helper'
import fs from 'fs-extra'
import path from 'pathe'
import postcss from 'postcss'
import htmlTransform from '@/html-transform'

const targetPath = path.resolve(__dirname, './fixtures/issues/631/index.js')
const targetCode = await fs.readFile(targetPath, 'utf8')

describe('html-transform', () => {
  it('removeUniversal true', async () => {
    const { css } = await postcss([htmlTransform({
      removeUniversal: true,
    })]).process(`
    *{}
      * div{}
      * > p{}
      * + span{}
      * ~ a{}
      * .class{}
      * #id{}
      *[attr]{}
      *:not(.class){}
      *:not(#id){}
      *:not([attr]){}
      #app * span{}
      #app > * + span{}
      #app ~ * > a{}
      #app > * + span{}
      #app > * + span > a{}
      #app > * + span > a + b{}
    
      `)
    expect(css.trim()).toBe(``)
  })

  it('default', async () => {
    const { css } = await postcss([htmlTransform()]).process(`
    *{}
      * div{}
      * > p{}
      * + span{}
      * ~ a{}
      * .class{}
      * #id{}
      *[attr]{}
      *:not(.class){}
      *:not(#id){}
      *:not([attr]){}
      #app * span{}
      #app > * + span{}
      #app ~ * > a{}
      #app > * + span{}
      #app > * + span > a{}
      #app > * + span > a + b{}
    
      `)
    expect(css.trim()).toMatchSnapshot(``)
  })

  it('tailwindcss v3', async () => {
    const { css } = await generateCss3(targetCode)
    expect(css.trim()).toMatchSnapshot()
  })

  it('tailwindcss v3 with htmlTransform', async () => {
    const { css } = await generateCss3(targetCode, {
      postcssPlugins: [htmlTransform()],
    })
    expect(css.trim()).toMatchSnapshot()
  })

  it('tailwindcss v3 all', async () => {
    const { css } = await generateCss3(targetCode, {
      css: '@tailwind base;@tailwind components;@tailwind utilities;',
    })
    expect(css.trim()).toMatchSnapshot()
  })

  it('tailwindcss v3 all with htmlTransform', async () => {
    const { css } = await generateCss3(targetCode, {
      css: '@tailwind base;@tailwind components;@tailwind utilities;',
      postcssPlugins: [htmlTransform()],
    })
    expect(css.trim()).toMatchSnapshot()
  })

  it('tailwindcss v3 all with htmlTransform with removeUniversal true', async () => {
    const { css } = await generateCss3(targetCode, {
      css: '@tailwind base;@tailwind components;@tailwind utilities;',
      postcssPlugins: [htmlTransform({ removeUniversal: true })],
    })
    expect(css.trim()).toMatchSnapshot()
  })

  it('tailwindcss v4', async () => {
    const { css } = await generateCss4(path.dirname(targetPath))
    expect(css.trim()).toMatchSnapshot()
  })

  it('tailwindcss v4 with htmlTransform', async () => {
    const { css } = await generateCss4(path.dirname(targetPath), {
      postcssPlugins: [htmlTransform()],
    })
    expect(css.trim()).toMatchSnapshot()
  })

  it('tailwindcss v4 with htmlTransform with removeUniversal true', async () => {
    const { css } = await generateCss4(path.dirname(targetPath), {
      postcssPlugins: [htmlTransform({ removeUniversal: true })],
    })
    expect(css.trim()).toMatchSnapshot()
  })
})
