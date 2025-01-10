import { defaultMangleContext, useMangleStore } from '@weapp-tailwindcss/mangle'

describe('mangle', () => {
  it('mangle api', () => {
    const { initMangle, mangleContext, resetMangle } = useMangleStore()
    expect(mangleContext).toEqual(defaultMangleContext)
    initMangle(true)
    expect(mangleContext.rawOptions).toBe(true)
    expect(mangleContext.filter('flex')).toBe(false)
    initMangle({
      mangleClassFilter() {
        return true
      },
    })
    expect(mangleContext.filter('flex')).toBe(true)
    resetMangle()
    expect(mangleContext.filter('flex')).toBe(false)
  })
})
