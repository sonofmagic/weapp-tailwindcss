# TailwindV4Options

Additional configuration specific to Tailwind CSS v4 extraction.

## 属性

### base?

> `optional` **base**: `string`

Base directory used when resolving v4 content sources and configs.

***

### css?

> `optional` **css**: `string`

Raw CSS passed directly to the v4 design system.

***

### cssEntries?

> `optional` **cssEntries**: `string[]`

Set of CSS entry files that should be scanned for `@config` directives.

***

### sources?

> `optional` **sources**: `SourceEntry[]`

Overrides the content sources scanned by the oxide scanner.
