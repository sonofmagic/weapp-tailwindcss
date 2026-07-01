# Demo 生成模式 CSS 产物报告

本报告由 `pnpm e2e:apps-generator` 生成，用来按平台验证保留的 demo 在默认生成模式下的样式产物。

## 汇总

| 项目 | 来源 | 平台 | 允许平台 | 状态 | CSS 文件 | 字节数 | 选择器数 | @supports | :hover | Tailwind banner | 系统暗色媒体查询 | 手动暗色选择器 | 不兼容主题属性选择器 | 不兼容主题复杂选择器 | 原始任意值选择器 | 小程序转义任意值选择器 |
| --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| gulp-tailwindcss-v4 | demo | weapp | `weapp`, `tt` | 通过 | `gulp-tailwindcss-v4/dist/app.wxss` (+4) | 15432 | 77 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| mpx-tailwindcss-v4 | demo | wx | `wx`, `ali`, `swan`, `tt`, `dd` | 通过 | `mpx-tailwindcss-v4/dist/wx/app.wxss` (+9) | 48460 | 172 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-webpack-react-tailwindcss-v4 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid` | 通过 | `taro-webpack-react-tailwindcss-v4/dist/app.wxss` (+3) | 596444 | 2290 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-vite-react-tailwindcss-v4 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid` | 通过 | `taro-vite-react-tailwindcss-v4/dist/app.wxss` (+4) | 556569 | 2307 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-webpack-vue3-tailwindcss-v4 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid` | 通过 | `taro-webpack-vue3-tailwindcss-v4/dist/app.wxss` (+3) | 496260 | 1777 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| taro-vite-vue3-tailwindcss-v4 | demo | weapp | `weapp`, `swan`, `alipay`, `tt`, `h5`, `rn`, `qq`, `jd`, `harmony-hybrid` | 通过 | `taro-vite-vue3-tailwindcss-v4/dist/app.wxss` (+3) | 466026 | 1731 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| uni-app-vite-tailwindcss-v4 | demo | mp-weixin | `app-android`, `app-ios`, `h5`, `h5:ssr`, `mp-alipay`, `mp-baidu`, `mp-jd`, `mp-kuaishou`, `mp-lark`, `mp-qq`, `mp-toutiao`, `mp-weixin`, `mp-xhs`, `quickapp-webview`, `quickapp-webview-huawei`, `quickapp-webview-union` | 通过 | `uni-app-vite-tailwindcss-v4/dist/build/mp-weixin/app.wxss` (+6) | 35679 | 158 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |
| weapp-vite-tailwindcss-v4 | demo | weapp | `weapp` | 通过 | `weapp-vite-tailwindcss-v4/dist/app.wxss` (+4) | 30531 | 87 | 否 | 否 | 否 | 是 | 是 | 否 | 否 | 否 | 是 |

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

### gulp-tailwindcss-v4

- CSS 文件：`app.wxss`, `third-party-ui.wxss`, `pages/more/more.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_gulp-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_gulp-tailwindcss-v4_a_B:before`, `.bg-_b_hfff_B`, `.bg-_blength_c100_v_100_v_B`, `.bg-_bred_B`, `.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B`, `.bg-_burl_phttps_c_f_fpic1_dzhimg_dcom_fv2-3ee20468f54bbfefcd0027283b21aaa8_720w_djpg_P_B`, `.bg-independent-subpackage-marker`, `.bg-no-repeat`, `.bg-normal-subpackage-marker`, `.bg-white`, `.block`, `.border-_b_hEEEEEE_B`, `.border-b`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.font-bold`, `.font-medium`, `.h-_b41_d54vw_B`

### mpx-tailwindcss-v4

- CSS 文件：`app.wxss`, `styles/app.wxss`, `styles/third-party-ui.wxss`, `pages/component/index.wxss`, `sub-independent/pages/index.wxss`, `sub-independent/styles/index.1.wxss`, `sub-independent/styles/index.2.wxss`, `sub-normal/pages/index.wxss`, `sub-normal/styles/index.1.wxss`, `sub-normal/styles/index.2.wxss`
- 选择器：`.-mt-2`, `._2xl_ctext-base`, `._ebg-_bgray_B`, `._ebg-green-500`, `._efont-bold`, `._etext-_b_h990000_B`, `.active_cbg-_b_h543210_B:active`, `.active_cbg-_b_h989898_B:active`, `.after_c_econtent-_b_agood_work_e_a_B:after`, `.after_cborder-none:after`, `.before_ccontent-_b_aFestivus_a_B:before`, `.before_ccontent-_b_aindependent_subpackage_mpx-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_mpx-tailwindcss-v4_a_B:before`, `.bg-_b_h010101_B`, `.bg-_b_h123456_B`, `.bg-_b_h434344_B`, `.bg-_b_h68c828_B`, `.bg-_b_he90505_B`, `.bg-_bradial-gradient_pcircle_at_18_v_20_v_m_he0f2fe_m_hfdf4ff_70_v_P_B`, `.bg-blue-500_f50`

### taro-webpack-react-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-bg-conic-180`, `.-bg-linear-65`, `.-rotate-y-45`, `.absolute`, `.before_ccontent-_b_aindependent_subpackage_taro-webpack-react-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-webpack-react-tailwindcss-v4_a_B:before`, `.bg-_b_h534312_B`, `.bg-_bimage_clinear-gradient_pto_right_m_h06b6d4_m_h3b82f6_P_B`, `.bg-_pimage_c--issue-928-image_P`, `.bg-conic`, `.bg-conic-180`, `.bg-conic-_bfrom_45deg_at_50_v_50_v_m_hef4444_m_heab308_m_h22c55e_B`, `.bg-conic-_p--issue-928-conic_P`, `.bg-conic_fdecreasing`, `.bg-gradient-to-r`, `.bg-independent-subpackage-marker`, `.bg-linear-65`, `.bg-linear-_b25deg_m_hef4444_5_v_m_heab308_60_v_m_h22c55e_90_v_m_h14b8a6_B`, `.bg-linear-_p--issue-928-linear_P`, `.bg-linear-to-r`

### taro-vite-react-tailwindcss-v4

- CSS 文件：`app.wxss`, `app-origin.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.-translate-y-1`, `._b--watch-hmr-offset_c000089px_B`, `._bmask-type_cluminance_B`, `._ebg-_bgray_B`, `._emt-2`, `.after_c_econtent-_b_agood_work_e_a_B:after`, `.after_cml-_b0_d000089px_B:after`, `.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v4_a_B:before`, `.bg-_b_h000089_B`, `.bg-_b_h123456_B`, `.bg-_b_h68c828_B`, `.bg-_bradial-gradient_pcircle_at_18_v_20_v_m_he0f2fe_m_hfdf4ff_70_v_P_B`, `.bg-_bred_B`, `.bg-_brgb_p12_m34_m56_P_B`, `.bg-gradient-to-br`, `.bg-gradient-to-r`, `.bg-green-200_f70`, `.bg-independent-subpackage-marker`, `.bg-linear-to-r`

### taro-webpack-vue3-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`._ebg-_bgray_B`, `.after_c_econtent-_b_agood_work_e_a_B:after`, `.before_ccontent-_b_aindependent_subpackage_taro-webpack-vue3-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-webpack-vue3-tailwindcss-v4_a_B:before`, `.bg-_b_h123456_B`, `.bg-_b_h534312_B`, `.bg-_b_h68c828_B`, `.bg-_bradial-gradient_pcircle_at_18_v_20_v_m_he0f2fe_m_hfdf4ff_70_v_P_B`, `.bg-gradient-to-br`, `.bg-gradient-to-r`, `.bg-green-200_f70`, `.bg-independent-subpackage-marker`, `.bg-normal-subpackage-marker`, `.bg-purple-800`, `.bg-white`, `.bg-white_f70`, `.border`, `.border-slate-200_f80`, `.collapse-border-none .nut-collapse-item__title:after`, `.dark_cbg-zinc-900.theme-dark`

### taro-vite-vue3-tailwindcss-v4

- CSS 文件：`app.wxss`, `app-origin.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_taro-vite-vue3-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-vue3-tailwindcss-v4_a_B:before`, `.bg-_b_h123456_B`, `.bg-gradient-to-r`, `.bg-independent-subpackage-marker`, `.bg-linear-to-r`, `.bg-normal-subpackage-marker`, `.bg-purple-300`, `.bg-white`, `.collapse-border-none .nut-collapse-item__title:after`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.from-cyan-500`, `.h-14`, `.h-_b300px_B`, `.h5-input`, `.h5-textarea`, `.mt-2`, `.mt-4`

### uni-app-vite-tailwindcss-v4

- CSS 文件：`app.wxss`, `main.wxss`, `components/HelloWorld.wxss`, `pages-order/pages/home/home.wxss`, `pages-order/pages/user/user.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`
- 选择器：`._ebg-_bgray_B`, `.active_cbg-emerald-600:active`, `.after_c_econtent-_b_agood_work_e_a_B:after`, `.aspect-_bcalc_p4_x3_u1_P_f3_B`, `.aspect-_p--my-aspect-ratio_P`, `.before_ccontent-_b_aindependent_subpackage_uni-app-vite-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_uni-app-vite-tailwindcss-v4_a_B:before`, `.bg-_b_h0000ff_B`, `.bg-_b_h123498_B`, `.bg-_b_h68c828_B`, `.bg-_b_hf8fafc_B`, `.bg-_bradial-gradient_pcircle_at_18_v_20_v_m_he0f2fe_m_hfdf4ff_70_v_P_B`, `.bg-emerald-500`, `.bg-gradient-to-br`, `.bg-gradient-to-r`, `.bg-green-200_f70`, `.bg-independent-subpackage-marker`, `.bg-midnight`, `.bg-neutral-1B`, `.bg-normal-subpackage-marker`

### weapp-vite-tailwindcss-v4

- CSS 文件：`app.wxss`, `pages/index/index.wxss`, `sub-independent/pages/index.wxss`, `sub-normal/pages/index.wxss`, `tailwind.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_weapp-vite-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_weapp-vite-tailwindcss-v4_a_B:before`, `.bg-_b_h111111_B`, `.bg-_b_h3a32d1_B`, `.bg-_b_h68c828_B`, `.bg-amber-300`, `.bg-blue-500_f30`, `.bg-gradient-to-b`, `.bg-gradient-to-t`, `.bg-gradient-to-tr`, `.bg-gray-900`, `.bg-independent-subpackage-marker`, `.bg-normal-subpackage-marker`, `.bg-white`, `.bg-zinc-50`, `.border-4`, `.dark_cbg-zinc-900.theme-dark`, `.dark_cbg-zinc-950.theme-dark`, `.dark_ctext-zinc-50.theme-dark`, `.duration-500`
