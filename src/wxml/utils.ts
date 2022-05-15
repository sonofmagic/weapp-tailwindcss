// import * as wxml from '@icebreakers/wxml'
import { parseExpression } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import { replaceWxml } from './shared'
import { variableMatch, variableRegExp, tagWithClassRegexp, classRegexp } from '@/reg'
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

// const isDebug = Boolean(process.env.DEBUG)

// function log (message: any, ...args: any[]) {
//   console.log(message, ...args)
// }
// function now () {
//   return Date.now()
// }

export function templeteHandler (rawSource: string) {
  return rawSource.replace(tagWithClassRegexp, (m, tagName, className) => {
    return m.replace(className, templeteReplacer(className))
  })
  // return tagStringReplace(rawSource, (x) => {
  //   // ts = now()
  //   return classStringReplace(x, (y) => {
  //     // ts = now()
  //     return doubleQuoteStringReplace(y, (z, p1) => {
  //       // ts = now()
  //       return `"${templeteReplacer(p1)}"`
  //       // log(`[templeteReplacer]:${now() - ts}, ${z}`)
  //     })
  //     // log(`[doubleQuoteStringReplace]:${now() - ts}, ${y}`)
  //   })
  //   // log(`[classStringReplace]:${now() - ts}, ${x}`)
  // })
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
