import postcss, { Rule } from 'postcss'
import { testIfVariablesScope } from '@/postcss/mp'
describe('variablesScope', () => {
  it('::before,::after{} with single var', () => {
    const root = postcss.parse(`::before,::after {
      --tw-content: "";
    }`)
    expect(testIfVariablesScope(root.nodes[0] as Rule)).toBe(true)
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
    expect(testIfVariablesScope(root.nodes[0] as Rule)).toBe(true)
    expect(testIfVariablesScope(root.nodes[0] as Rule, 2)).toBe(false)
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
})
