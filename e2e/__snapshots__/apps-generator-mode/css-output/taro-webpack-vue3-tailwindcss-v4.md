# taro-webpack-vue3-tailwindcss-v4 CSS Output

Fixture: demo
Entry: taro-webpack-vue3-tailwindcss-v4/dist/app.wxss
Generator CSS files: app.wxss, index.wxss, index.wxss, index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 130024 | 532 | false | false | false | false | true |

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
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate-x:;
  --tw-rotate-y:;
  --tw-rotate-z:;
  --tw-skew-x:;
  --tw-skew-y:;
  --tw-space-x-reverse: 0;
  --tw-space-y-reverse: 0;
  --tw-border-style: solid;
  --tw-divide-x-reverse: 0;
  --tw-divide-y-reverse: 0;
  --tw-gradient-position: initial;
  --tw-gradient-from: #0000;
  --tw-gradient-to: #0000;
  --tw-gradient-stops: initial;
  --tw-gradient-via-stops: initial;
  --tw-gradient-from-position: 0%;
  --tw-gradient-to-position: 100%;
  --tw-font-weight:;
  --tw-blur:;
  --tw-brightness:;
  --tw-contrast:;
  --tw-grayscale:;
  --tw-hue-rotate:;
  --tw-invert:;
  --tw-saturate:;
  --tw-sepia:;
  --tw-drop-shadow:;
  --tw-backdrop-blur:;
  --tw-backdrop-brightness:;
  --tw-backdrop-contrast:;
  --tw-backdrop-grayscale:;
  --tw-backdrop-hue-rotate:;
  --tw-backdrop-invert:;
  --tw-backdrop-opacity:;
  --tw-backdrop-saturate:;
  --tw-backdrop-sepia:;
  --tw-duration: initial;
  --tw-ease: initial;
  --tw-content: '';
  --tw-leading:;
  --tw-tracking:;
  --tw-outline-style: solid;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-color: initial;
  --tw-inset-shadow: 0 0 #0000;
  --tw-ring-color:;
  --tw-ring-shadow: 0 0 #0000;
  --tw-inset-ring-shadow: 0 0 #0000;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-offset-shadow: 0 0 #0000;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-black: #000;
  --color-gray-300: #d1d5db;
  --color-gray-800: #1f2937;
  --color-zinc-300: #d4d4d8;
  --color-zinc-600: #52525b;
  --color-red-400: #f87171;
  --color-amber-100: #fef3c7;
  --color-amber-500: #f59e0b;
  --color-amber-600: #d97706;
  --color-amber-700: #b45309;
  --color-amber-800: #92400e;
  --color-yellow-400: #facc15;
  --color-green-100: #dcfce7;
  --color-cyan-100: #cffafe;
  --color-sky-500: #0ea5e9;
  --color-blue-100: #dbeafe;
  --color-blue-400: #60a5fa;
  --color-blue-600: #2563eb;
  --color-indigo-100: #e0e7ff;
  --color-pink-500: #ec4899;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-red-500: rgb(251, 44, 54);
  --color-green-500: rgb(0, 198, 90);
  --color-emerald-50: rgb(236, 253, 245);
  --color-emerald-100: rgb(208, 250, 229);
  --color-emerald-500: rgb(0, 185, 129);
  --color-emerald-600: rgb(0, 150, 105);
  --color-cyan-500: rgb(0, 182, 212);
  --color-blue-500: rgb(50, 128, 255);
  --color-slate-50: rgb(248, 250, 252);
  --color-slate-200: rgb(226, 232, 240);
  --color-slate-500: rgb(98, 116, 142);
  --color-slate-800: rgb(29, 41, 61);
  --color-slate-900: rgb(15, 23, 43);
  --color-gray-100: rgb(243, 244, 246);
  --color-zinc-800: rgb(39, 39, 42);
  --color-white: #fff;
  --color-purple-300: rgb(216, 180, 255);
  --color-purple-800: #6b21a8;
  --color-pink-200: #fbcfe8;
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --color-amber-300: rgb(255, 210, 55);
  --color-green-300: rgb(123, 241, 168);
  --color-blue-300: rgb(145, 197, 255);
  --color-pink-300: rgb(253, 165, 213);
  --spacing: 8rpx;
  --container-4xl: 1792rpx;
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
  --text-2xl: 48rpx;
  --text-2xl--line-height: 1.33333;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --tracking-wide: 0.025em;
  --radius-md: 12rpx;
  --radius-lg: 16rpx;
  --radius-xl: 24rpx;
  --default-transition-duration: 150ms;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.visible {
  visibility: visible;
}
.relative {
  position: relative;
}
.static {
  position: static;
}
.-inset-1 {
  bottom: calc(var(--spacing) * -1);
  left: calc(var(--spacing) * -1);
  right: calc(var(--spacing) * -1);
  top: calc(var(--spacing) * -1);
}
.-inset-_b1rpx_B {
  bottom: -1rpx;
  left: -1rpx;
  right: -1rpx;
  top: -1rpx;
}
.-inset-x-1_e {
  left: calc(var(--spacing) * -1) !important;
  right: calc(var(--spacing) * -1) !important;
}
.inset-x-4 {
  left: calc(var(--spacing) * 4);
  right: calc(var(--spacing) * 4);
}
.inset-x-_b12rpx_B {
  left: 12rpx;
  right: 12rpx;
}
.inset-x-px {
  left: 1rpx;
  right: 1rpx;
}
.inset-y-6 {
  bottom: calc(var(--spacing) * 6);
  top: calc(var(--spacing) * 6);
}
.right-2_e {
  right: calc(var(--spacing) * 2) !important;
}
.right-4 {
  right: calc(var(--spacing) * 4);
}
.bottom-auto {
  bottom: auto;
}
.-m-_b20px_B {
  margin: -20rpx;
}
.m-_b5rpx_B {
  margin: 5rpx;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
._emt-0 {
  margin-top: calc(var(--spacing) * 0) !important;
}
.-mt-1_d5 {
  margin-top: calc(var(--spacing) * -1.5);
}
.-mt-2 {
  margin-top: calc(var(--spacing) * -2);
}
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
.mt-3 {
  margin-top: calc(var(--spacing) * 3);
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
.mt-_b24px_B {
  margin-top: 24rpx;
}
.mt-_b26_d2px_B {
  margin-top: 26.2rpx;
}
.mt-_b96_d3px_B {
  margin-top: 96.3rpx;
}
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
.-ml-_b5_d5px_B {
  margin-left: -5.5rpx;
}
.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
._ehidden {
  display: none !important;
}
.block {
  display: block;
}
.flex {
  display: -ms-flexbox;
  display: flex;
}
.grid {
  display: grid;
}
.inline {
  display: inline;
}
.inline-block {
  display: inline-block;
}
.inline-flex {
  display: -ms-inline-flexbox;
  display: inline-flex;
}
.table {
  display: table;
}
.aspect-_p--my-aspect-ratio_P {
  aspect-ratio: var(--my-aspect-ratio);
}
.aspect-_bcalc_p4_x3_u1_P_f3_B {
  aspect-ratio: 13/3;
}
.h-2 {
  height: calc(var(--spacing) * 2);
}
.h-3 {
  height: calc(var(--spacing) * 3);
}
.h-5 {
  height: calc(var(--spacing) * 5);
}
.h-10 {
  height: calc(var(--spacing) * 10);
}
.h-12 {
  height: calc(var(--spacing) * 12);
}
/* tokens: h-14 <= src/pages/index/index.vue */
.h-14 {
  height: calc(var(--spacing) * 14);
}
.h-20 {
  height: calc(var(--spacing) * 20);
}
.h-24 {
  height: calc(var(--spacing) * 24);
}
.h-_b6rem_B {
  height: 192rpx;
}
.h-_b20px_B {
  height: 20rpx;
}
.h-_b30px_B {
  height: 30rpx;
}
.h-_b42_d99px_B {
  height: 42.99rpx;
}
.h-_b50_d99px_B {
  height: 50.99rpx;
}
.h-_b52px_B {
  height: 52rpx;
}
.h-_b77rpx_B {
  height: 77rpx;
}
.h-_b88_d88px_B {
  height: 88.88rpx;
}
.h-_b100px_B {
  height: 100rpx;
}
.h-_b111px_B {
  height: 111rpx;
}
.h-_b128px_B {
  height: 128rpx;
}
.h-_b200_v_B {
  height: 200%;
}
.h-_b300px_B {
  height: 300rpx;
}
.h-screen {
  height: 100vh;
}
.max-h-_b100px_B {
  max-height: 100rpx;
}
.min-h-_b100px_B {
  min-height: 100rpx;
}
.min-h-screen {
  min-height: 100vh;
}
.w-2 {
  width: calc(var(--spacing) * 2);
}
.w-5 {
  width: calc(var(--spacing) * 5);
}
.w-10 {
  width: calc(var(--spacing) * 10);
}
.w-12 {
  width: calc(var(--spacing) * 12);
}
.w-16 {
  width: calc(var(--spacing) * 16);
}
.w-20 {
  width: calc(var(--spacing) * 20);
}
.w-24 {
  width: calc(var(--spacing) * 24);
}
.w-32 {
  width: calc(var(--spacing) * 32);
}
.w-_b10rpx_B {
  width: 10rpx;
}
.w-_b12rpx_B {
  width: 12rpx;
}
.w-_b12rpx_B_e {
  width: 12rpx !important;
}
.w-_b20px_B {
  width: 20rpx;
}
.w-_b24rpx_B {
  width: 24rpx;
}
.w-_b24rpx_B_e {
  width: 24rpx !important;
}
.w-_b33_d33px_B {
  width: 33.33rpx;
}
.w-_b37_d5_v_B {
  width: 37.5%;
}
.w-_b43_d1px_B {
  width: 43.1rpx;
}
.w-_b50px_B {
  width: 50rpx;
}
.w-_b52px_B {
  width: 52rpx;
}
.w-_b61_d1px_B {
  width: 61.1rpx;
}
.w-_b77rpx_B {
  width: 77rpx;
}
.w-_b100px_B {
  width: 100rpx;
}
.w-_b120px_B {
  width: 120rpx;
}
.w-_b200_v_B {
  width: 200%;
}
.w-_b222px_B {
  width: 222rpx;
}
.w-_b242px_B {
  width: 242rpx;
}
.w-_b300rpx_B {
  width: 300rpx;
}
.w-_b323px_B {
  width: 323rpx;
}
.w-fit {
  width: -moz-fit-content;
  width: fit-content;
}
.w-screen {
  width: 100vw;
}
.max-w-4xl {
  max-width: var(--container-4xl);
}
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
.min-w-_b88_d5px_B {
  min-width: 88.5rpx;
}
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
.flex-1 {
  -ms-flex: 1;
  flex: 1;
}
.border-collapse {
  border-collapse: collapse;
}
.origin-_b100rpx_111rpx_B {
  -ms-transform-origin: 100rpx 111rpx;
  transform-origin: 100rpx 111rpx;
}
._e-translate-y-_b3_d5px_B {
  --tw-translate-y: -3.5rpx !important;
  translate: var(--tw-translate-x) var(--tw-translate-y) !important;
}
.translate-y-_b17rpx_B {
  --tw-translate-y: 17rpx;
  translate: var(--tw-translate-x) var(--tw-translate-y);
}
.scale-_b1_d03_B {
  scale: 1.03;
}
.-rotate-2 {
  rotate: -2deg;
}
.rotate-45 {
  rotate: 45deg;
}
.rotate-_b10deg_B {
  rotate: 10deg;
}
.transform {
  -ms-transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
.cursor-not-allowed {
  cursor: not-allowed;
}
.resize {
  resize: both;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.grid-cols-_b1fr_mauto_B {
  grid-template-columns: 1fr, auto;
}
.flex-col {
  -ms-flex-direction: column;
  flex-direction: column;
}
.flex-col-reverse {
  -ms-flex-direction: column-reverse;
  flex-direction: column-reverse;
}
.flex-row-reverse {
  -ms-flex-direction: row-reverse;
  flex-direction: row-reverse;
}
.items-center {
  -ms-flex-align: center;
  align-items: center;
}
.justify-center {
  -ms-flex-pack: center;
  justify-content: center;
}
.gap-1 {
  gap: calc(var(--spacing) * 1);
}
.gap-3 {
  gap: calc(var(--spacing) * 3);
}
.gap-3_d5 {
  gap: calc(var(--spacing) * 3.5);
}
.gap-6 {
  gap: calc(var(--spacing) * 6);
}
.gap-_b16rpx_B {
  gap: 16rpx;
}
.space-y-4 > text + text,
.space-y-4 > text + view,
.space-y-4 > view + text,
.space-y-4 > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
}
.space-y-_b1_d6rem_B > text + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
}
.space-y-_b11rpx_B > text + text,
.space-y-_b11rpx_B > text + view,
.space-y-_b11rpx_B > view + text,
.space-y-_b11rpx_B > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(11rpx * var(--tw-space-y-reverse));
  margin-top: calc(11rpx * (1 - var(--tw-space-y-reverse)));
}
.space-y-reverse > text + text,
.space-y-reverse > text + view,
.space-y-reverse > view + text,
.space-y-reverse > view + view {
  --tw-space-y-reverse: 1;
}
.space-x-2_d5 > text + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > view + view {
  --tw-space-x-reverse: 0;
  margin-left: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-x-reverse)));
  margin-right: calc(var(--spacing) * 2.5 * var(--tw-space-x-reverse));
}
.space-x-4 > text + text,
.space-x-4 > text + view,
.space-x-4 > view + text,
.space-x-4 > view + view {
  --tw-space-x-reverse: 0;
  margin-left: calc(var(--spacing) * 4 * (1 - var(--tw-space-x-reverse)));
  margin-right: calc(var(--spacing) * 4 * var(--tw-space-x-reverse));
}
.space-x-reverse > text + text,
.space-x-reverse > text + view,
.space-x-reverse > view + text,
.space-x-reverse > view + view {
  --tw-space-x-reverse: 1;
}
.divide-x-4 > text + text,
.divide-x-4 > text + view,
.divide-x-4 > view + text,
.divide-x-4 > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-left-width: calc(4rpx * (1 - var(--tw-divide-x-reverse)));
  border-right-style: var(--tw-border-style);
  border-right-width: calc(4rpx * var(--tw-divide-x-reverse));
}
.divide-x-8 > text + text,
.divide-x-8 > text + view,
.divide-x-8 > view + text,
.divide-x-8 > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-left-width: calc(8rpx * (1 - var(--tw-divide-x-reverse)));
  border-right-style: var(--tw-border-style);
  border-right-width: calc(8rpx * var(--tw-divide-x-reverse));
}
.divide-x-_b3px_B > text + text,
.divide-x-_b3px_B > text + view,
.divide-x-_b3px_B > view + text,
.divide-x-_b3px_B > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-left-width: calc(3rpx * (1 - var(--tw-divide-x-reverse)));
  border-right-style: var(--tw-border-style);
  border-right-width: calc(3rpx * var(--tw-divide-x-reverse));
}
.divide-x-_b10px_B > text + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
  border-right-style: var(--tw-border-style);
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
}
.divide-y-4 > text + text,
.divide-y-4 > text + view,
.divide-y-4 > view + text,
.divide-y-4 > view + view {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: calc(4rpx * var(--tw-divide-y-reverse));
  border-top-style: var(--tw-border-style);
  border-top-width: calc(4rpx * (1 - var(--tw-divide-y-reverse)));
}
.divide-y-reverse > text + text,
.divide-y-reverse > text + view,
.divide-y-reverse > view + text,
.divide-y-reverse > view + view {
  --tw-divide-y-reverse: 1;
}
.divide-dotted > text + text,
.divide-dotted > text + view,
.divide-dotted > view + text,
.divide-dotted > view + view {
  --tw-border-style: dotted;
  border-style: dotted;
}
.divide-double > text + text,
.divide-double > text + view,
.divide-double > view + text,
.divide-double > view + view {
  --tw-border-style: double;
  border-style: double;
}
.divide-solid > text + text,
.divide-solid > text + view,
.divide-solid > view + text,
.divide-solid > view + view {
  --tw-border-style: solid;
  border-style: solid;
}
.divide-_b_h41eb04_B > text + text,
.divide-_b_h41eb04_B > text + view,
.divide-_b_h41eb04_B > view + text,
.divide-_b_h41eb04_B > view + view {
  border-color: #41eb04;
}
.divide-_b_h60d256_B > text + text,
.divide-_b_h60d256_B > text + view,
.divide-_b_h60d256_B > view + text,
.divide-_b_h60d256_B > view + view {
  border-color: #60d256;
}
.divide-_b_h010101_B > text + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > view + view {
  border-color: #010101;
}
.divide-_b_hd80c0c_B > text + text,
.divide-_b_hd80c0c_B > text + view,
.divide-_b_hd80c0c_B > view + text,
.divide-_b_hd80c0c_B > view + view {
  border-color: #d80c0c;
}
.divide-_b3rpx_B > text + text,
.divide-_b3rpx_B > text + view,
.divide-_b3rpx_B > view + text,
.divide-_b3rpx_B > view + view {
  border-width: 3rpx;
}
.overflow-hidden {
  overflow: hidden;
}
.rounded {
  border-radius: 8rpx;
}
.rounded-_b12rpx_B {
  border-radius: 12rpx;
}
.rounded-_b18_d5px_B {
  border-radius: 18.5rpx;
}
.rounded-_b20rpx_B {
  border-radius: 20rpx;
}
/* tokens: rounded-[24rpx] <= src/pages/index/index.vue */
.rounded-_b24rpx_B {
  border-radius: 24rpx;
}
.rounded-_b40px_B {
  border-radius: 40rpx;
}
.rounded-full {
  border-radius: 9999rpx;
}
.rounded-lg {
  border-radius: var(--radius-lg);
}
.rounded-md {
  border-radius: var(--radius-md);
}
.rounded-xl {
  border-radius: var(--radius-xl);
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1rpx;
}
.border-4 {
  border-style: var(--tw-border-style);
  border-width: 4rpx;
}
.border-_b10px_B {
  border-width: 10rpx;
}
.border-_b10rpx_B {
  border-width: 10rpx;
}
.border-_b7rpx_B {
  border-width: 7rpx;
}
.border-_b_h098765_B {
  border-color: #098765;
}
.border-_b_h336699_B_f40 {
  border-color: rgba(51, 102, 153, 0.4);
}
.border-_b_h94a3b8_B {
  border-color: #94a3b8;
}
.border-_bred_B {
  border-color: red;
}
.border-b-_b4rpx_B {
  border-bottom-width: 4rpx;
}
.border-current {
  border-color: currentcolor;
}
.border-dashed {
  --tw-border-style: dashed;
  border-style: dashed;
}
.border-emerald-500 {
  border-color: var(--color-emerald-500);
}
.border-gray-400 {
  border-color: var(--color-gray-400);
}
.border-slate-200 {
  border-color: var(--color-slate-200);
}
.border-solid {
  --tw-border-style: solid;
  border-style: solid;
}
.border-t-_b3rpx_B {
  border-top-width: 3rpx;
}
.border-t-_b4px_B {
  border-top-width: 4rpx;
}
.border-transparent {
  border-color: transparent;
}
.border-zinc-900_f10 {
  border-color: rgba(24, 24, 27, 0.1);
}
._ebg-green-500 {
  background-color: var(--color-green-500) !important;
}
.bg-_p--my-color_P {
  background-color: var(--my-color);
}
.bg-_b_h0000ff_B {
  background-color: #00f;
}
.bg-_b_h16a34a_B {
  background-color: #16a34a;
}
.bg-_b_h89ab8d_B {
  background-color: #89ab8d;
}
.bg-_b_h2563eb_B {
  background-color: #2563eb;
}
.bg-_b_h3482f2_B {
  background-color: #3482f2;
}
.bg-_b_h4268EA_B {
  background-color: #4268ea;
}
.bg-_b_h123324_B {
  background-color: #123324;
}
/* tokens: bg-[#123456] <= src/pages/index/index.vue */
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-_b_h123498_B {
  background-color: #123498;
}
.bg-_b_h410000_B {
  background-color: #410000;
}
.bg-_b_h434332_B {
  background-color: #434332;
}
.bg-_b_h434354_B {
  background-color: #434354;
}
/* tokens: bg-[#534312] <= src/pages/index/index.vue */
.bg-_b_h534312_B {
  background-color: #534312;
}
.bg-_b_h654874_B {
  background-color: #654874;
}
.bg-_b_h666600_B {
  background-color: #660;
}
.bg-_b_h955443_B {
  background-color: #955443;
}
.bg-_b_h987654_B {
  background-color: #987654;
}
.bg-_b_h999999_B {
  background-color: #999;
}
.bg-_b_hB91C1C_B {
  background-color: #b91c1c;
}
.bg-_b_hc65ece_B {
  background-color: #c65ece;
}
.bg-_b_hd72929_B {
  background-color: #d72929;
}
.bg-_b_hdc2626_B {
  background-color: #dc2626;
}
.bg-_b_he6e6e6_B {
  background-color: #e6e6e6;
}
.bg-_b_he24826_B {
  background-color: #e24826;
}
.bg-_b_hfff_B {
  background-color: #fff;
}
.bg-_bcolor_cvar_p--mystery-var_P_B {
  background-color: var(--mystery-var);
}
.bg-_brgb_p255_m210_m55_P_B {
  background-color: #ffd237;
}
.bg-_byellow_B {
  background-color: #ff0;
}
.bg-amber-300 {
  background-color: var(--color-amber-300);
}
.bg-amber-500 {
  background-color: var(--color-amber-500);
}
.bg-amber-600 {
  background-color: var(--color-amber-600);
}
.bg-amber-700 {
  background-color: var(--color-amber-700);
}
.bg-amber-800 {
  background-color: var(--color-amber-800);
}
.bg-black {
  background-color: var(--color-black);
}
.bg-blue-300 {
  background-color: var(--color-blue-300);
}
.bg-blue-400 {
  background-color: var(--color-blue-400);
}
.bg-blue-500 {
  background-color: var(--color-blue-500);
}
.bg-blue-500_f50 {
  background-color: rgba(59, 130, 246, 0.5);
}
.bg-blue-600 {
  background-color: var(--color-blue-600);
}
.bg-cyan-500 {
  background-color: var(--color-cyan-500);
}
.bg-emerald-100 {
  background-color: var(--color-emerald-100);
}
.bg-emerald-500 {
  background-color: var(--color-emerald-500);
}
.bg-gray-100 {
  background-color: var(--color-gray-100);
}
.bg-gray-300 {
  background-color: var(--color-gray-300);
}
.bg-green-300 {
  background-color: var(--color-green-300);
}
.bg-green-500 {
  background-color: var(--color-green-500);
}
.bg-pink-300 {
  background-color: var(--color-pink-300);
}
.bg-pink-500 {
  background-color: var(--color-pink-500);
}
.bg-purple-300 {
  background-color: var(--color-purple-300);
}
/* tokens: bg-purple-800 <= src/pages/index/index.vue */
.bg-purple-800 {
  background-color: var(--color-purple-800);
}
.bg-red-400 {
  background-color: var(--color-red-400);
}
.bg-red-500 {
  background-color: var(--color-red-500);
}
.bg-red-500_f50 {
  background-color: rgba(239, 68, 68, 0.5);
}
.bg-sky-500 {
  background-color: var(--color-sky-500);
}
.bg-sky-500_f80 {
  background-color: rgba(14, 165, 233, 0.8);
}
.bg-slate-50 {
  background-color: var(--color-slate-50);
}
.bg-transparent {
  background-color: transparent;
}
.bg-white {
  background-color: var(--color-white);
}
.bg-zinc-50 {
  background-color: var(--color-zinc-50);
}
.bg-linear-to-r {
  --tw-gradient-position: to right;
}
.bg-linear-to-r {
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-b {
  --tw-gradient-position: to bottom;
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
/* tokens: bg-gradient-to-r <= src/pages/index/index.vue */
.bg-gradient-to-r {
  --tw-gradient-position: to right in oklab;
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-t {
  --tw-gradient-position: to top;
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-tr {
  --tw-gradient-position: to top right;
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-_blinear-gradient_p135deg_m_hf8fafc_0_v_m_hdbeafe_100_v_P_B {
  background-image: -webkit-linear-gradient(315deg, #f8fafc, #dbeafe);
  background-image: linear-gradient(135deg, #f8fafc, #dbeafe);
}
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url(https://xxx.com/xx.webp);
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
.to-_b_h4bcefd_B {
  --tw-gradient-to: #4bcefd;
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
._bmask-type_calpha_B {
  mask-type: alpha;
}
._bmask-type_cluminance_B {
  mask-type: luminance;
}
._ep-_b18_d5px_B {
  padding: 18.5rpx !important;
}
._bpadding_c20rpx_B {
  padding: 20rpx;
}
.p-0_d5 {
  padding: calc(var(--spacing) * 0.5);
}
.p-1 {
  padding: calc(var(--spacing) * 1);
}
.p-2 {
  padding: calc(var(--spacing) * 2);
}
.p-3 {
  padding: calc(var(--spacing) * 3);
}
.p-3_e {
  padding: calc(var(--spacing) * 3) !important;
}
.p-4 {
  padding: calc(var(--spacing) * 4);
}
.p-4_e {
  padding: calc(var(--spacing) * 4) !important;
}
.p-5 {
  padding: calc(var(--spacing) * 5);
}
.p-6 {
  padding: calc(var(--spacing) * 6);
}
.p-8 {
  padding: calc(var(--spacing) * 8);
}
.p-_b5rpx_B {
  padding: 5rpx;
}
.p-_b12rpx_B {
  padding: 12rpx;
}
.p-_b16rpx_B {
  padding: 16rpx;
}
.p-_b20px_B {
  padding: 20rpx;
}
.p-_b24rpx_B {
  padding: 24rpx;
}
.px-2 {
  padding-left: calc(var(--spacing) * 2);
  padding-right: calc(var(--spacing) * 2);
}
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.px-5 {
  padding-left: calc(var(--spacing) * 5);
  padding-right: calc(var(--spacing) * 5);
}
.px-6 {
  padding-left: calc(var(--spacing) * 6);
  padding-right: calc(var(--spacing) * 6);
}
.px-_b13_d5px_B {
  padding-left: 13.5rpx;
  padding-right: 13.5rpx;
}
.px-_b16rpx_B {
  padding-left: 16rpx;
  padding-right: 16rpx;
}
.px-_b20rpx_B {
  padding-left: 20rpx;
  padding-right: 20rpx;
}
/* tokens: px-[32px] <= src/pages/index/index.vue */
.px-_b32px_B {
  padding-left: 32rpx;
  padding-right: 32rpx;
}
.px-_b35px_B {
  padding-left: 35rpx;
  padding-right: 35rpx;
}
.px-_b95px_B {
  padding-left: 95rpx;
  padding-right: 95rpx;
}
.py-1 {
  padding-bottom: calc(var(--spacing) * 1);
  padding-top: calc(var(--spacing) * 1);
}
.py-1_d5 {
  padding-bottom: calc(var(--spacing) * 1.5);
  padding-top: calc(var(--spacing) * 1.5);
}
.py-2 {
  padding-bottom: calc(var(--spacing) * 2);
  padding-top: calc(var(--spacing) * 2);
}
.py-3 {
  padding-bottom: calc(var(--spacing) * 3);
  padding-top: calc(var(--spacing) * 3);
}
.py-6 {
  padding-bottom: calc(var(--spacing) * 6);
  padding-top: calc(var(--spacing) * 6);
}
.py-_b6rpx_B {
  padding-bottom: 6rpx;
  padding-top: 6rpx;
}
.py-_b8rpx_B {
  padding-bottom: 8rpx;
  padding-top: 8rpx;
}
.py-_b10rpx_B {
  padding-bottom: 10rpx;
  padding-top: 10rpx;
}
.py-_b12rpx_B {
  padding-bottom: 12rpx;
  padding-top: 12rpx;
}
/* tokens: py-[18px] <= src/pages/index/index.vue */
.py-_b18px_B {
  padding-bottom: 18rpx;
  padding-top: 18rpx;
}
.py-_b62px_B {
  padding-bottom: 62rpx;
  padding-top: 62rpx;
}
.text-center {
  text-align: center;
}
.indent-_b11rpx_B {
  text-indent: 11rpx;
}
.text-2xl {
  font-size: var(--text-2xl);
  line-height: var(--tw-leading, var(--text-2xl--line-height));
}
.text-_b13_d5px_B {
  font-size: 13.5rpx;
}
.text-_b16px_B {
  font-size: 16rpx;
}
.text-_b17rpx_B {
  font-size: 17rpx;
}
.text-_b20px_B {
  font-size: 20rpx;
}
.text-_b22px_B {
  font-size: 22rpx;
}
.text-_b24rpx_B {
  font-size: 24rpx;
}
.text-_b28rpx_B {
  font-size: 28rpx;
}
.text-_b28rpx_B_f7 {
  font-size: 28rpx;
  line-height: calc(var(--spacing) * 7);
}
.text-_b30px_B {
  font-size: 30rpx;
}
.text-_b30rpx_B {
  font-size: 30rpx;
}
.text-_b32px_B {
  font-size: 32rpx;
}
.text-_b32rpx_B {
  font-size: 32rpx;
}
.text-_b34px_B {
  font-size: 34rpx;
}
.text-_b44px_B {
  font-size: 44rpx;
}
.text-_b45rpx_B {
  font-size: 45rpx;
}
.text-_b50px_B {
  font-size: 50rpx;
}
.text-_b55rpx_B {
  font-size: 55rpx;
}
.text-_b56_d5rpx_B {
  font-size: 56.5rpx;
}
.text-_b66rpx_B {
  font-size: 66rpx;
}
.text-_b77rpx_B {
  font-size: 77rpx;
}
.text-base {
  font-size: var(--text-base);
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-lg {
  font-size: var(--text-lg);
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-lg_f7 {
  font-size: var(--text-lg);
  line-height: calc(var(--spacing) * 7);
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
/* tokens: text-[100rpx] <= src/pages/index/index.vue */
.text-_b100rpx_B {
  font-size: 100rpx;
}
.text-_b102_d43rpx_B {
  font-size: 102.43rpx;
}
.text-_blength_ccalc_p2_x9_d43px_P_B {
  font-size: 18.86rpx;
}
.text-_blength_cvar_p--my-var-length_P_B {
  font-size: var(--my-var-length);
}
.leading-6 {
  --tw-leading: calc(var(--spacing) * 6);
  line-height: calc(var(--spacing) * 6);
}
.leading-_b0_d9_B {
  --tw-leading: 0.9;
  line-height: 0.9;
}
.leading-_b23rpx_B {
  --tw-leading: 23rpx;
  line-height: 23rpx;
}
._efont-bold {
  --tw-font-weight: var(--font-weight-bold) !important;
  font-weight: var(--font-weight-bold) !important;
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
.tracking-wide {
  --tw-tracking: var(--tracking-wide);
  letter-spacing: var(--tracking-wide);
}
._etext-_b_h990000_B {
  color: #900 !important;
}
.text-_b_h0000ff_B {
  color: #00f;
}
.text-_b_h00f285_B {
  color: #00f285;
}
.text-_b_h0b138f_B {
  color: #0b138f;
}
.text-_b_h123456_B {
  color: #123456;
}
.text-_b_h16a34a_B {
  color: #16a34a;
}
.text-_b_h1f2937_B {
  color: #1f2937;
}
.text-_b_h2563eb_B {
  color: #2563eb;
}
.text-_b_h3d31a4_B {
  color: #3d31a4;
}
.text-_b_h438821_B {
  color: #438821;
}
.text-_b_h654321_B {
  color: #654321;
}
.text-_b_h888800_B {
  color: #880;
}
.text-_b_h929292_B {
  color: #929292;
}
.text-_b_hab1932_B {
  color: #ab1932;
}
.text-_b_habcdef_B {
  color: #abcdef;
}
.text-_b_hbada55_B {
  color: #bada55;
}
.text-_b_hc31d6b_B {
  color: #c31d6b;
}
.text-_b_hdddddd_B {
  color: #ddd;
}
.text-_b_hececec_B {
  color: #ececec;
}
.text-_b_hfafafa_B {
  color: #fafafa;
}
/* tokens: text-[#fff] <= src/pages/index/index.vue */
.text-_b_hfff_B {
  color: #fff;
}
/* tokens: text-[#ffffff] <= src/pages/index/index.vue */
.text-_b_hffffff_B {
  color: #fff;
}
.text-_bcolor_cvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bred_B {
  color: red;
}
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bvar_p--text_r_sec_r_light_P_B {
  color: var(--text_sec_light);
}
.text-_bvar_p--text_sec_light_P_B {
  color: var(--text_sec_light);
}
.text-black {
  color: var(--color-black);
}
.text-emerald-600 {
  color: var(--color-emerald-600);
}
.text-gray-800 {
  color: var(--color-gray-800);
}
/* tokens: text-pink-200 <= src/pages/index/index.vue */
.text-pink-200 {
  color: var(--color-pink-200);
}
.text-red-400 {
  color: var(--color-red-400);
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
.text-zinc-600 {
  color: var(--color-zinc-600);
}
.text-zinc-900 {
  color: var(--color-zinc-900);
}
.capitalize {
  text-transform: capitalize;
}
.uppercase {
  text-transform: uppercase;
}
.underline {
  text-decoration-line: underline;
}
.underline-offset-_b3rpx_B {
  text-underline-offset: 3rpx;
}
.opacity-50 {
  opacity: 0.5;
}
.opacity-_b0_d82_B {
  opacity: 0.82;
}
.shadow {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0_2_d5px_7_d5px_rgba_p18_m52_m86_m0_d35_P_B {
  --tw-shadow: 0 2.5rpx 7.5rpx var(--tw-shadow-color, rgba(18, 52, 86, 0.35));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0_8rpx_24rpx_rgba_p0_m0_m0_m0_d12_P_B {
  --tw-shadow: 0 8rpx 24rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.12));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0rpx 2rpx 11rpx 0rpx var(--tw-shadow-color, #00000a);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0rpx 2rpx 11rpx 0rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-md {
  --tw-shadow: 0 4rpx 6rpx -1rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 2rpx 4rpx -2rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-sm {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring-4 {
  --tw-ring-shadow: var(--tw-ring-inset, ) 0 0 0 calc(4rpx + var(--tw-ring-offset-width)) var(--tw-ring-color, var(--color-blue-500, #3b82f6));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-amber-100 {
  --tw-shadow-color: #fef3c7;
}
.shadow-blue-100 {
  --tw-shadow-color: #dbeafe;
}
.shadow-cyan-100 {
  --tw-shadow-color: #cffafe;
}
.shadow-green-100 {
  --tw-shadow-color: #dcfce7;
}
.shadow-indigo-100 {
  --tw-shadow-color: #e0e7ff;
}
.ring-_b10rpx_B {
  --tw-ring-offset-width: 10rpx;
}
.ring-pink-300 {
  --tw-ring-color: var(--color-pink-300);
}
.ring-offset-_b3rpx_B {
  --tw-ring-offset-color: 3rpx;
}
.outline {
  outline-style: var(--tw-outline-style);
  outline-width: 1px;
}
.outline-offset-_b3rpx_B {
  outline-offset: 3rpx;
}
.outline-_b5rpx_B {
  outline-width: 5rpx;
}
.blur {
  --tw-blur: blur(8px);
  filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, )
    var(--tw-drop-shadow, );
}
.blur-_b2rpx_B {
  --tw-blur: blur(2rpx);
  filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, )
    var(--tw-drop-shadow, );
}
.filter {
  filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, )
    var(--tw-drop-shadow, );
}
.backdrop-blur-_b2rpx_B {
  --tw-backdrop-blur: blur(2rpx);
  backdrop-filter: var(--tw-backdrop-blur, ) var(--tw-backdrop-brightness, ) var(--tw-backdrop-contrast, ) var(--tw-backdrop-grayscale, ) var(--tw-backdrop-hue-rotate, )
    var(--tw-backdrop-invert, ) var(--tw-backdrop-opacity, ) var(--tw-backdrop-saturate, ) var(--tw-backdrop-sepia, );
}
.transition {
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  transition-property:
    color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow,
    transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
}
.transition-colors {
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
}
.duration-300 {
  --tw-duration: 300ms;
  transition-duration: 0.3s;
}
._b--scroll-offset_c56px_B {
  --scroll-offset: 56rpx;
}
.divide-x-reverse > text + text,
.divide-x-reverse > text + view,
.divide-x-reverse > view + text,
.divide-x-reverse > view + view {
  --tw-divide-x-reverse: 1;
}
.group.published text.group-_b_dpublished_B_ctext-green-500,
.group.published view.group-_b_dpublished_B_ctext-green-500 {
  color: var(--color-green-500);
}
.peer.tapped ~ text.peer-_b_dtapped_B_cbg-red-400,
.peer.tapped ~ view.peer-_b_dtapped_B_cbg-red-400 {
  background-color: var(--color-red-400);
}
.before_cabsolute::before {
  content: var(--tw-content);
  position: absolute;
}
.before_cinset-0::before {
  bottom: calc(var(--spacing) * 0);
  content: var(--tw-content);
  left: calc(var(--spacing) * 0);
  right: calc(var(--spacing) * 0);
  top: calc(var(--spacing) * 0);
}
.before_cmr-1::before {
  content: var(--tw-content);
  margin-right: calc(var(--spacing) * 1);
}
.before_crounded-_b20rpx_B::before {
  border-radius: 20rpx;
  content: var(--tw-content);
}
.before_cborder-2::before {
  border-style: var(--tw-border-style);
  border-width: 2rpx;
  content: var(--tw-content);
}
.before_cborder-_b_h4bd650_B::before {
  border-color: #4bd650;
  content: var(--tw-content);
}
.before_ccontent-_b_a_x_a_B::before {
  --tw-content: '*';
  content: var(--tw-content);
}
.before_ccontent-_b_a222_a_B::before {
  --tw-content: '222';
  content: var(--tw-content);
}
.before_ccontent-_b_a11111_a_B::before {
  --tw-content: '11111';
  content: var(--tw-content);
}
.before_ccontent-_b_aFestivus_a_B::before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-webpack-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: before:content-['independent_subpackage_taro-webpack-vue3-tailwindcss-v4'] <= src/sub-independent/pages/index.vue */
.before_ccontent-_b_aindependent_subpackage_taro-webpack-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage uni-app-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_amoduleA_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 独立分包';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-webpack-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_taro-webpack-vue3-tailwindcss-v4'] <= src/sub-normal/pages/index.vue */
.before_ccontent-_b_anormal_subpackage_taro-webpack-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage uni-app-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_av3_a_B::before {
  --tw-content: 'v3';
  content: var(--tw-content);
}
.before_ccontent-_b_av4_a_B::before {
  --tw-content: 'v4';
  content: var(--tw-content);
}
.after_cborder-none::after {
  content: var(--tw-content);
  --tw-border-style: none;
  border-style: none;
}
.after_ccontent-_b_av3_apply_a_B::after {
  --tw-content: 'v3 apply';
  content: var(--tw-content);
}
.after_ccontent-_b_au_x6211_u_x662f_className_a_B::after {
  --tw-content: '我是className';
  content: var(--tw-content);
}
.after_ccontent-_b_au_x6211_u_x6765_u_x81ea_utils_dfilter_djs_a_B::after {
  --tw-content: '我来自utils.filter.js';
  content: var(--tw-content);
}
.after_ccontent-_b_r_au_x6211_u_x6765_u_x81ea_inline-wxs_r_a_B::after {
  --tw-content: \'我来自inline-wxs\';
  content: var(--tw-content);
}
.odd_cmb-2:nth-child(odd) {
  margin-bottom: calc(var(--spacing) * 2);
}
.focus_cring:focus {
  --tw-ring-shadow: var(--tw-ring-inset, ) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.focus_cring-blue-300:focus {
  --tw-ring-color: var(--color-blue-300);
}
.focus_coutline-none:focus {
  --tw-outline-style: none;
  outline-style: none;
}
.active_cbg-emerald-50:active {
  background-color: var(--color-emerald-50);
}
.active_cbg-emerald-600:active {
  background-color: var(--color-emerald-600);
}
.active_cbg-green-300:active {
  background-color: var(--color-green-300);
}
@media (min-width: 48rem) {
  .md_cgrid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (min-width: 64rem) {
  .lg_c_b--scroll-offset_c44px_B {
    --scroll-offset: 44rpx;
  }
}
@media (min-width: 96rem) {
  ._2xl_ctext-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
}
@media (min-width: 96rem) {
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-_b_h123456_B {
    background-color: #123456;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: var(--color-green-500);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-800 {
    background-color: var(--color-zinc-800);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-900 {
    background-color: var(--color-zinc-900);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-_b_hec4f4f_B {
    color: #ec4f4f;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-yellow-400 {
    color: var(--color-yellow-400);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-zinc-50 {
    color: var(--color-zinc-50);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-zinc-300 {
    color: var(--color-zinc-300);
  }
}
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  color: var(--color-red-400) !important;
}
._b_n_view_B_cp-_b12rpx_B view {
  padding: 12rpx;
}
.focus_c_b_n_view_B_cp-4:focus view {
  padding: calc(var(--spacing) * 4);
}
._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3) {
  padding-bottom: calc(var(--spacing) * 0);
  padding-top: calc(var(--spacing) * 0);
}
._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3) {
  padding-bottom: calc(var(--spacing) * 4);
  padding-top: calc(var(--spacing) * 4);
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
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate-x:;
  --tw-rotate-y:;
  --tw-rotate-z:;
  --tw-skew-x:;
  --tw-skew-y:;
  --tw-space-x-reverse: 0;
  --tw-space-y-reverse: 0;
  --tw-border-style: solid;
  --tw-divide-x-reverse: 0;
  --tw-divide-y-reverse: 0;
  --tw-gradient-position: initial;
  --tw-gradient-from: #0000;
  --tw-gradient-to: #0000;
  --tw-gradient-stops: initial;
  --tw-gradient-via-stops: initial;
  --tw-gradient-from-position: 0%;
  --tw-gradient-to-position: 100%;
  --tw-font-weight:;
  --tw-blur:;
  --tw-brightness:;
  --tw-contrast:;
  --tw-grayscale:;
  --tw-hue-rotate:;
  --tw-invert:;
  --tw-saturate:;
  --tw-sepia:;
  --tw-drop-shadow:;
  --tw-backdrop-blur:;
  --tw-backdrop-brightness:;
  --tw-backdrop-contrast:;
  --tw-backdrop-grayscale:;
  --tw-backdrop-hue-rotate:;
  --tw-backdrop-invert:;
  --tw-backdrop-opacity:;
  --tw-backdrop-saturate:;
  --tw-backdrop-sepia:;
  --tw-duration: initial;
  --tw-ease: initial;
  --tw-content: '';
  --tw-leading:;
  --tw-tracking:;
  --tw-outline-style: solid;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-color: initial;
  --tw-inset-shadow: 0 0 #0000;
  --tw-ring-color:;
  --tw-ring-shadow: 0 0 #0000;
  --tw-inset-ring-shadow: 0 0 #0000;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-offset-shadow: 0 0 #0000;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-black: #000;
  --color-gray-300: #d1d5db;
  --color-gray-800: #1f2937;
  --color-zinc-300: #d4d4d8;
  --color-zinc-600: #52525b;
  --color-red-400: #f87171;
  --color-amber-100: #fef3c7;
  --color-amber-500: #f59e0b;
  --color-amber-600: #d97706;
  --color-amber-700: #b45309;
  --color-amber-800: #92400e;
  --color-yellow-400: #facc15;
  --color-green-100: #dcfce7;
  --color-cyan-100: #cffafe;
  --color-sky-500: #0ea5e9;
  --color-blue-100: #dbeafe;
  --color-blue-400: #60a5fa;
  --color-blue-600: #2563eb;
  --color-indigo-100: #e0e7ff;
  --color-pink-500: #ec4899;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-red-500: rgb(251, 44, 54);
  --color-green-500: rgb(0, 198, 90);
  --color-emerald-50: rgb(236, 253, 245);
  --color-emerald-100: rgb(208, 250, 229);
  --color-emerald-500: rgb(0, 185, 129);
  --color-emerald-600: rgb(0, 150, 105);
  --color-cyan-500: rgb(0, 182, 212);
  --color-blue-500: rgb(50, 128, 255);
  --color-slate-50: rgb(248, 250, 252);
  --color-slate-200: rgb(226, 232, 240);
  --color-slate-500: rgb(98, 116, 142);
  --color-slate-800: rgb(29, 41, 61);
  --color-slate-900: rgb(15, 23, 43);
  --color-gray-100: rgb(243, 244, 246);
  --color-zinc-800: rgb(39, 39, 42);
  --color-white: #fff;
  --color-purple-300: rgb(216, 180, 255);
  --color-purple-800: #6b21a8;
  --color-pink-200: #fbcfe8;
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --color-amber-300: rgb(255, 210, 55);
  --color-green-300: rgb(123, 241, 168);
  --color-blue-300: rgb(145, 197, 255);
  --color-pink-300: rgb(253, 165, 213);
  --spacing: 8rpx;
  --container-4xl: 1792rpx;
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
  --text-2xl: 48rpx;
  --text-2xl--line-height: 1.33333;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --tracking-wide: 0.025em;
  --radius-md: 12rpx;
  --radius-lg: 16rpx;
  --radius-xl: 24rpx;
  --default-transition-duration: 150ms;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.visible {
  visibility: visible;
}
.relative {
  position: relative;
}
.static {
  position: static;
}
.-inset-1 {
  bottom: calc(var(--spacing) * -1);
  left: calc(var(--spacing) * -1);
  right: calc(var(--spacing) * -1);
  top: calc(var(--spacing) * -1);
}
.-inset-_b1rpx_B {
  bottom: -1rpx;
  left: -1rpx;
  right: -1rpx;
  top: -1rpx;
}
.-inset-x-1_e {
  left: calc(var(--spacing) * -1) !important;
  right: calc(var(--spacing) * -1) !important;
}
.inset-x-4 {
  left: calc(var(--spacing) * 4);
  right: calc(var(--spacing) * 4);
}
.inset-x-_b12rpx_B {
  left: 12rpx;
  right: 12rpx;
}
.inset-x-px {
  left: 1rpx;
  right: 1rpx;
}
.inset-y-6 {
  bottom: calc(var(--spacing) * 6);
  top: calc(var(--spacing) * 6);
}
.right-2_e {
  right: calc(var(--spacing) * 2) !important;
}
.right-4 {
  right: calc(var(--spacing) * 4);
}
.bottom-auto {
  bottom: auto;
}
.-m-_b20px_B {
  margin: -20rpx;
}
.m-_b5rpx_B {
  margin: 5rpx;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
._emt-0 {
  margin-top: calc(var(--spacing) * 0) !important;
}
.-mt-1_d5 {
  margin-top: calc(var(--spacing) * -1.5);
}
.-mt-2 {
  margin-top: calc(var(--spacing) * -2);
}
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
.mt-3 {
  margin-top: calc(var(--spacing) * 3);
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
.mt-_b24px_B {
  margin-top: 24rpx;
}
.mt-_b26_d2px_B {
  margin-top: 26.2rpx;
}
.mt-_b96_d3px_B {
  margin-top: 96.3rpx;
}
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
.-ml-_b5_d5px_B {
  margin-left: -5.5rpx;
}
.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
._ehidden {
  display: none !important;
}
.block {
  display: block;
}
.flex {
  display: -ms-flexbox;
  display: flex;
}
.grid {
  display: grid;
}
.inline {
  display: inline;
}
.inline-block {
  display: inline-block;
}
.inline-flex {
  display: -ms-inline-flexbox;
  display: inline-flex;
}
.table {
  display: table;
}
.aspect-_p--my-aspect-ratio_P {
  aspect-ratio: var(--my-aspect-ratio);
}
.aspect-_bcalc_p4_x3_u1_P_f3_B {
  aspect-ratio: 13/3;
}
.h-2 {
  height: calc(var(--spacing) * 2);
}
.h-3 {
  height: calc(var(--spacing) * 3);
}
.h-5 {
  height: calc(var(--spacing) * 5);
}
.h-10 {
  height: calc(var(--spacing) * 10);
}
.h-12 {
  height: calc(var(--spacing) * 12);
}
/* tokens: h-14 <= src/pages/index/index.vue */
.h-14 {
  height: calc(var(--spacing) * 14);
}
.h-20 {
  height: calc(var(--spacing) * 20);
}
.h-24 {
  height: calc(var(--spacing) * 24);
}
.h-_b6rem_B {
  height: 192rpx;
}
.h-_b20px_B {
  height: 20rpx;
}
.h-_b30px_B {
  height: 30rpx;
}
.h-_b42_d99px_B {
  height: 42.99rpx;
}
.h-_b50_d99px_B {
  height: 50.99rpx;
}
.h-_b52px_B {
  height: 52rpx;
}
.h-_b77rpx_B {
  height: 77rpx;
}
.h-_b88_d88px_B {
  height: 88.88rpx;
}
.h-_b100px_B {
  height: 100rpx;
}
.h-_b111px_B {
  height: 111rpx;
}
.h-_b128px_B {
  height: 128rpx;
}
.h-_b200_v_B {
  height: 200%;
}
.h-_b300px_B {
  height: 300rpx;
}
.h-screen {
  height: 100vh;
}
.max-h-_b100px_B {
  max-height: 100rpx;
}
.min-h-_b100px_B {
  min-height: 100rpx;
}
.min-h-screen {
  min-height: 100vh;
}
.w-2 {
  width: calc(var(--spacing) * 2);
}
.w-5 {
  width: calc(var(--spacing) * 5);
}
.w-10 {
  width: calc(var(--spacing) * 10);
}
.w-12 {
  width: calc(var(--spacing) * 12);
}
.w-16 {
  width: calc(var(--spacing) * 16);
}
.w-20 {
  width: calc(var(--spacing) * 20);
}
.w-24 {
  width: calc(var(--spacing) * 24);
}
.w-32 {
  width: calc(var(--spacing) * 32);
}
.w-_b10rpx_B {
  width: 10rpx;
}
.w-_b12rpx_B {
  width: 12rpx;
}
.w-_b12rpx_B_e {
  width: 12rpx !important;
}
.w-_b20px_B {
  width: 20rpx;
}
.w-_b24rpx_B {
  width: 24rpx;
}
.w-_b24rpx_B_e {
  width: 24rpx !important;
}
.w-_b33_d33px_B {
  width: 33.33rpx;
}
.w-_b37_d5_v_B {
  width: 37.5%;
}
.w-_b43_d1px_B {
  width: 43.1rpx;
}
.w-_b50px_B {
  width: 50rpx;
}
.w-_b52px_B {
  width: 52rpx;
}
.w-_b61_d1px_B {
  width: 61.1rpx;
}
.w-_b77rpx_B {
  width: 77rpx;
}
.w-_b100px_B {
  width: 100rpx;
}
.w-_b120px_B {
  width: 120rpx;
}
.w-_b200_v_B {
  width: 200%;
}
.w-_b222px_B {
  width: 222rpx;
}
.w-_b242px_B {
  width: 242rpx;
}
.w-_b300rpx_B {
  width: 300rpx;
}
.w-_b323px_B {
  width: 323rpx;
}
.w-fit {
  width: -moz-fit-content;
  width: fit-content;
}
.w-screen {
  width: 100vw;
}
.max-w-4xl {
  max-width: var(--container-4xl);
}
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
.min-w-_b88_d5px_B {
  min-width: 88.5rpx;
}
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
.flex-1 {
  -ms-flex: 1;
  flex: 1;
}
.border-collapse {
  border-collapse: collapse;
}
.origin-_b100rpx_111rpx_B {
  -ms-transform-origin: 100rpx 111rpx;
  transform-origin: 100rpx 111rpx;
}
._e-translate-y-_b3_d5px_B {
  --tw-translate-y: -3.5rpx !important;
  translate: var(--tw-translate-x) var(--tw-translate-y) !important;
}
.translate-y-_b17rpx_B {
  --tw-translate-y: 17rpx;
  translate: var(--tw-translate-x) var(--tw-translate-y);
}
.scale-_b1_d03_B {
  scale: 1.03;
}
.-rotate-2 {
  rotate: -2deg;
}
.rotate-45 {
  rotate: 45deg;
}
.rotate-_b10deg_B {
  rotate: 10deg;
}
.transform {
  -ms-transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
.cursor-not-allowed {
  cursor: not-allowed;
}
.resize {
  resize: both;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.grid-cols-_b1fr_mauto_B {
  grid-template-columns: 1fr, auto;
}
.flex-col {
  -ms-flex-direction: column;
  flex-direction: column;
}
.flex-col-reverse {
  -ms-flex-direction: column-reverse;
  flex-direction: column-reverse;
}
.flex-row-reverse {
  -ms-flex-direction: row-reverse;
  flex-direction: row-reverse;
}
.items-center {
  -ms-flex-align: center;
  align-items: center;
}
.justify-center {
  -ms-flex-pack: center;
  justify-content: center;
}
.gap-1 {
  gap: calc(var(--spacing) * 1);
}
.gap-3 {
  gap: calc(var(--spacing) * 3);
}
.gap-3_d5 {
  gap: calc(var(--spacing) * 3.5);
}
.gap-6 {
  gap: calc(var(--spacing) * 6);
}
.gap-_b16rpx_B {
  gap: 16rpx;
}
.space-y-4 > text + text,
.space-y-4 > text + view,
.space-y-4 > view + text,
.space-y-4 > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
}
.space-y-_b1_d6rem_B > text + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
}
.space-y-_b11rpx_B > text + text,
.space-y-_b11rpx_B > text + view,
.space-y-_b11rpx_B > view + text,
.space-y-_b11rpx_B > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(11rpx * var(--tw-space-y-reverse));
  margin-top: calc(11rpx * (1 - var(--tw-space-y-reverse)));
}
.space-y-reverse > text + text,
.space-y-reverse > text + view,
.space-y-reverse > view + text,
.space-y-reverse > view + view {
  --tw-space-y-reverse: 1;
}
.space-x-2_d5 > text + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > view + view {
  --tw-space-x-reverse: 0;
  margin-left: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-x-reverse)));
  margin-right: calc(var(--spacing) * 2.5 * var(--tw-space-x-reverse));
}
.space-x-4 > text + text,
.space-x-4 > text + view,
.space-x-4 > view + text,
.space-x-4 > view + view {
  --tw-space-x-reverse: 0;
  margin-left: calc(var(--spacing) * 4 * (1 - var(--tw-space-x-reverse)));
  margin-right: calc(var(--spacing) * 4 * var(--tw-space-x-reverse));
}
.space-x-reverse > text + text,
.space-x-reverse > text + view,
.space-x-reverse > view + text,
.space-x-reverse > view + view {
  --tw-space-x-reverse: 1;
}
.divide-x-4 > text + text,
.divide-x-4 > text + view,
.divide-x-4 > view + text,
.divide-x-4 > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-left-width: calc(4rpx * (1 - var(--tw-divide-x-reverse)));
  border-right-style: var(--tw-border-style);
  border-right-width: calc(4rpx * var(--tw-divide-x-reverse));
}
.divide-x-8 > text + text,
.divide-x-8 > text + view,
.divide-x-8 > view + text,
.divide-x-8 > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-left-width: calc(8rpx * (1 - var(--tw-divide-x-reverse)));
  border-right-style: var(--tw-border-style);
  border-right-width: calc(8rpx * var(--tw-divide-x-reverse));
}
.divide-x-_b3px_B > text + text,
.divide-x-_b3px_B > text + view,
.divide-x-_b3px_B > view + text,
.divide-x-_b3px_B > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-left-width: calc(3rpx * (1 - var(--tw-divide-x-reverse)));
  border-right-style: var(--tw-border-style);
  border-right-width: calc(3rpx * var(--tw-divide-x-reverse));
}
.divide-x-_b10px_B > text + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
  border-right-style: var(--tw-border-style);
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
}
.divide-y-4 > text + text,
.divide-y-4 > text + view,
.divide-y-4 > view + text,
.divide-y-4 > view + view {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: calc(4rpx * var(--tw-divide-y-reverse));
  border-top-style: var(--tw-border-style);
  border-top-width: calc(4rpx * (1 - var(--tw-divide-y-reverse)));
}
.divide-y-reverse > text + text,
.divide-y-reverse > text + view,
.divide-y-reverse > view + text,
.divide-y-reverse > view + view {
  --tw-divide-y-reverse: 1;
}
.divide-dotted > text + text,
.divide-dotted > text + view,
.divide-dotted > view + text,
.divide-dotted > view + view {
  --tw-border-style: dotted;
  border-style: dotted;
}
.divide-double > text + text,
.divide-double > text + view,
.divide-double > view + text,
.divide-double > view + view {
  --tw-border-style: double;
  border-style: double;
}
.divide-solid > text + text,
.divide-solid > text + view,
.divide-solid > view + text,
.divide-solid > view + view {
  --tw-border-style: solid;
  border-style: solid;
}
.divide-_b_h41eb04_B > text + text,
.divide-_b_h41eb04_B > text + view,
.divide-_b_h41eb04_B > view + text,
.divide-_b_h41eb04_B > view + view {
  border-color: #41eb04;
}
.divide-_b_h60d256_B > text + text,
.divide-_b_h60d256_B > text + view,
.divide-_b_h60d256_B > view + text,
.divide-_b_h60d256_B > view + view {
  border-color: #60d256;
}
.divide-_b_h010101_B > text + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > view + view {
  border-color: #010101;
}
.divide-_b_hd80c0c_B > text + text,
.divide-_b_hd80c0c_B > text + view,
.divide-_b_hd80c0c_B > view + text,
.divide-_b_hd80c0c_B > view + view {
  border-color: #d80c0c;
}
.divide-_b3rpx_B > text + text,
.divide-_b3rpx_B > text + view,
.divide-_b3rpx_B > view + text,
.divide-_b3rpx_B > view + view {
  border-width: 3rpx;
}
.overflow-hidden {
  overflow: hidden;
}
.rounded {
  border-radius: 8rpx;
}
.rounded-_b12rpx_B {
  border-radius: 12rpx;
}
.rounded-_b18_d5px_B {
  border-radius: 18.5rpx;
}
.rounded-_b20rpx_B {
  border-radius: 20rpx;
}
/* tokens: rounded-[24rpx] <= src/pages/index/index.vue */
.rounded-_b24rpx_B {
  border-radius: 24rpx;
}
.rounded-_b40px_B {
  border-radius: 40rpx;
}
.rounded-full {
  border-radius: 9999rpx;
}
.rounded-lg {
  border-radius: var(--radius-lg);
}
.rounded-md {
  border-radius: var(--radius-md);
}
.rounded-xl {
  border-radius: var(--radius-xl);
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1rpx;
}
.border-4 {
  border-style: var(--tw-border-style);
  border-width: 4rpx;
}
.border-_b10px_B {
  border-width: 10rpx;
}
.border-_b10rpx_B {
  border-width: 10rpx;
}
.border-_b7rpx_B {
  border-width: 7rpx;
}
.border-_b_h098765_B {
  border-color: #098765;
}
.border-_b_h336699_B_f40 {
  border-color: rgba(51, 102, 153, 0.4);
}
.border-_b_h94a3b8_B {
  border-color: #94a3b8;
}
.border-_bred_B {
  border-color: red;
}
.border-b-_b4rpx_B {
  border-bottom-width: 4rpx;
}
.border-current {
  border-color: currentcolor;
}
.border-dashed {
  --tw-border-style: dashed;
  border-style: dashed;
}
.border-emerald-500 {
  border-color: var(--color-emerald-500);
}
.border-gray-400 {
  border-color: var(--color-gray-400);
}
.border-slate-200 {
  border-color: var(--color-slate-200);
}
.border-solid {
  --tw-border-style: solid;
  border-style: solid;
}
.border-t-_b3rpx_B {
  border-top-width: 3rpx;
}
.border-t-_b4px_B {
  border-top-width: 4rpx;
}
.border-transparent {
  border-color: transparent;
}
.border-zinc-900_f10 {
  border-color: rgba(24, 24, 27, 0.1);
}
._ebg-green-500 {
  background-color: var(--color-green-500) !important;
}
.bg-_p--my-color_P {
  background-color: var(--my-color);
}
.bg-_b_h0000ff_B {
  background-color: #00f;
}
.bg-_b_h16a34a_B {
  background-color: #16a34a;
}
.bg-_b_h89ab8d_B {
  background-color: #89ab8d;
}
.bg-_b_h2563eb_B {
  background-color: #2563eb;
}
.bg-_b_h3482f2_B {
  background-color: #3482f2;
}
.bg-_b_h4268EA_B {
  background-color: #4268ea;
}
.bg-_b_h123324_B {
  background-color: #123324;
}
/* tokens: bg-[#123456] <= src/pages/index/index.vue */
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-_b_h123498_B {
  background-color: #123498;
}
.bg-_b_h410000_B {
  background-color: #410000;
}
.bg-_b_h434332_B {
  background-color: #434332;
}
.bg-_b_h434354_B {
  background-color: #434354;
}
/* tokens: bg-[#534312] <= src/pages/index/index.vue */
.bg-_b_h534312_B {
  background-color: #534312;
}
.bg-_b_h654874_B {
  background-color: #654874;
}
.bg-_b_h666600_B {
  background-color: #660;
}
.bg-_b_h955443_B {
  background-color: #955443;
}
.bg-_b_h987654_B {
  background-color: #987654;
}
.bg-_b_h999999_B {
  background-color: #999;
}
.bg-_b_hB91C1C_B {
  background-color: #b91c1c;
}
.bg-_b_hc65ece_B {
  background-color: #c65ece;
}
.bg-_b_hd72929_B {
  background-color: #d72929;
}
.bg-_b_hdc2626_B {
  background-color: #dc2626;
}
.bg-_b_he6e6e6_B {
  background-color: #e6e6e6;
}
.bg-_b_he24826_B {
  background-color: #e24826;
}
.bg-_b_hfff_B {
  background-color: #fff;
}
.bg-_bcolor_cvar_p--mystery-var_P_B {
  background-color: var(--mystery-var);
}
.bg-_brgb_p255_m210_m55_P_B {
  background-color: #ffd237;
}
.bg-_byellow_B {
  background-color: #ff0;
}
.bg-amber-300 {
  background-color: var(--color-amber-300);
}
.bg-amber-500 {
  background-color: var(--color-amber-500);
}
.bg-amber-600 {
  background-color: var(--color-amber-600);
}
.bg-amber-700 {
  background-color: var(--color-amber-700);
}
.bg-amber-800 {
  background-color: var(--color-amber-800);
}
.bg-black {
  background-color: var(--color-black);
}
.bg-blue-300 {
  background-color: var(--color-blue-300);
}
.bg-blue-400 {
  background-color: var(--color-blue-400);
}
.bg-blue-500 {
  background-color: var(--color-blue-500);
}
.bg-blue-500_f50 {
  background-color: rgba(59, 130, 246, 0.5);
}
.bg-blue-600 {
  background-color: var(--color-blue-600);
}
.bg-cyan-500 {
  background-color: var(--color-cyan-500);
}
.bg-emerald-100 {
  background-color: var(--color-emerald-100);
}
.bg-emerald-500 {
  background-color: var(--color-emerald-500);
}
.bg-gray-100 {
  background-color: var(--color-gray-100);
}
.bg-gray-300 {
  background-color: var(--color-gray-300);
}
.bg-green-300 {
  background-color: var(--color-green-300);
}
.bg-green-500 {
  background-color: var(--color-green-500);
}
/* tokens: bg-normal-subpackage-marker <= src/sub-normal/pages/index.vue */
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.bg-pink-300 {
  background-color: var(--color-pink-300);
}
.bg-pink-500 {
  background-color: var(--color-pink-500);
}
.bg-purple-300 {
  background-color: var(--color-purple-300);
}
/* tokens: bg-purple-800 <= src/pages/index/index.vue */
.bg-purple-800 {
  background-color: var(--color-purple-800);
}
.bg-red-400 {
  background-color: var(--color-red-400);
}
.bg-red-500 {
  background-color: var(--color-red-500);
}
.bg-red-500_f50 {
  background-color: rgba(239, 68, 68, 0.5);
}
.bg-sky-500 {
  background-color: var(--color-sky-500);
}
.bg-sky-500_f80 {
  background-color: rgba(14, 165, 233, 0.8);
}
.bg-slate-50 {
  background-color: var(--color-slate-50);
}
.bg-transparent {
  background-color: transparent;
}
.bg-white {
  background-color: var(--color-white);
}
.bg-zinc-50 {
  background-color: var(--color-zinc-50);
}
.bg-linear-to-r {
  --tw-gradient-position: to right;
}
.bg-linear-to-r {
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-b {
  --tw-gradient-position: to bottom;
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
/* tokens: bg-gradient-to-r <= src/pages/index/index.vue */
.bg-gradient-to-r {
  --tw-gradient-position: to right in oklab;
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-t {
  --tw-gradient-position: to top;
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-tr {
  --tw-gradient-position: to top right;
  background-image: -webkit-linear-gradient(var(--tw-gradient-stops));
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-_blinear-gradient_p135deg_m_hf8fafc_0_v_m_hdbeafe_100_v_P_B {
  background-image: -webkit-linear-gradient(315deg, #f8fafc, #dbeafe);
  background-image: linear-gradient(135deg, #f8fafc, #dbeafe);
}
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url(https://xxx.com/xx.webp);
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
.to-_b_h4bcefd_B {
  --tw-gradient-to: #4bcefd;
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
._bmask-type_calpha_B {
  mask-type: alpha;
}
._bmask-type_cluminance_B {
  mask-type: luminance;
}
._ep-_b18_d5px_B {
  padding: 18.5rpx !important;
}
._bpadding_c20rpx_B {
  padding: 20rpx;
}
.p-0_d5 {
  padding: calc(var(--spacing) * 0.5);
}
.p-1 {
  padding: calc(var(--spacing) * 1);
}
.p-2 {
  padding: calc(var(--spacing) * 2);
}
.p-3 {
  padding: calc(var(--spacing) * 3);
}
.p-3_e {
  padding: calc(var(--spacing) * 3) !important;
}
.p-4 {
  padding: calc(var(--spacing) * 4);
}
.p-4_e {
  padding: calc(var(--spacing) * 4) !important;
}
.p-5 {
  padding: calc(var(--spacing) * 5);
}
.p-6 {
  padding: calc(var(--spacing) * 6);
}
.p-8 {
  padding: calc(var(--spacing) * 8);
}
.p-_b5rpx_B {
  padding: 5rpx;
}
.p-_b12rpx_B {
  padding: 12rpx;
}
.p-_b16rpx_B {
  padding: 16rpx;
}
.p-_b20px_B {
  padding: 20rpx;
}
.p-_b24rpx_B {
  padding: 24rpx;
}
.px-2 {
  padding-left: calc(var(--spacing) * 2);
  padding-right: calc(var(--spacing) * 2);
}
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.px-5 {
  padding-left: calc(var(--spacing) * 5);
  padding-right: calc(var(--spacing) * 5);
}
.px-6 {
  padding-left: calc(var(--spacing) * 6);
  padding-right: calc(var(--spacing) * 6);
}
.px-_b13_d5px_B {
  padding-left: 13.5rpx;
  padding-right: 13.5rpx;
}
.px-_b16rpx_B {
  padding-left: 16rpx;
  padding-right: 16rpx;
}
.px-_b20rpx_B {
  padding-left: 20rpx;
  padding-right: 20rpx;
}
/* tokens: px-[32px] <= src/pages/index/index.vue */
.px-_b32px_B {
  padding-left: 32rpx;
  padding-right: 32rpx;
}
.px-_b35px_B {
  padding-left: 35rpx;
  padding-right: 35rpx;
}
.px-_b95px_B {
  padding-left: 95rpx;
  padding-right: 95rpx;
}
.py-1 {
  padding-bottom: calc(var(--spacing) * 1);
  padding-top: calc(var(--spacing) * 1);
}
.py-1_d5 {
  padding-bottom: calc(var(--spacing) * 1.5);
  padding-top: calc(var(--spacing) * 1.5);
}
.py-2 {
  padding-bottom: calc(var(--spacing) * 2);
  padding-top: calc(var(--spacing) * 2);
}
.py-3 {
  padding-bottom: calc(var(--spacing) * 3);
  padding-top: calc(var(--spacing) * 3);
}
.py-6 {
  padding-bottom: calc(var(--spacing) * 6);
  padding-top: calc(var(--spacing) * 6);
}
.py-_b6rpx_B {
  padding-bottom: 6rpx;
  padding-top: 6rpx;
}
.py-_b8rpx_B {
  padding-bottom: 8rpx;
  padding-top: 8rpx;
}
.py-_b10rpx_B {
  padding-bottom: 10rpx;
  padding-top: 10rpx;
}
.py-_b12rpx_B {
  padding-bottom: 12rpx;
  padding-top: 12rpx;
}
/* tokens: py-[18px] <= src/pages/index/index.vue */
.py-_b18px_B {
  padding-bottom: 18rpx;
  padding-top: 18rpx;
}
.py-_b62px_B {
  padding-bottom: 62rpx;
  padding-top: 62rpx;
}
.text-center {
  text-align: center;
}
.indent-_b11rpx_B {
  text-indent: 11rpx;
}
.text-2xl {
  font-size: var(--text-2xl);
  line-height: var(--tw-leading, var(--text-2xl--line-height));
}
.text-_b13_d5px_B {
  font-size: 13.5rpx;
}
.text-_b16px_B {
  font-size: 16rpx;
}
.text-_b17rpx_B {
  font-size: 17rpx;
}
.text-_b20px_B {
  font-size: 20rpx;
}
.text-_b22px_B {
  font-size: 22rpx;
}
.text-_b24rpx_B {
  font-size: 24rpx;
}
.text-_b28rpx_B {
  font-size: 28rpx;
}
.text-_b28rpx_B_f7 {
  font-size: 28rpx;
  line-height: calc(var(--spacing) * 7);
}
.text-_b30px_B {
  font-size: 30rpx;
}
.text-_b30rpx_B {
  font-size: 30rpx;
}
.text-_b32px_B {
  font-size: 32rpx;
}
.text-_b32rpx_B {
  font-size: 32rpx;
}
.text-_b34px_B {
  font-size: 34rpx;
}
.text-_b44px_B {
  font-size: 44rpx;
}
.text-_b45rpx_B {
  font-size: 45rpx;
}
.text-_b50px_B {
  font-size: 50rpx;
}
.text-_b55rpx_B {
  font-size: 55rpx;
}
.text-_b56_d5rpx_B {
  font-size: 56.5rpx;
}
.text-_b66rpx_B {
  font-size: 66rpx;
}
.text-_b77rpx_B {
  font-size: 77rpx;
}
.text-base {
  font-size: var(--text-base);
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-lg {
  font-size: var(--text-lg);
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-lg_f7 {
  font-size: var(--text-lg);
  line-height: calc(var(--spacing) * 7);
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
/* tokens: text-[100rpx] <= src/pages/index/index.vue */
.text-_b100rpx_B {
  font-size: 100rpx;
}
.text-_b102_d43rpx_B {
  font-size: 102.43rpx;
}
.text-_blength_ccalc_p2_x9_d43px_P_B {
  font-size: 18.86rpx;
}
.text-_blength_cvar_p--my-var-length_P_B {
  font-size: var(--my-var-length);
}
.leading-6 {
  --tw-leading: calc(var(--spacing) * 6);
  line-height: calc(var(--spacing) * 6);
}
.leading-_b0_d9_B {
  --tw-leading: 0.9;
  line-height: 0.9;
}
.leading-_b23rpx_B {
  --tw-leading: 23rpx;
  line-height: 23rpx;
}
._efont-bold {
  --tw-font-weight: var(--font-weight-bold) !important;
  font-weight: var(--font-weight-bold) !important;
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
.tracking-wide {
  --tw-tracking: var(--tracking-wide);
  letter-spacing: var(--tracking-wide);
}
._etext-_b_h990000_B {
  color: #900 !important;
}
.text-_b_h0000ff_B {
  color: #00f;
}
.text-_b_h00f285_B {
  color: #00f285;
}
.text-_b_h0b138f_B {
  color: #0b138f;
}
.text-_b_h123456_B {
  color: #123456;
}
.text-_b_h16a34a_B {
  color: #16a34a;
}
.text-_b_h1f2937_B {
  color: #1f2937;
}
.text-_b_h2563eb_B {
  color: #2563eb;
}
.text-_b_h3d31a4_B {
  color: #3d31a4;
}
.text-_b_h438821_B {
  color: #438821;
}
.text-_b_h654321_B {
  color: #654321;
}
.text-_b_h888800_B {
  color: #880;
}
.text-_b_h929292_B {
  color: #929292;
}
.text-_b_hab1932_B {
  color: #ab1932;
}
.text-_b_habcdef_B {
  color: #abcdef;
}
.text-_b_hbada55_B {
  color: #bada55;
}
.text-_b_hc31d6b_B {
  color: #c31d6b;
}
.text-_b_hdddddd_B {
  color: #ddd;
}
.text-_b_hececec_B {
  color: #ececec;
}
.text-_b_hfafafa_B {
  color: #fafafa;
}
/* tokens: text-[#fff] <= src/pages/index/index.vue */
.text-_b_hfff_B {
  color: #fff;
}
/* tokens: text-[#ffffff] <= src/pages/index/index.vue */
.text-_b_hffffff_B {
  color: #fff;
}
.text-_bcolor_cvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bred_B {
  color: red;
}
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bvar_p--text_r_sec_r_light_P_B {
  color: var(--text_sec_light);
}
.text-_bvar_p--text_sec_light_P_B {
  color: var(--text_sec_light);
}
.text-black {
  color: var(--color-black);
}
.text-emerald-600 {
  color: var(--color-emerald-600);
}
.text-gray-800 {
  color: var(--color-gray-800);
}
/* tokens: text-pink-200 <= src/pages/index/index.vue */
.text-pink-200 {
  color: var(--color-pink-200);
}
.text-red-400 {
  color: var(--color-red-400);
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
.text-zinc-600 {
  color: var(--color-zinc-600);
}
.text-zinc-900 {
  color: var(--color-zinc-900);
}
.capitalize {
  text-transform: capitalize;
}
.uppercase {
  text-transform: uppercase;
}
.underline {
  text-decoration-line: underline;
}
.underline-offset-_b3rpx_B {
  text-underline-offset: 3rpx;
}
.opacity-50 {
  opacity: 0.5;
}
.opacity-_b0_d82_B {
  opacity: 0.82;
}
.shadow {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0_2_d5px_7_d5px_rgba_p18_m52_m86_m0_d35_P_B {
  --tw-shadow: 0 2.5rpx 7.5rpx var(--tw-shadow-color, rgba(18, 52, 86, 0.35));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0_8rpx_24rpx_rgba_p0_m0_m0_m0_d12_P_B {
  --tw-shadow: 0 8rpx 24rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.12));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0rpx 2rpx 11rpx 0rpx var(--tw-shadow-color, #00000a);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0rpx 2rpx 11rpx 0rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-md {
  --tw-shadow: 0 4rpx 6rpx -1rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 2rpx 4rpx -2rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-sm {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring-4 {
  --tw-ring-shadow: var(--tw-ring-inset, ) 0 0 0 calc(4rpx + var(--tw-ring-offset-width)) var(--tw-ring-color, var(--color-blue-500, #3b82f6));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-amber-100 {
  --tw-shadow-color: #fef3c7;
}
.shadow-blue-100 {
  --tw-shadow-color: #dbeafe;
}
.shadow-cyan-100 {
  --tw-shadow-color: #cffafe;
}
.shadow-green-100 {
  --tw-shadow-color: #dcfce7;
}
.shadow-indigo-100 {
  --tw-shadow-color: #e0e7ff;
}
.ring-_b10rpx_B {
  --tw-ring-offset-width: 10rpx;
}
.ring-pink-300 {
  --tw-ring-color: var(--color-pink-300);
}
.ring-offset-_b3rpx_B {
  --tw-ring-offset-color: 3rpx;
}
.outline {
  outline-style: var(--tw-outline-style);
  outline-width: 1px;
}
.outline-offset-_b3rpx_B {
  outline-offset: 3rpx;
}
.outline-_b5rpx_B {
  outline-width: 5rpx;
}
.blur {
  --tw-blur: blur(8px);
  filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, )
    var(--tw-drop-shadow, );
}
.blur-_b2rpx_B {
  --tw-blur: blur(2rpx);
  filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, )
    var(--tw-drop-shadow, );
}
.filter {
  filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, )
    var(--tw-drop-shadow, );
}
.backdrop-blur-_b2rpx_B {
  --tw-backdrop-blur: blur(2rpx);
  backdrop-filter: var(--tw-backdrop-blur, ) var(--tw-backdrop-brightness, ) var(--tw-backdrop-contrast, ) var(--tw-backdrop-grayscale, ) var(--tw-backdrop-hue-rotate, )
    var(--tw-backdrop-invert, ) var(--tw-backdrop-opacity, ) var(--tw-backdrop-saturate, ) var(--tw-backdrop-sepia, );
}
.transition {
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  transition-property:
    color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow,
    transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
}
.transition-colors {
  transition-duration: var(--tw-duration, var(--default-transition-duration));
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
}
.duration-300 {
  --tw-duration: 300ms;
  transition-duration: 0.3s;
}
._b--scroll-offset_c56px_B {
  --scroll-offset: 56rpx;
}
.divide-x-reverse > text + text,
.divide-x-reverse > text + view,
.divide-x-reverse > view + text,
.divide-x-reverse > view + view {
  --tw-divide-x-reverse: 1;
}
.group.published text.group-_b_dpublished_B_ctext-green-500,
.group.published view.group-_b_dpublished_B_ctext-green-500 {
  color: var(--color-green-500);
}
.peer.tapped ~ text.peer-_b_dtapped_B_cbg-red-400,
.peer.tapped ~ view.peer-_b_dtapped_B_cbg-red-400 {
  background-color: var(--color-red-400);
}
.before_cabsolute::before {
  content: var(--tw-content);
  position: absolute;
}
.before_cinset-0::before {
  bottom: calc(var(--spacing) * 0);
  content: var(--tw-content);
  left: calc(var(--spacing) * 0);
  right: calc(var(--spacing) * 0);
  top: calc(var(--spacing) * 0);
}
.before_cmr-1::before {
  content: var(--tw-content);
  margin-right: calc(var(--spacing) * 1);
}
.before_crounded-_b20rpx_B::before {
  border-radius: 20rpx;
  content: var(--tw-content);
}
.before_cborder-2::before {
  border-style: var(--tw-border-style);
  border-width: 2rpx;
  content: var(--tw-content);
}
.before_cborder-_b_h4bd650_B::before {
  border-color: #4bd650;
  content: var(--tw-content);
}
.before_ccontent-_b_a_x_a_B::before {
  --tw-content: '*';
  content: var(--tw-content);
}
.before_ccontent-_b_a222_a_B::before {
  --tw-content: '222';
  content: var(--tw-content);
}
.before_ccontent-_b_a11111_a_B::before {
  --tw-content: '11111';
  content: var(--tw-content);
}
.before_ccontent-_b_aFestivus_a_B::before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-webpack-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-webpack-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: before:content-['independent_subpackage_taro-webpack-vue3-tailwindcss-v4'] <= src/sub-independent/pages/index.vue */
.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage uni-app-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_amoduleA_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 独立分包';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-webpack-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-webpack-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_taro-webpack-vue3-tailwindcss-v4'] <= src/sub-normal/pages/index.vue */
.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage uni-app-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.bg-normal-subpackage-marker {
  background-color: #2563eb;
}
.before_ccontent-_b_av3_a_B::before {
  --tw-content: 'v3';
  content: var(--tw-content);
}
.before_ccontent-_b_av4_a_B::before {
  --tw-content: 'v4';
  content: var(--tw-content);
}
.after_cborder-none::after {
  content: var(--tw-content);
  --tw-border-style: none;
  border-style: none;
}
.after_ccontent-_b_av3_apply_a_B::after {
  --tw-content: 'v3 apply';
  content: var(--tw-content);
}
.after_ccontent-_b_au_x6211_u_x662f_className_a_B::after {
  --tw-content: '我是className';
  content: var(--tw-content);
}
.after_ccontent-_b_au_x6211_u_x6765_u_x81ea_utils_dfilter_djs_a_B::after {
  --tw-content: '我来自utils.filter.js';
  content: var(--tw-content);
}
.after_ccontent-_b_r_au_x6211_u_x6765_u_x81ea_inline-wxs_r_a_B::after {
  --tw-content: \'我来自inline-wxs\';
  content: var(--tw-content);
}
.odd_cmb-2:nth-child(odd) {
  margin-bottom: calc(var(--spacing) * 2);
}
.focus_cring:focus {
  --tw-ring-shadow: var(--tw-ring-inset, ) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.focus_cring-blue-300:focus {
  --tw-ring-color: var(--color-blue-300);
}
.focus_coutline-none:focus {
  --tw-outline-style: none;
  outline-style: none;
}
.active_cbg-emerald-50:active {
  background-color: var(--color-emerald-50);
}
.active_cbg-emerald-600:active {
  background-color: var(--color-emerald-600);
}
.active_cbg-green-300:active {
  background-color: var(--color-green-300);
}
@media (min-width: 48rem) {
  .md_cgrid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (min-width: 64rem) {
  .lg_c_b--scroll-offset_c44px_B {
    --scroll-offset: 44rpx;
  }
}
@media (min-width: 96rem) {
  ._2xl_ctext-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
}
@media (min-width: 96rem) {
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-_b_h123456_B {
    background-color: #123456;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: var(--color-green-500);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-800 {
    background-color: var(--color-zinc-800);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-900 {
    background-color: var(--color-zinc-900);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-_b_hec4f4f_B {
    color: #ec4f4f;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-yellow-400 {
    color: var(--color-yellow-400);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-zinc-50 {
    color: var(--color-zinc-50);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-zinc-300 {
    color: var(--color-zinc-300);
  }
}
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  color: var(--color-red-400) !important;
}
._b_n_view_B_cp-_b12rpx_B view {
  padding: 12rpx;
}
.focus_c_b_n_view_B_cp-4:focus view {
  padding: calc(var(--spacing) * 4);
}
._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3) {
  padding-bottom: calc(var(--spacing) * 0);
  padding-top: calc(var(--spacing) * 0);
}
._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3) {
  padding-bottom: calc(var(--spacing) * 4);
  padding-top: calc(var(--spacing) * 4);
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
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate-x:;
  --tw-rotate-y:;
  --tw-rotate-z:;
  --tw-skew-x:;
  --tw-skew-y:;
  --tw-space-x-reverse: 0;
  --tw-space-y-reverse: 0;
  --tw-border-style: solid;
  --tw-divide-x-reverse: 0;
  --tw-divide-y-reverse: 0;
  --tw-gradient-position: initial;
  --tw-gradient-from: #0000;
  --tw-gradient-to: #0000;
  --tw-gradient-stops: initial;
  --tw-gradient-via-stops: initial;
  --tw-gradient-from-position: 0%;
  --tw-gradient-to-position: 100%;
  --tw-font-weight:;
  --tw-blur:;
  --tw-brightness:;
  --tw-contrast:;
  --tw-grayscale:;
  --tw-hue-rotate:;
  --tw-invert:;
  --tw-saturate:;
  --tw-sepia:;
  --tw-drop-shadow:;
  --tw-backdrop-blur:;
  --tw-backdrop-brightness:;
  --tw-backdrop-contrast:;
  --tw-backdrop-grayscale:;
  --tw-backdrop-hue-rotate:;
  --tw-backdrop-invert:;
  --tw-backdrop-opacity:;
  --tw-backdrop-saturate:;
  --tw-backdrop-sepia:;
  --tw-duration: initial;
  --tw-ease: initial;
  --tw-content: '';
  --tw-leading:;
  --tw-tracking:;
  --tw-outline-style: solid;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-color: initial;
  --tw-inset-shadow: 0 0 #0000;
  --tw-ring-color:;
  --tw-ring-shadow: 0 0 #0000;
  --tw-inset-ring-shadow: 0 0 #0000;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-offset-shadow: 0 0 #0000;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-black: #000;
  --color-gray-300: #d1d5db;
  --color-gray-800: #1f2937;
  --color-zinc-300: #d4d4d8;
  --color-zinc-600: #52525b;
  --color-red-400: #f87171;
  --color-amber-100: #fef3c7;
  --color-amber-500: #f59e0b;
  --color-amber-600: #d97706;
  --color-amber-700: #b45309;
  --color-amber-800: #92400e;
  --color-yellow-400: #facc15;
  --color-green-100: #dcfce7;
  --color-cyan-100: #cffafe;
  --color-sky-500: #0ea5e9;
  --color-blue-100: #dbeafe;
  --color-blue-400: #60a5fa;
  --color-blue-600: #2563eb;
  --color-indigo-100: #e0e7ff;
  --color-pink-500: #ec4899;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-red-500: rgb(251, 44, 54);
  --color-green-500: rgb(0, 198, 90);
  --color-emerald-50: rgb(236, 253, 245);
  --color-emerald-100: rgb(208, 250, 229);
  --color-emerald-500: rgb(0, 185, 129);
  --color-emerald-600: rgb(0, 150, 105);
  --color-cyan-500: rgb(0, 182, 212);
  --color-blue-500: rgb(50, 128, 255);
  --color-slate-50: rgb(248, 250, 252);
  --color-slate-200: rgb(226, 232, 240);
  --color-slate-500: rgb(98, 116, 142);
  --color-slate-800: rgb(29, 41, 61);
  --color-slate-900: rgb(15, 23, 43);
  --color-gray-100: rgb(243, 244, 246);
  --color-zinc-800: rgb(39, 39, 42);
  --color-white: #fff;
  --color-purple-300: rgb(216, 180, 255);
  --color-purple-800: #6b21a8;
  --color-pink-200: #fbcfe8;
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --color-amber-300: rgb(255, 210, 55);
  --color-green-300: rgb(123, 241, 168);
  --color-blue-300: rgb(145, 197, 255);
  --color-pink-300: rgb(253, 165, 213);
  --spacing: 8rpx;
  --container-4xl: 1792rpx;
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
  --text-2xl: 48rpx;
  --text-2xl--line-height: 1.33333;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --tracking-wide: 0.025em;
  --radius-md: 12rpx;
  --radius-lg: 16rpx;
  --radius-xl: 24rpx;
  --default-transition-duration: 150ms;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.visible {
  visibility: visible;
}
.relative {
  position: relative;
}
.static {
  position: static;
}
.-inset-1 {
  top: calc(var(--spacing) * -1);
  right: calc(var(--spacing) * -1);
  bottom: calc(var(--spacing) * -1);
  left: calc(var(--spacing) * -1);
}
.-inset-_b1rpx_B {
  top: -1rpx;
  right: -1rpx;
  bottom: -1rpx;
  left: -1rpx;
}
.-inset-x-1_e {
  left: calc(var(--spacing) * -1) !important;
  right: calc(var(--spacing) * -1) !important;
}
.inset-x-4 {
  left: calc(var(--spacing) * 4);
  right: calc(var(--spacing) * 4);
}
.inset-x-_b12rpx_B {
  left: 12rpx;
  right: 12rpx;
}
.inset-x-px {
  left: 1rpx;
  right: 1rpx;
}
.inset-y-6 {
  top: calc(var(--spacing) * 6);
  bottom: calc(var(--spacing) * 6);
}
.right-2_e {
  right: calc(var(--spacing) * 2) !important;
}
.right-4 {
  right: calc(var(--spacing) * 4);
}
.bottom-auto {
  bottom: auto;
}
.-m-_b20px_B {
  margin: -20rpx;
}
.m-_b5rpx_B {
  margin: 5rpx;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
._emt-0 {
  margin-top: calc(var(--spacing) * 0) !important;
}
.-mt-1_d5 {
  margin-top: calc(var(--spacing) * -1.5);
}
.-mt-2 {
  margin-top: calc(var(--spacing) * -2);
}
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
.mt-3 {
  margin-top: calc(var(--spacing) * 3);
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
.mt-_b24px_B {
  margin-top: 24rpx;
}
.mt-_b26_d2px_B {
  margin-top: 26.2rpx;
}
.mt-_b96_d3px_B {
  margin-top: 96.3rpx;
}
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
.-ml-_b5_d5px_B {
  margin-left: -5.5rpx;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
._ehidden {
  display: none !important;
}
.block {
  display: block;
}
.flex {
  display: flex;
}
.grid {
  display: grid;
}
.inline {
  display: inline;
}
.inline-block {
  display: inline-block;
}
.inline-flex {
  display: inline-flex;
}
.table {
  display: table;
}
.aspect-_p--my-aspect-ratio_P {
  aspect-ratio: var(--my-aspect-ratio);
}
.aspect-_bcalc_p4_x3_u1_P_f3_B {
  aspect-ratio: 13/3;
}
.h-2 {
  height: calc(var(--spacing) * 2);
}
.h-3 {
  height: calc(var(--spacing) * 3);
}
.h-5 {
  height: calc(var(--spacing) * 5);
}
.h-10 {
  height: calc(var(--spacing) * 10);
}
.h-12 {
  height: calc(var(--spacing) * 12);
}
/* tokens: h-14 <= src/pages/index/index.vue */
.h-14 {
  height: calc(var(--spacing) * 14);
}
.h-20 {
  height: calc(var(--spacing) * 20);
}
.h-24 {
  height: calc(var(--spacing) * 24);
}
.h-_b6rem_B {
  height: 192rpx;
}
.h-_b20px_B {
  height: 20rpx;
}
.h-_b30px_B {
  height: 30rpx;
}
.h-_b42_d99px_B {
  height: 42.99rpx;
}
.h-_b50_d99px_B {
  height: 50.99rpx;
}
.h-_b52px_B {
  height: 52rpx;
}
.h-_b77rpx_B {
  height: 77rpx;
}
.h-_b88_d88px_B {
  height: 88.88rpx;
}
.h-_b100px_B {
  height: 100rpx;
}
.h-_b111px_B {
  height: 111rpx;
}
.h-_b128px_B {
  height: 128rpx;
}
.h-_b200_v_B {
  height: 200%;
}
.h-_b300px_B {
  height: 300rpx;
}
.h-screen {
  height: 100vh;
}
.max-h-_b100px_B {
  max-height: 100rpx;
}
.min-h-_b100px_B {
  min-height: 100rpx;
}
.min-h-screen {
  min-height: 100vh;
}
.w-2 {
  width: calc(var(--spacing) * 2);
}
.w-5 {
  width: calc(var(--spacing) * 5);
}
.w-10 {
  width: calc(var(--spacing) * 10);
}
.w-12 {
  width: calc(var(--spacing) * 12);
}
.w-16 {
  width: calc(var(--spacing) * 16);
}
.w-20 {
  width: calc(var(--spacing) * 20);
}
.w-24 {
  width: calc(var(--spacing) * 24);
}
.w-32 {
  width: calc(var(--spacing) * 32);
}
.w-_b10rpx_B {
  width: 10rpx;
}
.w-_b12rpx_B {
  width: 12rpx;
}
.w-_b12rpx_B_e {
  width: 12rpx !important;
}
.w-_b20px_B {
  width: 20rpx;
}
.w-_b24rpx_B {
  width: 24rpx;
}
.w-_b24rpx_B_e {
  width: 24rpx !important;
}
.w-_b33_d33px_B {
  width: 33.33rpx;
}
.w-_b37_d5_v_B {
  width: 37.5%;
}
.w-_b43_d1px_B {
  width: 43.1rpx;
}
.w-_b50px_B {
  width: 50rpx;
}
.w-_b52px_B {
  width: 52rpx;
}
.w-_b61_d1px_B {
  width: 61.1rpx;
}
.w-_b77rpx_B {
  width: 77rpx;
}
.w-_b100px_B {
  width: 100rpx;
}
.w-_b120px_B {
  width: 120rpx;
}
.w-_b200_v_B {
  width: 200%;
}
.w-_b222px_B {
  width: 222rpx;
}
.w-_b242px_B {
  width: 242rpx;
}
.w-_b300rpx_B {
  width: 300rpx;
}
.w-_b323px_B {
  width: 323rpx;
}
.w-fit {
  width: fit-content;
}
.w-screen {
  width: 100vw;
}
.max-w-4xl {
  max-width: var(--container-4xl);
}
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
.min-w-_b88_d5px_B {
  min-width: 88.5rpx;
}
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
.flex-1 {
  flex: 1;
}
.border-collapse {
  border-collapse: collapse;
}
.origin-_b100rpx_111rpx_B {
  transform-origin: 100rpx 111rpx;
}
._e-translate-y-_b3_d5px_B {
  --tw-translate-y: -3.5rpx !important;
  translate: var(--tw-translate-x) var(--tw-translate-y) !important;
}
.translate-y-_b17rpx_B {
  --tw-translate-y: 17rpx;
  translate: var(--tw-translate-x) var(--tw-translate-y);
}
.scale-_b1_d03_B {
  scale: 1.03;
}
.-rotate-2 {
  rotate: -2deg;
}
.rotate-45 {
  rotate: 45deg;
}
.rotate-_b10deg_B {
  rotate: 10deg;
}
.transform {
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
.cursor-not-allowed {
  cursor: not-allowed;
}
.resize {
  resize: both;
}
.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.grid-cols-_b1fr_mauto_B {
  grid-template-columns: 1fr, auto;
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
.justify-center {
  justify-content: center;
}
.gap-1 {
  gap: calc(var(--spacing) * 1);
}
.gap-3 {
  gap: calc(var(--spacing) * 3);
}
.gap-3_d5 {
  gap: calc(var(--spacing) * 3.5);
}
.gap-6 {
  gap: calc(var(--spacing) * 6);
}
.gap-_b16rpx_B {
  gap: 16rpx;
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
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
}
.space-y-_b11rpx_B > view + view,
.space-y-_b11rpx_B > view + text,
.space-y-_b11rpx_B > text + view,
.space-y-_b11rpx_B > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(11rpx * var(--tw-space-y-reverse));
  margin-top: calc(11rpx * (1 - var(--tw-space-y-reverse)));
}
.space-y-reverse > view + view,
.space-y-reverse > view + text,
.space-y-reverse > text + view,
.space-y-reverse > text + text {
  --tw-space-y-reverse: 1;
}
.space-x-2_d5 > view + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: calc((var(--spacing) * 2.5) * var(--tw-space-x-reverse));
  margin-right: calc(var(--spacing) * 2.5 * var(--tw-space-x-reverse));
  margin-left: calc((var(--spacing) * 2.5) * (1 - var(--tw-space-x-reverse)));
  margin-left: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-x-reverse)));
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
  border-right-width: calc(4rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(4rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-x-8 > view + view,
.divide-x-8 > view + text,
.divide-x-8 > text + view,
.divide-x-8 > text + text {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(8rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(8rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-x-_b3px_B > view + view,
.divide-x-_b3px_B > view + text,
.divide-x-_b3px_B > text + view,
.divide-x-_b3px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(3rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(3rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-y-4 > view + view,
.divide-y-4 > view + text,
.divide-y-4 > text + view,
.divide-y-4 > text + text {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: calc(4rpx * var(--tw-divide-y-reverse));
  border-top-width: calc(4rpx * (1 - var(--tw-divide-y-reverse)));
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
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  --tw-border-style: solid;
  border-style: solid;
}
.divide-_b_h41eb04_B > view + view,
.divide-_b_h41eb04_B > view + text,
.divide-_b_h41eb04_B > text + view,
.divide-_b_h41eb04_B > text + text {
  border-color: #41eb04;
}
.divide-_b_h60d256_B > view + view,
.divide-_b_h60d256_B > view + text,
.divide-_b_h60d256_B > text + view,
.divide-_b_h60d256_B > text + text {
  border-color: #60d256;
}
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  border-color: #010101;
}
.divide-_b_hd80c0c_B > view + view,
.divide-_b_hd80c0c_B > view + text,
.divide-_b_hd80c0c_B > text + view,
.divide-_b_hd80c0c_B > text + text {
  border-color: #d80c0c;
}
.divide-_b3rpx_B > view + view,
.divide-_b3rpx_B > view + text,
.divide-_b3rpx_B > text + view,
.divide-_b3rpx_B > text + text {
  border-width: 3rpx;
}
.overflow-hidden {
  overflow: hidden;
}
.rounded {
  border-radius: 8rpx;
}
.rounded-_b12rpx_B {
  border-radius: 12rpx;
}
.rounded-_b18_d5px_B {
  border-radius: 18.5rpx;
}
.rounded-_b20rpx_B {
  border-radius: 20rpx;
}
/* tokens: rounded-[24rpx] <= src/pages/index/index.vue */
.rounded-_b24rpx_B {
  border-radius: 24rpx;
}
.rounded-_b40px_B {
  border-radius: 40rpx;
}
.rounded-full {
  border-radius: 9999px;
}
.rounded-lg {
  border-radius: var(--radius-lg);
}
.rounded-md {
  border-radius: var(--radius-md);
}
.rounded-xl {
  border-radius: var(--radius-xl);
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1rpx;
}
.border-4 {
  border-style: var(--tw-border-style);
  border-width: 4rpx;
}
.border-_b10px_B {
  border-width: 10rpx;
}
.border-_b10rpx_B {
  border-width: 10rpx;
}
.border-_b7rpx_B {
  border-width: 7rpx;
}
.border-_b_h098765_B {
  border-color: #098765;
}
.border-_b_h336699_B_f40 {
  border-color: rgba(51, 102, 153, 0.4);
}
.border-_b_h94a3b8_B {
  border-color: #94a3b8;
}
.border-_bred_B {
  border-color: red;
}
.border-b-_b4rpx_B {
  border-bottom-width: 4rpx;
}
.border-current {
  border-color: currentcolor;
}
.border-dashed {
  --tw-border-style: dashed;
  border-style: dashed;
}
.border-emerald-500 {
  border-color: var(--color-emerald-500);
}
.border-gray-400 {
  border-color: var(--color-gray-400);
}
.border-slate-200 {
  border-color: var(--color-slate-200);
}
.border-solid {
  --tw-border-style: solid;
  border-style: solid;
}
.border-t-_b3rpx_B {
  border-top-width: 3rpx;
}
.border-t-_b4px_B {
  border-top-width: 4rpx;
}
.border-transparent {
  border-color: transparent;
}
.border-zinc-900_f10 {
  border-color: rgba(24, 24, 27, 0.1);
}
._ebg-green-500 {
  background-color: var(--color-green-500) !important;
}
.bg-_p--my-color_P {
  background-color: var(--my-color);
}
.bg-_b_h0000ff_B {
  background-color: #0000ff;
}
.bg-_b_h16a34a_B {
  background-color: #16a34a;
}
.bg-_b_h89ab8d_B {
  background-color: #89ab8d;
}
.bg-_b_h2563eb_B {
  background-color: #2563eb;
}
.bg-_b_h3482f2_B {
  background-color: #3482f2;
}
.bg-_b_h4268EA_B {
  background-color: #4268ea;
}
.bg-_b_h123324_B {
  background-color: #123324;
}
/* tokens: bg-[#123456] <= src/pages/index/index.vue */
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-_b_h123498_B {
  background-color: #123498;
}
.bg-_b_h410000_B {
  background-color: #410000;
}
.bg-_b_h434332_B {
  background-color: #434332;
}
.bg-_b_h434354_B {
  background-color: #434354;
}
/* tokens: bg-[#534312] <= src/pages/index/index.vue */
.bg-_b_h534312_B {
  background-color: #534312;
}
.bg-_b_h654874_B {
  background-color: #654874;
}
.bg-_b_h666600_B {
  background-color: #666600;
}
.bg-_b_h955443_B {
  background-color: #955443;
}
.bg-_b_h987654_B {
  background-color: #987654;
}
.bg-_b_h999999_B {
  background-color: #999999;
}
.bg-_b_hB91C1C_B {
  background-color: #b91c1c;
}
.bg-_b_hc65ece_B {
  background-color: #c65ece;
}
.bg-_b_hd72929_B {
  background-color: #d72929;
}
.bg-_b_hdc2626_B {
  background-color: #dc2626;
}
.bg-_b_he6e6e6_B {
  background-color: #e6e6e6;
}
.bg-_b_he24826_B {
  background-color: #e24826;
}
.bg-_b_hfff_B {
  background-color: #fff;
}
.bg-_bcolor_cvar_p--mystery-var_P_B {
  background-color: var(--mystery-var);
}
.bg-_brgb_p255_m210_m55_P_B {
  background-color: rgb(255, 210, 55);
}
.bg-_byellow_B {
  background-color: yellow;
}
.bg-amber-300 {
  background-color: var(--color-amber-300);
}
.bg-amber-500 {
  background-color: var(--color-amber-500);
}
.bg-amber-600 {
  background-color: var(--color-amber-600);
}
.bg-amber-700 {
  background-color: var(--color-amber-700);
}
.bg-amber-800 {
  background-color: var(--color-amber-800);
}
.bg-black {
  background-color: var(--color-black);
}
.bg-blue-300 {
  background-color: var(--color-blue-300);
}
.bg-blue-400 {
  background-color: var(--color-blue-400);
}
.bg-blue-500 {
  background-color: var(--color-blue-500);
}
.bg-blue-500_f50 {
  background-color: rgba(59, 130, 246, 0.5);
}
.bg-blue-600 {
  background-color: var(--color-blue-600);
}
.bg-cyan-500 {
  background-color: var(--color-cyan-500);
}
.bg-emerald-100 {
  background-color: var(--color-emerald-100);
}
.bg-emerald-500 {
  background-color: var(--color-emerald-500);
}
.bg-gray-100 {
  background-color: var(--color-gray-100);
}
.bg-gray-300 {
  background-color: var(--color-gray-300);
}
.bg-green-300 {
  background-color: var(--color-green-300);
}
.bg-green-500 {
  background-color: var(--color-green-500);
}
/* tokens: bg-independent-subpackage-marker <= src/sub-independent/pages/index.vue */
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.bg-pink-300 {
  background-color: var(--color-pink-300);
}
.bg-pink-500 {
  background-color: var(--color-pink-500);
}
.bg-purple-300 {
  background-color: var(--color-purple-300);
}
/* tokens: bg-purple-800 <= src/pages/index/index.vue */
.bg-purple-800 {
  background-color: var(--color-purple-800);
}
.bg-red-400 {
  background-color: var(--color-red-400);
}
.bg-red-500 {
  background-color: var(--color-red-500);
}
.bg-red-500_f50 {
  background-color: rgba(239, 68, 68, 0.5);
}
.bg-sky-500 {
  background-color: var(--color-sky-500);
}
.bg-sky-500_f80 {
  background-color: rgba(14, 165, 233, 0.8);
}
.bg-slate-50 {
  background-color: var(--color-slate-50);
}
.bg-transparent {
  background-color: transparent;
}
.bg-white {
  background-color: var(--color-white);
}
.bg-zinc-50 {
  background-color: var(--color-zinc-50);
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
/* tokens: bg-gradient-to-r <= src/pages/index/index.vue */
.bg-gradient-to-r {
  --tw-gradient-position: to right in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-t {
  --tw-gradient-position: to top;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-tr {
  --tw-gradient-position: to top right;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-_blinear-gradient_p135deg_m_hf8fafc_0_v_m_hdbeafe_100_v_P_B {
  background-image: linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%);
}
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
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
.to-_b_h4bcefd_B {
  --tw-gradient-to: #4bcefd;
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
._bmask-type_calpha_B {
  mask-type: alpha;
}
._bmask-type_cluminance_B {
  mask-type: luminance;
}
._ep-_b18_d5px_B {
  padding: 18.5rpx !important;
}
._bpadding_c20rpx_B {
  padding: 20rpx;
}
.p-0_d5 {
  padding: calc(var(--spacing) * 0.5);
}
.p-1 {
  padding: calc(var(--spacing) * 1);
}
.p-2 {
  padding: calc(var(--spacing) * 2);
}
.p-3 {
  padding: calc(var(--spacing) * 3);
}
.p-3_e {
  padding: calc(var(--spacing) * 3) !important;
}
.p-4 {
  padding: calc(var(--spacing) * 4);
}
.p-4_e {
  padding: calc(var(--spacing) * 4) !important;
}
.p-5 {
  padding: calc(var(--spacing) * 5);
}
.p-6 {
  padding: calc(var(--spacing) * 6);
}
.p-8 {
  padding: calc(var(--spacing) * 8);
}
.p-_b5rpx_B {
  padding: 5rpx;
}
.p-_b12rpx_B {
  padding: 12rpx;
}
.p-_b16rpx_B {
  padding: 16rpx;
}
.p-_b20px_B {
  padding: 20rpx;
}
.p-_b24rpx_B {
  padding: 24rpx;
}
.px-2 {
  padding-left: calc(var(--spacing) * 2);
  padding-right: calc(var(--spacing) * 2);
}
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.px-5 {
  padding-left: calc(var(--spacing) * 5);
  padding-right: calc(var(--spacing) * 5);
}
.px-6 {
  padding-left: calc(var(--spacing) * 6);
  padding-right: calc(var(--spacing) * 6);
}
.px-_b13_d5px_B {
  padding-left: 13.5rpx;
  padding-right: 13.5rpx;
}
.px-_b16rpx_B {
  padding-left: 16rpx;
  padding-right: 16rpx;
}
.px-_b20rpx_B {
  padding-left: 20rpx;
  padding-right: 20rpx;
}
/* tokens: px-[32px] <= src/pages/index/index.vue */
.px-_b32px_B {
  padding-left: 32rpx;
  padding-right: 32rpx;
}
.px-_b35px_B {
  padding-left: 35rpx;
  padding-right: 35rpx;
}
.px-_b95px_B {
  padding-left: 95rpx;
  padding-right: 95rpx;
}
.py-1 {
  padding-top: calc(var(--spacing) * 1);
  padding-bottom: calc(var(--spacing) * 1);
}
.py-1_d5 {
  padding-top: calc(var(--spacing) * 1.5);
  padding-bottom: calc(var(--spacing) * 1.5);
}
.py-2 {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.py-3 {
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
.py-6 {
  padding-top: calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 6);
}
.py-_b6rpx_B {
  padding-top: 6rpx;
  padding-bottom: 6rpx;
}
.py-_b8rpx_B {
  padding-top: 8rpx;
  padding-bottom: 8rpx;
}
.py-_b10rpx_B {
  padding-top: 10rpx;
  padding-bottom: 10rpx;
}
.py-_b12rpx_B {
  padding-top: 12rpx;
  padding-bottom: 12rpx;
}
/* tokens: py-[18px] <= src/pages/index/index.vue */
.py-_b18px_B {
  padding-top: 18rpx;
  padding-bottom: 18rpx;
}
.py-_b62px_B {
  padding-top: 62rpx;
  padding-bottom: 62rpx;
}
.text-center {
  text-align: center;
}
.indent-_b11rpx_B {
  text-indent: 11rpx;
}
.text-2xl {
  font-size: var(--text-2xl);
  line-height: var(--tw-leading, var(--text-2xl--line-height));
}
.text-_b13_d5px_B {
  font-size: 13.5rpx;
}
.text-_b16px_B {
  font-size: 16rpx;
}
.text-_b17rpx_B {
  font-size: 17rpx;
}
.text-_b20px_B {
  font-size: 20rpx;
}
.text-_b22px_B {
  font-size: 22rpx;
}
.text-_b24rpx_B {
  font-size: 24rpx;
}
.text-_b28rpx_B {
  font-size: 28rpx;
}
.text-_b28rpx_B_f7 {
  font-size: 28rpx;
  line-height: calc(var(--spacing) * 7);
}
.text-_b30px_B {
  font-size: 30rpx;
}
.text-_b30rpx_B {
  font-size: 30rpx;
}
.text-_b32px_B {
  font-size: 32rpx;
}
.text-_b32rpx_B {
  font-size: 32rpx;
}
.text-_b34px_B {
  font-size: 34rpx;
}
.text-_b44px_B {
  font-size: 44rpx;
}
.text-_b45rpx_B {
  font-size: 45rpx;
}
.text-_b50px_B {
  font-size: 50rpx;
}
.text-_b55rpx_B {
  font-size: 55rpx;
}
.text-_b56_d5rpx_B {
  font-size: 56.5rpx;
}
.text-_b66rpx_B {
  font-size: 66rpx;
}
.text-_b77rpx_B {
  font-size: 77rpx;
}
.text-base {
  font-size: var(--text-base);
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-lg {
  font-size: var(--text-lg);
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-lg_f7 {
  font-size: var(--text-lg);
  line-height: calc(var(--spacing) * 7);
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
/* tokens: text-[100rpx] <= src/pages/index/index.vue */
.text-_b100rpx_B {
  font-size: 100rpx;
}
.text-_b102_d43rpx_B {
  font-size: 102.43rpx;
}
.text-_blength_ccalc_p2_x9_d43px_P_B {
  font-size: 18.86rpx;
}
.text-_blength_cvar_p--my-var-length_P_B {
  font-size: var(--my-var-length);
}
.leading-6 {
  --tw-leading: calc(var(--spacing) * 6);
  line-height: calc(var(--spacing) * 6);
}
.leading-_b0_d9_B {
  --tw-leading: 0.9;
  line-height: 0.9;
}
.leading-_b23rpx_B {
  --tw-leading: 23rpx;
  line-height: 23rpx;
}
._efont-bold {
  --tw-font-weight: var(--font-weight-bold) !important;
  font-weight: var(--font-weight-bold) !important;
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
.tracking-wide {
  --tw-tracking: var(--tracking-wide);
  letter-spacing: var(--tracking-wide);
}
._etext-_b_h990000_B {
  color: #990000 !important;
}
.text-_b_h0000ff_B {
  color: #0000ff;
}
.text-_b_h00f285_B {
  color: #00f285;
}
.text-_b_h0b138f_B {
  color: #0b138f;
}
.text-_b_h123456_B {
  color: #123456;
}
.text-_b_h16a34a_B {
  color: #16a34a;
}
.text-_b_h1f2937_B {
  color: #1f2937;
}
.text-_b_h2563eb_B {
  color: #2563eb;
}
.text-_b_h3d31a4_B {
  color: #3d31a4;
}
.text-_b_h438821_B {
  color: #438821;
}
.text-_b_h654321_B {
  color: #654321;
}
.text-_b_h888800_B {
  color: #888800;
}
.text-_b_h929292_B {
  color: #929292;
}
.text-_b_hab1932_B {
  color: #ab1932;
}
.text-_b_habcdef_B {
  color: #abcdef;
}
.text-_b_hbada55_B {
  color: #bada55;
}
.text-_b_hc31d6b_B {
  color: #c31d6b;
}
.text-_b_hdddddd_B {
  color: #dddddd;
}
.text-_b_hececec_B {
  color: #ececec;
}
.text-_b_hfafafa_B {
  color: #fafafa;
}
/* tokens: text-[#fff] <= src/pages/index/index.vue */
.text-_b_hfff_B {
  color: #fff;
}
/* tokens: text-[#ffffff] <= src/pages/index/index.vue */
.text-_b_hffffff_B {
  color: #ffffff;
}
.text-_bcolor_cvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bred_B {
  color: red;
}
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bvar_p--text_r_sec_r_light_P_B {
  color: var(--text_sec_light);
}
.text-_bvar_p--text_sec_light_P_B {
  color: var(--text_sec_light);
}
.text-black {
  color: var(--color-black);
}
.text-emerald-600 {
  color: var(--color-emerald-600);
}
.text-gray-800 {
  color: var(--color-gray-800);
}
/* tokens: text-pink-200 <= src/pages/index/index.vue */
.text-pink-200 {
  color: var(--color-pink-200);
}
.text-red-400 {
  color: var(--color-red-400);
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
.text-zinc-600 {
  color: var(--color-zinc-600);
}
.text-zinc-900 {
  color: var(--color-zinc-900);
}
.capitalize {
  text-transform: capitalize;
}
.uppercase {
  text-transform: uppercase;
}
.underline {
  text-decoration-line: underline;
}
.underline-offset-_b3rpx_B {
  text-underline-offset: 3rpx;
}
.opacity-50 {
  opacity: 0.5;
}
.opacity-_b0_d82_B {
  opacity: 0.82;
}
.shadow {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0_2_d5px_7_d5px_rgba_p18_m52_m86_m0_d35_P_B {
  --tw-shadow: 0 2.5rpx 7.5rpx var(--tw-shadow-color, rgba(18, 52, 86, 0.35));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0_8rpx_24rpx_rgba_p0_m0_m0_m0_d12_P_B {
  --tw-shadow: 0 8rpx 24rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.12));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0rpx 2rpx 11rpx 0rpx var(--tw-shadow-color, #00000a);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0rpx 2rpx 11rpx 0rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-md {
  --tw-shadow: 0 4rpx 6rpx -1rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 2rpx 4rpx -2rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-sm {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring-4 {
  --tw-ring-shadow: var(--tw-ring-inset, ) 0 0 0 calc(4rpx + var(--tw-ring-offset-width)) var(--tw-ring-color, var(--color-blue-500, #3b82f6));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-amber-100 {
  --tw-shadow-color: #fef3c7;
}
.shadow-blue-100 {
  --tw-shadow-color: #dbeafe;
}
.shadow-cyan-100 {
  --tw-shadow-color: #cffafe;
}
.shadow-green-100 {
  --tw-shadow-color: #dcfce7;
}
.shadow-indigo-100 {
  --tw-shadow-color: #e0e7ff;
}
.ring-_b10rpx_B {
  --tw-ring-offset-width: 10rpx;
}
.ring-pink-300 {
  --tw-ring-color: var(--color-pink-300);
}
.ring-offset-_b3rpx_B {
  --tw-ring-offset-color: 3rpx;
}
.outline {
  outline-style: var(--tw-outline-style);
  outline-width: 1px;
}
.outline-offset-_b3rpx_B {
  outline-offset: 3rpx;
}
.outline-_b5rpx_B {
  outline-width: 5rpx;
}
.blur {
  --tw-blur: blur(8px);
  filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, )
    var(--tw-drop-shadow, );
}
.blur-_b2rpx_B {
  --tw-blur: blur(2rpx);
  filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, )
    var(--tw-drop-shadow, );
}
.filter {
  filter: var(--tw-blur, ) var(--tw-brightness, ) var(--tw-contrast, ) var(--tw-grayscale, ) var(--tw-hue-rotate, ) var(--tw-invert, ) var(--tw-saturate, ) var(--tw-sepia, )
    var(--tw-drop-shadow, );
}
.backdrop-blur-_b2rpx_B {
  --tw-backdrop-blur: blur(2rpx);
  backdrop-filter: var(--tw-backdrop-blur, ) var(--tw-backdrop-brightness, ) var(--tw-backdrop-contrast, ) var(--tw-backdrop-grayscale, ) var(--tw-backdrop-hue-rotate, )
    var(--tw-backdrop-invert, ) var(--tw-backdrop-opacity, ) var(--tw-backdrop-saturate, ) var(--tw-backdrop-sepia, );
}
.transition {
  transition-property:
    color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow,
    transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
}
.transition-colors {
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
}
.duration-300 {
  --tw-duration: 300ms;
  transition-duration: 300ms;
}
._b--scroll-offset_c56px_B {
  --scroll-offset: 56rpx;
}
.divide-x-reverse > view + view,
.divide-x-reverse > view + text,
.divide-x-reverse > text + view,
.divide-x-reverse > text + text {
  --tw-divide-x-reverse: 1;
}
.group.published view.group-_b_dpublished_B_ctext-green-500,
.group.published text.group-_b_dpublished_B_ctext-green-500 {
  color: var(--color-green-500);
}
.peer.tapped ~ view.peer-_b_dtapped_B_cbg-red-400,
.peer.tapped ~ text.peer-_b_dtapped_B_cbg-red-400 {
  background-color: var(--color-red-400);
}
.before_cabsolute::before {
  content: var(--tw-content);
  position: absolute;
}
.before_cinset-0::before {
  content: var(--tw-content);
  top: calc(var(--spacing) * 0);
  right: calc(var(--spacing) * 0);
  bottom: calc(var(--spacing) * 0);
  left: calc(var(--spacing) * 0);
}
.before_cmr-1::before {
  content: var(--tw-content);
  margin-right: calc(var(--spacing) * 1);
}
.before_crounded-_b20rpx_B::before {
  content: var(--tw-content);
  border-radius: 20rpx;
}
.before_cborder-2::before {
  content: var(--tw-content);
  border-style: var(--tw-border-style);
  border-width: 2rpx;
}
.before_cborder-_b_h4bd650_B::before {
  content: var(--tw-content);
  border-color: #4bd650;
}
.before_ccontent-_b_a_x_a_B::before {
  --tw-content: '*';
  content: var(--tw-content);
}
.before_ccontent-_b_a222_a_B::before {
  --tw-content: '222';
  content: var(--tw-content);
}
.before_ccontent-_b_a11111_a_B::before {
  --tw-content: '11111';
  content: var(--tw-content);
}
.before_ccontent-_b_aFestivus_a_B::before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-webpack-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-webpack-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: before:content-['independent_subpackage_taro-webpack-vue3-tailwindcss-v4'] <= src/sub-independent/pages/index.vue */
.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage uni-app-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_amoduleA_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 独立分包';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-webpack-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-webpack-vue3-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-vue3-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_taro-webpack-vue3-tailwindcss-v4'] <= src/sub-normal/pages/index.vue */
.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage uni-app-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
.before_ccontent-_b_av3_a_B::before {
  --tw-content: 'v3';
  content: var(--tw-content);
}
.before_ccontent-_b_av4_a_B::before {
  --tw-content: 'v4';
  content: var(--tw-content);
}
.after_cborder-none::after {
  content: var(--tw-content);
  --tw-border-style: none;
  border-style: none;
}
.after_ccontent-_b_av3_apply_a_B::after {
  --tw-content: 'v3 apply';
  content: var(--tw-content);
}
.after_ccontent-_b_au_x6211_u_x662f_className_a_B::after {
  --tw-content: '我是className';
  content: var(--tw-content);
}
.after_ccontent-_b_au_x6211_u_x6765_u_x81ea_utils_dfilter_djs_a_B::after {
  --tw-content: '我来自utils.filter.js';
  content: var(--tw-content);
}
.after_ccontent-_b_r_au_x6211_u_x6765_u_x81ea_inline-wxs_r_a_B::after {
  --tw-content: \'我来自inline-wxs\';
  content: var(--tw-content);
}
.odd_cmb-2:nth-child(odd) {
  margin-bottom: calc(var(--spacing) * 2);
}
.focus_cring:focus {
  --tw-ring-shadow: var(--tw-ring-inset, ) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.focus_cring-blue-300:focus {
  --tw-ring-color: var(--color-blue-300);
}
.focus_coutline-none:focus {
  --tw-outline-style: none;
  outline-style: none;
}
.active_cbg-emerald-50:active {
  background-color: var(--color-emerald-50);
}
.active_cbg-emerald-600:active {
  background-color: var(--color-emerald-600);
}
.active_cbg-green-300:active {
  background-color: var(--color-green-300);
}
@media (min-width: 48rem) {
  .md_cgrid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (min-width: 64rem) {
  .lg_c_b--scroll-offset_c44px_B {
    --scroll-offset: 44rpx;
  }
}
@media (min-width: 96rem) {
  ._2xl_ctext-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
}
@media (min-width: 96rem) {
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-_b_h123456_B {
    background-color: #123456;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: var(--color-green-500);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-800 {
    background-color: var(--color-zinc-800);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-900 {
    background-color: var(--color-zinc-900);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-_b_hec4f4f_B {
    color: #ec4f4f;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-yellow-400 {
    color: var(--color-yellow-400);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-zinc-50 {
    color: var(--color-zinc-50);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-zinc-300 {
    color: var(--color-zinc-300);
  }
}
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  color: var(--color-red-400) !important;
}
._b_n_view_B_cp-_b12rpx_B view {
  padding: 12rpx;
}
.focus_c_b_n_view_B_cp-4:focus view {
  padding: calc(var(--spacing) * 4);
}
._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3) {
  padding-top: calc(var(--spacing) * 0);
  padding-bottom: calc(var(--spacing) * 0);
}
._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3) {
  padding-top: calc(var(--spacing) * 4);
  padding-bottom: calc(var(--spacing) * 4);
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
}
.tw-page-style-watch-anchor {
  color: inherit;
}
```
