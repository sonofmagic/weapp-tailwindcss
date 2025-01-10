import type { Rule } from 'postcss'
import { testIfTwBackdrop, testIfVariablesScope } from '@/mp'
import postcss from 'postcss'

describe('variablesScope', () => {
  it('::before,::after{} with single var', () => {
    const root = postcss.parse(`::before,::after {
      --tw-content: "";
    }`)
    expect(testIfVariablesScope(root.nodes[0] as Rule, 1)).toBe(true)
    expect(testIfVariablesScope(root.nodes[0] as Rule, 2)).toBe(false)
  })

  it('::before,::after{} with multiple var(2)', () => {
    const root = postcss.parse(`::before,::after {
      --tw-border-spacing-x: 0;
      --tw-border-spacing-y: 0;
    }`)
    expect(testIfVariablesScope(root.nodes[0] as Rule, 2)).toBe(true)
    expect(testIfVariablesScope(root.nodes[0] as Rule, 3)).toBe(false)
  })

  it('::before,::after{} with multiple var(3)', () => {
    const root = postcss.parse(`::before,::after {
      --tw-border-spacing-x: 0;
      --tw-border-spacing-y: 0;
      --tw-translate-x: 0;
    }`)
    expect(testIfVariablesScope(root.nodes[0] as Rule, 2)).toBe(true)
    expect(testIfVariablesScope(root.nodes[0] as Rule, 3)).toBe(true)
  })

  it('::before,::after{} with attrs and multiple var(1)', () => {
    const root = postcss.parse(`::before,::after {
      --tw-border-spacing-x: 0;
      box-sizing: border-box;
      --tw-translate-x: 0;
    }`)
    expect(testIfVariablesScope(root.nodes[0] as Rule, 1)).toBe(true)
    expect(testIfVariablesScope(root.nodes[0] as Rule, 2)).toBe(true)
  })

  it('::before,::after{} with attrs and multiple var(2)', () => {
    const root = postcss.parse(`::before,::after {
      --tw-border-spacing-x: 0;
      --tw-translate-x: 0;
      box-sizing: border-box;
    }`)
    expect(testIfVariablesScope(root.nodes[0] as Rule)).toBe(true)
    expect(testIfVariablesScope(root.nodes[0] as Rule, 2)).toBe(true)
  })

  it('find backdrop', () => {
    const root = postcss.parse(`::backdrop {
      --tw-border-spacing-x: 0;
      --tw-border-spacing-y: 0;
      --tw-translate-x: 0;
      --tw-translate-y: 0;
      --tw-rotate: 0;
      --tw-skew-x: 0;
      --tw-skew-y: 0;
      --tw-scale-x: 1;
      --tw-scale-y: 1;
      --tw-pan-x: ;
      --tw-pan-y: ;
      --tw-pinch-zoom: ;
      --tw-scroll-snap-strictness: proximity;
      --tw-gradient-from-position: ;
      --tw-gradient-via-position: ;
      --tw-gradient-to-position: ;
      --tw-ordinal: ;
      --tw-slashed-zero: ;
      --tw-numeric-figure: ;
      --tw-numeric-spacing: ;
      --tw-numeric-fraction: ;
      --tw-ring-inset: ;
      --tw-ring-offset-width: 0rpx;
      --tw-ring-offset-color: #fff;
      --tw-ring-color: rgba(59, 130, 246, 0.5);
      --tw-ring-offset-shadow: 0 0 #0000;
      --tw-ring-shadow: 0 0 #0000;
      --tw-shadow: 0 0 #0000;
      --tw-shadow-colored: 0 0 #0000;
      --tw-blur: ;
      --tw-brightness: ;
      --tw-contrast: ;
      --tw-grayscale: ;
      --tw-hue-rotate: ;
      --tw-invert: ;
      --tw-saturate: ;
      --tw-sepia: ;
      --tw-drop-shadow: ;
      --tw-backdrop-blur: ;
      --tw-backdrop-brightness: ;
      --tw-backdrop-contrast: ;
      --tw-backdrop-grayscale: ;
      --tw-backdrop-hue-rotate: ;
      --tw-backdrop-invert: ;
      --tw-backdrop-opacity: ;
      --tw-backdrop-saturate: ;
      --tw-backdrop-sepia: ;
    }
    `)

    expect(root).toBeTruthy()
    expect(testIfTwBackdrop(root.nodes[0] as Rule, 1)).toBe(true)
    expect(testIfTwBackdrop(root.nodes[0] as Rule, 20)).toBe(true)
    expect(testIfTwBackdrop(root.nodes[0] as Rule, 100)).toBe(false)
  })

  it('find backdrop case 1', () => {
    const root = postcss.parse(`::backdrop {
      --tw-border-spacing-x: 0;
    }
    `)
    expect(root).toBeTruthy()
    expect(testIfTwBackdrop(root.nodes[0] as Rule, 1)).toBe(true)
    expect(testIfTwBackdrop(root.nodes[0] as Rule, 2)).toBe(false)
    expect(testIfTwBackdrop(root.nodes[0] as Rule, 100)).toBe(false)
  })

  it('find backdrop case 2', () => {
    const root = postcss.parse(`::backdrop {
    }
    `)
    expect(root).toBeTruthy()
    expect(testIfTwBackdrop(root.nodes[0] as Rule, 1)).toBe(false)
    expect(testIfTwBackdrop(root.nodes[0] as Rule, 2)).toBe(false)
    expect(testIfTwBackdrop(root.nodes[0] as Rule, 100)).toBe(false)
  })
})
