---
"weapp-tailwindcss": patch
---

按来源发现、候选刷新、CSS 资产状态和插件组装拆分 Vite 内部职责，保留公开 API 与生成顺序。构建结束和 watcher 关闭时等待生成任务并释放实例状态，watch 中间轮次继续复用增量数据，生成失败不阻断后续队列请求。

修复 build watch 中候选或配置来源改变后 CSS 入口继续复用旧 transform 的问题，按来源 revision 重转实际消费入口，并补齐 dispatcher 对缓存模块、模块解析和 watcher 关闭钩子的转发。

按 Vite resolved config 隔离可释放的插件实例，支持 Nuxt 客户端与 SSR 连续复用同一插件配置，避免客户端结束后关闭后续 SSR 使用的生成队列。
