# Web Vite Tailwind CSS 产物对比报告

本文记录 `demo/web` 中 4 个纯 Vite demo 在 `web` 与 `weapp` 两种 target 下的 CSS 产物差异。对比前已关闭 Tailwind 浏览器 preflight。

## 对比对象

| 项目 | Tailwind | 前端框架 | Web 产物 | Weapp 产物 |
| --- | --- | --- | --- | --- |
| `react-vite-tailwindcss-v3` | `3.4.19` | React | `dist/assets/index-DmKKQyw6.css` | `dist-weapp/assets/index-DmKKQyw6.css` |
| `react-vite-tailwindcss-v4` | `4.3.0` | React | `dist/assets/index-O-2rfzTJ.css` | `dist-weapp/assets/index-O-2rfzTJ.css` |
| `vue-vite-tailwindcss-v3` | `3.4.19` | Vue | `dist/assets/index-DmKKQyw6.css` | `dist-weapp/assets/index-DmKKQyw6.css` |
| `vue-vite-tailwindcss-v4` | `4.3.0` | Vue | `dist/assets/index-CwT7z9ri.css` | `dist-weapp/assets/index-CwT7z9ri.css` |

## 构建命令

```bash
pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v3 build:web
pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v3 build:weapp
pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v4 build:web
pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v4 build:weapp
pnpm --filter @weapp-tailwindcss-demo/web-vue-vite-tailwindcss-v3 build:web
pnpm --filter @weapp-tailwindcss-demo/web-vue-vite-tailwindcss-v3 build:weapp
pnpm --filter @weapp-tailwindcss-demo/web-vue-vite-tailwindcss-v4 build:web
pnpm --filter @weapp-tailwindcss-demo/web-vue-vite-tailwindcss-v4 build:weapp
```

## Preflight 状态

4 组产物均未包含浏览器 preflight：

- `button` / `button, input, select, optgroup, textarea`：不存在
- `::-webkit` / `-webkit-inner-spin-button`：不存在
- Tailwind v3 demo 通过 `corePlugins.preflight = false` 关闭
- Tailwind v4 demo 通过显式导入 `theme.css` 与 `utilities.css`，不导入 `preflight.css`

## 产物尺寸

| 项目 | Web CSS | Weapp CSS |
| --- | ---: | ---: |
| `react-vite-tailwindcss-v3` | 5449 bytes | 4438 bytes |
| `react-vite-tailwindcss-v4` | 8744 bytes | 4792 bytes |
| `vue-vite-tailwindcss-v3` | 5343 bytes | 4332 bytes |
| `vue-vite-tailwindcss-v4` | 8576 bytes | 4582 bytes |

## Tailwind v3 差异

Web 产物保留 v3 运行时变量初始化，作用域为浏览器选择器：

```css
*, ::before, ::after {
  --tw-border-spacing-x: 0;
  --tw-translate-x: 0;
}
```

Weapp 产物把作用域转换为小程序选择器，并注入必要 reset：

```css
::before,::after {
  --tw-content: '';
}
view,text,::before,::after {
  --tw-border-spacing-x: 0;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
```

关键差异：

- `rem` 转为 `rpx`，例如 `.p-6` 从 `1.5rem` 转为 `48rpx`
- 类名转义为小程序安全格式，例如 `.gap-[16rpx]` 转为 `.gap-_b16rpx_B`
- `hover:` 在小程序产物中被移除，`active:` 被保留
- `dark:` 选择器从 `:is(.dark *)` 转为 `.dark view...,.dark text...`
- v3 小程序产物不包含 v4 的 `:host,page,.tw-root,wx-root-portal-content`

## Tailwind v4 差异

Web 产物以 v4 theme variables 和 property registration 为主：

```css
@layer theme {
  :root, :host {
    --color-blue-500: oklch(...);
    --spacing: .25rem;
  }
}
@property --tw-content {
  syntax: "*";
  inherits: false;
}
```

Weapp 产物把主题变量挂到小程序根选择器，并把颜色转为小程序更稳的格式：

```css
:host,page,.tw-root,wx-root-portal-content {
  --color-blue-500: #3b82f6;
  --spacing: 8rpx;
}
```

关键差异：

- `oklch(...)` 颜色在 weapp 产物中被转换为 hex / rgb 可用值
- `--spacing` 从 `.25rem` 转为 `8rpx`
- `@property --tw-content` 存在于 web 产物，但 weapp 产物会移除 `@property`
- `--tw-content` 仍会在用到 `before:content-*` 时出现在 web 与 weapp 产物中
- v4 小程序产物不包含 v3 的 `view,text,::before,::after` 变量 reset

## 结论

关闭浏览器 preflight 后，4 组 demo 的产物边界是清晰的：

- Tailwind v3 小程序产物保留 v3 风格的 `view,text,::before,::after` reset 与 `--tw-*` 工具变量。
- Tailwind v4 小程序产物保留 v4 风格的 `:host,page,.tw-root,wx-root-portal-content` 主题变量根。
- `--tw-content` 不是 v3 独有变量。Tailwind v4 在 web 产物中会生成 `@property --tw-content`，并且使用 `before:content-*` 时会继续生成 `--tw-content`。
- 当前 demo 中没有发现浏览器 preflight 串入 web 或 weapp 产物。
