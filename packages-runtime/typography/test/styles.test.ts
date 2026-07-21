import styles from '../src/styles.cjs'

describe('styles', () => {
  it('snap', () => {
    expect(styles).toMatchSnapshot()
  })
})
