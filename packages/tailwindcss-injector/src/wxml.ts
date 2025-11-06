import type { Buffer } from 'node:buffer'
import path from 'node:path'
import fs from 'fs-extra'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'
import { md5 } from './utils'

export const hashMap = new Map<string, string>()
export const depsMap = new Map<string, WxmlDep[]>()

const srcImportTagsMap: Record<string, string[]> = {
  // audio: ['src', 'poster'],
  // video: ['src', 'poster'],
  // image: ['src'],
  // 参考：https://developers.weixin.qq.com/miniprogram/dev/reference/wxs/01wxs-module.html
  // wxs: ['src'],
  // 参考：https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/import.html
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

// 参考：https://github.com/fb55/htmlparser2/issues/1541
// 参考：https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html
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

async function getDep(filepath: string, set: Set<string>) {
  if (await fs.exists(filepath)) {
    const dirname = path.dirname(filepath)
    set.add(filepath)
    const wxml = await fs.readFile(filepath, 'utf8')
    const hash = md5(wxml)
    const oldHash = hashMap.get(filepath)
    const isChanged = hash !== oldHash
    let deps: WxmlDep[] = []
    const cacheDeps = depsMap.get(filepath)
    if (isChanged || !cacheDeps) {
      hashMap.set(filepath, hash)
      deps = await processWxml(wxml)
      depsMap.set(filepath, deps)
    }
    else {
      deps = cacheDeps
    }

    for (const { value } of deps) {
      const p = path.resolve(dirname, value)
      if (!set.has(p)) {
        await getDep(p, set)
      }
    }
  }
}

export async function getDepFiles(file: string) {
  const set = new Set<string>()
  await getDep(file, set)
  return set
}
