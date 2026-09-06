# Demo 三系统验收

清单以 [catalog.mjs](./catalog.mjs) 为准，包含全部 28 个 demo、107 个可移植 CLI 目标组合。每个组合在 Windows、macOS、Linux 的 Node 24 上执行；Node 22 覆盖 Taro Vite/Webpack React/Vue、uni、Mpx、Gulp、weapp-vite、Rsbuild React、Nuxt 的关键入口，共 159 个 job。清单测试会核对 demo manifest，新增 demo 或构建脚本未登记时失败。

## 验收边界

| 类型 | 验收内容 | 边界 |
| --- | --- | --- |
| utilities | 生产静态基线、普通 dev 首编译、同一进程替换/新增/删除、Web 刷新及计算样式 | 小程序仅检查真实模板/JS 消费的类名和可达样式图，不代替 IDE 或设备运行 |
| authored-styles | 样式注入 demo 的生产、dev、连续修改及 Web 刷新 | 这些 demo 没有 Tailwind 生成接入，只验证其已有样式注入能力 |
| native-build | Taro RN CLI 构建、实际应用注册及页面探针进入 bundle | 保持 disabled 配置，不提供 utility 样式或 Android/iOS 设备覆盖 |
| webview-build | Taro harmony-hybrid、uni app 的 CLI 构建及 utility 产物 | 不提供原生桥接或设备运行证据 |
| HBuilderX 专属 | uni-app-x-vapor 在清单中明确登记 | 无可移植 CLI，不加入成功计数；Harmony IDE/设备验收另行执行 |

普通 utility 同时检查 `h-8`、`h-20`、`h-50`、`mt-2`、`flex`、`text-slate-500`、spacing 定义或内联值一致性，以及任意值和透明色对照。期望间距来自配置与实际产物，按倍数检查，不能拿某个模板的默认数值套用所有 demo。页面探针同时具有唯一 id、本轮标记、文本和真实 class 属性，孤立字符串不能充当消费证据。

静态基线只记录探针实际引用的 spacing 变量；已内联的规则检查数值与倍数，主题中残留的未使用声明不参与等价比较。完整 CSS 仍随 artifact 保存；任何规则引用 `var(--spacing)` 却没有定义时必须失败。

Taro 目标包括 weapp、swan、alipay、tt、h5、qq、jd、harmony-hybrid、rn；分包 demo 按现有脚本覆盖五个目标。uni 主 demo 覆盖九个小程序、H5/SSR、三种 quickapp-webview 和 app；其他 uni demo 按现有 CLI 登记。Mpx 覆盖 wx/ali/swan/tt/dd，Gulp 覆盖 weapp/tt，Web Vite/Webpack/Rsbuild 同时覆盖 web/weapp 模式，另含 Vite 7 和 Nuxt。

## 本地执行

```sh
pnpm install --frozen-lockfile
pnpm build:ci
pnpm exec playwright install chromium
pnpm test:demo:matrix
pnpm e2e:demo:matrix taro-vite-react-tailwindcss-v4:swan
```

更新指定目标基线必须显式执行，然后执行不更新的同一命令：

```sh
pnpm e2e:demo:matrix issue-uview-plus-cssentries:mp-alipay --update
pnpm e2e:demo:matrix issue-uview-plus-cssentries:mp-alipay
```

运行器临时向已登记源码插入探针，在 finally 中恢复。不要在同一 demo 上并发运行测试或编辑。`--build-only` 仅供本地诊断，不能当作完整通过，CI 禁止使用它和 `--update`。

源码修改先完整写入同目录临时文件，再原子替换目标文件，保留现有权限。真实 watcher 回归检查连续替换时只读到完整版本，避免文件截断与写入之间触发编译。

开发验收使用 demo 默认 watcher，不强加 Watchpack 或 Chokidar polling。短间隔磁盘轮询会将 Webpack 虚拟模块反复报告为缺失，使慢编译持续空转；真实虚拟模块回归要求空闲时稳定、实际更新后重建并再次稳定。Windows 专项连续执行三次完整 H5 流程，额外保存失效事件来源与 watcher 身份。

静态语义基线位于 `e2e/__snapshots__/demo-matrix/`；完整产物、版本、SHA、执行命令、阶段结果、构建日志和浏览器截图位于 `e2e/.artifacts/demo-matrix/`。`DEMO_MATRIX_ARTIFACT_DIR` 可指定本地输出目录。

浏览器就绪要求探针出现、本地 script/stylesheet 请求结束和开发更新通道握手；不要求后台请求或开发遮罩达到全页面 networkidle。逐轮验收继续检查真实 CSS、DOM、类名和计算样式。

## PR Gate

[demo-matrix.yml](../../../.github/workflows/demo-matrix.yml) 在各操作系统冻结安装 pnpm 11.25.0 锁文件并构建当前包。所有目标必须执行成功；最终 gate 对照清单检查每个 OS/Node/目标和全部阶段、提交 SHA、pnpm 版本，不接受缺失、重复、过期或跳过的报告。PR Gate 对启用的矩阵要求 success。CI 证据只对报告中的具体提交有效，本机通过不能替代 Windows/Linux 验收。
