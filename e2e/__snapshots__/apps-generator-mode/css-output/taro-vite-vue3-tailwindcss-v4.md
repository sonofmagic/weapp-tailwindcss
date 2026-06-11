# taro-vite-vue3-tailwindcss-v4 CSS Output

Fixture: demo
Entry: taro-vite-vue3-tailwindcss-v4/dist/app.wxss
Generator CSS files: app.wxss, app-origin.wxss, index.wxss, index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 6879 | 20 | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
@import 'app-origin.wxss';
/* tokens: h-14 <= src/pages/index/index.vue */
/* tokens: h-[300px] <= src/pages/index/index.vue */
/* tokens: bg-[#123456] <= src/pages/index/index.vue */
/* tokens: bg-purple-300 <= src/pages/index/index.vue */
/* tokens: bg-linear-to-r <= src/pages/index/index.vue */
/* tokens: bg-linear-to-r <= src/pages/index/index.vue */
/* tokens: bg-gradient-to-r <= src/pages/index/index.vue */
/* tokens: from-cyan-500 <= src/pages/index/index.vue */
/* tokens: to-blue-500 <= src/pages/index/index.vue */
/* tokens: text-[55rpx] <= src/pages/index/index.vue */
/* tokens: text-[#c31d6b] <= src/pages/index/index.vue */
/* tokens: text-[#fff] <= src/pages/index/index.vue */
```

### app-origin.wxss

```css
view,
text,
::after,
::before {
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
  margin: 0;
  padding: 0;
  border: 0 solid;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-purple-300: rgb(216, 180, 255);
  --spacing: 8rpx;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
/* tokens: h-14 <= src/pages/index/index.vue */
.h-14 {
  height: calc(var(--spacing) * 14);
}
/* tokens: h-[300px] <= src/pages/index/index.vue */
.h-_b300px_B {
  height: 300rpx;
}
/* tokens: bg-[#123456] <= src/pages/index/index.vue */
.bg-_b_h123456_B {
  background-color: #123456;
}
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: bg-purple-300 <= src/pages/index/index.vue */
.bg-purple-300 {
  background-color: var(--color-purple-300);
}
/* tokens: bg-linear-to-r <= src/pages/index/index.vue */
.bg-linear-to-r {
  --tw-gradient-position: to right;
}
/* tokens: bg-linear-to-r <= src/pages/index/index.vue */
.bg-linear-to-r {
  background-image: linear-gradient(var(--tw-gradient-stops));
}
/* tokens: bg-gradient-to-r <= src/pages/index/index.vue */
.bg-gradient-to-r {
  --tw-gradient-position: to right in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
/* tokens: from-cyan-500 <= src/pages/index/index.vue */
.from-cyan-500 {
  --tw-gradient-from: var(--color-cyan-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
/* tokens: to-blue-500 <= src/pages/index/index.vue */
.to-blue-500 {
  --tw-gradient-to: var(--color-blue-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
/* tokens: text-[55rpx] <= src/pages/index/index.vue */
.text-_b55rpx_B {
  font-size: 55rpx;
}
/* tokens: text-[#c31d6b] <= src/pages/index/index.vue */
.text-_b_hc31d6b_B {
  color: #c31d6b;
}
/* tokens: text-[#fff] <= src/pages/index/index.vue */
.text-_b_hfff_B {
  color: #fff;
}
.bg-independent-subpackage-marker {
  background-color: #dc2626;
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

### index.wxss

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
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v4';
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
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v4';
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
