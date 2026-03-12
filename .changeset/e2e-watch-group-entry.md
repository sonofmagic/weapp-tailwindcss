---
"weapp-tailwindcss": patch
---

完善 `e2e:watch` 热更新回归流程：

- 新增 `demo` 与 `apps` 分组测试入口，避免分组执行时重复跑单 case 文件
- 将 `test:watch-hmr` 切换为 `node --import tsx` 启动，修复部分环境下 `tsx` IPC `EPERM` 导致的回归无法启动问题
- 调整 `apps/taro-webpack-tailwindcss-v4` 的 watch 回归命令，确保 Taro webpack 场景下模板、脚本、样式热更新都能稳定校验
