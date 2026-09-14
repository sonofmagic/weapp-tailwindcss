import { describe, expect, it } from 'vitest'
import manifest from '../packages/weapp-tailwindcss/package.json'
import { isTemplateVersionCompatible } from './templateContract'

const major = Number(manifest.version.split('.')[0])

describe('模板稳定版兼容范围', () => {
  it.each([`^${major}.0.0`, `^${manifest.version}`, manifest.version])('接受兼容范围 %s', (range) => {
    expect(isTemplateVersionCompatible(range)).toBe(true)
  })

  it.each([`>=${major + 1}.0.0`, `<${major}.0.0`, 'invalid', 'workspace:*', undefined, null])('拒绝不兼容或无效范围 %s', (range) => {
    expect(isTemplateVersionCompatible(range)).toBe(false)
  })
})
