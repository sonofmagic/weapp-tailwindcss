# weapp-vite-tailwindcss-v4 CSS Output

Fixture: demo
Entry: weapp-vite-tailwindcss-v4/dist/app.wxss
Generator CSS files: app.wxss, apple.wxss, index.wxss, index.wxss, index.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 20591 | 59 | false | false | false | false | true |

## Generator CSS

```css
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
  --tw-space-y-reverse: 0;
  --tw-space-x-reverse: 0;
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
  --tw-content: '';
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-red-700: rgb(191, 0, 15);
  --color-amber-300: rgb(255, 210, 55);
  --color-blue-300: rgb(145, 197, 255);
  --color-pink-300: rgb(253, 165, 213);
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --spacing: 8rpx;
  --default-transition-duration: 150ms;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
  --preprocessor-entry-marker: #1d4ed8;
}
.flex {
  display: -webkit-flex;
  display: flex;
}
.inline {
  display: inline;
}
.inline-block {
  display: inline-block;
}
.size-12 {
  width: calc(var(--spacing) * 12);
  height: calc(var(--spacing) * 12);
}
.h-10 {
  height: calc(var(--spacing) * 10);
}
.h-_b30px_B {
  height: 30px;
}
.h-_b45px_B {
  height: 45px;
}
.min-h-screen {
  min-height: 100vh;
}
.w-_b50px_B {
  width: 50px;
}
.w-_b323px_B {
  width: 323px;
}
.transform {
  -webkit-transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
}
.resize {
  resize: both;
}
.flex-col {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.space-y-2_d5 > view + view,
.space-y-2_d5 > view + text,
.space-y-2_d5 > text + view,
.space-y-2_d5 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 2.5) * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 2.5) * (1 - var(--tw-space-y-reverse)));
}
.space-x-2_d5 > view + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: calc((var(--spacing) * 2.5) * var(--tw-space-x-reverse));
  margin-left: calc((var(--spacing) * 2.5) * (1 - var(--tw-space-x-reverse)));
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rounded {
  border-radius: 8rpx;
}
.border-4 {
  border-style: var(--tw-border-style);
  border-width: 4px;
}
.bg-_b_h3a32d1_B {
  background-color: #3a32d1;
}
.bg-_b_h68c828_B {
  background-color: #68c828;
}
.bg-amber-300 {
  background-color: var(--color-amber-300);
}
.bg-blue-500_f30 {
  background-color: rgba(50, 128, 255, 0.3);
}
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
.bg-zinc-50 {
  background-color: var(--color-zinc-50);
}
.bg-gradient-to-b {
  --tw-gradient-position: to bottom;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-t {
  --tw-gradient-position: to top;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-tr {
  --tw-gradient-position: to top right;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.from-_b_h2f73f1_B {
  --tw-gradient-from: #2f73f1;
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.to-_b_h4bcefd_B {
  --tw-gradient-to: #4bcefd;
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.p-4 {
  padding: calc(var(--spacing) * 4);
}
.text-_b100px_B {
  font-size: 100px;
}
.text-_b100rpx_B {
  font-size: 100rpx;
}
.text-_b_h123322_B {
  color: #123322;
}
.text-_b_h123456_B {
  color: #123456;
}
.text-blue-300 {
  color: var(--color-blue-300);
}
.text-pink-300 {
  color: var(--color-pink-300);
}
.text-red-700 {
  color: var(--color-red-700);
}
.capitalize {
  text-transform: capitalize;
}
.invert {
  --tw-invert: invert(100%);
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
    color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow,
    transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
}
.before_ccontent-_b_aindependent_subpackage_weapp-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage weapp-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_weapp-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage weapp-vite-tailwindcss-v4';
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-900 {
    background-color: var(--color-zinc-900);
  }
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


/* stylelint-disable-next-line import-notation */
.s .a {
  color: turquoise;
}

.user-motto {
  font-size: 12px;
}

:host,
page,
.tw-root,
wx-root-portal-content {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-red-700: rgb(191, 0, 15);
  --color-amber-300: rgb(255, 210, 55);
  --color-blue-300: rgb(145, 197, 255);
  --color-pink-300: rgb(253, 165, 213);
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --spacing: 8rpx;
  --default-transition-duration: 150ms;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.flex {
  display: -webkit-flex;
  display: flex;
}
.inline {
  display: inline;
}
.inline-block {
  display: inline-block;
}
.size-12 {
  width: calc(var(--spacing) * 12);
  height: calc(var(--spacing) * 12);
}
.h-10 {
  height: calc(var(--spacing) * 10);
}
.h-_b30px_B {
  height: 30px;
}
.h-_b45px_B {
  height: 45px;
}
.min-h-screen {
  min-height: 100vh;
}
.w-_b50px_B {
  width: 50px;
}
.w-_b323px_B {
  width: 323px;
}
.transform {
  -webkit-transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
}
.resize {
  resize: both;
}
.flex-col {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.space-y-2_d5 > view + view,
.space-y-2_d5 > view + text,
.space-y-2_d5 > text + view,
.space-y-2_d5 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 2.5) * var(--tw-space-y-reverse));
  margin-bottom: calc(var(--spacing) * 2.5 * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 2.5) * (1 - var(--tw-space-y-reverse)));
  margin-top: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-y-reverse)));
}
.space-x-2_d5 > view + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: calc((var(--spacing) * 2.5) * var(--tw-space-x-reverse));
  margin-right: calc(var(--spacing) * 2.5 * var(--tw-space-x-reverse));
  margin-left: calc((var(--spacing) * 2.5) * (1 - var(--tw-space-x-reverse)));
  margin-left: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-x-reverse)));
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rounded {
  border-radius: 8rpx;
}
.border-4 {
  border-style: var(--tw-border-style);
  border-width: 4px;
}
.bg-_b_h3a32d1_B {
  background-color: #3a32d1;
}
.bg-_b_h68c828_B {
  background-color: #68c828;
}
.bg-amber-300 {
  background-color: var(--color-amber-300);
}
.bg-blue-500_f30 {
  background-color: rgba(50, 128, 255, 0.3);
}
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
.bg-zinc-50 {
  background-color: var(--color-zinc-50);
}
.bg-gradient-to-b {
  --tw-gradient-position: to bottom in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-t {
  --tw-gradient-position: to top in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-tr {
  --tw-gradient-position: to top right in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.from-_b_h2f73f1_B {
  --tw-gradient-from: #2f73f1;
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.to-_b_h4bcefd_B {
  --tw-gradient-to: #4bcefd;
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.p-4 {
  padding: calc(var(--spacing) * 4);
}
.text-_b100px_B {
  font-size: 100px;
}
.text-_b100rpx_B {
  font-size: 100rpx;
}
.text-_b_h123322_B {
  color: #123322;
}
.text-_b_h123456_B {
  color: #123456;
}
.text-blue-300 {
  color: var(--color-blue-300);
}
.text-pink-300 {
  color: var(--color-pink-300);
}
.text-red-700 {
  color: var(--color-red-700);
}
.capitalize {
  text-transform: capitalize;
}
.invert {
  --tw-invert: invert(100%);
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
    color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow,
    transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
}
.before_ccontent-_b_aindependent_subpackage_weapp-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage weapp-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_weapp-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage weapp-vite-tailwindcss-v4';
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-900 {
    background-color: var(--color-zinc-900);
  }
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
.table {
  display: table;
}
.h-_b29_d292px_B {
  height: 29.292px;
}

:host,
page,
.tw-root,
wx-root-portal-content {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-red-700: rgb(191, 0, 15);
  --color-amber-300: rgb(255, 210, 55);
  --color-blue-300: rgb(145, 197, 255);
  --color-pink-300: rgb(253, 165, 213);
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --spacing: 8rpx;
  --default-transition-duration: 150ms;
  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
.flex {
  display: -webkit-flex;
  display: flex;
}
.inline {
  display: inline;
}
.inline-block {
  display: inline-block;
}
.size-12 {
  width: calc(var(--spacing) * 12);
  height: calc(var(--spacing) * 12);
}
.h-10 {
  height: calc(var(--spacing) * 10);
}
.h-_b30px_B {
  height: 30px;
}
.h-_b45px_B {
  height: 45px;
}
.min-h-screen {
  min-height: 100vh;
}
.w-_b50px_B {
  width: 50px;
}
.w-_b323px_B {
  width: 323px;
}
.transform {
  -webkit-transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
}
.resize {
  resize: both;
}
.flex-col {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.space-y-2_d5 > view + view,
.space-y-2_d5 > view + text,
.space-y-2_d5 > text + view,
.space-y-2_d5 > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 2.5) * var(--tw-space-y-reverse));
  margin-bottom: calc(var(--spacing) * 2.5 * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 2.5) * (1 - var(--tw-space-y-reverse)));
  margin-top: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-y-reverse)));
}
.space-x-2_d5 > view + view,
.space-x-2_d5 > view + text,
.space-x-2_d5 > text + view,
.space-x-2_d5 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: calc((var(--spacing) * 2.5) * var(--tw-space-x-reverse));
  margin-right: calc(var(--spacing) * 2.5 * var(--tw-space-x-reverse));
  margin-left: calc((var(--spacing) * 2.5) * (1 - var(--tw-space-x-reverse)));
  margin-left: calc(var(--spacing) * 2.5 * (1 - var(--tw-space-x-reverse)));
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rounded {
  border-radius: 8rpx;
}
.border-4 {
  border-style: var(--tw-border-style);
  border-width: 4px;
}
.bg-_b_h3a32d1_B {
  background-color: #3a32d1;
}
.bg-_b_h68c828_B {
  background-color: #68c828;
}
.bg-amber-300 {
  background-color: var(--color-amber-300);
}
.bg-blue-500_f30 {
  background-color: rgba(50, 128, 255, 0.3);
}
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
.bg-zinc-50 {
  background-color: var(--color-zinc-50);
}
.bg-gradient-to-b {
  --tw-gradient-position: to bottom in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-t {
  --tw-gradient-position: to top in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.bg-gradient-to-tr {
  --tw-gradient-position: to top right in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
.from-_b_h2f73f1_B {
  --tw-gradient-from: #2f73f1;
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.to-_b_h4bcefd_B {
  --tw-gradient-to: #4bcefd;
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
.p-4 {
  padding: calc(var(--spacing) * 4);
}
.text-_b100px_B {
  font-size: 100px;
}
.text-_b100rpx_B {
  font-size: 100rpx;
}
.text-_b_h123322_B {
  color: #123322;
}
.text-_b_h123456_B {
  color: #123456;
}
.text-blue-300 {
  color: var(--color-blue-300);
}
.text-pink-300 {
  color: var(--color-pink-300);
}
.text-red-700 {
  color: var(--color-red-700);
}
.capitalize {
  text-transform: capitalize;
}
.invert {
  --tw-invert: invert(100%);
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
    color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow,
    transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
  transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
  transition-duration: var(--tw-duration, var(--default-transition-duration));
}
.before_ccontent-_b_aindependent_subpackage_weapp-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage weapp-vite-tailwindcss-v4';
  content: var(--tw-content);
}
.before_ccontent-_b_anormal_subpackage_weapp-vite-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage weapp-vite-tailwindcss-v4';
  content: var(--tw-content);
}
@media (prefers-color-scheme: dark) {
  .dark_cbg-zinc-900 {
    background-color: var(--color-zinc-900);
  }
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
```
