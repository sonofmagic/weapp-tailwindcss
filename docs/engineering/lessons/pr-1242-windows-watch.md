---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1242
baseline: dc05668dddd951b1b74bddf9fca3ae0ccac8bcb1
regressions:
  - scripts/ci/demo-matrix/rollup-file-identity.test.mjs
  - scripts/ci/demo-matrix/rollup-watch.test.mjs
  - scripts/ci/demo-matrix/source-file.test.mjs
  - scripts/ci/demo-matrix/watch.test.mjs
---

# PR #1242：Windows 原子保存后监听停止与 Rsbuild 基线

## 症状

[PR Gate 36111448056](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/36111448056)
在 Windows Taro Vite React、Vue 和 issue-951 项目反复失败。代表作业
[107997020010](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/36111448056/job/107997020010)
完成 production、initial、replace 后，在 add 阶段报告 `Vite has not finished writing this build`。
artifact 的 `result.json` 和 `dev-live.log` 显示第二次保存后根本没有新的 `build started`，
不能把它解释成构建太慢。失败作业有限重跑后仍失败。

Rsbuild React/Vue 的 Node 24 作业也失败，但 Web 的 production、连续更新和刷新全部通过。
实际失败发生在同一作业的 `weapp` 目标：production 基线只记录 `.25rem`，实际还包含等价的 `0.25rem`。

## 根因与纠正

Taro 4.2.1 → Vite 4.5.14 实际解析到 Rollup 3.30.0。
该包内置 Chokidar 的原生文件监听仅在 Linux 上比较 `ino` 并重新绑定句柄。
原子保存用新文件替换旧文件；路径虽然相同，监听的文件身份已变化。
Windows 的文件监听因此可能只报告第一次保存，后续更新消失。
只检查第一轮热更新、延长超时或反复重跑，均不能证明监听持续有效。

新增回归通过 demo 的真实 Vite 依赖加载 Rollup CJS/ESM，显式使用 `fs.watch`，
记录真实句柄绑定时的文件身份；每轮同时检查新产物值和当前文件身份。
macOS 修复前两项均失败：保存后的句柄仍指向旧 `ino`；补丁后两项通过。
此检查不模拟 Windows API，也不把 macOS 结果当成 Windows 通过证据。

`patches/rollup@3.30.0.patch` 同步修改 CJS 与 ESM 的内置监听器：
依据文件身份变化重绑，而非只允许 Linux 重绑。仍使用原生监听与完整原子写入，
不引入 polling、不延长门禁、不跳过 add/restore、不回退到可能读取半份源码的写法。
此补丁只供仓库 demo 工具链消费，不改变已发布的 weapp-tailwindcss 包。

上游背景：[Chokidar #35](https://github.com/paulmillr/chokidar/issues/35)
记录原子替换后后续通知丢失；
[Node 文件身份说明](https://nodejs.org/api/fs.html#inodes)解释了路径与被监听文件身份的区别。
历史 Issue 不是本轮 Windows 根因证明，本轮证据来自失败 artifact 和新增句柄回归。
临时补丁严格限定 Rollup 3.30.0；Taro 升级实际 Rollup 后，应以同一 CJS/ESM 回归和
Windows 连续保存矩阵确认上游修复覆盖，再移除补丁及锁文件登记。

### 第二轮定位：共享监听与两层节流

[5d76b7b4a 的 Windows 京东作业](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/36122744604/job/108031819603)
仍在第二次保存后停止。第一轮修复只证明独立 watcher 会更新 inode，尚未覆盖真实构建中
同一文件同时作为模块和 transform 依赖的情形。
Rollup 为两种依赖各建一个 Chokidar watcher，而它们共享原生 `fs.watch` 句柄。
一个 watcher 解绑后，另一个仍持有旧句柄；前者重绑时重新加入旧容器，两者始终无法关闭旧句柄。
扩展真实模块与 transform 文件依赖回归后，CJS/ESM 均在 `value: 2` 时无新构建；
新增共享依赖的句柄回归也明确显示旧 inode。

将仓库已有 Rollup 4 的单 watcher 设计移植到精确版本 Rollup 3.30.0：
模块和 transform 依赖共用监听，文件事件同时使对应文件依赖及其所属目录依赖失效。
回归覆盖 CJS/ESM、文件/目录、连续三次原子替换及删除恢复。

另一个 Windows 作业在快速保存单测中丢失最后一次更新。
Chokidar 的 50ms change 去重没有区分文件版本；现在只有状态相同的通知合并，
`dev/ino/size/mtimeMs/ctimeMs` 任一变化都会通知。
更底层的 5ms 原生事件节流也可能丢弃新状态；保留节流，但在收到被合并的通知后补读最后状态。
确定性回归使用受控时钟与实际临时文件，修复前仅收到尺寸 2，修复后还必须收到最终尺寸 3。
真实 watch 测试不增加固定等待，也不改用 polling；关闭后的补读回调立即退出。

Rsbuild 两份基线单独重新生成，差异只有 spacing 集合增加 `0.25rem`；
工具类、单位及动态表达式未发生差异。复验保持 `CI=1 --update=none`。

## 验证

```sh
pnpm e2e:demo:matrix web/react-rsbuild-tailwindcss-v4:weapp --update
pnpm e2e:demo:matrix web/vue-rsbuild-tailwindcss-v4:weapp --update
CI=1 pnpm e2e:demo:matrix web/react-rsbuild-tailwindcss-v4:weapp web/vue-rsbuild-tailwindcss-v4:weapp --update=none
CI=1 pnpm exec vitest run -c scripts/ci/demo-matrix/vitest.config.mts scripts/ci/demo-matrix/rollup-file-identity.test.mjs --update=none
CI=1 pnpm test:demo:matrix
CI=1 pnpm e2e:demo:matrix taro-vite-react-tailwindcss-v4:weapp taro-vite-react-tailwindcss-v4:alipay --update=none
pnpm install --frozen-lockfile --offline
CI=1 pnpm e2e:demo:matrix taro-vite-react-tailwindcss-v4:weapp taro-vite-vue3-tailwindcss-v4:jd --update=none
pnpm exec eslint scripts/ci/demo-matrix/rollup-file-identity.test.mjs scripts/ci/demo-matrix/rollup-watch.test.mjs
```

本地：Node 24.18.0、pnpm 12.6.0、macOS。第一轮 86 项矩阵设施回归通过；
Rsbuild 两目标 production、initial、replace、add、restore、refresh 通过。
Taro 微信/支付宝 production、initial、replace、add、restore 通过，static 基线没有差异。
第二轮 94 项矩阵设施回归全部通过；Taro React 微信与 Vue 京东的 production、initial、replace、add、restore
在 `CI=1 --update=none` 下全部通过，static 基线无差异。Windows 以 PR 最新提交的 CI 为准。

## 适用边界

此前把 Windows 超时和 Rsbuild 失败初步归为 runner 时序，证据不足；本记录纠正该推断。
性能基准失败也不能仅凭单次阈值附近采样归为噪声；本轮保留原始结果，限定同 SHA 重跑一次，
重跑通过且不修改阈值。旧 SHA 的成功不替代后续提交的 CI。
本记录不提供真机、Skyline 或全端验收结论。

## 规则评估

不新增 AGENTS 规则。使用实际工具链回归覆盖精确依赖版本，保留首轮失败与修复证据。
