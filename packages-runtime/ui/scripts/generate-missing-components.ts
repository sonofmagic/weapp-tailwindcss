#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
/**
 * 生成缺失的组件脚本
 */
import process from 'node:process'

const componentsDir = path.resolve(process.cwd(), 'src/components')

// 待生成的组件列表
const components = [
  { name: 'card', category: 'data-display', description: '卡片组件' },
  { name: 'avatar', category: 'data-display', description: '头像组件' },
  { name: 'badge', category: 'data-display', description: '徽章组件' },
  { name: 'tag', category: 'data-display', description: '标签组件' },
]

function toPascalCase(str: string): string {
  return str.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase())
}

function generateTypes(name: string, description: string): string {
  const PascalName = toPascalCase(name)
  return `import type { ClassValue } from '../../../utils/class-names'

/**
 * ${PascalName} 组件类型定义
 * ${description}
 */
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
   * 子元素
   */
  children?: any
}
`
}

function generateTaroComponent(name: string, description: string): string {
  const PascalName = toPascalCase(name)
  return `/**
 * ${PascalName} - Taro 组件
 * ${description}
 */
import type { FC } from 'react'

import { View } from '@tarojs/components'
import React from 'react'
import { cn } from '../../../utils/class-names'
import type { ${PascalName}Props } from './types'

const ${PascalName}: FC<${PascalName}Props> = ({
  className,
  style,
  children,
  ..._props
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

function generateIndex(name: string): string {
  const PascalName = toPascalCase(name)
  return `export { default as ${PascalName}Taro } from './${name}.taro'
export type * from './types'
export { default as ${PascalName} } from './${name}.taro'
`
}

// 生成组件
for (const component of components) {
  const { name, category, description } = component
  const componentDir = path.join(componentsDir, category, name)

  // 创建组件目录
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true })
  }

  // 生成 types.ts
  const typesPath = path.join(componentDir, 'types.ts')
  fs.writeFileSync(typesPath, generateTypes(name, description))

  // 生成 Taro 组件
  const taroPath = path.join(componentDir, `${name}.taro.tsx`)
  fs.writeFileSync(taroPath, generateTaroComponent(name, description))

  // 生成 index.ts
  const indexPath = path.join(componentDir, 'index.ts')
  fs.writeFileSync(indexPath, generateIndex(name))

  console.log(`✅ 生成组件: ${name}`)
}

console.log('\n🎉 所有组件生成完成!')
