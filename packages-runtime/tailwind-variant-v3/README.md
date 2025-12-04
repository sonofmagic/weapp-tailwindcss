# tailwind-variant-v3

Type-safe runtime helpers for composing Tailwind CSS class variants in modern frameworks. This package is the next iteration of the `tailwind-variants` runtime and mirrors the API exposed from `packages-runtime/tailwind-variant-v3` inside the monorepo.

## Features

- ⚡️ **Composable variants** – define base classes, slots, and multiple variant groups with defaults.
- 🧠 **Responsive-aware** – opt into per-screen variants with automatic prefix expansion.
- 🧩 **Slot caching** – slot renders reuse cached class lists, recomputing only when overrides are provided.
- 🧪 **TypeScript first** – full typings for `tv`, `createTV`, and custom matchers used in Vitest.
- 🧰 **Tailwind merge integration** – configurable `tailwind-merge` support with extendable config.

## Installation

```bash
pnpm add tailwind-variant-v3
# or
npm install tailwind-variant-v3
# or
yarn add tailwind-variant-v3
```

## Quick start

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

slots.base() // => merged classes for the root element
slots.icon({ class: 'text-xl' }) // slot overrides are merged lazily

const className = cn('flex', ['text-sm', 'md:text-lg'], { foo: true })({
  twMerge: true,
})
```

## API overview

| Helper                       | Description                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `tv(config, runtimeConfig?)` | Creates a variant composer with slots, variants, defaults, responsive variants, compound variants, and compound slots. |
| `createTV(baseConfig)`       | Returns a factory preloaded with shared config (e.g., disable `twMerge`).                                              |
| `cn(...classValues)`         | Lightweight wrapper around `tailwind-merge` with caching.                                                              |
| `cnBase(...classValues)`     | Raw string joiner when you do not need merging.                                                                        |

See `src/types.d.ts` for the full type surface.

## Responsive variants

Enable responsive variants globally or per variant by setting `responsiveVariants` when creating a `tv` instance:

<!-- prettier-ignore -->
```ts
const component = tv(
  {
    variants: {
      tone: {
        primary: 'text-blue-500',
        danger: 'text-red-500',
      },
    },
  },
  {
    responsiveVariants: ['sm', 'md', 'lg'],
  },
)

component({
  tone: {
    initial: 'primary',
    md: 'danger',
  },
})
// => 'text-blue-500 md:text-red-500'
```

## Benchmarks

Benchmarks rely on Vitest 4 bench mode. Run them locally with:

```bash
pnpm --filter tailwind-variant-v3 bench
```

Historical results live in [`BENCHMARK.md`](./BENCHMARK.md); raw exports are stored inside [`benchmark/`](./benchmark) for regression tracking.

## Development

```bash
pnpm install
pnpm --filter tailwind-variant-v3 lint
pnpm --filter tailwind-variant-v3 test
pnpm --filter tailwind-variant-v3 build
```

- `pnpm --filter tailwind-variant-v3 dev` – watch mode via tsdown
- `pnpm --filter tailwind-variant-v3 test` – Vitest unit & integration suites
- `pnpm --filter tailwind-variant-v3 bench` – Vitest bench suites

Refer to `AGENTS.md` in the repo root for monorepo conventions (pnpm workspaces, Turbo, lint/test requirements).

## License

MIT © weapp-tailwindcss contributors
