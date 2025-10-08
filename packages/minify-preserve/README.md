# weapp-tailwindcss Keep Names 示例

本包演示在不同构建工具中如何保留 `weappTwIgnore`、`twMerge` 等函数名，避免产物在压缩阶段被重命名导致运行时失效。

## 为什么要保留函数名

- `weappTwIgnore('foo')`、`twMerge('bar')` 等 API 会在构建产物中被插件扫描；一旦压缩器把函数名压缩为 `a()`、`b()`，这些插件就无法识别，从而失去作用。
- 大多数压缩器默认会对函数名、类名进行 `mangle`；需要显式关闭或保留。

## Vite / esbuild 配置

```ts
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Vite 处理 esbuild 压缩
    minify: 'esbuild',
    // 让 esbuild 保留函数名
    esbuild: {
      keepNames: true,
      // 如需进一步控制，可关闭 mangle
      mangleProps: false,
    },
  },
})
```

```ts
// esbuild standalone 脚本示例
import { build } from 'esbuild'

await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: true,
  keepNames: true, // 核心
})
```

## Webpack / Rspack (Terser)

```js
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  // ...
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            keep_fnames: true,
          },
          mangle: {
            keep_fnames: true,
            keep_classnames: true,
          },
        },
      }),
    ],
  },
}
```

## SWC Minify

```json
{
  "jsc": {
    "minify": {
      "compress": {
        "keep_fnames": true
      },
      "mangle": {
        "keep_fnames": true,
        "keep_classnames": true
      }
    }
  }
}
```

或在 Rspack/SWC 插件中传入上述配置。

## 常见排查清单

- ✅ 生产构建配置中确认 `keepNames / keep_fnames` 已开启。
- ✅ 如果使用官方模板/插件，确保它们没有再次覆盖压缩配置。
- ✅ 可以在产物中搜索 `weappTwIgnore`、`twMerge`，确认名字仍然存在。

> 若仍遇到被压缩问题，可把此包中的示例复制到实际项目，并结合 `pnpm why terser` 等命令排查压缩插件链路。
