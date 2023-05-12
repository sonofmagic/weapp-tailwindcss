import { splitCode } from '@/extractors/split'

describe('extractorSplit', () => {
  it('common case ', () => {
    let code = ''
    // const arr = []
    function extract() {
      return [...(splitCode(code) || [])]
    }

    code = 'webpackJsonp'
    expect(extract()).toEqual(['webpackJsonp'])

    code = 'webpack/container/entry/taro_app_library'
    expect(extract()).toEqual(['webpack/container/entry/taro_app_library'])

    code = 'vendors-node_modules_taro_weapp_prebundle_chunk-LNJCN3VW_js'
    expect(extract()).toEqual(['vendors-node_modules_taro_weapp_prebundle_chunk-LNJCN3VW_js'])

    code = "w-full bg-indigo-400 bg-[url('https://xxx.com/xx.webp')] bg-bottom bg-contain bg-no-repeat"
    expect(extract().length).toBe(6)

    code = "after:border-none after:content-['Hello_World'] a"
    expect(extract().length).toBe(3)

    code = 'after:content-["*"] after:ml-0.5 after:text-red-500 b'
    expect(extract().length).toBe(4)

    code = 'after:content-["的撒的撒"] after:ml-0.5 after:text-red-500'
    expect(extract().length).toBe(3)

    code = "after:content-['的撒的撒'] after:ml-0.5 after:text-red-500"
    expect(extract().length).toBe(3)
  })
})
