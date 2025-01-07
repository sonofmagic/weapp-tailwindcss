import type { SgNode } from '@ast-grep/napi'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import MagicString from 'magic-string'
import { logger } from '../logger'
import { replaceHandleValue } from './handlers'

export async function getAstGrep() {
  try {
    const mod = await import('@ast-grep/napi')
    return mod
  }
  catch (error) {
    logger.warn('请先安装 `@ast-grep/napi` , 安装完成后再尝试运行！')
    throw error
  }
}

export async function astGrepUpdateString(ast: SgNode, options: IJsHandlerOptions, ms: MagicString) {
  const { Lang, kind } = await getAstGrep()
  const nodes = ast.findAll(kind(Lang.JavaScript, 'string'))

  for (const node of nodes) {
    const range = node.range()
    const text = node.text()

    replaceHandleValue(
      text.slice(1, -1),
      {
        end: range.end.index - 1,
        start: range.start.index + 1,
      },
      {
        ...options,
        unescapeUnicode: true,
      },
      ms,
      0,
    )
  }

  const templateNodes = ast.findAll(kind(Lang.JavaScript, 'template_string'))
  for (const node of templateNodes) {
    const p = node.parent()
    if (p && p.kind() === 'call_expression') {
      const c = p.child(0)
      if (c && c.kind() === 'identifier' && options.ignoreTaggedTemplateExpressionIdentifiers?.includes(c.text())) {
        continue
      }
    }
    const fragments = node.findAll(kind(Lang.JavaScript, 'string_fragment'))
    for (const fragment of fragments) {
      const range = fragment.range()
      const text = fragment.text()
      replaceHandleValue(
        text,
        {
          end: range.end.index,
          start: range.start.index,
        },
        {
          ...options,
          unescapeUnicode: true,
        },
        ms,
        0,
      )
    }
  }
}

export async function jsHandlerAsync(rawSource: string, options: IJsHandlerOptions): Promise<JsHandlerResult> {
  const ms = new MagicString(rawSource)
  const { parseAsync, Lang } = await getAstGrep()
  let ast: SgNode
  try {
    const root = await parseAsync(Lang.JavaScript, rawSource)
    ast = root.root()
  }
  catch {
    return {
      code: rawSource,
    } as JsHandlerResult
  }
  await astGrepUpdateString(ast, options, ms)

  return {
    code: ms.toString(),
  }
}
