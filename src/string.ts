// base my RegExp
export function stringReplace (str: string, pattern: RegExp, replacement: (string: string) => string) {
  let p = 0
  let arr: RegExpExecArray | null
  const resArr = []
  while ((arr = pattern.exec(str)) !== null) {
    resArr.push(str.slice(p, arr.index))
    p = arr.index
    // matched
    resArr.push(replacement(str.slice(p, pattern.lastIndex)))
    p = pattern.lastIndex
  }
  resArr.push(str.slice(p))
  return resArr.join('')
}
