import { tailwindcssCasePath, createGetCase } from '#test/util'
import { inspectProcessTailwindFeaturesReturnContext, inspectPostcssPlugin } from '@/tailwindcss/inspector'

const getCase = createGetCase(tailwindcssCasePath)
describe('exposeContext', () => {
  it('inspectProcessTailwindFeaturesReturnContext', async () => {
    const content = await getCase('lib/processTailwindFeatures.js')
    const res = inspectProcessTailwindFeaturesReturnContext(content)
    expect(res.code).toMatchSnapshot()
  })

  it('inspectProcessTailwindFeaturesReturnContext as same as output', async () => {
    const content = await getCase('lib-out/processTailwindFeatures.js')
    const res = inspectProcessTailwindFeaturesReturnContext(content)
    expect(res.code).toBe(content)
  })

  it('inspectPostcssPlugin', async () => {
    const content = await getCase('lib/plugin.js')
    const res = inspectPostcssPlugin(content)
    expect(res.code).toMatchSnapshot()
  })

  it('inspectPostcssPlugin as same as output', async () => {
    const content = await getCase('lib-out/plugin.js')
    const res = inspectPostcssPlugin(content)
    expect(res.code).toBe(content)
  })
})
