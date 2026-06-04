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
| `react-vite-tailwindcss-v3` | 7408 bytes | 6423 bytes |
| `react-vite-tailwindcss-v4` | 10765 bytes | 6447 bytes |
| `vue-vite-tailwindcss-v3` | 7302 bytes | 6317 bytes |
| `vue-vite-tailwindcss-v4` | 10597 bytes | 6237 bytes |

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

- 默认关闭 `rem2rpx`，`.p-6` 在 weapp 产物中仍保留 `padding:1.5rem`
- 类名转义为小程序安全格式，例如 `.gap-[16rpx]` 转为 `.gap-_b16rpx_B`
- `hover:` 在小程序产物中被移除，`active:` 被保留
- `dark:` 选择器从 `:is(.dark *)` 转为 `.dark view...,.dark text...`
- v3 小程序产物不包含 v4 的 `:host,page,.tw-root,wx-root-portal-content`

复杂值覆盖：

- `!p-[18.5px]` 在 web 中保留为 `padding:18.5px !important`，在 weapp 中类名转为 `_ep-_b18_d5px_B`
- `-mt-1.5` 在 web 与 weapp 中均保留 `margin-top:-0.375rem`
- `!-translate-y-[3.5px]` 在 weapp 中类名转为 `_e-translate-y-_b3_d5px_B`，并保留 `!important`
- `-ml-[5.5px]`、`rounded-[18.5px]`、`opacity-[0.82]`、`scale-[1.03]` 均生成小程序安全类名
- `bg-[linear-gradient(...)]` 在 web 与 weapp 中均保留实际 `linear-gradient(...)`

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
  --spacing: .25rem;
}
```

关键差异：

- `oklch(...)` 颜色在 weapp 产物中被转换为 hex / rgb 可用值
- 默认关闭 `rem2rpx`，`--spacing` 在 weapp 产物中仍保留 `.25rem`
- `@property --tw-content` 存在于 web 产物，但 weapp 产物会移除 `@property`
- `--tw-content` 仍会在用到 `before:content-*` 时出现在 web 与 weapp 产物中
- v4 小程序产物不包含 v3 的 `view,text,::before,::after` 变量 reset

复杂值覆盖：

- `!p-[18.5px]` 在 web 与 weapp 中均生成 `padding: 18.5px !important`
- `-ml-[5.5px]` 在 web 中为 `margin-left: calc(5.5px * -1)`，在 weapp 中类名转为 `-ml-_b5_d5px_B`
- `!-translate-y-[3.5px]` 在 web 与 weapp 中都保留负值和 `!important`
- `rounded-[18.5px]`、`text-[13.5px]`、`px-[13.5px]`、`scale-[1.03]`、`opacity-[0.82]` 都在 web 与 weapp 产物中生成
- `bg-[#123456]` 在 v4 weapp 产物中保持 `#123456`，v3 weapp 产物中会转为 `rgba(18, 52, 86, ...)`
- `bg-[linear-gradient(...)]` 在 web 与 weapp 中均保留实际 `linear-gradient(...)`

## 结论

关闭浏览器 preflight 后，4 组 demo 的产物边界是清晰的：

- Tailwind v3 小程序产物保留 v3 风格的 `view,text,::before,::after` reset 与 `--tw-*` 工具变量。
- Tailwind v4 小程序产物保留 v4 风格的 `:host,page,.tw-root,wx-root-portal-content` 主题变量根。
- `--tw-content` 不是 v3 独有变量。Tailwind v4 在 web 产物中会生成 `@property --tw-content`，并且使用 `before:content-*` 时会继续生成 `--tw-content`。
- 当前 demo 中没有发现浏览器 preflight 串入 web 或 weapp 产物。
