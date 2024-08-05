import { escapeStringRegexp } from '@weapp-core/shared'

const cssComment = {
  start: '/*#weapp-vite:css-start{',
  end: '}weapp-vite:css-end#*/',
}

export function extractPathFromCss(code: string) {
  const cssCommentStart = escapeStringRegexp(cssComment.start)
  const cssCommentEnd = escapeStringRegexp(cssComment.end)
  const reg = new RegExp(`${cssCommentStart}(.*?)${cssCommentEnd}`)
  const arr = code.match(reg)
  if (arr) {
    return {
      path: arr[1],
      start: arr.index ?? 0,
      end: (arr.index ?? 0) + arr[0].length,
    }
  }
}

export function addPathForCss(filepath: string, code: string) {
  return `${cssComment.start}${filepath}${cssComment.end}\n${code}`
}
