import * as t from '@babel/types'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'
import { replaceWxml } from './shared'
import type { Token } from './Tokenizer'
import { Tokenizer } from './Tokenizer'
import { parseExpression, traverse } from '@/babel'
import type { ItemOrItemArray } from '@/reg'
import { variableRegExp } from '@/reg'
import { defuOverrideArray } from '@/utils'
import type { ITemplateHandlerOptions, RawSource } from '@/types'
import { replaceHandleValue } from '@/js/handlers'

export function generateCode(match: string, options: ITemplateHandlerOptions = {}) {
  try {
    const { jsHandler, runtimeSet } = options
    if (jsHandler && jsHandler.sync && runtimeSet) {
      const { code } = jsHandler.sync(match, runtimeSet)
      return code
    }
    else {
      const ms = new MagicString(match)
      const ast = parseExpression(match)

      traverse(ast, {
        StringLiteral(path) {
          // [g['人生']==='你好啊'?'highlight':'']
          if (t.isMemberExpression(path.parent)) {
            return
          }
          // parentPath maybe null
          // ['td',[(g.type==='你好啊')?'highlight':'']]
          if (t.isBinaryExpression(path.parent) && (t.isConditionalExpression(path.parentPath?.parent) || t.isLogicalExpression(path.parentPath?.parent))) {
            return
          }
          const n = path.node

          replaceHandleValue(
            n.value,
            n,
            {
              mangleContext: options.mangleContext,
              escapeMap: options.escapeMap,
              classNameSet: options.runtimeSet,
              needEscaped: true,
              always: true,
            },
            ms,
            1,
          )
          // path.node.value = replaceWxml(path.node.value, options)
        },
        noScope: true,
      })

      return ms.toString()
    }
  }
  catch {
    // https://github.com/sonofmagic/weapp-tailwindcss/issues/274
    // {{class}}
    return match
  }
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
      raw: match[1],
    })

    match = reg.exec(original)
  }
  return sources
}

export function extractSource(original: string) {
  return extract(original, variableRegExp)
}

export function handleEachClassFragment(original: string, options: ITemplateHandlerOptions = {}) {
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
          mangleContext: options.mangleContext,
          // 首的str才会被转译
          // example: 2xl:xx 2x{{y}}
          ignoreHead: p > 0,
        }),
      )
      p = m.start
      // 匹配后值
      if (m.raw.trim().length > 0) {
        const code = generateCode(m.raw, options)
        const source = `{{${code}}}`
        m.source = source
      }
      else {
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
            mangleContext: options.mangleContext,
            ignoreHead: true,
          }),
        )
      }
    }

    return resultArray.filter(Boolean).join('').trim()
  }
  else {
    return replaceWxml(original, {
      keepEOL: false,
      escapeMap: options.escapeMap,
      mangleContext: options.mangleContext,
      ignoreHead: false,
    })
  }
}

export function handleEachClassFragment2(ms: MagicString, tokens: Token[], options: ITemplateHandlerOptions = {}) {
  for (const token of tokens) {
    let p = token.start
    if (token.expressions.length > 0) {
      for (const exp of token.expressions) {
        if (exp.start > p) {
          ms.update(p, exp.start, replaceWxml(ms.slice(p, exp.start), {
            keepEOL: true,
            escapeMap: options.escapeMap,
            mangleContext: options.mangleContext,
            // 首的str才会被转译
            // example: 2xl:xx 2x{{y}}
            ignoreHead: p > 0,
          }))
        }

        ms.update(exp.start, exp.end, `{{${generateCode(exp.value.slice(2, -2), options)}}}`)
        p = exp.end
      }
      if (ms.original.length > p) {
        ms.update(p, ms.original.length, replaceWxml(ms.slice(p, ms.original.length), {
          keepEOL: false,
          escapeMap: options.escapeMap,
          mangleContext: options.mangleContext,
          ignoreHead: true,
        }))
      }
    }
    else {
      ms.update(token.start, token.end, replaceWxml(token.value, {
        keepEOL: false,
        escapeMap: options.escapeMap,
        mangleContext: options.mangleContext,
        ignoreHead: false,
      }))
    }
  }
}

export function templateReplacer(original: string, options: ITemplateHandlerOptions = {}) {
  const ms = new MagicString(original)
  const tokenizer = new Tokenizer()
  const tokens = tokenizer.run(ms.original)

  for (const token of tokens) {
    const target = handleEachClassFragment(token.value, options)
    ms.update(token.start, token.end, target)
  }
  // handleEachClassFragment2(ms, tokens, options)

  return ms.toString()
}

export function templateReplacer2(original: string, options: ITemplateHandlerOptions = {}) {
  const ms = new MagicString(original)
  const tokenizer = new Tokenizer()
  const tokens = tokenizer.run(ms.original)
  handleEachClassFragment2(ms, tokens, options)
  return ms.toString()
}

function regTest(reg: RegExp, str: string) {
  reg.lastIndex = 0
  return reg.test(str)
}

export function isPropsMatch(props: ItemOrItemArray<string | RegExp>, attr: string) {
  if (Array.isArray(props)) {
    for (const prop of props) {
      const res = typeof prop === 'string' ? prop.toLowerCase() === attr.toLowerCase() : regTest(prop, attr)
      if (res) {
        return res
      }
    }
    return false
  }
  else if (typeof props === 'string') {
    return props === attr
  }
  else {
    return regTest(props, attr)
  }
}

export async function customTemplateHandler(rawSource: string, options: Required<ITemplateHandlerOptions>) {
  const {
    customAttributesEntities = [],
    disabledDefaultTemplateHandler,
    inlineWxs,
    runtimeSet,
    jsHandler,
  } = options ?? {}
  const s = new MagicString(rawSource)
  let tag = ''
  const wxsArray: {
    startIndex: number
    endIndex: number
    data: string
  }[] = []
  const parser = new Parser(
    {
      onopentagname(name) {
        tag = name
      },

      onattribute(name, value, quote) {
        if (value) {
          // https://github.com/fb55/htmlparser2/blob/5eea942451c1b836999d4557ed98470678c789b9/src/Parser.ts#L431
          function update() {
            s.update(
              parser.startIndex + name.length + 2,
              // !important
              // htmlparser2 9.0.0: parser.endIndex
              // htmlparser2 9.1.0: parser.endIndex - 1
              // https://github.com/sonofmagic/weapp-tailwindcss/issues/269
              parser.endIndex - 1,
              templateReplacer(value, {
                ...options,
                quote,
              }),
            )
          }
          // add 'virtualHostClass' toLowerCase
          if (
            !disabledDefaultTemplateHandler
            && (name === 'class' || name === 'hover-class' || name === 'virtualHostClass' || name === 'virtualhostclass')
          ) {
            update()
          }
          for (const [t, props] of customAttributesEntities) {
            if (t === '*') {
              if (isPropsMatch(props, name)) {
                update()
              }
            }
            else if (typeof t === 'string') {
              if (t === tag && isPropsMatch(props, name)) {
                update()
              }
            }
            else if (regTest(t, tag) && isPropsMatch(props, name)) {
              update()
            }
          }
        }
      },
      ontext(data) {
        if (inlineWxs && tag === 'wxs') {
          wxsArray.push({
            data,
            endIndex: parser.endIndex + 1,
            startIndex: parser.startIndex,
          })
        }
      },
      onclosetag() {
        tag = ''
      },
    },
    {
      xmlMode: true,
    },
  )
  parser.write(s.original)
  parser.end()
  for (const { data, endIndex, startIndex } of wxsArray) {
    const { code } = await jsHandler(data, runtimeSet)
    s.update(startIndex, endIndex, code)
  }

  return s.toString()
}

export function createTemplateHandler(options: Omit<ITemplateHandlerOptions, 'runtimeSet'> = {}) {
  return (rawSource: string, opt: Pick<ITemplateHandlerOptions, 'runtimeSet'> = {}) => {
    return customTemplateHandler(rawSource, defuOverrideArray(opt, options) as Required<ITemplateHandlerOptions>)
  }
}
