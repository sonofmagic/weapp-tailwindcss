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

export interface JsToken {
  start: number
  end: number
  value: string
  // type?: (string & {})
  path: NodePath<StringLiteral | TemplateElement>
}
