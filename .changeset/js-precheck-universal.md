---
'weapp-tailwindcss': minor
---

将 JS 快速预检查机制扩展到所有构建器路径（Webpack v5、Webpack v4、Gulp、核心 API）。

- 新增共享预检查模块 `src/js/precheck.ts`，通过正则快速判断 JS 文件是否需要转译，跳过不必要的 Babel AST 解析。
- 原 Vite 专属的 `shouldSkipViteJsTransform` 改为从共享模块 re-export，保持向后兼容。
- Webpack v5 的 `processAssets` 钩子、Webpack v4 的 `emit` 钩子、Gulp 的 `transformJs` 流、核心 `createContext().transformJs()` 均已集成预检查。
- 新增环境变量 `WEAPP_TW_DISABLE_JS_PRECHECK`，设置为 `'1'` 时可禁用预检查，强制所有文件走完整转译流程。
- 预检查开销极低：211KB 大文件仅需 ~171μs，小文件 <1μs，对需要转译的文件无性能影响。
