# @weapp-tailwindcss/cva

`@weapp-tailwindcss/cva` 是 `class-variance-authority` 在小程序端的运行时封装：内置 weapp-tailwindcss 的 escape/unescape 逻辑，确保运行时拼接出来的类名与编译期一致。

- ☑️ 自动处理 `[#...]` 等非法字符
- 🔄 兼容 `cva` 原有 API/类型推导
- ⚙️ 通过 `create` 自定义 escape、unescape 或字符映射

## 安装

```bash
pnpm add @weapp-tailwindcss/cva class-variance-authority
```

## 快速上手

```ts
import { cva } from '@weapp-tailwindcss/cva'

const button = cva('inline-flex rounded', {
  variants: {
    tone: {
      primary: 'text-[#2563EB] bg-[#E0EDFF]',
      ghost: 'text-[#0F172A]',
    },
  },
  defaultVariants: {
    tone: 'primary',
  },
})

button({ tone: 'ghost' })
// => 自动 escape 后的类名，可直接写入小程序模板
```

## 自定义运行时

```ts
import { create } from '@weapp-tailwindcss/cva'

const { cva: cvaForWeb } = create({
  escape: false,
  unescape: false,
})

cvaForWeb('text-[#ECECEC]') // 在 SSR 或 Web 环境保持原样
```

更多示例：<https://tw.icebreaker.top/docs/community/merge/cva-and-variants>
