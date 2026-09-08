---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/issues/1144
baseline: be518d94790c29aad401220b5cdb2a5d23173d5f
regressions:
  - e2e/release-1144.test.ts
  - e2e/issue-1160-static.test.ts
  - e2e/issue-1160-mini-static.test.ts
  - e2e/issue-1164-static.test.ts
  - e2e/issue-1166-webpack-radius.test.ts
---

# npm 5.5.2：五项 Issue 的独立发布包验收

2026-09-08，基线为发布提交 `be518d94790c29aad401220b5cdb2a5d23173d5f`，独立分支 `codex/verify-npm-5-5-2`。被测产品全部来自 npm registry；没有构建本地产品包，没有 workspace 链接或本地 override。测试工具来自该提交的仓库。

## 症状

本轮分别检查 #1144 Web 连续保存、#1159 Windows 标准 utility、#1160 跨端单边边框、#1164 Harmony SCSS 注释与样式、#1166 旧 calc 的 infinity 警告。不能以“main 合并且已发布”替代发布包消费验证。

## 根因与纠正

- **#1144 尚未彻底修复**：原始 setup 通过 16 轮保存和两次刷新，但 Options 同服务在第 9 轮切换 style 块时失败。`style&index=1&lang.css` 子请求再次交给 PostCSS 整段模板，返回 HTTP 500；marker 停在第 8 轮。这替代 [上一轮 alpha 记录](uni-app-x-alpha-hmr.md) 中“未复现需要新增产品解析补丁的失败”在 **npm 5.5.2** 上的适用结论。上一轮本地构建通过是历史事实，不能冒充发布包通过。本轮仅记录首次偏离，尚未判定负责的具体缓存或生命周期根因。
- **#1160 发布包通过**：Android、H5、iOS、Harmony 和微信隔离组件的原问题探针正确，微信通过组件自身作用域读取 12 组计算边宽。
- **#1159 发布包通过**：Windows Node 22/24 原生开发首编译和生产构建都通过，与之前 5.5.1 的失败对照形成发布后的闭环。
- **#1164 原帖样式通过**：四组 SCSS、圆角和未设置 `w-full` 的宽度均正确，连续修改后无需重装恢复。增量仍重启；完全不加载插件的原生 CSS 对照同样重启，不能宣称纯 HMR 或状态保持。
- **#1166 发布包通过**：旧 calc 对原始表达式报错，npm 5.5.2 在交给外部 loader 前生成有限圆角；Taro 生产/watch 和 Web 对照均通过。

## 发布身份

下载 npm tarball 后独立计算 SHA-512，与 registry integrity 完全一致：

```text
https://registry.npmjs.org/weapp-tailwindcss/-/weapp-tailwindcss-5.5.2.tgz
sha512-w66TSQYvq/UJ45sB9ACOmanML2apasU0fU8Du5UQQ80NMB180TX4BoDvdvoXXhoTygYG+w2aubB8BiQaMzpSiw==
sha1 ce55e8b1e6b900f65ce63bfe6c541a952da6084d
```

三个本地外部消费目录为 `issue-1144-uni-app-x-web`、`uni-app-x-vdom-tailwindcss-v4`、`taro-radius`。实际产品入口均位于各自 `node_modules/.pnpm/weapp-tailwindcss@5.5.2_…/node_modules/weapp-tailwindcss`，其 PostCSS 为 registry `@weapp-tailwindcss/postcss@3.3.3`。关键依赖包括 `@tailwindcss-mangle/engine@0.2.0`、`@weapp-core/escape@8.0.0`、shared/logger 2.0.3、reset 0.1.4、weapp-style-injector 1.0.5。完整解析路径与直接依赖版本保存于本地 `published-resolutions.json`，锁文件保留在消费目录。Tailwind 为 4.3.3。

隔离安装取消新发布包时龄限制，明确允许 esbuild 安装脚本；未更改仓库锁文件。uni 外部项目补齐原先从 monorepo 继承的 `sass-embedded@1.98.0`。安装策略错误、缺少 predev 脚本、缺少 Sass 是安装/测试准备失败，分别保留在工作记录，不归为产品回归。1144 的 predev 仅检查版本，不构建本地包。

## 验证

### #1144

HBuilderX **5.25.2026082902-alpha**，host `HBuilderX`，Web VDOM；浏览器为本机 Chrome，服务 identity 断言绑定外部项目真实路径。每种脚本模式各启动一个服务，在该服务内连续保存、刷新。

```sh
pnpm exec cross-env CI=1 HBUILDERX_CHANNEL=alpha HBUILDERX_HOST=HBuilderX E2E_RELEASE_PROJECT_ROOT="<独立1144消费目录>" E2E_HBUILDERX_WEB_TIMEOUT_MS=45000 pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/release-1144.test.ts --update=none
```

结果：setup 1 项通过，Options 1 项失败。setup 的 16 份当前 marker、实际 class、CSS、计算样式与截图完整，真实 `pt.root`、important 与 style 切换均通过，两次刷新通过。Options 前 8 轮通过，第 9 轮失败，未完成该模式两次刷新门槛。

关键原始错误（15:04:58）：

```text
[plugin:vite:css] [postcss] …/pages/index/index.uvue?vue&type=style&index=1&scoped=00a60067&lang.css:10:7: Unknown word
10 | {{ theme.themeClass }} · {{ theme.modePreference }} · {{ theme.resolvedMode }}
HTTP 500 /pages/index/index.uvue?t=1788851098196&vue&type=style&index=1&scoped=00a60067&lang.css
[hmr] Failed to reload /pages/index/index.uvue
```

失败目录 `e2e/.artifacts/web-hmr/issue-1144-uni-app-x-web-1788851084223`；setup 成功目录 `…-1788851143603`。包含完整 server.log、诊断、identity、每轮 CSS/JSON/截图、最终页面。没有过滤 Sass/PostCSS 错误或放宽断言。

### #1159

专门增加 `WEAPP_TW_VERIFY_PUBLISHED_VERSION=5.5.2` 验收入口，禁止更新基线；默认的历史双版本对照行为保留。验证分支的 workflow 只运行本轮 npm 专项，不用于合并。

```sh
pnpm exec cross-env CI=1 WEAPP_TW_VERIFY_PUBLISHED_VERSION=5.5.2 pnpm e2e:windows-utilities
```

[GitHub 运行及三个 artifacts](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34197463566)，全部下载核验：

| 系统 | Node | Taro / Tailwind / 主包 | 开发首编译 | 生产构建 |
| --- | --- | --- | --- | --- |
| Windows | 22.23.2 | 4.2.1 / 4.3.3 / 5.5.2 | 通过 | 通过 |
| Windows | 24.19.0 | 同上 | 通过 | 通过 |
| macOS CI | 24.18.0 | 同上 | 通过 | 通过 |
| macOS 本机 | 24.18.0 | 同上 | 通过 | 通过 |

六个标准 utility、`--spacing:8rpx`、任意值和透明色与最终 JS/WXSS 对应，复用原有 expected.json，未更新快照。Windows 实际入口位于 `C:\Users\RUNNER~1\AppData\Local\Temp\weapp-1159 space-…\project\node_modules\.pnpm\weapp-tailwindcss@5.5.2_…`；没有本地打包候选替代产品。运行 artifacts 含 resolution、锁文件、report、原始日志及最终产物。

### #1160

HBuilderX 同一 alpha 编译器。Android 11 模拟器、iOS 26.5 iPhone 17 Pro 模拟器、Harmony Pura 90（OpenHarmony 6.1.1.125），以及 H5 的 12 个探针都取得正确运行画面：原始组合、native、top/right/bottom/left、pair、all、override、dashed、none、apply。未指定边宽为零，作者规则未被 reset 覆盖。Android 与 H5 同会话完成 top 1px→4px→1px；Android 更新会重新触发 App Launch，未声称状态保持。

H5 用浏览器 computed style 逐边断言，HBuilderX 微信产物用可达组件 WXSS 逐条匹配并与既有快照比较。Harmony 首次截图时进程发生切换，该次捕获判失败并保留；停止竞争编译后重新独立启动取得稳定 PID 32519 的完整结构/截图。

```sh
pnpm exec cross-env CI=1 E2E_RELEASE_PROJECT_ROOT="<独立uni消费目录>" pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/issue-1160-static.test.ts e2e/issue-1164-static.test.ts --update=none
pnpm exec cross-env CI=1 HBUILDERX_CHANNEL=alpha HBUILDERX_HOST=HBuilderX E2E_ISSUE_1160_MINI=1 E2E_RELEASE_PROJECT_ROOT="<独立uni消费目录>" pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/issue-1160-mini-static.test.ts --update=none
```

H5 两项和微信静态一项通过；未启用的 #1164 Harmony/微信静态入口在该 H5 调用中是跳过，不计通过。设备验收采用实际运行产物与截图，单列于下文证据索引。

微信开发者工具 Stable 2.02.2608060、基础库 3.16.2 的首次启动曾报 `simulator launch failed`；仅关闭并重开本次测试项目后恢复。常规 automator `page.$` 与全局 selector query 无法穿透本页组件作用域，返回空；从本次页面 `$vm.$children` 找到真实 `components/issue-1160-border/issue-1160-border` 的 `$scope`，使用 `wx.createSelectorQuery().in(scope)` 读取 12 个节点的四边计算宽度，结果与下表一致。节点均有非零布局，截图与 WXSS 对应。未修改编译输出、样式或边宽断言；这属于验收查询修正。

| 探针 | 上/右/下/左（px） |
| --- | --- |
| original / native / top / apply | 1 / 0 / 0 / 0 |
| right | 0 / 1 / 0 / 0 |
| bottom | 0 / 0 / 1 / 0 |
| left | 0 / 0 / 0 / 1 |
| pair | 1 / 0 / 0 / 2 |
| all | 2 / 2 / 2 / 2 |
| override | 0 / 2 / 2 / 2 |
| dashed | 1 / 0 / 0 / 0 |
| none | 0 / 0 / 0 / 0 |

实际记录：`mini-selector.json`、`mini-runtime.png`、`mini-scoped-final.log`；早先的启动及查询失败日志一并保留。

### #1164

Harmony VDOM，DevEco Studio 6.1.1.280，HBuilderX 5.25 alpha。四个组件分别为空白 SCSS、行注释、块注释、作者 CSS。每轮保存源码、编译 JS 的 style 对象、布局 marker、截图、PID 和完整启动日志。

| 轮次 | 四组产物与画面 | 设备 PID |
| --- | --- | --- |
| 初始 | 橙色、高 100px、48px 红圆，作者 padding 12px | 19987 |
| 删除行注释 | 当前四组 marker 更新，背景/高度/圆角保持 | 20111 |
| 加回注释并修改 | 蓝色 #0055ff、高 120px、圆角 12px；作者 padding 20px | 21195 |
| 恢复 | 橙色、高 100px、红圆、作者 padding 12px；当前 restored marker | 22266 |

所有轮次无 `w-full` 的橙色对照也正常占据父宽。四组编译对象均与当前 marker/设备画面对应；连续更新期间没有失败后重装。首次启动正常安装不等于更新时重装。

完全禁用插件的 [原生对照](../../../e2e/fixtures/issue-1164-native/README.md) 同样在真实外部目录运行，配置仅 `uni()`。初始 PID 25605，点击状态按钮后 state=1；删除行注释后 PID 25666，state=0；蓝色/120px/12px 后 PID 27698；恢复后 PID 29138。每轮仍能正确呈现四组样式，日志均为热更新完成后 App Launch，没有失败后重装。

因此按用户确认的原帖样式标准判定修复；**Harmony 增量重启属于另行观察到的运行链路限制，纯 HMR 与状态保持未通过**。本轮未修改插件语义使测试变绿。

### #1166

```sh
pnpm exec cross-env CI=1 E2E_RELEASE_PROJECT_ROOT="<独立1144消费目录>" pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/issue-1166-webpack-radius.test.ts --update=none
```

独立目录安装真实 `postcss@8.5.28`、`postcss-calc@8.2.4`、`postcss-pxtransform@4.2.1`、Tailwind 4.3.3，不继承仓库 calc override。先断言原始 `calc(infinity * 1px)` 经 pxtransform 成 `calc(infinity * 2rpx)`，旧 calc 的 warnings 含 `Unrecognized text`。然后通过 npm 5.5.2 的 Webpack→pxtransform→calc 链，原警告消失，圆角为有限合法 rpx；Web 目标仍保留原 infinity CSS。2 项通过。

另在独立 Taro 4.2.1 消费目录，用同一主包 5.5.2、Tailwind 4.3.3 和 fixture 配置添加 `rounded-full rounded-t-full rounded-s-full`，执行生产构建及 watch 初始/修改 marker/恢复 marker。四次产物均含当前 JS marker，五项圆角声明均为 `9999rpx`，无 infinity 和目标词法警告。原始 loader 测试负责真实旧解析器对照，Taro 负责实际构建与 watch；不把两条链的依赖来源混为一谈。

## 适用边界

本轮没有修改产品源码或发布包，没有更新任何 static 快照，没有发布 npm、合并代码。验收入口和本记录保存在独立分支；workflow 仅为该分支专项运行，不作为通用 PR workflow 合并。

本地证据统一位于 `e2e/.artifacts/release-5.5.2/`：`1144-alpha.log`、`published-resolutions.json`、`tarball-verification.json`、`ci/`、`android-*.png/xml`、`ios-initial.png`、`h5-borders.json`、`harmony-*/`、`native-*/`、`1166-loader.log`、`radius-taro/`。1144 原始每轮证据另见前述 web-hmr 目录。原始日志与设备截图按仓库规则不提交，记录的值均来自本轮发布包验收。

验收工具检查：定向 ESLint 通过；matrix / 1144 runner / HMR lifecycle 共 46 项通过；`pnpm agents:check` 45 份规则、9 份文档、225 条命令，0 错误；`git diff --check` 通过。未用产品构建或全仓类型检查代替发布包验证。

## 规则评估

不新增规则。已有规则已要求发布身份、实际运行、marker/产物/计算样式对应、禁止自动重装计作纯 HMR。本轮补足精确 npm 版本入口，并用失败记录纠正旧环境结论的外推。
