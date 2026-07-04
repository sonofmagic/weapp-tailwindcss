import { describe, expect, it } from 'vitest'
import { UNI_APP_X_WEB_PREFLIGHT_RESET_CSS, UNI_APP_X_WEB_PREFLIGHT_RESET_MARKER, withUniAppXWebPreflightReset } from '@/uni-app-x/web-preflight-reset'

describe('uni-app x Web preflight reset', () => {
  it('prepends component border-width reset before user utilities', () => {
    const css = withUniAppXWebPreflightReset('*,::before{border:0 solid;}.border{border-width:1px;}', true)

    expect(css).toContain('uni-app uni-view')
    expect(css).toContain('{border-width:0;}')
    expect(css.indexOf(UNI_APP_X_WEB_PREFLIGHT_RESET_MARKER)).toBeLessThan(css.indexOf('.border{border-width:1px;}'))
  })

  it('does not duplicate the reset or apply it when disabled', () => {
    expect(withUniAppXWebPreflightReset('.card{}', false)).toBe('.card{}')
    expect(withUniAppXWebPreflightReset('.border{border-width:1px;}', true)).toBe('.border{border-width:1px;}')
    expect(withUniAppXWebPreflightReset(`${UNI_APP_X_WEB_PREFLIGHT_RESET_CSS}\n.card{}`, true))
      .toBe(`${UNI_APP_X_WEB_PREFLIGHT_RESET_CSS}\n.card{}`)
  })
})
