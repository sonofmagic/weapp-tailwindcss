---
title: ApplyOptions
description: Tailwind runtime behavior configuration.
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - ApplyOptions
  - ApplyOptions interface
  - ApplyOptions type definition
  - TypeScript
---

# ApplyOptions

Tailwind runtime behavior configuration.

## Properties

### overwrite?

> Optional | **overwrite**: `boolean`

Whether to allow overwriting existing runtime cache or context state.

---

### exposeContext?

> Optional | **exposeContext**: `boolean | ExposeContextOptions`

Whether to expose the runtime Tailwind context, or configure the specific exposure method.

---

### extendLengthUnits?

> Optional | **extendLengthUnits**: `false | ExtendLengthUnitsOptions`

Extended length unit support, passing `false` can be turned off completely.
