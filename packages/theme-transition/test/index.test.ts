import { usetoggleTheme } from '@/index'

describe('index', () => {
  // it('isAppearanceTransition', () => {
  //   expect(isAppearanceTransition).toBe(true)
  // })

  it('createtoggleTheme', () => {
    let dark = false
    const { toggleTheme } = usetoggleTheme({
      isCurrentDark() {
        return dark
      },
      toggle() {
        dark = !dark
      },
    })
    expect(toggleTheme).toBeTypeOf('function')
    // expect(isAppearanceTransition).toBeTypeOf('boolean')
  })
})
