# taro-vite-tailwindcss-v4 CSS Output Comparison

Fixture: demo
Entry: taro-vite-tailwindcss-v4/dist/app.wxss
Legacy CSS files: app.wxss, app-origin.wxss, index.wxss
Generator CSS files: app.wxss, app-origin.wxss, index.wxss

| Mode | Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- |
| legacy | 2050 | 16 | false | false | false | false | true |
| generator | 5534 | 34 | false | false | false | false | true |

## Diff

```diff
===================================================================
--- taro-vite-tailwindcss-v4/legacy.css
+++ taro-vite-tailwindcss-v4/generator.css
@@ -4,10 +4,16 @@
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
+  --tw-rotate-x: initial;
+  --tw-rotate-y: initial;
+  --tw-rotate-z: initial;
+  --tw-skew-x: initial;
+  --tw-skew-y: initial;
+  --tw-border-style: solid;
   --tw-gradient-position: initial;
   --tw-gradient-from: rgba(0, 0, 0, 0);
   --tw-gradient-via: rgba(0, 0, 0, 0);
@@ -17,41 +23,112 @@
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
+  --tw-ease: initial;
+  --font-sans:
+    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
+    'Noto Color Emoji';
+  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
   --color-cyan-500: rgb(0, 182, 212);
   --color-blue-500: rgb(50, 128, 255);
   --color-purple-300: rgb(216, 180, 255);
   --spacing: 8rpx;
+  --ease-out: cubic-bezier(0, 0, 0.2, 1);
+  --default-transition-duration: 150ms;
+  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
+  --default-font-family: var(--font-sans);
+  --default-mono-font-family: var(--font-mono);
 }
-view,
-text,
-:after,
-:before {
-  box-sizing: border-box;
-  border: 0 solid;
-  margin: 0;
-  padding: 0;
+.visible {
+  visibility: visible;
 }
+.fixed {
+  position: fixed;
+}
+.static {
+  position: static;
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
+.flex {
+  display: -webkit-flex;
+  display: flex;
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
+.table {
+  display: table;
+}
 .h-14 {
-  height: 112rpx;
   height: calc(var(--spacing) * 14);
 }
 .h-_b300px_B {
   height: 300rpx;
 }
+.transform {
+  -webkit-transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
+  transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
+}
+.resize {
+  resize: both;
+}
+.border {
+  border-style: var(--tw-border-style);
+  border-width: 1rpx;
+}
 .bg-_b_h123456_B {
   background-color: #123456;
 }
 .bg-purple-300 {
-  background-color: rgb(216, 180, 255);
   background-color: var(--color-purple-300);
 }
 .bg-linear-to-r {
@@ -82,15 +159,64 @@
     var(--tw-gradient-to) var(--tw-gradient-to-position)
   );
 }
-.text-_b55rpx_B {
-  font-size: 55rpx;
-}
 .text-_b_hc31d6b_B {
   color: #c31d6b;
 }
 .text-_b_hfff_B {
   color: #fff;
 }
+.text-_b55rpx_B {
+  font-size: 55rpx;
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
+.filter {
+  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
+    var(--tw-drop-shadow,);
+  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
+    var(--tw-drop-shadow,);
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

 .tw-page-style-watch-anchor {
   color: inherit;
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
  --color-cyan-500: rgb(0, 182, 212);
  --color-blue-500: rgb(50, 128, 255);
  --color-purple-300: rgb(216, 180, 255);
  --spacing: 8rpx;
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
.h-14 {
  height: 112rpx;
  height: calc(var(--spacing) * 14);
}
.h-_b300px_B {
  height: 300rpx;
}
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-purple-300 {
  background-color: rgb(216, 180, 255);
  background-color: var(--color-purple-300);
}
.bg-linear-to-r {
  --tw-gradient-position: to right;
}
.bg-linear-to-r {
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
.to-blue-500 {
  --tw-gradient-to: var(--color-blue-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
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
  --tw-rotate-x: initial;
  --tw-rotate-y: initial;
  --tw-rotate-z: initial;
  --tw-skew-x: initial;
  --tw-skew-y: initial;
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
  --tw-ease: initial;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-cyan-500: rgb(0, 182, 212);
  --color-blue-500: rgb(50, 128, 255);
  --color-purple-300: rgb(216, 180, 255);
  --spacing: 8rpx;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --default-transition-duration: 150ms;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.visible {
  visibility: visible;
}
.fixed {
  position: fixed;
}
.static {
  position: static;
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
.flex {
  display: -webkit-flex;
  display: flex;
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
.table {
  display: table;
}
.h-14 {
  height: calc(var(--spacing) * 14);
}
.h-_b300px_B {
  height: 300rpx;
}
.transform {
  -webkit-transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
}
.resize {
  resize: both;
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1rpx;
}
.bg-_b_h123456_B {
  background-color: #123456;
}
.bg-purple-300 {
  background-color: var(--color-purple-300);
}
.bg-linear-to-r {
  --tw-gradient-position: to right;
}
.bg-linear-to-r {
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
.to-blue-500 {
  --tw-gradient-to: var(--color-blue-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.text-_b_hc31d6b_B {
  color: #c31d6b;
}
.text-_b_hfff_B {
  color: #fff;
}
.text-_b55rpx_B {
  font-size: 55rpx;
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
.filter {
  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
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

.tw-page-style-watch-anchor {
  color: inherit;
}
```
