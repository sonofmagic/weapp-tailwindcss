import { pluginName } from '@/shared'
import pkg from '../package.json'

describe('[Default]', () => {
  it('pluginName should be pkg name', () => {
    expect(pluginName).toBe(pkg.name)
  })
})
