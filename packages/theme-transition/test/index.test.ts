import { useToggleTheme } from '@/index'

describe('index', () => {
  // it('isAppearanceTransition', () => {
  //   expect(isAppearanceTransition).toBe(true)
  // })

  it('createtoggleTheme', () => {
    let dark = false
    const { toggleTheme } = useToggleTheme({
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
