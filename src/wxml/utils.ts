import * as t from '@babel/types'
import { replaceWxml } from './shared'
import { parseExpression, traverse, generate } from '@/babel'
import { variableMatch, variableRegExp, templateClassExactRegexp, tagWithEitherClassAndHoverClassRegexp, makeCustomAttributes } from '@/reg'
import { defu } from '@/utils'
import type { RawSource, ICommonReplaceOptions, ITempleteHandlerOptions } from '@/types'

export function generateCode(match: string, options: ICommonReplaceOptions = {}) {
  const ast = parseExpression(match)

  traverse(ast, {
    StringLiteral(path) {
      // [g['人生']==='你好啊'?'highlight':'']
      if (t.isMemberExpression(path.parent)) {
        return
      }
      // parentPath maybe null
      // ['td',[(g.type==='你好啊')?'highlight':'']]
      if (t.isBinaryExpression(path.parent) && t.isConditionalExpression(path.parentPath?.parent)) {
        return
      }

      path.node.value = replaceWxml(path.node.value, options)
    },
    noScope: true
  })
  // @ts-ignore
  const { code } = generate(ast, {
    compact: true,
    minified: true,
    jsescOption: {
      quotes: 'single',
      minimal: true
    }
  })

  return code
}

export function extractSource(original: string) {
  let match = variableMatch(original)
  const sources: RawSource[] = []

  while (match !== null) {
    // 过滤空字符串
    // if (match[1].trim().length) {
    const start = match.index
    const end = variableRegExp.lastIndex
    sources.push({
      start,
      end,
      raw: match[1],
      prevConcatenated: !/\s/.test(original[start - 1]),
      nextConcatenated: !/\s/.test(original[end])
    })

    match = variableMatch(original)
  }
  return sources
}

export function templeteReplacer(original: string, options: ICommonReplaceOptions = {}) {
  const sources = extractSource(original)

  if (sources.length > 0) {
    const resultArray: string[] = []
    let p = 0
    for (let i = 0; i < sources.length; i++) {
      const m = sources[i]
      const before = original.slice(p, m.start)

      // 匹配前值
      resultArray.push(
        replaceWxml(before, {
          keepEOL: true,
          escapeMap: options.escapeMap
        })
      )
      p = m.start
      // 匹配后值
      if (m.raw.trim().length > 0) {
        const code = generateCode(m.raw, options)
        const source = `{{${code}}}`
        m.source = source
      } else {
        m.source = ''
      }

      resultArray.push(m.source)
      p = m.end
      // 匹配最终尾部值
      if (i === sources.length - 1) {
        const after = original.slice(m.end)
        resultArray.push(
          replaceWxml(after, {
            keepEOL: true,
            escapeMap: options.escapeMap
          })
        )
      }
    }

    return resultArray
      .filter(Boolean)
      .join('')
      .trim()
  } else {
    return replaceWxml(original, {
      keepEOL: false,
      escapeMap: options.escapeMap
    })
  }
}

export function templeteHandler(rawSource: string, options: ICommonReplaceOptions = {}) {
  return rawSource.replace(tagWithEitherClassAndHoverClassRegexp, (m0) => {
    return m0.replace(templateClassExactRegexp, (m1, className) => {
      return m1.replace(className, templeteReplacer(className, options))
    })
  })
}

export function customTempleteHandler(rawSource: string, options: ITempleteHandlerOptions = {}) {
  let source = templeteHandler(rawSource, options)
  const regexps = makeCustomAttributes(options.customAttributesEntities)
  if (regexps) {
    if (Array.isArray(regexps)) {
      for (const regexp of regexps) {
        source = source.replace(regexp.tagRegexp, (m0) => {
          return m0.replace(regexp.attrRegexp, (m1, className) => {
            return m1.replace(className, templeteReplacer(className, options))
          })
        })
      }
    }

    return source
  } else {
    return source
  }
}

export function createTempleteHandler(options: ITempleteHandlerOptions = {}) {
  return (rawSource: string, opt: ITempleteHandlerOptions = {}) => {
    return customTempleteHandler(rawSource, defu(opt, options))
  }
}
