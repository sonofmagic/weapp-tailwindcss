# @weapp-tailwindcss/hbuilderx-runner

Stable HBuilderX CLI runner utilities for local e2e workflows, demo scripts, and future CLI wrappers.

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

await launch.stop()
```

The package only stabilizes the HBuilderX invocation layer. It does not handle Tailwind or mini program style transformation.

## Scope

- Resolve HBuilderX CLI from a running HBuilderX instance, `HBUILDERX_CLI_PATH`, or default install paths.
- Wrap `project open/close`, `launch`, long-running processes, timeouts, recent logs, and process-tree cleanup.
- Classify common failures into `HBuilderXCommandError`, including project recognition failures, config load failures, missing Android/iOS/Harmony toolchains, and timeouts.
- Provide local Android `adb`, iOS Xcode/simulator, and Harmony `hdc` probes for e2e and demo scripts.
