# weapp-tailwindcss 编译插件热更新测试设计方案

## 1. 背景与目标

### 1.1 项目背景

weapp-tailwindcss 是一个支持多构建工具（Webpack/Vite/Gulp/Rollup）的小程序 TailwindCSS 适配插件，支持多个主流小程序框架（Uni-app/Taro/Mpx/原生）。项目采用 monorepo 架构，核心编译插件位于 `packages/weapp-tailwindcss`。

### 1.2 测试目标

- 实现对所有编译插件的热更新功能完整测试覆盖
- 确保代码覆盖率达到 100%
- 覆盖所有热更新场景与边界条件
- 验证缓存机制、增量编译、运行时类集刷新等核心逻辑

### 1.3 热更新机制概述

项目的热更新机制主要包含三个层次：

- **TailwindCSS Patcher 刷新**：通过 `refreshTailwindcssPatcher` 清除缓存并重建 patcher 实例
- **运行时类集同步**：通过 `ensureRuntimeClassSet` 强制刷新或复用缓存的类名集合
- **构建工具集成**：Vite 的 `handleHotUpdate`/`watchChange`、Webpack 的 watch 回调、Gulp 的流式监听

## 2. 测试范围划分

### 2.1 核心模块

#### 2.1.1 TailwindCSS Runtime 模块

测试文件位置：`packages/weapp-tailwindcss/test/tailwindcss/runtime.test.ts`

功能覆盖点：

- `createTailwindPatchPromise` - 创建补丁应用 Promise
- `refreshTailwindRuntimeState` - 刷新运行时状态
- `collectRuntimeClassSet` - 收集运行时类集
- `invalidateRuntimeClassSet` - 缓存失效机制

#### 2.1.2 Context 刷新机制

测试文件位置：`packages/weapp-tailwindcss/test/context/refresh.test.ts`

功能覆盖点：

- `getCompilerContext` 中的 `refreshTailwindcssPatcher` 函数
- 缓存清理流程 `clearTailwindcssPatcherCache`
- Patcher 对象更新机制
- Symbol 标记的刷新函数注册

#### 2.1.3 Cache 模块

测试文件位置：`packages/weapp-tailwindcss/test/cache/hot-update.test.ts`

功能覆盖点：

- `processCachedTask` 的缓存命中与失效
- 缓存键生成与比对
- 强制刷新与增量更新模式切换

### 2.2 构建工具插件

#### 2.2.1 Vite 插件

测试文件位置：`packages/weapp-tailwindcss/test/bundlers/vite-hot-update.test.ts`

功能覆盖点：

**生命周期钩子**

- `configResolved` - 配置解析完成后的初始化
- `buildStart` - 构建开始时的类集预加载
- `handleHotUpdate` - 开发模式文件变更热更新
- `watchChange` - watch 模式文件监听
- `generateBundle` - 生成 bundle 时的资源处理

**场景覆盖**

- 开发服务器模式（command: 'serve'）
- 生产构建模式（command: 'build'）
- Watch 构建模式（build.watch 启用）
- 非 Watch 构建模式

**uni-app-x 特殊处理**

- `.uvue` 文件热更新
- `.nvue` 文件热更新
- 强制运行时刷新策略
- CSS 预处理器兼容

#### 2.2.2 Webpack 插件

测试文件位置：

- `packages/weapp-tailwindcss/test/bundlers/webpack-v5-hot-update.test.ts`
- `packages/weapp-tailwindcss/test/bundlers/webpack-v4-hot-update.test.ts`

功能覆盖点：

**Watch 模式集成**

- Compilation hooks 生命周期
- 文件依赖追踪
- 增量编译触发
- 缓存持久化策略

**Loader 热更新**

- `weapp-tw-runtime-classset-loader` 的运行时集合注入
- `weapp-tw-css-import-rewrite-loader` 的 CSS 导入重写
- Loader 缓存机制
- 增量转换与全量重建切换

**多框架适配**

- Taro Webpack 场景
- Uni-app Webpack 场景
- Mpx 特殊 loader 顺序

#### 2.2.3 Gulp 插件

测试文件位置：`packages/weapp-tailwindcss/test/bundlers/gulp-hot-update.test.ts`

功能覆盖点：

**流式处理**

- Watch 模式文件监听
- 增量转换策略
- 运行时集合惰性初始化
- 扩展名解析逻辑

**资源类型处理**

- WXML/HTML 模板
- WXSS/CSS 样式
- JS/TS 模块

### 2.3 集成测试

测试文件位置：`packages/weapp-tailwindcss/test/integration/hot-update.test.ts`

真实项目场景覆盖：

- uni-app 项目热更新
- Taro 项目热更新
- Mpx 项目热更新
- 原生小程序项目热更新
- TailwindCSS v3/v4 兼容性

## 3. 测试用例设计

### 3.1 Runtime 模块测试用例

#### 3.1.1 基础功能测试

| 用例 ID | 测试场景                      | 输入条件                                   | 期望输出                                              |
| ------- | ----------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| RT-001  | 创建补丁 Promise              | 有效的 twPatcher 对象                      | 返回 Promise，patch 被调用，缓存失效                  |
| RT-002  | 刷新运行时状态（force=true）  | 状态对象、force=true                       | refreshTailwindcssPatcher 被调用，patchPromise 被更新 |
| RT-003  | 刷新运行时状态（force=false） | 状态对象、force=false                      | 不触发刷新，返回 false                                |
| RT-004  | 收集类集（首次）              | twPatcher、force=false                     | 调用 extract，缓存结果                                |
| RT-005  | 收集类集（缓存命中）          | twPatcher、force=false、已有缓存且签名相同 | 返回缓存值，不调用 extract                            |
| RT-006  | 收集类集（强制刷新）          | twPatcher、force=true                      | 调用 refreshTailwindcssPatcher，重新 extract          |

#### 3.1.2 边界条件测试

| 用例 ID | 测试场景                   | 输入条件                             | 期望输出                               |
| ------- | -------------------------- | ------------------------------------ | -------------------------------------- |
| RT-007  | 缓存失效（签名变化）       | 配置文件内容变化导致签名不同         | 重新 extract，更新缓存                 |
| RT-008  | 并发收集请求               | 多个并发 collectRuntimeClassSet 调用 | 复用同一个 Promise，只执行一次 extract |
| RT-009  | Patcher 无 getClassSetSync | twPatcher 不支持同步获取             | 降级使用异步 extract                   |
| RT-010  | Patcher 刷新失败           | refreshTailwindcssPatcher 抛出异常   | 继续使用原 patcher，记录调试日志       |
| RT-011  | onPatched 回调异常         | onPatched 函数抛出错误               | 错误被捕获，patch 流程继续             |

### 3.2 Vite 插件测试用例

#### 3.2.1 开发模式热更新

| 用例 ID | 测试场景                  | 输入条件                           | 期望输出                           |
| ------- | ------------------------- | ---------------------------------- | ---------------------------------- |
| VT-001  | .uvue 文件热更新（serve） | handleHotUpdate 触发，文件为 .uvue | ensureRuntimeClassSet(true) 被调用 |
| VT-002  | .nvue 文件热更新（serve） | handleHotUpdate 触发，文件为 .nvue | ensureRuntimeClassSet(true) 被调用 |
| VT-003  | .vue 文件热更新（serve）  | handleHotUpdate 触发，文件为 .vue  | 不触发运行时刷新                   |
| VT-004  | 非 uni-app-x 模式         | uniAppX 未启用                     | 不注册 nvue 插件的 handleHotUpdate |
| VT-005  | 类集增量更新              | 新增类名 text-[#123456]            | 类集包含新类名，旧类名保留         |

#### 3.2.2 Watch 构建模式

| 用例 ID | 测试场景                      | 输入条件                             | 期望输出                           |
| ------- | ----------------------------- | ------------------------------------ | ---------------------------------- |
| VT-006  | .uvue 文件监听（build watch） | watchChange 触发，build.watch 启用   | ensureRuntimeClassSet(true) 被调用 |
| VT-007  | .nvue 文件监听（build watch） | watchChange 触发，build.watch 启用   | ensureRuntimeClassSet(true) 被调用 |
| VT-008  | 非 watch 模式                 | watchChange 触发，build.watch 未启用 | 不触发运行时刷新                   |
| VT-009  | 非目标文件扩展名              | watchChange 触发 .js 文件            | 跳过处理                           |

#### 3.2.3 Transform 强制刷新

| 用例 ID | 测试场景                   | 输入条件                                             | 期望输出                           |
| ------- | -------------------------- | ---------------------------------------------------- | ---------------------------------- |
| VT-010  | serve 模式 transform       | command='serve'，transform .uvue                     | ensureRuntimeClassSet(true)        |
| VT-011  | build watch 模式 transform | command='build'，build.watch={}，transform .uvue     | ensureRuntimeClassSet(true)        |
| VT-012  | 普通 build 模式 transform  | command='build'，build.watch 未定义，transform .uvue | ensureRuntimeClassSet(true)        |
| VT-013  | 非强制刷新文件             | transform .vue 文件                                  | ensureRuntimeClassSet() 不强制刷新 |

#### 3.2.4 CSS 处理

| 用例 ID | 测试场景                | 输入条件                        | 期望输出                              |
| ------- | ----------------------- | ------------------------------- | ------------------------------------- |
| VT-014  | iOS 平台预处理器跳过    | isIosPlatform=true，.scss 文件  | cssPrePlugin 返回 undefined，跳过处理 |
| VT-015  | 非 iOS 平台预处理器处理 | isIosPlatform=false，.scss 文件 | 调用 styleHandler 处理                |
| VT-016  | CSS 插件顺序            | cssPrePlugin 和 cssPlugin       | cssPrePlugin enforce='pre' 优先执行   |
| VT-017  | Source map 生成         | transform 返回 map              | formatPostcssSourceMap 被调用         |

#### 3.2.5 Bundle 生成

| 用例 ID | 测试场景          | 输入条件                   | 期望输出                                 |
| ------- | ----------------- | -------------------------- | ---------------------------------------- |
| VT-018  | JS linked modules | jsHandler 返回 linked 对象 | linked chunk 代码被应用，onUpdate 被调用 |
| VT-019  | HTML 资源缓存     | 相同内容的 HTML 文件       | 缓存命中，不重复处理                     |
| VT-020  | CSS 资源缓存      | 相同内容的 CSS 文件        | 缓存命中，不重复处理                     |
| VT-021  | 模块图解析        | jsHandler moduleGraph 参数 | resolve 函数能正确解析相对路径           |

### 3.3 Webpack 插件测试用例

#### 3.3.1 Watch 回调机制

| 用例 ID | 测试场景     | 输入条件                      | 期望输出                         |
| ------- | ------------ | ----------------------------- | -------------------------------- |
| WP-001  | 首次编译     | watchRun 钩子触发             | 初始化运行时类集                 |
| WP-002  | 文件修改触发 | 修改 .vue 文件，watchRun 触发 | refreshTailwindcssPatcher 被调用 |
| WP-003  | 多次快速修改 | 连续多次修改同一文件          | 防抖机制生效，只刷新一次         |
| WP-004  | 跨文件修改   | 同时修改多个文件              | 一次刷新覆盖所有变化             |

#### 3.3.2 Loader 增量处理

| 用例 ID | 测试场景                     | 输入条件                     | 期望输出                                  |
| ------- | ---------------------------- | ---------------------------- | ----------------------------------------- |
| WP-005  | runtime-classset-loader 缓存 | 相同的源代码再次编译         | Webpack 缓存生效，loader 不重复执行       |
| WP-006  | 类集变化检测                 | 运行时类集更新               | Loader 检测到变化，注入新类集             |
| WP-007  | css-import-rewrite-loader    | TailwindCSS v4，CSS 导入语句 | 导入路径被重写为 weapp-tailwindcss 包路径 |
| WP-008  | Loader 顺序验证              | Mpx 项目                     | rewrite loader 在 style-compiler 之前     |

#### 3.3.3 Compilation 钩子

| 用例 ID | 测试场景                       | 输入条件                      | 期望输出              |
| ------- | ------------------------------ | ----------------------------- | --------------------- |
| WP-009  | processAssets 钩子（v5）       | PROCESS_ASSETS_STAGE_OPTIMIZE | 所有资源已完成转换    |
| WP-010  | optimizeChunkAssets 钩子（v4） | optimization 钩子触发         | 所有 chunk 已完成转换 |
| WP-011  | done 钩子                      | 编译完成                      | onEnd 回调被调用      |
| WP-012  | 编译错误处理                   | 转换过程中抛出异常            | 错误被记录，编译失败  |

### 3.4 Gulp 插件测试用例

#### 3.4.1 Watch 模式

| 用例 ID | 测试场景             | 输入条件             | 期望输出                        |
| ------- | -------------------- | -------------------- | ------------------------------- |
| GP-001  | 文件新增             | watch 检测到新文件   | 文件被处理，运行时类集更新      |
| GP-002  | 文件修改             | watch 检测到文件修改 | 增量处理，缓存刷新              |
| GP-003  | 文件删除             | watch 检测到文件删除 | 不触发处理                      |
| GP-004  | 运行时集合惰性初始化 | 首次处理文件         | refreshRuntimeSet 被调用        |
| GP-005  | 运行时集合复用       | 后续文件处理         | 复用已初始化的集合，force=false |

#### 3.4.2 流式处理

| 用例 ID | 测试场景   | 输入条件                                | 期望输出                 |
| ------- | ---------- | --------------------------------------- | ------------------------ |
| GP-006  | WXML 管道  | gulp.src('\*_/_.wxml').pipe(wxmlPlugin) | 转换后的内容写入 dest    |
| GP-007  | WXSS 管道  | gulp.src('\*_/_.wxss').pipe(wxssPlugin) | PostCSS 处理后的 CSS     |
| GP-008  | JS 管道    | gulp.src('\*_/_.js').pipe(jsPlugin)     | 转换后的 JS 代码         |
| GP-009  | 多管道并行 | 同时处理多种资源类型                    | 各管道独立处理，结果正确 |

### 3.5 集成测试用例

#### 3.5.1 真实项目场景

| 用例 ID | 测试场景         | 项目类型                              | 测试步骤                 | 期望结果           |
| ------- | ---------------- | ------------------------------------- | ------------------------ | ------------------ |
| IT-001  | uni-app 热更新   | demo/uni-app                          | 修改 index.vue 添加类名  | 新类名被检测并应用 |
| IT-002  | Taro 热更新      | demo/taro-app                         | 修改 index.tsx 添加类名  | 新类名被检测并应用 |
| IT-003  | Mpx 热更新       | demo/mpx-app                          | 修改 index.mpx 添加类名  | 新类名被检测并应用 |
| IT-004  | 原生小程序热更新 | demo/native                           | 修改 index.wxml 添加类名 | 新类名被检测并应用 |
| IT-005  | uni-app-x 热更新 | demo/uni-app-x-hbuilderx-tailwindcss4 | 修改 index.uvue 添加类名 | 新类名被检测并应用 |

#### 3.5.2 TailwindCSS 版本兼容

| 用例 ID | 测试场景     | TailwindCSS 版本 | 特性         | 期望结果                  |
| ------- | ------------ | ---------------- | ------------ | ------------------------- |
| IT-006  | v3 热更新    | 3.x              | 传统配置文件 | 配置修改触发 patcher 刷新 |
| IT-007  | v4 热更新    | 4.x              | CSS 导入语法 | 导入路径被正确重写        |
| IT-008  | v4 calc 兼容 | 4.x              | cssCalc 配置 | calc() 函数正确处理       |
| IT-009  | 版本切换     | 3.x -> 4.x       | 升级依赖     | 插件自动适配新版本        |

#### 3.5.3 多框架混合场景

| 用例 ID | 测试场景     | 框架组合       | 测试重点      | 期望结果             |
| ------- | ------------ | -------------- | ------------- | -------------------- |
| IT-010  | Taro Vue3    | Taro + Vue3    | .vue 文件处理 | 模板和样式都正确转换 |
| IT-011  | Taro React   | Taro + React   | .tsx 文件处理 | JSX 类名正确转换     |
| IT-012  | Uni-app Vue3 | Uni-app + Vue3 | Vite 构建     | 热更新响应及时       |
| IT-013  | Uni-app Vue2 | Uni-app + Vue2 | Webpack 构建  | watch 模式正常工作   |

### 3.6 边界条件与异常测试用例

#### 3.6.1 缓存边界

| 用例 ID | 测试场景       | 输入条件                   | 期望输出               |
| ------- | -------------- | -------------------------- | ---------------------- |
| BC-001  | 缓存目录不可写 | cacheDir 权限不足          | 降级使用内存缓存       |
| BC-002  | 缓存数据损坏   | 缓存文件格式错误           | 忽略损坏缓存，重新生成 |
| BC-003  | 缓存键冲突     | 两个文件生成相同缓存键     | MD5 哈希保证唯一性     |
| BC-004  | 缓存过期策略   | weapp-tailwindcss 版本更新 | 旧版本缓存失效         |

#### 3.6.2 并发与竞态

| 用例 ID | 测试场景            | 输入条件                                   | 期望输出                      |
| ------- | ------------------- | ------------------------------------------ | ----------------------------- |
| BC-005  | 并发 transform 请求 | 多个文件同时转换                           | 共享同一个 runtimeSet promise |
| BC-006  | 配置文件频繁修改    | tailwind.config 快速变化                   | 防抖机制避免过度刷新          |
| BC-007  | 刷新期间新请求      | refreshTailwindcssPatcher 执行中又有新转换 | 等待刷新完成后使用新 patcher  |
| BC-008  | Patcher 创建失败    | TailwindCSS 配置语法错误                   | 抛出明确错误，终止构建        |

#### 3.6.3 资源类型边界

| 用例 ID | 测试场景       | 输入条件             | 期望输出             |
| ------- | -------------- | -------------------- | -------------------- |
| BC-009  | 空文件处理     | 文件内容为空字符串   | 返回空字符串，不报错 |
| BC-010  | 超大文件处理   | 文件大小 > 5MB       | 正常处理，可能较慢   |
| BC-011  | 特殊字符文件名 | 文件名包含空格、中文 | 路径正确解析         |
| BC-012  | 符号链接文件   | 处理软链接文件       | 跟踪到真实文件路径   |

#### 3.6.4 配置边界

| 用例 ID | 测试场景                   | 输入条件               | 期望输出                 |
| ------- | -------------------------- | ---------------------- | ------------------------ |
| BC-013  | 禁用热更新功能             | disabled.plugin = true | 插件不注册钩子           |
| BC-014  | 禁用缓存                   | cache = false          | 每次都重新转换           |
| BC-015  | 自定义 cssEntries          | 指定多个 CSS 入口      | 所有入口都被监听         |
| BC-016  | 自定义 mainCssChunkMatcher | 自定义匹配函数         | 按自定义规则判断主 chunk |

## 4. 测试实施策略

### 4.1 测试框架与工具

**单元测试框架**

- Vitest - 项目已采用的测试框架
- @vitest/coverage-v8 - 代码覆盖率工具

**Mock 工具**

- vi.fn() - 函数 mock
- vi.spyOn() - 对象方法 spy
- memfs - 内存文件系统模拟

**辅助工具**

- webpack-build-utils - Webpack 编译测试工具
- 现有的 test helpers（util.ts, snapshotUtils.ts）

### 4.2 测试文件组织

```
packages/weapp-tailwindcss/test/
├── tailwindcss/
│   ├── runtime.test.ts                     # RT-001 ~ RT-011
│   └── runtime-edge-cases.test.ts         # 运行时边界测试
├── context/
│   ├── refresh.test.ts                     # Context 刷新机制
│   └── refresh-error-handling.test.ts     # 刷新异常处理
├── cache/
│   ├── hot-update.test.ts                 # BC-001 ~ BC-004
│   └── concurrent.test.ts                 # BC-005 ~ BC-008
├── bundlers/
│   ├── vite-hot-update.test.ts            # VT-001 ~ VT-021
│   ├── webpack-v5-hot-update.test.ts      # WP-001 ~ WP-012（v5）
│   ├── webpack-v4-hot-update.test.ts      # WP-001 ~ WP-012（v4）
│   ├── gulp-hot-update.test.ts            # GP-001 ~ GP-009
│   └── bundlers-edge-cases.test.ts        # BC-009 ~ BC-016
└── integration/
    ├── hot-update.test.ts                  # IT-001 ~ IT-009
    └── multi-framework.test.ts             # IT-010 ~ IT-013
```

### 4.3 Mock 策略

#### 4.3.1 TailwindcssPatcher Mock

为避免真实 TailwindCSS 依赖，使用 Mock 对象：

**Mock 方法**

- patch() - 返回 resolved Promise
- extract() - 返回包含 classSet 的对象
- getClassSet() - 异步返回类集
- getClassSetSync() - 同步返回类集
- majorVersion - 返回 3 或 4

**动态行为**

- 根据测试场景切换返回的类集内容
- 模拟配置文件签名变化
- 模拟异步延迟和错误

#### 4.3.2 文件系统 Mock

使用 memfs 模拟文件系统操作：

**模拟场景**

- 读取配置文件
- 写入缓存文件
- 监听文件变化
- 权限错误模拟

#### 4.3.3 构建工具 Mock

**Vite**

- ResolvedConfig 对象
- HmrContext 对象
- Plugin 生命周期钩子调用

**Webpack**

- Compiler 实例
- Compilation 对象
- 使用 webpack-build-utils 的 memfs compiler

**Gulp**

- Vinyl 文件流
- Stream 管道模拟

### 4.4 测试数据准备

#### 4.4.1 类集测试数据

```
基础类集：['text-red-500', 'bg-blue-100', 'flex']
新增类集：['text-[#123456]', 'bg-[rgb(255,0,0)]']
边界类集：['', '  ', 'invalid-class-name']
大规模类集：生成 1000+ 类名的集合
```

#### 4.4.2 文件内容测试数据

**模板文件**

- Vue SFC 模板
- React JSX/TSX
- 原生 WXML
- uni-app-x UVUE

**样式文件**

- CSS with @apply
- SCSS/Less 预处理器
- TailwindCSS v4 CSS 导入

**脚本文件**

- ES Module
- CommonJS
- TypeScript

#### 4.4.3 配置文件测试数据

**TailwindCSS 配置**

- v3 完整配置
- v4 简化配置
- 自定义主题
- 插件扩展

### 4.5 覆盖率目标

#### 4.5.1 行覆盖率

- 目标：100%
- 重点模块：runtime.ts, context/index.ts, bundlers/\*

#### 4.5.2 分支覆盖率

- 目标：100%
- 关键条件分支：force 参数、文件扩展名判断、框架类型判断

#### 4.5.3 函数覆盖率

- 目标：100%
- 确保所有导出函数和内部辅助函数都被调用

#### 4.5.4 语句覆盖率

- 目标：100%
- 包括异常捕获的 catch 块、调试日志语句

### 4.6 测试执行策略

#### 4.6.1 单元测试

**执行命令**

```
pnpm test:plugins
pnpm test -- --coverage --project=@weapp-tailwindcss/*
```

**执行频率**

- 开发过程：每次代码提交前
- CI 流水线：每次 Push 和 Pull Request

#### 4.6.2 集成测试

**执行命令**

```
pnpm test -- integration/hot-update.test.ts
```

**执行频率**

- 重大功能变更后
- 发布前完整回归

**隔离策略**

- 使用 describe.skip 标记暂不稳定的集成测试
- 通过环境变量控制是否运行真实项目测试

#### 4.6.3 性能测试

**Benchmark 用例**

- 运行时类集收集耗时
- 缓存命中率统计
- 大规模文件转换吞吐量

**执行命令**

```
pnpm test:bench
```

### 4.7 持续集成配置

**CI 检查项**

- 代码覆盖率报告上传
- 覆盖率阈值检查（100%）
- 测试失败自动阻断合并

**覆盖率报告**

- 使用 @vitest/coverage-v8 生成报告
- 报告格式：html, json, lcov
- 上传至覆盖率服务（如 Codecov）

## 5. 测试用例实现要点

### 5.1 Runtime 模块测试实现

**关键测试点**

测试 `collectRuntimeClassSet` 的缓存机制：

- 使用 vi.fn() mock twPatcher.extract 和 getClassSet
- 验证首次调用时 extract 被执行
- 验证后续调用时返回缓存值，不再调用 extract
- 通过修改 getTailwindConfigSignature 返回值模拟配置变化
- 验证强制刷新（force=true）时清除缓存并重新获取

测试 `refreshTailwindRuntimeState`：

- mock refreshTailwindcssPatcher 函数
- 验证 force=false 时不触发刷新
- 验证 force=true 时调用 refreshTailwindcssPatcher
- 验证 patchPromise 被更新为新的 createTailwindPatchPromise 返回值

测试缓存失效：

- 调用 invalidateRuntimeClassSet
- 验证缓存 Map 中对应 patcher 的条目被删除
- 验证下次 collectRuntimeClassSet 重新执行

**Mock 示例结构**

```
const mockClassSet = new Set(['class-1', 'class-2'])
const mockPatcher = {
  patch: vi.fn().mockResolvedValue(undefined),
  extract: vi.fn().mockResolvedValue({ classSet: mockClassSet }),
  getClassSetSync: vi.fn().mockReturnValue(mockClassSet),
  majorVersion: 4
}
```

### 5.2 Vite 插件测试实现

**关键测试点**

测试 `handleHotUpdate` 钩子：

- 创建 Plugin 数组，找到 nvue plugin
- 构造 HmrContext 对象，设置 file 属性为 .uvue 文件
- 调用 handleHotUpdate，验证 ensureRuntimeClassSet(true) 被调用
- 验证非 .uvue/.nvue 文件不触发刷新

测试 `watchChange` 钩子：

- 设置 ResolvedConfig 的 command='build' 和 build.watch={}
- 调用 watchChange，传入 .uvue 文件路径
- 验证 ensureRuntimeClassSet(true) 被调用
- 验证非 watch 模式下不触发刷新

测试 transform 强制刷新：

- 模拟不同的 command 和 build.watch 组合
- 验证 serve、build watch、普通 build 三种模式都强制刷新
- 验证 ensureRuntimeClassSet 的参数为 true

测试 CSS 处理：

- 模拟 isIosPlatform 参数
- 测试 .scss 等预处理器文件在 iOS 平台被跳过
- 验证 formatPostcssSourceMap 被正确调用

**Plugin 调用模拟**

```
const plugins = UnifiedViteWeappTailwindcssPlugin(options)
const nvuePlugin = plugins?.find(p => p.name === 'weapp-tailwindcss:uni-app-x:nvue')
const config = {
  command: 'serve',
  build: { outDir: 'dist' },
  root: process.cwd()
} as ResolvedConfig
await nvuePlugin.configResolved?.(config)
await nvuePlugin.handleHotUpdate?.({ file: 'App.uvue' } as HmrContext)
```

### 5.3 Webpack 插件测试实现

**关键测试点**

测试 watch 模式回调：

- 使用 webpack-build-utils 创建内存编译器
- 注册插件
- 监听 watchRun 钩子
- 验证每次 watch 触发时 refreshTailwindcssPatcher 被调用

测试 Loader 集成：

- 创建包含 runtime-classset-loader 的 loader 链
- 模拟运行时类集变化
- 验证 Loader 注入的类集代码更新

测试 Compilation hooks：

- v5 使用 processAssets 钩子
- v4 使用 optimizeChunkAssets 钩子
- 验证所有资源的 onUpdate 回调被正确调用
- 验证 done 钩子中 onEnd 被调用

测试多框架 Loader 顺序：

- 对于 Mpx 项目，验证 rewrite loader 在 style-compiler 之前
- 使用 createLoaderAnchorFinders 获取正确的插入位置

**Webpack 编译器创建**

```
const compiler = getMemfsCompiler5(config)
const plugin = new UnifiedWebpackPluginV5(options)
plugin.apply(compiler)

compiler.hooks.watchRun.tap('test', () => {
  // 验证逻辑
})

await compile(compiler)
```

### 5.4 Gulp 插件测试实现

**关键测试点**

测试 watch 模式流式处理：

- 创建 Vinyl 文件对象
- 通过 gulp.src().pipe() 管道传递
- 验证输出文件内容正确转换
- 验证 refreshRuntimeSet 在首次处理时被调用

测试运行时集合复用：

- 连续处理多个文件
- 验证第一个文件后 runtimeSetInitialized=true
- 验证后续文件复用已有集合，不重复刷新

测试扩展名解析：

- 测试 resolveWithExtensions 函数
- 验证 .js/.mjs/.cjs/.ts/.tsx/.jsx 等扩展名正确解析

**流式测试示例**

```
const { wxmlPlugin, wxssPlugin, jsPlugin } = createPlugins(options)

const vinylFile = new Vinyl({
  path: 'pages/index/index.wxml',
  contents: Buffer.from('<view class="text-red-500">test</view>')
})

const stream = gulp.src('test.wxml').pipe(wxmlPlugin())
stream.on('data', (file) => {
  expect(file.contents.toString()).toContain('转换后的内容')
})
```

### 5.5 集成测试实现

**关键测试点**

测试真实项目热更新流程：

- 读取项目入口文件原始内容
- 插入测试类名标记（如 text-[#aa1101]）
- 调用 refreshTailwindcssPatcher 清除缓存
- 重新收集运行时类集
- 验证新类名存在于类集中
- 恢复文件原始内容
- 再次刷新验证类名被移除

测试配置文件变化：

- 修改 tailwind.config.js
- 触发配置重新加载
- 验证新配置生效

测试跨版本兼容：

- 切换 TailwindCSS 版本
- 验证插件自动检测 majorVersion
- 验证 v4 特有功能（CSS 导入重写）仅在 v4 启用

**集成测试隔离**

使用 `describe.skip.sequential` 控制集成测试执行：

- 开发时默认跳过，避免影响速度
- CI 环境中通过环境变量启用
- 按顺序执行，避免并发修改文件冲突

## 6. 边界值与异常场景设计

### 6.1 缓存边界值

**缓存键生成**

- 空文件路径 → 使用 fallback 值
- 超长路径（> 256 字符） → MD5 哈希保证长度固定
- 特殊字符路径（空格、中文、emoji） → 编码转换确保合法性

**缓存数据**

- 空内容缓存 → 允许缓存空字符串
- 超大内容（> 10MB） → 仍然缓存，但可能影响性能
- 损坏的缓存数据 → catch 解析错误，重新生成

### 6.2 并发竞态边界

**并发请求**

- 同时处理 100 个文件 → 验证 Promise 复用机制
- 嵌套刷新请求 → 验证锁机制防止死循环
- 刷新期间的读取 → 等待刷新完成后返回

**防抖与节流**

- 配置文件在 100ms 内修改 10 次 → 只触发 1 次刷新
- 大量文件同时修改 → 批量处理，减少刷新次数

### 6.3 资源处理边界

**文件大小**

- 0 字节文件 → 正常返回空内容
- 超大文件（100MB+） → 可能超时，需要设置合理的超时时间
- 二进制文件误处理 → 检测文件类型，跳过非文本文件

**文件编码**

- UTF-8 with BOM → 正确识别并保留 BOM
- GBK/GB2312 → 需要指定编码或使用自动检测
- 混合编码 → 可能导致乱码，需要明确编码策略

**路径处理**

- Windows 路径分隔符（\） → 标准化为 POSIX 路径（/）
- 相对路径解析 → 基于项目根目录正确解析
- 符号链接 → 跟踪到真实路径
- 不存在的文件路径 → 抛出明确错误

### 6.4 配置边界

**禁用选项**

- disabled.plugin = true → 插件不注册任何钩子
- disabled.rewriteCssImports = true → 跳过 CSS 导入重写
- disabled.templateHandler = true → 跳过模板转换

**极端配置值**

- cssEntries = [] → 使用默认入口
- customAttributes = null → 不处理自定义属性
- cache = false → 完全禁用缓存，每次都转换
- mainCssChunkMatcher 总是返回 false → 所有 CSS 都不被视为主 chunk

### 6.5 错误处理边界

**TailwindCSS 错误**

- 配置文件语法错误 → 捕获并抛出明确错误信息
- 无效的类名 → 过滤或警告
- 插件冲突 → 检测并提示

**文件系统错误**

- 磁盘空间不足 → 降级使用内存缓存
- 权限不足 → 提示用户检查权限
- 文件被占用 → 重试机制或跳过

**构建工具错误**

- Webpack compilation 失败 → 记录错误，终止构建
- Vite transform 抛出异常 → 捕获并报告，保持其他文件处理
- Gulp stream 错误 → emit 错误事件，中断管道

## 7. 验收标准

### 7.1 代码覆盖率标准

**硬性指标**

- 行覆盖率 = 100%
- 分支覆盖率 = 100%
- 函数覆盖率 = 100%
- 语句覆盖率 = 100%

**验证方法**

- CI 自动检查覆盖率报告
- 覆盖率低于阈值时构建失败
- 每次 PR 必须附带覆盖率变化说明

### 7.2 测试通过标准

**单元测试**

- 所有单元测试用例通过（0 失败）
- 无超时失败（每个测试 < 5000ms）
- 无 flaky 测试（连续 10 次运行都通过）

**集成测试**

- 所有真实项目场景测试通过
- 跨框架兼容性测试通过
- 版本兼容性测试通过

### 7.3 性能标准

**测试执行速度**

- 单元测试套件总耗时 < 60 秒
- 单个测试用例平均耗时 < 100ms
- 集成测试套件总耗时 < 300 秒

**热更新性能**

- 首次构建完成后，单文件修改触发热更新 < 1 秒
- 运行时类集刷新耗时 < 500ms
- 缓存命中率 > 80%（在典型开发场景中）

### 7.4 代码质量标准

**测试代码规范**

- 遵循项目 ESLint 规则
- 测试描述清晰，使用 "should xxx when xxx" 格式
- 每个测试用例独立，无相互依赖
- 适当使用 beforeEach/afterEach 清理状态

**Mock 规范**

- Mock 对象行为与真实对象一致
- 验证 Mock 调用时检查参数
- 测试结束后清理所有 Mock（vi.restoreAllMocks）

### 7.5 文档标准

**测试用例文档**

- 每个测试文件顶部包含模块说明
- 复杂测试用例附带注释说明测试目的
- 边界条件测试标注边界值范围

**覆盖率报告**

- 生成 HTML 格式的覆盖率报告
- 标注未覆盖的行和分支
- 提供改进建议

## 8. 风险与缓解措施

### 8.1 测试实施风险

**风险：集成测试不稳定**

- **原因**：依赖真实项目文件，可能因项目结构变化而失败
- **缓解措施**：
  - 使用 snapshot 测试固化预期输出
  - 定期维护测试项目依赖
  - 关键测试用例使用 fixture 目录的固定文件

**风险：Mock 行为与真实实现不一致**

- **原因**：Mock 对象简化了真实逻辑
- **缓解措施**：
  - 定期对比 Mock 与真实 API
  - 重要功能使用集成测试验证
  - Mock 对象添加类型约束

**风险：覆盖率虚高**

- **原因**：测试执行了代码但未验证结果
- **缓解措施**：
  - Code Review 检查断言完整性
  - 使用 mutation testing 验证测试有效性
  - 关键路径必须有显式断言

### 8.2 维护成本风险

**风险：测试用例数量过多，维护困难**

- **原因**：100% 覆盖率需要大量用例
- **缓解措施**：
  - 使用参数化测试减少重复代码
  - 提取公共 helper 函数
  - 按模块组织测试文件

**风险：代码重构导致测试大量失败**

- **原因**：测试与实现耦合过紧
- **缓解措施**：
  - 优先测试公共 API 而非内部实现
  - 使用 interface 解耦测试与实现
  - 重构时优先修复集成测试，再修复单元测试

### 8.3 性能风险

**风险：测试执行时间过长**

- **原因**：大量文件系统操作、真实编译
- **缓解措施**：
  - 单元测试使用内存文件系统（memfs）
  - 集成测试使用最小化的测试项目
  - 并行执行独立测试（vitest 默认支持）

**风险：CI 资源消耗过大**

- **原因**：集成测试需要安装真实项目依赖
- **缓解措施**：
  - 使用 CI 缓存机制缓存 node_modules
  - 分阶段执行测试（先单元后集成）
  - 可选地在夜间运行完整集成测试

## 9. 实施计划

### 9.1 阶段划分

**阶段一：Runtime 与 Context 模块（1 周）**

- 实现 RT-001 ~ RT-011 用例
- 实现 Context 刷新机制测试
- 实现缓存模块基础测试
- 目标覆盖率：Runtime 模块 100%

**阶段二：Vite 插件（1.5 周）**

- 实现 VT-001 ~ VT-021 用例
- 覆盖所有生命周期钩子
- 覆盖 uni-app-x 特殊处理
- 目标覆盖率：Vite bundler 100%

**阶段三：Webpack 插件（1.5 周）**

- 实现 WP-001 ~ WP-012 用例（v5 和 v4）
- 覆盖 watch 模式和 loader 集成
- 覆盖多框架适配
- 目标覆盖率：Webpack bundler 100%

**阶段四：Gulp 插件（0.5 周）**

- 实现 GP-001 ~ GP-009 用例
- 覆盖流式处理
- 覆盖 watch 模式
- 目标覆盖率：Gulp bundler 100%

**阶段五：集成测试与边界条件（1 周）**

- 实现 IT-001 ~ IT-013 用例
- 实现 BC-001 ~ BC-016 用例
- 完善错误处理测试
- 目标覆盖率：整体 100%

**阶段六：验收与优化（0.5 周）**

- 运行完整测试套件
- 优化测试性能
- 补充遗漏覆盖点
- 编写测试文档

### 9.2 里程碑

| 里程碑               | 完成时间  | 交付物                                                       |
| -------------------- | --------- | ------------------------------------------------------------ |
| M1：Runtime 模块完成 | 第 1 周   | runtime.test.ts, context/refresh.test.ts                     |
| M2：Vite 插件完成    | 第 2.5 周 | vite-hot-update.test.ts                                      |
| M3：Webpack 插件完成 | 第 4 周   | webpack-v5-hot-update.test.ts, webpack-v4-hot-update.test.ts |
| M4：Gulp 插件完成    | 第 4.5 周 | gulp-hot-update.test.ts                                      |
| M5：集成测试完成     | 第 5.5 周 | integration/hot-update.test.ts                               |
| M6：验收通过         | 第 6 周   | 覆盖率报告 100%，所有测试通过                                |

### 9.3 资源需求

**人力**

- 1 名测试开发工程师全职投入
- 1 名架构师提供技术指导（20% 投入）

**环境**

- CI 环境支持 Node.js 18+
- 足够的 CI 并发资源（建议 4 并发）

**工具**

- Vitest 最新版本
- @vitest/coverage-v8
- 现有的 webpack-build-utils

## 10. 总结

本测试设计方案为 weapp-tailwindcss 项目的所有编译插件热更新功能提供了完整的测试覆盖计划。方案涵盖：

**测试覆盖范围**

- 4 个主要构建工具插件（Vite/Webpack v5/Webpack v4/Gulp）
- 核心运行时模块与缓存机制
- 真实项目集成场景
- 边界条件与异常处理

**测试用例设计**

- 80+ 单元测试用例
- 13+ 集成测试用例
- 16+ 边界条件测试用例
- 覆盖所有热更新路径与缓存策略

**质量保障**

- 100% 代码覆盖率目标
- 清晰的验收标准
- 风险识别与缓解措施
- 6 周分阶段实施计划

通过执行本方案，可确保热更新功能的稳定性、可靠性和性能，为项目的持续迭代提供坚实的质量基础。
