import type { ItemOrItemArray } from '@weapp-core/regex'
import type { ITemplateHandlerOptions } from '../types'
import type { Token } from './Tokenizer'
import * as t from '@babel/types'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'
import { JsTokenUpdater } from '@/js/JsTokenUpdater'
import { parseExpression, traverse } from '../babel'
import { replaceHandleValue } from '../js/handlers'
import { defuOverrideArray } from '../utils'
import { replaceWxml } from './shared'
import { Tokenizer } from './Tokenizer'
import { isAllWhitespace } from './whitespace'

export function generateCode(match: string, options: ITemplateHandlerOptions = {}) {
  try {
    const { jsHandler, runtimeSet } = options
    if (jsHandler && runtimeSet) {
      const { code } = jsHandler(match, runtimeSet)
      return code
    }
    else {
      /**
       * @deprecated
       */
      const ms = new MagicString(match)
      const ast = parseExpression(match)
      const jsTokenUpdater = new JsTokenUpdater()

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
          jsTokenUpdater.addToken(
            replaceHandleValue(
              path,
              {
                mangleContext: options.mangleContext,
                escapeMap: options.escapeMap,
                classNameSet: options.runtimeSet,
                needEscaped: true,
                alwaysEscape: true,
              },
            ),
          )

          // path.node.value = replaceWxml(path.node.value, options)
        },
        noScope: true,
      })
      jsTokenUpdater.updateMagicString(ms)

      return ms.toString()
    }
  }
  catch {
    // https://github.com/sonofmagic/weapp-tailwindcss/issues/274
    // {{class}}
    return match
  }
}

export function handleEachClassFragment(ms: MagicString, tokens: Token[], options: ITemplateHandlerOptions = {}) {
  let previousEnd = 0
  for (const token of tokens) {
    if (token.start > previousEnd) {
      const gap = ms.slice(previousEnd, token.start)
      if (isAllWhitespace(gap)) {
        ms.update(previousEnd, token.start, replaceWxml(gap, {
          keepEOL: false,
          escapeMap: options.escapeMap,
          mangleContext: options.mangleContext,
          ignoreHead: true,
        }))
      }
    }
    let p = token.start
    if (token.expressions.length > 0) {
      for (const exp of token.expressions) {
        if (exp.start > token.start && p < exp.start) {
          ms.update(p, exp.start, replaceWxml(ms.slice(p, exp.start), {
            keepEOL: true,
            escapeMap: options.escapeMap,
            mangleContext: options.mangleContext,
            // 首的str才会被转译
            // example: 2xl:xx 2x{{y}}
            ignoreHead: p > 0,
          }))
        }
        const code = `{{${generateCode(exp.value.slice(2, -2), options)}}}`
        ms.update(exp.start, exp.end, code)
        p = exp.end
      }
      if (token.end > p) {
        ms.update(p, token.end, replaceWxml(ms.slice(p, token.end), {
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
    previousEnd = token.end
  }

  if (tokens.length > 0) {
    const lastToken = tokens[tokens.length - 1]
    if (lastToken.end < ms.original.length) {
      const gap = ms.slice(lastToken.end, ms.original.length)
      if (isAllWhitespace(gap)) {
        ms.update(lastToken.end, ms.original.length, replaceWxml(gap, {
          keepEOL: false,
          escapeMap: options.escapeMap,
          mangleContext: options.mangleContext,
          ignoreHead: true,
        }))
      }
    }
  }
}

export function templateReplacer(original: string, options: ITemplateHandlerOptions = {}) {
  const ms = new MagicString(original)
  const tokenizer = new Tokenizer()
  const tokens = tokenizer.run(ms.original)
  handleEachClassFragment(ms, tokens, options)
  return ms.toString()
}

function regTest(reg: RegExp, str: string) {
  reg.lastIndex = 0
  return reg.test(str)
}

export function isPropsMatch(props: ItemOrItemArray<string | RegExp>, attr: string) {
  if (Array.isArray(props)) {
    let lowerAttr: string | undefined
    for (const prop of props) {
      if (typeof prop === 'string') {
        lowerAttr ??= attr.toLowerCase()
        if (prop.toLowerCase() === lowerAttr) {
          return true
        }
      }
      else if (regTest(prop, attr)) {
        return true
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
  const wildcardAttributeRules: ItemOrItemArray<string | RegExp>[] = []
  const tagAttributeRuleMap = new Map<string, ItemOrItemArray<string | RegExp>[]>()
  const regexpAttributeRules: Array<[RegExp, ItemOrItemArray<string | RegExp>]> = []

  for (const [selector, props] of customAttributesEntities) {
    if (selector === '*') {
      wildcardAttributeRules.push(props)
    }
    else if (typeof selector === 'string') {
      const list = tagAttributeRuleMap.get(selector)
      if (list) {
        list.push(props)
      }
      else {
        tagAttributeRuleMap.set(selector, [props])
      }
    }
    else {
      regexpAttributeRules.push([selector, props])
    }
  }

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
          const lowerName = name.toLowerCase()
          let updated = false
          // https://github.com/fb55/htmlparser2/blob/5eea942451c1b836999d4557ed98470678c789b9/src/Parser.ts#L431
          const update = () => {
            if (updated) {
              return
            }
            updated = true
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
          // addToken 'virtualHostClass' toLowerCase
          if (
            !disabledDefaultTemplateHandler
            && (lowerName === 'class' || lowerName === 'hover-class' || lowerName === 'virtualhostclass')
          ) {
            update()
          }
          if (!updated) {
            for (const props of wildcardAttributeRules) {
              if (isPropsMatch(props, name)) {
                update()
                break
              }
            }
          }
          if (!updated) {
            const tagRules = tagAttributeRuleMap.get(tag)
            if (tagRules) {
              for (const props of tagRules) {
                if (isPropsMatch(props, name)) {
                  update()
                  break
                }
              }
            }
          }
          if (!updated) {
            for (const [selector, props] of regexpAttributeRules) {
              if (regTest(selector, tag) && isPropsMatch(props, name)) {
                update()
                break
              }
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
