# mpx-tailwindcss-v4 CSS Output Comparison

Fixture: demo
Entry: mpx-tailwindcss-v4/dist/wx/app.wxss
Legacy CSS files: app.wxss, styles/app.wxss, index.wxss, app3b4a1ac6.wxss
Generator CSS files: app.wxss, styles/app.wxss, index.wxss, app3b4a1ac6.wxss

| Mode | Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- |
| legacy | 18986 | 109 | false | false | false | false | true |
| generator | 20706 | 109 | false | false | false | false | true |

## Diff

```diff
===================================================================
--- mpx-tailwindcss-v4/legacy.css
+++ mpx-tailwindcss-v4/generator.css
@@ -8,6 +8,15 @@
 text,
 :after,
 :before {
+  border: 0 solid;
+  box-sizing: border-box;
+  margin: 0;
+  padding: 0;
+}
+:host,
+page,
+.tw-root,
+wx-root-portal-content {
   --tw-space-y-reverse: 0;
   --tw-divide-x-reverse: 0;
   --tw-border-style: solid;
@@ -28,119 +37,52 @@
   --tw-ring-offset-color: #fff;
   --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
   --tw-content: '';
-  box-sizing: border-box;
-  border-width: 0;
-  border-style: solid;
-  border-color: currentColor;
-}
-:host,
-page,
-.tw-root,
-wx-root-portal-content {
-  --color-red-400: rgb(255, 101, 104);
-  --color-red-500: rgb(251, 44, 54);
   --color-yellow-400: rgb(247, 201, 0);
   --color-green-500: rgb(0, 198, 90);
-  --color-sky-500: rgb(0, 165, 234);
   --color-blue-500: rgb(50, 128, 255);
+  --color-zinc-800: rgb(39, 39, 42);
+  --text-base: 32rpx;
+  --text-base--line-height: 1.5;
+  --font-weight-bold: 700;
+  --color-red-400: rgb(255, 101, 104);
+  --color-red-500: rgb(251, 44, 54);
+  --color-sky-500: rgb(0, 165, 234);
   --color-purple-600: rgb(152, 16, 250);
   --color-pink-300: rgb(253, 165, 213);
   --color-pink-500: rgb(246, 51, 154);
   --color-gray-100: rgb(243, 244, 246);
-  --color-zinc-800: rgb(39, 39, 42);
   --color-black: #000;
   --color-white: #fff;
   --spacing: 8rpx;
-  --text-base: 32rpx;
-  --text-base--line-height: 1.5;
   --text-2xl: 48rpx;
   --text-2xl--line-height: 1.33333;
   --font-weight-semibold: 600;
-  --font-weight-bold: 700;
   --radius-md: 12rpx;
 }
-view,
-text,
-:after,
-:before {
-  border: 0 solid;
-  box-sizing: border-box;
-  margin: 0;
-  padding: 0;
-}
 .-m-_b20px_B {
   margin: -20px;
 }
-.-mt-2 {
-  margin-top: -16rpx;
-  margin-top: calc(var(--spacing) * -2);
-}
 .mb-_b-20px_B {
   margin-bottom: -20px;
 }
-.flex {
-  display: -webkit-flex;
-  display: flex;
-}
-.grid {
-  display: grid;
-}
-.h-2 {
-  height: 16rpx;
-  height: calc(var(--spacing) * 2);
-}
-.h-3 {
-  height: 24rpx;
-  height: calc(var(--spacing) * 3);
-}
-.h-5 {
-  height: 40rpx;
-  height: calc(var(--spacing) * 5);
-}
-.h-10 {
-  height: 80rpx;
-  height: calc(var(--spacing) * 10);
-}
 .h-_b20px_B {
   height: 20px;
 }
 .h-_b200_v_B {
   height: 200%;
 }
-.h-screen {
-  height: 100vh;
-}
 .max-h-_b100px_B {
   max-height: 100px;
 }
 .min-h-_b100px_B {
   min-height: 100px;
 }
-.w-2 {
-  width: 16rpx;
-  width: calc(var(--spacing) * 2);
-}
-.w-5 {
-  width: 40rpx;
-  width: calc(var(--spacing) * 5);
-}
-.w-10 {
-  width: 80rpx;
-  width: calc(var(--spacing) * 10);
-}
-.w-32 {
-  width: 256rpx;
-  width: calc(var(--spacing) * 32);
-}
 .w-_b20px_B {
   width: 20px;
 }
 .w-_b300rpx_B {
   width: 300rpx;
 }
-.w-screen {
-  width: 100vw;
-}
 .max-w-_b300rpx_B {
   max-width: 300rpx;
 }
@@ -150,74 +92,30 @@
 .rotate-_b10deg_B {
   rotate: 10deg;
 }
-.grid-cols-3 {
-  grid-template-columns: repeat(3, minmax(0, 1fr));
-}
-.flex-col {
-  -webkit-flex-direction: column;
-  flex-direction: column;
-}
-.items-center {
-  -webkit-align-items: center;
-  align-items: center;
-}
-.justify-center {
-  -webkit-justify-content: center;
-  justify-content: center;
-}
-.space-y-4 > view + view,
-.space-y-4 > view + text,
-.space-y-4 > text + view,
-.space-y-4 > text + text {
-  --tw-space-y-reverse: 0;
-  margin-top: 32rpx;
-  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
-  margin-bottom: 0rpx;
-  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
-}
 .space-y-_b1_d6rem_B > view + view,
 .space-y-_b1_d6rem_B > view + text,
 .space-y-_b1_d6rem_B > text + view,
 .space-y-_b1_d6rem_B > text + text {
   --tw-space-y-reverse: 0;
-  margin-top: 51.2rpx;
-  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
-  margin-bottom: 0rpx;
   margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
+  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
 }
 .divide-x-_b10px_B > view + view,
 .divide-x-_b10px_B > view + text,
 .divide-x-_b10px_B > text + view,
 .divide-x-_b10px_B > text + text {
   --tw-divide-x-reverse: 0;
-  border-left-width: 10px;
-  border-left-width: calc(10px * (1 - var(--tw-divide-x-reverse)));
-  border-right-width: 0px;
-  border-right-width: calc(10px * var(--tw-divide-x-reverse));
   border-left-style: var(--tw-border-style);
   border-right-style: var(--tw-border-style);
+  border-right-width: calc(10px * var(--tw-divide-x-reverse));
+  border-left-width: calc(10px * (1 - var(--tw-divide-x-reverse)));
 }
-.divide-solid > view + view,
-.divide-solid > view + text,
-.divide-solid > text + view,
-.divide-solid > text + text {
-  --tw-border-style: solid;
-  border-style: solid;
-}
 .divide-_b_h010101_B > view + view,
 .divide-_b_h010101_B > view + text,
 .divide-_b_h010101_B > text + view,
 .divide-_b_h010101_B > text + text {
   border-color: #010101;
 }
-.rounded-md {
-  border-radius: 12rpx;
-  border-radius: var(--radius-md);
-}
-.border {
-  border-style: var(--tw-border-style);
-  border-width: 1px;
-}
 .border-_b10px_B {
   border-style: var(--tw-border-style);
   border-width: 10px;
@@ -234,10 +132,6 @@
   border-bottom-style: var(--tw-border-style);
   border-bottom-width: 4rpx;
 }
-.border-solid {
-  --tw-border-style: solid;
-  border-style: solid;
-}
 .border-_b_h098765_B {
   border-color: #098765;
 }
@@ -245,7 +139,6 @@
   border-color: red;
 }
 ._ebg-green-500 {
-  background-color: rgb(0, 198, 90) !important;
   background-color: var(--color-green-500) !important;
 }
 .bg-_b_h010101_B {
@@ -261,28 +154,8 @@
   background-color: #e90505;
 }
 .bg-blue-500_f50 {
-  background-color: rgba(48, 128, 255, 0.50196);
+  background-color: rgba(50, 128, 255, 0.5);
 }
-.bg-gray-100 {
-  background-color: rgb(243, 244, 246);
-  background-color: var(--color-gray-100);
-}
-.bg-pink-500 {
-  background-color: rgb(246, 51, 154);
-  background-color: var(--color-pink-500);
-}
-.bg-red-400 {
-  background-color: rgb(255, 101, 104);
-  background-color: var(--color-red-400);
-}
-.bg-red-500 {
-  background-color: rgb(251, 44, 54);
-  background-color: var(--color-red-500);
-}
-.bg-sky-500 {
-  background-color: rgb(0, 165, 234);
-  background-color: var(--color-sky-500);
-}
 .p-_b20px_B {
   padding: 20px;
 }
@@ -290,18 +163,6 @@
   padding-left: 34.54rpx;
   padding-right: 34.54rpx;
 }
-.py-2 {
-  padding-top: 16rpx;
-  padding-bottom: 16rpx;
-  padding-top: calc(var(--spacing) * 2);
-  padding-bottom: calc(var(--spacing) * 2);
-}
-.text-2xl {
-  font-size: 48rpx;
-  font-size: var(--text-2xl);
-  line-height: 1.33333;
-  line-height: var(--tw-leading, var(--text-2xl--line-height));
-}
 .text-_b20px_B {
   font-size: 20px;
 }
@@ -326,16 +187,10 @@
 }
 ._efont-bold {
   --tw-font-weight: var(--font-weight-bold) !important;
-  font-weight: 700 !important;
   font-weight: var(--font-weight-bold) !important;
 }
-.font-semibold {
-  --tw-font-weight: var(--font-weight-semibold);
-  font-weight: 600;
-  font-weight: var(--font-weight-semibold);
-}
 ._etext-_b_h990000_B {
-  color: #900 !important;
+  color: #990000 !important;
 }
 .text-_b_h5cdc34_B {
   color: #5cdc34;
@@ -344,8 +199,193 @@
   color: #bada55;
 }
 .text-_b_hdddddd_B {
-  color: #ddd;
+  color: #dddddd;
 }
+.text-_bcolor_cvar_p--my-var_P_B {
+  color: var(--my-var);
+}
+.text-_bvar_p--my-var_P_B {
+  color: var(--my-var);
+}
+.shadow-_b0px_2px_11px_0px__h00000a_B {
+  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, #00000a);
+  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
+}
+.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
+  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
+  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
+}
+.before_ccontent-_b_aFestivus_a_B::before {
+  --tw-content: 'Festivus';
+  content: var(--tw-content);
+}
+.after_cborder-none::after {
+  content: var(--tw-content);
+  --tw-border-style: none;
+  border-style: none;
+}
+.active_cbg-_b_h543210_B:active {
+  background-color: #543210;
+}
+.active_cbg-_b_h989898_B:active {
+  background-color: #989898;
+}
+@media (min-width: 96rem) {
+  ._2xl_ctext-base {
+    font-size: var(--text-base);
+    line-height: var(--tw-leading, var(--text-base--line-height));
+  }
+}
+@media (min-width: 96rem) {
+  ._2xl_ctext-_bred_B {
+    color: red;
+  }
+}
+@media (prefers-color-scheme: dark) {
+  .dark_cbg-green-500 {
+    background-color: var(--color-green-500);
+  }
+}
+@media (prefers-color-scheme: dark) {
+  .dark_cbg-zinc-800 {
+    background-color: var(--color-zinc-800);
+  }
+}
+@media (prefers-color-scheme: dark) {
+  .dark_ctext-yellow-400 {
+    color: var(--color-yellow-400);
+  }
+}
+.-mt-2 {
+  margin-top: -16rpx;
+  margin-top: calc(var(--spacing) * -2);
+}
+.flex {
+  display: -webkit-flex;
+  display: flex;
+}
+.grid {
+  display: grid;
+}
+.h-2 {
+  height: 16rpx;
+  height: calc(var(--spacing) * 2);
+}
+.h-3 {
+  height: 24rpx;
+  height: calc(var(--spacing) * 3);
+}
+.h-5 {
+  height: 40rpx;
+  height: calc(var(--spacing) * 5);
+}
+.h-10 {
+  height: 80rpx;
+  height: calc(var(--spacing) * 10);
+}
+.h-screen {
+  height: 100vh;
+}
+.w-2 {
+  width: 16rpx;
+  width: calc(var(--spacing) * 2);
+}
+.w-5 {
+  width: 40rpx;
+  width: calc(var(--spacing) * 5);
+}
+.w-10 {
+  width: 80rpx;
+  width: calc(var(--spacing) * 10);
+}
+.w-32 {
+  width: 256rpx;
+  width: calc(var(--spacing) * 32);
+}
+.w-screen {
+  width: 100vw;
+}
+.grid-cols-3 {
+  grid-template-columns: repeat(3, minmax(0, 1fr));
+}
+.flex-col {
+  -webkit-flex-direction: column;
+  flex-direction: column;
+}
+.items-center {
+  -webkit-align-items: center;
+  align-items: center;
+}
+.justify-center {
+  -webkit-justify-content: center;
+  justify-content: center;
+}
+.space-y-4 > view + view,
+.space-y-4 > view + text,
+.space-y-4 > text + view,
+.space-y-4 > text + text {
+  --tw-space-y-reverse: 0;
+  margin-top: 32rpx;
+  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
+  margin-bottom: 0rpx;
+  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
+}
+.divide-solid > view + view,
+.divide-solid > view + text,
+.divide-solid > text + view,
+.divide-solid > text + text {
+  --tw-border-style: solid;
+  border-style: solid;
+}
+.rounded-md {
+  border-radius: 12rpx;
+  border-radius: var(--radius-md);
+}
+.border {
+  border-style: var(--tw-border-style);
+  border-width: 1px;
+}
+.border-solid {
+  --tw-border-style: solid;
+  border-style: solid;
+}
+.bg-gray-100 {
+  background-color: rgb(243, 244, 246);
+  background-color: var(--color-gray-100);
+}
+.bg-pink-500 {
+  background-color: rgb(246, 51, 154);
+  background-color: var(--color-pink-500);
+}
+.bg-red-400 {
+  background-color: rgb(255, 101, 104);
+  background-color: var(--color-red-400);
+}
+.bg-red-500 {
+  background-color: rgb(251, 44, 54);
+  background-color: var(--color-red-500);
+}
+.bg-sky-500 {
+  background-color: rgb(0, 165, 234);
+  background-color: var(--color-sky-500);
+}
+.py-2 {
+  padding-top: 16rpx;
+  padding-bottom: 16rpx;
+  padding-top: calc(var(--spacing) * 2);
+  padding-bottom: calc(var(--spacing) * 2);
+}
+.text-2xl {
+  font-size: 48rpx;
+  font-size: var(--text-2xl);
+  line-height: 1.33333;
+  line-height: var(--tw-leading, var(--text-2xl--line-height));
+}
+.font-semibold {
+  --tw-font-weight: var(--font-weight-semibold);
+  font-weight: 600;
+  font-weight: var(--font-weight-semibold);
+}
 .text-_bcolor_cvar_p--my-var_P_B,
 .text-_bvar_p--my-var_P_B {
   color: var(--my-var);
@@ -369,16 +409,10 @@
 .opacity-50 {
   opacity: 0.5;
 }
-.shadow-_b0px_2px_11px_0px__h00000a_B {
-  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, #00000a);
-}
 .shadow-_b0px_2px_11px_0px__h00000a_B,
 .shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
   box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
 }
-.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
-  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
-}
 .ring-4 {
   --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
   box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
@@ -396,12 +430,6 @@
   border-style: none;
   content: var(--tw-content);
 }
-.active_cbg-_b_h543210_B:active {
-  background-color: #543210;
-}
-.active_cbg-_b_h989898_B:active {
-  background-color: #989898;
-}
 @media (min-width: 96rem) {
   ._2xl_ctext-base {
     font-size: 32rpx;
@@ -437,6 +465,15 @@
 text,
 :after,
 :before {
+  border: 0 solid;
+  box-sizing: border-box;
+  margin: 0;
+  padding: 0;
+}
+:host,
+page,
+.tw-root,
+wx-root-portal-content {
   --tw-space-y-reverse: 0;
   --tw-divide-x-reverse: 0;
   --tw-border-style: solid;
@@ -457,119 +494,52 @@
   --tw-ring-offset-color: #fff;
   --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
   --tw-content: '';
-  box-sizing: border-box;
-  border-width: 0;
-  border-style: solid;
-  border-color: currentColor;
-}
-:host,
-page,
-.tw-root,
-wx-root-portal-content {
-  --color-red-400: rgb(255, 101, 104);
-  --color-red-500: rgb(251, 44, 54);
   --color-yellow-400: rgb(247, 201, 0);
   --color-green-500: rgb(0, 198, 90);
-  --color-sky-500: rgb(0, 165, 234);
   --color-blue-500: rgb(50, 128, 255);
+  --color-zinc-800: rgb(39, 39, 42);
+  --text-base: 32rpx;
+  --text-base--line-height: 1.5;
+  --font-weight-bold: 700;
+  --color-red-400: rgb(255, 101, 104);
+  --color-red-500: rgb(251, 44, 54);
+  --color-sky-500: rgb(0, 165, 234);
   --color-purple-600: rgb(152, 16, 250);
   --color-pink-300: rgb(253, 165, 213);
   --color-pink-500: rgb(246, 51, 154);
   --color-gray-100: rgb(243, 244, 246);
-  --color-zinc-800: rgb(39, 39, 42);
   --color-black: #000;
   --color-white: #fff;
   --spacing: 8rpx;
-  --text-base: 32rpx;
-  --text-base--line-height: 1.5;
   --text-2xl: 48rpx;
   --text-2xl--line-height: 1.33333;
   --font-weight-semibold: 600;
-  --font-weight-bold: 700;
   --radius-md: 12rpx;
 }
-view,
-text,
-:after,
-:before {
-  border: 0 solid;
-  box-sizing: border-box;
-  margin: 0;
-  padding: 0;
-}
 .-m-_b20px_B {
   margin: -20px;
 }
-.-mt-2 {
-  margin-top: -16rpx;
-  margin-top: calc(var(--spacing) * -2);
-}
 .mb-_b-20px_B {
   margin-bottom: -20px;
 }
-.flex {
-  display: -webkit-flex;
-  display: flex;
-}
-.grid {
-  display: grid;
-}
-.h-2 {
-  height: 16rpx;
-  height: calc(var(--spacing) * 2);
-}
-.h-3 {
-  height: 24rpx;
-  height: calc(var(--spacing) * 3);
-}
-.h-5 {
-  height: 40rpx;
-  height: calc(var(--spacing) * 5);
-}
-.h-10 {
-  height: 80rpx;
-  height: calc(var(--spacing) * 10);
-}
 .h-_b20px_B {
   height: 20px;
 }
 .h-_b200_v_B {
   height: 200%;
 }
-.h-screen {
-  height: 100vh;
-}
 .max-h-_b100px_B {
   max-height: 100px;
 }
 .min-h-_b100px_B {
   min-height: 100px;
 }
-.w-2 {
-  width: 16rpx;
-  width: calc(var(--spacing) * 2);
-}
-.w-5 {
-  width: 40rpx;
-  width: calc(var(--spacing) * 5);
-}
-.w-10 {
-  width: 80rpx;
-  width: calc(var(--spacing) * 10);
-}
-.w-32 {
-  width: 256rpx;
-  width: calc(var(--spacing) * 32);
-}
 .w-_b20px_B {
   width: 20px;
 }
 .w-_b300rpx_B {
   width: 300rpx;
 }
-.w-screen {
-  width: 100vw;
-}
 .max-w-_b300rpx_B {
   max-width: 300rpx;
 }
@@ -579,74 +549,30 @@
 .rotate-_b10deg_B {
   rotate: 10deg;
 }
-.grid-cols-3 {
-  grid-template-columns: repeat(3, minmax(0, 1fr));
-}
-.flex-col {
-  -webkit-flex-direction: column;
-  flex-direction: column;
-}
-.items-center {
-  -webkit-align-items: center;
-  align-items: center;
-}
-.justify-center {
-  -webkit-justify-content: center;
-  justify-content: center;
-}
-.space-y-4 > view + view,
-.space-y-4 > view + text,
-.space-y-4 > text + view,
-.space-y-4 > text + text {
-  --tw-space-y-reverse: 0;
-  margin-top: 32rpx;
-  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
-  margin-bottom: 0rpx;
-  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
-}
 .space-y-_b1_d6rem_B > view + view,
 .space-y-_b1_d6rem_B > view + text,
 .space-y-_b1_d6rem_B > text + view,
 .space-y-_b1_d6rem_B > text + text {
   --tw-space-y-reverse: 0;
-  margin-top: 51.2rpx;
-  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
-  margin-bottom: 0rpx;
   margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
+  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
 }
 .divide-x-_b10px_B > view + view,
 .divide-x-_b10px_B > view + text,
 .divide-x-_b10px_B > text + view,
 .divide-x-_b10px_B > text + text {
   --tw-divide-x-reverse: 0;
-  border-left-width: 10px;
-  border-left-width: calc(10px * (1 - var(--tw-divide-x-reverse)));
-  border-right-width: 0px;
-  border-right-width: calc(10px * var(--tw-divide-x-reverse));
   border-left-style: var(--tw-border-style);
   border-right-style: var(--tw-border-style);
+  border-right-width: calc(10px * var(--tw-divide-x-reverse));
+  border-left-width: calc(10px * (1 - var(--tw-divide-x-reverse)));
 }
-.divide-solid > view + view,
-.divide-solid > view + text,
-.divide-solid > text + view,
-.divide-solid > text + text {
-  --tw-border-style: solid;
-  border-style: solid;
-}
 .divide-_b_h010101_B > view + view,
 .divide-_b_h010101_B > view + text,
 .divide-_b_h010101_B > text + view,
 .divide-_b_h010101_B > text + text {
   border-color: #010101;
 }
-.rounded-md {
-  border-radius: 12rpx;
-  border-radius: var(--radius-md);
-}
-.border {
-  border-style: var(--tw-border-style);
-  border-width: 1px;
-}
 .border-_b10px_B {
   border-style: var(--tw-border-style);
   border-width: 10px;
@@ -663,10 +589,6 @@
   border-bottom-style: var(--tw-border-style);
   border-bottom-width: 4rpx;
 }
-.border-solid {
-  --tw-border-style: solid;
-  border-style: solid;
-}
 .border-_b_h098765_B {
   border-color: #098765;
 }
@@ -674,7 +596,6 @@
   border-color: red;
 }
 ._ebg-green-500 {
-  background-color: rgb(0, 198, 90) !important;
   background-color: var(--color-green-500) !important;
 }
 .bg-_b_h010101_B {
@@ -690,28 +611,8 @@
   background-color: #e90505;
 }
 .bg-blue-500_f50 {
-  background-color: rgba(48, 128, 255, 0.50196);
+  background-color: rgba(50, 128, 255, 0.5);
 }
-.bg-gray-100 {
-  background-color: rgb(243, 244, 246);
-  background-color: var(--color-gray-100);
-}
-.bg-pink-500 {
-  background-color: rgb(246, 51, 154);
-  background-color: var(--color-pink-500);
-}
-.bg-red-400 {
-  background-color: rgb(255, 101, 104);
-  background-color: var(--color-red-400);
-}
-.bg-red-500 {
-  background-color: rgb(251, 44, 54);
-  background-color: var(--color-red-500);
-}
-.bg-sky-500 {
-  background-color: rgb(0, 165, 234);
-  background-color: var(--color-sky-500);
-}
 .p-_b20px_B {
   padding: 20px;
 }
@@ -719,18 +620,6 @@
   padding-left: 34.54rpx;
   padding-right: 34.54rpx;
 }
-.py-2 {
-  padding-top: 16rpx;
-  padding-bottom: 16rpx;
-  padding-top: calc(var(--spacing) * 2);
-  padding-bottom: calc(var(--spacing) * 2);
-}
-.text-2xl {
-  font-size: 48rpx;
-  font-size: var(--text-2xl);
-  line-height: 1.33333;
-  line-height: var(--tw-leading, var(--text-2xl--line-height));
-}
 .text-_b20px_B {
   font-size: 20px;
 }
@@ -755,16 +644,10 @@
 }
 ._efont-bold {
   --tw-font-weight: var(--font-weight-bold) !important;
-  font-weight: 700 !important;
   font-weight: var(--font-weight-bold) !important;
 }
-.font-semibold {
-  --tw-font-weight: var(--font-weight-semibold);
-  font-weight: 600;
-  font-weight: var(--font-weight-semibold);
-}
 ._etext-_b_h990000_B {
-  color: #900 !important;
+  color: #990000 !important;
 }
 .text-_b_h5cdc34_B {
   color: #5cdc34;
@@ -773,8 +656,193 @@
   color: #bada55;
 }
 .text-_b_hdddddd_B {
-  color: #ddd;
+  color: #dddddd;
 }
+.text-_bcolor_cvar_p--my-var_P_B {
+  color: var(--my-var);
+}
+.text-_bvar_p--my-var_P_B {
+  color: var(--my-var);
+}
+.shadow-_b0px_2px_11px_0px__h00000a_B {
+  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, #00000a);
+  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
+}
+.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
+  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
+  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
+}
+.before_ccontent-_b_aFestivus_a_B::before {
+  --tw-content: 'Festivus';
+  content: var(--tw-content);
+}
+.after_cborder-none::after {
+  content: var(--tw-content);
+  --tw-border-style: none;
+  border-style: none;
+}
+.active_cbg-_b_h543210_B:active {
+  background-color: #543210;
+}
+.active_cbg-_b_h989898_B:active {
+  background-color: #989898;
+}
+@media (min-width: 96rem) {
+  ._2xl_ctext-base {
+    font-size: var(--text-base);
+    line-height: var(--tw-leading, var(--text-base--line-height));
+  }
+}
+@media (min-width: 96rem) {
+  ._2xl_ctext-_bred_B {
+    color: red;
+  }
+}
+@media (prefers-color-scheme: dark) {
+  .dark_cbg-green-500 {
+    background-color: var(--color-green-500);
+  }
+}
+@media (prefers-color-scheme: dark) {
+  .dark_cbg-zinc-800 {
+    background-color: var(--color-zinc-800);
+  }
+}
+@media (prefers-color-scheme: dark) {
+  .dark_ctext-yellow-400 {
+    color: var(--color-yellow-400);
+  }
+}
+.-mt-2 {
+  margin-top: -16rpx;
+  margin-top: calc(var(--spacing) * -2);
+}
+.flex {
+  display: -webkit-flex;
+  display: flex;
+}
+.grid {
+  display: grid;
+}
+.h-2 {
+  height: 16rpx;
+  height: calc(var(--spacing) * 2);
+}
+.h-3 {
+  height: 24rpx;
+  height: calc(var(--spacing) * 3);
+}
+.h-5 {
+  height: 40rpx;
+  height: calc(var(--spacing) * 5);
+}
+.h-10 {
+  height: 80rpx;
+  height: calc(var(--spacing) * 10);
+}
+.h-screen {
+  height: 100vh;
+}
+.w-2 {
+  width: 16rpx;
+  width: calc(var(--spacing) * 2);
+}
+.w-5 {
+  width: 40rpx;
+  width: calc(var(--spacing) * 5);
+}
+.w-10 {
+  width: 80rpx;
+  width: calc(var(--spacing) * 10);
+}
+.w-32 {
+  width: 256rpx;
+  width: calc(var(--spacing) * 32);
+}
+.w-screen {
+  width: 100vw;
+}
+.grid-cols-3 {
+  grid-template-columns: repeat(3, minmax(0, 1fr));
+}
+.flex-col {
+  -webkit-flex-direction: column;
+  flex-direction: column;
+}
+.items-center {
+  -webkit-align-items: center;
+  align-items: center;
+}
+.justify-center {
+  -webkit-justify-content: center;
+  justify-content: center;
+}
+.space-y-4 > view + view,
+.space-y-4 > view + text,
+.space-y-4 > text + view,
+.space-y-4 > text + text {
+  --tw-space-y-reverse: 0;
+  margin-top: 32rpx;
+  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
+  margin-bottom: 0rpx;
+  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
+}
+.divide-solid > view + view,
+.divide-solid > view + text,
+.divide-solid > text + view,
+.divide-solid > text + text {
+  --tw-border-style: solid;
+  border-style: solid;
+}
+.rounded-md {
+  border-radius: 12rpx;
+  border-radius: var(--radius-md);
+}
+.border {
+  border-style: var(--tw-border-style);
+  border-width: 1px;
+}
+.border-solid {
+  --tw-border-style: solid;
+  border-style: solid;
+}
+.bg-gray-100 {
+  background-color: rgb(243, 244, 246);
+  background-color: var(--color-gray-100);
+}
+.bg-pink-500 {
+  background-color: rgb(246, 51, 154);
+  background-color: var(--color-pink-500);
+}
+.bg-red-400 {
+  background-color: rgb(255, 101, 104);
+  background-color: var(--color-red-400);
+}
+.bg-red-500 {
+  background-color: rgb(251, 44, 54);
+  background-color: var(--color-red-500);
+}
+.bg-sky-500 {
+  background-color: rgb(0, 165, 234);
+  background-color: var(--color-sky-500);
+}
+.py-2 {
+  padding-top: 16rpx;
+  padding-bottom: 16rpx;
+  padding-top: calc(var(--spacing) * 2);
+  padding-bottom: calc(var(--spacing) * 2);
+}
+.text-2xl {
+  font-size: 48rpx;
+  font-size: var(--text-2xl);
+  line-height: 1.33333;
+  line-height: var(--tw-leading, var(--text-2xl--line-height));
+}
+.font-semibold {
+  --tw-font-weight: var(--font-weight-semibold);
+  font-weight: 600;
+  font-weight: var(--font-weight-semibold);
+}
 .text-_bcolor_cvar_p--my-var_P_B,
 .text-_bvar_p--my-var_P_B {
   color: var(--my-var);
@@ -798,16 +866,10 @@
 .opacity-50 {
   opacity: 0.5;
 }
-.shadow-_b0px_2px_11px_0px__h00000a_B {
-  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, #00000a);
-}
 .shadow-_b0px_2px_11px_0px__h00000a_B,
 .shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
   box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
 }
-.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
-  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
-}
 .ring-4 {
   --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
   box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
@@ -825,12 +887,6 @@
   border-style: none;
   content: var(--tw-content);
 }
-.active_cbg-_b_h543210_B:active {
-  background-color: #543210;
-}
-.active_cbg-_b_h989898_B:active {
-  background-color: #989898;
-}
 @media (min-width: 96rem) {
   ._2xl_ctext-base {
     font-size: 32rpx;
```

## Legacy CSS

```css
@import './styles/app.wxss';

::before,
::after {
  --tw-content: '';
}
view,
text,
:after,
:before {
  --tw-space-y-reverse: 0;
  --tw-divide-x-reverse: 0;
  --tw-border-style: solid;
  --tw-leading: initial;
  --tw-font-weight: initial;
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-color: initial;
  --tw-shadow-alpha: 100%;
  --tw-inset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-inset-shadow-color: initial;
  --tw-inset-shadow-alpha: 100%;
  --tw-ring-color: initial;
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-inset-ring-color: initial;
  --tw-inset-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-inset: initial;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-content: '';
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-red-400: rgb(255, 101, 104);
  --color-red-500: rgb(251, 44, 54);
  --color-yellow-400: rgb(247, 201, 0);
  --color-green-500: rgb(0, 198, 90);
  --color-sky-500: rgb(0, 165, 234);
  --color-blue-500: rgb(50, 128, 255);
  --color-purple-600: rgb(152, 16, 250);
  --color-pink-300: rgb(253, 165, 213);
  --color-pink-500: rgb(246, 51, 154);
  --color-gray-100: rgb(243, 244, 246);
  --color-zinc-800: rgb(39, 39, 42);
  --color-black: #000;
  --color-white: #fff;
  --spacing: 8rpx;
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --text-2xl: 48rpx;
  --text-2xl--line-height: 1.33333;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --radius-md: 12rpx;
}
view,
text,
:after,
:before {
  border: 0 solid;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.-m-_b20px_B {
  margin: -20px;
}
.-mt-2 {
  margin-top: -16rpx;
  margin-top: calc(var(--spacing) * -2);
}
.mb-_b-20px_B {
  margin-bottom: -20px;
}
.flex {
  display: -webkit-flex;
  display: flex;
}
.grid {
  display: grid;
}
.h-2 {
  height: 16rpx;
  height: calc(var(--spacing) * 2);
}
.h-3 {
  height: 24rpx;
  height: calc(var(--spacing) * 3);
}
.h-5 {
  height: 40rpx;
  height: calc(var(--spacing) * 5);
}
.h-10 {
  height: 80rpx;
  height: calc(var(--spacing) * 10);
}
.h-_b20px_B {
  height: 20px;
}
.h-_b200_v_B {
  height: 200%;
}
.h-screen {
  height: 100vh;
}
.max-h-_b100px_B {
  max-height: 100px;
}
.min-h-_b100px_B {
  min-height: 100px;
}
.w-2 {
  width: 16rpx;
  width: calc(var(--spacing) * 2);
}
.w-5 {
  width: 40rpx;
  width: calc(var(--spacing) * 5);
}
.w-10 {
  width: 80rpx;
  width: calc(var(--spacing) * 10);
}
.w-32 {
  width: 256rpx;
  width: calc(var(--spacing) * 32);
}
.w-_b20px_B {
  width: 20px;
}
.w-_b300rpx_B {
  width: 300rpx;
}
.w-screen {
  width: 100vw;
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
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.flex-col {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.items-center {
  -webkit-align-items: center;
  align-items: center;
}
.justify-center {
  -webkit-justify-content: center;
  justify-content: center;
}
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-top: 32rpx;
  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
  margin-bottom: 0rpx;
  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
}
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: 51.2rpx;
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: 0rpx;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
}
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-left-width: 10px;
  border-left-width: calc(10px * (1 - var(--tw-divide-x-reverse)));
  border-right-width: 0px;
  border-right-width: calc(10px * var(--tw-divide-x-reverse));
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
}
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  --tw-border-style: solid;
  border-style: solid;
}
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  border-color: #010101;
}
.rounded-md {
  border-radius: 12rpx;
  border-radius: var(--radius-md);
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-_b10px_B {
  border-style: var(--tw-border-style);
  border-width: 10px;
}
.border-_b10rpx_B {
  border-style: var(--tw-border-style);
  border-width: 10rpx;
}
.border-t-_b4px_B {
  border-top-style: var(--tw-border-style);
  border-top-width: 4px;
}
.border-b-_b4rpx_B {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 4rpx;
}
.border-solid {
  --tw-border-style: solid;
  border-style: solid;
}
.border-_b_h098765_B {
  border-color: #098765;
}
.border-_bred_B {
  border-color: red;
}
._ebg-green-500 {
  background-color: rgb(0, 198, 90) !important;
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
  background-color: rgba(48, 128, 255, 0.50196);
}
.bg-gray-100 {
  background-color: rgb(243, 244, 246);
  background-color: var(--color-gray-100);
}
.bg-pink-500 {
  background-color: rgb(246, 51, 154);
  background-color: var(--color-pink-500);
}
.bg-red-400 {
  background-color: rgb(255, 101, 104);
  background-color: var(--color-red-400);
}
.bg-red-500 {
  background-color: rgb(251, 44, 54);
  background-color: var(--color-red-500);
}
.bg-sky-500 {
  background-color: rgb(0, 165, 234);
  background-color: var(--color-sky-500);
}
.p-_b20px_B {
  padding: 20px;
}
.px-_b34_d54rpx_B {
  padding-left: 34.54rpx;
  padding-right: 34.54rpx;
}
.py-2 {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.text-2xl {
  font-size: 48rpx;
  font-size: var(--text-2xl);
  line-height: 1.33333;
  line-height: var(--tw-leading, var(--text-2xl--line-height));
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
  font-weight: 700 !important;
  font-weight: var(--font-weight-bold) !important;
}
.font-semibold {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: 600;
  font-weight: var(--font-weight-semibold);
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
.text-black {
  color: #000;
  color: var(--color-black);
}
.text-purple-600 {
  color: rgb(152, 16, 250);
  color: var(--color-purple-600);
}
.text-white {
  color: #fff;
  color: var(--color-white);
}
.underline {
  -webkit-text-decoration-line: underline;
  text-decoration-line: underline;
}
.opacity-50 {
  opacity: 0.5;
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
.ring-4 {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring-pink-300 {
  --tw-ring-color: var(--color-pink-300);
}
.before_ccontent-_b_aFestivus_a_B:before {
  --tw-content: 'Festivus';
  content: 'Festivus';
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
    font-size: 32rpx;
    font-size: var(--text-base);
    line-height: 1.5;
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: rgb(0, 198, 90);
    background-color: var(--color-green-500);
  }
  .dark_cbg-zinc-800 {
    background-color: rgb(39, 39, 42);
    background-color: var(--color-zinc-800);
  }
  .dark_ctext-yellow-400 {
    color: rgb(247, 201, 0);
    color: var(--color-yellow-400);
  }
}


::before,
::after {
  --tw-content: '';
}
view,
text,
:after,
:before {
  --tw-space-y-reverse: 0;
  --tw-divide-x-reverse: 0;
  --tw-border-style: solid;
  --tw-leading: initial;
  --tw-font-weight: initial;
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-color: initial;
  --tw-shadow-alpha: 100%;
  --tw-inset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-inset-shadow-color: initial;
  --tw-inset-shadow-alpha: 100%;
  --tw-ring-color: initial;
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-inset-ring-color: initial;
  --tw-inset-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-inset: initial;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-content: '';
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-red-400: rgb(255, 101, 104);
  --color-red-500: rgb(251, 44, 54);
  --color-yellow-400: rgb(247, 201, 0);
  --color-green-500: rgb(0, 198, 90);
  --color-sky-500: rgb(0, 165, 234);
  --color-blue-500: rgb(50, 128, 255);
  --color-purple-600: rgb(152, 16, 250);
  --color-pink-300: rgb(253, 165, 213);
  --color-pink-500: rgb(246, 51, 154);
  --color-gray-100: rgb(243, 244, 246);
  --color-zinc-800: rgb(39, 39, 42);
  --color-black: #000;
  --color-white: #fff;
  --spacing: 8rpx;
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --text-2xl: 48rpx;
  --text-2xl--line-height: 1.33333;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --radius-md: 12rpx;
}
view,
text,
:after,
:before {
  border: 0 solid;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.-m-_b20px_B {
  margin: -20px;
}
.-mt-2 {
  margin-top: -16rpx;
  margin-top: calc(var(--spacing) * -2);
}
.mb-_b-20px_B {
  margin-bottom: -20px;
}
.flex {
  display: -webkit-flex;
  display: flex;
}
.grid {
  display: grid;
}
.h-2 {
  height: 16rpx;
  height: calc(var(--spacing) * 2);
}
.h-3 {
  height: 24rpx;
  height: calc(var(--spacing) * 3);
}
.h-5 {
  height: 40rpx;
  height: calc(var(--spacing) * 5);
}
.h-10 {
  height: 80rpx;
  height: calc(var(--spacing) * 10);
}
.h-_b20px_B {
  height: 20px;
}
.h-_b200_v_B {
  height: 200%;
}
.h-screen {
  height: 100vh;
}
.max-h-_b100px_B {
  max-height: 100px;
}
.min-h-_b100px_B {
  min-height: 100px;
}
.w-2 {
  width: 16rpx;
  width: calc(var(--spacing) * 2);
}
.w-5 {
  width: 40rpx;
  width: calc(var(--spacing) * 5);
}
.w-10 {
  width: 80rpx;
  width: calc(var(--spacing) * 10);
}
.w-32 {
  width: 256rpx;
  width: calc(var(--spacing) * 32);
}
.w-_b20px_B {
  width: 20px;
}
.w-_b300rpx_B {
  width: 300rpx;
}
.w-screen {
  width: 100vw;
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
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.flex-col {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.items-center {
  -webkit-align-items: center;
  align-items: center;
}
.justify-center {
  -webkit-justify-content: center;
  justify-content: center;
}
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-top: 32rpx;
  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
  margin-bottom: 0rpx;
  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
}
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-top: 51.2rpx;
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
  margin-bottom: 0rpx;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
}
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-left-width: 10px;
  border-left-width: calc(10px * (1 - var(--tw-divide-x-reverse)));
  border-right-width: 0px;
  border-right-width: calc(10px * var(--tw-divide-x-reverse));
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
}
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  --tw-border-style: solid;
  border-style: solid;
}
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  border-color: #010101;
}
.rounded-md {
  border-radius: 12rpx;
  border-radius: var(--radius-md);
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-_b10px_B {
  border-style: var(--tw-border-style);
  border-width: 10px;
}
.border-_b10rpx_B {
  border-style: var(--tw-border-style);
  border-width: 10rpx;
}
.border-t-_b4px_B {
  border-top-style: var(--tw-border-style);
  border-top-width: 4px;
}
.border-b-_b4rpx_B {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 4rpx;
}
.border-solid {
  --tw-border-style: solid;
  border-style: solid;
}
.border-_b_h098765_B {
  border-color: #098765;
}
.border-_bred_B {
  border-color: red;
}
._ebg-green-500 {
  background-color: rgb(0, 198, 90) !important;
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
  background-color: rgba(48, 128, 255, 0.50196);
}
.bg-gray-100 {
  background-color: rgb(243, 244, 246);
  background-color: var(--color-gray-100);
}
.bg-pink-500 {
  background-color: rgb(246, 51, 154);
  background-color: var(--color-pink-500);
}
.bg-red-400 {
  background-color: rgb(255, 101, 104);
  background-color: var(--color-red-400);
}
.bg-red-500 {
  background-color: rgb(251, 44, 54);
  background-color: var(--color-red-500);
}
.bg-sky-500 {
  background-color: rgb(0, 165, 234);
  background-color: var(--color-sky-500);
}
.p-_b20px_B {
  padding: 20px;
}
.px-_b34_d54rpx_B {
  padding-left: 34.54rpx;
  padding-right: 34.54rpx;
}
.py-2 {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.text-2xl {
  font-size: 48rpx;
  font-size: var(--text-2xl);
  line-height: 1.33333;
  line-height: var(--tw-leading, var(--text-2xl--line-height));
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
  font-weight: 700 !important;
  font-weight: var(--font-weight-bold) !important;
}
.font-semibold {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: 600;
  font-weight: var(--font-weight-semibold);
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
.text-black {
  color: #000;
  color: var(--color-black);
}
.text-purple-600 {
  color: rgb(152, 16, 250);
  color: var(--color-purple-600);
}
.text-white {
  color: #fff;
  color: var(--color-white);
}
.underline {
  -webkit-text-decoration-line: underline;
  text-decoration-line: underline;
}
.opacity-50 {
  opacity: 0.5;
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
.ring-4 {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring-pink-300 {
  --tw-ring-color: var(--color-pink-300);
}
.before_ccontent-_b_aFestivus_a_B:before {
  --tw-content: 'Festivus';
  content: 'Festivus';
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
    font-size: 32rpx;
    font-size: var(--text-base);
    line-height: 1.5;
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: rgb(0, 198, 90);
    background-color: var(--color-green-500);
  }
  .dark_cbg-zinc-800 {
    background-color: rgb(39, 39, 42);
    background-color: var(--color-zinc-800);
  }
  .dark_ctext-yellow-400 {
    color: rgb(247, 201, 0);
    color: var(--color-yellow-400);
  }
}
```

## Generator CSS

```css
@import './styles/app.wxss';

::before,
::after {
  --tw-content: '';
}
view,
text,
:after,
:before {
  border: 0 solid;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --tw-space-y-reverse: 0;
  --tw-divide-x-reverse: 0;
  --tw-border-style: solid;
  --tw-leading: initial;
  --tw-font-weight: initial;
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-color: initial;
  --tw-shadow-alpha: 100%;
  --tw-inset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-inset-shadow-color: initial;
  --tw-inset-shadow-alpha: 100%;
  --tw-ring-color: initial;
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-inset-ring-color: initial;
  --tw-inset-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-inset: initial;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-content: '';
  --color-yellow-400: rgb(247, 201, 0);
  --color-green-500: rgb(0, 198, 90);
  --color-blue-500: rgb(50, 128, 255);
  --color-zinc-800: rgb(39, 39, 42);
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --font-weight-bold: 700;
  --color-red-400: rgb(255, 101, 104);
  --color-red-500: rgb(251, 44, 54);
  --color-sky-500: rgb(0, 165, 234);
  --color-purple-600: rgb(152, 16, 250);
  --color-pink-300: rgb(253, 165, 213);
  --color-pink-500: rgb(246, 51, 154);
  --color-gray-100: rgb(243, 244, 246);
  --color-black: #000;
  --color-white: #fff;
  --spacing: 8rpx;
  --text-2xl: 48rpx;
  --text-2xl--line-height: 1.33333;
  --font-weight-semibold: 600;
  --radius-md: 12rpx;
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
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
}
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(10px * var(--tw-divide-x-reverse));
  border-left-width: calc(10px * (1 - var(--tw-divide-x-reverse)));
}
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  border-color: #010101;
}
.border-_b10px_B {
  border-style: var(--tw-border-style);
  border-width: 10px;
}
.border-_b10rpx_B {
  border-style: var(--tw-border-style);
  border-width: 10rpx;
}
.border-t-_b4px_B {
  border-top-style: var(--tw-border-style);
  border-top-width: 4px;
}
.border-b-_b4rpx_B {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 4rpx;
}
.border-_b_h098765_B {
  border-color: #098765;
}
.border-_bred_B {
  border-color: red;
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
  background-color: rgba(50, 128, 255, 0.5);
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
  color: #990000 !important;
}
.text-_b_h5cdc34_B {
  color: #5cdc34;
}
.text-_b_hbada55_B {
  color: #bada55;
}
.text-_b_hdddddd_B {
  color: #dddddd;
}
.text-_bcolor_cvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, #00000a);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.before_ccontent-_b_aFestivus_a_B::before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
.after_cborder-none::after {
  content: var(--tw-content);
  --tw-border-style: none;
  border-style: none;
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
}
@media (min-width: 96rem) {
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: var(--color-green-500);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-800 {
    background-color: var(--color-zinc-800);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-yellow-400 {
    color: var(--color-yellow-400);
  }
}
.-mt-2 {
  margin-top: -16rpx;
  margin-top: calc(var(--spacing) * -2);
}
.flex {
  display: -webkit-flex;
  display: flex;
}
.grid {
  display: grid;
}
.h-2 {
  height: 16rpx;
  height: calc(var(--spacing) * 2);
}
.h-3 {
  height: 24rpx;
  height: calc(var(--spacing) * 3);
}
.h-5 {
  height: 40rpx;
  height: calc(var(--spacing) * 5);
}
.h-10 {
  height: 80rpx;
  height: calc(var(--spacing) * 10);
}
.h-screen {
  height: 100vh;
}
.w-2 {
  width: 16rpx;
  width: calc(var(--spacing) * 2);
}
.w-5 {
  width: 40rpx;
  width: calc(var(--spacing) * 5);
}
.w-10 {
  width: 80rpx;
  width: calc(var(--spacing) * 10);
}
.w-32 {
  width: 256rpx;
  width: calc(var(--spacing) * 32);
}
.w-screen {
  width: 100vw;
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.flex-col {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.items-center {
  -webkit-align-items: center;
  align-items: center;
}
.justify-center {
  -webkit-justify-content: center;
  justify-content: center;
}
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-top: 32rpx;
  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
  margin-bottom: 0rpx;
  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
}
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  --tw-border-style: solid;
  border-style: solid;
}
.rounded-md {
  border-radius: 12rpx;
  border-radius: var(--radius-md);
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-solid {
  --tw-border-style: solid;
  border-style: solid;
}
.bg-gray-100 {
  background-color: rgb(243, 244, 246);
  background-color: var(--color-gray-100);
}
.bg-pink-500 {
  background-color: rgb(246, 51, 154);
  background-color: var(--color-pink-500);
}
.bg-red-400 {
  background-color: rgb(255, 101, 104);
  background-color: var(--color-red-400);
}
.bg-red-500 {
  background-color: rgb(251, 44, 54);
  background-color: var(--color-red-500);
}
.bg-sky-500 {
  background-color: rgb(0, 165, 234);
  background-color: var(--color-sky-500);
}
.py-2 {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.text-2xl {
  font-size: 48rpx;
  font-size: var(--text-2xl);
  line-height: 1.33333;
  line-height: var(--tw-leading, var(--text-2xl--line-height));
}
.font-semibold {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: 600;
  font-weight: var(--font-weight-semibold);
}
.text-_bcolor_cvar_p--my-var_P_B,
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-black {
  color: #000;
  color: var(--color-black);
}
.text-purple-600 {
  color: rgb(152, 16, 250);
  color: var(--color-purple-600);
}
.text-white {
  color: #fff;
  color: var(--color-white);
}
.underline {
  -webkit-text-decoration-line: underline;
  text-decoration-line: underline;
}
.opacity-50 {
  opacity: 0.5;
}
.shadow-_b0px_2px_11px_0px__h00000a_B,
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring-4 {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring-pink-300 {
  --tw-ring-color: var(--color-pink-300);
}
.before_ccontent-_b_aFestivus_a_B:before {
  --tw-content: 'Festivus';
  content: 'Festivus';
  content: var(--tw-content);
}
.after_cborder-none:after {
  --tw-border-style: none;
  border-style: none;
  content: var(--tw-content);
}
@media (min-width: 96rem) {
  ._2xl_ctext-base {
    font-size: 32rpx;
    font-size: var(--text-base);
    line-height: 1.5;
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: rgb(0, 198, 90);
    background-color: var(--color-green-500);
  }
  .dark_cbg-zinc-800 {
    background-color: rgb(39, 39, 42);
    background-color: var(--color-zinc-800);
  }
  .dark_ctext-yellow-400 {
    color: rgb(247, 201, 0);
    color: var(--color-yellow-400);
  }
}


::before,
::after {
  --tw-content: '';
}
view,
text,
:after,
:before {
  border: 0 solid;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --tw-space-y-reverse: 0;
  --tw-divide-x-reverse: 0;
  --tw-border-style: solid;
  --tw-leading: initial;
  --tw-font-weight: initial;
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-color: initial;
  --tw-shadow-alpha: 100%;
  --tw-inset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-inset-shadow-color: initial;
  --tw-inset-shadow-alpha: 100%;
  --tw-ring-color: initial;
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-inset-ring-color: initial;
  --tw-inset-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-inset: initial;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-content: '';
  --color-yellow-400: rgb(247, 201, 0);
  --color-green-500: rgb(0, 198, 90);
  --color-blue-500: rgb(50, 128, 255);
  --color-zinc-800: rgb(39, 39, 42);
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --font-weight-bold: 700;
  --color-red-400: rgb(255, 101, 104);
  --color-red-500: rgb(251, 44, 54);
  --color-sky-500: rgb(0, 165, 234);
  --color-purple-600: rgb(152, 16, 250);
  --color-pink-300: rgb(253, 165, 213);
  --color-pink-500: rgb(246, 51, 154);
  --color-gray-100: rgb(243, 244, 246);
  --color-black: #000;
  --color-white: #fff;
  --spacing: 8rpx;
  --text-2xl: 48rpx;
  --text-2xl--line-height: 1.33333;
  --font-weight-semibold: 600;
  --radius-md: 12rpx;
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
.space-y-_b1_d6rem_B > view + view,
.space-y-_b1_d6rem_B > view + text,
.space-y-_b1_d6rem_B > text + view,
.space-y-_b1_d6rem_B > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(51.2rpx * var(--tw-space-y-reverse));
  margin-top: calc(51.2rpx * (1 - var(--tw-space-y-reverse)));
}
.divide-x-_b10px_B > view + view,
.divide-x-_b10px_B > view + text,
.divide-x-_b10px_B > text + view,
.divide-x-_b10px_B > text + text {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(10px * var(--tw-divide-x-reverse));
  border-left-width: calc(10px * (1 - var(--tw-divide-x-reverse)));
}
.divide-_b_h010101_B > view + view,
.divide-_b_h010101_B > view + text,
.divide-_b_h010101_B > text + view,
.divide-_b_h010101_B > text + text {
  border-color: #010101;
}
.border-_b10px_B {
  border-style: var(--tw-border-style);
  border-width: 10px;
}
.border-_b10rpx_B {
  border-style: var(--tw-border-style);
  border-width: 10rpx;
}
.border-t-_b4px_B {
  border-top-style: var(--tw-border-style);
  border-top-width: 4px;
}
.border-b-_b4rpx_B {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 4rpx;
}
.border-_b_h098765_B {
  border-color: #098765;
}
.border-_bred_B {
  border-color: red;
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
  background-color: rgba(50, 128, 255, 0.5);
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
  color: #990000 !important;
}
.text-_b_h5cdc34_B {
  color: #5cdc34;
}
.text-_b_hbada55_B {
  color: #bada55;
}
.text-_b_hdddddd_B {
  color: #dddddd;
}
.text-_bcolor_cvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.shadow-_b0px_2px_11px_0px__h00000a_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, #00000a);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  --tw-shadow: 0px 2px 11px 0px var(--tw-shadow-color, rgba(0, 0, 0, 0.4));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.before_ccontent-_b_aFestivus_a_B::before {
  --tw-content: 'Festivus';
  content: var(--tw-content);
}
.after_cborder-none::after {
  content: var(--tw-content);
  --tw-border-style: none;
  border-style: none;
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
}
@media (min-width: 96rem) {
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: var(--color-green-500);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-800 {
    background-color: var(--color-zinc-800);
  }
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-yellow-400 {
    color: var(--color-yellow-400);
  }
}
.-mt-2 {
  margin-top: -16rpx;
  margin-top: calc(var(--spacing) * -2);
}
.flex {
  display: -webkit-flex;
  display: flex;
}
.grid {
  display: grid;
}
.h-2 {
  height: 16rpx;
  height: calc(var(--spacing) * 2);
}
.h-3 {
  height: 24rpx;
  height: calc(var(--spacing) * 3);
}
.h-5 {
  height: 40rpx;
  height: calc(var(--spacing) * 5);
}
.h-10 {
  height: 80rpx;
  height: calc(var(--spacing) * 10);
}
.h-screen {
  height: 100vh;
}
.w-2 {
  width: 16rpx;
  width: calc(var(--spacing) * 2);
}
.w-5 {
  width: 40rpx;
  width: calc(var(--spacing) * 5);
}
.w-10 {
  width: 80rpx;
  width: calc(var(--spacing) * 10);
}
.w-32 {
  width: 256rpx;
  width: calc(var(--spacing) * 32);
}
.w-screen {
  width: 100vw;
}
.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.flex-col {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.items-center {
  -webkit-align-items: center;
  align-items: center;
}
.justify-center {
  -webkit-justify-content: center;
  justify-content: center;
}
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-top: 32rpx;
  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
  margin-bottom: 0rpx;
  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
}
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  --tw-border-style: solid;
  border-style: solid;
}
.rounded-md {
  border-radius: 12rpx;
  border-radius: var(--radius-md);
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-solid {
  --tw-border-style: solid;
  border-style: solid;
}
.bg-gray-100 {
  background-color: rgb(243, 244, 246);
  background-color: var(--color-gray-100);
}
.bg-pink-500 {
  background-color: rgb(246, 51, 154);
  background-color: var(--color-pink-500);
}
.bg-red-400 {
  background-color: rgb(255, 101, 104);
  background-color: var(--color-red-400);
}
.bg-red-500 {
  background-color: rgb(251, 44, 54);
  background-color: var(--color-red-500);
}
.bg-sky-500 {
  background-color: rgb(0, 165, 234);
  background-color: var(--color-sky-500);
}
.py-2 {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.text-2xl {
  font-size: 48rpx;
  font-size: var(--text-2xl);
  line-height: 1.33333;
  line-height: var(--tw-leading, var(--text-2xl--line-height));
}
.font-semibold {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: 600;
  font-weight: var(--font-weight-semibold);
}
.text-_bcolor_cvar_p--my-var_P_B,
.text-_bvar_p--my-var_P_B {
  color: var(--my-var);
}
.text-black {
  color: #000;
  color: var(--color-black);
}
.text-purple-600 {
  color: rgb(152, 16, 250);
  color: var(--color-purple-600);
}
.text-white {
  color: #fff;
  color: var(--color-white);
}
.underline {
  -webkit-text-decoration-line: underline;
  text-decoration-line: underline;
}
.opacity-50 {
  opacity: 0.5;
}
.shadow-_b0px_2px_11px_0px__h00000a_B,
.shadow-_b0px_2px_11px_0px_rgba_p0_m0_m0_m0_d4_P_B {
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring-4 {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring-pink-300 {
  --tw-ring-color: var(--color-pink-300);
}
.before_ccontent-_b_aFestivus_a_B:before {
  --tw-content: 'Festivus';
  content: 'Festivus';
  content: var(--tw-content);
}
.after_cborder-none:after {
  --tw-border-style: none;
  border-style: none;
  content: var(--tw-content);
}
@media (min-width: 96rem) {
  ._2xl_ctext-base {
    font-size: 32rpx;
    font-size: var(--text-base);
    line-height: 1.5;
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
  ._2xl_ctext-_bred_B {
    color: red;
  }
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-green-500 {
    background-color: rgb(0, 198, 90);
    background-color: var(--color-green-500);
  }
  .dark_cbg-zinc-800 {
    background-color: rgb(39, 39, 42);
    background-color: var(--color-zinc-800);
  }
  .dark_ctext-yellow-400 {
    color: rgb(247, 201, 0);
    color: var(--color-yellow-400);
  }
}
```
