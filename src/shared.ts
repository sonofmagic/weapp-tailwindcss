import postcss from 'postcss'
// JavaScript RegExp 对象是有状态的。他们会将上次成功匹配后的位置记录在 lastIndex 属性中。
export const classRegExp = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gmi

export function styleHandler (rawSource: string) {
  const root = postcss.parse(rawSource)
  root.walk((node, idx) => {
    if (node.type === 'rule') {
      const rep = node.selector
        .replace(/\\\[/g, '_l_')
        .replace(/\\\]/g, '_r_')
        .replace(/\\\(/g, '_p_')
        .replace(/\\\)/g, '_q_')
        .replace(/\\#/g, '_h_')
        .replace(/\\\//g, '-div-')
        .replace(/\\\./g, '-dot-')
      node.selector = rep
    } else if (node.type === 'comment') {
      node.remove()
    }
  })
  const css = root.toString()
  return css
}
// https://stackoverflow.com/questions/16559171/regular-expression-to-get-a-class-name-from-html
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
export function templeteHandler (
  rawSource: string,
  cb: (sp: number, ep: number, newcls: string) => void
) {
  const regex = classRegExp
  let match
  while ((match = regex.exec(rawSource))) {
    const original = match[1] as string
    const startPos = match.index + match[0].indexOf(original)
    const endPos = startPos + original.length - 1
    const newClassName = original
      .replace(/\[/g, '_l_')
      .replace(/\]/g, '_r_')
      .replace(/\(/g, '_p_')
      .replace(/\)/g, '_q_')
      .replace(/#/g, '_h_')
      .replace(/\//g, '-div-')
      .replace(/\./g, '-dot-')
    cb(startPos, endPos, newClassName)
  }
  // match 为 null 时，会自动清除 lastIndex
}
