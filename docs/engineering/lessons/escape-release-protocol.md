---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/36843628878
baseline: 0bfb23912f59cfaf0b58b00353d7f08122d1f8f1
regressions:
  - packages/weapp-tailwindcss/test/ci/verify-packed-packages.test.ts
---

# escape 迁移后的发布协议阻塞

## 症状

迁入 `@weapp-tailwindcss/escape` 后，Release 在准备版本 PR 之前失败。repoctl 报告五个公开消费者的 `workspace:^` / `workspace:~` 不符合 `workspace:*` 协议。npm 对账显示 escape 0.0.1 尚不存在，其余 29 个公开包的当前 manifest 版本均已发布。

## 根因与纠正

迁移保留了旧外部依赖的范围策略，同时在 manifest 测试和 tarball 验证中为 escape 增加例外。测试与实际 repoctl 发布契约因此相互矛盾。统一五个公开消费者为 `workspace:*`，同步锁文件，删除测试例外，真实打包后断言精确版本。私有工具包的范围不属于此发布契约，不扩大修改范围。

npm 的 [trust 命令前提](https://docs.npmjs.com/cli/v11/commands/npm-trust)要求包先存在、账号具有写权限并启用 2FA。不能把工作流具备 Node 24、`id-token: write` 和 provenance 等同于 npm 已完成包级信任配置。新包的初始化和信任绑定必须分别确认，不能通过向现有 Release 工作流注入 token 解决。

## 验证

- 删除测试例外后，`CI=1 pnpm exec vitest run --project=weapp-tailwindcss test/ci/verify-packed-packages.test.ts --update=none` 复现五处协议违规；修复后与 `test/ci/workflows.test.ts` 合并验证共 47 项通过。
- `CI=1 HUSKY=0 pnpm --filter weapp-tailwindcss... --filter @weapp-tailwindcss/cn... run build` 通过；另以 `CI=1 HUSKY=0 pnpm --filter @weapp-tailwindcss/merge... run build` 补齐 merge（cn 的构建闭包不包含它）。
- 首次 tarball 检查因 merge 未构建而失败；补齐上述构建后，`CI=1 pnpm --filter @weapp-tailwindcss/escape test:package` 通过，覆盖 workspace 外的 ESM/CJS、双端类型、五个消费者精确依赖和旧包引用。
- `pnpm install --frozen-lockfile --ignore-scripts --offline` 通过；锁文件仅五个 importer 的协议变化。
- `pnpm release status` 确认 escape 首次版本仍为 0.0.1，消费者版本沿用已有中文迁移 intent。

## 适用边界

本记录验证发布准备契约，不宣称 npm 已发布或 OIDC 信任已建立。未运行全仓、多端或设备测试，也未手工修改生成的 `release/pnpm-version` 分支。真正发布仍需在 main 修复后由 repoctl 重新生成版本 PR，并完成 npm 初始化、认证和信任核验。

## 规则评估

不新增 AGENTS 规则。已有 repoctl 统一发布和禁止 token 注入的边界足够；应修正实际依赖与回归测试，避免新增例外掩盖工具链拒绝的配置。
