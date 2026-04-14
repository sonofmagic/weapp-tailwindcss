---
'@weapp-tailwindcss/merge': minor
'@weapp-tailwindcss/merge-v3': minor
---

新增 `/slim` 和 `/lite` 子路径入口，优化小程序场景下 tailwind-merge 的包体积。

- `/slim`：内置精简版冲突分组配置，覆盖小程序常用的布局、Flexbox、Grid、间距、尺寸、排版、背景、边框、效果、变换等类别，开箱即用，体积约 20-23KB。
- `/lite`：不包含任何默认配置，仅导出 `createTailwindMerge`、`twJoin`、`mergeConfigs` 等工厂函数，用户自行提供配置，体积最小（<1KB + tailwind-merge 核心算法）。
- 现有默认入口（`.`）行为完全不变，向后兼容。
