---
"weapp-tailwindcss": patch
---

扩展热更新 e2e 回归覆盖面并提升跨框架 watch 稳定性：

- watch 回归用例从 `taro/uni-app` 扩展到 `taro/uni-app/mpx/rax/mina/weapp-vite`，默认运行全量 `all`。
- 新增 `e2e:watch:mpx`、`e2e:watch:rax`、`e2e:watch:mina`、`e2e:watch:weapp-vite` 便捷命令。
- 加强 watch 预热与编译成功判定，降低误判和超时波动。
- 优化子进程退出与清理策略，避免 watch 任务残留影响后续回归。
- 强化复杂 Tailwind 类组合（含任意值、小数、calc、伪元素等）在热更新路径下的转译验证。
