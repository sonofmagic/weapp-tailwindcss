import { parse, traverse } from '@/babel'

describe('babel test', () => {
  it('referenced', () => {
    const ast = parse(
      `const a = 1 + 2 + '3'
    console.log(a)`,
      {
        sourceType: 'unambiguous',
      },
    )
    let count = 0
    traverse(ast, {
      // Referenced: {
      //   enter(p) {
      //     count++
      //   }
      // },
      ReferencedIdentifier: {
        enter(p) {
          count++
        },
      },
      // ReferencedMemberExpression: {
      //   enter(p) {
      //     count++
      //   }
      // }
    })
    // a , console
    expect(count).toBe(2)
  })
})
