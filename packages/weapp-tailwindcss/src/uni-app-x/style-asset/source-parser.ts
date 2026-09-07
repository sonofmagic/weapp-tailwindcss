import scss from 'postcss-scss'

// Harmony 在 Sass 预处理前读取局部样式；必须识别行注释，避免将其并入选择器。
export function parseUniAppXStyleSource(source: string) {
  return scss.parse(source, { from: undefined })
}

export function isUniAppXStyleSourceEmpty(source: string) {
  try {
    return parseUniAppXStyleSource(source).nodes.every(node => node.type === 'comment')
  }
  catch {
    return false
  }
}
