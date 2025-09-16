import valueParser from 'postcss-value-parser'

describe('value-parser', () => {
// page,:host {
//   --spacing: .25rem;
// }
// .w-1 {
//   width: 0.25rem;
//   width: calc(var(--spacing)*1);
// }
  it('valueParser value 0', () => {
    const parsed = valueParser('0.25rem')
    parsed.walk((node) => {
      console.log(node)
    })
  })

  it('valueParser value 1', () => {
    const parsed = valueParser('calc(var(--spacing)*1)')
    parsed.walk((node) => {
      // 当且仅当前一个属性也是，且 var 满足的时候
      if (node.type === 'function' && node.value === 'var') {
        const item = node.nodes.find((x) => {
          return x.type === 'word' && x.value === '--spacing'
        })
        if (item) {
          item.value = '--xx'
        }
      }
    })
    expect(parsed.toString()).toBe('calc(var(--xx)*1)')
  })
})
