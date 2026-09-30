---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1256
baseline: bc42340685067d13e0ddc665197662848faaacfa
regressions:
  - packages/weapp-tailwindcss/test/js/oxc-upgrade-contract.test.ts
  - scripts/ci/demo-matrix/rollup-invalidation.test.mjs
  - scripts/ci/demo-matrix/rollup-watch.test.mjs
---

# 编译依赖的逐项升级验证

## 症状

评估 Oxc 0.152.0、Rollup 4.63.5、Rolldown 1.2.11 的兼容性和稳定性，不进行全仓 latest 更新，也不把版本号变化解释为性能收益。

## 根因与纠正

Oxc parser 从 0.151.0 升至 0.152.0，保留其他调用方的旧版本。官方[发布说明](https://github.com/oxc-project/oxc/releases/tag/crates_v0.152.0)包含解析修复。新增中文与非 BMP 字符之后的 TSX/模板位置、精确 classNameSet 以及首次 source map 回退契约；需要映射时仍由 Babel 处理。

根开发依赖 Rollup 从 4.63.0 升至 4.63.5，框架依赖的 3.30.0、4.63.0、4.63.1 保留。[上游发布说明](https://github.com/rollup/rollup/releases/tag/v4.63.5)中的 watch 修复未覆盖全部现有回归：未打补丁的确切候选版本 18 项中有 6 项失败，涉及同一 throttle 窗口的新文件状态和构建期间的 transform dependency 失效。候选版本入口可通过 WEAPP_TW_ROLLUP_CANDIDATE 显式指定，普通 CI 仍使用框架实际解析版本。

因此保留补丁并迁移到 4.63.5 的确切源码。旧补丁能在宽松应用实验中成功，但 pnpm 严格应用拒绝第三个 hunk，不能直接复制旧文件作为交付。重新生成上下文后 frozen install 和相同 18 项回归通过。只有未补丁版本通过完整 watcher 回归后才移除；不降低断言或调整 watcher 等待来接受升级。

## 验证

Node 24.18.0、pnpm 12.6.0、macOS arm64。Oxc、Rolldown 要求 Node ^20.19.0 或 >=22.12.0，符合当前工具链。官方 registry 本机 TLS 主机名校验失败，使用 HTTPS npmmirror 下载，保留 package integrity；没有禁用 TLS。

- Oxc 升级后主包闭包构建通过；JS/Babel 定向测试 288 项通过、2 项条件跳过；新增映射与 Unicode 契约 2 项通过。
- Rollup 未补丁候选：12 通过、6 失败。迁移补丁后的实际根依赖：18 通过；frozen install 通过。
- 曾因新 worktree 尚未构建内部 exports、以及候选副本未链接 native 运行时导致实验失败，日志保留；它们是实验准备问题，不能当作产品兼容回归。

复现候选版本回归：

```sh
pnpm install --frozen-lockfile
CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/js test/babel --update=none
CI=1 pnpm exec vitest run -c scripts/ci/demo-matrix/vitest.config.mts scripts/ci/demo-matrix/rollup-invalidation.test.mjs scripts/ci/demo-matrix/rollup-watch.test.mjs --update=none
```

单独候选安装目录通过环境变量 WEAPP_TW_ROLLUP_CANDIDATE 传入；必须为绝对路径且解析到 4.63.5。原始发布元数据、锁文件与失败/成功日志保存在 .tmp/toolchain-evidence。

## 适用边界

稳定性升级不标注性能提升。框架旧版本没有被全局 override 强制统一。未完成本地全端预检及全矩阵验收，不宣称设备、IDE、Windows/Linux 已验证。源码 tarball 对照与 npm 稳定版周报分开记录，不更新预算。

## 规则评估

不新增 AGENTS 规则；使用持久回归和可显式选择候选版本的测试入口验证升级边界。
