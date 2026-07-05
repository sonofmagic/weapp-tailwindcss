# Package Guidelines (`packages/hbuilderx-runner`)

## 适用范围

- 本文件适用于 `packages/hbuilderx-runner`。
- 该包封装 HBuilderX CLI 调用、项目打开/关闭/运行、进程清理、日志收集和本地 App 工具链探测。

## 核心职责

- 提供稳定的 Node API 给 e2e、demo 脚本和后续 CLI 复用。
- 把 HBuilderX 常见失败归类成可诊断错误，避免只暴露超时或原始日志。
- 不承载 weapp-tailwindcss 的样式转译逻辑。

## 变更原则

- 子进程必须有超时、日志截断和进程树清理。
- 错误信息必须包含命令、cwd、退出码/信号、分类和最近日志。
- 新增 HBuilderX 平台或工具链探测时补单元测试。

## 测试要求

- 修改核心逻辑时至少运行：
  - `pnpm --filter @weapp-tailwindcss/hbuilderx-runner test`
  - `pnpm --filter @weapp-tailwindcss/hbuilderx-runner build`

## 提交前检查

- 确认没有把真实设备、绝对本机路径或敏感环境变量写入测试快照。
- 确认 public exports 与 README 用法一致。
