#!/usr/bin/env node
import * as fs from 'node:fs'
import * as path from 'node:path'
/**
 * 批量生成组件脚本
 */
import process from 'node:process'

type ComponentCategory = 'core' | 'feedback' | 'data-display' | 'navigation' | 'layout'

interface ComponentConfig {
  name: string
  category: ComponentCategory
  description: string
}

// 待生成的组件列表
const components: ComponentConfig[] = [
  // Core components
  { name: 'checkbox', category: 'core', description: '复选框组件' },
  { name: 'radio', category: 'core', description: '单选框组件' },
  { name: 'switch', category: 'core', description: '开关组件' },

  // Feedback components
  { name: 'toast', category: 'feedback', description: '轻提示组件' },
  { name: 'modal', category: 'feedback', description: '模态框组件' },
  { name: 'dialog', category: 'feedback', description: '对话框组件' },
  { name: 'alert', category: 'feedback', description: '警告提示组件' },
  { name: 'loading', category: 'feedback', description: '加载组件' },
  { name: 'progress', category: 'feedback', description: '进度条组件' },

  // Data display components
  { name: 'list', category: 'data-display', description: '列表组件' },
  { name: 'table', category: 'data-display', description: '表格组件' },
  { name: 'collapse', category: 'data-display', description: '折叠面板组件' },

  // Navigation components
  { name: 'tabs', category: 'navigation', description: '标签页组件' },
  { name: 'pagination', category: 'navigation', description: '分页组件' },
  { name: 'menu', category: 'navigation', description: '菜单组件' },

  // Layout components
  { name: 'grid', category: 'layout', description: '网格布局组件' },
  { name: 'flex', category: 'layout', description: '弹性布局组件' },
  { name: 'divider', category: 'layout', description: '分割线组件' },
]

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

function generateSimpleTaroComponent(name: string, description: string): string {
  const PascalName = toPascalCase(name)
  return `/**
 * ${PascalName} - Taro 组件
 * ${description}
 */
import { View } from '@tarojs/components'
import type { FC } from 'react'
import React from 'react'
import { cn } from '../../../utils/class-names'
import type { ${PascalName}Props } from './types'

const ${PascalName}: FC<${PascalName}Props> = ({
  className,
  style,
  children,
  ...props
}) => {
  return (
    <View
      className={cn('wt-${name}', className)}
      style={style}
    >
      {children}
    </View>
  )
}

export default ${PascalName}
`
}

function generateSimpleTypes(name: string, description: string): string {
  const PascalName = toPascalCase(name)
  return `/**
 * ${PascalName} 组件类型定义
 * ${description}
 */
import type { ClassValue } from '../../../utils/class-names'

export interface ${PascalName}Props {
  /**
   * 自定义类名
   */
  className?: ClassValue
  /**
   * 自定义样式
   */
  style?: Record<string, any>
  /**
   * 子内容
   */
  children?: any
}
`
}

function generateIndex(name: string): string {
  const PascalName = toPascalCase(name)
  return `/**
 * ${PascalName} 组件导出
 */
export * from './types'
export { default as ${PascalName}Taro } from './${name}.taro'

// 默认导出 Taro 版本
export { default as ${PascalName} } from './${name}.taro'
`
}

function generateComponent(config: ComponentConfig) {
  const { name, category, description } = config
  const componentDir = path.join(process.cwd(), 'src', 'components', category, name)

  // 创建组件目录
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true })
  }

  // 生成文件
  fs.writeFileSync(path.join(componentDir, 'types.ts'), generateSimpleTypes(name, description))
  fs.writeFileSync(path.join(componentDir, `${name}.taro.tsx`), generateSimpleTaroComponent(name, description))
  fs.writeFileSync(path.join(componentDir, 'index.ts'), generateIndex(name))

  console.log(`✅ 生成组件: ${name} (${category})`)
}

// 批量生成所有组件
console.log('开始批量生成组件...\n')
components.forEach(generateComponent)
console.log(`\n✅ 完成! 共生成 ${components.length} 个组件`)
