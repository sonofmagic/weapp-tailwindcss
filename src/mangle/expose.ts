import type ClassGenerator from './classGenerator'

// export const mangleClassPrefix = 'MANGLE__'

// export const mangleClassSuffix = '__MANGLE'

// export const mangleClassRegex = /MANGLE__[a-zA-Z0-9_-]+__MANGLE/g

// export function format (str: string) {
//   return `${mangleClassPrefix}${str}${mangleClassSuffix}`
// }

// export const globalClassGenerator = new ClassGenerator()

export function mangleMark(str: string, oldValue: string, classGenerator: ClassGenerator) {
  if (typeof str === 'string' && str) {
    const oldStrArr = oldValue.split(' ').filter((x) => x)
    return str
      .split(' ')
      .filter((x) => x)
      .map((x, idx) => {
        if (classGenerator.ignoreClassName(x) || classGenerator.ignoreClassName(oldStrArr[idx])) {
          return x
        }
        return classGenerator.generateClassName(x).name // format(x)
      })
      .join(' ')
    // return `${mangleClassPrefix}${str.trim()}${mangleClassSuffix}`
  }
  return str
}
