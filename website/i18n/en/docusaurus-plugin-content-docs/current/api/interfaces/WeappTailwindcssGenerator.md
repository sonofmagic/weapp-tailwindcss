---
title: WeappTailwindcssGenerator
description: weapp-tailwindcss unified generator instance.
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - WeappTailwindcssGenerator
  - WeappTailwindcssGenerator interface
  - WeappTailwindcssGenerator type definition
  - TypeScript
---

# WeappTailwindcssGenerator

weapp-tailwindcss unified generator instance.

## Properties

### generate()

> **generate()**: `(options?: WeappTailwindcssGenerateOptions) => Promise<WeappTailwindcssGenerateResult>`

Generate target CSS.

#### Parameters

##### options?

[`WeappTailwindcssGenerateOptions`](./WeappTailwindcssGenerateOptions.md)

#### return

`Promise<WeappTailwindcssGenerateResult>`

---

### loadDesignSystem()

> **loadDesignSystem()**: `() => Promise<TailwindV4DesignSystem>`

#### return

`Promise<TailwindV4DesignSystem>`

---

### validateCandidates()

> **validateCandidates()**: `(candidates: Iterable<string>) => Promise<Set<string>>`

#### Parameters

##### candidates

`Iterable<string>`

#### return

`Promise<Set<string>>`

---

### source

> **source**: `TailwindV4ResolvedSource`

Parsed Tailwind v4 source.

#### cwd?

> Optional | **cwd**: `string`

#### projectRoot

> **projectRoot**: `string`

#### cssSources?

> Optional | **cssSources**: `TailwindV4CssSource[]`

#### sources?

> Optional | **sources**: `TailwindV4SourcePattern[]`
