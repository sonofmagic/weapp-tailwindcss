/**
 * 平台适配器测试
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createEventHandlers,
  createPlatformAdapter,
  getCurrentAdapter,
  nativeAdapter,
  taroAdapter,
  uniAppAdapter,
} from '../../src/adapters'

async function loadAdaptersWithPlatform(platform: string) {
  vi.resetModules()
  vi.doMock('../../src/utils/platform', () => ({
    currentPlatform: platform,
  }))
  return await import('../../src/adapters')
}

describe('Adapters', () => {
  afterEach(() => {
    vi.doUnmock('../../src/utils/platform')
  })

  describe('nativeAdapter', () => {
    it('should have correct event mappings', () => {
      expect(nativeAdapter.name).toBe('native')
      expect(nativeAdapter.events.click).toBe('bindtap')
      expect(nativeAdapter.events.input).toBe('bindinput')
    })

    it('should get event prop name', () => {
      expect(nativeAdapter.getEventPropName('click')).toBe('bindtap')
    })

    it('should get event detail', () => {
      const event = { detail: { value: 'test' } }
      expect(nativeAdapter.getEventDetail(event)).toEqual({ value: 'test' })
    })

    it('should get event value', () => {
      const event = { detail: { value: 'test' } }
      expect(nativeAdapter.getEventValue(event)).toBe('test')
    })
  })

  describe('taroAdapter', () => {
    it('should have correct event mappings', () => {
      expect(taroAdapter.name).toBe('taro')
      expect(taroAdapter.events.click).toBe('onClick')
      expect(taroAdapter.events.input).toBe('onInput')
    })
  })

  describe('uniAppAdapter', () => {
    it('should have correct event mappings', () => {
      expect(uniAppAdapter.name).toBe('uni-app')
      expect(uniAppAdapter.events.click).toBe('@click')
      expect(uniAppAdapter.events.input).toBe('@input')
    })
  })

  describe('getCurrentAdapter', () => {
    it('should return an adapter', () => {
      const adapter = getCurrentAdapter()
      expect(adapter).toBeDefined()
      expect(adapter.name).toBeDefined()
      expect(adapter.events).toBeDefined()
    })

    it('selects adapters from the current platform constant', async () => {
      await expect(loadAdaptersWithPlatform('native').then(mod => mod.getCurrentAdapter().name)).resolves.toBe('native')
      await expect(loadAdaptersWithPlatform('taro').then(mod => mod.getCurrentAdapter().name)).resolves.toBe('taro')
      await expect(loadAdaptersWithPlatform('uni-app').then(mod => mod.getCurrentAdapter().name)).resolves.toBe('uni-app')
      await expect(loadAdaptersWithPlatform('unknown').then(mod => mod.getCurrentAdapter().name)).resolves.toBe('native')
    })

    it('exports adapter as the import-time current adapter', async () => {
      const mod = await loadAdaptersWithPlatform('taro')

      expect(mod.adapter).toBe(mod.taroAdapter)
    })
  })

  describe('createPlatformAdapter', () => {
    it('merges default maps and adapts events/styles/capabilities', () => {
      const click = () => {}
      const input = () => {}
      const adapter = createPlatformAdapter(
        'native',
        {
          click: 'bindtap',
          longPress: 'bindlongpress',
          input: 'bindinput',
          focus: 'bindfocus',
          blur: 'bindblur',
          change: 'bindchange',
          touchStart: 'bindtouchstart',
          touchMove: 'bindtouchmove',
          touchEnd: 'bindtouchend',
          confirm: 'bindconfirm',
        },
        {
          View: 'view',
        },
        {
          prefixedProperties: {
            transition: 'webkit',
          },
        },
        {
          cssFeatures: {
            grid: false,
          },
          apiFeatures: {
            slots: false,
          },
        },
      )

      expect(adapter.components.View).toBe('view')
      expect(adapter.components.Text).toBe('Text')
      expect(adapter.getEventPropName('filter')).toBe('filter')
      expect(adapter.getEventProps(['click', 'input'], { click, input })).toEqual({
        bindtap: click,
        bindinput: input,
      })
      expect(adapter.getEventDetail({ value: 1 })).toEqual({ value: 1 })
      expect(adapter.getEventValue({ value: 1 })).toEqual(1)
      expect(adapter.adaptStyle?.({ transition: 'all .2s', color: 'red' })).toEqual({
        webkittransition: 'all .2s',
        color: 'red',
      })
      expect(adapter.adaptClassName?.('text-red-500')).toBe('text-red-500')
      expect(adapter.supportsCssFeature('grid')).toBe(false)
      expect(adapter.supportsCssFeature('animation')).toBe(false)
      expect(adapter.supportsApiFeature('slots')).toBe(false)
      expect(adapter.supportsApiFeature('nativeComponents')).toBe(false)
    })

    it('creates event handlers while omitting undefined handlers', () => {
      const click = () => {}

      expect(createEventHandlers(nativeAdapter, ['click', 'input'], {
        click,
        input: undefined,
      })).toEqual({
        bindtap: click,
      })
    })
  })
})
