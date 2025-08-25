import postcss from 'postcss'

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
  const weakMap = new WeakMap()
  it('enforce', async () => {
    const { css } = await postcss(
      [
        {
          postcssPlugin: '1',
          Once() {
            console.log('1 Once')
          },
          OnceExit() {
            console.log('1 OnceExit')
          },
          Root() {
            console.log('1 Root')
          },
          RootExit() {
            console.log('1 RootExit')
          },
          Rule() {
            console.log('1 Rule')
          },
          RuleExit() {
            console.log('1 RuleExit')
          },
        },
        {
          postcssPlugin: '2',
          Rule(node, { rule, decl }) {
            console.log('2 Rule')
            if (!weakMap.get(rule)) {
              node.append(rule({ selector: '.blue', nodes: [decl({ prop: 'color', value: 'blue' })] }))
              weakMap.set(rule, true)
            }
          },
          RuleExit() {
            console.log('2 RuleExit')
          },
          Root() {
            console.log('2 Root')
          },
          RootExit() {
            console.log('2 RootExit')
          },
          Once() {
            console.log('2 Once')
          },
          OnceExit(_root) {
            console.log('2 OnceExit')
            // root.append(rule({ selector: '.blue', nodes: [decl({ prop: 'color', value: 'blue' })] }))
          },
        },
      ],
    ).process('.red { color: red; }', {
      from: undefined,
    })
    expect(css).toMatchSnapshot()
  })
})
