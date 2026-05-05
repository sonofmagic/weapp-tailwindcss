# Apps 生成模式 CSS 对比报告

本报告由 `pnpm e2e:apps-generator` 生成，用来对比 demo app 在 `WEAPP_TW_GENERATOR_MODE=legacy` 和 `WEAPP_TW_GENERATOR_MODE=generator` 两种构建模式下的样式产物。

## 汇总

| 项目 | 来源 | CSS 文件 | 旧链路字节数 | 生成模式字节数 | 差值 | 比例 | @supports | :hover | Tailwind banner |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| vite-native | apps | `dist/app.wxss` | 5661 | 11141 | +5480 | 1.968 | 否 | 否 | 否 |
| vite-native-ts | apps | `dist/app.wxss` | 10708 | 5020 | -5688 | 0.4688 | 否 | 否 | 否 |
| uni-app-tailwindcss-v5 | demo | `dist/build/mp-weixin/app.wxss` | 8778 | 36490 | +27712 | 4.157 | 否 | 否 | 否 |
| taro-vite-tailwindcss-v5 | demo | `dist/app.wxss` | 27 | 27877 | +27850 | 1032.4815 | 否 | 否 | 否 |
| mpx-tailwindcss-v5 | demo | `dist/wx/app.wxss` | 37 | 37 | 0 | 1 | 否 | 否 | 否 |

## 说明

- `@supports`、`:hover` 和 Tailwind banner 三列描述的是生成模式产物。面向小程序时这些值应保持为 `否`。
- `差值` 等于 `生成模式字节数 - 旧链路字节数`。正数表示当前生成模式产物更大；下面的选择器样本可用于定位后续需要裁剪的部分。
- 选择器列表只保留前 20 项，保证报告稳定且便于阅读。

## 选择器样本

### vite-native

- 两边共有：`.bg-_b_h3a32d1_B`, `.bg-_b_h68c828_B`, `.bg-amber-300`, `.bg-blue-500_f30`, `.bg-gradient-to-b`, `.bg-gradient-to-t`, `.bg-gradient-to-tr`, `.bg-zinc-50`, `.border-4`, `.flex`, `.flex-col`, `.from-_b_h2f73f1_B`, `.h-10`, `.h-_b30px_B`, `.h-_b45px_B`, `.i-mdi-home`, `.inline-block`, `.min-h-screen`, `.p-4`, `.size-12`
- 仅生成模式：`.-start`, `._estart`, `.capitalize`, `.end`, `.filter`, `.inline`, `.invert`, `.resize`, `.rounded`, `.start`, `.transform`, `.transition`, `.truncate`, `:-moz-focusring`, `:-moz-ui-invalid`, `::-webkit-calendar-picker-indicator`, `::-webkit-date-and-time-value`, `::-webkit-datetime-edit`, `::-webkit-datetime-edit-day-field`, `::-webkit-datetime-edit-fields-wrapper`
- 仅旧链路：`.container`, `.h-_b29_d292px_B`, `.space-x-2_d5>text+text`, `.space-x-2_d5>text+view`, `.space-x-2_d5>view+text`, `.space-y-2_d5>text+text`, `.space-y-2_d5>text+view`, `.space-y-2_d5>view+text`, `/*! tailwindcss v4.2.4 \| MIT License \| https://tailwindcss.com */ ::before`, `:after`, `:before`

### vite-native-ts

- 两边共有：`.-inset-_b1rpx_B`, `._b--scroll-offset_c56px_B`, `._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3)`, `._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3)`, `._b_n_view_B_cp-_b12rpx_B view`, `._bmask-type_calpha_B`, `._bmask-type_cluminance_B`, `._bpadding_c20rpx_B`, `.bg-_b_h123456_B`, `.bg-_b_h16a34a_B`, `.bg-_b_h2563eb_B`, `.bg-_b_hB91C1C_B`, `.bg-_b_hd72929_B`, `.bg-_b_hdc2626_B`, `.bg-_bcolor_cvar_p--mystery-var_P_B`, `.bg-_bgreen_B`, `.bg-_borange_B`, `.bg-_bpink_B`, `.border-_b_h94a3b8_B`, `.dark_cbg-gray-900`
- 仅生成模式：-
- 仅旧链路：`.-inset-1`, `.bg-black`, `.bg-blue-500`, `.bg-blue-600`, `.bg-transparent`, `.bg-white`, `.block`, `.border`, `.border-current`, `.border-gray-400`, `.border-transparent`, `.bottom-auto`, `.capitalize`, `.cursor-not-allowed`, `.divide-x>text+text`, `.divide-x>text+view`, `.divide-x>view+text`, `.divide-x>view+view`, `.duration-200`, `.duration-300`

### uni-app-tailwindcss-v5

- 两边共有：`.active_cbg-emerald-600:active`, `.aspect-_bcalc_p4_x3_u1_P_f3_B`, `.aspect-_p--my-aspect-ratio_P`, `.bg-_b_h0000ff_B`, `.bg-_b_h123498_B`, `.bg-emerald-500`, `.bg-gradient-to-r`, `.bg-midnight`, `.bg-neutral-1B`, `.border`, `.container`, `.divide-_b_h41eb04_B>view+view`, `.divide-_b_hd80c0c_B>view+view`, `.divide-dotted>view+view`, `.divide-double>view+view`, `.divide-x-4>view+view`, `.divide-x-reverse>view+view`, `.divide-y-4>view+view`, `.divide-y-reverse>view+view`, `.fill-bermuda`
- 仅生成模式：`.absolute`, `.active_cbg-emerald-50:active`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-emerald-100`, `.bg-repeat`, `.bg-slate-50`, `.bg-white`, `.block`, `.blur`, `.border-b`, `.border-collapse`, `.border-e`, `.border-emerald-500`, `.border-l`, `.border-r`
- 仅旧链路：`.divide-_b_h41eb04_B>text+text`, `.divide-_b_h41eb04_B>text+view`, `.divide-_b_h41eb04_B>view+text`, `.divide-_b_hd80c0c_B>text+text`, `.divide-_b_hd80c0c_B>text+view`, `.divide-_b_hd80c0c_B>view+text`, `.divide-dotted>text+text`, `.divide-dotted>text+view`, `.divide-dotted>view+text`, `.divide-double>text+text`, `.divide-double>text+view`, `.divide-double>view+text`, `.divide-x-4>text+text`, `.divide-x-4>text+view`, `.divide-x-4>view+text`, `.divide-x-reverse>text+text`, `.divide-x-reverse>text+view`, `.divide-x-reverse>view+text`, `.divide-y-4>text+text`, `.divide-y-4>text+view`

### taro-vite-tailwindcss-v5

- 两边共有：-
- 仅生成模式：`._eborder-brand`, `.absolute`, `.active_cbg-emerald-600:active`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-_b_h123456_B`, `.bg-brand`, `.bg-gradient-to-b`, `.bg-gradient-to-r`, `.bg-gray-100`, `.bg-linear-to-r`, `.bg-red-500`, `.bg-repeat`, `.block`, `.blur`, `.border`
- 仅旧链路：-

### mpx-tailwindcss-v5

- 两边共有：-
- 仅生成模式：-
- 仅旧链路：-
