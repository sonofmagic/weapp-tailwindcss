import { getOptions } from '@/defaults'
describe('get options', () => {
  it('default options', () => {
    const options = getOptions()
    expect(options).toMatchSnapshot()
  })
  it('vue framework', () => {
    const options = getOptions({
      framework: 'vue'
    })
    expect(options.framework).toBe('vue2')
    expect(options).toMatchSnapshot()
  })
})
