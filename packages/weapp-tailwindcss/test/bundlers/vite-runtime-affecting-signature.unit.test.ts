import { describe, expect, it } from 'vitest'
import { createRuntimeAffectingSourceSignature } from '@/bundlers/vite/runtime-affecting-signature'

describe('bundlers/vite runtime-affecting signature', () => {
  it('keeps html comment content in runtime-affecting signature', () => {
    const first = createRuntimeAffectingSourceSignature(
      '<view class="card"></view><!-- text-[#123456] -->',
      'html',
    )
    const second = createRuntimeAffectingSourceSignature(
      '<view class="card"></view><!-- text-[#654321] -->',
      'html',
    )

    expect(first).not.toBe(second)
    expect(first).toContain('c: text-[#123456] ')
    expect(second).toContain('c: text-[#654321] ')
  })

  it('keeps js comment content in runtime-affecting signature', () => {
    const first = createRuntimeAffectingSourceSignature(
      'const cls = "card"\n/* text-[#123456] */',
      'js',
    )
    const second = createRuntimeAffectingSourceSignature(
      'const cls = "card"\n/* text-[#654321] */',
      'js',
    )

    expect(first).not.toBe(second)
    expect(first).toContain('c: text-[#123456] ')
    expect(second).toContain('c: text-[#654321] ')
  })

  it('ignores formatting-only html/js noise in runtime-affecting signature', () => {
    const htmlA = createRuntimeAffectingSourceSignature('<view class="card">hello</view>', 'html')
    const htmlB = createRuntimeAffectingSourceSignature('<view   class="card">\n  hello\n</view>', 'html')
    const jsA = createRuntimeAffectingSourceSignature('const cls = "card"\nexport { cls }\n', 'js')
    const jsB = createRuntimeAffectingSourceSignature('const cls = "card";\n\nexport { cls }\n', 'js')
    const cssA = createRuntimeAffectingSourceSignature('.card { color: red; }\n/* note */\n.page { padding: 8px; }', 'css')
    const cssB = createRuntimeAffectingSourceSignature('.card{color:red}.page{padding:8px}', 'css')

    expect(htmlA).toBe(htmlB)
    expect(jsA).toBe(jsB)
    expect(cssA).toBe(cssB)
  })

  it('keeps css value changes in runtime-affecting signature', () => {
    const first = createRuntimeAffectingSourceSignature('.card { color: red; }', 'css')
    const second = createRuntimeAffectingSourceSignature('.card { color: blue; }', 'css')

    expect(first).not.toBe(second)
  })

  it('falls back to raw source when js parsing fails', () => {
    const source = 'const broken ='
    expect(createRuntimeAffectingSourceSignature(source, 'js')).toBe(source)
  })
})
