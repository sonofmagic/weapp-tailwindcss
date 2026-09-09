---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1173
baseline: d17489eca1b038d0fd9b5fbfde69b8d187e4a51a
regressions:
  - scripts/ci/demo-matrix/rollup-invalidation.test.mjs
  - scripts/ci/demo-matrix/rollup-watch.test.mjs
  - scripts/ci/demo-matrix/browser-hydration.test.mjs
verification:
  - claim: uview Linux 小程序保存到 add 阶段后不再触发编译
    kind: ci
    status: failed
    sha: d17489eca1b038d0fd9b5fbfde69b8d187e4a51a
    environment: GitHub ubuntu-latest，Node 24，pnpm 12.3.4
    url: https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34339329577/job/102427989877
  - claim: macOS uni-app SSR 初始探针通过但 replace 阶段仍读取旧探针
    kind: ci
    status: failed
    sha: d17489eca1b038d0fd9b5fbfde69b8d187e4a51a
    environment: GitHub macos-latest，Node 24，pnpm 12.3.4
    url: https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34339329577/job/102427986893
  - claim: 两个实际 Rollup 消费链与延迟 Vue hydration 回归通过
    kind: integration
    status: passed
    sha: d17489eca1b038d0fd9b5fbfde69b8d187e4a51a
    environment: macOS，Node 24.18.0，pnpm 12.3.4，基线加本次未提交补丁
    command: CI=1 pnpm test:demo:matrix
---

# demo watcher 补丁覆盖与 SSR 验收起点

## 症状

修复 pnpm 12 启动兼容后，PR Gate 的 187 项检查通过，但两组 portable demo 失败。
uview 在 Linux 的 mp-weixin/mp-alipay 均完成 initial 和 replace，随后 add 不再出现新编译日志。
macOS uni-app SSR 已建立 Vite WebSocket 连接、能够看到服务端 HTML 和计算样式，
但 replace 之后页面仍是旧探针，浏览器只记录了 CSS 热更新。

## 根因与纠正

uview 通过 Vite 7 消费 Rollup 4.63.1，普通 uni-app 通过 Vite 5 消费带补丁的 4.63.0。
原有回归只解析后者，因而没有覆盖新版本中仍存在的变更通知丢失及 transform watcher 问题。
将相同 watcher 修复按 4.63.1 的源码上下文单独生成补丁，并让回归解析两个 demo 的真实依赖，
覆盖 CJS/ESM、文件/目录 transform 依赖、连续原子保存、删除及重建。
不将补丁泛化到未经测试的未来版本，也不新增全局 Rollup override。

SSR 验收存在独立的时序缺口：服务端探针和开发连接先于客户端异步页面模块就绪。
新增真实 Vue 延迟 hydration 对照，旧 runner 在 mounted 之前返回，新 runner 等待探针所属组件挂载后再保存。
该等待仅用于已注册的 uni-app SSR 场景；保留原有每轮文本、类消费、计算样式和刷新断言。
对照证明验收起点存在缺陷，不能单凭一次 macOS 通过断言已排除全部远端 SSR 故障。

## 验证

- 未打补丁的 4.63.1 通知去重回归失败，补齐后通过；两个版本的 CJS/ESM 实际 watcher 回归通过。
- 真实延迟 Vue hydration 回归在旧 runner 下失败，新 runner 下通过。
- `CI=1 pnpm test:demo:matrix`：59 项通过。
- `pnpm install --frozen-lockfile`：通过。锁文件语义比对确认只增加补丁标识与 Rollup 直接依赖引用；包版本、peer 选择、integrity、catalog 和其他元数据保持不变。
- uview mp-weixin 的 production、initial、replace、add、restore，以及 uni-app SSR 的完整保存和刷新流程通过既有基线。

原始日志在忽略目录 `e2e/.artifacts/pr-1173-ci/`。一次本地 uview mp-alipay 首次编译停在
Tailwind 初始化后、未输出编译完成，内部卡点未知；该现象不同于远端已经完成 replace 后不再编译，
保留日志并增加 Vite 阶段日志检查，随后 mp-alipay 的 production 与四轮保存通过。该次通过没有定位此前首次编译超时的内部原因，不用前置超时替代原始故障定位。
首次尝试复用 4.63.0 补丁文件时，pnpm 严格应用因源码行位置变化失败，现已使用独立 4.63.1 补丁。
重新解析锁文件还带入无关 peer 选择变化，因此仅保留本次所需的 pnpm 生成补丁标识和直接引用，并冻结复验。

## 适用边界

本轮未修改 demo、样式 fixture 或 static 基线；运行既有断言，不降低验收范围。
Vue 挂载状态是开发版运行时能力，此内部验收模式不适用于生产站点。
Windows/Linux 真实进程结论需以最新提交的对应 CI 为准；原生 HBuilderX CLI 与交互桌面验收状态不变。

## 规则评估

不新增 AGENTS 规则。把依赖升级消费链检查落实到实际 demo 解析的 watcher，并用真实 Vue hydration 测试约束验收起点。
