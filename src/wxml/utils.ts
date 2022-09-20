import { parseExpression, traverse, generate } from '@/babel'
import { replaceWxml } from './shared'
import { variableMatch, variableRegExp, vueTemplateClassRegexp, tagWithEitherClassAndHoverClassRegexp } from '@/reg'
import type { RawSource, ICommonReplaceOptions } from '@/types'

export function generateCode (match: string, options: ICommonReplaceOptions = {}) {
  const ast = parseExpression(match)

  traverse(ast, {
    StringLiteral (path) {
      // if (path.parent.type === 'BinaryExpression') {
      //   return
      // }
      // ConditionalExpression
      path.node.value = replaceWxml(path.node.value, options)
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
  // if (options.classGenerator) {
  //   return ` ${code} `
  // }
  return code
}

export function templeteReplacer (original: string, options: ICommonReplaceOptions = {}) {
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
      resultArray.push(
        replaceWxml(original.slice(p, m.start), {
          keepEOL: true,
          classGenerator: options.classGenerator
        })
      )
      p = m.start
      // 匹配后值
      if (m.raw.trim().length) {
        const code = generateCode(m.raw, options)
        let source = `{{${code}}}`
        if (options.classGenerator) {
          source = ` ${source} `
        }
        m.source = source
      } else {
        m.source = ''
      }

      resultArray.push(m.source)
      p = m.end
      // 匹配最终尾部值
      if (i === sources.length - 1) {
        resultArray.push(
          replaceWxml(original.slice(m.end), {
            keepEOL: true,
            classGenerator: options.classGenerator
          })
        )
      }
    }

    return resultArray.filter((x) => x).join('').trim()
  } else {
    return replaceWxml(original, {
      keepEOL: false,
      classGenerator: options.classGenerator
    })
  }
}

export function templeteHandler (rawSource: string, options: ICommonReplaceOptions = {}) {
  return rawSource.replace(tagWithEitherClassAndHoverClassRegexp, (m0) => {
    return m0.replace(vueTemplateClassRegexp, (m1, className) => {
      return m1.replace(className, templeteReplacer(className, options))
    })
  })
}
