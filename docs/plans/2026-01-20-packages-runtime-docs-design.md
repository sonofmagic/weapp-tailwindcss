# packages-runtime 文档重构设计

## 目标
- 在 docs 侧新增 `community/packages-runtime` 作为运行时包主线入口。
- 为 `packages-runtime` 6 个包提供详细中文用法与示例。
- 提供跨端（小程序 + Web）示例，覆盖 uni-app 与 Taro。
- 旧 `community/merge` 文档保留，但改为引导到新章节。

## 信息架构
- 新增目录：`website/docs/community/packages-runtime/`
- 新增页面：
  - `index.mdx`（矩阵 + 版本选择 + 多端心智模型）
  - `merge.mdx`、`merge-v3.mdx`
  - `cva.mdx`
  - `variants.mdx`
  - `tailwind-variant-v3.mdx`
  - `variants-v3.mdx`
  - `multi-platform-demos.mdx`
- 侧边栏：在 `community` 下新增 `packages-runtime` 类目。

## 页面模板（每包统一）
- 定位与适用版本
- 安装方式
- 核心 API / 关键点
- 小程序用法
- Web 用法（`create({ escape:false, unescape:false })`）
- Demo 示例
- 常见注意事项

## 跨端 Demo 设计
- uni-app + Web：Vue SFC + TS，条件编译切换 `tv` 运行时。
- Taro + Web：React + TSX，通过 `process.env.TARO_ENV` 切换。
- 统一展示共享 `variants` 配置与两端渲染入口。

## 旧文档整合策略
- `community/merge/overview.mdx`：新增指向新章节的提示与矩阵补充。
- `community/merge/runtime-api.mdx`：保留核心概念，补充新章节链接。
- `community/merge/cva-and-variants.mdx`：保留入口说明，新增迁移提示。
- `community/merge/integration.mdx`：增加指向新章节的提示。

## 风险与注意
- Tailwind v3/v4 的运行时包需要与编译期版本一致。
- 若封装别名函数，需更新 `ignoreCallExpressionIdentifiers`。
- Web 侧需关闭 escape/unescape，避免类名无法匹配。
