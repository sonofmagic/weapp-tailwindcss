# 别名 {#alias}

项目内部启用了自动别名的功能:

你只需在你的 `tsconfig.json` / `jsconfig.json` 中配置 `baseUrl` 和 `paths`，`js/ts` 引入的别名即可生效

比如:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./*"
      ]
    }
  }
}
```

你就可以在你的代码里面写:

```ts
import utils from '@/utils'
```

在经过 `weapp-vite dev` / `weapp-vite build` 只会会自动帮你做路径的 `resolve`
