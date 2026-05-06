# taro-vite-tailwindcss-v5 CSS Output Comparison

Fixture: demo
Entry: taro-vite-tailwindcss-v5/dist/app.wxss
Legacy CSS files: app.wxss, app-origin.wxss, index.wxss
Generator CSS files: app.wxss, app-origin.wxss, index.wxss

| Mode | Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- |
| legacy | 4505 | 40 | false | false | false | false | true |
| generator | 156 | 1 | false | false | false | false | false |

## Legacy CSS

```css
@import 'app-origin.wxss';

::before,
::after {
  --tw-content: '';
}
view,
text,
:before,
:after {
  --tw-space-y-reverse: 0;
  --tw-border-style: solid;
  --tw-gradient-position: initial;
  --tw-gradient-from: rgba(0, 0, 0, 0);
  --tw-gradient-via: rgba(0, 0, 0, 0);
  --tw-gradient-to: rgba(0, 0, 0, 0);
  --tw-gradient-stops: initial;
  --tw-gradient-via-stops: initial;
  --tw-gradient-from-position: 0%;
  --tw-gradient-via-position: 50%;
  --tw-gradient-to-position: 100%;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
page,
.tw-root,
wx-root-portal-content,
:host {
  --color-red-500: rgb(251, 44, 54);
  --color-green-500: rgb(0, 198, 90);
  --color-emerald-600: rgb(0, 150, 105);
  --color-cyan-500: rgb(0, 182, 212);
  --color-blue-500: rgb(50, 128, 255);
  --color-fuchsia-500: rgb(225, 42, 251);
  --color-rose-500: rgb(255, 35, 87);
  --color-gray-100: rgb(243, 244, 246);
  --color-zinc-800: rgb(39, 39, 42);
  --color-white: #fff;
  --spacing: 8rpx;
  --radius-xl: 24rpx;
  --color-brand: #155dfc;
}
view,
text,
:after,
:before {
  box-sizing: border-box;
  border: 0 solid;
  margin: 0;
  padding: 0;
}
.static {
  position: static;
}
.h-14 {
  height: 112rpx;
  height: calc(var(--spacing) * 14);
}
.h-_b300px_B {
  height: 300rpx;
}
.rotate-_b10deg_B {
  rotate: 10deg;
}
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: 0rpx;
  margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-top: 32rpx;
  margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
}
.rounded-xl {
  border-radius: 24rpx;
  border-radius: var(--radius-xl);
}
.border-_b10rpx_B {
  border-style: var(--tw-border-style);
  border-width: 10rpx;
}
._eborder-brand {
  border-color: #155dfc !important;
  border-color: var(--color-brand) !important;
}
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-brand {
  background-color: #155dfc;
  background-color: var(--color-brand);
}
.bg-gray-100 {
  background-color: rgb(243, 244, 246);
  background-color: var(--color-gray-100);
}
.bg-red-500 {
  background-color: rgb(251, 44, 54);
  background-color: var(--color-red-500);
}
.bg-linear-to-r {
  --tw-gradient-position: to right;
}
.bg-linear-to-r {
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-b {
  --tw-gradient-position: to bottom;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-r {
  --tw-gradient-position: to right;
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
.from-fuchsia-500 {
  --tw-gradient-from: var(--color-fuchsia-500);
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
.to-rose-500 {
  --tw-gradient-to: var(--color-rose-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.p-4 {
  padding: 32rpx;
  padding: calc(var(--spacing) * 4);
}
.p-_b32rpx_B {
  padding: 32rpx;
}
.text-_b32rpx_B {
  font-size: 32rpx;
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
.text-white {
  color: #fff;
  color: var(--color-white);
}
.active_cbg-emerald-600:active {
  background-color: rgb(0, 150, 105);
  background-color: var(--color-emerald-600);
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: rgb(0, 198, 90);
    background-color: var(--color-green-500);
  }
  .dark_cbg-zinc-800 {
    background-color: rgb(39, 39, 42);
    background-color: var(--color-zinc-800);
  }
}

.tw-page-style-watch-anchor {
  color: inherit;
}
```

## Generator CSS

```css
@import 'app-origin.wxss';

@source "./pages/**/*.{ts,tsx,jsx,js}";
@theme {
  --color-brand: #155dfc;
}

.tw-page-style-watch-anchor {
  color: inherit;
}
```
