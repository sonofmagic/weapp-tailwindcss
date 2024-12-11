import crypto from 'node:crypto'
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

/**
 * 计算字符串的 MD5 哈希值
 * @param {string} input - 要计算哈希的字符串
 * @returns {string} - 字符串的 MD5 哈希值
 */
export function md5(input: crypto.BinaryLike) {
  // 使用 crypto 模块创建 MD5 哈希
  const hash = crypto.createHash('md5')
  hash.update(input) // 更新哈希内容
  return hash.digest('hex') // 返回哈希值
}

export function isRegexp(value: unknown) {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}

export function regExpTest(arr: (string | RegExp)[] = [], str: string) {
  if (Array.isArray(arr)) {
    for (const item of arr) {
      if (typeof item === 'string') {
        if (str.includes(item)) {
          return true
        }
      }
      else if (isRegexp(item)) {
        item.lastIndex = 0
        if (item.test(str)) {
          return true
        }
      }
    }
    return false
  }
  throw new TypeError('paramater \'arr\' should be a Array of Regexp | String !')
}
