# 本地多端 E2E 验收手册

这份手册是仓库内 H5、微信小程序、Android、iOS、Harmony 本地验收的唯一流程入口。它记录的是可迁移的流程和证据要求，不记录某台电脑的绝对路径、截图或设备名称。换电脑时只需要重新配置工具链和设备 ID。

## 1. 验收分层

按下面的顺序执行，上一层失败时不要直接跳到截图层：

1. **静态矩阵**：确认 demo、平台、构建脚本和覆盖状态登记正确。
2. **构建产物**：检查真实平台后缀、样式文件、safe class、source map 和动态 class。
3. **运行时结构**：确认页面已进入真实运行时，再检查 marker、背景色、文本色、圆角、间距、主题和动态 class。
4. **HMR**：在同一个运行实例中修改源码，确认增量产物、运行时结构和前后截图都发生预期变化。
5. **跨端截图**：只有 H5 与目标端都拿到有效截图且结构探针通过，才计算归一化像素差异。

“构建成功”不等于“运行时通过”，“有截图”也不等于“验收通过”。启动页、旧产物、旧 WebView 或不完整页面都不能作为证据。

## 2. 第一次换电脑的准备

### 2.1 仓库和 Node

```bash
node --version                 # >= 22.12.0
corepack pnpm --version
pnpm install
pnpm prepare
```

本仓库统一使用 `pnpm`，不要用 npm 或 yarn。先构建被本地 HBuilderX 链路依赖的包，再运行 E2E：

```bash
pnpm --filter weapp-tailwindcss build
```

如果新 worktree 出现未追踪的包内 `dist`，只构建缺失的依赖包；不要用清理命令覆盖其他 worktree 的文件。

### 2.2 工具链

至少记录下列版本，写入本次验收记录：

- HBuilderX stable/alpha 版本和 CLI 路径。
- Android SDK platform-tools、`adb` 和设备/模拟器版本。
- Xcode、iOS Simulator、WKWebView/Safari bundle 版本。
- DevEco Studio、Harmony SDK、`hdc` 和设备/模拟器系统版本。
- 微信开发者工具版本和登录状态（仅小程序 IDE 链路需要）。
- Chrome/Chromium 版本（H5 截图链路）。

### 2.3 设备检查

先启动目标设备，再执行：

```bash
adb devices
xcrun simctl list devices booted
hdc list targets
```

预期是每个要验收的平台至少有一个 `device`、Booted 或在线 `hdc` target。没有设备时必须记录为阻塞；不得把跳过、旧截图或构建产物当作通过。

设备选择统一使用环境变量，不把本机 ID 写进源码或测试：

```bash
export E2E_HBUILDERX_ANDROID_DEVICE_ID=emulator-5554
export E2E_HBUILDERX_IOS_TARGET=simulator
export E2E_HBUILDERX_HARMONY_DEVICE_ID=127.0.0.1:5557
```

Harmony 也可以使用 `DEMO_VISUAL_HARMONY_DEVICE_ID`；截图脚本优先读取 `DEMO_VISUAL_HARMONY_SCREENSHOT_DEVICE_ID`。HBuilderX 有多个实例时，用 `HBUILDERX_CHANNEL=stable|alpha` 和 `HBUILDERX_HOST=<listhost 返回的 host>` 消除歧义。

## 3. 固定执行顺序

### 3.1 静态矩阵和快照

先验证矩阵登记和静态快照：

```bash
pnpm exec vitest run -c ./e2e/vitest.e2e.config.ts \
  e2e/e2e-matrix.test.ts

E2E_PROJECT_FILTER="<demo>" pnpm e2e:static
```

如果修改了 demo、issue 复现页或样式输出回归用例，必须重新生成对应 static 快照/产物基线，并在提交或 PR 中记录命令和项目名。没有确认预期差异时不要使用 `-u` 批量更新快照。

多平台静态产物使用：

```bash
E2E_MULTIPLATFORM_BUILD_CASE="<demo> <platform>" \
  pnpm e2e:multiplatform-build
```

检查真实输出后缀和目录，不要假设所有平台都有 `app.wxss`：小程序可能是 `app.acss`、`app.ttss`、`main.wxss` 或分包样式；App 可能是 `.debug/bundle-post/chunk`、`dist/dev/app-plus` 或 `unpackage/dist/dev/app-harmony`。

### 3.2 H5 和微信小程序

在需要使用 DevTools/automator 的机器上，先确认共享启动治理没有重复 launch：

```bash
node --import tsx scripts/check-e2e-ide-shared-launch.ts
```

HBuilderX demo 使用底层本地入口：

```bash
pnpm e2e:hbuilderx:h5
pnpm e2e:hbuilderx:mp
```

普通 Vite demo 使用项目自身的 `dev:*`/`build:*` 脚本。H5 需要浏览器页面和最终 CSS 都通过结构探针；小程序需要真实 DevTools/headless runtime、WXML 和可达样式文件都通过。小程序 IDE 链路不要反复启动 automator，同一 suite 复用连接并用 `miniProgram.reLaunch(...)` 切页。

### 3.3 Android、iOS、Harmony

先做 HBuilderX 本地结构/HMR，再做截图：

```bash
pnpm e2e:hbuilderx:local:android
pnpm e2e:hbuilderx:local:ios
pnpm e2e:hbuilderx:local:harmony

pnpm e2e:android:hmr
pnpm e2e:ios:hmr
```

切换 Android/iOS/Harmony 前先停止上一个 HBuilderX 运行任务，再重新 launch。确认日志出现真实运行时信号（例如 `App Launch`），并确认页面不是 HBuilderX 启动页。App 产物路径必须从 runner 输出和实际文件确认，不能把 Android 的 `app-plus` 路径套给 Harmony。

### 3.4 视觉报告

单端排障优先使用过滤和单平台参数，避免前一次运行覆盖另一平台证据：

```bash
DEMO_VISUAL_FILTER=<demo> \
pnpm exec tsx scripts/demo-visual-e2e-report.ts --h5-only --fail-on-incomplete

DEMO_VISUAL_FILTER=<demo> \
pnpm exec tsx scripts/demo-visual-e2e-report.ts --weapp-only --fail-on-incomplete

DEMO_VISUAL_FILTER=<demo> \
pnpm exec tsx scripts/demo-visual-e2e-report.ts --android-only --fail-on-incomplete

DEMO_VISUAL_FILTER=<demo> \
pnpm exec tsx scripts/demo-visual-e2e-report.ts --ios-only --fail-on-incomplete

DEMO_VISUAL_FILTER=<demo> \
DEMO_VISUAL_HARMONY_DEVICE_ID=<device-id> \
pnpm exec tsx scripts/demo-visual-e2e-report.ts --harmony-only --fail-on-incomplete
```

Issue 或跨端验收使用统一门槛：

```bash
DEMO_VISUAL_FILTER=<demo> \
DEMO_VISUAL_MAX_CROSS_PLATFORM_DIFF_RATIO=0.05 \
pnpm exec tsx scripts/demo-visual-e2e-report.ts --fail-on-incomplete
```

报告和截图默认位于：

```text
e2e/.artifacts/demo-visual/full/report.json
e2e/.artifacts/demo-visual/full/report.md
e2e/.artifacts/demo-visual/full/screenshots/<demo>/<platform>/
e2e/.artifacts/demo-visual/full/diffs/
```

`ratio <= 0.05` 只表示像素差异通过门槛，不能替代结构探针。缺少 H5/目标端任一截图、页面未就绪、marker 不匹配或结构探针失败时，必须判定为未完成。

## 4. 结构探针和截图判定

每个跨端 case 至少检查：

- `template corpus radial`。
- `space item 1`、`space item 2`。
- `apply corpus`。
- `issue 902 theme variable`。
- 关键背景色、文本色、圆角、间距、字体尺寸和动态 class。

App 端同时检查 transformed output、compiled style output 和真实截图。raw class 只能作为兼容探针；最终产物优先检查 safe class，例如 `dark_cbg-*`、`text-_b..._B`。H5 通过浏览器计算样式和结构探针，小程序通过 WXML/运行时节点和 reachable style 文件，Harmony 通过 `hdc` 截图和 runner 结构探针。

HMR 必须满足三件事：增量产物包含新 class、运行时页面发生预期变化、前后截图存在可解释的 diff。只有产物变了但截图没变，或截图变了但 marker 不对，都不能判定 HMR 通过。

## 5. VDOM、Vapor 和 Harmony 特别规则

- HBuilderX 日志中的 `VDOM模式` 或明确的 Vapor 标识才是模式证据；不要根据文件名猜测模式。
- 当前仓库 runner 有 Harmony VDOM 本地链路，但没有通用的 Vapor CLI 切换参数。没有独立 Vapor 日志和截图时，PR 必须写“Vapor 未取得”，不能把 VDOM 结果代替 Vapor。
- Harmony 常见输出包括 `unpackage/dist/dev/.app-harmony`、`unpackage/dist/dev/app-harmony`、`.uvue/app-harmony` 和 HBuilderX 临时 chunk；以本次 runner 实际发现的 ready output 为准。
- `hdc list targets` 为空、HBuilderX 无法启动目标、ArkTS 编译失败或截图停留在启动页，均属于设备/工具链阻塞，不要修改验收阈值掩盖问题。

## 6. 常见阻塞的记录方式

先判断分歧发生在哪一层：

1. **工具链**：CLI、设备、模拟器、IDE 登录或端口不可用。
2. **编译器**：HBuilderX/UTS/ArkTS 报语法或平台限制。
3. **构建图**：产物缺失、样式入口未进入构建图、source map 不完整。
4. **运行时**：页面未就绪、旧基座、旧 WebView、runtime bridge 或 marker 失败。
5. **视觉探针**：页面可见但颜色/圆角/间距/主题/HMR 未达到预期。

例如 `Invalid declaration: '!'` 是 HBuilderX/UTS 对前置重要修饰符的编译阻塞，不应被误写成 weapp-tailwindcss 样式合并失败；`/uvue.wxss` 缺失是 style isolation 资源解析阻塞；H5 theme-dark、Android HMR 或 iOS marker 失败应分别记录具体探针和截图路径。

每次阻塞至少记录：

```text
平台与模式：
demo：
命令：
工具链版本：
设备 ID：
首次失败层级：工具链/编译/构建图/运行时/视觉
原始错误或探针：
已生成产物：
截图/报告路径：
是否可由另一台电脑复现：
```

## 7. 证据和提交前检查

提交前运行：

```bash
git status --short --branch
git diff --check
pnpm exec vitest run -c ./e2e/vitest.e2e.config.ts e2e/e2e-matrix.test.ts
```

只提交源码、测试、规则/手册和必要的 changeset。`e2e/.artifacts`、设备截图、HBuilderX 临时目录和本机日志默认不提交；在 PR 中提供报告路径、命令摘要和阻塞原因即可。所有新增 demo 或 static fixture 的改动必须同时更新对应基线。

这份手册发生流程变化时，先修改本文件，再同步根 `AGENTS.md`/`e2e/AGENTS.md` 的入口或约束；不要把同一条设备经验复制到多个互相漂移的文档中。
