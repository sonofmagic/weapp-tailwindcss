import { describe, expect, it } from 'vitest'

import {
  buildApiIndexFrontmatter,
  buildInterfaceSeoFrontmatter,
  buildOptionsGroupSeoFrontmatter,
  buildOtherInterfacesSeoFrontmatter,
  buildUserDefinedOptionsOverviewFrontmatter,
} from './generate-api-docs.ts'

describe('generate-api-docs SEO frontmatter', () => {
  it('provides strong metadata for interface pages', () => {
    const frontmatter = buildInterfaceSeoFrontmatter({
      name: 'ApplyOptions',
      description: 'Preferred options for runtime patch behavior.',
    })

    expect(frontmatter.description.length).toBeGreaterThanOrEqual(16)
    expect(frontmatter.keywords.length).toBeGreaterThanOrEqual(8)
    expect(frontmatter.keywords).toContain('ApplyOptions')
  })

  it('falls back when interface descriptions are too short', () => {
    const frontmatter = buildInterfaceSeoFrontmatter({
      name: 'DisabledOptions',
      description: '禁用插件功能的细粒度选项。',
    })

    expect(frontmatter.description).toBe('DisabledOptions 接口文档，包含属性说明、类型定义与使用边界。')
  })

  it('provides strong metadata for generated index pages', () => {
    const userDefinedOptions = buildUserDefinedOptionsOverviewFrontmatter({
      description: 'UserDefinedOptions 总览，按分组汇总 weapp-tailwindcss 的核心配置项与跳转入口。',
    })
    const optionsGroup = buildOptionsGroupSeoFrontmatter({
      title: '一般配置',
      sidebarLabel: '⚙️ 一般配置',
      displayTitle: '⚙️ 一般配置',
      order: 3,
    }, 17)
    const otherInterfaces = buildOtherInterfacesSeoFrontmatter(9)
    const index = buildApiIndexFrontmatter(true)

    for (const frontmatter of [userDefinedOptions, optionsGroup, otherInterfaces, index]) {
      expect(frontmatter.description.length).toBeGreaterThanOrEqual(16)
      expect(frontmatter.keywords.length).toBeGreaterThanOrEqual(8)
    }
  })
})
