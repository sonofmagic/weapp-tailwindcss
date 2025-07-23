# @weapp-tailwindcss/postcss

## 1.0.17-alpha.0

### Patch Changes

- [`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1)]:
  - @weapp-tailwindcss/shared@1.0.3-alpha.0

## 1.0.16

### Patch Changes

- [`f2c69d5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f2c69d5bd8e1dc3d39eced8ff62b75e0c4ef3591) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 修复 `tailwindcss@4` 中，在和 `taro` 一起使用时，`space-x-<number>` 类名生成 `css` 不正确的问题

## 1.0.15

### Patch Changes

- [`2b0a754`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2b0a75493506d219d1b49474f3ce684d107fcbd1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: [#655](https://github.com/sonofmagic/weapp-tailwindcss/issues/655) 默认自动去除 `@layer` 在 `postcss-env-preset` 处理之前

## 1.0.14

### Patch Changes

- [`bf7e53c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bf7e53cfcd69c49c5cd99f7bf21ad0999a31b1d6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 优化 tailwindcss@4.1.10 的生成样式规则

## 1.0.13

### Patch Changes

- [`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add postcss-html-transform plugin

- [`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: injectAdditionalCssVarScope for tailwindcss@4

## 1.0.13-beta.1

### Patch Changes

- [`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add postcss-html-transform plugin

## 1.0.13-beta.0

### Patch Changes

- [`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: injectAdditionalCssVarScope for tailwindcss@4

## 1.0.12

### Patch Changes

- [`5d27de5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5d27de5a509da6984e77036da8a176e0570ba5c1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 检测生成空的 atRule 节点时，移除空节点

## 1.0.11

### Patch Changes

- [`3cecfdc`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3cecfdccfcdfacd262fee571b0209e095b33838e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 移除带有 `@supports` `color-mix` 的 css 节点, 修复
  - [#632](https://github.com/sonofmagic/weapp-tailwindcss/issues/632)
  - [#631](https://github.com/sonofmagic/weapp-tailwindcss/issues/631)

  > 但是这种行为会导致使用透明度 + css 变量的时候，被回滚到固定的颜色值，因为微信小程序不支持 `color-mix`，同时 `tailwindcss` 依赖 `color-mix` + `css var` 来进行颜色变量的计算。

## 1.0.10

### Patch Changes

- [`8b45542`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b4554295e9671fd740fa18a9f9a25a17613597b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: tailwindcss v4.1.2 vite plugin

- [`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support `tailwindcss@4.1.2`

- [`0d6564a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d6564aaaea588289dac5b1b784b1902105b297a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 优化 isTailwindcssV4ModernCheck 判断

- [`23c08c7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23c08c7d7ad276035ffa3ef78d0fb00e1c717ddf) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: isTailwindcssV4ModernCheck

## 1.0.10-alpha.3

### Patch Changes

- [`8b45542`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b4554295e9671fd740fa18a9f9a25a17613597b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: tailwindcss v4.1.2 vite plugin

## 1.0.10-alpha.2

### Patch Changes

- [`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support `tailwindcss@4.1.2`

## 1.0.10-alpha.1

### Patch Changes

- [`23c08c7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23c08c7d7ad276035ffa3ef78d0fb00e1c717ddf) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: isTailwindcssV4ModernCheck

## 1.0.10-alpha.0

### Patch Changes

- [`0d6564a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d6564aaaea588289dac5b1b784b1902105b297a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 优化 isTailwindcssV4ModernCheck 判断

## 1.0.9

### Patch Changes

- [`3113053`](https://github.com/sonofmagic/weapp-tailwindcss/commit/31130538a13098e2a1d29bbd331dc67a195689cf) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Fix: Support `Tailwindcss@4.1.1` and fix [#619](https://github.com/sonofmagic/weapp-tailwindcss/issues/619)

## 1.0.8

### Patch Changes

- [`e8c4534`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e8c4534ab588eae1115dac15b529b7a122141316) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加 `cssRemoveProperty` 选项，默认值为 `true`，这是为了在 `tailwindcss` 中移除这种 css 节点:

  ```css
  @property --tw-content {
    syntax: "*";
    initial-value: "";
    inherits: false;
  }
  ```

  这种样式在小程序中，没有任何的意义。

## 1.0.7

### Patch Changes

- [`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9)]:
  - @weapp-tailwindcss/shared@1.0.2

## 1.0.7-alpha.0

### Patch Changes

- [`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9)]:
  - @weapp-tailwindcss/shared@1.0.2-alpha.0

## 1.0.6

### Patch Changes

- [`ff9933a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff9933ad06de7bf3333c1c63016920639a56b87a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: tailwindcss@4 space-x-_ and space-y-_

## 1.0.5

### Patch Changes

- [`a4532ab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a4532ab34de62556e57ed350e15ca14e602b7f93) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 使用space-y-2后编译报错 #595

## 1.0.4

### Patch Changes

- [`9e65534`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9e65534f035ee4e17a2dc0b891278cacb92d5a0b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: @layer as :not(#n) and @weapp-tailwindcss/merge switcher

## 1.0.3

### Patch Changes

- Updated dependencies [[`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61)]:
  - @weapp-tailwindcss/shared@1.0.1

## 1.0.3-alpha.0

### Patch Changes

- Updated dependencies [[`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61)]:
  - @weapp-tailwindcss/shared@1.0.1-alpha.0

## 1.0.2

### Patch Changes

- [`64c0189`](https://github.com/sonofmagic/weapp-tailwindcss/commit/64c018935732481ebe2f366e4136b4d3574dde57) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: improve `isAllowedClassName` preflight

## 1.0.1

### Patch Changes

- [`ee34fb3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ee34fb34688a2bd11018ce5e4ea6d07a062b0b55) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: bg-gradient --tw-gradient-position in oklab

## 1.0.0

### Major Changes

- [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875) Thanks [@sonofmagic](https://github.com/sonofmagic)! - ## Feature

  增加 `@weapp-tailwindcss/merge` 支持，这是 `weapp-tailwindcss` 版本的 `tailwindcss-merge` 和 `cva` 方法

  ## Breaking Changes
  1. 去除 `weapp-tailwindcss/postcss` (可直接安装使用 `@weapp-tailwindcss/postcss`)
  2. 增加 `weapp-tailwindcss/escape` 来取代 `weapp-tailwindcss/replace`
  3. 项目 monorepo 区分包

### Patch Changes

- [`d4bfcc7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d4bfcc7a25776eb9869bd934c05e3b49a3f4cc8b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: remove attribute in :where pseudo

- [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename export function

- [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change postcssPresetEnv default value

- [`1df699b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1df699bf82d66847cbc64cc8f294ef237e0470c5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: fix types import intel

- [`6d20f1f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6d20f1f9a799cf350dcbbd861907f0ff70a68dfd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: perfer postcss-preset-env instead of @csstools

- [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- Updated dependencies [[`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875), [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d), [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b), [`d50d95d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d50d95d04e1c6b7c3ff32acc0d9894d3c0f06d22), [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8)]:
  - @weapp-tailwindcss/shared@1.0.0

## 1.0.0-alpha.8

### Patch Changes

- [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change postcssPresetEnv default value

## 1.0.0-alpha.7

### Patch Changes

- [`d4bfcc7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d4bfcc7a25776eb9869bd934c05e3b49a3f4cc8b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: remove attribute in :where pseudo

## 1.0.0-alpha.6

### Patch Changes

- [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- Updated dependencies [[`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8)]:
  - @weapp-tailwindcss/shared@1.0.0-alpha.4

## 1.0.0-alpha.5

### Patch Changes

- [`6d20f1f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6d20f1f9a799cf350dcbbd861907f0ff70a68dfd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: perfer postcss-preset-env instead of @csstools

## 1.0.0-alpha.4

### Patch Changes

- [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename export function

- Updated dependencies [[`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b)]:
  - @weapp-tailwindcss/shared@1.0.0-alpha.3

## 1.0.0-alpha.3

### Patch Changes

- [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d)]:
  - @weapp-tailwindcss/shared@1.0.0-alpha.2

## 1.0.0-alpha.2

### Patch Changes

- [`1df699b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1df699bf82d66847cbc64cc8f294ef237e0470c5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: fix types import intel

## 1.0.0-alpha.1

### Major Changes

- [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: monorepo changes

### Patch Changes

- Updated dependencies [[`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875)]:
  - @weapp-tailwindcss/shared@1.0.0-alpha.1

## 0.0.1-alpha.0

### Patch Changes

- Updated dependencies [[`d50d95d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d50d95d04e1c6b7c3ff32acc0d9894d3c0f06d22)]:
  - @weapp-tailwindcss/shared@0.0.1-alpha.0
