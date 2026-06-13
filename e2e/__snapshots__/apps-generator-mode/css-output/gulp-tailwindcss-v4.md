# gulp-tailwindcss-v4 CSS Output

Fixture: demo
Entry: gulp-tailwindcss-v4/dist/app.wxss
Generator CSS files: app.wxss, index.wxss, index.wxss, index.wxss, more.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| 14374 | 73 | false | false | false | true | true | false | true |

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
  --tw-space-y-reverse: 0;
  --tw-border-style: solid;
  --tw-font-weight: initial;
  --tw-leading:;
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
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --color-white: #fff;
  --color-slate-900: rgb(15, 23, 43);
  --spacing: 8rpx;
  --text-xs: 24rpx;
  --text-xs--line-height: 1.33333;
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --text-lg: 36rpx;
  --text-lg--line-height: 1.55556;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
textarea {
  resize: vertical;
}
button {
  appearance: button;
}
/* tokens: m-[20px] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.m-_b20px_B {
  margin: 40rpx;
}
/* tokens: mt-2 <= src/pages/index/index.wxml */
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
/* tokens: mt-4 <= src/pages/index/index.wxml */
.mt-4 {
  margin-top: calc(var(--spacing) * 4);
}
/* tokens: mt-[24px] <= src/pages/index/index.ts, src/pages/index/index.ttml, src/pages/index/index.wxml */
.mt-_b24px_B {
  margin-top: 48rpx;
}
/* tokens: mt-[33px] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.mt-_b33px_B {
  margin-top: 66rpx;
}
/* tokens: mb-[20px] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.mb-_b20px_B {
  margin-bottom: 40rpx;
}
/* tokens: i-mdi-123 <= src/pages/index/index.wxml */
.i-mdi-123 {
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
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M4 17V9H2V7h4v10zm18-2a2 2 0 0 1-2 2h-4v-2h4v-2h-2v-2h2V9h-4V7h4a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 1-1.5 1.5a1.5 1.5 0 0 1 1.5 1.5zm-8 0v2H8v-4a2 2 0 0 1 2-2h2V9H8V7h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v2z'/%3E%3C/svg%3E");
}
/* tokens: i-mdi-ab-testing <= src/pages/index/index.wxml */
.i-mdi-ab-testing {
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
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M4 2a2 2 0 0 0-2 2v8h2V8h2v4h2V4a2 2 0 0 0-2-2zm0 2h2v2H4m18 9.5V14a2 2 0 0 0-2-2h-4v10h4a2 2 0 0 0 2-2v-1.5a1.54 1.54 0 0 0-1.5-1.5a1.54 1.54 0 0 0 1.5-1.5M20 20h-2v-2h2zm0-4h-2v-2h2M5.79 21.61l-1.58-1.22l14-18l1.58 1.22Z'/%3E%3C/svg%3E");
}
/* tokens: i-mdi-abacus <= src/pages/index/index.wxml */
.i-mdi-abacus {
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
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M5 5h2v6H5zm5 0H8v6h2zM5 19h2v-6H5zm5-6H8v6h2v-2h5v-2h-5zm-8 8h2V3H2zM20 3v4h-7V5h-2v6h2V9h7v6h-2v-2h-2v6h2v-2h2v4h2V3z'/%3E%3C/svg%3E");
}
/* tokens: i-mdi-typewriter <= src/pages/index/index.wxml */
.i-mdi-typewriter {
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
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M20 13h-4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2H4l-2 5v2c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-2M6 20c-.89 0-1.34-1.08-.71-1.71S7 18.11 7 19c0 .55-.45 1-1 1m4 0c-.89 0-1.34-1.08-.71-1.71S11 18.11 11 19c0 .55-.45 1-1 1m4 0c-.89 0-1.34-1.08-.71-1.71S15 18.11 15 19c0 .55-.45 1-1 1m4 0c-.89 0-1.34-1.08-.71-1.71S19 18.11 19 19c0 .55-.45 1-1 1m0-10V3H6v7H3v2h18v-2M8 5h8v1H8m0 1h6v1H8'/%3E%3C/svg%3E");
}
/* tokens: block <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.block {
  display: block;
}
/* tokens: h-[41.54vw] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.h-_b41_d54vw_B {
  height: 41.54vw;
}
/* tokens: h-full <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.h-full {
  height: 100%;
}
/* tokens: w-screen <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.w-screen {
  width: 100vw;
}
/* tokens: space-y-1 <= src/pages/more/more.wxml */
.space-y-1 > view + view,
.space-y-1 > view + text,
.space-y-1 > text + view,
.space-y-1 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 1) * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 1) * (1 - var(--tw-space-y-reverse)));
}
/* tokens: space-y-4 <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
}
/* tokens: space-y-[2rem] <= src/pages/more/more.ttml */
.space-y-_b2rem_B > view + view,
.space-y-_b2rem_B > view + text,
.space-y-_b2rem_B > text + view,
.space-y-_b2rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(64rpx * var(--tw-space-y-reverse));
  margin-top: calc(64rpx * (1 - var(--tw-space-y-reverse)));
}
/* tokens: rounded <= src/pages/index/index.wxml */
.rounded {
  border-radius: 8rpx;
}
/* tokens: border-b <= src/pages/index/index.ttml, src/pages/index/index.wxml, src/pages/more/more.ttml, src/pages/more/more.wxml */
.border-b {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 2rpx;
}
/* tokens: border-[#EEEEEE] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.border-_b_hEEEEEE_B {
  border-color: #eeeeee;
}
/* tokens: bg-[#fff] <= src/pages/index/index.ts */
.bg-_b_hfff_B {
  background-color: #fff;
}
/* tokens: bg-[red] <= src/pages/index/index.wxml */
.bg-_bred_B {
  background-color: red;
}
/* tokens: bg-white <= src/pages/index/index.wxml */
.bg-white {
  background-color: var(--color-white);
}
/* tokens: bg-[url('https://xxx.com/xx.webp')] <= src/pages/index/index.ts */
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
}
/* tokens: bg-[url(https://pic1.zhimg.com/v2-3ee20468f54bbfefcd0027283b21aaa8_720w.jpg)] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.bg-_burl_phttps_c_f_fpic1_dzhimg_dcom_fv2-3ee20468f54bbfefcd0027283b21aaa8_720w_djpg_P_B {
  background-image: url(https://pic1.zhimg.com/v2-3ee20468f54bbfefcd0027283b21aaa8_720w.jpg);
}
/* tokens: bg-[length:100%_100%] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.bg-_blength_c100_v_100_v_B {
  background-size: 100% 100%;
}
/* tokens: bg-no-repeat <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.bg-no-repeat {
  background-repeat: no-repeat;
}
/* tokens: p-4 <= src/pages/more/more.ttml, src/pages/more/more.wxml */
.p-4 {
  padding: calc(var(--spacing) * 4);
}
/* tokens: px-3 <= src/pages/index/index.wxml */
.px-3 {
  padding-left: calc(var(--spacing) * 3);
  padding-right: calc(var(--spacing) * 3);
}
/* tokens: px-4 <= src/pages/index/index.wxml */
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
/* tokens: py-2 <= src/pages/index/index.wxml */
.py-2 {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
/* tokens: py-3 <= src/pages/index/index.wxml */
.py-3 {
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
/* tokens: pb-[10px] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.pb-_b10px_B {
  padding-bottom: 20rpx;
}
/* tokens: pl-[15px] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.pl-_b15px_B {
  padding-left: 30rpx;
}
/* tokens: text-center <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.text-center {
  text-align: center;
}
/* tokens: text-left <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.text-left {
  text-align: left;
}
/* tokens: text-base <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.text-base {
  font-size: var(--text-base);
  line-height: var(--tw-leading, var(--text-base--line-height));
}
/* tokens: text-lg <= src/pages/more/more.ttml, src/pages/more/more.wxml */
.text-lg {
  font-size: var(--text-lg);
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
/* tokens: text-xs <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.text-xs {
  font-size: var(--text-xs);
  line-height: var(--tw-leading, var(--text-xs--line-height));
}
/* tokens: text-[14px] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.text-_b14px_B {
  font-size: 28rpx;
}
/* tokens: text-[50px] <= src/pages/index/index.ts */
.text-_b50px_B {
  font-size: 100rpx;
}
/* tokens: font-bold <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.font-bold {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: var(--font-weight-bold);
}
/* tokens: font-medium <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.font-medium {
  --tw-font-weight: var(--font-weight-medium);
  font-weight: var(--font-weight-medium);
}
/* tokens: text-[#5ba4e5] <= src/pages/index/index.ttml, src/pages/index/index.wxml */
.text-_b_h5ba4e5_B {
  color: #5ba4e5;
}
/* tokens: text-[#123456] <= src/pages/index/index.ts */
.text-_b_h123456_B {
  color: #123456;
}
/* tokens: text-slate-900 <= src/pages/index/index.wxml */
.text-slate-900 {
  color: var(--color-slate-900);
}
/* tokens: dark:bg-zinc-900 <= src/pages/index/index.wxml | theme-dark <= src/pages/index/index.wxml */
.dark_cbg-zinc-900.theme-dark {
  background-color: var(--color-zinc-900);
}
/* tokens: theme-dark <= src/pages/index/index.wxml | dark:bg-zinc-900 <= src/pages/index/index.wxml */
.theme-dark .dark_cbg-zinc-900 {
  background-color: var(--color-zinc-900);
}
/* tokens: dark:bg-zinc-950 <= src/pages/index/index.wxml | theme-dark <= src/pages/index/index.wxml */
.dark_cbg-zinc-950.theme-dark {
  background-color: var(--color-zinc-950);
}
/* tokens: theme-dark <= src/pages/index/index.wxml | dark:bg-zinc-950 <= src/pages/index/index.wxml */
.theme-dark .dark_cbg-zinc-950 {
  background-color: var(--color-zinc-950);
}
/* tokens: dark:text-zinc-50 <= src/pages/index/index.wxml | theme-dark <= src/pages/index/index.wxml */
.dark_ctext-zinc-50.theme-dark {
  color: var(--color-zinc-50);
}
/* tokens: theme-dark <= src/pages/index/index.wxml | dark:text-zinc-50 <= src/pages/index/index.wxml */
.theme-dark .dark_ctext-zinc-50 {
  color: var(--color-zinc-50);
}
@media (prefers-color-scheme: dark) {
  /* tokens: system-dark:bg-slate-900 <= src/pages/index/index.wxml */
  .system-dark_cbg-slate-900 {
    background-color: var(--color-slate-900);
  }
}
@media (prefers-color-scheme: dark) {
  /* tokens: system-dark:text-slate-100 <= src/pages/index/index.wxml */
  .system-dark_ctext-slate-100 {
    color: var(--color-slate-100);
  }
}
```

### index.wxss

```css

```

### index.wxss

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
textarea {
  resize: vertical;
}
/* tokens: bg-independent-subpackage-marker <= src/sub-independent/pages/index.ttml, src/sub-independent/pages/index.wxml */
.before_ccontent-_b_aindependent_subpackage_gulp-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage gulp-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: before:content-['independent_subpackage_gulp-tailwindcss-v4'] <= src/sub-independent/pages/index.ttml, src/sub-independent/pages/index.wxml */
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
```

### index.wxss

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
textarea {
  resize: vertical;
}
/* tokens: bg-normal-subpackage-marker <= src/sub-normal/pages/index.ttml, src/sub-normal/pages/index.wxml */
.before_ccontent-_b_anormal_subpackage_gulp-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage gulp-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_gulp-tailwindcss-v4'] <= src/sub-normal/pages/index.ttml, src/sub-normal/pages/index.wxml */
.bg-normal-subpackage-marker {
  background-color: #2563eb;
}
```

### more.wxss

```css
.more__pre {
  white-space: pre;
  text-align: left;
  overflow: auto;
  border: 2rpx solid #ebebeb;
  background-color: #f9f9f9;
  padding-left: 10rpx;
}
.more__pre text {
  font-size: 24rpx;
}
```
