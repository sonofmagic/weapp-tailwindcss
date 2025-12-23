#!/usr/bin/env node
import * as fs from 'node:fs'
import * as path from 'node:path'
/**
 * 组件生成脚本
 * 用于快速创建新组件的脚手架
 */
import process from 'node:process'

type ComponentCategory = 'core' | 'feedback' | 'data-display' | 'navigation' | 'layout'

interface GenerateComponentOptions {
  name: string
  category: ComponentCategory
  withTests?: boolean
  withDocs?: boolean
}

const COMPONENT_CATEGORIES: ComponentCategory[] = ['core', 'feedback', 'data-display', 'navigation', 'layout']

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

function generateTypeDefinition(componentName: string): string {
  const pascalName = toPascalCase(componentName)
  return `/**
 * ${pascalName} 组件类型定义
 */
import type { ClassValue } from '../../utils/class-names'

export interface ${pascalName}Props {
  /**
   * 自定义类名
   */
  className?: ClassValue
  /**
   * 自定义样式
   */
  style?: Record<string, any>
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 子内容
   */
  children?: any
}
`
}

function generateIndexFile(componentName: string): string {
  const pascalName = toPascalCase(componentName)
  return `/**
 * ${pascalName} 组件导出
 */
export * from './types'
export { default as ${pascalName}Native } from './${componentName}.native'
export { default as ${pascalName}Taro } from './${componentName}.taro'
export { default as ${pascalName}Uni } from './${componentName}.uni'
`
}

function generateNativeComponent(componentName: string): string {
  const pascalName = toPascalCase(componentName)
  return `/**
 * ${pascalName} - 原生小程序组件
 */
import type { ${pascalName}Props } from './types'

Component({
  properties: {
    className: {
      type: String,
      value: '',
    },
    disabled: {
      type: Boolean,
      value: false,
    },
  },
  data: {},
  methods: {
    handleClick(e: WechatMiniprogram.BaseEvent) {
      if (this.data.disabled)
        return
      this.triggerEvent('click', e)
    },
  },
})
`
}

function generateNativeTemplate(componentName: string): string {
  const kebabName = toKebabCase(componentName)
  return `<!--${toPascalCase(componentName)} 原生小程序模板-->
<view 
  class="wt-${kebabName} {{className}}" 
  bindtap="handleClick"
  aria-disabled="{{disabled}}"
>
  <slot></slot>
</view>
`
}

function generateNativeStyle(componentName: string): string {
  const kebabName = toKebabCase(componentName)
  return `/* ${toPascalCase(componentName)} 原生小程序样式 */
.wt-${kebabName} {
  /* 组件样式在 preset.ts 中定义 */
}
`
}

function generateNativeJson(_componentName: string): string {
  return `{
  "component": true,
  "usingComponents": {}
}
`
}

function generateTaroComponent(componentName: string): string {
  const pascalName = toPascalCase(componentName)
  const kebabName = toKebabCase(componentName)
  return `/**
 * ${pascalName} - Taro 组件
 */
import { View } from '@tarojs/components'
import type { FC } from 'react'
import { cn } from '../../utils/class-names'
import type { ${pascalName}Props } from './types'

const ${pascalName}: FC<${pascalName}Props> = ({
  className,
  style,
  disabled = false,
  children,
  ...props
}) => {
  const handleClick = (e: any) => {
    if (disabled)
      return
    props.onClick?.(e)
  }

  return (
    <View
      className={cn('wt-${kebabName}', className, { 'is-disabled': disabled })}
      style={style}
      onClick={handleClick}
      aria-disabled={disabled}
    >
      {children}
    </View>
  )
}

export default ${pascalName}
`
}

function generateUniComponent(componentName: string): string {
  const pascalName = toPascalCase(componentName)
  const kebabName = toKebabCase(componentName)
  return `<template>
  <!-- ${pascalName} uni-app 组件 -->
  <view
    :class="rootClass"
    :style="style"
    :aria-disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '../../utils/class-names'
import type { ${pascalName}Props } from './types'

const props = withDefaults(defineProps<${pascalName}Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  click: [event: any]
}>()

const rootClass = computed(() => {
  return cn('wt-${kebabName}', props.className, {
    'is-disabled': props.disabled,
  })
})

const handleClick = (e: any) => {
  if (props.disabled)
    return
  emit('click', e)
}
</script>
`
}

function generateReadme(componentName: string): string {
  const pascalName = toPascalCase(componentName)
  return `# ${pascalName}

## 组件说明

${pascalName} 组件说明待补充。

## 安装和引入

### 原生小程序

\`\`\`json
{
  "usingComponents": {
    "${componentName}": "@weapp-tailwindcss/ui/components/${componentName}/${componentName}.native"
  }
}
\`\`\`

### Taro

\`\`\`tsx
import { ${pascalName} } from '@weapp-tailwindcss/ui/components/${componentName}'
\`\`\`

### uni-app

\`\`\`vue
<script setup>
import ${pascalName} from '@weapp-tailwindcss/ui/components/${componentName}/${componentName}.uni.vue'
</script>
\`\`\`

## 基础用法

\`\`\`tsx
<${pascalName}>内容</${pascalName}>
\`\`\`

## API

### Props

| 属性名    | 类型    | 默认值 | 说明     |
| --------- | ------- | ------ | -------- |
| className | string  | -      | 自定义类名 |
| style     | object  | -      | 自定义样式 |
| disabled  | boolean | false  | 是否禁用   |

### Events

| 事件名 | 说明     | 参数 |
| ------ | -------- | ---- |
| click  | 点击事件 | event |

## 平台差异说明

该组件在三个平台的使用无差异。

## 示例

待补充
`
}

function generateTestFile(componentName: string): string {
  const pascalName = toPascalCase(componentName)
  return `/**
 * ${pascalName} 组件测试
 */
import { describe, expect, it } from 'vitest'

describe('${pascalName}', () => {
  it('should render correctly', () => {
    expect(true).toBe(true)
  })

  // TODO: 添加更多测试用例
})
`
}

function generateComponent(options: GenerateComponentOptions) {
  const { name, category } = options
  const componentDir = path.join(process.cwd(), 'src', 'components', category, name)

  // 创建组件目录
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true })
  }

  // 生成类型定义
  fs.writeFileSync(path.join(componentDir, 'types.ts'), generateTypeDefinition(name))

  // 生成索引文件
  fs.writeFileSync(path.join(componentDir, 'index.ts'), generateIndexFile(name))

  // 生成原生小程序组件
  fs.writeFileSync(path.join(componentDir, `${name}.native.ts`), generateNativeComponent(name))
  fs.writeFileSync(path.join(componentDir, `${name}.native.wxml`), generateNativeTemplate(name))
  fs.writeFileSync(path.join(componentDir, `${name}.native.wxss`), generateNativeStyle(name))
  fs.writeFileSync(path.join(componentDir, `${name}.native.json`), generateNativeJson(name))

  // 生成 Taro 组件
  fs.writeFileSync(path.join(componentDir, `${name}.taro.tsx`), generateTaroComponent(name))

  // 生成 uni-app 组件
  fs.writeFileSync(path.join(componentDir, `${name}.uni.vue`), generateUniComponent(name))

  // 生成文档
  if (options.withDocs !== false) {
    fs.writeFileSync(path.join(componentDir, 'README.md'), generateReadme(name))
  }

  // 生成测试文件
  if (options.withTests) {
    const testDir = path.join(componentDir, '__tests__')
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }
    fs.writeFileSync(path.join(testDir, `${name}.test.ts`), generateTestFile(name))
  }

  console.log(`✅ 组件 ${name} 已生成到: ${componentDir}`)
}

// CLI 入口
function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.log('用法: node generate-component.ts <category> <component-name> [--with-tests]')
    console.log(`可用分类: ${COMPONENT_CATEGORIES.join(', ')}`)
    process.exit(1)
  }

  const category = args[0] as ComponentCategory
  const name = args[1]
  const withTests = args.includes('--with-tests')

  if (!COMPONENT_CATEGORIES.includes(category)) {
    console.error(`错误: 无效的分类 "${category}"`)
    console.log(`可用分类: ${COMPONENT_CATEGORIES.join(', ')}`)
    process.exit(1)
  }

  generateComponent({
    name,
    category,
    withTests,
    withDocs: true,
  })
}

// 自动运行
main()

export { generateComponent }
