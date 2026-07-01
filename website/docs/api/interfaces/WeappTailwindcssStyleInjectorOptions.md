---
title: "WeappTailwindcssStyleInjectorOptions"
description: "WeappTailwindcssStyleInjectorOptions 的类型说明，列出公开属性、参数和使用边界。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "WeappTailwindcssStyleInjectorOptions"
  - "WeappTailwindcssStyleInjectorOptions 接口"
  - "WeappTailwindcssStyleInjectorOptions 类型定义"
  - "TypeScript"
---

# WeappTailwindcssStyleInjectorOptions

## 属性

### imports?

> 可选 | **imports**: `string[]`

***

### perFileImports()?

> 可选 | **perFileImports()**: `PerFileImportResolver`

#### 参数

##### fileName

`string`

#### 返回

`string | string[] | null | undefined`

***

### dedupe?

> 可选 | **dedupe**: `boolean`

***

### pagesJsonPath?

> 可选 | **pagesJsonPath**: `string | string[]`

uni-app 的 `pages.json` 路径。未传入时，uni-app 预设会按当前工作目录探测 `src/pages.json` 与 `pages.json`。

***

### appConfigPath?

> 可选 | **appConfigPath**: `string | string[]`

Taro 的 `app.config` 路径。未传入时，Taro 预设会按当前工作目录探测常见配置文件。

***

### appPath?

> 可选 | **appPath**: `string | string[]`

Mpx 的 app 配置路径。未传入时，Mpx 预设会按当前工作目录探测 `src/app.mpx`、`app.mpx` 等入口。

***

### sourceRoot?

> 可选 | **sourceRoot**: `string`

Mpx 源码根目录。

***

### subPackages?

> 可选 | **subPackages**: `UniAppSubPackageConfig | UniAppSubPackageConfig[] | TaroSubPackageConfig | TaroSubPackageConfig[] | MpxSubPackageConfig | MpxSubPackageConfig[]`

框架分包样式配置。

***

### uniAppSubPackages?

> 可选 | **uniAppSubPackages**: `UniAppSubPackageConfig | UniAppSubPackageConfig[]`

uni-app 通用分包配置。

***

### uniAppStyleScopes?

> 可选 | **uniAppStyleScopes**: `UniAppManualStyleConfig | UniAppManualStyleConfig[]`

uni-app 手动样式作用域配置。

***

### subpackageStyleScopes?

> 可选 | **subpackageStyleScopes**: `ResolvedSubpackageStyleScope[]`

已解析的分包样式作用域。通常只在需要完全接管预设解析时使用。

***

### generateSubpackageStyle()?

> 可选 | **generateSubpackageStyle()**: `SubpackageStyleGenerator | ((context: SubpackageStyleGenerateContext) => string | Uint8Array | null | undefined | Promise<string | Uint8Array | null | undefined>)`

生成分包样式入口内容。

#### 参数

##### context

`SubpackageStyleGenerateContext`

#### 返回

`string | Uint8Array<ArrayBufferLike> | Promise<string | Uint8Array<ArrayBufferLike> | null | undefined> | null | undefined`

***

### loadSubpackageTargetStyle()?

> 可选 | **loadSubpackageTargetStyle()**: `((fileName: string, sourceAbsolutePath: string) => string | Uint8Array | null | undefined | Promise<string | Uint8Array | null | undefined>)`

加载由源码模块推导出的目标样式内容。Webpack 场景必须同步返回。

#### 参数

##### fileName

`string`

##### sourceAbsolutePath

`string`

#### 返回

`string | Uint8Array<ArrayBufferLike> | Promise<string | Uint8Array<ArrayBufferLike> | null | undefined> | null | undefined`

***

### sourceFileName?

> 可选 | **sourceFileName**: `string | string[]`

分包样式源文件名。

***

### outputName?

> 可选 | **outputName**: `string`

分包样式输出名。

***

### files?

> 可选 | **files**: `string | string[]`

限定需要注入分包入口的目标文件。

***

### include?

> 可选 | **include**: `string | string[]`

分包目标文件 include 规则。

***

### exclude?

> 可选 | **exclude**: `string | string[]`

分包目标文件 exclude 规则。

***

### styleScopes?

> 可选 | **styleScopes**: `UniAppStyleScopeInput | UniAppStyleScopeInput[]`

uni-app 样式作用域配置。

***

### rules?

> 可选 | **rules**: `SubpackageStyleRules`

框架预设的分包样式注入规则，用样式入口到目标产物的映射描述注入关系。

#### 示例

```ts
rules: {
  'tailwind.css': ['pages/index.wxss'],
  'components.css': ['components/card.wxss'],
}
```

***

### preprocess?

> 可选 | **preprocess**: `boolean`

生成分包入口前是否走框架预处理。
