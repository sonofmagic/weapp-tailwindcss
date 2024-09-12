import type { AppEntry, Dep, Entry, SubPackage } from '../types'
import { addExtension, defu, isObject, removeExtension } from '@weapp-core/shared'
import fs from 'fs-extra'
import path from 'pathe'

export function parseJsonUseComponents(json: any) {
  const deps: Dep[] = []
  if (isObject(json.usingComponents)) {
    deps.push(...(
      Object.values(json.usingComponents) as string[]
    ).map<Dep>((x) => {
      return {
        path: x,
        type: 'component',
      }
    }))
  }
  return deps
}

export function searchAppEntry(options?: SearchAppEntryOptions): AppEntry | undefined {
  const { formatPath, root } = defu(options, {
    formatPath: (x: string) => x,
  })
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
            deps.push(...parseJsonUseComponents(appJson))
          }
          if (Array.isArray(appJson.subPackages)) {
            // 独立分包中不能依赖主包和其他分包中的内容，包括 js 文件、template、wxss、自定义组件、插件等（使用 分包异步化 时 js 文件、自定义组件、插件不受此条限制）
            deps.push(...(appJson.subPackages as SubPackage[]).map<Dep>((x) => {
              return {
                type: 'subPackage',
                ...x,
              }
            }))
          }
        }
        return {
          jsonPath: formatPath(appJsonPath),
          json: appJson,
          path: formatPath(entryPath),
          deps,
          type: 'app',
        }
      }
    }
  }
}
// import { isCSSRequest } from 'is-css-request'
// https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html
// js + json
export function isAppRoot(root: string) {
  return Boolean(searchAppEntry({
    root,
  }))
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
// wxml + js
export function isPage(wxmlPath: string) {
  return Boolean(searchPageEntry(wxmlPath))
}

export interface SearchAppEntryOptions {
  root: string
  formatPath?: (p: string) => string
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

export function getWxmlEntry(wxmlPath: string, formatPath: (p: string) => string): Entry | undefined {
  const pageEntry = searchPageEntry(wxmlPath)
  if (pageEntry) {
    const jsonPath = addExtension(removeExtension(wxmlPath), '.json')
    const finalPath = formatPath(pageEntry)
    if (fs.existsSync(jsonPath)) {
      const json = fs.readJsonSync(jsonPath, { throws: false })
      // 是否标识 component 为 true
      if (json && json.component) {
        return {
          deps: parseJsonUseComponents(json),
          path: finalPath,
          type: 'component',
          json,
          jsonPath: formatPath(jsonPath),
        }
      }
      else {
        return {
          deps: parseJsonUseComponents(json),
          path: finalPath,
          type: 'page',
          json,
          jsonPath: formatPath(jsonPath),
        }
      }
    }
    return {
      deps: [],
      path: finalPath,
      type: 'page',
      // json: undefined,
      // jsonPath: undefined,
    }
  }
}
