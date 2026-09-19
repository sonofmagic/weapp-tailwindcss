import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createCssTransformShareScope } from '@/bundlers/vite/generate-bundle/css-share-scope'

describe('CSS transform location dependencies', () => {
  it.each([
    String.raw`.a{background:u\72l(./icon.svg)}`,
    String.raw`@\69mport "./dep.css";`,
  ])('isolates cached transforms of escaped relative resources: %s', (css) => {
    const first = createCssTransformShareScope(path.join('screens', 'first', 'style.css'), css)
    const second = createCssTransformShareScope(path.join('screens', 'second', 'style.css'), css)
    expect(first).not.toBe(second)
    expect(first).toBe('dir:screens/first')
    expect(second).toBe('dir:screens/second')
  })

  it.each([
    '.a{content:"url(./icon.svg)"}',
    '/* @import "./dep.css"; */ .a{color:red}',
    '.a{content:"@import"}',
  ])('shares transforms when resource syntax is only literal text: %s', (css) => {
    expect(createCssTransformShareScope('style.css', css)).toBe('global')
  })
})
