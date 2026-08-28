---
title: CompilerTemplateTransformOptions
description: Per-call template transform overrides supported by the framework compiler.
keywords:
  - weapp-tailwindcss
  - API
  - template transform
  - WXML
  - TypeScript
---

# CompilerTemplateTransformOptions

The compiler supplies its snapshot class set internally. Callers cannot override `runtimeSet` or `classSetMode`.

## Properties

### keepEOL?

> Optional | **keepEOL**: `boolean`

---

### customAttributesEntities?

> Optional | **customAttributesEntities**: `ICustomAttributesEntities`

---

### escapeMap?

> Optional | **escapeMap**: `Record<string, string>`

---

### inlineWxs?

> Optional | **inlineWxs**: `boolean`

---

### jsHandler()?

> Optional | **jsHandler()**: `JsHandler`

#### Parameters

##### rawSource

`string`

##### set?

`Set<string>`

##### options?

`CreateJsHandlerOptions`

#### Returns

`JsHandlerResult`

---

### disabledDefaultTemplateHandler?

> Optional | **disabledDefaultTemplateHandler**: `boolean`

---

### quote?

> Optional | **quote**: `string | null`

---

### ignoreHead?

> Optional | **ignoreHead**: `boolean`

---

### wrapExpression?

> Optional | **wrapExpression**: `boolean`
