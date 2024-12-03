import path from 'node:path'
import { createDefu, defu } from 'defu'

// 去除文件的后缀
export function removeFileExtension(filePath: string) {
  // 先解析出基础文件名（去掉最外层的扩展名）
  let baseName = path.basename(filePath, path.extname(filePath))
  // 如果还有其他嵌套扩展名（如.wxs.ts），继续递归移除
  while (baseName.includes('.')) {
    baseName = path.basename(baseName, path.extname(baseName))
  }
  // 拼接目录和最终的文件名
  const dir = path.dirname(filePath)
  return path.join(dir, baseName)
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
