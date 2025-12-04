# tailwind-variant-v3

面向 Tailwind CSS 的运行时变体工具，支持 TypeScript、slot 缓存与可拓展的 `tailwind-merge` 配置。本包对应 monorepo 中 `packages-runtime/tailwind-variant-v3` 的发布产物。

## 特性

- ⚡️ **组合式变体**：同一组件可同时定义 `base`、`slots`、`variants`、`compoundVariants` 与 `compoundSlots`。
- 📱 **响应式变体**：通过 `responsiveVariants` 一次声明，即可获得 `sm: / md:` 前缀的派生类。
- 🧰 **Tailwind Merge 支持**：内置 `cn`、`cnBase`，可自定义 `twMergeConfig` 并自动缓存。
- 🧠 **Slot 缓存**：slot 渲染默认复用缓存结果，仅在传入 variant 覆盖时重新计算。
- 🧪 **TypeScript 优先**：`tv`、`createTV`、响应式 props、Vitest 匹配器都有完善类型。

## 安装

```bash
pnpm add tailwind-variant-v3
# 或
npm install tailwind-variant-v3
# 或
yarn add tailwind-variant-v3
```

## 快速上手

<!-- prettier-ignore -->
```ts
import { cn, tv } from 'tailwind-variant-v3'

const button = tv({
  base: 'inline-flex items-center gap-2 font-medium transition-colors',
  slots: {
    icon: 'size-4',
    label: 'truncate',
  },
  variants: {
    tone: {
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      secondary: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800',
      ghost: 'bg-transparent text-zinc-900 hover:bg-zinc-100',
    },
    size: {
      sm: { base: 'h-8 px-3 text-xs', icon: 'size-3' },
      md: { base: 'h-10 px-4 text-sm', icon: 'size-4' },
      lg: { base: 'h-12 px-6 text-base', icon: 'size-5' },
    },
  },
  defaultVariants: {
    tone: 'primary',
    size: 'md',
  },
})

const slots = button({ tone: 'ghost', size: 'lg' })

slots.base()
slots.icon({ class: 'text-xl' })

const className = cn('flex', ['text-sm', 'md:text-lg'])({ twMerge: true })
```

## API 摘要

| Helper                       | 说明                                                            |
| ---------------------------- | --------------------------------------------------------------- |
| `tv(config, runtimeConfig?)` | 创建带 slot/variant/compound 能力的生成器，支持响应式与默认值。 |
| `createTV(baseConfig)`       | 预先注入一份全局配置，创建多个风格一致的 `tv` 实例。            |
| `cn(...classValues)`         | 基于 `tailwind-merge` 的类名合并工具。                          |
| `cnBase(...classValues)`     | 纯字符串连接（不做 merge）。                                    |

更多类型定义可参考 `src/types.d.ts`。

## 响应式变体示例

<!-- prettier-ignore -->
```ts
const card = tv(
  { variants: { tone: { neutral: 'text-zinc-700', brand: 'text-blue-600' } } },
  { responsiveVariants: ['sm', 'md', 'lg'] },
)

card({
  tone: {
    initial: 'neutral',
    md: 'brand',
  },
})
// => 'text-zinc-700 md:text-blue-600'
```

## 基准测试

```bash
pnpm --filter tailwind-variant-v3 bench
```

- 对比数据见 [`BENCHMARK.md`](./BENCHMARK.md)
- 原始输出存放于 [`benchmark/`](./benchmark)，便于追踪优化收益

## 开发脚本

```bash
pnpm install
pnpm --filter tailwind-variant-v3 dev    # tsdown watch
pnpm --filter tailwind-variant-v3 lint
pnpm --filter tailwind-variant-v3 test   # Vitest
pnpm --filter tailwind-variant-v3 build
```

更多 monorepo 规范详见仓库根目录的 `AGENTS.md`。

## 许可证

MIT © weapp-tailwindcss contributors
