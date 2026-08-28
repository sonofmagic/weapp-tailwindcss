---
title: CompilerTarget
description: CSS output target accepted by the framework compiler.
keywords:
  - weapp-tailwindcss
  - API
  - compiler target
  - Tailwind CSS
  - TypeScript
---

# CompilerTarget

```ts
type CompilerTarget = 'tailwind' | 'weapp' | 'web'
```

- `weapp` produces mini-program-compatible CSS.
- `web` preserves the Web-oriented generated CSS.
- `tailwind` returns raw Tailwind CSS through the `css` and incremental CSS fields.
