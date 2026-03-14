# CacheOptions

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:14

Configures how the Tailwind class cache is stored and where it lives on disk.

## 属性

### enabled?

> `optional` **enabled**: `boolean`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:16

Whether caching is enabled.

***

### cwd?

> `optional` **cwd**: `string`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:18

Working directory used when resolving cache paths.

***

### dir?

> `optional` **dir**: `string`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:20

Directory where cache files are written.

***

### file?

> `optional` **file**: `string`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:25

Cache filename. Defaults to `class-cache.json` inside the derived cache folder
when omitted.

***

### strategy?

> `optional` **strategy**: `CacheStrategy`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:27

Strategy used when merging new class lists with an existing cache.

***

### driver?

> `optional` **driver**: `CacheDriver`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:29

Backend used to persist the cache (`file`, `memory`, or `noop`). Defaults to `file`.
