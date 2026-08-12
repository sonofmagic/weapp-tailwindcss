---
{}
---

# More scenes

## CLI configuration items and type definitions

`CLI` itself also integrates the compilation of `typescript` and `sass` / `less`. You can enable them for compilation through configuration items.

You can also use the `setting#useCompilerPlugins` field in WeChat Developer Tools and compile using the built-in plug-in of WeChat Developer Tools.

[See BuildOptions for details](/docs/api-cli/interfaces/BuildOptions)

## How to enable rem to rpx(px)

Add to `weapp-tw.config.js`:

```js title="weapp-tw.config.js"
/** @type {import('@weapp-tailwindcss/cli').UserConfig} */
const config = {
  // ...
  // highlight-start
  weappTailwindcssOptions: {
    cssOptions: {
      rem2rpx: true,
    },
  },
  // highlight-end
}

module.exports = config
```

## How to enable more postcss plugins

Just add it normally in `postcss.config.js`, but be aware that if you use preprocessor plug-ins, such as `sass` / `less`, etc.

You must **not** use the built-in compilation plug-in of `WeChat Developer Tools`, that is, remove the `project.config.json` / `setting` plug-in from the `useCompilerPlugins` > `sass` > `less` array field

Then you need to enable the `@weapp-tailwindcss/cli` compilation that comes with `sass`

First install `sass`, `npm i -D sass`

Then add fields in `weapp-tw.config.js`:

```js
/** @type {import('@weapp-tailwindcss/cli').UserConfig} */
const config = {
  preprocessorOptions: {
    sass: true,
  },
}

module.exports = config
```

In this way, `@weapp-tailwindcss/cli` will be compiled into `sass`, that is, `scss` -> `wxss`

Only in this way can the `postcss` plug-in be processed. Otherwise, if you use some `postcss` plug-ins, such as `postcss-pxtransform`, an error will be reported.

The reason is that `postcss-pxtransform` cannot handle `sass` of `ast`.

## How to be compatible with native mini programs?

Mainly relies on `@weapp-tailwindcss/cli`

`@weapp-tailwindcss/cli` is a tool chain that uses `gulp` to build a minimized native development of WeChat applet

## Why not `webpack`/`vite`

In fact, it is possible to use these implementations of `webpack` / `vite`. The main difference is only whether it is sufficient. For the purpose of the first stage, `gulp` is sufficient.

## Initialize and modify your configuration

`@weapp-tailwindcss/cli` will modify the `project.config.json` configuration in your project

In your `project.config.json` add:

```json
{
  "setting": {
    "packNpmManually": true,
    "packNpmRelationList": [
      {
        "packageJsonPath": "./package.json",
        "miniprogramNpmDistDir": "./dist"
      }
    ]
  },
  "miniprogramRoot": "dist/"
}
```

This configuration mainly does `2` things:

1. Modify the import directory of the product from the current directory to `dist/` (`miniprogramRoot`)
2. Modify the build location of the `npm` package from the `miniprogram_npm` in the current directory to the `dist/miniprogram_npm` directory

At this time, you can see the effect using `npm` built with WeChat developer tools.

## TypeScript support

:::info
Things to note when compiling using the native typescript plug-in:

The configuration of using WeChat developer tools to compile `typescript` is as follows:

```json title="project.config.json"
{
  "setting": {
    "useCompilerPlugins":[
      "typescript"
    ]
  }
}
```

:::
