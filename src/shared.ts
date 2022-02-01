import postcss from 'postcss'
import wxml from 'wxml'
import type { NODE_TYPES } from 'wxml'
// https://github.com/yoshuawuyts/extract-html-class/blob/master/index.js
// https://stackoverflow.com/questions/16559171/regular-expression-to-get-a-class-name-from-html
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
// https://medium.com/@rcore/regex-finding-tagnames-and-classes-names-in-html-react-jsx-angular-files-dee5be333e76#id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjllYWEwMjZmNjM1MTU3ZGZhZDUzMmU0MTgzYTZiODIzZDc1MmFkMWQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2NDM3Mjk5NTEsImF1ZCI6IjIxNjI5NjAzNTgzNC1rMWs2cWUwNjBzMnRwMmEyamFtNGxqZGNtczAwc3R0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExMzg0NTI5MjgyMjY0NDkyODczMSIsImVtYWlsIjoicXExMzI0MzE4NTMyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiIyMTYyOTYwMzU4MzQtazFrNnFlMDYwczJ0cDJhMmphbTRsamRjbXMwMHN0dGcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJuYW1lIjoi5aSN5YW05Lit5Zu9IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hLS9BT2gxNEdpclZMXzVDRlZ2WVZQam1pcEZsOTNZN3R3MnVHSmtTMzYyczRCQj1zOTYtYyIsImdpdmVuX25hbWUiOiLkuK3lm70iLCJmYW1pbHlfbmFtZSI6IuWkjeWFtCIsImlhdCI6MTY0MzczMDI1MSwiZXhwIjoxNjQzNzMzODUxLCJqdGkiOiI1YTFlZDZkNjZlNDBjM2U0NTUzNWNjMzI1NzcxZTczNjIwMDc0Nzg3In0.Z33yU2kw2j25fYZSk_77xkfUJn201Zx2OxIk6Sbvg9dbruu2h8Ufj92QdKfGPLLvn7h1T_2JIEcmbmJMxijsIwg99hL6wY1gNYSOGjcCB-2XIOX_87tySC_BzoSSsF9fOTW9uFLwoxNBjxjCTF6lI8AT4FjM2AP8quipYn6_vJ5Kyz_vsjgkD_6iUv1ecgnxYi_IWkfDrXDKwrzJN6tn_AGJZt2Vdz4IHv86282SEp6kyrZxjvgt-k9e8vXMGC7nxHYI4ATFOZd1FxuNzZEMTW_N57NxXaGlGMpvXBEly4-9jvkQXJY4mEZTXFcypM2y1k27D0HYQPbY6wlvKO6QSA
// JavaScript RegExp 对象是有状态的。他们会将上次成功匹配后的位置记录在 lastIndex 属性中。
// class="{{['item','data-v-59d503f6',d]}}"
// wxml 这类的必须更改添加情况不然只能匹配 {{[
export const classRegExp =
  /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gim

export function cssSelectorReplacer (selector: string) {
  return selector
    .replace(/\\\[/g, '_l_')
    .replace(/\\\]/g, '_r_')
    .replace(/\\\(/g, '_p_')
    .replace(/\\\)/g, '_q_')
    .replace(/\\#/g, '_h_')
    .replace(/\\\//g, '-div-')
    .replace(/\\\./g, '-dot-')
}

export function templeteReplacer (original: string) {
  return original
    .replace(/\[/g, '_l_')
    .replace(/\]/g, '_r_')
    .replace(/\(/g, '_p_')
    .replace(/\)/g, '_q_')
    .replace(/#/g, '_h_')
    .replace(/\//g, '-div-')
    .replace(/\./g, '-dot-')
}

export function styleHandler (rawSource: string) {
  const root = postcss.parse(rawSource)
  root.walk((node, idx) => {
    if (node.type === 'rule') {
      node.selector = cssSelectorReplacer(node.selector)
    } else if (node.type === 'comment') {
      node.remove()
    }
  })
  const css = root.toString()
  return css
}

export function templeteHandler (
  rawSource: string,
  cb: (sp: number, ep: number, newcls: string) => void
) {
  const parsedArray = wxml.parse(rawSource)
  for (let i = 0; i < parsedArray.length; i++) {
    const parsed = parsedArray[i]
    wxml.traverse(parsed, (node, parent) => {

    })
  }

  // const regex = classRegExp
  // let match
  // while ((match = regex.exec(rawSource))) {
  //   const original = match[1] as string
  //   const startPos = match.index + match[0].indexOf(original)
  //   const endPos = startPos + original.length - 1
  //   const newClassName = templeteReplacer(original)
  //   cb(startPos, endPos, newClassName)
  // }
  // match 为 null 时，会自动清除 lastIndex
}
