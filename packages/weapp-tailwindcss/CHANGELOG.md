# weapp-tailwindcss

## 4.4.0-alpha.1

### Patch Changes

- [`f288e4d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f288e4d2432014d69dda03d2806c29381b2b82a0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 优化 `replaceHandleValue` 的热路径，跳过无效拆分、复用正则与转义缓存，并在混淆流程中避免重复处理；同时改进 Unicode 解码与名称匹配工具的性能并补充单测验证。更新 `css-macro` 插件以兼容 Tailwind CSS v3/v4，并在文档中补充使用示例与平台条件写法说明。

## 4.4.0-alpha.0

### Minor Changes

- [`ebb1059`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ebb1059ff7c13fec90003e6c018bd229ad3c1db8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构缓存子系统与各 bundler 辅助逻辑：统一在缓存层处理哈希与写入流程，简化 `process` API，同时补充针对新行为的测试覆盖。

- [`d56fca5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d56fca539d7c964b558f0434f069674bc832ed2a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构编译上下文模块，将日志、Tailwind 补丁、模板属性转换、处理器构建拆分为独立单元并补充 100% 覆盖率的单元测试，确保模块化结构更清晰且行为可验证。新增 Lightning CSS 版本的样式处理器，覆盖类名转义、选择器兼容、`:hover` 清理与子选择器替换等关键能力，并提供针对性单测。同步优化工具方法：为文件分组逻辑提供固定分组输出，替换已废弃的 `unescape` Unicode 解码实现，并补充对应的单元测试。

### Patch Changes

- [`8dca274`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8dca274fc94abb7a094a0089ddee9aa0ea9073ca) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 优化 uni-app-x 模板遍历与 class 处理逻辑，抽离更新函数并补充静态/动态 class 的单元测试保障。

- [`ff74426`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff744264e95a1d32f8bcc64de864292ddc8ff432) Thanks [@sonofmagic](https://github.com/sonofmagic)! - - refactor: js ast 的转译处理
  - perf: 缓存 JS 类名替换时的正则与转义结果，避免重复计算
  - perf: WXML Tokenizer 采用字符码判断空白并复用 token 缓存，降低解析开销
  - perf: 自定义属性匹配按标签分类预处理，避免在解析阶段重复遍历与覆写
  - perf: WXML 片段空白检测改为轻量遍历，减少 `trim` 带来的额外字符串分配
  - perf: 提炼空白检测工具，供 Tokenizer 与模板处理器共享，减少重复逻辑

- [`8b20e71`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b20e716da890c9709122f09810c9a9b51a705ae) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: remove @weapp-tailwindcss/init

- Updated dependencies [[`b766f00`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b766f007d65d3383530452c1860907fa3dcfb00e)]:
  - @weapp-tailwindcss/postcss@1.3.2-alpha.0

## 4.3.3

### Patch Changes

- [`a247218`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a24721839b36531bc047b86165ecec1938fe0814) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 升级 `tailwindcss-patch` 把 `@tailwindcss/node` 作为依赖，修复 [Bug]: Cannot find module '@tailwindcss/node'

- [`125d067`](https://github.com/sonofmagic/weapp-tailwindcss/commit/125d0678f701d5279cb1c86236420be9544ac53a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 优化 webpack 插件缓存 key 的计算方式

- Updated dependencies [[`d028fb3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d028fb33297cfac6f2f9c233510f84c7850a8ae9)]:
  - @weapp-tailwindcss/postcss@1.3.1

## 4.3.2

### Patch Changes

- Updated dependencies [[`4ffb90b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4ffb90bc754459d93929d2de3a843d46edc48f53)]:
  - @weapp-tailwindcss/postcss@1.3.0
  - @weapp-tailwindcss/init@1.0.7

## 4.3.1

### Patch Changes

- Updated dependencies [[`d9db976`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d9db9766f428147b01ba4e381549c54083f4fd5a)]:
  - @weapp-tailwindcss/postcss@1.2.2

## 4.3.0

### Minor Changes

- [`a56705e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a56705e28b9d8a9ad00d28a4b23450000d7920ac) Thanks [@sonofmagic](https://github.com/sonofmagic)! - <br/>

  # 计算模式

  feat: 在 `tailwindcss@4` 下默认启用 `计算模式`

  在 `tailwindcss@4` 下，默认启用计算模式。`tailwindcss@3` 默认不启用。

  此模式下会去预编译所有的 `css` 变量和 `calc` 计算表达式。

  这个模式可以解决很多手机机型 `calc` `rpx` 单位的兼容问题

  可通过传入 `cssCalc` 配置项 `false` 来关闭这个功能

  详见: https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions#csscalc

  ## 新增配置项

  feat: 添加 `px2rpx` 配置项， 用于控制是否将 `px` 单位转换为 `rpx` 单位， 默认为 `false`

  传入 `true` 则会将所有的 `px` 单位, `1:1` 转换为 `rpx` 单位

  假如需要更多的转化方式，可以传入一个 `object`, 配置项见 https://www.npmjs.com/package/postcss-pxtransform

  详见: https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions#px2rpx

  ***

  feat: 添加 `logLevel` 配置项，用于控制日志输出级别， 默认为 `info`

### Patch Changes

- Updated dependencies [[`0d76388`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d763881fad85d20a926db89bc29ec9113cfc0b3), [`6e9cbc4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6e9cbc46cc954a02cb45542fbebf10d313fc16ea)]:
  - @weapp-tailwindcss/postcss@1.2.1
  - @weapp-tailwindcss/logger@1.1.0
  - @weapp-tailwindcss/init@1.0.6

## 4.3.0-alpha.0

### Minor Changes

- [`a56705e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a56705e28b9d8a9ad00d28a4b23450000d7920ac) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 在 tailwindcss@4 下默认启用计算模式

### Patch Changes

- Updated dependencies [[`0d76388`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d763881fad85d20a926db89bc29ec9113cfc0b3), [`6e9cbc4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6e9cbc46cc954a02cb45542fbebf10d313fc16ea)]:
  - @weapp-tailwindcss/postcss@1.2.1-alpha.0
  - @weapp-tailwindcss/logger@1.1.0-alpha.0
  - @weapp-tailwindcss/init@1.0.6-alpha.0

## 4.2.9

### Patch Changes

- [`59bdd20`](https://github.com/sonofmagic/weapp-tailwindcss/commit/59bdd205dcfc2d30a097c63d9451d08a3cfb1e73) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 默认开启 cssRemoveProperty, 因为 `@property` 会导致支付宝小程序直接挂掉

- Updated dependencies [[`59bdd20`](https://github.com/sonofmagic/weapp-tailwindcss/commit/59bdd205dcfc2d30a097c63d9451d08a3cfb1e73), [`ce1150c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ce1150cd87f22736e59f17e5d8a7b61a1354d4cd)]:
  - @weapp-tailwindcss/postcss@1.2.0

## 4.2.8

### Patch Changes

- Updated dependencies [[`7a33c9a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7a33c9afc8dfe1c32c76d0598e30753970a57146)]:
  - @weapp-tailwindcss/postcss@1.1.1

## 4.2.7

### Patch Changes

- [`88e4b4d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/88e4b4def9025f50d262df35b8163cbaa73f4b36) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 设置 `cssRemoveProperty` 默认为 `false`

  这是因为在部分小程序的真机，还有微信开发者工具中 `@property` 已经生效

- [`88a1d3d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/88a1d3d4b2ede7b62801fde85186afbbd620f7f4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 跳过不正确的 `sourcemap` 处理覆盖

## 4.2.6

### Patch Changes

- [`a8857e6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a8857e6e8cf196c273e5e56e5745e2de97cd308a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 依赖更新

- [`39e8e57`](https://github.com/sonofmagic/weapp-tailwindcss/commit/39e8e57cf8d54a0f1662b016a7cdb260326985f6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加 cssEntries 作为 tailwindcss@4 的入口 css 的位置

- [`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 对 postcss-html-transform 进行二次封装

- Updated dependencies [[`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3), [`a5d198f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a5d198ff0e8af52f218df98f3ce76a5dbfd8c691)]:
  - @weapp-tailwindcss/postcss@1.1.0
  - @weapp-tailwindcss/init@1.0.5

## 4.2.6-alpha.2

### Patch Changes

- Updated dependencies [[`a5d198f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a5d198ff0e8af52f218df98f3ce76a5dbfd8c691)]:
  - @weapp-tailwindcss/postcss@1.1.0-alpha.1

## 4.2.6-alpha.1

### Patch Changes

- [`a8857e6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a8857e6e8cf196c273e5e56e5745e2de97cd308a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 依赖更新

## 4.2.6-alpha.0

### Patch Changes

- [`39e8e57`](https://github.com/sonofmagic/weapp-tailwindcss/commit/39e8e57cf8d54a0f1662b016a7cdb260326985f6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加 cssEntries 作为 tailwindcss@4 的入口 css 的位置

- [`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 对 postcss-html-transform 进行二次封装

- Updated dependencies [[`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3)]:
  - @weapp-tailwindcss/postcss@1.0.22-alpha.0
  - @weapp-tailwindcss/init@1.0.5-alpha.0

## 4.2.5

### Patch Changes

- [`c7892d6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c7892d699d798abe27c63d1345423a5ac147cc76) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 优化 css 生成

- Updated dependencies [[`c7892d6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c7892d699d798abe27c63d1345423a5ac147cc76)]:
  - @weapp-tailwindcss/postcss@1.0.21
  - @weapp-tailwindcss/init@1.0.4

## 4.2.4

### Patch Changes

- Updated dependencies [[`6cae2c1`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6cae2c1471bfb7fdc182815ba95b566ad6f51dfa)]:
  - @weapp-tailwindcss/postcss@1.0.20

## 4.2.3

### Patch Changes

- [`f0d225e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f0d225e95eb3c8e0c97af4abf9c32b4abb57cd72) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 修复 uvue lang 设置为 uts 的解析问题

## 4.2.2

### Patch Changes

- [`e17ca06`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e17ca06eb46c5c877dc328ee3937705f8f86ab71) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持鸿蒙系统

- [`8e4f8ad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8e4f8ad3a5e7e5ba4fa4b0ef7d365e412d1d881e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css sourcemap

- [`57527cf`](https://github.com/sonofmagic/weapp-tailwindcss/commit/57527cfb93f997fc6de4a168a8dfca70f1c94d0c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 添加 UNI_PLATFORM harmony 的判断

- Updated dependencies [[`8e4f8ad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8e4f8ad3a5e7e5ba4fa4b0ef7d365e412d1d881e)]:
  - @weapp-tailwindcss/postcss@1.0.19

## 4.2.2-alpha.2

### Patch Changes

- [`8e4f8ad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8e4f8ad3a5e7e5ba4fa4b0ef7d365e412d1d881e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css sourcemap

- Updated dependencies [[`8e4f8ad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8e4f8ad3a5e7e5ba4fa4b0ef7d365e412d1d881e)]:
  - @weapp-tailwindcss/postcss@1.0.19-alpha.0

## 4.2.2-alpha.1

### Patch Changes

- [`57527cf`](https://github.com/sonofmagic/weapp-tailwindcss/commit/57527cfb93f997fc6de4a168a8dfca70f1c94d0c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 添加 UNI_PLATFORM harmony 的判断

## 4.2.2-alpha.0

### Patch Changes

- [`e17ca06`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e17ca06eb46c5c877dc328ee3937705f8f86ab71) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持鸿蒙系统

## 4.2.1

### Patch Changes

- [`d5c892c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d5c892c66046b81ae22b1e37b5d59f4a549d61c9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: uni-app x sourcemap

- [`05d9725`](https://github.com/sonofmagic/weapp-tailwindcss/commit/05d9725fa83496e72ce5386230a344ac30aa41fa) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: uni-app x ios build

- [`7927bf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7927bf25cfac2f8df90e91eaa2379ba45079499b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css always generate map for uni-app x

- [`1c81e7b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1c81e7b21747494c61bae264fe4da7a9c2344435) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: add uni-app x css sourcemap

- Updated dependencies [[`7927bf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7927bf25cfac2f8df90e91eaa2379ba45079499b)]:
  - @weapp-tailwindcss/postcss@1.0.18

## 4.2.1-alpha.3

### Patch Changes

- [`7927bf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7927bf25cfac2f8df90e91eaa2379ba45079499b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css always generate map for uni-app x

- Updated dependencies [[`7927bf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7927bf25cfac2f8df90e91eaa2379ba45079499b)]:
  - @weapp-tailwindcss/postcss@1.0.18-alpha.0

## 4.2.1-alpha.2

### Patch Changes

- [`1c81e7b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1c81e7b21747494c61bae264fe4da7a9c2344435) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: add uni-app x css sourcemap

## 4.2.1-alpha.1

### Patch Changes

- [`d5c892c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d5c892c66046b81ae22b1e37b5d59f4a549d61c9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: uni-app x sourcemap

## 4.2.1-alpha.0

### Patch Changes

- [`05d9725`](https://github.com/sonofmagic/weapp-tailwindcss/commit/05d9725fa83496e72ce5386230a344ac30aa41fa) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: uni-app x ios build

## 4.2.0

### Minor Changes

- [`c001984`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c001984ca82324f71353d8419f13e50c0e89f0e3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持 uni-app-x 构建 app 原生的方式

### Patch Changes

- [`77c0a47`](https://github.com/sonofmagic/weapp-tailwindcss/commit/77c0a4743c778ad6bf8a1d046c9966a3e016c1b6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade tailwindcss-patch

- [`3248d34`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3248d342d07372e0627e21dcdd528ad44d2b52be) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 支持 `index.uvue?type=page` 路径的兼容匹配

- [`0d8d68a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d8d68ad70b9c308ba5c3aa42db5d543246ee1c5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: pkg resolve issue

- Updated dependencies [[`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1)]:
  - @weapp-tailwindcss/init@1.0.3
  - @weapp-tailwindcss/logger@1.0.2
  - @weapp-tailwindcss/mangle@1.0.5
  - @weapp-tailwindcss/postcss@1.0.17
  - @weapp-tailwindcss/shared@1.0.3

## 4.2.0-alpha.4

### Patch Changes

- [`77c0a47`](https://github.com/sonofmagic/weapp-tailwindcss/commit/77c0a4743c778ad6bf8a1d046c9966a3e016c1b6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade tailwindcss-patch

## 4.2.0-alpha.3

### Patch Changes

- [`3248d34`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3248d342d07372e0627e21dcdd528ad44d2b52be) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 支持 `index.uvue?type=page` 路径的兼容匹配

## 4.2.0-alpha.2

### Patch Changes

- Updated dependencies [[`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1)]:
  - @weapp-tailwindcss/init@1.0.3-alpha.0
  - @weapp-tailwindcss/logger@1.0.2-alpha.0
  - @weapp-tailwindcss/mangle@1.0.5-alpha.0
  - @weapp-tailwindcss/postcss@1.0.17-alpha.0
  - @weapp-tailwindcss/shared@1.0.3-alpha.0

## 4.2.0-alpha.1

### Patch Changes

- [`0d8d68a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d8d68ad70b9c308ba5c3aa42db5d543246ee1c5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: pkg resolve issue

## 4.2.0-alpha.0

### Minor Changes

- [`c001984`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c001984ca82324f71353d8419f13e50c0e89f0e3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持 uni-app-x 构建 app 原生的方式

## 4.1.11

### Patch Changes

- Updated dependencies [[`f2c69d5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f2c69d5bd8e1dc3d39eced8ff62b75e0c4ef3591)]:
  - @weapp-tailwindcss/postcss@1.0.16

## 4.1.10

### Patch Changes

- [`2b0a754`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2b0a75493506d219d1b49474f3ce684d107fcbd1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: [#655](https://github.com/sonofmagic/weapp-tailwindcss/issues/655) 默认自动去除 `@layer` 在 `postcss-env-preset` 处理之前

- Updated dependencies [[`2b0a754`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2b0a75493506d219d1b49474f3ce684d107fcbd1)]:
  - @weapp-tailwindcss/postcss@1.0.15

## 4.1.9

### Patch Changes

- [`b090e69`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b090e699d279bfba680ecf208772500ea3689122) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 同步 uni-app 和 uni-app-vite 的配置

- Updated dependencies [[`bf7e53c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bf7e53cfcd69c49c5cd99f7bf21ad0999a31b1d6)]:
  - @weapp-tailwindcss/postcss@1.0.14

## 4.1.8

### Patch Changes

- [`5d89878`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5d89878854e1b707ed4afafffee096ec19976bae) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: default remove postcss-html-transform

- [`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add postcss-html-transform plugin

- [`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: injectAdditionalCssVarScope for tailwindcss@4

- Updated dependencies [[`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22), [`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df)]:
  - @weapp-tailwindcss/postcss@1.0.13

## 4.1.8-beta.2

### Patch Changes

- [`5d89878`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5d89878854e1b707ed4afafffee096ec19976bae) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: default remove postcss-html-transform

## 4.1.8-beta.1

### Patch Changes

- [`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add postcss-html-transform plugin

- Updated dependencies [[`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22)]:
  - @weapp-tailwindcss/postcss@1.0.13-beta.1

## 4.1.8-beta.0

### Patch Changes

- [`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: injectAdditionalCssVarScope for tailwindcss@4

- Updated dependencies [[`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df)]:
  - @weapp-tailwindcss/postcss@1.0.13-beta.0

## 4.1.7

### Patch Changes

- Updated dependencies [[`5d27de5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5d27de5a509da6984e77036da8a176e0570ba5c1)]:
  - @weapp-tailwindcss/postcss@1.0.12

## 4.1.6

### Patch Changes

- [`23d35ac`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23d35aceddb9924d60a7afc5459f518b2e356f30) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: taro vue3 的上下文获取

## 4.1.6-alpha.0

### Patch Changes

- [`23d35ac`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23d35aceddb9924d60a7afc5459f518b2e356f30) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: taro vue3 的上下文获取

## 4.1.5

### Patch Changes

- [`3cecfdc`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3cecfdccfcdfacd262fee571b0209e095b33838e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 移除带有 `@supports` `color-mix` 的 css 节点, 修复
  - [#632](https://github.com/sonofmagic/weapp-tailwindcss/issues/632)
  - [#631](https://github.com/sonofmagic/weapp-tailwindcss/issues/631)

  > 但是这种行为会导致使用透明度 + css 变量的时候，被回滚到固定的颜色值，因为微信小程序不支持 `color-mix`，同时 `tailwindcss` 依赖 `color-mix` + `css var` 来进行颜色变量的计算。

- Updated dependencies [[`3cecfdc`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3cecfdccfcdfacd262fee571b0209e095b33838e)]:
  - @weapp-tailwindcss/postcss@1.0.11

## 4.1.4

### Patch Changes

- [`10aebb1`](https://github.com/sonofmagic/weapp-tailwindcss/commit/10aebb1a5ed73bac76c1370e44ea93cd820ed60c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add minify css

- [`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support `tailwindcss@4.1.2`

- [`899226d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/899226d71c5fd022e0f374192766a5ed4e9fa5d4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: build resolved css

- [`865d8c2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/865d8c2a1bcb56765cf06d9a918c88e16051f17c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: minify exports css

- Updated dependencies [[`8b45542`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b4554295e9671fd740fa18a9f9a25a17613597b), [`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d), [`0d6564a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d6564aaaea588289dac5b1b784b1902105b297a), [`23c08c7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23c08c7d7ad276035ffa3ef78d0fb00e1c717ddf)]:
  - @weapp-tailwindcss/postcss@1.0.10

## 4.1.4-alpha.5

### Patch Changes

- [`865d8c2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/865d8c2a1bcb56765cf06d9a918c88e16051f17c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: minify exports css

## 4.1.4-alpha.4

### Patch Changes

- Updated dependencies [[`8b45542`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b4554295e9671fd740fa18a9f9a25a17613597b)]:
  - @weapp-tailwindcss/postcss@1.0.10-alpha.3

## 4.1.4-alpha.3

### Patch Changes

- [`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support `tailwindcss@4.1.2`

- Updated dependencies [[`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d)]:
  - @weapp-tailwindcss/postcss@1.0.10-alpha.2

## 4.1.4-alpha.2

### Patch Changes

- Updated dependencies [[`23c08c7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23c08c7d7ad276035ffa3ef78d0fb00e1c717ddf)]:
  - @weapp-tailwindcss/postcss@1.0.10-alpha.1

## 4.1.4-alpha.1

### Patch Changes

- Updated dependencies [[`0d6564a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d6564aaaea588289dac5b1b784b1902105b297a)]:
  - @weapp-tailwindcss/postcss@1.0.10-alpha.0

## 4.1.4-alpha.0

### Patch Changes

- [`10aebb1`](https://github.com/sonofmagic/weapp-tailwindcss/commit/10aebb1a5ed73bac76c1370e44ea93cd820ed60c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add minify css

- [`899226d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/899226d71c5fd022e0f374192766a5ed4e9fa5d4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: build resolved css

## 4.1.3

### Patch Changes

- [`3113053`](https://github.com/sonofmagic/weapp-tailwindcss/commit/31130538a13098e2a1d29bbd331dc67a195689cf) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Fix: Support `Tailwindcss@4.1.1` and fix [#619](https://github.com/sonofmagic/weapp-tailwindcss/issues/619)

- Updated dependencies [[`3113053`](https://github.com/sonofmagic/weapp-tailwindcss/commit/31130538a13098e2a1d29bbd331dc67a195689cf)]:
  - @weapp-tailwindcss/postcss@1.0.9
  - @weapp-tailwindcss/mangle@1.0.4

## 4.1.2

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

- [`0b0bc70`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0b0bc70f4773f2225eb48d9956cbe63d0858ca48) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 修复在 tailwindcss@4 中由于 @layer 导致选择器优先级升高,高于就近编写的样式的问题

  更改 `weapp-tailwindcss/index.css` 的默认行为，以后小程序默认引入 `weapp-tailwindcss` 就不会产生 `@layer` ，假如开发者在小程序中使用 `@layer` 会导致当前文件的样式层级整体提升 `(n,0,0)`

  添加 `weapp-tailwindcss/with-layer.css` 用来和 `tailwindcss@4` 保持一致

- Updated dependencies [[`e8c4534`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e8c4534ab588eae1115dac15b529b7a122141316)]:
  - @weapp-tailwindcss/postcss@1.0.8

## 4.1.1

### Patch Changes

- [`b6de60f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b6de60f2bb7eb752435e9f9ca2f074276f9d0467) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: webpack4 插件编译错误问题

## 4.1.0

### Minor Changes

- [`3cc8835`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3cc88359d6ff68f7234b9316b9df554d188474df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support js ast cache

### Patch Changes

- [`d52a324`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d52a32406ff3945c5b0a11cc0131baf6b99aee5a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: improve NodePathWalker

- [`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- [`a6ebf16`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a6ebf16d67a23c8c919f2742d836bd50976171a7) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: NodePathWalker walkNode impl

- Updated dependencies [[`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9)]:
  - @weapp-tailwindcss/init@1.0.2
  - @weapp-tailwindcss/logger@1.0.1
  - @weapp-tailwindcss/mangle@1.0.3
  - @weapp-tailwindcss/postcss@1.0.7
  - @weapp-tailwindcss/shared@1.0.2

## 4.1.0-alpha.3

### Patch Changes

- [`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9)]:
  - @weapp-tailwindcss/init@1.0.2-alpha.0
  - @weapp-tailwindcss/logger@1.0.1-alpha.0
  - @weapp-tailwindcss/mangle@1.0.3-alpha.0
  - @weapp-tailwindcss/postcss@1.0.7-alpha.0
  - @weapp-tailwindcss/shared@1.0.2-alpha.0

## 4.1.0-alpha.2

### Patch Changes

- [`a6ebf16`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a6ebf16d67a23c8c919f2742d836bd50976171a7) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: NodePathWalker walkNode impl

## 4.1.0-alpha.1

### Patch Changes

- [`d52a324`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d52a32406ff3945c5b0a11cc0131baf6b99aee5a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: improve NodePathWalker

## 4.1.0-alpha.0

### Minor Changes

- [`3cc8835`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3cc88359d6ff68f7234b9316b9df554d188474df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support js ast cache

## 4.0.11

### Patch Changes

- [`ffa5bb0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ffa5bb0b5d349e5985aec36996a43bbbe9f0eae0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: node walk improve

- Updated dependencies [[`ff9933a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff9933ad06de7bf3333c1c63016920639a56b87a)]:
  - @weapp-tailwindcss/postcss@1.0.6

## 4.0.10

### Patch Changes

- [`5618019`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5618019c36bfabdef0cd4512f779127b83273db9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 添加 TailwindcssPatcherOptions 给更高程度的自定义策略

## 4.0.9

### Patch Changes

- [`a6765b3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a6765b38addd14eaa346a76069cc7c7ba2143a8e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: upgrade to tailwindcss-patch and support rpx unit

## 4.0.8

### Patch Changes

- [`a4532ab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a4532ab34de62556e57ed350e15ca14e602b7f93) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 使用space-y-2后编译报错 #595

- Updated dependencies [[`a4532ab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a4532ab34de62556e57ed350e15ca14e602b7f93)]:
  - @weapp-tailwindcss/postcss@1.0.5

## 4.0.7

### Patch Changes

- Updated dependencies [[`9e65534`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9e65534f035ee4e17a2dc0b891278cacb92d5a0b)]:
  - @weapp-tailwindcss/postcss@1.0.4

## 4.0.6

### Patch Changes

- [`d856f81`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d856f81dbe1de4e67feba4f8e76d0a5275e007f1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - perf: add patcher default filter

## 4.0.6-alpha.0

### Patch Changes

- [`d856f81`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d856f81dbe1de4e67feba4f8e76d0a5275e007f1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - perf: add patcher default filter

## 4.0.5

### Patch Changes

- [`11bae23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/11bae23fd3de7332fd06a980b6a418f4795f6bc9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump deps

- Updated dependencies [[`11bae23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/11bae23fd3de7332fd06a980b6a418f4795f6bc9)]:
  - @weapp-tailwindcss/mangle@1.0.2
  - @weapp-tailwindcss/postcss@1.0.3

## 4.0.4

### Patch Changes

- [`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 去除 ast-grep 支持，添加字符串字面量和模板字符串作用域扫描功能

- Updated dependencies [[`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61)]:
  - @weapp-tailwindcss/shared@1.0.1
  - @weapp-tailwindcss/init@1.0.1
  - @weapp-tailwindcss/mangle@1.0.1
  - @weapp-tailwindcss/postcss@1.0.3

## 4.0.4-alpha.0

### Patch Changes

- [`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 去除 ast-grep 支持，添加字符串字面量和模板字符串作用域扫描功能

- Updated dependencies [[`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61)]:
  - @weapp-tailwindcss/shared@1.0.1-alpha.0
  - @weapp-tailwindcss/init@1.0.1-alpha.0
  - @weapp-tailwindcss/mangle@1.0.1-alpha.0
  - @weapp-tailwindcss/postcss@1.0.3-alpha.0

## 4.0.3

### Patch Changes

- [`5b4f9cd`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5b4f9cdcfc3a6b0d5e9fdf8eb6e7ac27f3cb1cc9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- [`ffbf93d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ffbf93d0897a0921f8085c2c14621d706e92989a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: release

- [`c647204`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c6472045bcdbbaa84c85be642c1f42ab53b11486) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- [`6a2f78d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6a2f78d72d795d578cdcb1876310eef57fe463ca) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: get class set error

## 4.0.3-alpha.3

### Patch Changes

- [`c647204`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c6472045bcdbbaa84c85be642c1f42ab53b11486) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

## 4.0.3-alpha.2

### Patch Changes

- [`5b4f9cd`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5b4f9cdcfc3a6b0d5e9fdf8eb6e7ac27f3cb1cc9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

## 4.0.3-alpha.1

### Patch Changes

- [`ffbf93d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ffbf93d0897a0921f8085c2c14621d706e92989a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: release

## 4.0.3-alpha.0

### Patch Changes

- [`6a2f78d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6a2f78d72d795d578cdcb1876310eef57fe463ca) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: get class set error

## 4.0.2

### Patch Changes

- [`64c0189`](https://github.com/sonofmagic/weapp-tailwindcss/commit/64c018935732481ebe2f366e4136b4d3574dde57) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: improve `isAllowedClassName` preflight

- [`13b72d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/13b72d8fbd3aad6fb49a772fd09c36c70e5eda56) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add `resolve` option

- Updated dependencies [[`64c0189`](https://github.com/sonofmagic/weapp-tailwindcss/commit/64c018935732481ebe2f366e4136b4d3574dde57)]:
  - @weapp-tailwindcss/postcss@1.0.2

## 4.0.1

### Patch Changes

- [`41d7049`](https://github.com/sonofmagic/weapp-tailwindcss/commit/41d7049654f7d1fa1c52b3ae845e30e5fa994880) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: upgrade tailwindcss patch and set tailwindcss options

- Updated dependencies [[`ee34fb3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ee34fb34688a2bd11018ce5e4ea6d07a062b0b55)]:
  - @weapp-tailwindcss/postcss@1.0.1

## 4.0.0

### Major Changes

- [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875) Thanks [@sonofmagic](https://github.com/sonofmagic)! - ## Feature

  增加 `@weapp-tailwindcss/merge` 支持，这是 `weapp-tailwindcss` 版本的 `tailwindcss-merge` 和 `cva` 方法

  ## Breaking Changes
  1. 去除 `weapp-tailwindcss/postcss` (可直接安装使用 `@weapp-tailwindcss/postcss`)
  2. 增加 `weapp-tailwindcss/escape` 来取代 `weapp-tailwindcss/replace`
  3. 项目 monorepo 区分包

### Minor Changes

- [`de0e4d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/de0e4d8f38477e806df74b24926d280319ac8419) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add `ignoreTaggedTemplateExpressionIdentifiers` and `ignoreCallExpressionIdentifiers` options

### Patch Changes

- [`3da8643`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3da864338de73a304346fd47b4a91fa18d9f3163) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: loaderUtils.getOptions

- [`43f7ab8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/43f7ab82b047a067bf7d37d88ed861be7b0609d4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - refactor: remove @babel/generator

- [`21dc7a0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/21dc7a079c02e011961a0c9375d096432ee44768) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add @weapp-tailwindcss/merge as default ignoreCallExpressionIdentifiers options dep

- [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename export function

- [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change postcssPresetEnv default value

- [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- [`06921c8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/06921c86fc10f4649818e4dafb2597114cb4204c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 更改 cssChildCombinatorReplaceValue 默认值从 ['view'] -> ['view', 'text'] 为了更好的小程序开发体验

- Updated dependencies [[`d4bfcc7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d4bfcc7a25776eb9869bd934c05e3b49a3f4cc8b), [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875), [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d), [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b), [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68), [`1df699b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1df699bf82d66847cbc64cc8f294ef237e0470c5), [`6d20f1f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6d20f1f9a799cf350dcbbd861907f0ff70a68dfd), [`de0e4d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/de0e4d8f38477e806df74b24926d280319ac8419), [`d50d95d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d50d95d04e1c6b7c3ff32acc0d9894d3c0f06d22), [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8)]:
  - @weapp-tailwindcss/postcss@1.0.0
  - @weapp-tailwindcss/init@1.0.0
  - @weapp-tailwindcss/logger@1.0.0
  - @weapp-tailwindcss/mangle@1.0.0
  - @weapp-tailwindcss/shared@1.0.0

## 4.0.0-alpha.13

### Patch Changes

- [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change postcssPresetEnv default value

- Updated dependencies [[`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68)]:
  - @weapp-tailwindcss/postcss@1.0.0-alpha.8

## 4.0.0-alpha.12

### Patch Changes

- Updated dependencies [[`d4bfcc7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d4bfcc7a25776eb9869bd934c05e3b49a3f4cc8b)]:
  - @weapp-tailwindcss/postcss@1.0.0-alpha.7

## 4.0.0-alpha.11

### Patch Changes

- [`3da8643`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3da864338de73a304346fd47b4a91fa18d9f3163) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: loaderUtils.getOptions

## 4.0.0-alpha.10

### Patch Changes

- [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- Updated dependencies [[`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8)]:
  - @weapp-tailwindcss/init@1.0.0-alpha.5
  - @weapp-tailwindcss/logger@1.0.0-alpha.3
  - @weapp-tailwindcss/mangle@1.0.0-alpha.5
  - @weapp-tailwindcss/postcss@1.0.0-alpha.6
  - @weapp-tailwindcss/shared@1.0.0-alpha.4

## 4.0.0-alpha.9

### Patch Changes

- Updated dependencies [[`6d20f1f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6d20f1f9a799cf350dcbbd861907f0ff70a68dfd)]:
  - @weapp-tailwindcss/postcss@1.0.0-alpha.5

## 4.0.0-alpha.8

### Patch Changes

- [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename export function

- Updated dependencies [[`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b)]:
  - @weapp-tailwindcss/init@1.0.0-alpha.4
  - @weapp-tailwindcss/logger@1.0.0-alpha.2
  - @weapp-tailwindcss/mangle@1.0.0-alpha.4
  - @weapp-tailwindcss/postcss@1.0.0-alpha.4
  - @weapp-tailwindcss/shared@1.0.0-alpha.3

## 4.0.0-alpha.7

### Patch Changes

- [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d)]:
  - @weapp-tailwindcss/postcss@1.0.0-alpha.3
  - @weapp-tailwindcss/mangle@1.0.0-alpha.3
  - @weapp-tailwindcss/shared@1.0.0-alpha.2
  - @weapp-tailwindcss/init@1.0.0-alpha.3
  - @weapp-tailwindcss/logger@1.0.0-alpha.1

## 4.0.0-alpha.6

### Patch Changes

- [`06921c8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/06921c86fc10f4649818e4dafb2597114cb4204c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 更改 cssChildCombinatorReplaceValue 默认值从 ['view'] -> ['view', 'text'] 为了更好的小程序开发体验

## 4.0.0-alpha.5

### Patch Changes

- [`43f7ab8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/43f7ab82b047a067bf7d37d88ed861be7b0609d4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - refactor: remove @babel/generator

## 4.0.0-alpha.4

### Patch Changes

- Updated dependencies [[`1df699b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1df699bf82d66847cbc64cc8f294ef237e0470c5)]:
  - @weapp-tailwindcss/postcss@1.0.0-alpha.2
  - @weapp-tailwindcss/mangle@1.0.0-alpha.2

## 4.0.0-alpha.3

### Major Changes

- [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: monorepo changes

### Patch Changes

- Updated dependencies [[`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875)]:
  - @weapp-tailwindcss/init@1.0.0-alpha.2
  - @weapp-tailwindcss/logger@1.0.0-alpha.0
  - @weapp-tailwindcss/mangle@1.0.0-alpha.1
  - @weapp-tailwindcss/postcss@1.0.0-alpha.1
  - @weapp-tailwindcss/shared@1.0.0-alpha.1

## 3.8.0-alpha.2

### Patch Changes

- Updated dependencies [[`d50d95d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d50d95d04e1c6b7c3ff32acc0d9894d3c0f06d22)]:
  - @weapp-tailwindcss/shared@0.0.1-alpha.0
  - @weapp-tailwindcss/init@0.0.1-alpha.1
  - @weapp-tailwindcss/mangle@0.0.1-alpha.0
  - @weapp-tailwindcss/postcss@0.0.1-alpha.0

## 3.8.0-alpha.1

### Patch Changes

- [`21dc7a0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/21dc7a079c02e011961a0c9375d096432ee44768) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add @weapp-tailwindcss/merge as default ignoreCallExpressionIdentifiers options dep

## 3.8.0-alpha.0

### Minor Changes

- [`de0e4d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/de0e4d8f38477e806df74b24926d280319ac8419) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add `ignoreTaggedTemplateExpressionIdentifiers` and `ignoreCallExpressionIdentifiers` options

### Patch Changes

- Updated dependencies [[`de0e4d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/de0e4d8f38477e806df74b24926d280319ac8419)]:
  - @weapp-tailwindcss/init@0.0.1-alpha.0

## 3.7.0

### Minor Changes

- [`9e3891e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9e3891ec6b18519b75d850d9637f2ea57e3bab91) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: upgrade to tailwindcss-patch@5.x

### Patch Changes

- [`1c37dab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1c37dab354da866565ee843419e3fdbef187630e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- [`b55f4d7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b55f4d75962031d26f665f60106ea2ed52e162bb) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持使用 weappTwIgnore 在js中标识无需转译的字面量

## 3.7.0-alpha.2

### Patch Changes

- [`b55f4d7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b55f4d75962031d26f665f60106ea2ed52e162bb) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持使用 weappTwIgnore 在js中标识无需转译的字面量

## 3.7.0-alpha.1

### Patch Changes

- [`1c37dab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1c37dab354da866565ee843419e3fdbef187630e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 3.7.0-alpha.0

### Minor Changes

- [`9e3891e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9e3891ec6b18519b75d850d9637f2ea57e3bab91) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: upgrade to tailwindcss-patch@5.x

## 3.6.2

### Patch Changes

- [`8423d35`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8423d35c775c250730fc84b869cabe2525a01178) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: [Bug]: 将tailwind.config中的important选项设置为一个class选择器时，编译到微信小程序后wxss会报编译错误 #473

## 3.6.1

### Patch Changes

- [#471](https://github.com/sonofmagic/weapp-tailwindcss/pull/471) [`b60fe7f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b60fe7f338df7db87ab1c8fb705f1659d9df6afd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: [#470](https://github.com/sonofmagic/weapp-tailwindcss/issues/470)

## 3.6.0

### Minor Changes

- [`0955492`](https://github.com/sonofmagic/weapp-tailwindcss/commit/095549299cefce15559578f28a6b1624b43fb1c9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - <br/>
  - feat: 升级依赖项，去除了 `nodejs@16` 的支持，需求的 `nodejs` 版本，升级到了 `^18.17.0 || >=20.5.0`
  - feat: 从 `weapp-tailwindcss@3.6.0` 版本开始移除 `@weapp-tailwindcss/cli` ，原先 `@weapp-tailwindcss/cli` 的项目，可以几乎 **0成本** 的迁移到 `weapp-vite`

## 3.5.3

### Patch Changes

- [`fef8375`](https://github.com/sonofmagic/weapp-tailwindcss/commit/fef8375ab825842b3beb5d30170891eb400da79d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加小红书 `xhsml` 支持
  feat: 添加 `weapp-tw init` 一键式初始化脚本

## 3.5.1

### Patch Changes

- [`9890f09`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9890f09a990682e10aabab7b8dc685a58d977fca) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Date: 2024-09-01
  - 重构 `wxml` 模板替换相关的实现

## 3.4.1-alpha.0

### Patch Changes

- 792f50c: chore: compact for `weapp-vite`
