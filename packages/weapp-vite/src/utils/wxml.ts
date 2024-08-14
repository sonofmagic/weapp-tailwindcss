import { Parser } from 'htmlparser2'

const srcImportTagsMap: Record<string, string[]> = {
  audio: ['src', 'poster'],
  video: ['src', 'poster'],
  image: ['src'],
  // https://developers.weixin.qq.com/miniprogram/dev/reference/wxs/01wxs-module.html
  wxs: ['src'],
  // https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/import.html
  import: ['src'],
  include: ['src'],
}

export interface WxmlDep {
  tagName: string
  start: number
  end: number
  quote: string | null | undefined
  name: string
  value: string
}

export function getDeps(wxml: string) {
  const deps: WxmlDep[] = []
  let currentTagName = ''
  let importAttrs: undefined | string[]
  const parser = new Parser({
    onopentagname(name) {
      currentTagName = name
      importAttrs = srcImportTagsMap[currentTagName]
    },
    onattribute(name, value, quote) {
      if (importAttrs) {
        for (const attrName of importAttrs) {
          if (attrName === name) {
            deps.push({
              name,
              value,
              quote,
              tagName: currentTagName,
              start: parser.startIndex,
              end: parser.endIndex,
            })
            return
          }
        }
      }
    },
    // ontext(data) {
    //   console.log('ontext', data)
    // },
    onclosetag() {
      currentTagName = ''
      importAttrs = undefined
    },
  })
  parser.write(
    wxml,
  )
  parser.end()
  return {
    deps,
  }
}
