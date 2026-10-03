---
status: partial
issue: https://github.com/weapp-tailwindcss/weapp-tailwindcss/pull/1269
baseline: 6d2eb5064f9ffb35429e551a7b57309bd05bc5e4
regressions:
  - e2e/hbuilderx-alias-consumers.test.ts
  - e2e/wechat-session-boundary.test.ts
---

# HBuilderX 的微信 watch 必须与 IDE 启动解耦

## 症状

2026-10-03 本地流程进入 watch 后，21:34:24.158 的 HBuilderX 输出出现“正在启动微信开发者工具”，随后微信 Electron 执行 initialize/open。仓库的直接 automator 入口已经使用已有 HTTP 服务，但 `scripts/hbuilderx-launch-mp-weixin-dev.ts` 默认仍调用 `launch mp-weixin --compile false`，经 HBuilderX 间接触发微信 CLI。发现后主流程已停止并按归属回收本轮进程；不能因为 IDE 已经开启就认为这条路径安全。

## 根因与纠正

只读核对本轮安装的 HBuilderX 5.31.2026093020-alpha：`uniapp-extension/out/index.js` 模块 174 的 `liteMode` 等于 `!!session.args.compile`；模块 4981 在首次编译成功后选择 `liteMode ? stop() : openTool()`。`stop()` 会终止编译器，因而 `compile=true` 是一次性编译；`compile=false` 则进入 `openTool → startIde` 并执行微信 CLI `open --project`。

`startIde` 还在启动前调用 `removeWXLocalstorage`，并可能自动确认开启微信服务端口。即使本仓没有直接执行登录或注销，该中转仍会碰触用户 IDE 的启动和本地状态边界。此处只记录调用路径，不读取或保留登录资料；本轮证据证明发生了不允许的启动，不能据此断言再次注销或把具体文件内容当作已验证的认证根因。

当前官方调用链没有持续 watch 且禁止 auto-open 的分支。`--ui` 仅转入界面 launchPlatform，不能消除这一行为。不能改用户配置、修改安装插件、注入未知开关或把一次性编译当作 watch 放行。

### 安全编译链

独立脚本在解析 runner、创建项目别名、删除旧产物和启动进程之前拒绝非 `HBUILDERX_COMPILE_ONLY=1` 的调用。显式静态编译固定传 `--compile true`；正常 watch/HMR 仍报告阻塞。持续开发编译应直接使用同套 `uniapp-cli-vite` 的官方 `bin/uni.js -p mp-weixin`，其 `runDev` 原生创建持续 watcher；项目输入、输出、uni-app x 标志、HBuilderX 插件映射和进程归属需要由独立入口明确提供。该编译进程不经过 IDE debug adapter 或 launcher，微信连接仍只能由 `scripts/wechat` 管理用户已打开的 IDE。

本次先交付安全阻断；独立 watch 编译入口与真实增量验收仍待补齐。恢复后必须验证同一编译进程的首次产物与多轮源码增量，并检查微信 CLI 零调用，才可继续完整 watch 阶段。

## 验证

- 修复前，5 个默认或非法环境值的隔离回归全部失败，证明会继续进入 launcher。
- 修复后，`CI=1 pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/hbuilderx-alias-consumers.test.ts e2e/wechat-session-boundary.test.ts --update=none` 共 20 项通过，涵盖无子进程、无别名、旧产物不变、固定 compile 参数和原有信号清理。
- AST 边界同时扫描全部 E2E 与脚本里的微信 launch 参数，拒绝缺省、变量、条件表达式、重复覆盖和展开参数，防止中转启动再次绕过直接 automator 检查。
- 实际执行脚本并设置 `HBUILDERX_COMPILE_ONLY=0` 后立即以退出码 1 报告明确阻塞，没有启动 IDE 或编译器。定向 ESLint 通过。

## 适用边界

本次没有修改 demo 源码或样式输出，也没有运行设备、浏览器或真实 IDE 测试；不得记录为 watch 或全面验收通过。

## 规则评估

沿用已有保留微信登录态的全局规则，补充可执行边界与多端手册，明确第三方工具中转同样受限。
