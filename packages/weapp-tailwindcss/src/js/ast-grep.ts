import type { Range, SgNode } from '@ast-grep/napi'
import type { IJsHandlerOptions, JsHandlerResult } from '../types'
import MagicString from 'magic-string'
import { logger } from '../logger'
import { replaceHandleValue } from './handlers'
import { JsTokenUpdater } from './JsTokenUpdater'

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

export function isRangeWithinArray(ranges: Range[], targetRange: Range): boolean {
  const { start: targetStart, end: targetEnd } = targetRange

  // 遍历范围数组，判断是否有范围完全包含目标范围
  return ranges.some(({ start, end }) => {
    return start.index <= targetStart.index && end.index >= targetEnd.index
  })
}
export async function astGrepUpdateString(ast: SgNode, options: IJsHandlerOptions) {
  const { Lang, kind } = await getAstGrep()

  const callExpressionNodes = ast.findAll(kind(Lang.JavaScript, 'call_expression'))

  const jsTokenUpdater = new JsTokenUpdater()

  let chooseNodeRanges: Range[] = []

  if (Array.isArray(options.ignoreCallExpressionIdentifiers) && options.ignoreCallExpressionIdentifiers.length) {
    chooseNodeRanges = callExpressionNodes
      .filter((x) => {
        const id = x.child(0)
        return id?.kindToRefine === 'identifier' && options.ignoreCallExpressionIdentifiers?.includes(id.text())
      })
      .map(x => x?.range())
  }

  const nodes = ast.findAll(kind(Lang.JavaScript, 'string'))

  for (const node of nodes) {
    const range = node.range()
    if (isRangeWithinArray(chooseNodeRanges, range)) {
      continue
    }
    const text = node.text()
    jsTokenUpdater.add(replaceHandleValue(
      text.slice(1, -1),
      {
        end: range.end.index - 1,
        start: range.start.index + 1,
      },
      {
        ...options,
        unescapeUnicode: true,
      },
      0,
    ))
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
      if (isRangeWithinArray(chooseNodeRanges, range)) {
        continue
      }
      const text = fragment.text()

      jsTokenUpdater.add(
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
          0,
        ),
      )
    }
  }
  return jsTokenUpdater
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
  const jsTokenUpdater = await astGrepUpdateString(ast, options)
  jsTokenUpdater.updateMagicString(ms)
  return {
    code: ms.toString(),
  }
}
