---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1217
baseline: d7feb9051c5c8f91979f583e5ac885434b81b253
regressions:
  - e2e/uni-app-vite-tailwindcss-v4.test.ts
  - e2e/multiplatform-build-output.test.ts
---

# uni-app CLI 编译器与 HBuilderX 5.26 对齐

## 症状

升级 HBuilderX 不会更新 CLI demo 的 npm 编译器。普通 `uni-app-vite-tailwindcss-v4` 使用 5.15 编译器，而 HBuilderX 运行基座已经是 5.26，iOS 会提示版本不匹配。

## 根因与纠正

将该 demo 的 21 个同系列 `@dcloudio/*` 依赖对齐到 `3.0.0-5020620260917001`，实际编译器版本为 5.26；包含此前混用旧版的 `uni-mp-vue`，保留 Vite 5.2.8 和 `weapp-tailwindcss` 生成链路。升级从 #1217 拆出独立交付，样式转换迁移不依赖此版本升级。

## 适用边界

拆分前与样式迁移组合验证时，frozen install、14 平台产物、微信 static 和普通 Vue3 iOS 原生热重载通过；iOS 版本弹窗消失。该 App 结果来自组合代码，不能冒充本独立分支的完整设备验收。

普通 Vue3 的 `app-service.js` 变化可能触发 HBuilderX 全量同步，iOS launcher 发送 `restart`。因此该场景需要单独记录原生热重载，不能算作保持状态的纯 HMR。#1217 已加入维护者确认的独立验收模式；本升级不修改生命周期断言。

三组独立 checkout 的串行对照（各 3 次构建、3 次 watch 更新）中，同为 5.15 时样式迁移前后构建/内存接近；从迁移后 5.15 升到 5.26，构建中位数 3708.59 → 3968.69 ms，构建峰值 RSS 中位数 1063.31 → 1185.11 MB，HMR steady 469.06 → 642.95 ms。远端也重复观察到回归。原始报告位于 #1217 工作树 `.tmp/pr1217-ci-before/compiler-matrix.json`，采样定义见该 PR 工程记录。

这是独立的编译器升级成本，当前仍待定位或优化。不得放宽性能门槛、把升级纳入比较基线来掩盖成本，或通过反复重跑筛选有利样本。本升级 PR 保持草稿。

## 验证

基于 `main` 的 `d7feb9051c5c8f91979f583e5ac885434b81b253` 提取原升级提交的 demo manifest 与锁文件，不包含样式转换迁移或原 PR 的历史工程记录。

- `pnpm install --frozen-lockfile` 通过。
- `CI=1 pnpm build:ci` 通过。
- `CI=1 E2E_SKIP_OPEN_AUTOMATOR=1 E2E_PROJECT_FILTER='^uni-app-vite-tailwindcss-v4$' pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/uni-app-vite-tailwindcss-v4.test.ts -u`：2 项通过，重新生成 13 个 static 快照，无受跟踪产物差异；随后以 `--update=none` 复核，2 项通过。
- `CI=1 E2E_MULTIPLATFORM_BUILD_CASE='^uni-app-vite-tailwindcss-v4 (mp-alipay|h5)$' pnpm e2e:multiplatform-build`：3 项通过，覆盖支付宝 `.acss` 产物、H5 构建和矩阵登记。

日志保存在 #1217 工作树 `.tmp/compiler-526-split-*.log`。完整多端验收尚未执行；当前 Codex 浏览器发现报 `Codex auth token is unavailable`，恢复后必须重新预检。

## 规则评估

沿用现有编译器/基座对齐、static 基线、性能门槛与完整多端预检规则，不新增或放宽 AGENTS 规则。私有 demo 的依赖升级不生成公开包 change intent。
