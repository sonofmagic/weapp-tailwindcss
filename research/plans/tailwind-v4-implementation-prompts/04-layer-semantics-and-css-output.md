# Prompt 04: 避免误用 @layer 作为构建语义

## 目标

审计样式注入、分包样式、preflight 保留、主样式选择逻辑，确保不把 `@layer` 或固定文件名误当成 Tailwind v4 入口和输出语义。

## 可执行提示词

```markdown
你在 `weapp-tailwindcss` 仓库中工作。请审计 CSS 输出和样式注入相关实现，目标是确保 `@layer theme/base/components/utilities` 只作为 CSS cascade layer 保留，不被当作主样式、分包样式或 Tailwind 入口的判断依据。

约束：

- 先读取根目录 `AGENTS.md`、`packages/AGENTS.md`、`packages/weapp-tailwindcss/AGENTS.md`。
- 不得硬编码 `app.wxss`、`main.wxss`、`index.wxss`、`app.css`、`main.css` 作为语义判断。
- 样式输出必须来自 bundler 产物关系、用户显式配置、loader/transform 阶段缓存或 source-candidates 元数据。
- 不得在后置阶段通过临时 `fs.readFile` 弥补缺失源码关系。

重点阅读：

- `packages/weapp-tailwindcss/src/bundlers/vite/processed-css-assets.ts`
- `packages/weapp-tailwindcss/src/bundlers/vite/generate-bundle.ts`
- `packages/weapp-tailwindcss/src/bundlers/vite/generate-bundle/css-config-directives.ts`
- `packages/weapp-tailwindcss/src/bundlers/shared/generator-css/source-resolver.ts`
- `packages/weapp-tailwindcss/src/bundlers/webpack/BaseUnifiedPlugin/v5-assets.ts`

请输出并实施：

1. 列出当前所有主样式、分包样式、preflight、Tailwind 入口判断条件。
2. 标出任何依赖固定文件名、输出路径片段或 `@layer` 内容的判断。
3. 若存在风险，改为使用构建图、cssEntries、source resolver 或产物元数据。
4. 增加非微信后缀、非 app/main 文件名、多分包入口的回归测试。
5. 运行对应测试并记录命令。
```

## 验收标准

- 非标准文件名仍能正确处理 Tailwind v4 样式。
- 非微信小程序后缀不被 `.wxss` 假设污染。
- `@layer` 只影响 CSS 输出层级，不影响入口或主样式判断。
- 相关测试覆盖 Vite 和至少一个非 Vite 链路。

