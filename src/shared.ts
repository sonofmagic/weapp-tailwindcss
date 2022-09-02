import path from 'path'

export const pluginName = 'weapp-tailwindcss-webpack-plugin'

export function getFileName (file: string) {
  return path.basename(file, path.extname(file))
}

export function isRegexp (value: any) {
  return Object.prototype.toString.call(value) === '[object RegExp]'
}

export function regExpValidate (arr: (string | RegExp)[] = [], str: string) {
  if (Array.isArray(arr)) {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (typeof item === 'string') {
        if (item === str) {
          return true
        }
      } else if (isRegexp(item)) {
        item.lastIndex = 0
        if (item.test(str)) {
          return true
        }
      }
    }
    return false
  }
  throw new TypeError("paramater 'arr' should be a Array of Regexp | String !")
}
