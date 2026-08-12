---
title: TailwindCssOptions
description: Runtime configuration by Tailwind version.
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - TailwindCssOptions
  - TailwindCssOptions interface
  - TailwindCssOptions type definition
  - TypeScript
---

# TailwindCssOptions

Runtime configuration by Tailwind version.

## Properties

### config?

> Optional | **config**: `string`

Tailwind configuration file path. It can be passed in explicitly when automatic recognition is not accurate enough.

---

### cwd?

> Optional | **cwd**: `string`

The working directory used when resolving relative paths in the Tailwind configuration.

---

### postcssPlugin?

> Optional | **postcssPlugin**: `string`

Custom PostCSS plugin name. If not passed in, the default name is used.

---

### version?

> Optional | **version**: `4`

The major version of Tailwind CSS used by the current project. If not passed it will be inferred from the installed package.

---

### packageName?

> Optional | **packageName**: `string`

Tailwind package name. This can be changed when the project uses branch packages.

---

### resolve?

> Optional | **resolve**: `PackageResolvingOptions`

Packet parsing configuration passed to `local-pkg`.

---

### v4?

> Optional | **v4**: [`TailwindV4Options`](./TailwindV4Options.md)

Tailwind CSS v4 extraction and CSS entry options.

#### base?

> Optional | **base**: `string`

Base directory used when parsing v4 content sources and configurations.

#### css?

> Optional | **css**: `string`

Raw CSS passed directly to the v4 design system.

#### cssSources?

> Optional | **cssSources**: `TailwindV4CssSource[]`

The in-memory CSS entry captured by the builder before the CSS is flushed.

#### cssEntries?

> Optional | **cssEntries**: `string[]`

Tailwind CSS 4 entry file list, used to identify `@import "tailwindcss"`, `@source` and `@config` in the entry. The entry CSS still needs to be actually imported by the project or included in the build graph, `cssEntries` will not replace the framework to generate this CSS asset.

The type remains optional for compatibility with in-memory CSS sources; business projects should explicitly pass in the absolute path. Multiple entries, sub-packaging, independent sub-packaging, Webpack/Gulp/custom builds and multi-platform builds should all be written clearly.

#### sources?

> Optional | **sources**: `SourceEntry[]`

Overrides the content sources scanned by the oxide scanner by default.

#### bareArbitraryValues?

> Optional | **bareArbitraryValues**: `boolean | { units?: string[]; }`

Whether to enable UnoCSS-style bare arbitrary values, such as `p-10%`, `p-2.5px`.
