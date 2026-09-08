---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/issues/1170
baseline: 46411420c24eb56678759151d80367040286a893
regressions:
  - e2e/issue-1170-web.test.ts
  - e2e/issue-1144-alpha.test.ts
  - e2e/issue-1144-static.test.ts
  - packages/weapp-tailwindcss/test/uni-app-x/vite-style-requests.test.ts
---

# 最新主分支对 #1170 与 #1144 的独立验证

## 症状

2026-09-08 获取 origin/main，主 checkout 从 `6873b33a5` 快进至上述提交，
再创建独立工作树 `codex/verify-1170-1144-latest`，冻结安装并重新构建主包及依赖。

- [#1170](https://github.com/sonofmagic/weapp-tailwindcss/issues/1170)：5.5.2、Tailwind 4.3.3、Windows、HBuilderX 5.24；首次加载正常，只改 `.uvue` 文字后样式消失，没有错误或警告。
- [#1144](https://github.com/sonofmagic/weapp-tailwindcss/issues/1144)：除原始完整 SFC 被送入 PostCSS 外，后续还反馈真实 `pt.root` 多轮修改不生效、important 引发 Sass 错误和 style 子请求失败。验收包含这些后续反馈，没有只检查最初的 Unknown word。

#1170 未提供完整仓库。本轮按其截图重建空 `script setup lang="uts"`、空 `style lang="scss" scoped`、
`text-xl text-[#f7fbff] bg-[#102938] w-[200px]` 页面，复用仓库 #1144 demo 的合法构建配置。
该 demo 显式定义 `--text-xl: 20px`，因此运行时以 20px 验收，不假定其它工程的 theme 数值。
页面事先放置无 utility 的 marker；前六轮只改变文字，class 与 style 块保持不变。

## 根因与纠正

最新主分支包含 #1169。Web pre HMR hook 在框架 scoped 预处理和 Vue 描述符比较前完成 SFC 转换，
让首次编译与 HMR 看到一致的生成 style 块；post hook 保留原始源码事务，
script/template/custom 子请求不会再清空同文件的作者和生成样式状态。
已删除的生成 style 索引返回空 CSS，后续作者块复用索引时优先采用作者内容。
详见 [原生命周期分析](issue-1144-style-lifecycle.md)。

独立构建修复前 `be518d94790c29aad401220b5cdb2a5d23173d5f`，
使用相同 #1170 用例、同一 HBuilderX alpha、相同 Tailwind 4.3.3 对照。
对照只移植验收用例和 Web runner 清理逻辑，产品源码保持修复前版本。
首次加载通过，第一次纯文字保存后 marker 已更新，但样式失效：

| 属性 | 首次加载及最新修复 | 修复前第一次保存 |
| --- | --- | --- |
| width | 200px | 1280px |
| color | rgb(247, 251, 255) | rgb(0, 0, 0) |
| backgroundColor | rgb(16, 41, 56) | rgba(0, 0, 0, 0) |
| fontSize | 20px | 16px |

修复前浏览器 errors、warnings 均为空，DOM 文字为 `Hello Tailwind on uni-app save-1`，
safe class 已更新而对应样式没有生效，符合 #1170 的无报错丢样式现象。
最新代码同例完成六轮纯文字保存、三轮宽度替换/恢复，每轮均刷新浏览器后再次检查计算样式。
这组修复前失败、修复后通过的证据支持 #1169 覆盖了 #1170 的同类根因，不能把它仅归为错误消息修补。

## 验证

环境：macOS、Node 24.18.0、pnpm 11.25.0、Chrome 152.0.7977.77；
HBuilderX 5.25.2026082902-alpha、host HBuilderX、内置 Vite 5.2.8，日志确认 Web VDOM、样式隔离 2.0。
主包实际解析到本工作树 `packages/weapp-tailwindcss/dist/vite.cjs`，
PostCSS 解析到本工作树 `packages/postcss/dist/index.cjs`，Tailwind 为 pnpm 安装的 4.3.3。
这是最新源码本地构建，manifest 仍为 5.5.2，不代表 registry 的同版本含有此次修复。

```sh
pnpm install --frozen-lockfile
pnpm --filter weapp-tailwindcss... run build
CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/uni-app-x test/bundlers --update=none
CI=1 pnpm --filter @weapp-tailwindcss/postcss exec vitest run --update=none
CI=1 E2E_ISSUE_1144_ALPHA=1 HBUILDERX_CHANNEL=alpha HBUILDERX_HOST=HBuilderX pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/issue-1144-alpha.test.ts --update=none
CI=1 E2E_ISSUE_1170_WEB=1 E2E_HBUILDERX_WEB_TIMEOUT_MS=45000 HBUILDERX_CHANNEL=alpha HBUILDERX_HOST=HBuilderX pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/issue-1170-web.test.ts --update=none
```

- 主包及依赖完成实际构建；未使用 Turbo 缓存替代，未构建全仓 demo/文档站。
- uni-app x/bundler：125 文件、1517 测试通过。
- PostCSS：64 文件、709 通过、3 个既有跳过。
- #1144：Options/setup 各 16 轮保存、2 次刷新，共 32 轮保存、4 次刷新；真实 pt 消费、important、组件 style 删除/恢复、marker、class、CSS、计算样式均通过，浏览器错误和警告均为空。
- #1170：9 轮保存、9 次刷新通过，截图及计算样式与预期一致。Web 专项运行显式跳过独立 static case，static 已另行执行。
- runner/matrix：43 项通过。

新增 #1170 样式回归已单独生成对应生产 static 基线，再以禁止更新模式复验。
#1144 的 Options/setup 生产产物也重新构建，既有快照无变化。

```sh
CI=1 E2E_ISSUE_1170_STATIC=1 pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/issue-1170-web.test.ts -u
CI=1 E2E_ISSUE_1170_STATIC=1 pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/issue-1170-web.test.ts e2e/issue-1144-static.test.ts --update=none
CI=1 pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/issue-1144-runner.test.ts e2e/e2e-matrix.test.ts --update=none
CI=1 pnpm exec eslint e2e/issue-1170-web.test.ts
pnpm agents:check
git diff --check
```

static 共 3 项通过。ESLint、规则检查和 diff 检查通过。
`CI=1 pnpm typecheck` 未通过；在已构建相同依赖的修复前工作树运行同命令，旧基线 438 条、最新 437 条。
按仓库路径、错误码和消息归一化后无新增，少一条 `src/uni-app-x/vite.ts` HMR hook context 错误；不能写成全仓类型检查通过。

原始日志集中于忽略目录 `e2e/.artifacts/verify-1170-1144/`。
其中 `1170-before/` 保存旧基线第一次保存失败的日志、页面、diagnostics 和有效截图；
`typecheck-comparison.json` 保存类型对照。
最新 #1144 Options/setup 逐轮证据分别位于
`e2e/.artifacts/web-hmr/issue-1144-uni-app-x-web-1788871875066` 与
`e2e/.artifacts/web-hmr/issue-1144-uni-app-x-web-1788871933215`；
最新 #1170 首轮成功证据位于 `e2e/.artifacts/web-hmr/issue-1144-uni-app-x-web-1788872174926`。
目录名称来自复用的 demo，具体 Issue 以 marker 和测试日志区分。

首次 #1170 新用例错误继承了原主题页 `.bg-page` 的 CSS 断言，虽然实际初始样式正确仍无法继续；
纠正为精简页适用的 preflight 检查后重跑。旧对照另有一次 Web 服务未启动；该轮仅有版本日志，
不计入缺陷复现。有效失败来自后续已完成首次加载的同服务纯文字保存。

## 适用边界

本轮支持在上述 macOS alpha Web VDOM 链路上，两项问题的生命周期根因均已修复。
用户继续要求补测边界后，检查 alpha 无打开的编辑文件及运行任务，退出并切换到 HBuilderX 5.24.2026081301。
稳定版 #1170 完成 9 次保存和刷新；#1144 Options/setup 各 16 次保存和两次刷新，全部通过。
稳定版使用 `E2E_ISSUE_1144_STABLE=1 HBUILDERX_CHANNEL=stable` 与 `e2e/issue-1144-stable.test.ts`，
#1170 复用相同用例并设置 `HBUILDERX_CHANNEL=stable`；日志为 `1144-stable.log`、`1170-stable.log`。
Windows HBuilderX 正通过官方安装包和 GitHub Windows 托管主机补测，尚未得出运行结果。
Vapor 和用户未提供的完整 #1170 项目仍未验收。
未发布 npm、未向 Issue 发送评论、未关闭 Issue。

## 规则评估

不新增 AGENTS 规则。现有真实 IDE、同例修复前后验证、首次加载与增量区分、static 基线要求已覆盖本次工作。
新增持久 #1170 用例记录纯文字保存也可能改变生成样式身份这一回归边界。
