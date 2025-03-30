import { getCompilerContext } from '@/context'
import tailwindcss from '@tailwindcss/postcss'
import fs from 'fs-extra'
import path from 'pathe'
import postcss from 'postcss'
import { createGetCase, createPutCase, cssCasePath, rootPath } from '../util'

const getCase = createGetCase(cssCasePath)
const putCase = createPutCase(cssCasePath)

describe('tailwindcss v4', () => {
  it('v4-default.css', async () => {
    const rawCss = await getCase('v4-default.css')
    const { styleHandler } = getCompilerContext()
    const { css } = await styleHandler(rawCss)
    await putCase('v4-default-output.css', css)
    expect(css).toMatchSnapshot()
  })

  it('weapp-tailwindcss default', async () => {
    const filepath = path.resolve(rootPath, './index.css')
    const rawCss = await fs.readFile(filepath, 'utf8')
    const { styleHandler } = getCompilerContext()
    const { css: hahaCss } = await postcss([tailwindcss(
      {
        base: __dirname,
      },
    )]).process(rawCss, {
      from: filepath,
    })
    const { css } = await styleHandler(hahaCss)
    await putCase('v4-weapp-tailwindcss-default-output.css', css)
    expect(css).toMatchSnapshot()
  })

  it('weapp-tailwindcss default with layer', async () => {
    const filepath = path.resolve(rootPath, './with-layer.css')
    const rawCss = await fs.readFile(filepath, 'utf8')
    const { styleHandler } = getCompilerContext()
    const { css: hahaCss } = await postcss([tailwindcss(
      {
        base: __dirname,
      },
    )]).process(rawCss, {
      from: filepath,
    })
    const { css } = await styleHandler(hahaCss)
    await putCase('v4-weapp-tailwindcss-default-with-layer-output.css', css)
    expect(css).toMatchSnapshot()
  })
})
