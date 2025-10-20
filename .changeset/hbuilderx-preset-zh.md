---
'weapp-tailwindcss': patch
---

- 新增 `hbuilderx` 预设，默认补齐 `tailwindcss` 与 `tailwindcss-patch` 的 `basedir/cwd` 配置，简化 HBuilderX 场景下的使用。
- 改进基础目录解析逻辑，优先读取 `UNI_INPUT_DIR` 等环境变量并回写 `tailwindcssBasedir`，避免 HBuilderX 修改 `process.cwd()` 导致的路径错误。
