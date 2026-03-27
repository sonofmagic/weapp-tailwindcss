import { describe, expect, it } from 'vitest'
import {
  defaultNavbarUiSettings,
  getNavbarUiControlKey,
  isNavbarItemVisible,
  mergeNavbarUiSettings,
} from './navbar'

describe('navbar ui management', () => {
  it('可以根据 className 识别受控导航项', () => {
    expect(getNavbarUiControlKey('navbar__github-link')).toBe('github')
    expect(getNavbarUiControlKey('foo navbar__atomgit-link bar')).toBe('atomgit')
    expect(getNavbarUiControlKey('navbar__unknown-link')).toBeNull()
  })

  it('只隐藏被配置关闭的导航项', () => {
    const settings = {
      ...defaultNavbarUiSettings,
      github: false,
    }

    expect(isNavbarItemVisible({ className: 'navbar__github-link' }, settings)).toBe(false)
    expect(isNavbarItemVisible({ className: 'navbar__atomgit-link' }, settings)).toBe(true)
    expect(isNavbarItemVisible({ className: 'navbar__link' }, settings)).toBe(true)
  })

  it('读取存储数据时会回退缺失或非法字段', () => {
    expect(mergeNavbarUiSettings({
      github: false,
      atomgit: 'no',
    })).toEqual({
      atomgit: true,
      github: false,
      weappVite: true,
    })

    expect(mergeNavbarUiSettings(null)).toEqual(defaultNavbarUiSettings)
  })
})
