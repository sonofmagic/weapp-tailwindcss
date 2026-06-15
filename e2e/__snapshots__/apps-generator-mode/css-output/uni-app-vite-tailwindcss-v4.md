# uni-app-vite-tailwindcss-v4 CSS Output

Fixture: demo
Entry: uni-app-vite-tailwindcss-v4/dist/build/mp-weixin/app.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| 29472 | 133 | false | false | false | true | true | false | true |

## Generator CSS Files

| # | File |
| ---: | --- |
| 1 | `app.wxss` |
| 2 | `pages-order/pages/home/home.wxss` |
| 3 | `pages-order/pages/user/user.wxss` |

## Generator CSS Summary

| File | Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| `app.wxss` | 19384 | 108 | false | false | false | true | true | false | true |
| `pages-order/pages/home/home.wxss` | 5044 | 51 | false | false | false | false | false | false | true |
| `pages-order/pages/user/user.wxss` | 5044 | 51 | false | false | false | false | false | false | true |

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
  --tw-space-x-reverse: 0;
  --tw-space-y-reverse: 0;
  --tw-border-style: solid;
  --tw-divide-x-reverse: 0;
  --tw-divide-y-reverse: 0;
  --tw-font-weight:;
  --tw-leading:;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-color: initial;
  --tw-inset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-inset-ring-shadow: 0 0 #0000;
  --tw-ring-offset-shadow: 0 0 #0000;
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
  --color-emerald-500: rgb(0, 185, 129);
  --color-emerald-600: rgb(0, 150, 105);
  --color-slate-900: rgb(15, 23, 43);
  --color-white: #fff;
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --spacing: 8rpx;
  --text-sm: 28rpx;
  --text-sm--line-height: 1.42857;
  --font-weight-bold: 700;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
  --color-neutral-1B: #1b1b1b;
  --color-neutral-66: #666;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
.mt-4 {
  margin-top: calc(var(--spacing) * 4);
}
.mt-6 {
  margin-top: calc(var(--spacing) * 6);
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
.aspect-_p--my-aspect-ratio_P {
  aspect-ratio: var(--my-aspect-ratio);
}
.aspect-_bcalc_p4_x3_u1_P_f3_B {
  aspect-ratio: 13/3;
}
.h-12 {
  height: calc(var(--spacing) * 12);
}
.h-20 {
  height: calc(var(--spacing) * 20);
}
.w-12 {
  width: calc(var(--spacing) * 12);
}
.w-20 {
  width: calc(var(--spacing) * 20);
}
.flex-col {
  flex-direction: column;
}
.flex-col-reverse {
  flex-direction: column-reverse;
}
.flex-row-reverse {
  flex-direction: row-reverse;
}
.items-center {
  align-items: center;
}
.gap-3 {
  gap: calc(var(--spacing) * 3);
}
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
}
.space-y-reverse > view + view,
.space-y-reverse > view + text,
.space-y-reverse > text + view,
.space-y-reverse > text + text {
  --tw-space-y-reverse: 1;
}
.space-x-4 > view + view,
.space-x-4 > view + text,
.space-x-4 > text + view,
.space-x-4 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: calc((var(--spacing) * 4) * var(--tw-space-x-reverse));
  margin-right: calc(var(--spacing) * 4 * var(--tw-space-x-reverse));
  margin-left: calc((var(--spacing) * 4) * (1 - var(--tw-space-x-reverse)));
  margin-left: calc(var(--spacing) * 4 * (1 - var(--tw-space-x-reverse)));
}
.space-x-reverse > view + view,
.space-x-reverse > view + text,
.space-x-reverse > text + view,
.space-x-reverse > text + text {
  --tw-space-x-reverse: 1;
}
.divide-x-4 > view + view,
.divide-x-4 > view + text,
.divide-x-4 > text + view,
.divide-x-4 > text + text {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(4px * var(--tw-divide-x-reverse));
  border-left-width: calc(4px * (1 - var(--tw-divide-x-reverse)));
}
.divide-y-4 > view + view,
.divide-y-4 > view + text,
.divide-y-4 > text + view,
.divide-y-4 > text + text {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: calc(4px * var(--tw-divide-y-reverse));
  border-top-width: calc(4px * (1 - var(--tw-divide-y-reverse)));
}
.divide-y-reverse > view + view,
.divide-y-reverse > view + text,
.divide-y-reverse > text + view,
.divide-y-reverse > text + text {
  --tw-divide-y-reverse: 1;
}
.divide-dotted > view + view,
.divide-dotted > view + text,
.divide-dotted > text + view,
.divide-dotted > text + text {
  --tw-border-style: dotted;
  border-style: dotted;
}
.divide-double > view + view,
.divide-double > view + text,
.divide-double > text + view,
.divide-double > text + text {
  --tw-border-style: double;
  border-style: double;
}
.divide-_b_h41eb04_B > view + view,
.divide-_b_h41eb04_B > view + text,
.divide-_b_h41eb04_B > text + view,
.divide-_b_h41eb04_B > text + text {
  border-color: #41eb04;
}
.divide-_b_hd80c0c_B > view + view,
.divide-_b_hd80c0c_B > view + text,
.divide-_b_hd80c0c_B > text + view,
.divide-_b_hd80c0c_B > text + text {
  border-color: #d80c0c;
}
.rounded {
  border-radius: 8rpx;
}
.rounded-full {
  border-radius: 9999px;
}
.rounded-xl {
  border-radius: 16rpx;
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.bg-_b_h0000ff_B {
  background-color: #00f;
}
.bg-_b_h123498_B {
  background-color: #123498;
}
.bg-emerald-500 {
  background-color: var(--color-emerald-500);
}
.bg-midnight {
  background-color: var(--color-midnight);
}
.bg-neutral-1B {
  background-color: var(--color-neutral-1B);
}
.bg-white {
  background-color: var(--color-white);
}
.fill-bermuda {
  fill: var(--color-bermuda);
}
.p-2 {
  padding: calc(var(--spacing) * 2);
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
.text-_b102_d43rpx_B {
  font-size: 102.43rpx;
}
.text-_b45rpx_B {
  font-size: 45rpx;
}
.text-center {
  text-align: center;
}
.text-sm {
  font-size: var(--text-sm);
  line-height: var(--tw-leading, var(--text-sm--line-height));
}
.font-bold {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: var(--font-weight-bold);
}
.text-_b_h00f285_B {
  color: #00f285;
}
.text-neutral-66 {
  color: var(--color-neutral-66);
}
.text-slate-900 {
  color: var(--color-slate-900);
}
.text-tahiti {
  color: var(--color-tahiti);
}
.text-white {
  color: var(--color-white);
}
.underline {
  text-decoration-line: underline;
}
.shadow-sm {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.divide-x-reverse > view + view,
.divide-x-reverse > view + text,
.divide-x-reverse > text + view,
.divide-x-reverse > text + text {
  --tw-divide-x-reverse: 1;
}
.active_cbg-emerald-600:active {
  background-color: var(--color-emerald-600);
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
.layer-card-v4 {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-midnight);
}
.reset-button {
  display: block;
}
page {
  --status-bar-height: 25px;
  --top-window-height: 0px;
  --window-top: 0px;
  --window-bottom: 0px;
  --window-left: 0px;
  --window-right: 0px;
  --window-magin: 0px;
}
[data-c-h='true'] {
  display: none !important;
}
 /* tokens: mt-2 <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: mt-4 <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: mt-6 <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: i-mdi-home <= src/pages/index/index.vue */
 /* tokens: flex <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: aspect-(--my-aspect-ratio) <= src/pages/index/index.vue */
 /* tokens: aspect-[calc(4*3+1)/3] <= src/pages/index/index.vue */
 /* tokens: h-12 <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: h-20 <= src/pages/index/index.vue */
 /* tokens: w-12 <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: w-20 <= src/pages/index/index.vue */
 /* tokens: flex-col <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: flex-col-reverse <= src/pages/index/index.vue */
 /* tokens: flex-row-reverse <= src/pages/index/index.vue */
 /* tokens: items-center <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: gap-3 <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: space-y-4 <= src/pages/index/index.vue */
 /* tokens: space-y-reverse <= src/pages/index/index.vue */
 /* tokens: space-x-4 <= src/pages/index/index.vue */
 /* tokens: space-x-reverse <= src/pages/index/index.vue */
 /* tokens: divide-x-4 <= src/pages/index/index.vue */
 /* tokens: divide-y-4 <= src/pages/index/index.vue */
 /* tokens: divide-y-reverse <= src/pages/index/index.vue */
 /* tokens: divide-dotted <= src/pages/index/index.vue */
 /* tokens: divide-double <= src/pages/index/index.vue */
 /* tokens: divide-[#41eb04] <= src/pages/index/index.vue */
 /* tokens: divide-[#d80c0c] <= src/pages/index/index.vue */
 /* tokens: rounded <= src/pages/index/index.vue */
 /* tokens: rounded-full <= src/pages/index/index.vue */
 /* tokens: rounded-xl <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: border <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: bg-[#0000ff] <= src/pages/index/index.vue */
.bg-_b_h0000ff_B {
  background-color: #0000ff;
}
 /* tokens: bg-[#123498] <= src/pages/index/index.vue */
 /* tokens: bg-emerald-500 <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: bg-midnight <= src/pages/index/index.vue */
 /* tokens: bg-neutral-1B <= src/pages/index/index.vue */
 /* tokens: bg-white <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: fill-bermuda <= src/pages/index/index.vue */
 /* tokens: p-2 <= src/pages/index/index.vue */
 /* tokens: px-3 <= src/pages/index/index.vue */
 /* tokens: px-4 <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: py-2 <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: py-3 <= src/pages/index/index.vue */
 /* tokens: text-center <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: text-sm <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: text-[45rpx] <= src/pages/index/index.vue */
 /* tokens: text-[102.43rpx] <= src/pages/index/index.vue */
 /* tokens: font-bold <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: text-[#00f285] <= src/pages/index/index.vue */
 /* tokens: text-neutral-66 <= src/pages/index/index.vue */
 /* tokens: text-slate-900 <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: text-tahiti <= src/pages/index/index.vue */
 /* tokens: text-white <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: underline <= src/pages/index/index.vue */
 /* tokens: shadow-sm <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
.shadow-sm {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
 /* tokens: divide-x-reverse <= src/pages/index/index.vue */
 /* tokens: active:bg-emerald-600 <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: dark:bg-zinc-900 <= src/pages/index/index.vue | theme-dark <= src/pages/index/index.vue */
.dark_cbg-zinc-900.theme-dark {
  background-color: var(--color-zinc-900);
}
 /* tokens: theme-dark <= src/pages/index/index.vue | dark:bg-zinc-900 <= src/pages/index/index.vue */
.theme-dark .dark_cbg-zinc-900 {
  background-color: var(--color-zinc-900);
}
 /* tokens: dark:bg-zinc-950 <= src/pages/index/index.vue | theme-dark <= src/pages/index/index.vue */
.dark_cbg-zinc-950.theme-dark {
  background-color: var(--color-zinc-950);
}
 /* tokens: theme-dark <= src/pages/index/index.vue | dark:bg-zinc-950 <= src/pages/index/index.vue */
.theme-dark .dark_cbg-zinc-950 {
  background-color: var(--color-zinc-950);
}
 /* tokens: dark:text-zinc-50 <= src/pages/index/index.vue | theme-dark <= src/pages/index/index.vue */
.dark_ctext-zinc-50.theme-dark {
  color: var(--color-zinc-50);
}
 /* tokens: theme-dark <= src/pages/index/index.vue | dark:text-zinc-50 <= src/pages/index/index.vue */
.theme-dark .dark_ctext-zinc-50 {
  color: var(--color-zinc-50);
}
@media (prefers-color-scheme: dark) {
 /* tokens: system-dark:bg-slate-900 <= src/pages/index/index.vue */
  .system-dark_cbg-slate-900 {
    background-color: var(--color-slate-900);
  }
}
@media (prefers-color-scheme: dark) {
 /* tokens: system-dark:text-slate-100 <= src/pages/index/index.vue */
  .system-dark_ctext-slate-100 {
    color: var(--color-slate-100);
  }
}
/* stylelint-disable custom-property-pattern */
/* Core plugin extractor sources are intentionally not loaded here. */
 /* tokens: mt-2 <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: mt-4 <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: mt-6 <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: i-mdi-home <= src/pages/index/index.vue */
 /* tokens: flex <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: aspect-(--my-aspect-ratio) <= src/pages/index/index.vue */
 /* tokens: aspect-[calc(4*3+1)/3] <= src/pages/index/index.vue */
 /* tokens: h-12 <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: h-20 <= src/pages/index/index.vue */
 /* tokens: w-12 <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: w-20 <= src/pages/index/index.vue */
 /* tokens: flex-col <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: flex-col-reverse <= src/pages/index/index.vue */
 /* tokens: flex-row-reverse <= src/pages/index/index.vue */
 /* tokens: items-center <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: gap-3 <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: space-y-4 <= src/pages/index/index.vue */
 /* tokens: space-y-reverse <= src/pages/index/index.vue */
 /* tokens: space-x-4 <= src/pages/index/index.vue */
 /* tokens: space-x-reverse <= src/pages/index/index.vue */
 /* tokens: divide-x-4 <= src/pages/index/index.vue */
 /* tokens: divide-y-4 <= src/pages/index/index.vue */
 /* tokens: divide-y-reverse <= src/pages/index/index.vue */
 /* tokens: divide-dotted <= src/pages/index/index.vue */
 /* tokens: divide-double <= src/pages/index/index.vue */
 /* tokens: divide-[#41eb04] <= src/pages/index/index.vue */
 /* tokens: divide-[#d80c0c] <= src/pages/index/index.vue */
 /* tokens: rounded <= src/pages/index/index.vue */
 /* tokens: rounded-full <= src/pages/index/index.vue */
 /* tokens: rounded-xl <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: border <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: bg-[#0000ff] <= src/pages/index/index.vue */
 /* tokens: bg-[#123498] <= src/pages/index/index.vue */
 /* tokens: bg-emerald-500 <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: bg-midnight <= src/pages/index/index.vue */
 /* tokens: bg-neutral-1B <= src/pages/index/index.vue */
 /* tokens: bg-white <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: fill-bermuda <= src/pages/index/index.vue */
 /* tokens: p-2 <= src/pages/index/index.vue */
 /* tokens: px-3 <= src/pages/index/index.vue */
 /* tokens: px-4 <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: py-2 <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: py-3 <= src/pages/index/index.vue */
 /* tokens: text-center <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: text-sm <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: text-[45rpx] <= src/pages/index/index.vue */
 /* tokens: text-[102.43rpx] <= src/pages/index/index.vue */
 /* tokens: font-bold <= src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: text-[#00f285] <= src/pages/index/index.vue */
 /* tokens: text-neutral-66 <= src/pages/index/index.vue */
 /* tokens: text-slate-900 <= src/pages-order/pages/home/home.vue, src/pages-order/pages/user/user.vue, src/pages/index/index.vue */
 /* tokens: text-tahiti <= src/pages/index/index.vue */
 /* tokens: text-white <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: underline <= src/pages/index/index.vue */
 /* tokens: shadow-sm <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: divide-x-reverse <= src/pages/index/index.vue */
 /* tokens: active:bg-emerald-600 <= src/pages-order/pages/home/home.vue, src/pages/index/index.vue */
 /* tokens: dark:bg-zinc-900 <= src/pages/index/index.vue | theme-dark <= src/pages/index/index.vue */
 /* tokens: theme-dark <= src/pages/index/index.vue | dark:bg-zinc-900 <= src/pages/index/index.vue */
 /* tokens: dark:bg-zinc-950 <= src/pages/index/index.vue | theme-dark <= src/pages/index/index.vue */
 /* tokens: theme-dark <= src/pages/index/index.vue | dark:bg-zinc-950 <= src/pages/index/index.vue */
 /* tokens: dark:text-zinc-50 <= src/pages/index/index.vue | theme-dark <= src/pages/index/index.vue */
 /* tokens: theme-dark <= src/pages/index/index.vue | dark:text-zinc-50 <= src/pages/index/index.vue */
```

### pages-order/pages/home/home.wxss

```css
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-border-style: solid;
  --tw-font-weight:;
  --tw-leading:;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-color: initial;
  --tw-inset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-inset-ring-shadow: 0 0 #0000;
  --tw-ring-offset-shadow: 0 0 #0000;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-emerald-50: rgb(236, 253, 245);
  --color-emerald-100: rgb(208, 250, 229);
  --color-emerald-500: rgb(0, 185, 129);
  --color-emerald-600: rgb(0, 150, 105);
  --color-slate-50: rgb(248, 250, 252);
  --color-slate-200: rgb(226, 232, 240);
  --color-slate-500: rgb(98, 116, 142);
  --color-slate-800: rgb(29, 41, 61);
  --color-slate-900: rgb(15, 23, 43);
  --color-white: #fff;
  --spacing: 8rpx;
  --text-xs: 24rpx;
  --text-xs--line-height: 1.33333;
  --text-sm: 28rpx;
  --text-sm--line-height: 1.42857;
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --text-lg: 36rpx;
  --text-lg--line-height: 1.55556;
  --text-xl: 40rpx;
  --text-xl--line-height: 1.4;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
.mt-4 {
  margin-top: calc(var(--spacing) * 4);
}
.mt-6 {
  margin-top: calc(var(--spacing) * 6);
}
.mt-8 {
  margin-top: calc(var(--spacing) * 8);
}
.block {
  display: block;
}
.flex {
  display: flex;
}
.h-12 {
  height: calc(var(--spacing) * 12);
}
.min-h-screen {
  min-height: 100vh;
}
.w-12 {
  width: calc(var(--spacing) * 12);
}
.flex-1 {
  flex: 1;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.gap-1 {
  gap: calc(var(--spacing) * 1);
}
.gap-3 {
  gap: calc(var(--spacing) * 3);
}
.rounded-xl {
  border-radius: 16rpx;
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-emerald-500 {
  border-color: var(--color-emerald-500);
}
.border-slate-200 {
  border-color: var(--color-slate-200);
}
.bg-emerald-100 {
  background-color: var(--color-emerald-100);
}
.bg-emerald-500 {
  background-color: var(--color-emerald-500);
}
.bg-slate-50 {
  background-color: var(--color-slate-50);
}
.bg-white {
  background-color: var(--color-white);
}
.p-5 {
  padding: calc(var(--spacing) * 5);
}
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.py-2 {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.py-6 {
  padding-top: calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 6);
}
.text-base {
  font-size: var(--text-base);
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-center {
  text-align: center;
}
.text-lg {
  font-size: var(--text-lg);
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-sm {
  font-size: var(--text-sm);
  line-height: var(--tw-leading, var(--text-sm--line-height));
}
.text-xl {
  font-size: var(--text-xl);
  line-height: var(--tw-leading, var(--text-xl--line-height));
}
.text-xs {
  font-size: var(--text-xs);
  line-height: var(--tw-leading, var(--text-xs--line-height));
}
.leading-6 {
  --tw-leading: calc(var(--spacing) * 6);
  line-height: calc(var(--spacing) * 6);
}
.font-bold {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: var(--font-weight-bold);
}
.font-medium {
  --tw-font-weight: var(--font-weight-medium);
  font-weight: var(--font-weight-medium);
}
.font-semibold {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: var(--font-weight-semibold);
}
.text-_b_h929292_B {
  color: #929292;
}
.text-emerald-600 {
  color: var(--color-emerald-600);
}
.text-slate-500 {
  color: var(--color-slate-500);
}
.text-slate-800 {
  color: var(--color-slate-800);
}
.text-slate-900 {
  color: var(--color-slate-900);
}
.text-white {
  color: var(--color-white);
}
.shadow {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-sm {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.active_cbg-emerald-50:active {
  background-color: var(--color-emerald-50);
}
.active_cbg-emerald-600:active {
  background-color: var(--color-emerald-600);
}
```

### pages-order/pages/user/user.wxss

```css
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-border-style: solid;
  --tw-font-weight:;
  --tw-leading:;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-color: initial;
  --tw-inset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-inset-ring-shadow: 0 0 #0000;
  --tw-ring-offset-shadow: 0 0 #0000;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-emerald-50: rgb(236, 253, 245);
  --color-emerald-100: rgb(208, 250, 229);
  --color-emerald-500: rgb(0, 185, 129);
  --color-emerald-600: rgb(0, 150, 105);
  --color-slate-50: rgb(248, 250, 252);
  --color-slate-200: rgb(226, 232, 240);
  --color-slate-500: rgb(98, 116, 142);
  --color-slate-800: rgb(29, 41, 61);
  --color-slate-900: rgb(15, 23, 43);
  --color-white: #fff;
  --spacing: 8rpx;
  --text-xs: 24rpx;
  --text-xs--line-height: 1.33333;
  --text-sm: 28rpx;
  --text-sm--line-height: 1.42857;
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --text-lg: 36rpx;
  --text-lg--line-height: 1.55556;
  --text-xl: 40rpx;
  --text-xl--line-height: 1.4;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
.mt-4 {
  margin-top: calc(var(--spacing) * 4);
}
.mt-6 {
  margin-top: calc(var(--spacing) * 6);
}
.mt-8 {
  margin-top: calc(var(--spacing) * 8);
}
.block {
  display: block;
}
.flex {
  display: flex;
}
.h-12 {
  height: calc(var(--spacing) * 12);
}
.min-h-screen {
  min-height: 100vh;
}
.w-12 {
  width: calc(var(--spacing) * 12);
}
.flex-1 {
  flex: 1;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.gap-1 {
  gap: calc(var(--spacing) * 1);
}
.gap-3 {
  gap: calc(var(--spacing) * 3);
}
.rounded-xl {
  border-radius: 16rpx;
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-emerald-500 {
  border-color: var(--color-emerald-500);
}
.border-slate-200 {
  border-color: var(--color-slate-200);
}
.bg-emerald-100 {
  background-color: var(--color-emerald-100);
}
.bg-emerald-500 {
  background-color: var(--color-emerald-500);
}
.bg-slate-50 {
  background-color: var(--color-slate-50);
}
.bg-white {
  background-color: var(--color-white);
}
.p-5 {
  padding: calc(var(--spacing) * 5);
}
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.py-2 {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.py-6 {
  padding-top: calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 6);
}
.text-base {
  font-size: var(--text-base);
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-center {
  text-align: center;
}
.text-lg {
  font-size: var(--text-lg);
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-sm {
  font-size: var(--text-sm);
  line-height: var(--tw-leading, var(--text-sm--line-height));
}
.text-xl {
  font-size: var(--text-xl);
  line-height: var(--tw-leading, var(--text-xl--line-height));
}
.text-xs {
  font-size: var(--text-xs);
  line-height: var(--tw-leading, var(--text-xs--line-height));
}
.leading-6 {
  --tw-leading: calc(var(--spacing) * 6);
  line-height: calc(var(--spacing) * 6);
}
.font-bold {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: var(--font-weight-bold);
}
.font-medium {
  --tw-font-weight: var(--font-weight-medium);
  font-weight: var(--font-weight-medium);
}
.font-semibold {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: var(--font-weight-semibold);
}
.text-_b_h929292_B {
  color: #929292;
}
.text-emerald-600 {
  color: var(--color-emerald-600);
}
.text-slate-500 {
  color: var(--color-slate-500);
}
.text-slate-800 {
  color: var(--color-slate-800);
}
.text-slate-900 {
  color: var(--color-slate-900);
}
.text-white {
  color: var(--color-white);
}
.shadow {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-sm {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.active_cbg-emerald-50:active {
  background-color: var(--color-emerald-50);
}
.active_cbg-emerald-600:active {
  background-color: var(--color-emerald-600);
}
```
