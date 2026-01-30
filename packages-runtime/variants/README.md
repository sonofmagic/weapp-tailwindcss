# @weapp-tailwindcss/variants

`@weapp-tailwindcss/variants` 为 [`tailwind-variants`](https://tailwind-variants.org/) 提供小程序友好的运行时封装，导出的 `tv`、`cn`、`createTV` 等 API 会自动完成 escape/unescape，并复用 `tailwind-merge`。

## 特性

- `tv` 与官方写法完全一致，但输出结果已转义
- 提供 `cn`/`cnBase`，适合组合类名或开启/关闭 `twMerge`
- 可通过 `create` 传入 `escape`/`unescape` 配置，微调运行时行为
- 支持在 `create` 里配置默认 `twMergeConfig` / `twMergeAdapter`

## 安装

```bash
pnpm add @weapp-tailwindcss/variants
```

## 快速上手

```ts
import { tv } from '@weapp-tailwindcss/variants'

const badge = tv({
  base: 'inline-flex rounded-full text-xs font-semibold',
  variants: {
    tone: {
      neutral: 'bg-[#F4F4F5] text-[#18181B]',
      danger: 'bg-[#FEE2E2] text-[#B91C1C]',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
})

badge({ tone: 'danger' })
// => 'bg-_b_hFEE2E2_B text-_b_hB91C1C_B inline-flex ...'
```

## `cn` / `cnBase`

```ts
import { cn } from '@weapp-tailwindcss/variants'

const mergeLater = cn('text-[#ececec]', isActive && 'text-[#ECECEC]')
mergeLater() // => 去重 + escape
mergeLater({ twMerge: false }) // => 仅 escape，不做合并
```

## 默认 twMerge 配置

```ts
import { create } from '@weapp-tailwindcss/variants'

const { cn, tv } = create({
  twMergeConfig: {
    extend: {
      classGroups: {
        'font-size': [{ text: ['20', '22', '24', '26', '28', '30', '32'] }],
      },
    },
  },
})

cn('text-32', 'text-surface-700')()
tv({ base: 'text-32 text-surface-700' })()
```

更多说明：<https://tw.icebreaker.top/docs/community/merge/cva-and-variants>
