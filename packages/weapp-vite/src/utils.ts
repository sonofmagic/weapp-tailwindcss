import path from 'node:path'
import fs from 'fs-extra'

// https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html
export function isAppRoot(root: string) {
  return (fs.existsSync(path.resolve(root, 'app.js')) || fs.existsSync(path.resolve(root, 'app.ts'))) && fs.existsSync(path.resolve(root, 'app.json'))
}

function removeFileExtension(path: string) {
  // 使用正则表达式去掉路径中的文件后缀
  return path.replace(/\.[^/.]+$/, '')
}

export function isPage(jsonPath: string) {
  if (fs.existsSync(jsonPath)) {
    const base = removeFileExtension(jsonPath)
    return (fs.existsSync(path.resolve(base, '.js')) || fs.existsSync(path.resolve(base, 'app.ts')))
  }
  return false
}

export function isComponent(jsonPath: string): boolean {
  return isPage(jsonPath) && fs.readJsonSync(jsonPath).component
}
