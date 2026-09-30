---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/engine": patch
---

按实际生成依赖局部失效会话，保留无关入口的编译状态；依赖归属未知、生成失败、仍在执行和仅做过候选校验时继续保守失效。修复共享 `.cjs` 配置在刷新或删除后的旧模块读取，并避免生成失败的清理链产生未处理的 Promise 拒绝。
