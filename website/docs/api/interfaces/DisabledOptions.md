# DisabledOptions

定义于: [packages/weapp-tailwindcss/src/types/disabled-options.ts:9](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/disabled-options.ts#L9)

禁用插件功能的细粒度选项。

## 添加于

^4.2.0

## 备注

适用于需要仅关闭部分行为（例如主插件流程），但保留其他预处理能力（如 Tailwind v4 的 `@import "tailwindcss"` 重写）。

## 属性

### plugin?

> `optional` **plugin**: `boolean`

定义于: [packages/weapp-tailwindcss/src/types/disabled-options.ts:15](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/disabled-options.ts#L15)

禁用主插件流程，等同于 `disabled: true`。

#### 默认值

```ts
false
```

***

### rewriteCssImports?

> `optional` **rewriteCssImports**: `boolean`

定义于: [packages/weapp-tailwindcss/src/types/disabled-options.ts:21](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/disabled-options.ts#L21)

禁用对 `@import "tailwindcss"` 的预处理重写。

#### 默认值

```ts
false
```
