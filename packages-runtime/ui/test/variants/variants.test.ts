/**
 * Variants 测试
 */
import { describe, expect, it } from 'vitest'
import {
  avatar,
  badge,
  button,
  card,
  chip,
  input,
  list,
  listItem,
  skeleton,
  tag,
  toast,
  toolbar,
} from '../../src/variants'

describe('Variants', () => {
  describe('button', () => {
    it('should generate default button classes', () => {
      const classes = button()
      expect(classes).toContain('wt-button')
    })

    it('should generate button with tone', () => {
      const classes = button({ tone: 'danger' })
      expect(classes).toContain('wt-button--danger')
    })

    it('should generate button with appearance', () => {
      const classes = button({ appearance: 'outline' })
      expect(classes).toContain('wt-button--outline')
    })

    it('should generate button with size', () => {
      const classes = button({ size: 'sm' })
      expect(classes).toContain('wt-button--small')
    })

    it('should generate disabled button', () => {
      const classes = button({ disabled: true })
      expect(classes).toContain('is-disabled')
    })

    it('should merge custom classes', () => {
      const classes = button({ className: 'custom-class' })
      expect(classes).toContain('wt-button')
      expect(classes).toContain('custom-class')
    })
  })

  describe('badge', () => {
    it('should generate default badge classes', () => {
      const classes = badge()
      expect(classes).toContain('wt-badge')
    })

    it('should generate badge with tone', () => {
      const classes = badge({ tone: 'danger' })
      expect(classes).toContain('wt-badge--danger')
    })
  })

  describe('input', () => {
    it('should generate default input classes', () => {
      const classes = input()
      expect(classes).toContain('wt-input')
    })

    it('should generate input with state', () => {
      const classes = input({ state: 'error' })
      expect(classes).toContain('is-error')
    })

    it('should generate disabled input', () => {
      const classes = input({ disabled: true })
      expect(classes).toContain('is-disabled')
    })
  })

  describe('card', () => {
    it('should generate default card classes', () => {
      const classes = card()
      expect(classes).toContain('wt-card')
    })
  })

  describe('avatar', () => {
    it('should generate default avatar classes', () => {
      const classes = avatar()
      expect(classes).toContain('wt-avatar')
    })

    it('should generate avatar with size', () => {
      const classes = avatar({ size: 'lg' })
      expect(classes).toContain('wt-avatar--lg')
    })
  })

  describe('all variants should be functions', () => {
    const variants = [
      avatar,
      badge,
      button,
      card,
      chip,
      input,
      list,
      listItem,
      skeleton,
      tag,
      toast,
      toolbar,
    ]

    it.each(variants)('variant %# should be a function', (variant) => {
      expect(typeof variant).toBe('function')
      expect(typeof variant()).toBe('string')
    })
  })
})
