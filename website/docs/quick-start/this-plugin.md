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

然后就是注册这个插件，进各个不同的框架了。
