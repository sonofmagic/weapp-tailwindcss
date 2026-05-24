# Demo 生成模式 CSS 产物报告

本报告由 `pnpm e2e:apps-generator` 生成，用来验证保留的 demo 在默认生成模式下的小程序样式产物。

## 汇总

| 项目 | 来源 | 状态 | CSS 文件 | 字节数 | 选择器数 | @supports | :hover | Tailwind banner | 原始任意值选择器 | 小程序转义任意值选择器 |
| --- | --- | --- | --- | ---: | ---: | --- | --- | --- | --- | --- |
| taro-webpack-react-tailwindcss-v3 | demo | 通过 | `taro-webpack-react-tailwindcss-v3/dist/app.wxss` (+7) | 35377 | 97 | 否 | 否 | 否 | 否 | 是 |
| taro-vite-react-tailwindcss-v4 | demo | 通过 | `taro-vite-react-tailwindcss-v4/dist/app.wxss` (+4) | 11923 | 21 | 否 | 否 | 否 | 否 | 是 |

## 说明

- CSS 文件列展示入口样式；`(+N)` 表示报告还会聚合 `@import` 关联样式，例如 Taro 的 `app-origin.wxss` 或 Mpx 的 hash 化 `styles/app*.wxss`。
- `@supports`、`:hover` 和 Tailwind banner 三列描述的是生成模式产物。面向小程序时这些值应保持为 `否`。
- 选择器列表会展示前 20 项，便于观察生成模式是否覆盖当前 demo 的有效类名。
- 失败行会在失败详情中保留首个错误信息，便于持续消除迁移阻塞。

## 失败详情

- 无

## 选择器样本

### taro-webpack-react-tailwindcss-v3

- CSS 文件：`app.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`, `index.wxss`
- 选择器：`.-m-_b20px_B`, `._b_n__du-count-down_r__r_text_B_c_etext-red-400 .u-count-down__text`, `._etext-_b_h555_B`, `.a`, `.aaaaaaa`, `.after_cborder-none:after`, `.after_ccontent-_b_aHello_World_a_B:after`, `.after_ccontent-_b_a_x_a_B:after`, `.after_ccontent-_b_au_x7684_u_x6492_u_x7684_u_x6492__a_B:after`, `.after_ccontent-_b_q_x_q_B:after`, `.after_ccontent-_b_qu_x7684_u_x6492_u_x7684_u_x6492__q_B:after`, `.after_ccontent-_b_x_B:after`, `.after_cml-0_d5:after`, `.after_ctext-red-500:after`, `.aspect-w-16 > text`, `.aspect-w-16 > view`, `.b`, `.before_cabsolute:before`, `.before_cborder-2:before`, `.before_cborder-_b_h0000ff_B:before`

### taro-vite-react-tailwindcss-v4

- CSS 文件：`app.wxss`, `app-origin.wxss`, `index.wxss`, `index.wxss`, `index.wxss`
- 选择器：`.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v4_a_B:before`, `.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v4_a_B:before`, `.bg-_b_h123456_B`, `.bg-gradient-to-r`, `.bg-independent-subpackage-marker`, `.bg-linear-to-r`, `.bg-normal-subpackage-marker`, `.bg-purple-300`, `.container`, `.from-cyan-500`, `.h-14`, `.h-_b300px_B`, `.text-_b55rpx_B`, `.text-_b_hc31d6b_B`, `.text-_b_hfff_B`, `.to-blue-500`, `.tw-page-style-watch-anchor`, `.tw-root`, `:host`, `page`
