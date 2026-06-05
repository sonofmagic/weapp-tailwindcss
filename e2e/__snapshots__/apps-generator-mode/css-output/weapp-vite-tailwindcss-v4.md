# weapp-vite-tailwindcss-v4 CSS Output

Fixture: demo
Entry: weapp-vite-tailwindcss-v4/dist/app.wxss
Generator CSS files: app.wxss, apple.wxss, index.wxss, index.wxss, index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 7309 | 50 | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
view,
text,
:after,
:before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-space-x-reverse: 0;
  --tw-space-y-reverse: 0;
  --tw-border-style: solid;
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
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-red-700: rgb(191, 0, 15);
  --color-amber-300: rgb(255, 210, 55);
  --color-blue-500: rgb(50, 128, 255);
  --color-pink-300: rgb(253, 165, 213);
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --spacing: 8rpx;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.i-mdi-home {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/svg%3E");
}
.flex {
  display: flex;
}
.inline-block {
  display: inline-block;
}
.size-12 {
  width: calc(var(--spacing) * 12);
  height: calc(var(--spacing) * 12);
}
.h-10 {
  height: calc(var(--spacing) * 10);
}
.h-_b30px_B {
  height: 30px;
}
.h-_b45px_B {
  height: 45px;
}
.min-h-screen {
  min-height: 100vh;
}
.w-_b50px_B {
  width: 50px;
}
.w-_b323px_B {
  width: 323px;
}
.flex-col {
  flex-direction: column;
}
.space-y-2_d5 > view + view,
.space-y-2_d5 > view + text,
.space-y-2_d5 > text + view,
.space-y-2_d5 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(var(--spacing) * 2.5 * var(--tw-space-y-reverse));
  margin-top: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-y-reverse)));
}
.space-x-2_d5 > view + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: calc(var(--spacing) * 2.5 * var(--tw-space-x-reverse));
  margin-left: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-x-reverse)));
}
.border-4 {
  border-style: var(--tw-border-style);
  border-width: 4px;
}
.bg-_b_h3a32d1_B {
  background-color: #3a32d1;
}
.bg-_b_h68c828_B {
  background-color: #68c828;
}
.bg-amber-300 {
  background-color: var(--color-amber-300);
}
.bg-blue-500_f30 {
  background-color: rgba(50, 128, 255, 0.3);
}
.bg-zinc-50 {
  background-color: var(--color-zinc-50);
}
.bg-gradient-to-b {
  --tw-gradient-position: to bottom in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-t {
  --tw-gradient-position: to top in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-tr {
  --tw-gradient-position: to top right in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.from-_b_h2f73f1_B {
  --tw-gradient-from: #2f73f1;
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.to-_b_h4bcefd_B {
  --tw-gradient-to: #4bcefd;
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.p-4 {
  padding: calc(var(--spacing) * 4);
}
.text-_b100px_B {
  font-size: 100px;
}
.text-_b100rpx_B {
  font-size: 100rpx;
}
.text-_b55rpx_B {
  font-size: 55rpx;
}
.text-_b_h123456_B {
  color: #123456;
}
.text-blue-500 {
  color: var(--color-blue-500);
}
.text-pink-300 {
  color: var(--color-pink-300);
}
.text-red-700 {
  color: var(--color-red-700);
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-900 {
    background-color: var(--color-zinc-900);
  }
}
.container {
  width: 100%;
}
@media (min-width: 40rem) {
  .container {
    max-width: 1280rpx;
  }
}
@media (min-width: 48rem) {
  .container {
    max-width: 1536rpx;
  }
}
@media (min-width: 64rem) {
  .container {
    max-width: 2048rpx;
  }
}
@media (min-width: 80rem) {
  .container {
    max-width: 2560rpx;
  }
}
@media (min-width: 96rem) {
  .container {
    max-width: 3072rpx;
  }
}
```

### apple.wxss

```css

```

### index.wxss

```css
/* stylelint-disable-next-line import-notation */
.s .a {
  color: turquoise;
}
.user-motto {
  font-size: 12px;
}
```

### index.wxss

```css
view,
text,
:after,
:before {
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
.before_ccontent-_b_aindependent_subpackage_weapp-vite-tailwindcss-v4_a_B:before {
  --tw-content: 'independent subpackage weapp-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
.container {
  width: 100%;
}
@media (min-width: 40rem) {
  .container {
    max-width: 1280rpx;
  }
}
@media (min-width: 48rem) {
  .container {
    max-width: 1536rpx;
  }
}
@media (min-width: 64rem) {
  .container {
    max-width: 2048rpx;
  }
}
@media (min-width: 80rem) {
  .container {
    max-width: 2560rpx;
  }
}
@media (min-width: 96rem) {
  .container {
    max-width: 3072rpx;
  }
}
```

### index.wxss

```css
view,
text,
:after,
:before {
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
.before_ccontent-_b_anormal_subpackage_weapp-vite-tailwindcss-v4_a_B:before {
  --tw-content: 'normal subpackage weapp-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.bg-normal-subpackage-marker {
  background-color: #2563eb;
}
.container {
  width: 100%;
}
@media (min-width: 40rem) {
  .container {
    max-width: 1280rpx;
  }
}
@media (min-width: 48rem) {
  .container {
    max-width: 1536rpx;
  }
}
@media (min-width: 64rem) {
  .container {
    max-width: 2048rpx;
  }
}
@media (min-width: 80rem) {
  .container {
    max-width: 2560rpx;
  }
}
@media (min-width: 96rem) {
  .container {
    max-width: 3072rpx;
  }
}
```
