---
title: ReactLynx / Rspeedy 配置参考
description: ReactLynx、Rspeedy 与 @weapp-tailwindcss/lynx 的 Tailwind CSS 4 配置项和 Lynx encoder 边界。
keywords:
  - ReactLynx
  - Rspeedy
  - Lynx
  - Tailwind CSS 4
  - 配置项
  - Rspack
  - encoder
  - 原生 CSS
---

# ReactLynx / Rspeedy 配置参考

本页说明 `@weapp-tailwindcss/lynx` 的构建配置。快速接入示例见 [ReactLynx / Rspeedy 指南](../quick-start/frameworks/lynx)。

## 支持基线

- `@weapp-tailwindcss/lynx` `0.3.2`
- `@lynx-js/rspeedy` `>=0.16.0`
- Tailwind CSS `4.x`
- Node.js `>=22.12.0`
- 仅支持 ReactLynx + Rspeedy 原生构建，不覆盖 Rspeedy Web、非 React Lynx 或 React Native。

## 安装

```bash npm2yarn
npm install -D @weapp-tailwindcss/lynx tailwindcss
```

项目还需要已有的 `@lynx-js/rspeedy`、`@lynx-js/react-rsbuild-plugin` 和 ReactLynx 工程依赖。

## 最小配置

```ts title="lynx.config.ts"
import { defineConfig } from '@lynx-js/rspeedy'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import { pluginLynxTailwindcss } from '@weapp-tailwindcss/lynx'

export default defineConfig({
  plugins: [pluginReactLynx(), pluginLynxTailwindcss()],
})
```

```css title="src/global.css"
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities) source(none);

@source "./**/*.{ts,tsx}";
```

插件会固定 `platform: 'lynx'`、`generator.target: 'web'`，并开启 Lynx CSS 兼容输出。ReactLynx 的原始 `className` 会保留，不会生成小程序 safe class，也不会增加运行时样式表或 JSX transform。

## `pluginLynxTailwindcss()` 配置项

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 核心选项 | `Omit<UserDefinedOptions, 'platform' | 'generator'>` | `{}` | 继承核心扫描、CSS、匹配和生命周期选项。插件会覆盖平台相关字段。 |
| `generator` | `LynxGeneratorOptions | false` | 自动配置 | 可覆盖生成器的非目标字段；`target` 始终由插件固定为 `web`。 |
| `rspack` | `PatchRspackConfigOptions` | CSS loader 补丁开启 | 控制 Rspeedy/Rspack CSS loader 注入和 Lightning CSS loader 处理。 |
| `rspack.cssImportRewriteLoader` | `boolean | object` | `true` | 插入入口重写 loader；插件会确保 `generateCss: true`。传 `false` 可关闭。 |
| `rspack.removeLightningCssLoader` | `boolean` | `false` | 是否移除内置 Lightning CSS loader。通常保持默认值。 |

以下配置会被插件接管，不能用来切换到小程序或 RN 产物：

```ts
{
  platform: 'lynx',
  rewriteCssImports: true,
  generator: {
    target: 'web',
    webCompat: true,
    styleOptions: {
      cssOptions: { platform: 'lynx' },
    },
  },
}
```

## CSS 与候选

Lynx 推荐只引入 theme 和 utilities，避免浏览器 preflight 带来的 `:root`、`:host`、`:where(...)` 等警告。任意值必须是完整静态候选：

```tsx
<view className="w-[123px] h-[45rpx] rounded-[18px] bg-[#123456]" />
```

动态场景枚举完整类名，或在 CSS 中注册：

```css
@source inline("w-[120px] w-[240px] bg-[#123456]");
```

不要拼接 `w-[${width}px]`；Tailwind 无法在构建期得到最终 token。

## Encoder 兼容边界

- `padding-inline`、`mask-type` 等当前不支持的属性可能被 encoder 删除，应改用 `pl-*` / `pr-*` 等物理方向 utility。
- 包含复杂 `:is()` / `:where()` 的 selector 可能被删除。
- 伪元素、hover、dark、data、supports、媒体查询和复杂渐变必须在 Lynx 目标运行时验收。
- “Tailwind 已生成”只表示生成器产出了规则，不代表 encoder 保留或设备运行时生效。

## 验证

```bash
pnpm --filter @weapp-tailwindcss/lynx test
pnpm --filter @weapp-tailwindcss/example-react-lynx build
pnpm e2e:lynx
pnpm e2e:lynx:android
pnpm e2e:lynx:ios
```

静态 bundle、encoder 日志和 Android/iOS 实机报告分别证明生成、保留和运行时支持，不能互相替代。
