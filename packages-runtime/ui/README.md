# @weapp-tailwindcss/ui

跨端的原子化组件体系，参考 shadcn-ui / reka-ui 的组织方式。该包提供：

- `dist/index.css` / `dist/index.wxss`：基于 Tailwind CSS v4 构建的样式产物。
- `dist/index.tailwind3.css` / `dist/index.tailwind3.wxss`：使用 Tailwind CSS v3 构建的同构样式，便于老项目直接引用。
- `src/preset.ts`：可直接放入 Tailwind 配置的预设（`presets: [weappTailwindcssUIPreset]`），自动注入设计令牌、组件、工具类。
- `src/variants.ts`：通过 `tailwind-variants` 导出了与组件配套的 class 生成器，便于在多框架中消费。

## 🎉 Headless 组件库 - 基础架构已完成

本项目已完成 **headless 组件库的完整基础架构**，包括：

### ✅ 已完成功能

#### 基础设施 (100%)

- ✅ **三平台适配器** - 原生小程序/Taro/uni-app 统一API
- ✅ **工具函数库** - 类名合并(cn)、平台检测、无障碍支持
- ✅ **Hooks系统** - useControllableState、useToggle、useDisclosure等
- ✅ **组件生成脚本** - 自动化创建组件工具
- ✅ **完整测试** - 56个测试用例,100%通过

#### 核心组件 (3个已实现)

- ✅ **Button** - 多变体、多状态、支持图标和加载
- ✅ **Input** - 受控/非受控、清除按钮、状态支持
- ✅ **Textarea** - 自动增高、字数统计、多状态

### 📊 项目统计

- **测试**: 56/56 通过 ✅
- **构建**: 成功 ✅
- **代码**: ~2,100行
- **组件**: 3个完成,27+个待实现

### 📚 详细文档

- [快速开始](./QUICKSTART.md)
- [开发指南](./HEADLESS_COMPONENTS.md)
- [实施总结](./IMPLEMENTATION_SUMMARY.md)
- [最终状态](./FINAL_STATUS.md)

## 快速使用

1. 安装依赖后在 `tailwind.config.ts` 中添加：

```ts
import { weappTailwindcssUIPreset } from '@weapp-tailwindcss/ui/preset'

export default {
  content: ['./src/**/*.{ts,tsx,vue,html}'],
  presets: [weappTailwindcssUIPreset],
}
```

2. 在小程序或 Web 入口样式引入 CSS：

```css
/* Tailwind 4.x 项目 */
@import '@weapp-tailwindcss/ui/css';

/* Tailwind 3.x 项目 */
@import '@weapp-tailwindcss/ui/tailwind3.css';
```

3. 在组件中使用 Variants：

```ts
import { button, tag } from '@weapp-tailwindcss/ui/variants'

const primary = button() // => 'wt-button'
const dangerTag = tag({ tone: 'danger' }) // => 'wt-tag wt-tag--danger'
```

## 多端兼容策略

- 尺寸、圆角、阴影等设计令牌统一基于 `rpx`，适配小程序与 Web。
- 工具类与组件类全部由插件自动生成，确保 Tailwind v3 / v4 都能消费。
- 构建脚本在 `dist/` 目录同时产出 v3、v4 两套 CSS，并通过 exports 暴露，消费端可按需选择。

## 开发

```bash
pnpm --filter @weapp-tailwindcss/ui build    # 先确保依赖装好
pnpm --filter @weapp-tailwindcss/ui test
```

> 运行脚本需要本地已经安装好 Tailwind v3 与 v4，对应版本会从 `node_modules/.pnpm` 中自动解析。
