# uni-app-vite-vue3-hbuilderx-tailwindcss-v4

`uni-app + Vite + Vue3 + HBuilderX + Tailwind CSS v4` demo.

## 关键配置

- `vite.config.ts` 直接注册 `WeappTailwindcss(hbuilderx(...))`
- `main.css` 使用 `@import "tailwindcss"` 与 `@source`
- 不显式配置 `cssEntries`，由 `weapp-tailwindcss` 自动识别 `main.css`
- 不注册 `@tailwindcss/postcss`，也不注册 `@tailwindcss/vite`

## 运行

```bash
pnpm install
pnpm dev:mp-weixin
pnpm build:mp-weixin
```

也可以直接用 HBuilderX 导入当前目录运行。
