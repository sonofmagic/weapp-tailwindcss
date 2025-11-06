// 导入 '@babel/generator'（当前未启用）
import _babelTraverse from '@babel/traverse'

export { parse, parseExpression } from '@babel/parser'

function _interopDefaultCompat(e: any) {
  return e && typeof e === 'object' && 'default' in e ? e.default : e
}

// 暴露 generate 以兼容现有调用（暂时注释保留）

export const traverse = _interopDefaultCompat(_babelTraverse) as typeof _babelTraverse
