# uni-app-tailwindcss-v4 CSS Output Comparison

Fixture: demo
Entry: uni-app-tailwindcss-v4/dist/build/mp-weixin/app.wxss
Legacy CSS files: app.wxss, home.wxss, user.wxss
Generator CSS files: app.wxss, home.wxss, user.wxss

| Mode | Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- |
| legacy | 49689 | 274 | true | false | false | false | true |
| generator | 673 | 2 | false | false | false | false | false |

## Legacy CSS

```css
::before,
::after {
  --tw-content: '';
}
view,
text,
:before,
:after {
  --tw-space-y-reverse: 0;
  --tw-space-x-reverse: 0;
  --tw-divide-x-reverse: 0;
  --tw-border-style: solid;
  --tw-divide-y-reverse: 0;
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
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
}
page,
.tw-root,
wx-root-portal-content,
:host {
  --color-emerald-500: rgb(0, 185, 129);
  --color-emerald-600: rgb(0, 150, 105);
  --color-white: #fff;
  --spacing: 8rpx;
  --font-weight-bold: 700;
  --color-neutral-1B: #1b1b1b;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
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
.mt-6 {
  margin-top: 48rpx;
  margin-top: calc(var(--spacing) * 6);
}
.i-mdi-home {
  width: 1em;
  height: 1em;
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/svg%3E");
  -webkit-mask-image: var(--svg);
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/svg%3E");
  mask-image: var(--svg);
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/svg%3E");
  background-color: currentColor;
  display: inline-block;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
.flex {
  display: -webkit-flex;
  display: flex;
}
.aspect-_p--my-aspect-ratio_P {
  aspect-ratio: var(--my-aspect-ratio);
}
.aspect-_bcalc_p4_x3_u1_P_f3_B {
  aspect-ratio: 13/3;
}
.h-20 {
  height: 160rpx;
  height: calc(var(--spacing) * 20);
}
.w-20 {
  width: 160rpx;
  width: calc(var(--spacing) * 20);
}
.flex-col {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.flex-col-reverse {
  -webkit-flex-direction: column-reverse;
  flex-direction: column-reverse;
}
.flex-row-reverse {
  -webkit-flex-direction: row-reverse;
  flex-direction: row-reverse;
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
.space-y-reverse > view + view,
.space-y-reverse > view + text,
.space-y-reverse > text + view,
.space-y-reverse > text + text {
  --tw-space-y-reverse: 1;
}
.space-x-4 > view + view,
.space-x-4 > view + text,
.space-x-4 > text + view,
.space-x-4 > text + text {
  --tw-space-x-reverse: 0;
  margin-right: 0rpx;
  margin-right: calc((var(--spacing) * 4) * var(--tw-space-x-reverse));
  margin-left: 32rpx;
  margin-left: calc((var(--spacing) * 4) * (1 - var(--tw-space-x-reverse)));
}
.space-x-reverse > view + view,
.space-x-reverse > view + text,
.space-x-reverse > text + view,
.space-x-reverse > text + text {
  --tw-space-x-reverse: 1;
}
.divide-x-4 > view + view,
.divide-x-4 > view + text,
.divide-x-4 > text + view,
.divide-x-4 > text + text {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: 0px;
  border-right-width: calc(4px * var(--tw-divide-x-reverse));
  border-left-width: 4px;
  border-left-width: calc(4px * (1 - var(--tw-divide-x-reverse)));
}
.divide-y-4 > view + view,
.divide-y-4 > view + text,
.divide-y-4 > text + view,
.divide-y-4 > text + text {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: 0px;
  border-bottom-width: calc(4px * var(--tw-divide-y-reverse));
  border-top-width: 4px;
  border-top-width: calc(4px * (1 - var(--tw-divide-y-reverse)));
}
.divide-y-reverse > view + view,
.divide-y-reverse > view + text,
.divide-y-reverse > text + view,
.divide-y-reverse > text + text {
  --tw-divide-y-reverse: 1;
}
.divide-dotted > view + view,
.divide-dotted > view + text,
.divide-dotted > text + view,
.divide-dotted > text + text {
  --tw-border-style: dotted;
  border-style: dotted;
}
.divide-double > view + view,
.divide-double > view + text,
.divide-double > text + view,
.divide-double > text + text {
  --tw-border-style: double;
  border-style: double;
}
.divide-_b_h41eb04_B > view + view,
.divide-_b_h41eb04_B > view + text,
.divide-_b_h41eb04_B > text + view,
.divide-_b_h41eb04_B > text + text {
  border-color: #41eb04;
}
.divide-_b_hd80c0c_B > view + view,
.divide-_b_hd80c0c_B > view + text,
.divide-_b_hd80c0c_B > text + view,
.divide-_b_hd80c0c_B > text + text {
  border-color: #d80c0c;
}
.rounded-xl {
  border-radius: 16rpx;
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.bg-_b_h0000ff_B {
  background-color: #00f;
}
.bg-_b_h123498_B {
  background-color: #123498;
}
.bg-emerald-500 {
  background-color: rgb(0, 185, 129);
  background-color: var(--color-emerald-500);
}
.bg-midnight {
  background-color: #121063;
  background-color: var(--color-midnight);
}
.bg-neutral-1B {
  background-color: #1b1b1b;
  background-color: var(--color-neutral-1B);
}
.fill-bermuda {
  fill: #78dcca;
  fill: var(--color-bermuda);
}
.p-2 {
  padding: 16rpx;
  padding: calc(var(--spacing) * 2);
}
.py-3 {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
.text-center {
  text-align: center;
}
.text-_b45rpx_B {
  font-size: 45rpx;
}
.text-_b88rpx_B {
  font-size: 88rpx;
}
.font-bold {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: 700;
  font-weight: var(--font-weight-bold);
}
.text-_b_h00f285_B {
  color: #00f285;
}
.text-tahiti {
  color: #3ab7bf;
  color: var(--color-tahiti);
}
.text-white {
  color: #fff;
  color: var(--color-white);
}
.underline {
  -webkit-text-decoration-line: underline;
  text-decoration-line: underline;
}
.shadow-sm {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.10196)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.10196));
  box-shadow:
    var(--tw-inset-shadow),
    var(--tw-inset-ring-shadow),
    var(--tw-ring-offset-shadow),
    var(--tw-ring-shadow),
    0 1px 3px 0 rgba(0, 0, 0, 0.10196),
    0 1px 2px -1px rgba(0, 0, 0, 0.10196);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.divide-x-reverse > view + view,
.divide-x-reverse > view + text,
.divide-x-reverse > text + view,
.divide-x-reverse > text + text {
  --tw-divide-x-reverse: 1;
}
.active_cbg-emerald-600:active {
  background-color: rgb(0, 150, 105);
  background-color: var(--color-emerald-600);
}
page {
  --status-bar-height: 25px;
  --top-window-height: 0px;
  --window-top: 0px;
  --window-bottom: 0px;
  --window-left: 0px;
  --window-right: 0px;
  --window-magin: 0px;
}
[data-c-h='true'] {
  display: none !important;
}

@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {
  view,
  text,
  :before,
  :after {
    --tw-space-y-reverse: 0;
    --tw-space-x-reverse: 0;
    --tw-divide-x-reverse: 0;
    --tw-border-style: solid;
    --tw-divide-y-reverse: 0;
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
  }
}
page:not(#\#),
.tw-root:not(#\#),
wx-root-portal-content:not(#\#),
:host:not(#\#) {
  --color-emerald-50: rgb(236, 253, 245);
  --color-emerald-100: rgb(208, 250, 229);
  --color-emerald-500: rgb(0, 185, 129);
  --color-emerald-600: rgb(0, 150, 105);
  --color-slate-50: rgb(248, 250, 252);
  --color-slate-200: rgb(226, 232, 240);
  --color-slate-500: rgb(98, 116, 142);
  --color-slate-800: rgb(29, 41, 61);
  --color-slate-900: rgb(15, 23, 43);
  --color-white: #fff;
  --spacing: 8rpx;
  --text-xs: 24rpx;
  --text-xs--line-height: 1.33333;
  --text-sm: 28rpx;
  --text-sm--line-height: 1.42857;
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --text-lg: 36rpx;
  --text-lg--line-height: 1.55556;
  --text-xl: 40rpx;
  --text-xl--line-height: 1.4;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
view:not(#\#):not(#\#),
text:not(#\#):not(#\#),
:not(#\#):not(#\#):after,
:not(#\#):not(#\#):before {
  box-sizing: border-box;
  border: 0 solid;
  margin: 0;
  padding: 0;
}
html:not(#\#):not(#\#),
:host:not(#\#):not(#\#) {
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  line-height: 1.5;
  -webkit-tap-highlight-color: transparent;
}
hr:not(#\#):not(#\#) {
  height: 0;
  color: inherit;
  border-top-width: 1px;
}
abbr:where([title]):not(#\#):not(#\#) {
  -webkit-text-decoration: underline dotted;
  text-decoration: underline;
  text-decoration: underline dotted;
}
h1:not(#\#):not(#\#),
h2:not(#\#):not(#\#),
h3:not(#\#):not(#\#),
h4:not(#\#):not(#\#),
h5:not(#\#):not(#\#),
h6:not(#\#):not(#\#) {
  font-size: inherit;
  font-weight: inherit;
}
a:not(#\#):not(#\#) {
  color: inherit;
  -webkit-text-decoration: inherit;
  text-decoration: inherit;
}
b:not(#\#):not(#\#),
strong:not(#\#):not(#\#) {
  font-weight: bolder;
}
code:not(#\#):not(#\#),
kbd:not(#\#):not(#\#),
samp:not(#\#):not(#\#),
pre:not(#\#):not(#\#) {
  font-size: 1em;
}
small:not(#\#):not(#\#) {
  font-size: 80%;
}
sub:not(#\#):not(#\#),
sup:not(#\#):not(#\#) {
  vertical-align: baseline;
  font-size: 75%;
  line-height: 0;
  position: relative;
}
sub:not(#\#):not(#\#) {
  bottom: -0.25em;
}
sup:not(#\#):not(#\#) {
  top: -0.5em;
}
table:not(#\#):not(#\#) {
  text-indent: 0;
  border-color: inherit;
  border-collapse: collapse;
}
:-moz-focusring:not(#\#):not(#\#) {
  outline: auto;
}
progress:not(#\#):not(#\#) {
  vertical-align: baseline;
}
summary:not(#\#):not(#\#) {
  display: list-item;
}
ol:not(#\#):not(#\#),
ul:not(#\#):not(#\#),
menu:not(#\#):not(#\#) {
  list-style: none;
}
img:not(#\#):not(#\#),
svg:not(#\#):not(#\#),
video:not(#\#):not(#\#),
canvas:not(#\#):not(#\#),
audio:not(#\#):not(#\#),
iframe:not(#\#):not(#\#),
embed:not(#\#):not(#\#),
object:not(#\#):not(#\#) {
  vertical-align: middle;
  display: block;
}
img:not(#\#):not(#\#),
video:not(#\#):not(#\#) {
  max-width: 100%;
  height: auto;
}
button:not(#\#):not(#\#),
input:not(#\#):not(#\#),
select:not(#\#):not(#\#),
optgroup:not(#\#):not(#\#),
textarea:not(#\#):not(#\#) {
  font: inherit;
  -webkit-font-feature-settings: inherit;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  letter-spacing: inherit;
  color: inherit;
  opacity: 1;
  background-color: rgba(0, 0, 0, 0);
  border-radius: 0;
}
select[multiple]:not(#\#):not(#\#) optgroup,
select[size]:not(#\#):not(#\#) optgroup {
  font-weight: bolder;
}
select[multiple]:not(#\#):not(#\#) optgroup option,
select[size]:not(#\#):not(#\#) optgroup option {
  padding-left: 20px;
}
:not(#\#):not(#\#)::-webkit-input-placeholder {
  opacity: 1;
}
:not(#\#):not(#\#)::placeholder {
  opacity: 1;
}
@supports (not (-webkit-appearance: -apple-pay-button)) or (contain-intrinsic-size: 1px) {
  :not(#\#):not(#\#)::-webkit-input-placeholder {
    color: currentColor;
  }
  :not(#\#):not(#\#)::placeholder {
    color: currentColor;
  }
}
textarea:not(#\#):not(#\#) {
  resize: vertical;
}
:not(#\#):not(#\#)::-webkit-search-decoration {
  -webkit-appearance: none;
}
:not(#\#):not(#\#)::-webkit-date-and-time-value {
  min-height: 1lh;
  text-align: inherit;
}
:not(#\#):not(#\#)::-webkit-datetime-edit {
  display: -webkit-inline-flex;
  display: inline-flex;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-year-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-month-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-day-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-hour-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-minute-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-second-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-millisecond-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-meridiem-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-calendar-picker-indicator {
  line-height: 1;
}
:-moz-ui-invalid:not(#\#):not(#\#) {
  box-shadow: none;
}
button:not(#\#):not(#\#),
input:where([type='button'], [type='reset'], [type='submit']):not(#\#):not(#\#) {
  -webkit-appearance: button;
  appearance: button;
}
:not(#\#):not(#\#)::-webkit-inner-spin-button {
  height: auto;
}
:not(#\#):not(#\#)::-webkit-outer-spin-button {
  height: auto;
}
[hidden]:where(:not([hidden='until-found'])):not(#\#):not(#\#) {
  display: none !important;
}
.container:not(#\#):not(#\#):not(#\#) {
  width: 100%;
}
@media (min-width: 40rem) {
  .container:not(#\#):not(#\#):not(#\#) {
    max-width: 1280rpx;
  }
}
@media (min-width: 48rem) {
  .container:not(#\#):not(#\#):not(#\#) {
    max-width: 1536rpx;
  }
}
@media (min-width: 64rem) {
  .container:not(#\#):not(#\#):not(#\#) {
    max-width: 2048rpx;
  }
}
@media (min-width: 80rem) {
  .container:not(#\#):not(#\#):not(#\#) {
    max-width: 2560rpx;
  }
}
@media (min-width: 96rem) {
  .container:not(#\#):not(#\#):not(#\#) {
    max-width: 3072rpx;
  }
}
.mt-2:not(#\#):not(#\#):not(#\#) {
  margin-top: 16rpx;
  margin-top: calc(var(--spacing) * 2);
}
.mt-4:not(#\#):not(#\#):not(#\#) {
  margin-top: 32rpx;
  margin-top: calc(var(--spacing) * 4);
}
.mt-6:not(#\#):not(#\#):not(#\#) {
  margin-top: 48rpx;
  margin-top: calc(var(--spacing) * 6);
}
.mt-8:not(#\#):not(#\#):not(#\#) {
  margin-top: 64rpx;
  margin-top: calc(var(--spacing) * 8);
}
.block:not(#\#):not(#\#):not(#\#) {
  display: block;
}
.flex:not(#\#):not(#\#):not(#\#) {
  display: -webkit-flex;
  display: flex;
}
.aspect-_p--my-aspect-ratio_P:not(#\#):not(#\#):not(#\#) {
  aspect-ratio: var(--my-aspect-ratio);
}
.aspect-_bcalc_p4_x3_u1_P_f3_B:not(#\#):not(#\#):not(#\#) {
  aspect-ratio: 13/3;
}
.h-12:not(#\#):not(#\#):not(#\#) {
  height: 96rpx;
  height: calc(var(--spacing) * 12);
}
.h-20:not(#\#):not(#\#):not(#\#) {
  height: 160rpx;
  height: calc(var(--spacing) * 20);
}
.min-h-screen:not(#\#):not(#\#):not(#\#) {
  min-height: 100vh;
}
.w-12:not(#\#):not(#\#):not(#\#) {
  width: 96rpx;
  width: calc(var(--spacing) * 12);
}
.w-20:not(#\#):not(#\#):not(#\#) {
  width: 160rpx;
  width: calc(var(--spacing) * 20);
}
.flex-1:not(#\#):not(#\#):not(#\#) {
  -webkit-flex: 1;
  flex: 1;
}
.flex-col:not(#\#):not(#\#):not(#\#) {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.flex-col-reverse:not(#\#):not(#\#):not(#\#) {
  -webkit-flex-direction: column-reverse;
  flex-direction: column-reverse;
}
.flex-row-reverse:not(#\#):not(#\#):not(#\#) {
  -webkit-flex-direction: row-reverse;
  flex-direction: row-reverse;
}
.items-center:not(#\#):not(#\#):not(#\#) {
  -webkit-align-items: center;
  align-items: center;
}
.justify-center:not(#\#):not(#\#):not(#\#) {
  -webkit-justify-content: center;
  justify-content: center;
}
.gap-1:not(#\#):not(#\#):not(#\#) {
  gap: 8rpx;
  gap: calc(var(--spacing) * 1);
}
.gap-3:not(#\#):not(#\#):not(#\#) {
  gap: 24rpx;
  gap: calc(var(--spacing) * 3);
}
.space-y-4:not(#\#):not(#\#):not(#\#) > view + view,
.space-y-4:not(#\#):not(#\#):not(#\#) > view + text,
.space-y-4:not(#\#):not(#\#):not(#\#) > text + view,
.space-y-4:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: 0rpx;
  margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-bottom: 0rpx;
  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
  margin-top: 32rpx;
  margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
  margin-top: 32rpx;
  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
}
.space-y-reverse:not(#\#):not(#\#):not(#\#) > view + view,
.space-y-reverse:not(#\#):not(#\#):not(#\#) > view + text,
.space-y-reverse:not(#\#):not(#\#):not(#\#) > text + view,
.space-y-reverse:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-space-y-reverse: 1;
}
.space-x-4:not(#\#):not(#\#):not(#\#) > view + view,
.space-x-4:not(#\#):not(#\#):not(#\#) > view + text,
.space-x-4:not(#\#):not(#\#):not(#\#) > text + view,
.space-x-4:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-space-x-reverse: 0;
  margin-right: 0rpx;
  margin-right: calc((var(--spacing) * 4) * var(--tw-space-x-reverse));
  margin-right: 0rpx;
  margin-right: calc(var(--spacing) * 4 * var(--tw-space-x-reverse));
  margin-left: 32rpx;
  margin-left: calc((var(--spacing) * 4) * (1 - var(--tw-space-x-reverse)));
  margin-left: 32rpx;
  margin-left: calc(var(--spacing) * 4 * (1 - var(--tw-space-x-reverse)));
}
.space-x-reverse:not(#\#):not(#\#):not(#\#) > view + view,
.space-x-reverse:not(#\#):not(#\#):not(#\#) > view + text,
.space-x-reverse:not(#\#):not(#\#):not(#\#) > text + view,
.space-x-reverse:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-space-x-reverse: 1;
}
.divide-x-4:not(#\#):not(#\#):not(#\#) > view + view,
.divide-x-4:not(#\#):not(#\#):not(#\#) > view + text,
.divide-x-4:not(#\#):not(#\#):not(#\#) > text + view,
.divide-x-4:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: 0px;
  border-right-width: calc(4px * var(--tw-divide-x-reverse));
  border-left-width: 4px;
  border-left-width: calc(4px * (1 - var(--tw-divide-x-reverse)));
  border-left-width: 4px;
  border-left-width: calc(4px * (1 - var(--tw-divide-x-reverse)));
}
.divide-y-4:not(#\#):not(#\#):not(#\#) > view + view,
.divide-y-4:not(#\#):not(#\#):not(#\#) > view + text,
.divide-y-4:not(#\#):not(#\#):not(#\#) > text + view,
.divide-y-4:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: 0px;
  border-bottom-width: calc(4px * var(--tw-divide-y-reverse));
  border-top-width: 4px;
  border-top-width: calc(4px * (1 - var(--tw-divide-y-reverse)));
  border-top-width: 4px;
  border-top-width: calc(4px * (1 - var(--tw-divide-y-reverse)));
}
.divide-y-reverse:not(#\#):not(#\#):not(#\#) > view + view,
.divide-y-reverse:not(#\#):not(#\#):not(#\#) > view + text,
.divide-y-reverse:not(#\#):not(#\#):not(#\#) > text + view,
.divide-y-reverse:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-divide-y-reverse: 1;
}
.divide-dotted:not(#\#):not(#\#):not(#\#) > view + view,
.divide-dotted:not(#\#):not(#\#):not(#\#) > view + text,
.divide-dotted:not(#\#):not(#\#):not(#\#) > text + view,
.divide-dotted:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-border-style: dotted;
  border-style: dotted;
}
.divide-double:not(#\#):not(#\#):not(#\#) > view + view,
.divide-double:not(#\#):not(#\#):not(#\#) > view + text,
.divide-double:not(#\#):not(#\#):not(#\#) > text + view,
.divide-double:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-border-style: double;
  border-style: double;
}
.divide-_b_h41eb04_B:not(#\#):not(#\#):not(#\#) > view + view,
.divide-_b_h41eb04_B:not(#\#):not(#\#):not(#\#) > view + text,
.divide-_b_h41eb04_B:not(#\#):not(#\#):not(#\#) > text + view,
.divide-_b_h41eb04_B:not(#\#):not(#\#):not(#\#) > text + text {
  border-color: #41eb04;
}
.divide-_b_hd80c0c_B:not(#\#):not(#\#):not(#\#) > view + view,
.divide-_b_hd80c0c_B:not(#\#):not(#\#):not(#\#) > view + text,
.divide-_b_hd80c0c_B:not(#\#):not(#\#):not(#\#) > text + view,
.divide-_b_hd80c0c_B:not(#\#):not(#\#):not(#\#) > text + text {
  border-color: #d80c0c;
}
.rounded-xl:not(#\#):not(#\#):not(#\#) {
  border-radius: 16rpx;
}
.border:not(#\#):not(#\#):not(#\#) {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-emerald-500:not(#\#):not(#\#):not(#\#) {
  border-color: rgb(0, 185, 129);
  border-color: var(--color-emerald-500);
}
.border-slate-200:not(#\#):not(#\#):not(#\#) {
  border-color: rgb(226, 232, 240);
  border-color: var(--color-slate-200);
}
.bg-_b_h0000ff_B:not(#\#):not(#\#):not(#\#) {
  background-color: #00f;
}
.bg-_b_h123498_B:not(#\#):not(#\#):not(#\#) {
  background-color: #123498;
}
.bg-emerald-100:not(#\#):not(#\#):not(#\#) {
  background-color: rgb(208, 250, 229);
  background-color: var(--color-emerald-100);
}
.bg-emerald-500:not(#\#):not(#\#):not(#\#) {
  background-color: rgb(0, 185, 129);
  background-color: var(--color-emerald-500);
}
.bg-slate-50:not(#\#):not(#\#):not(#\#) {
  background-color: rgb(248, 250, 252);
  background-color: var(--color-slate-50);
}
.bg-white:not(#\#):not(#\#):not(#\#) {
  background-color: #fff;
  background-color: var(--color-white);
}
.p-2:not(#\#):not(#\#):not(#\#) {
  padding: 16rpx;
  padding: calc(var(--spacing) * 2);
}
.p-5:not(#\#):not(#\#):not(#\#) {
  padding: 40rpx;
  padding: calc(var(--spacing) * 5);
}
.px-4:not(#\#):not(#\#):not(#\#) {
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.py-2:not(#\#):not(#\#):not(#\#) {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.py-3:not(#\#):not(#\#):not(#\#) {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
.py-6:not(#\#):not(#\#):not(#\#) {
  padding-top: 48rpx;
  padding-bottom: 48rpx;
  padding-top: calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 6);
}
.text-center:not(#\#):not(#\#):not(#\#) {
  text-align: center;
}
.text-base:not(#\#):not(#\#):not(#\#) {
  font-size: 32rpx;
  font-size: var(--text-base);
  line-height: 1.5;
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-lg:not(#\#):not(#\#):not(#\#) {
  font-size: 36rpx;
  font-size: var(--text-lg);
  line-height: 1.55556;
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-sm:not(#\#):not(#\#):not(#\#) {
  font-size: 28rpx;
  font-size: var(--text-sm);
  line-height: 1.42857;
  line-height: var(--tw-leading, var(--text-sm--line-height));
}
.text-xl:not(#\#):not(#\#):not(#\#) {
  font-size: 40rpx;
  font-size: var(--text-xl);
  line-height: 1.4;
  line-height: var(--tw-leading, var(--text-xl--line-height));
}
.text-xs:not(#\#):not(#\#):not(#\#) {
  font-size: 24rpx;
  font-size: var(--text-xs);
  line-height: 1.33333;
  line-height: var(--tw-leading, var(--text-xs--line-height));
}
.text-_b45rpx_B:not(#\#):not(#\#):not(#\#) {
  font-size: 45rpx;
}
.text-_b88rpx_B:not(#\#):not(#\#):not(#\#) {
  font-size: 88rpx;
}
.leading-6:not(#\#):not(#\#):not(#\#) {
  --tw-leading: calc(var(--spacing) * 6);
  line-height: 48rpx;
  line-height: calc(var(--spacing) * 6);
}
.font-bold:not(#\#):not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: 700;
  font-weight: var(--font-weight-bold);
}
.font-medium:not(#\#):not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-medium);
  font-weight: 500;
  font-weight: var(--font-weight-medium);
}
.font-semibold:not(#\#):not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: 600;
  font-weight: var(--font-weight-semibold);
}
.text-_b_h00f285_B:not(#\#):not(#\#):not(#\#) {
  color: #00f285;
}
.text-_b_h929292_B:not(#\#):not(#\#):not(#\#) {
  color: #929292;
}
.text-emerald-600:not(#\#):not(#\#):not(#\#) {
  color: rgb(0, 150, 105);
  color: var(--color-emerald-600);
}
.text-slate-500:not(#\#):not(#\#):not(#\#) {
  color: rgb(98, 116, 142);
  color: var(--color-slate-500);
}
.text-slate-800:not(#\#):not(#\#):not(#\#) {
  color: rgb(29, 41, 61);
  color: var(--color-slate-800);
}
.text-slate-900:not(#\#):not(#\#):not(#\#) {
  color: rgb(15, 23, 43);
  color: var(--color-slate-900);
}
.text-white:not(#\#):not(#\#):not(#\#) {
  color: #fff;
  color: var(--color-white);
}
.underline:not(#\#):not(#\#):not(#\#) {
  -webkit-text-decoration-line: underline;
  text-decoration-line: underline;
}
.shadow:not(#\#):not(#\#):not(#\#),
.shadow-sm:not(#\#):not(#\#):not(#\#) {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.10196)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.10196));
  box-shadow:
    var(--tw-inset-shadow),
    var(--tw-inset-ring-shadow),
    var(--tw-ring-offset-shadow),
    var(--tw-ring-shadow),
    0 1px 3px 0 rgba(0, 0, 0, 0.10196),
    0 1px 2px -1px rgba(0, 0, 0, 0.10196);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.divide-x-reverse:not(#\#):not(#\#):not(#\#) > view + view,
.divide-x-reverse:not(#\#):not(#\#):not(#\#) > view + text,
.divide-x-reverse:not(#\#):not(#\#):not(#\#) > text + view,
.divide-x-reverse:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-divide-x-reverse: 1;
}
.active_cbg-emerald-50:active:not(#\#):not(#\#):not(#\#) {
  background-color: rgb(236, 253, 245);
  background-color: var(--color-emerald-50);
}
.active_cbg-emerald-600:active:not(#\#):not(#\#):not(#\#) {
  background-color: rgb(0, 150, 105);
  background-color: var(--color-emerald-600);
}
@property --tw-space-y-reverse {
  syntax: '*';
  inherits: false;
  initial-value: 0;
}
@property --tw-space-x-reverse {
  syntax: '*';
  inherits: false;
  initial-value: 0;
}
@property --tw-divide-x-reverse {
  syntax: '*';
  inherits: false;
  initial-value: 0;
}
@property --tw-border-style {
  syntax: '*';
  inherits: false;
  initial-value: solid;
}
@property --tw-divide-y-reverse {
  syntax: '*';
  inherits: false;
  initial-value: 0;
}
@property --tw-leading {
  syntax: '*';
  inherits: false;
}
@property --tw-font-weight {
  syntax: '*';
  inherits: false;
}
@property --tw-shadow {
  syntax: '*';
  inherits: false;
  initial-value: 0 0 rgba(0, 0, 0, 0);
}
@property --tw-shadow-color {
  syntax: '*';
  inherits: false;
}
@property --tw-shadow-alpha {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 100%;
}
@property --tw-inset-shadow {
  syntax: '*';
  inherits: false;
  initial-value: 0 0 rgba(0, 0, 0, 0);
}
@property --tw-inset-shadow-color {
  syntax: '*';
  inherits: false;
}
@property --tw-inset-shadow-alpha {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 100%;
}
@property --tw-ring-color {
  syntax: '*';
  inherits: false;
}
@property --tw-ring-shadow {
  syntax: '*';
  inherits: false;
  initial-value: 0 0 rgba(0, 0, 0, 0);
}
@property --tw-inset-ring-color {
  syntax: '*';
  inherits: false;
}
@property --tw-inset-ring-shadow {
  syntax: '*';
  inherits: false;
  initial-value: 0 0 rgba(0, 0, 0, 0);
}
@property --tw-ring-inset {
  syntax: '*';
  inherits: false;
}
@property --tw-ring-offset-width {
  syntax: '<length>';
  inherits: false;
  initial-value: 0;
}
@property --tw-ring-offset-color {
  syntax: '*';
  inherits: false;
  initial-value: #fff;
}
@property --tw-ring-offset-shadow {
  syntax: '*';
  inherits: false;
  initial-value: 0 0 rgba(0, 0, 0, 0);
}

@supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color: rgb(from red r g b)))) {
  view,
  text,
  :before,
  :after {
    --tw-space-y-reverse: 0;
    --tw-space-x-reverse: 0;
    --tw-divide-x-reverse: 0;
    --tw-border-style: solid;
    --tw-divide-y-reverse: 0;
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
  }
}
page:not(#\#),
.tw-root:not(#\#),
wx-root-portal-content:not(#\#),
:host:not(#\#) {
  --color-emerald-50: rgb(236, 253, 245);
  --color-emerald-100: rgb(208, 250, 229);
  --color-emerald-500: rgb(0, 185, 129);
  --color-emerald-600: rgb(0, 150, 105);
  --color-slate-50: rgb(248, 250, 252);
  --color-slate-200: rgb(226, 232, 240);
  --color-slate-500: rgb(98, 116, 142);
  --color-slate-800: rgb(29, 41, 61);
  --color-slate-900: rgb(15, 23, 43);
  --color-white: #fff;
  --spacing: 8rpx;
  --text-xs: 24rpx;
  --text-xs--line-height: 1.33333;
  --text-sm: 28rpx;
  --text-sm--line-height: 1.42857;
  --text-base: 32rpx;
  --text-base--line-height: 1.5;
  --text-lg: 36rpx;
  --text-lg--line-height: 1.55556;
  --text-xl: 40rpx;
  --text-xl--line-height: 1.4;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
view:not(#\#):not(#\#),
text:not(#\#):not(#\#),
:not(#\#):not(#\#):after,
:not(#\#):not(#\#):before {
  box-sizing: border-box;
  border: 0 solid;
  margin: 0;
  padding: 0;
}
html:not(#\#):not(#\#),
:host:not(#\#):not(#\#) {
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  line-height: 1.5;
  -webkit-tap-highlight-color: transparent;
}
hr:not(#\#):not(#\#) {
  height: 0;
  color: inherit;
  border-top-width: 1px;
}
abbr:where([title]):not(#\#):not(#\#) {
  -webkit-text-decoration: underline dotted;
  text-decoration: underline;
  text-decoration: underline dotted;
}
h1:not(#\#):not(#\#),
h2:not(#\#):not(#\#),
h3:not(#\#):not(#\#),
h4:not(#\#):not(#\#),
h5:not(#\#):not(#\#),
h6:not(#\#):not(#\#) {
  font-size: inherit;
  font-weight: inherit;
}
a:not(#\#):not(#\#) {
  color: inherit;
  -webkit-text-decoration: inherit;
  text-decoration: inherit;
}
b:not(#\#):not(#\#),
strong:not(#\#):not(#\#) {
  font-weight: bolder;
}
code:not(#\#):not(#\#),
kbd:not(#\#):not(#\#),
samp:not(#\#):not(#\#),
pre:not(#\#):not(#\#) {
  font-size: 1em;
}
small:not(#\#):not(#\#) {
  font-size: 80%;
}
sub:not(#\#):not(#\#),
sup:not(#\#):not(#\#) {
  vertical-align: baseline;
  font-size: 75%;
  line-height: 0;
  position: relative;
}
sub:not(#\#):not(#\#) {
  bottom: -0.25em;
}
sup:not(#\#):not(#\#) {
  top: -0.5em;
}
table:not(#\#):not(#\#) {
  text-indent: 0;
  border-color: inherit;
  border-collapse: collapse;
}
:-moz-focusring:not(#\#):not(#\#) {
  outline: auto;
}
progress:not(#\#):not(#\#) {
  vertical-align: baseline;
}
summary:not(#\#):not(#\#) {
  display: list-item;
}
ol:not(#\#):not(#\#),
ul:not(#\#):not(#\#),
menu:not(#\#):not(#\#) {
  list-style: none;
}
img:not(#\#):not(#\#),
svg:not(#\#):not(#\#),
video:not(#\#):not(#\#),
canvas:not(#\#):not(#\#),
audio:not(#\#):not(#\#),
iframe:not(#\#):not(#\#),
embed:not(#\#):not(#\#),
object:not(#\#):not(#\#) {
  vertical-align: middle;
  display: block;
}
img:not(#\#):not(#\#),
video:not(#\#):not(#\#) {
  max-width: 100%;
  height: auto;
}
button:not(#\#):not(#\#),
input:not(#\#):not(#\#),
select:not(#\#):not(#\#),
optgroup:not(#\#):not(#\#),
textarea:not(#\#):not(#\#) {
  font: inherit;
  -webkit-font-feature-settings: inherit;
  font-feature-settings: inherit;
  font-variation-settings: inherit;
  letter-spacing: inherit;
  color: inherit;
  opacity: 1;
  background-color: rgba(0, 0, 0, 0);
  border-radius: 0;
}
select[multiple]:not(#\#):not(#\#) optgroup,
select[size]:not(#\#):not(#\#) optgroup {
  font-weight: bolder;
}
select[multiple]:not(#\#):not(#\#) optgroup option,
select[size]:not(#\#):not(#\#) optgroup option {
  padding-left: 20px;
}
:not(#\#):not(#\#)::-webkit-input-placeholder {
  opacity: 1;
}
:not(#\#):not(#\#)::placeholder {
  opacity: 1;
}
@supports (not (-webkit-appearance: -apple-pay-button)) or (contain-intrinsic-size: 1px) {
  :not(#\#):not(#\#)::-webkit-input-placeholder {
    color: currentColor;
  }
  :not(#\#):not(#\#)::placeholder {
    color: currentColor;
  }
}
textarea:not(#\#):not(#\#) {
  resize: vertical;
}
:not(#\#):not(#\#)::-webkit-search-decoration {
  -webkit-appearance: none;
}
:not(#\#):not(#\#)::-webkit-date-and-time-value {
  min-height: 1lh;
  text-align: inherit;
}
:not(#\#):not(#\#)::-webkit-datetime-edit {
  display: -webkit-inline-flex;
  display: inline-flex;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-year-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-month-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-day-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-hour-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-minute-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-second-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-millisecond-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-datetime-edit-meridiem-field {
  padding-top: 0;
  padding-bottom: 0;
}
:not(#\#):not(#\#)::-webkit-calendar-picker-indicator {
  line-height: 1;
}
:-moz-ui-invalid:not(#\#):not(#\#) {
  box-shadow: none;
}
button:not(#\#):not(#\#),
input:where([type='button'], [type='reset'], [type='submit']):not(#\#):not(#\#) {
  -webkit-appearance: button;
  appearance: button;
}
:not(#\#):not(#\#)::-webkit-inner-spin-button {
  height: auto;
}
:not(#\#):not(#\#)::-webkit-outer-spin-button {
  height: auto;
}
[hidden]:where(:not([hidden='until-found'])):not(#\#):not(#\#) {
  display: none !important;
}
.container:not(#\#):not(#\#):not(#\#) {
  width: 100%;
}
@media (min-width: 40rem) {
  .container:not(#\#):not(#\#):not(#\#) {
    max-width: 1280rpx;
  }
}
@media (min-width: 48rem) {
  .container:not(#\#):not(#\#):not(#\#) {
    max-width: 1536rpx;
  }
}
@media (min-width: 64rem) {
  .container:not(#\#):not(#\#):not(#\#) {
    max-width: 2048rpx;
  }
}
@media (min-width: 80rem) {
  .container:not(#\#):not(#\#):not(#\#) {
    max-width: 2560rpx;
  }
}
@media (min-width: 96rem) {
  .container:not(#\#):not(#\#):not(#\#) {
    max-width: 3072rpx;
  }
}
.mt-2:not(#\#):not(#\#):not(#\#) {
  margin-top: 16rpx;
  margin-top: calc(var(--spacing) * 2);
}
.mt-4:not(#\#):not(#\#):not(#\#) {
  margin-top: 32rpx;
  margin-top: calc(var(--spacing) * 4);
}
.mt-6:not(#\#):not(#\#):not(#\#) {
  margin-top: 48rpx;
  margin-top: calc(var(--spacing) * 6);
}
.mt-8:not(#\#):not(#\#):not(#\#) {
  margin-top: 64rpx;
  margin-top: calc(var(--spacing) * 8);
}
.block:not(#\#):not(#\#):not(#\#) {
  display: block;
}
.flex:not(#\#):not(#\#):not(#\#) {
  display: -webkit-flex;
  display: flex;
}
.aspect-_p--my-aspect-ratio_P:not(#\#):not(#\#):not(#\#) {
  aspect-ratio: var(--my-aspect-ratio);
}
.aspect-_bcalc_p4_x3_u1_P_f3_B:not(#\#):not(#\#):not(#\#) {
  aspect-ratio: 13/3;
}
.h-12:not(#\#):not(#\#):not(#\#) {
  height: 96rpx;
  height: calc(var(--spacing) * 12);
}
.h-20:not(#\#):not(#\#):not(#\#) {
  height: 160rpx;
  height: calc(var(--spacing) * 20);
}
.min-h-screen:not(#\#):not(#\#):not(#\#) {
  min-height: 100vh;
}
.w-12:not(#\#):not(#\#):not(#\#) {
  width: 96rpx;
  width: calc(var(--spacing) * 12);
}
.w-20:not(#\#):not(#\#):not(#\#) {
  width: 160rpx;
  width: calc(var(--spacing) * 20);
}
.flex-1:not(#\#):not(#\#):not(#\#) {
  -webkit-flex: 1;
  flex: 1;
}
.flex-col:not(#\#):not(#\#):not(#\#) {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.flex-col-reverse:not(#\#):not(#\#):not(#\#) {
  -webkit-flex-direction: column-reverse;
  flex-direction: column-reverse;
}
.flex-row-reverse:not(#\#):not(#\#):not(#\#) {
  -webkit-flex-direction: row-reverse;
  flex-direction: row-reverse;
}
.items-center:not(#\#):not(#\#):not(#\#) {
  -webkit-align-items: center;
  align-items: center;
}
.justify-center:not(#\#):not(#\#):not(#\#) {
  -webkit-justify-content: center;
  justify-content: center;
}
.gap-1:not(#\#):not(#\#):not(#\#) {
  gap: 8rpx;
  gap: calc(var(--spacing) * 1);
}
.gap-3:not(#\#):not(#\#):not(#\#) {
  gap: 24rpx;
  gap: calc(var(--spacing) * 3);
}
.space-y-4:not(#\#):not(#\#):not(#\#) > view + view,
.space-y-4:not(#\#):not(#\#):not(#\#) > view + text,
.space-y-4:not(#\#):not(#\#):not(#\#) > text + view,
.space-y-4:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-space-y-reverse: 0;
  margin-bottom: 0rpx;
  margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-bottom: 0rpx;
  margin-bottom: calc(var(--spacing) * 4 * var(--tw-space-y-reverse));
  margin-top: 32rpx;
  margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
  margin-top: 32rpx;
  margin-top: calc(var(--spacing) * 4 * (1 - var(--tw-space-y-reverse)));
}
.space-y-reverse:not(#\#):not(#\#):not(#\#) > view + view,
.space-y-reverse:not(#\#):not(#\#):not(#\#) > view + text,
.space-y-reverse:not(#\#):not(#\#):not(#\#) > text + view,
.space-y-reverse:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-space-y-reverse: 1;
}
.space-x-4:not(#\#):not(#\#):not(#\#) > view + view,
.space-x-4:not(#\#):not(#\#):not(#\#) > view + text,
.space-x-4:not(#\#):not(#\#):not(#\#) > text + view,
.space-x-4:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-space-x-reverse: 0;
  margin-right: 0rpx;
  margin-right: calc((var(--spacing) * 4) * var(--tw-space-x-reverse));
  margin-right: 0rpx;
  margin-right: calc(var(--spacing) * 4 * var(--tw-space-x-reverse));
  margin-left: 32rpx;
  margin-left: calc((var(--spacing) * 4) * (1 - var(--tw-space-x-reverse)));
  margin-left: 32rpx;
  margin-left: calc(var(--spacing) * 4 * (1 - var(--tw-space-x-reverse)));
}
.space-x-reverse:not(#\#):not(#\#):not(#\#) > view + view,
.space-x-reverse:not(#\#):not(#\#):not(#\#) > view + text,
.space-x-reverse:not(#\#):not(#\#):not(#\#) > text + view,
.space-x-reverse:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-space-x-reverse: 1;
}
.divide-x-4:not(#\#):not(#\#):not(#\#) > view + view,
.divide-x-4:not(#\#):not(#\#):not(#\#) > view + text,
.divide-x-4:not(#\#):not(#\#):not(#\#) > text + view,
.divide-x-4:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: 0px;
  border-right-width: calc(4px * var(--tw-divide-x-reverse));
  border-left-width: 4px;
  border-left-width: calc(4px * (1 - var(--tw-divide-x-reverse)));
  border-left-width: 4px;
  border-left-width: calc(4px * (1 - var(--tw-divide-x-reverse)));
}
.divide-y-4:not(#\#):not(#\#):not(#\#) > view + view,
.divide-y-4:not(#\#):not(#\#):not(#\#) > view + text,
.divide-y-4:not(#\#):not(#\#):not(#\#) > text + view,
.divide-y-4:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: 0px;
  border-bottom-width: calc(4px * var(--tw-divide-y-reverse));
  border-top-width: 4px;
  border-top-width: calc(4px * (1 - var(--tw-divide-y-reverse)));
  border-top-width: 4px;
  border-top-width: calc(4px * (1 - var(--tw-divide-y-reverse)));
}
.divide-y-reverse:not(#\#):not(#\#):not(#\#) > view + view,
.divide-y-reverse:not(#\#):not(#\#):not(#\#) > view + text,
.divide-y-reverse:not(#\#):not(#\#):not(#\#) > text + view,
.divide-y-reverse:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-divide-y-reverse: 1;
}
.divide-dotted:not(#\#):not(#\#):not(#\#) > view + view,
.divide-dotted:not(#\#):not(#\#):not(#\#) > view + text,
.divide-dotted:not(#\#):not(#\#):not(#\#) > text + view,
.divide-dotted:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-border-style: dotted;
  border-style: dotted;
}
.divide-double:not(#\#):not(#\#):not(#\#) > view + view,
.divide-double:not(#\#):not(#\#):not(#\#) > view + text,
.divide-double:not(#\#):not(#\#):not(#\#) > text + view,
.divide-double:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-border-style: double;
  border-style: double;
}
.divide-_b_h41eb04_B:not(#\#):not(#\#):not(#\#) > view + view,
.divide-_b_h41eb04_B:not(#\#):not(#\#):not(#\#) > view + text,
.divide-_b_h41eb04_B:not(#\#):not(#\#):not(#\#) > text + view,
.divide-_b_h41eb04_B:not(#\#):not(#\#):not(#\#) > text + text {
  border-color: #41eb04;
}
.divide-_b_hd80c0c_B:not(#\#):not(#\#):not(#\#) > view + view,
.divide-_b_hd80c0c_B:not(#\#):not(#\#):not(#\#) > view + text,
.divide-_b_hd80c0c_B:not(#\#):not(#\#):not(#\#) > text + view,
.divide-_b_hd80c0c_B:not(#\#):not(#\#):not(#\#) > text + text {
  border-color: #d80c0c;
}
.rounded-xl:not(#\#):not(#\#):not(#\#) {
  border-radius: 16rpx;
}
.border:not(#\#):not(#\#):not(#\#) {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-emerald-500:not(#\#):not(#\#):not(#\#) {
  border-color: rgb(0, 185, 129);
  border-color: var(--color-emerald-500);
}
.border-slate-200:not(#\#):not(#\#):not(#\#) {
  border-color: rgb(226, 232, 240);
  border-color: var(--color-slate-200);
}
.bg-_b_h0000ff_B:not(#\#):not(#\#):not(#\#) {
  background-color: #00f;
}
.bg-_b_h123498_B:not(#\#):not(#\#):not(#\#) {
  background-color: #123498;
}
.bg-emerald-100:not(#\#):not(#\#):not(#\#) {
  background-color: rgb(208, 250, 229);
  background-color: var(--color-emerald-100);
}
.bg-emerald-500:not(#\#):not(#\#):not(#\#) {
  background-color: rgb(0, 185, 129);
  background-color: var(--color-emerald-500);
}
.bg-slate-50:not(#\#):not(#\#):not(#\#) {
  background-color: rgb(248, 250, 252);
  background-color: var(--color-slate-50);
}
.bg-white:not(#\#):not(#\#):not(#\#) {
  background-color: #fff;
  background-color: var(--color-white);
}
.p-2:not(#\#):not(#\#):not(#\#) {
  padding: 16rpx;
  padding: calc(var(--spacing) * 2);
}
.p-5:not(#\#):not(#\#):not(#\#) {
  padding: 40rpx;
  padding: calc(var(--spacing) * 5);
}
.px-4:not(#\#):not(#\#):not(#\#) {
  padding-left: 32rpx;
  padding-right: 32rpx;
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.py-2:not(#\#):not(#\#):not(#\#) {
  padding-top: 16rpx;
  padding-bottom: 16rpx;
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.py-3:not(#\#):not(#\#):not(#\#) {
  padding-top: 24rpx;
  padding-bottom: 24rpx;
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
.py-6:not(#\#):not(#\#):not(#\#) {
  padding-top: 48rpx;
  padding-bottom: 48rpx;
  padding-top: calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 6);
}
.text-center:not(#\#):not(#\#):not(#\#) {
  text-align: center;
}
.text-base:not(#\#):not(#\#):not(#\#) {
  font-size: 32rpx;
  font-size: var(--text-base);
  line-height: 1.5;
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-lg:not(#\#):not(#\#):not(#\#) {
  font-size: 36rpx;
  font-size: var(--text-lg);
  line-height: 1.55556;
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-sm:not(#\#):not(#\#):not(#\#) {
  font-size: 28rpx;
  font-size: var(--text-sm);
  line-height: 1.42857;
  line-height: var(--tw-leading, var(--text-sm--line-height));
}
.text-xl:not(#\#):not(#\#):not(#\#) {
  font-size: 40rpx;
  font-size: var(--text-xl);
  line-height: 1.4;
  line-height: var(--tw-leading, var(--text-xl--line-height));
}
.text-xs:not(#\#):not(#\#):not(#\#) {
  font-size: 24rpx;
  font-size: var(--text-xs);
  line-height: 1.33333;
  line-height: var(--tw-leading, var(--text-xs--line-height));
}
.text-_b45rpx_B:not(#\#):not(#\#):not(#\#) {
  font-size: 45rpx;
}
.text-_b88rpx_B:not(#\#):not(#\#):not(#\#) {
  font-size: 88rpx;
}
.leading-6:not(#\#):not(#\#):not(#\#) {
  --tw-leading: calc(var(--spacing) * 6);
  line-height: 48rpx;
  line-height: calc(var(--spacing) * 6);
}
.font-bold:not(#\#):not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: 700;
  font-weight: var(--font-weight-bold);
}
.font-medium:not(#\#):not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-medium);
  font-weight: 500;
  font-weight: var(--font-weight-medium);
}
.font-semibold:not(#\#):not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: 600;
  font-weight: var(--font-weight-semibold);
}
.text-_b_h00f285_B:not(#\#):not(#\#):not(#\#) {
  color: #00f285;
}
.text-_b_h929292_B:not(#\#):not(#\#):not(#\#) {
  color: #929292;
}
.text-emerald-600:not(#\#):not(#\#):not(#\#) {
  color: rgb(0, 150, 105);
  color: var(--color-emerald-600);
}
.text-slate-500:not(#\#):not(#\#):not(#\#) {
  color: rgb(98, 116, 142);
  color: var(--color-slate-500);
}
.text-slate-800:not(#\#):not(#\#):not(#\#) {
  color: rgb(29, 41, 61);
  color: var(--color-slate-800);
}
.text-slate-900:not(#\#):not(#\#):not(#\#) {
  color: rgb(15, 23, 43);
  color: var(--color-slate-900);
}
.text-white:not(#\#):not(#\#):not(#\#) {
  color: #fff;
  color: var(--color-white);
}
.underline:not(#\#):not(#\#):not(#\#) {
  -webkit-text-decoration-line: underline;
  text-decoration-line: underline;
}
.shadow:not(#\#):not(#\#):not(#\#),
.shadow-sm:not(#\#):not(#\#):not(#\#) {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.10196)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.10196));
  box-shadow:
    var(--tw-inset-shadow),
    var(--tw-inset-ring-shadow),
    var(--tw-ring-offset-shadow),
    var(--tw-ring-shadow),
    0 1px 3px 0 rgba(0, 0, 0, 0.10196),
    0 1px 2px -1px rgba(0, 0, 0, 0.10196);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.divide-x-reverse:not(#\#):not(#\#):not(#\#) > view + view,
.divide-x-reverse:not(#\#):not(#\#):not(#\#) > view + text,
.divide-x-reverse:not(#\#):not(#\#):not(#\#) > text + view,
.divide-x-reverse:not(#\#):not(#\#):not(#\#) > text + text {
  --tw-divide-x-reverse: 1;
}
.active_cbg-emerald-50:active:not(#\#):not(#\#):not(#\#) {
  background-color: rgb(236, 253, 245);
  background-color: var(--color-emerald-50);
}
.active_cbg-emerald-600:active:not(#\#):not(#\#):not(#\#) {
  background-color: rgb(0, 150, 105);
  background-color: var(--color-emerald-600);
}
@property --tw-space-y-reverse {
  syntax: '*';
  inherits: false;
  initial-value: 0;
}
@property --tw-space-x-reverse {
  syntax: '*';
  inherits: false;
  initial-value: 0;
}
@property --tw-divide-x-reverse {
  syntax: '*';
  inherits: false;
  initial-value: 0;
}
@property --tw-border-style {
  syntax: '*';
  inherits: false;
  initial-value: solid;
}
@property --tw-divide-y-reverse {
  syntax: '*';
  inherits: false;
  initial-value: 0;
}
@property --tw-leading {
  syntax: '*';
  inherits: false;
}
@property --tw-font-weight {
  syntax: '*';
  inherits: false;
}
@property --tw-shadow {
  syntax: '*';
  inherits: false;
  initial-value: 0 0 rgba(0, 0, 0, 0);
}
@property --tw-shadow-color {
  syntax: '*';
  inherits: false;
}
@property --tw-shadow-alpha {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 100%;
}
@property --tw-inset-shadow {
  syntax: '*';
  inherits: false;
  initial-value: 0 0 rgba(0, 0, 0, 0);
}
@property --tw-inset-shadow-color {
  syntax: '*';
  inherits: false;
}
@property --tw-inset-shadow-alpha {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 100%;
}
@property --tw-ring-color {
  syntax: '*';
  inherits: false;
}
@property --tw-ring-shadow {
  syntax: '*';
  inherits: false;
  initial-value: 0 0 rgba(0, 0, 0, 0);
}
@property --tw-inset-ring-color {
  syntax: '*';
  inherits: false;
}
@property --tw-inset-ring-shadow {
  syntax: '*';
  inherits: false;
  initial-value: 0 0 rgba(0, 0, 0, 0);
}
@property --tw-ring-inset {
  syntax: '*';
  inherits: false;
}
@property --tw-ring-offset-width {
  syntax: '<length>';
  inherits: false;
  initial-value: 0;
}
@property --tw-ring-offset-color {
  syntax: '*';
  inherits: false;
  initial-value: #fff;
}
@property --tw-ring-offset-shadow {
  syntax: '*';
  inherits: false;
  initial-value: 0 0 rgba(0, 0, 0, 0);
}
```

## Generator CSS

```css
@config "../tailwind.config.js";
@source not "../src/uni_modules";
@theme {
  --color-neutral-1B: #1b1b1b;
  --color-neutral-66: #666;
  --color-neutral-99: #999;
  --color-neutral-BB: #bbb;
  --color-neutral-EE: #eee;
  --color-neutral-F8: #f8f8f8;
  --color-neutral-FF: #fff;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
page {
  --status-bar-height: 25px;
  --top-window-height: 0px;
  --window-top: 0px;
  --window-bottom: 0px;
  --window-left: 0px;
  --window-right: 0px;
  --window-magin: 0px;
}
[data-c-h='true'] {
  display: none !important;
}

@config "../tailwind.config.order.js";

@config "../tailwind.config.order.js";
```
