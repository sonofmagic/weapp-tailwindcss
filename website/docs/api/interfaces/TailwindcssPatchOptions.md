# TailwindcssPatchOptions

定义于: [packages/weapp-tailwindcss/src/typedoc.export.ts:17](https://github.com/sonofmagic/weapp-tailwindcss/blob/47e67c82e0f06dcb29b61fdd2fad519d692fbabd/packages/weapp-tailwindcss/src/typedoc.export.ts#L17)

## 属性

### projectRoot?

> `optional` **projectRoot**: `string`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:127

Base directory used when resolving Tailwind resources.
Defaults to `process.cwd()`.

***

### tailwindcss?

> `optional` **tailwindcss**: `TailwindCssOptions`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:129

Preferred Tailwind runtime configuration.

***

### apply?

> `optional` **apply**: `ApplyOptions`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:131

Preferred patch toggles.

***

### extract?

> `optional` **extract**: `ExtractOptions`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:133

Preferred extraction output settings.

***

### filter()?

> `optional` **filter()**: `((className: string) => boolean)`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:135

Optional function that filters final class names.

#### 参数

##### className

`string`

#### 返回

`boolean`

***

### cache?

> `optional` **cache**: `boolean | CacheOptions`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:137

Cache configuration or boolean to enable/disable quickly.
