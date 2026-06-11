# uni-app-vite-tailwindcss-v3 CSS Output

Fixture: demo
Entry: uni-app-vite-tailwindcss-v3/dist/build/mp-weixin/app.wxss
Generator CSS files: app.wxss, a.wxss, b.wxss, index.wxss, index.wxss, index.wxss, index.wxss, index.wxss, peer.wxss, typography.wxss, u-button.wxss, u-loading-icon.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 197096 | 2822 | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
::before,
::after {
  --tw-content: '';
}
view,
text,
::after,
::before {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:;
  --tw-pan-y:;
  --tw-pinch-zoom:;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:;
  --tw-gradient-via-position:;
  --tw-gradient-to-position:;
  --tw-ordinal:;
  --tw-slashed-zero:;
  --tw-numeric-figure:;
  --tw-numeric-spacing:;
  --tw-numeric-fraction:;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-colored: 0 0 rgba(0, 0, 0, 0);
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
  --tw-contain-size:;
  --tw-contain-layout:;
  --tw-contain-paint:;
  --tw-contain-style:;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --up-main-color: #f5f5f5;
  --up-content-color: #d1d5db;
  --up-tips-color: #9ca3af;
  --up-light-color: #6b7280;
  --up-border-color: #3a3a3c;
  --up-bg-color: #1f1f1f;
  --up-hover-bg-color: #343741;
  --up-page-bg-color: #1f1f1f;
  --up-card-bg-color: #1c1c1e;
  --up-navbar-bg-color: #1c1c1e;
  --up-disabled-color: #4b5563;
  --up-primary: #3c9cff;
  --up-primary-dark: #5aa8ff;
  --up-primary-disabled: #4c6f92;
  --up-primary-light: #10243a;
  --up-warning: #f9ae3d;
  --up-warning-dark: #ffbf66;
  --up-warning-disabled: #8a6a3a;
  --up-warning-light: #3d2f1b;
  --up-success: #5ac725;
  --up-success-dark: #7ad94b;
  --up-success-disabled: #5f7f4f;
  --up-success-light: #1f3316;
  --up-error: #f56c6c;
  --up-error-dark: #ff8a8a;
  --up-error-disabled: #8d5858;
  --up-error-light: #3a2222;
  --up-info: #909399;
  --up-info-dark: #b0b3b8;
  --up-info-disabled: #5f6368;
  --up-info-light: #2f3238;
  --up-table2-header-bg-color: #2a2d33;
  --up-table2-zebra-bg-color: #23262b;
  --up-table2-highlight-bg-color: #2f3440;
  --up-gap-bg-color: #111111;
  --up-skeleton-bg-color: #2f3135;
  --up-skeleton-shimmer-color: rgba(255, 255, 255, 0.12);
  --up-swipe-action-button-bg-color: #4b5563;
  --up-index-list-indicator-bg-color: #4b5563;
  --up-calendar-month-mark-color: rgba(255, 255, 255, 0.04);
  --up-light-main-color: var(--up-main-color, var(--u-main-color, #303133));
  --u-light-main-color: var(--up-main-color, var(--u-main-color, #303133));
  --up-light-content-color: var(--up-content-color, var(--u-content-color, #606266));
  --u-light-content-color: var(--up-content-color, var(--u-content-color, #606266));
  --up-light-tips-color: var(--up-tips-color, var(--u-tips-color, #909193));
  --u-light-tips-color: var(--up-tips-color, var(--u-tips-color, #909193));
  --up-light-light-color: var(--up-light-color, var(--u-light-color, #c0c4cc));
  --u-light-light-color: var(--up-light-color, var(--u-light-color, #c0c4cc));
  --up-light-border-color: var(--up-border-color, var(--u-border-color, #dadbde));
  --u-light-border-color: var(--up-border-color, var(--u-border-color, #dadbde));
  --up-light-bg-color: var(--up-bg-color, var(--u-bg-color, #f3f4f6));
  --u-light-bg-color: var(--up-bg-color, var(--u-bg-color, #f3f4f6));
  --up-light-disabled-color: var(--up-disabled-color, var(--u-disabled-color, #c8c9cc));
  --u-light-disabled-color: var(--up-disabled-color, var(--u-disabled-color, #c8c9cc));
  --up-light-primary: var(--up-primary, var(--u-primary, #3c9cff));
  --u-light-primary: var(--up-primary, var(--u-primary, #3c9cff));
  --up-light-primary-dark: var(--up-primary-dark, var(--u-primary-dark, #398ade));
  --u-light-primary-dark: var(--up-primary-dark, var(--u-primary-dark, #398ade));
  --up-light-primary-disabled: var(--up-primary-disabled, var(--u-primary-disabled, #9acafc));
  --u-light-primary-disabled: var(--up-primary-disabled, var(--u-primary-disabled, #9acafc));
  --up-light-primary-light: var(--up-primary-light, var(--u-primary-light, #ecf5ff));
  --u-light-primary-light: var(--up-primary-light, var(--u-primary-light, #ecf5ff));
  --up-light-warning: var(--up-warning, var(--u-warning, #f9ae3d));
  --u-light-warning: var(--up-warning, var(--u-warning, #f9ae3d));
  --up-light-warning-dark: var(--up-warning-dark, var(--u-warning-dark, #f1a532));
  --u-light-warning-dark: var(--up-warning-dark, var(--u-warning-dark, #f1a532));
  --up-light-warning-disabled: var(--up-warning-disabled, var(--u-warning-disabled, #f9d39b));
  --u-light-warning-disabled: var(--up-warning-disabled, var(--u-warning-disabled, #f9d39b));
  --up-light-warning-light: var(--up-warning-light, var(--u-warning-light, #fdf6ec));
  --u-light-warning-light: var(--up-warning-light, var(--u-warning-light, #fdf6ec));
  --up-light-success: var(--up-success, var(--u-success, #5ac725));
  --u-light-success: var(--up-success, var(--u-success, #5ac725));
  --up-light-success-dark: var(--up-success-dark, var(--u-success-dark, #53c21d));
  --u-light-success-dark: var(--up-success-dark, var(--u-success-dark, #53c21d));
  --up-light-success-disabled: var(--up-success-disabled, var(--u-success-disabled, #a9e08f));
  --u-light-success-disabled: var(--up-success-disabled, var(--u-success-disabled, #a9e08f));
  --up-light-success-light: var(--up-success-light, var(--u-success-light, #f5fff0));
  --u-light-success-light: var(--up-success-light, var(--u-success-light, #f5fff0));
  --up-light-error: var(--up-error, var(--u-error, #f56c6c));
  --u-light-error: var(--up-error, var(--u-error, #f56c6c));
  --up-light-error-dark: var(--up-error-dark, var(--u-error-dark, #e45656));
  --u-light-error-dark: var(--up-error-dark, var(--u-error-dark, #e45656));
  --up-light-error-disabled: var(--up-error-disabled, var(--u-error-disabled, #f7b2b2));
  --u-light-error-disabled: var(--up-error-disabled, var(--u-error-disabled, #f7b2b2));
  --up-light-error-light: var(--up-error-light, var(--u-error-light, #fef0f0));
  --u-light-error-light: var(--up-error-light, var(--u-error-light, #fef0f0));
  --up-light-info: var(--up-info, var(--u-info, #909399));
  --u-light-info: var(--up-info, var(--u-info, #909399));
  --up-light-info-dark: var(--up-info-dark, var(--u-info-dark, #767a82));
  --u-light-info-dark: var(--up-info-dark, var(--u-info-dark, #767a82));
  --up-light-info-disabled: var(--up-info-disabled, var(--u-info-disabled, #c4c6c9));
  --u-light-info-disabled: var(--up-info-disabled, var(--u-info-disabled, #c4c6c9));
  --up-light-info-light: var(--up-info-light, var(--u-info-light, #f4f4f5));
  --u-light-info-light: var(--up-info-light, var(--u-info-light, #f4f4f5));
  --status-bar-height: 25rpx;
  --top-window-height: 0rpx;
  --window-top: 0rpx;
  --window-bottom: 0rpx;
  --window-left: 0rpx;
  --window-right: 0rpx;
  --window-magin: 0rpx;
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
.visible {
  visibility: visible;
}
.raw-btn {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 40rpx;
  font-weight: 600;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.raw-btn::after {
  content: var(--tw-content);
  border-style: none;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 40rpx;
  font-weight: 600;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.btn::after {
  content: var(--tw-content);
  border-style: none;
}
.btn {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
  --tw-gradient-from: #9e58e9 var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(158, 88, 233, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
  --tw-gradient-to: #3b82f6 var(--tw-gradient-to-position);
  padding-left: 16rpx;
  padding-right: 16rpx;
  padding-top: 8rpx;
  padding-bottom: 8rpx;
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
}
.relative {
  position: relative;
}
.-m-_b20px_B {
  margin: -20rpx;
}
.m-_b5rpx_B {
  margin: 5rpx;
}
.-mt-2 {
  margin-top: -16rpx;
}
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
.mt-_b26_d2px_B {
  margin-top: 26.2rpx;
}
.mt-_b96_d3px_B {
  margin-top: 96.3rpx;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.block {
  display: block;
}
.inline-block {
  display: inline-block;
}
.inline {
  display: inline;
}
.flex {
  display: flex;
}
.inline-flex {
  display: inline-flex;
}
.table {
  display: table;
}
.grid {
  display: grid;
}
._ehidden {
  display: none !important;
}
.h-10 {
  height: 80rpx;
}
.h-2 {
  height: 16rpx;
}
.h-20 {
  height: 160rpx;
}
.h-24 {
  height: 192rpx;
}
.h-3 {
  height: 24rpx;
}
.h-5 {
  height: 40rpx;
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
.h-screen {
  height: 100vh;
}
.max-h-_b100px_B {
  max-height: 100rpx;
}
.min-h-_b100px_B {
  min-height: 100rpx;
}
.w-10 {
  width: 80rpx;
}
.w-16 {
  width: 128rpx;
}
.w-2 {
  width: 16rpx;
}
.w-20 {
  width: 160rpx;
}
.w-24 {
  width: 192rpx;
}
.w-32 {
  width: 256rpx;
}
.w-5 {
  width: 40rpx;
}
.w-_b100px_B {
  width: 100rpx;
}
.w-_b20px_B {
  width: 20rpx;
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
.w-_b33_d33px_B {
  width: 33.33rpx;
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
.w-screen {
  width: 100vw;
}
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
.origin-_b100rpx_111rpx_B {
  transform-origin: 100rpx 111rpx;
}
.translate-y-_b17rpx_B {
  --tw-translate-y: 17rpx;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
    scaleY(var(--tw-scale-y));
}
.rotate-_b10deg_B {
  --tw-rotate: 10deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
    scaleY(var(--tw-scale-y));
}
.cursor-not-allowed {
  cursor: not-allowed;
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
.gap-2 {
  gap: 16rpx;
}
.space-x-2_d5 > view + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: calc(20rpx * var(--tw-space-x-reverse));
  margin-left: calc(20rpx * (1 - var(--tw-space-x-reverse)));
}
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(32rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(32rpx * var(--tw-space-y-reverse));
}
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
}
.space-y-_b11rpx_B > view + view,
.space-y-_b11rpx_B > view + text,
.space-y-_b11rpx_B > text + view,
.space-y-_b11rpx_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(11rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(11rpx * var(--tw-space-y-reverse));
}
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-x-_b3px_B > view + view,
.divide-x-_b3px_B > view + text,
.divide-x-_b3px_B > text + view,
.divide-x-_b3px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(3rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(3rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  border-style: solid;
}
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(1, 1, 1, var(--tw-divide-opacity, 1));
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
.rounded-_b40px_B {
  border-radius: 40rpx;
}
.rounded-md {
  border-radius: 12rpx;
}
._eborder-primary {
  --tw-border-opacity: 1 !important;
  border-color: rgba(69, 163, 250, var(--tw-border-opacity, 1)) !important;
}
.border {
  border-width: 1rpx;
}
.border-4 {
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
  --tw-border-opacity: 1;
  border-color: rgba(9, 135, 101, var(--tw-border-opacity, 1));
}
.border-_bred_B {
  --tw-border-opacity: 1;
  border-color: rgba(255, 0, 0, var(--tw-border-opacity, 1));
}
.border-b-_b4rpx_B {
  border-bottom-width: 4rpx;
}
.border-gray-400 {
  --tw-border-opacity: 1;
  border-color: rgba(156, 163, 175, var(--tw-border-opacity, 1));
}
.border-none {
  border-style: none;
}
.border-opacity-_b0_d44_B {
  --tw-border-opacity: 0.44;
}
.border-solid {
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
._ebg-green-500 {
  --tw-bg-opacity: 1 !important;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1)) !important;
}
.bg-_b_h123324_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 51, 36, var(--tw-bg-opacity, 1));
}
.bg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
.bg-_b_h3482f2_B {
  --tw-bg-opacity: 1;
  background-color: rgba(52, 130, 242, var(--tw-bg-opacity, 1));
}
.bg-_b_h410000_B {
  --tw-bg-opacity: 1;
  background-color: rgba(65, 0, 0, var(--tw-bg-opacity, 1));
}
.bg-_b_h4268EA_B {
  --tw-bg-opacity: 1;
  background-color: rgba(66, 104, 234, var(--tw-bg-opacity, 1));
}
.bg-_b_h434332_B {
  --tw-bg-opacity: 1;
  background-color: rgba(67, 67, 50, var(--tw-bg-opacity, 1));
}
.bg-_b_h434354_B {
  --tw-bg-opacity: 1;
  background-color: rgba(67, 67, 84, var(--tw-bg-opacity, 1));
}
.bg-_b_h654874_B {
  --tw-bg-opacity: 1;
  background-color: rgba(101, 72, 116, var(--tw-bg-opacity, 1));
}
.bg-_b_h666600_B {
  --tw-bg-opacity: 1;
  background-color: rgba(102, 102, 0, var(--tw-bg-opacity, 1));
}
.bg-_b_h955443_B {
  --tw-bg-opacity: 1;
  background-color: rgba(149, 84, 67, var(--tw-bg-opacity, 1));
}
.bg-_b_h987654_B {
  --tw-bg-opacity: 1;
  background-color: rgba(152, 118, 84, var(--tw-bg-opacity, 1));
}
.bg-_b_h999999_B {
  --tw-bg-opacity: 1;
  background-color: rgba(153, 153, 153, var(--tw-bg-opacity, 1));
}
.bg-_b_hB91C1C_B {
  --tw-bg-opacity: 1;
  background-color: rgba(185, 28, 28, var(--tw-bg-opacity, 1));
}
.bg-_b_hc65ece_B {
  --tw-bg-opacity: 1;
  background-color: rgba(198, 94, 206, var(--tw-bg-opacity, 1));
}
.bg-_b_he6e6e6_B {
  --tw-bg-opacity: 1;
  background-color: rgba(230, 230, 230, var(--tw-bg-opacity, 1));
}
.bg-_byellow_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 0, var(--tw-bg-opacity, 1));
}
.bg-amber-300 {
  --tw-bg-opacity: 1;
  background-color: rgba(252, 211, 77, var(--tw-bg-opacity, 1));
}
.bg-amber-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(245, 158, 11, var(--tw-bg-opacity, 1));
}
.bg-amber-600 {
  --tw-bg-opacity: 1;
  background-color: rgba(217, 119, 6, var(--tw-bg-opacity, 1));
}
.bg-amber-700 {
  --tw-bg-opacity: 1;
  background-color: rgba(180, 83, 9, var(--tw-bg-opacity, 1));
}
.bg-amber-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(146, 64, 14, var(--tw-bg-opacity, 1));
}
.bg-blue-300 {
  --tw-bg-opacity: 1;
  background-color: rgba(147, 197, 253, var(--tw-bg-opacity, 1));
}
.bg-blue-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(96, 165, 250, var(--tw-bg-opacity, 1));
}
.bg-blue-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(59, 130, 246, var(--tw-bg-opacity, 1));
}
.bg-blue-500_f50 {
  background-color: rgba(59, 130, 246, 0.5);
}
.bg-cyan-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(6, 182, 212, var(--tw-bg-opacity, 1));
}
.bg-gray-100 {
  --tw-bg-opacity: 1;
  background-color: rgba(243, 244, 246, var(--tw-bg-opacity, 1));
}
.bg-gray-300 {
  --tw-bg-opacity: 1;
  background-color: rgba(209, 213, 219, var(--tw-bg-opacity, 1));
}
.bg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1));
}
.bg-pink-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(236, 72, 153, var(--tw-bg-opacity, 1));
}
.bg-red-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(248, 113, 113, var(--tw-bg-opacity, 1));
}
.bg-red-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(239, 68, 68, var(--tw-bg-opacity, 1));
}
.bg-red-500_f50 {
  background-color: rgba(239, 68, 68, 0.5);
}
.bg-sky-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(14, 165, 233, var(--tw-bg-opacity, 1));
}
.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity, 1));
}
.bg-opacity-_b0_d54_B {
  --tw-bg-opacity: 0.54;
}
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
}
.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}
.bg-gradient-to-t {
  background-image: linear-gradient(to top, var(--tw-gradient-stops));
}
.bg-gradient-to-tr {
  background-image: linear-gradient(to top right, var(--tw-gradient-stops));
}
.from-_b_h2f73f1_B {
  --tw-gradient-from: #2f73f1 var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(47, 115, 241, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.from-_b_h9e58e9_B {
  --tw-gradient-from: #9e58e9 var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(158, 88, 233, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.to-_b_h4bcefd_B {
  --tw-gradient-to: #4bcefd var(--tw-gradient-to-position);
}
.to-blue-500 {
  --tw-gradient-to: #3b82f6 var(--tw-gradient-to-position);
}
.p-3 {
  padding: 24rpx;
}
.p-4 {
  padding: 32rpx;
}
.p-_b20px_B {
  padding: 20rpx;
}
.p-_b5rpx_B {
  padding: 5rpx;
}
.px-2 {
  padding-left: 16rpx;
  padding-right: 16rpx;
}
.px-4 {
  padding-left: 32rpx;
  padding-right: 32rpx;
}
.px-_b32px_B {
  padding-left: 32rpx;
  padding-right: 32rpx;
}
.px-_b35px_B {
  padding-left: 35rpx;
  padding-right: 35rpx;
}
.py-1 {
  padding-top: 8rpx;
  padding-bottom: 8rpx;
}
.py-2 {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}
.indent-_b11rpx_B {
  text-indent: 11rpx;
}
.text-2xl {
  font-size: 48rpx;
  line-height: 64rpx;
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
.text-_b44px_B {
  font-size: 44rpx;
}
.text-_b56_d5rpx_B {
  font-size: 56.5rpx;
}
.text-_b77rpx_B {
  font-size: 77rpx;
}
.text-_blength_ccalc_p2_x9_d43px_P_B {
  font-size: calc(2 * 9.43rpx);
}
.text-_blength_cvar_p--my-var-length_P_B {
  font-size: var(--my-var-length);
}
.text-base {
  font-size: 32rpx;
  line-height: 48rpx;
}
.text-sm {
  font-size: 28rpx;
  line-height: 40rpx;
}
._efont-bold {
  font-weight: 700 !important;
}
.font-bold {
  font-weight: 700;
}
.font-semibold {
  font-weight: 600;
}
.uppercase {
  text-transform: uppercase;
}
.leading-_b0_d9_B {
  line-height: 0.9;
}
.leading-_b23rpx_B {
  line-height: 23rpx;
}
._etext-_b_h990000_B {
  --tw-text-opacity: 1 !important;
  color: rgba(153, 0, 0, var(--tw-text-opacity, 1)) !important;
}
._etext-primary {
  --tw-text-opacity: 1 !important;
  color: rgba(69, 163, 250, var(--tw-text-opacity, 1)) !important;
}
._etext-red-400 {
  --tw-text-opacity: 1 !important;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1)) !important;
}
.text-_b_h0b138f_B {
  --tw-text-opacity: 1;
  color: rgba(11, 19, 143, var(--tw-text-opacity, 1));
}
.text-_b_h123456_B {
  --tw-text-opacity: 1;
  color: rgba(18, 52, 86, var(--tw-text-opacity, 1));
}
.text-_b_hab1932_B {
  --tw-text-opacity: 1;
  color: rgba(171, 25, 50, var(--tw-text-opacity, 1));
}
.text-_b_habcdef_B {
  --tw-text-opacity: 1;
  color: rgba(171, 205, 239, var(--tw-text-opacity, 1));
}
.text-_b_hbada55_B {
  --tw-text-opacity: 1;
  color: rgba(186, 218, 85, var(--tw-text-opacity, 1));
}
.text-_b_hdddddd_B {
  --tw-text-opacity: 1;
  color: rgba(221, 221, 221, var(--tw-text-opacity, 1));
}
.text-_b_hfafafa_B {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
.text-_b_hffffff_B {
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
}
.text-_bcolor_cvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bred_B {
  --tw-text-opacity: 1;
  color: rgba(255, 0, 0, var(--tw-text-opacity, 1));
}
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bvar_p--text_r_sec_r_light_P_B {
  color: var(--text_sec_light);
}
.text-_bvar_p--text_sec_light_P_B {
  color: var(--text sec light);
}
.text-black {
  --tw-text-opacity: 1;
  color: rgba(0, 0, 0, var(--tw-text-opacity, 1));
}
.text-gray-800 {
  --tw-text-opacity: 1;
  color: rgba(31, 41, 55, var(--tw-text-opacity, 1));
}
.text-green-500 {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.text-opacity-_b0_d19_B {
  --tw-text-opacity: 0.19;
}
.text-red-400 {
  --tw-text-opacity: 1;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1));
}
.text-red-500 {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.text-white {
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
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
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0rpx 2rpx 11rpx 0rpx #00000a;
  --tw-shadow-colored: 0rpx 2rpx 11rpx 0rpx var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-ring-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0rpx 2rpx 11rpx 0rpx rgba(0, 0, 0, 0.4);
  --tw-shadow-colored: 0rpx 2rpx 11rpx 0rpx var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-ring-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-shadow);
}
.shadow-amber-100 {
  --tw-shadow-color: #fef3c7;
  --tw-shadow: var(--tw-shadow-colored);
}
.shadow-blue-100 {
  --tw-shadow-color: #dbeafe;
  --tw-shadow: var(--tw-shadow-colored);
}
.shadow-cyan-100 {
  --tw-shadow-color: #cffafe;
  --tw-shadow: var(--tw-shadow-colored);
}
.shadow-green-100 {
  --tw-shadow-color: #dcfce7;
  --tw-shadow: var(--tw-shadow-colored);
}
.shadow-indigo-100 {
  --tw-shadow-color: #e0e7ff;
  --tw-shadow: var(--tw-shadow-colored);
}
.outline-_b5rpx_B {
  outline-width: 5rpx;
}
.outline-offset-_b3rpx_B {
  outline-offset: 3rpx;
}
.ring-4 {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4rpx + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 rgba(0, 0, 0, 0));
}
.ring-_b10rpx_B {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(10rpx + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 rgba(0, 0, 0, 0));
}
.ring-pink-300 {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgba(249, 168, 212, var(--tw-ring-opacity, 1));
}
.ring-offset-_b3rpx_B {
  --tw-ring-offset-width: 3rpx;
}
.blur {
  --tw-blur: blur(8rpx);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.blur-_b2rpx_B {
  --tw-blur: blur(2rpx);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.backdrop-blur-_b2rpx_B {
  --tw-backdrop-blur: blur(2rpx);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate)
    var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}
.transition {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
page,
.tw-root,
wx-root-portal-content,
page,
body,
:host {
  --up-main-color: var(--up-light-main-color, #303133);
  --up-content-color: var(--up-light-content-color, #606266);
  --up-tips-color: var(--up-light-tips-color, #909193);
  --up-light-color: var(--up-light-light-color, #c0c4cc);
  --up-border-color: var(--up-light-border-color, #dadbde);
  --up-bg-color: var(--up-light-bg-color, #f3f4f6);
  --up-hover-bg-color: #e7ebf0;
  --up-page-bg-color: #f3f4f6;
  --up-card-bg-color: #ffffff;
  --up-navbar-bg-color: #ffffff;
  --up-disabled-color: var(--up-light-disabled-color, #c8c9cc);
  --up-primary: var(--up-light-primary, #3c9cff);
  --up-primary-dark: var(--up-light-primary-dark, #398ade);
  --up-primary-disabled: var(--up-light-primary-disabled, #9acafc);
  --up-primary-light: var(--up-light-primary-light, #ecf5ff);
  --up-warning: var(--up-light-warning, #f9ae3d);
  --up-warning-dark: var(--up-light-warning-dark, #f1a532);
  --up-warning-disabled: var(--up-light-warning-disabled, #f9d39b);
  --up-warning-light: var(--up-light-warning-light, #fdf6ec);
  --up-success: var(--up-light-success, #5ac725);
  --up-success-dark: var(--up-light-success-dark, #53c21d);
  --up-success-disabled: var(--up-light-success-disabled, #a9e08f);
  --up-success-light: var(--up-light-success-light, #f5fff0);
  --up-error: var(--up-light-error, #f56c6c);
  --up-error-dark: var(--up-light-error-dark, #e45656);
  --up-error-disabled: var(--up-light-error-disabled, #f7b2b2);
  --up-error-light: var(--up-light-error-light, #fef0f0);
  --up-info: var(--up-light-info, #909399);
  --up-info-dark: var(--up-light-info-dark, #767a82);
  --up-info-disabled: var(--up-light-info-disabled, #c4c6c9);
  --up-info-light: var(--up-light-info-light, #f4f4f5);
  --up-table2-header-bg-color: #f5f7fa;
  --up-table2-zebra-bg-color: #fafafa;
  --up-table2-highlight-bg-color: #f5f7fa;
  --up-gap-bg-color: #f3f4f6;
  --up-skeleton-bg-color: #f1f2f4;
  --up-skeleton-shimmer-color: #e6e6e6;
  --up-swipe-action-button-bg-color: #c7c6cd;
  --up-index-list-indicator-bg-color: #c9c9c9;
  --up-calendar-month-mark-color: rgba(231, 232, 234, 0.83);
}
@media (prefers-color-scheme: dark) {
  page,
  .tw-root,
  wx-root-portal-content,
  page,
  body,
  :host {
    --up-main-color: #f5f5f5;
    --up-content-color: #d1d5db;
    --up-tips-color: #9ca3af;
    --up-light-color: #6b7280;
    --up-border-color: #3a3a3c;
    --up-bg-color: #1f1f1f;
    --up-hover-bg-color: #343741;
    --up-page-bg-color: #1f1f1f;
    --up-card-bg-color: #1c1c1e;
    --up-navbar-bg-color: #1c1c1e;
    --up-disabled-color: #4b5563;
    --up-primary: #3c9cff;
    --up-primary-dark: #5aa8ff;
    --up-primary-disabled: #4c6f92;
    --up-primary-light: #10243a;
    --up-warning: #f9ae3d;
    --up-warning-dark: #ffbf66;
    --up-warning-disabled: #8a6a3a;
    --up-warning-light: #3d2f1b;
    --up-success: #5ac725;
    --up-success-dark: #7ad94b;
    --up-success-disabled: #5f7f4f;
    --up-success-light: #1f3316;
    --up-error: #f56c6c;
    --up-error-dark: #ff8a8a;
    --up-error-disabled: #8d5858;
    --up-error-light: #3a2222;
    --up-info: #909399;
    --up-info-dark: #b0b3b8;
    --up-info-disabled: #5f6368;
    --up-info-light: #2f3238;
    --up-table2-header-bg-color: #2a2d33;
    --up-table2-zebra-bg-color: #23262b;
    --up-table2-highlight-bg-color: #2f3440;
    --up-gap-bg-color: #111111;
    --up-skeleton-bg-color: #2f3135;
    --up-skeleton-shimmer-color: rgba(255, 255, 255, 0.12);
    --up-swipe-action-button-bg-color: #4b5563;
    --up-index-list-indicator-bg-color: #4b5563;
    --up-calendar-month-mark-color: rgba(255, 255, 255, 0.04);
  }
}
.u-line-1,
.up-line-1 {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.u-line-2,
.up-line-2 {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical !important;
}
.u-line-3,
.up-line-3 {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical !important;
}
.u-line-4,
.up-line-4 {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical !important;
}
.u-line-5,
.up-line-5 {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical !important;
}
.u-line-6,
.up-line-6 {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical !important;
}
.u-line-7,
.up-line-7 {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical !important;
}
.u-line-8,
.up-line-8 {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 8;
  -webkit-box-orient: vertical !important;
}
.u-line-9,
.up-line-9 {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 9;
  -webkit-box-orient: vertical !important;
}
.u-line-10,
.up-line-10 {
  display: -webkit-box !important;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical !important;
}
.u-border,
.up-border {
  border-width: 0.5rpx !important;
  border-color: var(--up-border-color, var(--u-border-color, #dadbde)) !important;
  border-style: solid;
}
.u-border-top,
.up-border-top {
  border-top-width: 0.5rpx !important;
  border-color: var(--up-border-color, var(--u-border-color, #dadbde)) !important;
  border-top-style: solid;
}
.u-border-left,
.up-border-left {
  border-left-width: 0.5rpx !important;
  border-color: var(--up-border-color, var(--u-border-color, #dadbde)) !important;
  border-left-style: solid;
}
.u-border-right,
.up-border-right {
  border-right-width: 0.5rpx !important;
  border-color: var(--up-border-color, var(--u-border-color, #dadbde)) !important;
  border-right-style: solid;
}
.u-border-bottom,
.up-border-bottom {
  border-bottom-width: 0.5rpx !important;
  border-color: var(--up-border-color, var(--u-border-color, #dadbde)) !important;
  border-bottom-style: solid;
}
.u-border-top-bottom,
.up-border-top-bottom {
  border-top-width: 0.5rpx !important;
  border-bottom-width: 0.5rpx !important;
  border-color: var(--up-border-color, var(--u-border-color, #dadbde)) !important;
  border-top-style: solid;
  border-bottom-style: solid;
}
.u-reset-button,
.up-reset-button {
  padding: 0;
  background-color: transparent;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}
.u-reset-button::after,
.up-reset-button::after {
  border: none;
}
.u-hover-class,
.up-hover-class {
  opacity: 0.7;
}
.u-empty,
.u-empty__wrap,
.u-transition,
.u-tabs,
.u-tabs__wrapper,
.u-tabs__wrapper__scroll-view-wrapper,
.u-tabs__wrapper__scroll-view,
.u-tabs__wrapper__nav,
.u-tabs__wrapper__nav__line,
.up-empty,
.up-empty__wrap,
.up-transition,
.up-tabs,
.up-tabs__wrapper,
.up-tabs__wrapper__scroll-view-wrapper,
.up-tabs__wrapper__scroll-view,
.up-tabs__wrapper__nav,
.up-tabs__wrapper__nav__line {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: auto;
  align-items: stretch;
  align-content: flex-start;
}
.u-flex,
.u-flex-row,
.u-flex-x,
.up-flex,
.up-flex-row,
.up-flex-x {
  display: flex !important;
  flex-direction: row !important;
}
.u-flex-y,
.u-flex-column,
.up-flex-y,
.up-flex-column {
  display: flex !important;
  flex-direction: column !important;
}
.u-flex-x-center,
.up-flex-x-center {
  display: flex;
  flex-direction: row;
  justify-content: center !important;
}
.u-flex-xy-center,
.up-flex-xy-center {
  display: flex;
  flex-direction: row;
  justify-content: center !important;
  align-items: center !important;
}
.u-flex-y-center,
.up-flex-y-center {
  display: flex;
  flex-direction: row;
  align-items: center !important;
}
.u-flex-x-left,
.up-flex-x-left {
  display: flex;
  flex-direction: row;
}
.u-flex-x-reverse,
.u-flex-row-reverse,
.up-flex-x-reverse,
.up-flex-row-reverse {
  flex-direction: row-reverse !important;
}
.u-flex-y-reverse,
.u-flex-column-reverse,
.up-flex-y-reverse,
.up-flex-column-reverse {
  flex-direction: column-reverse !important;
}
.u-flex.u-flex-reverse,
.u-flex-row.u-flex-reverse,
.u-flex-x.u-flex-reverse,
.up-flex.up-flex-reverse,
.up-flex-row.up-flex-reverse,
.up-flex-x.up-flex-reverse {
  flex-direction: row-reverse !important;
}
.u-flex-column.u-flex-reverse,
.u-flex-y.u-flex-reverse,
.up-flex-column.up-flex-reverse,
.up-flex-y.up-flex-reverse {
  flex-direction: column-reverse !important;
}
.u-flex-fill,
.up-flex-fill {
  flex: 1 1 auto !important;
}
.u-margin-top-auto,
.u-m-t-auto,
.up-margin-top-auto,
.up-m-t-auto {
  margin-top: auto !important;
}
.u-margin-right-auto,
.u-m-r-auto,
.up-margin-right-auto,
.up-m-r-auto {
  margin-right: auto !important;
}
.u-margin-bottom-auto,
.u-m-b-auto,
.up-margin-bottom-auto,
.up-m-b-auto {
  margin-bottom: auto !important;
}
.u-margin-left-auto,
.u-m-l-auto,
.up-margin-left-auto,
.up-m-l-auto {
  margin-left: auto !important;
}
.u-margin-center-auto,
.u-m-c-auto,
.up-margin-center-auto,
.up-m-c-auto {
  margin-left: auto !important;
  margin-right: auto !important;
}
.u-margin-middle-auto,
.u-m-m-auto,
.up-margin-middle-auto,
.up-m-m-auto {
  margin-top: auto !important;
  margin-bottom: auto !important;
}
.u-flex-wrap,
.up-flex-wrap {
  flex-wrap: wrap !important;
}
.u-flex-wrap-reverse,
.up-flex-wrap-reverse {
  flex-wrap: wrap-reverse !important;
}
.u-flex-start,
.up-flex-start {
  justify-content: flex-start !important;
}
.u-flex-center,
.up-flex-center {
  justify-content: center !important;
}
.u-flex-end,
.up-flex-end {
  justify-content: flex-end !important;
}
.u-flex-between,
.up-flex-between {
  justify-content: space-between !important;
}
.u-flex-around,
.up-flex-around {
  justify-content: space-around !important;
}
.u-flex-items-start,
.up-flex-items-start {
  align-items: flex-start !important;
}
.u-flex-items-center,
.up-flex-items-center {
  align-items: center !important;
}
.u-flex-items-end,
.up-flex-items-end {
  align-items: flex-end !important;
}
.u-flex-items-baseline,
.up-flex-items-baseline {
  align-items: baseline !important;
}
.u-flex-items-stretch,
.up-flex-items-stretch {
  align-items: stretch !important;
}
.u-flex-self-start,
.up-flex-self-start {
  align-self: flex-start !important;
}
.u-flex-self-center,
.up-flex-self-center {
  align-self: center !important;
}
.u-flex-self-end,
.up-flex-self-end {
  align-self: flex-end !important;
}
.u-flex-self-baseline,
.up-flex-self-baseline {
  align-self: baseline !important;
}
.u-flex-self-stretch,
.up-flex-self-stretch {
  align-self: stretch !important;
}
.u-flex-content-start,
.up-flex-content-start {
  align-content: flex-start !important;
}
.u-flex-content-center,
.up-flex-content-center {
  align-content: center !important;
}
.u-flex-content-end,
.up-flex-content-end {
  align-content: flex-end !important;
}
.u-flex-content-between,
.up-flex-content-between {
  align-content: space-between !important;
}
.u-flex-content-around,
.up-flex-content-around {
  align-content: space-around !important;
}
.u-flex-middle,
.up-flex-middle {
  justify-content: center !important;
  align-items: center !important;
  align-self: center !important;
  align-content: center !important;
}
.u-flex-grow,
.up-flex-grow {
  flex-grow: 1 !important;
}
.u-flex-shrink,
.up-flex-shrink {
  flex-shrink: 1 !important;
}
.u-margin-0,
.u-m-0,
.up-margin-0,
.up-m-0 {
  margin: 0rpx !important;
}
.u-padding-0,
.u-p-0,
.up-padding-0,
.up-p-0 {
  padding: 0rpx !important;
}
.u-m-l-0,
.up-m-l-0 {
  margin-left: 0rpx !important;
}
.u-p-l-0,
.up-p-l-0 {
  padding-left: 0rpx !important;
}
.u-margin-left-0,
.up-margin-left-0 {
  margin-left: 0rpx !important;
}
.u-padding-left-0,
.up-padding-left-0 {
  padding-left: 0rpx !important;
}
.u-m-t-0,
.up-m-t-0 {
  margin-top: 0rpx !important;
}
.u-p-t-0,
.up-p-t-0 {
  padding-top: 0rpx !important;
}
.u-margin-top-0,
.up-margin-top-0 {
  margin-top: 0rpx !important;
}
.u-padding-top-0,
.up-padding-top-0 {
  padding-top: 0rpx !important;
}
.u-m-r-0,
.up-m-r-0 {
  margin-right: 0rpx !important;
}
.u-p-r-0,
.up-p-r-0 {
  padding-right: 0rpx !important;
}
.u-margin-right-0,
.up-margin-right-0 {
  margin-right: 0rpx !important;
}
.u-padding-right-0,
.up-padding-right-0 {
  padding-right: 0rpx !important;
}
.u-m-b-0,
.up-m-b-0 {
  margin-bottom: 0rpx !important;
}
.u-p-b-0,
.up-p-b-0 {
  padding-bottom: 0rpx !important;
}
.u-margin-bottom-0,
.up-margin-bottom-0 {
  margin-bottom: 0rpx !important;
}
.u-padding-bottom-0,
.up-padding-bottom-0 {
  padding-bottom: 0rpx !important;
}
.u-margin-2,
.u-m-2,
.up-margin-2,
.up-m-2 {
  margin: 2rpx !important;
}
.u-padding-2,
.u-p-2,
.up-padding-2,
.up-p-2 {
  padding: 2rpx !important;
}
.u-m-l-2,
.up-m-l-2 {
  margin-left: 2rpx !important;
}
.u-p-l-2,
.up-p-l-2 {
  padding-left: 2rpx !important;
}
.u-margin-left-2,
.up-margin-left-2 {
  margin-left: 2rpx !important;
}
.u-padding-left-2,
.up-padding-left-2 {
  padding-left: 2rpx !important;
}
.u-m-t-2,
.up-m-t-2 {
  margin-top: 2rpx !important;
}
.u-p-t-2,
.up-p-t-2 {
  padding-top: 2rpx !important;
}
.u-margin-top-2,
.up-margin-top-2 {
  margin-top: 2rpx !important;
}
.u-padding-top-2,
.up-padding-top-2 {
  padding-top: 2rpx !important;
}
.u-m-r-2,
.up-m-r-2 {
  margin-right: 2rpx !important;
}
.u-p-r-2,
.up-p-r-2 {
  padding-right: 2rpx !important;
}
.u-margin-right-2,
.up-margin-right-2 {
  margin-right: 2rpx !important;
}
.u-padding-right-2,
.up-padding-right-2 {
  padding-right: 2rpx !important;
}
.u-m-b-2,
.up-m-b-2 {
  margin-bottom: 2rpx !important;
}
.u-p-b-2,
.up-p-b-2 {
  padding-bottom: 2rpx !important;
}
.u-margin-bottom-2,
.up-margin-bottom-2 {
  margin-bottom: 2rpx !important;
}
.u-padding-bottom-2,
.up-padding-bottom-2 {
  padding-bottom: 2rpx !important;
}
.u-margin-4,
.u-m-4,
.up-margin-4,
.up-m-4 {
  margin: 4rpx !important;
}
.u-padding-4,
.u-p-4,
.up-padding-4,
.up-p-4 {
  padding: 4rpx !important;
}
.u-m-l-4,
.up-m-l-4 {
  margin-left: 4rpx !important;
}
.u-p-l-4,
.up-p-l-4 {
  padding-left: 4rpx !important;
}
.u-margin-left-4,
.up-margin-left-4 {
  margin-left: 4rpx !important;
}
.u-padding-left-4,
.up-padding-left-4 {
  padding-left: 4rpx !important;
}
.u-m-t-4,
.up-m-t-4 {
  margin-top: 4rpx !important;
}
.u-p-t-4,
.up-p-t-4 {
  padding-top: 4rpx !important;
}
.u-margin-top-4,
.up-margin-top-4 {
  margin-top: 4rpx !important;
}
.u-padding-top-4,
.up-padding-top-4 {
  padding-top: 4rpx !important;
}
.u-m-r-4,
.up-m-r-4 {
  margin-right: 4rpx !important;
}
.u-p-r-4,
.up-p-r-4 {
  padding-right: 4rpx !important;
}
.u-margin-right-4,
.up-margin-right-4 {
  margin-right: 4rpx !important;
}
.u-padding-right-4,
.up-padding-right-4 {
  padding-right: 4rpx !important;
}
.u-m-b-4,
.up-m-b-4 {
  margin-bottom: 4rpx !important;
}
.u-p-b-4,
.up-p-b-4 {
  padding-bottom: 4rpx !important;
}
.u-margin-bottom-4,
.up-margin-bottom-4 {
  margin-bottom: 4rpx !important;
}
.u-padding-bottom-4,
.up-padding-bottom-4 {
  padding-bottom: 4rpx !important;
}
.u-margin-5,
.u-m-5,
.up-margin-5,
.up-m-5 {
  margin: 5rpx !important;
}
.u-padding-5,
.u-p-5,
.up-padding-5,
.up-p-5 {
  padding: 5rpx !important;
}
.u-m-l-5,
.up-m-l-5 {
  margin-left: 5rpx !important;
}
.u-p-l-5,
.up-p-l-5 {
  padding-left: 5rpx !important;
}
.u-margin-left-5,
.up-margin-left-5 {
  margin-left: 5rpx !important;
}
.u-padding-left-5,
.up-padding-left-5 {
  padding-left: 5rpx !important;
}
.u-m-t-5,
.up-m-t-5 {
  margin-top: 5rpx !important;
}
.u-p-t-5,
.up-p-t-5 {
  padding-top: 5rpx !important;
}
.u-margin-top-5,
.up-margin-top-5 {
  margin-top: 5rpx !important;
}
.u-padding-top-5,
.up-padding-top-5 {
  padding-top: 5rpx !important;
}
.u-m-r-5,
.up-m-r-5 {
  margin-right: 5rpx !important;
}
.u-p-r-5,
.up-p-r-5 {
  padding-right: 5rpx !important;
}
.u-margin-right-5,
.up-margin-right-5 {
  margin-right: 5rpx !important;
}
.u-padding-right-5,
.up-padding-right-5 {
  padding-right: 5rpx !important;
}
.u-m-b-5,
.up-m-b-5 {
  margin-bottom: 5rpx !important;
}
.u-p-b-5,
.up-p-b-5 {
  padding-bottom: 5rpx !important;
}
.u-margin-bottom-5,
.up-margin-bottom-5 {
  margin-bottom: 5rpx !important;
}
.u-padding-bottom-5,
.up-padding-bottom-5 {
  padding-bottom: 5rpx !important;
}
.u-margin-6,
.u-m-6,
.up-margin-6,
.up-m-6 {
  margin: 6rpx !important;
}
.u-padding-6,
.u-p-6,
.up-padding-6,
.up-p-6 {
  padding: 6rpx !important;
}
.u-m-l-6,
.up-m-l-6 {
  margin-left: 6rpx !important;
}
.u-p-l-6,
.up-p-l-6 {
  padding-left: 6rpx !important;
}
.u-margin-left-6,
.up-margin-left-6 {
  margin-left: 6rpx !important;
}
.u-padding-left-6,
.up-padding-left-6 {
  padding-left: 6rpx !important;
}
.u-m-t-6,
.up-m-t-6 {
  margin-top: 6rpx !important;
}
.u-p-t-6,
.up-p-t-6 {
  padding-top: 6rpx !important;
}
.u-margin-top-6,
.up-margin-top-6 {
  margin-top: 6rpx !important;
}
.u-padding-top-6,
.up-padding-top-6 {
  padding-top: 6rpx !important;
}
.u-m-r-6,
.up-m-r-6 {
  margin-right: 6rpx !important;
}
.u-p-r-6,
.up-p-r-6 {
  padding-right: 6rpx !important;
}
.u-margin-right-6,
.up-margin-right-6 {
  margin-right: 6rpx !important;
}
.u-padding-right-6,
.up-padding-right-6 {
  padding-right: 6rpx !important;
}
.u-m-b-6,
.up-m-b-6 {
  margin-bottom: 6rpx !important;
}
.u-p-b-6,
.up-p-b-6 {
  padding-bottom: 6rpx !important;
}
.u-margin-bottom-6,
.up-margin-bottom-6 {
  margin-bottom: 6rpx !important;
}
.u-padding-bottom-6,
.up-padding-bottom-6 {
  padding-bottom: 6rpx !important;
}
.u-margin-8,
.u-m-8,
.up-margin-8,
.up-m-8 {
  margin: 8rpx !important;
}
.u-padding-8,
.u-p-8,
.up-padding-8,
.up-p-8 {
  padding: 8rpx !important;
}
.u-m-l-8,
.up-m-l-8 {
  margin-left: 8rpx !important;
}
.u-p-l-8,
.up-p-l-8 {
  padding-left: 8rpx !important;
}
.u-margin-left-8,
.up-margin-left-8 {
  margin-left: 8rpx !important;
}
.u-padding-left-8,
.up-padding-left-8 {
  padding-left: 8rpx !important;
}
.u-m-t-8,
.up-m-t-8 {
  margin-top: 8rpx !important;
}
.u-p-t-8,
.up-p-t-8 {
  padding-top: 8rpx !important;
}
.u-margin-top-8,
.up-margin-top-8 {
  margin-top: 8rpx !important;
}
.u-padding-top-8,
.up-padding-top-8 {
  padding-top: 8rpx !important;
}
.u-m-r-8,
.up-m-r-8 {
  margin-right: 8rpx !important;
}
.u-p-r-8,
.up-p-r-8 {
  padding-right: 8rpx !important;
}
.u-margin-right-8,
.up-margin-right-8 {
  margin-right: 8rpx !important;
}
.u-padding-right-8,
.up-padding-right-8 {
  padding-right: 8rpx !important;
}
.u-m-b-8,
.up-m-b-8 {
  margin-bottom: 8rpx !important;
}
.u-p-b-8,
.up-p-b-8 {
  padding-bottom: 8rpx !important;
}
.u-margin-bottom-8,
.up-margin-bottom-8 {
  margin-bottom: 8rpx !important;
}
.u-padding-bottom-8,
.up-padding-bottom-8 {
  padding-bottom: 8rpx !important;
}
.u-margin-10,
.u-m-10,
.up-margin-10,
.up-m-10 {
  margin: 10rpx !important;
}
.u-padding-10,
.u-p-10,
.up-padding-10,
.up-p-10 {
  padding: 10rpx !important;
}
.u-m-l-10,
.up-m-l-10 {
  margin-left: 10rpx !important;
}
.u-p-l-10,
.up-p-l-10 {
  padding-left: 10rpx !important;
}
.u-margin-left-10,
.up-margin-left-10 {
  margin-left: 10rpx !important;
}
.u-padding-left-10,
.up-padding-left-10 {
  padding-left: 10rpx !important;
}
.u-m-t-10,
.up-m-t-10 {
  margin-top: 10rpx !important;
}
.u-p-t-10,
.up-p-t-10 {
  padding-top: 10rpx !important;
}
.u-margin-top-10,
.up-margin-top-10 {
  margin-top: 10rpx !important;
}
.u-padding-top-10,
.up-padding-top-10 {
  padding-top: 10rpx !important;
}
.u-m-r-10,
.up-m-r-10 {
  margin-right: 10rpx !important;
}
.u-p-r-10,
.up-p-r-10 {
  padding-right: 10rpx !important;
}
.u-margin-right-10,
.up-margin-right-10 {
  margin-right: 10rpx !important;
}
.u-padding-right-10,
.up-padding-right-10 {
  padding-right: 10rpx !important;
}
.u-m-b-10,
.up-m-b-10 {
  margin-bottom: 10rpx !important;
}
.u-p-b-10,
.up-p-b-10 {
  padding-bottom: 10rpx !important;
}
.u-margin-bottom-10,
.up-margin-bottom-10 {
  margin-bottom: 10rpx !important;
}
.u-padding-bottom-10,
.up-padding-bottom-10 {
  padding-bottom: 10rpx !important;
}
.u-margin-12,
.u-m-12,
.up-margin-12,
.up-m-12 {
  margin: 12rpx !important;
}
.u-padding-12,
.u-p-12,
.up-padding-12,
.up-p-12 {
  padding: 12rpx !important;
}
.u-m-l-12,
.up-m-l-12 {
  margin-left: 12rpx !important;
}
.u-p-l-12,
.up-p-l-12 {
  padding-left: 12rpx !important;
}
.u-margin-left-12,
.up-margin-left-12 {
  margin-left: 12rpx !important;
}
.u-padding-left-12,
.up-padding-left-12 {
  padding-left: 12rpx !important;
}
.u-m-t-12,
.up-m-t-12 {
  margin-top: 12rpx !important;
}
.u-p-t-12,
.up-p-t-12 {
  padding-top: 12rpx !important;
}
.u-margin-top-12,
.up-margin-top-12 {
  margin-top: 12rpx !important;
}
.u-padding-top-12,
.up-padding-top-12 {
  padding-top: 12rpx !important;
}
.u-m-r-12,
.up-m-r-12 {
  margin-right: 12rpx !important;
}
.u-p-r-12,
.up-p-r-12 {
  padding-right: 12rpx !important;
}
.u-margin-right-12,
.up-margin-right-12 {
  margin-right: 12rpx !important;
}
.u-padding-right-12,
.up-padding-right-12 {
  padding-right: 12rpx !important;
}
.u-m-b-12,
.up-m-b-12 {
  margin-bottom: 12rpx !important;
}
.u-p-b-12,
.up-p-b-12 {
  padding-bottom: 12rpx !important;
}
.u-margin-bottom-12,
.up-margin-bottom-12 {
  margin-bottom: 12rpx !important;
}
.u-padding-bottom-12,
.up-padding-bottom-12 {
  padding-bottom: 12rpx !important;
}
.u-margin-14,
.u-m-14,
.up-margin-14,
.up-m-14 {
  margin: 14rpx !important;
}
.u-padding-14,
.u-p-14,
.up-padding-14,
.up-p-14 {
  padding: 14rpx !important;
}
.u-m-l-14,
.up-m-l-14 {
  margin-left: 14rpx !important;
}
.u-p-l-14,
.up-p-l-14 {
  padding-left: 14rpx !important;
}
.u-margin-left-14,
.up-margin-left-14 {
  margin-left: 14rpx !important;
}
.u-padding-left-14,
.up-padding-left-14 {
  padding-left: 14rpx !important;
}
.u-m-t-14,
.up-m-t-14 {
  margin-top: 14rpx !important;
}
.u-p-t-14,
.up-p-t-14 {
  padding-top: 14rpx !important;
}
.u-margin-top-14,
.up-margin-top-14 {
  margin-top: 14rpx !important;
}
.u-padding-top-14,
.up-padding-top-14 {
  padding-top: 14rpx !important;
}
.u-m-r-14,
.up-m-r-14 {
  margin-right: 14rpx !important;
}
.u-p-r-14,
.up-p-r-14 {
  padding-right: 14rpx !important;
}
.u-margin-right-14,
.up-margin-right-14 {
  margin-right: 14rpx !important;
}
.u-padding-right-14,
.up-padding-right-14 {
  padding-right: 14rpx !important;
}
.u-m-b-14,
.up-m-b-14 {
  margin-bottom: 14rpx !important;
}
.u-p-b-14,
.up-p-b-14 {
  padding-bottom: 14rpx !important;
}
.u-margin-bottom-14,
.up-margin-bottom-14 {
  margin-bottom: 14rpx !important;
}
.u-padding-bottom-14,
.up-padding-bottom-14 {
  padding-bottom: 14rpx !important;
}
.u-margin-15,
.u-m-15,
.up-margin-15,
.up-m-15 {
  margin: 15rpx !important;
}
.u-padding-15,
.u-p-15,
.up-padding-15,
.up-p-15 {
  padding: 15rpx !important;
}
.u-m-l-15,
.up-m-l-15 {
  margin-left: 15rpx !important;
}
.u-p-l-15,
.up-p-l-15 {
  padding-left: 15rpx !important;
}
.u-margin-left-15,
.up-margin-left-15 {
  margin-left: 15rpx !important;
}
.u-padding-left-15,
.up-padding-left-15 {
  padding-left: 15rpx !important;
}
.u-m-t-15,
.up-m-t-15 {
  margin-top: 15rpx !important;
}
.u-p-t-15,
.up-p-t-15 {
  padding-top: 15rpx !important;
}
.u-margin-top-15,
.up-margin-top-15 {
  margin-top: 15rpx !important;
}
.u-padding-top-15,
.up-padding-top-15 {
  padding-top: 15rpx !important;
}
.u-m-r-15,
.up-m-r-15 {
  margin-right: 15rpx !important;
}
.u-p-r-15,
.up-p-r-15 {
  padding-right: 15rpx !important;
}
.u-margin-right-15,
.up-margin-right-15 {
  margin-right: 15rpx !important;
}
.u-padding-right-15,
.up-padding-right-15 {
  padding-right: 15rpx !important;
}
.u-m-b-15,
.up-m-b-15 {
  margin-bottom: 15rpx !important;
}
.u-p-b-15,
.up-p-b-15 {
  padding-bottom: 15rpx !important;
}
.u-margin-bottom-15,
.up-margin-bottom-15 {
  margin-bottom: 15rpx !important;
}
.u-padding-bottom-15,
.up-padding-bottom-15 {
  padding-bottom: 15rpx !important;
}
.u-margin-16,
.u-m-16,
.up-margin-16,
.up-m-16 {
  margin: 16rpx !important;
}
.u-padding-16,
.u-p-16,
.up-padding-16,
.up-p-16 {
  padding: 16rpx !important;
}
.u-m-l-16,
.up-m-l-16 {
  margin-left: 16rpx !important;
}
.u-p-l-16,
.up-p-l-16 {
  padding-left: 16rpx !important;
}
.u-margin-left-16,
.up-margin-left-16 {
  margin-left: 16rpx !important;
}
.u-padding-left-16,
.up-padding-left-16 {
  padding-left: 16rpx !important;
}
.u-m-t-16,
.up-m-t-16 {
  margin-top: 16rpx !important;
}
.u-p-t-16,
.up-p-t-16 {
  padding-top: 16rpx !important;
}
.u-margin-top-16,
.up-margin-top-16 {
  margin-top: 16rpx !important;
}
.u-padding-top-16,
.up-padding-top-16 {
  padding-top: 16rpx !important;
}
.u-m-r-16,
.up-m-r-16 {
  margin-right: 16rpx !important;
}
.u-p-r-16,
.up-p-r-16 {
  padding-right: 16rpx !important;
}
.u-margin-right-16,
.up-margin-right-16 {
  margin-right: 16rpx !important;
}
.u-padding-right-16,
.up-padding-right-16 {
  padding-right: 16rpx !important;
}
.u-m-b-16,
.up-m-b-16 {
  margin-bottom: 16rpx !important;
}
.u-p-b-16,
.up-p-b-16 {
  padding-bottom: 16rpx !important;
}
.u-margin-bottom-16,
.up-margin-bottom-16 {
  margin-bottom: 16rpx !important;
}
.u-padding-bottom-16,
.up-padding-bottom-16 {
  padding-bottom: 16rpx !important;
}
.u-margin-18,
.u-m-18,
.up-margin-18,
.up-m-18 {
  margin: 18rpx !important;
}
.u-padding-18,
.u-p-18,
.up-padding-18,
.up-p-18 {
  padding: 18rpx !important;
}
.u-m-l-18,
.up-m-l-18 {
  margin-left: 18rpx !important;
}
.u-p-l-18,
.up-p-l-18 {
  padding-left: 18rpx !important;
}
.u-margin-left-18,
.up-margin-left-18 {
  margin-left: 18rpx !important;
}
.u-padding-left-18,
.up-padding-left-18 {
  padding-left: 18rpx !important;
}
.u-m-t-18,
.up-m-t-18 {
  margin-top: 18rpx !important;
}
.u-p-t-18,
.up-p-t-18 {
  padding-top: 18rpx !important;
}
.u-margin-top-18,
.up-margin-top-18 {
  margin-top: 18rpx !important;
}
.u-padding-top-18,
.up-padding-top-18 {
  padding-top: 18rpx !important;
}
.u-m-r-18,
.up-m-r-18 {
  margin-right: 18rpx !important;
}
.u-p-r-18,
.up-p-r-18 {
  padding-right: 18rpx !important;
}
.u-margin-right-18,
.up-margin-right-18 {
  margin-right: 18rpx !important;
}
.u-padding-right-18,
.up-padding-right-18 {
  padding-right: 18rpx !important;
}
.u-m-b-18,
.up-m-b-18 {
  margin-bottom: 18rpx !important;
}
.u-p-b-18,
.up-p-b-18 {
  padding-bottom: 18rpx !important;
}
.u-margin-bottom-18,
.up-margin-bottom-18 {
  margin-bottom: 18rpx !important;
}
.u-padding-bottom-18,
.up-padding-bottom-18 {
  padding-bottom: 18rpx !important;
}
.u-margin-20,
.u-m-20,
.up-margin-20,
.up-m-20 {
  margin: 20rpx !important;
}
.u-padding-20,
.u-p-20,
.up-padding-20,
.up-p-20 {
  padding: 20rpx !important;
}
.u-m-l-20,
.up-m-l-20 {
  margin-left: 20rpx !important;
}
.u-p-l-20,
.up-p-l-20 {
  padding-left: 20rpx !important;
}
.u-margin-left-20,
.up-margin-left-20 {
  margin-left: 20rpx !important;
}
.u-padding-left-20,
.up-padding-left-20 {
  padding-left: 20rpx !important;
}
.u-m-t-20,
.up-m-t-20 {
  margin-top: 20rpx !important;
}
.u-p-t-20,
.up-p-t-20 {
  padding-top: 20rpx !important;
}
.u-margin-top-20,
.up-margin-top-20 {
  margin-top: 20rpx !important;
}
.u-padding-top-20,
.up-padding-top-20 {
  padding-top: 20rpx !important;
}
.u-m-r-20,
.up-m-r-20 {
  margin-right: 20rpx !important;
}
.u-p-r-20,
.up-p-r-20 {
  padding-right: 20rpx !important;
}
.u-margin-right-20,
.up-margin-right-20 {
  margin-right: 20rpx !important;
}
.u-padding-right-20,
.up-padding-right-20 {
  padding-right: 20rpx !important;
}
.u-m-b-20,
.up-m-b-20 {
  margin-bottom: 20rpx !important;
}
.u-p-b-20,
.up-p-b-20 {
  padding-bottom: 20rpx !important;
}
.u-margin-bottom-20,
.up-margin-bottom-20 {
  margin-bottom: 20rpx !important;
}
.u-padding-bottom-20,
.up-padding-bottom-20 {
  padding-bottom: 20rpx !important;
}
.u-margin-22,
.u-m-22,
.up-margin-22,
.up-m-22 {
  margin: 22rpx !important;
}
.u-padding-22,
.u-p-22,
.up-padding-22,
.up-p-22 {
  padding: 22rpx !important;
}
.u-m-l-22,
.up-m-l-22 {
  margin-left: 22rpx !important;
}
.u-p-l-22,
.up-p-l-22 {
  padding-left: 22rpx !important;
}
.u-margin-left-22,
.up-margin-left-22 {
  margin-left: 22rpx !important;
}
.u-padding-left-22,
.up-padding-left-22 {
  padding-left: 22rpx !important;
}
.u-m-t-22,
.up-m-t-22 {
  margin-top: 22rpx !important;
}
.u-p-t-22,
.up-p-t-22 {
  padding-top: 22rpx !important;
}
.u-margin-top-22,
.up-margin-top-22 {
  margin-top: 22rpx !important;
}
.u-padding-top-22,
.up-padding-top-22 {
  padding-top: 22rpx !important;
}
.u-m-r-22,
.up-m-r-22 {
  margin-right: 22rpx !important;
}
.u-p-r-22,
.up-p-r-22 {
  padding-right: 22rpx !important;
}
.u-margin-right-22,
.up-margin-right-22 {
  margin-right: 22rpx !important;
}
.u-padding-right-22,
.up-padding-right-22 {
  padding-right: 22rpx !important;
}
.u-m-b-22,
.up-m-b-22 {
  margin-bottom: 22rpx !important;
}
.u-p-b-22,
.up-p-b-22 {
  padding-bottom: 22rpx !important;
}
.u-margin-bottom-22,
.up-margin-bottom-22 {
  margin-bottom: 22rpx !important;
}
.u-padding-bottom-22,
.up-padding-bottom-22 {
  padding-bottom: 22rpx !important;
}
.u-margin-24,
.u-m-24,
.up-margin-24,
.up-m-24 {
  margin: 24rpx !important;
}
.u-padding-24,
.u-p-24,
.up-padding-24,
.up-p-24 {
  padding: 24rpx !important;
}
.u-m-l-24,
.up-m-l-24 {
  margin-left: 24rpx !important;
}
.u-p-l-24,
.up-p-l-24 {
  padding-left: 24rpx !important;
}
.u-margin-left-24,
.up-margin-left-24 {
  margin-left: 24rpx !important;
}
.u-padding-left-24,
.up-padding-left-24 {
  padding-left: 24rpx !important;
}
.u-m-t-24,
.up-m-t-24 {
  margin-top: 24rpx !important;
}
.u-p-t-24,
.up-p-t-24 {
  padding-top: 24rpx !important;
}
.u-margin-top-24,
.up-margin-top-24 {
  margin-top: 24rpx !important;
}
.u-padding-top-24,
.up-padding-top-24 {
  padding-top: 24rpx !important;
}
.u-m-r-24,
.up-m-r-24 {
  margin-right: 24rpx !important;
}
.u-p-r-24,
.up-p-r-24 {
  padding-right: 24rpx !important;
}
.u-margin-right-24,
.up-margin-right-24 {
  margin-right: 24rpx !important;
}
.u-padding-right-24,
.up-padding-right-24 {
  padding-right: 24rpx !important;
}
.u-m-b-24,
.up-m-b-24 {
  margin-bottom: 24rpx !important;
}
.u-p-b-24,
.up-p-b-24 {
  padding-bottom: 24rpx !important;
}
.u-margin-bottom-24,
.up-margin-bottom-24 {
  margin-bottom: 24rpx !important;
}
.u-padding-bottom-24,
.up-padding-bottom-24 {
  padding-bottom: 24rpx !important;
}
.u-margin-25,
.u-m-25,
.up-margin-25,
.up-m-25 {
  margin: 25rpx !important;
}
.u-padding-25,
.u-p-25,
.up-padding-25,
.up-p-25 {
  padding: 25rpx !important;
}
.u-m-l-25,
.up-m-l-25 {
  margin-left: 25rpx !important;
}
.u-p-l-25,
.up-p-l-25 {
  padding-left: 25rpx !important;
}
.u-margin-left-25,
.up-margin-left-25 {
  margin-left: 25rpx !important;
}
.u-padding-left-25,
.up-padding-left-25 {
  padding-left: 25rpx !important;
}
.u-m-t-25,
.up-m-t-25 {
  margin-top: 25rpx !important;
}
.u-p-t-25,
.up-p-t-25 {
  padding-top: 25rpx !important;
}
.u-margin-top-25,
.up-margin-top-25 {
  margin-top: 25rpx !important;
}
.u-padding-top-25,
.up-padding-top-25 {
  padding-top: 25rpx !important;
}
.u-m-r-25,
.up-m-r-25 {
  margin-right: 25rpx !important;
}
.u-p-r-25,
.up-p-r-25 {
  padding-right: 25rpx !important;
}
.u-margin-right-25,
.up-margin-right-25 {
  margin-right: 25rpx !important;
}
.u-padding-right-25,
.up-padding-right-25 {
  padding-right: 25rpx !important;
}
.u-m-b-25,
.up-m-b-25 {
  margin-bottom: 25rpx !important;
}
.u-p-b-25,
.up-p-b-25 {
  padding-bottom: 25rpx !important;
}
.u-margin-bottom-25,
.up-margin-bottom-25 {
  margin-bottom: 25rpx !important;
}
.u-padding-bottom-25,
.up-padding-bottom-25 {
  padding-bottom: 25rpx !important;
}
.u-margin-26,
.u-m-26,
.up-margin-26,
.up-m-26 {
  margin: 26rpx !important;
}
.u-padding-26,
.u-p-26,
.up-padding-26,
.up-p-26 {
  padding: 26rpx !important;
}
.u-m-l-26,
.up-m-l-26 {
  margin-left: 26rpx !important;
}
.u-p-l-26,
.up-p-l-26 {
  padding-left: 26rpx !important;
}
.u-margin-left-26,
.up-margin-left-26 {
  margin-left: 26rpx !important;
}
.u-padding-left-26,
.up-padding-left-26 {
  padding-left: 26rpx !important;
}
.u-m-t-26,
.up-m-t-26 {
  margin-top: 26rpx !important;
}
.u-p-t-26,
.up-p-t-26 {
  padding-top: 26rpx !important;
}
.u-margin-top-26,
.up-margin-top-26 {
  margin-top: 26rpx !important;
}
.u-padding-top-26,
.up-padding-top-26 {
  padding-top: 26rpx !important;
}
.u-m-r-26,
.up-m-r-26 {
  margin-right: 26rpx !important;
}
.u-p-r-26,
.up-p-r-26 {
  padding-right: 26rpx !important;
}
.u-margin-right-26,
.up-margin-right-26 {
  margin-right: 26rpx !important;
}
.u-padding-right-26,
.up-padding-right-26 {
  padding-right: 26rpx !important;
}
.u-m-b-26,
.up-m-b-26 {
  margin-bottom: 26rpx !important;
}
.u-p-b-26,
.up-p-b-26 {
  padding-bottom: 26rpx !important;
}
.u-margin-bottom-26,
.up-margin-bottom-26 {
  margin-bottom: 26rpx !important;
}
.u-padding-bottom-26,
.up-padding-bottom-26 {
  padding-bottom: 26rpx !important;
}
.u-margin-28,
.u-m-28,
.up-margin-28,
.up-m-28 {
  margin: 28rpx !important;
}
.u-padding-28,
.u-p-28,
.up-padding-28,
.up-p-28 {
  padding: 28rpx !important;
}
.u-m-l-28,
.up-m-l-28 {
  margin-left: 28rpx !important;
}
.u-p-l-28,
.up-p-l-28 {
  padding-left: 28rpx !important;
}
.u-margin-left-28,
.up-margin-left-28 {
  margin-left: 28rpx !important;
}
.u-padding-left-28,
.up-padding-left-28 {
  padding-left: 28rpx !important;
}
.u-m-t-28,
.up-m-t-28 {
  margin-top: 28rpx !important;
}
.u-p-t-28,
.up-p-t-28 {
  padding-top: 28rpx !important;
}
.u-margin-top-28,
.up-margin-top-28 {
  margin-top: 28rpx !important;
}
.u-padding-top-28,
.up-padding-top-28 {
  padding-top: 28rpx !important;
}
.u-m-r-28,
.up-m-r-28 {
  margin-right: 28rpx !important;
}
.u-p-r-28,
.up-p-r-28 {
  padding-right: 28rpx !important;
}
.u-margin-right-28,
.up-margin-right-28 {
  margin-right: 28rpx !important;
}
.u-padding-right-28,
.up-padding-right-28 {
  padding-right: 28rpx !important;
}
.u-m-b-28,
.up-m-b-28 {
  margin-bottom: 28rpx !important;
}
.u-p-b-28,
.up-p-b-28 {
  padding-bottom: 28rpx !important;
}
.u-margin-bottom-28,
.up-margin-bottom-28 {
  margin-bottom: 28rpx !important;
}
.u-padding-bottom-28,
.up-padding-bottom-28 {
  padding-bottom: 28rpx !important;
}
.u-margin-30,
.u-m-30,
.up-margin-30,
.up-m-30 {
  margin: 30rpx !important;
}
.u-padding-30,
.u-p-30,
.up-padding-30,
.up-p-30 {
  padding: 30rpx !important;
}
.u-m-l-30,
.up-m-l-30 {
  margin-left: 30rpx !important;
}
.u-p-l-30,
.up-p-l-30 {
  padding-left: 30rpx !important;
}
.u-margin-left-30,
.up-margin-left-30 {
  margin-left: 30rpx !important;
}
.u-padding-left-30,
.up-padding-left-30 {
  padding-left: 30rpx !important;
}
.u-m-t-30,
.up-m-t-30 {
  margin-top: 30rpx !important;
}
.u-p-t-30,
.up-p-t-30 {
  padding-top: 30rpx !important;
}
.u-margin-top-30,
.up-margin-top-30 {
  margin-top: 30rpx !important;
}
.u-padding-top-30,
.up-padding-top-30 {
  padding-top: 30rpx !important;
}
.u-m-r-30,
.up-m-r-30 {
  margin-right: 30rpx !important;
}
.u-p-r-30,
.up-p-r-30 {
  padding-right: 30rpx !important;
}
.u-margin-right-30,
.up-margin-right-30 {
  margin-right: 30rpx !important;
}
.u-padding-right-30,
.up-padding-right-30 {
  padding-right: 30rpx !important;
}
.u-m-b-30,
.up-m-b-30 {
  margin-bottom: 30rpx !important;
}
.u-p-b-30,
.up-p-b-30 {
  padding-bottom: 30rpx !important;
}
.u-margin-bottom-30,
.up-margin-bottom-30 {
  margin-bottom: 30rpx !important;
}
.u-padding-bottom-30,
.up-padding-bottom-30 {
  padding-bottom: 30rpx !important;
}
.u-margin-32,
.u-m-32,
.up-margin-32,
.up-m-32 {
  margin: 32rpx !important;
}
.u-padding-32,
.u-p-32,
.up-padding-32,
.up-p-32 {
  padding: 32rpx !important;
}
.u-m-l-32,
.up-m-l-32 {
  margin-left: 32rpx !important;
}
.u-p-l-32,
.up-p-l-32 {
  padding-left: 32rpx !important;
}
.u-margin-left-32,
.up-margin-left-32 {
  margin-left: 32rpx !important;
}
.u-padding-left-32,
.up-padding-left-32 {
  padding-left: 32rpx !important;
}
.u-m-t-32,
.up-m-t-32 {
  margin-top: 32rpx !important;
}
.u-p-t-32,
.up-p-t-32 {
  padding-top: 32rpx !important;
}
.u-margin-top-32,
.up-margin-top-32 {
  margin-top: 32rpx !important;
}
.u-padding-top-32,
.up-padding-top-32 {
  padding-top: 32rpx !important;
}
.u-m-r-32,
.up-m-r-32 {
  margin-right: 32rpx !important;
}
.u-p-r-32,
.up-p-r-32 {
  padding-right: 32rpx !important;
}
.u-margin-right-32,
.up-margin-right-32 {
  margin-right: 32rpx !important;
}
.u-padding-right-32,
.up-padding-right-32 {
  padding-right: 32rpx !important;
}
.u-m-b-32,
.up-m-b-32 {
  margin-bottom: 32rpx !important;
}
.u-p-b-32,
.up-p-b-32 {
  padding-bottom: 32rpx !important;
}
.u-margin-bottom-32,
.up-margin-bottom-32 {
  margin-bottom: 32rpx !important;
}
.u-padding-bottom-32,
.up-padding-bottom-32 {
  padding-bottom: 32rpx !important;
}
.u-margin-34,
.u-m-34,
.up-margin-34,
.up-m-34 {
  margin: 34rpx !important;
}
.u-padding-34,
.u-p-34,
.up-padding-34,
.up-p-34 {
  padding: 34rpx !important;
}
.u-m-l-34,
.up-m-l-34 {
  margin-left: 34rpx !important;
}
.u-p-l-34,
.up-p-l-34 {
  padding-left: 34rpx !important;
}
.u-margin-left-34,
.up-margin-left-34 {
  margin-left: 34rpx !important;
}
.u-padding-left-34,
.up-padding-left-34 {
  padding-left: 34rpx !important;
}
.u-m-t-34,
.up-m-t-34 {
  margin-top: 34rpx !important;
}
.u-p-t-34,
.up-p-t-34 {
  padding-top: 34rpx !important;
}
.u-margin-top-34,
.up-margin-top-34 {
  margin-top: 34rpx !important;
}
.u-padding-top-34,
.up-padding-top-34 {
  padding-top: 34rpx !important;
}
.u-m-r-34,
.up-m-r-34 {
  margin-right: 34rpx !important;
}
.u-p-r-34,
.up-p-r-34 {
  padding-right: 34rpx !important;
}
.u-margin-right-34,
.up-margin-right-34 {
  margin-right: 34rpx !important;
}
.u-padding-right-34,
.up-padding-right-34 {
  padding-right: 34rpx !important;
}
.u-m-b-34,
.up-m-b-34 {
  margin-bottom: 34rpx !important;
}
.u-p-b-34,
.up-p-b-34 {
  padding-bottom: 34rpx !important;
}
.u-margin-bottom-34,
.up-margin-bottom-34 {
  margin-bottom: 34rpx !important;
}
.u-padding-bottom-34,
.up-padding-bottom-34 {
  padding-bottom: 34rpx !important;
}
.u-margin-35,
.u-m-35,
.up-margin-35,
.up-m-35 {
  margin: 35rpx !important;
}
.u-padding-35,
.u-p-35,
.up-padding-35,
.up-p-35 {
  padding: 35rpx !important;
}
.u-m-l-35,
.up-m-l-35 {
  margin-left: 35rpx !important;
}
.u-p-l-35,
.up-p-l-35 {
  padding-left: 35rpx !important;
}
.u-margin-left-35,
.up-margin-left-35 {
  margin-left: 35rpx !important;
}
.u-padding-left-35,
.up-padding-left-35 {
  padding-left: 35rpx !important;
}
.u-m-t-35,
.up-m-t-35 {
  margin-top: 35rpx !important;
}
.u-p-t-35,
.up-p-t-35 {
  padding-top: 35rpx !important;
}
.u-margin-top-35,
.up-margin-top-35 {
  margin-top: 35rpx !important;
}
.u-padding-top-35,
.up-padding-top-35 {
  padding-top: 35rpx !important;
}
.u-m-r-35,
.up-m-r-35 {
  margin-right: 35rpx !important;
}
.u-p-r-35,
.up-p-r-35 {
  padding-right: 35rpx !important;
}
.u-margin-right-35,
.up-margin-right-35 {
  margin-right: 35rpx !important;
}
.u-padding-right-35,
.up-padding-right-35 {
  padding-right: 35rpx !important;
}
.u-m-b-35,
.up-m-b-35 {
  margin-bottom: 35rpx !important;
}
.u-p-b-35,
.up-p-b-35 {
  padding-bottom: 35rpx !important;
}
.u-margin-bottom-35,
.up-margin-bottom-35 {
  margin-bottom: 35rpx !important;
}
.u-padding-bottom-35,
.up-padding-bottom-35 {
  padding-bottom: 35rpx !important;
}
.u-margin-36,
.u-m-36,
.up-margin-36,
.up-m-36 {
  margin: 36rpx !important;
}
.u-padding-36,
.u-p-36,
.up-padding-36,
.up-p-36 {
  padding: 36rpx !important;
}
.u-m-l-36,
.up-m-l-36 {
  margin-left: 36rpx !important;
}
.u-p-l-36,
.up-p-l-36 {
  padding-left: 36rpx !important;
}
.u-margin-left-36,
.up-margin-left-36 {
  margin-left: 36rpx !important;
}
.u-padding-left-36,
.up-padding-left-36 {
  padding-left: 36rpx !important;
}
.u-m-t-36,
.up-m-t-36 {
  margin-top: 36rpx !important;
}
.u-p-t-36,
.up-p-t-36 {
  padding-top: 36rpx !important;
}
.u-margin-top-36,
.up-margin-top-36 {
  margin-top: 36rpx !important;
}
.u-padding-top-36,
.up-padding-top-36 {
  padding-top: 36rpx !important;
}
.u-m-r-36,
.up-m-r-36 {
  margin-right: 36rpx !important;
}
.u-p-r-36,
.up-p-r-36 {
  padding-right: 36rpx !important;
}
.u-margin-right-36,
.up-margin-right-36 {
  margin-right: 36rpx !important;
}
.u-padding-right-36,
.up-padding-right-36 {
  padding-right: 36rpx !important;
}
.u-m-b-36,
.up-m-b-36 {
  margin-bottom: 36rpx !important;
}
.u-p-b-36,
.up-p-b-36 {
  padding-bottom: 36rpx !important;
}
.u-margin-bottom-36,
.up-margin-bottom-36 {
  margin-bottom: 36rpx !important;
}
.u-padding-bottom-36,
.up-padding-bottom-36 {
  padding-bottom: 36rpx !important;
}
.u-margin-38,
.u-m-38,
.up-margin-38,
.up-m-38 {
  margin: 38rpx !important;
}
.u-padding-38,
.u-p-38,
.up-padding-38,
.up-p-38 {
  padding: 38rpx !important;
}
.u-m-l-38,
.up-m-l-38 {
  margin-left: 38rpx !important;
}
.u-p-l-38,
.up-p-l-38 {
  padding-left: 38rpx !important;
}
.u-margin-left-38,
.up-margin-left-38 {
  margin-left: 38rpx !important;
}
.u-padding-left-38,
.up-padding-left-38 {
  padding-left: 38rpx !important;
}
.u-m-t-38,
.up-m-t-38 {
  margin-top: 38rpx !important;
}
.u-p-t-38,
.up-p-t-38 {
  padding-top: 38rpx !important;
}
.u-margin-top-38,
.up-margin-top-38 {
  margin-top: 38rpx !important;
}
.u-padding-top-38,
.up-padding-top-38 {
  padding-top: 38rpx !important;
}
.u-m-r-38,
.up-m-r-38 {
  margin-right: 38rpx !important;
}
.u-p-r-38,
.up-p-r-38 {
  padding-right: 38rpx !important;
}
.u-margin-right-38,
.up-margin-right-38 {
  margin-right: 38rpx !important;
}
.u-padding-right-38,
.up-padding-right-38 {
  padding-right: 38rpx !important;
}
.u-m-b-38,
.up-m-b-38 {
  margin-bottom: 38rpx !important;
}
.u-p-b-38,
.up-p-b-38 {
  padding-bottom: 38rpx !important;
}
.u-margin-bottom-38,
.up-margin-bottom-38 {
  margin-bottom: 38rpx !important;
}
.u-padding-bottom-38,
.up-padding-bottom-38 {
  padding-bottom: 38rpx !important;
}
.u-margin-40,
.u-m-40,
.up-margin-40,
.up-m-40 {
  margin: 40rpx !important;
}
.u-padding-40,
.u-p-40,
.up-padding-40,
.up-p-40 {
  padding: 40rpx !important;
}
.u-m-l-40,
.up-m-l-40 {
  margin-left: 40rpx !important;
}
.u-p-l-40,
.up-p-l-40 {
  padding-left: 40rpx !important;
}
.u-margin-left-40,
.up-margin-left-40 {
  margin-left: 40rpx !important;
}
.u-padding-left-40,
.up-padding-left-40 {
  padding-left: 40rpx !important;
}
.u-m-t-40,
.up-m-t-40 {
  margin-top: 40rpx !important;
}
.u-p-t-40,
.up-p-t-40 {
  padding-top: 40rpx !important;
}
.u-margin-top-40,
.up-margin-top-40 {
  margin-top: 40rpx !important;
}
.u-padding-top-40,
.up-padding-top-40 {
  padding-top: 40rpx !important;
}
.u-m-r-40,
.up-m-r-40 {
  margin-right: 40rpx !important;
}
.u-p-r-40,
.up-p-r-40 {
  padding-right: 40rpx !important;
}
.u-margin-right-40,
.up-margin-right-40 {
  margin-right: 40rpx !important;
}
.u-padding-right-40,
.up-padding-right-40 {
  padding-right: 40rpx !important;
}
.u-m-b-40,
.up-m-b-40 {
  margin-bottom: 40rpx !important;
}
.u-p-b-40,
.up-p-b-40 {
  padding-bottom: 40rpx !important;
}
.u-margin-bottom-40,
.up-margin-bottom-40 {
  margin-bottom: 40rpx !important;
}
.u-padding-bottom-40,
.up-padding-bottom-40 {
  padding-bottom: 40rpx !important;
}
.u-margin-42,
.u-m-42,
.up-margin-42,
.up-m-42 {
  margin: 42rpx !important;
}
.u-padding-42,
.u-p-42,
.up-padding-42,
.up-p-42 {
  padding: 42rpx !important;
}
.u-m-l-42,
.up-m-l-42 {
  margin-left: 42rpx !important;
}
.u-p-l-42,
.up-p-l-42 {
  padding-left: 42rpx !important;
}
.u-margin-left-42,
.up-margin-left-42 {
  margin-left: 42rpx !important;
}
.u-padding-left-42,
.up-padding-left-42 {
  padding-left: 42rpx !important;
}
.u-m-t-42,
.up-m-t-42 {
  margin-top: 42rpx !important;
}
.u-p-t-42,
.up-p-t-42 {
  padding-top: 42rpx !important;
}
.u-margin-top-42,
.up-margin-top-42 {
  margin-top: 42rpx !important;
}
.u-padding-top-42,
.up-padding-top-42 {
  padding-top: 42rpx !important;
}
.u-m-r-42,
.up-m-r-42 {
  margin-right: 42rpx !important;
}
.u-p-r-42,
.up-p-r-42 {
  padding-right: 42rpx !important;
}
.u-margin-right-42,
.up-margin-right-42 {
  margin-right: 42rpx !important;
}
.u-padding-right-42,
.up-padding-right-42 {
  padding-right: 42rpx !important;
}
.u-m-b-42,
.up-m-b-42 {
  margin-bottom: 42rpx !important;
}
.u-p-b-42,
.up-p-b-42 {
  padding-bottom: 42rpx !important;
}
.u-margin-bottom-42,
.up-margin-bottom-42 {
  margin-bottom: 42rpx !important;
}
.u-padding-bottom-42,
.up-padding-bottom-42 {
  padding-bottom: 42rpx !important;
}
.u-margin-44,
.u-m-44,
.up-margin-44,
.up-m-44 {
  margin: 44rpx !important;
}
.u-padding-44,
.u-p-44,
.up-padding-44,
.up-p-44 {
  padding: 44rpx !important;
}
.u-m-l-44,
.up-m-l-44 {
  margin-left: 44rpx !important;
}
.u-p-l-44,
.up-p-l-44 {
  padding-left: 44rpx !important;
}
.u-margin-left-44,
.up-margin-left-44 {
  margin-left: 44rpx !important;
}
.u-padding-left-44,
.up-padding-left-44 {
  padding-left: 44rpx !important;
}
.u-m-t-44,
.up-m-t-44 {
  margin-top: 44rpx !important;
}
.u-p-t-44,
.up-p-t-44 {
  padding-top: 44rpx !important;
}
.u-margin-top-44,
.up-margin-top-44 {
  margin-top: 44rpx !important;
}
.u-padding-top-44,
.up-padding-top-44 {
  padding-top: 44rpx !important;
}
.u-m-r-44,
.up-m-r-44 {
  margin-right: 44rpx !important;
}
.u-p-r-44,
.up-p-r-44 {
  padding-right: 44rpx !important;
}
.u-margin-right-44,
.up-margin-right-44 {
  margin-right: 44rpx !important;
}
.u-padding-right-44,
.up-padding-right-44 {
  padding-right: 44rpx !important;
}
.u-m-b-44,
.up-m-b-44 {
  margin-bottom: 44rpx !important;
}
.u-p-b-44,
.up-p-b-44 {
  padding-bottom: 44rpx !important;
}
.u-margin-bottom-44,
.up-margin-bottom-44 {
  margin-bottom: 44rpx !important;
}
.u-padding-bottom-44,
.up-padding-bottom-44 {
  padding-bottom: 44rpx !important;
}
.u-margin-45,
.u-m-45,
.up-margin-45,
.up-m-45 {
  margin: 45rpx !important;
}
.u-padding-45,
.u-p-45,
.up-padding-45,
.up-p-45 {
  padding: 45rpx !important;
}
.u-m-l-45,
.up-m-l-45 {
  margin-left: 45rpx !important;
}
.u-p-l-45,
.up-p-l-45 {
  padding-left: 45rpx !important;
}
.u-margin-left-45,
.up-margin-left-45 {
  margin-left: 45rpx !important;
}
.u-padding-left-45,
.up-padding-left-45 {
  padding-left: 45rpx !important;
}
.u-m-t-45,
.up-m-t-45 {
  margin-top: 45rpx !important;
}
.u-p-t-45,
.up-p-t-45 {
  padding-top: 45rpx !important;
}
.u-margin-top-45,
.up-margin-top-45 {
  margin-top: 45rpx !important;
}
.u-padding-top-45,
.up-padding-top-45 {
  padding-top: 45rpx !important;
}
.u-m-r-45,
.up-m-r-45 {
  margin-right: 45rpx !important;
}
.u-p-r-45,
.up-p-r-45 {
  padding-right: 45rpx !important;
}
.u-margin-right-45,
.up-margin-right-45 {
  margin-right: 45rpx !important;
}
.u-padding-right-45,
.up-padding-right-45 {
  padding-right: 45rpx !important;
}
.u-m-b-45,
.up-m-b-45 {
  margin-bottom: 45rpx !important;
}
.u-p-b-45,
.up-p-b-45 {
  padding-bottom: 45rpx !important;
}
.u-margin-bottom-45,
.up-margin-bottom-45 {
  margin-bottom: 45rpx !important;
}
.u-padding-bottom-45,
.up-padding-bottom-45 {
  padding-bottom: 45rpx !important;
}
.u-margin-46,
.u-m-46,
.up-margin-46,
.up-m-46 {
  margin: 46rpx !important;
}
.u-padding-46,
.u-p-46,
.up-padding-46,
.up-p-46 {
  padding: 46rpx !important;
}
.u-m-l-46,
.up-m-l-46 {
  margin-left: 46rpx !important;
}
.u-p-l-46,
.up-p-l-46 {
  padding-left: 46rpx !important;
}
.u-margin-left-46,
.up-margin-left-46 {
  margin-left: 46rpx !important;
}
.u-padding-left-46,
.up-padding-left-46 {
  padding-left: 46rpx !important;
}
.u-m-t-46,
.up-m-t-46 {
  margin-top: 46rpx !important;
}
.u-p-t-46,
.up-p-t-46 {
  padding-top: 46rpx !important;
}
.u-margin-top-46,
.up-margin-top-46 {
  margin-top: 46rpx !important;
}
.u-padding-top-46,
.up-padding-top-46 {
  padding-top: 46rpx !important;
}
.u-m-r-46,
.up-m-r-46 {
  margin-right: 46rpx !important;
}
.u-p-r-46,
.up-p-r-46 {
  padding-right: 46rpx !important;
}
.u-margin-right-46,
.up-margin-right-46 {
  margin-right: 46rpx !important;
}
.u-padding-right-46,
.up-padding-right-46 {
  padding-right: 46rpx !important;
}
.u-m-b-46,
.up-m-b-46 {
  margin-bottom: 46rpx !important;
}
.u-p-b-46,
.up-p-b-46 {
  padding-bottom: 46rpx !important;
}
.u-margin-bottom-46,
.up-margin-bottom-46 {
  margin-bottom: 46rpx !important;
}
.u-padding-bottom-46,
.up-padding-bottom-46 {
  padding-bottom: 46rpx !important;
}
.u-margin-48,
.u-m-48,
.up-margin-48,
.up-m-48 {
  margin: 48rpx !important;
}
.u-padding-48,
.u-p-48,
.up-padding-48,
.up-p-48 {
  padding: 48rpx !important;
}
.u-m-l-48,
.up-m-l-48 {
  margin-left: 48rpx !important;
}
.u-p-l-48,
.up-p-l-48 {
  padding-left: 48rpx !important;
}
.u-margin-left-48,
.up-margin-left-48 {
  margin-left: 48rpx !important;
}
.u-padding-left-48,
.up-padding-left-48 {
  padding-left: 48rpx !important;
}
.u-m-t-48,
.up-m-t-48 {
  margin-top: 48rpx !important;
}
.u-p-t-48,
.up-p-t-48 {
  padding-top: 48rpx !important;
}
.u-margin-top-48,
.up-margin-top-48 {
  margin-top: 48rpx !important;
}
.u-padding-top-48,
.up-padding-top-48 {
  padding-top: 48rpx !important;
}
.u-m-r-48,
.up-m-r-48 {
  margin-right: 48rpx !important;
}
.u-p-r-48,
.up-p-r-48 {
  padding-right: 48rpx !important;
}
.u-margin-right-48,
.up-margin-right-48 {
  margin-right: 48rpx !important;
}
.u-padding-right-48,
.up-padding-right-48 {
  padding-right: 48rpx !important;
}
.u-m-b-48,
.up-m-b-48 {
  margin-bottom: 48rpx !important;
}
.u-p-b-48,
.up-p-b-48 {
  padding-bottom: 48rpx !important;
}
.u-margin-bottom-48,
.up-margin-bottom-48 {
  margin-bottom: 48rpx !important;
}
.u-padding-bottom-48,
.up-padding-bottom-48 {
  padding-bottom: 48rpx !important;
}
.u-margin-50,
.u-m-50,
.up-margin-50,
.up-m-50 {
  margin: 50rpx !important;
}
.u-padding-50,
.u-p-50,
.up-padding-50,
.up-p-50 {
  padding: 50rpx !important;
}
.u-m-l-50,
.up-m-l-50 {
  margin-left: 50rpx !important;
}
.u-p-l-50,
.up-p-l-50 {
  padding-left: 50rpx !important;
}
.u-margin-left-50,
.up-margin-left-50 {
  margin-left: 50rpx !important;
}
.u-padding-left-50,
.up-padding-left-50 {
  padding-left: 50rpx !important;
}
.u-m-t-50,
.up-m-t-50 {
  margin-top: 50rpx !important;
}
.u-p-t-50,
.up-p-t-50 {
  padding-top: 50rpx !important;
}
.u-margin-top-50,
.up-margin-top-50 {
  margin-top: 50rpx !important;
}
.u-padding-top-50,
.up-padding-top-50 {
  padding-top: 50rpx !important;
}
.u-m-r-50,
.up-m-r-50 {
  margin-right: 50rpx !important;
}
.u-p-r-50,
.up-p-r-50 {
  padding-right: 50rpx !important;
}
.u-margin-right-50,
.up-margin-right-50 {
  margin-right: 50rpx !important;
}
.u-padding-right-50,
.up-padding-right-50 {
  padding-right: 50rpx !important;
}
.u-m-b-50,
.up-m-b-50 {
  margin-bottom: 50rpx !important;
}
.u-p-b-50,
.up-p-b-50 {
  padding-bottom: 50rpx !important;
}
.u-margin-bottom-50,
.up-margin-bottom-50 {
  margin-bottom: 50rpx !important;
}
.u-padding-bottom-50,
.up-padding-bottom-50 {
  padding-bottom: 50rpx !important;
}
.u-margin-52,
.u-m-52,
.up-margin-52,
.up-m-52 {
  margin: 52rpx !important;
}
.u-padding-52,
.u-p-52,
.up-padding-52,
.up-p-52 {
  padding: 52rpx !important;
}
.u-m-l-52,
.up-m-l-52 {
  margin-left: 52rpx !important;
}
.u-p-l-52,
.up-p-l-52 {
  padding-left: 52rpx !important;
}
.u-margin-left-52,
.up-margin-left-52 {
  margin-left: 52rpx !important;
}
.u-padding-left-52,
.up-padding-left-52 {
  padding-left: 52rpx !important;
}
.u-m-t-52,
.up-m-t-52 {
  margin-top: 52rpx !important;
}
.u-p-t-52,
.up-p-t-52 {
  padding-top: 52rpx !important;
}
.u-margin-top-52,
.up-margin-top-52 {
  margin-top: 52rpx !important;
}
.u-padding-top-52,
.up-padding-top-52 {
  padding-top: 52rpx !important;
}
.u-m-r-52,
.up-m-r-52 {
  margin-right: 52rpx !important;
}
.u-p-r-52,
.up-p-r-52 {
  padding-right: 52rpx !important;
}
.u-margin-right-52,
.up-margin-right-52 {
  margin-right: 52rpx !important;
}
.u-padding-right-52,
.up-padding-right-52 {
  padding-right: 52rpx !important;
}
.u-m-b-52,
.up-m-b-52 {
  margin-bottom: 52rpx !important;
}
.u-p-b-52,
.up-p-b-52 {
  padding-bottom: 52rpx !important;
}
.u-margin-bottom-52,
.up-margin-bottom-52 {
  margin-bottom: 52rpx !important;
}
.u-padding-bottom-52,
.up-padding-bottom-52 {
  padding-bottom: 52rpx !important;
}
.u-margin-54,
.u-m-54,
.up-margin-54,
.up-m-54 {
  margin: 54rpx !important;
}
.u-padding-54,
.u-p-54,
.up-padding-54,
.up-p-54 {
  padding: 54rpx !important;
}
.u-m-l-54,
.up-m-l-54 {
  margin-left: 54rpx !important;
}
.u-p-l-54,
.up-p-l-54 {
  padding-left: 54rpx !important;
}
.u-margin-left-54,
.up-margin-left-54 {
  margin-left: 54rpx !important;
}
.u-padding-left-54,
.up-padding-left-54 {
  padding-left: 54rpx !important;
}
.u-m-t-54,
.up-m-t-54 {
  margin-top: 54rpx !important;
}
.u-p-t-54,
.up-p-t-54 {
  padding-top: 54rpx !important;
}
.u-margin-top-54,
.up-margin-top-54 {
  margin-top: 54rpx !important;
}
.u-padding-top-54,
.up-padding-top-54 {
  padding-top: 54rpx !important;
}
.u-m-r-54,
.up-m-r-54 {
  margin-right: 54rpx !important;
}
.u-p-r-54,
.up-p-r-54 {
  padding-right: 54rpx !important;
}
.u-margin-right-54,
.up-margin-right-54 {
  margin-right: 54rpx !important;
}
.u-padding-right-54,
.up-padding-right-54 {
  padding-right: 54rpx !important;
}
.u-m-b-54,
.up-m-b-54 {
  margin-bottom: 54rpx !important;
}
.u-p-b-54,
.up-p-b-54 {
  padding-bottom: 54rpx !important;
}
.u-margin-bottom-54,
.up-margin-bottom-54 {
  margin-bottom: 54rpx !important;
}
.u-padding-bottom-54,
.up-padding-bottom-54 {
  padding-bottom: 54rpx !important;
}
.u-margin-55,
.u-m-55,
.up-margin-55,
.up-m-55 {
  margin: 55rpx !important;
}
.u-padding-55,
.u-p-55,
.up-padding-55,
.up-p-55 {
  padding: 55rpx !important;
}
.u-m-l-55,
.up-m-l-55 {
  margin-left: 55rpx !important;
}
.u-p-l-55,
.up-p-l-55 {
  padding-left: 55rpx !important;
}
.u-margin-left-55,
.up-margin-left-55 {
  margin-left: 55rpx !important;
}
.u-padding-left-55,
.up-padding-left-55 {
  padding-left: 55rpx !important;
}
.u-m-t-55,
.up-m-t-55 {
  margin-top: 55rpx !important;
}
.u-p-t-55,
.up-p-t-55 {
  padding-top: 55rpx !important;
}
.u-margin-top-55,
.up-margin-top-55 {
  margin-top: 55rpx !important;
}
.u-padding-top-55,
.up-padding-top-55 {
  padding-top: 55rpx !important;
}
.u-m-r-55,
.up-m-r-55 {
  margin-right: 55rpx !important;
}
.u-p-r-55,
.up-p-r-55 {
  padding-right: 55rpx !important;
}
.u-margin-right-55,
.up-margin-right-55 {
  margin-right: 55rpx !important;
}
.u-padding-right-55,
.up-padding-right-55 {
  padding-right: 55rpx !important;
}
.u-m-b-55,
.up-m-b-55 {
  margin-bottom: 55rpx !important;
}
.u-p-b-55,
.up-p-b-55 {
  padding-bottom: 55rpx !important;
}
.u-margin-bottom-55,
.up-margin-bottom-55 {
  margin-bottom: 55rpx !important;
}
.u-padding-bottom-55,
.up-padding-bottom-55 {
  padding-bottom: 55rpx !important;
}
.u-margin-56,
.u-m-56,
.up-margin-56,
.up-m-56 {
  margin: 56rpx !important;
}
.u-padding-56,
.u-p-56,
.up-padding-56,
.up-p-56 {
  padding: 56rpx !important;
}
.u-m-l-56,
.up-m-l-56 {
  margin-left: 56rpx !important;
}
.u-p-l-56,
.up-p-l-56 {
  padding-left: 56rpx !important;
}
.u-margin-left-56,
.up-margin-left-56 {
  margin-left: 56rpx !important;
}
.u-padding-left-56,
.up-padding-left-56 {
  padding-left: 56rpx !important;
}
.u-m-t-56,
.up-m-t-56 {
  margin-top: 56rpx !important;
}
.u-p-t-56,
.up-p-t-56 {
  padding-top: 56rpx !important;
}
.u-margin-top-56,
.up-margin-top-56 {
  margin-top: 56rpx !important;
}
.u-padding-top-56,
.up-padding-top-56 {
  padding-top: 56rpx !important;
}
.u-m-r-56,
.up-m-r-56 {
  margin-right: 56rpx !important;
}
.u-p-r-56,
.up-p-r-56 {
  padding-right: 56rpx !important;
}
.u-margin-right-56,
.up-margin-right-56 {
  margin-right: 56rpx !important;
}
.u-padding-right-56,
.up-padding-right-56 {
  padding-right: 56rpx !important;
}
.u-m-b-56,
.up-m-b-56 {
  margin-bottom: 56rpx !important;
}
.u-p-b-56,
.up-p-b-56 {
  padding-bottom: 56rpx !important;
}
.u-margin-bottom-56,
.up-margin-bottom-56 {
  margin-bottom: 56rpx !important;
}
.u-padding-bottom-56,
.up-padding-bottom-56 {
  padding-bottom: 56rpx !important;
}
.u-margin-58,
.u-m-58,
.up-margin-58,
.up-m-58 {
  margin: 58rpx !important;
}
.u-padding-58,
.u-p-58,
.up-padding-58,
.up-p-58 {
  padding: 58rpx !important;
}
.u-m-l-58,
.up-m-l-58 {
  margin-left: 58rpx !important;
}
.u-p-l-58,
.up-p-l-58 {
  padding-left: 58rpx !important;
}
.u-margin-left-58,
.up-margin-left-58 {
  margin-left: 58rpx !important;
}
.u-padding-left-58,
.up-padding-left-58 {
  padding-left: 58rpx !important;
}
.u-m-t-58,
.up-m-t-58 {
  margin-top: 58rpx !important;
}
.u-p-t-58,
.up-p-t-58 {
  padding-top: 58rpx !important;
}
.u-margin-top-58,
.up-margin-top-58 {
  margin-top: 58rpx !important;
}
.u-padding-top-58,
.up-padding-top-58 {
  padding-top: 58rpx !important;
}
.u-m-r-58,
.up-m-r-58 {
  margin-right: 58rpx !important;
}
.u-p-r-58,
.up-p-r-58 {
  padding-right: 58rpx !important;
}
.u-margin-right-58,
.up-margin-right-58 {
  margin-right: 58rpx !important;
}
.u-padding-right-58,
.up-padding-right-58 {
  padding-right: 58rpx !important;
}
.u-m-b-58,
.up-m-b-58 {
  margin-bottom: 58rpx !important;
}
.u-p-b-58,
.up-p-b-58 {
  padding-bottom: 58rpx !important;
}
.u-margin-bottom-58,
.up-margin-bottom-58 {
  margin-bottom: 58rpx !important;
}
.u-padding-bottom-58,
.up-padding-bottom-58 {
  padding-bottom: 58rpx !important;
}
.u-margin-60,
.u-m-60,
.up-margin-60,
.up-m-60 {
  margin: 60rpx !important;
}
.u-padding-60,
.u-p-60,
.up-padding-60,
.up-p-60 {
  padding: 60rpx !important;
}
.u-m-l-60,
.up-m-l-60 {
  margin-left: 60rpx !important;
}
.u-p-l-60,
.up-p-l-60 {
  padding-left: 60rpx !important;
}
.u-margin-left-60,
.up-margin-left-60 {
  margin-left: 60rpx !important;
}
.u-padding-left-60,
.up-padding-left-60 {
  padding-left: 60rpx !important;
}
.u-m-t-60,
.up-m-t-60 {
  margin-top: 60rpx !important;
}
.u-p-t-60,
.up-p-t-60 {
  padding-top: 60rpx !important;
}
.u-margin-top-60,
.up-margin-top-60 {
  margin-top: 60rpx !important;
}
.u-padding-top-60,
.up-padding-top-60 {
  padding-top: 60rpx !important;
}
.u-m-r-60,
.up-m-r-60 {
  margin-right: 60rpx !important;
}
.u-p-r-60,
.up-p-r-60 {
  padding-right: 60rpx !important;
}
.u-margin-right-60,
.up-margin-right-60 {
  margin-right: 60rpx !important;
}
.u-padding-right-60,
.up-padding-right-60 {
  padding-right: 60rpx !important;
}
.u-m-b-60,
.up-m-b-60 {
  margin-bottom: 60rpx !important;
}
.u-p-b-60,
.up-p-b-60 {
  padding-bottom: 60rpx !important;
}
.u-margin-bottom-60,
.up-margin-bottom-60 {
  margin-bottom: 60rpx !important;
}
.u-padding-bottom-60,
.up-padding-bottom-60 {
  padding-bottom: 60rpx !important;
}
.u-margin-62,
.u-m-62,
.up-margin-62,
.up-m-62 {
  margin: 62rpx !important;
}
.u-padding-62,
.u-p-62,
.up-padding-62,
.up-p-62 {
  padding: 62rpx !important;
}
.u-m-l-62,
.up-m-l-62 {
  margin-left: 62rpx !important;
}
.u-p-l-62,
.up-p-l-62 {
  padding-left: 62rpx !important;
}
.u-margin-left-62,
.up-margin-left-62 {
  margin-left: 62rpx !important;
}
.u-padding-left-62,
.up-padding-left-62 {
  padding-left: 62rpx !important;
}
.u-m-t-62,
.up-m-t-62 {
  margin-top: 62rpx !important;
}
.u-p-t-62,
.up-p-t-62 {
  padding-top: 62rpx !important;
}
.u-margin-top-62,
.up-margin-top-62 {
  margin-top: 62rpx !important;
}
.u-padding-top-62,
.up-padding-top-62 {
  padding-top: 62rpx !important;
}
.u-m-r-62,
.up-m-r-62 {
  margin-right: 62rpx !important;
}
.u-p-r-62,
.up-p-r-62 {
  padding-right: 62rpx !important;
}
.u-margin-right-62,
.up-margin-right-62 {
  margin-right: 62rpx !important;
}
.u-padding-right-62,
.up-padding-right-62 {
  padding-right: 62rpx !important;
}
.u-m-b-62,
.up-m-b-62 {
  margin-bottom: 62rpx !important;
}
.u-p-b-62,
.up-p-b-62 {
  padding-bottom: 62rpx !important;
}
.u-margin-bottom-62,
.up-margin-bottom-62 {
  margin-bottom: 62rpx !important;
}
.u-padding-bottom-62,
.up-padding-bottom-62 {
  padding-bottom: 62rpx !important;
}
.u-margin-64,
.u-m-64,
.up-margin-64,
.up-m-64 {
  margin: 64rpx !important;
}
.u-padding-64,
.u-p-64,
.up-padding-64,
.up-p-64 {
  padding: 64rpx !important;
}
.u-m-l-64,
.up-m-l-64 {
  margin-left: 64rpx !important;
}
.u-p-l-64,
.up-p-l-64 {
  padding-left: 64rpx !important;
}
.u-margin-left-64,
.up-margin-left-64 {
  margin-left: 64rpx !important;
}
.u-padding-left-64,
.up-padding-left-64 {
  padding-left: 64rpx !important;
}
.u-m-t-64,
.up-m-t-64 {
  margin-top: 64rpx !important;
}
.u-p-t-64,
.up-p-t-64 {
  padding-top: 64rpx !important;
}
.u-margin-top-64,
.up-margin-top-64 {
  margin-top: 64rpx !important;
}
.u-padding-top-64,
.up-padding-top-64 {
  padding-top: 64rpx !important;
}
.u-m-r-64,
.up-m-r-64 {
  margin-right: 64rpx !important;
}
.u-p-r-64,
.up-p-r-64 {
  padding-right: 64rpx !important;
}
.u-margin-right-64,
.up-margin-right-64 {
  margin-right: 64rpx !important;
}
.u-padding-right-64,
.up-padding-right-64 {
  padding-right: 64rpx !important;
}
.u-m-b-64,
.up-m-b-64 {
  margin-bottom: 64rpx !important;
}
.u-p-b-64,
.up-p-b-64 {
  padding-bottom: 64rpx !important;
}
.u-margin-bottom-64,
.up-margin-bottom-64 {
  margin-bottom: 64rpx !important;
}
.u-padding-bottom-64,
.up-padding-bottom-64 {
  padding-bottom: 64rpx !important;
}
.u-margin-65,
.u-m-65,
.up-margin-65,
.up-m-65 {
  margin: 65rpx !important;
}
.u-padding-65,
.u-p-65,
.up-padding-65,
.up-p-65 {
  padding: 65rpx !important;
}
.u-m-l-65,
.up-m-l-65 {
  margin-left: 65rpx !important;
}
.u-p-l-65,
.up-p-l-65 {
  padding-left: 65rpx !important;
}
.u-margin-left-65,
.up-margin-left-65 {
  margin-left: 65rpx !important;
}
.u-padding-left-65,
.up-padding-left-65 {
  padding-left: 65rpx !important;
}
.u-m-t-65,
.up-m-t-65 {
  margin-top: 65rpx !important;
}
.u-p-t-65,
.up-p-t-65 {
  padding-top: 65rpx !important;
}
.u-margin-top-65,
.up-margin-top-65 {
  margin-top: 65rpx !important;
}
.u-padding-top-65,
.up-padding-top-65 {
  padding-top: 65rpx !important;
}
.u-m-r-65,
.up-m-r-65 {
  margin-right: 65rpx !important;
}
.u-p-r-65,
.up-p-r-65 {
  padding-right: 65rpx !important;
}
.u-margin-right-65,
.up-margin-right-65 {
  margin-right: 65rpx !important;
}
.u-padding-right-65,
.up-padding-right-65 {
  padding-right: 65rpx !important;
}
.u-m-b-65,
.up-m-b-65 {
  margin-bottom: 65rpx !important;
}
.u-p-b-65,
.up-p-b-65 {
  padding-bottom: 65rpx !important;
}
.u-margin-bottom-65,
.up-margin-bottom-65 {
  margin-bottom: 65rpx !important;
}
.u-padding-bottom-65,
.up-padding-bottom-65 {
  padding-bottom: 65rpx !important;
}
.u-margin-66,
.u-m-66,
.up-margin-66,
.up-m-66 {
  margin: 66rpx !important;
}
.u-padding-66,
.u-p-66,
.up-padding-66,
.up-p-66 {
  padding: 66rpx !important;
}
.u-m-l-66,
.up-m-l-66 {
  margin-left: 66rpx !important;
}
.u-p-l-66,
.up-p-l-66 {
  padding-left: 66rpx !important;
}
.u-margin-left-66,
.up-margin-left-66 {
  margin-left: 66rpx !important;
}
.u-padding-left-66,
.up-padding-left-66 {
  padding-left: 66rpx !important;
}
.u-m-t-66,
.up-m-t-66 {
  margin-top: 66rpx !important;
}
.u-p-t-66,
.up-p-t-66 {
  padding-top: 66rpx !important;
}
.u-margin-top-66,
.up-margin-top-66 {
  margin-top: 66rpx !important;
}
.u-padding-top-66,
.up-padding-top-66 {
  padding-top: 66rpx !important;
}
.u-m-r-66,
.up-m-r-66 {
  margin-right: 66rpx !important;
}
.u-p-r-66,
.up-p-r-66 {
  padding-right: 66rpx !important;
}
.u-margin-right-66,
.up-margin-right-66 {
  margin-right: 66rpx !important;
}
.u-padding-right-66,
.up-padding-right-66 {
  padding-right: 66rpx !important;
}
.u-m-b-66,
.up-m-b-66 {
  margin-bottom: 66rpx !important;
}
.u-p-b-66,
.up-p-b-66 {
  padding-bottom: 66rpx !important;
}
.u-margin-bottom-66,
.up-margin-bottom-66 {
  margin-bottom: 66rpx !important;
}
.u-padding-bottom-66,
.up-padding-bottom-66 {
  padding-bottom: 66rpx !important;
}
.u-margin-68,
.u-m-68,
.up-margin-68,
.up-m-68 {
  margin: 68rpx !important;
}
.u-padding-68,
.u-p-68,
.up-padding-68,
.up-p-68 {
  padding: 68rpx !important;
}
.u-m-l-68,
.up-m-l-68 {
  margin-left: 68rpx !important;
}
.u-p-l-68,
.up-p-l-68 {
  padding-left: 68rpx !important;
}
.u-margin-left-68,
.up-margin-left-68 {
  margin-left: 68rpx !important;
}
.u-padding-left-68,
.up-padding-left-68 {
  padding-left: 68rpx !important;
}
.u-m-t-68,
.up-m-t-68 {
  margin-top: 68rpx !important;
}
.u-p-t-68,
.up-p-t-68 {
  padding-top: 68rpx !important;
}
.u-margin-top-68,
.up-margin-top-68 {
  margin-top: 68rpx !important;
}
.u-padding-top-68,
.up-padding-top-68 {
  padding-top: 68rpx !important;
}
.u-m-r-68,
.up-m-r-68 {
  margin-right: 68rpx !important;
}
.u-p-r-68,
.up-p-r-68 {
  padding-right: 68rpx !important;
}
.u-margin-right-68,
.up-margin-right-68 {
  margin-right: 68rpx !important;
}
.u-padding-right-68,
.up-padding-right-68 {
  padding-right: 68rpx !important;
}
.u-m-b-68,
.up-m-b-68 {
  margin-bottom: 68rpx !important;
}
.u-p-b-68,
.up-p-b-68 {
  padding-bottom: 68rpx !important;
}
.u-margin-bottom-68,
.up-margin-bottom-68 {
  margin-bottom: 68rpx !important;
}
.u-padding-bottom-68,
.up-padding-bottom-68 {
  padding-bottom: 68rpx !important;
}
.u-margin-70,
.u-m-70,
.up-margin-70,
.up-m-70 {
  margin: 70rpx !important;
}
.u-padding-70,
.u-p-70,
.up-padding-70,
.up-p-70 {
  padding: 70rpx !important;
}
.u-m-l-70,
.up-m-l-70 {
  margin-left: 70rpx !important;
}
.u-p-l-70,
.up-p-l-70 {
  padding-left: 70rpx !important;
}
.u-margin-left-70,
.up-margin-left-70 {
  margin-left: 70rpx !important;
}
.u-padding-left-70,
.up-padding-left-70 {
  padding-left: 70rpx !important;
}
.u-m-t-70,
.up-m-t-70 {
  margin-top: 70rpx !important;
}
.u-p-t-70,
.up-p-t-70 {
  padding-top: 70rpx !important;
}
.u-margin-top-70,
.up-margin-top-70 {
  margin-top: 70rpx !important;
}
.u-padding-top-70,
.up-padding-top-70 {
  padding-top: 70rpx !important;
}
.u-m-r-70,
.up-m-r-70 {
  margin-right: 70rpx !important;
}
.u-p-r-70,
.up-p-r-70 {
  padding-right: 70rpx !important;
}
.u-margin-right-70,
.up-margin-right-70 {
  margin-right: 70rpx !important;
}
.u-padding-right-70,
.up-padding-right-70 {
  padding-right: 70rpx !important;
}
.u-m-b-70,
.up-m-b-70 {
  margin-bottom: 70rpx !important;
}
.u-p-b-70,
.up-p-b-70 {
  padding-bottom: 70rpx !important;
}
.u-margin-bottom-70,
.up-margin-bottom-70 {
  margin-bottom: 70rpx !important;
}
.u-padding-bottom-70,
.up-padding-bottom-70 {
  padding-bottom: 70rpx !important;
}
.u-margin-72,
.u-m-72,
.up-margin-72,
.up-m-72 {
  margin: 72rpx !important;
}
.u-padding-72,
.u-p-72,
.up-padding-72,
.up-p-72 {
  padding: 72rpx !important;
}
.u-m-l-72,
.up-m-l-72 {
  margin-left: 72rpx !important;
}
.u-p-l-72,
.up-p-l-72 {
  padding-left: 72rpx !important;
}
.u-margin-left-72,
.up-margin-left-72 {
  margin-left: 72rpx !important;
}
.u-padding-left-72,
.up-padding-left-72 {
  padding-left: 72rpx !important;
}
.u-m-t-72,
.up-m-t-72 {
  margin-top: 72rpx !important;
}
.u-p-t-72,
.up-p-t-72 {
  padding-top: 72rpx !important;
}
.u-margin-top-72,
.up-margin-top-72 {
  margin-top: 72rpx !important;
}
.u-padding-top-72,
.up-padding-top-72 {
  padding-top: 72rpx !important;
}
.u-m-r-72,
.up-m-r-72 {
  margin-right: 72rpx !important;
}
.u-p-r-72,
.up-p-r-72 {
  padding-right: 72rpx !important;
}
.u-margin-right-72,
.up-margin-right-72 {
  margin-right: 72rpx !important;
}
.u-padding-right-72,
.up-padding-right-72 {
  padding-right: 72rpx !important;
}
.u-m-b-72,
.up-m-b-72 {
  margin-bottom: 72rpx !important;
}
.u-p-b-72,
.up-p-b-72 {
  padding-bottom: 72rpx !important;
}
.u-margin-bottom-72,
.up-margin-bottom-72 {
  margin-bottom: 72rpx !important;
}
.u-padding-bottom-72,
.up-padding-bottom-72 {
  padding-bottom: 72rpx !important;
}
.u-margin-74,
.u-m-74,
.up-margin-74,
.up-m-74 {
  margin: 74rpx !important;
}
.u-padding-74,
.u-p-74,
.up-padding-74,
.up-p-74 {
  padding: 74rpx !important;
}
.u-m-l-74,
.up-m-l-74 {
  margin-left: 74rpx !important;
}
.u-p-l-74,
.up-p-l-74 {
  padding-left: 74rpx !important;
}
.u-margin-left-74,
.up-margin-left-74 {
  margin-left: 74rpx !important;
}
.u-padding-left-74,
.up-padding-left-74 {
  padding-left: 74rpx !important;
}
.u-m-t-74,
.up-m-t-74 {
  margin-top: 74rpx !important;
}
.u-p-t-74,
.up-p-t-74 {
  padding-top: 74rpx !important;
}
.u-margin-top-74,
.up-margin-top-74 {
  margin-top: 74rpx !important;
}
.u-padding-top-74,
.up-padding-top-74 {
  padding-top: 74rpx !important;
}
.u-m-r-74,
.up-m-r-74 {
  margin-right: 74rpx !important;
}
.u-p-r-74,
.up-p-r-74 {
  padding-right: 74rpx !important;
}
.u-margin-right-74,
.up-margin-right-74 {
  margin-right: 74rpx !important;
}
.u-padding-right-74,
.up-padding-right-74 {
  padding-right: 74rpx !important;
}
.u-m-b-74,
.up-m-b-74 {
  margin-bottom: 74rpx !important;
}
.u-p-b-74,
.up-p-b-74 {
  padding-bottom: 74rpx !important;
}
.u-margin-bottom-74,
.up-margin-bottom-74 {
  margin-bottom: 74rpx !important;
}
.u-padding-bottom-74,
.up-padding-bottom-74 {
  padding-bottom: 74rpx !important;
}
.u-margin-75,
.u-m-75,
.up-margin-75,
.up-m-75 {
  margin: 75rpx !important;
}
.u-padding-75,
.u-p-75,
.up-padding-75,
.up-p-75 {
  padding: 75rpx !important;
}
.u-m-l-75,
.up-m-l-75 {
  margin-left: 75rpx !important;
}
.u-p-l-75,
.up-p-l-75 {
  padding-left: 75rpx !important;
}
.u-margin-left-75,
.up-margin-left-75 {
  margin-left: 75rpx !important;
}
.u-padding-left-75,
.up-padding-left-75 {
  padding-left: 75rpx !important;
}
.u-m-t-75,
.up-m-t-75 {
  margin-top: 75rpx !important;
}
.u-p-t-75,
.up-p-t-75 {
  padding-top: 75rpx !important;
}
.u-margin-top-75,
.up-margin-top-75 {
  margin-top: 75rpx !important;
}
.u-padding-top-75,
.up-padding-top-75 {
  padding-top: 75rpx !important;
}
.u-m-r-75,
.up-m-r-75 {
  margin-right: 75rpx !important;
}
.u-p-r-75,
.up-p-r-75 {
  padding-right: 75rpx !important;
}
.u-margin-right-75,
.up-margin-right-75 {
  margin-right: 75rpx !important;
}
.u-padding-right-75,
.up-padding-right-75 {
  padding-right: 75rpx !important;
}
.u-m-b-75,
.up-m-b-75 {
  margin-bottom: 75rpx !important;
}
.u-p-b-75,
.up-p-b-75 {
  padding-bottom: 75rpx !important;
}
.u-margin-bottom-75,
.up-margin-bottom-75 {
  margin-bottom: 75rpx !important;
}
.u-padding-bottom-75,
.up-padding-bottom-75 {
  padding-bottom: 75rpx !important;
}
.u-margin-76,
.u-m-76,
.up-margin-76,
.up-m-76 {
  margin: 76rpx !important;
}
.u-padding-76,
.u-p-76,
.up-padding-76,
.up-p-76 {
  padding: 76rpx !important;
}
.u-m-l-76,
.up-m-l-76 {
  margin-left: 76rpx !important;
}
.u-p-l-76,
.up-p-l-76 {
  padding-left: 76rpx !important;
}
.u-margin-left-76,
.up-margin-left-76 {
  margin-left: 76rpx !important;
}
.u-padding-left-76,
.up-padding-left-76 {
  padding-left: 76rpx !important;
}
.u-m-t-76,
.up-m-t-76 {
  margin-top: 76rpx !important;
}
.u-p-t-76,
.up-p-t-76 {
  padding-top: 76rpx !important;
}
.u-margin-top-76,
.up-margin-top-76 {
  margin-top: 76rpx !important;
}
.u-padding-top-76,
.up-padding-top-76 {
  padding-top: 76rpx !important;
}
.u-m-r-76,
.up-m-r-76 {
  margin-right: 76rpx !important;
}
.u-p-r-76,
.up-p-r-76 {
  padding-right: 76rpx !important;
}
.u-margin-right-76,
.up-margin-right-76 {
  margin-right: 76rpx !important;
}
.u-padding-right-76,
.up-padding-right-76 {
  padding-right: 76rpx !important;
}
.u-m-b-76,
.up-m-b-76 {
  margin-bottom: 76rpx !important;
}
.u-p-b-76,
.up-p-b-76 {
  padding-bottom: 76rpx !important;
}
.u-margin-bottom-76,
.up-margin-bottom-76 {
  margin-bottom: 76rpx !important;
}
.u-padding-bottom-76,
.up-padding-bottom-76 {
  padding-bottom: 76rpx !important;
}
.u-margin-78,
.u-m-78,
.up-margin-78,
.up-m-78 {
  margin: 78rpx !important;
}
.u-padding-78,
.u-p-78,
.up-padding-78,
.up-p-78 {
  padding: 78rpx !important;
}
.u-m-l-78,
.up-m-l-78 {
  margin-left: 78rpx !important;
}
.u-p-l-78,
.up-p-l-78 {
  padding-left: 78rpx !important;
}
.u-margin-left-78,
.up-margin-left-78 {
  margin-left: 78rpx !important;
}
.u-padding-left-78,
.up-padding-left-78 {
  padding-left: 78rpx !important;
}
.u-m-t-78,
.up-m-t-78 {
  margin-top: 78rpx !important;
}
.u-p-t-78,
.up-p-t-78 {
  padding-top: 78rpx !important;
}
.u-margin-top-78,
.up-margin-top-78 {
  margin-top: 78rpx !important;
}
.u-padding-top-78,
.up-padding-top-78 {
  padding-top: 78rpx !important;
}
.u-m-r-78,
.up-m-r-78 {
  margin-right: 78rpx !important;
}
.u-p-r-78,
.up-p-r-78 {
  padding-right: 78rpx !important;
}
.u-margin-right-78,
.up-margin-right-78 {
  margin-right: 78rpx !important;
}
.u-padding-right-78,
.up-padding-right-78 {
  padding-right: 78rpx !important;
}
.u-m-b-78,
.up-m-b-78 {
  margin-bottom: 78rpx !important;
}
.u-p-b-78,
.up-p-b-78 {
  padding-bottom: 78rpx !important;
}
.u-margin-bottom-78,
.up-margin-bottom-78 {
  margin-bottom: 78rpx !important;
}
.u-padding-bottom-78,
.up-padding-bottom-78 {
  padding-bottom: 78rpx !important;
}
.u-margin-80,
.u-m-80,
.up-margin-80,
.up-m-80 {
  margin: 80rpx !important;
}
.u-padding-80,
.u-p-80,
.up-padding-80,
.up-p-80 {
  padding: 80rpx !important;
}
.u-m-l-80,
.up-m-l-80 {
  margin-left: 80rpx !important;
}
.u-p-l-80,
.up-p-l-80 {
  padding-left: 80rpx !important;
}
.u-margin-left-80,
.up-margin-left-80 {
  margin-left: 80rpx !important;
}
.u-padding-left-80,
.up-padding-left-80 {
  padding-left: 80rpx !important;
}
.u-m-t-80,
.up-m-t-80 {
  margin-top: 80rpx !important;
}
.u-p-t-80,
.up-p-t-80 {
  padding-top: 80rpx !important;
}
.u-margin-top-80,
.up-margin-top-80 {
  margin-top: 80rpx !important;
}
.u-padding-top-80,
.up-padding-top-80 {
  padding-top: 80rpx !important;
}
.u-m-r-80,
.up-m-r-80 {
  margin-right: 80rpx !important;
}
.u-p-r-80,
.up-p-r-80 {
  padding-right: 80rpx !important;
}
.u-margin-right-80,
.up-margin-right-80 {
  margin-right: 80rpx !important;
}
.u-padding-right-80,
.up-padding-right-80 {
  padding-right: 80rpx !important;
}
.u-m-b-80,
.up-m-b-80 {
  margin-bottom: 80rpx !important;
}
.u-p-b-80,
.up-p-b-80 {
  padding-bottom: 80rpx !important;
}
.u-margin-bottom-80,
.up-margin-bottom-80 {
  margin-bottom: 80rpx !important;
}
.u-padding-bottom-80,
.up-padding-bottom-80 {
  padding-bottom: 80rpx !important;
}
.u-primary-light {
  color: var(--up-primary-light, var(--u-primary-light, #ecf5ff));
}
.u-warning-light {
  color: var(--up-warning-light, var(--u-warning-light, #fdf6ec));
}
.u-success-light {
  color: var(--up-success-light, var(--u-success-light, #f5fff0));
}
.u-error-light {
  color: var(--up-error-light, var(--u-error-light, #fef0f0));
}
.u-info-light {
  color: var(--up-info-light, var(--u-info-light, #f4f4f5));
}
.u-primary-light-bg {
  background-color: var(--up-primary-light, var(--u-primary-light, #ecf5ff));
}
.u-warning-light-bg {
  background-color: var(--up-warning-light, var(--u-warning-light, #fdf6ec));
}
.u-success-light-bg {
  background-color: var(--up-success-light, var(--u-success-light, #f5fff0));
}
.u-error-light-bg {
  background-color: var(--up-error-light, var(--u-error-light, #fef0f0));
}
.u-info-light-bg {
  background-color: var(--up-info-light, var(--u-info-light, #f4f4f5));
}
.u-primary-dark {
  color: var(--up-primary-dark, var(--u-primary-dark, #398ade));
}
.u-warning-dark {
  color: var(--up-warning-dark, var(--u-warning-dark, #f1a532));
}
.u-success-dark {
  color: var(--up-success-dark, var(--u-success-dark, #53c21d));
}
.u-error-dark {
  color: var(--up-error-dark, var(--u-error-dark, #e45656));
}
.u-info-dark {
  color: var(--up-info-dark, var(--u-info-dark, #767a82));
}
.u-primary-dark-bg {
  background-color: var(--up-primary-dark, var(--u-primary-dark, #398ade));
}
.u-warning-dark-bg {
  background-color: var(--up-warning-dark, var(--u-warning-dark, #f1a532));
}
.u-success-dark-bg {
  background-color: var(--up-success-dark, var(--u-success-dark, #53c21d));
}
.u-error-dark-bg {
  background-color: var(--up-error-dark, var(--u-error-dark, #e45656));
}
.u-info-dark-bg {
  background-color: var(--up-info-dark, var(--u-info-dark, #767a82));
}
.u-primary-disabled {
  color: var(--up-primary-disabled, var(--u-primary-disabled, #9acafc));
}
.u-warning-disabled {
  color: var(--up-warning-disabled, var(--u-warning-disabled, #f9d39b));
}
.u-success-disabled {
  color: var(--up-success-disabled, var(--u-success-disabled, #a9e08f));
}
.u-error-disabled {
  color: var(--up-error-disabled, var(--u-error-disabled, #f7b2b2));
}
.u-info-disabled {
  color: var(--up-info-disabled, var(--u-info-disabled, #c4c6c9));
}
.u-primary {
  color: var(--up-primary, var(--u-primary, #3c9cff));
}
.u-warning {
  color: var(--up-warning, var(--u-warning, #f9ae3d));
}
.u-success {
  color: var(--up-success, var(--u-success, #5ac725));
}
.u-error {
  color: var(--up-error, var(--u-error, #f56c6c));
}
.u-info {
  color: var(--up-info, var(--u-info, #909399));
}
.u-primary-bg {
  background-color: var(--up-primary, var(--u-primary, #3c9cff));
}
.u-warning-bg {
  background-color: var(--up-warning, var(--u-warning, #f9ae3d));
}
.u-success-bg {
  background-color: var(--up-success, var(--u-success, #5ac725));
}
.u-error-bg {
  background-color: var(--up-error, var(--u-error, #f56c6c));
}
.u-info-bg {
  background-color: var(--up-info, var(--u-info, #909399));
}
.u-main-color {
  color: var(--up-main-color, var(--u-main-color, #303133));
}
.u-content-color {
  color: var(--up-content-color, var(--u-content-color, #606266));
}
.u-tips-color {
  color: var(--up-tips-color, var(--u-tips-color, #909193));
}
.u-light-color {
  color: var(--up-light-color, var(--u-light-color, #c0c4cc));
}
.up-primary-light {
  color: var(--up-primary-light, var(--u-primary-light, #ecf5ff));
}
.up-warning-light {
  color: var(--up-warning-light, var(--u-warning-light, #fdf6ec));
}
.up-success-light {
  color: var(--up-success-light, var(--u-success-light, #f5fff0));
}
.up-error-light {
  color: var(--up-error-light, var(--u-error-light, #fef0f0));
}
.up-info-light {
  color: var(--up-info-light, var(--u-info-light, #f4f4f5));
}
.up-primary-light-bg {
  background-color: var(--up-primary-light, var(--u-primary-light, #ecf5ff));
}
.up-warning-light-bg {
  background-color: var(--up-warning-light, var(--u-warning-light, #fdf6ec));
}
.up-success-light-bg {
  background-color: var(--up-success-light, var(--u-success-light, #f5fff0));
}
.up-error-light-bg {
  background-color: var(--up-error-light, var(--u-error-light, #fef0f0));
}
.up-info-light-bg {
  background-color: var(--up-info-light, var(--u-info-light, #f4f4f5));
}
.up-primary-dark {
  color: var(--up-primary-dark, var(--u-primary-dark, #398ade));
}
.up-warning-dark {
  color: var(--up-warning-dark, var(--u-warning-dark, #f1a532));
}
.up-success-dark {
  color: var(--up-success-dark, var(--u-success-dark, #53c21d));
}
.up-error-dark {
  color: var(--up-error-dark, var(--u-error-dark, #e45656));
}
.up-info-dark {
  color: var(--up-info-dark, var(--u-info-dark, #767a82));
}
.up-primary-dark-bg {
  background-color: var(--up-primary-dark, var(--u-primary-dark, #398ade));
}
.up-warning-dark-bg {
  background-color: var(--up-warning-dark, var(--u-warning-dark, #f1a532));
}
.up-success-dark-bg {
  background-color: var(--up-success-dark, var(--u-success-dark, #53c21d));
}
.up-error-dark-bg {
  background-color: var(--up-error-dark, var(--u-error-dark, #e45656));
}
.up-info-dark-bg {
  background-color: var(--up-info-dark, var(--u-info-dark, #767a82));
}
.up-primary-disabled {
  color: var(--up-primary-disabled, var(--u-primary-disabled, #9acafc));
}
.up-warning-disabled {
  color: var(--up-warning-disabled, var(--u-warning-disabled, #f9d39b));
}
.up-success-disabled {
  color: var(--up-success-disabled, var(--u-success-disabled, #a9e08f));
}
.up-error-disabled {
  color: var(--up-error-disabled, var(--u-error-disabled, #f7b2b2));
}
.up-info-disabled {
  color: var(--up-info-disabled, var(--u-info-disabled, #c4c6c9));
}
.up-primary {
  color: var(--up-primary, var(--u-primary, #3c9cff));
}
.up-warning {
  color: var(--up-warning, var(--u-warning, #f9ae3d));
}
.up-success {
  color: var(--up-success, var(--u-success, #5ac725));
}
.up-error {
  color: var(--up-error, var(--u-error, #f56c6c));
}
.up-info {
  color: var(--up-info, var(--u-info, #909399));
}
.up-primary-bg {
  background-color: var(--up-primary, var(--u-primary, #3c9cff));
}
.up-warning-bg {
  background-color: var(--up-warning, var(--u-warning, #f9ae3d));
}
.up-success-bg {
  background-color: var(--up-success, var(--u-success, #5ac725));
}
.up-error-bg {
  background-color: var(--up-error, var(--u-error, #f56c6c));
}
.up-info-bg {
  background-color: var(--up-info, var(--u-info, #909399));
}
.up-main-color {
  color: var(--up-main-color, var(--u-main-color, #303133));
}
.up-content-color {
  color: var(--up-content-color, var(--u-content-color, #606266));
}
.up-tips-color {
  color: var(--up-tips-color, var(--u-tips-color, #909193));
}
.up-light-color {
  color: var(--up-light-color, var(--u-light-color, #c0c4cc));
}
.u-safe-area-inset-top,
.up-safe-area-inset-top {
  padding-top: 0;
  padding-top: constant(safe-area-inset-top);
  padding-top: env(safe-area-inset-top);
}
.u-safe-area-inset-right,
.up-safe-area-inset-right {
  padding-right: 0;
  padding-right: constant(safe-area-inset-right);
  padding-right: env(safe-area-inset-right);
}
.u-safe-area-inset-bottom,
.up-safe-area-inset-bottom {
  padding-bottom: 0;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
.u-safe-area-inset-left,
.up-safe-area-inset-left {
  padding-left: 0;
  padding-left: constant(safe-area-inset-left);
  padding-left: env(safe-area-inset-left);
}
.before_ccontent-_b_a_x_a_B::before {
  --tw-content: '*';
  content: var(--tw-content);
}
.before_ccontent-_b_aFestivus_a_B::before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_amoduleA_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 独立分包';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.after_cborder-none::after {
  content: var(--tw-content);
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
  margin-bottom: 16rpx;
}
.group.published .group-_b_dpublished_B_ctext-green-500 {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.peer.tapped ~ .peer-_b_dtapped_B_cbg-red-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(248, 113, 113, var(--tw-bg-opacity, 1));
}
.child_cmr-2 > view:not(.not-child) {
  margin-right: 16rpx;
}
.child_cinline-block > view:not(.not-child) {
  display: inline-block;
}
.child-_b_a_dchild_a_B_ctext-red-500 > view:not(.not-child) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.child_ctext-red-500 > view:not(.not-child) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.child_cmr-2 > text:not(.not-child) {
  margin-right: 16rpx;
}
.child_cinline-block > text:not(.not-child) {
  display: inline-block;
}
.child-_b_a_dchild_a_B_ctext-red-500 > text:not(.not-child) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.child_ctext-red-500 > text:not(.not-child) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.heir_cmr-2 view:not(.not-heir) {
  margin-right: 16rpx;
}
.heir_ctext-red-500 view:not(.not-heir) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.heir_cmr-2 text:not(.not-heir) {
  margin-right: 16rpx;
}
.heir_ctext-red-500 text:not(.not-heir) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.twin_ctext-green-500 ~ view:not(.not-twin) {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.twin_ctext-red-500 ~ view:not(.not-twin) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.twin_cring-white ~ view:not(.not-twin) {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgba(255, 255, 255, var(--tw-ring-opacity, 1));
}
.twin_ctext-green-500 ~ text:not(.not-twin) {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.twin_ctext-red-500 ~ text:not(.not-twin) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.twin_cring-white ~ text:not(.not-twin) {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgba(255, 255, 255, var(--tw-ring-opacity, 1));
}
.next_ctext-green-500 + view:not(.not-next) {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.next_ctext-green-500 + text:not(.not-next) {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.next-view_ctext-yellow-500 + view:not(.not-next-view) {
  --tw-text-opacity: 1;
  color: rgba(234, 179, 8, var(--tw-text-opacity, 1));
}
.child-text_cmr-2 > text:not(.not-child-text) {
  margin-right: 16rpx;
}
.child-text_ctext-red-500 > text:not(.not-child-text) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.heir-text_ctext-green-500 text:not(.not-heir-text) {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.next-text_ctext-red-500 + text:not(.not-next-text) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.ifdef-_bH5__o_o_MP-WEIXIN_B_cbg-blue-300 {
  --tw-bg-opacity: 1;
  background-color: rgba(147, 197, 253, var(--tw-bg-opacity, 1));
}
.ifdef-_bH5_o_oMP-WEIXIN_B_cbg-blue-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(96, 165, 250, var(--tw-bg-opacity, 1));
}
.ifdef-_bMP-WEIXIN_B_cbg-_b_h1167ff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(17, 103, 255, var(--tw-bg-opacity, 1));
}
.ifdef-_bMP-WEIXIN_B_cbg-blue-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(59, 130, 246, var(--tw-bg-opacity, 1));
}
.ifndef-_bH5_B_ctext-_b_h0055aa_B {
  --tw-text-opacity: 1;
  color: rgba(0, 85, 170, var(--tw-text-opacity, 1));
}
.wx_cbg-blue-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(96, 165, 250, var(--tw-bg-opacity, 1));
}
.mv_cbg-blue-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(96, 165, 250, var(--tw-bg-opacity, 1));
}
.dark view.dark_cbg-green-500,
.dark text.dark_cbg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1));
}
.dark view.dark_cbg-zinc-800,
.dark text.dark_cbg-zinc-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(39, 39, 42, var(--tw-bg-opacity, 1));
}
.dark view.dark_ctext-yellow-400,
.dark text.dark_ctext-yellow-400 {
  --tw-text-opacity: 1;
  color: rgba(250, 204, 21, var(--tw-text-opacity, 1));
}
@media (min-width: 1536px) {
  ._2xl_ctext-base {
    font-size: 32rpx;
    line-height: 48rpx;
  }
  ._2xl_ctext-_bred_B {
    --tw-text-opacity: 1;
    color: rgba(255, 0, 0, var(--tw-text-opacity, 1));
  }
}
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  --tw-text-opacity: 1 !important;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1)) !important;
}
@media (prefers-color-scheme: dark) {
  page,
  .tw-root,
  wx-root-portal-content,
  page,
  body,
  :host {
    --up-main-color: #f5f5f5;
    --up-content-color: #d1d5db;
    --up-tips-color: #9ca3af;
    --up-light-color: #6b7280;
    --up-border-color: #3a3a3c;
    --up-bg-color: #1f1f1f;
    --up-hover-bg-color: #343741;
    --up-page-bg-color: #1f1f1f;
    --up-card-bg-color: #1c1c1e;
    --up-navbar-bg-color: #1c1c1e;
    --up-disabled-color: #4b5563;
    --up-primary: #3c9cff;
    --up-primary-dark: #5aa8ff;
    --up-primary-disabled: #4c6f92;
    --up-primary-light: #10243a;
    --up-warning: #f9ae3d;
    --up-warning-dark: #ffbf66;
    --up-warning-disabled: #8a6a3a;
    --up-warning-light: #3d2f1b;
    --up-success: #5ac725;
    --up-success-dark: #7ad94b;
    --up-success-disabled: #5f7f4f;
    --up-success-light: #1f3316;
    --up-error: #f56c6c;
    --up-error-dark: #ff8a8a;
    --up-error-disabled: #8d5858;
    --up-error-light: #3a2222;
    --up-info: #909399;
    --up-info-dark: #b0b3b8;
    --up-info-disabled: #5f6368;
    --up-info-light: #2f3238;
    --up-table2-header-bg-color: #2a2d33;
    --up-table2-zebra-bg-color: #23262b;
    --up-table2-highlight-bg-color: #2f3440;
    --up-gap-bg-color: #111111;
    --up-skeleton-bg-color: #2f3135;
    --up-skeleton-shimmer-color: rgba(255, 255, 255, 0.12);
    --up-swipe-action-button-bg-color: #4b5563;
    --up-index-list-indicator-bg-color: #4b5563;
    --up-calendar-month-mark-color: rgba(255, 255, 255, 0.04);
  }
}
[data-up-theme='light'] {
  --up-main-color: var(--up-light-main-color, #303133);
  --up-content-color: var(--up-light-content-color, #606266);
  --up-tips-color: var(--up-light-tips-color, #909193);
  --up-light-color: var(--up-light-light-color, #c0c4cc);
  --up-border-color: var(--up-light-border-color, #dadbde);
  --up-bg-color: var(--up-light-bg-color, #f3f4f6);
  --up-hover-bg-color: #e7ebf0;
  --up-page-bg-color: #f3f4f6;
  --up-card-bg-color: #ffffff;
  --up-navbar-bg-color: #ffffff;
  --up-disabled-color: var(--up-light-disabled-color, #c8c9cc);
  --up-primary: var(--up-light-primary, #3c9cff);
  --up-primary-dark: var(--up-light-primary-dark, #398ade);
  --up-primary-disabled: var(--up-light-primary-disabled, #9acafc);
  --up-primary-light: var(--up-light-primary-light, #ecf5ff);
  --up-warning: var(--up-light-warning, #f9ae3d);
  --up-warning-dark: var(--up-light-warning-dark, #f1a532);
  --up-warning-disabled: var(--up-light-warning-disabled, #f9d39b);
  --up-warning-light: var(--up-light-warning-light, #fdf6ec);
  --up-success: var(--up-light-success, #5ac725);
  --up-success-dark: var(--up-light-success-dark, #53c21d);
  --up-success-disabled: var(--up-light-success-disabled, #a9e08f);
  --up-success-light: var(--up-light-success-light, #f5fff0);
  --up-error: var(--up-light-error, #f56c6c);
  --up-error-dark: var(--up-light-error-dark, #e45656);
  --up-error-disabled: var(--up-light-error-disabled, #f7b2b2);
  --up-error-light: var(--up-light-error-light, #fef0f0);
  --up-info: var(--up-light-info, #909399);
  --up-info-dark: var(--up-light-info-dark, #767a82);
  --up-info-disabled: var(--up-light-info-disabled, #c4c6c9);
  --up-info-light: var(--up-light-info-light, #f4f4f5);
  --up-table2-header-bg-color: #f5f7fa;
  --up-table2-zebra-bg-color: #fafafa;
  --up-table2-highlight-bg-color: #f5f7fa;
  --up-gap-bg-color: #f3f4f6;
  --up-skeleton-bg-color: #f1f2f4;
  --up-skeleton-shimmer-color: #e6e6e6;
  --up-swipe-action-button-bg-color: #c7c6cd;
  --up-index-list-indicator-bg-color: #c9c9c9;
  --up-calendar-month-mark-color: rgba(231, 232, 234, 0.83);
}
[data-up-theme='dark'] {
  --up-main-color: #f5f5f5;
  --up-content-color: #d1d5db;
  --up-tips-color: #9ca3af;
  --up-light-color: #6b7280;
  --up-border-color: #3a3a3c;
  --up-bg-color: #1f1f1f;
  --up-hover-bg-color: #343741;
  --up-page-bg-color: #1f1f1f;
  --up-card-bg-color: #1c1c1e;
  --up-navbar-bg-color: #1c1c1e;
  --up-disabled-color: #4b5563;
  --up-primary: #3c9cff;
  --up-primary-dark: #5aa8ff;
  --up-primary-disabled: #4c6f92;
  --up-primary-light: #10243a;
  --up-warning: #f9ae3d;
  --up-warning-dark: #ffbf66;
  --up-warning-disabled: #8a6a3a;
  --up-warning-light: #3d2f1b;
  --up-success: #5ac725;
  --up-success-dark: #7ad94b;
  --up-success-disabled: #5f7f4f;
  --up-success-light: #1f3316;
  --up-error: #f56c6c;
  --up-error-dark: #ff8a8a;
  --up-error-disabled: #8d5858;
  --up-error-light: #3a2222;
  --up-info: #909399;
  --up-info-dark: #b0b3b8;
  --up-info-disabled: #5f6368;
  --up-info-light: #2f3238;
  --up-table2-header-bg-color: #2a2d33;
  --up-table2-zebra-bg-color: #23262b;
  --up-table2-highlight-bg-color: #2f3440;
  --up-gap-bg-color: #111111;
  --up-skeleton-bg-color: #2f3135;
  --up-skeleton-shimmer-color: rgba(255, 255, 255, 0.12);
  --up-swipe-action-button-bg-color: #4b5563;
  --up-index-list-indicator-bg-color: #4b5563;
  --up-calendar-month-mark-color: rgba(255, 255, 255, 0.04);
}
body {
  --up-light-main-color: var(--up-main-color, var(--u-main-color, #303133));
  --u-light-main-color: var(--up-main-color, var(--u-main-color, #303133));
  --up-light-content-color: var(--up-content-color, var(--u-content-color, #606266));
  --u-light-content-color: var(--up-content-color, var(--u-content-color, #606266));
  --up-light-tips-color: var(--up-tips-color, var(--u-tips-color, #909193));
  --u-light-tips-color: var(--up-tips-color, var(--u-tips-color, #909193));
  --up-light-light-color: var(--up-light-color, var(--u-light-color, #c0c4cc));
  --u-light-light-color: var(--up-light-color, var(--u-light-color, #c0c4cc));
  --up-light-border-color: var(--up-border-color, var(--u-border-color, #dadbde));
  --u-light-border-color: var(--up-border-color, var(--u-border-color, #dadbde));
  --up-light-bg-color: var(--up-bg-color, var(--u-bg-color, #f3f4f6));
  --u-light-bg-color: var(--up-bg-color, var(--u-bg-color, #f3f4f6));
  --up-light-disabled-color: var(--up-disabled-color, var(--u-disabled-color, #c8c9cc));
  --u-light-disabled-color: var(--up-disabled-color, var(--u-disabled-color, #c8c9cc));
  --up-light-primary: var(--up-primary, var(--u-primary, #3c9cff));
  --u-light-primary: var(--up-primary, var(--u-primary, #3c9cff));
  --up-light-primary-dark: var(--up-primary-dark, var(--u-primary-dark, #398ade));
  --u-light-primary-dark: var(--up-primary-dark, var(--u-primary-dark, #398ade));
  --up-light-primary-disabled: var(--up-primary-disabled, var(--u-primary-disabled, #9acafc));
  --u-light-primary-disabled: var(--up-primary-disabled, var(--u-primary-disabled, #9acafc));
  --up-light-primary-light: var(--up-primary-light, var(--u-primary-light, #ecf5ff));
  --u-light-primary-light: var(--up-primary-light, var(--u-primary-light, #ecf5ff));
  --up-light-warning: var(--up-warning, var(--u-warning, #f9ae3d));
  --u-light-warning: var(--up-warning, var(--u-warning, #f9ae3d));
  --up-light-warning-dark: var(--up-warning-dark, var(--u-warning-dark, #f1a532));
  --u-light-warning-dark: var(--up-warning-dark, var(--u-warning-dark, #f1a532));
  --up-light-warning-disabled: var(--up-warning-disabled, var(--u-warning-disabled, #f9d39b));
  --u-light-warning-disabled: var(--up-warning-disabled, var(--u-warning-disabled, #f9d39b));
  --up-light-warning-light: var(--up-warning-light, var(--u-warning-light, #fdf6ec));
  --u-light-warning-light: var(--up-warning-light, var(--u-warning-light, #fdf6ec));
  --up-light-success: var(--up-success, var(--u-success, #5ac725));
  --u-light-success: var(--up-success, var(--u-success, #5ac725));
  --up-light-success-dark: var(--up-success-dark, var(--u-success-dark, #53c21d));
  --u-light-success-dark: var(--up-success-dark, var(--u-success-dark, #53c21d));
  --up-light-success-disabled: var(--up-success-disabled, var(--u-success-disabled, #a9e08f));
  --u-light-success-disabled: var(--up-success-disabled, var(--u-success-disabled, #a9e08f));
  --up-light-success-light: var(--up-success-light, var(--u-success-light, #f5fff0));
  --u-light-success-light: var(--up-success-light, var(--u-success-light, #f5fff0));
  --up-light-error: var(--up-error, var(--u-error, #f56c6c));
  --u-light-error: var(--up-error, var(--u-error, #f56c6c));
  --up-light-error-dark: var(--up-error-dark, var(--u-error-dark, #e45656));
  --u-light-error-dark: var(--up-error-dark, var(--u-error-dark, #e45656));
  --up-light-error-disabled: var(--up-error-disabled, var(--u-error-disabled, #f7b2b2));
  --u-light-error-disabled: var(--up-error-disabled, var(--u-error-disabled, #f7b2b2));
  --up-light-error-light: var(--up-error-light, var(--u-error-light, #fef0f0));
  --u-light-error-light: var(--up-error-light, var(--u-error-light, #fef0f0));
  --up-light-info: var(--up-info, var(--u-info, #909399));
  --u-light-info: var(--up-info, var(--u-info, #909399));
  --up-light-info-dark: var(--up-info-dark, var(--u-info-dark, #767a82));
  --u-light-info-dark: var(--up-info-dark, var(--u-info-dark, #767a82));
  --up-light-info-disabled: var(--up-info-disabled, var(--u-info-disabled, #c4c6c9));
  --u-light-info-disabled: var(--up-info-disabled, var(--u-info-disabled, #c4c6c9));
  --up-light-info-light: var(--up-info-light, var(--u-info-light, #f4f4f5));
  --u-light-info-light: var(--up-info-light, var(--u-info-light, #f4f4f5));
}
[data-up-theme='light'] {
  --up-light-main-color: var(--up-main-color, var(--u-main-color, #303133));
  --u-light-main-color: var(--up-main-color, var(--u-main-color, #303133));
  --up-light-content-color: var(--up-content-color, var(--u-content-color, #606266));
  --u-light-content-color: var(--up-content-color, var(--u-content-color, #606266));
  --up-light-tips-color: var(--up-tips-color, var(--u-tips-color, #909193));
  --u-light-tips-color: var(--up-tips-color, var(--u-tips-color, #909193));
  --up-light-light-color: var(--up-light-color, var(--u-light-color, #c0c4cc));
  --u-light-light-color: var(--up-light-color, var(--u-light-color, #c0c4cc));
  --up-light-border-color: var(--up-border-color, var(--u-border-color, #dadbde));
  --u-light-border-color: var(--up-border-color, var(--u-border-color, #dadbde));
  --up-light-bg-color: var(--up-bg-color, var(--u-bg-color, #f3f4f6));
  --u-light-bg-color: var(--up-bg-color, var(--u-bg-color, #f3f4f6));
  --up-light-disabled-color: var(--up-disabled-color, var(--u-disabled-color, #c8c9cc));
  --u-light-disabled-color: var(--up-disabled-color, var(--u-disabled-color, #c8c9cc));
  --up-light-primary: var(--up-primary, var(--u-primary, #3c9cff));
  --u-light-primary: var(--up-primary, var(--u-primary, #3c9cff));
  --up-light-primary-dark: var(--up-primary-dark, var(--u-primary-dark, #398ade));
  --u-light-primary-dark: var(--up-primary-dark, var(--u-primary-dark, #398ade));
  --up-light-primary-disabled: var(--up-primary-disabled, var(--u-primary-disabled, #9acafc));
  --u-light-primary-disabled: var(--up-primary-disabled, var(--u-primary-disabled, #9acafc));
  --up-light-primary-light: var(--up-primary-light, var(--u-primary-light, #ecf5ff));
  --u-light-primary-light: var(--up-primary-light, var(--u-primary-light, #ecf5ff));
  --up-light-warning: var(--up-warning, var(--u-warning, #f9ae3d));
  --u-light-warning: var(--up-warning, var(--u-warning, #f9ae3d));
  --up-light-warning-dark: var(--up-warning-dark, var(--u-warning-dark, #f1a532));
  --u-light-warning-dark: var(--up-warning-dark, var(--u-warning-dark, #f1a532));
  --up-light-warning-disabled: var(--up-warning-disabled, var(--u-warning-disabled, #f9d39b));
  --u-light-warning-disabled: var(--up-warning-disabled, var(--u-warning-disabled, #f9d39b));
  --up-light-warning-light: var(--up-warning-light, var(--u-warning-light, #fdf6ec));
  --u-light-warning-light: var(--up-warning-light, var(--u-warning-light, #fdf6ec));
  --up-light-success: var(--up-success, var(--u-success, #5ac725));
  --u-light-success: var(--up-success, var(--u-success, #5ac725));
  --up-light-success-dark: var(--up-success-dark, var(--u-success-dark, #53c21d));
  --u-light-success-dark: var(--up-success-dark, var(--u-success-dark, #53c21d));
  --up-light-success-disabled: var(--up-success-disabled, var(--u-success-disabled, #a9e08f));
  --u-light-success-disabled: var(--up-success-disabled, var(--u-success-disabled, #a9e08f));
  --up-light-success-light: var(--up-success-light, var(--u-success-light, #f5fff0));
  --u-light-success-light: var(--up-success-light, var(--u-success-light, #f5fff0));
  --up-light-error: var(--up-error, var(--u-error, #f56c6c));
  --u-light-error: var(--up-error, var(--u-error, #f56c6c));
  --up-light-error-dark: var(--up-error-dark, var(--u-error-dark, #e45656));
  --u-light-error-dark: var(--up-error-dark, var(--u-error-dark, #e45656));
  --up-light-error-disabled: var(--up-error-disabled, var(--u-error-disabled, #f7b2b2));
  --u-light-error-disabled: var(--up-error-disabled, var(--u-error-disabled, #f7b2b2));
  --up-light-error-light: var(--up-error-light, var(--u-error-light, #fef0f0));
  --u-light-error-light: var(--up-error-light, var(--u-error-light, #fef0f0));
  --up-light-info: var(--up-info, var(--u-info, #909399));
  --u-light-info: var(--up-info, var(--u-info, #909399));
  --up-light-info-dark: var(--up-info-dark, var(--u-info-dark, #767a82));
  --u-light-info-dark: var(--up-info-dark, var(--u-info-dark, #767a82));
  --up-light-info-disabled: var(--up-info-disabled, var(--u-info-disabled, #c4c6c9));
  --u-light-info-disabled: var(--up-info-disabled, var(--u-info-disabled, #c4c6c9));
  --up-light-info-light: var(--up-info-light, var(--u-info-light, #f4f4f5));
  --u-light-info-light: var(--up-info-light, var(--u-info-light, #f4f4f5));
}
::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  background: transparent;
}
[data-c-h='true'] {
  display: none !important;
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

### a.wxss

```css
::before,
::after {
  --tw-content: '';
}
view,
text,
::after,
::before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:;
  --tw-pan-y:;
  --tw-pinch-zoom:;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:;
  --tw-gradient-via-position:;
  --tw-gradient-to-position:;
  --tw-ordinal:;
  --tw-slashed-zero:;
  --tw-numeric-figure:;
  --tw-numeric-spacing:;
  --tw-numeric-fraction:;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-colored: 0 0 rgba(0, 0, 0, 0);
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
  --tw-contain-size:;
  --tw-contain-layout:;
  --tw-contain-paint:;
  --tw-contain-style:;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
.inline {
  display: inline;
}
.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.before_ccontent-_b_amoduleA_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 独立分包';
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

### b.wxss

```css
::before,
::after {
  --tw-content: '';
}
view,
text,
::after,
::before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:;
  --tw-pan-y:;
  --tw-pinch-zoom:;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:;
  --tw-gradient-via-position:;
  --tw-gradient-to-position:;
  --tw-ordinal:;
  --tw-slashed-zero:;
  --tw-numeric-figure:;
  --tw-numeric-spacing:;
  --tw-numeric-fraction:;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-colored: 0 0 rgba(0, 0, 0, 0);
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
  --tw-contain-size:;
  --tw-contain-layout:;
  --tw-contain-paint:;
  --tw-contain-style:;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
.inline {
  display: inline;
}
.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.before_ccontent-_b_amoduleA_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 独立分包';
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
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: white;
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
}
.tab-bar-border {
  background-color: rgba(0, 0, 0, 0.33);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 1px;
  transform: scaleY(0.5);
}
.tab-bar-item {
  flex: 1;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.tab-bar-item cover-image {
  width: 27px;
  height: 27px;
}
.tab-bar-item cover-view {
  font-size: 10px;
}
```

### index.wxss

```css
::before,
::after {
  --tw-content: '';
}
view,
text,
::after,
::before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:;
  --tw-pan-y:;
  --tw-pinch-zoom:;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:;
  --tw-gradient-via-position:;
  --tw-gradient-to-position:;
  --tw-ordinal:;
  --tw-slashed-zero:;
  --tw-numeric-figure:;
  --tw-numeric-spacing:;
  --tw-numeric-fraction:;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-colored: 0 0 rgba(0, 0, 0, 0);
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
  --tw-contain-size:;
  --tw-contain-layout:;
  --tw-contain-paint:;
  --tw-contain-style:;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.bg-independent-subpackage-marker {
  --tw-bg-opacity: 1;
  background-color: rgba(220, 38, 38, var(--tw-bg-opacity, 1));
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
::before,
::after {
  --tw-content: '';
}
view,
text,
::after,
::before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:;
  --tw-pan-y:;
  --tw-pinch-zoom:;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:;
  --tw-gradient-via-position:;
  --tw-gradient-to-position:;
  --tw-ordinal:;
  --tw-slashed-zero:;
  --tw-numeric-figure:;
  --tw-numeric-spacing:;
  --tw-numeric-fraction:;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-colored: 0 0 rgba(0, 0, 0, 0);
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
  --tw-contain-size:;
  --tw-contain-layout:;
  --tw-contain-paint:;
  --tw-contain-style:;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.bg-normal-subpackage-marker {
  --tw-bg-opacity: 1;
  background-color: rgba(37, 99, 235, var(--tw-bg-opacity, 1));
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
::before,
::after {
  --tw-content: '';
}
view,
text,
::after,
::before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:;
  --tw-pan-y:;
  --tw-pinch-zoom:;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:;
  --tw-gradient-via-position:;
  --tw-gradient-to-position:;
  --tw-ordinal:;
  --tw-slashed-zero:;
  --tw-numeric-figure:;
  --tw-numeric-spacing:;
  --tw-numeric-fraction:;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-colored: 0 0 rgba(0, 0, 0, 0);
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
  --tw-contain-size:;
  --tw-contain-layout:;
  --tw-contain-paint:;
  --tw-contain-style:;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
.inline {
  display: inline;
}
.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.before_ccontent-_b_amoduleA_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 独立分包';
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
:host,
page,
.tw-root,
wx-root-portal-content {
  --primary-color-hex: #4268ea;
  --primary-color-bg: yellow;
  --my-var: green;
  --my-var-length: 24rpx;
}
.test {
  display: flex !important;
  height: 100rpx !important;
  width: 100rpx !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 40rpx !important;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1)) !important;
  --tw-bg-opacity: 0.54 !important;
  --tw-text-opacity: 1 !important;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1)) !important;
}
.content::before {
  content: '';
  display: inline-block;
  height: 40rpx;
  width: 40rpx;
  background-color: rgba(239, 68, 68, 0.5);
}
.apply-class-0 {
  --tw-bg-opacity: 1;
  background-color: rgba(59, 130, 246, var(--tw-bg-opacity, 1));
}
.apply-class-0 {
  --tw-bg-opacity: 1;
  background-color: rgba(96, 165, 250, var(--tw-bg-opacity, 1));
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

### peer.wxss

```css
::before,
::after {
  --tw-content: '';
}
view,
text,
::after,
::before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:;
  --tw-pan-y:;
  --tw-pinch-zoom:;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:;
  --tw-gradient-via-position:;
  --tw-gradient-to-position:;
  --tw-ordinal:;
  --tw-slashed-zero:;
  --tw-numeric-figure:;
  --tw-numeric-spacing:;
  --tw-numeric-fraction:;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-colored: 0 0 rgba(0, 0, 0, 0);
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
  --tw-contain-size:;
  --tw-contain-layout:;
  --tw-contain-paint:;
  --tw-contain-style:;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
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
.visible {
  visibility: visible;
}
.relative {
  position: relative;
}
.-m-_b20px_B {
  margin: -20rpx;
}
.m-_b5rpx_B {
  margin: 5rpx;
}
.-mt-2 {
  margin-top: -16rpx;
}
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
.mt-_b26_d2px_B {
  margin-top: 26.2rpx;
}
.mt-_b96_d3px_B {
  margin-top: 96.3rpx;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.block {
  display: block;
}
.inline-block {
  display: inline-block;
}
.inline {
  display: inline;
}
.flex {
  display: flex;
}
.table {
  display: table;
}
.grid {
  display: grid;
}
._ehidden {
  display: none !important;
}
.h-10 {
  height: 80rpx;
}
.h-2 {
  height: 16rpx;
}
.h-20 {
  height: 160rpx;
}
.h-24 {
  height: 192rpx;
}
.h-3 {
  height: 24rpx;
}
.h-5 {
  height: 40rpx;
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
.h-screen {
  height: 100vh;
}
.max-h-_b100px_B {
  max-height: 100rpx;
}
.min-h-_b100px_B {
  min-height: 100rpx;
}
.w-10 {
  width: 80rpx;
}
.w-16 {
  width: 128rpx;
}
.w-2 {
  width: 16rpx;
}
.w-20 {
  width: 160rpx;
}
.w-24 {
  width: 192rpx;
}
.w-32 {
  width: 256rpx;
}
.w-5 {
  width: 40rpx;
}
.w-_b100px_B {
  width: 100rpx;
}
.w-_b20px_B {
  width: 20rpx;
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
.w-_b33_d33px_B {
  width: 33.33rpx;
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
.w-screen {
  width: 100vw;
}
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
.origin-_b100rpx_111rpx_B {
  transform-origin: 100rpx 111rpx;
}
.translate-y-_b17rpx_B {
  --tw-translate-y: 17rpx;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
    scaleY(var(--tw-scale-y));
}
.rotate-_b10deg_B {
  --tw-rotate: 10deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
    scaleY(var(--tw-scale-y));
}
.cursor-not-allowed {
  cursor: not-allowed;
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
.space-x-2_d5 > view + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: calc(20rpx * var(--tw-space-x-reverse));
  margin-left: calc(20rpx * (1 - var(--tw-space-x-reverse)));
}
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(32rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(32rpx * var(--tw-space-y-reverse));
}
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
}
.space-y-_b11rpx_B > view + view,
.space-y-_b11rpx_B > view + text,
.space-y-_b11rpx_B > text + view,
.space-y-_b11rpx_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(11rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(11rpx * var(--tw-space-y-reverse));
}
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-x-_b3px_B > view + view,
.divide-x-_b3px_B > view + text,
.divide-x-_b3px_B > text + view,
.divide-x-_b3px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(3rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(3rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  border-style: solid;
}
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(1, 1, 1, var(--tw-divide-opacity, 1));
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
.rounded-_b40px_B {
  border-radius: 40rpx;
}
.rounded-md {
  border-radius: 12rpx;
}
._eborder-primary {
  --tw-border-opacity: 1 !important;
  border-color: rgba(69, 163, 250, var(--tw-border-opacity, 1)) !important;
}
.border {
  border-width: 1rpx;
}
.border-4 {
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
  --tw-border-opacity: 1;
  border-color: rgba(9, 135, 101, var(--tw-border-opacity, 1));
}
.border-_bred_B {
  --tw-border-opacity: 1;
  border-color: rgba(255, 0, 0, var(--tw-border-opacity, 1));
}
.border-b-_b4rpx_B {
  border-bottom-width: 4rpx;
}
.border-gray-400 {
  --tw-border-opacity: 1;
  border-color: rgba(156, 163, 175, var(--tw-border-opacity, 1));
}
.border-none {
  border-style: none;
}
.border-opacity-_b0_d44_B {
  --tw-border-opacity: 0.44;
}
.border-solid {
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
._ebg-green-500 {
  --tw-bg-opacity: 1 !important;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1)) !important;
}
.bg-_b_h123324_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 51, 36, var(--tw-bg-opacity, 1));
}
.bg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
.bg-_b_h3482f2_B {
  --tw-bg-opacity: 1;
  background-color: rgba(52, 130, 242, var(--tw-bg-opacity, 1));
}
.bg-_b_h410000_B {
  --tw-bg-opacity: 1;
  background-color: rgba(65, 0, 0, var(--tw-bg-opacity, 1));
}
.bg-_b_h4268EA_B {
  --tw-bg-opacity: 1;
  background-color: rgba(66, 104, 234, var(--tw-bg-opacity, 1));
}
.bg-_b_h434332_B {
  --tw-bg-opacity: 1;
  background-color: rgba(67, 67, 50, var(--tw-bg-opacity, 1));
}
.bg-_b_h434354_B {
  --tw-bg-opacity: 1;
  background-color: rgba(67, 67, 84, var(--tw-bg-opacity, 1));
}
.bg-_b_h654874_B {
  --tw-bg-opacity: 1;
  background-color: rgba(101, 72, 116, var(--tw-bg-opacity, 1));
}
.bg-_b_h666600_B {
  --tw-bg-opacity: 1;
  background-color: rgba(102, 102, 0, var(--tw-bg-opacity, 1));
}
.bg-_b_h955443_B {
  --tw-bg-opacity: 1;
  background-color: rgba(149, 84, 67, var(--tw-bg-opacity, 1));
}
.bg-_b_h987654_B {
  --tw-bg-opacity: 1;
  background-color: rgba(152, 118, 84, var(--tw-bg-opacity, 1));
}
.bg-_b_h999999_B {
  --tw-bg-opacity: 1;
  background-color: rgba(153, 153, 153, var(--tw-bg-opacity, 1));
}
.bg-_b_hB91C1C_B {
  --tw-bg-opacity: 1;
  background-color: rgba(185, 28, 28, var(--tw-bg-opacity, 1));
}
.bg-_b_hc65ece_B {
  --tw-bg-opacity: 1;
  background-color: rgba(198, 94, 206, var(--tw-bg-opacity, 1));
}
.bg-_b_he6e6e6_B {
  --tw-bg-opacity: 1;
  background-color: rgba(230, 230, 230, var(--tw-bg-opacity, 1));
}
.bg-_byellow_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 0, var(--tw-bg-opacity, 1));
}
.bg-amber-300 {
  --tw-bg-opacity: 1;
  background-color: rgba(252, 211, 77, var(--tw-bg-opacity, 1));
}
.bg-amber-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(245, 158, 11, var(--tw-bg-opacity, 1));
}
.bg-amber-600 {
  --tw-bg-opacity: 1;
  background-color: rgba(217, 119, 6, var(--tw-bg-opacity, 1));
}
.bg-amber-700 {
  --tw-bg-opacity: 1;
  background-color: rgba(180, 83, 9, var(--tw-bg-opacity, 1));
}
.bg-amber-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(146, 64, 14, var(--tw-bg-opacity, 1));
}
.bg-blue-300 {
  --tw-bg-opacity: 1;
  background-color: rgba(147, 197, 253, var(--tw-bg-opacity, 1));
}
.bg-blue-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(96, 165, 250, var(--tw-bg-opacity, 1));
}
.bg-blue-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(59, 130, 246, var(--tw-bg-opacity, 1));
}
.bg-blue-500_f50 {
  background-color: rgba(59, 130, 246, 0.5);
}
.bg-cyan-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(6, 182, 212, var(--tw-bg-opacity, 1));
}
.bg-gray-100 {
  --tw-bg-opacity: 1;
  background-color: rgba(243, 244, 246, var(--tw-bg-opacity, 1));
}
.bg-gray-300 {
  --tw-bg-opacity: 1;
  background-color: rgba(209, 213, 219, var(--tw-bg-opacity, 1));
}
.bg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1));
}
.bg-pink-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(236, 72, 153, var(--tw-bg-opacity, 1));
}
.bg-red-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(248, 113, 113, var(--tw-bg-opacity, 1));
}
.bg-red-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(239, 68, 68, var(--tw-bg-opacity, 1));
}
.bg-red-500_f50 {
  background-color: rgba(239, 68, 68, 0.5);
}
.bg-sky-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(14, 165, 233, var(--tw-bg-opacity, 1));
}
.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity, 1));
}
.bg-opacity-_b0_d54_B {
  --tw-bg-opacity: 0.54;
}
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
}
.bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}
.bg-gradient-to-t {
  background-image: linear-gradient(to top, var(--tw-gradient-stops));
}
.bg-gradient-to-tr {
  background-image: linear-gradient(to top right, var(--tw-gradient-stops));
}
.from-_b_h2f73f1_B {
  --tw-gradient-from: #2f73f1 var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(47, 115, 241, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
.to-_b_h4bcefd_B {
  --tw-gradient-to: #4bcefd var(--tw-gradient-to-position);
}
.p-3 {
  padding: 24rpx;
}
.p-4 {
  padding: 32rpx;
}
.p-_b20px_B {
  padding: 20rpx;
}
.p-_b5rpx_B {
  padding: 5rpx;
}
.px-2 {
  padding-left: 16rpx;
  padding-right: 16rpx;
}
.px-4 {
  padding-left: 32rpx;
  padding-right: 32rpx;
}
.px-_b32px_B {
  padding-left: 32rpx;
  padding-right: 32rpx;
}
.px-_b35px_B {
  padding-left: 35rpx;
  padding-right: 35rpx;
}
.py-1 {
  padding-top: 8rpx;
  padding-bottom: 8rpx;
}
.py-2 {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}
.indent-_b11rpx_B {
  text-indent: 11rpx;
}
.text-2xl {
  font-size: 48rpx;
  line-height: 64rpx;
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
.text-_b44px_B {
  font-size: 44rpx;
}
.text-_b56_d5rpx_B {
  font-size: 56.5rpx;
}
.text-_b77rpx_B {
  font-size: 77rpx;
}
.text-_blength_ccalc_p2_x9_d43px_P_B {
  font-size: calc(2 * 9.43rpx);
}
.text-_blength_cvar_p--my-var-length_P_B {
  font-size: var(--my-var-length);
}
.text-base {
  font-size: 32rpx;
  line-height: 48rpx;
}
.text-sm {
  font-size: 28rpx;
  line-height: 40rpx;
}
._efont-bold {
  font-weight: 700 !important;
}
.font-bold {
  font-weight: 700;
}
.font-semibold {
  font-weight: 600;
}
.uppercase {
  text-transform: uppercase;
}
.leading-_b0_d9_B {
  line-height: 0.9;
}
.leading-_b23rpx_B {
  line-height: 23rpx;
}
._etext-_b_h990000_B {
  --tw-text-opacity: 1 !important;
  color: rgba(153, 0, 0, var(--tw-text-opacity, 1)) !important;
}
._etext-primary {
  --tw-text-opacity: 1 !important;
  color: rgba(69, 163, 250, var(--tw-text-opacity, 1)) !important;
}
._etext-red-400 {
  --tw-text-opacity: 1 !important;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1)) !important;
}
.text-_b_h0b138f_B {
  --tw-text-opacity: 1;
  color: rgba(11, 19, 143, var(--tw-text-opacity, 1));
}
.text-_b_h123456_B {
  --tw-text-opacity: 1;
  color: rgba(18, 52, 86, var(--tw-text-opacity, 1));
}
.text-_b_hab1932_B {
  --tw-text-opacity: 1;
  color: rgba(171, 25, 50, var(--tw-text-opacity, 1));
}
.text-_b_habcdef_B {
  --tw-text-opacity: 1;
  color: rgba(171, 205, 239, var(--tw-text-opacity, 1));
}
.text-_b_hbada55_B {
  --tw-text-opacity: 1;
  color: rgba(186, 218, 85, var(--tw-text-opacity, 1));
}
.text-_b_hdddddd_B {
  --tw-text-opacity: 1;
  color: rgba(221, 221, 221, var(--tw-text-opacity, 1));
}
.text-_b_hfafafa_B {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
.text-_b_hffffff_B {
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
}
.text-_bcolor_cvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bred_B {
  --tw-text-opacity: 1;
  color: rgba(255, 0, 0, var(--tw-text-opacity, 1));
}
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bvar_p--text_r_sec_r_light_P_B {
  color: var(--text_sec_light);
}
.text-_bvar_p--text_sec_light_P_B {
  color: var(--text sec light);
}
.text-black {
  --tw-text-opacity: 1;
  color: rgba(0, 0, 0, var(--tw-text-opacity, 1));
}
.text-gray-800 {
  --tw-text-opacity: 1;
  color: rgba(31, 41, 55, var(--tw-text-opacity, 1));
}
.text-green-500 {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.text-opacity-_b0_d19_B {
  --tw-text-opacity: 0.19;
}
.text-red-400 {
  --tw-text-opacity: 1;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1));
}
.text-red-500 {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.text-white {
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
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
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0rpx 2rpx 11rpx 0rpx #00000a;
  --tw-shadow-colored: 0rpx 2rpx 11rpx 0rpx var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-ring-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0rpx 2rpx 11rpx 0rpx rgba(0, 0, 0, 0.4);
  --tw-shadow-colored: 0rpx 2rpx 11rpx 0rpx var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-ring-shadow, 0 0 rgba(0, 0, 0, 0)), var(--tw-shadow);
}
.shadow-amber-100 {
  --tw-shadow-color: #fef3c7;
  --tw-shadow: var(--tw-shadow-colored);
}
.shadow-blue-100 {
  --tw-shadow-color: #dbeafe;
  --tw-shadow: var(--tw-shadow-colored);
}
.shadow-cyan-100 {
  --tw-shadow-color: #cffafe;
  --tw-shadow: var(--tw-shadow-colored);
}
.shadow-green-100 {
  --tw-shadow-color: #dcfce7;
  --tw-shadow: var(--tw-shadow-colored);
}
.shadow-indigo-100 {
  --tw-shadow-color: #e0e7ff;
  --tw-shadow: var(--tw-shadow-colored);
}
.outline-_b5rpx_B {
  outline-width: 5rpx;
}
.outline-offset-_b3rpx_B {
  outline-offset: 3rpx;
}
.ring-4 {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4rpx + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 rgba(0, 0, 0, 0));
}
.ring-_b10rpx_B {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(10rpx + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 rgba(0, 0, 0, 0));
}
.ring-pink-300 {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgba(249, 168, 212, var(--tw-ring-opacity, 1));
}
.ring-offset-_b3rpx_B {
  --tw-ring-offset-width: 3rpx;
}
.blur {
  --tw-blur: blur(8rpx);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.blur-_b2rpx_B {
  --tw-blur: blur(2rpx);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.backdrop-blur-_b2rpx_B {
  --tw-backdrop-blur: blur(2rpx);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate)
    var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}
.transition {
  transition-property: color, background-color, border-color, fill, stroke, opacity, box-shadow;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.before_ccontent-_b_a_x_a_B::before {
  --tw-content: '*';
  content: var(--tw-content);
}
.before_ccontent-_b_aFestivus_a_B::before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_amoduleA_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 独立分包';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage uni-app-vite-tailwindcss-v3';
  content: var(--tw-content);
}
.after_cborder-none::after {
  content: var(--tw-content);
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
  margin-bottom: 16rpx;
}
.group.published .group-_b_dpublished_B_ctext-green-500 {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.peer.tapped ~ .peer-_b_dtapped_B_cbg-red-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(248, 113, 113, var(--tw-bg-opacity, 1));
}
.child_cmr-2 > view:not(.not-child) {
  margin-right: 16rpx;
}
.child_cinline-block > view:not(.not-child) {
  display: inline-block;
}
.child-_b_a_dchild_a_B_ctext-red-500 > view:not(.not-child) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.child_ctext-red-500 > view:not(.not-child) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.child_cmr-2 > text:not(.not-child) {
  margin-right: 16rpx;
}
.child_cinline-block > text:not(.not-child) {
  display: inline-block;
}
.child-_b_a_dchild_a_B_ctext-red-500 > text:not(.not-child) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.child_ctext-red-500 > text:not(.not-child) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.heir_cmr-2 view:not(.not-heir) {
  margin-right: 16rpx;
}
.heir_ctext-red-500 view:not(.not-heir) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.heir_cmr-2 text:not(.not-heir) {
  margin-right: 16rpx;
}
.heir_ctext-red-500 text:not(.not-heir) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.twin_ctext-green-500 ~ view:not(.not-twin) {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.twin_ctext-red-500 ~ view:not(.not-twin) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.twin_cring-white ~ view:not(.not-twin) {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgba(255, 255, 255, var(--tw-ring-opacity, 1));
}
.twin_ctext-green-500 ~ text:not(.not-twin) {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.twin_ctext-red-500 ~ text:not(.not-twin) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.twin_cring-white ~ text:not(.not-twin) {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgba(255, 255, 255, var(--tw-ring-opacity, 1));
}
.next_ctext-green-500 + view:not(.not-next) {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.next_ctext-green-500 + text:not(.not-next) {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.next-view_ctext-yellow-500 + view:not(.not-next-view) {
  --tw-text-opacity: 1;
  color: rgba(234, 179, 8, var(--tw-text-opacity, 1));
}
.child-text_cmr-2 > text:not(.not-child-text) {
  margin-right: 16rpx;
}
.child-text_ctext-red-500 > text:not(.not-child-text) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.heir-text_ctext-green-500 text:not(.not-heir-text) {
  --tw-text-opacity: 1;
  color: rgba(34, 197, 94, var(--tw-text-opacity, 1));
}
.next-text_ctext-red-500 + text:not(.not-next-text) {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
.ifdef-_bH5__o_o_MP-WEIXIN_B_cbg-blue-300 {
  --tw-bg-opacity: 1;
  background-color: rgba(147, 197, 253, var(--tw-bg-opacity, 1));
}
.ifdef-_bH5_o_oMP-WEIXIN_B_cbg-blue-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(96, 165, 250, var(--tw-bg-opacity, 1));
}
.ifdef-_bMP-WEIXIN_B_cbg-_b_h1167ff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(17, 103, 255, var(--tw-bg-opacity, 1));
}
.ifdef-_bMP-WEIXIN_B_cbg-blue-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(59, 130, 246, var(--tw-bg-opacity, 1));
}
.ifndef-_bH5_B_ctext-_b_h0055aa_B {
  --tw-text-opacity: 1;
  color: rgba(0, 85, 170, var(--tw-text-opacity, 1));
}
.wx_cbg-blue-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(96, 165, 250, var(--tw-bg-opacity, 1));
}
.mv_cbg-blue-400 {
  --tw-bg-opacity: 1;
  background-color: rgba(96, 165, 250, var(--tw-bg-opacity, 1));
}
.dark view.dark_cbg-green-500,
.dark text.dark_cbg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1));
}
.dark view.dark_cbg-zinc-800,
.dark text.dark_cbg-zinc-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(39, 39, 42, var(--tw-bg-opacity, 1));
}
.dark view.dark_ctext-yellow-400,
.dark text.dark_ctext-yellow-400 {
  --tw-text-opacity: 1;
  color: rgba(250, 204, 21, var(--tw-text-opacity, 1));
}
@media (min-width: 1536px) {
  ._2xl_ctext-base {
    font-size: 32rpx;
    line-height: 48rpx;
  }
  ._2xl_ctext-_bred_B {
    --tw-text-opacity: 1;
    color: rgba(255, 0, 0, var(--tw-text-opacity, 1));
  }
}
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  --tw-text-opacity: 1 !important;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1)) !important;
}
.peer ~ .peer-xxx {
  color: red;
}
.xxx ~ .xxx-invalid:visible {
  visibility: visible;
}
.peersdraft ~ .peer-checkedsdraftctext-sky-500 {
  --tw-text-opacity: 1;
  color: rgb(14, 165, 233, var(--tw-text-opacity));
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

### typography.wxss

```css
::before,
::after {
  --tw-content: '';
}
view,
text,
::after,
::before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:;
  --tw-pan-y:;
  --tw-pinch-zoom:;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:;
  --tw-gradient-via-position:;
  --tw-gradient-to-position:;
  --tw-ordinal:;
  --tw-slashed-zero:;
  --tw-numeric-figure:;
  --tw-numeric-spacing:;
  --tw-numeric-fraction:;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-colored: 0 0 rgba(0, 0, 0, 0);
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
  --tw-contain-size:;
  --tw-contain-layout:;
  --tw-contain-paint:;
  --tw-contain-style:;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
.prose {
  color: var(--tw-prose-body);
  max-width: 65ch;
}
.prose .p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}
.prose [class~='lead'] {
  color: var(--tw-prose-lead);
  font-size: 1.25em;
  line-height: 1.6;
  margin-top: 1.2em;
  margin-bottom: 1.2em;
}
.prose .a {
  color: var(--tw-prose-links);
  text-decoration: underline;
  font-weight: 500;
}
.prose .strong {
  color: var(--tw-prose-bold);
  font-weight: 600;
}
.prose .a .strong {
  color: inherit;
}
.prose .blockquote .strong {
  color: inherit;
}
.prose .thead .th .strong {
  color: inherit;
}
.prose .ol {
  list-style-type: decimal;
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  padding-left: 1.625em;
}
.prose .ol[type='A'] {
  list-style-type: upper-alpha;
}
.prose .ol[type='a'] {
  list-style-type: lower-alpha;
}
.prose .ol[type='I'] {
  list-style-type: upper-roman;
}
.prose .ol[type='i'] {
  list-style-type: lower-roman;
}
.prose .ol[type='1'] {
  list-style-type: decimal;
}
.prose .ul {
  list-style-type: disc;
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  padding-left: 1.625em;
}
.prose .ol > .li::marker {
  font-weight: 400;
  color: var(--tw-prose-counters);
}
.prose .ul > .li::marker {
  color: var(--tw-prose-bullets);
}
.prose .dt {
  color: var(--tw-prose-headings);
  font-weight: 600;
  margin-top: 1.25em;
}
.prose .hr {
  border-color: var(--tw-prose-hr);
  border-top-width: 1rpx;
  margin-top: 3em;
  margin-bottom: 3em;
}
.prose .blockquote {
  font-weight: 500;
  font-style: italic;
  color: var(--tw-prose-quotes);
  border-left-width: 8rpx;
  border-left-color: var(--tw-prose-quote-borders);
  quotes: '“' '”' '‘' '’';
  margin-top: 1.6em;
  margin-bottom: 1.6em;
  padding-left: 1em;
}
.prose .blockquote .p:first-of-type::before {
  content: open-quote;
}
.prose .blockquote .p:last-of-type::after {
  content: close-quote;
}
.prose .h1 {
  color: var(--tw-prose-headings);
  font-weight: 800;
  font-size: 2.25em;
  margin-top: 0;
  margin-bottom: 0.8888889em;
  line-height: 1.1111111;
}
.prose .h1 .strong {
  font-weight: 900;
  color: inherit;
}
.prose .h2 {
  color: var(--tw-prose-headings);
  font-weight: 700;
  font-size: 1.5em;
  margin-top: 2em;
  margin-bottom: 1em;
  line-height: 1.3333333;
}
.prose .h2 .strong {
  font-weight: 800;
  color: inherit;
}
.prose .h3 {
  color: var(--tw-prose-headings);
  font-weight: 600;
  font-size: 1.25em;
  margin-top: 1.6em;
  margin-bottom: 0.6em;
  line-height: 1.6;
}
.prose .h3 .strong {
  font-weight: 700;
  color: inherit;
}
.prose .h4 {
  color: var(--tw-prose-headings);
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  line-height: 1.5;
}
.prose .h4 .strong {
  font-weight: 700;
  color: inherit;
}
.prose .img {
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose .picture {
  display: block;
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose .kbd {
  font-weight: 500;
  font-family: inherit;
  color: var(--tw-prose-kbd);
  box-shadow:
    0 0 0 1rpx rgb(var(--tw-prose-kbd-shadows) / 10%),
    0 3rpx 0 rgb(var(--tw-prose-kbd-shadows) / 10%);
  font-size: 0.875em;
  border-radius: 10rpx;
  padding-top: 0.1875em;
  padding-right: 0.375em;
  padding-bottom: 0.1875em;
  padding-left: 0.375em;
}
.prose .code {
  color: var(--tw-prose-code);
  font-weight: 600;
  font-size: 0.875em;
}
.prose .code::before {
  content: '`';
}
.prose .code::after {
  content: '`';
}
.prose .a .code {
  color: inherit;
}
.prose .h1 .code {
  color: inherit;
}
.prose .h2 .code {
  color: inherit;
  font-size: 0.875em;
}
.prose .h3 .code {
  color: inherit;
  font-size: 0.9em;
}
.prose .h4 .code {
  color: inherit;
}
.prose .blockquote .code {
  color: inherit;
}
.prose .thead .th .code {
  color: inherit;
}
.prose .pre {
  color: var(--tw-prose-pre-code);
  background-color: var(--tw-prose-pre-bg);
  overflow-x: auto;
  font-weight: 400;
  font-size: 0.875em;
  line-height: 1.7142857;
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
  border-radius: 12rpx;
  padding-top: 0.8571429em;
  padding-right: 1.1428571em;
  padding-bottom: 0.8571429em;
  padding-left: 1.1428571em;
}
.prose .pre .code {
  background-color: transparent;
  border-width: 0;
  border-radius: 0;
  padding: 0;
  font-weight: inherit;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
}
.prose .pre .code::before {
  content: none;
}
.prose .pre .code::after {
  content: none;
}
.prose .table {
  width: 100%;
  table-layout: auto;
  text-align: left;
  margin-top: 2em;
  margin-bottom: 2em;
  font-size: 0.875em;
  line-height: 1.7142857;
}
.prose .thead {
  border-bottom-width: 1rpx;
  border-bottom-color: var(--tw-prose-th-borders);
}
.prose .thead .th {
  color: var(--tw-prose-headings);
  font-weight: 600;
  vertical-align: bottom;
  padding-right: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-left: 0.5714286em;
}
.prose .tbody .tr {
  border-bottom-width: 1rpx;
  border-bottom-color: var(--tw-prose-td-borders);
}
.prose .tbody .tr:last-child {
  border-bottom-width: 0;
}
.prose .tbody .td {
  vertical-align: baseline;
}
.prose .tfoot {
  border-top-width: 1rpx;
  border-top-color: var(--tw-prose-th-borders);
}
.prose .tfoot .td {
  vertical-align: top;
}
.prose .figure > view,
.prose .figure > text {
  margin-top: 0;
  margin-bottom: 0;
}
.prose .figcaption {
  color: var(--tw-prose-captions);
  font-size: 0.875em;
  line-height: 1.4285714;
  margin-top: 0.8571429em;
}
.prose {
  --tw-prose-body: #374151;
  --tw-prose-headings: #111827;
  --tw-prose-lead: #4b5563;
  --tw-prose-links: #111827;
  --tw-prose-bold: #111827;
  --tw-prose-counters: #6b7280;
  --tw-prose-bullets: #d1d5db;
  --tw-prose-hr: #e5e7eb;
  --tw-prose-quotes: #111827;
  --tw-prose-quote-borders: #e5e7eb;
  --tw-prose-captions: #6b7280;
  --tw-prose-kbd: #111827;
  --tw-prose-kbd-shadows: 17 24 39;
  --tw-prose-code: #111827;
  --tw-prose-pre-code: #e5e7eb;
  --tw-prose-pre-bg: #1f2937;
  --tw-prose-th-borders: #d1d5db;
  --tw-prose-td-borders: #e5e7eb;
  --tw-prose-invert-body: #d1d5db;
  --tw-prose-invert-headings: #fff;
  --tw-prose-invert-lead: #9ca3af;
  --tw-prose-invert-links: #fff;
  --tw-prose-invert-bold: #fff;
  --tw-prose-invert-counters: #9ca3af;
  --tw-prose-invert-bullets: #4b5563;
  --tw-prose-invert-hr: #374151;
  --tw-prose-invert-quotes: #f3f4f6;
  --tw-prose-invert-quote-borders: #374151;
  --tw-prose-invert-captions: #9ca3af;
  --tw-prose-invert-kbd: #fff;
  --tw-prose-invert-kbd-shadows: 255 255 255;
  --tw-prose-invert-code: #fff;
  --tw-prose-invert-pre-code: #d1d5db;
  --tw-prose-invert-pre-bg: rgba(0, 0, 0, 0.5);
  --tw-prose-invert-th-borders: #4b5563;
  --tw-prose-invert-td-borders: #374151;
  font-size: 32rpx;
  line-height: 1.75;
}
.prose .picture > .img {
  margin-top: 0;
  margin-bottom: 0;
}
.prose .video {
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose .li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
.prose .ol > .li {
  padding-left: 0.375em;
}
.prose .ul > .li {
  padding-left: 0.375em;
}
.prose > .ul > .li .p {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}
.prose > .ul > .li > view:first-child {
  margin-top: 1.25em;
}
.prose > .ul > .li > text:first-child {
  margin-top: 1.25em;
}
.prose > .ul > .li > view:last-child {
  margin-bottom: 1.25em;
}
.prose > .ul > .li > text:last-child {
  margin-bottom: 1.25em;
}
.prose > .ol > .li > view:first-child {
  margin-top: 1.25em;
}
.prose > .ol > .li > text:first-child {
  margin-top: 1.25em;
}
.prose > .ol > .li > view:last-child {
  margin-bottom: 1.25em;
}
.prose > .ol > .li > text:last-child {
  margin-bottom: 1.25em;
}
.prose .ul .ul,
.prose .ul .ol,
.prose .ol .ul,
.prose .ol .ol {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
}
.prose .dl {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}
.prose .dd {
  margin-top: 0.5em;
  padding-left: 1.625em;
}
.prose .hr + view,
.prose .hr + text {
  margin-top: 0;
}
.prose .h2 + view,
.prose .h2 + text {
  margin-top: 0;
}
.prose .h3 + view,
.prose .h3 + text {
  margin-top: 0;
}
.prose .h4 + view,
.prose .h4 + text {
  margin-top: 0;
}
.prose .thead .th:first-child {
  padding-left: 0;
}
.prose .thead .th:last-child {
  padding-right: 0;
}
.prose .tbody .td,
.prose .tfoot .td {
  padding-top: 0.5714286em;
  padding-right: 0.5714286em;
  padding-bottom: 0.5714286em;
  padding-left: 0.5714286em;
}
.prose .tbody .td:first-child,
.prose .tfoot .td:first-child {
  padding-left: 0;
}
.prose .tbody .td:last-child,
.prose .tfoot .td:last-child {
  padding-right: 0;
}
.prose .figure {
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose-sm {
  font-size: 28rpx;
  line-height: 1.7142857;
}
.prose-sm .p {
  margin-top: 1.1428571em;
  margin-bottom: 1.1428571em;
}
.prose-sm [class~='lead'] {
  font-size: 1.2857143em;
  line-height: 1.5555556;
  margin-top: 0.8888889em;
  margin-bottom: 0.8888889em;
}
.prose-sm .blockquote {
  margin-top: 1.3333333em;
  margin-bottom: 1.3333333em;
  padding-left: 1.1111111em;
}
.prose-sm .h1 {
  font-size: 2.1428571em;
  margin-top: 0;
  margin-bottom: 0.8em;
  line-height: 1.2;
}
.prose-sm .h2 {
  font-size: 1.4285714em;
  margin-top: 1.6em;
  margin-bottom: 0.8em;
  line-height: 1.4;
}
.prose-sm .h3 {
  font-size: 1.2857143em;
  margin-top: 1.5555556em;
  margin-bottom: 0.4444444em;
  line-height: 1.5555556;
}
.prose-sm .h4 {
  margin-top: 1.4285714em;
  margin-bottom: 0.5714286em;
  line-height: 1.4285714;
}
.prose-sm .img {
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
}
.prose-sm .picture {
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
}
.prose-sm .picture > .img {
  margin-top: 0;
  margin-bottom: 0;
}
.prose-sm .video {
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
}
.prose-sm .kbd {
  font-size: 0.8571429em;
  border-radius: 10rpx;
  padding-top: 0.1428571em;
  padding-right: 0.3571429em;
  padding-bottom: 0.1428571em;
  padding-left: 0.3571429em;
}
.prose-sm .code {
  font-size: 0.8571429em;
}
.prose-sm .h2 .code {
  font-size: 0.9em;
}
.prose-sm .h3 .code {
  font-size: 0.8888889em;
}
.prose-sm .pre {
  font-size: 0.8571429em;
  line-height: 1.6666667;
  margin-top: 1.6666667em;
  margin-bottom: 1.6666667em;
  border-radius: 8rpx;
  padding-top: 0.6666667em;
  padding-right: 1em;
  padding-bottom: 0.6666667em;
  padding-left: 1em;
}
.prose-sm .ol {
  margin-top: 1.1428571em;
  margin-bottom: 1.1428571em;
  padding-left: 1.5714286em;
}
.prose-sm .ul {
  margin-top: 1.1428571em;
  margin-bottom: 1.1428571em;
  padding-left: 1.5714286em;
}
.prose-sm .li {
  margin-top: 0.2857143em;
  margin-bottom: 0.2857143em;
}
.prose-sm .ol > .li {
  padding-left: 0.4285714em;
}
.prose-sm .ul > .li {
  padding-left: 0.4285714em;
}
.prose-sm > .ul > .li .p {
  margin-top: 0.5714286em;
  margin-bottom: 0.5714286em;
}
.prose-sm > .ul > .li > view:first-child {
  margin-top: 1.1428571em;
}
.prose-sm > .ul > .li > text:first-child {
  margin-top: 1.1428571em;
}
.prose-sm > .ul > .li > view:last-child {
  margin-bottom: 1.1428571em;
}
.prose-sm > .ul > .li > text:last-child {
  margin-bottom: 1.1428571em;
}
.prose-sm > .ol > .li > view:first-child {
  margin-top: 1.1428571em;
}
.prose-sm > .ol > .li > text:first-child {
  margin-top: 1.1428571em;
}
.prose-sm > .ol > .li > view:last-child {
  margin-bottom: 1.1428571em;
}
.prose-sm > .ol > .li > text:last-child {
  margin-bottom: 1.1428571em;
}
.prose-sm .ul .ul,
.prose-sm .ul .ol,
.prose-sm .ol .ul,
.prose-sm .ol .ol {
  margin-top: 0.5714286em;
  margin-bottom: 0.5714286em;
}
.prose-sm .dl {
  margin-top: 1.1428571em;
  margin-bottom: 1.1428571em;
}
.prose-sm .dt {
  margin-top: 1.1428571em;
}
.prose-sm .dd {
  margin-top: 0.2857143em;
  padding-left: 1.5714286em;
}
.prose-sm .hr {
  margin-top: 2.8571429em;
  margin-bottom: 2.8571429em;
}
.prose-sm .hr + view,
.prose-sm .hr + text {
  margin-top: 0;
}
.prose-sm .h2 + view,
.prose-sm .h2 + text {
  margin-top: 0;
}
.prose-sm .h3 + view,
.prose-sm .h3 + text {
  margin-top: 0;
}
.prose-sm .h4 + view,
.prose-sm .h4 + text {
  margin-top: 0;
}
.prose-sm .table {
  font-size: 0.8571429em;
  line-height: 1.5;
}
.prose-sm .thead .th {
  padding-right: 1em;
  padding-bottom: 0.6666667em;
  padding-left: 1em;
}
.prose-sm .thead .th:first-child {
  padding-left: 0;
}
.prose-sm .thead .th:last-child {
  padding-right: 0;
}
.prose-sm .tbody .td,
.prose-sm .tfoot .td {
  padding-top: 0.6666667em;
  padding-right: 1em;
  padding-bottom: 0.6666667em;
  padding-left: 1em;
}
.prose-sm .tbody .td:first-child,
.prose-sm .tfoot .td:first-child {
  padding-left: 0;
}
.prose-sm .tbody .td:last-child,
.prose-sm .tfoot .td:last-child {
  padding-right: 0;
}
.prose-sm .figure {
  margin-top: 1.7142857em;
  margin-bottom: 1.7142857em;
}
.prose-sm .figure > view,
.prose-sm .figure > text {
  margin-top: 0;
  margin-bottom: 0;
}
.prose-sm .figcaption {
  font-size: 0.8571429em;
  line-height: 1.3333333;
  margin-top: 0.6666667em;
}
.prose-2xl {
  font-size: 48rpx;
  line-height: 1.6666667;
}
.prose-2xl .p {
  margin-top: 1.3333333em;
  margin-bottom: 1.3333333em;
}
.prose-2xl [class~='lead'] {
  font-size: 1.25em;
  line-height: 1.4666667;
  margin-top: 1.0666667em;
  margin-bottom: 1.0666667em;
}
.prose-2xl .blockquote {
  margin-top: 1.7777778em;
  margin-bottom: 1.7777778em;
  padding-left: 1.1111111em;
}
.prose-2xl .h1 {
  font-size: 2.6666667em;
  margin-top: 0;
  margin-bottom: 0.875em;
  line-height: 1;
}
.prose-2xl .h2 {
  font-size: 2em;
  margin-top: 1.5em;
  margin-bottom: 0.8333333em;
  line-height: 1.0833333;
}
.prose-2xl .h3 {
  font-size: 1.5em;
  margin-top: 1.5555556em;
  margin-bottom: 0.6666667em;
  line-height: 1.2222222;
}
.prose-2xl .h4 {
  margin-top: 1.6666667em;
  margin-bottom: 0.6666667em;
  line-height: 1.5;
}
.prose-2xl .img {
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose-2xl .picture {
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose-2xl .picture > .img {
  margin-top: 0;
  margin-bottom: 0;
}
.prose-2xl .video {
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose-2xl .kbd {
  font-size: 0.8333333em;
  border-radius: 12rpx;
  padding-top: 0.25em;
  padding-right: 0.3333333em;
  padding-bottom: 0.25em;
  padding-left: 0.3333333em;
}
.prose-2xl .code {
  font-size: 0.8333333em;
}
.prose-2xl .h2 .code {
  font-size: 0.875em;
}
.prose-2xl .h3 .code {
  font-size: 0.8888889em;
}
.prose-2xl .pre {
  font-size: 0.8333333em;
  line-height: 1.8;
  margin-top: 2em;
  margin-bottom: 2em;
  border-radius: 16rpx;
  padding-top: 1.2em;
  padding-right: 1.6em;
  padding-bottom: 1.2em;
  padding-left: 1.6em;
}
.prose-2xl .ol {
  margin-top: 1.3333333em;
  margin-bottom: 1.3333333em;
  padding-left: 1.5833333em;
}
.prose-2xl .ul {
  margin-top: 1.3333333em;
  margin-bottom: 1.3333333em;
  padding-left: 1.5833333em;
}
.prose-2xl .li {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}
.prose-2xl .ol > .li {
  padding-left: 0.4166667em;
}
.prose-2xl .ul > .li {
  padding-left: 0.4166667em;
}
.prose-2xl > .ul > .li .p {
  margin-top: 0.8333333em;
  margin-bottom: 0.8333333em;
}
.prose-2xl > .ul > .li > view:first-child {
  margin-top: 1.3333333em;
}
.prose-2xl > .ul > .li > text:first-child {
  margin-top: 1.3333333em;
}
.prose-2xl > .ul > .li > view:last-child {
  margin-bottom: 1.3333333em;
}
.prose-2xl > .ul > .li > text:last-child {
  margin-bottom: 1.3333333em;
}
.prose-2xl > .ol > .li > view:first-child {
  margin-top: 1.3333333em;
}
.prose-2xl > .ol > .li > text:first-child {
  margin-top: 1.3333333em;
}
.prose-2xl > .ol > .li > view:last-child {
  margin-bottom: 1.3333333em;
}
.prose-2xl > .ol > .li > text:last-child {
  margin-bottom: 1.3333333em;
}
.prose-2xl .ul .ul,
.prose-2xl .ul .ol,
.prose-2xl .ol .ul,
.prose-2xl .ol .ol {
  margin-top: 0.6666667em;
  margin-bottom: 0.6666667em;
}
.prose-2xl .dl {
  margin-top: 1.3333333em;
  margin-bottom: 1.3333333em;
}
.prose-2xl .dt {
  margin-top: 1.3333333em;
}
.prose-2xl .dd {
  margin-top: 0.5em;
  padding-left: 1.5833333em;
}
.prose-2xl .hr {
  margin-top: 3em;
  margin-bottom: 3em;
}
.prose-2xl .hr + view,
.prose-2xl .hr + text {
  margin-top: 0;
}
.prose-2xl .h2 + view,
.prose-2xl .h2 + text {
  margin-top: 0;
}
.prose-2xl .h3 + view,
.prose-2xl .h3 + text {
  margin-top: 0;
}
.prose-2xl .h4 + view,
.prose-2xl .h4 + text {
  margin-top: 0;
}
.prose-2xl .table {
  font-size: 0.8333333em;
  line-height: 1.4;
}
.prose-2xl .thead .th {
  padding-right: 0.6em;
  padding-bottom: 0.8em;
  padding-left: 0.6em;
}
.prose-2xl .thead .th:first-child {
  padding-left: 0;
}
.prose-2xl .thead .th:last-child {
  padding-right: 0;
}
.prose-2xl .tbody .td,
.prose-2xl .tfoot .td {
  padding-top: 0.8em;
  padding-right: 0.6em;
  padding-bottom: 0.8em;
  padding-left: 0.6em;
}
.prose-2xl .tbody .td:first-child,
.prose-2xl .tfoot .td:first-child {
  padding-left: 0;
}
.prose-2xl .tbody .td:last-child,
.prose-2xl .tfoot .td:last-child {
  padding-right: 0;
}
.prose-2xl .figure {
  margin-top: 2em;
  margin-bottom: 2em;
}
.prose-2xl .figure > view,
.prose-2xl .figure > text {
  margin-top: 0;
  margin-bottom: 0;
}
.prose-2xl .figcaption {
  font-size: 0.8333333em;
  line-height: 1.6;
  margin-top: 1em;
}
.prose-headings_cbg-red-100 .h1 {
  --tw-bg-opacity: 1;
  background-color: rgba(254, 226, 226, var(--tw-bg-opacity, 1));
}
.prose-headings_cbg-red-100 .h2 {
  --tw-bg-opacity: 1;
  background-color: rgba(254, 226, 226, var(--tw-bg-opacity, 1));
}
.prose-headings_cbg-red-100 .h3 {
  --tw-bg-opacity: 1;
  background-color: rgba(254, 226, 226, var(--tw-bg-opacity, 1));
}
.prose-headings_cbg-red-100 .h4 {
  --tw-bg-opacity: 1;
  background-color: rgba(254, 226, 226, var(--tw-bg-opacity, 1));
}
.prose-headings_cbg-red-100 .h5 {
  --tw-bg-opacity: 1;
  background-color: rgba(254, 226, 226, var(--tw-bg-opacity, 1));
}
.prose-headings_cbg-red-100 .h6 {
  --tw-bg-opacity: 1;
  background-color: rgba(254, 226, 226, var(--tw-bg-opacity, 1));
}
.prose-headings_cbg-red-100 .th {
  --tw-bg-opacity: 1;
  background-color: rgba(254, 226, 226, var(--tw-bg-opacity, 1));
}
.prose-h1_ctext-sky-500 .h1 {
  --tw-text-opacity: 1;
  color: rgba(14, 165, 233, var(--tw-text-opacity, 1));
}
.prose-h2_ctext-yellow-500 .h2 {
  --tw-text-opacity: 1;
  color: rgba(234, 179, 8, var(--tw-text-opacity, 1));
}
.prose-h5_ctext-green-400 .h5 {
  --tw-text-opacity: 1;
  color: rgba(74, 222, 128, var(--tw-text-opacity, 1));
}
```

### u-button.wxss

```css
.u-button.data-v-e43777a0 {
  width: 100%;
  white-space: nowrap;
}
.u-button__text.data-v-e43777a0 {
  white-space: nowrap;
  line-height: 1;
}
.u-button.data-v-e43777a0::before {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  border: inherit;
  border-radius: inherit;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  opacity: 0;
  content: ' ';
  background-color: #000;
  border-color: #000;
}
.u-button--active.data-v-e43777a0::before {
  opacity: 0.15;
}
.u-button__icon + .u-button__text.data-v-e43777a0:not(:empty),
.u-button__loading-text.data-v-e43777a0 {
  margin-left: 4rpx;
}
.u-button--plain.u-button--primary.data-v-e43777a0 {
  color: var(--up-primary, var(--u-primary, #3c9cff));
}
.u-button--plain.u-button--info.data-v-e43777a0 {
  color: var(--up-info, var(--u-info, #909399));
}
.u-button--plain.u-button--success.data-v-e43777a0 {
  color: var(--up-success, var(--u-success, #5ac725));
}
.u-button--plain.u-button--error.data-v-e43777a0 {
  color: var(--up-error, var(--u-error, #f56c6c));
}
.u-button--plain.u-button--warning.data-v-e43777a0 {
  color: var(--up-warning, var(--u-warning, #f9ae3d));
}
.u-button.data-v-e43777a0 {
  height: 40rpx;
  position: relative;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
}
.u-button__text.data-v-e43777a0 {
  font-size: 15rpx;
}
.u-button__loading-text.data-v-e43777a0 {
  font-size: 15rpx;
  margin-left: 4rpx;
}
.u-button--large.data-v-e43777a0 {
  width: 100%;
  height: 50rpx;
  padding: 0 15rpx;
}
.u-button--normal.data-v-e43777a0 {
  padding: 0 12rpx;
  font-size: 14rpx;
}
.u-button--small.data-v-e43777a0 {
  min-width: 60rpx;
  height: 30rpx;
  padding: 0rpx 8rpx;
  font-size: 12rpx;
}
.u-button--mini.data-v-e43777a0 {
  height: 22rpx;
  font-size: 10rpx;
  min-width: 50rpx;
  padding: 0rpx 8rpx;
}
.u-button--disabled.data-v-e43777a0 {
  opacity: 0.5;
}
.u-button--info.data-v-e43777a0 {
  color: var(--up-main-color, var(--u-main-color, #303133));
  background-color: var(--up-button-info-background-color, var(--up-card-bg-color, #fff));
  border-color: var(--up-border-color, var(--u-border-color, #dadbde));
  border-width: 1rpx;
  border-style: solid;
}
.u-button--success.data-v-e43777a0 {
  color: #fff;
  background-color: var(--up-success, var(--u-success, #5ac725));
  border-color: var(--up-success, var(--u-success, #5ac725));
  border-width: 1rpx;
  border-style: solid;
}
.u-button--primary.data-v-e43777a0 {
  color: #fff;
  background-color: var(--up-primary, var(--u-primary, #3c9cff));
  border-color: var(--up-primary, var(--u-primary, #3c9cff));
  border-width: 1rpx;
  border-style: solid;
}
.u-button--error.data-v-e43777a0 {
  color: #fff;
  background-color: var(--up-error, var(--u-error, #f56c6c));
  border-color: var(--up-error, var(--u-error, #f56c6c));
  border-width: 1rpx;
  border-style: solid;
}
.u-button--warning.data-v-e43777a0 {
  color: #fff;
  background-color: var(--up-warning, var(--u-warning, #f9ae3d));
  border-color: var(--up-warning, var(--u-warning, #f9ae3d));
  border-width: 1rpx;
  border-style: solid;
}
.u-button--block.data-v-e43777a0 {
  display: flex;
  flex-direction: row;
  width: 100%;
}
.u-button--circle.data-v-e43777a0 {
  border-top-right-radius: 100rpx;
  border-top-left-radius: 100rpx;
  border-bottom-left-radius: 100rpx;
  border-bottom-right-radius: 100rpx;
}
.u-button--square.data-v-e43777a0 {
  border-bottom-left-radius: 3rpx;
  border-bottom-right-radius: 3rpx;
  border-top-left-radius: 3rpx;
  border-top-right-radius: 3rpx;
}
.u-button__icon.data-v-e43777a0 {
  min-width: 1em;
  line-height: inherit !important;
  vertical-align: top;
}
.u-button--plain.data-v-e43777a0 {
  background-color: var(--up-button-plain-background-color, var(--up-card-bg-color, #fff));
}
.u-button--hairline.data-v-e43777a0 {
  border-width: 0.5rpx !important;
}
```

### u-loading-icon.wxss

```css
.u-loading-icon.data-v-882a8a56 {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: #c8c9cc;
}
.u-loading-icon__text.data-v-882a8a56 {
  margin-left: 4rpx;
  color: var(--up-content-color, var(--u-content-color, #606266));
  font-size: 14rpx;
  line-height: 20rpx;
}
.u-loading-icon__spinner.data-v-882a8a56 {
  width: 30rpx;
  height: 30rpx;
  position: relative;
  box-sizing: border-box;
  max-width: 100%;
  max-height: 100%;
  -webkit-animation: u-rotate-882a8a56 1s linear infinite;
  animation: u-rotate-882a8a56 1s linear infinite;
}
.u-loading-icon__spinner--semicircle.data-v-882a8a56 {
  border-width: 2rpx;
  border-color: transparent;
  border-top-right-radius: 100rpx;
  border-top-left-radius: 100rpx;
  border-bottom-left-radius: 100rpx;
  border-bottom-right-radius: 100rpx;
  border-style: solid;
}
.u-loading-icon__spinner--circle.data-v-882a8a56 {
  border-top-right-radius: 100rpx;
  border-top-left-radius: 100rpx;
  border-bottom-left-radius: 100rpx;
  border-bottom-right-radius: 100rpx;
  border-width: 2rpx;
  border-top-color: #e5e5e5;
  border-right-color: #e5e5e5;
  border-bottom-color: #e5e5e5;
  border-left-color: #e5e5e5;
  border-style: solid;
}
.u-loading-icon--vertical.data-v-882a8a56 {
  flex-direction: column;
}
.data-v-882a8a56:host {
  font-size: 0rpx;
  line-height: 1;
}
.u-loading-icon__spinner--spinner.data-v-882a8a56 {
  -webkit-animation-timing-function: steps(12);
  animation-timing-function: steps(12);
}
.u-loading-icon__text.data-v-882a8a56:empty {
  display: none;
}
.u-loading-icon--vertical .u-loading-icon__text.data-v-882a8a56 {
  margin: 6rpx 0 0;
  color: var(--up-content-color, var(--u-content-color, #606266));
}
.u-loading-icon__dot.data-v-882a8a56 {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.u-loading-icon__dot.data-v-882a8a56::before {
  display: block;
  width: 2rpx;
  height: 25%;
  margin: 0 auto;
  background-color: currentColor;
  border-radius: 40%;
  content: ' ';
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(1) {
  -webkit-transform: rotate(30deg);
  transform: rotate(30deg);
  opacity: 1;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(2) {
  -webkit-transform: rotate(60deg);
  transform: rotate(60deg);
  opacity: 0.9375;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(3) {
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
  opacity: 0.875;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(4) {
  -webkit-transform: rotate(120deg);
  transform: rotate(120deg);
  opacity: 0.8125;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(5) {
  -webkit-transform: rotate(150deg);
  transform: rotate(150deg);
  opacity: 0.75;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(6) {
  -webkit-transform: rotate(180deg);
  transform: rotate(180deg);
  opacity: 0.6875;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(7) {
  -webkit-transform: rotate(210deg);
  transform: rotate(210deg);
  opacity: 0.625;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(8) {
  -webkit-transform: rotate(240deg);
  transform: rotate(240deg);
  opacity: 0.5625;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(9) {
  -webkit-transform: rotate(270deg);
  transform: rotate(270deg);
  opacity: 0.5;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(10) {
  -webkit-transform: rotate(300deg);
  transform: rotate(300deg);
  opacity: 0.4375;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(11) {
  -webkit-transform: rotate(330deg);
  transform: rotate(330deg);
  opacity: 0.375;
}
.u-loading-icon__dot.data-v-882a8a56:nth-of-type(12) {
  -webkit-transform: rotate(360deg);
  transform: rotate(360deg);
  opacity: 0.3125;
}
@-webkit-keyframes u-rotate-882a8a56 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}
@keyframes u-rotate-882a8a56 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}
```
