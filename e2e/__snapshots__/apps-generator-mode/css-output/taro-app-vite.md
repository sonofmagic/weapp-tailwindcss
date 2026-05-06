# taro-app-vite CSS Output Comparison

Fixture: demo
Entry: taro-app-vite/dist/app.wxss
Legacy CSS files: app.wxss, app-origin.wxss, index.wxss
Generator CSS files: app.wxss, app-origin.wxss, index.wxss

| Mode | Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- |
| legacy | 4530 | 23 | false | false | false | false | true |
| generator | 4701 | 44 | false | false | false | false | true |

## Diff

```diff
===================================================================
--- taro-app-vite/legacy.css
+++ taro-app-vite/generator.css
@@ -4,10 +4,10 @@
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
   --tw-border-spacing-x: 0;
   --tw-border-spacing-y: 0;
   --tw-translate-x: 0;
@@ -17,66 +17,6 @@
   --tw-skew-y: 0;
   --tw-scale-x: 1;
   --tw-scale-y: 1;
-  --tw-pan-x: ;
-  --tw-pan-y: ;
-  --tw-pinch-zoom: ;
-  --tw-scroll-snap-strictness: proximity;
-  --tw-gradient-from-position: ;
-  --tw-gradient-via-position: ;
-  --tw-gradient-to-position: ;
-  --tw-ordinal: ;
-  --tw-slashed-zero: ;
-  --tw-numeric-figure: ;
-  --tw-numeric-spacing: ;
-  --tw-numeric-fraction: ;
-  --tw-ring-inset: ;
-  --tw-ring-offset-width: 0rpx;
-  --tw-ring-offset-color: #fff;
-  --tw-ring-color: rgba(59, 130, 246, 0.5);
-  --tw-ring-offset-shadow: 0 0 #0000;
-  --tw-ring-shadow: 0 0 #0000;
-  --tw-shadow: 0 0 #0000;
-  --tw-shadow-colored: 0 0 #0000;
-  --tw-blur: ;
-  --tw-brightness: ;
-  --tw-contrast: ;
-  --tw-grayscale: ;
-  --tw-hue-rotate: ;
-  --tw-invert: ;
-  --tw-saturate: ;
-  --tw-sepia: ;
-  --tw-drop-shadow: ;
-  --tw-backdrop-blur: ;
-  --tw-backdrop-brightness: ;
-  --tw-backdrop-contrast: ;
-  --tw-backdrop-grayscale: ;
-  --tw-backdrop-hue-rotate: ;
-  --tw-backdrop-invert: ;
-  --tw-backdrop-opacity: ;
-  --tw-backdrop-saturate: ;
-  --tw-backdrop-sepia: ;
-  --tw-contain-size: ;
-  --tw-contain-layout: ;
-  --tw-contain-paint: ;
-  --tw-contain-style: ;
-  box-sizing: border-box;
-  border-width: 0;
-  border-style: solid;
-  border-color: currentColor;
-}
-view,
-text,
-::after,
-::before {
-  --tw-border-spacing-x: 0;
-  --tw-border-spacing-y: 0;
-  --tw-translate-x: 0;
-  --tw-translate-y: 0;
-  --tw-rotate: 0;
-  --tw-skew-x: 0;
-  --tw-skew-y: 0;
-  --tw-scale-x: 1;
-  --tw-scale-y: 1;
   --tw-pan-x:  ;
   --tw-pan-y:  ;
   --tw-pinch-zoom:  ;
@@ -90,7 +30,7 @@
   --tw-numeric-spacing:  ;
   --tw-numeric-fraction:  ;
   --tw-ring-inset:  ;
-  --tw-ring-offset-width: 0px;
+  --tw-ring-offset-width: 0rpx;
   --tw-ring-offset-color: #fff;
   --tw-ring-color: rgba(59, 130, 246, 0.5);
   --tw-ring-offset-shadow: 0 0 #0000;
@@ -118,19 +58,71 @@
   --tw-contain-size:  ;
   --tw-contain-layout:  ;
   --tw-contain-paint:  ;
-  --tw-contain-style:  ;
-  box-sizing: border-box;
-  border-width: 0;
-  border-style: solid;
-  border-color: currentColor;
+  --tw-contain-style:
+;
 }
-::before,
-::after {
-  --tw-content: '';
+.container {
+  width: 100%;
 }
+@media (min-width: 640px) {
+  .container {
+    max-width: 640rpx;
+  }
+}
+@media (min-width: 768px) {
+  .container {
+    max-width: 768rpx;
+  }
+}
+@media (min-width: 1024px) {
+  .container {
+    max-width: 1024rpx;
+  }
+}
+@media (min-width: 1280px) {
+  .container {
+    max-width: 1280rpx;
+  }
+}
+@media (min-width: 1536px) {
+  .container {
+    max-width: 1536rpx;
+  }
+}
+.visible {
+  visibility: visible;
+}
+.static {
+  position: static;
+}
+.fixed {
+  position: fixed;
+}
+.block {
+  display: block;
+}
+.inline {
+  display: inline;
+}
 .flex {
   display: flex;
 }
+.table {
+  display: table;
+}
+.grid {
+  display: grid;
+}
+.hidden {
+  display: none;
+}
+.transform {
+  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
+    scaleY(var(--tw-scale-y));
+}
+.resize {
+  resize: both;
+}
 .flex-col {
   flex-direction: column;
 }
@@ -155,6 +147,9 @@
   --tw-divide-opacity: 1;
   border-color: rgba(96, 210, 86, var(--tw-divide-opacity, 1));
 }
+.border {
+  border-width: 1rpx;
+}
 .bg-_b_h89ab8d_B {
   --tw-bg-opacity: 1;
   background-color: rgba(137, 171, 141, var(--tw-bg-opacity, 1));
@@ -174,11 +169,29 @@
   --tw-text-opacity: 1;
   color: rgba(67, 136, 33, var(--tw-text-opacity, 1));
 }
-.before_ccontent-_b_q11111_q_B:before {
+.outline {
+  outline-style: solid;
+}
+.blur {
+  --tw-blur: blur(8rpx);
+  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
+}
+.filter {
+  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
+}
+.transition {
+  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
+  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
+  transition-duration: 150ms;
+}
+.ease-out {
+  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
+}
+.before_ccontent-_b_q11111_q_B::before {
   --tw-content: '11111';
   content: var(--tw-content);
 }
-.before_ccontent-_b_q222_q_B:before {
+.before_ccontent-_b_q222_q_B::before {
   --tw-content: '222';
   content: var(--tw-content);
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
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
view,
text,
::after,
::before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
::before,
::after {
  --tw-content: '';
}
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.divide-x-8 > view + view,
.divide-x-8 > view + text,
.divide-x-8 > text + view,
.divide-x-8 > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(8rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(8rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  border-style: solid;
}
.divide-_b_h60d256_B > view + view,
.divide-_b_h60d256_B > view + text,
.divide-_b_h60d256_B > text + view,
.divide-_b_h60d256_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(96, 210, 86, var(--tw-divide-opacity, 1));
}
.bg-_b_h89ab8d_B {
  --tw-bg-opacity: 1;
  background-color: rgba(137, 171, 141, var(--tw-bg-opacity, 1));
}
.bg-_b_he24826_B {
  --tw-bg-opacity: 1;
  background-color: rgba(226, 72, 38, var(--tw-bg-opacity, 1));
}
.text-_b66rpx_B {
  font-size: 66rpx;
}
.text-_b_h3d31a4_B {
  --tw-text-opacity: 1;
  color: rgba(61, 49, 164, var(--tw-text-opacity, 1));
}
.text-_b_h438821_B {
  --tw-text-opacity: 1;
  color: rgba(67, 136, 33, var(--tw-text-opacity, 1));
}
.before_ccontent-_b_q11111_q_B:before {
  --tw-content: '11111';
  content: var(--tw-content);
}
.before_ccontent-_b_q222_q_B:before {
  --tw-content: '222';
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-_b_hec4f4f_B {
    --tw-text-opacity: 1;
    color: rgba(236, 79, 79, var(--tw-text-opacity, 1));
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
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0rpx;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:
;
}
.container {
  width: 100%;
}
@media (min-width: 640px) {
  .container {
    max-width: 640rpx;
  }
}
@media (min-width: 768px) {
  .container {
    max-width: 768rpx;
  }
}
@media (min-width: 1024px) {
  .container {
    max-width: 1024rpx;
  }
}
@media (min-width: 1280px) {
  .container {
    max-width: 1280rpx;
  }
}
@media (min-width: 1536px) {
  .container {
    max-width: 1536rpx;
  }
}
.visible {
  visibility: visible;
}
.static {
  position: static;
}
.fixed {
  position: fixed;
}
.block {
  display: block;
}
.inline {
  display: inline;
}
.flex {
  display: flex;
}
.table {
  display: table;
}
.grid {
  display: grid;
}
.hidden {
  display: none;
}
.transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x))
    scaleY(var(--tw-scale-y));
}
.resize {
  resize: both;
}
.flex-col {
  flex-direction: column;
}
.divide-x-8 > view + view,
.divide-x-8 > view + text,
.divide-x-8 > text + view,
.divide-x-8 > text + text {
  --tw-divide-x-reverse: 0;
  border-right-width: calc(8rpx * var(--tw-divide-x-reverse));
  border-left-width: calc(8rpx * (1 - var(--tw-divide-x-reverse)));
}
.divide-solid > view + view,
.divide-solid > view + text,
.divide-solid > text + view,
.divide-solid > text + text {
  border-style: solid;
}
.divide-_b_h60d256_B > view + view,
.divide-_b_h60d256_B > view + text,
.divide-_b_h60d256_B > text + view,
.divide-_b_h60d256_B > text + text {
  --tw-divide-opacity: 1;
  border-color: rgba(96, 210, 86, var(--tw-divide-opacity, 1));
}
.border {
  border-width: 1rpx;
}
.bg-_b_h89ab8d_B {
  --tw-bg-opacity: 1;
  background-color: rgba(137, 171, 141, var(--tw-bg-opacity, 1));
}
.bg-_b_he24826_B {
  --tw-bg-opacity: 1;
  background-color: rgba(226, 72, 38, var(--tw-bg-opacity, 1));
}
.text-_b66rpx_B {
  font-size: 66rpx;
}
.text-_b_h3d31a4_B {
  --tw-text-opacity: 1;
  color: rgba(61, 49, 164, var(--tw-text-opacity, 1));
}
.text-_b_h438821_B {
  --tw-text-opacity: 1;
  color: rgba(67, 136, 33, var(--tw-text-opacity, 1));
}
.outline {
  outline-style: solid;
}
.blur {
  --tw-blur: blur(8rpx);
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.filter {
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}
.transition {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}
.before_ccontent-_b_q11111_q_B::before {
  --tw-content: '11111';
  content: var(--tw-content);
}
.before_ccontent-_b_q222_q_B::before {
  --tw-content: '222';
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  .dark_ctext-_b_hec4f4f_B {
    --tw-text-opacity: 1;
    color: rgba(236, 79, 79, var(--tw-text-opacity, 1));
  }
}

.tw-page-style-watch-anchor {
  color: inherit;
}
```
