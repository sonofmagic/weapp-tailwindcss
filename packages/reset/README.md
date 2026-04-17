# @weapp-tailwindcss/reset

`@weapp-tailwindcss/reset` 提供了一组可直接导入的静态 reset 样式，适用于 `uni-app` 与 `taro` 小程序项目。

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

如果你需要更强的可配置能力，而不是静态 CSS 文件，请使用主包中的 `weapp-tailwindcss/reset` Tailwind 插件入口。
