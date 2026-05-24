# mpx-tailwindcss-v4 CSS Output

Fixture: demo
Entry: mpx-tailwindcss-v4/dist/wx/app.wxss
Generator CSS files: app.wxss, styles/app.wxss, app.wxss, index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 9491 | 68 | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
@import './styles/app.wxss';
```

### styles/app.wxss

```css
:after,
:before,
text,
view {
  border: 0 solid;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.tw-root,
:host,
page,
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
.mb-_b-20px_B {
  margin-bottom: -20px;
}
.h-_b20px_B {
  height: 20px;
}
.h-_b200_v_B {
  height: 200%;
}
.max-h-_b100px_B {
  max-height: 100px;
}
.min-h-_b100px_B {
  min-height: 100px;
}
.w-_b20px_B {
  width: 20px;
}
.w-_b300rpx_B {
  width: 300rpx;
}
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
.rotate-_b10deg_B {
  rotate: 10deg;
}
.space-y-_b1_d6rem_B > text + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
}
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
.divide-_b_h010101_B > text + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > view + view {
  border-color: #010101;
}
.border-_b10px_B {
  border-width: 10px;
}
.border-_b10rpx_B {
  border-width: 10rpx;
}
.border-_b_h098765_B {
  border-color: #098765;
}
.border-_bred_B {
  border-color: red;
}
.border-b-_b4rpx_B {
  border-bottom-width: 4rpx;
}
.border-t-_b4px_B {
  border-top-width: 4px;
}
._ebg-green-500 {
  background-color: var(--color-green-500) !important;
}
.bg-_b_h010101_B {
  background-color: #010101;
}
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-_b_h434344_B {
  background-color: #434344;
}
.bg-_b_he90505_B {
  background-color: #e90505;
}
.bg-blue-500_f50 {
  background-color: rgba(59, 130, 246, 0.5);
}
.p-_b20px_B {
  padding: 20px;
}
.px-_b34_d54rpx_B {
  padding-left: 34.54rpx;
  padding-right: 34.54rpx;
}
.text-_b20px_B {
  font-size: 20px;
}
.text-_b22px_B {
  font-size: 22px;
}
.text-_b32_d4rpx_B {
  font-size: 32.4rpx;
}
.text-_b32px_B {
  font-size: 32px;
}
.text-_b32rpx_B {
  font-size: 32rpx;
}
.text-_blength_cvar_p--my-var-length_P_B {
  font-size: var(--my-var-length);
}
.leading-_b0_d9_B {
  --tw-leading: 0.9;
  line-height: 0.9;
}
._efont-bold {
  --tw-font-weight: var(--font-weight-bold) !important;
  font-weight: var(--font-weight-bold) !important;
}
._etext-_b_h990000_B {
  color: #900 !important;
}
.text-_b_h5cdc34_B {
  color: #5cdc34;
}
.text-_b_hbada55_B {
  color: #bada55;
}
.text-_b_hdddddd_B {
  color: #ddd;
}
.text-_bcolor_cvar_p--my-var_P_B,
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, #00000a);
}
.shadow-_b0px_2px_11px_0px__h00000a_B,
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
}
.before_ccontent-_b_aFestivus_a_B:before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_mpx-tailwindcss-v4_a_B:before {
  --tw-content: 'independent subpackage mpx-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_mpx-tailwindcss-v4_a_B:before {
  --tw-content: 'normal subpackage mpx-tailwindcss-v4';
  content: var(--tw-content);
}
.after_cborder-none:after {
  --tw-border-style: none;
  border-style: none;
  content: var(--tw-content);
}
.active_cbg-_b_h543210_B:active {
  background-color: #543210;
}
.active_cbg-_b_h989898_B:active {
  background-color: #989898;
}
@media (min-width: 96rem) {
  ._2xl_ctext-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: var(--color-green-500);
  }
  .dark_cbg-zinc-800 {
    background-color: var(--color-zinc-800);
  }
  .dark_ctext-yellow-400 {
    color: var(--color-yellow-400);
  }
}
```

### app.wxss

```css
:after,
:before,
text,
view {
  border: 0 solid;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.tw-root,
:host,
page,
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
.mb-_b-20px_B {
  margin-bottom: -20px;
}
.h-_b20px_B {
  height: 20px;
}
.h-_b200_v_B {
  height: 200%;
}
.max-h-_b100px_B {
  max-height: 100px;
}
.min-h-_b100px_B {
  min-height: 100px;
}
.w-_b20px_B {
  width: 20px;
}
.w-_b300rpx_B {
  width: 300rpx;
}
.max-w-_b300rpx_B {
  max-width: 300rpx;
}
.min-w-_b300rpx_B {
  min-width: 300rpx;
}
.rotate-_b10deg_B {
  rotate: 10deg;
}
.space-y-_b1_d6rem_B > text + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
}
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
.divide-_b_h010101_B > text + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > view + view {
  border-color: #010101;
}
.border-_b10px_B {
  border-width: 10px;
}
.border-_b10rpx_B {
  border-width: 10rpx;
}
.border-_b_h098765_B {
  border-color: #098765;
}
.border-_bred_B {
  border-color: red;
}
.border-b-_b4rpx_B {
  border-bottom-width: 4rpx;
}
.border-t-_b4px_B {
  border-top-width: 4px;
}
._ebg-green-500 {
  background-color: var(--color-green-500) !important;
}
.bg-_b_h010101_B {
  background-color: #010101;
}
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-_b_h434344_B {
  background-color: #434344;
}
.bg-_b_he90505_B {
  background-color: #e90505;
}
.bg-blue-500_f50 {
  background-color: rgba(59, 130, 246, 0.5);
}
.p-_b20px_B {
  padding: 20px;
}
.px-_b34_d54rpx_B {
  padding-left: 34.54rpx;
  padding-right: 34.54rpx;
}
.text-_b20px_B {
  font-size: 20px;
}
.text-_b22px_B {
  font-size: 22px;
}
.text-_b32_d4rpx_B {
  font-size: 32.4rpx;
}
.text-_b32px_B {
  font-size: 32px;
}
.text-_b32rpx_B {
  font-size: 32rpx;
}
.text-_blength_cvar_p--my-var-length_P_B {
  font-size: var(--my-var-length);
}
.leading-_b0_d9_B {
  --tw-leading: 0.9;
  line-height: 0.9;
}
._efont-bold {
  --tw-font-weight: var(--font-weight-bold) !important;
  font-weight: var(--font-weight-bold) !important;
}
._etext-_b_h990000_B {
  color: #900 !important;
}
.text-_b_h5cdc34_B {
  color: #5cdc34;
}
.text-_b_hbada55_B {
  color: #bada55;
}
.text-_b_hdddddd_B {
  color: #ddd;
}
.text-_bcolor_cvar_p--my-var_P_B,
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, #00000a);
}
.shadow-_b0px_2px_11px_0px__h00000a_B,
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
}
.before_ccontent-_b_aFestivus_a_B:before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
.before_ccontent-_b_aindependent_subpackage_mpx-tailwindcss-v4_a_B:before {
  --tw-content: 'independent subpackage mpx-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_mpx-tailwindcss-v4_a_B:before {
  --tw-content: 'normal subpackage mpx-tailwindcss-v4';
  content: var(--tw-content);
}
.after_cborder-none:after {
  --tw-border-style: none;
  border-style: none;
  content: var(--tw-content);
}
.active_cbg-_b_h543210_B:active {
  background-color: #543210;
}
.active_cbg-_b_h989898_B:active {
  background-color: #989898;
}
@media (min-width: 96rem) {
  ._2xl_ctext-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: var(--color-green-500);
  }
  .dark_cbg-zinc-800 {
    background-color: var(--color-zinc-800);
  }
  .dark_ctext-yellow-400 {
    color: var(--color-yellow-400);
  }
}
```

### index.wxss

```css

```
