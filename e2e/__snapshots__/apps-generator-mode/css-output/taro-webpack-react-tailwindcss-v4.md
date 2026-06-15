# taro-webpack-react-tailwindcss-v4 CSS Output

Fixture: demo
Entry: taro-webpack-react-tailwindcss-v4/dist/app.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| 12920 | 78 | false | false | false | true | true | false | true |

## Generator CSS Files

| # | File |
| ---: | --- |
| 1 | `app.wxss` |
| 2 | `pages/index/index.wxss` |
| 3 | `sub-independent/pages/index.wxss` |
| 4 | `sub-normal/pages/index.wxss` |

## Generator CSS Summary

| File | Bytes | Selectors | @supports | :hover | Tailwind banner | System dark media | Manual dark selector | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- | --- |
| `app.wxss` | 6775 | 40 | false | false | false | true | true | false | true |
| `pages/index/index.wxss` | 4044 | 38 | false | false | false | false | false | false | false |
| `sub-independent/pages/index.wxss` | 1126 | 6 | false | false | false | false | false | false | true |
| `sub-normal/pages/index.wxss` | 1091 | 6 | false | false | false | false | false | false | true |

## Generator CSS

### app.wxss

```css
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-rotate-x:;
  --tw-rotate-y:;
  --tw-rotate-z:;
  --tw-skew-x:;
  --tw-skew-y:;
  --tw-gradient-position: initial;
  --tw-gradient-from: #0000;
  --tw-gradient-to: #0000;
  --tw-gradient-stops: initial;
  --tw-gradient-via-stops: initial;
  --tw-gradient-from-position: 0%;
  --tw-gradient-to-position: 100%;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-slate-100: #f1f5f9;
  --color-zinc-950: #09090b;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --color-slate-900: rgb(15, 23, 43);
  --color-white: #fff;
  --color-purple-800: #6b21a8;
  --color-pink-200: #fbcfe8;
  --color-zinc-50: rgb(250, 250, 250);
  --color-zinc-900: rgb(24, 24, 27);
  --spacing: 8rpx;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
 /* tokens: absolute <= src/pages/issue-909/index.tsx */
.absolute {
  position: absolute;
}
 /* tokens: relative <= src/pages/issue-909/index.tsx */
.relative {
  position: relative;
}
 /* tokens: mt-2 <= src/pages/index/index.tsx */
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
 /* tokens: mt-4 <= src/pages/index/index.tsx */
.mt-4 {
  margin-top: calc(var(--spacing) * 4);
}
 /* tokens: flex <= src/pages/issue-909/index.tsx */
.flex {
  display: flex;
}
 /* tokens: h-8 <= src/pages/issue-909/index.tsx */
.h-8 {
  height: calc(var(--spacing) * 8);
}
 /* tokens: h-14 <= src/pages/index/index.tsx */
.h-14 {
  height: calc(var(--spacing) * 14);
}
 /* tokens: w-8 <= src/pages/issue-909/index.tsx */
.w-8 {
  width: calc(var(--spacing) * 8);
}
 /* tokens: rotate-x-45 <= src/pages/issue-909/index.tsx */
.rotate-x-45 {
  --tw-rotate-x: rotateX(45deg);
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
 /* tokens: -rotate-y-45 <= src/pages/issue-909/index.tsx */
.-rotate-y-45 {
  --tw-rotate-y: rotateY(-45deg);
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
 /* tokens: rotate-y-45 <= src/pages/issue-909/index.tsx */
.rotate-y-45 {
  --tw-rotate-y: rotateY(45deg);
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
 /* tokens: rotate-y-90 <= src/pages/issue-909/index.tsx */
.rotate-y-90 {
  --tw-rotate-y: rotateY(90deg);
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
 /* tokens: rotate-z-45 <= src/pages/issue-909/index.tsx */
.rotate-z-45 {
  --tw-rotate-z: rotateZ(45deg);
  transform: var(--tw-rotate-x, ) var(--tw-rotate-y, ) var(--tw-rotate-z, ) var(--tw-skew-x, ) var(--tw-skew-y, );
}
 /* tokens: rounded <= src/pages/index/index.tsx */
.rounded {
  border-radius: 8rpx;
}
 /* tokens: bg-[#534312] <= src/pages/index/index.tsx */
.bg-_b_h534312_B {
  background-color: #534312;
}
 /* tokens: bg-purple-800 <= src/pages/index/index.tsx */
.bg-purple-800 {
  background-color: var(--color-purple-800);
}
 /* tokens: bg-white <= src/pages/index/index.tsx */
.bg-white {
  background-color: var(--color-white);
}
 /* tokens: bg-gradient-to-r <= src/pages/index/index.tsx */
.bg-gradient-to-r {
  --tw-gradient-position: to right in oklab;
  background-image: linear-gradient(var(--tw-gradient-stops));
}
 /* tokens: from-cyan-500 <= src/pages/index/index.tsx */
.from-cyan-500 {
  --tw-gradient-from: var(--color-cyan-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
 /* tokens: to-blue-500 <= src/pages/index/index.tsx */
.to-blue-500 {
  --tw-gradient-to: var(--color-blue-500);
  --tw-gradient-stops: var(
    --tw-gradient-via-stops,
    var(--tw-gradient-position),
    var(--tw-gradient-from) var(--tw-gradient-from-position),
    var(--tw-gradient-to) var(--tw-gradient-to-position)
  );
}
 /* tokens: px-3 <= src/pages/index/index.tsx */
.px-3 {
  padding-left: calc(var(--spacing) * 3);
  padding-right: calc(var(--spacing) * 3);
}
 /* tokens: px-4 <= src/pages/index/index.tsx */
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
 /* tokens: py-2 <= src/pages/index/index.tsx */
.py-2 {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
 /* tokens: py-3 <= src/pages/index/index.tsx */
.py-3 {
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
 /* tokens: text-[100rpx] <= src/pages/index/index.tsx */
.text-_b100rpx_B {
  font-size: 100rpx;
}
 /* tokens: text-[#fff] <= src/pages/index/index.tsx */
.text-_b_hfff_B {
  color: #fff;
}
 /* tokens: text-pink-200 <= src/pages/index/index.tsx */
.text-pink-200 {
  color: var(--color-pink-200);
}
 /* tokens: text-slate-900 <= src/pages/index/index.tsx */
.text-slate-900 {
  color: var(--color-slate-900);
}
 /* tokens: dark:bg-zinc-900 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.dark_cbg-zinc-900.theme-dark {
  background-color: var(--color-zinc-900);
}
 /* tokens: theme-dark <= src/pages/index/index.tsx | dark:bg-zinc-900 <= src/pages/index/index.tsx */
.theme-dark .dark_cbg-zinc-900 {
  background-color: var(--color-zinc-900);
}
 /* tokens: dark:bg-zinc-950 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.dark_cbg-zinc-950.theme-dark {
  background-color: var(--color-zinc-950);
}
 /* tokens: theme-dark <= src/pages/index/index.tsx | dark:bg-zinc-950 <= src/pages/index/index.tsx */
.theme-dark .dark_cbg-zinc-950 {
  background-color: var(--color-zinc-950);
}
 /* tokens: dark:text-zinc-50 <= src/pages/index/index.tsx | theme-dark <= src/pages/index/index.tsx */
.dark_ctext-zinc-50.theme-dark {
  color: var(--color-zinc-50);
}
 /* tokens: theme-dark <= src/pages/index/index.tsx | dark:text-zinc-50 <= src/pages/index/index.tsx */
.theme-dark .dark_ctext-zinc-50 {
  color: var(--color-zinc-50);
}
@media (prefers-color-scheme: dark) {
 /* tokens: system-dark:bg-slate-900 <= src/pages/index/index.tsx */
  .system-dark_cbg-slate-900 {
    background-color: var(--color-slate-900);
  }
}
@media (prefers-color-scheme: dark) {
 /* tokens: system-dark:text-slate-100 <= src/pages/index/index.tsx */
  .system-dark_ctext-slate-100 {
    color: var(--color-slate-100);
  }
}
view {
  box-sizing: border-box;
}
```

### pages/index/index.wxss

```css
.tw-page-style-watch-anchor {
  color: inherit;
}
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --nut-icon-height: 32rpx;
  --nut-icon-width: 32rpx;
  --nut-icon-line-height: 32rpx;
  --nut-icon-color: #171a26;
  --animate-duration: 1s;
  --animate-delay: 0s;
}
.nut-icon {
  color: var(--nut-icon-color, #171a26);
  display: inline-block;
  font-size: var(--nut-icon-width, 32rpx);
  height: var(--nut-icon-height, 32rpx);
  line-height: var(--nut-icon-line-height, 32rpx);
  position: relative;
  text-align: right;
  width: var(--nut-icon-width, 32rpx);
}
.nut-icon-img {
  height: var(--nut-icon-height);
  object-fit: contain;
  width: var(--nut-icon-width);
}
.nut-icon-Loading,
.nut-icon-Loading1,
.nut-icon-loading,
.nut-icon-loading1 {
  animation: rotation 1s linear infinite;
  display: inline-block;
}
.nut-icon-am-infinite {
  animation-direction: alternate;
  animation-iteration-count: infinite;
}
.nut-icon-am-jump {
  animation-delay: var(--animate-delay);
  animation-duration: var(--animate-duration);
  animation-name: nutJumpOne;
  animation-timing-function: ease;
}
.nut-icon-am-jump.nut-icon-am-infinite {
  animation-name: nutJump;
}
.nut-icon-am-rotate {
  animation-delay: var(--animate-delay);
  animation-duration: var(--animate-duration);
  animation-name: rotation;
  animation-timing-function: linear;
}
.nut-icon-am-rotate.nut-icon-am-infinite {
  animation-direction: normal;
}
.nut-icon-am-blink {
  animation-delay: var(--animate-delay);
  animation-duration: var(--animate-duration);
  animation-name: nutBlink;
  animation-timing-function: linear;
}
.nut-icon-am-breathe {
  animation-delay: var(--animate-delay);
  animation-duration: var(--animate-duration);
  animation-name: nutBreathe;
  animation-timing-function: ease-in-out;
}
.nut-icon-am-flash {
  animation-delay: var(--animate-delay);
  animation-duration: var(--animate-duration);
  animation-name: nutFlash;
  animation-timing-function: ease-in-out;
}
.nut-icon-am-bounce {
  animation-delay: var(--animate-delay);
  animation-duration: var(--animate-duration);
  animation-name: nutBounce;
  animation-timing-function: ease-in-out;
}
.nut-icon-am-bounce.nut-icon-am-infinite {
  animation-direction: normal;
}
.nut-icon-am-shake {
  animation-delay: var(--animate-delay);
  animation-duration: var(--animate-duration);
  animation-name: nutShake;
  animation-timing-function: ease-in-out;
}
@keyframes rotation {
  0% {
  }
  to {
  }
}
@keyframes nutJump {
  to {
    transform: scale3d(0.8, 1, 0.9) translateY(-20rpx);
  }
}
@keyframes nutJumpOne {
  50% {
    transform: scale3d(0.8, 1, 0.9) translateY(-20rpx);
  }
  to {
    transform: scaleZ(1) translateY(0);
  }
}
@keyframes nutBlink {
  0% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes nutBreathe {
  0%,
  to {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
@keyframes nutFlash {
  0%,
  50%,
  to {
    opacity: 1;
  }
  25%,
  75% {
    opacity: 0;
  }
}
@keyframes nutBounce {
  0%,
  20%,
  53%,
  to {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translateZ(0);
  }
  40%,
  43% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -60rpx, 0) scaleY(1.1);
  }
  70% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -30rpx, 0) scaleY(1.05);
  }
  80% {
    transform: translateZ(0) scaleY(0.95);
    transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
  }
  90% {
    transform: translate3d(0, -8rpx, 0) scaleY(1.02);
  }
}
@keyframes nutShake {
  0% {
    transform: translate(0);
  }
  6.5% {
    transform: translate(-12rpx) rotateY(-9deg);
  }
  18.5% {
    transform: translate(10rpx) rotateY(7deg);
  }
  31.5% {
    transform: translate(-6rpx) rotateY(-5deg);
  }
  43.5% {
    transform: translate(4rpx) rotateY(3deg);
  }
  50% {
    transform: translate(0);
  }
}
```

### sub-independent/pages/index.wxss

```css
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-content: '';
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
 /* tokens: bg-independent-subpackage-marker <= src/sub-independent/pages/index.tsx */
.before_ccontent-_b_aindependent_subpackage_taro-webpack-react-tailwindcss-v4_a_B::before {
  --tw-content: 'independent subpackage taro-webpack-react-tailwindcss-v4';
  content: var(--tw-content);
}
 /* tokens: before:content-['independent_subpackage_taro-webpack-react-tailwindcss-v4'] <= src/sub-independent/pages/index.tsx */
.bg-independent-subpackage-marker {
  background-color: #dc2626;
}
```

### sub-normal/pages/index.wxss

```css
view,
text,
::after,
::before {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: 0 solid;
  --tw-content: '';
}
:host,
page,
.tw-root,
wx-root-portal-content {
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
 /* tokens: bg-normal-subpackage-marker <= src/sub-normal/pages/index.tsx */
.before_ccontent-_b_anormal_subpackage_taro-webpack-react-tailwindcss-v4_a_B::before {
  --tw-content: 'normal subpackage taro-webpack-react-tailwindcss-v4';
  content: var(--tw-content);
}
 /* tokens: before:content-['normal_subpackage_taro-webpack-react-tailwindcss-v4'] <= src/sub-normal/pages/index.tsx */
.bg-normal-subpackage-marker {
  background-color: #2563eb;
}
```
