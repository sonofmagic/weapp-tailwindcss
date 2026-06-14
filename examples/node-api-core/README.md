# Node.js API createContext 示例

这个示例覆盖 `import { createContext } from 'weapp-tailwindcss/core'` 的直接 Node.js 用法。

## 运行

```bash
pnpm --filter @weapp-tailwindcss-example/node-api-core build
pnpm --filter @weapp-tailwindcss-example/node-api-core memory
pnpm --filter @weapp-tailwindcss-example/node-api-core test
```

## 覆盖点

- `transformWxml` 转义模板 class。
- `transformWxss` 转义 WXSS 选择器。
- `transformJs` 仅基于显式 `runtimeSet` 精确转义 JS 字符串。
- 复用同一个 `createContext()` 多轮转换，验证长生命周期 Node API 使用方式不会出现明显 heap 增长。
