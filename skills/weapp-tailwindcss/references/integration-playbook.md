# weapp-tailwindcss 集成清单（最小可用）

本文件用于“新项目接入”与“老项目迁移”场景，目标是快速给出可复制、可验证的最小方案。

## 1. 通用前置检查

1. Node 版本建议 `^20.19.0 || >=22.12.0`
2. 包管理器默认 `pnpm`
3. 明确 Tailwind 主版本：`v3` 或 `v4`
4. 明确目标端：仅小程序 or 小程序 + `H5/App`

## 2. 安装与补丁

```bash
pnpm add -D tailwindcss weapp-tailwindcss postcss autoprefixer
```

`package.json` 保持：

```json
{
  "scripts": {
    "postinstall": "weapp-tw patch"
  }
}
```

`pnpm@10+` 额外执行：

```bash
pnpm approve-builds weapp-tailwindcss
```

怀疑缓存或 patch 目标记录异常时：

```bash
npx weapp-tw patch --clear-cache
```

## 3. Tailwind 扫描配置基线

### Tailwind v3（`content`）

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{wxml,html,js,ts,jsx,tsx,vue}'],
}
```

### Tailwind v4（`@source`）

```css
@import 'tailwindcss';
@source "../src/**/*.{vue,wxml,js,ts,jsx,tsx}";
@source not "../dist/**";
@source not "../unpackage/**";
```

## 4. 框架最小接入骨架

### uni-app cli vue3 vite

```ts
import uni from '@dcloudio/vite-plugin-uni'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [uni(), uvtw()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
})
```

### taro webpack5

```js
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')

// config/index.[jt]s
module.exports = {
  mini: {
    webpackChain(chain) {
      chain.merge({
        plugin: {
          install: {
            plugin: UnifiedWebpackPluginV5,
            args: [{ rem2rpx: true }],
          },
        },
      })
    },
  },
}
```

### taro vite

```ts
import type { Plugin } from 'vite'
import tailwindcss from 'tailwindcss'
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'

export default {
  compiler: {
    type: 'vite',
    vitePlugins: [
      {
        name: 'postcss-config-loader-plugin',
        config(config: { css?: { postcss?: { plugins?: unknown[] } } }) {
          if (typeof config.css?.postcss === 'object') {
            config.css?.postcss.plugins?.unshift(tailwindcss())
          }
        },
      },
      uvtw({
        rem2rpx: true,
        injectAdditionalCssVarScope: true,
        disabled: process.env.TARO_ENV === 'h5',
      }),
    ] as Plugin[],
  },
}
```

### uni-app x / 原生小程序

- `uni-app x` 优先走官方 `vite + weapp-tailwindcss/vite` 方案
- 原生小程序优先引导到官方模板（`gulp` / `webpack`）后再增量改动

## 5. 多端项目策略

1. 小程序优先时再开启 `rem2rpx/px2rpx`
2. 纯 `H5` 构建禁用小程序转译插件
3. 样式入口统一管理，避免端间配置漂移

## 6. 最小验证清单

1. 启动开发构建并确认无报错
2. 验证基础工具类（如 `flex`, `px-4`）
3. 验证任意值（如 `w-[22rpx]`, `text-[length:22rpx]`）
4. 验证变体/伪类（如 `hover:`, `after:`）
5. 产物检查：确认 `weapp-tw patch` 已执行过
