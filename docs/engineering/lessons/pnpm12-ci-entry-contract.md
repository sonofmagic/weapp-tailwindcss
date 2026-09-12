---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1173
baseline: 97c8671753fb73e062ff20c2661137c5e45bde01
regressions:
  - packages/weapp-tailwindcss/test/ci/pnpm-command.test.ts
  - packages/weapp-tailwindcss/test/ci/lockfile.test.ts
  - packages/weapp-tailwindcss/test/ci/workflows.test.ts
  - scripts/ci/demo-matrix/pnpm-version.test.mjs
  - scripts/ci/demo-matrix/matrix.test.mjs
  - e2e/dev-startup-matrix.test.ts
verification:
  - claim: pnpm 升级后 Linux 启动器在执行原生入口时失败
    kind: ci
    status: failed
    sha: 97c8671753fb73e062ff20c2661137c5e45bde01
    environment: GitHub ubuntu-latest，Node 22.23.2，pnpm 12.3.4
    url: https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34337080724/job/102420435474
  - claim: portable demo 在版本前置检查退出，尚未开始构建
    kind: ci
    status: failed
    sha: 97c8671753fb73e062ff20c2661137c5e45bde01
    environment: GitHub ubuntu-latest，Node 24，pnpm 12.3.4
    url: https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34337080724/job/102420819671
  - claim: 三平台入口选择和真实原生进程的参数与退出码回归通过
    kind: unit
    status: passed
    sha: 97c8671753fb73e062ff20c2661137c5e45bde01
    environment: macOS，Node 24.18.0，pnpm 12.3.4，基线加本次未提交修复；其他平台入口选择为模拟测试
    command: CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/ci --update=none
  - claim: weapp-vite 实际开发进程完成首次启动且保持存活
    kind: integration
    status: passed
    sha: 97c8671753fb73e062ff20c2661137c5e45bde01
    environment: macOS，Node 24.18.0，pnpm 12.3.4，基线加本次未提交修复
    command: CI=1 E2E_DEV_STARTUP_RUN=1 E2E_DEV_STARTUP_CASE=weapp-vite-tailwindcss-v4 pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/dev-startup-matrix.test.ts --update=none
  - claim: Taro Vite 小程序生产产物和四轮开发保存通过既有基线
    kind: integration
    status: passed
    sha: 97c8671753fb73e062ff20c2661137c5e45bde01
    environment: macOS，Node 24.18.0，pnpm 12.3.4，基线加本次未提交修复
    command: CI=1 pnpm e2e:demo:matrix taro-vite-react-tailwindcss-v4:weapp
---

# pnpm 12 升级后的 CI 消费链

## 症状

PR #1173 合入 main 的工具升级后，冻结安装和包构建成功，但 demo 启动检查失败。
portable runner 在开始构建前比较 `12.3.4` 与硬编码 `11.25.0`；后续无 artifact 是该退出的结果。
Linux dev startup 最后成功阶段是启动 watch wrapper，第一失败阶段是 Node 读取 pnpm ELF 文件，
报 `SyntaxError: Invalid or unexpected token`。这与原生 HBuilderX CLI 挂起没有因果证据。

单测分片还暴露了两个独立问题：锁文件出现多个 YAML 文档导致 `YAML.parse` 失败，
以及 repoctl 已升至 `^5.4.9`，测试仍要求 `^5.4.7`。

## 根因与纠正

- 版本来源：runner、报告 gate 与报告 fixture 统一读取根 manifest；独立用户复现仍读取自身 manifest，保留其 pnpm 11 版本，不跟随仓库升级。
- 进程入口：`npm_execpath` 不保证是 JavaScript。共享命令工具区分 JS、原生程序和 Windows 命令脚本；两个 watch wrapper 复用它，原生程序直接执行，保留独立参数与退出码。
- 锁文件边界：pnpm 12 将包管理器依赖与项目依赖分段保存。测试通过 YAML 文档解析器选出唯一带安装设置和 importers 的项目文档，拒绝解析错误、缺失和重复文档，不按固定段号截取。
- 生命周期契约：repoctl 回归约束所需能力的最低版本 5.4.7，并保留全部发布命令断言，允许兼容升级。

## 验证

原生入口回归修复前 5 项失败，修复后通过。覆盖 Windows/macOS/Linux 的 JS 与原生入口、
空格和中文路径、Windows shim，以及真实原生进程的参数和非零退出码。
锁文件回归覆盖旧单段、新多段、顺序变化、LF/CRLF、缺失、重复和错误 YAML。
版本回归覆盖 manifest 路径与 URL、版本升级、预发布、完整性后缀及非法声明；gate 继续拒绝错误版本和不完整证据。

本地完成冻结安装、`pnpm build:ci`、CI 目录 132 项、demo matrix 53 项、agents 50 项测试。
实际 weapp-vite startup 2 项通过，Taro 生产与 initial/replace/add/restore 全部通过，未更新基线。
原始日志在忽略目录 `e2e/.artifacts/pr-1173-ci/`；通过记录明确包含未提交补丁，不能用于宣称原始 SHA 已通过。
最终提交和远端运行状态以 PR 的最新验收记录为准。

## 适用边界

不改变产品公共 API、demo 源码、static 基线、CI 触发条件或原生 IDE 验收范围。
本地原生进程证据来自 macOS，三系统远端矩阵需对应最新 SHA 的 CI 结果确认。
HBuilderX CLI 间歇挂起根因仍未知，Windows 交互桌面及 macOS 剩余验收轮次仍未完成。

## 规则评估

不新增 AGENTS 规则。沿用已有升级消费链检查，以版本读取、原生入口和锁文件解析回归替代重复规则。
