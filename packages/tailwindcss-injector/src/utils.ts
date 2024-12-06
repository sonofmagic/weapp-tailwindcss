import path from 'node:path'
import { createDefu, defu } from 'defu'

export function removeFileExtension(filePath: string) {
  if (!filePath) {
    // 如果路径为空，直接返回空字符串
    return ''
  }
  let baseName = path.basename(filePath) // 获取基础文件名（包含所有扩展名）
  let ext = path.extname(baseName) // 获取当前文件名的扩展名

  // 持续移除扩展名，直到没有扩展名
  while (ext) {
    baseName = baseName.slice(0, -ext.length) // 去掉最后的扩展名部分
    ext = path.extname(baseName) // 重新获取新的扩展名
  }

  const dir = path.dirname(filePath) // 获取目录名
  return path.join(dir, baseName) // 拼接路径
}

export {
  defu,
}

export const defuOverrideArray = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    obj[key] = value
    return true
  }
})
