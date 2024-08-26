# 旧有 uni-app 项目升级 webpack5 指南

:::caution
目前 `uni-app` 默认创建的 `vue2` 项目，已经全面使用 `@vue/cli-service@5` 了（2023-10），所以目前正常升级即可，本指南废弃! 留作归档处理。

使用 `uni-app` `vite` `vue3` 的开发者可以忽略此指南
:::

由于目前 `uni-app` `hbuilderx`和`cli`默认创建的 `vue2` 项目，还是使用的 `@vue/cli-service@4`

为了使用更先进更有生产力的 `webpack5` 和 `postcss8` 我们必须要升级到 `@vue/cli-service@5`

那么旧有的老项目应该如何升级呢？

### 1. 升级 `@dcloudio/*` 相关的包

在项目根目录，执行：

```bash
npx @dcloudio/uvm alpha
```

然后选择 `y` 后，出现提示，选择你项目使用的包管理器，运行即可。

此时你所有的 `@dcloudio/*` 相关的包，被升级到了 `2.0.2-alpha-xxxxxxxxxxxx` 的版本。

### 2. 升级 `@vue/cli-*` 相关的包

使用你的包管理器，升级 `@vue/*`、`@vue/cli-*` 相关的包到 `5.x` 版本。

```json
{
  "@vue/babel-preset-app": "^5.0.8",
  "@vue/cli-plugin-babel": "~5.0.8",
  "@vue/cli-plugin-typescript": "5.0.8",
  "@vue/cli-service": "~5.0.8"
}
```

### 3. 升级你所有的 `webpack`、`plugin` 和 `loader` 包

由于你使用了最新版本的 `webpack` 你可以把那些相关的包，升级到最新的版本。

例如 `sass-loader`, `copy-webpack-plugin` 等等，而且由于你使用了 `5.x` 版本的 `@vue/cli`，里面默认依赖了 `postcss8`。

所以你也按需应该升级一下你所依赖的 `postcss` 插件版本。

### 4. 配置文件升级

例如 `babel.config.js` 这个就需要修改，[参考代码](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app-webpack5/babel.config.js)。

例如 `postcss.config.js` 这个，也需要更新一下，[参考代码](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app-webpack5/postcss.config.js)。

诸如这种类似的，都可以新创建一个的 `uni-app alpha` 的项目，然后把里面的配置直接复制过来，再改改 `postcss.config.js` 把 `tailwindcss` 注册进去即可。

### 5. 运行排错

接下来就是，删掉你的 `lock` 文件，重新安装所有包，并运行你的项目！

当然运行时，很有可能报各种各样的错误: 例如 `babel-xxx` 插件找不到，这种安装即可。

或者什么 `webpack` 插件报错，这种可以暂时去除看看能不能打包成功。

:::tip
假如你使用了 `uni-app` 的同时使用了云函数，云函数导致编译到微信出现 `TypeError: I18n is not a constructor`

- 解决方案参见：[云函数导致编译到微信出现 TypeError](https://ask.dcloud.net.cn/question/170057)
- 相关 issue：[#74](https://github.com/sonofmagic/weapp-tailwindcss/issues/74#issuecomment-1573033475)
:::
