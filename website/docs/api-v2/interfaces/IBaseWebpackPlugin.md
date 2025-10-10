---
id: "IBaseWebpackPlugin"
title: "Interface: IBaseWebpackPlugin"
sidebar_label: "IBaseWebpackPlugin"
sidebar_position: 0
custom_edit_url: null
---

## Implemented by

- [`UnifiedWebpackPluginV5`](../classes/UnifiedWebpackPluginV5.md)

## Properties

### appType

• `Optional` **appType**: [`AppType`](../#apptype)

#### Defined in

[types.ts:488](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L488)

---

### apply

• **apply**: (`compiler`: `any`) => `void`

#### Type declaration

▸ (`compiler`): `void`

##### Parameters

| Name       | Type  |
| :--------- | :---- |
| `compiler` | `any` |

##### Returns

`void`

#### Defined in

[types.ts:490](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L490)

---

### options

• **options**: `Required`<`Omit`<[`UserDefinedOptions`](UserDefinedOptions.md), `"customReplaceDictionary"` \| `"supportCustomLengthUnitsPatch"` \| [`GlobOrFunctionMatchers`](../#globorfunctionmatchers)\> & \{ `cssMatcher`: (`name`: `string`) => `boolean` ; `htmlMatcher`: (`name`: `string`) => `boolean` ; `jsMatcher`: (`name`: `string`) => `boolean` ; `mainCssChunkMatcher`: (`name`: `string`, `appType?`: [`AppType`](../#apptype)) => `boolean` ; `wxsMatcher`: (`name`: `string`) => `boolean` } & \{ `cache`: `ICreateCacheReturnType` ; `customReplaceDictionary`: `Record`<`string`, `string`\> ; `escapeMap`: `Record`<`string`, `string`\> ; `jsHandler`: [`JsHandler`](../#jshandler) ; `patch`: () => `void` ; `setMangleRuntimeSet`: (`runtimeSet`: `Set`<`string`\>) => `void` ; `styleHandler`: (`rawSource`: `string`, `options`: [`IStyleHandlerOptions`](../#istylehandleroptions)) => `Promise`<`string`\> ; `supportCustomLengthUnitsPatch`: `false` \| [`ILengthUnitsPatchOptions`](ILengthUnitsPatchOptions.md) ; `templateHandler`: (`rawSource`: `string`, `options?`: [`ITemplateHandlerOptions`](ITemplateHandlerOptions.md)) => `string` }\>

#### Defined in

[types.ts:487](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L487)
