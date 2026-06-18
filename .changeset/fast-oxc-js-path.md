---
"weapp-tailwindcss": patch
---

新增实验性 OXC JS 转译快路径，在关闭 source map 且不涉及模块图、模块替换、ignore 语义和任意值兜底时，可通过 `experimentalJsFastPath: 'oxc'` 尝试使用 `oxc-parser` 加速纯字面量转译；不满足条件或运行环境无法加载 OXC 时会自动回退到 Babel。
