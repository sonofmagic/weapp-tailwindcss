import transform from '../src/index'

describe('transform', () => {
  it('case 0', () => {
    expect(transform('<p></p>', { prefix: '' })).toBe('<p class="p"></p>')
  })

  it('case 1', () => {
    expect(transform('<p><a></a></p>', { prefix: '' })).toBe('<p class="p"><a class="a"></a></p>')
  })

  it('case 2', () => {
    expect(transform('<p><a></a></p>', { prefix: '' })).toBe('<p class="p"><a class="a"></a></p>')
  })
})
