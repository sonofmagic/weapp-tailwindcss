# DisabledOptions

禁用插件功能的细粒度选项。

## 添加于

^4.2.0

## 备注

适用于需要仅关闭部分行为（例如主插件流程），但保留其他预处理能力（如 Tailwind v4 的 `@import "tailwindcss"` 重写）。

## 属性

### plugin?

> `optional` **plugin**: `boolean`

禁用主插件流程，等同于 `disabled: true`。

#### 默认值

```ts
false
```

***

### rewriteCssImports?

> `optional` **rewriteCssImports**: `boolean`

禁用对 `@import "tailwindcss"` 的预处理重写。

#### 默认值

```ts
false
```
