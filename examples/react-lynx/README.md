# ReactLynx + Tailwind CSS

ReactLynx + Rspeedy 的最小 Tailwind CSS v4 示例。

```bash
pnpm --filter @weapp-tailwindcss/example-react-lynx build
```

`lynx.config.ts` 通过 `pluginLynxTailwindcss()` 注册构建器适配；`src/global.css` 保留 Tailwind v4 的 `@import "tailwindcss"` 和源码 `@source`。

本地开发与真实 iOS Simulator 验收：

```bash
pnpm --filter @weapp-tailwindcss/example-react-lynx dev
pnpm e2e:lynx:ios
```

视觉命令要求已启动的 iOS Simulator 和 `com.lynx.LynxExplorer`。生成的最终截图、目标区域裁剪图、Rspeedy 日志和像素分析保存在 `e2e/.artifacts/lynx-ios/`。
