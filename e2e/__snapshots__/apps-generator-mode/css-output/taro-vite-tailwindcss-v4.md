# taro-vite-tailwindcss-v4 CSS Output Comparison

Fixture: demo
Entry: taro-vite-tailwindcss-v4/dist/app.wxss
Legacy CSS files: app.wxss, app-origin.wxss, index.wxss
Generator CSS files: app.wxss, app-origin.wxss, index.wxss

| Mode | Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| --- | ---: | ---: | --- | --- | --- | --- | --- |
| legacy | 2082 | 21 | false | false | false | false | true |
| generator | 79 | 0 | false | false | false | false | false |

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


.tw-page-style-watch-anchor {
  color: inherit;
}
```
