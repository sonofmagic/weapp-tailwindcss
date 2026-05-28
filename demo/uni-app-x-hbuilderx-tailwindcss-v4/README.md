# uni-app-x-hbuilderx-tailwindcss-v4

`uni-app x + HBuilderX + Tailwind CSS v4` demo.

## 关键配置

- `vite.config.ts` 直接注册 `WeappTailwindcss(uniAppX(...))`
- `main.css` 使用 `@import "tailwindcss"` 与 `@source`
- `cssEntries` 显式指向 `main.css`
- 不注册 `@tailwindcss/postcss`，也不注册 `@tailwindcss/vite`

## 运行

```bash
pnpm install
pnpm dev:mp-weixin
pnpm dev:android:emulator
```

也可以直接用 HBuilderX 导入当前目录运行。
