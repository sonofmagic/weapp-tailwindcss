# taro-vite-react-tailwindcss-v3 CSS Output

Fixture: demo
Entry: taro-vite-react-tailwindcss-v3/dist/app.wxss
Generator CSS files: app.wxss, app-origin.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 6041 | 26 | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
@import 'app-origin.wxss';
/* tokens: flex <= src/pages/index/index.tsx, src/pages/index/test.tsx */
/* tokens: flex-col <= src/pages/index/index.tsx, src/pages/index/test.tsx */
/* tokens: divide-x-8 <= src/pages/index/index.tsx, src/pages/index/test.tsx */
/* tokens: divide-solid <= src/pages/index/index.tsx, src/pages/index/test.tsx */
/* tokens: divide-[#60d256] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
/* tokens: bg-[#89ab8d] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
/* tokens: bg-[#e24826] <= src/pages/index/test.tsx */
/* tokens: bg-[red] <= src/pages/index/index.tsx */
/* tokens: text-[66rpx] <= src/pages/index/test.tsx */
/* tokens: text-[#3d31a4] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
/* tokens: text-[#438821] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
/* tokens: before:content-["11111"] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
/* tokens: before:content-['222'] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
/* tokens: before:content-['333'] <= src/pages/index/test.tsx */
/* tokens: before:content-['independent_subpackage_taro-vite-react-tailwindcss-v3'] <= src/sub-independent/pages/index.tsx */
/* tokens: before:content-['normal_subpackage_taro-vite-react-tailwindcss-v3'] <= src/sub-normal/pages/index.tsx */
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
/* tokens: flex <= src/pages/index/index.tsx, src/pages/index/test.tsx */
.flex {
  display: flex;
}
/* tokens: flex-col <= src/pages/index/index.tsx, src/pages/index/test.tsx */
.flex-col {
  flex-direction: column;
}
/* tokens: divide-x-8 <= src/pages/index/index.tsx, src/pages/index/test.tsx */
.divide-x-8 > view + view,
.divide-x-8 > view + text,
.divide-x-8 > text + view,
.divide-x-8 > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(8rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(8rpx * (1 - var(--tw-divide-x-reverse)));
}
/* tokens: divide-solid <= src/pages/index/index.tsx, src/pages/index/test.tsx */
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  border-style: solid;
}
/* tokens: divide-[#60d256] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
.divide-_b_h60d256_B > view + view,
.divide-_b_h60d256_B > view + text,
.divide-_b_h60d256_B > text + view,
.divide-_b_h60d256_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(96, 210, 86, var(--tw-divide-opacity, 1));
}
/* tokens: bg-[#89ab8d] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
.bg-_b_h89ab8d_B {
  --tw-bg-opacity: 1;
  background-color: rgba(137, 171, 141, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#e24826] <= src/pages/index/test.tsx */
.bg-_b_he24826_B {
  --tw-bg-opacity: 1;
  background-color: rgba(226, 72, 38, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[red] <= src/pages/index/index.tsx */
.bg-_bred_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 0, 0, var(--tw-bg-opacity, 1));
}
/* tokens: text-[66rpx] <= src/pages/index/test.tsx */
.text-_b66rpx_B {
  font-size: 66rpx;
}
/* tokens: text-[#3d31a4] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
.text-_b_h3d31a4_B {
  --tw-text-opacity: 1;
  color: rgba(61, 49, 164, var(--tw-text-opacity, 1));
}
/* tokens: text-[#438821] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
.text-_b_h438821_B {
  --tw-text-opacity: 1;
  color: rgba(67, 136, 33, var(--tw-text-opacity, 1));
}
/* tokens: before:content-["11111"] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
.before_ccontent-_b_q11111_q_B::before {
  --tw-content: '11111';
  content: var(--tw-content);
}
/* tokens: before:content-['222'] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
.before_ccontent-_b_a222_a_B::before {
  --tw-content: '222';
  content: var(--tw-content);
}
/* tokens: before:content-['333'] <= src/pages/index/test.tsx */
.before_ccontent-_b_a333_a_B::before {
  --tw-content: '333';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-vite-react-tailwindcss-v3';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-vite-react-tailwindcss-v3';
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  /* tokens: dark:text-[#ec4f4f] <= src/pages/index/index.tsx, src/pages/index/test.tsx */
  .dark_ctext-_b_hec4f4f_B {
    --tw-text-opacity: 1;
    color: rgba(236, 79, 79, var(--tw-text-opacity, 1));
  }
}
```
