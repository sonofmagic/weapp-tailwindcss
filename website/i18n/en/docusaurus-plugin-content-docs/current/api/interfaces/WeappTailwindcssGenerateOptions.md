---
title: WeappTailwindcssGenerateOptions
description: Invocation configuration of weapp-tailwindcss generator.
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - WeappTailwindcssGenerateOptions
  - WeappTailwindcssGenerateOptions interface
  - WeappTailwindcssGenerateOptions type definition
  - TypeScript
---

# WeappTailwindcssGenerateOptions

Invocation configuration of weapp-tailwindcss generator.

## Properties

### target?

> Optional | **target**: [`WeappTailwindcssGeneratorTarget`](./WeappTailwindcssGeneratorTarget.md)

Generate target. The output applet of `weapp` is compatible with CSS, `web` retains the web form, and `tailwind` returns the original output of Tailwind.

---

### styleOptions?

> Optional | **styleOptions**: `Partial<IStyleHandlerOptions>`

Additional configuration passed to the applet CSS compatible converter.

---

### candidates?

> Optional | **candidates**: `Iterable<string>`

---

### sources?

> Optional | **sources**: `TailwindV4CandidateSource[]`

---

### incrementalCache?

> Optional | **incrementalCache**: `boolean`

Whether to enable incremental build caching.

---

### bareArbitraryValues?

> Optional | **bareArbitraryValues**: `boolean | { units?: string[]; }`

Whether to enable UnoCSS-style bare arbitrary values, such as `p-10%`, `p-2.5px`.

---

### scanSources?

> Optional | **scanSources**: `boolean | TailwindV4SourcePattern[]`

Whether to scan source code entries in the file system.
