---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/issues/1170
baseline: 8a71397c9d3f8a799a64e6e8f418c7847818d9fb
regressions:
  - packages/hbuilderx-runner/test/process.test.ts
  - e2e/hbuilderx-project-alias.test.ts
  - e2e/issue-1144-stable.test.ts
---

# Windows HBuilderX 进程参数边界

## 症状

扩展 #1170 / #1144 验收时，真实 Windows Node 22、24 均暴露 runner 的进程参数缺陷：
带空格的脚本路径被截断，Node 报找不到临时目录中的 `hbuilderx`，`a&b` 的后半部分被 cmd 当作独立命令执行。
原有超时回归也因为脚本被 shell 解析而提前失败。同提交的 Linux/macOS × Node 22/24 均通过。
修复前运行：[34240275773](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34240275773)。

## 根因与纠正

`spawnCommand` 对所有 Windows 命令启用 `shell: true`，破坏了原生可执行文件的参数数组边界。
改为 `cross-spawn`：原生可执行文件直接启动，pnpm 等 cmd shim 经过专门的 PATH/PATHEXT 解析和参数转义。
原生进程不存在时，将 error 事件写入命令日志，再经 close 和既有错误分类返回，避免未处理事件终止调用方。
这属于 runner 的实际跨平台缺陷，不是 #1144 原始 setup 启动超时的已证实根因。

## 验证

- 本地 `CI=1 pnpm --filter @weapp-tailwindcss/hbuilderx-runner test --update=none`：21 通过，Windows cmd shim 用例在 macOS 明确跳过。
- `pnpm --filter @weapp-tailwindcss/hbuilderx-runner build`：ESM/CJS 与声明构建通过。
- `CI=1 pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/hbuilderx-project-alias.test.ts e2e/issue-1144-runner.test.ts --update=none`：14 通过。
- macOS HBuilderX 5.25-alpha 使用中文、空格与 `&` 项目别名，Options/setup 共 32 次保存、4 次刷新通过。日志为忽略目录中的 `verify-1170-1144/macos-runner-fix.log`。
- `pnpm install --frozen-lockfile`、`actionlint .github/workflows/uni-app-x-regression.yml` 通过。lockfile 只保留目标 importer 和新增类型依赖，未混入无关 peer hash 重排。
- 单独 runner 的 `tsc --noEmit` 仍受既有环境变量索引访问与旧测试类型错误影响；新增进程测试没有类型诊断，声明构建通过，不能声称整个包的严格类型检查通过。

后续 Windows 修复后、三系统与真实 IDE 的最终状态以 [PR #1172](https://github.com/sonofmagic/weapp-tailwindcss/pull/1172) 的对应提交检查为准。原始样式证据和历史启动异常见 [独立验证记录](issues-1170-1144-latest-verification.md)。

## 适用边界

原生参数用例覆盖中文、空格、空参数、尾部反斜杠、引号、括号、管道、`&` 与字面量环境变量表达式；Windows 另测 PATH 下的 cmd shim。
Windows IDE 每个版本重复两轮完整场景，失败保留现场且不自动重试。Server 2025 的结论不冒充用户 Windows 11 原机、Vapor 或原生 App 验收。
本次没有改 demo 或样式 fixture；此前新增 #1170 的 static 基线已重新生成并以禁止更新模式通过。

## 规则评估

不新增 AGENTS 规则。现有跨平台参数、真实运行和失败证据要求足够，以可执行回归补齐遗漏。
