---
id: "IMangleScopeContext"
title: "Interface: IMangleScopeContext"
sidebar_label: "IMangleScopeContext"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### classGenerator

• **classGenerator**: `ClassGenerator`

#### Defined in

[types.ts:433](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L433)

___

### cssHandler

• **cssHandler**: (`rawSource`: `string`) => `string`

#### Type declaration

▸ (`rawSource`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `rawSource` | `string` |

##### Returns

`string`

#### Defined in

[types.ts:435](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L435)

___

### filter

• **filter**: (`className`: `string`) => `boolean`

#### Type declaration

▸ (`className`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `className` | `string` |

##### Returns

`boolean`

#### Defined in

[types.ts:434](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L434)

___

### jsHandler

• **jsHandler**: (`rawSource`: `string`) => `string`

#### Type declaration

▸ (`rawSource`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `rawSource` | `string` |

##### Returns

`string`

#### Defined in

[types.ts:436](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L436)

___

### rawOptions

• **rawOptions**: `undefined` \| `boolean` \| [`IMangleOptions`](IMangleOptions.md)

#### Defined in

[types.ts:431](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L431)

___

### runtimeSet

• **runtimeSet**: `Set`<`string`\>

#### Defined in

[types.ts:432](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L432)

___

### wxmlHandler

• **wxmlHandler**: (`rawSource`: `string`) => `string`

#### Type declaration

▸ (`rawSource`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `rawSource` | `string` |

##### Returns

`string`

#### Defined in

[types.ts:437](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L437)
