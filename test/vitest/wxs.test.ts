import fs from 'node:fs'
// import path from 'node:path'
import { describe, it, expect } from 'vitest'
import MagicString from 'magic-string'
import { getOptions } from '@/options'
import { createGetCase, wxsCasePath } from '#test/util'
// import { createTempleteHandler } from '@/wxml/index'
import { wxsTagRegexp } from '@/reg'
import { RawSource } from '@/types'

const getCase = createGetCase(wxsCasePath)

function extractSource(original: string, reg: RegExp) {
  let match = reg.exec(original)
  const sources: RawSource[] = []

  while (match !== null) {
    // 过滤空字符串
    // if (match[1].trim().length) {
    const start = match.index
    const end = reg.lastIndex
    sources.push({
      start,
      end,
      raw: match[1]
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
    expect(res.map((x) => x[1])).matchSnapshot()
  })

  it('inline wxs content extract and escape', async () => {
    const str = await getCase('inline.wxml')
    const res = [...str.matchAll(wxsTagRegexp)]
    expect(res.length).toEqual(2)
    const { jsHandler } = getOptions()
    const set = new Set<string>()
    const arr = ["after:content-['我来自inline-wxs']", "after:content-['我来自outside-wxs']"]
    for (const cls of arr) {
      set.add(cls)
    }
    expect(res.map((x) => jsHandler(x[1], set).code)).matchSnapshot()
  })

  it('inline wxs content extract and escape and replace', async () => {
    let str = await getCase('inline.wxml')
    const res = extractSource(str, wxsTagRegexp) // [...str.matchAll(wxsTagRegexp)]
    expect(res.length).toEqual(2)
    const { jsHandler } = getOptions()
    const set = new Set<string>()
    const arr = ["after:content-['我来自inline-wxs']", "after:content-['我来自outside-wxs']"]
    for (const cls of arr) {
      set.add(cls)
    }
    // const s = new MagicString(str)
    for (const x of res) {
      const code = jsHandler(x.raw, set).code
      str = str.replaceAll(x.raw, code)
      // s.update(x.start, x.end, code)
    }
    expect(str).toMatchSnapshot()
  })

  it('outside wxs content extract and escape', async () => {
    const str = await getCase('outside.wxml')
    const res = [...str.matchAll(wxsTagRegexp)]
    expect(res.length).toEqual(1)
    const { jsHandler } = getOptions()
    const set = new Set<string>()
    const arr = ["after:content-['我来自inline-wxs']", "after:content-['我来自outside-wxs']"]
    for (const cls of arr) {
      set.add(cls)
    }
    expect(res.map((x) => jsHandler(x[1], set).code)).matchSnapshot()
  })

  it('simple.wxs content extract and escape', async () => {
    const str = await getCase('simple.wxs')
    const { jsHandler } = getOptions()
    const set = new Set<string>()
    const arr = ["after:content-['我来自outside-wxs']"]
    for (const cls of arr) {
      set.add(cls)
    }
    expect(jsHandler(str, set).code).matchSnapshot()
  })

  it('inline.wxml use templeteHandler', async () => {
    const str = await getCase('inline.wxml')
    const { templeteHandler } = getOptions()
    const set = new Set<string>()
    const arr = ["after:content-['我来自inline-wxs']", "after:content-['我来自outside-wxs']"]
    for (const cls of arr) {
      set.add(cls)
    }
    expect(
      templeteHandler(str, {
        runtimeSet: set
      })
    ).toMatchSnapshot()
  })

  it('outside.wxml use templeteHandler', async () => {
    const str = await getCase('outside.wxml')
    const { templeteHandler } = getOptions()
    const set = new Set<string>()
    const arr = ["after:content-['我来自inline-wxs']", "after:content-['我来自outside-wxs']"]
    for (const cls of arr) {
      set.add(cls)
    }
    expect(
      templeteHandler(str, {
        runtimeSet: set
      })
    ).toMatchSnapshot()
  })
})
