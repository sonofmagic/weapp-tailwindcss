# Demo 生成模式 CSS 产物报告

本报告由 `pnpm e2e:apps-generator` 生成，用来按平台验证保留的 demo 在默认生成模式下的样式产物。

## 汇总

| 项目 | 来源 | 平台 | 允许平台 | 状态 | CSS 文件 | 字节数 | 选择器数 | @supports | :hover | Tailwind banner | 系统暗色媒体查询 | 手动暗色选择器 | 不兼容主题属性选择器 | 不兼容主题复杂选择器 | 原始任意值选择器 | 小程序转义任意值选择器 |
| --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gulp-tailwindcss-v3 | demo | weapp | `weapp`, `tt` | 通过 | `gulp-tailwindcss-v3/dist/app.wxss` (+3) | 17453 | 71 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| gulp-tailwindcss-v4 | demo | weapp | `weapp`, `tt` | 通过 | `gulp-tailwindcss-v4/dist/app.wxss` (+4) | 15958 | 77 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| mpx-tailwindcss-v3 | demo | wx | `wx`, `ali`, `swan`, `tt`, `dd` | 通过 | `mpx-tailwindcss-v3/dist/wx/app.wxss` (+12) | 399230 | 2904 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| mpx-tailwindcss-v4 | demo | wx | `wx`, `ali`, `swan`, `tt`, `dd` | 通过 | `mpx-tailwindcss-v4/dist/wx/app.wxss` (+5) | 50017 | 130 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-webpack-react-tailwindcss-v3 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid`, `quickapp` | 通过 | `taro-webpack-react-tailwindcss-v3/dist/app.wxss` (+6) | 351714 | 2323 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-webpack-react-tailwindcss-v4 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid` | 通过 | `taro-webpack-react-tailwindcss-v4/dist/app.wxss` (+3) | 32423 | 119 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-vite-react-tailwindcss-v3 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid` | 通过 | `taro-vite-react-tailwindcss-v3/dist/app.wxss` (+5) | 307278 | 2189 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-vite-react-tailwindcss-v4 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid` | 通过 | `taro-vite-react-tailwindcss-v4/dist/app.wxss` (+4) | 584642 | 2241 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-webpack-vue3-tailwindcss-v3 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid`, `quickapp` | 通过 | `taro-webpack-vue3-tailwindcss-v3/dist/app.wxss` (+3) | 241262 | 1591 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-webpack-vue3-tailwindcss-v4 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid` | 通过 | `taro-webpack-vue3-tailwindcss-v4/dist/app.wxss` (+3) | 10014 | 44 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-vite-vue3-tailwindcss-v3 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid` | 通过 | `taro-vite-vue3-tailwindcss-v3/dist/app.wxss` (+4) | 336695 | 1705 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-vite-vue3-tailwindcss-v4 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid` | 通过 | `taro-vite-vue3-tailwindcss-v4/dist/app.wxss` (+3) | 557302 | 1731 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| uni-app-vite-tailwindcss-v3 | demo | mp-weixin | `app-android`, `app-ios`, `h5`, `h5:ssr`, `mp-alipay`, `mp-baidu`, `mp-kuaishou`, `mp-lark`, `mp-qq`, `mp-toutiao`, `mp-weixin`, `quickapp-webview`, `quickapp-webview-huawei`, `quickapp-webview-union` | 通过 | `uni-app-vite-tailwindcss-v3/dist/build/mp-weixin/app.wxss` (+11) | 211524 | 2841 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| uni-app-vite-tailwindcss-v4 | demo | mp-weixin | `app-android`, `app-ios`, `h5`, `h5:ssr`, `mp-alipay`, `mp-baidu`, `mp-jd`, `mp-kuaishou`, `mp-lark`, `mp-qq`, `mp-toutiao`, `mp-weixin`, `mp-xhs`, `quickapp-webview`, `quickapp-webview-huawei`, `quickapp-webview-union` | 通过 | `uni-app-vite-tailwindcss-v4/dist/build/mp-weixin/app.wxss` (+4) | 34275 | 141 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| weapp-vite-tailwindcss-v3 | demo | weapp | `weapp` | 通过 | `weapp-vite-tailwindcss-v3/dist/app.wxss` (+5) | 47986 | 185 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| weapp-vite-tailwindcss-v4 | demo | weapp | `weapp` | 通过 | `weapp-vite-tailwindcss-v4/dist/app.wxss` (+5) | 31718 | 87 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |

## 说明

- CSS 文件列展示入口样式；`(+N)` 表示报告还会聚合 `@import` 关联样式，例如 Taro 的 `app-origin.wxss` 或 Mpx 的 hash 化 `styles/app*.wxss`。
- 平台列表示默认 demo `build` 脚本实际构建的目标；允许平台来自 `DEMO_COVERAGE_MATRIX`，用于把后续多平台产物放入不同目录进行对比。
- `@supports`、`:hover` 和 Tailwind banner 三列描述的是生成模式产物。面向小程序时这些值应保持为 `否`。
- 系统暗色媒体查询和手动暗色选择器两列用于确认 `prefers-color-scheme` 与 `.theme-dark` class 示例都进入生成模式产物。
- 选择器列表会展示前 20 项，便于观察生成模式是否覆盖当前 demo 的有效类名。
- 失败行会在失败详情中保留首个错误信息，便于持续消除迁移阻塞。

## 失败详情

- 无

## 选择器样本

### gulp-tailwindcss-v3

- CSS 文件：`app.wxss`, `pages/more/more.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_gulp-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_gulp-tailwindcss-v3_a_B:before`, `.bg-_b_hfff_B`, `.bg-_blength_c100_v_100_v_B`, `.bg-_bred_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-_burl_phttps_c_f_fpic1_dzhimg_dcom_fv2-3ee20468f54bbfefcd0027283b21aaa8_720w_djpg_P_B`, `.bg-independent-subpackage-marker`, `.bg-no-repeat`, `.bg-normal-subpackage-marker`, `.bg-white`, `.block`, `.border-_b_hEEEEEE_B`, `.border-b`, `.dark_cbg-zinc-900`, `.dark_ctext-zinc-50`, `.font-bold`, `.font-medium`, `.h-_b41_d54vw_B`, `.h-full`

### gulp-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/more/more.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`, `third-party-ui.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_gulp-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_gulp-tailwindcss-v4_a_B:before`, `.bg-_b_hfff_B`, `.bg-_blength_c100_v_100_v_B`, `.bg-_bred_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-_burl_phttps_c_f_fpic1_dzhimg_dcom_fv2-3ee20468f54bbfefcd0027283b21aaa8_720w_djpg_P_B`, `.bg-independent-subpackage-marker`, `.bg-no-repeat`, `.bg-normal-subpackage-marker`, `.bg-white`, `.block`, `.border-_b_hEEEEEE_B`, `.border-b`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.font-bold`, `.font-medium`, `.h-_b41_d54vw_B`

### mpx-tailwindcss-v3

- CSS 文件：`app.wxss`, `components/tdesign-miniprogram/miniprogram_dist/button/button.wxss`, `components/tdesign-miniprogram/miniprogram_dist/icon/icon.wxss`, `components/tdesign-miniprogram/miniprogram_dist/loading/loading.wxss`, `components/vant/weapp/lib/button/index.wxss`, `components/vant/weapp/lib/icon/index.wxss`, `components/vant/weapp/lib/info/index.wxss`, `components/vant/weapp/lib/loading/index.wxss`, `styles/base.wxss`, `styles/components.wxss`, `styles/index.1.wxss`, `styles/index.2.wxss`, `styles/utilities.wxss`
- 选择器：`.after_ccontent-_b_au_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x8fd9_u_x662f_u_x4e2d_u_x6587_u_x5b57_u_x7b26_u_x4e32__a_B:after`, `.after_ccontent-_b_qu_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x5f88_u_x65e0_u_x804a__q_B:after`, `.after_cml-0_d5:after`, `.after_ctext-red-500:after`, `.before_ccontent-_b_aindependent_subpackage_mpx-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_mpx-tailwindcss-v3_a_B:before`, `.bg-_b_h123456_B`, `.bg-_b_h929292_B`, `.bg-_bred_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-white`, `.dark_cbg-zinc-900`, `.dark_ctext-zinc-50`, `.flex`, `.flex-col`, `.h-_b43rpx_B`, `.hotspot-expanded.relative`, `.hotspot-expanded:after`, `.mt-2`, `.mt-4`

### mpx-tailwindcss-v4

- CSS 文件：`app.wxss`, `styles/app.wxss`, `styles/third-party-ui.wxss`, `pages/component/index.wxss`, `styles/index.wxss`, `sub-independent/styles/index.wxss`
- 选择器：`.-mt-2`, `._2xl_ctext-base`, `._ebg-green-500`, `._efont-bold`, `._etext-_b_h990000_B`, `.active_cbg-_b_h543210_B:active`, `.active_cbg-_b_h989898_B:active`, `.after_cborder-none:after`, `.before_ccontent-_b_aFestivus_a_B:before`, `.bg-_b_h010101_B`, `.bg-_b_h123456_B`, `.bg-_b_h434344_B`, `.bg-_b_he90505_B`, `.bg-blue-500_f50`, `.bg-gray-100`, `.bg-pink-500`, `.bg-red-400`, `.bg-red-500`, `.bg-sky-500`, `.bg-white`

### taro-webpack-react-tailwindcss-v3

- CSS 文件：`app.wxss`, `moduleB/pages/index.wxss`, `moduleC/pages/index.wxss`, `pages/debug/index.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-m-_b20px_B`, `.-mt-2`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._etext-_b_h555_B`, `._etext-red-400`, `.a`, `.aaaaaaa`, `.after_cborder-none:after`, `.after_ccontent-_b_aHello_World_a_B:after`, `.after_ccontent-_b_a_x_a_B:after`, `.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B:after`, `.after_ccontent-_b_q_x_q_B:after`, `.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B:after`, `.after_ccontent-_b_x_B:after`, `.after_cml-0_d5:after`, `.after_ctext-red-500:after`, `.b`, `.before_cabsolute:before`, `.before_cborder-2:before`, `.before_cborder-_b_h0000ff_B:before`

### taro-webpack-react-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-bg-conic-180`, `.-bg-linear-65`, `.-rotate-y-45`, `.absolute`, `.before_ccontent-_b_aindependent_subpackage_taro-webpack-react-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-webpack-react-tailwindcss-v4_a_B:before`, `.bg-_b_h534312_B`, `.bg-_bimage_clinear-gradient_pto_right_m_h06b6d4_m_h3b82f6_P_B`, `.bg-_pimage_c--issue-928-image_P`, `.bg-conic`, `.bg-conic-180`, `.bg-conic-_bfrom_45deg_at_50_v_50_v_m_hef4444_m_heab308_m_h22c55e_B`, `.bg-conic-_p--issue-928-conic_P`, `.bg-conic_fdecreasing`, `.bg-gradient-to-r`, `.bg-independent-subpackage-marker`, `.bg-linear-65`, `.bg-linear-_b25deg_m_hef4444_5_v_m_heab308_60_v_m_h22c55e_90_v_m_h14b8a6_B`, `.bg-linear-_p--issue-928-linear_P`, `.bg-linear-to-r`

### taro-vite-react-tailwindcss-v3

- CSS 文件：`app.wxss`, `app-origin.wxss`, `vendors.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_a222_a_B:before`, `.before_ccontent-_b_a333_a_B:before`, `.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_q11111_q_B:before`, `.bg-_b_h89ab8d_B`, `.bg-_b_he24826_B`, `.bg-_bred_B`, `.bg-independent-subpackage-marker`, `.bg-normal-subpackage-marker`, `.bg-white`, `.dark_cbg-zinc-900`, `.dark_ctext-_b_hec4f4f_B`, `.dark_ctext-zinc-50`, `.divide-_b_h60d256_B > text + text`, `.divide-_b_h60d256_B > text + view`, `.divide-_b_h60d256_B > view + text`, `.divide-_b_h60d256_B > view + view`, `.divide-solid > text + text`, `.divide-solid > text + view`

### taro-vite-react-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`, `vendors.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v4_a_B:before`, `.bg-_b_h123456_B`, `.bg-_bred_B`, `.bg-gradient-to-r`, `.bg-independent-subpackage-marker`, `.bg-linear-to-r`, `.bg-normal-subpackage-marker`, `.bg-purple-300`, `.bg-white`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.fade-appear`, `.fade-appear-active`, `.fade-enter`, `.fade-enter-active`, `.fade-enter-done`, `.fade-exit`, `.fade-exit-active`

### taro-webpack-vue3-tailwindcss-v3

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.a`, `.b`, `.before_cabsolute:before`, `.before_cborder-2:before`, `.before_cborder-_b_h4bd650_B:before`, `.before_ccontent-_b_aindependent_subpackage_taro-webpack-vue3-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-webpack-vue3-tailwindcss-v3_a_B:before`, `.before_cinset-0:before`, `.before_crounded-_b20rpx_B:before`, `.bg-_b_h123456_B`, `.bg-independent-subpackage-marker`, `.bg-normal-subpackage-marker`, `.bg-opacity-_b0_d54_B`, `.bg-sky-500_f80`, `.bg-white`, `.collapse-border-none .nut-collapse-item__title:after`, `.dark text.dark_cbg-_b_h123456_B`, `.dark text.dark_cbg-zinc-900`, `.dark text.dark_ctext-zinc-50`, `.dark view.dark_cbg-_b_h123456_B`

### taro-webpack-vue3-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_taro-webpack-vue3-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-webpack-vue3-tailwindcss-v4_a_B:before`, `.bg-_b_h123456_B`, `.bg-_b_h534312_B`, `.bg-gradient-to-r`, `.bg-independent-subpackage-marker`, `.bg-normal-subpackage-marker`, `.bg-purple-800`, `.bg-white`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.from-cyan-500`, `.h-14`, `.mt-2`, `.mt-4`, `.px-3`, `.px-4`, `.px-_b32px_B`, `.py-2`

### taro-vite-vue3-tailwindcss-v3

- CSS 文件：`app.wxss`, `app-origin.wxss`, `vendors.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_a11111_a_B:before`, `.before_ccontent-_b_a222_a_B:before`, `.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v3_a_B:before`, `.bg-_b_h89ab8d_B`, `.bg-_b_he24826_B`, `.bg-independent-subpackage-marker`, `.bg-normal-subpackage-marker`, `.bg-white`, `.collapse-border-none .nut-collapse-item__title:after`, `.dark_cbg-zinc-900`, `.dark_ctext-_b_hec4f4f_B`, `.dark_ctext-zinc-50`, `.divide-_b_h60d256_B > text + text`, `.divide-_b_h60d256_B > text + view`, `.divide-_b_h60d256_B > view + text`, `.divide-_b_h60d256_B > view + view`, `.divide-solid > text + text`, `.divide-solid > text + view`, `.divide-solid > view + text`

### taro-vite-vue3-tailwindcss-v4

- CSS 文件：`app.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`, `vendors.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v4_a_B:before`, `.bg-_b_h123456_B`, `.bg-gradient-to-r`, `.bg-independent-subpackage-marker`, `.bg-linear-to-r`, `.bg-normal-subpackage-marker`, `.bg-purple-300`, `.bg-white`, `.collapse-border-none .nut-collapse-item__title:after`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.from-cyan-500`, `.h-14`, `.h-_b300px_B`, `.h5-input`, `.h5-textarea`, `.mt-2`, `.mt-4`

### uni-app-vite-tailwindcss-v3

- CSS 文件：`app.wxss`, `custom-tab-bar/index.wxss`, `moduleA/pages/a.wxss`, `moduleA/pages/b.wxss`, `moduleA/pages/index.wxss`, `node-modules/uview-plus/components/u-button/u-button.wxss`, `node-modules/uview-plus/components/u-loading-icon/u-loading-icon.wxss`, `pages/index/index.wxss`, `pages/index/peer.wxss`, `pages/issue/typography.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-m-_b20px_B`, `.-mt-2`, `._2xl_ctext-_bred_B`, `._2xl_ctext-base`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._ebg-green-500`, `._eborder-primary`, `._efont-bold`, `._ehidden`, `._etext-_b_h990000_B`, `._etext-primary`, `._etext-red-400`, `.after_cborder-none:after`, `.after_ccontent-_b_au_x6211_u_x662f_className_a_B:after`, `.after_ccontent-_b_au_x6211_u_x6765_u_x81ea_utils_dfilter_djs_a_B:after`, `.after_ccontent-_b_av3_apply_a_B:after`, `.after_ccontent-_b_r_au_x6211_u_x6765_u_x81ea_inline-wxs_r_a_B:after`, `.apply-class-0`, `.backdrop-blur-_b2rpx_B`, `.before_ccontent-_b_aFestivus_a_B:before`

### uni-app-vite-tailwindcss-v4

- CSS 文件：`common.wxss`, `main.wxss`, `pages-order/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.active_cbg-emerald-50:active`, `.active_cbg-emerald-600:active`, `.aspect-_bcalc_p4_x3_u1_P_f3_B`, `.aspect-_p--my-aspect-ratio_P`, `.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v4_a_B:before`, `.bg-_b_h0000ff_B`, `.bg-_b_h123498_B`, `.bg-emerald-100`, `.bg-emerald-500`, `.bg-independent-subpackage-marker`, `.bg-midnight`, `.bg-neutral-1B`, `.bg-normal-subpackage-marker`, `.bg-slate-50`, `.bg-white`, `.block`, `.border`, `.border-emerald-500`, `.border-slate-200`

### weapp-vite-tailwindcss-v3

- CSS 文件：`app.wxss`, `components/IceButton/index.wxss`, `pages/index/index.wxss`, `pages/index/merge/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-inset-1`, `.-inset-_b1rpx_B`, `._b--scroll-offset_c56px_B`, `._b_n_cnth-child_p3_P_B_cpy-0:nth-child(3)`, `._b_n_cnth-child_p3_P_B_cpy-4:nth-child(3)`, `._b_n_view_B_cp-_b12rpx_B view`, `._bmask-type_calpha_B`, `._bmask-type_cluminance_B`, `._bpadding_c20rpx_B`, `.before_ccontent-_b_aindependent_subpackage_weapp-vite-tailwindcss-v3_a_B:before`, `.before_ccontent-_b_anormal_subpackage_weapp-vite-tailwindcss-v3_a_B:before`, `.bg-_b_h111111_B`, `.bg-_b_h123456_B`, `.bg-_b_h16a34a_B`, `.bg-_b_h2563eb_B`, `.bg-_b_hB91C1C_B`, `.bg-_b_hd72929_B`, `.bg-_b_hdc2626_B`, `.bg-_bcolor_cvar_p--mystery-var_P_B`, `.bg-_bgreen_B`

### weapp-vite-tailwindcss-v4

- CSS 文件：`app.wxss`, `packageB/pages/apple.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`, `tailwind.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_weapp-vite-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_weapp-vite-tailwindcss-v4_a_B:before`, `.bg-_b_h111111_B`, `.bg-_b_h3a32d1_B`, `.bg-_b_h68c828_B`, `.bg-amber-300`, `.bg-blue-500_f30`, `.bg-gradient-to-b`, `.bg-gradient-to-t`, `.bg-gradient-to-tr`, `.bg-gray-900`, `.bg-independent-subpackage-marker`, `.bg-normal-subpackage-marker`, `.bg-white`, `.bg-zinc-50`, `.border-4`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.duration-500`
