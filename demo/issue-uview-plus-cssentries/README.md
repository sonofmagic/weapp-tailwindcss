# issue-uview-plus-cssentries

This is a minimal regression demo derived from `/Users/icebreaker/Downloads/uni-app-base`.

It keeps the original failure shape:

- uni-app Vite project
- Tailwind CSS v4 entry passed through `cssEntries`
- `cssOptions.rem2rpx: true`
- app entry imports `uview-plus/index.scss`
- page uses `up-button` so uview-plus component styles are emitted by Vite

Run:

```sh
pnpm --filter @weapp-tailwindcss-demo/issue-uview-plus-cssentries run build:mp-weixin
```
