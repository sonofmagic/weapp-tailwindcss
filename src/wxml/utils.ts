// import * as wxml from '@icebreakers/wxml'
import { parseExpression } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { replaceWxml } from './shared'
import { variableMatch, variableRegExp, classStringReplace, tagStringReplace } from '@/reg'
import replace from 'regexp-replace'
import type { RawSource } from '@/types'

export function generateCode (match: string) {
  const ast = parseExpression(match)

  traverse(ast, {
    StringLiteral (path) {
      path.node.value = replaceWxml(path.node.value)
    },
    noScope: true
  })

  const { code } = generate(ast, {
    compact: true,
    minified: true,
    jsescOption: {
      quotes: 'single'
    }
  })
  return code
}

export function templeteReplacer (original: string) {
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

export function templeteHandler (rawSource: string) {
  return tagStringReplace(rawSource, (x, arr, index) => {
    const res = classStringReplace(x, (y) => {
      return replace(y, /"(.*?)"/g, (z, arr) => {
        return `"${templeteReplacer(arr[1])}"`
      })
    })
    return res
  })

  // const parsed = wxml.parse(rawSource)
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
