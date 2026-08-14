# @weapp-tailwindcss/cli

独立发布的 Tailwind CSS v4 命令行工具，默认生成 Web CSS，并可通过 `--target weapp` 输出小程序兼容 CSS。

## 安装

```bash
pnpm add -D @weapp-tailwindcss/cli weapp-tailwindcss tailwindcss
```

`weapp-tw` 与 `weapp-tailwindcss` 是等价的命令入口：

```bash
pnpm exec weapp-tw -i src/input.css -o dist/output.css
pnpm exec weapp-tw build -i src/input.css -o dist/output.css
pnpm exec weapp-tailwindcss canonicalize "py-3 p-1 px-3"
```

CLI 复用 `weapp-tailwindcss` 的 Tailwind v4 generator、design system 与 CSS 转换能力，不依赖或调用 `@tailwindcss/cli`。watch 默认使用 `@parcel/watcher` 原生事件；使用 `--poll[=ms]` 可切换到轮询，原生后端不可用时也会自动降级。

默认目标是 `web`。显式传入 `--target weapp` 时只转换 CSS，不扫描或改写 WXML、JavaScript、TypeScript、JSX、TSX 或已有 WXSS。完整小程序项目应继续使用 `weapp-tailwindcss` 的 Vite、Webpack、Rspack 或 Gulp 集成。

完整参数、watch、source map 与 `canonicalize` 用法见 [CLI 使用指南](https://tw.icebreaker.top/docs/tools/weapp-tw-cli)。

## 程序化调用

```ts
import { runCli } from '@weapp-tailwindcss/cli'

const exitCode = await runCli(['-i', 'src/input.css', '-o', 'dist/output.css'])
```

导入包不会自动执行命令。`runCli` 沿用命令行的 stdout、stderr 与 `process.exitCode` 语义。
