import { useToggleDark } from '@/index'

describe('index', () => {
  // it('isAppearanceTransition', () => {
  //   expect(isAppearanceTransition).toBe(true)
  // })

  it('createToggleDark', () => {
    let dark = false
    const { toggleDark } = useToggleDark({
      getDarkValue() {
        return dark
      },
      toggle() {
        dark = !dark
      },
    })
    expect(toggleDark).toBeTypeOf('function')
    // expect(isAppearanceTransition).toBeTypeOf('boolean')
  })
})
