# Apps 生成模式 CSS 对比报告

本报告由 `pnpm e2e:apps-generator` 生成，用来对比 demo app 在 `WEAPP_TW_GENERATOR_MODE=legacy` 和 `WEAPP_TW_GENERATOR_MODE=generator` 两种构建模式下的样式产物。

## 汇总

| 项目 | 来源 | 状态 | CSS 文件 | 旧链路字节数 | 生成模式字节数 | 差值 | 比例 | 旧链路独有 | @supports | :hover | Tailwind banner |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| vite-native | apps | 通过 | `vite-native/dist/app.wxss` (+2) | 5751 | 7722 | +1971 | 1.3427 | 无 | 否 | 否 | 否 |
| vite-native-ts | apps | 通过 | `vite-native-ts/dist/app.wxss` (+3) | 12443 | 24236 | +11793 | 1.9478 | 无 | 否 | 否 | 否 |
| uni-app-vue3-vite | demo | 通过 | `uni-app-vue3-vite/dist/build/mp-weixin/app.wxss` (+10) | 401919 | 502633 | +100714 | 1.2506 | 无 | 否 | 否 | 否 |
| uni-app-tailwindcss-v4 | demo | 通过 | `uni-app-tailwindcss-v4/dist/build/mp-weixin/app.wxss` (+2) | 52812 | 49689 | -3123 | 0.9409 | 无 | 否 | 否 | 否 |
| uni-app-tailwindcss-v5 | demo | 通过 | `uni-app-tailwindcss-v5/dist/build/mp-weixin/app.wxss` (+2) | 61948 | 54109 | -7839 | 0.8735 | 无 | 否 | 否 | 否 |
| taro-app | demo | 通过 | `taro-app/dist/app.wxss` (+5) | 40513 | 65762 | +25249 | 1.6232 | 无 | 否 | 否 | 否 |
| taro-webpack-tailwindcss-v4 | demo | 通过 | `taro-webpack-tailwindcss-v4/dist/app.wxss` (+1) | 382159 | 366436 | -15723 | 0.9589 | 无 | 否 | 否 | 否 |
| taro-app-vite | demo | 通过 | `taro-app-vite/dist/app.wxss` (+2) | 4530 | 4701 | +171 | 1.0377 | 无 | 否 | 否 | 否 |
| taro-vite-tailwindcss-v4 | demo | 通过 | `taro-vite-tailwindcss-v4/dist/app.wxss` (+2) | 2050 | 5534 | +3484 | 2.6995 | 无 | 否 | 否 | 否 |
| taro-vite-tailwindcss-v5 | demo | 通过 | `taro-vite-tailwindcss-v5/dist/app.wxss` (+2) | 4473 | 23764 | +19291 | 5.3128 | 无 | 否 | 否 | 否 |
| taro-vue3-app | demo | 通过 | `taro-vue3-app/dist/app.wxss` (+1) | 115828 | 123826 | +7998 | 1.0691 | 无 | 否 | 否 | 否 |
| gulp-app | demo | 通过 | `gulp-app/dist/app.wxss` (+2) | 6578 | 6496 | -82 | 0.9875 | 无 | 否 | 否 | 否 |
| mpx-app | demo | 通过 | `mpx-app/dist/wx/app.wxss` (+23) | 189931 | 199251 | +9320 | 1.0491 | 无 | 否 | 否 | 否 |
| mpx-tailwindcss-v4 | demo | 通过 | `mpx-tailwindcss-v4/dist/wx/app.wxss` (+3) | 18986 | 17332 | -1654 | 0.9129 | 无 | 否 | 否 | 否 |
| mpx-tailwindcss-v5 | demo | 通过 | `mpx-tailwindcss-v5/dist/wx/app.wxss` (+3) | 22440 | 20412 | -2028 | 0.9096 | 无 | 否 | 否 | 否 |

## 说明

- CSS 文件列展示入口样式；`(+N)` 表示报告还会聚合 `@import` 关联样式，例如 Taro 的 `app-origin.wxss` 或 Mpx 的 hash 化 `styles/app*.wxss`。
- `@supports`、`:hover` 和 Tailwind banner 三列描述的是生成模式产物。面向小程序时这些值应保持为 `否`。
- `差值` 等于 `生成模式字节数 - 旧链路字节数`。正数表示当前生成模式产物更大；下面的选择器样本可用于定位后续需要裁剪的部分。
- `旧链路独有` 必须保持为 `无`。非零值表示旧链路选择器仍需要生成模式产出或兼容 CSS 覆盖。
- 选择器列表会展示前 20 项；`仅旧链路` 的完整数量会在汇总表标出，便于持续清零。
- 失败行会在失败详情中保留首个失败模式和错误信息，便于持续消除迁移阻塞。

## 失败详情

- 无

## 选择器样本

### vite-native

- CSS 文件：`app.wxss`, `apple.wxss`, `index.wxss`
- 两边共有：`.bg-_b_h3a32d1_B`, `.bg-_b_h68c828_B`, `.bg-amber-300`, `.bg-blue-500_f30`, `.bg-gradient-to-b`, `.bg-gradient-to-t`, `.bg-gradient-to-tr`, `.bg-zinc-50`, `.border-4`, `.container`, `.dark_cbg-zinc-900`, `.flex`, `.flex-col`, `.from-_b_h2f73f1_B`, `.h-10`, `.h-_b29_d292px_B`, `.h-_b30px_B`, `.h-_b45px_B`, `.i-mdi-home`, `.inline-block`
- 仅生成模式：`.-start`, `._estart`, `.capitalize`, `.end`, `.filter`, `.inline`, `.invert`, `.resize`, `.rounded`, `.start`, `.transform`, `.transition`, `.truncate`
- 仅旧链路：-

### vite-native-ts

- CSS 文件：`app.wxss`, `index.wxss`, `index.wxss`, `index.wxss`
- 两边共有：`.-inset-1`, `.-inset-_b1rpx_B`, `._b--scroll-offset_c56px_B`, `._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3)`, `._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3)`, `._b_n_view_B_cp-_b12rpx_B view`, `._bmask-type_calpha_B`, `._bmask-type_cluminance_B`, `._bpadding_c20rpx_B`, `.bg-_b_h123456_B`, `.bg-_b_h16a34a_B`, `.bg-_b_h2563eb_B`, `.bg-_b_hB91C1C_B`, `.bg-_b_hd72929_B`, `.bg-_b_hdc2626_B`, `.bg-_bcolor_cvar_p--mystery-var_P_B`, `.bg-_bgreen_B`, `.bg-_borange_B`, `.bg-_bpink_B`, `.bg-black`
- 仅生成模式：`.absolute`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-repeat`, `.blur`, `.border-b`, `.border-collapse`, `.border-e`, `.border-l`, `.border-r`, `.border-s`, `.border-t`, `.border-x`, `.border-y`, `.collapse`, `.container`
- 仅旧链路：-

### uni-app-vue3-vite

- CSS 文件：`app.wxss`, `index.wxss`, `a.wxss`, `b.wxss`, `index.wxss`, `u-button.wxss`, `u-loading-icon.wxss`, `index.wxss`, `peer.wxss`, `tailwind-children.wxss`, `typography.wxss`
- 两边共有：`.-m-_b20px_B`, `.-mt-2`, `._2xl_ctext-_bred_B`, `._2xl_ctext-base`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._ebg-green-500`, `._eborder-primary`, `._efont-bold`, `._ehidden`, `._etext-_b_h990000_B`, `._etext-primary`, `.after_cborder-none:after`, `.after_ccontent-_b_au_x6211_u_x662f_className_a_B:after`, `.after_ccontent-_b_au_x6211_u_x6765_u_x81ea_utils_dfilter_djs_a_B:after`, `.after_ccontent-_b_r_au_x6211_u_x6765_u_x81ea_inline-wxs_r_a_B:after`, `.backdrop-blur-_b2rpx_B`, `.before_ccontent-_b_aFestivus_a_B:before`, `.before_ccontent-_b_a_x_a_B:before`, `.before_ccontent-_b_amoduleA_u_x72ec_u_x7acb_u_x5206_u_x5305__a_B:before`, `.bg-_b_h123324_B`
- 仅生成模式：`.-mv_cbg-red-400`, `.-wx_cbg-red-400`, `.absolute`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.before_ccontent-_b_r_amoduleA__ru72EC_ru7ACB_ru5206_ru5305_r_a_B:before`, `.bg-repeat`, `.border-b`, `.border-collapse`, `.border-e`, `.border-l`, `.border-r`, `.border-s`, `.border-t`, `.border-x`, `.border-y`
- 仅旧链路：-

### uni-app-tailwindcss-v4

- CSS 文件：`app.wxss`, `home.wxss`, `user.wxss`
- 两边共有：`.active_cbg-emerald-50:active`, `.active_cbg-emerald-600:active`, `.aspect-_bcalc_p4_x3_u1_P_f3_B`, `.aspect-_p--my-aspect-ratio_P`, `.bg-_b_h0000ff_B`, `.bg-_b_h123498_B`, `.bg-emerald-100`, `.bg-emerald-500`, `.bg-midnight`, `.bg-neutral-1B`, `.bg-slate-50`, `.bg-white`, `.block`, `.border`, `.border-emerald-500`, `.border-slate-200`, `.container`, `.divide-_b_h41eb04_B > text + text`, `.divide-_b_h41eb04_B > text + view`, `.divide-_b_h41eb04_B > view + text`
- 仅生成模式：`.absolute`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-repeat`, `.blur`, `.border-b`, `.border-collapse`, `.border-e`, `.border-l`, `.border-r`, `.border-s`, `.border-t`, `.border-x`, `.border-y`, `.capitalize`, `.collapse`
- 仅旧链路：-

### uni-app-tailwindcss-v5

- CSS 文件：`app.wxss`, `home.wxss`, `user.wxss`
- 两边共有：`.active_cbg-emerald-50:active`, `.active_cbg-emerald-600:active`, `.aspect-_bcalc_p4_x3_u1_P_f3_B`, `.aspect-_p--my-aspect-ratio_P`, `.bg-_b_h0000ff_B`, `.bg-_b_h123498_B`, `.bg-emerald-100`, `.bg-emerald-500`, `.bg-gradient-to-r`, `.bg-midnight`, `.bg-neutral-1B`, `.bg-slate-50`, `.bg-white`, `.block`, `.border`, `.border-emerald-500`, `.border-slate-200`, `.container`, `.divide-_b_h41eb04_B > text + text`, `.divide-_b_h41eb04_B > text + view`
- 仅生成模式：`.absolute`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-repeat`, `.blur`, `.border-b`, `.border-collapse`, `.border-e`, `.border-l`, `.border-r`, `.border-s`, `.border-t`, `.border-x`, `.border-y`, `.capitalize`, `.collapse`
- 仅旧链路：-

### taro-app

- CSS 文件：`app.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`
- 两边共有：`.-m-_b20px_B`, `.-mt-2`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._etext-_b_h555_B`, `.a`, `.aaaaaaa`, `.after_cborder-none:after`, `.after_ccontent-_b_aHello_World_a_B:after`, `.after_ccontent-_b_a_x_a_B:after`, `.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B:after`, `.after_ccontent-_b_q_x_q_B:after`, `.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B:after`, `.after_ccontent-_b_x_B:after`, `.after_cml-0_d5:after`, `.after_ctext-red-500:after`, `.aspect-w-16 > text`, `.aspect-w-16 > view`, `.b`, `.before_cabsolute:before`, `.before_cborder-2:before`
- 仅生成模式：`.tw-root`, `:host`, `page`, `wx-root-portal-content`
- 仅旧链路：-

### taro-webpack-tailwindcss-v4

- CSS 文件：`app.wxss`, `index.wxss`
- 两边共有：`._bchunkhash_c8_B`, `._bhash_c8_B`, `.bg-_b_h534312_B`, `.bg-gradient-to-r`, `.bg-purple-800`, `.fade-appear`, `.fade-appear-active`, `.fade-enter`, `.fade-enter-active`, `.fade-enter-done`, `.fade-exit`, `.fade-exit-active`, `.fade-exit-done`, `.from-cyan-500`, `.h-14`, `.nut-actionsheet`, `.nut-actionsheet .nut-popup-title`, `.nut-actionsheet-cancel`, `.nut-actionsheet-cancel-danger`, `.nut-actionsheet-cancel-description`
- 仅生成模式：`.nut-input .nut-input-native .weui-input::-moz-placeholder`, `.nut-textarea-textarea-disabled .taro-textarea::-moz-placeholder`, `.nut-textarea-textarea-disabled::-moz-placeholder`, `.nut-textarea-textarea::-moz-placeholder`
- 仅旧链路：-

### taro-app-vite

- CSS 文件：`app.wxss`, `app-origin.wxss`, `index.wxss`
- 两边共有：`.before_ccontent-_b_q11111_q_B:before`, `.before_ccontent-_b_q222_q_B:before`, `.bg-_b_h89ab8d_B`, `.bg-_b_he24826_B`, `.dark_ctext-_b_hec4f4f_B`, `.divide-_b_h60d256_B > text + text`, `.divide-_b_h60d256_B > text + view`, `.divide-_b_h60d256_B > view + text`, `.divide-_b_h60d256_B > view + view`, `.divide-solid > text + text`, `.divide-solid > text + view`, `.divide-solid > view + text`, `.divide-solid > view + view`, `.divide-x-8 > text + text`, `.divide-x-8 > text + view`, `.divide-x-8 > view + text`, `.divide-x-8 > view + view`, `.flex`, `.flex-col`, `.text-_b66rpx_B`
- 仅生成模式：`.block`, `.blur`, `.border`, `.container`, `.ease-out`, `.filter`, `.fixed`, `.grid`, `.hidden`, `.inline`, `.outline`, `.resize`, `.static`, `.table`, `.transform`, `.transition`, `.tw-root`, `.visible`, `:host`, `page`
- 仅旧链路：-

### taro-vite-tailwindcss-v4

- CSS 文件：`app.wxss`, `app-origin.wxss`, `index.wxss`
- 两边共有：`.bg-_b_h123456_B`, `.bg-gradient-to-r`, `.bg-linear-to-r`, `.bg-purple-300`, `.from-cyan-500`, `.h-14`, `.h-_b300px_B`, `.text-_b55rpx_B`, `.text-_b_hc31d6b_B`, `.text-_b_hfff_B`, `.to-blue-500`, `.tw-page-style-watch-anchor`, `.tw-root`, `:host`, `page`, `wx-root-portal-content`
- 仅生成模式：`.block`, `.blur`, `.border`, `.container`, `.ease-out`, `.filter`, `.fixed`, `.flex`, `.grid`, `.hidden`, `.inline`, `.outline`, `.resize`, `.static`, `.table`, `.transform`, `.transition`, `.visible`
- 仅旧链路：-

### taro-vite-tailwindcss-v5

- CSS 文件：`app.wxss`, `app-origin.wxss`, `index.wxss`
- 两边共有：`._eborder-brand`, `.active_cbg-emerald-600:active`, `.bg-_b_h123456_B`, `.bg-brand`, `.bg-gradient-to-b`, `.bg-gradient-to-r`, `.bg-gray-100`, `.bg-linear-to-r`, `.bg-red-500`, `.border-_b10rpx_B`, `.dark_cbg-green-500`, `.dark_cbg-zinc-800`, `.from-cyan-500`, `.from-fuchsia-500`, `.h-14`, `.h-_b300px_B`, `.p-4`, `.p-_b32rpx_B`, `.rotate-_b10deg_B`, `.rounded-xl`
- 仅生成模式：`.absolute`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-repeat`, `.block`, `.blur`, `.border`, `.border-b`, `.border-collapse`, `.border-e`, `.border-l`, `.border-r`, `.border-s`, `.border-t`, `.border-x`, `.border-y`
- 仅旧链路：-

### taro-vue3-app

- CSS 文件：`app.wxss`, `index.wxss`
- 两边共有：`.-m-_b20px_B`, `.-mt-2`, `.after_ccontent-_b_au_x6211_u_x77e5_u_x9053_u_x6211_u_x5fc3__mu_x6c38_u_x6052_12we_ds_a_B:after`, `.bg-_b_h098765_B`, `.bg-_b_h123456_B`, `.bg-_b_h543254_B`, `.bg-_b_h654123_B`, `.bg-_b_h654321_B`, `.bg-_b_hdbdada_B`, `.bg-_b_hfafa00_B`, `.bg-_b_hfafafa_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-gradient-to-r`, `.bg-gray-100`, `.bg-opacity-_b0_d54_B`, `.bg-pink-500`, `.bg-red-500`, `.bg-red-900`, `.block`, `.border-_b10px_B`
- 仅生成模式：`:host`
- 仅旧链路：-

### gulp-app

- CSS 文件：`app.wxss`, `index.wxss`, `more.wxss`
- 两边共有：`.bg-_b_hfff_B`, `.bg-_blength_c100_v_100_v_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-_burl_phttps_c_f_fpic1_dzhimg_dcom_fv2-3ee20468f54bbfefcd0027283b21aaa8_720w_djpg_P_B`, `.bg-no-repeat`, `.block`, `.border-_b_hEEEEEE_B`, `.border-b`, `.font-bold`, `.font-medium`, `.h-_b41_d54vw_B`, `.h-full`, `.i-mdi-123`, `.i-mdi-ab-testing`, `.i-mdi-abacus`, `.i-mdi-typewriter`, `.m-_b20px_B`, `.mb-_b20px_B`, `.more__pre`, `.more__pre text`
- 仅生成模式：`.tw-root`, `:host`, `page`, `wx-root-portal-content`
- 仅旧链路：-

### mpx-app

- CSS 文件：`app.wxss`, `styles/base.wxss`, `styles/components.wxss`, `styles/utilities.wxss`, `index.wxss`, `button.wxss`, `styles/index.wxss`, `icon.wxss`, `styles/index.wxss`, `loading.wxss`, `styles/index.wxss`, `index.wxss`, `styles/index.wxss`, `index.wxss`, `styles/index.wxss`, `index.wxss`, `styles/index.wxss`, `index.wxss`, `styles/index.wxss`, `base5c682eff.wxss`, `components1e38aa04.wxss`, `indexd323f158.wxss`, `indexfcda771e.wxss`, `utilities68e69726.wxss`
- 两边共有：`.after_ccontent-_b_au_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x8fd9_u_x662f_u_x4e2d_u_x6587_u_x5b57_u_x7b26_u_x4e32__a_B:after`, `.after_ccontent-_b_qu_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x5f88_u_x65e0_u_x804a__q_B:after`, `.after_cml-0_d5:after`, `.after_ctext-red-500:after`, `.bg-_b_h123456_B`, `.bg-_b_h929292_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.flex`, `.flex-col`, `.hotspot-expanded.relative`, `.hotspot-expanded:after`, `.t-button`, `.t-button--block`, `.t-button--circle`, `.t-button--circle.t-button--size-extra-small`, `.t-button--circle.t-button--size-extra-small:after`, `.t-button--circle.t-button--size-large`, `.t-button--circle.t-button--size-large:after`, `.t-button--circle.t-button--size-medium`, `.t-button--circle.t-button--size-medium:after`
- 仅生成模式：`.tw-root`, `page`, `wx-root-portal-content`
- 仅旧链路：-

### mpx-tailwindcss-v4

- CSS 文件：`app.wxss`, `styles/app.wxss`, `index.wxss`, `app36a8d5bb.wxss`
- 两边共有：`.-m-_b20px_B`, `.-mt-2`, `._2xl_ctext-_bred_B`, `._2xl_ctext-base`, `._ebg-green-500`, `._efont-bold`, `._etext-_b_h990000_B`, `.active_cbg-_b_h543210_B:active`, `.active_cbg-_b_h989898_B:active`, `.after_cborder-none:after`, `.before_ccontent-_b_aFestivus_a_B:before`, `.bg-_b_h010101_B`, `.bg-_b_h123456_B`, `.bg-_b_h434344_B`, `.bg-_b_he90505_B`, `.bg-blue-500_f50`, `.bg-gray-100`, `.bg-pink-500`, `.bg-red-400`, `.bg-red-500`
- 仅生成模式：-
- 仅旧链路：-

### mpx-tailwindcss-v5

- CSS 文件：`app.wxss`, `styles/app.wxss`, `index.wxss`, `app252bdc3c.wxss`
- 两边共有：`.-m-_b20px_B`, `.-mt-2`, `._2xl_ctext-_bred_B`, `._2xl_ctext-base`, `._ebg-green-500`, `._eborder-primary`, `._efont-bold`, `._etext-_b_h990000_B`, `._etext-primary`, `.active_cbg-_b_h543210_B:active`, `.active_cbg-_b_h989898_B:active`, `.after_cborder-none:after`, `.before_ccontent-_b_aFestivus_a_B:before`, `.bg-_b_h0000ff_B`, `.bg-_b_h010101_B`, `.bg-_b_h123456_B`, `.bg-_b_h434344_B`, `.bg-_b_he90505_B`, `.bg-blue-500_f50`, `.bg-emerald-500`
- 仅生成模式：-
- 仅旧链路：-
