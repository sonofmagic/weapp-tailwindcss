import postcss from 'postcss'
import { createPlugins } from './utils'
// 不动态添加
// 1 Once
// 2 Once
// 1 Root
// 2 Root
// 1 Rule
// 2 Rule
// 1 RuleExit
// 2 RuleExit
// 1 RootExit
// 2 RootExit
// 1 OnceExit
// 2 OnceExit

// 动态添加

// 1 Once
// 2 Once
// 1 Root
// 2 Root
// 1 Rule
// 2 Rule
// 在这里因为添加了所以重新执行了 Rule
// 1 Rule
// 2 Rule
// 1 RuleExit
// 2 RuleExit
// 同样重新执行了 RuleExit
// 1 RuleExit
// 2 RuleExit
// 1 RootExit
// 2 RootExit
// 重新执行 Root
// 1 Root
// 2 Root
// 1 RootExit
// 2 RootExit
// end
// 1 OnceExit
// 2 OnceExit
describe('plugins', () => {
  it('enforce default', async () => {
    const { css } = await postcss(
      createPlugins([
        '1',
        '2',
      ]),
    ).process('.red { color: red; }', {
      from: undefined,
    })
    expect(css).toMatchSnapshot()
  })

  it('enforce append rule case', async () => {
    const weakMap = new WeakMap()
    const { css } = await postcss(
      createPlugins([
        '1',
        {
          postcssPlugin: '2',
          Rule(node, { rule, decl }) {
            console.log('2 Rule')
            if (!weakMap.get(rule)) {
              node.append(rule({ selector: '.blue', nodes: [decl({ prop: 'color', value: 'blue' })] }))
              weakMap.set(rule, true)
            }
          },
        },
      ]),
    ).process('.red { color: red; }', {
      from: undefined,
    })
    expect(css).toMatchSnapshot()
  })

  it('enforce remove rule case', async () => {
    const { css } = await postcss(
      createPlugins([
        {
          postcssPlugin: '1',
          Rule(node) {
            console.log('1 Rule')
            node.remove()
          },
        },
        {
          postcssPlugin: '2',
          Rule(node) {
            // 不会命中
            console.log('2 Rule -----------')
            node.remove()
          },
        },
      ]),
    ).process('.red { color: red; }', {
      from: undefined,
    })
    expect(css).toMatchSnapshot()
  })
})
