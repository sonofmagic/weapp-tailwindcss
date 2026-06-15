# taro-vite-react-tailwindcss-v4 CSS Output

Fixture: demo
Entry: taro-vite-react-tailwindcss-v4/dist/app.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| 10843 | 38 | false | false | false | true | true | false | true |

## Generator CSS Files

| # | File |
| ---: | --- |
| 1 | `app.wxss` |
| 2 | `app-origin.wxss` |
| 3 | `pages/index/index.wxss` |
| 4 | `sub-independent/pages/index.wxss` |
| 5 | `sub-normal/pages/index.wxss` |

## Generator CSS Summary

| File | Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| `app.wxss` | 5477 | 33 | false | false | false | true | true | false | true |
| `app-origin.wxss` | 3573 | 33 | false | false | false | true | true | false | true |
| `pages/index/index.wxss` | 50 | 1 | false | false | false | false | false | false | false |
| `sub-independent/pages/index.wxss` | 937 | 6 | false | false | false | false | false | false | true |
| `sub-normal/pages/index.wxss` | 922 | 6 | false | false | false | false | false | false | true |

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
 /* tokens: mt-2 <= src/pages/index/index.tsx */
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
 /* tokens: mt-4 <= src/pages/index/index.tsx */
.mt-4 {
  margin-top: calc(var(--spacing) * 4);
}
 /* tokens: h-14 <= src/pages/index/index.tsx */
.h-14 {
  height: calc(var(--spacing) * 14);
}
 /* tokens: h-[300px] <= src/pages/index/index.tsx */
.h-_b300px_B {
  height: 300rpx;
}
 /* tokens: rounded <= src/pages/index/index.tsx */
.rounded {
  border-radius: 8rpx;
}
 /* tokens: bg-[#123456] <= src/pages/index/index.tsx */
.bg-_b_h123456_B {
  background-color: #123456;
}
 /* tokens: bg-[red] <= src/pages/index/index.tsx */
.bg-_bred_B {
  background-color: red;
}
 /* tokens: bg-purple-300 <= src/pages/index/index.tsx */
.bg-purple-300 {
  background-color: var(--color-purple-300);
}
 /* tokens: bg-white <= src/pages/index/index.tsx */
.bg-white {
  background-color: var(--color-white);
}
 /* tokens: bg-linear-to-r <= src/pages/index/index.tsx */
.bg-linear-to-r {
  --tw-gradient-position: to right;
}
 /* tokens: bg-linear-to-r <= src/pages/index/index.tsx */
.bg-linear-to-r {
  background-image: linear-gradient(var(--tw-gradient-stops));
}
 /* tokens: bg-gradient-to-r <= src/pages/index/index.tsx */
.bg-gradient-to-r {
  --tw-gradient-position: to right in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
 /* tokens: from-cyan-500 <= src/pages/index/index.tsx */
.from-cyan-500 {
  --tw-gradient-from: var(--color-cyan-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
 /* tokens: to-blue-500 <= src/pages/index/index.tsx */
.to-blue-500 {
  --tw-gradient-to: var(--color-blue-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
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
 /* tokens: text-[55rpx] <= src/pages/index/index.tsx */
.text-_b55rpx_B {
  font-size: 55rpx;
}
 /* tokens: text-[#c31d6b] <= src/pages/index/index.tsx */
.text-_b_hc31d6b_B {
  color: #c31d6b;
}
 /* tokens: text-[#fff] <= src/pages/index/index.tsx */
.text-_b_hfff_B {
  color: #fff;
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

### sub-independent/pages/index.wxss

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
.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-vite-react-tailwindcss-v4';
  content: var(--tw-content);
}
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
  -webkit-box-sizing: border-box;
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
.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-vite-react-tailwindcss-v4';
  content: var(--tw-content);
}
.bg-normal-subpackage-marker {
  background-color: #2563eb;
}
```
