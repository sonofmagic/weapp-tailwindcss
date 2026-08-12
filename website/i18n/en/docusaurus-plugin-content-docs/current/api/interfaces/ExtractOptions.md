---
title: ExtractOptions
description: Type description for ExtractOptions, listing public properties, parameters, and usage boundaries.
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - ExtractOptions
  - ExtractOptions interface
  - ExtractOptions type definition
  - TypeScript
---

# ExtractOptions

Output configuration for class name extraction results.

## Properties

### write?

> Optional | **write**: `boolean`

Whether to write the extraction result file.

---

### file?

> Optional | **file**: `string`

Output file path, which can be passed as an absolute path or a relative path.

---

### format?

> Optional | **format**: `"json" | "lines"`

Output format. Use JSON when not passed in.

---

### pretty?

> Optional | **pretty**: `number | boolean`

JSON formatting indentation. Passing a true value enables indentation.

---

### removeUniversalSelector?

> Optional | **removeUniversalSelector**: `boolean`

Whether to remove the wildcard selector `*` from the final list.
