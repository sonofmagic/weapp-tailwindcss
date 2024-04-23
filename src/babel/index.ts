import _babelGenerate from '@babel/generator'
import _babelTraverse from '@babel/traverse'

export { parse, parseExpression } from '@babel/parser'

function _interopDefaultCompat(e: any) {
  return e && typeof e === 'object' && 'default' in e ? e.default : e
}

export const generate = _interopDefaultCompat(_babelGenerate) as typeof _babelGenerate

export const traverse = _interopDefaultCompat(_babelTraverse) as typeof _babelTraverse
