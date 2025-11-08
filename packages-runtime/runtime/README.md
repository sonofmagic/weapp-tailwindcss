# @weapp-tailwindcss/runtime

`@weapp-tailwindcss/runtime` 提供了一套在小程序环境中运行 Tailwind 相关工具时所需的“公共层”——包含统一的 `escape/unescape` 转换器、`clsx` 封装、`weappTwIgnore`、以及帮助将这些能力注入第三方库的 `createRuntimeFactory`。

- 📦 面向 `tailwind-merge`/`tailwind-variants`/`cva` 等运行时库的公共依赖
- 🔁 自动共享 escape 映射，避免多处维护
- 🧩 暴露 `weappTwIgnore`（`String.raw` 包装），供第三方消费

## 安装

```bash
pnpm add @weapp-tailwindcss/runtime
```

## 快速上手

```ts
import { createRuntimeFactory } from '@weapp-tailwindcss/runtime'
import { createTailwindMerge, extendTailwindMerge, twJoin, twMerge } from 'tailwind-merge'

const create = createRuntimeFactory({
  createTailwindMerge,
  extendTailwindMerge,
  twJoin,
  twMerge,
})

const runtime = create()

runtime.twMerge('text-[#ececec]', 'text-[#ECECEC]') // => 自动 escape 的结果
```

## 自定义 escape/unescape

```ts
import { createRuntimeFactory } from '@weapp-tailwindcss/runtime'
import { createTailwindMerge } from 'tailwind-merge'

const create = createRuntimeFactory({
  createTailwindMerge,
  extendTailwindMerge,
  twJoin,
  twMerge,
})

const custom = create({
  escape: false, // 关闭最终 escape，适合 Web SSR
  unescape: {
    map: { '#': '__hash__' },
  },
})
```

## 其他导出

- `resolveTransformers`：仅想复用 escape/unescape 时可以直接调用
- `clsx` / `ClsxFn` / `ClassValue`：再导出一次，避免子包重复安装 `clsx`
- `weappTwIgnore`：模板字符串标签，是 `String.raw` 的别名，方便外部包跳过 weapp 转义

更多细节见官方文档：<https://tw.icebreaker.top/docs/community/merge/runtime-api>
