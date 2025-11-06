import type { NodePath } from '@babel/traverse'
import type { StringLiteral, TemplateElement } from '@babel/types'

export interface JsTokenMeta {
  ignore?: boolean
}

// interface JsTokenTemplateElement {
//   type: 'TemplateElement'
//   ast: TemplateElement
// }

// interface JsTokenStringLiteral {
//   type: 'StringLiteral'
//   ast: StringLiteral
// }

//  (JsTokenTemplateElement | JsTokenStringLiteral) &

/**
 * 表示源代码中需要替换的一段内容，并持有对应 AST Path 以便后续过滤。
 */
export interface JsToken {
  start: number
  end: number
  value: string
  // type?: (string & {})
  path: NodePath<StringLiteral | TemplateElement>
}
