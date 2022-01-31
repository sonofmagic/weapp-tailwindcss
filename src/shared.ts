import postcss from 'postcss'

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

export function templeteHandler (
  rawSource: string,
  cb: (sp: number, ep: number, newcls: string) => void
) {
  const regex = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^'"]+)['"]/gmi
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
}
