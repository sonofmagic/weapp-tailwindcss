---
"weapp-tailwindcss": patch
---

- refactor: js ast 的转译处理
- perf: 缓存 JS 类名替换时的正则与转义结果，避免重复计算
- perf: WXML Tokenizer 采用字符码判断空白并复用 token 缓存，降低解析开销
- perf: 自定义属性匹配按标签分类预处理，避免在解析阶段重复遍历与覆写
- perf: WXML 片段空白检测改为轻量遍历，减少 `trim` 带来的额外字符串分配
- perf: 提炼空白检测工具，供 Tokenizer 与模板处理器共享，减少重复逻辑
