import { describe, expect, it } from 'vitest'
import { normalizeGenerationModuleRequests } from '../src/v4/module-requests'

describe('Tailwind 生成模块请求', () => {
  it.each([
    ['/project', '/project/config.cjs', './config.cjs'],
    ['/project/src', '/project/中文 config.cjs', '../中文 config.cjs'],
    ['C:\\project', 'C:/project/config.cjs', './config.cjs'],
    ['C:\\project', 'D:/config.cjs', 'D:/config.cjs'],
    ['/', '/config.cjs', './config.cjs'],
  ])('规范化 %s 中的 %s', (base, file, expected) => {
    expect(normalizeGenerationModuleRequests(`@config "${file}";`, base)).toContain(`"${expected}"`)
  })
  it('保留包请求和相对插件请求', () => {
    const css = '@plugin "@tailwindcss/forms"; @plugin "./plugin.cjs";'
    expect(normalizeGenerationModuleRequests(css, '/project')).toBe(css)
  })
})
