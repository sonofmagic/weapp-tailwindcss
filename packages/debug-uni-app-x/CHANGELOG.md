# @weapp-tailwindcss/debug-uni-app-x

## 0.0.4-alpha.0

### Patch Changes

- 🐛 **增强 `debug-uni-app-x` 的调试索引能力，并修复 `uni-app x` 场景下带查询参数模块的调试文件覆盖问题。** [`e415a93`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e415a933b3abaf1ff157553f55fabec3ea22eb07) by @sonofmagic
  - 保留模块 `id` 中的查询参数信息，避免 `App.uvue?vue&type=script...` 与 `App.uvue?vue&type=style...` 写入同一路径后互相覆盖。
  - 为每个阶段目录与 bundle 目录生成 `_meta.json`，记录调试文件相对路径、原始模块 `id`、阶段与类型。
  - 在调试输出根目录新增 `_manifest.json`，聚合 `pre/normal/post/bundle-*` 全部索引，方便后续工具消费与排查。
  - `enabled` 改为默认启用，并保留 `stages/include/exclude/skipPlatforms/onError` 配置。
  - 补充完整的中文 JSDoc 与 `tsd` 类型测试，固定公开导出类型契约。
  - 继续保证写盘失败不会中断构建。

## 0.0.3

### Patch Changes

- [`367904b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/367904baa9985509b830ac2e7e2db12841f6dd37) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 `HBuilderX` 构建安卓时插件调试输出包含空字节路径导致写入失败的问题。

## 0.0.2

### Patch Changes

- [`4ffb90b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4ffb90bc754459d93929d2de3a843d46edc48f53) Thanks [@sonofmagic](https://github.com/sonofmagic)! - <br/>

  ## Features

  feat(postcss): 添加 `postcss-value-parser` 作为依赖，添加新的 `postcss` 插件 `postcss-remove-include-custom-properties`

  feat(weapp-tailwindcss): 计算模式增强，允许只限定某些特殊的 `custom-properties` 被计算，这样只在遇到不兼容的情况下，才需要开启这个配置

  比如 cssCalc: 设置为 `['--spacing']`, 那么就会把 `tailwindcss` 中的 `--spacing` 值进行计算，其他值则不进行计算

  ## Chore

  chore(deps): upgrade

## 0.0.1

### Patch Changes

- [`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 对 postcss-html-transform 进行二次封装

- [`16eb82b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/16eb82b988d039da8acba7b7df766d01b056e1d6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change default targetDir

## 0.0.1-alpha.0

### Patch Changes

- [`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 对 postcss-html-transform 进行二次封装

- [`16eb82b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/16eb82b988d039da8acba7b7df766d01b056e1d6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change default targetDir
