import type { BinaryExpression, StringLiteral, TemplateLiteral } from '@babel/types'
import type MagicString from 'magic-string'
import type { JsToken, JsTokenMeta } from './types'
import t from '@babel/types'

export class JsTokenUpdater {
  public value: JsToken[]
  constructor(value?: JsToken[]) {
    this.value = value ?? []
  }

  add(token?: JsToken) {
    if (token) {
      this.value.push(token)
    }
  }

  addTemplateLiteral(node: TemplateLiteral, meta?: JsTokenMeta) {
    for (const quasis of node.quasis) {
      if (quasis.start && quasis.end && quasis.value.cooked) {
        this.add({
          start: quasis.start,
          end: quasis.end,
          value: quasis.value.cooked,
          type: 'TemplateElement',
          meta,
        })
      }
    }
  }

  addStringLiteral(node: StringLiteral, meta?: JsTokenMeta) {
    if (node.start && node.end) {
      this.add({
        start: node.start + 1,
        end: node.end - 1,
        value: node.value,
        type: 'StringLiteral',
        meta,
      })
    }
  }

  addBinaryExpression(binaryNode: BinaryExpression) {
    if (t.isStringLiteral(binaryNode.left)) {
      this.addStringLiteral(binaryNode.left)
    }
    else if (t.isBinaryExpression(binaryNode.left)) {
      this.addBinaryExpression(binaryNode.left) // 递归
    }
    else if (t.isTemplateLiteral(binaryNode.left)) {
      this.addTemplateLiteral(binaryNode.left)
    }

    if (t.isStringLiteral(binaryNode.right)) {
      this.addStringLiteral(binaryNode.right)
    }
    else if (t.isBinaryExpression(binaryNode.right)) {
      this.addBinaryExpression(binaryNode.right) // 递归
    }
    else if (t.isTemplateLiteral(binaryNode.right)) {
      this.addTemplateLiteral(binaryNode.right)
    }
  }

  map(callbackfn: (value: JsToken, index: number, array: JsToken[]) => JsToken) {
    this.value = this.value.map(callbackfn)
    return this
  }

  filter(callbackfn: (value: JsToken, index: number, array: JsToken[]) => unknown) {
    this.value = this.value.filter(callbackfn)
    return this
  }

  updateMagicString(ms: MagicString) {
    for (const { start, end, value } of this.value) {
      ms.update(start, end, value)
    }
    return ms
  }
}
