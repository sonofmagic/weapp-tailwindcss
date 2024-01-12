# 2. 安装这个插件

在项目目录下，执行:

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

:::tip
执行 `weapp-tw patch` 主要是做2件事情，一个是给当前你本地的 `tailwindcss` 打上支持 `rpx` 的补丁，另外一个是用来暴露 `tailwindcss` 运行上下文给 `webpack`/`vite`/`glup` 插件。

而添加上面一段 `npm scripts` 的用途是，利用 `npm hook`, 每次安装包后，都会自动执行一遍 `weapp-tw patch` 这个脚本。

这样即使 `tailwindcss` 更新了版本导致了补丁失效，也会在重新下载后，第一时间被打上。
:::

我们已经完成了这些步骤了，最后就是注册这个插件，到各个不同的框架里去，马上就好！
