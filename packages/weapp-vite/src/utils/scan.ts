import path from 'pathe'
import fs from 'fs-extra'
import klaw from 'klaw'
import { addExtension, isObject, removeExtension } from '@weapp-core/shared'
import type { Dep, Entry, Subpackage } from '../types'

export const defaultExcluded: string[] = ['**/node_modules/**', '**/miniprogram_npm/**']
// import { isCSSRequest } from 'is-css-request'
// https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html
// js + json
export function isAppRoot(root: string) {
  return Boolean(searchAppEntry(root))
}

// wxml + js
export function isPage(wxmlPath: string) {
  return Boolean(searchPageEntry(wxmlPath))
}

export function searchAppEntry(root: string): Entry | undefined {
  const extensions = ['js', 'ts']
  const appJsonPath = path.resolve(root, 'app.json')
  if (fs.existsSync(appJsonPath)) {
    for (const ext of extensions) {
      const entryPath = path.resolve(root, addExtension('app', `.${ext}`))
      if (fs.existsSync(entryPath)) {
        const appJson = fs.readJSONSync(appJsonPath, { throws: false })
        const deps: Dep[] = []
        if (appJson) {
          if (Array.isArray(appJson.pages)) {
            deps.push(...(appJson.pages as string[]).map<Dep>((x) => {
              return {
                path: x,
                type: 'page',
              }
            }))
          }
          if (isObject(appJson.usingComponents)) {
            deps.push(...(Object.values(appJson.usingComponents) as string[]).map<Dep>((x) => {
              return {
                path: x,
                type: 'component',
              }
            }))
          }
          if (Array.isArray(appJson.subpackages)) {
            for (const subpackage of appJson.subpackages) {
              // 独立分包中不能依赖主包和其他分包中的内容，包括 js 文件、template、wxss、自定义组件、插件等（使用 分包异步化 时 js 文件、自定义组件、插件不受此条限制）
              deps.push(...(subpackage as Subpackage[]).map<Dep>((x) => {
                return {
                  type: 'subpackage',
                  ...x,
                }
              }))
              // subpackage.root
              // subpackage.pages
              // subpackage.entry
              // subpackage.name
              // subpackage.independent
            }
          }
        }
        return {
          path: entryPath,
          deps,
          type: 'app',
        }
      }
    }
  }
}

export function searchPageEntry(wxmlPath: string) {
  if (fs.existsSync(wxmlPath)) {
    const extensions = ['js', 'ts']
    const base = removeExtension(wxmlPath)
    for (const ext of extensions) {
      const entryPath = addExtension(base, `.${ext}`)
      if (fs.existsSync(entryPath)) {
        return entryPath
      }
    }
  }
}

export function isComponent(wxmlPath: string) {
  if (isPage(wxmlPath)) {
    const jsonPath = addExtension(removeExtension(wxmlPath), '.json')
    if (fs.existsSync(jsonPath)) {
      const json = fs.readJsonSync(jsonPath, { throws: false })
      if (json && json.component) {
        return true
      }
    }
  }
  return false
}

export function getWxmlEntry(wxmlPath: string): Entry | undefined {
  const pageEntry = searchPageEntry(wxmlPath)
  if (pageEntry) {
    const jsonPath = addExtension(removeExtension(wxmlPath), '.json')
    if (fs.existsSync(jsonPath)) {
      const json = fs.readJsonSync(jsonPath, { throws: false })
      if (json && json.component) {
        return {
          deps: [],
          path: pageEntry,
          type: 'component',
        }
      }
    }
    return {
      deps: [],
      path: pageEntry,
      type: 'page',
    }
  }
}

export async function scanEntries(root: string, options?: { relative?: boolean, filter?: (id: string | unknown) => boolean }) {
  const appEntry = searchAppEntry(root)
  // TODO exclude 需要和 output 配套

  // function getPath(to: string) {
  //   if (options?.relative) {
  //     return path.relative(root, to)
  //   }
  //   return to
  // }

  if (appEntry) {
    const pageEntries = new Set<Entry>()
    const componentEntries = new Set<Entry>()

    for await (
      const file of klaw(root, {
        filter: options?.filter,
      })
    ) {
      if (file.stats.isFile()) {
        if (/\.wxml$/.test(file.path)) {
          const entry = getWxmlEntry(file.path)
          if (entry) {
            if (entry.type === 'component') {
              componentEntries.add(entry)
            }
            else if (entry.type === 'page') {
              pageEntries.add(entry)
            }
          }
        }
      }
    }

    return {
      app: appEntry,
      pages: pageEntries,
      components: componentEntries,
      subpackages: [],
    }
  }
}
