import path from 'node:path'
import fs from 'fs-extra'
import klaw from 'klaw'
import { addExtension, createFilter } from '@rollup/pluginutils'

// https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html
// js + json
export function isAppRoot(root: string) {
  return Boolean(searchAppEntry(root))
}

// wxml + js
export function isPage(wxmlPath: string) {
  return Boolean(searchPageEntry(wxmlPath))
}

export function searchAppEntry(root: string) {
  const extensions = ['js', 'ts']
  const appJson = path.resolve(root, 'app.json')
  if (fs.existsSync(appJson)) {
    for (const ext of extensions) {
      const entryPath = path.resolve(root, addExtension('app', `.${ext}`))
      if (fs.existsSync(entryPath)) {
        return entryPath
      }
    }
  }
}

function removeFileExtension(path: string) {
  // 使用正则表达式去掉路径中的文件后缀
  return path.replace(/\.[^/.]+$/, '')
}

export function searchPageEntry(wxmlPath: string) {
  if (fs.existsSync(wxmlPath)) {
    const extensions = ['js', 'ts']
    const base = removeFileExtension(wxmlPath)
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
    const jsonPath = addExtension(removeFileExtension(wxmlPath), '.json')
    if (fs.existsSync(jsonPath)) {
      return fs.readJsonSync(jsonPath).component
    }
  }
}

export function getWxmlEntry(wxmlPath: string) {
  const pageEntry = searchPageEntry(wxmlPath)
  if (pageEntry) {
    const jsonPath = addExtension(removeFileExtension(wxmlPath), '.json')
    if (fs.existsSync(jsonPath) && fs.readJsonSync(jsonPath).component) {
      return {
        path: pageEntry,
        type: 'component',
      }
    }
    return {
      path: pageEntry,
      type: 'page',
    }
  }
}

export function getProjectConfig(root: string, options?: { ignorePrivate?: boolean }) {
  const baseJsonPath = path.resolve(root, 'project.config.json')
  const privateJsonPath = path.resolve(root, 'project.private.config.json')
  let baseJson = {}
  let privateJson = {}
  if (fs.existsSync(baseJsonPath)) {
    baseJson = fs.readJsonSync(baseJsonPath) || {}
  }
  else {
    throw new Error(`在 ${root} 目录下找不到 project.config.json`)
  }
  if (!options?.ignorePrivate) {
    if (fs.existsSync(privateJsonPath)) {
      privateJson = fs.readJsonSync(privateJsonPath, {
        throws: false,
      }) || {}
    }
  }

  return Object.assign({}, privateJson, baseJson)
}

export async function scanEntries(root: string, options?: { relative?: boolean }) {
  const appEntry = searchAppEntry(root)
  // TODO exclude 需要和 output 配套
  const filter = createFilter([], ['**/node_modules/**', '**/miniprogram_npm/**', 'dist/**'])

  function getPath(to: string) {
    if (options?.relative) {
      return path.relative(root, to)
    }
    return to
  }

  if (appEntry) {
    const pageEntries = new Set<string>()
    const componentEntries = new Set<string>()
    for await (const file of klaw(root, {
      filter,
    })) {
      if (file.stats.isFile()) {
        if (/\.wxml$/.test(file.path)) {
          const entry = getWxmlEntry(file.path)
          if (entry) {
            if (entry.type === 'component') {
              componentEntries.add(getPath(entry.path))
            }
            else if (entry.type === 'page') {
              pageEntries.add(getPath(entry.path))
            }
          }
        }
      }
    }

    return {
      app: getPath(appEntry),
      pages: [...pageEntries],
      components: [...componentEntries],
    }
  }
}
