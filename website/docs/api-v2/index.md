---
id: "index"
title: "weapp-tailwindcss-webpack-plugin"
sidebar_label: "Exports"
sidebar_position: 0.5
custom_edit_url: null
---

## Classes

- [UnifiedWebpackPluginV5](classes/UnifiedWebpackPluginV5.md)

## Interfaces

- [IArbitraryValues](interfaces/IArbitraryValues.md)
- [IBaseWebpackPlugin](interfaces/IBaseWebpackPlugin.md)
- [ICommonReplaceOptions](interfaces/ICommonReplaceOptions.md)
- [ILengthUnitsPatchDangerousOptions](interfaces/ILengthUnitsPatchDangerousOptions.md)
- [ILengthUnitsPatchOptions](interfaces/ILengthUnitsPatchOptions.md)
- [IMangleOptions](interfaces/IMangleOptions.md)
- [IMangleScopeContext](interfaces/IMangleScopeContext.md)
- [IPropValue](interfaces/IPropValue.md)
- [ITemplateHandlerOptions](interfaces/ITemplateHandlerOptions.md)
- [InternalCssSelectorReplacerOptions](interfaces/InternalCssSelectorReplacerOptions.md)
- [InternalPatchResult](interfaces/InternalPatchResult.md)
- [RawSource](interfaces/RawSource.md)
- [UserDefinedOptions](interfaces/UserDefinedOptions.md)

## Type Aliases

### AppType

Ƭ **AppType**: `"uni-app"` \| `"uni-app-vite"` \| `"taro"` \| `"remax"` \| `"rax"` \| `"native"` \| `"kbone"` \| `"mpx"`

#### Defined in

[types.ts:10](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L10)

---

### CreateJsHandlerOptions

Ƭ **CreateJsHandlerOptions**: `Omit`<[`IJsHandlerOptions`](#ijshandleroptions), `"classNameSet"`\>

#### Defined in

[types.ts:502](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L502)

---

### CssPreflightOptions

Ƭ **CssPreflightOptions**: \{ `[key: CssPresetProps]`: `string` \| `number` \| `boolean`; } \| `false`

#### Defined in

[types.ts:19](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L19)

---

### CssPresetProps

Ƭ **CssPresetProps**: `string`

#### Defined in

[types.ts:17](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L17)

---

### CustomRuleCallback

Ƭ **CustomRuleCallback**: (`node`: `Rule`, `options`: `Readonly`<[`RequiredStyleHandlerOptions`](#requiredstylehandleroptions)\>) => `void`

#### Type declaration

▸ (`node`, `options`): `void`

##### Parameters

| Name      | Type                                                                       |
| :-------- | :------------------------------------------------------------------------- |
| `node`    | `Rule`                                                                     |
| `options` | `Readonly`<[`RequiredStyleHandlerOptions`](#requiredstylehandleroptions)\> |

##### Returns

`void`

#### Defined in

[types.ts:34](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L34)

---

### GlobOrFunctionMatchers

Ƭ **GlobOrFunctionMatchers**: `"htmlMatcher"` \| `"cssMatcher"` \| `"jsMatcher"` \| `"mainCssChunkMatcher"` \| `"wxsMatcher"`

#### Defined in

[types.ts:460](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L460)

---

### ICustomAttributes

Ƭ **ICustomAttributes**: `Record`<`string`, [`ItemOrItemArray`](#itemoritemarray)<`string` \| `RegExp`\>\> \| `Map`<`string` \| `RegExp`, [`ItemOrItemArray`](#itemoritemarray)<`string` \| `RegExp`\>\>

#### Defined in

[types.ts:50](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L50)

---

### ICustomAttributesEntities

Ƭ **ICustomAttributesEntities**: [`string` \| `RegExp`, [`ItemOrItemArray`](#itemoritemarray)<`string` \| `RegExp`\>][]

#### Defined in

[types.ts:52](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L52)

---

### IJsHandlerOptions

Ƭ **IJsHandlerOptions**: `Object`

#### Type declaration

| Name               | Type                                                                             |
| :----------------- | :------------------------------------------------------------------------------- |
| `arbitraryValues?` | [`IArbitraryValues`](interfaces/IArbitraryValues.md)                             |
| `classNameSet`     | `Set`<`string`\>                                                                 |
| `escapeMap?`       | `Record`<`string`, `string`\>                                                    |
| `generateMap?`     | `boolean`                                                                        |
| `jsPreserveClass?` | (`keyword`: `string`) => `boolean` \| `undefined`                                |
| `mangleContext?`   | [`IMangleScopeContext`](interfaces/IMangleScopeContext.md)                       |
| `minifiedJs?`      | `boolean`                                                                        |
| `needEscaped?`     | `boolean`                                                                        |
| `strategy?`        | [`UserDefinedOptions`](interfaces/UserDefinedOptions.md)[``"jsEscapeStrategy"``] |

#### Defined in

[types.ts:54](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L54)

---

### IStyleHandlerOptions

Ƭ **IStyleHandlerOptions**: \{ `customRuleCallback?`: [`CustomRuleCallback`](#customrulecallback) ; `mangleContext?`: [`IMangleScopeContext`](interfaces/IMangleScopeContext.md) } & [`RequiredStyleHandlerOptions`](#requiredstylehandleroptions)

#### Defined in

[types.ts:41](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L41)

---

### InternalPostcssOptions

Ƭ **InternalPostcssOptions**: `Pick`<[`UserDefinedOptions`](interfaces/UserDefinedOptions.md), `"cssMatcher"` \| `"mainCssChunkMatcher"` \| `"cssPreflight"` \| `"replaceUniversalSelectorWith"` \| `"cssPreflightRange"` \| `"customRuleCallback"` \| `"disabled"`\>

#### Defined in

[types.ts:479](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L479)

---

### InternalUserDefinedOptions

Ƭ **InternalUserDefinedOptions**: `Required`<`Omit`<[`UserDefinedOptions`](interfaces/UserDefinedOptions.md), [`GlobOrFunctionMatchers`](#globorfunctionmatchers) \| `"supportCustomLengthUnitsPatch"` \| `"customReplaceDictionary"`\> & \{ [K in GlobOrFunctionMatchers]: K extends "mainCssChunkMatcher" ? Function : Function } & \{ `cache`: `ICreateCacheReturnType` ; `customReplaceDictionary`: `Record`<`string`, `string`\> ; `escapeMap`: `Record`<`string`, `string`\> ; `jsHandler`: [`JsHandler`](#jshandler) ; `patch`: () => `void` ; `setMangleRuntimeSet`: (`runtimeSet`: `Set`<`string`\>) => `void` ; `styleHandler`: (`rawSource`: `string`, `options`: [`IStyleHandlerOptions`](#istylehandleroptions)) => `Promise`<`string`\> ; `supportCustomLengthUnitsPatch`: [`ILengthUnitsPatchOptions`](interfaces/ILengthUnitsPatchOptions.md) \| `false` ; `templateHandler`: (`rawSource`: `string`, `options?`: [`ITemplateHandlerOptions`](interfaces/ITemplateHandlerOptions.md)) => `string` }\>

#### Defined in

[types.ts:462](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L462)

---

### ItemOrItemArray

Ƭ **ItemOrItemArray**<`T`\>: `T` \| `T`[]

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Defined in

[types.ts:8](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L8)

---

### JsHandler

Ƭ **JsHandler**: (`rawSource`: `string`, `set`: `Set`<`string`\>, `options?`: [`CreateJsHandlerOptions`](#createjshandleroptions)) => [`JsHandlerResult`](#jshandlerresult)

#### Type declaration

▸ (`rawSource`, `set`, `options?`): [`JsHandlerResult`](#jshandlerresult)

##### Parameters

| Name        | Type                                                |
| :---------- | :-------------------------------------------------- |
| `rawSource` | `string`                                            |
| `set`       | `Set`<`string`\>                                    |
| `options?`  | [`CreateJsHandlerOptions`](#createjshandleroptions) |

##### Returns

[`JsHandlerResult`](#jshandlerresult)

#### Defined in

[types.ts:428](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L428)

---

### JsHandlerReplaceResult

Ƭ **JsHandlerReplaceResult**: `Object`

#### Type declaration

| Name   | Type        |
| :----- | :---------- |
| `code` | `string`    |
| `map?` | `SourceMap` |

#### Defined in

[types.ts:46](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L46)

---

### JsHandlerResult

Ƭ **JsHandlerResult**: [`JsHandlerReplaceResult`](#jshandlerreplaceresult) \| `GeneratorResult`

#### Defined in

[types.ts:48](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L48)

---

### RequiredStyleHandlerOptions

Ƭ **RequiredStyleHandlerOptions**: \{ `cssInjectPreflight?`: `InjectPreflight` ; `escapeMap?`: `Record`<`string`, `string`\> ; `isMainChunk`: `boolean` } & `Pick`<[`UserDefinedOptions`](interfaces/UserDefinedOptions.md), `"cssPreflightRange"` \| `"cssChildCombinatorReplaceValue"` \| `"replaceUniversalSelectorWith"` \| `"injectAdditionalCssVarScope"` \| `"cssSelectorReplacement"`\>

#### Defined in

[types.ts:25](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L25)

## Functions

### UnifiedViteWeappTailwindcssPlugin

▸ **UnifiedViteWeappTailwindcssPlugin**(`options?`): `Plugin` \| `undefined`

#### Parameters

| Name      | Type                                                     |
| :-------- | :------------------------------------------------------- |
| `options` | [`UserDefinedOptions`](interfaces/UserDefinedOptions.md) |

#### Returns

`Plugin` \| `undefined`

**`Name`**

UnifiedViteWeappTailwindcssPlugin

**`Description`**

uni-app vite vue3 版本插件

**`Link`**

https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite

#### Defined in

[vite/index.ts:17](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/vite/index.ts#L17)

---

### createPlugins

▸ **createPlugins**(`options?`): `Object`

#### Parameters

| Name      | Type                                                     |
| :-------- | :------------------------------------------------------- |
| `options` | [`UserDefinedOptions`](interfaces/UserDefinedOptions.md) |

#### Returns

`Object`

| Name            | Type              |
| :-------------- | :---------------- |
| `transformJs`   | () => `Transform` |
| `transformWxml` | () => `Transform` |
| `transformWxss` | () => `Transform` |

**`Name`**

weapp-tw-gulp

**`Description`**

gulp版本weapp-tw插件

**`Link`**

https://tw.icebreaker.top/docs/quick-start/frameworks/native

#### Defined in

[gulp/index.ts:17](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/gulp/index.ts#L17)
