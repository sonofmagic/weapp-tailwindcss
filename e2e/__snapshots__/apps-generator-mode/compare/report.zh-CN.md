# Demo 生成模式 CSS 产物报告

本报告由 `pnpm e2e:apps-generator` 生成，用来验证保留的 demo 在默认生成模式下的小程序样式产物。

## 汇总

| 项目 | 来源 | 状态 | CSS 文件 | 字节数 | 选择器数 | @supports | :hover | Tailwind banner | 系统暗色媒体查询 | 手动暗色选择器 | 不兼容主题属性选择器 | 不兼容主题复杂选择器 | 原始任意值选择器 | 小程序转义任意值选择器 |
| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gulp-tailwindcss-v3 | demo | 通过 | `gulp-tailwindcss-v3/dist/app.wxss` (+4) | 27962 | 67 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| gulp-tailwindcss-v4 | demo | 通过 | `gulp-tailwindcss-v4/dist/app.wxss` (+4) | 14242 | 73 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| mpx-tailwindcss-v3 | demo | 通过 | `mpx-tailwindcss-v3/dist/wx/app.wxss` (+13) | 186787 | 2889 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| mpx-tailwindcss-v4 | demo | 通过 | `mpx-tailwindcss-v4/dist/wx/app.wxss` (+2) | 9726 | 79 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-webpack-react-tailwindcss-v3 | demo | 通过 | `taro-webpack-react-tailwindcss-v3/dist/app.wxss` (+7) | 97192 | 108 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-webpack-react-tailwindcss-v4 | demo | 通过 | `taro-webpack-react-tailwindcss-v4/dist/app.wxss` (+3) | 389625 | 2494 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-vite-react-tailwindcss-v3 | demo | 通过 | `taro-vite-react-tailwindcss-v3/dist/app.wxss` (+2) | 10340 | 46 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-vite-react-tailwindcss-v4 | demo | 通过 | `taro-vite-react-tailwindcss-v4/dist/app.wxss` (+2) | 7917 | 38 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-webpack-vue3-tailwindcss-v3 | demo | 通过 | `taro-webpack-vue3-tailwindcss-v3/dist/app.wxss` (+3) | 26365 | 57 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-webpack-vue3-tailwindcss-v4 | demo | 通过 | `taro-webpack-vue3-tailwindcss-v4/dist/app.wxss` (+3) | 134455 | 554 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-vite-vue3-tailwindcss-v3 | demo | 通过 | `taro-vite-vue3-tailwindcss-v3/dist/app.wxss` (+3) | 13391 | 45 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-vite-vue3-tailwindcss-v4 | demo | 通过 | `taro-vite-vue3-tailwindcss-v4/dist/app.wxss` (+3) | 9457 | 36 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| uni-app-vite-tailwindcss-v3 | demo | 通过 | `uni-app-vite-tailwindcss-v3/dist/build/mp-weixin/app.wxss` (+11) | 256258 | 2838 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| uni-app-vite-tailwindcss-v4 | demo | 通过 | `uni-app-vite-tailwindcss-v4/dist/build/mp-weixin/app.wxss` (+4) | 32703 | 135 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| weapp-vite-tailwindcss-v3 | demo | 通过 | `weapp-vite-tailwindcss-v3/dist/app.wxss` (+7) | 119403 | 181 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| weapp-vite-tailwindcss-v4 | demo | 通过 | `weapp-vite-tailwindcss-v4/dist/app.wxss` (+4) | 20428 | 83 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |

## 说明

- CSS 文件列展示入口样式；`(+N)` 表示报告还会聚合 `@import` 关联样式，例如 Taro 的 `app-origin.wxss` 或 Mpx 的 hash 化 `styles/app*.wxss`。
- `@supports`、`:hover` 和 Tailwind banner 三列描述的是生成模式产物。面向小程序时这些值应保持为 `否`。
- 系统暗色媒体查询和手动暗色选择器两列用于确认 `prefers-color-scheme` 与 `.theme-dark` class 示例都进入生成模式产物。
- 选择器列表会展示前 20 项，便于观察生成模式是否覆盖当前 demo 的有效类名。
- 失败行会在失败详情中保留首个错误信息，便于持续消除迁移阻塞。

## 失败详情

- 无

## 选择器样本

### gulp-tailwindcss-v3

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `pages/more/more.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_gulp-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_gulp-tailwindcss-v3_a_B:before`, `.bg-_b_hfff_B`, `.bg-_blength_c100_v_100_v_B`, `.bg-_bred_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-_burl_phttps_c_f_fpic1_dzhimg_dcom_fv2-3ee20468f54bbfefcd0027283b21aaa8_720w_djpg_P_B`, `.bg-independent-subpackage-marker`, `.bg-no-repeat`, `.bg-normal-subpackage-marker`, `.bg-white`, `.block`, `.border-_b_hEEEEEE_B`, `.border-b`, `.dark_cbg-zinc-900`, `.dark_ctext-zinc-50`, `.font-bold`, `.font-medium`, `.h-_b41_d54vw_B`, `.h-full`

### gulp-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `pages/more/more.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_gulp-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_gulp-tailwindcss-v4_a_B:before`, `.bg-_b_hfff_B`, `.bg-_blength_c100_v_100_v_B`, `.bg-_bred_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-_burl_phttps_c_f_fpic1_dzhimg_dcom_fv2-3ee20468f54bbfefcd0027283b21aaa8_720w_djpg_P_B`, `.bg-independent-subpackage-marker`, `.bg-no-repeat`, `.bg-normal-subpackage-marker`, `.bg-white`, `.block`, `.border-_b_hEEEEEE_B`, `.border-b`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.font-bold`, `.font-medium`, `.h-_b41_d54vw_B`

### mpx-tailwindcss-v3

- CSS 文件：`app.wxss`, `components/listb90661b8/index.wxss`, `components/tdesign-miniprogram029196fc/miniprogram_dist/button/button.wxss`, `components/tdesign-miniprogram029196fc/miniprogram_dist/icon/icon.wxss`, `components/tdesign-miniprogram029196fc/miniprogram_dist/loading/loading.wxss`, `components/vant/weappda3e1e6c/lib/button/index.wxss`, `components/vant/weappda3e1e6c/lib/icon/index.wxss`, `components/vant/weappda3e1e6c/lib/info/index.wxss`, `components/vant/weappda3e1e6c/lib/loading/index.wxss`, `styles/base3f288b8e.wxss`, `styles/components525161be.wxss`, `styles/index3f743595.wxss`, `styles/index9a27da9c.wxss`, `styles/utilitiesf949ffa8.wxss`
- 选择器：`.after_ccontent-_b_au_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x8fd9_u_x662f_u_x4e2d_u_x6587_u_x5b57_u_x7b26_u_x4e32__a_B:after`, `.after_ccontent-_b_qu_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x5f88_u_x65e0_u_x804a__q_B:after`, `.after_cml-0_d5:after`, `.after_ctext-red-500:after`, `.before_ccontent-_b_aindependent_subpackage_mpx-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_mpx-tailwindcss-v3_a_B:before`, `.bg-_b_h123456_B`, `.bg-_b_h929292_B`, `.bg-_bred_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.dark_cbg-zinc-900`, `.dark_ctext-zinc-50`, `.h-_b43rpx_B`, `.hotspot-expanded.relative`, `.hotspot-expanded:after`, `.system-dark_cbg-slate-900`, `.system-dark_ctext-slate-100`, `.t-button`, `.t-button--block`, `.t-button--circle`

### mpx-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/component/index.wxss`, `styles/app3b4a1ac6.wxss`
- 选择器：`.-m-_b20px_B`, `._2xl_ctext-_bred_B`, `._2xl_ctext-base`, `._ebg-green-500`, `._efont-bold`, `._etext-_b_h990000_B`, `.active_cbg-_b_h543210_B:active`, `.active_cbg-_b_h989898_B:active`, `.after_cborder-none:after`, `.before_ccontent-_b_aFestivus_a_B:before`, `.before_ccontent-_b_aindependent_subpackage_mpx-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_mpx-tailwindcss-v4_a_B:before`, `.bg-_b_h010101_B`, `.bg-_b_h123456_B`, `.bg-_b_h434344_B`, `.bg-_b_he90505_B`, `.bg-blue-500_f50`, `.border-_b10px_B`, `.border-_b10rpx_B`, `.border-_b_h098765_B`

### taro-webpack-react-tailwindcss-v3

- CSS 文件：`app.wxss`, `moduleA/pages/index.wxss`, `moduleB/pages/index.wxss`, `moduleC/pages/index.wxss`, `pages/debug/index.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-m-_b20px_B`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._etext-_b_h555_B`, `.a`, `.aaaaaaa`, `.after_cborder-none:after`, `.after_ccontent-_b_aHello_World_a_B:after`, `.after_ccontent-_b_a_x_a_B:after`, `.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B:after`, `.after_ccontent-_b_q_x_q_B:after`, `.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B:after`, `.after_ccontent-_b_x_B:after`, `.after_cml-0_d5:after`, `.after_ctext-red-500:after`, `.aspect-w-16 > text`, `.aspect-w-16 > view`, `.b`, `.before_cabsolute:before`, `.before_cborder-2:before`, `.before_cborder-_b_h0000ff_B:before`

### taro-webpack-react-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-inset-1`, `.-inset-_b1rpx_B`, `.-inset-x-1_e`, `.-m-_b20px_B`, `.-ml-_b5_d5px_B`, `.-mt-1_d5`, `.-mt-2`, `.-rotate-2`, `.-rotate-y-45`, `._b--scroll-offset_c56px_B`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3)`, `._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3)`, `._b_n_view_B_cp-_b12rpx_B view`, `._bmask-type_calpha_B`, `._bmask-type_cluminance_B`, `._bpadding_c20rpx_B`, `._e-translate-y-_b3_d5px_B`, `._emt-0`, `._ep-_b18_d5px_B`

### taro-vite-react-tailwindcss-v3

- CSS 文件：`app.wxss`, `app-origin.wxss`, `pages/index/index.wxss`
- 选择器：`.before_ccontent-_b_a222_a_B:before`, `.before_ccontent-_b_a333_a_B:before`, `.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_q11111_q_B:before`, `.bg-_b_h89ab8d_B`, `.bg-_b_he24826_B`, `.bg-_bred_B`, `.bg-white`, `.dark_cbg-zinc-900`, `.dark_ctext-_b_hec4f4f_B`, `.dark_ctext-zinc-50`, `.divide-_b_h60d256_B > text + text`, `.divide-_b_h60d256_B > text + view`, `.divide-_b_h60d256_B > view + text`, `.divide-_b_h60d256_B > view + view`, `.divide-solid > text + text`, `.divide-solid > text + view`, `.divide-solid > view + text`, `.divide-solid > view + view`

### taro-vite-react-tailwindcss-v4

- CSS 文件：`app.wxss`, `app-origin.wxss`, `pages/index/index.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v4_a_B:before`, `.bg-_b_h123456_B`, `.bg-_bred_B`, `.bg-gradient-to-r`, `.bg-independent-subpackage-marker`, `.bg-linear-to-r`, `.bg-normal-subpackage-marker`, `.bg-purple-300`, `.bg-white`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.from-cyan-500`, `.h-14`, `.h-_b300px_B`, `.mt-2`, `.mt-4`, `.px-3`, `.px-4`

### taro-webpack-vue3-tailwindcss-v3

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.a`, `.aspect-w-16 > text`, `.aspect-w-16 > view`, `.b`, `.before_cabsolute:before`, `.before_cborder-2:before`, `.before_cborder-_b_h4bd650_B:before`, `.before_ccontent-_b_aindependent_subpackage_taro-webpack-vue3-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-webpack-vue3-tailwindcss-v3_a_B:before`, `.before_cinset-0:before`, `.before_crounded-_b20rpx_B:before`, `.bg-_b_h123456_B`, `.bg-opacity-_b0_d54_B`, `.bg-sky-500_f80`, `.dark text.dark_cbg-_b_h123456_B`, `.dark text.dark_cbg-zinc-900`, `.dark text.dark_ctext-zinc-50`, `.dark view.dark_cbg-_b_h123456_B`, `.dark view.dark_cbg-zinc-900`, `.dark view.dark_ctext-zinc-50`

### taro-webpack-vue3-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-inset-1`, `.-inset-_b1rpx_B`, `.-inset-x-1_e`, `.-m-_b20px_B`, `.-ml-_b5_d5px_B`, `.-mt-1_d5`, `.-mt-2`, `.-rotate-2`, `._2xl_ctext-_bred_B`, `._2xl_ctext-base`, `._b--scroll-offset_c56px_B`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3)`, `._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3)`, `._b_n_view_B_cp-_b12rpx_B view`, `._bmask-type_calpha_B`, `._bmask-type_cluminance_B`, `._bpadding_c20rpx_B`, `._e-translate-y-_b3_d5px_B`, `._ebg-green-500`

### taro-vite-vue3-tailwindcss-v3

- CSS 文件：`app.wxss`, `app-origin.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_a11111_a_B:before`, `.before_ccontent-_b_a222_a_B:before`, `.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v3_a_B:before`, `.bg-_b_h89ab8d_B`, `.bg-_b_he24826_B`, `.bg-independent-subpackage-marker`, `.bg-normal-subpackage-marker`, `.bg-white`, `.dark_cbg-zinc-900`, `.dark_ctext-_b_hec4f4f_B`, `.dark_ctext-zinc-50`, `.divide-_b_h60d256_B > text + text`, `.divide-_b_h60d256_B > text + view`, `.divide-_b_h60d256_B > view + text`, `.divide-_b_h60d256_B > view + view`, `.divide-solid > text + text`, `.divide-solid > text + view`, `.divide-solid > view + text`, `.divide-solid > view + view`

### taro-vite-vue3-tailwindcss-v4

- CSS 文件：`app.wxss`, `app-origin.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v4_a_B:before`, `.bg-_b_h123456_B`, `.bg-gradient-to-r`, `.bg-independent-subpackage-marker`, `.bg-linear-to-r`, `.bg-normal-subpackage-marker`, `.bg-purple-300`, `.bg-white`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.from-cyan-500`, `.h-14`, `.h-_b300px_B`, `.mt-2`, `.mt-4`, `.px-3`, `.px-4`, `.py-2`

### uni-app-vite-tailwindcss-v3

- CSS 文件：`app.wxss`, `custom-tab-bar/index.wxss`, `moduleA/pages/a.wxss`, `moduleA/pages/b.wxss`, `moduleA/pages/index.wxss`, `node-modules/uview-plus/components/u-button/u-button.wxss`, `node-modules/uview-plus/components/u-loading-icon/u-loading-icon.wxss`, `pages/index/index.wxss`, `pages/index/peer.wxss`, `pages/issue/typography.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-m-_b20px_B`, `.-mt-2`, `._2xl_ctext-_bred_B`, `._2xl_ctext-base`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._ebg-green-500`, `._eborder-primary`, `._efont-bold`, `._ehidden`, `._etext-_b_h990000_B`, `._etext-primary`, `._etext-red-400`, `.after_cborder-none:after`, `.after_ccontent-_b_au_x6211_u_x662f_className_a_B:after`, `.after_ccontent-_b_au_x6211_u_x6765_u_x81ea_utils_dfilter_djs_a_B:after`, `.after_ccontent-_b_av3_apply_a_B:after`, `.after_ccontent-_b_r_au_x6211_u_x6765_u_x81ea_inline-wxs_r_a_B:after`, `.apply-class-0`, `.backdrop-blur-_b2rpx_B`, `.before_ccontent-_b_aFestivus_a_B:before`

### uni-app-vite-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages-order/pages/home/home.wxss`, `pages-order/pages/user/user.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.active_cbg-emerald-50:active`, `.active_cbg-emerald-600:active`, `.aspect-_bcalc_p4_x3_u1_P_f3_B`, `.aspect-_p--my-aspect-ratio_P`, `.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v4_a_B:before`, `.bg-_b_h0000ff_B`, `.bg-_b_h123498_B`, `.bg-emerald-100`, `.bg-emerald-500`, `.bg-independent-subpackage-marker`, `.bg-midnight`, `.bg-neutral-1B`, `.bg-normal-subpackage-marker`, `.bg-slate-50`, `.bg-white`, `.block`, `.border`, `.border-emerald-500`, `.border-slate-200`

### weapp-vite-tailwindcss-v3

- CSS 文件：`app.wxss`, `components/IceButton/index.wxss`, `miniprogram/app.wxss`, `miniprogram/sub-normal/pages/index.wxss`, `pages/index/index.wxss`, `pages/index/merge/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-inset-1`, `.-inset-_b1rpx_B`, `._b--scroll-offset_c56px_B`, `._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3)`, `._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3)`, `._b_n_view_B_cp-_b12rpx_B view`, `._bmask-type_calpha_B`, `._bmask-type_cluminance_B`, `._bpadding_c20rpx_B`, `.before_ccontent-_b_aindependent_subpackage_weapp-vite-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_weapp-vite-tailwindcss-v3_a_B:before`, `.bg-_b_h111111_B`, `.bg-_b_h123456_B`, `.bg-_b_h16a34a_B`, `.bg-_b_h2563eb_B`, `.bg-_b_hB91C1C_B`, `.bg-_b_hd72929_B`, `.bg-_b_hdc2626_B`, `.bg-_bcolor_cvar_p--mystery-var_P_B`, `.bg-_bgreen_B`

### weapp-vite-tailwindcss-v4

- CSS 文件：`app.wxss`, `packageB/pages/apple.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_weapp-vite-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_weapp-vite-tailwindcss-v4_a_B:before`, `.bg-_b_h111111_B`, `.bg-_b_h3a32d1_B`, `.bg-_b_h68c828_B`, `.bg-amber-300`, `.bg-blue-500_f30`, `.bg-gradient-to-b`, `.bg-gradient-to-t`, `.bg-gradient-to-tr`, `.bg-gray-900`, `.bg-independent-subpackage-marker`, `.bg-normal-subpackage-marker`, `.bg-white`, `.bg-zinc-50`, `.border-4`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.duration-500`
