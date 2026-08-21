---
title: uni-app x 配置参考
description: uni-app x、HBuilderX 与 weapp-tailwindcss 的 Tailwind CSS 4 配置项、默认值和多端边界。
keywords:
  - uni-app x
  - HBuilderX
  - uniAppX
  - Tailwind CSS 4
  - 配置项
  - Vite
  - uvue
  - 单位转换
---

# uni-app x 配置参考

本页集中说明 `uniAppX()` preset 的配置项。接入步骤见 [uni-app x 快速开始](../quick-start/frameworks/uni-app-x)。

## 支持基线

- `weapp-tailwindcss` `5.3.3`
- Tailwind CSS `4.x`
- Node.js `^22.18.0 || >=24.11.0`
- HBuilderX `>=5.11`
- 目标：HBuilderX Web、小程序、Android、iOS 与 HarmonyOS

## 安装

```bash npm2yarn
npm install -D tailwindcss weapp-tailwindcss
```

使用 HBuilderX 管理的 uni-app x 工程时，依赖应安装在工程根目录；不要额外注册 `@tailwindcss/vite` 或 `@tailwindcss/postcss`。

## 最小配置

```ts title="vite.config.ts"
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss(uniAppX({
      base: projectRoot,
      cssEntries: [resolve(projectRoot, 'main.css')],
    })),
  ],
})
```

`cssEntries` 只告诉生成器 Tailwind CSS 入口，仍必须在 `App.uvue` 或真实应用入口中导入 `main.css`。不要在同一次构建中再注册 `@tailwindcss/postcss` 或 `@tailwindcss/vite`。

## `uniAppX()` 配置项

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `base` | `string` | 必填 | uni-app x 工程根目录。建议使用 `fileURLToPath(import.meta.url)` 推导，避免 HBuilderX 改变工作目录。 |
| `cssEntries` | `string[]` | 自动识别 | Tailwind CSS 4 入口。多入口时全部列出，建议传绝对路径。 |
| `rem2rpx` | `boolean | object` | — | 将 `rem` 转为 `rpx`，属于 preset 顶层配置。 |
| `unitsToPx` | `boolean | object` | — | 长度单位转 `px` 的配置。 |
| `unitConversion` | `object | false` | — | 按平台或统一规则转换 CSS 单位。 |
| `generator` | `object | false` | 自动推断 | Tailwind 生成器配置。Web/H5 会自动使用 `target: 'web'` 与 Web 兼容处理。 |
| `uniAppX` | `boolean | object` | 原生 App 自动启用 | 控制 uvue/App 适配、局部样式和不兼容 utility 处理。 |
| `componentLocalStyles` | `boolean | object` | `true` | `uniAppX.componentLocalStyles` 的快捷入口。 |
| `uvueUnsupported` | `'error' | 'warn' | 'silent'` | `'warn'` | uvue 不支持的 utility 如何处理。 |
| `customAttributes` | `ICustomAttributes` | — | 为 `class` 之外的模板属性增加类名转译。 |
| `resolve` | `PackageResolvingOptions` | 工程 `node_modules` | 自定义 Tailwind 包解析路径。 |
| `rawOptions` | `UserDefinedOptions` | — | 透传未被 preset 快捷入口覆盖的核心配置。 |

`rem2rpx`、`unitsToPx` 和 `unitConversion` 不应放在 `cssOptions` 下；它们是 `uniAppX()` 的顶层选项。

## 局部样式与 uvue 兼容

```ts
uniAppX({
  base: projectRoot,
  cssEntries: [resolve(projectRoot, 'main.css')],
  componentLocalStyles: {
    enabled: true,
    onlyWhenStyleIsolationVersion2: false,
    componentMatcher: id => /(?:^|\/)layouts\/.+\.uvue$/.test(id),
    pageMatcher: id => /(?:^|\/)pages\/.+\.uvue$/.test(id),
  },
  uvueUnsupported: 'warn',
})
```

- `componentMatcher` 和 `pageMatcher` 收到已移除 query/hash、统一为正斜杠的模块路径。
- 传入 matcher 会覆盖对应的默认 `components` 或 `pages` 目录规则；需要保留默认目录时在回调中一并匹配。
- `onlyWhenStyleIsolationVersion2` 默认是 `true`，只有 `manifest.json` 使用样式隔离版本 2 时才启用组件局部样式。
- `uvueUnsupported: 'error'` 适合在 CI 强制发现不兼容 utility；`'silent'` 只建议用于已知且明确处理的场景。

## Tailwind CSS 入口

```css title="main.css"
@import "tailwindcss" source(none);

@source "./App.uvue";
@source "./pages/**/*.{uvue,uts}";
@source "./components/**/*.{uvue,uts}";
@source not "./uni_modules/**/*";
@source not "./unpackage/**/*";
```

在 `App.uvue` 的全局样式中实际导入：

```html
<style>
@import './main.css';
</style>
```

## 多端边界

- uni-app x 原生 App 不需要配置 `generator.target: 'app'`；原生目标继续由 `uniAppX`、平台环境和单位转换处理。
- Web/H5 不要手动关闭 `uniAppX`，否则 `.uvue` 模板中的任意值和暗色工具类可能无法按安全选择器处理。
- `cssEntries` 不会替代构建图导入；缺少真实 `@import` 时会出现“已生成但页面无样式”。
- `unpackage`、`dist` 和 `uni_modules` 不应无差别加入 `@source`。
- `gap`、`space-x-*` 和 `space-y-*` 在原生 uvue 端不能作为通用布局方案，应按目标端限制改用子项间距。

## 验证

```bash
pnpm e2e:hbuilderx:local:web
pnpm e2e:hbuilderx:local:mp
pnpm e2e:hbuilderx:local:android
pnpm e2e:hbuilderx:local:ios
pnpm e2e:hbuilderx:local:harmony
```

HBuilderX、模拟器和设备链路只在本地运行。验收时分别检查真实平台目录、CSS 后缀和 Web/App 的运行时效果，不要只用 H5 构建成功作为原生结论。
