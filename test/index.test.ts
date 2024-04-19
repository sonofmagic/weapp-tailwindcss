// import pkg from '../package.json'
import { pluginName } from '@/constants'

describe('[Default]', () => {
  it('pluginName should be pkg name', () => {
    expect(pluginName).toBe('weapp-tailwindcss-webpack-plugin')
  })
})
