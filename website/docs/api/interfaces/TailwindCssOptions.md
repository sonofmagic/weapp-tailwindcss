# TailwindCssOptions

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:105

High-level Tailwind patch configuration shared across versions.

## 属性

### config?

> `optional` **config**: `string`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:73

Path to a Tailwind config file when auto-detection is insufficient.

***

### cwd?

> `optional` **cwd**: `string`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:75

Custom working directory used when resolving config-relative paths.

***

### postcssPlugin?

> `optional` **postcssPlugin**: `string`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:77

Optional PostCSS plugin name to use instead of the default.

***

### version?

> `optional` **version**: `2 | 3 | 4`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:107

Explicit Tailwind CSS major version used by the current project. When omitted, the installed package version is inferred.

***

### packageName?

> `optional` **packageName**: `string`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:109

Tailwind package name if the project uses a fork.

***

### resolve?

> `optional` **resolve**: `PackageResolvingOptions`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:111

Package resolution options forwarded to `local-pkg`.

***

### v2?

> `optional` **v2**: `TailwindV2Options`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:113

Overrides applied when patching Tailwind CSS v2.

***

### v3?

> `optional` **v3**: `TailwindV3Options`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:115

Overrides applied when patching Tailwind CSS v3.

***

### v4?

> `optional` **v4**: `TailwindV4Options`

定义于: node_modules/.pnpm/tailwindcss-patch@9.0.0-alpha.2_magicast@0.5.1_tailwindcss@4.2.1/node_modules/tailwindcss-patch/dist/index.d.ts:117

Options specific to Tailwind CSS v4 patching.
