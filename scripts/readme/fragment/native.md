<details><summary>原生小程序(webpack5)</summary><br/>

直接在 `webpack.config.js` 注册即可

```js
// webpack.config.js
  plugins: [
    new UnifiedWebpackPluginV5({
      appType: 'native',
    }),
  ],
```

<br/></details>