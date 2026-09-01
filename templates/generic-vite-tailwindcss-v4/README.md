# generic-vite-tailwindcss-v4

`Generic Vite + TypeScript + HTML + Tailwind CSS v4` canonical Web template.

## Quick start

```bash
pnpm install
pnpm dev
pnpm build
```

The CSS entry uses `@import "tailwindcss"` and an explicit `@source`. The
Vite config selects the main `weapp-tailwindcss/vite` entry with an explicit
`web` target, which is equivalent to the dedicated `weapp-tailwindcss/vite/web`
entry in releases that expose it. It does not transform JavaScript or
templates. Do not register `@tailwindcss/vite` or `@tailwindcss/postcss` in the
same build.
