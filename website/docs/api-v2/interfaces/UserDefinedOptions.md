---
id: "UserDefinedOptions"
title: "Interface: UserDefinedOptions"
sidebar_label: "配置项(v2.x)"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### appType

• `Optional` **appType**: [`AppType`](../#apptype)

**`Description`**

使用的框架类型(uni-app,taro...)，用于找到主要的 `css bundle` 进行转化，这个配置会影响默认方法 `mainCssChunkMatcher` 的行为，不传会去猜测 `tailwindcss css var inject scope` 的位置

#### Defined in

[types.ts:284](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L284)

---

### arbitraryValues

• `Optional` **arbitraryValues**: [`IArbitraryValues`](IArbitraryValues.md)

**`Description`**

针对 tailwindcss arbitrary values 的一些配置

#### Defined in

[types.ts:301](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L301)

---

### cssChildCombinatorReplaceValue

• `Optional` **cssChildCombinatorReplaceValue**: `string` \| `string`[]

**`Description`**

用于控制 tailwindcss 子组合器的生效标签范围, 这里我们用一个例子来说明这个配置是干啥用的.

我们布局的时候往往会使用 `space-x-4`
那么实际上会生成这样的css选择器:

```css
.space-x-4>:not([hidden])~:not([hidden]){}
```

然而很不幸，这个选择器在小程序中是不支持的，写了会报错导致编译失败。
所以出于保守起见，我把它替换为了：

```css
.space-x-4>view + view{}
```

这同时也是默认值, 而这个选项就允许你进行自定义子组合器的行为

你可以传入一个 字符串，或者字符串数组

1. 传入字符串数组,比如 `['view','text']` 生成:

```css
.space-y-4>view + view,text + text{}
```

2. 传入一个字符串，此时行为变成了整个替换，比如 `'view,text,button,input ~ view,text,button,input'` 生成:

```css
.space-y-4>view,text,button,input ~ view,text,button,input{}
```

**`Default`**

```ts
'view + view'
```

#### Defined in

[types.ts:329](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L329)

---

### cssMatcher

• `Optional` **cssMatcher**: `string` \| `string`[] \| (`name`: `string`) => `boolean`

**`Description`**

匹配 `wxss` 等等样式文件的方法，支持 `glob` by [micromatch](https://github.com/micromatch/micromatch)

#### Defined in

[types.ts:125](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L125)

---

### cssPreflight

• `Optional` **cssPreflight**: [`CssPreflightOptions`](../#csspreflightoptions)

**`Issue`**

<https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/7>

**`Description`**

在所有 view节点添加的 css 预设，可根据情况自由的禁用原先的规则，或者添加新的规则。 详细用法如下:

```js
// default 默认:
cssPreflight: {
'box-sizing': 'border-box',
'border-width': '0',
'border-style': 'solid',
'border-color': 'currentColor'
}
// result
// box-sizing: border-box;
// border-width: 0;
// border-style: solid;
// border-color: currentColor

// case 禁用所有
cssPreflight: false
// result
// none

// case 禁用单个属性
cssPreflight: {
'box-sizing': false
}
// border-width: 0;
// border-style: solid;
// border-color: currentColor

// case 更改和添加单个属性
cssPreflight: {
'box-sizing': 'content-box',
'background': 'black'
}
// result
// box-sizing: content-box;
// border-width: 0;
// border-style: solid;
// border-color: currentColor;
// background: black
```

#### Defined in

[types.ts:178](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L178)

---

### cssPreflightRange

• `Optional` **cssPreflightRange**: `"view"` \| `"all"`

**`Issue`**

<https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/pull/62>

**`Description`**

全局`dom`选择器，只有在这个选择器作用范围内的`dom`会被注入 `cssPreflight` 的变量和默认样式。默认为 `'view'` 即只对所有的 `view` 和伪元素生效，想要对所有的元素生效，可切换为 `'all'`,此时需要自行处理和客户端默认样式的冲突

#### Defined in

[types.ts:184](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L184)

---

### cssSelectorReplacement

• `Optional` **cssSelectorReplacement**: `Object`

#### Type declaration

| Name         | Type                | Description               |
| :----------- | :------------------ | :------------------------ |
| `root?`      | `string` \| `false` | **`Default`** `ts 'page'` |
| `universal?` | `string` \| `false` | **`Default`** `ts 'view'` |

#### Defined in

[types.ts:410](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L410)

---

### customAttributes

• `Optional` **customAttributes**: [`ICustomAttributes`](../#icustomattributes)

**`Description`**

**这是一个重要的配置!**

它可以自定义`wxml`标签上的`attr`转化属性。默认转化所有的`class`和`hover-class`，这个`Map`的 `key`为匹配标签，`value`为属性字符串或者匹配正则数组。

如果你想要增加，对于所有标签都生效的转化的属性，你可以添加 `*`: `(string | Regexp)[]` 这样的键值对。(`*` 是一个特殊值，代表所有标签)

更复杂的情况，可以传一个 `Map<string | Regex, (string | Regex)[]>`实例。

假如你要把 `className` 通过组件的`prop`传递给子组件，又或者想要自定义转化的标签属性时，需要用到此配置，案例详见：[issue#129](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/129#issuecomment-1340914688),[issue#134](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/134#issuecomment-1351288238)

**`Example`**

```js
const customAttributes = {
// 匹配所有带 Class / class 相关的标签，比如 `a-class`, `testClass` , `custom-class` 里的值
'*': [ /[A-Za-z]?[A-Za-z-]*[Cc]lass/ ],
// 额外匹配转化 `van-image` 标签上的 `custom-class` 的值
'van-image': ['custom-class'],
'ice-button': ['testClass']
}
```

当然你可以根据自己的需求，定义单个或者多个正则/字符串。

甚至有可能你编写正则表达式，它们匹配的范围，直接包括了插件里自带默认的 `class`/`hover-class`，那么这种情况下，你完全可以取代插件的默认模板转化器，开启 [disabledDefaultTemplateHandler](/docs/api/interfaces/UserDefinedOptions#disableddefaulttemplatehandler) 配置项,禁用默认的模版匹配转化器。

#### Defined in

[types.ts:251](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L251)

---

### customReplaceDictionary

• `Optional` **customReplaceDictionary**: `Record`<`string`, `string`\> \| `"simple"` \| `"complex"`

**`Description`**

自定义转化class名称字典，这个配置项用来自定义转化`class`名称字典,你可以使用这个选项来简化生成的`class`

插件中内置了`'simple'`模式和`'complex'`模式:

- `'simple'`模式: 把小程序中不允许的字符串，转义为**相等长度**的代替字符串，这种情况不追求转化目标字符串的一比一绝对等价，即无法从生成结果，反推原先的`class`
- `'complex'`模式: 把小程序中不允许的字符串，转义为**更长**的代替字符串，这种情况转化前后的字符串是等价的，可以从结果进行反推，缺点就是会生成更长的 `class` 导致 `wxml`和`wxss`这类的体积增大

当然，你也可以自定义，传一个 `Record<string, string>` 类型，只需保证转化后 css 中的 `class` 选择器，不会和自己定义的 `class` 产生冲突即可，示例见[dic.ts](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/src/dic.ts)

**`Default`**

```ts
'simple'
```

#### Defined in

[types.ts:263](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L263)

### disabled

• `Optional` **disabled**: `boolean`

**`Description`**

是否禁用此插件，一般用于构建到多平台时使用

#### Defined in

[types.ts:196](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L196)

---

### disabledDefaultTemplateHandler

• `Optional` **disabledDefaultTemplateHandler**: `boolean`

**`Version`**

`^2.6.2`

**`Description`**

开启此选项，将会禁用默认 `wxml` 模板替换器，此时模板的匹配和转化将完全被 [`customAttributes`](/docs/api/interfaces/UserDefinedOptions#customattributes) 接管，

此时你需要自己编写匹配之前默认 `class`/`hover-class`，以及新的标签属性的正则表达式`regex`

**`Default`**

```ts
false
```

#### Defined in

[types.ts:389](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L389)

---

### htmlMatcher

• `Optional` **htmlMatcher**: `string` \| `string`[] \| (`name`: `string`) => `boolean`

**`Description`**

匹配 `wxml`等等模板进行处理的方法，支持 `glob` by [micromatch](https://github.com/micromatch/micromatch)

#### Defined in

[types.ts:121](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L121)

---

### injectAdditionalCssVarScope

• `Optional` **injectAdditionalCssVarScope**: `boolean`

**`Version`**

`^2.6.0`

**`Description`**

是否注入额外的 `tailwindcss css var scope` 区域，这个选项用于这样的场景

比如 `taro vue3` 使用 [NutUI](https://nutui.jd.com), 需要使用 `@tarojs/plugin-html`，而这个插件会启用 `postcss-html-transform` 从而移除所有带 `*` 选择器

这会导致 `tailwindcss css var scope` 区域被移除导致一些样式，比如渐变等等功能失效

这种场景下，启用这个选项会再次重新注入整个 `tailwindcss css var scope`

**`Default`**

```ts
false
```

#### Defined in

[types.ts:373](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L373)

---

### inlineWxs

• `Optional` **inlineWxs**: `boolean`

**`Experiment`**

实验性质，有可能会改变

**`Description`**

是否转义 `wxml` 中内联的 `wxs`

> tip: 记得在 `tailwind.config.js` 中，把 `wxs` 这个格式加入 `content` 配置项，不然不会生效

**`Example`**

```html
<!-- index.wxml -->
<wxs module="inline">
// 我是内联wxs
// 下方的类名会被转义
var className = "after:content-['我是className']"
module.exports = {
 className: className
}
</wxs>
<wxs src="./index.wxs" module="outside"/>
<view><view class="{{inline.className}}"></view><view class="{{outside.className}}"></view></view>
```

**`Default`**

```ts
false
```

#### Defined in

[types.ts:359](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L359)

---

### jsEscapeStrategy

• `Optional` **jsEscapeStrategy**: `"regenerate"` \| `"replace"`

**`Version`**

`^2.7.0`

**`Description`**

js 字面量以及模板字符串的转义替换模式

- `regenerate` 模式，为需要转义的字面量，重新生成相同语义的字符串, （默认的传统模式）
- `replace` 模式，为在原版本字符串上直接精准替换, (`2.7.0+` 新增)

如果用一个比喻来形容，那么 `regenerate` 类似于创造一个双胞胎，而 `replace` 模式就类似于一把精准的手术刀

> `replace` 模式已经在 `2.8.0` 版本中，成为默认模式，另外使用这个模式之后，生成相关的参数，比如 `minifiedJs` 就会失效了。

**`Default`**

```ts
'regenerate'
```

#### Defined in

[types.ts:402](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L402)

---

### jsMatcher

• `Optional` **jsMatcher**: `string` \| `string`[] \| (`name`: `string`) => `boolean`

**`Description`**

匹配编译后 `js` 文件进行处理的方法，支持 `glob` by [micromatch](https://github.com/micromatch/micromatch)

#### Defined in

[types.ts:129](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L129)

---

### jsPreserveClass

• `Optional` **jsPreserveClass**: (`keyword`: `string`) => `undefined` \| `boolean`

#### Type declaration

▸ (`keyword`): `undefined` \| `boolean`

##### Parameters

| Name      | Type     |
| :-------- | :------- |
| `keyword` | `string` |

##### Returns

`undefined` \| `boolean`

**`Version`**

`^2.6.1`

**`Description`**

当 `tailwindcss` 和 `js` 处理的字面量撞车的时候，配置此选项可以用来保留js字面量，不进行转义处理。返回值中，想要当前js字面量保留，则返回 `true`。想要转义则返回 `false/undefined`

**`Default`**

保留所有带 `*` js字符串字面量

#### Defined in

[types.ts:380](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L380)

---

### mainCssChunkMatcher

• `Optional` **mainCssChunkMatcher**: `string` \| `string`[] \| (`name`: `string`, `appType?`: [`AppType`](../#apptype)) => `boolean`

**`Description`**

`tailwindcss css var inject scope` 的匹配方法,用于处理原始变量和替换不兼容选择器。可以不传，但是遇到某些 `::before/::after` 选择器注入冲突时，建议传入参数手动指定 css bundle 文件位置

#### Defined in

[types.ts:134](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L134)

### minifiedJs

• `Optional` **minifiedJs**: `boolean`

**`Description`**

是否压缩 js (`process.env.NODE_ENV` 为 `production` 时默认开启)

**`Default`**

```ts
process.env.NODE_ENV === 'production'
```

#### Defined in

[types.ts:290](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L290)

---

### onEnd

• `Optional` **onEnd**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

**`Description`**

结束处理时调用

#### Defined in

[types.ts:222](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L222)

---

### onLoad

• `Optional` **onLoad**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

**`Description`**

plugin apply 初调用

#### Defined in

[types.ts:206](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L206)

---

### onStart

• `Optional` **onStart**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

**`Description`**

开始处理时调用

#### Defined in

[types.ts:210](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L210)

---

### onUpdate

• `Optional` **onUpdate**: (`filename`: `string`, `oldVal`: `string`, `newVal`: `string`) => `void`

#### Type declaration

▸ (`filename`, `oldVal`, `newVal`): `void`

##### Parameters

| Name       | Type     |
| :--------- | :------- |
| `filename` | `string` |
| `oldVal`   | `string` |
| `newVal`   | `string` |

##### Returns

`void`

**`Description`**

匹配成功并修改文件内容后调用

#### Defined in

[types.ts:218](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L218)

---

### replaceUniversalSelectorWith

• `Optional` **replaceUniversalSelectorWith**: `string` \| `false`

**`Issue`**

<https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/81>

**`Default`**

```ts
'view'
```

**`Description`**

把`css`中的全局选择器 **`*`** 替换为指定值，默认替换为 `'view'`，设置为 `false` 时不进行替换，此时小程序会由于不认识`*`选择器而报错

#### Defined in

[types.ts:191](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L191)

---

### supportCustomLengthUnitsPatch

• `Optional` **supportCustomLengthUnitsPatch**: `boolean` \| [`ILengthUnitsPatchOptions`](ILengthUnitsPatchOptions.md)

**`Deprecated`**

**`Issue`**

<https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110>

**`Description`**

自从`tailwindcss 3.2.0`对任意值添加了长度单位的校验后，小程序中的`rpx`这个`wxss`单位，由于不在长度合法名单中，于是被识别成了颜色，导致与预期不符，详见：[issues/110](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110)。所以这个选项是用来给`tailwindcss`运行时，自动打上一个支持`rpx`单位的补丁。默认开启，在绝大部分情况下，你都可以忽略这个配置项，除非你需要更高级的自定义。

> 目前自动检索存在一定的缺陷，它会在第一次运行的时候不生效，关闭后第二次运行才生效。这是因为 nodejs 运行时先加载好了 `tailwindcss` 模块 ，然后再来运行这个插件，自动给 `tailwindcss` 运行时打上 `patch`。此时由于 `tailwindcss` 模块已经加载，所以 `patch` 在第一次运行时不生效，`ctrl+c` 关闭之后，再次运行才生效。这种情况可以使用:

```diff
"scripts": {
+  "postinstall": "weapp-tw patch"
}
```

使用 `npm hooks` 的方式来给 `tailwindcss` 自动打 `patch`

#### Defined in

[types.ts:279](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L279)

---

### tailwindcssBasedir

• `Optional` **tailwindcssBasedir**: `string`

**`Version`**

`^2.9.3`

**`Description`**

用于指定路径来获取 tailwindcss 上下文，一般情况下不用传入，使用 linked / monorepo 可能需要指定具体位置，路径通常是目标项目的 package.json 所在目录

#### Defined in

[types.ts:425](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L425)

---

### wxsMatcher

• `Optional` **wxsMatcher**: `string` \| `string`[] \| (`name`: `string`) => `boolean`

**`Experiment`**

实验性质，有可能会改变

**`Description`**

各个平台 `wxs` 文件的匹配方法,可以设置为包括微信的 .wxs,支付宝的 .sjs 和 百度小程序的 .filter.js

> tip: 记得在 `tailwind.config.js` 中，把 `wxs` 这个格式加入 `content` 配置项，不然不会生效

**`Default`**

```ts
()=>false
```

#### Defined in

[types.ts:337](https://github.com/sonofmagic/weapp-tailwindcss/blob/54db673b/src/types.ts#L337)
