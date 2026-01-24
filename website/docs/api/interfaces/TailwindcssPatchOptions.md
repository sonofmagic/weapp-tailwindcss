# TailwindcssPatchOptions

定义于: node_modules/.pnpm/tailwindcss-patch@8.6.1_magicast@0.5.1_tailwindcss@4.1.18/node_modules/tailwindcss-patch/dist/index.d.ts:117

Root configuration consumed by the Tailwind CSS patch runner.

## 属性

### cwd?

> `optional` **cwd**: `string`

定义于: node_modules/.pnpm/tailwindcss-patch@8.6.1_magicast@0.5.1_tailwindcss@4.1.18/node_modules/tailwindcss-patch/dist/index.d.ts:122

Base directory used when resolving Tailwind resources.
Defaults to `process.cwd()`.

***

### overwrite?

> `optional` **overwrite**: `boolean`

定义于: node_modules/.pnpm/tailwindcss-patch@8.6.1_magicast@0.5.1_tailwindcss@4.1.18/node_modules/tailwindcss-patch/dist/index.d.ts:124

Whether to overwrite generated artifacts (e.g., caches, outputs).

***

### tailwind?

> `optional` **tailwind**: `TailwindUserOptions`

定义于: node_modules/.pnpm/tailwindcss-patch@8.6.1_magicast@0.5.1_tailwindcss@4.1.18/node_modules/tailwindcss-patch/dist/index.d.ts:126

Tailwind-specific configuration grouped by major version.

***

### features?

> `optional` **features**: `FeatureUserOptions`

定义于: node_modules/.pnpm/tailwindcss-patch@8.6.1_magicast@0.5.1_tailwindcss@4.1.18/node_modules/tailwindcss-patch/dist/index.d.ts:128

Feature toggles for optional helpers.

***

### filter()?

> `optional` **filter()**: `((className: string) => boolean)`

定义于: node_modules/.pnpm/tailwindcss-patch@8.6.1_magicast@0.5.1_tailwindcss@4.1.18/node_modules/tailwindcss-patch/dist/index.d.ts:130

Optional function that filters final class names.

#### 参数

##### className

`string`

#### 返回

`boolean`

***

### cache?

> `optional` **cache**: `boolean | CacheUserOptions`

定义于: node_modules/.pnpm/tailwindcss-patch@8.6.1_magicast@0.5.1_tailwindcss@4.1.18/node_modules/tailwindcss-patch/dist/index.d.ts:132

Cache configuration or boolean to enable/disable quickly.

***

### output?

> `optional` **output**: `OutputUserOptions`

定义于: node_modules/.pnpm/tailwindcss-patch@8.6.1_magicast@0.5.1_tailwindcss@4.1.18/node_modules/tailwindcss-patch/dist/index.d.ts:134

Output configuration or boolean to inherits defaults.
