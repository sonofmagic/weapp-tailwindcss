---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1197
baseline: e82055a63e2eea5e049da690de1bca575aa020d3
regressions:
  - packages/weapp-tailwindcss/test/bundlers/shared/generator-css/generated-cleanup.test.ts
  - packages/weapp-tailwindcss/test/bundlers/shared/generator-css/user-css.test.ts
  - packages/weapp-tailwindcss/test/bundlers/framework-css-composition.test.ts
  - packages/weapp-tailwindcss/test/ci/repoctl-release.test.ts
  - demo/__tests__/wxss-output.test.ts
  - e2e/taro-ci-coverage-matrix.test.ts
  - e2e/taro-vite-react-tailwindcss-v4.test.ts
  - e2e/template-contract.test.ts
---

# CSS 清理、框架组合与发布恢复回归

## 症状

- Release 的 WXSS 检查把 `.small` 工具类误认为全局 `small` 标签。
- v4 根规则的变量名前缀清理会误删用户变量；恢复原始根规则又会让未转换的 `rem` 覆盖已转换的 `rpx`。
- 框架 vendor CSS 按规则集合去重后，`16 → 32 → 16` 的最后一条覆盖消失。NutUI 的组合选择器与后续单选择器覆盖也受到影响。
- npm publish 与 tag 推送成功后，GitHub Release POST 返回 502。现有说明修复入口只能修复已有 Release。

原始失败：[34748944107](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34748944107)、[34748944100](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34748944100)。

## 根因与纠正

1. WXSS 禁止片段改为 PostCSS AST 签名匹配，覆盖标签、类、伪类、多选择器和全部已有 Preflight 片段。
2. 从生成阶段传递原始及转换后的声明来源，按条件上下文、属性、值和优先级清理。只有数值小数前导零被归一化；未知来源与用户覆盖保留。补齐删除声明后标记变化、单独 `:host` 的用户变量及空白格式回归。
3. 用户样式转换之后，裸选择器补偿只补没有被转换结果表示的规则，避免重新插入原始 `rem`。
4. 框架产物作为用户 CSS 顺序的权威来源，删除生成侧的重复副本，不删除框架侧的重复覆盖。真实生成器测试分别执行 legacy 与 graph，并精确验证用户变量、单位转换及重复规则顺序。
5. 合并多个 CSS 输入后，只保留开头的一条 `@charset`；不在构建输出目录直接写文件。
6. 模板按 semver 范围能否覆盖当前稳定版验收，不要求范围字符串一致。Taro 配置通过执行实际 AST 中的 `designWidth` 表达式验证 POSIX、Windows、相对路径、盘符和相邻目录。
7. 为实际实现包 `@icebreakers/monorepo@5.5.0` 提交 pnpm patch。Release API 的重试限定四次，遵守限流等待，POST 响应不确定时先按 tag 查询；不重跑 npm publish。
8. 显式 `release notes repair --create-missing --tag` 支持 dry-run。核对 npm 精确版本、本地与远端 tag、目标提交内的包名和版本，再复用原说明生成逻辑补建缺失 Release。

## 验证

本次在独立 `codex/ci-css-release-recovery` worktree 验证；以下均为当前修复的本地结果，不使用历史 CI 通过记录代替。

- `CI=1 pnpm test --update=none`：540 文件、5278 测试通过；5 文件、47 测试既有跳过。
- CSS 定向集合：13 文件、288 测试通过；新增清理器、框架组合和 repoctl 集合另行复验，50 测试通过。
- `CI=1 pnpm test:release`：58 测试通过、4 跳过；附加发布插件测试 2 项通过。
- `CI=1 pnpm e2e:issues-977-978`：8 项通过。
- Taro coverage、模板范围和 canonical smoke：3 文件、20 项通过。
- `pnpm --filter weapp-tailwindcss build`：通过，真实 demo 使用本 worktree 的新构建。
- `CI=1 pnpm e2e:static --shard=1/3 --update=none`：21 文件、118 测试通过；6 文件、18 测试跳过。
- static 第二、第三分片及 apps-generator：验证中，完成后更新记录。
- `pnpm typecheck`：未通过。当前与未修改基线各 445 条诊断，按文件和错误码对比无新增。不能据此宣称严格类型全绿。
- ESLint：使用仓库默认范围检查改动代码；对新增测试与框架组合测试额外取消忽略进行检查。全仓默认忽略的历史 demo/大型测试文件不能冒充已通过强制 lint。

## 快照语义

限定更新 Taro Vite React/Vue v4 与 uni-app Vite v4 的 static 基线，随后以 `--update=none` 验证。

- 两套 NutUI 产物按选择器、条件上下文、声明属性和优先级统计，React 6707 项、Vue 5233 项，未缺失声明；大量 diff 来自重复副本减少和保留框架已处理的格式。
- 对照 NutUI 原始 CSS，`.nut-tabs-titles-item-smile` 的 `bottom` 最后应为 `var(--nutui-tabs-titles-item-smile-bottom, -10%)`，`.nut-indicator-white .nut-indicator-line` 的 `opacity` 最后应为 `0`。旧基线的 `15%` 与 `1` 来自错误覆盖顺序；真实构建行为测试固定这两个纠正。
- uni-app 保留的 `--test-color`、`--color-test`、字体与色彩变量来自 `App.vue`，runtime 的状态栏高度和窗口偏移仍在主样式中。

## 适用边界

- 本地验证覆盖编译与产物；没有把 CLI 构建记为 IDE、设备或真机验收。
- 中文 patch intent 只指定 `weapp-tailwindcss`。清理器及组合逻辑属于核心包，`@weapp-tailwindcss/postcss` 的源码和公共行为未改动，不单独增加其版本。
- `pnpm release status` 显示核心包 5.5.5 → 5.5.6，CLI 与依赖消费包的联动来自仓库已有 fixed/dependency 策略。
- 只交付补丁和恢复测试，本次没有运行 npm publish、推送发布 tag 或实际补建 Release。
- 上游增强：[repoctl #887](https://github.com/sonofmagic/repoctl/issues/887)、[repoctl #888](https://github.com/sonofmagic/repoctl/issues/888)，关联 #848，不重复提出 provenance 问题。

## 规则评估

不新增 AGENTS 规则。现有生成来源、构建图、回归与基线规则足够，本次用持久行为测试补上执行缺口。
