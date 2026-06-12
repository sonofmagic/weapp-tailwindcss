# tailwindcss-patch token style example

这个示例展示如何不经过框架构建器，直接使用 `tailwindcss-patch` 完成：

1. 从 TSX / CSS 源码片段中提取 Tailwind candidates。
2. 用 Tailwind CSS v4 engine 基于 candidates 生成样式。
3. 输出可检查的 `dist/tokens.json` 与 `dist/style.css`。

运行：

```bash
pnpm --filter @weapp-tailwindcss-example/tailwindcss-patch-token-style build
```

测试：

```bash
pnpm --filter @weapp-tailwindcss-example/tailwindcss-patch-token-style test
```

这个示例刻意不注册 `@tailwindcss/postcss`、`@tailwindcss/vite` 或 `tailwindcss@3` PostCSS 插件，便于单独观察 `tailwindcss-patch` 的 token 提取和样式生成能力。
