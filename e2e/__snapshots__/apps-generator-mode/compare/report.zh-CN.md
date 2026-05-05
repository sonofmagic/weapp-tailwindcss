# Apps 生成模式 CSS 对比报告

本报告由 `pnpm e2e:apps-generator` 生成，用来对比 demo app 在 `WEAPP_TW_GENERATOR_MODE=legacy` 和 `WEAPP_TW_GENERATOR_MODE=generator` 两种构建模式下的样式产物。

## 汇总

| 项目 | 来源 | 状态 | CSS 文件 | 旧链路字节数 | 生成模式字节数 | 差值 | 比例 | @supports | :hover | Tailwind banner |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- |
| vite-native | apps | 通过 | `vite-native/dist/app.wxss` (+2) | 7049 | 7307 | +258 | 1.0366 | 否 | 否 | 否 |
| vite-native-ts | apps | 通过 | `vite-native-ts/dist/app.wxss` (+3) | 12527 | 19347 | +6820 | 1.5444 | 否 | 否 | 否 |
| uni-app-vue3-vite | demo | 通过 | `uni-app-vue3-vite/dist/build/mp-weixin/app.wxss` (+10) | 402079 | 234371 | -167708 | 0.5829 | 否 | 否 | 否 |
| uni-app-tailwindcss-v4 | demo | 通过 | `uni-app-tailwindcss-v4/dist/build/mp-weixin/app.wxss` (+2) | 47746 | 97875 | +50129 | 2.0499 | 否 | 否 | 否 |
| uni-app-tailwindcss-v5 | demo | 通过 | `uni-app-tailwindcss-v5/dist/build/mp-weixin/app.wxss` (+2) | 56757 | 106324 | +49567 | 1.8733 | 否 | 否 | 否 |
| taro-app | demo | 通过 | `taro-app/dist/app.wxss` (+5) | 48553 | 52777 | +4224 | 1.087 | 否 | 否 | 否 |
| taro-webpack-tailwindcss-v4 | demo | 通过 | `taro-webpack-tailwindcss-v4/dist/app.wxss` (+1) | 383463 | 10654 | -372809 | 0.0278 | 否 | 否 | 否 |
| taro-app-vite | demo | 通过 | `taro-app-vite/dist/app.wxss` (+2) | 4698 | 2525 | -2173 | 0.5375 | 否 | 否 | 否 |
| taro-vite-tailwindcss-v4 | demo | 通过 | `taro-vite-tailwindcss-v4/dist/app.wxss` (+2) | 3646 | 5601 | +1955 | 1.5362 | 否 | 否 | 否 |
| taro-vite-tailwindcss-v5 | demo | 通过 | `taro-vite-tailwindcss-v5/dist/app.wxss` (+2) | 6600 | 23241 | +16641 | 3.5214 | 否 | 否 | 否 |
| taro-vue3-app | demo | 通过 | `taro-vue3-app/dist/app.wxss` (+1) | 118508 | 12507 | -106001 | 0.1055 | 否 | 否 | 否 |
| gulp-app | demo | 通过 | `gulp-app/dist/app.wxss` (+2) | 6578 | 5999 | -579 | 0.912 | 否 | 否 | 否 |
| mpx-app | demo | 通过 | `mpx-app/dist/wx/app.wxss` (+16) | 189931 | 19333 | -170598 | 0.1018 | 否 | 否 | 否 |
| mpx-tailwindcss-v4 | demo | 通过 | `mpx-tailwindcss-v4/dist/wx/app.wxss` (+3) | 21126 | 10498 | -10628 | 0.4969 | 否 | 否 | 否 |
| mpx-tailwindcss-v5 | demo | 通过 | `mpx-tailwindcss-v5/dist/wx/app.wxss` (+3) | 25140 | 11586 | -13554 | 0.4609 | 否 | 否 | 否 |

## 说明

- CSS 文件列展示入口样式；`(+N)` 表示报告还会聚合 `@import` 关联样式，例如 Taro 的 `app-origin.wxss` 或 Mpx 的 hash 化 `styles/app*.wxss`。
- `@supports`、`:hover` 和 Tailwind banner 三列描述的是生成模式产物。面向小程序时这些值应保持为 `否`。
- `差值` 等于 `生成模式字节数 - 旧链路字节数`。正数表示当前生成模式产物更大；下面的选择器样本可用于定位后续需要裁剪的部分。
- 选择器列表只保留前 20 项，保证报告稳定且便于阅读。
- 失败行会在失败详情中保留首个失败模式和错误信息，便于持续消除迁移阻塞。

## 失败详情

- 无

## 选择器样本

### vite-native

- CSS 文件：`app.wxss`, `apple.wxss`, `index.wxss`
- 两边共有：`.bg-_b_h3a32d1_B`, `.bg-_b_h68c828_B`, `.bg-amber-300`, `.bg-blue-500_f30`, `.bg-gradient-to-b`, `.bg-gradient-to-t`, `.bg-gradient-to-tr`, `.bg-zinc-50`, `.border-4`, `.flex`, `.flex-col`, `.from-_b_h2f73f1_B`, `.h-10`, `.h-_b30px_B`, `.h-_b45px_B`, `.i-mdi-home`, `.inline-block`, `.min-h-screen`, `.p-4`, `.size-12`
- 仅生成模式：`.-start`, `._estart`, `.capitalize`, `.end`, `.filter`, `.inline`, `.invert`, `.resize`, `.rounded`, `.start`, `.transform`, `.transition`, `.truncate`, `/*$vite$:1*/ /* stylelint-disable-next-line import-notation */ .s .a`
- 仅旧链路：`.container`, `.h-_b29_d292px_B`, `.space-x-2_d5 > text + text`, `.space-x-2_d5 > text + view`, `.space-x-2_d5 > view + text`, `.space-y-2_d5 > text + text`, `.space-y-2_d5 > text + view`, `.space-y-2_d5 > view + text`, `/*$vite$:1*/ /*$vite$:1*/ /* stylelint-disable-next-line import-notation */ .s .a`, `::after`, `::before`, `:after`, `:before`, `text`, `view`

### vite-native-ts

- CSS 文件：`app.wxss`, `index.wxss`, `index.wxss`, `index.wxss`
- 两边共有：`.-inset-_b1rpx_B`, `._b--scroll-offset_c56px_B`, `._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3)`, `._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3)`, `._b_n_view_B_cp-_b12rpx_B view`, `._bmask-type_calpha_B`, `._bmask-type_cluminance_B`, `._bpadding_c20rpx_B`, `.bg-_b_h123456_B`, `.bg-_b_h16a34a_B`, `.bg-_b_h2563eb_B`, `.bg-_b_hB91C1C_B`, `.bg-_b_hd72929_B`, `.bg-_b_hdc2626_B`, `.bg-_bcolor_cvar_p--mystery-var_P_B`, `.bg-_bgreen_B`, `.bg-_borange_B`, `.bg-_bpink_B`, `.border-_b_h94a3b8_B`, `.dark_cbg-gray-900`
- 仅生成模式：-
- 仅旧链路：`.-inset-1`, `.bg-black`, `.bg-blue-500`, `.bg-blue-600`, `.bg-transparent`, `.bg-white`, `.block`, `.border`, `.border-current`, `.border-gray-400`, `.border-transparent`, `.bottom-auto`, `.capitalize`, `.cursor-not-allowed`, `.divide-x > text + text`, `.divide-x > text + view`, `.divide-x > view + text`, `.divide-x > view + view`, `.duration-200`, `.duration-300`

### uni-app-vue3-vite

- CSS 文件：`app.wxss`, `index.wxss`, `a.wxss`, `b.wxss`, `index.wxss`, `u-button.wxss`, `u-loading-icon.wxss`, `index.wxss`, `peer.wxss`, `tailwind-children.wxss`, `typography.wxss`
- 两边共有：`.-m-_b20px_B`, `.-mt-2`, `._2xl_ctext-_bred_B`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._ebg-green-500`, `._eborder-primary`, `._efont-bold`, `._ehidden`, `._etext-_b_h990000_B`, `._etext-primary`, `.after_cborder-none::after`, `.after_ccontent-_b_au_x6211_u_x662f_className_a_B::after`, `.after_ccontent-_b_au_x6211_u_x6765_u_x81ea_utils_dfilter_djs_a_B::after`, `.after_ccontent-_b_r_au_x6211_u_x6765_u_x81ea_inline-wxs_r_a_B::after`, `.backdrop-blur-_b2rpx_B`, `.before_ccontent-_b_aFestivus_a_B::before`, `.before_ccontent-_b_a_x_a_B::before`, `.before_ccontent-_b_amoduleA_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before`, `.bg-_b_h123324_B`, `.bg-_b_h123456_B`
- 仅生成模式：-
- 仅旧链路：`.content::before`, `.data-v-882a8a56.tw-root`, `.data-v-882a8a56:host`, `.data-v-8bf38d10.tw-root`, `.data-v-921e5271.tw-root`, `.divide-_b3rpx_B > text + text`, `.divide-_b3rpx_B > text + view`, `.divide-_b3rpx_B > view + text`, `.divide-_b_h010101_B > text + text`, `.divide-_b_h010101_B > text + view`, `.divide-_b_h010101_B > view + text`, `.divide-solid > text + text`, `.divide-solid > text + view`, `.divide-solid > view + text`, `.divide-x-_b10px_B > text + text`, `.divide-x-_b10px_B > text + view`, `.divide-x-_b10px_B > view + text`, `.divide-x-_b3px_B > text + text`, `.divide-x-_b3px_B > text + view`, `.divide-x-_b3px_B > view + text`

### uni-app-tailwindcss-v4

- CSS 文件：`app.wxss`, `home.wxss`, `user.wxss`
- 两边共有：`.active_cbg-emerald-50:active`, `.active_cbg-emerald-600:active`, `.aspect-_bcalc_p4_x3_u1_P_f3_B`, `.aspect-_p--my-aspect-ratio_P`, `.bg-_b_h0000ff_B`, `.bg-_b_h123498_B`, `.bg-emerald-100`, `.bg-emerald-500`, `.bg-midnight`, `.bg-neutral-1B`, `.bg-slate-50`, `.bg-white`, `.block`, `.border`, `.border-emerald-500`, `.border-slate-200`, `.container`, `.divide-_b_h41eb04_B > view + view`, `.divide-_b_hd80c0c_B > view + view`, `.divide-dotted > view + view`
- 仅生成模式：`.absolute`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-repeat`, `.blur`, `.border-b`, `.border-collapse`, `.border-e`, `.border-l`, `.border-r`, `.border-s`, `.border-t`, `.border-x`, `.border-y`, `.capitalize`, `.collapse`
- 仅旧链路：`.divide-_b_h41eb04_B > text + text`, `.divide-_b_h41eb04_B > text + view`, `.divide-_b_h41eb04_B > view + text`, `.divide-_b_hd80c0c_B > text + text`, `.divide-_b_hd80c0c_B > text + view`, `.divide-_b_hd80c0c_B > view + text`, `.divide-dotted > text + text`, `.divide-dotted > text + view`, `.divide-dotted > view + text`, `.divide-double > text + text`, `.divide-double > text + view`, `.divide-double > view + text`, `.divide-x-4 > text + text`, `.divide-x-4 > text + view`, `.divide-x-4 > view + text`, `.divide-x-reverse > text + text`, `.divide-x-reverse > text + view`, `.divide-x-reverse > view + text`, `.divide-y-4 > text + text`, `.divide-y-4 > text + view`

### uni-app-tailwindcss-v5

- CSS 文件：`app.wxss`, `home.wxss`, `user.wxss`
- 两边共有：`.active_cbg-emerald-50:active`, `.active_cbg-emerald-600:active`, `.aspect-_bcalc_p4_x3_u1_P_f3_B`, `.aspect-_p--my-aspect-ratio_P`, `.bg-_b_h0000ff_B`, `.bg-_b_h123498_B`, `.bg-emerald-100`, `.bg-emerald-500`, `.bg-gradient-to-r`, `.bg-midnight`, `.bg-neutral-1B`, `.bg-slate-50`, `.bg-white`, `.block`, `.border`, `.border-emerald-500`, `.border-slate-200`, `.container`, `.divide-_b_h41eb04_B > view + view`, `.divide-_b_hd80c0c_B > view + view`
- 仅生成模式：`.absolute`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-repeat`, `.blur`, `.border-b`, `.border-collapse`, `.border-e`, `.border-l`, `.border-r`, `.border-s`, `.border-t`, `.border-x`, `.border-y`, `.capitalize`, `.collapse`
- 仅旧链路：`.divide-_b_h41eb04_B > text + text`, `.divide-_b_h41eb04_B > text + view`, `.divide-_b_h41eb04_B > view + text`, `.divide-_b_hd80c0c_B > text + text`, `.divide-_b_hd80c0c_B > text + view`, `.divide-_b_hd80c0c_B > view + text`, `.divide-dotted > text + text`, `.divide-dotted > text + view`, `.divide-dotted > view + text`, `.divide-double > text + text`, `.divide-double > text + view`, `.divide-double > view + text`, `.divide-x-4 > text + text`, `.divide-x-4 > text + view`, `.divide-x-4 > view + text`, `.divide-x-reverse > text + text`, `.divide-x-reverse > text + view`, `.divide-x-reverse > view + text`, `.divide-y-4 > text + text`, `.divide-y-4 > text + view`

### taro-app

- CSS 文件：`app.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`
- 两边共有：`.-m-_b20px_B`, `.-mt-2`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._etext-_b_h555_B`, `.after_cborder-none::after`, `.after_ccontent-_b_aHello_World_a_B::after`, `.after_ccontent-_b_a_x_a_B::after`, `.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B::after`, `.after_ccontent-_b_q_x_q_B::after`, `.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B::after`, `.after_ccontent-_b_x_B::after`, `.after_cml-0_d5::after`, `.after_ctext-red-500::after`, `.before_cabsolute::before`, `.before_cborder-2::before`, `.before_cborder-_b_h0000ff_B::before`, `.before_cborder-_b_h4bd650_B::before`, `.before_ccontent-_b_amoduleA_u_x666e_u_x901a_u_x5206_u_x5305__a_B::before`, `.before_ccontent-_b_amoduleB_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before`, `.before_ccontent-_b_amoduleC_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B::before`
- 仅生成模式：-
- 仅旧链路：`.a`, `.aaaaaaa`, `.aspect-w-16 > text`, `.aspect-w-16 > view`, `.b`, `.divide-_b_h010101_B > text + text`, `.divide-_b_h010101_B > text + view`, `.divide-_b_h010101_B > view + text`, `.divide-solid > text + text`, `.divide-solid > text + view`, `.divide-solid > view + text`, `.divide-x-_b10px_B > text + text`, `.divide-x-_b10px_B > text + view`, `.divide-x-_b10px_B > view + text`, `.my-text-_b_h11e331_B`, `.space-y-_b1_d6rem_B > text + text`, `.space-y-_b1_d6rem_B > text + view`, `.space-y-_b1_d6rem_B > view + text`, `.test`, `::-ms-backdrop`

### taro-webpack-tailwindcss-v4

- CSS 文件：`app.wxss`, `index.wxss`
- 两边共有：`._bchunkhash_c8_B`, `._bhash_c8_B`, `.bg-_b_h534312_B`, `.nut-icon`, `.nut-icon-Loading`, `.nut-icon-Loading1`, `.nut-icon-am-blink`, `.nut-icon-am-bounce`, `.nut-icon-am-bounce.nut-icon-am-infinite`, `.nut-icon-am-breathe`, `.nut-icon-am-flash`, `.nut-icon-am-infinite`, `.nut-icon-am-jump`, `.nut-icon-am-jump.nut-icon-am-infinite`, `.nut-icon-am-rotate`, `.nut-icon-am-rotate.nut-icon-am-infinite`, `.nut-icon-am-shake`, `.nut-icon-img`, `.nut-icon-loading`, `.nut-icon-loading1`
- 仅生成模式：-
- 仅旧链路：`.bg-gradient-to-r`, `.bg-purple-800`, `.fade-appear`, `.fade-appear-active`, `.fade-enter`, `.fade-enter-active`, `.fade-enter-done`, `.fade-exit`, `.fade-exit-active`, `.fade-exit-done`, `.from-cyan-500`, `.h-14`, `.nut-actionsheet`, `.nut-actionsheet .nut-popup-title`, `.nut-actionsheet-cancel`, `.nut-actionsheet-cancel-danger`, `.nut-actionsheet-cancel-description`, `.nut-actionsheet-cancel-disabled`, `.nut-actionsheet-cancel-name`, `.nut-actionsheet-item`

### taro-app-vite

- CSS 文件：`app.wxss`, `app-origin.wxss`, `index.wxss`
- 两边共有：`.bg-_b_h89ab8d_B`, `.bg-_b_he24826_B`, `.divide-_b_h60d256_B > view + view`, `.divide-solid > view + view`, `.divide-x-8 > view + view`, `.flex`, `.flex-col`, `.text-_b66rpx_B`, `.text-_b_h3d31a4_B`, `.text-_b_h438821_B`
- 仅生成模式：`.before_ccontent-_b_q11111_q_B::before`, `.before_ccontent-_b_q222_q_B::before`
- 仅旧链路：`.before_ccontent-_b_q11111_q_B:before`, `.before_ccontent-_b_q222_q_B:before`, `.divide-_b_h60d256_B > text + text`, `.divide-_b_h60d256_B > text + view`, `.divide-_b_h60d256_B > view + text`, `.divide-solid > text + text`, `.divide-solid > text + view`, `.divide-solid > view + text`, `.divide-x-8 > text + text`, `.divide-x-8 > text + view`, `.divide-x-8 > view + text`, `.tw-page-style-watch-anchor`, `::after`, `::before`, `:after`, `:before`, `text`, `view`

### taro-vite-tailwindcss-v4

- CSS 文件：`app.wxss`, `app-origin.wxss`, `index.wxss`
- 两边共有：`.bg-_b_h123456_B`, `.bg-gradient-to-r`, `.bg-linear-to-r`, `.bg-purple-300`, `.from-cyan-500`, `.h-14`, `.h-_b300px_B`, `.static`, `.text-_b55rpx_B`, `.text-_b_hc31d6b_B`, `.text-_b_hfff_B`, `.to-blue-500`, `.tw-page-style-watch-anchor`, `.tw-root`, `:host`, `page`, `wx-root-portal-content`
- 仅生成模式：`.block`, `.blur`, `.border`, `.container`, `.ease-out`, `.filter`, `.fixed`, `.flex`, `.grid`, `.hidden`, `.inline`, `.outline`, `.resize`, `.table`, `.transform`, `.transition`, `.visible`
- 仅旧链路：`::-ms-backdrop`, `::-webkit-backdrop`, `::after`, `::before`, `:after`, `:before`, `text`, `view`

### taro-vite-tailwindcss-v5

- CSS 文件：`app.wxss`, `app-origin.wxss`, `index.wxss`
- 两边共有：`._eborder-brand`, `.active_cbg-emerald-600:active`, `.bg-_b_h123456_B`, `.bg-brand`, `.bg-gradient-to-b`, `.bg-gradient-to-r`, `.bg-gray-100`, `.bg-linear-to-r`, `.bg-red-500`, `.border-_b10rpx_B`, `.from-cyan-500`, `.from-fuchsia-500`, `.h-14`, `.h-_b300px_B`, `.p-4`, `.p-_b32rpx_B`, `.rotate-_b10deg_B`, `.rounded-xl`, `.space-y-4 > view + view`, `.static`
- 仅生成模式：`.absolute`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-repeat`, `.block`, `.blur`, `.border`, `.border-b`, `.border-collapse`, `.border-e`, `.border-l`, `.border-r`, `.border-s`, `.border-t`, `.border-x`, `.border-y`
- 仅旧链路：`.dark_cbg-zinc-800`, `.space-y-4 > text + text`, `.space-y-4 > text + view`, `.space-y-4 > view + text`, `::-ms-backdrop`, `::-webkit-backdrop`, `::after`, `::before`, `:after`, `:before`, `text`, `view`

### taro-vue3-app

- CSS 文件：`app.wxss`, `index.wxss`
- 两边共有：`.-m-_b20px_B`, `.-mt-2`, `.after_ccontent-_b_au_x6211_u_x77e5_u_x9053_u_x6211_u_x5fc3__mu_x6c38_u_x6052_12we_ds_a_B::after`, `.bg-_b_h098765_B`, `.bg-_b_h123456_B`, `.bg-_b_h543254_B`, `.bg-_b_h654123_B`, `.bg-_b_h654321_B`, `.bg-_b_hdbdada_B`, `.bg-_b_hfafa00_B`, `.bg-_b_hfafafa_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-gradient-to-r`, `.bg-gray-100`, `.bg-opacity-_b0_d54_B`, `.bg-pink-500`, `.bg-red-500`, `.bg-red-900`, `.block`, `.border-_b10px_B`
- 仅生成模式：-
- 仅旧链路：`.container`, `.divide-_b_h010101_B > text + text`, `.divide-_b_h010101_B > text + view`, `.divide-_b_h010101_B > view + text`, `.divide-solid > text + text`, `.divide-solid > text + view`, `.divide-solid > view + text`, `.divide-x-_b10px_B > text + text`, `.divide-x-_b10px_B > text + view`, `.divide-x-_b10px_B > view + text`, `.h5-html`, `.nut-button`, `.nut-button .nut-button__text`, `.nut-button--block`, `.nut-button--danger`, `.nut-button--danger:not([disabled]):active`, `.nut-button--default`, `.nut-button--default:not([disabled]):active`, `.nut-button--disabled`, `.nut-button--disabled::before`

### gulp-app

- CSS 文件：`app.wxss`, `index.wxss`, `more.wxss`
- 两边共有：`.bg-_b_hfff_B`, `.bg-_blength_c100_v_100_v_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-_burl_phttps_c_f_fpic1_dzhimg_dcom_fv2-3ee20468f54bbfefcd0027283b21aaa8_720w_djpg_P_B`, `.bg-no-repeat`, `.block`, `.border-_b_hEEEEEE_B`, `.border-b`, `.font-bold`, `.font-medium`, `.h-_b41_d54vw_B`, `.h-full`, `.m-_b20px_B`, `.mb-_b20px_B`, `.mt-_b24px_B`, `.mt-_b33px_B`, `.p-4`, `.pb-_b10px_B`, `.pl-_b15px_B`, `.space-y-1 > view + view`
- 仅生成模式：-
- 仅旧链路：`.i-mdi-123`, `.i-mdi-ab-testing`, `.i-mdi-abacus`, `.i-mdi-typewriter`, `.more__pre`, `.more__pre text`, `.space-y-1 > text + text`, `.space-y-1 > text + view`, `.space-y-1 > view + text`, `.space-y-4 > text + text`, `.space-y-4 > text + view`, `.space-y-4 > view + text`, `::after`, `::before`, `text`, `view`

### mpx-app

- CSS 文件：`app.wxss`, `styles/base.wxss`, `styles/components.wxss`, `styles/utilities.wxss`, `index.wxss`, `button.wxss`, `icon.wxss`, `loading.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `base5c682eff.wxss`, `components1e38aa04.wxss`, `indexd323f158.wxss`, `indexfcda771e.wxss`, `utilities68e69726.wxss`
- 两边共有：`.bg-_b_h123456_B`, `.bg-_b_h929292_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.flex`, `.flex-col`, `.text-_b_he67240_B`, `.text-_bblue_B`
- 仅生成模式：`.after_ccontent-_b_au_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x8fd9_u_x662f_u_x4e2d_u_x6587_u_x5b57_u_x7b26_u_x4e32__a_B::after`, `.after_ccontent-_b_qu_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x5f88_u_x65e0_u_x804a__q_B::after`, `.after_cml-0_d5::after`, `.after_ctext-red-500::after`
- 仅旧链路：`.after_ccontent-_b_au_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x8fd9_u_x662f_u_x4e2d_u_x6587_u_x5b57_u_x7b26_u_x4e32__a_B:after`, `.after_ccontent-_b_qu_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x5f88_u_x65e0_u_x804a__q_B:after`, `.after_cml-0_d5:after`, `.after_ctext-red-500:after`, `.hotspot-expanded.relative`, `.hotspot-expanded:after`, `.t-button`, `.t-button--block`, `.t-button--circle`, `.t-button--circle.t-button--size-extra-small`, `.t-button--circle.t-button--size-extra-small:after`, `.t-button--circle.t-button--size-large`, `.t-button--circle.t-button--size-large:after`, `.t-button--circle.t-button--size-medium`, `.t-button--circle.t-button--size-medium:after`, `.t-button--circle.t-button--size-small`, `.t-button--circle.t-button--size-small:after`, `.t-button--danger`, `.t-button--danger.t-button--disabled`, `.t-button--danger.t-button--disabled:after`

### mpx-tailwindcss-v4

- CSS 文件：`app.wxss`, `styles/app.wxss`, `index.wxss`, `app36a8d5bb.wxss`
- 两边共有：`.-m-_b20px_B`, `._ebg-green-500`, `._efont-bold`, `._etext-_b_h990000_B`, `.active_cbg-_b_h543210_B:active`, `.active_cbg-_b_h989898_B:active`, `.bg-_b_h010101_B`, `.bg-_b_h123456_B`, `.bg-_b_h434344_B`, `.bg-_b_he90505_B`, `.bg-blue-500_f50`, `.border-_b10px_B`, `.border-_b10rpx_B`, `.border-_b_h098765_B`, `.border-_bred_B`, `.border-b-_b4rpx_B`, `.border-t-_b4px_B`, `.divide-_b_h010101_B > view + view`, `.divide-x-_b10px_B > view + view`, `.h-_b200_v_B`
- 仅生成模式：`.after_cborder-none::after`, `.before_ccontent-_b_aFestivus_a_B::before`
- 仅旧链路：`.-mt-2`, `._2xl_ctext-_bred_B`, `.after_cborder-none:after`, `.before_ccontent-_b_aFestivus_a_B:before`, `.bg-gray-100`, `.bg-pink-500`, `.bg-red-400`, `.bg-red-500`, `.bg-sky-500`, `.border`, `.border-solid`, `.dark_cbg-zinc-800`, `.dark_ctext-yellow-400`, `.divide-_b_h010101_B > text + text`, `.divide-_b_h010101_B > text + view`, `.divide-_b_h010101_B > view + text`, `.divide-solid > text + text`, `.divide-solid > text + view`, `.divide-solid > view + text`, `.divide-solid > view + view`

### mpx-tailwindcss-v5

- CSS 文件：`app.wxss`, `styles/app.wxss`, `index.wxss`, `app252bdc3c.wxss`
- 两边共有：`.-m-_b20px_B`, `._ebg-green-500`, `._eborder-primary`, `._efont-bold`, `._etext-_b_h990000_B`, `._etext-primary`, `.active_cbg-_b_h543210_B:active`, `.active_cbg-_b_h989898_B:active`, `.bg-_b_h0000ff_B`, `.bg-_b_h010101_B`, `.bg-_b_h123456_B`, `.bg-_b_h434344_B`, `.bg-_b_he90505_B`, `.bg-blue-500_f50`, `.border-_b10px_B`, `.border-_b10rpx_B`, `.border-_b_h098765_B`, `.border-_bred_B`, `.border-b-_b4rpx_B`, `.border-t-_b4px_B`
- 仅生成模式：`.after_cborder-none::after`, `.before_ccontent-_b_aFestivus_a_B::before`
- 仅旧链路：`.-mt-2`, `._2xl_ctext-_bred_B`, `.after_cborder-none:after`, `.before_ccontent-_b_aFestivus_a_B:before`, `.bg-emerald-500`, `.bg-gradient-to-r`, `.bg-gray-100`, `.bg-pink-500`, `.bg-red-400`, `.bg-red-500`, `.bg-sky-500`, `.border`, `.border-solid`, `.dark_cbg-zinc-800`, `.dark_ctext-yellow-400`, `.divide-_b_h010101_B > text + text`, `.divide-_b_h010101_B > text + view`, `.divide-_b_h010101_B > view + text`, `.divide-solid > text + text`, `.divide-solid > text + view`
