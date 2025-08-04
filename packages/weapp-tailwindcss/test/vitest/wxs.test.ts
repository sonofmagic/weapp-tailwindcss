import { getCss } from '#test/helpers/getTwCss'
import { createGetCase, wxsCasePath } from '#test/util'
// import { createTemplateHandler } from '@/wxml/index'
import { wxsTagRegexp } from '@weapp-core/regex'
import { TailwindcssPatcher } from 'tailwindcss-patch'
import { getCompilerContext } from '@/context'

interface ExtractSourceToken {
  start: number
  end: number
  raw: string
  // '' 直接 remove {{}}
  source?: string
  // prevConcatenated: boolean
  // nextConcatenated: boolean
}
function getClassCacheSet() {
  const twPatcher = new TailwindcssPatcher()
  return twPatcher.getClassCacheSet()
}
const getCase = createGetCase(wxsCasePath)

function extractSource(original: string, reg: RegExp) {
  let match = reg.exec(original)
  const sources: ExtractSourceToken[] = []

  while (match !== null) {
    // 过滤空字符串
    // if (match[1].trim().length) {
    const start = match.index
    const end = reg.lastIndex
    sources.push({
      start,
      end,
      raw: match[1],
    })

    match = reg.exec(original)
  }
  return sources
}
describe('wxs', () => {
  it('inline wxs content extract', async () => {
    const str = await getCase('inline.wxml')
    const res = [...str.matchAll(wxsTagRegexp)]
    expect(res.length).toEqual(2)
    expect(res.map(x => x[1])).matchSnapshot()
  })

  it('inline wxs content extract and escape', async () => {
    const str = await getCase('inline.wxml')
    const res = [...str.matchAll(wxsTagRegexp)]
    expect(res.length).toEqual(2)
    const { jsHandler } = getCompilerContext()
    const set = new Set<string>()
    const arr = ['after:content-[\'我来自inline-wxs\']', 'after:content-[\'我来自outside-wxs\']']
    for (const cls of arr) {
      set.add(cls)
    }
    const result = await Promise.all(res.map(x => jsHandler(x[1], set)))
    expect(result.map(x => x.code)).matchSnapshot()
  })

  it('inline wxs content extract and escape and replace', async () => {
    let str = await getCase('inline.wxml')
    const res = extractSource(str, wxsTagRegexp) // [...str.matchAll(wxsTagRegexp)]
    expect(res.length).toEqual(2)
    const { jsHandler } = getCompilerContext()
    const set = new Set<string>()
    const arr = ['after:content-[\'我来自inline-wxs\']', 'after:content-[\'我来自outside-wxs\']']
    for (const cls of arr) {
      set.add(cls)
    }
    // const s = new MagicString(str)
    for (const x of res) {
      const { code } = await jsHandler(x.raw, set)
      str = str.replaceAll(x.raw, code)
      // s.update(x.start, x.end, code)
    }
    expect(str).toMatchSnapshot()
  })

  it('outside wxs content extract and escape', async () => {
    const str = await getCase('outside.wxml')
    const res = [...str.matchAll(wxsTagRegexp)]
    expect(res.length).toEqual(1)
    const { jsHandler } = getCompilerContext()
    const set = new Set<string>()
    const arr = ['after:content-[\'我来自inline-wxs\']', 'after:content-[\'我来自outside-wxs\']']
    for (const cls of arr) {
      set.add(cls)
    }
    expect(await Promise.all(res.map(async x => (await jsHandler(x[1], set)).code))).matchSnapshot()
  })

  it('simple.wxs content extract and escape', async () => {
    const str = await getCase('simple.wxs')
    const { jsHandler } = getCompilerContext()
    const set = new Set<string>()
    const arr = ['after:content-[\'我来自outside-wxs\']']
    for (const cls of arr) {
      set.add(cls)
    }
    const { code } = await jsHandler(str, set)
    expect(code).matchSnapshot()
  })

  it('inline.wxml use templateHandler', async () => {
    const str = await getCase('inline.wxml')
    const { templateHandler } = getCompilerContext({
      inlineWxs: true,
    })
    const set = new Set<string>()
    const arr = ['after:content-[\'我来自inline-wxs\']', 'after:content-[\'我来自outside-wxs\']']
    for (const cls of arr) {
      set.add(cls)
    }
    expect(
      await templateHandler(str, {
        runtimeSet: set,
      }),
    ).toMatchSnapshot()
  })

  it('outside.wxml use templateHandler', async () => {
    const str = await getCase('outside.wxml')
    const { templateHandler } = getCompilerContext({
      inlineWxs: true,
    })
    const set = new Set<string>()
    const arr = ['after:content-[\'我来自inline-wxs\']', 'after:content-[\'我来自outside-wxs\']']
    for (const cls of arr) {
      set.add(cls)
    }
    expect(
      await templateHandler(str, {
        runtimeSet: set,
      }),
    ).toMatchSnapshot()
  })

  it.skip('wxs fail case0', async () => {
    const raw = `\n\n\tvar className = 'after:content-[\\'我来自inline-wxs\\']'\n  module.exports = {\n    className: className\n  }\n\n`
    getCss(raw)
    const set = getClassCacheSet()
    const { jsHandler } = getCompilerContext()
    const code = await jsHandler(raw, set)
    expect(code).toMatchSnapshot()
    // 一转义就有问题
    // "after:content-['我来自inline-wxs']"
    // "after:content-[\\'我来自inline-wxs\\']"
    // "after:content-[\\'我来自inline-wxs\\']"
    // "after:content-['我是自className2']"
  })
})
