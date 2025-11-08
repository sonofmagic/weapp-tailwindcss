# @weapp-tailwindcss/merge-v3

`@weapp-tailwindcss/merge-v3` 是面向 `tailwindcss@3` 项目的运行时，内部基于 `tailwind-merge@2` 并自动处理 weapp-tailwindcss 所需的 escape/unescape 流程。

- ✅ 适用于仍在使用 Tailwind v3 的小程序代码库
- 🔁 `twMerge`、`twJoin`、`extendTailwindMerge`、`createTailwindMerge` API 与官方一致
- ⚙️ 通过 `create` 自定义 escape 行为或额外映射

## 安装

```bash
pnpm add @weapp-tailwindcss/merge-v3
```

## 基本用法

```ts
import { twMerge } from '@weapp-tailwindcss/merge-v3'

twMerge('p-1 p-2 p-0.5') // => 已 escape 的结果，可直接写入 class 属性
```

## 工厂模式

```ts
import { create } from '@weapp-tailwindcss/merge-v3'

const { twMerge: strictMerge } = create({
  escape: false,
  unescape: false,
})

strictMerge('text-[#ECECEC]') // => 保持原样（方便 SSR / Web）
```

如需自动检测 tailwind 主版本，请使用 `@weapp-tailwindcss/merge`；该包只负责 v3 兼容场景。更多介绍：<https://tw.icebreaker.top/docs/community/merge/overview>
