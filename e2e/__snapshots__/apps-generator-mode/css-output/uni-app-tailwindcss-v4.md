# uni-app-tailwindcss-v4 CSS Output Comparison

Fixture: demo
Entry: uni-app-tailwindcss-v4/dist/build/mp-weixin/app.wxss
Legacy CSS files: app.wxss, home.wxss, user.wxss
Generator CSS files: app.wxss, home.wxss, user.wxss

| Mode | Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- |
| legacy | 55257 | 274 | true | false | false | false | true |
| generator | 89720 | 375 | false | false | false | false | true |

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
@supports (color: color(display-p3 0 0 0%)) {
  page,
  .tw-root,
  wx-root-portal-content,
  :host {
    --color-emerald-500: rgb(0, 185, 129);
    --color-emerald-600: rgb(0, 150, 105);
  }

  @media (color-gamut: p3) {
    page,
    .tw-root,
    wx-root-portal-content,
    :host {
      --color-emerald-500: color(display-p3 0.26711 0.72685 0.5084);
      --color-emerald-600: color(display-p3 0.20656 0.58906 0.41396);
    }
  }
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
  background-color: color(display-p3 0.26711 0.72685 0.5084);
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
  background-color: color(display-p3 0.20656 0.58906 0.41396);
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
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
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
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
@supports (color: color(display-p3 0 0 0%)) {
  page:not(#\#),
  .tw-root:not(#\#),
  wx-root-portal-content:not(#\#),
  :host:not(#\#) {
    --color-emerald-500: rgb(0, 185, 129);
    --color-emerald-600: rgb(0, 150, 105);
  }

  @media (color-gamut: p3) {
    page:not(#\#),
    .tw-root:not(#\#),
    wx-root-portal-content:not(#\#),
    :host:not(#\#) {
      --color-emerald-500: color(display-p3 0.26711 0.72685 0.5084);
      --color-emerald-600: color(display-p3 0.20656 0.58906 0.41396);
    }
  }
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
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    Ubuntu,
    Cantarell,
    Noto Sans,
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji';
  font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji');
  -webkit-font-feature-settings: normal;
  font-feature-settings: normal;
  -webkit-font-feature-settings: var(--default-font-feature-settings, normal);
  font-feature-settings: var(--default-font-feature-settings, normal);
  font-variation-settings: normal;
  font-variation-settings: var(--default-font-variation-settings, normal);
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
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-family: var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace);
  -webkit-font-feature-settings: normal;
  font-feature-settings: normal;
  -webkit-font-feature-settings: var(--default-mono-font-feature-settings, normal);
  font-feature-settings: var(--default-mono-font-feature-settings, normal);
  font-variation-settings: normal;
  font-variation-settings: var(--default-mono-font-variation-settings, normal);
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
  border-color: color(display-p3 0.26711 0.72685 0.5084);
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
  background-color: color(display-p3 0.26711 0.72685 0.5084);
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
  color: color(display-p3 0.20656 0.58906 0.41396);
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
  background-color: color(display-p3 0.20656 0.58906 0.41396);
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
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
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
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
}
@supports (color: color(display-p3 0 0 0%)) {
  page:not(#\#),
  .tw-root:not(#\#),
  wx-root-portal-content:not(#\#),
  :host:not(#\#) {
    --color-emerald-500: rgb(0, 185, 129);
    --color-emerald-600: rgb(0, 150, 105);
  }

  @media (color-gamut: p3) {
    page:not(#\#),
    .tw-root:not(#\#),
    wx-root-portal-content:not(#\#),
    :host:not(#\#) {
      --color-emerald-500: color(display-p3 0.26711 0.72685 0.5084);
      --color-emerald-600: color(display-p3 0.20656 0.58906 0.41396);
    }
  }
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
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    Ubuntu,
    Cantarell,
    Noto Sans,
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji';
  font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji');
  -webkit-font-feature-settings: normal;
  font-feature-settings: normal;
  -webkit-font-feature-settings: var(--default-font-feature-settings, normal);
  font-feature-settings: var(--default-font-feature-settings, normal);
  font-variation-settings: normal;
  font-variation-settings: var(--default-font-variation-settings, normal);
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
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-family: var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace);
  -webkit-font-feature-settings: normal;
  font-feature-settings: normal;
  -webkit-font-feature-settings: var(--default-mono-font-feature-settings, normal);
  font-feature-settings: var(--default-mono-font-feature-settings, normal);
  font-variation-settings: normal;
  font-variation-settings: var(--default-mono-font-variation-settings, normal);
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
  border-color: color(display-p3 0.26711 0.72685 0.5084);
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
  background-color: color(display-p3 0.26711 0.72685 0.5084);
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
  color: color(display-p3 0.20656 0.58906 0.41396);
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
  background-color: color(display-p3 0.20656 0.58906 0.41396);
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
::before,
::after {
  --tw-content: '';
}
page,
.tw-root,
wx-root-portal-content,
:host {
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
  --tw-leading: initial;
  --tw-font-weight: initial;
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
  --tw-ring-offset-width: 0px;
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
}
page,
.tw-root,
wx-root-portal-content,
:host {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
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
  --spacing: 0.25rem;
  --text-xs: 0.75rem;
  --text-xs--line-height: calc(1 / 0.75);
  --text-sm: 0.875rem;
  --text-sm--line-height: calc(1.25 / 0.875);
  --text-base: 1rem;
  --text-base--line-height: calc(1.5 / 1);
  --text-lg: 1.125rem;
  --text-lg--line-height: calc(1.75 / 1.125);
  --text-xl: 1.25rem;
  --text-xl--line-height: calc(1.75 / 1.25);
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
  --color-neutral-1B: #1b1b1b;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
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
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
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
    max-width: 40rem;
  }
}
@media (min-width: 48rem) {
  .container {
    max-width: 48rem;
  }
}
@media (min-width: 64rem) {
  .container {
    max-width: 64rem;
  }
}
@media (min-width: 80rem) {
  .container {
    max-width: 80rem;
  }
}
@media (min-width: 96rem) {
  .container {
    max-width: 96rem;
  }
}
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
}
.mt-4 {
  margin-top: calc(var(--spacing) * 4);
}
.mt-6 {
  margin-top: calc(var(--spacing) * 6);
}
.mt-8 {
  margin-top: calc(var(--spacing) * 8);
}
.i-mdi-home {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/svg%3E");
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
.aspect-_p--my-aspect-ratio_P {
  aspect-ratio: var(--my-aspect-ratio);
}
.aspect-_bcalc_p4_x3_u1_P_f3_B {
  aspect-ratio: calc(4 * 3 + 1) / 3;
}
.h-12 {
  height: calc(var(--spacing) * 12);
}
.h-20 {
  height: calc(var(--spacing) * 20);
}
.min-h-screen {
  min-height: 100vh;
}
.w-12 {
  width: calc(var(--spacing) * 12);
}
.w-20 {
  width: calc(var(--spacing) * 20);
}
.flex-1 {
  -webkit-flex: 1;
  flex: 1;
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
.transform {
  -webkit-transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
}
.touch-pinch-zoom {
  --tw-pinch-zoom: pinch-zoom;
  touch-action: var(--tw-pan-x,) var(--tw-pan-y,) var(--tw-pinch-zoom,);
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
.flex-wrap {
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
}
.items-center {
  -webkit-align-items: center;
  align-items: center;
}
.justify-center {
  -webkit-justify-content: center;
  justify-content: center;
}
.gap-1 {
  gap: calc(var(--spacing) * 1);
}
.gap-3 {
  gap: calc(var(--spacing) * 3);
}
.space-y-4 > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
}
.space-y-reverse > view + view {
  --tw-space-y-reverse: 1;
}
.space-x-4 > view + view {
  --tw-space-x-reverse: 0;
  margin-right: calc((var(--spacing) * 4) * var(--tw-space-x-reverse));
  margin-left: calc((var(--spacing) * 4) * (1 - var(--tw-space-x-reverse)));
}
.space-x-reverse > view + view {
  --tw-space-x-reverse: 1;
}
.divide-x > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(1px * var(--tw-divide-x-reverse));
  border-left-width: calc(1px * (1 - var(--tw-divide-x-reverse)));
}
.divide-x-4 > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(4px * var(--tw-divide-x-reverse));
  border-left-width: calc(4px * (1 - var(--tw-divide-x-reverse)));
}
.divide-y > view + view {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: calc(1px * var(--tw-divide-y-reverse));
  border-top-width: calc(1px * (1 - var(--tw-divide-y-reverse)));
}
.divide-y-4 > view + view {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: calc(4px * var(--tw-divide-y-reverse));
  border-top-width: calc(4px * (1 - var(--tw-divide-y-reverse)));
}
.divide-y-reverse > view + view {
  --tw-divide-y-reverse: 1;
}
.divide-dotted > view + view {
  --tw-border-style: dotted;
  border-style: dotted;
}
.divide-double > view + view {
  --tw-border-style: double;
  border-style: double;
}
.divide-_b_h41eb04_B > view + view {
  border-color: #41eb04;
}
.divide-_b_hd80c0c_B > view + view {
  border-color: #d80c0c;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rounded-xl {
  border-radius: 16rpx;
}
.rounded-s {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}
.rounded-ss {
  border-top-left-radius: 0.25rem;
}
.rounded-e {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}
.rounded-se {
  border-top-right-radius: 0.25rem;
}
.rounded-ee {
  border-bottom-right-radius: 0.25rem;
}
.rounded-es {
  border-bottom-left-radius: 0.25rem;
}
.rounded-t {
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}
.rounded-l {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}
.rounded-tl {
  border-top-left-radius: 0.25rem;
}
.rounded-r {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}
.rounded-tr {
  border-top-right-radius: 0.25rem;
}
.rounded-b {
  border-bottom-right-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}
.rounded-br {
  border-bottom-right-radius: 0.25rem;
}
.rounded-bl {
  border-bottom-left-radius: 0.25rem;
}
.border {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-x {
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-left-width: 1px;
  border-right-width: 1px;
}
.border-y {
  border-top-style: var(--tw-border-style);
  border-bottom-style: var(--tw-border-style);
  border-top-width: 1px;
  border-bottom-width: 1px;
}
.border-s {
  border-left-style: var(--tw-border-style);
  border-left-width: 1px;
}
.border-e {
  border-right-style: var(--tw-border-style);
  border-right-width: 1px;
}
.border-bs {
  border-top-style: var(--tw-border-style);
  border-top-width: 1px;
}
.border-be {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 1px;
}
.border-t {
  border-top-style: var(--tw-border-style);
  border-top-width: 1px;
}
.border-r {
  border-right-style: var(--tw-border-style);
  border-right-width: 1px;
}
.border-b {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 1px;
}
.border-l {
  border-left-style: var(--tw-border-style);
  border-left-width: 1px;
}
.border-emerald-500 {
  border-color: var(--color-emerald-500);
}
.border-slate-200 {
  border-color: var(--color-slate-200);
}
.bg-_b_h0000ff_B {
  background-color: #0000ff;
}
.bg-_b_h123498_B {
  background-color: #123498;
}
.bg-emerald-100 {
  background-color: var(--color-emerald-100);
}
.bg-emerald-500 {
  background-color: var(--color-emerald-500);
}
.bg-midnight {
  background-color: var(--color-midnight);
}
.bg-neutral-1B {
  background-color: var(--color-neutral-1B);
}
.bg-slate-50 {
  background-color: var(--color-slate-50);
}
.bg-white {
  background-color: var(--color-white);
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
.fill-bermuda {
  fill: var(--color-bermuda);
}
.p-2 {
  padding: calc(var(--spacing) * 2);
}
.p-5 {
  padding: calc(var(--spacing) * 5);
}
.px-4 {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.py-2 {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.py-3 {
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
.py-6 {
  padding-top: calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 6);
}
.text-center {
  text-align: center;
}
.text-base {
  font-size: var(--text-base);
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-lg {
  font-size: var(--text-lg);
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-sm {
  font-size: var(--text-sm);
  line-height: var(--tw-leading, var(--text-sm--line-height));
}
.text-xl {
  font-size: var(--text-xl);
  line-height: var(--tw-leading, var(--text-xl--line-height));
}
.text-xs {
  font-size: var(--text-xs);
  line-height: var(--tw-leading, var(--text-xs--line-height));
}
.text-_b45rpx_B {
  font-size: 45rpx;
}
.text-_b88rpx_B {
  font-size: 88rpx;
}
.leading-6 {
  --tw-leading: calc(var(--spacing) * 6);
  line-height: calc(var(--spacing) * 6);
}
.font-bold {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: var(--font-weight-bold);
}
.font-medium {
  --tw-font-weight: var(--font-weight-medium);
  font-weight: var(--font-weight-medium);
}
.font-semibold {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: var(--font-weight-semibold);
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
.text-_b_h00f285_B {
  color: #00f285;
}
.text-_b_h929292_B {
  color: #929292;
}
.text-emerald-600 {
  color: var(--color-emerald-600);
}
.text-slate-500 {
  color: var(--color-slate-500);
}
.text-slate-800 {
  color: var(--color-slate-800);
}
.text-slate-900 {
  color: var(--color-slate-900);
}
.text-tahiti {
  color: var(--color-tahiti);
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
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-sm {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.inset-ring {
  --tw-inset-ring-shadow: inset 0 0 0 1px var(--tw-inset-ring-color, currentcolor);
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
.drop-shadow {
  --tw-drop-shadow-size: drop-shadow(0 1px 2px var(--tw-drop-shadow-color, rgba(0, 0, 0, 0.1))) drop-shadow(0 1px 1px var(--tw-drop-shadow-color, rgba(0, 0, 0, 0.06)));
  --tw-drop-shadow: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.06));
  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
}
.backdrop-blur {
  --tw-backdrop-blur: blur(8px);
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
.divide-x-reverse > view + view {
  --tw-divide-x-reverse: 1;
}
.ring-inset {
  --tw-ring-inset: inset;
}
.active_cbg-emerald-50:active {
  background-color: var(--color-emerald-50);
}
.active_cbg-emerald-600:active {
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

page,
.tw-root,
wx-root-portal-content,
:host {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
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
  --spacing: 0.25rem;
  --text-xs: 0.75rem;
  --text-xs--line-height: calc(1 / 0.75);
  --text-sm: 0.875rem;
  --text-sm--line-height: calc(1.25 / 0.875);
  --text-base: 1rem;
  --text-base--line-height: calc(1.5 / 1);
  --text-lg: 1.125rem;
  --text-lg--line-height: calc(1.75 / 1.125);
  --text-xl: 1.25rem;
  --text-xl--line-height: calc(1.75 / 1.25);
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
  --color-neutral-1B: #1b1b1b;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
.collapse:not(#\#):not(#\#) {
  visibility: collapse;
}
.invisible:not(#\#):not(#\#) {
  visibility: hidden;
}
.visible:not(#\#):not(#\#) {
  visibility: visible;
}
.sr-only:not(#\#):not(#\#) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  -webkit-clip-path: inset(50%);
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}
.not-sr-only:not(#\#):not(#\#) {
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
.absolute:not(#\#):not(#\#) {
  position: absolute;
}
.fixed:not(#\#):not(#\#) {
  position: fixed;
}
.relative:not(#\#):not(#\#) {
  position: relative;
}
.static:not(#\#):not(#\#) {
  position: static;
}
.sticky:not(#\#):not(#\#) {
  position: -webkit-sticky;
  position: sticky;
}
.start:not(#\#):not(#\#) {
  left: var(--spacing);
}
.end:not(#\#):not(#\#) {
  right: var(--spacing);
}
.isolate:not(#\#):not(#\#) {
  isolation: isolate;
}
.isolation-auto:not(#\#):not(#\#) {
  isolation: auto;
}
.container:not(#\#):not(#\#) {
  width: 100%;
}
@media (min-width: 40rem) {
  .container:not(#\#):not(#\#) {
    max-width: 40rem;
  }
}
@media (min-width: 48rem) {
  .container:not(#\#):not(#\#) {
    max-width: 48rem;
  }
}
@media (min-width: 64rem) {
  .container:not(#\#):not(#\#) {
    max-width: 64rem;
  }
}
@media (min-width: 80rem) {
  .container:not(#\#):not(#\#) {
    max-width: 80rem;
  }
}
@media (min-width: 96rem) {
  .container:not(#\#):not(#\#) {
    max-width: 96rem;
  }
}
.mt-2:not(#\#):not(#\#) {
  margin-top: calc(var(--spacing) * 2);
}
.mt-4:not(#\#):not(#\#) {
  margin-top: calc(var(--spacing) * 4);
}
.mt-6:not(#\#):not(#\#) {
  margin-top: calc(var(--spacing) * 6);
}
.mt-8:not(#\#):not(#\#) {
  margin-top: calc(var(--spacing) * 8);
}
.i-mdi-home:not(#\#):not(#\#) {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/svg%3E");
}
.block:not(#\#):not(#\#) {
  display: block;
}
.contents:not(#\#):not(#\#) {
  display: contents;
}
.flex:not(#\#):not(#\#) {
  display: -webkit-flex;
  display: flex;
}
.flow-root:not(#\#):not(#\#) {
  display: flow-root;
}
.grid:not(#\#):not(#\#) {
  display: grid;
}
.hidden:not(#\#):not(#\#) {
  display: none;
}
.inline:not(#\#):not(#\#) {
  display: inline;
}
.inline-block:not(#\#):not(#\#) {
  display: inline-block;
}
.inline-flex:not(#\#):not(#\#) {
  display: -webkit-inline-flex;
  display: inline-flex;
}
.inline-grid:not(#\#):not(#\#) {
  display: inline-grid;
}
.inline-table:not(#\#):not(#\#) {
  display: inline-table;
}
.list-item:not(#\#):not(#\#) {
  display: list-item;
}
.table:not(#\#):not(#\#) {
  display: table;
}
.table-caption:not(#\#):not(#\#) {
  display: table-caption;
}
.table-cell:not(#\#):not(#\#) {
  display: table-cell;
}
.table-column:not(#\#):not(#\#) {
  display: table-column;
}
.table-column-group:not(#\#):not(#\#) {
  display: table-column-group;
}
.table-footer-group:not(#\#):not(#\#) {
  display: table-footer-group;
}
.table-header-group:not(#\#):not(#\#) {
  display: table-header-group;
}
.table-row:not(#\#):not(#\#) {
  display: table-row;
}
.table-row-group:not(#\#):not(#\#) {
  display: table-row-group;
}
.aspect-_p--my-aspect-ratio_P:not(#\#):not(#\#) {
  aspect-ratio: var(--my-aspect-ratio);
}
.aspect-_bcalc_p4_x3_u1_P_f3_B:not(#\#):not(#\#) {
  aspect-ratio: calc(4 * 3 + 1) / 3;
}
.h-12:not(#\#):not(#\#) {
  height: calc(var(--spacing) * 12);
}
.h-20:not(#\#):not(#\#) {
  height: calc(var(--spacing) * 20);
}
.min-h-screen:not(#\#):not(#\#) {
  min-height: 100vh;
}
.w-12:not(#\#):not(#\#) {
  width: calc(var(--spacing) * 12);
}
.w-20:not(#\#):not(#\#) {
  width: calc(var(--spacing) * 20);
}
.flex-1:not(#\#):not(#\#) {
  -webkit-flex: 1;
  flex: 1;
}
.shrink:not(#\#):not(#\#) {
  -webkit-flex-shrink: 1;
  flex-shrink: 1;
}
.grow:not(#\#):not(#\#) {
  -webkit-flex-grow: 1;
  flex-grow: 1;
}
.border-collapse:not(#\#):not(#\#) {
  border-collapse: collapse;
}
.translate-none:not(#\#):not(#\#) {
  translate: none;
}
.scale-3d:not(#\#):not(#\#) {
  scale: var(--tw-scale-x) var(--tw-scale-y) var(--tw-scale-z);
}
.transform:not(#\#):not(#\#) {
  -webkit-transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
}
.touch-pinch-zoom:not(#\#):not(#\#) {
  --tw-pinch-zoom: pinch-zoom;
  touch-action: var(--tw-pan-x,) var(--tw-pan-y,) var(--tw-pinch-zoom,);
}
.flex-col:not(#\#):not(#\#) {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.flex-col-reverse:not(#\#):not(#\#) {
  -webkit-flex-direction: column-reverse;
  flex-direction: column-reverse;
}
.flex-row-reverse:not(#\#):not(#\#) {
  -webkit-flex-direction: row-reverse;
  flex-direction: row-reverse;
}
.flex-wrap:not(#\#):not(#\#) {
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
}
.items-center:not(#\#):not(#\#) {
  -webkit-align-items: center;
  align-items: center;
}
.justify-center:not(#\#):not(#\#) {
  -webkit-justify-content: center;
  justify-content: center;
}
.gap-1:not(#\#):not(#\#) {
  gap: calc(var(--spacing) * 1);
}
.gap-3:not(#\#):not(#\#) {
  gap: calc(var(--spacing) * 3);
}
.space-y-4:not(#\#):not(#\#) > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-bottom: calc(calc(var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
  margin-top: calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-y-reverse)));
}
.space-y-reverse:not(#\#):not(#\#) > view + view {
  --tw-space-y-reverse: 1;
}
.space-x-4:not(#\#):not(#\#) > view + view {
  --tw-space-x-reverse: 0;
  margin-right: calc((var(--spacing) * 4) * var(--tw-space-x-reverse));
  margin-right: calc(calc(var(--spacing) * 4) * var(--tw-space-x-reverse));
  margin-left: calc((var(--spacing) * 4) * (1 - var(--tw-space-x-reverse)));
  margin-left: calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-x-reverse)));
}
.space-x-reverse:not(#\#):not(#\#) > view + view {
  --tw-space-x-reverse: 1;
}
.divide-x:not(#\#):not(#\#) > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(1px * var(--tw-divide-x-reverse));
  border-left-width: calc(1px * (1 - var(--tw-divide-x-reverse)));
  border-left-width: calc(1px * calc(1 - var(--tw-divide-x-reverse)));
}
.divide-x-4:not(#\#):not(#\#) > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(4px * var(--tw-divide-x-reverse));
  border-left-width: calc(4px * (1 - var(--tw-divide-x-reverse)));
  border-left-width: calc(4px * calc(1 - var(--tw-divide-x-reverse)));
}
.divide-y:not(#\#):not(#\#) > view + view {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: calc(1px * var(--tw-divide-y-reverse));
  border-top-width: calc(1px * (1 - var(--tw-divide-y-reverse)));
  border-top-width: calc(1px * calc(1 - var(--tw-divide-y-reverse)));
}
.divide-y-4:not(#\#):not(#\#) > view + view {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: calc(4px * var(--tw-divide-y-reverse));
  border-top-width: calc(4px * (1 - var(--tw-divide-y-reverse)));
  border-top-width: calc(4px * calc(1 - var(--tw-divide-y-reverse)));
}
.divide-y-reverse:not(#\#):not(#\#) > view + view {
  --tw-divide-y-reverse: 1;
}
.divide-dotted:not(#\#):not(#\#) > view + view {
  --tw-border-style: dotted;
  border-style: dotted;
}
.divide-double:not(#\#):not(#\#) > view + view {
  --tw-border-style: double;
  border-style: double;
}
.divide-_b_h41eb04_B:not(#\#):not(#\#) > view + view {
  border-color: #41eb04;
}
.divide-_b_hd80c0c_B:not(#\#):not(#\#) > view + view {
  border-color: #d80c0c;
}
.truncate:not(#\#):not(#\#) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rounded-xl:not(#\#):not(#\#) {
  border-radius: 16rpx;
}
.rounded-s:not(#\#):not(#\#) {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}
.rounded-ss:not(#\#):not(#\#) {
  border-top-left-radius: 0.25rem;
}
.rounded-e:not(#\#):not(#\#) {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}
.rounded-se:not(#\#):not(#\#) {
  border-top-right-radius: 0.25rem;
}
.rounded-ee:not(#\#):not(#\#) {
  border-bottom-right-radius: 0.25rem;
}
.rounded-es:not(#\#):not(#\#) {
  border-bottom-left-radius: 0.25rem;
}
.rounded-t:not(#\#):not(#\#) {
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}
.rounded-l:not(#\#):not(#\#) {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}
.rounded-tl:not(#\#):not(#\#) {
  border-top-left-radius: 0.25rem;
}
.rounded-r:not(#\#):not(#\#) {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}
.rounded-tr:not(#\#):not(#\#) {
  border-top-right-radius: 0.25rem;
}
.rounded-b:not(#\#):not(#\#) {
  border-bottom-right-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}
.rounded-br:not(#\#):not(#\#) {
  border-bottom-right-radius: 0.25rem;
}
.rounded-bl:not(#\#):not(#\#) {
  border-bottom-left-radius: 0.25rem;
}
.border:not(#\#):not(#\#) {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-x:not(#\#):not(#\#) {
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-left-width: 1px;
  border-right-width: 1px;
}
.border-y:not(#\#):not(#\#) {
  border-top-style: var(--tw-border-style);
  border-bottom-style: var(--tw-border-style);
  border-top-width: 1px;
  border-bottom-width: 1px;
}
.border-s:not(#\#):not(#\#) {
  border-left-style: var(--tw-border-style);
  border-left-width: 1px;
}
.border-e:not(#\#):not(#\#) {
  border-right-style: var(--tw-border-style);
  border-right-width: 1px;
}
.border-bs:not(#\#):not(#\#) {
  border-top-style: var(--tw-border-style);
  border-top-width: 1px;
}
.border-be:not(#\#):not(#\#) {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 1px;
}
.border-t:not(#\#):not(#\#) {
  border-top-style: var(--tw-border-style);
  border-top-width: 1px;
}
.border-r:not(#\#):not(#\#) {
  border-right-style: var(--tw-border-style);
  border-right-width: 1px;
}
.border-b:not(#\#):not(#\#) {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 1px;
}
.border-l:not(#\#):not(#\#) {
  border-left-style: var(--tw-border-style);
  border-left-width: 1px;
}
.border-emerald-500:not(#\#):not(#\#) {
  border-color: var(--color-emerald-500);
}
.border-slate-200:not(#\#):not(#\#) {
  border-color: var(--color-slate-200);
}
.bg-_b_h0000ff_B:not(#\#):not(#\#) {
  background-color: #0000ff;
}
.bg-_b_h123498_B:not(#\#):not(#\#) {
  background-color: #123498;
}
.bg-emerald-100:not(#\#):not(#\#) {
  background-color: var(--color-emerald-100);
}
.bg-emerald-500:not(#\#):not(#\#) {
  background-color: var(--color-emerald-500);
}
.bg-midnight:not(#\#):not(#\#) {
  background-color: var(--color-midnight);
}
.bg-neutral-1B:not(#\#):not(#\#) {
  background-color: var(--color-neutral-1B);
}
.bg-slate-50:not(#\#):not(#\#) {
  background-color: var(--color-slate-50);
}
.bg-white:not(#\#):not(#\#) {
  background-color: var(--color-white);
}
.bg-repeat:not(#\#):not(#\#) {
  background-repeat: repeat;
}
.mask-no-clip:not(#\#):not(#\#) {
  -webkit-mask-clip: no-clip;
  mask-clip: no-clip;
}
.mask-repeat:not(#\#):not(#\#) {
  -webkit-mask-repeat: repeat;
  mask-repeat: repeat;
}
.fill-bermuda:not(#\#):not(#\#) {
  fill: var(--color-bermuda);
}
.p-2:not(#\#):not(#\#) {
  padding: calc(var(--spacing) * 2);
}
.p-5:not(#\#):not(#\#) {
  padding: calc(var(--spacing) * 5);
}
.px-4:not(#\#):not(#\#) {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.py-2:not(#\#):not(#\#) {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.py-3:not(#\#):not(#\#) {
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
.py-6:not(#\#):not(#\#) {
  padding-top: calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 6);
}
.text-center:not(#\#):not(#\#) {
  text-align: center;
}
.text-base:not(#\#):not(#\#) {
  font-size: var(--text-base);
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-lg:not(#\#):not(#\#) {
  font-size: var(--text-lg);
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-sm:not(#\#):not(#\#) {
  font-size: var(--text-sm);
  line-height: var(--tw-leading, var(--text-sm--line-height));
}
.text-xl:not(#\#):not(#\#) {
  font-size: var(--text-xl);
  line-height: var(--tw-leading, var(--text-xl--line-height));
}
.text-xs:not(#\#):not(#\#) {
  font-size: var(--text-xs);
  line-height: var(--tw-leading, var(--text-xs--line-height));
}
.text-_b45rpx_B:not(#\#):not(#\#) {
  font-size: 45rpx;
}
.text-_b88rpx_B:not(#\#):not(#\#) {
  font-size: 88rpx;
}
.leading-6:not(#\#):not(#\#) {
  --tw-leading: calc(var(--spacing) * 6);
  line-height: calc(var(--spacing) * 6);
}
.font-bold:not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: var(--font-weight-bold);
}
.font-medium:not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-medium);
  font-weight: var(--font-weight-medium);
}
.font-semibold:not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: var(--font-weight-semibold);
}
.text-wrap:not(#\#):not(#\#) {
  text-wrap: wrap;
}
.text-clip:not(#\#):not(#\#) {
  text-overflow: clip;
}
.text-ellipsis:not(#\#):not(#\#) {
  text-overflow: ellipsis;
}
.text-_b_h00f285_B:not(#\#):not(#\#) {
  color: #00f285;
}
.text-_b_h929292_B:not(#\#):not(#\#) {
  color: #929292;
}
.text-emerald-600:not(#\#):not(#\#) {
  color: var(--color-emerald-600);
}
.text-slate-500:not(#\#):not(#\#) {
  color: var(--color-slate-500);
}
.text-slate-800:not(#\#):not(#\#) {
  color: var(--color-slate-800);
}
.text-slate-900:not(#\#):not(#\#) {
  color: var(--color-slate-900);
}
.text-tahiti:not(#\#):not(#\#) {
  color: var(--color-tahiti);
}
.text-white:not(#\#):not(#\#) {
  color: var(--color-white);
}
.capitalize:not(#\#):not(#\#) {
  text-transform: capitalize;
}
.lowercase:not(#\#):not(#\#) {
  text-transform: lowercase;
}
.normal-case:not(#\#):not(#\#) {
  text-transform: none;
}
.uppercase:not(#\#):not(#\#) {
  text-transform: uppercase;
}
.italic:not(#\#):not(#\#) {
  font-style: italic;
}
.not-italic:not(#\#):not(#\#) {
  font-style: normal;
}
.diagonal-fractions:not(#\#):not(#\#) {
  --tw-numeric-fraction: diagonal-fractions;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.lining-nums:not(#\#):not(#\#) {
  --tw-numeric-figure: lining-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.oldstyle-nums:not(#\#):not(#\#) {
  --tw-numeric-figure: oldstyle-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.ordinal:not(#\#):not(#\#) {
  --tw-ordinal: ordinal;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.proportional-nums:not(#\#):not(#\#) {
  --tw-numeric-spacing: proportional-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.slashed-zero:not(#\#):not(#\#) {
  --tw-slashed-zero: slashed-zero;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.stacked-fractions:not(#\#):not(#\#) {
  --tw-numeric-fraction: stacked-fractions;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.tabular-nums:not(#\#):not(#\#) {
  --tw-numeric-spacing: tabular-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.normal-nums:not(#\#):not(#\#) {
  -webkit-font-feature-settings: normal;
  font-feature-settings: normal;
  font-variant-numeric: normal;
}
.line-through:not(#\#):not(#\#) {
  -webkit-text-decoration-line: line-through;
  text-decoration-line: line-through;
}
.no-underline:not(#\#):not(#\#) {
  -webkit-text-decoration-line: none;
  text-decoration-line: none;
}
.overline:not(#\#):not(#\#) {
  -webkit-text-decoration-line: overline;
  text-decoration-line: overline;
}
.underline:not(#\#):not(#\#) {
  -webkit-text-decoration-line: underline;
  text-decoration-line: underline;
}
.antialiased:not(#\#):not(#\#) {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.subpixel-antialiased:not(#\#):not(#\#) {
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}
.shadow:not(#\#):not(#\#) {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-sm:not(#\#):not(#\#) {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring:not(#\#):not(#\#) {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.inset-ring:not(#\#):not(#\#) {
  --tw-inset-ring-shadow: inset 0 0 0 1px var(--tw-inset-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.outline:not(#\#):not(#\#) {
  outline-style: var(--tw-outline-style);
  outline-width: 1px;
}
.blur:not(#\#):not(#\#) {
  --tw-blur: blur(8px);
  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
}
.drop-shadow:not(#\#):not(#\#) {
  --tw-drop-shadow-size: drop-shadow(0 1px 2px var(--tw-drop-shadow-color, rgba(0, 0, 0, 0.1))) drop-shadow(0 1px 1px var(--tw-drop-shadow-color, rgba(0, 0, 0, 0.06)));
  --tw-drop-shadow: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.06));
  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
}
.backdrop-blur:not(#\#):not(#\#) {
  --tw-backdrop-blur: blur(8px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-grayscale:not(#\#):not(#\#) {
  --tw-backdrop-grayscale: grayscale(100%);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-invert:not(#\#):not(#\#) {
  --tw-backdrop-invert: invert(100%);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-sepia:not(#\#):not(#\#) {
  --tw-backdrop-sepia: sepia(100%);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-filter:not(#\#):not(#\#) {
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.divide-x-reverse:not(#\#):not(#\#) > view + view {
  --tw-divide-x-reverse: 1;
}
.ring-inset:not(#\#):not(#\#) {
  --tw-ring-inset: inset;
}
.active_cbg-emerald-50:active:not(#\#):not(#\#) {
  background-color: var(--color-emerald-50);
}
.active_cbg-emerald-600:active:not(#\#):not(#\#) {
  background-color: var(--color-emerald-600);
}
@property --tw-scale-x {
  syntax: '*';
  inherits: false;
  initial-value: 1;
}
@property --tw-scale-y {
  syntax: '*';
  inherits: false;
  initial-value: 1;
}
@property --tw-scale-z {
  syntax: '*';
  inherits: false;
  initial-value: 1;
}
@property --tw-rotate-x {
  syntax: '*';
  inherits: false;
}
@property --tw-rotate-y {
  syntax: '*';
  inherits: false;
}
@property --tw-rotate-z {
  syntax: '*';
  inherits: false;
}
@property --tw-skew-x {
  syntax: '*';
  inherits: false;
}
@property --tw-skew-y {
  syntax: '*';
  inherits: false;
}
@property --tw-pan-x {
  syntax: '*';
  inherits: false;
}
@property --tw-pan-y {
  syntax: '*';
  inherits: false;
}
@property --tw-pinch-zoom {
  syntax: '*';
  inherits: false;
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
@property --tw-ordinal {
  syntax: '*';
  inherits: false;
}
@property --tw-slashed-zero {
  syntax: '*';
  inherits: false;
}
@property --tw-numeric-figure {
  syntax: '*';
  inherits: false;
}
@property --tw-numeric-spacing {
  syntax: '*';
  inherits: false;
}
@property --tw-numeric-fraction {
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
  initial-value: 0px;
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
@property --tw-outline-style {
  syntax: '*';
  inherits: false;
  initial-value: solid;
}
@property --tw-blur {
  syntax: '*';
  inherits: false;
}
@property --tw-brightness {
  syntax: '*';
  inherits: false;
}
@property --tw-contrast {
  syntax: '*';
  inherits: false;
}
@property --tw-grayscale {
  syntax: '*';
  inherits: false;
}
@property --tw-hue-rotate {
  syntax: '*';
  inherits: false;
}
@property --tw-invert {
  syntax: '*';
  inherits: false;
}
@property --tw-opacity {
  syntax: '*';
  inherits: false;
}
@property --tw-saturate {
  syntax: '*';
  inherits: false;
}
@property --tw-sepia {
  syntax: '*';
  inherits: false;
}
@property --tw-drop-shadow {
  syntax: '*';
  inherits: false;
}
@property --tw-drop-shadow-color {
  syntax: '*';
  inherits: false;
}
@property --tw-drop-shadow-alpha {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 100%;
}
@property --tw-drop-shadow-size {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-blur {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-brightness {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-contrast {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-grayscale {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-hue-rotate {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-invert {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-opacity {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-saturate {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-sepia {
  syntax: '*';
  inherits: false;
}

page,
.tw-root,
wx-root-portal-content,
:host {
  --font-sans:
    ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
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
  --spacing: 0.25rem;
  --text-xs: 0.75rem;
  --text-xs--line-height: calc(1 / 0.75);
  --text-sm: 0.875rem;
  --text-sm--line-height: calc(1.25 / 0.875);
  --text-base: 1rem;
  --text-base--line-height: calc(1.5 / 1);
  --text-lg: 1.125rem;
  --text-lg--line-height: calc(1.75 / 1.125);
  --text-xl: 1.25rem;
  --text-xl--line-height: calc(1.75 / 1.25);
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --default-font-family: var(--font-sans);
  --default-mono-font-family: var(--font-mono);
  --color-neutral-1B: #1b1b1b;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}
.collapse:not(#\#):not(#\#) {
  visibility: collapse;
}
.invisible:not(#\#):not(#\#) {
  visibility: hidden;
}
.visible:not(#\#):not(#\#) {
  visibility: visible;
}
.sr-only:not(#\#):not(#\#) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  -webkit-clip-path: inset(50%);
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}
.not-sr-only:not(#\#):not(#\#) {
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
.absolute:not(#\#):not(#\#) {
  position: absolute;
}
.fixed:not(#\#):not(#\#) {
  position: fixed;
}
.relative:not(#\#):not(#\#) {
  position: relative;
}
.static:not(#\#):not(#\#) {
  position: static;
}
.sticky:not(#\#):not(#\#) {
  position: -webkit-sticky;
  position: sticky;
}
.start:not(#\#):not(#\#) {
  left: var(--spacing);
}
.end:not(#\#):not(#\#) {
  right: var(--spacing);
}
.isolate:not(#\#):not(#\#) {
  isolation: isolate;
}
.isolation-auto:not(#\#):not(#\#) {
  isolation: auto;
}
.container:not(#\#):not(#\#) {
  width: 100%;
}
@media (min-width: 40rem) {
  .container:not(#\#):not(#\#) {
    max-width: 40rem;
  }
}
@media (min-width: 48rem) {
  .container:not(#\#):not(#\#) {
    max-width: 48rem;
  }
}
@media (min-width: 64rem) {
  .container:not(#\#):not(#\#) {
    max-width: 64rem;
  }
}
@media (min-width: 80rem) {
  .container:not(#\#):not(#\#) {
    max-width: 80rem;
  }
}
@media (min-width: 96rem) {
  .container:not(#\#):not(#\#) {
    max-width: 96rem;
  }
}
.mt-2:not(#\#):not(#\#) {
  margin-top: calc(var(--spacing) * 2);
}
.mt-4:not(#\#):not(#\#) {
  margin-top: calc(var(--spacing) * 4);
}
.mt-6:not(#\#):not(#\#) {
  margin-top: calc(var(--spacing) * 6);
}
.mt-8:not(#\#):not(#\#) {
  margin-top: calc(var(--spacing) * 8);
}
.i-mdi-home:not(#\#):not(#\#) {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='black' d='M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z'/%3E%3C/svg%3E");
}
.block:not(#\#):not(#\#) {
  display: block;
}
.contents:not(#\#):not(#\#) {
  display: contents;
}
.flex:not(#\#):not(#\#) {
  display: -webkit-flex;
  display: flex;
}
.flow-root:not(#\#):not(#\#) {
  display: flow-root;
}
.grid:not(#\#):not(#\#) {
  display: grid;
}
.hidden:not(#\#):not(#\#) {
  display: none;
}
.inline:not(#\#):not(#\#) {
  display: inline;
}
.inline-block:not(#\#):not(#\#) {
  display: inline-block;
}
.inline-flex:not(#\#):not(#\#) {
  display: -webkit-inline-flex;
  display: inline-flex;
}
.inline-grid:not(#\#):not(#\#) {
  display: inline-grid;
}
.inline-table:not(#\#):not(#\#) {
  display: inline-table;
}
.list-item:not(#\#):not(#\#) {
  display: list-item;
}
.table:not(#\#):not(#\#) {
  display: table;
}
.table-caption:not(#\#):not(#\#) {
  display: table-caption;
}
.table-cell:not(#\#):not(#\#) {
  display: table-cell;
}
.table-column:not(#\#):not(#\#) {
  display: table-column;
}
.table-column-group:not(#\#):not(#\#) {
  display: table-column-group;
}
.table-footer-group:not(#\#):not(#\#) {
  display: table-footer-group;
}
.table-header-group:not(#\#):not(#\#) {
  display: table-header-group;
}
.table-row:not(#\#):not(#\#) {
  display: table-row;
}
.table-row-group:not(#\#):not(#\#) {
  display: table-row-group;
}
.aspect-_p--my-aspect-ratio_P:not(#\#):not(#\#) {
  aspect-ratio: var(--my-aspect-ratio);
}
.aspect-_bcalc_p4_x3_u1_P_f3_B:not(#\#):not(#\#) {
  aspect-ratio: calc(4 * 3 + 1) / 3;
}
.h-12:not(#\#):not(#\#) {
  height: calc(var(--spacing) * 12);
}
.h-20:not(#\#):not(#\#) {
  height: calc(var(--spacing) * 20);
}
.min-h-screen:not(#\#):not(#\#) {
  min-height: 100vh;
}
.w-12:not(#\#):not(#\#) {
  width: calc(var(--spacing) * 12);
}
.w-20:not(#\#):not(#\#) {
  width: calc(var(--spacing) * 20);
}
.flex-1:not(#\#):not(#\#) {
  -webkit-flex: 1;
  flex: 1;
}
.shrink:not(#\#):not(#\#) {
  -webkit-flex-shrink: 1;
  flex-shrink: 1;
}
.grow:not(#\#):not(#\#) {
  -webkit-flex-grow: 1;
  flex-grow: 1;
}
.border-collapse:not(#\#):not(#\#) {
  border-collapse: collapse;
}
.translate-none:not(#\#):not(#\#) {
  translate: none;
}
.scale-3d:not(#\#):not(#\#) {
  scale: var(--tw-scale-x) var(--tw-scale-y) var(--tw-scale-z);
}
.transform:not(#\#):not(#\#) {
  -webkit-transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
}
.touch-pinch-zoom:not(#\#):not(#\#) {
  --tw-pinch-zoom: pinch-zoom;
  touch-action: var(--tw-pan-x,) var(--tw-pan-y,) var(--tw-pinch-zoom,);
}
.flex-col:not(#\#):not(#\#) {
  -webkit-flex-direction: column;
  flex-direction: column;
}
.flex-col-reverse:not(#\#):not(#\#) {
  -webkit-flex-direction: column-reverse;
  flex-direction: column-reverse;
}
.flex-row-reverse:not(#\#):not(#\#) {
  -webkit-flex-direction: row-reverse;
  flex-direction: row-reverse;
}
.flex-wrap:not(#\#):not(#\#) {
  -webkit-flex-wrap: wrap;
  flex-wrap: wrap;
}
.items-center:not(#\#):not(#\#) {
  -webkit-align-items: center;
  align-items: center;
}
.justify-center:not(#\#):not(#\#) {
  -webkit-justify-content: center;
  justify-content: center;
}
.gap-1:not(#\#):not(#\#) {
  gap: calc(var(--spacing) * 1);
}
.gap-3:not(#\#):not(#\#) {
  gap: calc(var(--spacing) * 3);
}
.space-y-4:not(#\#):not(#\#) > view + view {
  --tw-space-y-reverse: 0;
  margin-bottom: calc((var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-bottom: calc(calc(var(--spacing) * 4) * var(--tw-space-y-reverse));
  margin-top: calc((var(--spacing) * 4) * (1 - var(--tw-space-y-reverse)));
  margin-top: calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-y-reverse)));
}
.space-y-reverse:not(#\#):not(#\#) > view + view {
  --tw-space-y-reverse: 1;
}
.space-x-4:not(#\#):not(#\#) > view + view {
  --tw-space-x-reverse: 0;
  margin-right: calc((var(--spacing) * 4) * var(--tw-space-x-reverse));
  margin-right: calc(calc(var(--spacing) * 4) * var(--tw-space-x-reverse));
  margin-left: calc((var(--spacing) * 4) * (1 - var(--tw-space-x-reverse)));
  margin-left: calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-x-reverse)));
}
.space-x-reverse:not(#\#):not(#\#) > view + view {
  --tw-space-x-reverse: 1;
}
.divide-x:not(#\#):not(#\#) > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(1px * var(--tw-divide-x-reverse));
  border-left-width: calc(1px * (1 - var(--tw-divide-x-reverse)));
  border-left-width: calc(1px * calc(1 - var(--tw-divide-x-reverse)));
}
.divide-x-4:not(#\#):not(#\#) > view + view {
  --tw-divide-x-reverse: 0;
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-right-width: calc(4px * var(--tw-divide-x-reverse));
  border-left-width: calc(4px * (1 - var(--tw-divide-x-reverse)));
  border-left-width: calc(4px * calc(1 - var(--tw-divide-x-reverse)));
}
.divide-y:not(#\#):not(#\#) > view + view {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: calc(1px * var(--tw-divide-y-reverse));
  border-top-width: calc(1px * (1 - var(--tw-divide-y-reverse)));
  border-top-width: calc(1px * calc(1 - var(--tw-divide-y-reverse)));
}
.divide-y-4:not(#\#):not(#\#) > view + view {
  --tw-divide-y-reverse: 0;
  border-bottom-style: var(--tw-border-style);
  border-top-style: var(--tw-border-style);
  border-bottom-width: calc(4px * var(--tw-divide-y-reverse));
  border-top-width: calc(4px * (1 - var(--tw-divide-y-reverse)));
  border-top-width: calc(4px * calc(1 - var(--tw-divide-y-reverse)));
}
.divide-y-reverse:not(#\#):not(#\#) > view + view {
  --tw-divide-y-reverse: 1;
}
.divide-dotted:not(#\#):not(#\#) > view + view {
  --tw-border-style: dotted;
  border-style: dotted;
}
.divide-double:not(#\#):not(#\#) > view + view {
  --tw-border-style: double;
  border-style: double;
}
.divide-_b_h41eb04_B:not(#\#):not(#\#) > view + view {
  border-color: #41eb04;
}
.divide-_b_hd80c0c_B:not(#\#):not(#\#) > view + view {
  border-color: #d80c0c;
}
.truncate:not(#\#):not(#\#) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rounded-xl:not(#\#):not(#\#) {
  border-radius: 16rpx;
}
.rounded-s:not(#\#):not(#\#) {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}
.rounded-ss:not(#\#):not(#\#) {
  border-top-left-radius: 0.25rem;
}
.rounded-e:not(#\#):not(#\#) {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}
.rounded-se:not(#\#):not(#\#) {
  border-top-right-radius: 0.25rem;
}
.rounded-ee:not(#\#):not(#\#) {
  border-bottom-right-radius: 0.25rem;
}
.rounded-es:not(#\#):not(#\#) {
  border-bottom-left-radius: 0.25rem;
}
.rounded-t:not(#\#):not(#\#) {
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}
.rounded-l:not(#\#):not(#\#) {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}
.rounded-tl:not(#\#):not(#\#) {
  border-top-left-radius: 0.25rem;
}
.rounded-r:not(#\#):not(#\#) {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}
.rounded-tr:not(#\#):not(#\#) {
  border-top-right-radius: 0.25rem;
}
.rounded-b:not(#\#):not(#\#) {
  border-bottom-right-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
}
.rounded-br:not(#\#):not(#\#) {
  border-bottom-right-radius: 0.25rem;
}
.rounded-bl:not(#\#):not(#\#) {
  border-bottom-left-radius: 0.25rem;
}
.border:not(#\#):not(#\#) {
  border-style: var(--tw-border-style);
  border-width: 1px;
}
.border-x:not(#\#):not(#\#) {
  border-left-style: var(--tw-border-style);
  border-right-style: var(--tw-border-style);
  border-left-width: 1px;
  border-right-width: 1px;
}
.border-y:not(#\#):not(#\#) {
  border-top-style: var(--tw-border-style);
  border-bottom-style: var(--tw-border-style);
  border-top-width: 1px;
  border-bottom-width: 1px;
}
.border-s:not(#\#):not(#\#) {
  border-left-style: var(--tw-border-style);
  border-left-width: 1px;
}
.border-e:not(#\#):not(#\#) {
  border-right-style: var(--tw-border-style);
  border-right-width: 1px;
}
.border-bs:not(#\#):not(#\#) {
  border-top-style: var(--tw-border-style);
  border-top-width: 1px;
}
.border-be:not(#\#):not(#\#) {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 1px;
}
.border-t:not(#\#):not(#\#) {
  border-top-style: var(--tw-border-style);
  border-top-width: 1px;
}
.border-r:not(#\#):not(#\#) {
  border-right-style: var(--tw-border-style);
  border-right-width: 1px;
}
.border-b:not(#\#):not(#\#) {
  border-bottom-style: var(--tw-border-style);
  border-bottom-width: 1px;
}
.border-l:not(#\#):not(#\#) {
  border-left-style: var(--tw-border-style);
  border-left-width: 1px;
}
.border-emerald-500:not(#\#):not(#\#) {
  border-color: var(--color-emerald-500);
}
.border-slate-200:not(#\#):not(#\#) {
  border-color: var(--color-slate-200);
}
.bg-_b_h0000ff_B:not(#\#):not(#\#) {
  background-color: #0000ff;
}
.bg-_b_h123498_B:not(#\#):not(#\#) {
  background-color: #123498;
}
.bg-emerald-100:not(#\#):not(#\#) {
  background-color: var(--color-emerald-100);
}
.bg-emerald-500:not(#\#):not(#\#) {
  background-color: var(--color-emerald-500);
}
.bg-midnight:not(#\#):not(#\#) {
  background-color: var(--color-midnight);
}
.bg-neutral-1B:not(#\#):not(#\#) {
  background-color: var(--color-neutral-1B);
}
.bg-slate-50:not(#\#):not(#\#) {
  background-color: var(--color-slate-50);
}
.bg-white:not(#\#):not(#\#) {
  background-color: var(--color-white);
}
.bg-repeat:not(#\#):not(#\#) {
  background-repeat: repeat;
}
.mask-no-clip:not(#\#):not(#\#) {
  -webkit-mask-clip: no-clip;
  mask-clip: no-clip;
}
.mask-repeat:not(#\#):not(#\#) {
  -webkit-mask-repeat: repeat;
  mask-repeat: repeat;
}
.fill-bermuda:not(#\#):not(#\#) {
  fill: var(--color-bermuda);
}
.p-2:not(#\#):not(#\#) {
  padding: calc(var(--spacing) * 2);
}
.p-5:not(#\#):not(#\#) {
  padding: calc(var(--spacing) * 5);
}
.px-4:not(#\#):not(#\#) {
  padding-left: calc(var(--spacing) * 4);
  padding-right: calc(var(--spacing) * 4);
}
.py-2:not(#\#):not(#\#) {
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);
}
.py-3:not(#\#):not(#\#) {
  padding-top: calc(var(--spacing) * 3);
  padding-bottom: calc(var(--spacing) * 3);
}
.py-6:not(#\#):not(#\#) {
  padding-top: calc(var(--spacing) * 6);
  padding-bottom: calc(var(--spacing) * 6);
}
.text-center:not(#\#):not(#\#) {
  text-align: center;
}
.text-base:not(#\#):not(#\#) {
  font-size: var(--text-base);
  line-height: var(--tw-leading, var(--text-base--line-height));
}
.text-lg:not(#\#):not(#\#) {
  font-size: var(--text-lg);
  line-height: var(--tw-leading, var(--text-lg--line-height));
}
.text-sm:not(#\#):not(#\#) {
  font-size: var(--text-sm);
  line-height: var(--tw-leading, var(--text-sm--line-height));
}
.text-xl:not(#\#):not(#\#) {
  font-size: var(--text-xl);
  line-height: var(--tw-leading, var(--text-xl--line-height));
}
.text-xs:not(#\#):not(#\#) {
  font-size: var(--text-xs);
  line-height: var(--tw-leading, var(--text-xs--line-height));
}
.text-_b45rpx_B:not(#\#):not(#\#) {
  font-size: 45rpx;
}
.text-_b88rpx_B:not(#\#):not(#\#) {
  font-size: 88rpx;
}
.leading-6:not(#\#):not(#\#) {
  --tw-leading: calc(var(--spacing) * 6);
  line-height: calc(var(--spacing) * 6);
}
.font-bold:not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-bold);
  font-weight: var(--font-weight-bold);
}
.font-medium:not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-medium);
  font-weight: var(--font-weight-medium);
}
.font-semibold:not(#\#):not(#\#) {
  --tw-font-weight: var(--font-weight-semibold);
  font-weight: var(--font-weight-semibold);
}
.text-wrap:not(#\#):not(#\#) {
  text-wrap: wrap;
}
.text-clip:not(#\#):not(#\#) {
  text-overflow: clip;
}
.text-ellipsis:not(#\#):not(#\#) {
  text-overflow: ellipsis;
}
.text-_b_h00f285_B:not(#\#):not(#\#) {
  color: #00f285;
}
.text-_b_h929292_B:not(#\#):not(#\#) {
  color: #929292;
}
.text-emerald-600:not(#\#):not(#\#) {
  color: var(--color-emerald-600);
}
.text-slate-500:not(#\#):not(#\#) {
  color: var(--color-slate-500);
}
.text-slate-800:not(#\#):not(#\#) {
  color: var(--color-slate-800);
}
.text-slate-900:not(#\#):not(#\#) {
  color: var(--color-slate-900);
}
.text-tahiti:not(#\#):not(#\#) {
  color: var(--color-tahiti);
}
.text-white:not(#\#):not(#\#) {
  color: var(--color-white);
}
.capitalize:not(#\#):not(#\#) {
  text-transform: capitalize;
}
.lowercase:not(#\#):not(#\#) {
  text-transform: lowercase;
}
.normal-case:not(#\#):not(#\#) {
  text-transform: none;
}
.uppercase:not(#\#):not(#\#) {
  text-transform: uppercase;
}
.italic:not(#\#):not(#\#) {
  font-style: italic;
}
.not-italic:not(#\#):not(#\#) {
  font-style: normal;
}
.diagonal-fractions:not(#\#):not(#\#) {
  --tw-numeric-fraction: diagonal-fractions;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.lining-nums:not(#\#):not(#\#) {
  --tw-numeric-figure: lining-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.oldstyle-nums:not(#\#):not(#\#) {
  --tw-numeric-figure: oldstyle-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.ordinal:not(#\#):not(#\#) {
  --tw-ordinal: ordinal;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.proportional-nums:not(#\#):not(#\#) {
  --tw-numeric-spacing: proportional-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.slashed-zero:not(#\#):not(#\#) {
  --tw-slashed-zero: slashed-zero;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.stacked-fractions:not(#\#):not(#\#) {
  --tw-numeric-fraction: stacked-fractions;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.tabular-nums:not(#\#):not(#\#) {
  --tw-numeric-spacing: tabular-nums;
  -webkit-font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-feature-settings: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
}
.normal-nums:not(#\#):not(#\#) {
  -webkit-font-feature-settings: normal;
  font-feature-settings: normal;
  font-variant-numeric: normal;
}
.line-through:not(#\#):not(#\#) {
  -webkit-text-decoration-line: line-through;
  text-decoration-line: line-through;
}
.no-underline:not(#\#):not(#\#) {
  -webkit-text-decoration-line: none;
  text-decoration-line: none;
}
.overline:not(#\#):not(#\#) {
  -webkit-text-decoration-line: overline;
  text-decoration-line: overline;
}
.underline:not(#\#):not(#\#) {
  -webkit-text-decoration-line: underline;
  text-decoration-line: underline;
}
.antialiased:not(#\#):not(#\#) {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.subpixel-antialiased:not(#\#):not(#\#) {
  -webkit-font-smoothing: auto;
  -moz-osx-font-smoothing: auto;
}
.shadow:not(#\#):not(#\#) {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.shadow-sm:not(#\#):not(#\#) {
  --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgba(0, 0, 0, 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgba(0, 0, 0, 0.1));
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.ring:not(#\#):not(#\#) {
  --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.inset-ring:not(#\#):not(#\#) {
  --tw-inset-ring-shadow: inset 0 0 0 1px var(--tw-inset-ring-color, currentcolor);
  box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
}
.outline:not(#\#):not(#\#) {
  outline-style: var(--tw-outline-style);
  outline-width: 1px;
}
.blur:not(#\#):not(#\#) {
  --tw-blur: blur(8px);
  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
}
.drop-shadow:not(#\#):not(#\#) {
  --tw-drop-shadow-size: drop-shadow(0 1px 2px var(--tw-drop-shadow-color, rgba(0, 0, 0, 0.1))) drop-shadow(0 1px 1px var(--tw-drop-shadow-color, rgba(0, 0, 0, 0.06)));
  --tw-drop-shadow: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1)) drop-shadow(0 1px 1px rgba(0, 0, 0, 0.06));
  -webkit-filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
  filter: var(--tw-blur,) var(--tw-brightness,) var(--tw-contrast,) var(--tw-grayscale,) var(--tw-hue-rotate,) var(--tw-invert,) var(--tw-saturate,) var(--tw-sepia,)
    var(--tw-drop-shadow,);
}
.backdrop-blur:not(#\#):not(#\#) {
  --tw-backdrop-blur: blur(8px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-grayscale:not(#\#):not(#\#) {
  --tw-backdrop-grayscale: grayscale(100%);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-invert:not(#\#):not(#\#) {
  --tw-backdrop-invert: invert(100%);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-sepia:not(#\#):not(#\#) {
  --tw-backdrop-sepia: sepia(100%);
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.backdrop-filter:not(#\#):not(#\#) {
  -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,)
    var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
}
.divide-x-reverse:not(#\#):not(#\#) > view + view {
  --tw-divide-x-reverse: 1;
}
.ring-inset:not(#\#):not(#\#) {
  --tw-ring-inset: inset;
}
.active_cbg-emerald-50:active:not(#\#):not(#\#) {
  background-color: var(--color-emerald-50);
}
.active_cbg-emerald-600:active:not(#\#):not(#\#) {
  background-color: var(--color-emerald-600);
}
@property --tw-scale-x {
  syntax: '*';
  inherits: false;
  initial-value: 1;
}
@property --tw-scale-y {
  syntax: '*';
  inherits: false;
  initial-value: 1;
}
@property --tw-scale-z {
  syntax: '*';
  inherits: false;
  initial-value: 1;
}
@property --tw-rotate-x {
  syntax: '*';
  inherits: false;
}
@property --tw-rotate-y {
  syntax: '*';
  inherits: false;
}
@property --tw-rotate-z {
  syntax: '*';
  inherits: false;
}
@property --tw-skew-x {
  syntax: '*';
  inherits: false;
}
@property --tw-skew-y {
  syntax: '*';
  inherits: false;
}
@property --tw-pan-x {
  syntax: '*';
  inherits: false;
}
@property --tw-pan-y {
  syntax: '*';
  inherits: false;
}
@property --tw-pinch-zoom {
  syntax: '*';
  inherits: false;
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
@property --tw-ordinal {
  syntax: '*';
  inherits: false;
}
@property --tw-slashed-zero {
  syntax: '*';
  inherits: false;
}
@property --tw-numeric-figure {
  syntax: '*';
  inherits: false;
}
@property --tw-numeric-spacing {
  syntax: '*';
  inherits: false;
}
@property --tw-numeric-fraction {
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
  initial-value: 0px;
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
@property --tw-outline-style {
  syntax: '*';
  inherits: false;
  initial-value: solid;
}
@property --tw-blur {
  syntax: '*';
  inherits: false;
}
@property --tw-brightness {
  syntax: '*';
  inherits: false;
}
@property --tw-contrast {
  syntax: '*';
  inherits: false;
}
@property --tw-grayscale {
  syntax: '*';
  inherits: false;
}
@property --tw-hue-rotate {
  syntax: '*';
  inherits: false;
}
@property --tw-invert {
  syntax: '*';
  inherits: false;
}
@property --tw-opacity {
  syntax: '*';
  inherits: false;
}
@property --tw-saturate {
  syntax: '*';
  inherits: false;
}
@property --tw-sepia {
  syntax: '*';
  inherits: false;
}
@property --tw-drop-shadow {
  syntax: '*';
  inherits: false;
}
@property --tw-drop-shadow-color {
  syntax: '*';
  inherits: false;
}
@property --tw-drop-shadow-alpha {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 100%;
}
@property --tw-drop-shadow-size {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-blur {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-brightness {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-contrast {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-grayscale {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-hue-rotate {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-invert {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-opacity {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-saturate {
  syntax: '*';
  inherits: false;
}
@property --tw-backdrop-sepia {
  syntax: '*';
  inherits: false;
}
```
