---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1244
baseline: a949296cdc7ea554e866cc7e52ed133aa137fe1a
regressions:
  - packages/weapp-tailwindcss/test/bundlers/vite-source-watch-registration.unit.test.ts
  - e2e/issue-1241-watch.test.ts
  - e2e/hbuilderx-local.test.ts
---

# uni-app App 的候选监听归属

## 症状

用户明确接受 Android VDOM 工具链重启例外后，VDOM 的全部增量步骤和两种样式隔离视觉通过。普通 uni-app Vite Android 视觉却失败：本机 app-service.js 与 CSS 已含新 marker，设备 www 中仍是旧 marker，截图也显示旧文字和颜色。此问题与已经接受的应用重启不同。

## 根因与纠正

普通 uni-app App 建立 Vue、nvue 两个 Rollup watcher。候选扫描原先在 buildStart 向每个图注册全部扫描文件，导致没有 Tailwind CSS 消费者的空 nvue 图也响应 Vue 页面保存。

框架 AppWatcher 的完成状态跨轮保留，空 nvue 图提前结束时就输出编译成功，HBuilderX 随即同步；主 Vue 图仍在生成文件。较小项目因写盘快不一定暴露问题。只加载 uni 编译器的最小项目同步正常；加入插件并将主图 generateBundle 延迟两秒，可稳定看到同步发生在主图完成前，设备拿到旧文件。

将候选监听注册移到 generateBundle 中，在真实模块图建立后检查已记录的 Tailwind 根 CSS 是否仍由当前图消费。只有消费图注册额外候选文件；移除 CSS 入口后不继续注册。文件型 @source 可以不在模块图中，其监听在消费图的每轮生成后重新注册，保持连续增删能力。

没有修改设备文件或在后置阶段读源码，没有靠延长截图等待兜底。保留原生热重载本身的行为和报告。

## 验证

- 监听生命周期回归覆盖 POSIX、Windows、根路径、相对路径，每轮注册、删除/恢复候选、CSS 消费图删除/恢复，4 项通过。
- Vite 来源、HMR、完整 bundle 回归共 250 项通过。
- `pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/issue-1241-watch.test.ts --update=none`：同进程双入口连续主题、source、导入和候选变化通过，保持与干净构建一致。
- 相同延迟对照：修复前本机 new=true、设备 new=false/old=true；修复后本机和设备均 new=true/old=false，且编译完成通知发生在主图写盘之后。
- `DEMO_VISUAL_FILTER='^uni-app-vite-tailwindcss-v4$' pnpm exec tsx scripts/demo-visual-e2e-report.ts --android-only --fail-on-incomplete`：真实 Android 更新前后截图通过，模式仍为 native-reload。
- 上述设备命令固定本轮预检的 Android 设备与 HBuilderX stable 实例。日志、对照源码、本机与设备产物保存在 `e2e/.artifacts/preflight/8defebde-f3d0-4274-972f-ab3509317e6d/`；成功对照为 `uni-sync-delay-fixed/`，失败对照为 `uni-sync-delay-diagnostic/`。

## 适用边界

实际消费关系来自 transform 阶段记录及 Rollup getModuleInfo，不通过 uni-app 编译器名称或项目目录排除文件。该修复处理额外监听触发空构建的问题，不声称修复上游所有多 watcher 调度竞态。后续全端验证需要新预检。

## 规则评估

不新增 AGENTS 规则。现有构建图和生命周期原则足够；通过持久回归区分扫描所得候选和真正需要该候选的构建消费者。
