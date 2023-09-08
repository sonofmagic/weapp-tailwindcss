import * as t from '@babel/types'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'
import { replaceWxml } from './shared'
import { parseExpression, traverse, generate } from '@/babel'
import { variableRegExp, ItemOrItemArray } from '@/reg'
import { defu } from '@/utils'
import type { RawSource, ITemplateHandlerOptions } from '@/types'
export function generateCode(match: string, options: ITemplateHandlerOptions = {}) {
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

/**
 * @internal
 */
function extract(original: string, reg: RegExp) {
  let match = reg.exec(original)
  const sources: RawSource[] = []

  while (match !== null) {
    // 过滤空字符串
    // if (match[1].trim().length) {
    const start = match.index
    const end = reg.lastIndex
    sources.push({
      start,
      end,
      raw: match[1]
    })

    match = reg.exec(original)
  }
  return sources
}

export function extractSource(original: string) {
  return extract(original, variableRegExp)
}

export function templateReplacer(original: string, options: ITemplateHandlerOptions = {}) {
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
          escapeMap: options.escapeMap,
          mangleContext: options.mangleContext
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
            escapeMap: options.escapeMap,
            mangleContext: options.mangleContext
          })
        )
      }
    }

    return resultArray.filter(Boolean).join('').trim()
  } else {
    return replaceWxml(original, {
      keepEOL: false,
      escapeMap: options.escapeMap,
      mangleContext: options.mangleContext
    })
  }
}

function regTest(reg: RegExp, str: string) {
  reg.lastIndex = 0
  return reg.test(str)
}

export function isPropsMatch(props: ItemOrItemArray<string | RegExp>, attr: string) {
  if (Array.isArray(props)) {
    for (const prop of props) {
      const res = typeof prop === 'string' ? prop.toLowerCase() === attr : regTest(prop, attr)
      if (res) {
        return res
      }
    }
    return false
  } else if (typeof props === 'string') {
    return props === attr
  } else {
    return regTest(props, attr)
  }
}

export function customTemplateHandler(rawSource: string, options: Required<ITemplateHandlerOptions>) {
  const { customAttributesEntities = [], disabledDefaultTemplateHandler, inlineWxs, runtimeSet, jsHandler } = options ?? {}
  const s = new MagicString(rawSource)
  let tag = ''
  const parser = new Parser({
    onopentagname(name) {
      tag = name
    },
    onattribute(name, value, quote) {
      if (value) {
        if (quote === "'") {
          s.update(parser.startIndex + name.length + 1, parser.startIndex + name.length + 2, '"')
          s.update(parser.startIndex + name.length + value.length + 2, parser.startIndex + name.length + value.length + 3, '"')
        }
        function update() {
          s.update(parser.startIndex + name.length + 2, parser.endIndex, templateReplacer(value, options))
        }
        // add 'virtualHostClass' toLowerCase
        if (!disabledDefaultTemplateHandler && (name === 'class' || name === 'hover-class' || name === 'virtualhostclass')) {
          update()
        }
        for (const [t, props] of customAttributesEntities) {
          if (t === '*') {
            if (isPropsMatch(props, name)) {
              update()
            }
          } else if (typeof t === 'string') {
            if (t === tag && isPropsMatch(props, name)) {
              update()
            }
          } else if (regTest(t, tag) && isPropsMatch(props, name)) {
            update()
          }
        }
      }
    },
    ontext(data) {
      if (inlineWxs && tag === 'wxs') {
        const code = jsHandler(data, runtimeSet).code
        s.update(parser.startIndex, parser.endIndex + 1, code)
      }
    },
    onclosetag() {
      tag = ''
    }
  })
  parser.write(s.original)
  parser.end()
  return s.toString()
}

export function createTemplateHandler(options: Omit<ITemplateHandlerOptions, 'runtimeSet'> = {}) {
  return (rawSource: string, opt: Pick<ITemplateHandlerOptions, 'runtimeSet'> = {}) => {
    return customTemplateHandler(rawSource, defu(opt, options) as Required<ITemplateHandlerOptions>)
  }
}
