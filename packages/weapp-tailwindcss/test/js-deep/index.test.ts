import { parse, traverse } from '@/babel'
import t from '@babel/types'
import MagicString from 'magic-string'

describe('js-deep', () => {
  it('parse js', () => {
    const ms = new MagicString('const a = \'bg-[#123456]\';cn(a,"xx","yy")')
    const ast = parse(ms.original)
    traverse(ast, {
      CallExpression(path) {
        // 检查是否是 cn 函数调用
        // @ts-ignore
        if (path.node.callee.name === 'cn') {
          path.node.arguments.forEach((arg, index) => {
            // 如果参数是标识符（如 ccc）
            if (t.isIdentifier(arg)) {
              console.log(`Found variable: ${arg.name} at index ${index}`)
              // 查找该变量在作用域中的定义位置
              const binding = path.scope.getBinding(arg.name)
              if (binding) {
                console.log(`Variable ${arg.name} is defined at`, binding.path.node.loc)
                // @ts-ignore
                console.log(ms.slice(binding.path.node.loc?.start.index, binding.path.node.loc?.end.index))
              }
            }
          })
        }
      },
    })
    expect(ms.toString()).toBe('const a = \'bg-[#123456]\';cn(a,"xx","yy")')
  })
})
