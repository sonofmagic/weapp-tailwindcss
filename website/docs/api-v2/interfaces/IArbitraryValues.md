---
id: "IArbitraryValues"
title: "Interface: IArbitraryValues"
sidebar_label: "IArbitraryValues"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### allowDoubleQuotes

• `Optional` **allowDoubleQuotes**: `boolean`

是否允许在类名里，使用双引号。
建议不要开启，因为有些框架，比如 `vue3` 它针对有些静态模板会直接编译成 `html` 字符串，此时开启这个配置很有可能导致转义出错

**`Example`**

```html
<!-- 开启前默认只允许单引号 -->
<view class="after:content-['对酒当歌，人生几何']"></view>
<!-- 开启后 -->
<view class="after:content-[\"对酒当歌，人生几何\"]"></view>
```

**`Default`**

`false`

#### Defined in

[types.ts:114](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L114)
