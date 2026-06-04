// import pkg from '../package.json'
import { pluginName } from '@/constants'
import { unitConversionComposeRules, unitConversionPresets } from '@/index'

describe('[Default]', () => {
  it('pluginName should be pkg name', () => {
    expect(pluginName).toBe('weapp-tailwindcss')
  })

  it('exports unit conversion helpers from the main entry', () => {
    expect(unitConversionComposeRules(unitConversionPresets.rpxToPx())).toEqual([
      expect.objectContaining({
        from: 'rpx',
        to: 'px',
      }),
    ])
  })
})
