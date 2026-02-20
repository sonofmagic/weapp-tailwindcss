# Package Guidelines (`packages/build-all`)

## 适用范围

- 本文件适用于 `packages/build-all`。
- 该包是 monorepo 聚合元包（meta package），用于集中声明 workspace 依赖并触发聚合构建。

## 变更原则

- 保持“仅聚合、不承载业务代码”定位，不在本包引入运行时代码。
- 调整 dependencies 时，需确认其目的是构建/发布编排，而非绕开上游包边界。
- `build` 脚本应保持轻量且可稳定执行，避免引入耗时或副作用流程。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/build-all build`
