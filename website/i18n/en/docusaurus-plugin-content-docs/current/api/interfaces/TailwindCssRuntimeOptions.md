---
title: TailwindCssRuntimeOptions
description: Tailwind CSS runtime root configuration.
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - TailwindCssRuntimeOptions
  - TailwindCssRuntimeOptions interface
  - TailwindCssRuntimeOptions type definition
  - TypeScript
---

# TailwindCssRuntimeOptions

Tailwind CSS runtime root configuration.

## Properties

### projectRoot?

> Optional | **projectRoot**: `string`

The project root directory used when parsing Tailwind resources. The default is `process.cwd()`.

---

### tailwindcss?

> Optional | **tailwindcss**: [`TailwindCssOptions`](./TailwindCssOptions.md)

Tailwind runtime configuration.

#### config?

> Optional | **config**: `string`

Tailwind configuration file path. It can be passed in explicitly when automatic recognition is not accurate enough.

#### cwd?

> Optional | **cwd**: `string`

The working directory used when resolving relative paths in the Tailwind configuration.

#### postcssPlugin?

> Optional | **postcssPlugin**: `string`

Custom PostCSS plugin name. If not passed in, the default name is used.

#### version?

> Optional | **version**: `4`

The major version of Tailwind CSS used by the current project. If not passed it will be inferred from the installed package.

#### packageName?

> Optional | **packageName**: `string`

Tailwind package name. This can be changed when the project uses branch packages.

#### resolve?

> Optional | **resolve**: `PackageResolvingOptions`

Packet parsing configuration passed to `local-pkg`.

#### v4?

> Optional | **v4**: [`TailwindV4Options`](./TailwindV4Options.md)

Tailwind CSS v4 extraction and CSS entry options.

---

### apply?

> Optional | **apply**: [`ApplyOptions`](./ApplyOptions.md)

Runtime behavior switch.

#### overwrite?

> Optional | **overwrite**: `boolean`

Whether to allow overwriting existing runtime cache or context state.

#### exposeContext?

> Optional | **exposeContext**: `boolean | ExposeContextOptions`

Whether to expose the runtime Tailwind context, or configure the specific exposure method.

#### extendLengthUnits?

> Optional | **extendLengthUnits**: `false | ExtendLengthUnitsOptions`

Extended length unit support, passing `false` can be turned off completely.

---

### extract?

> Optional | **extract**: [`ExtractOptions`](./ExtractOptions.md)

Class name extraction result output configuration.

#### write?

> Optional | **write**: `boolean`

Whether to write the extraction result file.

#### file?

> Optional | **file**: `string`

Output file path, which can be passed as an absolute path or a relative path.

#### format?

> Optional | **format**: `"json" | "lines"`

Output format. Use JSON when not passed in.

#### pretty?

> Optional | **pretty**: `number | boolean`

JSON formatting indentation. Passing a true value enables indentation.

#### removeUniversalSelector?

> Optional | **removeUniversalSelector**: `boolean`

Whether to remove the wildcard selector `*` from the final list.

---

### filter()?

> Optional | **filter()**: `(className: string) => boolean`

Function to filter the final class name.

#### Parameters

##### className

`string`

#### return

`boolean`

---

### cache?

> Optional | **cache**: `boolean | CacheOptions`

Cache configuration. Pass in a boolean value to quickly enable or disable it.
