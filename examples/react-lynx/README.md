# ReactLynx + Tailwind CSS

ReactLynx + Rspeedy 的最小 Tailwind CSS v4 示例。

```bash
pnpm --filter @weapp-tailwindcss/example-react-lynx build
```

`lynx.config.ts` 通过 `pluginLynxTailwindcss()` 注册构建器适配；`src/global.css` 保留 Tailwind v4 入口和源码 `@source`。实际项目推荐只引入 `tailwindcss/theme.css` 与 `tailwindcss/utilities.css`，避免将浏览器 preflight 中 Lynx 不支持的选择器交给 Rspeedy。

```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities) source(none);

@source "./**/*.{ts,tsx}";
```

## 任意值验证

`src/tailwind-sources.ts` 提供任意值扫描语料，覆盖：

- `px`、`rpx`、小数、`calc()` 与 CSS 变量；
- hex、RGB、透明度与渐变颜色；
- 任意字号、行高、字距、间距、圆角和布局值；
- important、attribute、pseudo、media 与 group arbitrary variants。

运行完整静态回归：

```bash
pnpm e2e:lynx
```

该命令先构建 `@weapp-tailwindcss/lynx`，再生成真实的 `main.lynx.bundle`，并断言 Tailwind 指令已编译、基础 utility 已静态化且任意值语料持续被扫描。

需要注意，Tailwind 成功生成 CSS 不代表 Lynx 支持其中的每个属性或选择器。当前 Rspeedy/Lynx encoder 会删除 `padding-inline`、`mask-type`、`text-decoration-line` 与包含复杂 `:is()` / `:where()` 的 selector。对应写法和完整兼容性矩阵见 [`@weapp-tailwindcss/lynx` README](../../packages/lynx/README.md#任意值)。

本地开发与真实 iOS Simulator 验收：

```bash
pnpm --filter @weapp-tailwindcss/example-react-lynx dev
pnpm e2e:lynx:ios
```

视觉命令要求已启动的 iOS Simulator 和 `com.lynx.LynxExplorer`。生成的最终截图、目标区域裁剪图、Rspeedy 日志和像素分析保存在 `e2e/.artifacts/lynx-ios/`。
