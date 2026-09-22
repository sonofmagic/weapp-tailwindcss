---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1232
baseline: 6e685f9d4e04ed6227fe2a14cb6cae35d0ef99f1
regressions:
  - scripts/ci/demo-matrix/mpx-fatal-watch.test.mjs
  - scripts/ci/demo-matrix/mpx-process.test.mjs
  - scripts/ci/demo-matrix/watch-lifecycle-diagnostic.test.mjs
---

# PR #1232 的 Mpx watch 生命周期

## 症状

[原始 PR Gate](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/35675870655) 的 Windows Node 24 Mpx 分片在支付宝 restore 期间提前退出。此前 production、initial、replace、add 都通过；进程触发 beforeExit(0)，只剩管道，没有文件监听句柄。

style-injector-uni-app 的测试成功，但上传证据的 FinalizeArtifact 返回 intermediary 403。两个汇总门禁是连带失败；上传错误与 Mpx 编译应分别处理。

## 根因与纠正

实际依赖为 Webpack 5.105.4、Watchpack 2.5.2、Mpx CLI 2.2.30。Mpx 的 serveMp 返回首轮就绪 Promise，后续 handleWebpackDone 的致命错误仍使用同一个 reject；Promise 已兑现后 reject 不再生效。Webpack MultiCompiler 则会在致命错误后关闭所有子 watcher，最终形成静默的退出码 0。

回归使用实际安装的 CLI 源码与真实 MultiCompiler，只隔离目标配置和终端渲染。首轮成功后向第二次 beforeCompile 注入错误，原版确实没有 stderr、以 0 退出；补丁独立报告后续致命错误并设置退出码 1。首轮拒绝语义、普通 compilation.errors 后继续监听并恢复的行为保持可验证。

这证明错误传播存在缺陷，尚不能证明原始 Windows restore 的底层错误是什么。诊断记录有界的 watcher 创建/关闭调用栈及最后编译阶段；不加保活定时器，不忽略进程退出。

旧 demo 包装器在回归模式下遇到子进程退出 0 会启动永久定时器，已通过真实子进程用例复现并移除。

## 验证

- `pnpm install --frozen-lockfile`、`pnpm build:ci` 通过。
- `pnpm exec cross-env CI=1 pnpm test:demo:matrix`：79 项通过。
- 两项缺陷回归均保留了修复前失败、修复后通过的证据；普通编译错误恢复用例通过。
- `pnpm exec cross-env CI=1 pnpm e2e:demo:matrix mpx-tailwindcss-v4:wx mpx-tailwindcss-v4:ali mpx-tailwindcss-v4:swan mpx-tailwindcss-v4:tt mpx-tailwindcss-v4:dd style-injector-mpx:wx --update --build-only` 重新生成六个目标的 static 基线，无差异。
- `pnpm exec cross-env CI=1 DEMO_MATRIX_PROCESS_DIAGNOSTICS=1 DEMO_MATRIX_WATCH_DIAGNOSTICS=1 DEMO_MATRIX_ARTIFACT_DIR=e2e/.artifacts/mpx-patch-acceptance pnpm e2e:demo:matrix mpx-tailwindcss-v4:wx mpx-tailwindcss-v4:ali mpx-tailwindcss-v4:swan mpx-tailwindcss-v4:tt mpx-tailwindcss-v4:dd style-injector-mpx:wx`：六个目标的 production、initial、replace、add、restore 全部通过。
- 补丁登记之后的 `pnpm install --frozen-lockfile --offline` 通过。仅保留补丁哈希、两个 snapshot key 和三个 importer 引用的变更，剔除 pnpm patch-commit 带来的无关 peer 解析变化。
- [首轮 Windows 诊断](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/35684374050) 共十二次完整 wx/ali 流程通过，未复现原始提前退出，不能据此宣称根因修复完成。

## 适用边界

CLI 补丁只用于仓库冻结依赖，不随 weapp-tailwindcss npm 包安装。上游 next 分支截至本次检查仍有同样的 Promise 处理逻辑；后续升级需用持久回归确认等价修复后再移除补丁。真实 Windows 底层错误和最新 PR 检查仍需继续跟进；本轮未执行 IDE 或设备验收。

## 规则评估

不新增 AGENTS 规则。以真实进程、编译生命周期和持久回归落实已有错误传播与证据要求。
