/**
 * 平台适配器测试
 */
import { describe, expect, it } from 'vitest'
import { getCurrentAdapter, nativeAdapter, taroAdapter, uniAppAdapter } from '../../src/adapters'

describe('Adapters', () => {
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
  })
})
