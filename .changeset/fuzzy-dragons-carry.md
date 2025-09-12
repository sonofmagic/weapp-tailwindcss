---
"weapp-tailwindcss": minor
---

<br/>



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

---

feat: 添加 `logLevel` 配置项，用于控制日志输出级别， 默认为 `info`