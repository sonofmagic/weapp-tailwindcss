# mpx-tailwindcss-v4 CSS Output

Fixture: demo
Entry: mpx-tailwindcss-v4/dist/wx/app.wxss
Generator CSS files: app.wxss, styles/app.wxss, app.wxss, index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 16795 | 68 | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
@import './styles/app.wxss';
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
}
```

### styles/app.wxss

```css
/* tokens: tw-root <= src/custom-tab-bar/index.mpx */
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
  --tw-divide-x-reverse: 0;
  --tw-font-weight:;
  --tw-content: '';
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
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --color-zinc-800: #27272a;
  --color-yellow-400: #facc15;
  --color-green-500: #22c55e;
  --color-blue-500: #3b82f6;
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --font-weight-bold: 700;
}
.-m-_b20px_B {
  margin: -20px;
}
/* tokens: mb-[-20px] <= src/pages/index.mpx */
.mb-_b-20px_B {
  margin-bottom: -20px;
}
/* tokens: h-[20px] <= src/pages/index.mpx */
.h-_b20px_B {
  height: 20px;
}
/* tokens: h-[200%] <= src/pages/index.mpx */
.h-_b200_v_B {
  height: 200%;
}
/* tokens: max-h-[100px] <= src/pages/index.mpx */
.max-h-_b100px_B {
  max-height: 100px;
}
/* tokens: min-h-[100px] <= src/pages/index.mpx */
.min-h-_b100px_B {
  min-height: 100px;
}
/* tokens: w-[20px] <= src/pages/index.mpx */
.w-_b20px_B {
  width: 20px;
}
/* tokens: w-[300rpx] <= src/pages/index.mpx */
.w-_b300rpx_B {
  width: 300rpx;
}
/* tokens: max-w-[300rpx] <= src/pages/index.mpx */
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
/* tokens: min-w-[300rpx] <= src/pages/index.mpx */
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
/* tokens: rotate-[10deg] <= src/pages/index.mpx */
.rotate-_b10deg_B {
  rotate: 10deg;
}
/* tokens: space-y-[1.6rem] <= src/pages/index.mpx */
.space-y-_b1_d6rem_B > text + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
}
/* tokens: divide-x-[10px] <= src/pages/index.mpx */
.divide-x-_b10px_B > text + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-left-width: calc(10px * (1 - var(--tw-divide-x-reverse)));
  border-right-style: var(--tw-border-style);
  border-right-width: calc(10px * var(--tw-divide-x-reverse));
}
/* tokens: divide-[#010101] <= src/pages/index.mpx */
.divide-_b_h010101_B > text + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > view + view {
  border-color: #010101;
}
/* tokens: border-[10px] <= src/pages/index.mpx */
.border-_b10px_B {
  border-width: 10px;
}
/* tokens: border-t-[4px] <= src/pages/index.mpx */
.border-t-_b4px_B {
  border-top-width: 4px;
}
/* tokens: border-[#098765] <= src/pages/index.mpx */
.border-_b_h098765_B {
  border-color: #098765;
}
/* tokens: border-[10rpx] <= src/pages/index.mpx */
.border-_b10rpx_B {
  border-width: 10rpx;
}
/* tokens: border-[red] <= src/pages/index.mpx */
.border-_bred_B {
  border-color: red;
}
/* tokens: border-b-[4rpx] <= src/pages/index.mpx */
.border-b-_b4rpx_B {
  border-bottom-width: 4rpx;
}
/* tokens: !bg-green-500 <= src/pages/index.mpx */
._ebg-green-500 {
  background-color: var(--color-green-500) !important;
}
/* tokens: bg-[#010101] <= src/components/list.mpx, src/custom-tab-bar/index.mpx */
.bg-_b_h010101_B {
  background-color: #010101;
}
/* tokens: bg-[#123456] <= src/pages/index.mpx */
.bg-_b_h123456_B {
  background-color: #123456;
}
/* tokens: bg-[#434344] <= src/components/list.mpx */
.bg-_b_h434344_B {
  background-color: #434344;
}
/* tokens: bg-[#e90505] <= src/custom-tab-bar/index.mpx */
.bg-_b_he90505_B {
  background-color: #e90505;
}
/* tokens: bg-blue-500/50 <= src/pages/index.mpx */
.bg-blue-500_f50 {
  background-color: rgba(59, 130, 246, 0.5);
}
/* tokens: p-[20px] <= src/pages/index.mpx */
.p-_b20px_B {
  padding: 20px;
}
/* tokens: px-[34.54rpx] <= src/pages/index.mpx */
.px-_b34_d54rpx_B {
  padding-left: 34.54rpx;
  padding-right: 34.54rpx;
}
/* tokens: text-[20px] <= src/pages/index.mpx */
.text-_b20px_B {
  font-size: 20px;
}
/* tokens: text-[22px] <= src/pages/index.mpx */
.text-_b22px_B {
  font-size: 22px;
}
/* tokens: text-[32px] <= src/pages/index.mpx */
.text-_b32px_B {
  font-size: 32px;
}
/* tokens: text-[32.4rpx] <= src/pages/index.mpx */
.text-_b32_d4rpx_B {
  font-size: 32.4rpx;
}
/* tokens: text-[32rpx] <= src/pages/index.mpx */
.text-_b32rpx_B {
  font-size: 32rpx;
}
/* tokens: text-[length:var(--my-var-length)] <= src/pages/index.mpx */
.text-_blength_cvar_p--my-var-length_P_B {
  font-size: var(--my-var-length);
}
/* tokens: leading-[0.9] <= src/pages/index.mpx */
.leading-_b0_d9_B {
  --tw-leading: 0.9;
  line-height: 0.9;
}
/* tokens: !font-bold <= src/pages/index.mpx */
._efont-bold {
  --tw-font-weight: var(--font-weight-bold) !important;
  font-weight: var(--font-weight-bold) !important;
}
/* tokens: !text-[#990000] <= src/pages/index.mpx */
._etext-_b_h990000_B {
  color: #900 !important;
}
/* tokens: text-[#5cdc34] <= src/pages/index.mpx */
.text-_b_h5cdc34_B {
  color: #5cdc34;
}
/* tokens: text-[#bada55] <= src/pages/index.mpx */
.text-_b_hbada55_B {
  color: #bada55;
}
/* tokens: text-[#dddddd] <= src/pages/index.mpx */
.text-_b_hdddddd_B {
  color: #ddd;
}
/* tokens: text-[color:var(--my-var)] <= src/pages/index.mpx | text-[var(--my-var)] <= src/pages/index.mpx */
.text-_bcolor_cvar_p--my-var_P_B,
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
/* tokens: shadow-[0px_2px_11px_0px_#00000a] <= src/pages/index.mpx */
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, #00000a);
}
/* tokens: shadow-[0px_2px_11px_0px_#00000a] <= src/pages/index.mpx | shadow-[0px_2px_11px_0px_rgba(0,0,0,0.4)] <= src/pages/index.mpx */
.shadow-_b0px_2px_11px_0px__h00000a_B,
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
/* tokens: shadow-[0px_2px_11px_0px_rgba(0,0,0,0.4)] <= src/pages/index.mpx */
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
}
/* tokens: before:content-['Festivus'] <= src/pages/index.mpx */
.before_ccontent-_b_aFestivus_a_B::before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
/* tokens: before:content-['independent_subpackage_mpx-tailwindcss-v4'] <= src/sub-independent/pages/index.mpx */
.before_ccontent-_b_aindependent_subpackage_mpx-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage mpx-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_mpx-tailwindcss-v4'] <= src/sub-normal/pages/index.mpx */
.before_ccontent-_b_anormal_subpackage_mpx-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage mpx-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: after:border-none <= src/pages/index.mpx */
.after_cborder-none::after {
  --tw-border-style: none;
  border-style: none;
  content: var(--tw-content);
}
/* tokens: active:bg-[#543210] <= src/components/list.mpx */
.active_cbg-_b_h543210_B:active {
  background-color: #543210;
}
/* tokens: active:bg-[#989898] <= src/components/list.mpx, src/custom-tab-bar/index.mpx */
.active_cbg-_b_h989898_B:active {
  background-color: #989898;
}
@media (min-width: 96rem) {
  /* tokens: 2xl:text-base <= src/pages/index.mpx */
  ._2xl_ctext-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  /* tokens: dark:bg-green-500 <= src/pages/index.mpx */
  .dark_cbg-green-500 {
    background-color: var(--color-green-500);
  } /* tokens: dark:bg-zinc-800 <= src/pages/index.mpx */
  .dark_cbg-zinc-800 {
    background-color: var(--color-zinc-800);
  } /* tokens: dark:text-yellow-400 <= src/pages/index.mpx */
  .dark_ctext-yellow-400 {
    color: var(--color-yellow-400);
  }
}
```

### app.wxss

```css
/* tokens: tw-root <= src/custom-tab-bar/index.mpx */
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
  --tw-divide-x-reverse: 0;
  --tw-font-weight:;
  --tw-content: '';
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
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --color-zinc-800: #27272a;
  --color-yellow-400: #facc15;
  --color-green-500: #22c55e;
  --color-blue-500: #3b82f6;
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --font-weight-bold: 700;
}
.-m-_b20px_B {
  margin: -20px;
}
/* tokens: mb-[-20px] <= src/pages/index.mpx */
.mb-_b-20px_B {
  margin-bottom: -20px;
}
/* tokens: h-[20px] <= src/pages/index.mpx */
.h-_b20px_B {
  height: 20px;
}
/* tokens: h-[200%] <= src/pages/index.mpx */
.h-_b200_v_B {
  height: 200%;
}
/* tokens: max-h-[100px] <= src/pages/index.mpx */
.max-h-_b100px_B {
  max-height: 100px;
}
/* tokens: min-h-[100px] <= src/pages/index.mpx */
.min-h-_b100px_B {
  min-height: 100px;
}
/* tokens: w-[20px] <= src/pages/index.mpx */
.w-_b20px_B {
  width: 20px;
}
/* tokens: w-[300rpx] <= src/pages/index.mpx */
.w-_b300rpx_B {
  width: 300rpx;
}
/* tokens: max-w-[300rpx] <= src/pages/index.mpx */
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
/* tokens: min-w-[300rpx] <= src/pages/index.mpx */
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
/* tokens: rotate-[10deg] <= src/pages/index.mpx */
.rotate-_b10deg_B {
  rotate: 10deg;
}
/* tokens: space-y-[1.6rem] <= src/pages/index.mpx */
.space-y-_b1_d6rem_B > text + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
}
/* tokens: divide-x-[10px] <= src/pages/index.mpx */
.divide-x-_b10px_B > text + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-left-width: calc(10px * (1 - var(--tw-divide-x-reverse)));
  border-right-style: var(--tw-border-style);
  border-right-width: calc(10px * var(--tw-divide-x-reverse));
}
/* tokens: divide-[#010101] <= src/pages/index.mpx */
.divide-_b_h010101_B > text + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > view + view {
  border-color: #010101;
}
/* tokens: border-[10px] <= src/pages/index.mpx */
.border-_b10px_B {
  border-width: 10px;
}
/* tokens: border-t-[4px] <= src/pages/index.mpx */
.border-t-_b4px_B {
  border-top-width: 4px;
}
/* tokens: border-[#098765] <= src/pages/index.mpx */
.border-_b_h098765_B {
  border-color: #098765;
}
/* tokens: border-[10rpx] <= src/pages/index.mpx */
.border-_b10rpx_B {
  border-width: 10rpx;
}
/* tokens: border-[red] <= src/pages/index.mpx */
.border-_bred_B {
  border-color: red;
}
/* tokens: border-b-[4rpx] <= src/pages/index.mpx */
.border-b-_b4rpx_B {
  border-bottom-width: 4rpx;
}
/* tokens: !bg-green-500 <= src/pages/index.mpx */
._ebg-green-500 {
  background-color: var(--color-green-500) !important;
}
/* tokens: bg-[#010101] <= src/components/list.mpx, src/custom-tab-bar/index.mpx */
.bg-_b_h010101_B {
  background-color: #010101;
}
/* tokens: bg-[#123456] <= src/pages/index.mpx */
.bg-_b_h123456_B {
  background-color: #123456;
}
/* tokens: bg-[#434344] <= src/components/list.mpx */
.bg-_b_h434344_B {
  background-color: #434344;
}
/* tokens: bg-[#e90505] <= src/custom-tab-bar/index.mpx */
.bg-_b_he90505_B {
  background-color: #e90505;
}
/* tokens: bg-blue-500/50 <= src/pages/index.mpx */
.bg-blue-500_f50 {
  background-color: rgba(59, 130, 246, 0.5);
}
/* tokens: p-[20px] <= src/pages/index.mpx */
.p-_b20px_B {
  padding: 20px;
}
/* tokens: px-[34.54rpx] <= src/pages/index.mpx */
.px-_b34_d54rpx_B {
  padding-left: 34.54rpx;
  padding-right: 34.54rpx;
}
/* tokens: text-[20px] <= src/pages/index.mpx */
.text-_b20px_B {
  font-size: 20px;
}
/* tokens: text-[22px] <= src/pages/index.mpx */
.text-_b22px_B {
  font-size: 22px;
}
/* tokens: text-[32px] <= src/pages/index.mpx */
.text-_b32px_B {
  font-size: 32px;
}
/* tokens: text-[32.4rpx] <= src/pages/index.mpx */
.text-_b32_d4rpx_B {
  font-size: 32.4rpx;
}
/* tokens: text-[32rpx] <= src/pages/index.mpx */
.text-_b32rpx_B {
  font-size: 32rpx;
}
/* tokens: text-[length:var(--my-var-length)] <= src/pages/index.mpx */
.text-_blength_cvar_p--my-var-length_P_B {
  font-size: var(--my-var-length);
}
/* tokens: leading-[0.9] <= src/pages/index.mpx */
.leading-_b0_d9_B {
  --tw-leading: 0.9;
  line-height: 0.9;
}
/* tokens: !font-bold <= src/pages/index.mpx */
._efont-bold {
  --tw-font-weight: var(--font-weight-bold) !important;
  font-weight: var(--font-weight-bold) !important;
}
/* tokens: !text-[#990000] <= src/pages/index.mpx */
._etext-_b_h990000_B {
  color: #900 !important;
}
/* tokens: text-[#5cdc34] <= src/pages/index.mpx */
.text-_b_h5cdc34_B {
  color: #5cdc34;
}
/* tokens: text-[#bada55] <= src/pages/index.mpx */
.text-_b_hbada55_B {
  color: #bada55;
}
/* tokens: text-[#dddddd] <= src/pages/index.mpx */
.text-_b_hdddddd_B {
  color: #ddd;
}
/* tokens: text-[color:var(--my-var)] <= src/pages/index.mpx | text-[var(--my-var)] <= src/pages/index.mpx */
.text-_bcolor_cvar_p--my-var_P_B,
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
/* tokens: shadow-[0px_2px_11px_0px_#00000a] <= src/pages/index.mpx */
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, #00000a);
}
/* tokens: shadow-[0px_2px_11px_0px_#00000a] <= src/pages/index.mpx | shadow-[0px_2px_11px_0px_rgba(0,0,0,0.4)] <= src/pages/index.mpx */
.shadow-_b0px_2px_11px_0px__h00000a_B,
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
/* tokens: shadow-[0px_2px_11px_0px_rgba(0,0,0,0.4)] <= src/pages/index.mpx */
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
}
/* tokens: before:content-['Festivus'] <= src/pages/index.mpx */
.before_ccontent-_b_aFestivus_a_B::before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
/* tokens: before:content-['independent_subpackage_mpx-tailwindcss-v4'] <= src/sub-independent/pages/index.mpx */
.before_ccontent-_b_aindependent_subpackage_mpx-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage mpx-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_mpx-tailwindcss-v4'] <= src/sub-normal/pages/index.mpx */
.before_ccontent-_b_anormal_subpackage_mpx-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage mpx-tailwindcss-v4';
  content: var(--tw-content);
}
/* tokens: after:border-none <= src/pages/index.mpx */
.after_cborder-none::after {
  --tw-border-style: none;
  border-style: none;
  content: var(--tw-content);
}
/* tokens: active:bg-[#543210] <= src/components/list.mpx */
.active_cbg-_b_h543210_B:active {
  background-color: #543210;
}
/* tokens: active:bg-[#989898] <= src/components/list.mpx, src/custom-tab-bar/index.mpx */
.active_cbg-_b_h989898_B:active {
  background-color: #989898;
}
@media (min-width: 96rem) {
  /* tokens: 2xl:text-base <= src/pages/index.mpx */
  ._2xl_ctext-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  /* tokens: dark:bg-green-500 <= src/pages/index.mpx */
  .dark_cbg-green-500 {
    background-color: var(--color-green-500);
  } /* tokens: dark:bg-zinc-800 <= src/pages/index.mpx */
  .dark_cbg-zinc-800 {
    background-color: var(--color-zinc-800);
  } /* tokens: dark:text-yellow-400 <= src/pages/index.mpx */
  .dark_ctext-yellow-400 {
    color: var(--color-yellow-400);
  }
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
```
