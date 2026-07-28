# @weapp-tailwindcss/hbuilderx-runner

Stable HBuilderX CLI runner utilities for local e2e workflows, demo scripts, and future CLI wrappers.

```ts
import {
  createHBuilderXRunner,
} from '@weapp-tailwindcss/hbuilderx-runner'

const hbuilderx = await createHBuilderXRunner({
  channel: 'alpha',
  cwd: projectRoot,
})
console.log(hbuilderx.resolution)

await hbuilderx.prepareProject({ cwd: projectRoot })

const launch = hbuilderx.startLaunch({
  cwd: projectRoot,
  platform: 'app-android',
  args: ['--deviceId', 'emulator-5554'],
})

await launch.stop()
```

The package only stabilizes the HBuilderX invocation layer. It does not handle Tailwind or mini program style transformation.

## Scope

- Resolve stable and Alpha installations through `channel: 'auto' | 'stable' | 'alpha'` or `HBUILDERX_CHANNEL`.
- Bind the native CLI path, the host returned by `listhost`, and the `version --host` result to one runner session so another running edition cannot capture commands.
- Wrap `project open/close`, `launch`, long-running processes, timeouts, recent logs, and process-tree cleanup.
- Classify common failures into `HBuilderXCommandError`, including project recognition failures, config load failures, missing Android/iOS/Harmony toolchains, and timeouts.
- Provide local Android `adb`, iOS Xcode/simulator, and Harmony `hdc` probes for e2e and demo scripts.

## Edition selection

The default channel is `auto`. Resolution uses this precedence:

1. An explicit CLI candidate/path passed to the API;
2. `HBUILDERX_CLI_PATH`;
3. A running instance matching `channel` or `HBUILDERX_CHANNEL`;
4. Default macOS install paths, preferring stable over Alpha in `auto` mode.

The macOS defaults are `/Applications/HBuilderX.app/Contents/MacOS/cli` and `/Applications/HBuilderX-Alpha.app/Contents/MacOS/cli`. Set `HBUILDERX_CLI_PATH` for non-standard Windows/Linux installations.

If one CLI matches multiple hosts, the runner reports an ambiguity instead of guessing. Set `HBUILDERX_HOST` or pass `host` to `createHBuilderXRunner`.

Some HBuilderX releases reject concurrent stable and Alpha processes. The runner never closes an existing instance automatically; it reports `cli-instance-mismatch` when the target edition cannot start, so close the conflicting instance before retrying.

`runPnpmCommand`, `spawnPnpmCommand`, `hbuilderxPnpmArgs`, and the synchronous `startLaunch` remain for compatibility. Use a bound runner when the stable/Alpha choice must be deterministic; the `@dcloudio/hbuilderx-cli` pnpm wrapper performs its own process discovery and cannot provide that guarantee.
