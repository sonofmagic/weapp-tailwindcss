---
id: WeappTailwindcss
title: 'Class: WeappTailwindcss'
sidebar_label: WeappTailwindcss
sidebar_position: 0
custom_edit_url: null
description: WeappTailwindcss
keywords:
  - API
  - 接口文档
  - 配置项
  - Class
  - WeappTailwindcss
  - api v2
  - classes
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - rax
  - mpx
---

**`Name`**

WeappTailwindcss

**`Description`**

webpack5 核心转义插件

**`Link`**

https://tw.icebreaker.top/docs/intro

## Implements

- [`IBaseWebpackPlugin`](../interfaces/IBaseWebpackPlugin.md)

## Constructors

### constructor

• **new WeappTailwindcss**(`options?`): [`WeappTailwindcss`](WeappTailwindcss.md)

#### Parameters

| Name      | Type                                                        |
| :-------- | :---------------------------------------------------------- |
| `options` | [`UserDefinedOptions`](../interfaces/UserDefinedOptions.md) |

#### Returns

[`WeappTailwindcss`](WeappTailwindcss.md)

#### Defined in

[webpack/BaseUnifiedPlugin/v5.ts:24](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/webpack/BaseUnifiedPlugin/v5.ts#L24)

## Properties

### appType

• `Optional` **appType**: [`AppType`](../#apptype)

#### Implementation of

[IBaseWebpackPlugin](../interfaces/IBaseWebpackPlugin.md).[appType](../interfaces/IBaseWebpackPlugin.md#apptype)

#### Defined in

[webpack/BaseUnifiedPlugin/v5.ts:22](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/webpack/BaseUnifiedPlugin/v5.ts#L22)

---

### options

• **options**: `Required`<`Omit`<[`UserDefinedOptions`](../interfaces/UserDefinedOptions.md), `"customReplaceDictionary"` \| `"supportCustomLengthUnitsPatch"` \| [`GlobOrFunctionMatchers`](../#globorfunctionmatchers)\> & \{ `cssMatcher`: (`name`: `string`) => `boolean` ; `htmlMatcher`: (`name`: `string`) => `boolean` ; `jsMatcher`: (`name`: `string`) => `boolean` ; `mainCssChunkMatcher`: (`name`: `string`, `appType?`: [`AppType`](../#apptype)) => `boolean` ; `wxsMatcher`: (`name`: `string`) => `boolean` } & \{ `cache`: `ICreateCacheReturnType` ; `customReplaceDictionary`: `Record`<`string`, `string`\> ; `escapeMap`: `Record`<`string`, `string`\> ; `jsHandler`: [`JsHandler`](../#jshandler) ; `patch`: () => `void` ; `setMangleRuntimeSet`: (`runtimeSet`: `Set`<`string`\>) => `void` ; `styleHandler`: (`rawSource`: `string`, `options`: [`IStyleHandlerOptions`](../#istylehandleroptions)) => `Promise`<`string`\> ; `supportCustomLengthUnitsPatch`: `false` \| [`ILengthUnitsPatchOptions`](../interfaces/ILengthUnitsPatchOptions.md) ; `templateHandler`: (`rawSource`: `string`, `options?`: [`ITemplateHandlerOptions`](../interfaces/ITemplateHandlerOptions.md)) => `string` }\>

#### Implementation of

[IBaseWebpackPlugin](../interfaces/IBaseWebpackPlugin.md).[options](../interfaces/IBaseWebpackPlugin.md#options)

#### Defined in

[webpack/BaseUnifiedPlugin/v5.ts:21](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/webpack/BaseUnifiedPlugin/v5.ts#L21)

## Methods

### apply

▸ **apply**(`compiler`): `void`

#### Parameters

| Name       | Type       |
| :--------- | :--------- |
| `compiler` | `Compiler` |

#### Returns

`void`

#### Implementation of

[IBaseWebpackPlugin](../interfaces/IBaseWebpackPlugin.md).[apply](../interfaces/IBaseWebpackPlugin.md#apply)

#### Defined in

[webpack/BaseUnifiedPlugin/v5.ts:32](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/webpack/BaseUnifiedPlugin/v5.ts#L32)
