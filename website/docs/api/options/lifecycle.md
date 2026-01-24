---
title: 🧭 生命周期
sidebar_label: 🧭 生命周期
sidebar_position: 3
---

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/index.ts:13](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/index.ts#L13)

本页收录 4 个配置项，来源于 `UserDefinedOptions`。

## 配置一览

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| [onLoad](#onload) | <code>(() => void)</code> | — | 插件 `apply` 初始调用时触发。 |
| [onStart](#onstart) | <code>(() => void)</code> | — | 开始处理前触发。 |
| [onUpdate](#onupdate) | <code>(filename: string, oldVal: string, newVal: string) => void</code> | — | 匹配并修改文件后触发。 |
| [onEnd](#onend) | <code>(() => void)</code> | — | 结束处理时触发。 |

## 详细说明

### onLoad

> 可选 | 类型: `(() => void)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts:7](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts#L7)

插件 `apply` 初始调用时触发。

#### 返回

`void`

### onStart

> 可选 | 类型: `(() => void)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts:13](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts#L13)

开始处理前触发。

#### 返回

`void`

### onUpdate

> 可选 | 类型: `(filename: string, oldVal: string, newVal: string) => void`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts:19](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts#L19)

匹配并修改文件后触发。

#### 参数

##### filename

`string`

##### oldVal

`string`

##### newVal

`string`

#### 返回

`void`

### onEnd

> 可选 | 类型: `(() => void)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts:25](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts#L25)

结束处理时触发。

#### 返回

`void`
