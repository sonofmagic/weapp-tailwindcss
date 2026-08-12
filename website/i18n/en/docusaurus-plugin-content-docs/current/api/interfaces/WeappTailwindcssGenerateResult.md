---
title: WeappTailwindcssGenerateResult
description: The output of the weapp-tailwindcss generator.
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - WeappTailwindcssGenerateResult
  - WeappTailwindcssGenerateResult interface
  - WeappTailwindcssGenerateResult type definition
  - TypeScript
---

# WeappTailwindcssGenerateResult

The output of the weapp-tailwindcss generator.

## Properties

### classSet

> **classSet**: `Set<string>`

---

### rawCandidates

> **rawCandidates**: `Set<string>`

---

### dependencies

> **dependencies**: `string[]`

---

### sources

> **sources**: `TailwindV4SourcePattern[]`

---

### root

> **root**: `TailwindV4CompiledSourceRoot`

---

### css

> **css**: `string`

Transformed CSS.

---

### rawCss

> **rawCss**: `string`

Tailwind raw output CSS.

---

### incrementalCss?

> Optional | **incrementalCss**: `string`

Transformed CSS added in this increment.

---

### incrementalRawCss?

> Optional | **incrementalRawCss**: `string`

Tailwind original CSS added in this increment.

---

### target

> **target**: `"weapp" | "web"`

Actual build target.
