const WHITESPACE_CODES = new Set([
  9, // 制表符 \t
  10, // 换行符 \n
  11, // 垂直制表符 \v
  12, // 换页符 \f
  13, // 回车符 \r
  32, // 空格
  160, // 不间断空格 \u00A0
  65279, // 零宽无断行空格 \uFEFF
])

export function isWhitespace(char: string) {
  if (char.length === 0) {
    return false
  }
  return WHITESPACE_CODES.has(char.charCodeAt(0))
}

export function isAllWhitespace(value: string) {
  for (let i = 0; i < value.length; i++) {
    if (!WHITESPACE_CODES.has(value.charCodeAt(i))) {
      return false
    }
  }
  return true
}
