---
'@weapp-tailwindcss/postcss': minor
---

新增 CSS 处理结果 LRU 缓存，对相同内容和配置的 CSS 直接返回缓存结果，跳过 PostCSS 处理流程。

- 在 `createStyleHandler` 内部新增基于 LRU 的结果缓存（最大 256 条目），缓存键由选项指纹 + 内容探测信号 + 内容哈希组成。
- 使用 FNV-1a 哈希算法计算内容哈希，开销极低（不依赖 crypto 模块）。
- HMR 场景下相同 CSS 文件的重复处理直接命中缓存，端到端处理速度提升 18~55 倍。
