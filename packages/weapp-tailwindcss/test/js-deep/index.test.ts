import { parse, traverse } from '@/babel'
import t from '@babel/types'
import MagicString from 'magic-string'

describe('js-deep', () => {
  it('parse js case 0', () => {
    const ms = new MagicString('const a = \'bg-[#123456]\';cn(a,"xx","yy")')
    const ast = parse(ms.original)
    traverse(ast, {
      // StringLiteral
      CallExpression(path) {
        // 检查是否是 cn 函数调用
        if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'cn') {
          path.node.arguments.forEach((arg, index) => {
            // 如果参数是标识符（如 ccc）
            if (t.isIdentifier(arg)) {
              console.log(`Found variable: ${arg.name} at index ${index}`)
              // 查找该变量在作用域中的定义位置
              const binding = path.scope.getBinding(arg.name)
              if (binding) {
                console.log(`Variable ${arg.name} is defined at`, binding.path.node.loc)

                // 假设我们想修改 a 的 StringLiteral 值
                const bindingNode = binding.path.node

                // 确保它是一个 StringLiteral 类型
                if (t.isVariableDeclarator(bindingNode) && t.isStringLiteral(bindingNode.init)) {
                  const stringLiteral = bindingNode.init
                  console.log('Original StringLiteral value:', stringLiteral.value)

                  // 修改 StringLiteral 的值
                  stringLiteral.value = 'bg-[#654321]' // 新的值

                  // 更新 MagicString 以反映更改
                  if (bindingNode.init.start && bindingNode.init.end) {
                    ms.overwrite(bindingNode.init.start, bindingNode.init.end, `'${stringLiteral.value}'`)
                  }
                }
              }
            }
          })
        }
      },
    })
    expect(ms.toString()).toBe('const a = \'bg-[#654321]\';cn(a,"xx","yy")')
  })

  it('parse js case 1', () => {
    const ms = new MagicString('const a = ` text-[#123456]`;cn(a,"xx","yy")')
    const ast = parse(ms.original)

    // 处理二元表达式，递归地替换每个字符串字面量
    function replaceStringLiteralsInBinaryExpr(binaryNode: t.BinaryExpression) {
      if (t.isStringLiteral(binaryNode.left)) {
        const leftStringLiteral = binaryNode.left
        console.log('Original left StringLiteral:', leftStringLiteral.value)
        leftStringLiteral.value = 'bg-[#654321]' // 替换
        ms.overwrite(leftStringLiteral.start, leftStringLiteral.end, `'${leftStringLiteral.value}'`)
      }
      else if (t.isBinaryExpression(binaryNode.left)) {
        replaceStringLiteralsInBinaryExpr(binaryNode.left) // 递归
      }

      if (t.isStringLiteral(binaryNode.right)) {
        const rightStringLiteral = binaryNode.right
        console.log('Original right StringLiteral:', rightStringLiteral.value)
        rightStringLiteral.value = 'text-[#222222]' // 替换
        ms.overwrite(rightStringLiteral.start, rightStringLiteral.end, `'${rightStringLiteral.value}'`)
      }
      else if (t.isBinaryExpression(binaryNode.right)) {
        replaceStringLiteralsInBinaryExpr(binaryNode.right) // 递归
      }
    }
    traverse(ast, {
      // StringLiteral
      CallExpression(path) {
        // 检查是否是 cn 函数调用
        if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'cn') {
          path.node.arguments.forEach((arg, index) => {
            // 如果参数是标识符（如 ccc）
            if (t.isIdentifier(arg)) {
              console.log(`Found variable: ${arg.name} at index ${index}`)
              // 查找该变量在作用域中的定义位置
              const binding = path.scope.getBinding(arg.name)
              if (binding) {
                console.log(`Variable ${arg.name} is defined at`, binding.path.node.loc)

                // 假设我们想修改 a 的 StringLiteral 值
                const bindingNode = binding.path.node

                // 确保它是一个 StringLiteral 类型
                if (t.isVariableDeclarator(bindingNode)) {
                  if (t.isStringLiteral(bindingNode.init)) {
                    const stringLiteral = bindingNode.init
                    console.log('Original StringLiteral value:', stringLiteral.value)

                    // 修改 StringLiteral 的值
                    stringLiteral.value = 'bg-[#654321]' // 新的值

                    // 更新 MagicString 以反映更改
                    if (bindingNode.init.start && bindingNode.init.end) {
                      ms.overwrite(bindingNode.init.start, bindingNode.init.end, `'${stringLiteral.value}'`)
                    }
                  }
                  else if (t.isBinaryExpression(bindingNode.init)) {
                    replaceStringLiteralsInBinaryExpr(bindingNode.init)
                  }
                  else if (t.isTemplateLiteral(bindingNode.init)) {
                    // 处理模板字面量中的静态部分（quasis）
                    bindingNode.init.quasis.forEach((quasis) => {
                      const originalValue = quasis.value.cooked
                      console.log('Original TemplateLiteral value:', originalValue)

                      // 替换模板字面量中的静态部分
                      // const newValue = originalValue.replace(/[#[\]a-z0-9]/gi, '_') // 举例，替换字符为 _
                      if (quasis.start && quasis.end) {
                        ms.overwrite(quasis.start, quasis.end, `123`)
                      }
                    })
                  }
                }
              }
            }
          })
        }
      },
    })
    expect(ms.toString()).toBe('const a = `123`;cn(a,"xx","yy")')
  })

  it('parse js case 2', () => {
    const ms = new MagicString('const a = \'bg-[#123456]\' + \' bb\' + ` text-[#123456]`;cn(a,"xx","yy")')
    const ast = parse(ms.original)

    // 处理二元表达式，递归地替换每个字符串字面量
    function replaceStringLiteralsInBinaryExpr(binaryNode: t.BinaryExpression) {
      if (t.isStringLiteral(binaryNode.left)) {
        const leftStringLiteral = binaryNode.left
        console.log('Original left StringLiteral:', leftStringLiteral.value)
        leftStringLiteral.value = 'bg-[#654321]' // 替换
        ms.overwrite(leftStringLiteral.start, leftStringLiteral.end, `'${leftStringLiteral.value}'`)
      }
      else if (t.isBinaryExpression(binaryNode.left)) {
        replaceStringLiteralsInBinaryExpr(binaryNode.left) // 递归
      }

      if (t.isStringLiteral(binaryNode.right)) {
        const rightStringLiteral = binaryNode.right
        console.log('Original right StringLiteral:', rightStringLiteral.value)
        rightStringLiteral.value = 'text-[#222222]' // 替换
        ms.overwrite(rightStringLiteral.start, rightStringLiteral.end, `'${rightStringLiteral.value}'`)
      }
      else if (t.isBinaryExpression(binaryNode.right)) {
        replaceStringLiteralsInBinaryExpr(binaryNode.right) // 递归
      }
    }
    traverse(ast, {
      // StringLiteral
      CallExpression(path) {
        // 检查是否是 cn 函数调用
        if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'cn') {
          path.node.arguments.forEach((arg, index) => {
            // 如果参数是标识符（如 ccc）
            if (t.isIdentifier(arg)) {
              console.log(`Found variable: ${arg.name} at index ${index}`)
              // 查找该变量在作用域中的定义位置
              const binding = path.scope.getBinding(arg.name)
              if (binding) {
                console.log(`Variable ${arg.name} is defined at`, binding.path.node.loc)

                // 假设我们想修改 a 的 StringLiteral 值
                const bindingNode = binding.path.node

                // 确保它是一个 StringLiteral 类型
                if (t.isVariableDeclarator(bindingNode)) {
                  if (t.isStringLiteral(bindingNode.init)) {
                    const stringLiteral = bindingNode.init
                    console.log('Original StringLiteral value:', stringLiteral.value)

                    // 修改 StringLiteral 的值
                    stringLiteral.value = 'bg-[#654321]' // 新的值

                    // 更新 MagicString 以反映更改
                    if (bindingNode.init.start && bindingNode.init.end) {
                      ms.overwrite(bindingNode.init.start, bindingNode.init.end, `'${stringLiteral.value}'`)
                    }
                  }
                  else if (t.isBinaryExpression(bindingNode.init)) {
                    replaceStringLiteralsInBinaryExpr(bindingNode.init)
                  }
                  else if (t.isTemplateLiteral(bindingNode.init)) {
                    // 处理模板字面量中的静态部分（quasis）
                    bindingNode.init.quasis.forEach((quasis) => {
                      const originalValue = quasis.value.cooked
                      console.log('Original TemplateLiteral value:', originalValue)

                      // 替换模板字面量中的静态部分
                      const newValue = originalValue.replace(/[#[\]a-z0-9]/gi, '_') // 举例，替换字符为 _
                      ms.overwrite(quasis.start, quasis.end, `'${newValue}'`)
                    })
                  }
                }
              }
            }
          })
        }
      },
    })
    expect(ms.toString()).toBe('const a = \'bg-[#654321]\' + \'text-[#222222]\' + ` text-[#123456]`;cn(a,"xx","yy")')
  })
})
