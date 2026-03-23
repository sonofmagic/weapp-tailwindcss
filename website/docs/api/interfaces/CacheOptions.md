# CacheOptions

Configures how the Tailwind class cache is stored and where it lives on disk.

## 属性

### enabled?

> `optional` **enabled**: `boolean`

Whether caching is enabled.

***

### cwd?

> `optional` **cwd**: `string`

Working directory used when resolving cache paths.

***

### dir?

> `optional` **dir**: `string`

Directory where cache files are written.

***

### file?

> `optional` **file**: `string`

Cache filename. Defaults to `class-cache.json` inside the derived cache folder
when omitted.

***

### strategy?

> `optional` **strategy**: `CacheStrategy`

Strategy used when merging new class lists with an existing cache.

***

### driver?

> `optional` **driver**: `CacheDriver`

Backend used to persist the cache (`file`, `memory`, or `noop`). Defaults to `file`.
