# TailwindCssPatchOptions

Root configuration consumed by the Tailwind CSS patch runner.

## 属性

### projectRoot?

> `optional` **projectRoot**: `string`

Base directory used when resolving Tailwind resources.
Defaults to `process.cwd()`.

***

### tailwindcss?

> `optional` **tailwindcss**: `TailwindCssOptions`

Preferred Tailwind runtime configuration.

***

### apply?

> `optional` **apply**: `ApplyOptions`

Preferred patch toggles.

***

### extract?

> `optional` **extract**: `ExtractOptions`

Preferred extraction output settings.

***

### filter()?

> `optional` **filter()**: `((className: string) => boolean)`

Optional function that filters final class names.

#### 参数

##### className

`string`

#### 返回

`boolean`

***

### cache?

> `optional` **cache**: `boolean | CacheOptions`

Cache configuration or boolean to enable/disable quickly.
