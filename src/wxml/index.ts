import wxml from '@icebreakers/wxml'
import { parseExpression } from '@babel/parser'
import { isStringLiteral, isConditionalExpression } from '@babel/types'
// import babelTraverse from '@babel/traverse'
// https://github.com/yoshuawuyts/extract-html-class/blob/master/index.js
// https://stackoverflow.com/questions/16559171/regular-expression-to-get-a-class-name-from-html
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
// https://medium.com/@rcore/regex-finding-tagnames-and-classes-names-in-html-react-jsx-angular-files-dee5be333e76#id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjllYWEwMjZmNjM1MTU3ZGZhZDUzMmU0MTgzYTZiODIzZDc1MmFkMWQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2NDM3Mjk5NTEsImF1ZCI6IjIxNjI5NjAzNTgzNC1rMWs2cWUwNjBzMnRwMmEyamFtNGxqZGNtczAwc3R0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjExMzg0NTI5MjgyMjY0NDkyODczMSIsImVtYWlsIjoicXExMzI0MzE4NTMyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiIyMTYyOTYwMzU4MzQtazFrNnFlMDYwczJ0cDJhMmphbTRsamRjbXMwMHN0dGcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJuYW1lIjoi5aSN5YW05Lit5Zu9IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hLS9BT2gxNEdpclZMXzVDRlZ2WVZQam1pcEZsOTNZN3R3MnVHSmtTMzYyczRCQj1zOTYtYyIsImdpdmVuX25hbWUiOiLkuK3lm70iLCJmYW1pbHlfbmFtZSI6IuWkjeWFtCIsImlhdCI6MTY0MzczMDI1MSwiZXhwIjoxNjQzNzMzODUxLCJqdGkiOiI1YTFlZDZkNjZlNDBjM2U0NTUzNWNjMzI1NzcxZTczNjIwMDc0Nzg3In0.Z33yU2kw2j25fYZSk_77xkfUJn201Zx2OxIk6Sbvg9dbruu2h8Ufj92QdKfGPLLvn7h1T_2JIEcmbmJMxijsIwg99hL6wY1gNYSOGjcCB-2XIOX_87tySC_BzoSSsF9fOTW9uFLwoxNBjxjCTF6lI8AT4FjM2AP8quipYn6_vJ5Kyz_vsjgkD_6iUv1ecgnxYi_IWkfDrXDKwrzJN6tn_AGJZt2Vdz4IHv86282SEp6kyrZxjvgt-k9e8vXMGC7nxHYI4ATFOZd1FxuNzZEMTW_N57NxXaGlGMpvXBEly4-9jvkQXJY4mEZTXFcypM2y1k27D0HYQPbY6wlvKO6QSA
// JavaScript RegExp 对象是有状态的。他们会将上次成功匹配后的位置记录在 lastIndex 属性中。
// class="{{['item','data-v-59d503f6',d]}}"
// wxml 这类的必须更改添加情况不然只能匹配 {{[
// export const classRegExp =
//   /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gim

export function replaceWxml (original: string) {
  return original
    .replace(/\[/g, '_l_')
    .replace(/\]/g, '_r_')
    .replace(/\(/g, '_p_')
    .replace(/\)/g, '_q_')
    .replace(/#/g, '_h_')
    .replace(/!/g, '_i_') //! important
    .replace(/\//g, '-div-')
    .replace(/\./g, '-dot-')
}

export function templeteReplacer (original: string) {
  // {{['item','data-v-59d503f6',d]}} 特殊处理
  // {{['h-[100px]','data-v-59d503f6','hello w-[100rpx]']}}
  // {{['xxx',d]}}
  const match = /{{([^{}]+)}}/.exec(original)
  // wxml 变量处理
  if (match && match[1]) {
    // const test = parse(match[1])
    // console.log(test)
    // 假如需要更加细节的处理
    // 可以匹配之后， replace() ' -> " 后 json.parse 成 js array 来做进一步的筛选(变量报错情况)
    // `['']`
    // :class="['org__text-'+(node.align || ''),node.active || collapsed?'node__label-active':'']"
    const strArr = match[1].slice(1, -1).split(',')
    const result = strArr
      .map((x) => {
        // const ast = parse(x)
        const ast = parseExpression(x)
        if (isStringLiteral(ast)) {
          return replaceWxml(x)
        } else if (isConditionalExpression(ast)) {
          const { test, consequent, alternate } = ast
          const testStr = x.slice(test.start as number, test.end as number)
          const isConsequentString = isStringLiteral(consequent)
          const isAlternateString = isStringLiteral(alternate)
          const consequentStr = x.slice(
            consequent.start as number,
            consequent.end as number
          )
          const alternateStr = x.slice(
            alternate.start as number,
            alternate.end as number
          )
          return `${testStr}?${
            isConsequentString ? replaceWxml(consequentStr) : consequentStr
          }:${isAlternateString ? replaceWxml(alternateStr) : alternateStr}`
        } else {
          // isVaraible
          return x
        }

        // babelTypes.isBinaryExpression(ast)
        // babelTypes.isConditionalExpression(ast) 二元运算符

        // const isVaraible = x[0] !== "'"
        // // or 或者是循环变量
        // if (isVaraible) {
        //   return x
        // }
        // return replaceWxml(x)
      })
      .join(',')
    // const classNameStr = match[1].replace(/'/g, '"')
    // const className = JSON.parse(classNameStr) as string[]
    // const result = className.map((x) => `'${replaceWxml(x)}'`).join(',')
    return `{{[${result}]}}`
  }

  return replaceWxml(original)

  // const classNameStr = match[1].replace(/'/g, '"')
  // try {
  //   const className = JSON.parse(classNameStr)
  //   if (Array.isArray(className)) {
  //     return className.map((x) =>
  //       x
  //         .replace(/\[/g, '_l_')
  //         .replace(/\]/g, '_r_')
  //         .replace(/\(/g, '_p_')
  //         .replace(/\)/g, '_q_')
  //         .replace(/#/g, '_h_')
  //         .replace(/\//g, '-div-')
  //         .replace(/\./g, '-dot-')
  //     ).join(',')
  //   }
  //   console.log(className)
  // } catch (error) {
  //   return original
  // }
}

export function templeteHandler (rawSource: string) {
  const parsed = wxml.parse(rawSource)
  wxml.traverse(parsed, (node, parent) => {
    if (node.type === wxml.NODE_TYPES.ELEMENT) {
      // @ts-ignore
      if (node.attributes.class) {
        // @ts-ignore
        node.attributes.class = templeteReplacer(node.attributes.class)
      }
    }
  })
  return wxml.serialize(parsed)

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
