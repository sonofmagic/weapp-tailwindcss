# taro-vite-vue3-tailwindcss-v3 CSS Output

Fixture: demo
Entry: taro-vite-vue3-tailwindcss-v3/dist/app.wxss
Generator CSS files: app.wxss, app-origin.wxss, index.wxss, index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 9273 | 26 | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
@import 'app-origin.wxss';
/* tokens: flex <= src/pages/index/index.vue, src/pages/index/test.vue */
/* tokens: flex-col <= src/pages/index/index.vue, src/pages/index/test.vue */
/* tokens: divide-x-8 <= src/pages/index/index.vue, src/pages/index/test.vue */
/* tokens: divide-solid <= src/pages/index/index.vue, src/pages/index/test.vue */
/* tokens: divide-[#60d256] <= src/pages/index/index.vue, src/pages/index/test.vue */
/* tokens: bg-[#89ab8d] <= src/pages/index/index.vue, src/pages/index/test.vue */
/* tokens: bg-[#e24826] <= src/pages/index/test.vue */
/* tokens: text-[66rpx] <= src/pages/index/test.vue */
/* tokens: text-[#3d31a4] <= src/pages/index/index.vue, src/pages/index/test.vue */
/* tokens: text-[#438821] <= src/pages/index/index.vue, src/pages/index/test.vue */
/* tokens: before:content-['11111'] <= src/pages/index/index.vue, src/pages/index/test.vue */
/* tokens: before:content-['222'] <= src/pages/index/index.vue, src/pages/index/test.vue */
/* tokens: before:content-['independent_subpackage_taro-vite-vue3-tailwindcss-v3'] <= src/sub-independent/pages/index.vue */
/* tokens: before:content-['normal_subpackage_taro-vite-vue3-tailwindcss-v3'] <= src/sub-normal/pages/index.vue */
@media (prefers-color-scheme: dark) {
  /* tokens: dark:text-[#ec4f4f] <= src/pages/index/index.vue, src/pages/index/test.vue */
}
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
/* tokens: flex <= src/pages/index/index.vue, src/pages/index/test.vue */
.flex {
  display: flex;
}
/* tokens: flex-col <= src/pages/index/index.vue, src/pages/index/test.vue */
.flex-col {
  flex-direction: column;
}
/* tokens: divide-x-8 <= src/pages/index/index.vue, src/pages/index/test.vue */
.divide-x-8 > view + view,
.divide-x-8 > view + text,
.divide-x-8 > text + view,
.divide-x-8 > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(8rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(8rpx * (1 - var(--tw-divide-x-reverse)));
}
/* tokens: divide-solid <= src/pages/index/index.vue, src/pages/index/test.vue */
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  border-style: solid;
}
/* tokens: divide-[#60d256] <= src/pages/index/index.vue, src/pages/index/test.vue */
.divide-_b_h60d256_B > view + view,
.divide-_b_h60d256_B > view + text,
.divide-_b_h60d256_B > text + view,
.divide-_b_h60d256_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(96, 210, 86, var(--tw-divide-opacity, 1));
}
/* tokens: bg-[#89ab8d] <= src/pages/index/index.vue, src/pages/index/test.vue */
.bg-_b_h89ab8d_B {
  --tw-bg-opacity: 1;
  background-color: rgba(137, 171, 141, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#e24826] <= src/pages/index/test.vue */
.bg-_b_he24826_B {
  --tw-bg-opacity: 1;
  background-color: rgba(226, 72, 38, var(--tw-bg-opacity, 1));
}
/* tokens: text-[66rpx] <= src/pages/index/test.vue */
.text-_b66rpx_B {
  font-size: 66rpx;
}
/* tokens: text-[#3d31a4] <= src/pages/index/index.vue, src/pages/index/test.vue */
.text-_b_h3d31a4_B {
  --tw-text-opacity: 1;
  color: rgba(61, 49, 164, var(--tw-text-opacity, 1));
}
/* tokens: text-[#438821] <= src/pages/index/index.vue, src/pages/index/test.vue */
.text-_b_h438821_B {
  --tw-text-opacity: 1;
  color: rgba(67, 136, 33, var(--tw-text-opacity, 1));
}
/* tokens: before:content-['11111'] <= src/pages/index/index.vue, src/pages/index/test.vue */
.before_ccontent-_b_a11111_a_B::before {
  --tw-content: '11111';
  content: var(--tw-content);
}
/* tokens: before:content-['222'] <= src/pages/index/index.vue, src/pages/index/test.vue */
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
  /* tokens: dark:text-[#ec4f4f] <= src/pages/index/index.vue, src/pages/index/test.vue */
  .dark_ctext-_b_hec4f4f_B {
    --tw-text-opacity: 1;
    color: rgba(236, 79, 79, var(--tw-text-opacity, 1));
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
.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.bg-independent-subpackage-marker {
  --tw-bg-opacity: 1;
  background-color: rgba(220, 38, 38, var(--tw-bg-opacity, 1));
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
.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-vite-vue3-tailwindcss-v3';
  content: var(--tw-content);
}
.bg-normal-subpackage-marker {
  --tw-bg-opacity: 1;
  background-color: rgba(37, 99, 235, var(--tw-bg-opacity, 1));
}
```
