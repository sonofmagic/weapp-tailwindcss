# ReactLynx + Tailwind CSS

ReactLynx + Rspeedy 的最小 Tailwind CSS v4 示例。

```bash
pnpm --filter @weapp-tailwindcss/example-react-lynx build
```

`lynx.config.ts` 通过 `pluginLynxTailwindcss()` 注册构建器适配；`src/global.css` 保留 Tailwind v4 的 `@import "tailwindcss"` 和源码 `@source`。
