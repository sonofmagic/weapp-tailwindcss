# @weapp-tailwindcss/merge

## 1.3.0

### Minor Changes

- [`9cb2bd4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9cb2bd4616326dd3431175a6848834da9d5c210b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构内部运行时工厂，统一 escape 处理并新增 tailwind-merge 版本元数据导出，提升不同 Tailwind CSS 版本下的适配能力。

## 1.3.0-alpha.0

### Minor Changes

- [`9cb2bd4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9cb2bd4616326dd3431175a6848834da9d5c210b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构内部运行时工厂，统一 escape 处理并新增 tailwind-merge 版本元数据导出，提升不同 Tailwind CSS 版本下的适配能力。

## 1.2.3

### Patch Changes

- [`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.2.3-alpha.0

### Patch Changes

- [`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.2.2

### Patch Changes

- [`83eef1d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/83eef1d697de6d558db7d073ca34832a10490dc3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade tailwind-merge@3

## 1.2.1

### Patch Changes

- [`5ba8992`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5ba89920b01517ccb90598660cd0d5f9a4b4f623) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 不默认执行 postinstall 脚本，默认使用 tailwind-merge@3 对于 tailwindcss@4

## 1.2.0

### Minor Changes

- [`e13d072`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e13d072524100b0ff7292e2e316b40d5cdadedb5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 更新 tailwindcss-merge 版本

## 1.1.1

### Patch Changes

- [`f7bdbc4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f7bdbc41fda927f2884305730781621bad4f3157) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade `tailwind-merge` to `3.2.0`

## 1.1.0

### Minor Changes

- [`6811f23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6811f231932925cf1f34ef45eda5b233d792d54f) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade tailwind-merge to `3.1.0`

## 1.0.7

### Patch Changes

- [`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.0.7-alpha.0

### Patch Changes

- [`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.0.6

### Patch Changes

- [`f5fc571`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f5fc5713732fd093fb17991117862ef87aa0dd2f) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: cva dts error

## 1.0.5

### Patch Changes

- [`fd38cfc`](https://github.com/sonofmagic/weapp-tailwindcss/commit/fd38cfce64ee3edc7d454928367d76ff0e0c829a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat(merge): add create function

## 1.0.4

### Patch Changes

- [`5618019`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5618019c36bfabdef0cd4512f779127b83273db9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 升级相关的依赖

## 1.0.3

### Patch Changes

- [`9e65534`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9e65534f035ee4e17a2dc0b891278cacb92d5a0b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: @layer as :not(#n) and @weapp-tailwindcss/merge switcher

## 1.0.2

### Patch Changes

- [`0ddc049`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0ddc0498c8d6ab5da298ab2f426e6b2c7e2de242) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: add auto switch postinstall script

## 1.0.1

### Patch Changes

- [`11bae23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/11bae23fd3de7332fd06a980b6a418f4795f6bc9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump deps

## 1.0.0

### Major Changes

- [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875) Thanks [@sonofmagic](https://github.com/sonofmagic)! - ## Feature

  增加 `@weapp-tailwindcss/merge` 支持，这是 `weapp-tailwindcss` 版本的 `tailwindcss-merge` 和 `cva` 方法

  ## Breaking Changes
  1. 去除 `weapp-tailwindcss/postcss` (可直接安装使用 `@weapp-tailwindcss/postcss`)
  2. 增加 `weapp-tailwindcss/escape` 来取代 `weapp-tailwindcss/replace`
  3. 项目 monorepo 区分包

### Patch Changes

- [`bc8d3c9`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bc8d3c9997fe9fb388093dafe6924021d243fd39) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 拆分 cn 和 cva 为了更小的包体积

- [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename export function

- [`de0e4d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/de0e4d8f38477e806df74b24926d280319ac8419) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: init `@weapp-tailwindcss/merge` package

- [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change postcssPresetEnv default value

- [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

## 1.0.0-alpha.6

### Patch Changes

- [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change postcssPresetEnv default value

## 1.0.0-alpha.5

### Patch Changes

- [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

## 1.0.0-alpha.4

### Patch Changes

- [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename export function

## 1.0.0-alpha.3

### Patch Changes

- [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.0.0-alpha.2

### Patch Changes

- [`bc8d3c9`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bc8d3c9997fe9fb388093dafe6924021d243fd39) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 拆分 cn 和 cva 为了更小的包体积

## 1.0.0-alpha.1

### Major Changes

- [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: monorepo changes

## 0.0.1-alpha.0

### Patch Changes

- [`de0e4d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/de0e4d8f38477e806df74b24926d280319ac8419) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: init `@weapp-tailwindcss/merge` package
