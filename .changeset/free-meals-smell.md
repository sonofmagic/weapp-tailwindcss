---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

feat: 添加 `cssRemoveProperty` 选项，默认值为 `true`，这是为了在 `tailwindcss` 中移除这种 css 节点:

```css
@property --tw-content {
  syntax: "*";
  initial-value: "";
  inherits: false;
}
```

这种样式在小程序中，没有任何的意义。
