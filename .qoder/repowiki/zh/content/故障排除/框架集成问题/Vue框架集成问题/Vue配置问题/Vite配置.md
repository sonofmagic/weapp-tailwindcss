# Vite配置

<cite>
**本文档中引用的文件**  
- [vite.config.ts](file://apps/vite-native-ts/vite.config.ts)
- [vite.config.ts](file://apps/vite-native-skyline/vite.config.ts)
- [vite.config.ts](file://demo/uni-app-vue3-vite/vite.config.ts)
- [vite.config.ts](file://apps/vite-native/vite.config.ts)
- [vite.config.ts](file://apps/vue-app/vite.config.ts)
- [vite.config.ts](file://apps/react-app/vite.config.ts)
- [vite.config.mts](file://apps/weapp-wechat-zhihu/vite.config.mts)
- [vite.ts](file://packages/weapp-tailwindcss/src/vite.ts)
- [index.ts](file://packages/weapp-tailwindcss/src/index.ts)
- [typedoc.export.ts](file://packages/weapp-tailwindcss/src/typedoc.export.ts)
- [bundlers/vite/index.ts](file://packages/weapp-tailwindcss/src/bundlers/vite/index.ts)
- [package.json](file://packages/weapp-tailwindcss/package.json)
</cite>

## 目录
1. [简介](#简介)
2. [核心插件集成](#核心插件集成)
3. [配置选项详解](#配置选项详解)
4. [完整配置示例](#完整配置示例)
5. [CSS预处理器兼容性](#css预处理器兼容性)
6. [PostCSS插件链配置](#postcss插件链配置)
7. [配置验证与错误排查](#配置验证与错误排查)
8. [性能优化建议](#性能优化建议)

## 简介

`weapp-tailwindcss` 是一个为小程序开发提供 Tailwind CSS 原子化样式支持的全面解决方案。该工具通过 Vite 构建环境下的插件系统，将 Tailwind CSS 的强大功能无缝集成到小程序开发中，解决了小程序平台在选择器支持、字符集限制和运行环境分离等方面的限制。

本指南详细说明如何在 Vite 构建环境下正确配置 `weapp-tailwindcss` 插件，涵盖从基础集成到高级配置的各个方面，帮助开发者充分利用 Tailwind CSS 的优势，同时确保与小程序环境的兼容性。

**Section sources**
- [README.md](file://packages/weapp-tailwindcss/README.md#L1-L101)
- [package.json](file://packages/weapp-tailwindcss/package.json#L1-L215)

## 核心插件集成

在 Vite 构建环境中集成 `weapp-tailwindcss` 插件需要正确导入和初始化配置。插件通过 `UnifiedViteWeappTailwindcssPlugin` 函数提供，该函数接受一个配置对象作为参数。

### 插件导入

首先，需要从 `weapp-tailwindcss/vite` 模块中导入 `UnifiedViteWeappTailwindcssPlugin`：

```typescript
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
```

### 初始化配置

插件的初始化配置通过 `defineConfig` 函数完成，将 `UnifiedViteWeappTailwindcssPlugin` 添加到 Vite 插件数组中：

```typescript
import { defineConfig } from 'vite'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [
    UnifiedViteWeappTailwindcssPlugin({
      rem2rpx: true,
    }),
  ],
})
```

### 执行顺序

插件的执行顺序在 Vite 配置中至关重要。`weapp-tailwindcss` 插件应该在其他 CSS 处理插件之后执行，以确保 Tailwind CSS 的样式能够正确处理和转换。通常，插件的执行顺序如下：

1. CSS 预处理器插件（如 Sass、Less）
2. PostCSS 插件
3. `weapp-tailwindcss` 插件

**Section sources**
- [vite.config.ts](file://apps/vite-native-ts/vite.config.ts#L1-L42)
- [vite.config.ts](file://apps/vite-native-skyline/vite.config.ts#L1-L23)
- [vite.ts](file://packages/weapp-tailwindcss/src/vite.ts#L1-L3)

## 配置选项详解

`weapp-tailwindcss` 插件提供了丰富的配置选项，以满足不同项目的需求。以下是一些关键配置选项的详细说明：

### projectConfig

`projectConfig` 选项用于指定小程序项目的配置文件路径。通常，这包括 `project.config.json` 文件的路径，该文件定义了小程序的基本信息和配置。

### appConfig

`appConfig` 选项用于指定小程序应用的配置。这包括应用的全局配置，如页面路径、窗口样式等。

### cssLoader

`cssLoader` 选项用于配置 CSS 加载器的行为。这包括 CSS 预处理器的配置、PostCSS 插件的配置等。

### rem2rpx

`rem2rpx` 选项用于启用 rem 到 rpx 的转换。这在小程序开发中非常有用，因为 rpx 是小程序的推荐单位。

```typescript
UnifiedViteWeappTailwindcssPlugin({
  rem2rpx: true,
})
```

### px2rpx

`px2rpx` 选项用于启用 px 到 rpx 的转换。这可以确保在不同设备上的一致性。

```typescript
UnifiedViteWeappTailwindcssPlugin({
  px2rpx: true,
})
```

### disabled

`disabled` 选项用于禁用插件。这在多平台构建场景下非常有用，例如在 H5 或 App 环境下禁用插件。

```typescript
const isH5 = process.env.UNI_PLATFORM === 'h5'
const isApp = process.env.UNI_PLATFORM === 'app-plus'
const WeappTailwindcssDisabled = isH5 || isApp

UnifiedViteWeappTailwindcssPlugin({
  disabled: WeappTailwindcssDisabled,
})
```

**Section sources**
- [typedoc.export.ts](file://packages/weapp-tailwindcss/src/typedoc.export.ts#L1-L560)
- [bundlers/vite/index.ts](file://packages/weapp-tailwindcss/src/bundlers/vite/index.ts#L1-L479)

## 完整配置示例

以下是一个完整的 `vite.config.ts` 配置示例，涵盖了开发环境和生产环境的不同配置需求：

```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
import { StyleInjector } from 'weapp-style-injector/vite/uni-app'

const isH5 = process.env.UNI_PLATFORM === 'h5'
const isApp = process.env.UNI_PLATFORM === 'app-plus'
const WeappTailwindcssDisabled = isH5 || isApp

const vitePlugins = [uni()]
const postcssPlugins = [require('autoprefixer')(), require('tailwindcss')()]

if (!WeappTailwindcssDisabled) {
  postcssPlugins.push(require('weapp-tailwindcss/css-macro/postcss'))
}

export default defineConfig(async () => {
  return {
    plugins: [
      uni(),
      UnifiedViteWeappTailwindcssPlugin({
        px2rpx: true,
        wxsMatcher() {
          return false
        },
        inlineWxs: true,
        onStart() {
          console.log('开始处理')
        },
        onEnd() {
          console.log('处理结束')
        },
        rem2rpx: true,
        disabled: WeappTailwindcssDisabled,
      }),
    ],
    resolve: {
      alias: {
        path: 'path-browserify',
        'entities/decode': 'entities/lib/decode.js',
        url: 'node:url',
      },
    },
    optimizeDeps: {
      include: ['path-browserify', 'entities/lib/decode.js'],
    },
    css: {
      postcss: {
        plugins: postcssPlugins,
      },
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api', 'import'],
        },
      },
    },
    build: {
      minify: false,
      sourcemap: true,
    },
  }
})
```

**Section sources**
- [vite.config.ts](file://demo/uni-app-vue3-vite/vite.config.ts#L1-L118)
- [vite.config.ts](file://apps/vite-native/vite.config.ts#L1-L19)

## CSS预处理器兼容性

在 Vite 环境下，CSS 预处理器（如 Sass、Less）与 `weapp-tailwindcss` 的兼容性需要特别注意。以下是一些常见的配置方法：

### Sass/SCSS

对于 Sass/SCSS 预处理器，需要在 `vite.config.ts` 中配置 `preprocessorOptions`：

```typescript
css: {
  preprocessorOptions: {
    scss: {
      silenceDeprecations: ['legacy-js-api'],
    },
  },
}
```

### Less

对于 Less 预处理器，同样需要在 `vite.config.ts` 中配置 `preprocessorOptions`：

```typescript
css: {
  preprocessorOptions: {
    less: {
      javascriptEnabled: true,
    },
  },
}
```

### PostCSS

PostCSS 插件链的配置需要确保 `weapp-tailwindcss` 插件在正确的位置执行。通常，PostCSS 插件的配置如下：

```typescript
css: {
  postcss: {
    plugins: [
      require('tailwindcss')(),
      require('autoprefixer')(),
      require('weapp-tailwindcss/css-macro/postcss'),
    ],
  },
}
```

**Section sources**
- [vite.config.ts](file://apps/vite-native-ts/vite.config.ts#L1-L42)
- [vite.config.ts](file://apps/vite-native-skyline/vite.config.ts#L1-L23)

## PostCSS插件链配置

PostCSS 插件链的配置是确保 `weapp-tailwindcss` 正确工作的关键。以下是一些常见的 PostCSS 插件配置：

### autoprefixer

`autoprefixer` 插件用于自动添加浏览器前缀：

```typescript
require('autoprefixer')()
```

### tailwindcss

`tailwindcss` 插件用于处理 Tailwind CSS 的样式：

```typescript
require('tailwindcss')()
```

### weapp-tailwindcss/css-macro/postcss

`weapp-tailwindcss/css-macro/postcss` 插件用于处理小程序特有的 CSS 宏：

```typescript
require('weapp-tailwindcss/css-macro/postcss')
```

### 完整的 PostCSS 配置

```typescript
const postcssPlugins = [require('autoprefixer')(), require('tailwindcss')()]

if (!WeappTailwindcssDisabled) {
  postcssPlugins.push(require('weapp-tailwindcss/css-macro/postcss'))
}

css: {
  postcss: {
    plugins: postcssPlugins,
  },
}
```

**Section sources**
- [postcss.config.cjs](file://tailwindcss-weapp/postcss.config.cjs#L1-L8)
- [postcss.config.ts](file://templates/uni-app-vite-vue3-tailwind-vscode-template/postcss.config.ts#L1-L13)

## 配置验证与错误排查

### 配置验证

配置验证是确保 `weapp-tailwindcss` 插件正确工作的第一步。可以通过以下步骤进行验证：

1. 确保 `vite.config.ts` 中的插件配置正确。
2. 检查 `package.json` 中的依赖项是否正确安装。
3. 运行 `vite` 命令，观察控制台输出，确保没有错误信息。

### 常见错误排查

#### 插件未生效

如果插件未生效，可能是由于插件执行顺序不正确。确保 `weapp-tailwindcss` 插件在其他 CSS 处理插件之后执行。

#### 样式未转换

如果样式未转换，可能是由于 `cssMatcher` 配置不正确。确保 `cssMatcher` 正确匹配需要处理的 CSS 文件。

#### 构建失败

如果构建失败，可能是由于依赖项未正确安装。检查 `package.json` 中的依赖项，确保所有依赖项都已正确安装。

**Section sources**
- [vite.config.ts](file://demo/uni-app-vue3-vite/vite.config.ts#L1-L118)
- [issue470.vue](file://demo/uni-app-vue3-vite/src/pages/issue/issue470.vue#L1-L11)

## 性能优化建议

### 缓存策略

启用缓存策略可以显著提高构建性能。`weapp-tailwindcss` 插件支持缓存，可以通过 `cache` 选项启用：

```typescript
UnifiedViteWeappTailwindcssPlugin({
  cache: true,
})
```

### 按需加载

按需加载可以减少初始加载时间。通过 `content` 配置，确保只包含需要的 Tailwind CSS 类：

```typescript
module.exports = {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
}
```

### 代码分割

代码分割可以进一步优化性能。通过 Vite 的代码分割功能，将不同的模块分割成独立的文件：

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'weapp-tailwindcss'],
      },
    },
  },
}
```

**Section sources**
- [vite.config.ts](file://apps/vite-native-ts/vite.config.ts#L1-L42)
- [vite.config.ts](file://apps/vite-native-skyline/vite.config.ts#L1-L23)