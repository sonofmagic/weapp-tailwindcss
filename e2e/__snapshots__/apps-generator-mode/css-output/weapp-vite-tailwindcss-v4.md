# weapp-vite-tailwindcss-v4 CSS Output

Fixture: demo
Entry: weapp-vite-tailwindcss-v4/dist/app.wxss
Generator CSS files: app.wxss, apple.wxss, index.wxss, index.wxss, index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 16663 | 67 | false | false | false | false | true |

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
  --tw-space-x-reverse: 0;
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
  --tw-duration: initial;
  --tw-ease: initial;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-slate-700: #334155;
  --color-gray-900: #111827;
  --color-sky-600: #0284c7;
  --color-violet-600: #7c3aed;
  --color-rose-600: #e11d48;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-emerald-600: rgb(0, 150, 105);
  --color-blue-500: rgb(50, 128, 255);
  --color-slate-200: rgb(226, 232, 240);
  --color-slate-800: rgb(29, 41, 61);
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --color-red-700: rgb(191, 0, 15);
  --color-amber-300: rgb(255, 210, 55);
  --color-pink-300: rgb(253, 165, 213);
  --spacing: 8rpx;
  --default-transition-duration: 150ms;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
/* tokens: icon-[mdi--account] <= pages/index/index.wxml */
.icon-_bmdi--account_B {
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
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4'/%3E%3C/svg%3E");
}
/* tokens: icon-[mdi--home] <= pages/index/index.wxml */
.icon-_bmdi--home_B {
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
/* tokens: iconify-[lucide--bell] <= pages/index/index.wxml */
.iconify-_blucide--bell_B {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10.268 21a2 2 0 0 0 3.464 0m-10.47-5.674A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326'/%3E%3C/svg%3E");
}
/* tokens: iconify-[lucide--settings] <= pages/index/index.wxml */
.iconify-_blucide--settings_B {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cg fill='none' stroke='black' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath d='M9.671 4.136a2.34 2.34 0 0 1 4.659 0a2.34 2.34 0 0 0 3.319 1.915a2.34 2.34 0 0 1 2.33 4.033a2.34 2.34 0 0 0 0 3.831a2.34 2.34 0 0 1-2.33 4.033a2.34 2.34 0 0 0-3.319 1.915a2.34 2.34 0 0 1-4.659 0a2.34 2.34 0 0 0-3.32-1.915a2.34 2.34 0 0 1-2.33-4.033a2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/g%3E%3C/svg%3E");
}
/* tokens: flex <= pages/index/index.wxml */
.flex {
  display: flex;
}
/* tokens: hidden <= pages/index/index.wxml */
.hidden {
  display: none;
}
/* tokens: inline-block <= pages/index/index.wxml */
.inline-block {
  display: inline-block;
}
/* tokens: size-8 <= pages/index/index.wxml */
.size-8 {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
}
/* tokens: size-12 <= pages/index/index.wxml */
.size-12 {
  width: calc(var(--spacing) * 12);
  height: calc(var(--spacing) * 12);
}
/* tokens: h-10 <= pages/index/index.wxml */
.h-10 {
  height: calc(var(--spacing) * 10);
}
/* tokens: h-[30px] <= pages/index/index.wxml */
.h-_b30px_B {
  height: 30px;
}
/* tokens: h-[45px] <= pages/index/index.wxml */
.h-_b45px_B {
  height: 45px;
}
/* tokens: min-h-screen <= pages/index/index.wxml */
.min-h-screen {
  min-height: 100vh;
}
/* tokens: w-[50px] <= pages/index/index.wxml */
.w-_b50px_B {
  width: 50px;
}
/* tokens: w-[323px] <= pages/index/index.wxml */
.w-_b323px_B {
  width: 323px;
}
/* tokens: flex-col <= pages/index/index.wxml */
.flex-col {
  flex-direction: column;
}
/* tokens: items-center <= pages/index/index.wxml */
.items-center {
  align-items: center;
}
/* tokens: gap-3 <= pages/index/index.wxml */
.gap-3 {
  gap: calc(var(--spacing) * 3);
}
/* tokens: space-y-2.5 <= pages/index/index.wxml */
.space-y-2_d5 > view + view,
.space-y-2_d5 > view + text,
.space-y-2_d5 > text + view,
.space-y-2_d5 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 2.5) * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 2.5) * (1 - var(--tw-space-y-reverse)));
}
/* tokens: space-x-2.5 <= pages/index/index.wxml */
.space-x-2_d5 > view + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: calc((var(--spacing) * 2.5) * var(--tw-space-x-reverse));
  margin-left: calc((var(--spacing) * 2.5) * (1 - var(--tw-space-x-reverse)));
}
/* tokens: border-4 <= pages/index/index.wxml */
.border-4 {
  border-style: var(--tw-border-style);
  border-width: 4px;
}
/* tokens: bg-[#3a32d1] <= pages/index/index.wxml */
.bg-_b_h3a32d1_B {
  background-color: #3a32d1;
}
/* tokens: bg-[#68c828] <= pages/index/index.wxml */
.bg-_b_h68c828_B {
  background-color: #68c828;
}
/* tokens: bg-[#111111] <= pages/index/index.wxml */
.bg-_b_h111111_B {
  background-color: #111111;
}
/* tokens: bg-amber-300 <= pages/index/index.wxml */
.bg-amber-300 {
  background-color: var(--color-amber-300);
}
/* tokens: bg-blue-500/30 <= pages/index/index.wxml */
.bg-blue-500_f30 {
  background-color: rgba(50, 128, 255, 0.3);
}
/* tokens: bg-gray-900 <= pages/index/index.wxml */
.bg-gray-900 {
  background-color: var(--color-gray-900);
}
/* tokens: bg-zinc-50 <= pages/index/index.wxml */
.bg-zinc-50 {
  background-color: var(--color-zinc-50);
}
/* tokens: bg-gradient-to-b <= pages/index/index.wxml */
.bg-gradient-to-b {
  --tw-gradient-position: to bottom;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
/* tokens: bg-gradient-to-t <= pages/index/index.wxml */
.bg-gradient-to-t {
  --tw-gradient-position: to top;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
/* tokens: bg-gradient-to-tr <= pages/index/index.wxml */
.bg-gradient-to-tr {
  --tw-gradient-position: to top right;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
/* tokens: from-[#2f73f1] <= pages/index/index.wxml */
.from-_b_h2f73f1_B {
  --tw-gradient-from: #2f73f1;
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
/* tokens: to-[#4bcefd] <= pages/index/index.wxml */
.to-_b_h4bcefd_B {
  --tw-gradient-to: #4bcefd;
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
/* tokens: p-4 <= pages/index/index.wxml */
.p-4 {
  padding: calc(var(--spacing) * 4);
}
/* tokens: text-[100px] <= pages/index/index.wxml */
.text-_b100px_B {
  font-size: 100px;
}
/* tokens: text-[55rpx] <= pages/index/index.wxml */
.text-_b55rpx_B {
  font-size: 55rpx;
}
/* tokens: text-[100rpx] <= pages/index/index.wxml */
.text-_b100rpx_B {
  font-size: 100rpx;
}
/* tokens: text-[#123456] <= pages/index/index.wxml */
.text-_b_h123456_B {
  color: #123456;
}
/* tokens: text-blue-500 <= pages/index/index.wxml */
.text-blue-500 {
  color: var(--color-blue-500);
}
/* tokens: text-emerald-600 <= pages/index/index.wxml */
.text-emerald-600 {
  color: var(--color-emerald-600);
}
/* tokens: text-pink-300 <= pages/index/index.wxml */
.text-pink-300 {
  color: var(--color-pink-300);
}
/* tokens: text-red-700 <= pages/index/index.wxml */
.text-red-700 {
  color: var(--color-red-700);
}
/* tokens: text-rose-600 <= pages/index/index.wxml */
.text-rose-600 {
  color: var(--color-rose-600);
}
/* tokens: text-sky-600 <= pages/index/index.wxml */
.text-sky-600 {
  color: var(--color-sky-600);
}
/* tokens: text-slate-200 <= pages/index/index.wxml */
.text-slate-200 {
  color: var(--color-slate-200);
}
/* tokens: text-slate-700 <= pages/index/index.wxml */
.text-slate-700 {
  color: var(--color-slate-700);
}
/* tokens: text-slate-800 <= pages/index/index.wxml */
.text-slate-800 {
  color: var(--color-slate-800);
}
/* tokens: text-violet-600 <= pages/index/index.wxml */
.text-violet-600 {
  color: var(--color-violet-600);
}
/* tokens: transition-colors <= pages/index/index.wxml */
.transition-colors {
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
}
/* tokens: duration-500 <= pages/index/index.wxml */
.duration-500 {
  --tw-duration: 500ms;
  transition-duration: 500ms;
}
@media (prefers-color-scheme: dark) {
  /* tokens: dark:bg-zinc-900 <= pages/index/index.wxml */
  .dark_cbg-zinc-900 {
    background-color: var(--color-zinc-900);
  }
}
/* tokens: icon-[mdi--account] <= pages/index/index.wxml */
/* tokens: icon-[mdi--home] <= pages/index/index.wxml */
/* tokens: iconify-[lucide--bell] <= pages/index/index.wxml */
/* tokens: iconify-[lucide--settings] <= pages/index/index.wxml */
/* tokens: flex <= pages/index/index.wxml */
/* tokens: hidden <= pages/index/index.wxml */
/* tokens: inline-block <= pages/index/index.wxml */
/* tokens: size-8 <= pages/index/index.wxml */
.size-8 {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
}
/* tokens: size-12 <= pages/index/index.wxml */
.size-12 {
  width: calc(var(--spacing) * 12);
  height: calc(var(--spacing) * 12);
}
/* tokens: h-10 <= pages/index/index.wxml */
.h-10 {
  height: calc(var(--spacing) * 10);
}
/* tokens: h-[30px] <= pages/index/index.wxml */
/* tokens: h-[45px] <= pages/index/index.wxml */
/* tokens: min-h-screen <= pages/index/index.wxml */
/* tokens: w-[50px] <= pages/index/index.wxml */
/* tokens: w-[323px] <= pages/index/index.wxml */
/* tokens: flex-col <= pages/index/index.wxml */
/* tokens: items-center <= pages/index/index.wxml */
/* tokens: gap-3 <= pages/index/index.wxml */
.gap-3 {
  gap: calc(var(--spacing) * 3);
}
/* tokens: space-y-2.5 <= pages/index/index.wxml */
.space-y-2_d5 > view + view,
.space-y-2_d5 > view + text,
.space-y-2_d5 > text + view,
.space-y-2_d5 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(var(--spacing) * 2.5 * var(--tw-space-y-reverse));
  margin-top: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-y-reverse)));
}
/* tokens: space-x-2.5 <= pages/index/index.wxml */
.space-x-2_d5 > view + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: calc(var(--spacing) * 2.5 * var(--tw-space-x-reverse));
  margin-left: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-x-reverse)));
}
/* tokens: border-4 <= pages/index/index.wxml */
/* tokens: bg-[#3a32d1] <= pages/index/index.wxml */
/* tokens: bg-[#68c828] <= pages/index/index.wxml */
/* tokens: bg-[#111111] <= pages/index/index.wxml */
/* tokens: bg-amber-300 <= pages/index/index.wxml */
/* tokens: bg-blue-500/30 <= pages/index/index.wxml */
/* tokens: bg-gray-900 <= pages/index/index.wxml */
/* tokens: bg-zinc-50 <= pages/index/index.wxml */
/* tokens: bg-gradient-to-b <= pages/index/index.wxml */
/* tokens: bg-gradient-to-t <= pages/index/index.wxml */
/* tokens: bg-gradient-to-tr <= pages/index/index.wxml */
/* tokens: from-[#2f73f1] <= pages/index/index.wxml */
/* tokens: to-[#4bcefd] <= pages/index/index.wxml */
/* tokens: p-4 <= pages/index/index.wxml */
.p-4 {
  padding: calc(var(--spacing) * 4);
}
/* tokens: text-[100px] <= pages/index/index.wxml */
/* tokens: text-[55rpx] <= pages/index/index.wxml */
/* tokens: text-[100rpx] <= pages/index/index.wxml */
/* tokens: text-[#123456] <= pages/index/index.wxml */
/* tokens: text-blue-500 <= pages/index/index.wxml */
/* tokens: text-emerald-600 <= pages/index/index.wxml */
/* tokens: text-pink-300 <= pages/index/index.wxml */
/* tokens: text-red-700 <= pages/index/index.wxml */
/* tokens: text-rose-600 <= pages/index/index.wxml */
/* tokens: text-sky-600 <= pages/index/index.wxml */
/* tokens: text-slate-200 <= pages/index/index.wxml */
/* tokens: text-slate-700 <= pages/index/index.wxml */
/* tokens: text-slate-800 <= pages/index/index.wxml */
/* tokens: text-violet-600 <= pages/index/index.wxml */
/* tokens: transition-colors <= pages/index/index.wxml */
/* tokens: duration-500 <= pages/index/index.wxml */
@media (prefers-color-scheme: dark) {
  /* tokens: dark:bg-zinc-900 <= pages/index/index.wxml */
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
/* tokens: bg-independent-subpackage-marker <= sub-independent/pages/index.wxml */
.before_ccontent-_b_aindependent_subpackage_weapp-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage weapp-vite-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: before:content-['independent_subpackage_weapp-vite-tailwindcss-v4'] <= sub-independent/pages/index.wxml */
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
/* tokens: bg-normal-subpackage-marker <= sub-normal/pages/index.wxml */
.before_ccontent-_b_anormal_subpackage_weapp-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage weapp-vite-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_weapp-vite-tailwindcss-v4'] <= sub-normal/pages/index.wxml */
.bg-normal-subpackage-marker {
  background-color: #2563eb;
}
```
