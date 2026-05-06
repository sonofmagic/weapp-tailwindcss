# taro-vite-tailwindcss-v5 CSS Output Comparison

Fixture: demo
Entry: taro-vite-tailwindcss-v5/dist/app.wxss
Legacy CSS files: app.wxss, app-origin.wxss, index.wxss
Generator CSS files: app.wxss, app-origin.wxss, index.wxss

| Mode | Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- |
| legacy | 4505 | 37 | false | false | false | false | true |
| generator | 23641 | 173 | false | false | false | false | true |

## Diff

```diff
===================================================================
--- taro-vite-tailwindcss-v5/legacy.css
+++ taro-vite-tailwindcss-v5/generator.css
@@ -4,12 +4,26 @@
 ::after {
   --tw-content: '';
 }
-view,
-text,
-:before,
-:after {
+:host,
+page,
+.tw-root,
+wx-root-portal-content {
+  --tw-scale-x: 1;
+  --tw-scale-y: 1;
+  --tw-scale-z: 1;
+  --tw-rotate-x: initial;
+  --tw-rotate-y: initial;
+  --tw-rotate-z: initial;
+  --tw-skew-x: initial;
+  --tw-skew-y: initial;
+  --tw-pan-x: initial;
+  --tw-pan-y: initial;
+  --tw-pinch-zoom: initial;
   --tw-space-y-reverse: 0;
+  --tw-space-x-reverse: 0;
+  --tw-divide-x-reverse: 0;
   --tw-border-style: solid;
+  --tw-divide-y-reverse: 0;
   --tw-gradient-position: initial;
   --tw-gradient-from: rgba(0, 0, 0, 0);
   --tw-gradient-via: rgba(0, 0, 0, 0);
@@ -19,15 +33,49 @@
   --tw-gradient-from-position: 0%;
   --tw-gradient-via-position: 50%;
   --tw-gradient-to-position: 100%;
-  box-sizing: border-box;
-  border-width: 0;
-  border-style: solid;
-  border-color: currentColor;
-}
-page,
-.tw-root,
-wx-root-portal-content,
-:host {
+  --tw-ordinal: initial;
+  --tw-slashed-zero: initial;
+  --tw-numeric-figure: initial;
+  --tw-numeric-spacing: initial;
+  --tw-numeric-fraction: initial;
+  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
+  --tw-shadow-color: initial;
+  --tw-shadow-alpha: 100%;
+  --tw-inset-shadow: 0 0 rgba(0, 0, 0, 0);
+  --tw-inset-shadow-color: initial;
+  --tw-inset-shadow-alpha: 100%;
+  --tw-ring-color: initial;
+  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
+  --tw-inset-ring-color: initial;
+  --tw-inset-ring-shadow: 0 0 rgba(0, 0, 0, 0);
+  --tw-ring-inset: initial;
+  --tw-ring-offset-width: 0rpx;
+  --tw-ring-offset-color: #fff;
+  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
+  --tw-outline-style: solid;
+  --tw-blur: initial;
+  --tw-brightness: initial;
+  --tw-contrast: initial;
+  --tw-grayscale: initial;
+  --tw-hue-rotate: initial;
+  --tw-invert: initial;
+  --tw-opacity: initial;
+  --tw-saturate: initial;
+  --tw-sepia: initial;
+  --tw-drop-shadow: initial;
+  --tw-drop-shadow-color: initial;
+  --tw-drop-shadow-alpha: 100%;
+  --tw-drop-shadow-size: initial;
+  --tw-backdrop-blur: initial;
+  --tw-backdrop-brightness: initial;
+  --tw-backdrop-contrast: initial;
+  --tw-backdrop-grayscale: initial;
+  --tw-backdrop-hue-rotate: initial;
+  --tw-backdrop-invert: initial;
+  --tw-backdrop-opacity: initial;
+  --tw-backdrop-saturate: initial;
+  --tw-backdrop-sepia: initial;
+  --tw-ease: initial;
   --color-red-500: rgb(251, 44, 54);
   --color-green-500: rgb(0, 198, 90);
   --color-emerald-600: rgb(0, 150, 105);
@@ -40,65 +88,372 @@
   --color-white: #fff;
   --spacing: 8rpx;
   --radius-xl: 24rpx;
+  --ease-out: cubic-bezier(0, 0, 0.2, 1);
+  --default-transition-duration: 150ms;
+  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
   --color-brand: #155dfc;
 }
-view,
-text,
-:after,
-:before {
-  box-sizing: border-box;
-  border: 0 solid;
-  margin: 0;
+.collapse {
+  visibility: collapse;
+}
+.invisible {
+  visibility: hidden;
+}
+.visible {
+  visibility: visible;
+}
+.sr-only {
+  position: absolute;
+  width: 1rpx;
+  height: 1rpx;
   padding: 0;
+  margin: -1rpx;
+  overflow: hidden;
+  -webkit-clip-path: inset(50%);
+  clip-path: inset(50%);
+  white-space: nowrap;
+  border-width: 0;
 }
+.not-sr-only {
+  position: static;
+  width: auto;
+  height: auto;
+  padding: 0;
+  margin: 0;
+  overflow: visible;
+  -webkit-clip-path: none;
+  clip-path: none;
+  white-space: normal;
+}
+.absolute {
+  position: absolute;
+}
+.fixed {
+  position: fixed;
+}
+.relative {
+  position: relative;
+}
 .static {
   position: static;
 }
+.sticky {
+  position: -webkit-sticky;
+  position: sticky;
+}
+.start {
+  left: var(--spacing);
+}
+.end {
+  right: var(--spacing);
+}
+.isolate {
+  isolation: isolate;
+}
+.isolation-auto {
+  isolation: auto;
+}
+.container {
+  width: 100%;
+}
+@media (min-width: 40rem) {
+  .container {
+    max-width: 1280rpx;
+  }
+}
+@media (min-width: 48rem) {
+  .container {
+    max-width: 1536rpx;
+  }
+}
+@media (min-width: 64rem) {
+  .container {
+    max-width: 2048rpx;
+  }
+}
+@media (min-width: 80rem) {
+  .container {
+    max-width: 2560rpx;
+  }
+}
+@media (min-width: 96rem) {
+  .container {
+    max-width: 3072rpx;
+  }
+}
+.block {
+  display: block;
+}
+.contents {
+  display: contents;
+}
+.flex {
+  display: -webkit-flex;
+  display: flex;
+}
+.flow-root {
+  display: flow-root;
+}
+.grid {
+  display: grid;
+}
+.hidden {
+  display: none;
+}
+.inline {
+  display: inline;
+}
+.inline-block {
+  display: inline-block;
+}
+.inline-flex {
+  display: -webkit-inline-flex;
+  display: inline-flex;
+}
+.inline-grid {
+  display: inline-grid;
+}
+.inline-table {
+  display: inline-table;
+}
+.list-item {
+  display: list-item;
+}
+.table {
+  display: table;
+}
+.table-caption {
+  display: table-caption;
+}
+.table-cell {
+  display: table-cell;
+}
+.table-column {
+  display: table-column;
+}
+.table-column-group {
+  display: table-column-group;
+}
+.table-footer-group {
+  display: table-footer-group;
+}
+.table-header-group {
+  display: table-header-group;
+}
+.table-row {
+  display: table-row;
+}
+.table-row-group {
+  display: table-row-group;
+}
 .h-14 {
-  height: 112rpx;
   height: calc(var(--spacing) * 14);
 }
 .h-_b300px_B {
   height: 300rpx;
 }
+.shrink {
+  -webkit-flex-shrink: 1;
+  flex-shrink: 1;
+}
+.grow {
+  -webkit-flex-grow: 1;
+  flex-grow: 1;
+}
+.border-collapse {
+  border-collapse: collapse;
+}
+.translate-none {
+  translate: none;
+}
+.scale-3d {
+  scale: var(--tw-scale-x) var(--tw-scale-y) var(--tw-scale-z);
+}
 .rotate-_b10deg_B {
   rotate: 10deg;
 }
+.transform {
+  -webkit-transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
+  transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
+}
+.touch-pinch-zoom {
+  --tw-pinch-zoom: pinch-zoom;
+  touch-action: var(--tw-pan-x,) var(--tw-pan-y,) var(--tw-pinch-zoom,);
+}
+.resize {
+  resize: both;
+}
+.flex-wrap {
+  -webkit-flex-wrap: wrap;
+  flex-wrap: wrap;
+}
 .space-y-4 > view + view,
 .space-y-4 > view + text,
 .space-y-4 > text + view,
 .space-y-4 > text + text {
   --tw-space-y-reverse: 0;
-  margin-bottom: 0rpx;
   margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
-  margin-top: 32rpx;
   margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
 }
+.space-y-reverse > view + view,
+.space-y-reverse > view + text,
+.space-y-reverse > text + view,
+.space-y-reverse > text + text {
+  --tw-space-y-reverse: 1;
+}
+.space-x-reverse > view + view,
+.space-x-reverse > view + text,
+.space-x-reverse > text + view,
+.space-x-reverse > text + text {
+  --tw-space-x-reverse: 1;
+}
+.divide-x > view + view,
+.divide-x > view + text,
+.divide-x > text + view,
+.divide-x > text + text {
+  --tw-divide-x-reverse: 0;
+  border-left-style: var(--tw-border-style);
+  border-right-style: var(--tw-border-style);
+  border-right-width: calc(1rpx * var(--tw-divide-x-reverse));
+  border-left-width: calc(1rpx * (1 - var(--tw-divide-x-reverse)));
+}
+.divide-y > view + view,
+.divide-y > view + text,
+.divide-y > text + view,
+.divide-y > text + text {
+  --tw-divide-y-reverse: 0;
+  border-bottom-style: var(--tw-border-style);
+  border-top-style: var(--tw-border-style);
+  border-bottom-width: calc(1rpx * var(--tw-divide-y-reverse));
+  border-top-width: calc(1rpx * (1 - var(--tw-divide-y-reverse)));
+}
+.divide-y-reverse > view + view,
+.divide-y-reverse > view + text,
+.divide-y-reverse > text + view,
+.divide-y-reverse > text + text {
+  --tw-divide-y-reverse: 1;
+}
+.truncate {
+  overflow: hidden;
+  text-overflow: ellipsis;
+  white-space: nowrap;
+}
 .rounded-xl {
-  border-radius: 24rpx;
   border-radius: var(--radius-xl);
 }
+.rounded-s {
+  border-top-left-radius: 8rpx;
+  border-bottom-left-radius: 8rpx;
+}
+.rounded-ss {
+  border-top-left-radius: 8rpx;
+}
+.rounded-e {
+  border-top-right-radius: 8rpx;
+  border-bottom-right-radius: 8rpx;
+}
+.rounded-se {
+  border-top-right-radius: 8rpx;
+}
+.rounded-ee {
+  border-bottom-right-radius: 8rpx;
+}
+.rounded-es {
+  border-bottom-left-radius: 8rpx;
+}
+.rounded-t {
+  border-top-left-radius: 8rpx;
+  border-top-right-radius: 8rpx;
+}
+.rounded-l {
+  border-top-left-radius: 8rpx;
+  border-bottom-left-radius: 8rpx;
+}
+.rounded-tl {
+  border-top-left-radius: 8rpx;
+}
+.rounded-r {
+  border-top-right-radius: 8rpx;
+  border-bottom-right-radius: 8rpx;
+}
+.rounded-tr {
+  border-top-right-radius: 8rpx;
+}
+.rounded-b {
+  border-bottom-right-radius: 8rpx;
+  border-bottom-left-radius: 8rpx;
+}
+.rounded-br {
+  border-bottom-right-radius: 8rpx;
+}
+.rounded-bl {
+  border-bottom-left-radius: 8rpx;
+}
+.border {
+  border-style: var(--tw-border-style);
+  border-width: 1rpx;
+}
 .border-_b10rpx_B {
   border-style: var(--tw-border-style);
   border-width: 10rpx;
 }
+.border-x {
+  border-left-style: var(--tw-border-style);
+  border-right-style: var(--tw-border-style);
+  border-left-width: 1rpx;
+  border-right-width: 1rpx;
+}
+.border-y {
+  border-top-style: var(--tw-border-style);
+  border-bottom-style: var(--tw-border-style);
+  border-top-width: 1rpx;
+  border-bottom-width: 1rpx;
+}
+.border-s {
+  border-left-style: var(--tw-border-style);
+  border-left-width: 1rpx;
+}
+.border-e {
+  border-right-style: var(--tw-border-style);
+  border-right-width: 1rpx;
+}
+.border-bs {
+  border-top-style: var(--tw-border-style);
+  border-top-width: 1rpx;
+}
+.border-be {
+  border-bottom-style: var(--tw-border-style);
+  border-bottom-width: 1rpx;
+}
+.border-t {
+  border-top-style: var(--tw-border-style);
+  border-top-width: 1rpx;
+}
+.border-r {
+  border-right-style: var(--tw-border-style);
+  border-right-width: 1rpx;
+}
+.border-b {
+  border-bottom-style: var(--tw-border-style);
+  border-bottom-width: 1rpx;
+}
+.border-l {
+  border-left-style: var(--tw-border-style);
+  border-left-width: 1rpx;
+}
 ._eborder-brand {
-  border-color: #155dfc !important;
   border-color: var(--color-brand) !important;
 }
 .bg-_b_h123456_B {
   background-color: #123456;
 }
 .bg-brand {
-  background-color: #155dfc;
   background-color: var(--color-brand);
 }
 .bg-gray-100 {
-  background-color: rgb(243, 244, 246);
   background-color: var(--color-gray-100);
 }
 .bg-red-500 {
-  background-color: rgb(251, 44, 54);
   background-color: var(--color-red-500);
 }
 .bg-linear-to-r {
@@ -151,8 +506,18 @@
     var(--tw-gradient-to) var(--tw-gradient-to-position)
   );
 }
+.bg-repeat {
+  background-repeat: repeat;
+}
+.mask-no-clip {
+  -webkit-mask-clip: no-clip;
+  mask-clip: no-clip;
+}
+.mask-repeat {
+  -webkit-mask-repeat: repeat;
+  mask-repeat: repeat;
+}
 .p-4 {
-  padding: 32rpx;
   padding: calc(var(--spacing) * 4);
 }
 .p-_b32rpx_B {
@@ -164,6 +529,15 @@
 .text-_b55rpx_B {
   font-size: 55rpx;
 }
+.text-wrap {
+  text-wrap: wrap;
+}
+.text-clip {
+  text-overflow: clip;
+}
+.text-ellipsis {
+  text-overflow: ellipsis;
+}
 .text-_b_hc31d6b_B {
   color: #c31d6b;
 }
@@ -171,20 +545,225 @@
   color: #fff;
 }
 .text-white {
-  color: #fff;
   color: var(--color-white);
 }
+.capitalize {
+  text-transform: capitalize;
+}
+.lowercase {
+  text-transform: lowercase;
+}
+.normal-case {
+  text-transform: none;
+}
+.uppercase {
+  text-transform: uppercase;
+}
+.italic {
+  font-style: italic;
+}
+.not-italic {
+  font-style: normal;
+}
+.diagonal-fractions {
+  --tw-numeric-fraction: diagonal-fractions;
+  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+}
+.lining-nums {
+  --tw-numeric-figure: lining-nums;
+  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+}
+.oldstyle-nums {
+  --tw-numeric-figure: oldstyle-nums;
+  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+}
+.ordinal {
+  --tw-ordinal: ordinal;
+  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+}
+.proportional-nums {
+  --tw-numeric-spacing: proportional-nums;
+  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+}
+.slashed-zero {
+  --tw-slashed-zero: slashed-zero;
+  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+}
+.stacked-fractions {
+  --tw-numeric-fraction: stacked-fractions;
+  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+}
+.tabular-nums {
+  --tw-numeric-spacing: tabular-nums;
+  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
+}
+.normal-nums {
+  -webkit-font-feature-settings: normal;
+  font-feature-settings: normal;
+  font-variant-numeric: normal;
+}
+.line-through {
+  -webkit-text-decoration-line: line-through;
+  text-decoration-line: line-through;
+}
+.no-underline {
+  -webkit-text-decoration-line: none;
+  text-decoration-line: none;
+}
+.overline {
+  -webkit-text-decoration-line: overline;
+  text-decoration-line: overline;
+}
+.underline {
+  -webkit-text-decoration-line: underline;
+  text-decoration-line: underline;
+}
+.antialiased {
+  -webkit-font-smoothing: antialiased;
+  -moz-osx-font-smoothing: grayscale;
+}
+.subpixel-antialiased {
+  -webkit-font-smoothing: auto;
+  -moz-osx-font-smoothing: auto;
+}
+.shadow {
+  --tw-shadow: 0 1rpx 3rpx 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1rpx 2rpx -1rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
+  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
+}
+.ring {
+  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1rpx + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
+  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
+}
+.inset-ring {
+  --tw-inset-ring-shadow: inset 0 0 0 1rpx var(--tw-inset-ring-color, currentcolor);
+  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
+}
+.outline {
+  outline-style: var(--tw-outline-style);
+  outline-width: 1rpx;
+}
+.blur {
+  --tw-blur: blur(8rpx);
+  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
+    var(--tw-drop-shadow,);
+  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
+    var(--tw-drop-shadow,);
+}
+.drop-shadow {
+  --tw-drop-shadow-size: drop-shadow(0 1rpx 2rpx var(--tw-drop-shadow-color, rgba(0, 0, 0, 0.1))) drop-shadow(0 1rpx 1rpx var(--tw-drop-shadow-color, rgba(0, 0, 0, 0.06)));
+  --tw-drop-shadow: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.1)) drop-shadow(0 1rpx 1rpx rgba(0, 0, 0, 0.06));
+  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
+    var(--tw-drop-shadow,);
+  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
+    var(--tw-drop-shadow,);
+}
+.filter {
+  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
+    var(--tw-drop-shadow,);
+  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
+    var(--tw-drop-shadow,);
+}
+.backdrop-blur {
+  --tw-backdrop-blur: blur(8rpx);
+  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
+    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
+  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
+    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
+}
+.backdrop-grayscale {
+  --tw-backdrop-grayscale: grayscale(100%);
+  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
+    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
+  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
+    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
+}
+.backdrop-invert {
+  --tw-backdrop-invert: invert(100%);
+  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
+    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
+  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
+    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
+}
+.backdrop-sepia {
+  --tw-backdrop-sepia: sepia(100%);
+  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
+    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
+  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
+    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
+}
+.backdrop-filter {
+  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
+    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
+  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
+    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
+}
+.transition {
+  transition-property:
+    color,
+    background-color,
+    border-color,
+    outline-color,
+    text-decoration-color,
+    fill,
+    stroke,
+    --tw-gradient-from,
+    --tw-gradient-via,
+    --tw-gradient-to,
+    opacity,
+    box-shadow,
+    transform,
+    translate,
+    scale,
+    rotate,
+    filter,
+    -webkit-backdrop-filter,
+    backdrop-filter,
+    display,
+    content-visibility,
+    overlay,
+    pointer-events;
+  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
+  transition-duration: var(--tw-duration, var(--default-transition-duration));
+}
+.ease-out {
+  --tw-ease: var(--ease-out);
+  transition-timing-function: var(--ease-out);
+}
+.divide-x-reverse > view + view,
+.divide-x-reverse > view + text,
+.divide-x-reverse > text + view,
+.divide-x-reverse > text + text {
+  --tw-divide-x-reverse: 1;
+}
+.ring-inset {
+  --tw-ring-inset: inset;
+}
 .active_cbg-emerald-600:active {
-  background-color: rgb(0, 150, 105);
   background-color: var(--color-emerald-600);
 }
 @media (prefers-color-scheme: dark) {
   .dark_cbg-green-500 {
-    background-color: rgb(0, 198, 90);
     background-color: var(--color-green-500);
   }
+}
+@media (prefers-color-scheme: dark) {
   .dark_cbg-zinc-800 {
-    background-color: rgb(39, 39, 42);
     background-color: var(--color-zinc-800);
   }
 }
```

## Legacy CSS

```css
@import 'app-origin.wxss';

::before,
::after {
  --tw-content: '';
}
view,
text,
:before,
:after {
  --tw-space-y-reverse: 0;
  --tw-border-style: solid;
  --tw-gradient-position: initial;
  --tw-gradient-from: rgba(0, 0, 0, 0);
  --tw-gradient-via: rgba(0, 0, 0, 0);
  --tw-gradient-to: rgba(0, 0, 0, 0);
  --tw-gradient-stops: initial;
  --tw-gradient-via-stops: initial;
  --tw-gradient-from-position: 0%;
  --tw-gradient-via-position: 50%;
  --tw-gradient-to-position: 100%;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
page,
.tw-root,
wx-root-portal-content,
:host {
  --color-red-500: rgb(251, 44, 54);
  --color-green-500: rgb(0, 198, 90);
  --color-emerald-600: rgb(0, 150, 105);
  --color-cyan-500: rgb(0, 182, 212);
  --color-blue-500: rgb(50, 128, 255);
  --color-fuchsia-500: rgb(225, 42, 251);
  --color-rose-500: rgb(255, 35, 87);
  --color-gray-100: rgb(243, 244, 246);
  --color-zinc-800: rgb(39, 39, 42);
  --color-white: #fff;
  --spacing: 8rpx;
  --radius-xl: 24rpx;
  --color-brand: #155dfc;
}
view,
text,
:after,
:before {
  box-sizing: border-box;
  border: 0 solid;
  margin: 0;
  padding: 0;
}
.static {
  position: static;
}
.h-14 {
  height: 112rpx;
  height: calc(var(--spacing) * 14);
}
.h-_b300px_B {
  height: 300rpx;
}
.rotate-_b10deg_B {
  rotate: 10deg;
}
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: 0rpx;
  margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-top: 32rpx;
  margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
}
.rounded-xl {
  border-radius: 24rpx;
  border-radius: var(--radius-xl);
}
.border-_b10rpx_B {
  border-style: var(--tw-border-style);
  border-width: 10rpx;
}
._eborder-brand {
  border-color: #155dfc !important;
  border-color: var(--color-brand) !important;
}
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-brand {
  background-color: #155dfc;
  background-color: var(--color-brand);
}
.bg-gray-100 {
  background-color: rgb(243, 244, 246);
  background-color: var(--color-gray-100);
}
.bg-red-500 {
  background-color: rgb(251, 44, 54);
  background-color: var(--color-red-500);
}
.bg-linear-to-r {
  --tw-gradient-position: to right;
}
.bg-linear-to-r {
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-b {
  --tw-gradient-position: to bottom;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-r {
  --tw-gradient-position: to right;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.from-cyan-500 {
  --tw-gradient-from: var(--color-cyan-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.from-fuchsia-500 {
  --tw-gradient-from: var(--color-fuchsia-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.to-blue-500 {
  --tw-gradient-to: var(--color-blue-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.to-rose-500 {
  --tw-gradient-to: var(--color-rose-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.p-4 {
  padding: 32rpx;
  padding: calc(var(--spacing) * 4);
}
.p-_b32rpx_B {
  padding: 32rpx;
}
.text-_b32rpx_B {
  font-size: 32rpx;
}
.text-_b55rpx_B {
  font-size: 55rpx;
}
.text-_b_hc31d6b_B {
  color: #c31d6b;
}
.text-_b_hfff_B {
  color: #fff;
}
.text-white {
  color: #fff;
  color: var(--color-white);
}
.active_cbg-emerald-600:active {
  background-color: rgb(0, 150, 105);
  background-color: var(--color-emerald-600);
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
}

.tw-page-style-watch-anchor {
  color: inherit;
}
```

## Generator CSS

```css
@import 'app-origin.wxss';

::before,
::after {
  --tw-content: '';
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-scale-z: 1;
  --tw-rotate-x: initial;
  --tw-rotate-y: initial;
  --tw-rotate-z: initial;
  --tw-skew-x: initial;
  --tw-skew-y: initial;
  --tw-pan-x: initial;
  --tw-pan-y: initial;
  --tw-pinch-zoom: initial;
  --tw-space-y-reverse: 0;
  --tw-space-x-reverse: 0;
  --tw-divide-x-reverse: 0;
  --tw-border-style: solid;
  --tw-divide-y-reverse: 0;
  --tw-gradient-position: initial;
  --tw-gradient-from: rgba(0, 0, 0, 0);
  --tw-gradient-via: rgba(0, 0, 0, 0);
  --tw-gradient-to: rgba(0, 0, 0, 0);
  --tw-gradient-stops: initial;
  --tw-gradient-via-stops: initial;
  --tw-gradient-from-position: 0%;
  --tw-gradient-via-position: 50%;
  --tw-gradient-to-position: 100%;
  --tw-ordinal: initial;
  --tw-slashed-zero: initial;
  --tw-numeric-figure: initial;
  --tw-numeric-spacing: initial;
  --tw-numeric-fraction: initial;
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
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-outline-style: solid;
  --tw-blur: initial;
  --tw-brightness: initial;
  --tw-contrast: initial;
  --tw-grayscale: initial;
  --tw-hue-rotate: initial;
  --tw-invert: initial;
  --tw-opacity: initial;
  --tw-saturate: initial;
  --tw-sepia: initial;
  --tw-drop-shadow: initial;
  --tw-drop-shadow-color: initial;
  --tw-drop-shadow-alpha: 100%;
  --tw-drop-shadow-size: initial;
  --tw-backdrop-blur: initial;
  --tw-backdrop-brightness: initial;
  --tw-backdrop-contrast: initial;
  --tw-backdrop-grayscale: initial;
  --tw-backdrop-hue-rotate: initial;
  --tw-backdrop-invert: initial;
  --tw-backdrop-opacity: initial;
  --tw-backdrop-saturate: initial;
  --tw-backdrop-sepia: initial;
  --tw-ease: initial;
  --color-red-500: rgb(251, 44, 54);
  --color-green-500: rgb(0, 198, 90);
  --color-emerald-600: rgb(0, 150, 105);
  --color-cyan-500: rgb(0, 182, 212);
  --color-blue-500: rgb(50, 128, 255);
  --color-fuchsia-500: rgb(225, 42, 251);
  --color-rose-500: rgb(255, 35, 87);
  --color-gray-100: rgb(243, 244, 246);
  --color-zinc-800: rgb(39, 39, 42);
  --color-white: #fff;
  --spacing: 8rpx;
  --radius-xl: 24rpx;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --default-transition-duration: 150ms;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  --color-brand: #155dfc;
}
.collapse {
  visibility: collapse;
}
.invisible {
  visibility: hidden;
}
.visible {
  visibility: visible;
}
.sr-only {
  position: absolute;
  width: 1rpx;
  height: 1rpx;
  padding: 0;
  margin: -1rpx;
  overflow: hidden;
  -webkit-clip-path: inset(50%);
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}
.not-sr-only {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  -webkit-clip-path: none;
  clip-path: none;
  white-space: normal;
}
.absolute {
  position: absolute;
}
.fixed {
  position: fixed;
}
.relative {
  position: relative;
}
.static {
  position: static;
}
.sticky {
  position: -webkit-sticky;
  position: sticky;
}
.start {
  left: var(--spacing);
}
.end {
  right: var(--spacing);
}
.isolate {
  isolation: isolate;
}
.isolation-auto {
  isolation: auto;
}
.container {
  width: 100%;
}
@media (min-width: 40rem) {
  .container {
    max-width: 1280rpx;
  }
}
@media (min-width: 48rem) {
  .container {
    max-width: 1536rpx;
  }
}
@media (min-width: 64rem) {
  .container {
    max-width: 2048rpx;
  }
}
@media (min-width: 80rem) {
  .container {
    max-width: 2560rpx;
  }
}
@media (min-width: 96rem) {
  .container {
    max-width: 3072rpx;
  }
}
.block {
  display: block;
}
.contents {
  display: contents;
}
.flex {
  display: -webkit-flex;
  display: flex;
}
.flow-root {
  display: flow-root;
}
.grid {
  display: grid;
}
.hidden {
  display: none;
}
.inline {
  display: inline;
}
.inline-block {
  display: inline-block;
}
.inline-flex {
  display: -webkit-inline-flex;
  display: inline-flex;
}
.inline-grid {
  display: inline-grid;
}
.inline-table {
  display: inline-table;
}
.list-item {
  display: list-item;
}
.table {
  display: table;
}
.table-caption {
  display: table-caption;
}
.table-cell {
  display: table-cell;
}
.table-column {
  display: table-column;
}
.table-column-group {
  display: table-column-group;
}
.table-footer-group {
  display: table-footer-group;
}
.table-header-group {
  display: table-header-group;
}
.table-row {
  display: table-row;
}
.table-row-group {
  display: table-row-group;
}
.h-14 {
  height: calc(var(--spacing) * 14);
}
.h-_b300px_B {
  height: 300rpx;
}
.shrink {
  -webkit-flex-shrink: 1;
  flex-shrink: 1;
}
.grow {
  -webkit-flex-grow: 1;
  flex-grow: 1;
}
.border-collapse {
  border-collapse: collapse;
}
.translate-none {
  translate: none;
}
.scale-3d {
  scale: var(--tw-scale-x) var(--tw-scale-y) var(--tw-scale-z);
}
.rotate-_b10deg_B {
  rotate: 10deg;
}
.transform {
  -webkit-transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
}
.touch-pinch-zoom {
  --tw-pinch-zoom: pinch-zoom;
  touch-action: var(--tw-pan-x,) var(--tw-pan-y,) var(--tw-pinch-zoom,);
}
.resize {
  resize: both;
}
.flex-wrap {
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
}
.space-y-4 > view + view,
.space-y-4 > view + text,
.space-y-4 > text + view,
.space-y-4 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
}
.space-y-reverse > view + view,
.space-y-reverse > view + text,
.space-y-reverse > text + view,
.space-y-reverse > text + text {
  --tw-space-y-reverse: 1;
}
.space-x-reverse > view + view,
.space-x-reverse > view + text,
.space-x-reverse > text + view,
.space-x-reverse > text + text {
  --tw-space-x-reverse: 1;
}
.divide-x > view + view,
.divide-x > view + text,
.divide-x > text + view,
.divide-x > text + text {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(1rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(1rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-y > view + view,
.divide-y > view + text,
.divide-y > text + view,
.divide-y > text + text {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: calc(1rpx * var(--tw-divide-y-reverse));
  border-top-width: calc(1rpx * (1 - var(--tw-divide-y-reverse)));
}
.divide-y-reverse > view + view,
.divide-y-reverse > view + text,
.divide-y-reverse > text + view,
.divide-y-reverse > text + text {
  --tw-divide-y-reverse: 1;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rounded-xl {
  border-radius: var(--radius-xl);
}
.rounded-s {
  border-top-left-radius: 8rpx;
  border-bottom-left-radius: 8rpx;
}
.rounded-ss {
  border-top-left-radius: 8rpx;
}
.rounded-e {
  border-top-right-radius: 8rpx;
  border-bottom-right-radius: 8rpx;
}
.rounded-se {
  border-top-right-radius: 8rpx;
}
.rounded-ee {
  border-bottom-right-radius: 8rpx;
}
.rounded-es {
  border-bottom-left-radius: 8rpx;
}
.rounded-t {
  border-top-left-radius: 8rpx;
  border-top-right-radius: 8rpx;
}
.rounded-l {
  border-top-left-radius: 8rpx;
  border-bottom-left-radius: 8rpx;
}
.rounded-tl {
  border-top-left-radius: 8rpx;
}
.rounded-r {
  border-top-right-radius: 8rpx;
  border-bottom-right-radius: 8rpx;
}
.rounded-tr {
  border-top-right-radius: 8rpx;
}
.rounded-b {
  border-bottom-right-radius: 8rpx;
  border-bottom-left-radius: 8rpx;
}
.rounded-br {
  border-bottom-right-radius: 8rpx;
}
.rounded-bl {
  border-bottom-left-radius: 8rpx;
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1rpx;
}
.border-_b10rpx_B {
  border-style: var(--tw-border-style);
  border-width: 10rpx;
}
.border-x {
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-left-width: 1rpx;
  border-right-width: 1rpx;
}
.border-y {
  border-top-style: var(--tw-border-style);
  border-bottom-style: var(--tw-border-style);
  border-top-width: 1rpx;
  border-bottom-width: 1rpx;
}
.border-s {
  border-left-style: var(--tw-border-style);
  border-left-width: 1rpx;
}
.border-e {
  border-right-style: var(--tw-border-style);
  border-right-width: 1rpx;
}
.border-bs {
  border-top-style: var(--tw-border-style);
  border-top-width: 1rpx;
}
.border-be {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 1rpx;
}
.border-t {
  border-top-style: var(--tw-border-style);
  border-top-width: 1rpx;
}
.border-r {
  border-right-style: var(--tw-border-style);
  border-right-width: 1rpx;
}
.border-b {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 1rpx;
}
.border-l {
  border-left-style: var(--tw-border-style);
  border-left-width: 1rpx;
}
._eborder-brand {
  border-color: var(--color-brand) !important;
}
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-brand {
  background-color: var(--color-brand);
}
.bg-gray-100 {
  background-color: var(--color-gray-100);
}
.bg-red-500 {
  background-color: var(--color-red-500);
}
.bg-linear-to-r {
  --tw-gradient-position: to right;
}
.bg-linear-to-r {
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-b {
  --tw-gradient-position: to bottom;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-r {
  --tw-gradient-position: to right;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.from-cyan-500 {
  --tw-gradient-from: var(--color-cyan-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.from-fuchsia-500 {
  --tw-gradient-from: var(--color-fuchsia-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.to-blue-500 {
  --tw-gradient-to: var(--color-blue-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.to-rose-500 {
  --tw-gradient-to: var(--color-rose-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.bg-repeat {
  background-repeat: repeat;
}
.mask-no-clip {
  -webkit-mask-clip: no-clip;
  mask-clip: no-clip;
}
.mask-repeat {
  -webkit-mask-repeat: repeat;
  mask-repeat: repeat;
}
.p-4 {
  padding: calc(var(--spacing) * 4);
}
.p-_b32rpx_B {
  padding: 32rpx;
}
.text-_b32rpx_B {
  font-size: 32rpx;
}
.text-_b55rpx_B {
  font-size: 55rpx;
}
.text-wrap {
  text-wrap: wrap;
}
.text-clip {
  text-overflow: clip;
}
.text-ellipsis {
  text-overflow: ellipsis;
}
.text-_b_hc31d6b_B {
  color: #c31d6b;
}
.text-_b_hfff_B {
  color: #fff;
}
.text-white {
  color: var(--color-white);
}
.capitalize {
  text-transform: capitalize;
}
.lowercase {
  text-transform: lowercase;
}
.normal-case {
  text-transform: none;
}
.uppercase {
  text-transform: uppercase;
}
.italic {
  font-style: italic;
}
.not-italic {
  font-style: normal;
}
.diagonal-fractions {
  --tw-numeric-fraction: diagonal-fractions;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.lining-nums {
  --tw-numeric-figure: lining-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.oldstyle-nums {
  --tw-numeric-figure: oldstyle-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.ordinal {
  --tw-ordinal: ordinal;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.proportional-nums {
  --tw-numeric-spacing: proportional-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.slashed-zero {
  --tw-slashed-zero: slashed-zero;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.stacked-fractions {
  --tw-numeric-fraction: stacked-fractions;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.tabular-nums {
  --tw-numeric-spacing: tabular-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.normal-nums {
  -webkit-font-feature-settings: normal;
  font-feature-settings: normal;
  font-variant-numeric: normal;
}
.line-through {
  -webkit-text-decoration-line: line-through;
  text-decoration-line: line-through;
}
.no-underline {
  -webkit-text-decoration-line: none;
  text-decoration-line: none;
}
.overline {
  -webkit-text-decoration-line: overline;
  text-decoration-line: overline;
}
.underline {
  -webkit-text-decoration-line: underline;
  text-decoration-line: underline;
}
.antialiased {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.subpixel-antialiased {
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}
.shadow {
  --tw-shadow: 0 1rpx 3rpx 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1rpx 2rpx -1rpx var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1rpx + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.inset-ring {
  --tw-inset-ring-shadow: inset 0 0 0 1rpx var(--tw-inset-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.outline {
  outline-style: var(--tw-outline-style);
  outline-width: 1rpx;
}
.blur {
  --tw-blur: blur(8rpx);
  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
}
.drop-shadow {
  --tw-drop-shadow-size: drop-shadow(0 1rpx 2rpx var(--tw-drop-shadow-color, rgba(0, 0, 0, 0.1))) drop-shadow(0 1rpx 1rpx var(--tw-drop-shadow-color, rgba(0, 0, 0, 0.06)));
  --tw-drop-shadow: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.1)) drop-shadow(0 1rpx 1rpx rgba(0, 0, 0, 0.06));
  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
}
.filter {
  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
}
.backdrop-blur {
  --tw-backdrop-blur: blur(8rpx);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-grayscale {
  --tw-backdrop-grayscale: grayscale(100%);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-invert {
  --tw-backdrop-invert: invert(100%);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-sepia {
  --tw-backdrop-sepia: sepia(100%);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-filter {
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.transition {
  transition-property:
    color,
    background-color,
    border-color,
    outline-color,
    text-decoration-color,
    fill,
    stroke,
    --tw-gradient-from,
    --tw-gradient-via,
    --tw-gradient-to,
    opacity,
    box-shadow,
    transform,
    translate,
    scale,
    rotate,
    filter,
    -webkit-backdrop-filter,
    backdrop-filter,
    display,
    content-visibility,
    overlay,
    pointer-events;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
}
.ease-out {
  --tw-ease: var(--ease-out);
  transition-timing-function: var(--ease-out);
}
.divide-x-reverse > view + view,
.divide-x-reverse > view + text,
.divide-x-reverse > text + view,
.divide-x-reverse > text + text {
  --tw-divide-x-reverse: 1;
}
.ring-inset {
  --tw-ring-inset: inset;
}
.active_cbg-emerald-600:active {
  background-color: var(--color-emerald-600);
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

.tw-page-style-watch-anchor {
  color: inherit;
}
```
