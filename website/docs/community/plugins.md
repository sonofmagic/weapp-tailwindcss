# 适配的 `tailwindcss` 插件

虽然，相当一部分 `tailwindcss` 插件，都可以直接在 `weapp-tailwindcss` 里使用了。

但是小程序中 `wxss` 这种 `css` 子集，是原生不支持许多 `css` 的写法和选择器的，所以免不了在使用某些插件的时候会报错。

比如 `tailwindcss/typography`, `daisyui` 等等。

所以很多时候开发它们的迁移/阉割版本是不可避免。

比如 `tailwindcss/typography` 的小程序适配版本就是 `@weapp-tailwindcss/typography`

而 [`IceStack`](https://ui.icebreaker.top/zh-CN/docs/usage) 内部也包含了 `daisyui` 的微信小程序适配。
