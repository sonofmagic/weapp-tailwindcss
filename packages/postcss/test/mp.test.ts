import postcss from 'postcss'
import { commonChunkPreflight } from '@/mp'

describe('mp', () => {
  it('commonChunkPreflight case 0', () => {
    const root = postcss.parse('.foo { color: red; }')
    commonChunkPreflight(root.first as postcss.Rule, {})
    expect(root.toString()).toBe('.foo { color: red; }')
  })

  it('commonChunkPreflight case 1', () => {
    const root = postcss.parse(':root,:host { color: red; }')
    commonChunkPreflight(root.first as postcss.Rule, {})
    expect(root.toString()).toBe(':root,:host { color: red; }')
  })

  it('commonChunkPreflight case 2', () => {
    const root = postcss.parse(':root,:host { color: red; }')
    commonChunkPreflight(root.first as postcss.Rule, { injectAdditionalCssVarScope: true })
    expect(root.toString()).toBe(':root,:host { color: red; }')
  })

  it('commonChunkPreflight case 3', () => {
    const root = postcss.parse(':root,:host { color: red; }')
    commonChunkPreflight(root.first as postcss.Rule, { injectAdditionalCssVarScope: true, majorVersion: 4 })
    expect(root.toString()).toMatchSnapshot()
  })
})
