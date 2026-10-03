---
status: verified
issue: https://github.com/weapp-tailwindcss/weapp-tailwindcss/pull/1269
baseline: 59c78a50ac862d5a5773fa082e7eccd2c0868806
regressions:
  - packages/weapp-tailwindcss/test-d/vite-hooks.test.ts
  - packages/weapp-tailwindcss/test/bundlers/vite-watch-css-output.test.ts
  - packages/weapp-tailwindcss/test/bundlers/style-injector-hooks.test.ts
---

# Vite hook 的类型归属

## 症状

完整扩展流程在根类型检查阶段报告四处 TS2345：CSS 输出包装器的输出参数、样式注入代理的 buildStart 参数及上下文不兼容。构建与运行时单测先前通过，因为声明构建使用 noCheck，普通 Vitest 不执行 TypeScript 类型检查。

## 根因与纠正

直接导入的 Rollup 4.63.5 与 Vite 7.3.6 自身引用的 Rollup 4.63.1 是不同的类型实例。Vite 对自己的 Rollup 增补 PluginContext.environment；完整输入、输出选项又包含携带 this 类型的插件 hook。将 Vite 的参数声明为另一份完整 Rollup 类型，会在深层函数参数比较时发生冲突。

CSS 输出标识只读取 dir、file、format，因此收窄为 Vite generateBundle 首参的对应字段。buildStart 转发使用 Vite hook 的 ThisParameterType 与 Parameters；emitFile 代理沿用目标方法类型。没有强制合并依赖，也没有通过增加断言伪造 environment。

新增独立 tsconfig.typecheck.json，沿用源码的 Bundler 解析与路径配置，并将真实 Vite 函数/对象 hook 契约纳入根 typecheck。发布声明的 tsd 仍检查 dist，源码编译回归负责覆盖私有辅助函数体。

## 验证

新配置修复前复现四处 TS2345，修复后 `CI=1 pnpm typecheck` 通过。样式注入、CSS 资产归属与架构四个文件的 26 项回归通过，使用普通 Vitest 并禁用快照更新；核心包构建通过。首次失败保留于完整流程 d4343105-aac8-4aa4-a720-8996da70d4c3 的日志。

## 适用边界

仅调整内部类型和工程检查，不改变运行时或公开导出，不需要公开包 change intent；未修改 demo 或样式输出，不更新 static 基线。该回归不要求两份 Rollup 永久不同，未来合法去重仍应通过。

## 规则评估

不新增 AGENTS 规则。通过实际宿主 hook 推导类型，并让现有类型检查覆盖源码契约，避免用依赖去重掩盖 API 边界问题。
