import { describe, expect, it } from 'vitest'
import { shouldSkipViteJsTransform } from '@/bundlers/vite/js-precheck'

describe('vite js precheck', () => {
  it('skips source without class-related hints', () => {
    const source = 'const answer = 42\nexport default answer\n'
    expect(shouldSkipViteJsTransform(source)).toBe(true)
  })

  it('keeps transform for class-like hints', () => {
    const source = 'const cls = "text-[#123456] flex"\n'
    expect(shouldSkipViteJsTransform(source)).toBe(false)
  })

  it('keeps transform when dependency hint exists', () => {
    const source = 'import "./chunk.js"\nconst answer = 42\n'
    expect(shouldSkipViteJsTransform(source, {
      filename: '/tmp/a.js',
      moduleGraph: {
        resolve: () => undefined,
        load: () => undefined,
      },
    })).toBe(false)
  })
})
