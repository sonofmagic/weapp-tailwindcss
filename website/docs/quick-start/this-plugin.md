# 安装这个插件

```sh
# npm / yarn /pnpm
npm i -D weapp-tailwindcss-webpack-plugin
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
