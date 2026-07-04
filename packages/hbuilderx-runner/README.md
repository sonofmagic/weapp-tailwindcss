# @weapp-tailwindcss/hbuilderx-runner

HBuilderX CLI 调用辅助包，用于本地 e2e、demo 脚本和后续 CLI 封装。

```ts
import {
  closeProject,
  openProject,
  resolveHBuilderXCliInfo,
  startLaunch,
} from '@weapp-tailwindcss/hbuilderx-runner'

const cli = await resolveHBuilderXCliInfo()
console.log(cli.path, cli.source, cli.isRunning)

await closeProject({ cwd: projectRoot, allowFailure: true })
await openProject({ cwd: projectRoot })

const launch = startLaunch({
  cwd: projectRoot,
  platform: 'app-android',
  args: ['--deviceId', 'emulator-5554'],
})

// 业务侧等待产物或探针后主动停止。
await launch.stop()
```

该包只负责 HBuilderX 调用层稳定性，不处理 Tailwind 或小程序样式转译。

## 能力边界

- 从正在运行的 HBuilderX、`HBUILDERX_CLI_PATH` 和默认安装路径解析 CLI。
- 封装 `project open/close`、`launch`、长驻运行、超时、最近日志与进程树清理。
- 将常见失败归类为可诊断的 `HBuilderXCommandError`，例如项目识别错误、配置加载失败、Android/iOS/Harmony 工具链缺失和命令超时。
- 提供 Android `adb`、iOS Xcode/simulator、Harmony `hdc` 的本地工具链探测函数，供 e2e 或 demo 脚本在运行前快速失败。
