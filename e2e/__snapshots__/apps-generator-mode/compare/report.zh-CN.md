# Demo 生成模式 CSS 产物报告

本报告由 `pnpm e2e:apps-generator` 生成，用来验证保留的 demo 在默认生成模式下的小程序样式产物。

## 汇总

| 项目 | 来源 | 状态 | CSS 文件 | 字节数 | 选择器数 | @supports | :hover | Tailwind banner | 原始任意值选择器 | 小程序转义任意值选择器 |
| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| gulp-tailwindcss-v3 | demo | 通过 | `gulp-tailwindcss-v3/dist/app.wxss` (+2) | 6675 | 44 | 否 | 否 | 否 | 否 | 是 |
| gulp-tailwindcss-v4 | demo | 通过 | `gulp-tailwindcss-v4/dist/app.wxss` (+2) | 6355 | 52 | 否 | 否 | 否 | 否 | 是 |
| mpx-tailwindcss-v3 | demo | 通过 | `mpx-tailwindcss-v3/dist/wx/app.wxss` (+23) | 190234 | 2879 | 否 | 否 | 否 | 否 | 是 |
| mpx-tailwindcss-v4 | demo | 通过 | `mpx-tailwindcss-v4/dist/wx/app.wxss` (+6) | 16002 | 66 | 否 | 否 | 否 | 否 | 是 |
| taro-webpack-tailwindcss-v3 | demo | 通过 | `taro-webpack-tailwindcss-v3/dist/app.wxss` (+5) | 49085 | 139 | 否 | 否 | 否 | 否 | 是 |
| taro-webpack-tailwindcss-v4 | demo | 通过 | `taro-webpack-tailwindcss-v4/dist/app.wxss` (+1) | 365139 | 2154 | 否 | 否 | 否 | 否 | 是 |
| taro-vite-tailwindcss-v3 | demo | 通过 | `taro-vite-tailwindcss-v3/dist/app.wxss` (+2) | 5231 | 45 | 否 | 否 | 否 | 否 | 是 |
| taro-vite-tailwindcss-v4 | demo | 通过 | `taro-vite-tailwindcss-v4/dist/app.wxss` (+2) | 5001 | 39 | 否 | 否 | 否 | 否 | 是 |
| uni-app-vite-tailwindcss-v3 | demo | 通过 | `uni-app-vite-tailwindcss-v3/dist/build/mp-weixin/app.wxss` (+10) | 503295 | 3122 | 否 | 否 | 否 | 否 | 是 |
| uni-app-vite-tailwindcss-v4 | demo | 通过 | `uni-app-vite-tailwindcss-v4/dist/build/mp-weixin/app.wxss` (+2) | 84226 | 236 | 否 | 否 | 否 | 否 | 是 |
| weapp-vite-tailwindcss-v3 | demo | 通过 | `weapp-vite-tailwindcss-v3/dist/app.wxss` (+3) | 24266 | 258 | 否 | 否 | 否 | 否 | 是 |
| weapp-vite-tailwindcss-v4 | demo | 通过 | `weapp-vite-tailwindcss-v4/dist/app.wxss` (+2) | 7456 | 58 | 否 | 否 | 否 | 否 | 是 |

## 说明

- CSS 文件列展示入口样式；`(+N)` 表示报告还会聚合 `@import` 关联样式，例如 Taro 的 `app-origin.wxss` 或 Mpx 的 hash 化 `styles/app*.wxss`。
- `@supports`、`:hover` 和 Tailwind banner 三列描述的是生成模式产物。面向小程序时这些值应保持为 `否`。
- 选择器列表会展示前 20 项，便于观察生成模式是否覆盖当前 demo 的有效类名。
- 失败行会在失败详情中保留首个错误信息，便于持续消除迁移阻塞。

## 失败详情

- 无

## 选择器样本

### gulp-tailwindcss-v3

- CSS 文件：`app.wxss`, `index.wxss`, `more.wxss`
- 选择器：`.bg-_b_hfff_B`, `.bg-_blength_c100_v_100_v_B`, `.bg-_bred_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-_burl_phttps_c_f_fpic1_dzhimg_dcom_fv2-3ee20468f54bbfefcd0027283b21aaa8_720w_djpg_P_B`, `.bg-no-repeat`, `.block`, `.border-_b_hEEEEEE_B`, `.border-b`, `.font-bold`, `.font-medium`, `.h-_b41_d54vw_B`, `.h-full`, `.i-mdi-123`, `.i-mdi-ab-testing`, `.i-mdi-abacus`, `.i-mdi-typewriter`, `.m-_b20px_B`, `.mb-_b20px_B`, `.more__pre`

### gulp-tailwindcss-v4

- CSS 文件：`app.wxss`, `index.wxss`, `more.wxss`
- 选择器：`.bg-_b_hfff_B`, `.bg-_blength_c100_v_100_v_B`, `.bg-_bred_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-_burl_phttps_c_f_fpic1_dzhimg_dcom_fv2-3ee20468f54bbfefcd0027283b21aaa8_720w_djpg_P_B`, `.bg-no-repeat`, `.block`, `.border-_b_hEEEEEE_B`, `.border-b`, `.font-bold`, `.font-medium`, `.h-_b41_d54vw_B`, `.h-full`, `.i-mdi-123`, `.i-mdi-ab-testing`, `.i-mdi-abacus`, `.i-mdi-typewriter`, `.m-_b20px_B`, `.mb-_b20px_B`, `.more__pre`

### mpx-tailwindcss-v3

- CSS 文件：`app.wxss`, `styles/base.wxss`, `styles/components.wxss`, `styles/utilities.wxss`, `base.wxss`, `button.wxss`, `components.wxss`, `icon.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `loading.wxss`, `styles/index.wxss`, `styles/index.wxss`, `styles/index.wxss`, `styles/index.wxss`, `styles/index.wxss`, `styles/index.wxss`, `styles/index.wxss`, `utilities.wxss`
- 选择器：`.after_ccontent-_b_au_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x8fd9_u_x662f_u_x4e2d_u_x6587_u_x5b57_u_x7b26_u_x4e32__a_B:after`, `.after_ccontent-_b_qu_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x5f88_u_x65e0_u_x804a__q_B:after`, `.after_cml-0_d5:after`, `.after_ctext-red-500:after`, `.bg-_b_h123456_B`, `.bg-_b_h929292_B`, `.bg-_bred_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.flex`, `.flex-col`, `.h-_b43rpx_B`, `.hotspot-expanded.relative`, `.hotspot-expanded:after`, `.t-button`, `.t-button--block`, `.t-button--circle`, `.t-button--circle.t-button--size-extra-small`, `.t-button--circle.t-button--size-extra-small:after`, `.t-button--circle.t-button--size-large`, `.t-button--circle.t-button--size-large:after`

### mpx-tailwindcss-v4

- CSS 文件：`app.wxss`, `styles/app.wxss`, `index.wxss`, `app.wxss`, `index.wxss`, `index.wxss`, `index.wxss`
- 选择器：`.-m-_b20px_B`, `._2xl_ctext-_bred_B`, `._2xl_ctext-base`, `._ebg-green-500`, `._efont-bold`, `._etext-_b_h990000_B`, `.active_cbg-_b_h543210_B:active`, `.active_cbg-_b_h989898_B:active`, `.after_cborder-none:after`, `.before_ccontent-_b_aFestivus_a_B:before`, `.bg-_b_h010101_B`, `.bg-_b_h123456_B`, `.bg-_b_h434344_B`, `.bg-_b_he90505_B`, `.bg-blue-500_f50`, `.border-_b10px_B`, `.border-_b10rpx_B`, `.border-_b_h098765_B`, `.border-_bred_B`, `.border-b-_b4rpx_B`

### taro-webpack-tailwindcss-v3

- CSS 文件：`app.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`
- 选择器：`.-m-_b20px_B`, `.-mt-2`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._etext-_b_h555_B`, `.a`, `.aaaaaaa`, `.after_cborder-none:after`, `.after_ccontent-_b_aHello_World_a_B:after`, `.after_ccontent-_b_a_x_a_B:after`, `.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B:after`, `.after_ccontent-_b_q_x_q_B:after`, `.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B:after`, `.after_ccontent-_b_x_B:after`, `.after_cml-0_d5:after`, `.after_ctext-red-500:after`, `.aspect-w-16 > text`, `.aspect-w-16 > view`, `.b`, `.before_cabsolute:before`, `.before_cborder-2:before`

### taro-webpack-tailwindcss-v4

- CSS 文件：`app.wxss`, `index.wxss`
- 选择器：`.bg-_b_h534312_B`, `.bg-gradient-to-r`, `.bg-purple-800`, `.fade-appear`, `.fade-appear-active`, `.fade-enter`, `.fade-enter-active`, `.fade-enter-done`, `.fade-exit`, `.fade-exit-active`, `.fade-exit-done`, `.from-cyan-500`, `.h-14`, `.nut-actionsheet`, `.nut-actionsheet .nut-popup-title`, `.nut-actionsheet-cancel`, `.nut-actionsheet-cancel-danger`, `.nut-actionsheet-cancel-description`, `.nut-actionsheet-cancel-disabled`, `.nut-actionsheet-cancel-name`

### taro-vite-tailwindcss-v3

- CSS 文件：`app.wxss`, `app-origin.wxss`, `index.wxss`
- 选择器：`.absolute`, `.before_ccontent-_b_q11111_q_B:before`, `.before_ccontent-_b_q222_q_B:before`, `.bg-_b_h89ab8d_B`, `.bg-_b_he24826_B`, `.block`, `.blur`, `.border`, `.container`, `.dark_ctext-_b_hec4f4f_B`, `.divide-_b_h60d256_B > text + text`, `.divide-_b_h60d256_B > text + view`, `.divide-_b_h60d256_B > view + text`, `.divide-_b_h60d256_B > view + view`, `.divide-solid > text + text`, `.divide-solid > text + view`, `.divide-solid > view + text`, `.divide-solid > view + view`, `.divide-x-8 > text + text`, `.divide-x-8 > text + view`

### taro-vite-tailwindcss-v4

- CSS 文件：`app.wxss`, `app-origin.wxss`, `index.wxss`
- 选择器：`.absolute`, `.bg-_b_h123456_B`, `.bg-gradient-to-r`, `.bg-linear-to-r`, `.bg-purple-300`, `.block`, `.blur`, `.border`, `.container`, `.ease-out`, `.filter`, `.fixed`, `.flex`, `.flex-grow`, `.flex-shrink`, `.from-cyan-500`, `.grid`, `.h-14`, `.h-_b300px_B`, `.hidden`

### uni-app-vite-tailwindcss-v3

- CSS 文件：`app.wxss`, `a.wxss`, `b.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `peer.wxss`, `tailwind-children.wxss`, `typography.wxss`, `u-button.wxss`, `u-loading-icon.wxss`
- 选择器：`.-inset-1`, `.-m-_b20px_B`, `.-mt-2`, `.-mv_cbg-red-400`, `.-wx_cbg-red-400`, `._2xl_ctext-_bred_B`, `._2xl_ctext-base`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._ebg-green-500`, `._eborder-primary`, `._efont-bold`, `._ehidden`, `._etext-_b_h990000_B`, `._etext-primary`, `.absolute`, `.after_cborder-none:after`, `.after_ccontent-_b_au_x6211_u_x662f_className_a_B:after`, `.after_ccontent-_b_au_x6211_u_x6765_u_x81ea_utils_dfilter_djs_a_B:after`, `.after_ccontent-_b_av3_apply_a_B:after`, `.after_ccontent-_b_r_au_x6211_u_x6765_u_x81ea_inline-wxs_r_a_B:after`

### uni-app-vite-tailwindcss-v4

- CSS 文件：`app.wxss`, `home.wxss`, `user.wxss`
- 选择器：`.-inset-1`, `._tcontainer`, `.absolute`, `.active_cbg-emerald-50:active`, `.active_cbg-emerald-600:active`, `.antialiased`, `.aspect-_bcalc_p4_x3_u1_P_f3_B`, `.aspect-_p--my-aspect-ratio_P`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-_b_h0000ff_B`, `.bg-_b_h123498_B`, `.bg-emerald-100`, `.bg-emerald-500`, `.bg-midnight`, `.bg-neutral-1B`, `.bg-repeat`

### weapp-vite-tailwindcss-v3

- CSS 文件：`app.wxss`, `index.wxss`, `index.wxss`, `index.wxss`
- 选择器：`.-inset-1`, `.-inset-_b1rpx_B`, `._b--scroll-offset_c56px_B`, `._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3)`, `._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3)`, `._b_n_view_B_cp-_b12rpx_B view`, `._bmask-type_calpha_B`, `._bmask-type_cluminance_B`, `._bpadding_c20rpx_B`, `.absolute`, `.antialiased`, `.backdrop-blur`, `.backdrop-filter`, `.backdrop-grayscale`, `.backdrop-invert`, `.backdrop-sepia`, `.bg-_b_h123456_B`, `.bg-_b_h16a34a_B`, `.bg-_b_h2563eb_B`, `.bg-_b_hB91C1C_B`

### weapp-vite-tailwindcss-v4

- CSS 文件：`app.wxss`, `apple.wxss`, `index.wxss`
- 选择器：`.bg-_b_h3a32d1_B`, `.bg-_b_h68c828_B`, `.bg-amber-300`, `.bg-blue-500_f30`, `.bg-gradient-to-b`, `.bg-gradient-to-t`, `.bg-gradient-to-tr`, `.bg-zinc-50`, `.block`, `.border-4`, `.capitalize`, `.container`, `.dark_cbg-zinc-900`, `.filter`, `.flex`, `.flex-col`, `.from-_b_h2f73f1_B`, `.h-10`, `.h-_b29_d292px_B`, `.h-_b30px_B`
