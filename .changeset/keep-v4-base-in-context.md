---
"weapp-tailwindcss": patch
---

修复 tailwindcss v4 在自动收集 cssEntries 时丢失基准目录的问题：从上下文创建 patcher 时附带工作区 base，保留用户显式设置的 v4 base，并在多 patcher 聚合时沿用首个 patcher 的配置。
