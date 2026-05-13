vite@^2.8.3:

postcss@^8.1.10, postcss@^8.4.6:

postcss.config.js 不能正常加载？

调试后发现添加 `postcss.config.js` 不起作用，无法直接添加进 `vite config`，直接更改 `vite.config.ts` 了

`'@dcloudio/vite-plugin-uni'` 内置 `uni-app` `autoprefixer` postcss 插件

`'@dcloudio/uni-cli-shared'` -> `src/postcss/index.ts`

`@dcloudio/uni-app-vite` `uni-app-vite/src/plugin/index` 添加的 `initPostcssPlugin`

`@dcloudio/uni-app-plus` 引入 '@dcloudio/uni-app-vite'

`@dcloudio/uni-app-vite` 引入 `@dcloudio/uni-app-plus` 中的文件内容 `fs` 引用 `dist` and `css`

`uni-app-vite` `export Plugin[]`

`uni-app-plus` import as compiler

'@dcloudio/vite-plugin-uni' 动态引入 `@dcloudio/uni-app-plus`

`vite-plugin-uni` 注册 bin `uni`: "bin/uni.js"

`resolveConfig` 获取的 postcss 是一个字符串路径

`postcssrc` -> `postcss-load-config` -> `resolvePostcssConfig`

`loadConfigFromFile`

`bundleConfigFile`

`loadConfigFromBundledFile` -> `userConfig#plugins#18 length`

`config.css.postcss#String`

`debug` `uni-app-vite/src/plugin/index#uniAppPlugin`

### vite 3

uni-cli-shared/json/manifest.js 中的 parseRpx2UnitOnce

通过 platform 获取转义配置项

platform === 'h5' || platform === 'app' 为

```js
const defaultRpx2Unit = {
    unit: 'rem',
    unitRatio: 10 / 320,
    unitPrecision: 5,
};
```

其他为

```js
const defaultMiniProgramRpx2Unit = {
    unit: 'rpx',
    unitRatio: 1,
    unitPrecision: 1,
};
```

回到 uni-cli-shared/postcss

顺着代码找到 `plugins/uniapp`

walkDecls 可以看到 rpx 被转换成了 rem

```js
// manifest-json-js 为空
import './manifest-json-js'
if(!Math){
import('uniPage://cGFnZXMvaW5kZXgvaW5kZXgudnVl')
import('uniPage://cGFnZXMvaW5kZXgvZGFpc3l1aS52dWU')
import('uniPage://cGFnZXMvaW5kZXgvcGVlci52dWU')
import('uniPage://cGFnZXMvaXNzdWUvY2FzZTU1LnZ1ZQ')
import('uniPage://cGFnZXMvaXNzdWUvdGFpbHdpbmQtY2hpbGRyZW4udnVl')
import('uniPage://cGFnZXMvaXNzdWUvY2FzZS1keW5hbWljLWNsYXNzLnZ1ZQ')
import('uniPage://cGFnZXMvaXNzdWUvY2FzZS1zdXBwb3J0LXJweC52dWU')
import('uniPage://cGFnZXMvaXNzdWUvdHlwb2dyYXBoeS52dWU')
import('uniPage://c3Vicy9kZW1vL3BhZ2VzL2luZGV4LnZ1ZQ')
import('uniPage://bW9kdWxlQS9wYWdlcy9pbmRleC52dWU')
import('uniPage://bW9kdWxlQS9wYWdlcy9hLnZ1ZQ')
import('uniPage://bW9kdWxlQS9wYWdlcy9iLnZ1ZQ')
}
```

```js
// uniPage
import MiniProgramPage from 'xxxx'
wx.createPage(MiniProgramPage)
```

https://github.com/dcloudio/uni-app/blob/4a5b1aa6cf964636e77d7ccd1a62998265462a82/packages/uni-mp-core/src/runtime/page.ts#L80

https://github.com/dcloudio/uni-app/blob/4a5b1aa6cf964636e77d7ccd1a62998265462a82/packages/uni-mp-vite/README.md?plain=1#L16

https://github.com/dcloudio/uni-app/blob/4a5b1aa6cf964636e77d7ccd1a62998265462a82/packages/uni-mp-vite/src/plugins/entry.ts