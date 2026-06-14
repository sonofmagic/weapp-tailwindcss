# taro-vite-vue3-tailwindcss-v3 CSS Output

Fixture: demo
Entry: taro-vite-vue3-tailwindcss-v3/dist/app.wxss
Generator CSS files: app.wxss, app-origin.wxss, sub-independent/pages/index.wxss, sub-normal/pages/index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| 8703 | 45 | false | false | false | true | true | false | true |

## Generator CSS Summary

| File | Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| `app.wxss` | 27 | 0 | false | false | false | false | false | false | false |
| `app-origin.wxss` | 5141 | 43 | false | false | false | true | true | false | true |
| `sub-independent/pages/index.wxss` | 1775 | 2 | false | false | false | false | false | false | true |
| `sub-normal/pages/index.wxss` | 1760 | 2 | false | false | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
@import 'app-origin.wxss';
```

### app-origin.wxss

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
.mt-2 {
  margin-top: 16rpx;
}
.mt-4 {
  margin-top: 32rpx;
}
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.divide-x-8 > view + view,
.divide-x-8 > view + text,
.divide-x-8 > text + view,
.divide-x-8 > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(8rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(8rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  border-style: solid;
}
.divide-_b_h60d256_B > view + view,
.divide-_b_h60d256_B > view + text,
.divide-_b_h60d256_B > text + view,
.divide-_b_h60d256_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(96, 210, 86, var(--tw-divide-opacity, 1));
}
.rounded {
  border-radius: 8rpx;
}
.bg-_b_h89ab8d_B {
  --tw-bg-opacity: 1;
  background-color: rgba(137, 171, 141, var(--tw-bg-opacity, 1));
}
.bg-_b_he24826_B {
  --tw-bg-opacity: 1;
  background-color: rgba(226, 72, 38, var(--tw-bg-opacity, 1));
}
.bg-white {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity, 1));
}
.px-3 {
  padding-left: 24rpx;
  padding-right: 24rpx;
}
.px-4 {
  padding-left: 32rpx;
  padding-right: 32rpx;
}
.py-2 {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}
.py-3 {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
}
.text-_b66rpx_B {
  font-size: 66rpx;
}
.text-_b_h3d31a4_B {
  --tw-text-opacity: 1;
  color: rgba(61, 49, 164, var(--tw-text-opacity, 1));
}
.text-_b_h438821_B {
  --tw-text-opacity: 1;
  color: rgba(67, 136, 33, var(--tw-text-opacity, 1));
}
.text-slate-900 {
  --tw-text-opacity: 1;
  color: rgba(15, 23, 42, var(--tw-text-opacity, 1));
}
.before_ccontent-_b_a11111_a_B::before {
  --tw-content: '11111';
  content: var(--tw-content);
}
.before_ccontent-_b_a222_a_B::before {
  --tw-content: '222';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  .system-dark_cbg-slate-900 {
    --tw-bg-opacity: 1;
    background-color: rgba(15, 23, 42, var(--tw-bg-opacity, 1));
  }
  .system-dark_ctext-slate-100 {
    --tw-text-opacity: 1;
    color: rgba(241, 245, 249, var(--tw-text-opacity, 1));
  }
}
.theme-dark_cbg-zinc-900.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
.theme-dark_cbg-zinc-950.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
.theme-dark_ctext-zinc-50.theme-dark {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
.theme-dark .theme-dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
.theme-dark .theme-dark_cbg-zinc-950 {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
.theme-dark .theme-dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-900 {
    --tw-bg-opacity: 1;
    background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
  }
  .dark_ctext-_b_hec4f4f_B {
    --tw-text-opacity: 1;
    color: rgba(236, 79, 79, var(--tw-text-opacity, 1));
  }
  .dark_ctext-zinc-50 {
    --tw-text-opacity: 1;
    color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
  }
}
```

### sub-independent/pages/index.wxss

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
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.bg-independent-subpackage-marker {
  --tw-bg-opacity: 1;
  background-color: rgba(220, 38, 38, var(--tw-bg-opacity, 1));
}
```

### sub-normal/pages/index.wxss

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
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.bg-normal-subpackage-marker {
  --tw-bg-opacity: 1;
  background-color: rgba(37, 99, 235, var(--tw-bg-opacity, 1));
}
```
