# @weapp-tailwindcss/lynx

简体中文 | [English](./README_en.md)

ReactLynx + Rspeedy 的 Tailwind CSS v4 集成。它通过 Rspeedy 的 Rspack 生命周期调用 `weapp-tailwindcss` 生成 Lynx 可消费的普通 CSS，保留 ReactLynx 原生 `className`，不引入运行时样式表或 JSX 转换。

## 安装

```bash
pnpm add @weapp-tailwindcss/lynx tailwindcss
```

## 配置

```ts
// lynx.config.ts
import { defineConfig } from '@lynx-js/rspeedy'
import { pluginLynxTailwindcss } from '@weapp-tailwindcss/lynx'

export default defineConfig({
  plugins: [pluginLynxTailwindcss()],
})
```

在应用 CSS 入口中引入 Tailwind v4，并用 `@source` 指向实际源码。Lynx 不需要浏览器 preflight，推荐只引入 theme 与 utilities，避免 Rspeedy 输出大量浏览器选择器兼容警告。以下示例假设 CSS 入口是 `src/global.css`，`@source` 路径相对该文件解析：

```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities) source(none);

@source "./**/*.{ts,tsx}";
```

`pluginLynxTailwindcss` 固定使用 `platform: 'lynx'`、`generator.target: 'web'` 与 Lynx 原生兼容输出。Tailwind v4 theme 变量会在构建期静态化，确保 `bg-sky-500`、`p-6`、`text-lg` 等标准 utility 能进入 Lynx 原生样式表；应用自行定义的动态 CSS 变量保持不变。

首版仅支持 ReactLynx + Rspeedy 与 Tailwind CSS v4；不覆盖 Rspeedy Web 输出、非 React Lynx 框架、Tailwind CSS v3 或 React Native 风格的运行时样式映射。

## 任意值

Lynx 集成保留 ReactLynx 原生 `className`，不会像小程序目标一样转义类名。Tailwind CSS v4 可以正常扫描并生成任意值，但最终是否生效还取决于 Lynx 原生 CSS parser 是否支持对应的属性和选择器。

任意值必须以完整静态字符串出现在 `@source` 覆盖的文件中：

```tsx
<view className="w-[123px] h-[45rpx] rounded-[18px] bg-[#123456] p-[13px]" />
```

不要在运行时拼接任意值：

```tsx
// Tailwind 无法在构建期枚举最终类名。
<view className={`w-[${width}px]`} />
```

动态场景应枚举完整类名，或使用 `@source inline(...)` 显式注册候选：

```css
@source inline("w-[120px] w-[240px] bg-[#123456]");
```

### 兼容性矩阵

| 类型 | 示例 | 当前状态 |
| --- | --- | --- |
| 长度与单位 | `w-[123px]`、`h-[45rpx]`、`p-[13px]` | 已验证生成并进入 Lynx bundle |
| 计算值 | `min-w-[calc(100%-2rem)]` | 已验证 |
| 颜色 | `bg-[#123456]`、`bg-[rgb(12,34,56)]`、`text-[color:#c31d6b]` | 已验证 |
| 渐变 | `bg-[radial-gradient(circle_at_20%_20%,#fff,#000)]` | 已验证生成；复杂效果仍建议做真机视觉验收 |
| 明确类型 | `text-[length:23px]`、`text-[color:#c31d6b]` | 已验证，二义性值推荐显式写 `length:` / `color:` |
| CSS 变量 | `[--panel-height:240px]`、`max-h-[var(--panel-height)]`、`bg-(--brand-color)` | 已验证；应用自定义变量不会被静态化 |
| 重要值 | `!bg-[gray]` | Tailwind 可生成，需结合 Lynx 目标版本验收优先级行为 |
| 布局值 | `aspect-[4/3]`、`grid-cols-[200px_minmax(0,1fr)_80px]` | 已验证生成并进入 bundle |
| 逻辑属性 | `px-[7.5px]` | 不推荐；Tailwind 生成 `padding-inline`，当前 Lynx encoder 会删除该属性 |
| 任意 CSS 属性 | `[mask-type:luminance]` | 不支持；当前 Lynx encoder 会删除 `mask-type` |
| 复杂变体 | `group-[.is-active]:block` | 不支持；生成的 `:is()` / `:where()` 选择器会被 Lynx encoder 删除 |
| 属性/伪元素/媒体变体 | `data-[state=open]:*`、`before:*`、`hover:*`、`dark:*`、`supports-*` | Tailwind 可生成 CSS，但运行时行为由 Lynx 决定，必须做目标端验收 |

`px-[7.5px]` 需要兼容当前 Lynx 时，改用物理方向属性：

```tsx
<view className="pl-[7.5px] pr-[7.5px]" />
```

### 构建警告

使用完整的 `@import "tailwindcss"` 会包含浏览器 preflight。Rspeedy 可能报告并移除 `:root`、`:host`、`:where(...)`、`::file-selector-button` 等 Lynx 不支持的浏览器选择器，以及 `padding-inline`、`mask-type`、`text-decoration-line` 等不支持的属性。

这些警告需要分两类处理：

- preflight 的浏览器专用规则：改用上面的 theme + utilities 入口即可减少噪声。
- 业务 utility 对应的 selector/property：表示该样式不会进入 Lynx 原生样式表，应调整 Tailwind 写法，不能只忽略警告。

## 验证

仓库中的任意值单测与真实 Rspeedy bundle 回归可以通过以下命令运行：

```bash
pnpm --filter @weapp-tailwindcss/lynx test
pnpm e2e:lynx
```

测试覆盖长度、`rpx`、`calc()`、颜色、渐变、CSS 变量、重要值、任意属性及常见变体。静态 E2E 只证明 CSS 已生成并进入 bundle；伪元素、交互状态、媒体查询和复杂视觉效果仍应在实际 Lynx 目标端验收。

## iOS 视觉验收

仓库开发者可在已安装 LynxExplorer 的 iOS Simulator 中运行：

```bash
pnpm e2e:lynx:ios
```

命令会启动 Rspeedy、解析实际 bundle URL、将 URL 写入 Simulator pasteboard，并在截图后按生成的 `bg-sky-500` 颜色做像素断言。当前 LynxExplorer iOS 版本没有可用的 deep-link 回调，因此需在提示出现后手动将 URL 粘贴到首页、点击 Go，再回到终端按 Enter；其余截图、裁剪、像素分析和 dev server 清理均自动完成。
