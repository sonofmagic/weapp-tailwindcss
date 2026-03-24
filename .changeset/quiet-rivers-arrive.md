---
'@weapp-tailwindcss/debug-uni-app-x': patch
---

增强 `debug-uni-app-x` 的调试索引能力，并修复 `uni-app x` 场景下带查询参数模块的调试文件覆盖问题。

- 保留模块 `id` 中的查询参数信息，避免 `App.uvue?vue&type=script...` 与 `App.uvue?vue&type=style...` 写入同一路径后互相覆盖。
- 为每个阶段目录与 bundle 目录生成 `_meta.json`，记录调试文件相对路径、原始模块 `id`、阶段与类型。
- 在调试输出根目录新增 `_manifest.json`，聚合 `pre/normal/post/bundle-*` 全部索引，方便后续工具消费与排查。
- `enabled` 改为默认启用，并保留 `stages/include/exclude/skipPlatforms/onError` 配置。
- 补充完整的中文 JSDoc 与 `tsd` 类型测试，固定公开导出类型契约。
- 继续保证写盘失败不会中断构建。
