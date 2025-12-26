# weapp-style-injector

## 0.0.1

### Patch Changes

- [`84061c4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/84061c4606d4ae28334bcce5fd4552211130e1d3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 TypeScript 严格模式下的类型错误：
  - **@weapp-tailwindcss/shared**: 修复 `groupBy` 函数中的类型推断问题
  - **@weapp-tailwindcss/postcss**: 添加 `process.env.TARO_ENV` 类型声明，修复 `pipeline.ts` 和 `shared.ts` 中的 `exactOptionalPropertyTypes` 问题
  - **weapp-style-injector**: 修复 `uni-app.ts`、`taro.ts`、`vite.ts`、`webpack.ts` 及相关子模块中的可选属性类型问题
