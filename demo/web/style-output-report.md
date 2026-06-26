# Web Tailwind CSS 产物对比报告

本文记录 `demo/web` 中 6 个纯 Web Tailwind CSS v4 demo 在 `web` 与 `weapp` 两种 target 下的 CSS 产物差异。对比前已关闭 Tailwind 浏览器 preflight。

## 对比对象

| 项目 | Tailwind | 前端框架 | Web 产物 | Weapp 产物 |
| --- | --- | --- | --- | --- |
| `react-vite-tailwindcss-v4` | `4.x` | React | `dist/assets/*.css` | `dist-weapp/assets/*.css` |
| `vue-vite-tailwindcss-v4` | `4.x` | Vue | `dist/assets/*.css` | `dist-weapp/assets/*.css` |
| `react-rsbuild-tailwindcss-v4` | `4.x` | React | `dist/static/css/*.css` | `dist-weapp/static/css/*.css` |
| `vue-rsbuild-tailwindcss-v4` | `4.x` | Vue | `dist/static/css/*.css` | `dist-weapp/static/css/*.css` |
| `react-webpack-tailwindcss-v4` | `4.x` | React | `dist/assets/*.css` | `dist-weapp/assets/*.css` |
| `vue-webpack-tailwindcss-v4` | `4.x` | Vue | `dist/assets/*.css` | `dist-weapp/assets/*.css` |

注册方式：

- Vite：`weapp-tailwindcss/vite`
- Rsbuild：通过 `tools.rspack.plugins` 注册 `weapp-tailwindcss/webpack`
- Webpack：通过 `plugins` 注册 `weapp-tailwindcss/webpack`

## 构建命令

```bash
pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v4 build:web
pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v4 build:weapp
pnpm --filter @weapp-tailwindcss-demo/web-vue-vite-tailwindcss-v4 build:web
pnpm --filter @weapp-tailwindcss-demo/web-vue-vite-tailwindcss-v4 build:weapp
pnpm --filter @weapp-tailwindcss-demo/web-react-rsbuild-tailwindcss-v4 build:web
pnpm --filter @weapp-tailwindcss-demo/web-react-rsbuild-tailwindcss-v4 build:weapp
pnpm --filter @weapp-tailwindcss-demo/web-vue-rsbuild-tailwindcss-v4 build:web
pnpm --filter @weapp-tailwindcss-demo/web-vue-rsbuild-tailwindcss-v4 build:weapp
pnpm --filter @weapp-tailwindcss-demo/web-react-webpack-tailwindcss-v4 build:web
pnpm --filter @weapp-tailwindcss-demo/web-react-webpack-tailwindcss-v4 build:weapp
pnpm --filter @weapp-tailwindcss-demo/web-vue-webpack-tailwindcss-v4 build:web
pnpm --filter @weapp-tailwindcss-demo/web-vue-webpack-tailwindcss-v4 build:weapp
```

## Preflight 状态

2 组产物均不导入 `tailwindcss/preflight.css`，只显式导入 `theme.css` 与 `utilities.css`。

## Tailwind v4 差异

Rsbuild demo 通过 `tools.rspack` 注册 `weapp-tailwindcss/webpack` 后，`weapp` target 可以在 asset 阶段生成完整小程序 CSS；`web` target 当前保留 Rsbuild 默认 CSS 处理结果，未触发 Tailwind v4 生成 loader。这是该组 demo 用来对比 Vite/Webpack 的重点差异之一。

Web 产物以 v4 theme variables 和 property registration 为主，weapp 产物会把主题变量挂到小程序根选择器，并把不适合小程序的语法转成更稳定的格式。

关键差异：

- `oklch(...)` 颜色在 weapp 产物中会被转换为 hex / rgb 可用值。
- 默认关闭 `rem2rpx`，`--spacing` 在 weapp 产物中仍保留 `.25rem`。
- `@property --tw-content` 存在于 web 产物，但 weapp 产物会移除 `@property`。
- 使用 `before:content-*` 时，web 与 weapp 产物中都会保留必要的 `--tw-content`。
- 小程序产物使用 `:host,page,.tw-root,wx-root-portal-content` 作为主题变量根。

复杂值覆盖：

- `!p-[18.5px]` 在 web 与 weapp 中均生成 `padding: 18.5px !important`。
- `-ml-[5.5px]` 在 web 中为 `margin-left: calc(5.5px * -1)`，在 weapp 中类名转为小程序安全形式。
- `[box-shadow:0_2.5px_7.5px_rgba(18,52,86,0.35)]` 在 web 与 weapp 中都生成等价阴影声明。
- `rounded-[18.5px]`、`text-[13.5px]`、`px-[13.5px]`、`scale-[1.03]`、`opacity-[0.82]` 都在 web 与 weapp 产物中生成。
- `bg-[linear-gradient(...)]` 在 web 与 weapp 中均保留实际 `linear-gradient(...)`。

## 结论

关闭浏览器 preflight 后，两个 v4 demo 的 web 与 weapp 产物边界清晰：web 保留浏览器侧 Tailwind v4 语义，weapp target 通过 `weapp-tailwindcss` 输出小程序可用选择器和 CSS 语法。
