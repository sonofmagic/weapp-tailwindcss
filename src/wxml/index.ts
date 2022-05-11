import { parse, render } from 'wxml-ast'
import { parseExpression } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { replaceWxml } from './shared'

export { replaceWxml }

// #region internal
const variableRegExp = /{{([^{}]*)}}/g

function variableMatch(original: string) {
  return variableRegExp.exec(original)
}
// #endregion

export function generateCode(match: string) {
  const ast = parseExpression(match)

  traverse(ast, {
    StringLiteral(path) {
      path.node.value = replaceWxml(path.node.value)
    },
    noScope: true
  })

  const { code } = generate(ast, {
    compact: true,
    minified: true
  })
  return code
}

export interface RawSource {
  start: number
  end: number
  raw: string
  // '' 直接 remove {{}}
  source?: string
}

export function templeteReplacer(original: string) {
  let match = variableMatch(original)
  const sources: RawSource[] = []

  while (match !== null) {
    // 过滤空字符串
    // if (match[1].trim().length) {
    sources.push({
      start: match.index,
      end: variableRegExp.lastIndex,
      raw: match[1]
    })

    match = variableMatch(original)
  }

  if (sources.length) {
    const resultArray: string[] = []
    let p = 0
    for (let i = 0; i < sources.length; i++) {
      const m = sources[i]
      // 匹配前值
      resultArray.push(replaceWxml(original.slice(p, m.start), true))
      p = m.start
      // 匹配后值
      if (m.raw.trim().length) {
        const code = generateCode(m.raw)
        m.source = `{{${code}}}`
      } else {
        m.source = ''
      }

      resultArray.push(m.source)
      p = m.end
      // 匹配最终尾部值
      if (i === sources.length - 1) {
        resultArray.push(replaceWxml(original.slice(m.end), true))
      }
    }

    return resultArray.filter((x) => x).join('')
  } else {
    return replaceWxml(original)
  }
}

export async function templeteHandler(rawSource: string) {
  const parsed = await parse(rawSource, {
    elementCB: (node) => {
      if (node.attribs.class) {
        node.attribs.class = templeteReplacer(node.attribs.class)
      }
    }
  })
  return render(parsed)
  // wxml.traverse(parsed, (node, parent) => {
  //   if (node.type === wxml.NODE_TYPES.ELEMENT) {
  //     // @ts-ignore
  //     if (node.attributes.class) {
  //       // @ts-ignore
  //       node.attributes.class = templeteReplacer(node.attributes.class)
  //     }
  //   }
  // })
  // return wxml.serialize(parsed)
}
