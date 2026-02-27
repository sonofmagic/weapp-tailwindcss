# Tailwind 写法最佳实践（weapp-tailwindcss）

本文件用于回答“在 weapp-tailwindcss 项目里，Tailwind class 应该怎么写”。

## 1. 决策顺序（先判断再给方案）

1. 判断 Tailwind 主版本：v3（`content`）还是 v4（`@source`）。
2. 判断目标端：仅小程序，还是小程序 + H5/App。
3. 判断 class 来源：模板静态类、条件类、运行时拼类、第三方透传类。
4. 判断是否涉及二义性任意值（`text-[]` / `bg-[]` / `border-[]` / `ring-[]` / `outline-[]`）。

只要上面 4 点不清晰，就先补信息，不直接给“万能写法”。

## 2. class 编写总原则

- 优先静态类，避免运行时自由拼接字符串。
- 必须动态时，使用“完整字面量枚举”，不要拼半截 token。
- 动态组合统一经过 `cn`（`clsx + twMerge`）或 `cva/tv`。
- 小程序项目默认保留 `postinstall: "weapp-tw patch"`。
- `JS` 转译遵循 `classNameSet` 精确命中：不要依赖“看起来像 Tailwind”的启发式字符串拼接。

## 3. 推荐写法与反例

### 3.1 条件类

推荐：

```ts
const buttonClass = isPrimary
  ? 'bg-blue-500 text-white px-4'
  : 'bg-gray-100 text-gray-900 px-3'
```

反例：

```ts
const buttonClass = `bg-${color} px-${size}`
```

### 3.2 枚举映射

推荐：

```ts
const toneMap = {
  primary: 'bg-blue-500 text-white',
  danger: 'bg-red-500 text-white',
  ghost: 'bg-transparent text-slate-700',
} as const

const className = toneMap[tone]
```

反例：

```ts
const className = `bg-${tone}-500 text-${tone}-50`
```

### 3.3 运行时合并

推荐：

```ts
import { twMerge } from '@weapp-tailwindcss/merge'
import { clsx } from 'clsx'

const cn = (...inputs: clsx.ClassValue[]) => twMerge(clsx(...inputs))
const className = cn('px-3 py-2 bg-blue-500', isActive && 'bg-blue-600', externalClass)
```

反例：

```ts
const className = ['px-3 py-2 bg-blue-500', isActive ? 'bg-blue-600' : '', externalClass].join(' ')
```

### 3.4 `space-y-*` / `space-x-*`（小程序标签限制）

在小程序中，`space-*` 这类依赖子组合器的工具类，默认按 `view + view`（以及 `text + text`）替换，不会自动覆盖所有标签。

常见现象：

- `space-y-2` 写在容器上，但子节点是 `button` / `input` / 自定义组件时，看起来“间距不生效”。

推荐处理顺序：

1. 能改结构时，优先让相邻子节点落在 `view/text`，或外层补一层 `<view>`。
2. 自定义组件场景可评估 `virtualHost`（减少额外节点影响）。
3. 确实需要覆盖更多标签时，再配置 `cssChildCombinatorReplaceValue`。

默认优先级（建议固定执行）：

1. **结构优先**：优先改模板结构，不先动全局配置。
2. **组件优先**：在自定义组件内使用 `virtualHost` 降低节点层级影响。
3. **配置兜底**：最后扩展 `cssChildCombinatorReplaceValue`，且仅最小增量扩展标签。

`virtualHost` 示例：

```js
Component({
  options: {
    virtualHost: true,
  },
})
```

配置示例：

```ts
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'

uvtw({
  cssChildCombinatorReplaceValue: ['view', 'text', 'button', 'input'],
})
```

注意：

- 扩展标签会放大选择器作用范围，建议只加入业务真实需要的标签，避免全量放开导致样式互相影响。
- 不建议一开始就把 `cssChildCombinatorReplaceValue` 扩成“所有标签”，这通常会带来额外样式串扰。

## 4. 二义性任意值与 rpx 规则

`rpx` 不是标准 CSS 长度单位，Tailwind 在二义性原子类中可能误判。

- 常见二义性：`text-[]`、`bg-[]`、`border-[]`、`outline-[]`、`ring-[]`
- 默认方案：执行 `weapp-tw patch`，并保持 `postinstall` 持续生效
- 兜底方案：显式声明类型前缀

示例：

```html
<view class="text-[length:22rpx]"></view>
<view class="text-[color:#bada55]"></view>
<view class="bg-[length:12rpx]"></view>
```

## 5. v3 / v4 扫描配置基线

### 5.1 Tailwind v3（`content`）

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{wxml,html,js,ts,jsx,tsx,vue}'],
}
```

### 5.2 Tailwind v4（`@source`）

```css
@import 'tailwindcss';
@source "../src/**/*.{vue,wxml,js,ts,jsx,tsx}";
@source not "../dist/**";
@source not "../unpackage/**";
```

关键要求：

- 覆盖真实模板与脚本扩展名。
- 排除构建产物目录，避免扫描膨胀和增量变慢。

## 6. weapp 运行时联动要点

- 使用 `@weapp-tailwindcss/merge`（v4）或 `@weapp-tailwindcss/merge-v3`（v3）处理冲突与转义一致性。
- 若把 `twMerge` / `cva` / `tv` / `cn` 做了重命名封装，补充 `ignoreCallExpressionIdentifiers`。
- 需要原样透传给第三方库时，使用 `weappTwIgnore` 跳过编译期转义。

示例：

```ts
// weapp-tailwindcss 配置中补充
ignoreCallExpressionIdentifiers: ['cn', 'createVariants']
```

```ts
import { weappTwIgnore } from '@weapp-tailwindcss/merge'

const rawClass = weappTwIgnore`text-[#123456]`
```

## 7. 多端项目建议

- 小程序优先时可开启 `rem2rpx` / `px2rpx`，H5 优先时按环境区分开启。
- 不要把小程序插件能力无条件作用于纯 H5 构建。
- 在组件库场景优先“默认类 + 外部覆盖 + merge 去冲突”的模式。

## 8. 输出模板（给用户的最终答案结构）

回答写法规范类问题时，尽量使用下列结构：

1. 结论（适用版本 + 目标端）
2. 推荐写法（2-3 条，可复制代码）
3. 反例（1-2 条，说明为什么不推荐）
4. 配置清单（`content/@source`、`postinstall`、`ignoreCallExpressionIdentifiers`）
5. 最小验证（编译验证 + 样式验证 + 回归检查点）

保持建议可执行，避免只讲概念不落代码。
