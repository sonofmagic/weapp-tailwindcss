# 在 monorepo 中使用

在 `monorepo` 由于存在 `hoist` 机制，可能会导致 `weapp-tailwindcss` 和 `tailwindcss` 通信受阻，这时候需要显式的去指定 `tailwindcss` 的路径

这里我们以 `taro@4` 的配置 `config/index.ts` 配置为例

## Tailwindcss@3

```ts
const config = {
  webpackChain(chain) {
    chain.merge({
      plugin: {
        install: {
          plugin: UnifiedWebpackPluginV5,
          args: [
            {
              rem2rpx: true,
              // highlight-next-line
              tailwindcssBasedir: path.resolve(__dirname, '../'),
            },
          ],
        },
      },
    })
  },
}
```

## Tailwindcss@4

```ts
const config = {
  webpackChain(chain) {
    chain.merge({
      plugin: {
        install: {
          plugin: UnifiedWebpackPluginV5,
          args: [
            {
              rem2rpx: true,
              // highlight-next-line
              cssEntries: [
                // app.css 的路径
                path.resolve(__dirname, '../src/app.css'),
              ],
            },
          ],
        },
      },
    })
  },
}
```

使用这样的配置，就能在 `monorepo` 中使用了
