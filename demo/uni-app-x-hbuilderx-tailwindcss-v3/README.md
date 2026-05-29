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
pnpm dev:ios:simulator
```

也可以直接用 HBuilderX 导入当前目录运行。

## 本地 E2E

App 端依赖本机 HBuilderX、Android 模拟器或 iOS 模拟器，只在本地运行，不纳入 CI/CD。

```bash
pnpm e2e:hbuilderx:local:app
pnpm e2e:hbuilderx:local:android
pnpm e2e:hbuilderx:local:ios
```

如果本机安装了完整 Xcode，但 `xcode-select` 仍指向 CommandLineTools，可以临时指定：

```bash
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer pnpm e2e:hbuilderx:local:ios
```
