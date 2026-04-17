# @weapp-tailwindcss/reset

`@weapp-tailwindcss/reset` 同时提供两类能力：

- 可直接导入的静态 reset CSS 资源，适用于 `uni-app` 与 `taro`
- 可注册到 Tailwind 的 `reset()` 插件入口

当前提供：

- `button-after.css`：清理 `button::after`
- `normalize.css`：基于 `normalize.css` 的跨端静态版本
- `modern-normalize.css`：基于 `modern-normalize` 的跨端静态版本
- `eric-meyer.css`：经典 Eric Meyer reset
- `sanitize/sanitize.css`：基于 `sanitize.css` 的主体重置
- `sanitize/assets.css`：`sanitize.css` 的资源尺寸约束补充
- `tailwind.css`：静态版 Tailwind preflight
- `tailwind-compat.css`：在 `tailwind.css` 基础上移除按钮背景色重置，降低和组件库冲突概率

## 安装

```bash
pnpm add -D @weapp-tailwindcss/reset
```

## 用法

### 1. 作为 Tailwind 插件使用

```ts
import reset from '@weapp-tailwindcss/reset'

export default {
  plugins: [reset()],
}
```

它支持和原先 `weapp-tailwindcss/reset` 相同的选项：

```ts
reset({
  buttonReset: false,
  imageReset: {
    selectors: ['.wx-reset-image'],
  },
  extraResets: [
    {
      selectors: ['.wx-reset-view'],
      declarations: {
        display: 'block',
      },
    },
  ],
})
```

现在还支持 `preset`，用来快速启用一组内置 reset：

```ts
reset({ preset: 'form' })
reset({ preset: ['content', 'media'] })
reset({ preset: 'all', listReset: false })
```

可选预设：

- `minimal`：默认值，仅 `button` + `image`
- `form`：`minimal` + `input` + `textarea`
- `content`：`minimal` + `ul/ol` + `navigator/a`
- `media`：`minimal` + `video`
- `all`：启用全部内置 reset

新增内置 reset 项：

- `inputReset`
- `textareaReset`
- `listReset`
- `navigatorReset`
- `videoReset`

### 2. 作为静态 CSS 资源使用

`uni-app` 通常在 `src/main.ts` 或入口样式中导入：

```ts
import "@weapp-tailwindcss/reset/uni-app/button-after.css";
import "@weapp-tailwindcss/reset/uni-app/modern-normalize.css";
import "@weapp-tailwindcss/reset/uni-app/sanitize/sanitize.css";
import "@weapp-tailwindcss/reset/uni-app/sanitize/assets.css";
import "@weapp-tailwindcss/reset/uni-app/tailwind-compat.css";
```

`taro` 通常在 `src/app.tsx` 或入口样式中导入：

```ts
import "@weapp-tailwindcss/reset/taro/button-after.css";
import "@weapp-tailwindcss/reset/taro/modern-normalize.css";
import "@weapp-tailwindcss/reset/taro/sanitize/sanitize.css";
import "@weapp-tailwindcss/reset/taro/sanitize/assets.css";
import "@weapp-tailwindcss/reset/taro/tailwind-compat.css";
```

如果你想保留按钮原生背景色，优先使用 `tailwind-compat.css`。

如果你要更轻量、更传统的 reset，可以按需改用 `normalize.css`、`modern-normalize.css` 或 `eric-meyer.css`，它们都支持 `uni-app` / `taro` 两套路径。

为了兼容旧项目，`weapp-tailwindcss/reset` 仍然保留导出入口；但新的实际实现已经迁到 `@weapp-tailwindcss/reset`。
