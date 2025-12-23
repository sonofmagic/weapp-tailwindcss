# Storybook 集成文档

## 概述

已成功在 `packages-runtime/ui` 中集成 Storybook 8.x，用于展示和测试 UI 组件库的所有组件。

## 快速开始

### 启动 Storybook 开发服务器

```bash
cd packages-runtime/ui
pnpm storybook
```

访问: http://localhost:6006

### 构建静态站点

```bash
pnpm storybook:build
```

构建产物位于 `storybook-static/` 目录。

## 已实现的 Stories

### Core 核心组件 (6个)
- ✅ Button - 按钮组件（8+ Stories）
- ✅ Input - 输入框组件
- ✅ Textarea - 多行文本框
- ✅ Checkbox - 复选框
- ✅ Radio - 单选框
- ✅ Switch - 开关

### Data Display 数据展示 (4个)
- ✅ Badge - 徽章
- ✅ Card - 卡片
- ✅ Tag - 标签
- ✅ Avatar - 头像

### Feedback 反馈组件 (2个)
- ✅ Toast - 轻提示
- ✅ Loading - 加载中

### Layout 布局组件 (1个)
- ✅ Divider - 分割线

### Navigation 导航组件 (1个)
- ✅ Tabs - 标签页

## Story 覆盖内容

每个组件的 Story 包含：

1. **Default** - 默认用法展示
2. **Variants** - 所有变体（tone、appearance、size等）
3. **States** - 所有状态（disabled、loading、error等）
4. **Interactive** - 交互示例（如适用）
5. **Playground** - 自由参数组合测试

## 配置文件

- `.storybook/main.ts` - Storybook 主配置
- `.storybook/preview.tsx` - 全局预览配置
- `stories/Introduction.mdx` - 首页文档
- `stories/*/*.stories.tsx` - 组件 Story 文件

## 技术栈

- **Storybook**: 8.6.15
- **Framework**: @storybook/react-vite
- **Addons**: 
  - essentials (Controls, Actions, Docs等)
  - interactions (交互测试)
  - a11y (无障碍检查)

## 样式集成

样式文件从 `dist/index.css` 导入，确保与构建产物保持一致。

## 扩展 Stories

参考 `stories/core/Button.stories.tsx` 作为模板，为新组件创建 Story：

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

const YourComponent: React.FC = () => <div>Your Component</div>

const meta: Meta<typeof YourComponent> = {
  title: 'Category/ComponentName',
  component: YourComponent,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof YourComponent>

export const Default: Story = {}
```

## 部署

构建后的静态站点可部署到：
- Chromatic
- Netlify
- Vercel
- GitHub Pages

## 注意事项

1. 运行 Storybook 前需先构建 UI 包（`pnpm build`）以生成样式文件
2. Story 中展示的是 Web 版本的组件，实际项目使用 Taro/uni-app 版本
3. 部分组件可能需要补充更多 Story 实例以覆盖所有用法
