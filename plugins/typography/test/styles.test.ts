import styles from '../src/styles'

describe('styles', () => {
  it('snap', () => {
    expect(styles).toMatchSnapshot()
  })
})
