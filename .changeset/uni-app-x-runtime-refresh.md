---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/engine": patch
---

修复 uni-app x 每个 SFC 转换都强制重建运行时、反复扫描项目的问题：同一失效版本共享类名集合和刷新任务，watch 与 HMR 在生命周期入口登记失效，模块转换继续补充生成器确认的当前候选。加入过期任务隔离、失败重试和会话释放，保留局部样式、自定义属性和动态类名更新。Refs #1245

修复 Tailwind CSS 4 的 design system 未随配置间接依赖变化而失效的问题，并让候选有效性缓存绑定实际 design system，避免缓存复用后旧类残留或新类缺失。
