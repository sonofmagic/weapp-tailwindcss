# TailwindCssOptions

High-level Tailwind patch configuration shared across versions.

## 属性

### config?

> `optional` **config**: `string`

Path to a Tailwind config file when auto-detection is insufficient.

***

### cwd?

> `optional` **cwd**: `string`

Custom working directory used when resolving config-relative paths.

***

### postcssPlugin?

> `optional` **postcssPlugin**: `string`

Optional PostCSS plugin name to use instead of the default.

***

### version?

> `optional` **version**: `2 | 3 | 4`

Explicit Tailwind CSS major version used by the current project. When omitted, the installed package version is inferred.

***

### packageName?

> `optional` **packageName**: `string`

Tailwind package name if the project uses a fork.

***

### resolve?

> `optional` **resolve**: `PackageResolvingOptions`

Package resolution options forwarded to `local-pkg`.

***

### v2?

> `optional` **v2**: `TailwindV2Options`

Overrides applied when patching Tailwind CSS v2.

***

### v3?

> `optional` **v3**: `TailwindV3Options`

Overrides applied when patching Tailwind CSS v3.

***

### v4?

> `optional` **v4**: `TailwindV4Options`

Options specific to Tailwind CSS v4 patching.
