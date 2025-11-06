// 导入 '@babel/generator' 的生成器实现（当前禁用）
import _babelTraverse from '@babel/traverse'

export { parse, parseExpression } from '@babel/parser'

function _interopDefaultCompat(e: any) {
  return e && typeof e === 'object' && 'default' in e ? e.default : e
}

// 通过兼容处理导出 generate（当前保持注释）

export const traverse = _interopDefaultCompat(_babelTraverse) as typeof _babelTraverse
