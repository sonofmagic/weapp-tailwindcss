# taro-webpack-react-tailwindcss-v3 CSS Output

Fixture: demo
Entry: taro-webpack-react-tailwindcss-v3/dist/app.wxss
Generator CSS files: app.wxss, moduleA/pages/index.wxss, moduleB/pages/index.wxss, moduleC/pages/index.wxss, pages/debug/index.wxss, pages/index/index.wxss, sub-independent/pages/index.wxss, sub-normal/pages/index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| 97192 | 108 | false | false | false | true | true | false | true |

## Generator CSS Summary

| File | Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| `app.wxss` | 16315 | 102 | false | false | false | true | true | false | true |
| `moduleA/pages/index.wxss` | 1 | 0 | false | false | false | false | false | false | false |
| `moduleB/pages/index.wxss` | 16317 | 102 | false | false | false | true | true | false | true |
| `moduleC/pages/index.wxss` | 16317 | 102 | false | false | false | true | true | false | true |
| `pages/debug/index.wxss` | 14883 | 103 | false | false | false | true | true | false | true |
| `pages/index/index.wxss` | 728 | 5 | false | false | false | false | false | false | false |
| `sub-independent/pages/index.wxss` | 16317 | 102 | false | false | false | true | true | false | true |
| `sub-normal/pages/index.wxss` | 16315 | 102 | false | false | false | true | true | false | true |

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
/* tokens: -m-[20px] <= src/pages/index/index.tsx */
.-m-_b20px_B {
  margin: -20rpx;
}
/* tokens: mb-[-20px] <= src/pages/index/index.tsx */
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
/* tokens: h-[100px] <= src/pages/index/index.tsx */
.h-_b100px_B {
  height: 100rpx;
}
/* tokens: h-[10px] <= src/pages/index/index.tsx */
.h-_b10px_B {
  height: 10rpx;
}
/* tokens: h-[20px] <= src/pages/index/endClassCom.tsx */
.h-_b20px_B {
  height: 20rpx;
}
/* tokens: h-[337px] <= src/pages/index/index.tsx */
.h-_b337px_B {
  height: 337rpx;
}
/* tokens: max-h-[100px] <= src/pages/index/index.tsx */
.max-h-_b100px_B {
  max-height: 100rpx;
}
/* tokens: min-h-[100px] <= src/pages/index/index.tsx */
.min-h-_b100px_B {
  min-height: 100rpx;
}
/* tokens: w-[100px] <= src/pages/index/endClassCom.tsx, src/pages/index/index.tsx */
.w-_b100px_B {
  width: 100rpx;
}
/* tokens: w-[200%] <= src/pages/index/index.tsx */
.w-_b200_v_B {
  width: 200%;
}
/* tokens: w-[20px] <= src/pages/index/index.tsx */
.w-_b20px_B {
  width: 20rpx;
}
/* tokens: w-[300rpx] <= src/pages/index/index.tsx */
.w-_b300rpx_B {
  width: 300rpx;
}
/* tokens: w-[404px] <= src/pages/index/index.tsx */
.w-_b404px_B {
  width: 404rpx;
}
/* tokens: min-w-[300rpx] <= src/pages/index/index.tsx */
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
/* tokens: max-w-[300rpx] <= src/pages/index/index.tsx */
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
/* tokens: space-y-[1.6rem] <= src/pages/index/index.tsx */
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
}
/* tokens: divide-x-[10px] <= src/pages/index/index.tsx */
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
}
/* tokens: divide-[#010101] <= src/pages/index/index.tsx */
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(1, 1, 1, var(--tw-divide-opacity, 1));
}
/* tokens: rounded-[20rpx] <= src/pages/index/index.tsx */
.rounded-_b20rpx_B {
  border-radius: 20rpx;
}
/* tokens: rounded-[40px] <= src/pages/index/index.tsx */
.rounded-_b40px_B {
  border-radius: 40rpx;
}
/* tokens: border-[10px] <= src/pages/index/index.tsx */
.border-_b10px_B {
  border-width: 10rpx;
}
/* tokens: border-[#098765] <= src/pages/index/index.tsx */
.border-_b_h098765_B {
  --tw-border-opacity: 1;
  border-color: rgba(9, 135, 101, var(--tw-border-opacity, 1));
}
/* tokens: border-opacity-[0.44] <= src/pages/index/index.tsx */
.border-opacity-_b0_d44_B {
  --tw-border-opacity: 0.44;
}
/* tokens: bg-[#123456] <= src/pages/index/index.tsx */
.bg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#123] <= src/pages/index/index.tsx */
.bg-_b_h123_B {
  --tw-bg-opacity: 1;
  background-color: rgba(17, 34, 51, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#3232ff] <= src/pages/index/index.tsx */
.bg-_b_h3232ff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(50, 50, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#654321] <= src/pages/index/endClassCom.tsx */
.bg-_b_h654321_B {
  --tw-bg-opacity: 1;
  background-color: rgba(101, 67, 33, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#91ba306d] <= src/pages/debug/index.tsx */
.bg-_b_h91ba306d_B {
  background-color: rgba(145, 186, 48, 0.42745);
}
/* tokens: bg-[#d6d66b] <= src/pages/debug/before.tsx */
.bg-_b_hd6d66b_B {
  --tw-bg-opacity: 1;
  background-color: rgba(214, 214, 107, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#faf] <= src/pages/index/index.tsx */
.bg-_b_hfaf_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 170, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#fff] <= src/pages/index/index.tsx */
.bg-_b_hfff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[url] <= src/pages/index/index.tsx */
.bg-_burl_B {
  background-color: url;
}
/* tokens: bg-sky-500/80 <= src/pages/index/index.tsx */
.bg-sky-500_f80 {
  background-color: rgba(14, 165, 233, 0.8);
}
/* tokens: bg-opacity-[0.54] <= src/pages/index/index.tsx */
.bg-opacity-_b0_d54_B {
  --tw-bg-opacity: 0.54;
}
/* tokens: bg-[url('https://xxx.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
}
/* tokens: bg-[url('https://yyy.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fyyy_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://yyy.com/xx.webp');
}
/* tokens: p-[20px] <= src/pages/index/index.tsx */
.p-_b20px_B {
  padding: 20rpx;
}
/* tokens: px-[33.89080980rpx] <= src/pages/debug/index.tsx */
.px-_b33_d89080980rpx_B {
  padding-left: 33.8908098rpx;
  padding-right: 33.8908098rpx;
}
/* tokens: px-[95px] <= src/pages/index/index.tsx */
.px-_b95px_B {
  padding-left: 95rpx;
  padding-right: 95rpx;
}
/* tokens: py-[32.8989989rpx] <= src/pages/debug/index.tsx */
.py-_b32_d8989989rpx_B {
  padding-top: 32.8989989rpx;
  padding-bottom: 32.8989989rpx;
}
/* tokens: py-[62px] <= src/pages/index/index.tsx */
.py-_b62px_B {
  padding-top: 62rpx;
  padding-bottom: 62rpx;
}
/* tokens: text-[16px] <= src/pages/index/index.tsx */
.text-_b16px_B {
  font-size: 16rpx;
}
/* tokens: text-[20px] <= src/pages/index/index.tsx */
.text-_b20px_B {
  font-size: 20rpx;
}
/* tokens: text-[50px] <= src/pages/index/index.tsx */
.text-_b50px_B {
  font-size: 50rpx;
}
/* tokens: leading-[0.9] <= src/pages/index/index.tsx */
.leading-_b0_d9_B {
  line-height: 0.9;
}
/* tokens: !text-[#555] <= src/pages/index/index.tsx */
._etext-_b_h555_B {
  --tw-text-opacity: 1 !important;
  color: rgba(85, 85, 85, var(--tw-text-opacity, 1)) !important;
}
/* tokens: text-[#123456] <= src/pages/debug/index.tsx, src/pages/debug/other.tsx */
.text-_b_h123456_B {
  --tw-text-opacity: 1;
  color: rgba(18, 52, 86, var(--tw-text-opacity, 1));
}
/* tokens: text-[#564564] <= src/pages/index/index.tsx */
.text-_b_h564564_B {
  --tw-text-opacity: 1;
  color: rgba(86, 69, 100, var(--tw-text-opacity, 1));
}
/* tokens: text-[#66ffff] <= src/pages/index/index.tsx */
.text-_b_h66ffff_B {
  --tw-text-opacity: 1;
  color: rgba(102, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-[#dddddd] <= src/pages/index/index.tsx */
.text-_b_hdddddd_B {
  --tw-text-opacity: 1;
  color: rgba(221, 221, 221, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa0000] <= src/pages/index/index.tsx */
.text-_b_hfa0000_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 0, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa00aa] <= src/pages/index/index.tsx */
.text-_b_hfa00aa_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 170, var(--tw-text-opacity, 1));
}
/* tokens: text-[#ffffff] <= src/pages/index/index.tsx */
.text-_b_hffffff_B {
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-opacity-[0.19] <= src/pages/index/index.tsx */
.text-opacity-_b0_d19_B {
  --tw-text-opacity: 0.19;
}
/* tokens: before:absolute <= src/pages/index/index.tsx */
.before_cabsolute::before {
  content: var(--tw-content);
  position: absolute;
}
/* tokens: before:inset-0 <= src/pages/index/index.tsx */
.before_cinset-0::before {
  content: var(--tw-content);
  top: 0rpx;
  right: 0rpx;
  bottom: 0rpx;
  left: 0rpx;
}
/* tokens: before:rounded-[20rpx] <= src/pages/index/index.tsx */
.before_crounded-_b20rpx_B::before {
  content: var(--tw-content);
  border-radius: 20rpx;
}
/* tokens: before:border-2 <= src/pages/index/index.tsx */
.before_cborder-2::before {
  content: var(--tw-content);
  border-width: 2rpx;
}
/* tokens: before:border-[#0000ff] <= src/pages/index/index.tsx */
.before_cborder-_b_h0000ff_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(0, 0, 255, var(--tw-border-opacity, 1));
}
/* tokens: before:border-[#4bd650] <= src/pages/index/index.tsx */
.before_cborder-_b_h4bd650_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(75, 214, 80, var(--tw-border-opacity, 1));
}
/* tokens: before:content-['independent_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-independent/pages/index.tsx */
.before_ccontent-_b_aindependent_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleA_普通分包'] <= src/moduleA/pages/index.tsx */
.before_ccontent-_b_amoduleA_u_x666e_u_x901a_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 普通分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleB_独立分包'] <= src/moduleB/pages/index.tsx */
.before_ccontent-_b_amoduleB_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleB 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleC_独立分包'] <= src/moduleC/pages/index.tsx */
.before_ccontent-_b_amoduleC_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleC 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-normal/pages/index.tsx */
.before_ccontent-_b_anormal_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: after:ml-0.5 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_cml-0_d5::after {
  content: var(--tw-content);
  margin-left: 4rpx;
}
/* tokens: after:border-none <= src/pages/index/index.tsx */
.after_cborder-none::after {
  content: var(--tw-content);
  border-style: none;
}
/* tokens: after:text-red-500 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ctext-red-500::after {
  content: var(--tw-content);
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
/* tokens: after:content-["*"] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_q_x_q_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-["的撒的撒"] <= src/pages/index/index.tsx */
.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-['*'] <= src/pages/debug/before.tsx */
.after_ccontent-_b_a_x_a_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-['Hello_World'] <= src/pages/index/index.tsx */
.after_ccontent-_b_aHello_World_a_B::after {
  --tw-content: 'Hello World';
  content: var(--tw-content);
}
/* tokens: after:content-['的撒的撒'] <= src/pages/index/index.tsx */
.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-[*] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_x_B::after {
  --tw-content: *;
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  /* tokens: system-dark:bg-slate-900 <= src/pages/index/index.tsx */
  .system-dark_cbg-slate-900 {
    --tw-bg-opacity: 1;
    background-color: rgba(15, 23, 42, var(--tw-bg-opacity, 1));
  } /* tokens: system-dark:text-slate-100 <= src/pages/index/index.tsx */
  .system-dark_ctext-slate-100 {
    --tw-text-opacity: 1;
    color: rgba(241, 245, 249, var(--tw-text-opacity, 1));
  }
}
/* tokens: theme-dark:bg-zinc-900 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-900.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:bg-zinc-950 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-950.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:text-zinc-50 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_ctext-zinc-50.theme-dark {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-900 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-950 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-950 {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:text-zinc-50 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-[#123456] <= src/pages/index/index.tsx */
.dark view.dark_cbg-_b_h123456_B,
.dark text.dark_cbg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-green-500 <= src/pages/index/index.tsx */
.dark view.dark_cbg-green-500,
.dark text.dark_cbg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-800 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-800,
.dark text.dark_cbg-zinc-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(39, 39, 42, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-900 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-900,
.dark text.dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:text-zinc-50 <= src/pages/index/index.tsx */
.dark view.dark_ctext-zinc-50,
.dark text.dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: [&_.u-count-down\_\_text]:!text-red-400 <= src/pages/debug/arbitraryVariants.tsx | u-count-down__text <= src/pages/debug/arbitraryVariants.tsx */
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  --tw-text-opacity: 1 !important;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1)) !important;
}
```

### moduleA/pages/index.wxss

```css

```

### moduleB/pages/index.wxss

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
/* tokens: -m-[20px] <= src/pages/index/index.tsx */
.-m-_b20px_B {
  margin: -20rpx;
}
/* tokens: mb-[-20px] <= src/pages/index/index.tsx */
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
/* tokens: h-[100px] <= src/pages/index/index.tsx */
.h-_b100px_B {
  height: 100rpx;
}
/* tokens: h-[10px] <= src/pages/index/index.tsx */
.h-_b10px_B {
  height: 10rpx;
}
/* tokens: h-[20px] <= src/pages/index/endClassCom.tsx */
.h-_b20px_B {
  height: 20rpx;
}
/* tokens: h-[337px] <= src/pages/index/index.tsx */
.h-_b337px_B {
  height: 337rpx;
}
/* tokens: max-h-[100px] <= src/pages/index/index.tsx */
.max-h-_b100px_B {
  max-height: 100rpx;
}
/* tokens: min-h-[100px] <= src/pages/index/index.tsx */
.min-h-_b100px_B {
  min-height: 100rpx;
}
/* tokens: w-[100px] <= src/pages/index/endClassCom.tsx, src/pages/index/index.tsx */
.w-_b100px_B {
  width: 100rpx;
}
/* tokens: w-[200%] <= src/pages/index/index.tsx */
.w-_b200_v_B {
  width: 200%;
}
/* tokens: w-[20px] <= src/pages/index/index.tsx */
.w-_b20px_B {
  width: 20rpx;
}
/* tokens: w-[300rpx] <= src/pages/index/index.tsx */
.w-_b300rpx_B {
  width: 300rpx;
}
/* tokens: w-[404px] <= src/pages/index/index.tsx */
.w-_b404px_B {
  width: 404rpx;
}
/* tokens: min-w-[300rpx] <= src/pages/index/index.tsx */
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
/* tokens: max-w-[300rpx] <= src/pages/index/index.tsx */
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
/* tokens: space-y-[1.6rem] <= src/pages/index/index.tsx */
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
}
/* tokens: divide-x-[10px] <= src/pages/index/index.tsx */
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
}
/* tokens: divide-[#010101] <= src/pages/index/index.tsx */
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(1, 1, 1, var(--tw-divide-opacity, 1));
}
/* tokens: rounded-[20rpx] <= src/pages/index/index.tsx */
.rounded-_b20rpx_B {
  border-radius: 20rpx;
}
/* tokens: rounded-[40px] <= src/pages/index/index.tsx */
.rounded-_b40px_B {
  border-radius: 40rpx;
}
/* tokens: border-[10px] <= src/pages/index/index.tsx */
.border-_b10px_B {
  border-width: 10rpx;
}
/* tokens: border-[#098765] <= src/pages/index/index.tsx */
.border-_b_h098765_B {
  --tw-border-opacity: 1;
  border-color: rgba(9, 135, 101, var(--tw-border-opacity, 1));
}
/* tokens: border-opacity-[0.44] <= src/pages/index/index.tsx */
.border-opacity-_b0_d44_B {
  --tw-border-opacity: 0.44;
}
/* tokens: bg-[#123456] <= src/pages/index/index.tsx */
.bg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#123] <= src/pages/index/index.tsx */
.bg-_b_h123_B {
  --tw-bg-opacity: 1;
  background-color: rgba(17, 34, 51, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#3232ff] <= src/pages/index/index.tsx */
.bg-_b_h3232ff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(50, 50, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#654321] <= src/pages/index/endClassCom.tsx */
.bg-_b_h654321_B {
  --tw-bg-opacity: 1;
  background-color: rgba(101, 67, 33, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#91ba306d] <= src/pages/debug/index.tsx */
.bg-_b_h91ba306d_B {
  background-color: rgba(145, 186, 48, 0.42745);
}
/* tokens: bg-[#d6d66b] <= src/pages/debug/before.tsx */
.bg-_b_hd6d66b_B {
  --tw-bg-opacity: 1;
  background-color: rgba(214, 214, 107, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#faf] <= src/pages/index/index.tsx */
.bg-_b_hfaf_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 170, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#fff] <= src/pages/index/index.tsx */
.bg-_b_hfff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[url] <= src/pages/index/index.tsx */
.bg-_burl_B {
  background-color: url;
}
/* tokens: bg-sky-500/80 <= src/pages/index/index.tsx */
.bg-sky-500_f80 {
  background-color: rgba(14, 165, 233, 0.8);
}
/* tokens: bg-opacity-[0.54] <= src/pages/index/index.tsx */
.bg-opacity-_b0_d54_B {
  --tw-bg-opacity: 0.54;
}
/* tokens: bg-[url('https://xxx.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
}
/* tokens: bg-[url('https://yyy.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fyyy_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://yyy.com/xx.webp');
}
/* tokens: p-[20px] <= src/pages/index/index.tsx */
.p-_b20px_B {
  padding: 20rpx;
}
/* tokens: px-[33.89080980rpx] <= src/pages/debug/index.tsx */
.px-_b33_d89080980rpx_B {
  padding-left: 33.8908098rpx;
  padding-right: 33.8908098rpx;
}
/* tokens: px-[95px] <= src/pages/index/index.tsx */
.px-_b95px_B {
  padding-left: 95rpx;
  padding-right: 95rpx;
}
/* tokens: py-[32.8989989rpx] <= src/pages/debug/index.tsx */
.py-_b32_d8989989rpx_B {
  padding-top: 32.8989989rpx;
  padding-bottom: 32.8989989rpx;
}
/* tokens: py-[62px] <= src/pages/index/index.tsx */
.py-_b62px_B {
  padding-top: 62rpx;
  padding-bottom: 62rpx;
}
/* tokens: text-[16px] <= src/pages/index/index.tsx */
.text-_b16px_B {
  font-size: 16rpx;
}
/* tokens: text-[20px] <= src/pages/index/index.tsx */
.text-_b20px_B {
  font-size: 20rpx;
}
/* tokens: text-[50px] <= src/pages/index/index.tsx */
.text-_b50px_B {
  font-size: 50rpx;
}
/* tokens: leading-[0.9] <= src/pages/index/index.tsx */
.leading-_b0_d9_B {
  line-height: 0.9;
}
/* tokens: !text-[#555] <= src/pages/index/index.tsx */
._etext-_b_h555_B {
  --tw-text-opacity: 1 !important;
  color: rgba(85, 85, 85, var(--tw-text-opacity, 1)) !important;
}
/* tokens: text-[#123456] <= src/pages/debug/index.tsx, src/pages/debug/other.tsx */
.text-_b_h123456_B {
  --tw-text-opacity: 1;
  color: rgba(18, 52, 86, var(--tw-text-opacity, 1));
}
/* tokens: text-[#564564] <= src/pages/index/index.tsx */
.text-_b_h564564_B {
  --tw-text-opacity: 1;
  color: rgba(86, 69, 100, var(--tw-text-opacity, 1));
}
/* tokens: text-[#66ffff] <= src/pages/index/index.tsx */
.text-_b_h66ffff_B {
  --tw-text-opacity: 1;
  color: rgba(102, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-[#dddddd] <= src/pages/index/index.tsx */
.text-_b_hdddddd_B {
  --tw-text-opacity: 1;
  color: rgba(221, 221, 221, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa0000] <= src/pages/index/index.tsx */
.text-_b_hfa0000_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 0, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa00aa] <= src/pages/index/index.tsx */
.text-_b_hfa00aa_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 170, var(--tw-text-opacity, 1));
}
/* tokens: text-[#ffffff] <= src/pages/index/index.tsx */
.text-_b_hffffff_B {
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-opacity-[0.19] <= src/pages/index/index.tsx */
.text-opacity-_b0_d19_B {
  --tw-text-opacity: 0.19;
}
/* tokens: before:absolute <= src/pages/index/index.tsx */
.before_cabsolute::before {
  content: var(--tw-content);
  position: absolute;
}
/* tokens: before:inset-0 <= src/pages/index/index.tsx */
.before_cinset-0::before {
  content: var(--tw-content);
  top: 0rpx;
  right: 0rpx;
  bottom: 0rpx;
  left: 0rpx;
}
/* tokens: before:rounded-[20rpx] <= src/pages/index/index.tsx */
.before_crounded-_b20rpx_B::before {
  content: var(--tw-content);
  border-radius: 20rpx;
}
/* tokens: before:border-2 <= src/pages/index/index.tsx */
.before_cborder-2::before {
  content: var(--tw-content);
  border-width: 2rpx;
}
/* tokens: before:border-[#0000ff] <= src/pages/index/index.tsx */
.before_cborder-_b_h0000ff_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(0, 0, 255, var(--tw-border-opacity, 1));
}
/* tokens: before:border-[#4bd650] <= src/pages/index/index.tsx */
.before_cborder-_b_h4bd650_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(75, 214, 80, var(--tw-border-opacity, 1));
}
/* tokens: before:content-['independent_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-independent/pages/index.tsx */
.before_ccontent-_b_aindependent_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleA_普通分包'] <= src/moduleA/pages/index.tsx */
.before_ccontent-_b_amoduleA_u_x666e_u_x901a_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 普通分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleB_独立分包'] <= src/moduleB/pages/index.tsx */
.before_ccontent-_b_amoduleB_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleB 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleC_独立分包'] <= src/moduleC/pages/index.tsx */
.before_ccontent-_b_amoduleC_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleC 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-normal/pages/index.tsx */
.before_ccontent-_b_anormal_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: after:ml-0.5 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_cml-0_d5::after {
  content: var(--tw-content);
  margin-left: 4rpx;
}
/* tokens: after:border-none <= src/pages/index/index.tsx */
.after_cborder-none::after {
  content: var(--tw-content);
  border-style: none;
}
/* tokens: after:text-red-500 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ctext-red-500::after {
  content: var(--tw-content);
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
/* tokens: after:content-["*"] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_q_x_q_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-["的撒的撒"] <= src/pages/index/index.tsx */
.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-['*'] <= src/pages/debug/before.tsx */
.after_ccontent-_b_a_x_a_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-['Hello_World'] <= src/pages/index/index.tsx */
.after_ccontent-_b_aHello_World_a_B::after {
  --tw-content: 'Hello World';
  content: var(--tw-content);
}
/* tokens: after:content-['的撒的撒'] <= src/pages/index/index.tsx */
.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-[*] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_x_B::after {
  --tw-content: *;
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  /* tokens: system-dark:bg-slate-900 <= src/pages/index/index.tsx */
  .system-dark_cbg-slate-900 {
    --tw-bg-opacity: 1;
    background-color: rgba(15, 23, 42, var(--tw-bg-opacity, 1));
  }
  /* tokens: system-dark:text-slate-100 <= src/pages/index/index.tsx */
  .system-dark_ctext-slate-100 {
    --tw-text-opacity: 1;
    color: rgba(241, 245, 249, var(--tw-text-opacity, 1));
  }
}
/* tokens: theme-dark:bg-zinc-900 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-900.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:bg-zinc-950 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-950.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:text-zinc-50 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_ctext-zinc-50.theme-dark {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-900 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-950 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-950 {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:text-zinc-50 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-[#123456] <= src/pages/index/index.tsx */
.dark view.dark_cbg-_b_h123456_B,
.dark text.dark_cbg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-green-500 <= src/pages/index/index.tsx */
.dark view.dark_cbg-green-500,
.dark text.dark_cbg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-800 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-800,
.dark text.dark_cbg-zinc-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(39, 39, 42, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-900 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-900,
.dark text.dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:text-zinc-50 <= src/pages/index/index.tsx */
.dark view.dark_ctext-zinc-50,
.dark text.dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: [&_.u-count-down\_\_text]:!text-red-400 <= src/pages/debug/arbitraryVariants.tsx | u-count-down__text <= src/pages/debug/arbitraryVariants.tsx */
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  --tw-text-opacity: 1 !important;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1)) !important;
}
```

### moduleC/pages/index.wxss

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
/* tokens: -m-[20px] <= src/pages/index/index.tsx */
.-m-_b20px_B {
  margin: -20rpx;
}
/* tokens: mb-[-20px] <= src/pages/index/index.tsx */
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
/* tokens: h-[100px] <= src/pages/index/index.tsx */
.h-_b100px_B {
  height: 100rpx;
}
/* tokens: h-[10px] <= src/pages/index/index.tsx */
.h-_b10px_B {
  height: 10rpx;
}
/* tokens: h-[20px] <= src/pages/index/endClassCom.tsx */
.h-_b20px_B {
  height: 20rpx;
}
/* tokens: h-[337px] <= src/pages/index/index.tsx */
.h-_b337px_B {
  height: 337rpx;
}
/* tokens: max-h-[100px] <= src/pages/index/index.tsx */
.max-h-_b100px_B {
  max-height: 100rpx;
}
/* tokens: min-h-[100px] <= src/pages/index/index.tsx */
.min-h-_b100px_B {
  min-height: 100rpx;
}
/* tokens: w-[100px] <= src/pages/index/endClassCom.tsx, src/pages/index/index.tsx */
.w-_b100px_B {
  width: 100rpx;
}
/* tokens: w-[200%] <= src/pages/index/index.tsx */
.w-_b200_v_B {
  width: 200%;
}
/* tokens: w-[20px] <= src/pages/index/index.tsx */
.w-_b20px_B {
  width: 20rpx;
}
/* tokens: w-[300rpx] <= src/pages/index/index.tsx */
.w-_b300rpx_B {
  width: 300rpx;
}
/* tokens: w-[404px] <= src/pages/index/index.tsx */
.w-_b404px_B {
  width: 404rpx;
}
/* tokens: min-w-[300rpx] <= src/pages/index/index.tsx */
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
/* tokens: max-w-[300rpx] <= src/pages/index/index.tsx */
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
/* tokens: space-y-[1.6rem] <= src/pages/index/index.tsx */
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
}
/* tokens: divide-x-[10px] <= src/pages/index/index.tsx */
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
}
/* tokens: divide-[#010101] <= src/pages/index/index.tsx */
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(1, 1, 1, var(--tw-divide-opacity, 1));
}
/* tokens: rounded-[20rpx] <= src/pages/index/index.tsx */
.rounded-_b20rpx_B {
  border-radius: 20rpx;
}
/* tokens: rounded-[40px] <= src/pages/index/index.tsx */
.rounded-_b40px_B {
  border-radius: 40rpx;
}
/* tokens: border-[10px] <= src/pages/index/index.tsx */
.border-_b10px_B {
  border-width: 10rpx;
}
/* tokens: border-[#098765] <= src/pages/index/index.tsx */
.border-_b_h098765_B {
  --tw-border-opacity: 1;
  border-color: rgba(9, 135, 101, var(--tw-border-opacity, 1));
}
/* tokens: border-opacity-[0.44] <= src/pages/index/index.tsx */
.border-opacity-_b0_d44_B {
  --tw-border-opacity: 0.44;
}
/* tokens: bg-[#123456] <= src/pages/index/index.tsx */
.bg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#123] <= src/pages/index/index.tsx */
.bg-_b_h123_B {
  --tw-bg-opacity: 1;
  background-color: rgba(17, 34, 51, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#3232ff] <= src/pages/index/index.tsx */
.bg-_b_h3232ff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(50, 50, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#654321] <= src/pages/index/endClassCom.tsx */
.bg-_b_h654321_B {
  --tw-bg-opacity: 1;
  background-color: rgba(101, 67, 33, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#91ba306d] <= src/pages/debug/index.tsx */
.bg-_b_h91ba306d_B {
  background-color: rgba(145, 186, 48, 0.42745);
}
/* tokens: bg-[#d6d66b] <= src/pages/debug/before.tsx */
.bg-_b_hd6d66b_B {
  --tw-bg-opacity: 1;
  background-color: rgba(214, 214, 107, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#faf] <= src/pages/index/index.tsx */
.bg-_b_hfaf_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 170, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#fff] <= src/pages/index/index.tsx */
.bg-_b_hfff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[url] <= src/pages/index/index.tsx */
.bg-_burl_B {
  background-color: url;
}
/* tokens: bg-sky-500/80 <= src/pages/index/index.tsx */
.bg-sky-500_f80 {
  background-color: rgba(14, 165, 233, 0.8);
}
/* tokens: bg-opacity-[0.54] <= src/pages/index/index.tsx */
.bg-opacity-_b0_d54_B {
  --tw-bg-opacity: 0.54;
}
/* tokens: bg-[url('https://xxx.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
}
/* tokens: bg-[url('https://yyy.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fyyy_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://yyy.com/xx.webp');
}
/* tokens: p-[20px] <= src/pages/index/index.tsx */
.p-_b20px_B {
  padding: 20rpx;
}
/* tokens: px-[33.89080980rpx] <= src/pages/debug/index.tsx */
.px-_b33_d89080980rpx_B {
  padding-left: 33.8908098rpx;
  padding-right: 33.8908098rpx;
}
/* tokens: px-[95px] <= src/pages/index/index.tsx */
.px-_b95px_B {
  padding-left: 95rpx;
  padding-right: 95rpx;
}
/* tokens: py-[32.8989989rpx] <= src/pages/debug/index.tsx */
.py-_b32_d8989989rpx_B {
  padding-top: 32.8989989rpx;
  padding-bottom: 32.8989989rpx;
}
/* tokens: py-[62px] <= src/pages/index/index.tsx */
.py-_b62px_B {
  padding-top: 62rpx;
  padding-bottom: 62rpx;
}
/* tokens: text-[16px] <= src/pages/index/index.tsx */
.text-_b16px_B {
  font-size: 16rpx;
}
/* tokens: text-[20px] <= src/pages/index/index.tsx */
.text-_b20px_B {
  font-size: 20rpx;
}
/* tokens: text-[50px] <= src/pages/index/index.tsx */
.text-_b50px_B {
  font-size: 50rpx;
}
/* tokens: leading-[0.9] <= src/pages/index/index.tsx */
.leading-_b0_d9_B {
  line-height: 0.9;
}
/* tokens: !text-[#555] <= src/pages/index/index.tsx */
._etext-_b_h555_B {
  --tw-text-opacity: 1 !important;
  color: rgba(85, 85, 85, var(--tw-text-opacity, 1)) !important;
}
/* tokens: text-[#123456] <= src/pages/debug/index.tsx, src/pages/debug/other.tsx */
.text-_b_h123456_B {
  --tw-text-opacity: 1;
  color: rgba(18, 52, 86, var(--tw-text-opacity, 1));
}
/* tokens: text-[#564564] <= src/pages/index/index.tsx */
.text-_b_h564564_B {
  --tw-text-opacity: 1;
  color: rgba(86, 69, 100, var(--tw-text-opacity, 1));
}
/* tokens: text-[#66ffff] <= src/pages/index/index.tsx */
.text-_b_h66ffff_B {
  --tw-text-opacity: 1;
  color: rgba(102, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-[#dddddd] <= src/pages/index/index.tsx */
.text-_b_hdddddd_B {
  --tw-text-opacity: 1;
  color: rgba(221, 221, 221, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa0000] <= src/pages/index/index.tsx */
.text-_b_hfa0000_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 0, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa00aa] <= src/pages/index/index.tsx */
.text-_b_hfa00aa_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 170, var(--tw-text-opacity, 1));
}
/* tokens: text-[#ffffff] <= src/pages/index/index.tsx */
.text-_b_hffffff_B {
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-opacity-[0.19] <= src/pages/index/index.tsx */
.text-opacity-_b0_d19_B {
  --tw-text-opacity: 0.19;
}
/* tokens: before:absolute <= src/pages/index/index.tsx */
.before_cabsolute::before {
  content: var(--tw-content);
  position: absolute;
}
/* tokens: before:inset-0 <= src/pages/index/index.tsx */
.before_cinset-0::before {
  content: var(--tw-content);
  top: 0rpx;
  right: 0rpx;
  bottom: 0rpx;
  left: 0rpx;
}
/* tokens: before:rounded-[20rpx] <= src/pages/index/index.tsx */
.before_crounded-_b20rpx_B::before {
  content: var(--tw-content);
  border-radius: 20rpx;
}
/* tokens: before:border-2 <= src/pages/index/index.tsx */
.before_cborder-2::before {
  content: var(--tw-content);
  border-width: 2rpx;
}
/* tokens: before:border-[#0000ff] <= src/pages/index/index.tsx */
.before_cborder-_b_h0000ff_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(0, 0, 255, var(--tw-border-opacity, 1));
}
/* tokens: before:border-[#4bd650] <= src/pages/index/index.tsx */
.before_cborder-_b_h4bd650_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(75, 214, 80, var(--tw-border-opacity, 1));
}
/* tokens: before:content-['independent_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-independent/pages/index.tsx */
.before_ccontent-_b_aindependent_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleA_普通分包'] <= src/moduleA/pages/index.tsx */
.before_ccontent-_b_amoduleA_u_x666e_u_x901a_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 普通分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleB_独立分包'] <= src/moduleB/pages/index.tsx */
.before_ccontent-_b_amoduleB_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleB 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleC_独立分包'] <= src/moduleC/pages/index.tsx */
.before_ccontent-_b_amoduleC_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleC 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-normal/pages/index.tsx */
.before_ccontent-_b_anormal_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: after:ml-0.5 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_cml-0_d5::after {
  content: var(--tw-content);
  margin-left: 4rpx;
}
/* tokens: after:border-none <= src/pages/index/index.tsx */
.after_cborder-none::after {
  content: var(--tw-content);
  border-style: none;
}
/* tokens: after:text-red-500 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ctext-red-500::after {
  content: var(--tw-content);
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
/* tokens: after:content-["*"] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_q_x_q_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-["的撒的撒"] <= src/pages/index/index.tsx */
.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-['*'] <= src/pages/debug/before.tsx */
.after_ccontent-_b_a_x_a_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-['Hello_World'] <= src/pages/index/index.tsx */
.after_ccontent-_b_aHello_World_a_B::after {
  --tw-content: 'Hello World';
  content: var(--tw-content);
}
/* tokens: after:content-['的撒的撒'] <= src/pages/index/index.tsx */
.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-[*] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_x_B::after {
  --tw-content: *;
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  /* tokens: system-dark:bg-slate-900 <= src/pages/index/index.tsx */
  .system-dark_cbg-slate-900 {
    --tw-bg-opacity: 1;
    background-color: rgba(15, 23, 42, var(--tw-bg-opacity, 1));
  }
  /* tokens: system-dark:text-slate-100 <= src/pages/index/index.tsx */
  .system-dark_ctext-slate-100 {
    --tw-text-opacity: 1;
    color: rgba(241, 245, 249, var(--tw-text-opacity, 1));
  }
}
/* tokens: theme-dark:bg-zinc-900 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-900.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:bg-zinc-950 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-950.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:text-zinc-50 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_ctext-zinc-50.theme-dark {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-900 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-950 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-950 {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:text-zinc-50 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-[#123456] <= src/pages/index/index.tsx */
.dark view.dark_cbg-_b_h123456_B,
.dark text.dark_cbg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-green-500 <= src/pages/index/index.tsx */
.dark view.dark_cbg-green-500,
.dark text.dark_cbg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-800 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-800,
.dark text.dark_cbg-zinc-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(39, 39, 42, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-900 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-900,
.dark text.dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:text-zinc-50 <= src/pages/index/index.tsx */
.dark view.dark_ctext-zinc-50,
.dark text.dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: [&_.u-count-down\_\_text]:!text-red-400 <= src/pages/debug/arbitraryVariants.tsx | u-count-down__text <= src/pages/debug/arbitraryVariants.tsx */
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  --tw-text-opacity: 1 !important;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1)) !important;
}
```

### pages/debug/index.wxss

```css
/* tokens: -m-[20px] <= src/pages/index/index.tsx */
.-m-_b20px_B {
  margin: -20rpx;
}
/* tokens: mb-[-20px] <= src/pages/index/index.tsx */
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
/* tokens: h-[100px] <= src/pages/index/index.tsx */
.h-_b100px_B {
  height: 100rpx;
}
/* tokens: h-[10px] <= src/pages/index/index.tsx */
.h-_b10px_B {
  height: 10rpx;
}
/* tokens: h-[20px] <= src/pages/index/endClassCom.tsx */
.h-_b20px_B {
  height: 20rpx;
}
/* tokens: h-[337px] <= src/pages/index/index.tsx */
.h-_b337px_B {
  height: 337rpx;
}
/* tokens: max-h-[100px] <= src/pages/index/index.tsx */
.max-h-_b100px_B {
  max-height: 100rpx;
}
/* tokens: min-h-[100px] <= src/pages/index/index.tsx */
.min-h-_b100px_B {
  min-height: 100rpx;
}
/* tokens: w-[100px] <= src/pages/index/endClassCom.tsx, src/pages/index/index.tsx */
.w-_b100px_B {
  width: 100rpx;
}
/* tokens: w-[200%] <= src/pages/index/index.tsx */
.w-_b200_v_B {
  width: 200%;
}
/* tokens: w-[20px] <= src/pages/index/index.tsx */
.w-_b20px_B {
  width: 20rpx;
}
/* tokens: w-[300rpx] <= src/pages/index/index.tsx */
.w-_b300rpx_B {
  width: 300rpx;
}
/* tokens: w-[404px] <= src/pages/index/index.tsx */
.w-_b404px_B {
  width: 404rpx;
}
/* tokens: min-w-[300rpx] <= src/pages/index/index.tsx */
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
/* tokens: max-w-[300rpx] <= src/pages/index/index.tsx */
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
/* tokens: space-y-[1.6rem] <= src/pages/index/index.tsx */
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
}
/* tokens: divide-x-[10px] <= src/pages/index/index.tsx */
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
}
/* tokens: divide-[#010101] <= src/pages/index/index.tsx */
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(1, 1, 1, var(--tw-divide-opacity, 1));
}
/* tokens: rounded-[20rpx] <= src/pages/index/index.tsx */
.rounded-_b20rpx_B {
  border-radius: 20rpx;
}
/* tokens: rounded-[40px] <= src/pages/index/index.tsx */
.rounded-_b40px_B {
  border-radius: 40rpx;
}
/* tokens: border-[10px] <= src/pages/index/index.tsx */
.border-_b10px_B {
  border-width: 10rpx;
}
/* tokens: border-[#098765] <= src/pages/index/index.tsx */
.border-_b_h098765_B {
  --tw-border-opacity: 1;
  border-color: rgba(9, 135, 101, var(--tw-border-opacity, 1));
}
/* tokens: border-opacity-[0.44] <= src/pages/index/index.tsx */
.border-opacity-_b0_d44_B {
  --tw-border-opacity: 0.44;
}
/* tokens: bg-[#123456] <= src/pages/index/index.tsx */
.bg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#123] <= src/pages/index/index.tsx */
.bg-_b_h123_B {
  --tw-bg-opacity: 1;
  background-color: rgba(17, 34, 51, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#3232ff] <= src/pages/index/index.tsx */
.bg-_b_h3232ff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(50, 50, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#654321] <= src/pages/index/endClassCom.tsx */
.bg-_b_h654321_B {
  --tw-bg-opacity: 1;
  background-color: rgba(101, 67, 33, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#91ba306d] <= src/pages/debug/index.tsx */
.bg-_b_h91ba306d_B {
  background-color: rgba(145, 186, 48, 0.42745);
}
/* tokens: bg-[#d6d66b] <= src/pages/debug/before.tsx */
.bg-_b_hd6d66b_B {
  --tw-bg-opacity: 1;
  background-color: rgba(214, 214, 107, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#faf] <= src/pages/index/index.tsx */
.bg-_b_hfaf_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 170, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#fff] <= src/pages/index/index.tsx */
.bg-_b_hfff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[url] <= src/pages/index/index.tsx */
.bg-_burl_B {
  background-color: url;
}
/* tokens: bg-sky-500/80 <= src/pages/index/index.tsx */
.bg-sky-500_f80 {
  background-color: rgba(14, 165, 233, 0.8);
}
/* tokens: bg-opacity-[0.54] <= src/pages/index/index.tsx */
.bg-opacity-_b0_d54_B {
  --tw-bg-opacity: 0.54;
}
/* tokens: bg-[url('https://xxx.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
}
/* tokens: bg-[url('https://yyy.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fyyy_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://yyy.com/xx.webp');
}
/* tokens: p-[20px] <= src/pages/index/index.tsx */
.p-_b20px_B {
  padding: 20rpx;
}
/* tokens: px-[33.89080980rpx] <= src/pages/debug/index.tsx */
.px-_b33_d89080980rpx_B {
  padding-left: 33.8908098rpx;
  padding-right: 33.8908098rpx;
}
/* tokens: px-[95px] <= src/pages/index/index.tsx */
.px-_b95px_B {
  padding-left: 95rpx;
  padding-right: 95rpx;
}
/* tokens: py-[32.8989989rpx] <= src/pages/debug/index.tsx */
.py-_b32_d8989989rpx_B {
  padding-top: 32.8989989rpx;
  padding-bottom: 32.8989989rpx;
}
/* tokens: py-[62px] <= src/pages/index/index.tsx */
.py-_b62px_B {
  padding-top: 62rpx;
  padding-bottom: 62rpx;
}
/* tokens: text-[16px] <= src/pages/index/index.tsx */
.text-_b16px_B {
  font-size: 16rpx;
}
/* tokens: text-[20px] <= src/pages/index/index.tsx */
.text-_b20px_B {
  font-size: 20rpx;
}
/* tokens: text-[50px] <= src/pages/index/index.tsx */
.text-_b50px_B {
  font-size: 50rpx;
}
/* tokens: leading-[0.9] <= src/pages/index/index.tsx */
.leading-_b0_d9_B {
  line-height: 0.9;
}
/* tokens: !text-[#555] <= src/pages/index/index.tsx */
._etext-_b_h555_B {
  --tw-text-opacity: 1 !important;
  color: rgba(85, 85, 85, var(--tw-text-opacity, 1)) !important;
}
/* tokens: text-[#123456] <= src/pages/debug/index.tsx, src/pages/debug/other.tsx */
.text-_b_h123456_B {
  --tw-text-opacity: 1;
  color: rgba(18, 52, 86, var(--tw-text-opacity, 1));
}
/* tokens: text-[#564564] <= src/pages/index/index.tsx */
.text-_b_h564564_B {
  --tw-text-opacity: 1;
  color: rgba(86, 69, 100, var(--tw-text-opacity, 1));
}
/* tokens: text-[#66ffff] <= src/pages/index/index.tsx */
.text-_b_h66ffff_B {
  --tw-text-opacity: 1;
  color: rgba(102, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-[#dddddd] <= src/pages/index/index.tsx */
.text-_b_hdddddd_B {
  --tw-text-opacity: 1;
  color: rgba(221, 221, 221, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa0000] <= src/pages/index/index.tsx */
.text-_b_hfa0000_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 0, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa00aa] <= src/pages/index/index.tsx */
.text-_b_hfa00aa_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 170, var(--tw-text-opacity, 1));
}
/* tokens: text-[#ffffff] <= src/pages/index/index.tsx */
.text-_b_hffffff_B {
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-opacity-[0.19] <= src/pages/index/index.tsx */
.text-opacity-_b0_d19_B {
  --tw-text-opacity: 0.19;
}
.aaaaaaa {
  color: red;
}
/* tokens: before:absolute <= src/pages/index/index.tsx */
.before_cabsolute::before {
  content: var(--tw-content);
  position: absolute;
}
/* tokens: before:inset-0 <= src/pages/index/index.tsx */
.before_cinset-0::before {
  content: var(--tw-content);
  top: 0rpx;
  right: 0rpx;
  bottom: 0rpx;
  left: 0rpx;
}
/* tokens: before:rounded-[20rpx] <= src/pages/index/index.tsx */
.before_crounded-_b20rpx_B::before {
  content: var(--tw-content);
  border-radius: 20rpx;
}
/* tokens: before:border-2 <= src/pages/index/index.tsx */
.before_cborder-2::before {
  content: var(--tw-content);
  border-width: 2rpx;
}
/* tokens: before:border-[#0000ff] <= src/pages/index/index.tsx */
.before_cborder-_b_h0000ff_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(0, 0, 255, var(--tw-border-opacity, 1));
}
/* tokens: before:border-[#4bd650] <= src/pages/index/index.tsx */
.before_cborder-_b_h4bd650_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(75, 214, 80, var(--tw-border-opacity, 1));
}
/* tokens: before:content-['independent_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-independent/pages/index.tsx */
.before_ccontent-_b_aindependent_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleA_普通分包'] <= src/moduleA/pages/index.tsx */
.before_ccontent-_b_amoduleA_u_x666e_u_x901a_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 普通分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleB_独立分包'] <= src/moduleB/pages/index.tsx */
.before_ccontent-_b_amoduleB_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleB 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleC_独立分包'] <= src/moduleC/pages/index.tsx */
.before_ccontent-_b_amoduleC_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleC 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-normal/pages/index.tsx */
.before_ccontent-_b_anormal_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: after:ml-0.5 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_cml-0_d5::after {
  content: var(--tw-content);
  margin-left: 4rpx;
}
/* tokens: after:border-none <= src/pages/index/index.tsx */
.after_cborder-none::after {
  content: var(--tw-content);
  border-style: none;
}
/* tokens: after:text-red-500 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ctext-red-500::after {
  content: var(--tw-content);
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
/* tokens: after:content-["*"] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_q_x_q_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-["的撒的撒"] <= src/pages/index/index.tsx */
.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-['*'] <= src/pages/debug/before.tsx */
.after_ccontent-_b_a_x_a_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-['Hello_World'] <= src/pages/index/index.tsx */
.after_ccontent-_b_aHello_World_a_B::after {
  --tw-content: 'Hello World';
  content: var(--tw-content);
}
/* tokens: after:content-['的撒的撒'] <= src/pages/index/index.tsx */
.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-[*] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_x_B::after {
  --tw-content: *;
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  /* tokens: system-dark:bg-slate-900 <= src/pages/index/index.tsx */
  .system-dark_cbg-slate-900 {
    --tw-bg-opacity: 1;
    background-color: rgba(15, 23, 42, var(--tw-bg-opacity, 1));
  } /* tokens: system-dark:text-slate-100 <= src/pages/index/index.tsx */
  .system-dark_ctext-slate-100 {
    --tw-text-opacity: 1;
    color: rgba(241, 245, 249, var(--tw-text-opacity, 1));
  }
}
/* tokens: theme-dark:bg-zinc-900 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-900.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:bg-zinc-950 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-950.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:text-zinc-50 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_ctext-zinc-50.theme-dark {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-900 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-950 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-950 {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:text-zinc-50 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-[#123456] <= src/pages/index/index.tsx */
.dark view.dark_cbg-_b_h123456_B,
.dark text.dark_cbg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-green-500 <= src/pages/index/index.tsx */
.dark view.dark_cbg-green-500,
.dark text.dark_cbg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-800 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-800,
.dark text.dark_cbg-zinc-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(39, 39, 42, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-900 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-900,
.dark text.dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:text-zinc-50 <= src/pages/index/index.tsx */
.dark view.dark_ctext-zinc-50,
.dark text.dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: [&_.u-count-down\_\_text]:!text-red-400 <= src/pages/debug/arbitraryVariants.tsx | u-count-down__text <= src/pages/debug/arbitraryVariants.tsx */
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  --tw-text-opacity: 1 !important;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1)) !important;
}
```

### pages/index/index.wxss

```css
/* tokens: test <= src/pages/index/index.tsx */
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
/* tokens: aspect-w-16 <= src/pages/index/index.tsx */
.aspect-w-16 > view,
.aspect-w-16 > text {
  color: red;
}
/* tokens: a <= src/index.html, src/pages/index/index.tsx */
.a {
  color: green;
}
/* tokens: b <= src/pages/index/index.tsx */
.b {
  color: #ff0;
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
/* tokens: -m-[20px] <= src/pages/index/index.tsx */
.-m-_b20px_B {
  margin: -20rpx;
}
/* tokens: mb-[-20px] <= src/pages/index/index.tsx */
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
/* tokens: h-[100px] <= src/pages/index/index.tsx */
.h-_b100px_B {
  height: 100rpx;
}
/* tokens: h-[10px] <= src/pages/index/index.tsx */
.h-_b10px_B {
  height: 10rpx;
}
/* tokens: h-[20px] <= src/pages/index/endClassCom.tsx */
.h-_b20px_B {
  height: 20rpx;
}
/* tokens: h-[337px] <= src/pages/index/index.tsx */
.h-_b337px_B {
  height: 337rpx;
}
/* tokens: max-h-[100px] <= src/pages/index/index.tsx */
.max-h-_b100px_B {
  max-height: 100rpx;
}
/* tokens: min-h-[100px] <= src/pages/index/index.tsx */
.min-h-_b100px_B {
  min-height: 100rpx;
}
/* tokens: w-[100px] <= src/pages/index/endClassCom.tsx, src/pages/index/index.tsx */
.w-_b100px_B {
  width: 100rpx;
}
/* tokens: w-[200%] <= src/pages/index/index.tsx */
.w-_b200_v_B {
  width: 200%;
}
/* tokens: w-[20px] <= src/pages/index/index.tsx */
.w-_b20px_B {
  width: 20rpx;
}
/* tokens: w-[300rpx] <= src/pages/index/index.tsx */
.w-_b300rpx_B {
  width: 300rpx;
}
/* tokens: w-[404px] <= src/pages/index/index.tsx */
.w-_b404px_B {
  width: 404rpx;
}
/* tokens: min-w-[300rpx] <= src/pages/index/index.tsx */
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
/* tokens: max-w-[300rpx] <= src/pages/index/index.tsx */
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
/* tokens: space-y-[1.6rem] <= src/pages/index/index.tsx */
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
}
/* tokens: divide-x-[10px] <= src/pages/index/index.tsx */
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
}
/* tokens: divide-[#010101] <= src/pages/index/index.tsx */
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(1, 1, 1, var(--tw-divide-opacity, 1));
}
/* tokens: rounded-[20rpx] <= src/pages/index/index.tsx */
.rounded-_b20rpx_B {
  border-radius: 20rpx;
}
/* tokens: rounded-[40px] <= src/pages/index/index.tsx */
.rounded-_b40px_B {
  border-radius: 40rpx;
}
/* tokens: border-[10px] <= src/pages/index/index.tsx */
.border-_b10px_B {
  border-width: 10rpx;
}
/* tokens: border-[#098765] <= src/pages/index/index.tsx */
.border-_b_h098765_B {
  --tw-border-opacity: 1;
  border-color: rgba(9, 135, 101, var(--tw-border-opacity, 1));
}
/* tokens: border-opacity-[0.44] <= src/pages/index/index.tsx */
.border-opacity-_b0_d44_B {
  --tw-border-opacity: 0.44;
}
/* tokens: bg-[#123456] <= src/pages/index/index.tsx */
.bg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#123] <= src/pages/index/index.tsx */
.bg-_b_h123_B {
  --tw-bg-opacity: 1;
  background-color: rgba(17, 34, 51, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#3232ff] <= src/pages/index/index.tsx */
.bg-_b_h3232ff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(50, 50, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#654321] <= src/pages/index/endClassCom.tsx */
.bg-_b_h654321_B {
  --tw-bg-opacity: 1;
  background-color: rgba(101, 67, 33, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#91ba306d] <= src/pages/debug/index.tsx */
.bg-_b_h91ba306d_B {
  background-color: rgba(145, 186, 48, 0.42745);
}
/* tokens: bg-[#d6d66b] <= src/pages/debug/before.tsx */
.bg-_b_hd6d66b_B {
  --tw-bg-opacity: 1;
  background-color: rgba(214, 214, 107, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#faf] <= src/pages/index/index.tsx */
.bg-_b_hfaf_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 170, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#fff] <= src/pages/index/index.tsx */
.bg-_b_hfff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[url] <= src/pages/index/index.tsx */
.bg-_burl_B {
  background-color: url;
}
/* tokens: bg-sky-500/80 <= src/pages/index/index.tsx */
.bg-sky-500_f80 {
  background-color: rgba(14, 165, 233, 0.8);
}
/* tokens: bg-opacity-[0.54] <= src/pages/index/index.tsx */
.bg-opacity-_b0_d54_B {
  --tw-bg-opacity: 0.54;
}
/* tokens: bg-[url('https://xxx.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
}
/* tokens: bg-[url('https://yyy.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fyyy_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://yyy.com/xx.webp');
}
/* tokens: p-[20px] <= src/pages/index/index.tsx */
.p-_b20px_B {
  padding: 20rpx;
}
/* tokens: px-[33.89080980rpx] <= src/pages/debug/index.tsx */
.px-_b33_d89080980rpx_B {
  padding-left: 33.8908098rpx;
  padding-right: 33.8908098rpx;
}
/* tokens: px-[95px] <= src/pages/index/index.tsx */
.px-_b95px_B {
  padding-left: 95rpx;
  padding-right: 95rpx;
}
/* tokens: py-[32.8989989rpx] <= src/pages/debug/index.tsx */
.py-_b32_d8989989rpx_B {
  padding-top: 32.8989989rpx;
  padding-bottom: 32.8989989rpx;
}
/* tokens: py-[62px] <= src/pages/index/index.tsx */
.py-_b62px_B {
  padding-top: 62rpx;
  padding-bottom: 62rpx;
}
/* tokens: text-[16px] <= src/pages/index/index.tsx */
.text-_b16px_B {
  font-size: 16rpx;
}
/* tokens: text-[20px] <= src/pages/index/index.tsx */
.text-_b20px_B {
  font-size: 20rpx;
}
/* tokens: text-[50px] <= src/pages/index/index.tsx */
.text-_b50px_B {
  font-size: 50rpx;
}
/* tokens: leading-[0.9] <= src/pages/index/index.tsx */
.leading-_b0_d9_B {
  line-height: 0.9;
}
/* tokens: !text-[#555] <= src/pages/index/index.tsx */
._etext-_b_h555_B {
  --tw-text-opacity: 1 !important;
  color: rgba(85, 85, 85, var(--tw-text-opacity, 1)) !important;
}
/* tokens: text-[#123456] <= src/pages/debug/index.tsx, src/pages/debug/other.tsx */
.text-_b_h123456_B {
  --tw-text-opacity: 1;
  color: rgba(18, 52, 86, var(--tw-text-opacity, 1));
}
/* tokens: text-[#564564] <= src/pages/index/index.tsx */
.text-_b_h564564_B {
  --tw-text-opacity: 1;
  color: rgba(86, 69, 100, var(--tw-text-opacity, 1));
}
/* tokens: text-[#66ffff] <= src/pages/index/index.tsx */
.text-_b_h66ffff_B {
  --tw-text-opacity: 1;
  color: rgba(102, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-[#dddddd] <= src/pages/index/index.tsx */
.text-_b_hdddddd_B {
  --tw-text-opacity: 1;
  color: rgba(221, 221, 221, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa0000] <= src/pages/index/index.tsx */
.text-_b_hfa0000_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 0, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa00aa] <= src/pages/index/index.tsx */
.text-_b_hfa00aa_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 170, var(--tw-text-opacity, 1));
}
/* tokens: text-[#ffffff] <= src/pages/index/index.tsx */
.text-_b_hffffff_B {
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-opacity-[0.19] <= src/pages/index/index.tsx */
.text-opacity-_b0_d19_B {
  --tw-text-opacity: 0.19;
}
/* tokens: before:absolute <= src/pages/index/index.tsx */
.before_cabsolute::before {
  content: var(--tw-content);
  position: absolute;
}
/* tokens: before:inset-0 <= src/pages/index/index.tsx */
.before_cinset-0::before {
  content: var(--tw-content);
  top: 0rpx;
  right: 0rpx;
  bottom: 0rpx;
  left: 0rpx;
}
/* tokens: before:rounded-[20rpx] <= src/pages/index/index.tsx */
.before_crounded-_b20rpx_B::before {
  content: var(--tw-content);
  border-radius: 20rpx;
}
/* tokens: before:border-2 <= src/pages/index/index.tsx */
.before_cborder-2::before {
  content: var(--tw-content);
  border-width: 2rpx;
}
/* tokens: before:border-[#0000ff] <= src/pages/index/index.tsx */
.before_cborder-_b_h0000ff_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(0, 0, 255, var(--tw-border-opacity, 1));
}
/* tokens: before:border-[#4bd650] <= src/pages/index/index.tsx */
.before_cborder-_b_h4bd650_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(75, 214, 80, var(--tw-border-opacity, 1));
}
/* tokens: before:content-['independent_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-independent/pages/index.tsx */
.before_ccontent-_b_aindependent_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleA_普通分包'] <= src/moduleA/pages/index.tsx */
.before_ccontent-_b_amoduleA_u_x666e_u_x901a_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 普通分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleB_独立分包'] <= src/moduleB/pages/index.tsx */
.before_ccontent-_b_amoduleB_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleB 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleC_独立分包'] <= src/moduleC/pages/index.tsx */
.before_ccontent-_b_amoduleC_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleC 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-normal/pages/index.tsx */
.before_ccontent-_b_anormal_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: after:ml-0.5 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_cml-0_d5::after {
  content: var(--tw-content);
  margin-left: 4rpx;
}
/* tokens: after:border-none <= src/pages/index/index.tsx */
.after_cborder-none::after {
  content: var(--tw-content);
  border-style: none;
}
/* tokens: after:text-red-500 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ctext-red-500::after {
  content: var(--tw-content);
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
/* tokens: after:content-["*"] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_q_x_q_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-["的撒的撒"] <= src/pages/index/index.tsx */
.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-['*'] <= src/pages/debug/before.tsx */
.after_ccontent-_b_a_x_a_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-['Hello_World'] <= src/pages/index/index.tsx */
.after_ccontent-_b_aHello_World_a_B::after {
  --tw-content: 'Hello World';
  content: var(--tw-content);
}
/* tokens: after:content-['的撒的撒'] <= src/pages/index/index.tsx */
.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-[*] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_x_B::after {
  --tw-content: *;
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  /* tokens: system-dark:bg-slate-900 <= src/pages/index/index.tsx */
  .system-dark_cbg-slate-900 {
    --tw-bg-opacity: 1;
    background-color: rgba(15, 23, 42, var(--tw-bg-opacity, 1));
  }
  /* tokens: system-dark:text-slate-100 <= src/pages/index/index.tsx */
  .system-dark_ctext-slate-100 {
    --tw-text-opacity: 1;
    color: rgba(241, 245, 249, var(--tw-text-opacity, 1));
  }
}
/* tokens: theme-dark:bg-zinc-900 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-900.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:bg-zinc-950 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-950.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:text-zinc-50 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_ctext-zinc-50.theme-dark {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-900 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-950 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-950 {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:text-zinc-50 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-[#123456] <= src/pages/index/index.tsx */
.dark view.dark_cbg-_b_h123456_B,
.dark text.dark_cbg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-green-500 <= src/pages/index/index.tsx */
.dark view.dark_cbg-green-500,
.dark text.dark_cbg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-800 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-800,
.dark text.dark_cbg-zinc-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(39, 39, 42, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-900 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-900,
.dark text.dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:text-zinc-50 <= src/pages/index/index.tsx */
.dark view.dark_ctext-zinc-50,
.dark text.dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: [&_.u-count-down\_\_text]:!text-red-400 <= src/pages/debug/arbitraryVariants.tsx | u-count-down__text <= src/pages/debug/arbitraryVariants.tsx */
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  --tw-text-opacity: 1 !important;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1)) !important;
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
/* tokens: -m-[20px] <= src/pages/index/index.tsx */
.-m-_b20px_B {
  margin: -20rpx;
}
/* tokens: mb-[-20px] <= src/pages/index/index.tsx */
.mb-_b-20px_B {
  margin-bottom: -20rpx;
}
/* tokens: h-[100px] <= src/pages/index/index.tsx */
.h-_b100px_B {
  height: 100rpx;
}
/* tokens: h-[10px] <= src/pages/index/index.tsx */
.h-_b10px_B {
  height: 10rpx;
}
/* tokens: h-[20px] <= src/pages/index/endClassCom.tsx */
.h-_b20px_B {
  height: 20rpx;
}
/* tokens: h-[337px] <= src/pages/index/index.tsx */
.h-_b337px_B {
  height: 337rpx;
}
/* tokens: max-h-[100px] <= src/pages/index/index.tsx */
.max-h-_b100px_B {
  max-height: 100rpx;
}
/* tokens: min-h-[100px] <= src/pages/index/index.tsx */
.min-h-_b100px_B {
  min-height: 100rpx;
}
/* tokens: w-[100px] <= src/pages/index/endClassCom.tsx, src/pages/index/index.tsx */
.w-_b100px_B {
  width: 100rpx;
}
/* tokens: w-[200%] <= src/pages/index/index.tsx */
.w-_b200_v_B {
  width: 200%;
}
/* tokens: w-[20px] <= src/pages/index/index.tsx */
.w-_b20px_B {
  width: 20rpx;
}
/* tokens: w-[300rpx] <= src/pages/index/index.tsx */
.w-_b300rpx_B {
  width: 300rpx;
}
/* tokens: w-[404px] <= src/pages/index/index.tsx */
.w-_b404px_B {
  width: 404rpx;
}
/* tokens: min-w-[300rpx] <= src/pages/index/index.tsx */
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
/* tokens: max-w-[300rpx] <= src/pages/index/index.tsx */
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
/* tokens: space-y-[1.6rem] <= src/pages/index/index.tsx */
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
}
/* tokens: divide-x-[10px] <= src/pages/index/index.tsx */
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(10rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(10rpx * (1 - var(--tw-divide-x-reverse)));
}
/* tokens: divide-[#010101] <= src/pages/index/index.tsx */
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(1, 1, 1, var(--tw-divide-opacity, 1));
}
/* tokens: rounded-[20rpx] <= src/pages/index/index.tsx */
.rounded-_b20rpx_B {
  border-radius: 20rpx;
}
/* tokens: rounded-[40px] <= src/pages/index/index.tsx */
.rounded-_b40px_B {
  border-radius: 40rpx;
}
/* tokens: border-[10px] <= src/pages/index/index.tsx */
.border-_b10px_B {
  border-width: 10rpx;
}
/* tokens: border-[#098765] <= src/pages/index/index.tsx */
.border-_b_h098765_B {
  --tw-border-opacity: 1;
  border-color: rgba(9, 135, 101, var(--tw-border-opacity, 1));
}
/* tokens: border-opacity-[0.44] <= src/pages/index/index.tsx */
.border-opacity-_b0_d44_B {
  --tw-border-opacity: 0.44;
}
/* tokens: bg-[#123456] <= src/pages/index/index.tsx */
.bg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#123] <= src/pages/index/index.tsx */
.bg-_b_h123_B {
  --tw-bg-opacity: 1;
  background-color: rgba(17, 34, 51, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#3232ff] <= src/pages/index/index.tsx */
.bg-_b_h3232ff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(50, 50, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#654321] <= src/pages/index/endClassCom.tsx */
.bg-_b_h654321_B {
  --tw-bg-opacity: 1;
  background-color: rgba(101, 67, 33, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#91ba306d] <= src/pages/debug/index.tsx */
.bg-_b_h91ba306d_B {
  background-color: rgba(145, 186, 48, 0.42745);
}
/* tokens: bg-[#d6d66b] <= src/pages/debug/before.tsx */
.bg-_b_hd6d66b_B {
  --tw-bg-opacity: 1;
  background-color: rgba(214, 214, 107, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#faf] <= src/pages/index/index.tsx */
.bg-_b_hfaf_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 170, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#fff] <= src/pages/index/index.tsx */
.bg-_b_hfff_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[url] <= src/pages/index/index.tsx */
.bg-_burl_B {
  background-color: url;
}
/* tokens: bg-sky-500/80 <= src/pages/index/index.tsx */
.bg-sky-500_f80 {
  background-color: rgba(14, 165, 233, 0.8);
}
/* tokens: bg-opacity-[0.54] <= src/pages/index/index.tsx */
.bg-opacity-_b0_d54_B {
  --tw-bg-opacity: 0.54;
}
/* tokens: bg-[url('https://xxx.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
}
/* tokens: bg-[url('https://yyy.com/xx.webp')] <= src/pages/index/index.tsx */
.bg-_burl_p_ahttps_c_f_fyyy_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://yyy.com/xx.webp');
}
/* tokens: p-[20px] <= src/pages/index/index.tsx */
.p-_b20px_B {
  padding: 20rpx;
}
/* tokens: px-[33.89080980rpx] <= src/pages/debug/index.tsx */
.px-_b33_d89080980rpx_B {
  padding-left: 33.8908098rpx;
  padding-right: 33.8908098rpx;
}
/* tokens: px-[95px] <= src/pages/index/index.tsx */
.px-_b95px_B {
  padding-left: 95rpx;
  padding-right: 95rpx;
}
/* tokens: py-[32.8989989rpx] <= src/pages/debug/index.tsx */
.py-_b32_d8989989rpx_B {
  padding-top: 32.8989989rpx;
  padding-bottom: 32.8989989rpx;
}
/* tokens: py-[62px] <= src/pages/index/index.tsx */
.py-_b62px_B {
  padding-top: 62rpx;
  padding-bottom: 62rpx;
}
/* tokens: text-[16px] <= src/pages/index/index.tsx */
.text-_b16px_B {
  font-size: 16rpx;
}
/* tokens: text-[20px] <= src/pages/index/index.tsx */
.text-_b20px_B {
  font-size: 20rpx;
}
/* tokens: text-[50px] <= src/pages/index/index.tsx */
.text-_b50px_B {
  font-size: 50rpx;
}
/* tokens: leading-[0.9] <= src/pages/index/index.tsx */
.leading-_b0_d9_B {
  line-height: 0.9;
}
/* tokens: !text-[#555] <= src/pages/index/index.tsx */
._etext-_b_h555_B {
  --tw-text-opacity: 1 !important;
  color: rgba(85, 85, 85, var(--tw-text-opacity, 1)) !important;
}
/* tokens: text-[#123456] <= src/pages/debug/index.tsx, src/pages/debug/other.tsx */
.text-_b_h123456_B {
  --tw-text-opacity: 1;
  color: rgba(18, 52, 86, var(--tw-text-opacity, 1));
}
/* tokens: text-[#564564] <= src/pages/index/index.tsx */
.text-_b_h564564_B {
  --tw-text-opacity: 1;
  color: rgba(86, 69, 100, var(--tw-text-opacity, 1));
}
/* tokens: text-[#66ffff] <= src/pages/index/index.tsx */
.text-_b_h66ffff_B {
  --tw-text-opacity: 1;
  color: rgba(102, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-[#dddddd] <= src/pages/index/index.tsx */
.text-_b_hdddddd_B {
  --tw-text-opacity: 1;
  color: rgba(221, 221, 221, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa0000] <= src/pages/index/index.tsx */
.text-_b_hfa0000_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 0, var(--tw-text-opacity, 1));
}
/* tokens: text-[#fa00aa] <= src/pages/index/index.tsx */
.text-_b_hfa00aa_B {
  --tw-text-opacity: 1;
  color: rgba(250, 0, 170, var(--tw-text-opacity, 1));
}
/* tokens: text-[#ffffff] <= src/pages/index/index.tsx */
.text-_b_hffffff_B {
  --tw-text-opacity: 1;
  color: rgba(255, 255, 255, var(--tw-text-opacity, 1));
}
/* tokens: text-opacity-[0.19] <= src/pages/index/index.tsx */
.text-opacity-_b0_d19_B {
  --tw-text-opacity: 0.19;
}
/* tokens: before:absolute <= src/pages/index/index.tsx */
.before_cabsolute::before {
  content: var(--tw-content);
  position: absolute;
}
/* tokens: before:inset-0 <= src/pages/index/index.tsx */
.before_cinset-0::before {
  content: var(--tw-content);
  top: 0rpx;
  right: 0rpx;
  bottom: 0rpx;
  left: 0rpx;
}
/* tokens: before:rounded-[20rpx] <= src/pages/index/index.tsx */
.before_crounded-_b20rpx_B::before {
  content: var(--tw-content);
  border-radius: 20rpx;
}
/* tokens: before:border-2 <= src/pages/index/index.tsx */
.before_cborder-2::before {
  content: var(--tw-content);
  border-width: 2rpx;
}
/* tokens: before:border-[#0000ff] <= src/pages/index/index.tsx */
.before_cborder-_b_h0000ff_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(0, 0, 255, var(--tw-border-opacity, 1));
}
/* tokens: before:border-[#4bd650] <= src/pages/index/index.tsx */
.before_cborder-_b_h4bd650_B::before {
  content: var(--tw-content);
  --tw-border-opacity: 1;
  border-color: rgba(75, 214, 80, var(--tw-border-opacity, 1));
}
/* tokens: before:content-['independent_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-independent/pages/index.tsx */
.before_ccontent-_b_aindependent_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleA_普通分包'] <= src/moduleA/pages/index.tsx */
.before_ccontent-_b_amoduleA_u_x666e_u_x901a_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleA 普通分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleB_独立分包'] <= src/moduleB/pages/index.tsx */
.before_ccontent-_b_amoduleB_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleB 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['moduleC_独立分包'] <= src/moduleC/pages/index.tsx */
.before_ccontent-_b_amoduleC_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before {
  --tw-content: 'moduleC 独立分包';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_taro-webpack-react-tailwindcss-v3'] <= src/sub-normal/pages/index.tsx */
.before_ccontent-_b_anormal_subpackage_taro-webpack-react-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-react-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: after:ml-0.5 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_cml-0_d5::after {
  content: var(--tw-content);
  margin-left: 4rpx;
}
/* tokens: after:border-none <= src/pages/index/index.tsx */
.after_cborder-none::after {
  content: var(--tw-content);
  border-style: none;
}
/* tokens: after:text-red-500 <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ctext-red-500::after {
  content: var(--tw-content);
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
/* tokens: after:content-["*"] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_q_x_q_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-["的撒的撒"] <= src/pages/index/index.tsx */
.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-['*'] <= src/pages/debug/before.tsx */
.after_ccontent-_b_a_x_a_B::after {
  --tw-content: '*';
  content: var(--tw-content);
}
/* tokens: after:content-['Hello_World'] <= src/pages/index/index.tsx */
.after_ccontent-_b_aHello_World_a_B::after {
  --tw-content: 'Hello World';
  content: var(--tw-content);
}
/* tokens: after:content-['的撒的撒'] <= src/pages/index/index.tsx */
.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B::after {
  --tw-content: '的撒的撒';
  content: var(--tw-content);
}
/* tokens: after:content-[*] <= src/pages/debug/before.tsx, src/pages/index/index.tsx */
.after_ccontent-_b_x_B::after {
  --tw-content: *;
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  /* tokens: system-dark:bg-slate-900 <= src/pages/index/index.tsx */
  .system-dark_cbg-slate-900 {
    --tw-bg-opacity: 1;
    background-color: rgba(15, 23, 42, var(--tw-bg-opacity, 1));
  } /* tokens: system-dark:text-slate-100 <= src/pages/index/index.tsx */
  .system-dark_ctext-slate-100 {
    --tw-text-opacity: 1;
    color: rgba(241, 245, 249, var(--tw-text-opacity, 1));
  }
}
/* tokens: theme-dark:bg-zinc-900 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-900.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:bg-zinc-950 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_cbg-zinc-950.theme-dark {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark:text-zinc-50 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.theme-dark_ctext-zinc-50.theme-dark {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-900 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:bg-zinc-950 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_cbg-zinc-950 {
  --tw-bg-opacity: 1;
  background-color: rgba(9, 9, 11, var(--tw-bg-opacity, 1));
}
/* tokens: theme-dark <= src/pages/index/index.tsx | theme-dark:text-zinc-50 <= src/pages/index/index.tsx */
.theme-dark .theme-dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-[#123456] <= src/pages/index/index.tsx */
.dark view.dark_cbg-_b_h123456_B,
.dark text.dark_cbg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-green-500 <= src/pages/index/index.tsx */
.dark view.dark_cbg-green-500,
.dark text.dark_cbg-green-500 {
  --tw-bg-opacity: 1;
  background-color: rgba(34, 197, 94, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-800 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-800,
.dark text.dark_cbg-zinc-800 {
  --tw-bg-opacity: 1;
  background-color: rgba(39, 39, 42, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:bg-zinc-900 <= src/pages/index/index.tsx */
.dark view.dark_cbg-zinc-900,
.dark text.dark_cbg-zinc-900 {
  --tw-bg-opacity: 1;
  background-color: rgba(24, 24, 27, var(--tw-bg-opacity, 1));
}
/* tokens: dark <= src/pages/index/index.tsx | dark:text-zinc-50 <= src/pages/index/index.tsx */
.dark view.dark_ctext-zinc-50,
.dark text.dark_ctext-zinc-50 {
  --tw-text-opacity: 1;
  color: rgba(250, 250, 250, var(--tw-text-opacity, 1));
}
/* tokens: [&_.u-count-down\_\_text]:!text-red-400 <= src/pages/debug/arbitraryVariants.tsx | u-count-down__text <= src/pages/debug/arbitraryVariants.tsx */
._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text {
  --tw-text-opacity: 1 !important;
  color: rgba(248, 113, 113, var(--tw-text-opacity, 1)) !important;
}
```
