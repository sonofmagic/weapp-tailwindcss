import tailwindcss from '@tailwindcss/postcss'
import { postcssRemoveComment } from '@weapp-tailwindcss/test-helper'
import fs from 'fs-extra'
import path from 'pathe'
import postcss from 'postcss'
import { getCompilerContext } from '@/context'
import { createGetCase, createPutCase, cssCasePath, rootPath } from '../util'

const getCase = createGetCase(cssCasePath)
const putCase = createPutCase(cssCasePath)

type CompilerOptions = Parameters<typeof getCompilerContext>[0]

function getCtx(options?: CompilerOptions) {
  const postcssOptions = options?.postcssOptions ?? {}
  return getCompilerContext({
    ...options,
    postcssOptions: {
      ...postcssOptions,
      plugins: [
        postcssRemoveComment,
        ...(postcssOptions.plugins ?? []),
      ],
    },
  })
}

describe('tailwindcss v4', () => {
  it('v4-default.css', async () => {
    const rawCss = await getCase('v4-default.css')
    const { styleHandler } = getCtx()
    const { css } = await styleHandler(rawCss)
    await putCase('v4-default-output.css', css)
    expect(css).toMatchSnapshot()
  })

  it('weapp-tailwindcss default', async () => {
    const filepath = path.resolve(rootPath, './index.css')
    const rawCss = await fs.readFile(filepath, 'utf8')
    const { styleHandler } = getCtx()
    const { css: hahaCss } = await postcss([
      tailwindcss(
        {
          base: __dirname,
        },
      ),
      postcssRemoveComment,
    ]).process(rawCss, {
      from: filepath,
    })
    expect(hahaCss).toMatchSnapshot('tailwindcss')
    await putCase('v4-weapp-tailwindcss-default-output.before.css', hahaCss)
    const { css } = await styleHandler(hahaCss)
    await putCase('v4-weapp-tailwindcss-default-output.css', css)
    expect(css).toMatchSnapshot()
  })

  it('weapp-tailwindcss default with layer', async () => {
    const filepath = path.resolve(rootPath, './with-layer.css')
    const rawCss = await fs.readFile(filepath, 'utf8')
    const { styleHandler } = getCtx()
    const { css: hahaCss } = await postcss([
      tailwindcss(
        {
          base: __dirname,
        },
      ),
      postcssRemoveComment,
    ]).process(rawCss, {
      from: filepath,
    })
    expect(hahaCss).toMatchSnapshot('tailwindcss')
    await putCase('v4-weapp-tailwindcss-default-with-layer-output.before.css', hahaCss)
    const { css } = await styleHandler(hahaCss)
    await putCase('v4-weapp-tailwindcss-default-with-layer-output.css', css)
    expect(css).toMatchSnapshot()
  })

  it('mpx handles tailwindcss v4.1.17 css bundle', async () => {
    const rawCss = await getCase('mpx-tailwindcss-v4.1.17.css')
    const { styleHandler } = getCtx({ appType: 'mpx' })
    const { css } = await styleHandler(rawCss)
    await putCase('mpx-tailwindcss-v4.1.17-output.css', css)
    expect(css).toMatchSnapshot()
  })
})
