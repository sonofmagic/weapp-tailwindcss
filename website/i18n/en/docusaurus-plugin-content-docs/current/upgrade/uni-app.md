---
title: Guide to upgrading old uni-app projects to webpack5
description: Because the vue2 project currently created by uni-app hbuilderx and cli by default still uses @vue/cli-service@4
keywords:
  - Guide to upgrading old uni-app projects to webpack5
  - upgrade
  - uni app
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# Guide to upgrading old uni-app projects to webpack5

:::caution
At present, the `uni-app` project created by `vue2` by default has been fully used by `@vue/cli-service@5` (2023-10), so it can be upgraded normally. This guide is abandoned! It is reserved for archiving.

The classic `uni-app vue2/webpack` demo in the repository has also been removed. Developers using `uni-app vite vue3` can ignore this guideline.
:::

Since the `uni-app` projects currently created by `hbuilderx`, `cli` and `vue2` by default, `@vue/cli-service@4` is still used.

In order to use the more advanced and productive `webpack5` and `postcss8` we must upgrade to `@vue/cli-service@5`

So how should old projects be upgraded?

### 1. Upgrade `@dcloudio/*` related packages

In the project root directory, execute:

```bash npm2yarn
npx @dcloudio/uvm alpha
```

Then select `y` and a prompt will appear. Select the package manager used by your project and run it.

At this time, all your `@dcloudio/*`-related packages have been upgraded to the `2.0.2-alpha-xxxxxxxxxxxx` version.

### 2. Upgrade `@vue/cli-*` related packages

Using your package manager, upgrade the `@vue/*`, `@vue/cli-*` related packages to the `5.x` version.

```json
{
  "@vue/babel-preset-app": "^5.0.8",
  "@vue/cli-plugin-babel": "~5.0.8",
  "@vue/cli-plugin-typescript": "5.0.8",
  "@vue/cli-service": "~5.0.8",
}
```

### 3. Upgrade all your `webpack` `plugin` and `loader`

Since you are using the latest version of `webpack`, you can upgrade those related packages to the latest version.

For example, `sass-loader`, `copy-webpack-plugin`, etc.

And since you are using the `5.x` version of `@vue/cli`, it relies on `postcss8` by default.

So you should also upgrade the `postcss` plug-in version you depend on as needed.

### 4. Configuration file upgrade

Configuration files such as `babel.config.js` and `postcss.config.js` need to be upgraded synchronously according to the actual dependency links of your current project.

For something similar to this, you can create a new `uni-app alpha` project, then directly copy the configuration inside, then change it to `postcss.config.js` and register `tailwindcss`.

### 5. Operation troubleshooting

The next step is to delete your `lock` files, reinstall all packages, and run your project!

Of course, when running, various errors are likely to be reported: For example, the `babel-xxx` plug-in cannot be found, and this installation is sufficient.

Or some `webpack` plug-in reports an error. This can be temporarily removed to see if the packaging can be successful.

:::tip
If you use `uni-app` and cloud functions at the same time, the cloud functions will cause `TypeError: I18n is not a constructor` to appear when compiled to WeChat.

Solution details see: https://ask.dcloud.net.cn/question/170057

Related issue: [issues/74#issuecomment-1573033475](https://github.com/sonofmagic/weapp-tailwindcss/issues/74#issuecomment-1573033475)
:::
