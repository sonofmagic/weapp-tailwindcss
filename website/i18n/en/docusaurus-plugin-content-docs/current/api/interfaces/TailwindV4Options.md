---
title: TailwindV4Options
description: Tailwind CSS v4 extraction configuration.
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - TailwindV4Options
  - TailwindV4Options interface
  - TailwindV4Options type definition
  - TypeScript
---

# TailwindV4Options

Tailwind CSS v4 extraction configuration.

## Properties

### base?

> Optional | **base**: `string`

Base directory used when parsing v4 content sources and configurations.

---

### css?

> Optional | **css**: `string`

Raw CSS passed directly to the v4 design system.

---

### cssSources?

> Optional | **cssSources**: `TailwindV4CssSource[]`

The in-memory CSS entry captured by the builder before the CSS is flushed.

---

### cssEntries?

> Optional | **cssEntries**: `string[]`

Tailwind CSS 4 entry file list, used to identify `@import "tailwindcss"`, `@source` and `@config` in the entry. The entry CSS still needs to be actually imported by the project or included in the build graph, `cssEntries` will not replace the framework to generate this CSS asset.

The type remains optional for compatibility with in-memory CSS sources; business projects should explicitly pass in the absolute path. Multiple entries, sub-packaging, independent sub-packaging, Webpack/Gulp/custom builds and multi-platform builds should all be written clearly.

---

### sources?

> Optional | **sources**: `SourceEntry[]`

Overrides the content sources scanned by the oxide scanner by default.

---

### bareArbitraryValues?

> Optional | **bareArbitraryValues**: `boolean | { units?: string[]; }`

Whether to enable UnoCSS-style bare arbitrary values, such as `p-10%`, `p-2.5px`.
