---
'weapp-tailwindcss': patch
---

feat(cli): `weapp-tw patch` 默认不再清理 `tailwindcss-patch` 缓存目录，新增 `--clear-cache` 选项用于按需清理

变更说明
- 以前：执行 `weapp-tw patch` 会在补丁前主动删除 `tailwindcss-patch` 的缓存目录（通常位于 `node_modules/.cache/tailwindcss-patch`），以避免缓存导致的补丁失效或读取旧产物。
- 现在：默认不清理缓存，更加保守、稳定，减少不必要的 IO 和潜在的 CI 侧效应；如需要强制刷新缓存，请显式传入 `--clear-cache`。

如何迁移
- 原有脚本不需要修改即可继续使用；仅当你希望“每次 patch 都强制清缓存”时，将脚本由：
  - `weapp-tw patch`
  替换为：
  - `weapp-tw patch --clear-cache`

建议
- 推荐只在遇到疑似缓存导致的“补丁未生效/版本不一致”问题时，手动或临时在 CI 中加上 `--clear-cache`，其余情况下维持默认行为即可。***
