# weapp-style-injector

## 0.0.3-next.0

### Patch Changes

- 🐛 **修复 uni-app Vite 预设在 `generateBundle` 中直接写入 bundle 资产的问题，改为通过 `emitFile` 生成分包样式入口，以兼容 Vite 8/Rolldown。** [#879](https://github.com/sonofmagic/weapp-tailwindcss/pull/879) by @github-actions

## 0.0.2

### Patch Changes

- 📦 **Dependencies** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16)
  → `@weapp-tailwindcss/shared@1.1.3`

## 0.0.2-alpha.1

### Patch Changes

- 📦 **Dependencies** [`cbead4c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/cbead4ced4b7cba116488d745d47bf826bc83859)
  → `@weapp-tailwindcss/shared@1.1.3-alpha.1`

## 0.0.2-alpha.0

### Patch Changes

- 📦 **Dependencies** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16)
  → `@weapp-tailwindcss/shared@1.1.3-alpha.0`

## 0.0.1

### Patch Changes

- 🐛 **提取常用字符串/数组工具到 shared，并在相关包中复用。** [`ccc0a33`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ccc0a330b5cd455665a0f2f2c3e8895b27a04b52) by @sonofmagic
- 📦 **Dependencies** [`ccc0a33`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ccc0a330b5cd455665a0f2f2c3e8895b27a04b52)
  → `@weapp-tailwindcss/shared@1.1.2`
