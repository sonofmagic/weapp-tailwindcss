# 安装这个插件

:::tip
自从 `2.3.3` 版本开始，我发布了一个额外的包叫 [`weapp-tailwindcss`](https://www.npmjs.com/package/weapp-tailwindcss),它和 [`weapp-tailwindcss-webpack-plugin`](https://www.npmjs.com/package/weapp-tailwindcss-webpack-plugin) 代码版本完全一致，且保持发布版本的同步。以后可以都去安装那个包(当然安装现在这个包也行)。为什么要这么做的原因，主要是因为 `weapp-tailwindcss-webpack-plugin` 这个名字，已经不适合现在这种，多插件并存的状态了，为了以后的发展改个名字。
:::

```bash
# npm / yarn /pnpm
npm i -D weapp-tailwindcss
# 可以执行一下 patch 方法
npx weapp-tw patch
```

然后把下列脚本，添加进你的 `package.json` 的 `scripts` 字段里:

```json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

添加这段的用途是，每次安装包后，都会自动执行一遍 `weapp-tw patch` 这个脚本。

我们已经完成了这些步骤了，最后就是注册这个插件，进各个不同的框架，马上就好！
