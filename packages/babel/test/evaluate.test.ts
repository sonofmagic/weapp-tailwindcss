import babel from '@babel/core'
import fs from 'fs-extra'
import path from 'pathe'

function getCase(name: string) {
  return fs.readFileSync(path.resolve(import.meta.dirname, './fixtures/evaluate', name), 'utf8')
}

const plugin: babel.PluginItem = {
  visitor: {
    BinaryExpression(path) {
      // 尝试计算二元表达式的常量值
      const evaluated = path.evaluate()

      // 如果可以计算，且计算结果是确定的常量
      if (evaluated.confident) {
        // 直接用计算后的常量值替换表达式
        path.replaceWithSourceString(evaluated.value.toString())
      }
    },

    CallExpression(path) {
      const callee = path.get('callee')

      // 确保是 Math.pow 函数调用
      const isMathPowCall
        = callee.isMemberExpression()
          && callee.get('object').isIdentifier({ name: 'Math' })
          && callee.get('property').isIdentifier({ name: 'pow' })

      if (isMathPowCall) {
        // 计算 Math.pow 的常量值
        const evaluated = path.evaluate()

        if (evaluated.confident) {
          // 如果能够确定计算结果，替换为常量值
          path.replaceWithSourceString(evaluated.value.toString())
        }
      }
    },
    ArrayExpression(path) {
      // 如果数组中的所有元素都是常量
      const evaluated = path.evaluate()

      if (evaluated.confident) {
        // 直接替换为计算后的值
        path.replaceWithSourceString(JSON.stringify(evaluated.value))
      }
    },
    ObjectExpression(path) {
      const evaluated = path.evaluate()

      if (evaluated.confident) {
        // 直接替换为计算后的对象
        path.replaceWithSourceString(JSON.stringify(evaluated.value))
      }
    },
    IfStatement(path) {
      // 计算条件表达式
      const evaluated = path.get('test').evaluate()

      if (evaluated.confident) {
        // 如果条件是常量，直接折叠成 `true` 或 `false`
        path.get('test').replaceWithSourceString(evaluated.value.toString())
      }
    },
  },
}
describe('evaluate', () => {
  it('0.js', () => {
    const res = babel.transform(
      getCase('0.js'),
      {
        plugins: [
          plugin,
        ],
      },
    )
    if (res) {
      expect(res.code).toMatchSnapshot()
    }
  })

  it('1.js', () => {
    const res = babel.transform(
      getCase('1.js'),
      {
        plugins: [
          plugin,
        ],
      },
    )
    if (res) {
      expect(res.code).toMatchSnapshot()
    }
  })
})
