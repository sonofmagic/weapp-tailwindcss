import styles from '@/styles'

describe('styles', () => {
  it('snap', () => {
    expect(styles).toMatchSnapshot()
  })
})
