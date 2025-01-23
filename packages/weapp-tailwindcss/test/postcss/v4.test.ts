import { getCompilerContext } from '@/context'
import { createGetCase, createPutCase, cssCasePath } from '../util'

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
})
