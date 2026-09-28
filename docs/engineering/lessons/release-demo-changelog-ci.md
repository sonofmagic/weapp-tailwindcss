---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1248
baseline: e11a83483130a223bd79925866f320b4fc871162
regressions:
  - benchmark/version-compare/test/change-relevance.test.mjs
  - e2e/lynx-native-command.test.ts
---

# 发布日志误触发性能门禁与原生命令诊断

## 症状

PR #1248 仅升级包版本及生成发布文档，但 Benchmark 的 mpx、weapp-vite 分片因 HMR RSS 差异失败。日志将 `demo/weapp-vite-tailwindcss-v4/CHANGELOG.md` 列为唯一性能相关文件。独立的 Lynx iOS 作业停在 `simctl launch`，错误正文为空。

## 根因与纠正

性能文件分类已忽略工作区 manifest 的纯版本升级，却将 `demo/**` 中的发布日志直接视为代码变化。补充 demo 包根目录及 `demo/web` 包根目录的精确 CHANGELOG 匹配，沿用既有发布元数据的 informational 模式。源码、内容 Markdown、构建配置、依赖变化仍然触发阻断门禁；不调整 RSS 阈值，也不把测得的差异解释为已确认的环境噪声。

原生命令设置 `reject: false` 后自行拼接异常，空字符串经过 `??` 不会回退到 `shortMessage`，因而吞掉超时、信号与退出码信息。改为保留 execa 原始异常，并用真实 Node 子进程覆盖静默超时、静默非零退出、stderr 和成功输出。此改动修复诊断信息丢失；iOS 启动失败的原因仍需新一次远端运行验证。

## 验证

- 新增性能分类回归在修复前 6 项失败，修复后通过。
- `CI=1 pnpm exec vitest run -c benchmark/version-compare/vitest.config.mjs --update=none`：13 项通过。
- `CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/ci/benchmark-report.test.ts --update=none`：31 项通过。
- `CI=1 pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/lynx-native-command.test.ts --update=none`：3 项通过。
- 对实际 PR 基线 `7dd7f53c7a82939b8c0505bbc973dd6dde5c5308` 调用分类器，结果 `relevant: false`，发布日志进入 `ignoredReleaseMetadataFiles`。
- 远端原始证据：[Benchmark](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/36384524166)、[Lynx](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/36384524130)。最终远端结果见 PR 当前提交检查。

## 适用边界

本次只修改 CI 辅助逻辑，未修改公开包行为、demo 源码或样式输出，不需要 change intent 或 static 基线重生成。本地执行定向回归，没有开展本地全端验收。不能以错误诊断改善宣称原生设备启动已修复。

## 规则评估

不新增规则。既有根因回归、原始错误保留及当前提交 CI 验收要求已覆盖本次问题，补充可执行测试即可。
