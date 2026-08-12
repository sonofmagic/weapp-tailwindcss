---
title: Using `terser` to compress code in `Tarojs`
description: In the taro webpack5 environment, using this plug-in with the externally installed terser-webpack-plugin will cause the plug-in escaping function to become invalid.
keywords:
  - FAQ
  - Troubleshooting
  - compatibility
  - Tarojs
  - used in
  - terser
  - Compressed code
  - issues
  - taro terser
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
---

# Use `Tarojs` compression code in `terser`

In the environment of `taro`

Related issue: [#142](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/142)

## Phenomenon

For example: `.h-4/6`,

## Solution

Please compress the code and don't use the method in [link](https://docs.taro.zone/docs/config-detail/#terserenable), it's too old.

Use the `taro` configuration item in the `terser` configuration item, see [`terser` configuration item](https://docs.taro.zone/docs/config-detail#terser).

> The `terser` configuration only takes effect in production mode. If you are using `watch` mode and want to enable `terser`, you need to set `process.env.NODE_ENV` to `production`.

In other words, when developing the `watch` mode, just set the environment variable `NODE_ENV` to `production`.

In addition, you can also use the compression code option within the WeChat developer tools instead of using the `webpack` plug-in to compress the code.

## Configuration reference

```ts title="config/index.ts"
{
  terser: {
    enable: true,
    config: {
//Related configuration items
    },
  },
}
```

Then if you want it to take effect during development, you need to pass in the `NODE_ENV=production` environment variable, for example:

```json title="package.json"
{
  "scripts":{
    "dev:weapp": "cross-env NODE_ENV=production npm run build:weapp -- --watch",
  }
}
```

`cross-env` If it is not installed, you can install it.
