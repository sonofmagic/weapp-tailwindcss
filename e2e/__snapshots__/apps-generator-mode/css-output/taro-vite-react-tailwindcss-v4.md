# taro-vite-react-tailwindcss-v4 CSS Output

Fixture: demo
Entry: taro-vite-react-tailwindcss-v4/dist/app.wxss
Generator CSS files: app.wxss, app-origin.wxss, index.wxss, index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 10938 | 43 | false | false | false | false | true |

## Generator CSS

```css
@import 'app-origin.wxss';

:host,
page,
.tw-root,
wx-root-portal-content {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
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
.flex-shrink {
  -webkit-flex-shrink: 1;
  flex-shrink: 1;
}
.flex-grow {
  -webkit-flex-grow: 1;
  flex-grow: 1;
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
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
.bg-normal-subpackage-marker {
  background-color: #2563eb;
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
  --tw-gradient-position: to right in oklab;
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
.shadow {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.outline {
  outline-style: var(--tw-outline-style);
  outline-width: 1px;
}
.blur {
  --tw-blur: blur(8px);
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
.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-vite-react-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-vite-react-tailwindcss-v4';
  content: var(--tw-content);
}

.tw-page-style-watch-anchor {
  color: inherit;
}

:host,
page,
.tw-root,
wx-root-portal-content {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
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
.flex-shrink {
  -webkit-flex-shrink: 1;
  flex-shrink: 1;
}
.flex-grow {
  -webkit-flex-grow: 1;
  flex-grow: 1;
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
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
.bg-normal-subpackage-marker {
  background-color: #2563eb;
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
  --tw-gradient-position: to right in oklab;
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
.shadow {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.outline {
  outline-style: var(--tw-outline-style);
  outline-width: 1px;
}
.blur {
  --tw-blur: blur(8px);
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
.before_ccontent-_b_aindependent_subpackage_taro-vite-react-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-vite-react-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_taro-vite-react-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-vite-react-tailwindcss-v4';
  content: var(--tw-content);
}
```
