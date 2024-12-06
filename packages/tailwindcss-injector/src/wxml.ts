import type { Buffer } from 'node:buffer'
import path from 'node:path'
import fs from 'fs-extra'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'

const srcImportTagsMap: Record<string, string[]> = {
  // audio: ['src', 'poster'],
  // video: ['src', 'poster'],
  // image: ['src'],
  // https://developers.weixin.qq.com/miniprogram/dev/reference/wxs/01wxs-module.html
  // wxs: ['src'],
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
  attrs: Record<string, string>
}

// https://github.com/fb55/htmlparser2/issues/1541
// https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html
export function processWxml(wxml: string | Buffer) {
  const ms = new MagicString(wxml.toString())
  const deps: WxmlDep[] = []
  let currentTagName = ''
  let importAttrs: undefined | string[]
  let attrs: Record<string, string> = {}

  const parser = new Parser(
    {
      onopentagname(name) {
        currentTagName = name
        importAttrs = srcImportTagsMap[currentTagName]
      },
      onattribute(name, value, quote) {
        attrs[name] = value
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
                attrs,
              })
            }
          }
        }
      },
      onclosetag() {
        currentTagName = ''
        attrs = {}
        importAttrs = undefined
      },
    },
    {
      lowerCaseTags: false,
      xmlMode: true,
    },
  )
  parser.write(
    ms.original,
  )
  parser.end()
  return deps
}

export async function getDepFiles(file: string) {
  const set = new Set<string>()

  async function getDep(filepath: string) {
    if (await fs.exists(filepath)) {
      const dirname = path.dirname(filepath)
      set.add(filepath)
      const wxml = await fs.readFile(filepath, 'utf8')
      const deps = await processWxml(wxml)
      for (const { value } of deps) {
        const p = path.resolve(dirname, value)
        if (!set.has(p)) {
          await getDep(p)
        }
      }
    }
  }

  await getDep(file)

  return set
}
