# taro-vite-react-tailwindcss-v4 CSS Output

Fixture: demo
Entry: taro-vite-react-tailwindcss-v4/dist/app.wxss
Generator CSS files: app.wxss, app-origin.wxss, pages/index/index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| 3650 | 34 | false | false | false | true | true | false | true |

## Generator CSS Summary

| File | Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| `app.wxss` | 27 | 0 | false | false | false | false | false | false | false |
| `app-origin.wxss` | 3573 | 33 | false | false | false | true | true | false | true |
| `pages/index/index.wxss` | 50 | 1 | false | false | false | false | false | false | false |

## Generator CSS

### app.wxss

```css
@import 'app-origin.wxss';
```

### app-origin.wxss

```css
view,
text,
::after,
::before {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-gradient-position: initial;
  --tw-gradient-from: #0000;
  --tw-gradient-to: #0000;
  --tw-gradient-stops: initial;
  --tw-gradient-via-stops: initial;
  --tw-gradient-from-position: 0%;
  --tw-gradient-to-position: 100%;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-slate-100: #f1f5f9;
  --color-zinc-950: #09090b;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-slate-900: rgb(15, 23, 43);
  --color-white: #fff;
  --color-purple-300: rgb(216, 180, 255);
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --spacing: 8rpx;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
.mt-4 {
  margin-top: calc(var(--spacing) * 4);
}
.h-14 {
  height: calc(var(--spacing) * 14);
}
.h-_b300px_B {
  height: 300rpx;
}
.rounded {
  border-radius: 8rpx;
}
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-_bred_B {
  background-color: red;
}
.bg-purple-300 {
  background-color: var(--color-purple-300);
}
.bg-white {
  background-color: var(--color-white);
}
.bg-linear-to-r {
  --tw-gradient-position: to right;
}
.bg-linear-to-r {
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-r {
  --tw-gradient-position: to right in oklab;
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.from-cyan-500 {
  --tw-gradient-from: var(--color-cyan-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.to-blue-500 {
  --tw-gradient-to: var(--color-blue-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.px-3 {
  padding-left: calc(var(--spacing) * 3);
  padding-right: calc(var(--spacing) * 3);
}
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.py-2 {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.py-3 {
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
.text-_b55rpx_B {
  font-size: 55rpx;
}
.text-_b_hc31d6b_B {
  color: #c31d6b;
}
.text-_b_hfff_B {
  color: #fff;
}
.text-slate-900 {
  color: var(--color-slate-900);
}
.dark_cbg-zinc-900.theme-dark,
.theme-dark .dark_cbg-zinc-900 {
  background-color: var(--color-zinc-900);
}
.dark_cbg-zinc-950.theme-dark,
.theme-dark .dark_cbg-zinc-950 {
  background-color: var(--color-zinc-950);
}
.dark_ctext-zinc-50.theme-dark,
.theme-dark .dark_ctext-zinc-50 {
  color: var(--color-zinc-50);
}
@media (prefers-color-scheme: dark) {
  .system-dark_cbg-slate-900 {
    background-color: var(--color-slate-900);
  }
}
@media (prefers-color-scheme: dark) {
  .system-dark_ctext-slate-100 {
    color: var(--color-slate-100);
  }
}
```

### pages/index/index.wxss

```css
.tw-page-style-watch-anchor {
  color: inherit;
}
```
