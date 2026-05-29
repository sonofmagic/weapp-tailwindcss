# uni-app-x-hbuilderx-tailwindcss-v3

`uni-app x + HBuilderX + Tailwind CSS v3` demo.

## 关键配置

- `vite.config.ts` 直接注册 `WeappTailwindcss(uniAppX(...))`
- `App.uvue` 使用 Tailwind CSS v3 指令
- `tailwind.config.js` 扫描 `uvue` / `uts` 文件
- 不注册 `tailwindcss` PostCSS 插件

## 运行

```bash
pnpm install
pnpm dev:mp-weixin
pnpm dev:android:emulator
```

也可以直接用 HBuilderX 导入当前目录运行。
