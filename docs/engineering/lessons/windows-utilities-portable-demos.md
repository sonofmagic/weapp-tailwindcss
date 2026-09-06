---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/issues/1159
baseline: e8da4351f9580910945e2a2e66a375f7a87e8e0d
regressions:
  - packages/weapp-tailwindcss/test/tailwindcss/v4-import-paths.test.ts
  - packages/weapp-tailwindcss/test/bundlers/css-imports.test.ts
  - packages/weapp-tailwindcss/test/bundlers/runtime-classset-loader.test.ts
  - packages/weapp-tailwindcss/test/bundlers/vite-css-output-imports.test.ts
  - packages/weapp-style-injector/test/index.test.ts
  - scripts/ci/demo-matrix/matrix.test.mjs
---

# Windows 标准 utility 缺失与 demo 跨系统验收

## 症状

用户在 Windows、weapp-tailwindcss 5.5.0/5.5.1 默认配置下发现标准 utility 与 `--spacing` 消失，任意值和透明色仍存在。恢复相同模板、pnpm 11.25.0 与冻结锁文件仍复现。扩展其他 demo 后，又观察到百度小程序样式重放失败、独立生成样式未被入口引用、Web CSS 加载与更新失败，以及 RN CLI 返回成功但只有空模块的 bundle。

## 根因与纠正

最初缺陷在 weapp-tailwindcss 本地 v4 engine：CSS import 序列化转义了 Windows 反斜杠，扫描器在未解码 CSS 字符串时判断入口，关闭默认扫描。Webpack 特殊候选补充解释了任意值和透明色为何仍生成。修复使用 CSS tokenizer，并只在写 CSS 的边界转换路径。没有证据表明该缺陷属于上游 tailwindcss-mangle/engine，因此没有为此创建上游修复 PR。

扩展验收将源码候选、CSS 与 JS loader 输出、模块来源、bundle 文件身份和页面消费逐层关联。Webpack 不再把 css-loader 或 extraction 生成的 JS 注册为 CSS；Rspack 保留静态 loader 的生成选项；Vite 根据产物身份保留框架重命名和重放关系，并从入口 chunk 的 modules 关联独立样式，检测重复引用和循环；uni 样式注入缓存按构建轮次刷新。

RN 的“非空 bundle”判断不充分，9 KB 的 Metro 启动代码也会通过。默认 Metro 配置覆盖 Taro transformer 后，入口占位文件没有生成应用。修正合并顺序后还发现空 blockList 被 Metro 编译为匹配所有文件的正则，共享空入口的转换缓存还会跨 demo 复用其他项目的页面清单。修复配置顺序、空过滤器与项目缓存身份，并按现有 catalog 补齐分包 RN demo 缺失的运行时依赖后，验收要求实际应用注册和原生页面探针进入同一 bundle。此前仅凭非空产物得到的 RN 成功结论作废，不作为交付证据。

样式注入 Taro demo 的子包路由修正为实际文件位置，补齐 Web HTML 启动模板。没有用手写 spacing、safelist 或官方 Tailwind 插件掩盖生成问题。

## 验证

原始修复提交 `de58576bada6a50976883c173fec61c0a21dd911` 的 [Windows Node 22/24 与 Ubuntu 专项](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34023069668) 已通过；Windows 先复现发布版 5.5.1 缺失，再验证修复包恢复全部规则。该运行不代表扩展矩阵通过。

扩展前同步 main `4f914160e40df93900469f91a0c5ab1235c22b8d`，保留用户工作区。本地执行 `pnpm build:ci`，Vite/Rspack/loader/import 定向回归 279 项通过，样式注入 89 项通过。全部目标使用 [统一运行器](../../../scripts/ci/demo-matrix/README.md) 生成生产语义基线并验收正常 dev、替换、新增、删除、Web 刷新；原生与 WebView 按声明边界验收。当前文档保持 partial，待本次提交的三系统 CI 证据完成后更新。

## 适用边界

28 个 demo 登记 107 个 CLI 组合。Node 24 全量覆盖 Windows/macOS/Linux，Node 22 覆盖关键集成。保持 RN/native disabled 边界；构建证据不能替代设备、原生桥接和 HBuilderX IDE。uni-app-x-vapor 没有可移植 CLI，仅列出限制，不伪造通过。

## 规则评估

不新增 AGENTS 规则。现有路径边界、构建图、真实消费和连续更新要求已覆盖本问题，新增可执行门禁保证清单完整、阶段执行与提交身份，防止日志退出码或旧产物再次形成错误结论。
