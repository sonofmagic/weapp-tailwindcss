import type ClassGenerator from './classGenerator'

// export const mangleClassPrefix = 'MANGLE__'

// export const mangleClassSuffix = '__MANGLE'

// export const mangleClassRegex = /MANGLE__[a-zA-Z0-9_-]+__MANGLE/g

// export function format (str: string) {
//   return `${mangleClassPrefix}${str}${mangleClassSuffix}`
// }

// export const globalClassGenerator = new ClassGenerator()

export function mangleMark (str: string, classGenerator?: ClassGenerator) {
  if (typeof str === 'string' && str) {
    return str
      .split(' ')
      .filter((x) => x)
      // .filter((x) => {
      //   return !classGenerator?.ignoreClassName(x)
      // })
      .map((x) => {
        if (classGenerator?.ignoreClassName(x)) {
          return x
        }
        // globalClassGenerator.generateClassName(x, {})
        return classGenerator?.generateClassName(x).name // format(x)
      })
      .join(' ')
    // return `${mangleClassPrefix}${str.trim()}${mangleClassSuffix}`
  }
  return str
}
