---
'weapp-tailwindcss': minor
---

优化 JS Handler 结果缓存策略，提升 HMR 和 Bundler 场景下的缓存命中率。

- 将缓存淘汰策略从 FIFO 替换为 LRU（复用已有 `lru-cache` 依赖），缓存上限从 256 提升到 512，确保高频访问的文件不被低频文件驱逐。
- 使用内容哈希（MD5）替代原始源码字符串作为缓存键，移除 512 字符的源码长度限制，大文件也能被缓存。
- 移除 Bundler 路径（含 `filename`/`moduleGraph`）的缓存排除逻辑，Webpack/Vite/Gulp 调用也能命中结果缓存。
- 新增选项指纹（Options Fingerprint）机制，将影响转译结果的 16 个字段序列化为唯一标识符，确保不同配置下的缓存正确隔离。
- 简化选项解析缓存从 4 层 WeakMap 嵌套到 2 层结构，保持引用稳定性。
- 含 `linked`（跨文件分析）或 `error`（解析失败）的结果不缓存，确保数据一致性。
