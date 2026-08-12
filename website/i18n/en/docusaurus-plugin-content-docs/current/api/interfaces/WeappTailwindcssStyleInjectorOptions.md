---
title: WeappTailwindcssStyleInjectorOptions
description: Type description for WeappTailwindcssStyleInjectorOptions, listing public properties, parameters, and usage boundaries.
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - WeappTailwindcssStyleInjectorOptions
  - WeappTailwindcssStyleInjectorOptions interface
  - WeappTailwindcssStyleInjectorOptions type definition
  - TypeScript
---

# WeappTailwindcssStyleInjectorOptions

## Properties

### imports?

> Optional | **imports**: `string[]`

---

### perFileImports()?

> Optional | **perFileImports()**: `PerFileImportResolver`

#### Parameters

##### fileName

`string`

#### return

`string | string[] | null | undefined`

---

### dedupe?

> Optional | **dedupe**: `boolean`

---

### pagesJsonPath?

> Optional | **pagesJsonPath**: `string | string[]`

`pages.json` path to uni-app. When not passed in, uni-app will detect `src/pages.json` and `pages.json` according to the current working directory by default.

---

### appConfigPath?

> Optional | **appConfigPath**: `string | string[]`

Taro's `app.config` path. When not passed in, Taro will detect common configuration files based on the current working directory by default.

---

### appPath?

> Optional | **appPath**: `string | string[]`

Mpx app configuration path. When not passed in, Mpx will detect `src/app.mpx`, `app.mpx` and other entries according to the current working directory by default.

---

### sourceRoot?

> Optional | **sourceRoot**: `string`

Mpx source code root directory.

---

### subPackages?

> Optional | **subPackages**: `UniAppSubPackageConfig | UniAppSubPackageConfig[] | TaroSubPackageConfig | TaroSubPackageConfig[] | MpxSubPackageConfig | MpxSubPackageConfig[]`

Framework subpackage style configuration.

---

### uniAppSubPackages?

> Optional | **uniAppSubPackages**: `UniAppSubPackageConfig | UniAppSubPackageConfig[]`

uni-app universal subcontracting configuration.

---

### uniAppStyleScopes?

> Optional | **uniAppStyleScopes**: `UniAppManualStyleConfig | UniAppManualStyleConfig[]`

uni-app manual style scope configuration.

---

### subpackageStyleScopes?

> Optional | **subpackageStyleScopes**: `ResolvedSubpackageStyleScope[]`

Resolved subpackage style scope. Usually only used when you need to completely take over preset parsing.

---

### generateSubpackageStyle()?

> Optional | **generateSubpackageStyle()**: `SubpackageStyleGenerator | ((context: SubpackageStyleGenerateContext) => string | Uint8Array | null | undefined | Promise<string | Uint8Array | null | undefined>)`

Generate subpackage style entry content.

#### Parameters

##### context

`SubpackageStyleGenerateContext`

#### return

`string | Uint8Array<ArrayBufferLike> | Promise<string | Uint8Array<ArrayBufferLike> | null | undefined> | null | undefined`

---

### loadSubpackageTargetStyle()?

> Optional | **loadSubpackageTargetStyle()**: `((fileName: string, sourceAbsolutePath: string) => string | Uint8Array | null | undefined | Promise<string | Uint8Array | null | undefined>)`

Load the target style content derived from the source module. Webpack scenes must return synchronously.

#### Parameters

##### fileName

`string`

##### sourceAbsolutePath

`string`

#### return

`string | Uint8Array<ArrayBufferLike> | Promise<string | Uint8Array<ArrayBufferLike> | null | undefined> | null | undefined`

---

### sourceFileName?

> Optional | **sourceFileName**: `string | string[]`

Subpackage style source file name.

---

### outputName?

> Optional | **outputName**: `string`

Packaged style output name.

---

### files?

> Optional | **files**: `string | string[]`

Define the target files that need to be injected into the subpackage entry.

---

### include?

> Optional | **include**: `string | string[]`

Subpackage target file include rules.

---

### exclude?

> Optional | **exclude**: `string | string[]`

Subpackage target file exclude rules.

---

### styleScopes?

> Optional | **styleScopes**: `UniAppStyleScopeInput | UniAppStyleScopeInput[]`

uni-app style scope configuration.

---

### rules?

> Optional | **rules**: `SubpackageStyleRules`

The framework's preset subpackage style injection rules describe the injection relationship by mapping the style entry to the target product.

#### Example

```ts
rules: {
  'tailwind.css': ['pages/index.wxss'],
  'components.css': ['components/card.wxss'],
}
```

---

### preprocess?

> Optional | **preprocess**: `boolean`

Whether to perform framework preprocessing before generating subcontracting entries.
