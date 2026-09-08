---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/issues/1170
baseline: 8a71397c9d3f8a799a64e6e8f418c7847818d9fb
regressions:
  - packages/hbuilderx-runner/test/process.test.ts
  - packages/hbuilderx-runner/test/discovery.test.ts
  - packages/hbuilderx-runner/test/discovery-windows.test.ts
  - packages/hbuilderx-runner/test/host-connection.test.ts
  - e2e/hbuilderx-project-alias.test.ts
  - e2e/issue-1144-stable.test.ts
  - packages/weapp-tailwindcss/test/uni-app-x/style-reference-paths.test.ts
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

## UNC 引用与既有跨平台用例

修复后的 Windows Node 22/24 runner 均已通过 22 项，见
[34241610924](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34241610924)。随后扩大到全部 uni-app x 测试，
暴露 8 个把 `/project` 固定为 POSIX 文件系统路径的既有用例。Windows 会为这种宿主根路径补齐盘符，
mock module graph 也必须使用同一个绝对文件路径身份；本次调整测试的文件路径与路由构造，保留原来的 HMR/CSS 语义断言。

继续扩展到 UNC 后发现实际解析遗漏：Web/Harmony 各自的盘符检测都不识别共享根目录。
在非 Windows 宿主解析 `\\server\share` 或 `//server/share` 模块时，会落入本机 cwd 或丢掉开头的共享标识。
同一组 16 项用例修复前 4 项失败、修复后全部通过，覆盖盘符、UNC 两种分隔符、中文空格、宿主根目录与相对路径。
两条链路现共用 `resolveStyleReferencePath`，先按来源路径语义解析，再在 CSS 引用边界统一为 `/`。
这不改变宿主文件系统对 `/project` 的正常解析，也不增加源文件扫描或构建后写盘兜底。

主包重新构建后，`CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/uni-app-x test/bundlers --update=none`
通过 126 文件、1537 项。使用 `E2E_ISSUE_1170_STATIC=1` 运行 #1170/#1144 static `-u`，三个生产用例通过且基线无变化；
再单独执行 `--update=none` 复验，原始日志前缀为 `verify-1170-1144/path-fix-*`。

## 适用边界

原生参数用例覆盖中文、空格、空参数、尾部反斜杠、引号、括号、管道、`&` 与字面量环境变量表达式；Windows 另测 PATH 下的 cmd shim。
Windows IDE 每个版本重复两轮完整场景，失败保留现场且不自动重试。Server 2025 的结论不冒充用户 Windows 11 原机、Vapor 或原生 App 验收。
本次没有改 demo 或样式 fixture；此前新增 #1170 的 static 基线已重新生成并以禁止更新模式通过。

## Windows 实例发现与连接边界

现代 Windows 不一定安装 WMIC。旧实现查询失败直接返回空列表，导致 runner 对已有 IDE 再次执行 `open`。
现改为 Windows 自带 PowerShell 与进程 API，使用 JSON 传递路径，避免 CSV 丢失逗号、中文或 UNC 路径；
查询错误与有效空列表分开处理。实际 Windows 回归创建位于中文、空格、逗号和 `&` 目录的临时
`HBuilderX.exe`，确认无 WMIC 时仍能找到同目录 CLI，并只清理测试自身进程。

真实 IDE 压测进一步暴露：即便改用进程 API，PowerShell 查询仍可能超时。
因此不能让显式配置路径的连接依赖操作系统进程枚举。内部将路径选择与 host 握手分开：
显式 candidate/环境变量直接定位 CLI，使用 `listhost` 和 `version --host` 确认实例；
只有有效空列表才执行一次 `open`，随后等待 host 注册。命令失败、超时、版本不匹配和歧义都不会触发重复启动。
未配置路径时仍通过运行进程发现安装位置，公开路径解析 API 保留原有 `isRunning` 行为。

`host-connection.test.ts` 覆盖显式 candidate/env、已有 host、空列表后注册、只启动一次、版本不匹配、
多个 host、显式绑定、CLI 失败、超时、缺失 candidate 和统一截止时间。
本地 runner 42 项通过、2 个 Windows 专用用例跳过，ESM/CJS 与声明构建通过。
[34251949634](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34251949634) 的前一版发现实现
已经通过三系统 × Node 22/24，但 Windows stable 在查询时超时，alpha 第二场景在编译服务创建前超时。
这些失败不能当作样式问题复现，也不能因个别场景通过而声称连续原生验收完成。
host 连接实现 `52dcaed93` 在 macOS alpha 完成两轮、8 个场景，共 100 次保存和 44 次刷新，全部通过。
命令为 `CI=1 HBUILDERX_CHANNEL=alpha E2E_ISSUE_1170_WEB=1 E2E_ISSUE_1144_ALPHA=1 E2E_WINDOWS_REPEATS=2 E2E_WINDOWS_CASE=all node scripts/ci/issue-hbuilderx-verify.mjs`，CLI 路径由环境变量传入。
日志为 `verify-1170-1144/macos-host-handshake.log`；Windows 最终原生结果待补充。

## 规则评估

不新增 AGENTS 规则。现有跨平台参数、真实运行和失败证据要求足够，以可执行回归补齐遗漏。
