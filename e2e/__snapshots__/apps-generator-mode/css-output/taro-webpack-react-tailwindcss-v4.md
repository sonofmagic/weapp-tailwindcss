# taro-webpack-react-tailwindcss-v4 CSS Output

Fixture: demo
Entry: taro-webpack-react-tailwindcss-v4/dist/app.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| 10279 | 49 | false | false | false | true | true | false | true |

## Generator CSS Files

| # | File |
| ---: | --- |
| 1 | `app.wxss` |
| 2 | `pages/index/index.wxss` |
| 3 | `sub-independent/pages/index.wxss` |
| 4 | `sub-normal/pages/index.wxss` |

## Generator CSS Summary

| File | Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| `app.wxss` | 8022 | 44 | false | false | false | true | true | false | true |
| `pages/index/index.wxss` | 156 | 1 | false | false | false | false | false | false | false |
| `sub-independent/pages/index.wxss` | 1126 | 6 | false | false | false | false | false | false | true |
| `sub-normal/pages/index.wxss` | 1091 | 6 | false | false | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-rotate-x:;
  --tw-rotate-y:;
  --tw-rotate-z:;
  --tw-skew-x:;
  --tw-skew-y:;
  --tw-gradient-position: initial;
  --tw-gradient-from: #0000;
  --tw-gradient-to: #0000;
  --tw-gradient-stops: initial;
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
  --color-purple-800: #6b21a8;
  --color-pink-200: #fbcfe8;
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --spacing: 8rpx;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
 /* tokens: absolute <= src/pages/issue-909/index.tsx */
.absolute {
  position: absolute;
}
 /* tokens: relative <= src/pages/issue-909/index.tsx */
.relative {
  position: relative;
}
 /* tokens: mt-2 <= src/pages/index/index.tsx */
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
 /* tokens: mt-4 <= src/pages/index/index.tsx */
.mt-4 {
  margin-top: calc(var(--spacing) * 4);
}
 /* tokens: flex <= src/pages/issue-909/index.tsx, src/pages/issue-928/index.tsx */
.flex {
  display: flex;
}
 /* tokens: h-8 <= src/pages/issue-909/index.tsx */
.h-8 {
  height: calc(var(--spacing) * 8);
}
 /* tokens: h-14 <= src/pages/index/index.tsx, src/pages/issue-928/index.tsx */
.h-14 {
  height: calc(var(--spacing) * 14);
}
 /* tokens: w-8 <= src/pages/issue-909/index.tsx */
.w-8 {
  width: calc(var(--spacing) * 8);
}
 /* tokens: w-24 <= src/pages/issue-928/index.tsx */
.w-24 {
  width: calc(var(--spacing) * 24);
}
 /* tokens: rotate-x-45 <= src/pages/issue-909/index.tsx */
.rotate-x-45 {
  --tw-rotate-x: rotateX(45deg);
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
 /* tokens: -rotate-y-45 <= src/pages/issue-909/index.tsx */
.-rotate-y-45 {
  --tw-rotate-y: rotateY(-45deg);
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
 /* tokens: rotate-y-45 <= src/pages/issue-909/index.tsx */
.rotate-y-45 {
  --tw-rotate-y: rotateY(45deg);
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
 /* tokens: rotate-y-90 <= src/pages/issue-909/index.tsx */
.rotate-y-90 {
  --tw-rotate-y: rotateY(90deg);
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
 /* tokens: rotate-z-45 <= src/pages/issue-909/index.tsx */
.rotate-z-45 {
  --tw-rotate-z: rotateZ(45deg);
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
 /* tokens: rounded <= src/pages/index/index.tsx */
.rounded {
  border-radius: 8rpx;
}
 /* tokens: bg-[#534312] <= src/pages/index/index.tsx */
.bg-_b_h534312_B {
  background-color: #534312;
}
 /* tokens: bg-purple-800 <= src/pages/index/index.tsx */
.bg-purple-800 {
  background-color: var(--color-purple-800);
}
 /* tokens: bg-white <= src/pages/index/index.tsx */
.bg-white {
  background-color: var(--color-white);
}
 /* tokens: bg-linear-to-r <= src/pages/issue-928/index.tsx */
.bg-linear-to-r {
  --tw-gradient-position: to right;
  background-image: linear-gradient(var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position, ), var(--tw-gradient-to) var(--tw-gradient-to-position, ));
}
 /* tokens: bg-gradient-to-r <= src/pages/index/index.tsx */
.bg-gradient-to-r {
  --tw-gradient-position: to right in oklab;
  background-image: linear-gradient(var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position, ), var(--tw-gradient-to) var(--tw-gradient-to-position, ));
}
 /* tokens: from-cyan-500 <= src/pages/index/index.tsx, src/pages/issue-928/index.tsx */
.from-cyan-500 {
  --tw-gradient-from: var(--color-cyan-500);
  --tw-gradient-stops:
    var(--tw-gradient-via-stops, var(--tw-gradient-position)), var(--tw-gradient-from) var(--tw-gradient-from-position, ), var(--tw-gradient-to) var(--tw-gradient-to-position, );
}
 /* tokens: to-blue-500 <= src/pages/index/index.tsx, src/pages/issue-928/index.tsx */
.to-blue-500 {
  --tw-gradient-to: var(--color-blue-500);
  --tw-gradient-stops:
    var(--tw-gradient-via-stops, var(--tw-gradient-position)), var(--tw-gradient-from) var(--tw-gradient-from-position, ), var(--tw-gradient-to) var(--tw-gradient-to-position, );
}
 /* tokens: px-3 <= src/pages/index/index.tsx */
.px-3 {
  padding-left: calc(var(--spacing) * 3);
  padding-right: calc(var(--spacing) * 3);
}
 /* tokens: px-4 <= src/pages/index/index.tsx */
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
 /* tokens: py-2 <= src/pages/index/index.tsx */
.py-2 {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
 /* tokens: py-3 <= src/pages/index/index.tsx */
.py-3 {
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
 /* tokens: text-[100rpx] <= src/pages/index/index.tsx */
.text-_b100rpx_B {
  font-size: 100rpx;
}
 /* tokens: text-[#fff] <= src/pages/index/index.tsx */
.text-_b_hfff_B {
  color: #fff;
}
 /* tokens: text-pink-200 <= src/pages/index/index.tsx */
.text-pink-200 {
  color: var(--color-pink-200);
}
 /* tokens: text-slate-900 <= src/pages/index/index.tsx */
.text-slate-900 {
  color: var(--color-slate-900);
}
 /* tokens: dark:bg-zinc-900 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.dark_cbg-zinc-900.theme-dark {
  background-color: var(--color-zinc-900);
}
 /* tokens: theme-dark <= src/pages/index/index.tsx | dark:bg-zinc-900 <= src/pages/index/index.tsx */
.theme-dark .dark_cbg-zinc-900 {
  background-color: var(--color-zinc-900);
}
 /* tokens: dark:bg-zinc-950 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.dark_cbg-zinc-950.theme-dark {
  background-color: var(--color-zinc-950);
}
 /* tokens: theme-dark <= src/pages/index/index.tsx | dark:bg-zinc-950 <= src/pages/index/index.tsx */
.theme-dark .dark_cbg-zinc-950 {
  background-color: var(--color-zinc-950);
}
 /* tokens: dark:text-zinc-50 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.dark_ctext-zinc-50.theme-dark {
  color: var(--color-zinc-50);
}
 /* tokens: theme-dark <= src/pages/index/index.tsx | dark:text-zinc-50 <= src/pages/index/index.tsx */
.theme-dark .dark_ctext-zinc-50 {
  color: var(--color-zinc-50);
}
@media (prefers-color-scheme: dark) {
 /* tokens: system-dark:bg-slate-900 <= src/pages/index/index.tsx */
  .system-dark_cbg-slate-900 {
    background-color: var(--color-slate-900);
  }
}
@media (prefers-color-scheme: dark) {
 /* tokens: system-dark:text-slate-100 <= src/pages/index/index.tsx */
  .system-dark_ctext-slate-100 {
    color: var(--color-slate-100);
  }
}
view {
  box-sizing: border-box;
}
 /* tokens: bg-linear-to-r <= src/pages/issue-928/index.tsx | from-cyan-500 <= src/pages/index/index.tsx, src/pages/issue-928/index.tsx | to-blue-500 <= src/pages/index/index.tsx, src/pages/issue-928/index.tsx */
.bg-linear-to-r.from-cyan-500.to-blue-500 {
  background-image: linear-gradient(to right, #06b6d4 0%, #3b82f6 100%);
}
 /* tokens: bg-gradient-to-r <= src/pages/index/index.tsx | from-cyan-500 <= src/pages/index/index.tsx, src/pages/issue-928/index.tsx | to-blue-500 <= src/pages/index/index.tsx, src/pages/issue-928/index.tsx */
.bg-gradient-to-r.from-cyan-500.to-blue-500 {
  background-image: linear-gradient(to right, #06b6d4 0%, #3b82f6 100%);
}
```

### pages/index/index.wxss

```css
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
}
.tw-page-style-watch-anchor {
  color: inherit;
}
```

### sub-independent/pages/index.wxss

```css
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-content: '';
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
 /* tokens: bg-independent-subpackage-marker <= src/sub-independent/pages/index.tsx */
.before_ccontent-_b_aindependent_subpackage_taro-webpack-react-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-react-tailwindcss-v4';
  content: var(--tw-content);
}
 /* tokens: before:content-['independent_subpackage_taro-webpack-react-tailwindcss-v4'] <= src/sub-independent/pages/index.tsx */
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
```

### sub-normal/pages/index.wxss

```css
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-content: '';
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
 /* tokens: bg-normal-subpackage-marker <= src/sub-normal/pages/index.tsx */
.before_ccontent-_b_anormal_subpackage_taro-webpack-react-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-react-tailwindcss-v4';
  content: var(--tw-content);
}
 /* tokens: before:content-['normal_subpackage_taro-webpack-react-tailwindcss-v4'] <= src/sub-normal/pages/index.tsx */
.bg-normal-subpackage-marker {
  background-color: #2563eb;
}
```
