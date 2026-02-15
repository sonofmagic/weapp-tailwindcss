---
"weapp-tailwindcss": patch
---

适配 `tailwindcss-patch@8.7.x` 的选项结构升级，并补齐向后兼容与稳定性修复：

- 将 patch 选项统一迁移到新版字段（如 `tailwindcss` / `apply` / `extract` / `projectRoot`），同时兼容旧字段输入，降低升级成本。
- 修复 v4 patcher 选项合并与基路径覆盖逻辑，确保 `cssEntries` 与 `tailwindcss` 相关配置在新旧格式下行为一致。
- 更新 CLI 默认 patch 选项映射，`extendLengthUnits` 等能力迁移到 `apply` 分组，避免新版 `tailwindcss-patch` 下配置失效。
- 补齐相关类型定义与测试，避免在 DTS 构建和 patch 选项推导中出现类型漂移。
