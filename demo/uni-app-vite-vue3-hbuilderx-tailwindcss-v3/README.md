# uni-app-vite-vue3-hbuilderx-tailwindcss-v3

`uni-app + Vite + Vue3 + HBuilderX + Tailwind CSS v3` demo.

## 关键配置

- `vite.config.ts` 直接注册 `WeappTailwindcss(hbuilderx(...))`
- `main.css` 使用 Tailwind CSS v3 指令
- `tailwind.config.js` 负责扫描 HBuilderX 根目录项目文件
- 不注册 `tailwindcss` PostCSS 插件，也不注册 `@tailwindcss/vite`

## 运行

```bash
pnpm install
pnpm dev:mp-weixin
pnpm build:mp-weixin
```

也可以直接用 HBuilderX 导入当前目录运行。
