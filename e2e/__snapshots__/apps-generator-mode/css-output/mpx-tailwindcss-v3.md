# mpx-tailwindcss-v3 CSS Output

Fixture: demo
Entry: mpx-tailwindcss-v3/dist/wx/app.wxss
Generator CSS files: app.wxss, base.wxss, button.wxss, components.wxss, icon.wxss, index.wxss, index.wxss, index.wxss, index.wxss, index.wxss, index.wxss, index.wxss, loading.wxss, utilities.wxss

| Bytes | Selectors | @supports | :hover | Tailwind banner | Raw arbitrary selector | Weapp escaped arbitrary selector |
| ---: | ---: | --- | --- | --- | --- | --- |
| 184668 | 2879 | false | false | false | false | true |

## Generator CSS

### app.wxss

```css

```

### base.wxss

```css
::before,
::after {
  --tw-content: '';
}
view,
text,
::after,
::before {
  box-sizing: border-box;
  border-width: 0;
  border-style: solid;
  border-color: currentColor;
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:;
  --tw-pan-y:;
  --tw-pinch-zoom:;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:;
  --tw-gradient-via-position:;
  --tw-gradient-to-position:;
  --tw-ordinal:;
  --tw-slashed-zero:;
  --tw-numeric-figure:;
  --tw-numeric-spacing:;
  --tw-numeric-fraction:;
  --tw-ring-inset:;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-ring-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow: 0 0 rgba(0, 0, 0, 0);
  --tw-shadow-colored: 0 0 rgba(0, 0, 0, 0);
  --tw-blur:;
  --tw-brightness:;
  --tw-contrast:;
  --tw-grayscale:;
  --tw-hue-rotate:;
  --tw-invert:;
  --tw-saturate:;
  --tw-sepia:;
  --tw-drop-shadow:;
  --tw-backdrop-blur:;
  --tw-backdrop-brightness:;
  --tw-backdrop-contrast:;
  --tw-backdrop-grayscale:;
  --tw-backdrop-hue-rotate:;
  --tw-backdrop-invert:;
  --tw-backdrop-opacity:;
  --tw-backdrop-saturate:;
  --tw-backdrop-sepia:;
  --tw-contain-size:;
  --tw-contain-layout:;
  --tw-contain-paint:;
  --tw-contain-style:;
}
```

### button.wxss

```css
.t-button--size-extra-small {
  font-size: var(--td-button-extra-small-font-size, var(--td-font-size-base, 28rpx));
  height: var(--td-button-extra-small-height, 56rpx);
  line-height: var(--td-button-extra-small-height, 56rpx);
  padding-left: var(--td-button-extra-small-padding-horizontal, 16rpx);
  padding-right: var(--td-button-extra-small-padding-horizontal, 16rpx);
}
.t-button--size-extra-small .t-button__icon {
  font-size: var(--td-button-extra-small-icon-size, 36rpx);
}
.t-button--size-small {
  font-size: var(--td-button-small-font-size, var(--td-font-size-base, 28rpx));
  height: var(--td-button-small-height, 64rpx);
  line-height: var(--td-button-small-height, 64rpx);
  padding-left: var(--td-button-small-padding-horizontal, 24rpx);
  padding-right: var(--td-button-small-padding-horizontal, 24rpx);
}
.t-button--size-small .t-button__icon {
  font-size: var(--td-button-small-icon-size, 36rpx);
}
.t-button--size-medium {
  font-size: var(--td-button-medium-font-size, var(--td-font-size-m, 32rpx));
  height: var(--td-button-medium-height, 80rpx);
  line-height: var(--td-button-medium-height, 80rpx);
  padding-left: var(--td-button-medium-padding-horizontal, 32rpx);
  padding-right: var(--td-button-medium-padding-horizontal, 32rpx);
}
.t-button--size-medium .t-button__icon {
  font-size: var(--td-button-medium-icon-size, 40rpx);
}
.t-button--size-large {
  font-size: var(--td-button-large-font-size, var(--td-font-size-m, 32rpx));
  height: var(--td-button-large-height, 96rpx);
  line-height: var(--td-button-large-height, 96rpx);
  padding-left: var(--td-button-large-padding-horizontal, 40rpx);
  padding-right: var(--td-button-large-padding-horizontal, 40rpx);
}
.t-button--size-large .t-button__icon {
  font-size: var(--td-button-large-icon-size, 48rpx);
}
.t-button--default {
  background-color: var(--td-button-default-bg-color, var(--td-bg-color-component, var(--td-gray-color-3, #e7e7e7)));
  border-color: var(--td-button-default-border-color, var(--td-bg-color-component, var(--td-gray-color-3, #e7e7e7)));
  color: var(--td-button-default-color, var(--td-text-color-primary, var(--td-font-gray-1, rgba(0, 0, 0, 0.9))));
}
.t-button--default::after {
  border-color: var(--td-button-default-border-color, var(--td-bg-color-component, var(--td-gray-color-3, #e7e7e7)));
  border-width: var(--td-button-border-width, 4rpx);
}
.t-button--default.t-button--hover {
  z-index: 0;
}
.t-button--default.t-button--hover,
.t-button--default.t-button--hover::after {
  background-color: var(--td-button-default-active-bg-color, var(--td-bg-color-component-active, var(--td-gray-color-6, #a6a6a6)));
  border-color: var(--td-button-default-active-border-color, var(--td-bg-color-component-active, var(--td-gray-color-6, #a6a6a6)));
}
.t-button--default.t-button--disabled {
  background-color: var(--td-button-default-disabled-bg, var(--td-bg-color-component-disabled, var(--td-gray-color-2, #eee)));
  color: var(--td-button-default-disabled-color, var(--td-text-color-disabled, var(--td-font-gray-4, rgba(0, 0, 0, 0.26))));
}
.t-button--default.t-button--disabled,
.t-button--default.t-button--disabled::after {
  border-color: var(--td-button-default-disabled-border-color, var(--td-bg-color-component-disabled, var(--td-gray-color-2, #eee)));
}
.t-button--primary {
  background-color: var(--td-button-primary-bg-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
  border-color: var(--td-button-primary-border-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
  color: var(--td-button-primary-color, var(--td-text-color-anti, var(--td-font-white-1, #fff)));
}
.t-button--primary::after {
  border-color: var(--td-button-primary-border-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
  border-width: var(--td-button-border-width, 4rpx);
}
.t-button--primary.t-button--hover {
  z-index: 0;
}
.t-button--primary.t-button--hover,
.t-button--primary.t-button--hover::after {
  background-color: var(--td-button-primary-active-bg-color, var(--td-brand-color-active, var(--td-primary-color-8, #003cab)));
  border-color: var(--td-button-primary-active-border-color, var(--td-brand-color-active, var(--td-primary-color-8, #003cab)));
}
.t-button--primary.t-button--disabled {
  background-color: var(--td-button-primary-disabled-bg, var(--td-brand-color-disabled, var(--td-primary-color-3, #b5c7ff)));
  color: var(--td-button-primary-disabled-color, var(--td-text-color-anti, var(--td-font-white-1, #fff)));
}
.t-button--primary.t-button--disabled,
.t-button--primary.t-button--disabled::after {
  border-color: var(--td-button-primary-disabled-border-color, var(--td-brand-color-disabled, var(--td-primary-color-3, #b5c7ff)));
}
.t-button--light {
  background-color: var(--td-button-light-bg-color, var(--td-brand-color-light, var(--td-primary-color-1, #f2f3ff)));
  border-color: var(--td-button-light-border-color, var(--td-brand-color-light, var(--td-primary-color-1, #f2f3ff)));
  color: var(--td-button-light-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
}
.t-button--light::after {
  border-color: var(--td-button-light-border-color, var(--td-brand-color-light, var(--td-primary-color-1, #f2f3ff)));
  border-width: var(--td-button-border-width, 4rpx);
}
.t-button--light.t-button--hover {
  z-index: 0;
}
.t-button--light.t-button--hover,
.t-button--light.t-button--hover::after {
  background-color: var(--td-button-light-active-bg-color, var(--td-brand-color-light-active, var(--td-primary-color-2, #d9e1ff)));
  border-color: var(--td-button-light-active-border-color, var(--td-brand-color-light-active, var(--td-primary-color-2, #d9e1ff)));
}
.t-button--light.t-button--disabled {
  background-color: var(--td-button-light-disabled-bg, var(--td-brand-color-light, var(--td-primary-color-1, #f2f3ff)));
  color: var(--td-button-light-disabled-color, var(--td-brand-color-disabled, var(--td-primary-color-3, #b5c7ff)));
}
.t-button--light.t-button--disabled,
.t-button--light.t-button--disabled::after {
  border-color: var(--td-button-light-disabled-border-color, var(--td-brand-color-light, var(--td-primary-color-1, #f2f3ff)));
}
.t-button--danger {
  background-color: var(--td-button-danger-bg-color, var(--td-error-color, var(--td-error-color-6, #d54941)));
  border-color: var(--td-button-danger-border-color, var(--td-error-color, var(--td-error-color-6, #d54941)));
  color: var(--td-button-danger-color, var(--td-text-color-anti, var(--td-font-white-1, #fff)));
}
.t-button--danger::after {
  border-color: var(--td-button-danger-border-color, var(--td-error-color, var(--td-error-color-6, #d54941)));
  border-width: var(--td-button-border-width, 4rpx);
}
.t-button--danger.t-button--hover {
  z-index: 0;
}
.t-button--danger.t-button--hover,
.t-button--danger.t-button--hover::after {
  background-color: var(--td-button-danger-active-bg-color, var(--td-error-color-active, var(--td-error-color-7, #ad352f)));
  border-color: var(--td-button-danger-active-border-color, var(--td-error-color-active, var(--td-error-color-7, #ad352f)));
}
.t-button--danger.t-button--disabled {
  background-color: var(--td-button-danger-disabled-bg, var(--td-error-color-3, #ffb9b0));
  color: var(--td-button-danger-disabled-color, var(--td-font-white-1, #fff));
}
.t-button--danger.t-button--disabled,
.t-button--danger.t-button--disabled::after {
  border-color: var(--td-button-danger-disabled-border-color, var(--td-error-color-3, #ffb9b0));
}
/* tokens: t-button <= src/pages/index.mpx */
.t-button {
  align-items: center;
  background-image: none;
  border-radius: var(--td-button-border-radius, var(--td-radius-default, 12rpx));
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  font-family:
    PingFang SC,
    Microsoft YaHei,
    Arial Regular;
  font-weight: var(--td-button-font-weight, 600);
  justify-content: center;
  outline: 0;
  position: relative;
  text-align: center;
  touch-action: manipulation;
  transition: all 0.3s;
  user-select: none;
  vertical-align: top;
  white-space: nowrap;
}
/* tokens: t-button <= src/pages/index.mpx */
.t-button::after {
  border-radius: calc(var(--td-button-border-radius, var(--td-radius-default, 12rpx)) * 2);
}
.t-button--text {
  background-color: transparent;
  color: var(--td-button-default-color, var(--td-text-color-primary, var(--td-font-gray-1, rgba(0, 0, 0, 0.9))));
}
.t-button--text,
.t-button--text::after {
  border: 0;
}
.t-button--text.t-button--hover,
.t-button--text.t-button--hover::after {
  background-color: var(--td-button-default-text-active-bg-color, var(--td-bg-color-container-active, var(--td-gray-color-3, #e7e7e7)));
}
.t-button--text.t-button--primary {
  background-color: transparent;
  color: var(--td-button-primary-text-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
}
.t-button--text.t-button--primary.t-button--hover,
.t-button--text.t-button--primary.t-button--hover::after {
  background-color: var(--td-button-primary-text-active-bg-color, var(--td-bg-color-container-active, var(--td-gray-color-3, #e7e7e7)));
}
.t-button--text.t-button--primary.t-button--disabled {
  background-color: var(--td-bg-color-container, var(--td-font-white-1, #fff));
  color: var(--td-button-primary-text-disabled-color, var(--td-brand-color-disabled, var(--td-primary-color-3, #b5c7ff)));
}
.t-button--text.t-button--danger {
  background-color: transparent;
  color: var(--td-button-danger-text-color, var(--td-error-color, var(--td-error-color-6, #d54941)));
}
.t-button--text.t-button--danger.t-button--hover,
.t-button--text.t-button--danger.t-button--hover::after {
  background-color: var(--td-button-danger-text-active-bg-color, var(--td-bg-color-container-active, var(--td-gray-color-3, #e7e7e7)));
}
.t-button--text.t-button--danger.t-button--disabled {
  background-color: var(--td-bg-color-container, var(--td-font-white-1, #fff));
  color: var(--td-button-danger-text-disabled-color, var(--td-button-danger-disabled-color, var(--td-font-white-1, #fff)));
}
.t-button--text.t-button--light {
  background-color: transparent;
  color: var(--td-button-light-text-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
}
.t-button--text.t-button--light.t-button--hover,
.t-button--text.t-button--light.t-button--hover::after {
  background-color: var(--td-button-light-text-active-bg-color, var(--td-bg-color-container-active, var(--td-gray-color-3, #e7e7e7)));
}
.t-button--text.t-button--disabled {
  color: var(--td-button-default-disabled-color, var(--td-text-color-disabled, var(--td-font-gray-4, rgba(0, 0, 0, 0.26))));
}
.t-button--outline {
  background-color: var(--td-bg-color-container, var(--td-font-white-1, #fff));
  color: var(--td-button-default-outline-color, var(--td-text-color-primary, var(--td-font-gray-1, rgba(0, 0, 0, 0.9))));
}
.t-button--outline,
.t-button--outline::after {
  border-color: var(--td-button-default-outline-border-color, var(--td-component-border, var(--td-gray-color-4, #dcdcdc)));
}
.t-button--outline.t-button--hover,
.t-button--outline.t-button--hover::after {
  background-color: var(--td-button-default-outline-active-bg-color, var(--td-bg-color-container-active, var(--td-gray-color-3, #e7e7e7)));
  border-color: var(--td-button-default-outline-active-border-color, var(--td-component-border, var(--td-gray-color-4, #dcdcdc)));
}
.t-button--outline.t-button--disabled {
  color: var(--td-button-default-outline-disabled-color, var(--td-component-border, var(--td-gray-color-4, #dcdcdc)));
}
.t-button--outline.t-button--disabled,
.t-button--outline.t-button--disabled::after {
  border-color: var(--td-button-default-outline-disabled-color, var(--td-component-border, var(--td-gray-color-4, #dcdcdc)));
}
.t-button--outline.t-button--primary {
  color: var(--td-button-primary-outline-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
}
.t-button--outline.t-button--primary,
.t-button--outline.t-button--primary::after {
  border-color: var(--td-button-primary-outline-border-color, var(--td-button-primary-outline-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9))));
}
.t-button--outline.t-button--primary.t-button--hover {
  color: var(--td-button-primary-outline-active-border-color, var(--td-brand-color-active, var(--td-primary-color-8, #003cab)));
}
.t-button--outline.t-button--primary.t-button--hover::after {
  background-color: var(--td-button-primary-outline-active-bg-color, var(--td-bg-color-container-active, var(--td-gray-color-3, #e7e7e7)));
  border-color: var(--td-button-primary-outline-active-border-color, var(--td-brand-color-active, var(--td-primary-color-8, #003cab)));
}
.t-button--outline.t-button--primary.t-button--disabled {
  background-color: transparent;
  color: var(--td-button-primary-outline-disabled-color, var(--td-brand-color-disabled, var(--td-primary-color-3, #b5c7ff)));
}
.t-button--outline.t-button--primary.t-button--disabled,
.t-button--outline.t-button--primary.t-button--disabled::after {
  border-color: var(--td-button-primary-outline-disabled-color, var(--td-brand-color-disabled, var(--td-primary-color-3, #b5c7ff)));
}
.t-button--outline.t-button--danger {
  color: var(--td-button-danger-outline-color, var(--td-error-color, var(--td-error-color-6, #d54941)));
}
.t-button--outline.t-button--danger,
.t-button--outline.t-button--danger::after {
  border-color: var(--td-button-danger-outline-border-color, var(--td-button-danger-outline-color, var(--td-error-color, var(--td-error-color-6, #d54941))));
}
.t-button--outline.t-button--danger.t-button--hover {
  color: var(--td-button-danger-outline-active-border-color, var(--td-error-color-active, var(--td-error-color-7, #ad352f)));
}
.t-button--outline.t-button--danger.t-button--hover::after {
  background-color: var(--td-button-danger-outline-active-bg-color, var(--td-bg-color-container-active, var(--td-gray-color-3, #e7e7e7)));
  border-color: var(--td-button-danger-outline-active-border-color, var(--td-error-color-active, var(--td-error-color-7, #ad352f)));
}
.t-button--outline.t-button--danger.t-button--disabled {
  background-color: var(--td-bg-color-container, var(--td-font-white-1, #fff));
  color: var(--td-button-danger-outline-disabled-color, var(--td-error-color-3, #ffb9b0));
}
.t-button--outline.t-button--danger.t-button--disabled,
.t-button--outline.t-button--danger.t-button--disabled::after {
  border-color: var(--td-button-danger-outline-disabled-color, var(--td-error-color-3, #ffb9b0));
}
.t-button--outline.t-button--light {
  background-color: var(--td-button-light-outline-bg-color, var(--td-brand-color-light, var(--td-primary-color-1, #f2f3ff)));
  color: var(--td-button-light-outline-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
}
.t-button--outline.t-button--light,
.t-button--outline.t-button--light::after {
  border-color: var(--td-button-light-outline-border-color, var(--td-button-light-outline-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9))));
}
.t-button--outline.t-button--light.t-button--hover {
  color: var(--td-button-light-outline-active-border-color, var(--td-brand-color-active, var(--td-primary-color-8, #003cab)));
}
.t-button--outline.t-button--light.t-button--hover,
.t-button--outline.t-button--light.t-button--hover::after {
  background-color: var(--td-button-light-outline-active-bg-color, var(--td-brand-color-light-active, var(--td-primary-color-2, #d9e1ff)));
  border-color: var(--td-button-light-outline-active-border-color, var(--td-brand-color-active, var(--td-primary-color-8, #003cab)));
}
.t-button--outline.t-button--light.t-button--disabled {
  background-color: var(--td-bg-color-container, var(--td-font-white-1, #fff));
  color: var(--td-button-light-outline-disabled-color, var(--td-brand-color-disabled, var(--td-primary-color-3, #b5c7ff)));
}
.t-button--outline.t-button--light.t-button--disabled,
.t-button--outline.t-button--light.t-button--disabled::after {
  border-color: var(--td-button-light-outline-disabled-color, var(--td-brand-color-disabled, var(--td-primary-color-3, #b5c7ff)));
}
.t-button--dashed {
  background-color: var(--td-bg-color-container, var(--td-font-white-1, #fff));
  border-style: dashed;
  border-width: 2rpx;
}
.t-button--dashed::after {
  border: 0;
}
.t-button--dashed.t-button--hover,
.t-button--dashed.t-button--hover::after {
  background-color: var(--td-button-default-outline-active-bg-color, var(--td-bg-color-container-active, var(--td-gray-color-3, #e7e7e7)));
  border-color: var(--td-button-default-outline-active-border-color, var(--td-component-border, var(--td-gray-color-4, #dcdcdc)));
}
.t-button--dashed.t-button--primary {
  color: var(--td-button-primary-dashed-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
}
.t-button--dashed.t-button--primary,
.t-button--dashed.t-button--primary::after {
  border-color: var(--td-button-primary-dashed-border-color, var(--td-button-primary-dashed-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9))));
}
.t-button--dashed.t-button--primary.t-button--disabled {
  background-color: var(--td-bg-color-container, var(--td-font-white-1, #fff));
  color: var(--td-button-primary-dashed-disabled-color, var(--td-brand-color-disabled, var(--td-primary-color-3, #b5c7ff)));
}
.t-button--dashed.t-button--primary.t-button--disabled,
.t-button--dashed.t-button--primary.t-button--disabled::after {
  border-color: var(--td-button-primary-dashed-disabled-color, var(--td-brand-color-disabled, var(--td-primary-color-3, #b5c7ff)));
}
.t-button--dashed.t-button--danger {
  color: var(--td-button-danger-dashed-color, var(--td-error-color, var(--td-error-color-6, #d54941)));
}
.t-button--dashed.t-button--danger,
.t-button--dashed.t-button--danger::after {
  border-color: var(--td-button-danger-dashed-border-color, var(--td-button-danger-dashed-color, var(--td-error-color, var(--td-error-color-6, #d54941))));
}
.t-button--dashed.t-button--danger.t-button--disabled {
  background-color: transparent;
  color: var(--td-button-danger-dashed-disabled-color, var(--td-button-danger-disabled-color, var(--td-font-white-1, #fff)));
}
.t-button--dashed.t-button--danger.t-button--disabled::after {
  border-color: var(--td-button-danger-dashed-disabled-color, var(--td-button-danger-disabled-color, var(--td-font-white-1, #fff)));
}
.t-button--ghost {
  background-color: transparent;
  color: var(--td-button-ghost-color, var(--td-text-color-anti, var(--td-font-white-1, #fff)));
}
.t-button--ghost,
.t-button--ghost::after {
  border-color: var(--td-button-ghost-border-color, var(--td-button-ghost-color, var(--td-text-color-anti, var(--td-font-white-1, #fff))));
}
.t-button--ghost.t-button--default.t-button--hover {
  color: var(--td-button-ghost-hover-color, var(--td-font-white-2, hsla(0, 0%, 100%, 0.55)));
}
.t-button--ghost.t-button--default.t-button--hover,
.t-button--ghost.t-button--default.t-button--hover::after {
  background-color: transparent;
  border-color: var(--td-button-ghost-hover-color, var(--td-font-white-2, hsla(0, 0%, 100%, 0.55)));
}
.t-button--ghost.t-button--primary {
  color: var(--td-button-ghost-primary-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
}
.t-button--ghost.t-button--primary,
.t-button--ghost.t-button--primary::after {
  border-color: var(--td-button-ghost-primary-border-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
}
.t-button--ghost.t-button--primary.t-button--hover {
  color: var(--td-button-ghost-primary-hover-color, var(--td-brand-color-active, var(--td-primary-color-8, #003cab)));
}
.t-button--ghost.t-button--primary.t-button--hover,
.t-button--ghost.t-button--primary.t-button--hover::after {
  background-color: transparent;
  border-color: var(--td-button-ghost-primary-hover-color, var(--td-brand-color-active, var(--td-primary-color-8, #003cab)));
}
.t-button--ghost.t-button--primary.t-button--text.t-button--hover,
.t-button--ghost.t-button--primary.t-button--text.t-button--hover::after {
  background-color: var(--td-gray-color-10, #4b4b4b);
}
.t-button--ghost.t-button--primary.t-button--disabled {
  background-color: transparent;
  color: var(--td-button-ghost-disabled-color, var(--td-font-white-4, hsla(0, 0%, 100%, 0.22)));
}
.t-button--ghost.t-button--primary.t-button--disabled,
.t-button--ghost.t-button--primary.t-button--disabled::after {
  border-color: var(--td-button-ghost-disabled-color, var(--td-font-white-4, hsla(0, 0%, 100%, 0.22)));
}
.t-button--ghost.t-button--danger {
  color: var(--td-button-ghost-danger-color, var(--td-error-color, var(--td-error-color-6, #d54941)));
}
.t-button--ghost.t-button--danger,
.t-button--ghost.t-button--danger::after {
  border-color: var(--td-button-ghost-danger-border-color, var(--td-error-color, var(--td-error-color-6, #d54941)));
}
.t-button--ghost.t-button--danger.t-button--hover {
  color: var(--td-button-ghost-danger-hover-color, var(--td-error-color-active, var(--td-error-color-7, #ad352f)));
}
.t-button--ghost.t-button--danger.t-button--hover,
.t-button--ghost.t-button--danger.t-button--hover::after {
  background-color: transparent;
  border-color: var(--td-button-ghost-danger-hover-color, var(--td-error-color-active, var(--td-error-color-7, #ad352f)));
}
.t-button--ghost.t-button--danger.t-button--text.t-button--hover,
.t-button--ghost.t-button--danger.t-button--text.t-button--hover::after {
  background-color: var(--td-gray-color-10, #4b4b4b);
}
.t-button--ghost.t-button--danger.t-button--disabled {
  background-color: transparent;
  color: var(--td-button-ghost-disabled-color, var(--td-font-white-4, hsla(0, 0%, 100%, 0.22)));
}
.t-button--ghost.t-button--danger.t-button--disabled,
.t-button--ghost.t-button--danger.t-button--disabled::after {
  border-color: var(--td-button-ghost-disabled-color, var(--td-font-white-4, hsla(0, 0%, 100%, 0.22)));
}
.t-button--ghost.t-button--default.t-button--text.t-button--hover,
.t-button--ghost.t-button--default.t-button--text.t-button--hover::after {
  background-color: var(--td-gray-color-10, #4b4b4b);
}
.t-button--ghost.t-button--default.t-button--disabled {
  background-color: transparent;
  color: var(--td-button-ghost-disabled-color, var(--td-font-white-4, hsla(0, 0%, 100%, 0.22)));
}
.t-button--ghost.t-button--default.t-button--disabled,
.t-button--ghost.t-button--default.t-button--disabled::after {
  border-color: var(--td-button-ghost-disabled-color, var(--td-font-white-4, hsla(0, 0%, 100%, 0.22)));
}
.t-button__icon + .t-button__content:not(:empty),
.t-button__loading + .t-button__content:not(:empty) {
  margin-left: 8rpx;
}
.t-button__icon {
  border-radius: var(--td-button-icon-border-radius, 8rpx);
}
.t-button--round.t-button--size-large {
  border-radius: calc(var(--td-button-large-height, 96rpx) / 2);
}
.t-button--round.t-button--size-large::after {
  border-radius: var(--td-button-large-height, 96rpx);
}
.t-button--round.t-button--size-medium {
  border-radius: calc(var(--td-button-medium-height, 80rpx) / 2);
}
.t-button--round.t-button--size-medium::after {
  border-radius: var(--td-button-medium-height, 80rpx);
}
.t-button--round.t-button--size-small {
  border-radius: calc(var(--td-button-small-height, 64rpx) / 2);
}
.t-button--round.t-button--size-small::after {
  border-radius: var(--td-button-small-height, 64rpx);
}
.t-button--round.t-button--size-extra-small {
  border-radius: calc(var(--td-button-extra-small-height, 56rpx) / 2);
}
.t-button--round.t-button--size-extra-small::after {
  border-radius: var(--td-button-extra-small-height, 56rpx);
}
.t-button--square {
  padding: 0;
}
.t-button--square.t-button--size-large {
  width: var(--td-button-large-height, 96rpx);
}
.t-button--square.t-button--size-medium {
  width: var(--td-button-medium-height, 80rpx);
}
.t-button--square.t-button--size-small {
  width: var(--td-button-small-height, 64rpx);
}
.t-button--square.t-button--size-extra-small {
  width: var(--td-button-extra-small-height, 56rpx);
}
.t-button--circle {
  border-radius: 50%;
  padding: 0;
}
.t-button--circle.t-button--size-large {
  width: var(--td-button-large-height, 96rpx);
}
.t-button--circle.t-button--size-large::after {
  border-radius: 50%;
}
.t-button--circle.t-button--size-medium {
  width: var(--td-button-medium-height, 80rpx);
}
.t-button--circle.t-button--size-medium::after {
  border-radius: 50%;
}
.t-button--circle.t-button--size-small {
  width: var(--td-button-small-height, 64rpx);
}
.t-button--circle.t-button--size-small::after {
  border-radius: 50%;
}
.t-button--circle.t-button--size-extra-small {
  width: var(--td-button-extra-small-height, 56rpx);
}
.t-button--circle.t-button--size-extra-small::after {
  border-radius: 50%;
}
.t-button--block {
  display: flex;
  width: 100%;
}
.t-button--disabled {
  cursor: not-allowed;
}
.t-button__loading--wrapper {
  align-items: center;
  display: flex;
  justify-content: center;
}
/* tokens: t-button <= src/pages/index.mpx */
.t-button.t-button--hover::after {
  z-index: -1;
}
```

### components.wxss

```css

```

### icon.wxss

```css
@font-face {
  font-family: t;
  font-style: normal;
  font-weight: 400;
  src:
    url(https://tdesign.gtimg.com/icon/0.4.2/fonts/t.eot),
    url(https://tdesign.gtimg.com/icon/0.4.2/fonts/t.eot?#iefix) format('ded-opentype'),
    url(https://tdesign.gtimg.com/icon/0.4.2/fonts/t.woff) format('woff'),
    url(https://tdesign.gtimg.com/icon/0.4.2/fonts/t.ttf) format('truetype'),
    url(https://tdesign.gtimg.com/icon/0.4.2/fonts/t.svg) format('svg');
}
.t-icon--image,
.t-icon__image {
  height: 100%;
  width: 100%;
}
.t-icon__image {
  vertical-align: top;
}
.t-icon-base {
  -moz-osx-font-smoothing: grayscale;
  display: block;
  font-style: normal;
  font-feature-settings: normal;
  font-variant: normal;
  font-weight: 400;
  line-height: 1;
  text-align: center;
  text-transform: none;
}
.t-icon {
  font-family: t !important;
}
.t-icon-ability-open::before {
  content: '\E001';
}
.t-icon-abstract-filled::before {
  content: '\E002';
}
.t-icon-abstract::before {
  content: '\E003';
}
.t-icon-accessibility-filled::before {
  content: '\E004';
}
.t-icon-accessibility::before {
  content: '\E005';
}
.t-icon-activity-filled::before {
  content: '\E006';
}
.t-icon-activity::before {
  content: '\E007';
}
.t-icon-add-and-subtract::before {
  content: '\E008';
}
.t-icon-add-circle-filled::before {
  content: '\E009';
}
.t-icon-add-circle::before {
  content: '\E00A';
}
.t-icon-add-rectangle-filled::before {
  content: '\E00B';
}
.t-icon-add-rectangle::before {
  content: '\E00C';
}
.t-icon-add::before {
  content: '\E00D';
}
.t-icon-address-book-filled::before {
  content: '\E00E';
}
.t-icon-address-book::before {
  content: '\E00F';
}
.t-icon-adjustment-filled::before {
  content: '\E010';
}
.t-icon-adjustment::before {
  content: '\E011';
}
.t-icon-ai-1-filled::before {
  content: '\E012';
}
.t-icon-ai-1::before {
  content: '\E013';
}
.t-icon-ai-article-filled::before {
  content: '\E014';
}
.t-icon-ai-article::before {
  content: '\E015';
}
.t-icon-ai-book-open-filled::before {
  content: '\E016';
}
.t-icon-ai-book-open::before {
  content: '\E017';
}
.t-icon-ai-chart-bar-filled::before {
  content: '\E018';
}
.t-icon-ai-chart-bar::before {
  content: '\E019';
}
.t-icon-ai-coordinate-system-filled::before {
  content: '\E01A';
}
.t-icon-ai-coordinate-system::before {
  content: '\E01B';
}
.t-icon-ai-cut::before {
  content: '\E01C';
}
.t-icon-ai-edit-1-filled::before {
  content: '\E01D';
}
.t-icon-ai-edit-1::before {
  content: '\E01E';
}
.t-icon-ai-edit-filled::before {
  content: '\E01F';
}
.t-icon-ai-edit::before {
  content: '\E020';
}
.t-icon-ai-education-filled::before {
  content: '\E021';
}
.t-icon-ai-education::before {
  content: '\E022';
}
.t-icon-ai-git-branch-filled::before {
  content: '\E023';
}
.t-icon-ai-git-branch::before {
  content: '\E024';
}
.t-icon-ai-image-1-filled::before {
  content: '\E025';
}
.t-icon-ai-image-1::before {
  content: '\E026';
}
.t-icon-ai-image-filled::before {
  content: '\E027';
}
.t-icon-ai-image::before {
  content: '\E028';
}
.t-icon-ai-layout-filled::before {
  content: '\E029';
}
.t-icon-ai-layout::before {
  content: '\E02A';
}
.t-icon-ai-music-filled::before {
  content: '\E02B';
}
.t-icon-ai-music::before {
  content: '\E02C';
}
.t-icon-ai-screenshot::before {
  content: '\E02D';
}
.t-icon-ai-search-filled::before {
  content: '\E02E';
}
.t-icon-ai-search::before {
  content: '\E02F';
}
.t-icon-ai-terminal-1-filled::before {
  content: '\E030';
}
.t-icon-ai-terminal-1::before {
  content: '\E031';
}
.t-icon-ai-terminal-filled::before {
  content: '\E032';
}
.t-icon-ai-terminal::before {
  content: '\E033';
}
.t-icon-ai-textformat-italic::before {
  content: '\E034';
}
.t-icon-ai-tool-filled::before {
  content: '\E035';
}
.t-icon-ai-tool::before {
  content: '\E036';
}
.t-icon-ai-video-filled::before {
  content: '\E037';
}
.t-icon-ai-video::before {
  content: '\E038';
}
.t-icon-ai::before {
  content: '\E039';
}
.t-icon-airplay-wave-filled::before {
  content: '\E03A';
}
.t-icon-airplay-wave::before {
  content: '\E03B';
}
.t-icon-alarm-add-filled::before {
  content: '\E03C';
}
.t-icon-alarm-add::before {
  content: '\E03D';
}
.t-icon-alarm-filled::before {
  content: '\E03E';
}
.t-icon-alarm-off-filled::before {
  content: '\E03F';
}
.t-icon-alarm-off::before {
  content: '\E040';
}
.t-icon-alarm::before {
  content: '\E041';
}
.t-icon-align-bottom::before {
  content: '\E042';
}
.t-icon-align-top::before {
  content: '\E043';
}
.t-icon-align-vertical::before {
  content: '\E044';
}
.t-icon-alpha::before {
  content: '\E045';
}
.t-icon-analytics-filled::before {
  content: '\E046';
}
.t-icon-analytics::before {
  content: '\E047';
}
.t-icon-anchor::before {
  content: '\E048';
}
.t-icon-angry-filled::before {
  content: '\E049';
}
.t-icon-angry::before {
  content: '\E04A';
}
.t-icon-animation-1-filled::before {
  content: '\E04B';
}
.t-icon-animation-1::before {
  content: '\E04C';
}
.t-icon-animation-filled::before {
  content: '\E04D';
}
.t-icon-animation::before {
  content: '\E04E';
}
.t-icon-anticlockwise-filled::before {
  content: '\E04F';
}
.t-icon-anticlockwise::before {
  content: '\E050';
}
.t-icon-api::before {
  content: '\E051';
}
.t-icon-app-filled::before {
  content: '\E052';
}
.t-icon-app::before {
  content: '\E053';
}
.t-icon-apple-filled::before {
  content: '\E054';
}
.t-icon-apple::before {
  content: '\E055';
}
.t-icon-application-filled::before {
  content: '\E056';
}
.t-icon-application::before {
  content: '\E057';
}
.t-icon-architecture-hui-style-filled::before {
  content: '\E058';
}
.t-icon-architecture-hui-style::before {
  content: '\E059';
}
.t-icon-archway-1-filled::before {
  content: '\E05A';
}
.t-icon-archway-1::before {
  content: '\E05B';
}
.t-icon-archway-filled::before {
  content: '\E05C';
}
.t-icon-archway::before {
  content: '\E05D';
}
.t-icon-arrow-down-circle-filled::before {
  content: '\E05E';
}
.t-icon-arrow-down-circle::before {
  content: '\E05F';
}
.t-icon-arrow-down-rectangle-filled::before {
  content: '\E060';
}
.t-icon-arrow-down-rectangle::before {
  content: '\E061';
}
.t-icon-arrow-down::before {
  content: '\E062';
}
.t-icon-arrow-left-circle-filled::before {
  content: '\E063';
}
.t-icon-arrow-left-circle::before {
  content: '\E064';
}
.t-icon-arrow-left-down-circle-filled::before {
  content: '\E065';
}
.t-icon-arrow-left-down-circle::before {
  content: '\E066';
}
.t-icon-arrow-left-down::before {
  content: '\E067';
}
.t-icon-arrow-left-right-1::before {
  content: '\E068';
}
.t-icon-arrow-left-right-2::before {
  content: '\E069';
}
.t-icon-arrow-left-right-3::before {
  content: '\E06A';
}
.t-icon-arrow-left-right-circle-filled::before {
  content: '\E06B';
}
.t-icon-arrow-left-right-circle::before {
  content: '\E06C';
}
.t-icon-arrow-left-up-circle-filled::before {
  content: '\E06D';
}
.t-icon-arrow-left-up-circle::before {
  content: '\E06E';
}
.t-icon-arrow-left-up::before {
  content: '\E06F';
}
.t-icon-arrow-left::before {
  content: '\E070';
}
.t-icon-arrow-right-circle-filled::before {
  content: '\E071';
}
.t-icon-arrow-right-circle::before {
  content: '\E072';
}
.t-icon-arrow-right-down-circle-filled::before {
  content: '\E073';
}
.t-icon-arrow-right-down-circle::before {
  content: '\E074';
}
.t-icon-arrow-right-down::before {
  content: '\E075';
}
.t-icon-arrow-right-up-circle-filled::before {
  content: '\E076';
}
.t-icon-arrow-right-up-circle::before {
  content: '\E077';
}
.t-icon-arrow-right-up::before {
  content: '\E078';
}
.t-icon-arrow-right::before {
  content: '\E079';
}
.t-icon-arrow-triangle-down-filled::before {
  content: '\E07A';
}
.t-icon-arrow-triangle-down::before {
  content: '\E07B';
}
.t-icon-arrow-triangle-up-filled::before {
  content: '\E07C';
}
.t-icon-arrow-triangle-up::before {
  content: '\E07D';
}
.t-icon-arrow-up-circle-filled::before {
  content: '\E07E';
}
.t-icon-arrow-up-circle::before {
  content: '\E07F';
}
.t-icon-arrow-up-down-1::before {
  content: '\E080';
}
.t-icon-arrow-up-down-2::before {
  content: '\E081';
}
.t-icon-arrow-up-down-3::before {
  content: '\E082';
}
.t-icon-arrow-up-down-circle-filled::before {
  content: '\E083';
}
.t-icon-arrow-up-down-circle::before {
  content: '\E084';
}
.t-icon-arrow-up::before {
  content: '\E085';
}
.t-icon-artboard::before {
  content: '\E086';
}
.t-icon-article-filled::before {
  content: '\E087';
}
.t-icon-article::before {
  content: '\E088';
}
.t-icon-assignment-checked-filled::before {
  content: '\E089';
}
.t-icon-assignment-checked::before {
  content: '\E08A';
}
.t-icon-assignment-code-filled::before {
  content: '\E08B';
}
.t-icon-assignment-code::before {
  content: '\E08C';
}
.t-icon-assignment-error-filled::before {
  content: '\E08D';
}
.t-icon-assignment-error::before {
  content: '\E08E';
}
.t-icon-assignment-filled::before {
  content: '\E08F';
}
.t-icon-assignment-user-filled::before {
  content: '\E090';
}
.t-icon-assignment-user::before {
  content: '\E091';
}
.t-icon-assignment::before {
  content: '\E092';
}
.t-icon-attach::before {
  content: '\E093';
}
.t-icon-attachment-list::before {
  content: '\E094';
}
.t-icon-attic-1-filled::before {
  content: '\E095';
}
.t-icon-attic-1::before {
  content: '\E096';
}
.t-icon-attic-filled::before {
  content: '\E097';
}
.t-icon-attic::before {
  content: '\E098';
}
.t-icon-audio-filled::before {
  content: '\E099';
}
.t-icon-audio::before {
  content: '\E09A';
}
.t-icon-automatic-numbering::before {
  content: '\E09B';
}
.t-icon-automation-filled::before {
  content: '\E09C';
}
.t-icon-automation::before {
  content: '\E09D';
}
.t-icon-awkward-filled::before {
  content: '\E09E';
}
.t-icon-awkward::before {
  content: '\E09F';
}
.t-icon-backtop-rectangle-filled::before {
  content: '\E0A0';
}
.t-icon-backtop-rectangle::before {
  content: '\E0A1';
}
.t-icon-backtop::before {
  content: '\E0A2';
}
.t-icon-backup-filled::before {
  content: '\E0A3';
}
.t-icon-backup::before {
  content: '\E0A4';
}
.t-icon-backward-filled::before {
  content: '\E0A5';
}
.t-icon-backward::before {
  content: '\E0A6';
}
.t-icon-bad-laugh-filled::before {
  content: '\E0A7';
}
.t-icon-bad-laugh::before {
  content: '\E0A8';
}
.t-icon-bamboo-shoot-filled::before {
  content: '\E0A9';
}
.t-icon-bamboo-shoot::before {
  content: '\E0AA';
}
.t-icon-banana-filled::before {
  content: '\E0AB';
}
.t-icon-banana::before {
  content: '\E0AC';
}
.t-icon-barbecue-filled::before {
  content: '\E0AD';
}
.t-icon-barbecue::before {
  content: '\E0AE';
}
.t-icon-barcode-1::before {
  content: '\E0AF';
}
.t-icon-barcode::before {
  content: '\E0B0';
}
.t-icon-base-station::before {
  content: '\E0B1';
}
.t-icon-battery-add-filled::before {
  content: '\E0B2';
}
.t-icon-battery-add::before {
  content: '\E0B3';
}
.t-icon-battery-charging-filled::before {
  content: '\E0B4';
}
.t-icon-battery-charging::before {
  content: '\E0B5';
}
.t-icon-battery-filled::before {
  content: '\E0B6';
}
.t-icon-battery-low-filled::before {
  content: '\E0B7';
}
.t-icon-battery-low::before {
  content: '\E0B8';
}
.t-icon-battery::before {
  content: '\E0B9';
}
.t-icon-bean-filled::before {
  content: '\E0BA';
}
.t-icon-bean::before {
  content: '\E0BB';
}
.t-icon-beer-filled::before {
  content: '\E0BC';
}
.t-icon-beer::before {
  content: '\E0BD';
}
.t-icon-beta::before {
  content: '\E0BE';
}
.t-icon-bifurcate-filled::before {
  content: '\E0BF';
}
.t-icon-bifurcate::before {
  content: '\E0C0';
}
.t-icon-bill-filled::before {
  content: '\E0C1';
}
.t-icon-bill::before {
  content: '\E0C2';
}
.t-icon-bluetooth::before {
  content: '\E0C3';
}
.t-icon-bone-filled::before {
  content: '\E0C4';
}
.t-icon-bone::before {
  content: '\E0C5';
}
.t-icon-book-filled::before {
  content: '\E0C6';
}
.t-icon-book-open-filled::before {
  content: '\E0C7';
}
.t-icon-book-open::before {
  content: '\E0C8';
}
.t-icon-book-unknown-filled::before {
  content: '\E0C9';
}
.t-icon-book-unknown::before {
  content: '\E0CA';
}
.t-icon-book::before {
  content: '\E0CB';
}
.t-icon-bookmark-add-filled::before {
  content: '\E0CC';
}
.t-icon-bookmark-add::before {
  content: '\E0CD';
}
.t-icon-bookmark-checked-filled::before {
  content: '\E0CE';
}
.t-icon-bookmark-checked::before {
  content: '\E0CF';
}
.t-icon-bookmark-double-filled::before {
  content: '\E0D0';
}
.t-icon-bookmark-double::before {
  content: '\E0D1';
}
.t-icon-bookmark-filled::before {
  content: '\E0D2';
}
.t-icon-bookmark-minus-filled::before {
  content: '\E0D3';
}
.t-icon-bookmark-minus::before {
  content: '\E0D4';
}
.t-icon-bookmark::before {
  content: '\E0D5';
}
.t-icon-braces::before {
  content: '\E0D6';
}
.t-icon-brackets::before {
  content: '\E0D7';
}
.t-icon-bread-filled::before {
  content: '\E0D8';
}
.t-icon-bread::before {
  content: '\E0D9';
}
.t-icon-bridge-1-filled::before {
  content: '\E0DA';
}
.t-icon-bridge-1::before {
  content: '\E0DB';
}
.t-icon-bridge-2-filled::before {
  content: '\E0DC';
}
.t-icon-bridge-2::before {
  content: '\E0DD';
}
.t-icon-bridge-3::before {
  content: '\E0DE';
}
.t-icon-bridge-4::before {
  content: '\E0DF';
}
.t-icon-bridge-5-filled::before {
  content: '\E0E0';
}
.t-icon-bridge-5::before {
  content: '\E0E1';
}
.t-icon-bridge-6-filled::before {
  content: '\E0E2';
}
.t-icon-bridge-6::before {
  content: '\E0E3';
}
.t-icon-bridge::before {
  content: '\E0E4';
}
.t-icon-brightness-1-filled::before {
  content: '\E0E5';
}
.t-icon-brightness-1::before {
  content: '\E0E6';
}
.t-icon-brightness-filled::before {
  content: '\E0E7';
}
.t-icon-brightness::before {
  content: '\E0E8';
}
.t-icon-broccoli-filled::before {
  content: '\E0E9';
}
.t-icon-broccoli::before {
  content: '\E0EA';
}
.t-icon-browse-filled::before {
  content: '\E0EB';
}
.t-icon-browse-gallery-filled::before {
  content: '\E0EC';
}
.t-icon-browse-gallery::before {
  content: '\E0ED';
}
.t-icon-browse-off-filled::before {
  content: '\E0EE';
}
.t-icon-browse-off::before {
  content: '\E0EF';
}
.t-icon-browse::before {
  content: '\E0F0';
}
.t-icon-brush-filled::before {
  content: '\E0F1';
}
.t-icon-brush::before {
  content: '\E0F2';
}
.t-icon-bug-filled::before {
  content: '\E0F3';
}
.t-icon-bug-report-filled::before {
  content: '\E0F4';
}
.t-icon-bug-report::before {
  content: '\E0F5';
}
.t-icon-bug::before {
  content: '\E0F6';
}
.t-icon-building-1-filled::before {
  content: '\E0F7';
}
.t-icon-building-1::before {
  content: '\E0F8';
}
.t-icon-building-2-filled::before {
  content: '\E0F9';
}
.t-icon-building-2::before {
  content: '\E0FA';
}
.t-icon-building-3-filled::before {
  content: '\E0FB';
}
.t-icon-building-3::before {
  content: '\E0FC';
}
.t-icon-building-4-filled::before {
  content: '\E0FD';
}
.t-icon-building-4::before {
  content: '\E0FE';
}
.t-icon-building-5-filled::before {
  content: '\E0FF';
}
.t-icon-building-5::before {
  content: '\E100';
}
.t-icon-building-filled::before {
  content: '\E101';
}
.t-icon-building::before {
  content: '\E102';
}
.t-icon-bulletpoint::before {
  content: '\E103';
}
.t-icon-button-filled::before {
  content: '\E104';
}
.t-icon-button::before {
  content: '\E105';
}
.t-icon-cabbage-filled::before {
  content: '\E106';
}
.t-icon-cabbage::before {
  content: '\E107';
}
.t-icon-cake-filled::before {
  content: '\E108';
}
.t-icon-cake::before {
  content: '\E109';
}
.t-icon-calculation-1-filled::before {
  content: '\E10A';
}
.t-icon-calculation-1::before {
  content: '\E10B';
}
.t-icon-calculation::before {
  content: '\E10C';
}
.t-icon-calculator-1::before {
  content: '\E10D';
}
.t-icon-calculator-filled::before {
  content: '\E10E';
}
.t-icon-calculator::before {
  content: '\E10F';
}
.t-icon-calendar-1-filled::before {
  content: '\E110';
}
.t-icon-calendar-1::before {
  content: '\E111';
}
.t-icon-calendar-2-filled::before {
  content: '\E112';
}
.t-icon-calendar-2::before {
  content: '\E113';
}
.t-icon-calendar-3-filled::before {
  content: '\E114';
}
.t-icon-calendar-3::before {
  content: '\E115';
}
.t-icon-calendar-edit-filled::before {
  content: '\E116';
}
.t-icon-calendar-edit::before {
  content: '\E117';
}
.t-icon-calendar-event-filled::before {
  content: '\E118';
}
.t-icon-calendar-event::before {
  content: '\E119';
}
.t-icon-calendar-filled::before {
  content: '\E11A';
}
.t-icon-calendar::before {
  content: '\E11B';
}
.t-icon-call-1-filled::before {
  content: '\E11C';
}
.t-icon-call-1::before {
  content: '\E11D';
}
.t-icon-call-cancel-filled::before {
  content: '\E11E';
}
.t-icon-call-cancel::before {
  content: '\E11F';
}
.t-icon-call-filled::before {
  content: '\E120';
}
.t-icon-call-forwarded-filled::before {
  content: '\E121';
}
.t-icon-call-forwarded::before {
  content: '\E122';
}
.t-icon-call-incoming-filled::before {
  content: '\E123';
}
.t-icon-call-incoming::before {
  content: '\E124';
}
.t-icon-call-off-filled::before {
  content: '\E125';
}
.t-icon-call-off::before {
  content: '\E126';
}
.t-icon-call::before {
  content: '\E127';
}
.t-icon-calm-1-filled::before {
  content: '\E128';
}
.t-icon-calm-1::before {
  content: '\E129';
}
.t-icon-calm-filled::before {
  content: '\E12A';
}
.t-icon-calm::before {
  content: '\E12B';
}
.t-icon-camera-1-filled::before {
  content: '\E12C';
}
.t-icon-camera-1::before {
  content: '\E12D';
}
.t-icon-camera-2-filled::before {
  content: '\E12E';
}
.t-icon-camera-2::before {
  content: '\E12F';
}
.t-icon-camera-filled::before {
  content: '\E130';
}
.t-icon-camera-off-filled::before {
  content: '\E131';
}
.t-icon-camera-off::before {
  content: '\E132';
}
.t-icon-camera::before {
  content: '\E133';
}
.t-icon-candy-filled::before {
  content: '\E134';
}
.t-icon-candy::before {
  content: '\E135';
}
.t-icon-card-filled::before {
  content: '\E136';
}
.t-icon-card::before {
  content: '\E137';
}
.t-icon-cardmembership-filled::before {
  content: '\E138';
}
.t-icon-cardmembership::before {
  content: '\E139';
}
.t-icon-caret-down-small::before {
  content: '\E13A';
}
.t-icon-caret-down::before {
  content: '\E13B';
}
.t-icon-caret-left-small::before {
  content: '\E13C';
}
.t-icon-caret-left::before {
  content: '\E13D';
}
.t-icon-caret-right-small::before {
  content: '\E13E';
}
.t-icon-caret-right::before {
  content: '\E13F';
}
.t-icon-caret-up-small::before {
  content: '\E140';
}
.t-icon-caret-up::before {
  content: '\E141';
}
.t-icon-cart-add-filled::before {
  content: '\E142';
}
.t-icon-cart-add::before {
  content: '\E143';
}
.t-icon-cart-filled::before {
  content: '\E144';
}
.t-icon-cart::before {
  content: '\E145';
}
.t-icon-cast-filled::before {
  content: '\E146';
}
.t-icon-cast::before {
  content: '\E147';
}
.t-icon-castle-1-filled::before {
  content: '\E148';
}
.t-icon-castle-1::before {
  content: '\E149';
}
.t-icon-castle-2-filled::before {
  content: '\E14A';
}
.t-icon-castle-2::before {
  content: '\E14B';
}
.t-icon-castle-3-filled::before {
  content: '\E14C';
}
.t-icon-castle-3::before {
  content: '\E14D';
}
.t-icon-castle-4-filled::before {
  content: '\E14E';
}
.t-icon-castle-4::before {
  content: '\E14F';
}
.t-icon-castle-5-filled::before {
  content: '\E150';
}
.t-icon-castle-5::before {
  content: '\E151';
}
.t-icon-castle-6-filled::before {
  content: '\E152';
}
.t-icon-castle-6::before {
  content: '\E153';
}
.t-icon-castle-7-filled::before {
  content: '\E154';
}
.t-icon-castle-7::before {
  content: '\E155';
}
.t-icon-castle-filled::before {
  content: '\E156';
}
.t-icon-castle::before {
  content: '\E157';
}
.t-icon-cat-filled::before {
  content: '\E158';
}
.t-icon-cat::before {
  content: '\E159';
}
.t-icon-catalog-1::before {
  content: '\E15A';
}
.t-icon-catalog-filled::before {
  content: '\E15B';
}
.t-icon-catalog::before {
  content: '\E15C';
}
.t-icon-cd-filled::before {
  content: '\E15D';
}
.t-icon-cd::before {
  content: '\E15E';
}
.t-icon-celsius::before {
  content: '\E15F';
}
.t-icon-center-focus-strong-filled::before {
  content: '\E160';
}
.t-icon-center-focus-strong::before {
  content: '\E161';
}
.t-icon-centimeter::before {
  content: '\E162';
}
.t-icon-certificate-1-filled::before {
  content: '\E163';
}
.t-icon-certificate-1::before {
  content: '\E164';
}
.t-icon-certificate-filled::before {
  content: '\E165';
}
.t-icon-certificate::before {
  content: '\E166';
}
.t-icon-chart-3d-filled::before {
  content: '\E167';
}
.t-icon-chart-3d::before {
  content: '\E168';
}
.t-icon-chart-add-filled::before {
  content: '\E169';
}
.t-icon-chart-add::before {
  content: '\E16A';
}
.t-icon-chart-analytics::before {
  content: '\E16B';
}
.t-icon-chart-area-filled::before {
  content: '\E16C';
}
.t-icon-chart-area-multi-filled::before {
  content: '\E16D';
}
.t-icon-chart-area-multi::before {
  content: '\E16E';
}
.t-icon-chart-area::before {
  content: '\E16F';
}
.t-icon-chart-bar-filled::before {
  content: '\E170';
}
.t-icon-chart-bar::before {
  content: '\E171';
}
.t-icon-chart-bubble-filled::before {
  content: '\E172';
}
.t-icon-chart-bubble::before {
  content: '\E173';
}
.t-icon-chart-column-filled::before {
  content: '\E174';
}
.t-icon-chart-column::before {
  content: '\E175';
}
.t-icon-chart-combo-filled::before {
  content: '\E176';
}
.t-icon-chart-combo::before {
  content: '\E177';
}
.t-icon-chart-draw-io-filled::before {
  content: '\E178';
}
.t-icon-chart-draw-io::before {
  content: '\E179';
}
.t-icon-chart-filled::before {
  content: '\E17A';
}
.t-icon-chart-line-board-filled::before {
  content: '\E17B';
}
.t-icon-chart-line-board::before {
  content: '\E17C';
}
.t-icon-chart-line-data-1::before {
  content: '\E17D';
}
.t-icon-chart-line-data::before {
  content: '\E17E';
}
.t-icon-chart-line-multi::before {
  content: '\E17F';
}
.t-icon-chart-line::before {
  content: '\E180';
}
.t-icon-chart-maximum::before {
  content: '\E181';
}
.t-icon-chart-median::before {
  content: '\E182';
}
.t-icon-chart-minimum::before {
  content: '\E183';
}
.t-icon-chart-pie-filled::before {
  content: '\E184';
}
.t-icon-chart-pie::before {
  content: '\E185';
}
.t-icon-chart-radar-filled::before {
  content: '\E186';
}
.t-icon-chart-radar::before {
  content: '\E187';
}
.t-icon-chart-radial::before {
  content: '\E188';
}
.t-icon-chart-ring-1-filled::before {
  content: '\E189';
}
.t-icon-chart-ring-1::before {
  content: '\E18A';
}
.t-icon-chart-ring-filled::before {
  content: '\E18B';
}
.t-icon-chart-ring::before {
  content: '\E18C';
}
.t-icon-chart-scatter::before {
  content: '\E18D';
}
.t-icon-chart-stacked-filled::before {
  content: '\E18E';
}
.t-icon-chart-stacked::before {
  content: '\E18F';
}
.t-icon-chart::before {
  content: '\E190';
}
.t-icon-chat-add-filled::before {
  content: '\E191';
}
.t-icon-chat-add::before {
  content: '\E192';
}
.t-icon-chat-bubble-1-filled::before {
  content: '\E193';
}
.t-icon-chat-bubble-1::before {
  content: '\E194';
}
.t-icon-chat-bubble-add-filled::before {
  content: '\E195';
}
.t-icon-chat-bubble-add::before {
  content: '\E196';
}
.t-icon-chat-bubble-error-filled::before {
  content: '\E197';
}
.t-icon-chat-bubble-error::before {
  content: '\E198';
}
.t-icon-chat-bubble-filled::before {
  content: '\E199';
}
.t-icon-chat-bubble-help-filled::before {
  content: '\E19A';
}
.t-icon-chat-bubble-help::before {
  content: '\E19B';
}
.t-icon-chat-bubble-history-filled::before {
  content: '\E19C';
}
.t-icon-chat-bubble-history::before {
  content: '\E19D';
}
.t-icon-chat-bubble-locked-filled::before {
  content: '\E19E';
}
.t-icon-chat-bubble-locked::before {
  content: '\E19F';
}
.t-icon-chat-bubble-smile-filled::before {
  content: '\E1A0';
}
.t-icon-chat-bubble-smile::before {
  content: '\E1A1';
}
.t-icon-chat-bubble::before {
  content: '\E1A2';
}
.t-icon-chat-checked-filled::before {
  content: '\E1A3';
}
.t-icon-chat-checked::before {
  content: '\E1A4';
}
.t-icon-chat-clear-filled::before {
  content: '\E1A5';
}
.t-icon-chat-clear::before {
  content: '\E1A6';
}
.t-icon-chat-double-filled::before {
  content: '\E1A7';
}
.t-icon-chat-double::before {
  content: '\E1A8';
}
.t-icon-chat-error-filled::before {
  content: '\E1A9';
}
.t-icon-chat-error::before {
  content: '\E1AA';
}
.t-icon-chat-filled::before {
  content: '\E1AB';
}
.t-icon-chat-heart-filled::before {
  content: '\E1AC';
}
.t-icon-chat-heart::before {
  content: '\E1AD';
}
.t-icon-chat-message-filled::before {
  content: '\E1AE';
}
.t-icon-chat-message::before {
  content: '\E1AF';
}
.t-icon-chat-off-filled::before {
  content: '\E1B0';
}
.t-icon-chat-off::before {
  content: '\E1B1';
}
.t-icon-chat-poll-filled::before {
  content: '\E1B2';
}
.t-icon-chat-poll::before {
  content: '\E1B3';
}
.t-icon-chat-setting-filled::before {
  content: '\E1B4';
}
.t-icon-chat-setting::before {
  content: '\E1B5';
}
.t-icon-chat::before {
  content: '\E1B6';
}
.t-icon-check-circle-filled::before {
  content: '\E1B7';
}
.t-icon-check-circle::before {
  content: '\E1B8';
}
.t-icon-check-double::before {
  content: '\E1B9';
}
.t-icon-check-rectangle-filled::before {
  content: '\E1BA';
}
.t-icon-check-rectangle::before {
  content: '\E1BB';
}
.t-icon-check::before {
  content: '\E1BC';
}
.t-icon-cheese-filled::before {
  content: '\E1BD';
}
.t-icon-cheese::before {
  content: '\E1BE';
}
.t-icon-cherry-filled::before {
  content: '\E1BF';
}
.t-icon-cherry::before {
  content: '\E1C0';
}
.t-icon-chevron-down-circle-filled::before {
  content: '\E1C1';
}
.t-icon-chevron-down-circle::before {
  content: '\E1C2';
}
.t-icon-chevron-down-double-s::before {
  content: '\E1C3';
}
.t-icon-chevron-down-double::before {
  content: '\E1C4';
}
.t-icon-chevron-down-rectangle-filled::before {
  content: '\E1C5';
}
.t-icon-chevron-down-rectangle::before {
  content: '\E1C6';
}
.t-icon-chevron-down-s::before {
  content: '\E1C7';
}
.t-icon-chevron-down::before {
  content: '\E1C8';
}
.t-icon-chevron-left-circle-filled::before {
  content: '\E1C9';
}
.t-icon-chevron-left-circle::before {
  content: '\E1CA';
}
.t-icon-chevron-left-double-s::before {
  content: '\E1CB';
}
.t-icon-chevron-left-double::before {
  content: '\E1CC';
}
.t-icon-chevron-left-rectangle-filled::before {
  content: '\E1CD';
}
.t-icon-chevron-left-rectangle::before {
  content: '\E1CE';
}
.t-icon-chevron-left-s::before {
  content: '\E1CF';
}
.t-icon-chevron-left::before {
  content: '\E1D0';
}
.t-icon-chevron-right-circle-filled::before {
  content: '\E1D1';
}
.t-icon-chevron-right-circle::before {
  content: '\E1D2';
}
.t-icon-chevron-right-double-s::before {
  content: '\E1D3';
}
.t-icon-chevron-right-double::before {
  content: '\E1D4';
}
.t-icon-chevron-right-rectangle-filled::before {
  content: '\E1D5';
}
.t-icon-chevron-right-rectangle::before {
  content: '\E1D6';
}
.t-icon-chevron-right-s::before {
  content: '\E1D7';
}
.t-icon-chevron-right::before {
  content: '\E1D8';
}
.t-icon-chevron-up-circle-filled::before {
  content: '\E1D9';
}
.t-icon-chevron-up-circle::before {
  content: '\E1DA';
}
.t-icon-chevron-up-double-s::before {
  content: '\E1DB';
}
.t-icon-chevron-up-double::before {
  content: '\E1DC';
}
.t-icon-chevron-up-rectangle-filled::before {
  content: '\E1DD';
}
.t-icon-chevron-up-rectangle::before {
  content: '\E1DE';
}
.t-icon-chevron-up-s::before {
  content: '\E1DF';
}
.t-icon-chevron-up::before {
  content: '\E1E0';
}
.t-icon-chicken::before {
  content: '\E1E1';
}
.t-icon-chili-filled::before {
  content: '\E1E2';
}
.t-icon-chili::before {
  content: '\E1E3';
}
.t-icon-chimney-1-filled::before {
  content: '\E1E4';
}
.t-icon-chimney-1::before {
  content: '\E1E5';
}
.t-icon-chimney-2-filled::before {
  content: '\E1E6';
}
.t-icon-chimney-2::before {
  content: '\E1E7';
}
.t-icon-chimney-filled::before {
  content: '\E1E8';
}
.t-icon-chimney::before {
  content: '\E1E9';
}
.t-icon-chinese-cabbage-filled::before {
  content: '\E1EA';
}
.t-icon-chinese-cabbage::before {
  content: '\E1EB';
}
.t-icon-chinese-rectangle-filled::before {
  content: '\E1EC';
}
.t-icon-chinese-rectangle::before {
  content: '\E1ED';
}
.t-icon-church-filled::before {
  content: '\E1EE';
}
.t-icon-church::before {
  content: '\E1EF';
}
.t-icon-circle-filled::before {
  content: '\E1F0';
}
.t-icon-circle::before {
  content: '\E1F1';
}
.t-icon-city-1-filled::before {
  content: '\E1F2';
}
.t-icon-city-1::before {
  content: '\E1F3';
}
.t-icon-city-10-filled::before {
  content: '\E1F4';
}
.t-icon-city-10::before {
  content: '\E1F5';
}
.t-icon-city-11-filled::before {
  content: '\E1F6';
}
.t-icon-city-11::before {
  content: '\E1F7';
}
.t-icon-city-12-filled::before {
  content: '\E1F8';
}
.t-icon-city-12::before {
  content: '\E1F9';
}
.t-icon-city-13-filled::before {
  content: '\E1FA';
}
.t-icon-city-13::before {
  content: '\E1FB';
}
.t-icon-city-14-filled::before {
  content: '\E1FC';
}
.t-icon-city-14::before {
  content: '\E1FD';
}
.t-icon-city-15-filled::before {
  content: '\E1FE';
}
.t-icon-city-15::before {
  content: '\E1FF';
}
.t-icon-city-2-filled::before {
  content: '\E200';
}
.t-icon-city-2::before {
  content: '\E201';
}
.t-icon-city-3-filled::before {
  content: '\E202';
}
.t-icon-city-3::before {
  content: '\E203';
}
.t-icon-city-4-filled::before {
  content: '\E204';
}
.t-icon-city-4::before {
  content: '\E205';
}
.t-icon-city-5-filled::before {
  content: '\E206';
}
.t-icon-city-5::before {
  content: '\E207';
}
.t-icon-city-6-filled::before {
  content: '\E208';
}
.t-icon-city-6::before {
  content: '\E209';
}
.t-icon-city-7-filled::before {
  content: '\E20A';
}
.t-icon-city-7::before {
  content: '\E20B';
}
.t-icon-city-8-filled::before {
  content: '\E20C';
}
.t-icon-city-8::before {
  content: '\E20D';
}
.t-icon-city-9-filled::before {
  content: '\E20E';
}
.t-icon-city-9::before {
  content: '\E20F';
}
.t-icon-city-ancient-1-filled::before {
  content: '\E210';
}
.t-icon-city-ancient-1::before {
  content: '\E211';
}
.t-icon-city-ancient-2-filled::before {
  content: '\E212';
}
.t-icon-city-ancient-2::before {
  content: '\E213';
}
.t-icon-city-ancient-filled::before {
  content: '\E214';
}
.t-icon-city-ancient::before {
  content: '\E215';
}
.t-icon-city-filled::before {
  content: '\E216';
}
.t-icon-city::before {
  content: '\E217';
}
.t-icon-clear-filled::before {
  content: '\E218';
}
.t-icon-clear-formatting-1-filled::before {
  content: '\E219';
}
.t-icon-clear-formatting-1::before {
  content: '\E21A';
}
.t-icon-clear-formatting-filled::before {
  content: '\E21B';
}
.t-icon-clear-formatting::before {
  content: '\E21C';
}
.t-icon-clear::before {
  content: '\E21D';
}
.t-icon-close-circle-filled::before {
  content: '\E21E';
}
.t-icon-close-circle::before {
  content: '\E21F';
}
.t-icon-close-octagon-filled::before {
  content: '\E220';
}
.t-icon-close-octagon::before {
  content: '\E221';
}
.t-icon-close-rectangle-filled::before {
  content: '\E222';
}
.t-icon-close-rectangle::before {
  content: '\E223';
}
.t-icon-close::before {
  content: '\E224';
}
.t-icon-cloud-download::before {
  content: '\E225';
}
.t-icon-cloud-filled::before {
  content: '\E226';
}
.t-icon-cloud-upload::before {
  content: '\E227';
}
.t-icon-cloud::before {
  content: '\E228';
}
.t-icon-cloudy-day-filled::before {
  content: '\E229';
}
.t-icon-cloudy-day::before {
  content: '\E22A';
}
.t-icon-cloudy-night-filled::before {
  content: '\E22B';
}
.t-icon-cloudy-night-rain-filled::before {
  content: '\E22C';
}
.t-icon-cloudy-night-rain::before {
  content: '\E22D';
}
.t-icon-cloudy-night::before {
  content: '\E22E';
}
.t-icon-cloudy-rain-filled::before {
  content: '\E22F';
}
.t-icon-cloudy-rain::before {
  content: '\E230';
}
.t-icon-cloudy-sunny-filled::before {
  content: '\E231';
}
.t-icon-cloudy-sunny::before {
  content: '\E232';
}
.t-icon-code-1::before {
  content: '\E233';
}
.t-icon-code-off::before {
  content: '\E234';
}
.t-icon-code::before {
  content: '\E235';
}
.t-icon-cola-filled::before {
  content: '\E236';
}
.t-icon-cola::before {
  content: '\E237';
}
.t-icon-collage-filled::before {
  content: '\E238';
}
.t-icon-collage::before {
  content: '\E239';
}
.t-icon-collapsible-block::before {
  content: '\E23A';
}
.t-icon-collection-1-filled::before {
  content: '\E23B';
}
.t-icon-collection-1::before {
  content: '\E23C';
}
.t-icon-collection-filled::before {
  content: '\E23D';
}
.t-icon-collection::before {
  content: '\E23E';
}
.t-icon-color-invert-filled::before {
  content: '\E23F';
}
.t-icon-color-invert::before {
  content: '\E240';
}
.t-icon-column-layout-filled::before {
  content: '\E241';
}
.t-icon-column-layout::before {
  content: '\E242';
}
.t-icon-combination-filled::before {
  content: '\E243';
}
.t-icon-combination::before {
  content: '\E244';
}
.t-icon-command::before {
  content: '\E245';
}
.t-icon-compass-1-filled::before {
  content: '\E246';
}
.t-icon-compass-1::before {
  content: '\E247';
}
.t-icon-compass-filled::before {
  content: '\E248';
}
.t-icon-compass::before {
  content: '\E249';
}
.t-icon-component-breadcrumb-filled::before {
  content: '\E24A';
}
.t-icon-component-breadcrumb::before {
  content: '\E24B';
}
.t-icon-component-checkbox-filled::before {
  content: '\E24C';
}
.t-icon-component-checkbox::before {
  content: '\E24D';
}
.t-icon-component-divider-horizontal-filled::before {
  content: '\E24E';
}
.t-icon-component-divider-horizontal::before {
  content: '\E24F';
}
.t-icon-component-divider-vertical-filled::before {
  content: '\E250';
}
.t-icon-component-divider-vertical::before {
  content: '\E251';
}
.t-icon-component-dropdown-filled::before {
  content: '\E252';
}
.t-icon-component-dropdown::before {
  content: '\E253';
}
.t-icon-component-grid-filled::before {
  content: '\E254';
}
.t-icon-component-grid::before {
  content: '\E255';
}
.t-icon-component-input-filled::before {
  content: '\E256';
}
.t-icon-component-input::before {
  content: '\E257';
}
.t-icon-component-layout-filled::before {
  content: '\E258';
}
.t-icon-component-layout::before {
  content: '\E259';
}
.t-icon-component-radio::before {
  content: '\E25A';
}
.t-icon-component-space-filled::before {
  content: '\E25B';
}
.t-icon-component-space::before {
  content: '\E25C';
}
.t-icon-component-steps-1-filled::before {
  content: '\E25D';
}
.t-icon-component-steps-1::before {
  content: '\E25E';
}
.t-icon-component-steps-filled::before {
  content: '\E25F';
}
.t-icon-component-steps::before {
  content: '\E260';
}
.t-icon-component-stickytool-filled::before {
  content: '\E261';
}
.t-icon-component-stickytool::before {
  content: '\E262';
}
.t-icon-component-switch-filled::before {
  content: '\E263';
}
.t-icon-component-switch::before {
  content: '\E264';
}
.t-icon-constraint::before {
  content: '\E265';
}
.t-icon-contrast-1-filled::before {
  content: '\E266';
}
.t-icon-contrast-1::before {
  content: '\E267';
}
.t-icon-contrast-filled::before {
  content: '\E268';
}
.t-icon-contrast::before {
  content: '\E269';
}
.t-icon-contribute-filled::before {
  content: '\E26A';
}
.t-icon-contribute::before {
  content: '\E26B';
}
.t-icon-control-platform-filled::before {
  content: '\E26C';
}
.t-icon-control-platform::before {
  content: '\E26D';
}
.t-icon-cooperate-filled::before {
  content: '\E26E';
}
.t-icon-cooperate::before {
  content: '\E26F';
}
.t-icon-coordinate-system-filled::before {
  content: '\E270';
}
.t-icon-coordinate-system::before {
  content: '\E271';
}
.t-icon-copy-filled::before {
  content: '\E272';
}
.t-icon-copy::before {
  content: '\E273';
}
.t-icon-copyright-filled::before {
  content: '\E274';
}
.t-icon-copyright::before {
  content: '\E275';
}
.t-icon-corn-filled::before {
  content: '\E276';
}
.t-icon-corn::before {
  content: '\E277';
}
.t-icon-correct-filled::before {
  content: '\E278';
}
.t-icon-correct::before {
  content: '\E279';
}
.t-icon-coupon-filled::before {
  content: '\E27A';
}
.t-icon-coupon::before {
  content: '\E27B';
}
.t-icon-course-filled::before {
  content: '\E27C';
}
.t-icon-course::before {
  content: '\E27D';
}
.t-icon-cpu-filled::before {
  content: '\E27E';
}
.t-icon-cpu::before {
  content: '\E27F';
}
.t-icon-crack-filled::before {
  content: '\E280';
}
.t-icon-crack::before {
  content: '\E281';
}
.t-icon-creditcard-add-filled::before {
  content: '\E282';
}
.t-icon-creditcard-add::before {
  content: '\E283';
}
.t-icon-creditcard-filled::before {
  content: '\E284';
}
.t-icon-creditcard-off-filled::before {
  content: '\E285';
}
.t-icon-creditcard-off::before {
  content: '\E286';
}
.t-icon-creditcard::before {
  content: '\E287';
}
.t-icon-crooked-smile-filled::before {
  content: '\E288';
}
.t-icon-crooked-smile::before {
  content: '\E289';
}
.t-icon-cry-and-laugh-filled::before {
  content: '\E28A';
}
.t-icon-cry-and-laugh::before {
  content: '\E28B';
}
.t-icon-cry-loudly-filled::before {
  content: '\E28C';
}
.t-icon-cry-loudly::before {
  content: '\E28D';
}
.t-icon-css3-filled::before {
  content: '\E28E';
}
.t-icon-css3::before {
  content: '\E28F';
}
.t-icon-cucumber::before {
  content: '\E290';
}
.t-icon-currency-exchange::before {
  content: '\E291';
}
.t-icon-cursor-filled::before {
  content: '\E292';
}
.t-icon-cursor::before {
  content: '\E293';
}
.t-icon-curtain-filled::before {
  content: '\E294';
}
.t-icon-curtain::before {
  content: '\E295';
}
.t-icon-curve::before {
  content: '\E296';
}
.t-icon-cut-1::before {
  content: '\E297';
}
.t-icon-cut::before {
  content: '\E298';
}
.t-icon-dam-1-filled::before {
  content: '\E299';
}
.t-icon-dam-1::before {
  content: '\E29A';
}
.t-icon-dam-2-filled::before {
  content: '\E29B';
}
.t-icon-dam-2::before {
  content: '\E29C';
}
.t-icon-dam-3-filled::before {
  content: '\E29D';
}
.t-icon-dam-3::before {
  content: '\E29E';
}
.t-icon-dam-4-filled::before {
  content: '\E29F';
}
.t-icon-dam-4::before {
  content: '\E2A0';
}
.t-icon-dam-5-filled::before {
  content: '\E2A1';
}
.t-icon-dam-5::before {
  content: '\E2A2';
}
.t-icon-dam-6-filled::before {
  content: '\E2A3';
}
.t-icon-dam-6::before {
  content: '\E2A4';
}
.t-icon-dam-7-filled::before {
  content: '\E2A5';
}
.t-icon-dam-7::before {
  content: '\E2A6';
}
.t-icon-dam-filled::before {
  content: '\E2A7';
}
.t-icon-dam::before {
  content: '\E2A8';
}
.t-icon-dart-board-filled::before {
  content: '\E2A9';
}
.t-icon-dart-board::before {
  content: '\E2AA';
}
.t-icon-dashboard-1-filled::before {
  content: '\E2AB';
}
.t-icon-dashboard-1::before {
  content: '\E2AC';
}
.t-icon-dashboard-filled::before {
  content: '\E2AD';
}
.t-icon-dashboard::before {
  content: '\E2AE';
}
.t-icon-data-base-filled::before {
  content: '\E2AF';
}
.t-icon-data-base::before {
  content: '\E2B0';
}
.t-icon-data-checked-filled::before {
  content: '\E2B1';
}
.t-icon-data-checked::before {
  content: '\E2B2';
}
.t-icon-data-display::before {
  content: '\E2B3';
}
.t-icon-data-error-filled::before {
  content: '\E2B4';
}
.t-icon-data-error::before {
  content: '\E2B5';
}
.t-icon-data-filled::before {
  content: '\E2B6';
}
.t-icon-data-search-filled::before {
  content: '\E2B7';
}
.t-icon-data-search::before {
  content: '\E2B8';
}
.t-icon-data::before {
  content: '\E2B9';
}
.t-icon-delete-1-filled::before {
  content: '\E2BA';
}
.t-icon-delete-1::before {
  content: '\E2BB';
}
.t-icon-delete-filled::before {
  content: '\E2BC';
}
.t-icon-delete-time-filled::before {
  content: '\E2BD';
}
.t-icon-delete-time::before {
  content: '\E2BE';
}
.t-icon-delete::before {
  content: '\E2BF';
}
.t-icon-delta-filled::before {
  content: '\E2C0';
}
.t-icon-delta::before {
  content: '\E2C1';
}
.t-icon-depressed-filled::before {
  content: '\E2C2';
}
.t-icon-depressed::before {
  content: '\E2C3';
}
.t-icon-desktop-1-filled::before {
  content: '\E2C4';
}
.t-icon-desktop-1::before {
  content: '\E2C5';
}
.t-icon-desktop-filled::before {
  content: '\E2C6';
}
.t-icon-desktop::before {
  content: '\E2C7';
}
.t-icon-despise-filled::before {
  content: '\E2C8';
}
.t-icon-despise::before {
  content: '\E2C9';
}
.t-icon-device-filled::before {
  content: '\E2CA';
}
.t-icon-device::before {
  content: '\E2CB';
}
.t-icon-dialog-history-filled::before {
  content: '\E2CC';
}
.t-icon-dialog-history::before {
  content: '\E2CD';
}
.t-icon-discount-filled::before {
  content: '\E2CE';
}
.t-icon-discount-list-filled::before {
  content: '\E2CF';
}
.t-icon-discount-list::before {
  content: '\E2D0';
}
.t-icon-discount::before {
  content: '\E2D1';
}
.t-icon-dissatisfaction-filled::before {
  content: '\E2D2';
}
.t-icon-dissatisfaction::before {
  content: '\E2D3';
}
.t-icon-divide::before {
  content: '\E2D4';
}
.t-icon-divider-1::before {
  content: '\E2D5';
}
.t-icon-dividers-1::before {
  content: '\E2D6';
}
.t-icon-dividers::before {
  content: '\E2D7';
}
.t-icon-document-location-filled::before {
  content: '\E2D8';
}
.t-icon-document-location::before {
  content: '\E2D9';
}
.t-icon-document-popular-filled::before {
  content: '\E2DA';
}
.t-icon-document-popular::before {
  content: '\E2DB';
}
.t-icon-document-update-filled::before {
  content: '\E2DC';
}
.t-icon-document-update::before {
  content: '\E2DD';
}
.t-icon-doge-filled::before {
  content: '\E2DE';
}
.t-icon-doge::before {
  content: '\E2DF';
}
.t-icon-double-storey-filled::before {
  content: '\E2E0';
}
.t-icon-double-storey::before {
  content: '\E2E1';
}
.t-icon-download-1::before {
  content: '\E2E2';
}
.t-icon-download-2-filled::before {
  content: '\E2E3';
}
.t-icon-download-2::before {
  content: '\E2E4';
}
.t-icon-download::before {
  content: '\E2E5';
}
.t-icon-downscale::before {
  content: '\E2E6';
}
.t-icon-draft-filled::before {
  content: '\E2E7';
}
.t-icon-draft::before {
  content: '\E2E8';
}
.t-icon-drag-drop::before {
  content: '\E2E9';
}
.t-icon-drag-move::before {
  content: '\E2EA';
}
.t-icon-drink-filled::before {
  content: '\E2EB';
}
.t-icon-drink::before {
  content: '\E2EC';
}
.t-icon-drumstick-filled::before {
  content: '\E2ED';
}
.t-icon-drumstick::before {
  content: '\E2EE';
}
.t-icon-dv-filled::before {
  content: '\E2EF';
}
.t-icon-dv::before {
  content: '\E2F0';
}
.t-icon-dvd-filled::before {
  content: '\E2F1';
}
.t-icon-dvd::before {
  content: '\E2F2';
}
.t-icon-earphone-filled::before {
  content: '\E2F3';
}
.t-icon-earphone::before {
  content: '\E2F4';
}
.t-icon-earth-filled::before {
  content: '\E2F5';
}
.t-icon-earth::before {
  content: '\E2F6';
}
.t-icon-edit-1-filled::before {
  content: '\E2F7';
}
.t-icon-edit-1::before {
  content: '\E2F8';
}
.t-icon-edit-2-filled::before {
  content: '\E2F9';
}
.t-icon-edit-2::before {
  content: '\E2FA';
}
.t-icon-edit-filled::before {
  content: '\E2FB';
}
.t-icon-edit-off-filled::before {
  content: '\E2FC';
}
.t-icon-edit-off::before {
  content: '\E2FD';
}
.t-icon-edit::before {
  content: '\E2FE';
}
.t-icon-education-filled::before {
  content: '\E2FF';
}
.t-icon-education::before {
  content: '\E300';
}
.t-icon-eggplant-filled::before {
  content: '\E301';
}
.t-icon-eggplant::before {
  content: '\E302';
}
.t-icon-ellipsis::before {
  content: '\E303';
}
.t-icon-emo-emotional-filled::before {
  content: '\E304';
}
.t-icon-emo-emotional::before {
  content: '\E305';
}
.t-icon-english-rectangle-filled::before {
  content: '\E306';
}
.t-icon-english-rectangle::before {
  content: '\E307';
}
.t-icon-enter::before {
  content: '\E308';
}
.t-icon-equal::before {
  content: '\E309';
}
.t-icon-error-circle-filled::before {
  content: '\E30A';
}
.t-icon-error-circle::before {
  content: '\E30B';
}
.t-icon-error-triangle-filled::before {
  content: '\E30C';
}
.t-icon-error-triangle::before {
  content: '\E30D';
}
.t-icon-error::before {
  content: '\E30E';
}
.t-icon-excited-1-filled::before {
  content: '\E30F';
}
.t-icon-excited-1::before {
  content: '\E310';
}
.t-icon-excited-filled::before {
  content: '\E311';
}
.t-icon-excited::before {
  content: '\E312';
}
.t-icon-expand-down-filled::before {
  content: '\E313';
}
.t-icon-expand-down::before {
  content: '\E314';
}
.t-icon-expand-horizontal::before {
  content: '\E315';
}
.t-icon-expand-up-filled::before {
  content: '\E316';
}
.t-icon-expand-up::before {
  content: '\E317';
}
.t-icon-expand-vertical::before {
  content: '\E318';
}
.t-icon-explore-filled::before {
  content: '\E319';
}
.t-icon-explore-off-filled::before {
  content: '\E31A';
}
.t-icon-explore-off::before {
  content: '\E31B';
}
.t-icon-explore::before {
  content: '\E31C';
}
.t-icon-export::before {
  content: '\E31D';
}
.t-icon-exposure-filled::before {
  content: '\E31E';
}
.t-icon-exposure::before {
  content: '\E31F';
}
.t-icon-extension-filled::before {
  content: '\E320';
}
.t-icon-extension-off-filled::before {
  content: '\E321';
}
.t-icon-extension-off::before {
  content: '\E322';
}
.t-icon-extension::before {
  content: '\E323';
}
.t-icon-face-retouching-filled::before {
  content: '\E324';
}
.t-icon-face-retouching::before {
  content: '\E325';
}
.t-icon-fact-check-filled::before {
  content: '\E326';
}
.t-icon-fact-check::before {
  content: '\E327';
}
.t-icon-fahrenheit-scale::before {
  content: '\E328';
}
.t-icon-feel-at-ease-filled::before {
  content: '\E329';
}
.t-icon-feel-at-ease::before {
  content: '\E32A';
}
.t-icon-ferocious-filled::before {
  content: '\E32B';
}
.t-icon-ferocious::before {
  content: '\E32C';
}
.t-icon-ferris-wheel-filled::before {
  content: '\E32D';
}
.t-icon-ferris-wheel::before {
  content: '\E32E';
}
.t-icon-file-1-filled::before {
  content: '\E32F';
}
.t-icon-file-1::before {
  content: '\E330';
}
.t-icon-file-add-1-filled::before {
  content: '\E331';
}
.t-icon-file-add-1::before {
  content: '\E332';
}
.t-icon-file-add-filled::before {
  content: '\E333';
}
.t-icon-file-add::before {
  content: '\E334';
}
.t-icon-file-attachment-filled::before {
  content: '\E335';
}
.t-icon-file-attachment::before {
  content: '\E336';
}
.t-icon-file-blocked-filled::before {
  content: '\E337';
}
.t-icon-file-blocked::before {
  content: '\E338';
}
.t-icon-file-code-1-filled::before {
  content: '\E339';
}
.t-icon-file-code-1::before {
  content: '\E33A';
}
.t-icon-file-code-filled::before {
  content: '\E33B';
}
.t-icon-file-code::before {
  content: '\E33C';
}
.t-icon-file-copy-filled::before {
  content: '\E33D';
}
.t-icon-file-copy::before {
  content: '\E33E';
}
.t-icon-file-csv-filled::before {
  content: '\E33F';
}
.t-icon-file-csv::before {
  content: '\E340';
}
.t-icon-file-download-filled::before {
  content: '\E341';
}
.t-icon-file-download::before {
  content: '\E342';
}
.t-icon-file-edit-filled::before {
  content: '\E343';
}
.t-icon-file-edit::before {
  content: '\E344';
}
.t-icon-file-excel-filled::before {
  content: '\E345';
}
.t-icon-file-excel::before {
  content: '\E346';
}
.t-icon-file-export-filled::before {
  content: '\E347';
}
.t-icon-file-export::before {
  content: '\E348';
}
.t-icon-file-filled::before {
  content: '\E349';
}
.t-icon-file-icon-filled::before {
  content: '\E34A';
}
.t-icon-file-icon::before {
  content: '\E34B';
}
.t-icon-file-image-filled::before {
  content: '\E34C';
}
.t-icon-file-image::before {
  content: '\E34D';
}
.t-icon-file-import-filled::before {
  content: '\E34E';
}
.t-icon-file-import::before {
  content: '\E34F';
}
.t-icon-file-json-filled::before {
  content: '\E350';
}
.t-icon-file-json::before {
  content: '\E351';
}
.t-icon-file-locked-filled::before {
  content: '\E352';
}
.t-icon-file-locked::before {
  content: '\E353';
}
.t-icon-file-markdown-filled::before {
  content: '\E354';
}
.t-icon-file-markdown::before {
  content: '\E355';
}
.t-icon-file-minus-filled::before {
  content: '\E356';
}
.t-icon-file-minus::before {
  content: '\E357';
}
.t-icon-file-music-filled::before {
  content: '\E358';
}
.t-icon-file-music::before {
  content: '\E359';
}
.t-icon-file-onenote-filled::before {
  content: '\E35A';
}
.t-icon-file-onenote::before {
  content: '\E35B';
}
.t-icon-file-outlook-filled::before {
  content: '\E35C';
}
.t-icon-file-outlook::before {
  content: '\E35D';
}
.t-icon-file-paste-filled::before {
  content: '\E35E';
}
.t-icon-file-paste::before {
  content: '\E35F';
}
.t-icon-file-pdf-filled::before {
  content: '\E360';
}
.t-icon-file-pdf::before {
  content: '\E361';
}
.t-icon-file-powerpoint-filled::before {
  content: '\E362';
}
.t-icon-file-powerpoint::before {
  content: '\E363';
}
.t-icon-file-restore-filled::before {
  content: '\E364';
}
.t-icon-file-restore::before {
  content: '\E365';
}
.t-icon-file-safety-filled::before {
  content: '\E366';
}
.t-icon-file-safety::before {
  content: '\E367';
}
.t-icon-file-search-filled::before {
  content: '\E368';
}
.t-icon-file-search::before {
  content: '\E369';
}
.t-icon-file-setting-filled::before {
  content: '\E36A';
}
.t-icon-file-setting::before {
  content: '\E36B';
}
.t-icon-file-teams-filled::before {
  content: '\E36C';
}
.t-icon-file-teams::before {
  content: '\E36D';
}
.t-icon-file-transmit-double-filled::before {
  content: '\E36E';
}
.t-icon-file-transmit-double::before {
  content: '\E36F';
}
.t-icon-file-transmit-filled::before {
  content: '\E370';
}
.t-icon-file-transmit::before {
  content: '\E371';
}
.t-icon-file-txt-filled::before {
  content: '\E372';
}
.t-icon-file-txt::before {
  content: '\E373';
}
.t-icon-file-unknown-filled::before {
  content: '\E374';
}
.t-icon-file-unknown::before {
  content: '\E375';
}
.t-icon-file-unlocked-filled::before {
  content: '\E376';
}
.t-icon-file-unlocked::before {
  content: '\E377';
}
.t-icon-file-word-filled::before {
  content: '\E378';
}
.t-icon-file-word::before {
  content: '\E379';
}
.t-icon-file-yaml-filled::before {
  content: '\E37A';
}
.t-icon-file-yaml::before {
  content: '\E37B';
}
.t-icon-file-zip-filled::before {
  content: '\E37C';
}
.t-icon-file-zip::before {
  content: '\E37D';
}
.t-icon-file::before {
  content: '\E37E';
}
.t-icon-fill-color-1-filled::before {
  content: '\E37F';
}
.t-icon-fill-color-1::before {
  content: '\E380';
}
.t-icon-fill-color-filled::before {
  content: '\E381';
}
.t-icon-fill-color::before {
  content: '\E382';
}
.t-icon-film-1-filled::before {
  content: '\E383';
}
.t-icon-film-1::before {
  content: '\E384';
}
.t-icon-film-filled::before {
  content: '\E385';
}
.t-icon-film::before {
  content: '\E386';
}
.t-icon-filter-1-filled::before {
  content: '\E387';
}
.t-icon-filter-1::before {
  content: '\E388';
}
.t-icon-filter-2-filled::before {
  content: '\E389';
}
.t-icon-filter-2::before {
  content: '\E38A';
}
.t-icon-filter-3-filled::before {
  content: '\E38B';
}
.t-icon-filter-3::before {
  content: '\E38C';
}
.t-icon-filter-clear-filled::before {
  content: '\E38D';
}
.t-icon-filter-clear::before {
  content: '\E38E';
}
.t-icon-filter-filled::before {
  content: '\E38F';
}
.t-icon-filter-off-filled::before {
  content: '\E390';
}
.t-icon-filter-off::before {
  content: '\E391';
}
.t-icon-filter-sort-filled::before {
  content: '\E392';
}
.t-icon-filter-sort::before {
  content: '\E393';
}
.t-icon-filter::before {
  content: '\E394';
}
.t-icon-fingerprint-1::before {
  content: '\E395';
}
.t-icon-fingerprint-2::before {
  content: '\E396';
}
.t-icon-fingerprint-3::before {
  content: '\E397';
}
.t-icon-fingerprint::before {
  content: '\E398';
}
.t-icon-fish-filled::before {
  content: '\E399';
}
.t-icon-fish::before {
  content: '\E39A';
}
.t-icon-flag-1-filled::before {
  content: '\E39B';
}
.t-icon-flag-1::before {
  content: '\E39C';
}
.t-icon-flag-2-filled::before {
  content: '\E39D';
}
.t-icon-flag-2::before {
  content: '\E39E';
}
.t-icon-flag-3-filled::before {
  content: '\E39F';
}
.t-icon-flag-3::before {
  content: '\E3A0';
}
.t-icon-flag-4-filled::before {
  content: '\E3A1';
}
.t-icon-flag-4::before {
  content: '\E3A2';
}
.t-icon-flag-filled::before {
  content: '\E3A3';
}
.t-icon-flag::before {
  content: '\E3A4';
}
.t-icon-flashlight-filled::before {
  content: '\E3A5';
}
.t-icon-flashlight::before {
  content: '\E3A6';
}
.t-icon-flight-landing-filled::before {
  content: '\E3A7';
}
.t-icon-flight-landing::before {
  content: '\E3A8';
}
.t-icon-flight-takeoff-filled::before {
  content: '\E3A9';
}
.t-icon-flight-takeoff::before {
  content: '\E3AA';
}
.t-icon-flip-smiling-face-filled::before {
  content: '\E3AB';
}
.t-icon-flip-smiling-face::before {
  content: '\E3AC';
}
.t-icon-flip-to-back-filled::before {
  content: '\E3AD';
}
.t-icon-flip-to-back::before {
  content: '\E3AE';
}
.t-icon-flip-to-front-filled::before {
  content: '\E3AF';
}
.t-icon-flip-to-front::before {
  content: '\E3B0';
}
.t-icon-flowchart-filled::before {
  content: '\E3B1';
}
.t-icon-flowchart::before {
  content: '\E3B2';
}
.t-icon-focus-filled::before {
  content: '\E3B3';
}
.t-icon-focus::before {
  content: '\E3B4';
}
.t-icon-fog-filled::before {
  content: '\E3B5';
}
.t-icon-fog-night-filled::before {
  content: '\E3B6';
}
.t-icon-fog-night::before {
  content: '\E3B7';
}
.t-icon-fog-sunny-filled::before {
  content: '\E3B8';
}
.t-icon-fog-sunny::before {
  content: '\E3B9';
}
.t-icon-fog::before {
  content: '\E3BA';
}
.t-icon-folder-1-filled::before {
  content: '\E3BB';
}
.t-icon-folder-1::before {
  content: '\E3BC';
}
.t-icon-folder-add-1-filled::before {
  content: '\E3BD';
}
.t-icon-folder-add-1::before {
  content: '\E3BE';
}
.t-icon-folder-add-filled::before {
  content: '\E3BF';
}
.t-icon-folder-add::before {
  content: '\E3C0';
}
.t-icon-folder-blocked-filled::before {
  content: '\E3C1';
}
.t-icon-folder-blocked::before {
  content: '\E3C2';
}
.t-icon-folder-details-filled::before {
  content: '\E3C3';
}
.t-icon-folder-details::before {
  content: '\E3C4';
}
.t-icon-folder-export-filled::before {
  content: '\E3C5';
}
.t-icon-folder-export::before {
  content: '\E3C6';
}
.t-icon-folder-filled::before {
  content: '\E3C7';
}
.t-icon-folder-import-filled::before {
  content: '\E3C8';
}
.t-icon-folder-import::before {
  content: '\E3C9';
}
.t-icon-folder-locked-filled::before {
  content: '\E3CA';
}
.t-icon-folder-locked::before {
  content: '\E3CB';
}
.t-icon-folder-minus-filled::before {
  content: '\E3CC';
}
.t-icon-folder-minus::before {
  content: '\E3CD';
}
.t-icon-folder-move-filled::before {
  content: '\E3CE';
}
.t-icon-folder-move::before {
  content: '\E3CF';
}
.t-icon-folder-off-filled::before {
  content: '\E3D0';
}
.t-icon-folder-off::before {
  content: '\E3D1';
}
.t-icon-folder-open-1-filled::before {
  content: '\E3D2';
}
.t-icon-folder-open-1::before {
  content: '\E3D3';
}
.t-icon-folder-open-filled::before {
  content: '\E3D4';
}
.t-icon-folder-open::before {
  content: '\E3D5';
}
.t-icon-folder-search-filled::before {
  content: '\E3D6';
}
.t-icon-folder-search::before {
  content: '\E3D7';
}
.t-icon-folder-setting-filled::before {
  content: '\E3D8';
}
.t-icon-folder-setting::before {
  content: '\E3D9';
}
.t-icon-folder-shared-filled::before {
  content: '\E3DA';
}
.t-icon-folder-shared::before {
  content: '\E3DB';
}
.t-icon-folder-unlocked-filled::before {
  content: '\E3DC';
}
.t-icon-folder-unlocked::before {
  content: '\E3DD';
}
.t-icon-folder-zip-filled::before {
  content: '\E3DE';
}
.t-icon-folder-zip::before {
  content: '\E3DF';
}
.t-icon-folder::before {
  content: '\E3E0';
}
.t-icon-font-background-filled::before {
  content: '\E3E1';
}
.t-icon-font-background::before {
  content: '\E3E2';
}
.t-icon-forest-filled::before {
  content: '\E3E3';
}
.t-icon-forest::before {
  content: '\E3E4';
}
.t-icon-fork-filled::before {
  content: '\E3E5';
}
.t-icon-fork::before {
  content: '\E3E6';
}
.t-icon-form-filled::before {
  content: '\E3E7';
}
.t-icon-form::before {
  content: '\E3E8';
}
.t-icon-format-horizontal-align-bottom::before {
  content: '\E3E9';
}
.t-icon-format-horizontal-align-center::before {
  content: '\E3EA';
}
.t-icon-format-horizontal-align-top::before {
  content: '\E3EB';
}
.t-icon-format-painter-filled::before {
  content: '\E3EC';
}
.t-icon-format-painter::before {
  content: '\E3ED';
}
.t-icon-format-vertical-align-center::before {
  content: '\E3EE';
}
.t-icon-format-vertical-align-left::before {
  content: '\E3EF';
}
.t-icon-format-vertical-align-right::before {
  content: '\E3F0';
}
.t-icon-formula::before {
  content: '\E3F1';
}
.t-icon-forum-filled::before {
  content: '\E3F2';
}
.t-icon-forum::before {
  content: '\E3F3';
}
.t-icon-forward-filled::before {
  content: '\E3F4';
}
.t-icon-forward::before {
  content: '\E3F5';
}
.t-icon-frame-1-filled::before {
  content: '\E3F6';
}
.t-icon-frame-1::before {
  content: '\E3F7';
}
.t-icon-frame-filled::before {
  content: '\E3F8';
}
.t-icon-frame::before {
  content: '\E3F9';
}
.t-icon-fries-filled::before {
  content: '\E3FA';
}
.t-icon-fries::before {
  content: '\E3FB';
}
.t-icon-fullscreen-1::before {
  content: '\E3FC';
}
.t-icon-fullscreen-2::before {
  content: '\E3FD';
}
.t-icon-fullscreen-exit-1::before {
  content: '\E3FE';
}
.t-icon-fullscreen-exit::before {
  content: '\E3FF';
}
.t-icon-fullscreen::before {
  content: '\E400';
}
.t-icon-function-curve::before {
  content: '\E401';
}
.t-icon-functions-1::before {
  content: '\E402';
}
.t-icon-functions::before {
  content: '\E403';
}
.t-icon-gamepad-1-filled::before {
  content: '\E404';
}
.t-icon-gamepad-1::before {
  content: '\E405';
}
.t-icon-gamepad-filled::before {
  content: '\E406';
}
.t-icon-gamepad::before {
  content: '\E407';
}
.t-icon-gamma::before {
  content: '\E408';
}
.t-icon-garlic-filled::before {
  content: '\E409';
}
.t-icon-garlic::before {
  content: '\E40A';
}
.t-icon-gender-female::before {
  content: '\E40B';
}
.t-icon-gender-male::before {
  content: '\E40C';
}
.t-icon-gesture-applause-filled::before {
  content: '\E40D';
}
.t-icon-gesture-applause::before {
  content: '\E40E';
}
.t-icon-gesture-click-filled::before {
  content: '\E40F';
}
.t-icon-gesture-click::before {
  content: '\E410';
}
.t-icon-gesture-down-filled::before {
  content: '\E411';
}
.t-icon-gesture-down::before {
  content: '\E412';
}
.t-icon-gesture-expansion-filled::before {
  content: '\E413';
}
.t-icon-gesture-expansion::before {
  content: '\E414';
}
.t-icon-gesture-left-filled::before {
  content: '\E415';
}
.t-icon-gesture-left-slip-filled::before {
  content: '\E416';
}
.t-icon-gesture-left-slip::before {
  content: '\E417';
}
.t-icon-gesture-left::before {
  content: '\E418';
}
.t-icon-gesture-open-filled::before {
  content: '\E419';
}
.t-icon-gesture-open::before {
  content: '\E41A';
}
.t-icon-gesture-pray-filled::before {
  content: '\E41B';
}
.t-icon-gesture-pray::before {
  content: '\E41C';
}
.t-icon-gesture-press-filled::before {
  content: '\E41D';
}
.t-icon-gesture-press::before {
  content: '\E41E';
}
.t-icon-gesture-ranslation-filled::before {
  content: '\E41F';
}
.t-icon-gesture-ranslation::before {
  content: '\E420';
}
.t-icon-gesture-right-filled::before {
  content: '\E421';
}
.t-icon-gesture-right-slip-filled::before {
  content: '\E422';
}
.t-icon-gesture-right-slip::before {
  content: '\E423';
}
.t-icon-gesture-right::before {
  content: '\E424';
}
.t-icon-gesture-slide-left-and-right-filled::before {
  content: '\E425';
}
.t-icon-gesture-slide-left-and-right::before {
  content: '\E426';
}
.t-icon-gesture-slide-up-filled::before {
  content: '\E427';
}
.t-icon-gesture-slide-up::before {
  content: '\E428';
}
.t-icon-gesture-typing-filled::before {
  content: '\E429';
}
.t-icon-gesture-typing::before {
  content: '\E42A';
}
.t-icon-gesture-up-and-down-filled::before {
  content: '\E42B';
}
.t-icon-gesture-up-and-down::before {
  content: '\E42C';
}
.t-icon-gesture-up-filled::before {
  content: '\E42D';
}
.t-icon-gesture-up::before {
  content: '\E42E';
}
.t-icon-gesture-wipe-down-filled::before {
  content: '\E42F';
}
.t-icon-gesture-wipe-down::before {
  content: '\E430';
}
.t-icon-gift-filled::before {
  content: '\E431';
}
.t-icon-gift::before {
  content: '\E432';
}
.t-icon-giggle-filled::before {
  content: '\E433';
}
.t-icon-giggle::before {
  content: '\E434';
}
.t-icon-git-branch-filled::before {
  content: '\E435';
}
.t-icon-git-branch::before {
  content: '\E436';
}
.t-icon-git-commit-1-filled::before {
  content: '\E437';
}
.t-icon-git-commit-1::before {
  content: '\E438';
}
.t-icon-git-commit-filled::before {
  content: '\E439';
}
.t-icon-git-commit::before {
  content: '\E43A';
}
.t-icon-git-merge-filled::before {
  content: '\E43B';
}
.t-icon-git-merge::before {
  content: '\E43C';
}
.t-icon-git-pull-request-filled::before {
  content: '\E43D';
}
.t-icon-git-pull-request::before {
  content: '\E43E';
}
.t-icon-git-repository-commits-filled::before {
  content: '\E43F';
}
.t-icon-git-repository-commits::before {
  content: '\E440';
}
.t-icon-git-repository-filled::before {
  content: '\E441';
}
.t-icon-git-repository-private-filled::before {
  content: '\E442';
}
.t-icon-git-repository-private::before {
  content: '\E443';
}
.t-icon-git-repository::before {
  content: '\E444';
}
.t-icon-gps-filled::before {
  content: '\E445';
}
.t-icon-gps::before {
  content: '\E446';
}
.t-icon-grape-filled::before {
  content: '\E447';
}
.t-icon-grape::before {
  content: '\E448';
}
.t-icon-graphviz-filled::before {
  content: '\E449';
}
.t-icon-graphviz::before {
  content: '\E44A';
}
.t-icon-greater-than-or-equal::before {
  content: '\E44B';
}
.t-icon-greater-than::before {
  content: '\E44C';
}
.t-icon-green-onion::before {
  content: '\E44D';
}
.t-icon-grid-add-filled::before {
  content: '\E44E';
}
.t-icon-grid-add::before {
  content: '\E44F';
}
.t-icon-grid-view-filled::before {
  content: '\E450';
}
.t-icon-grid-view::before {
  content: '\E451';
}
.t-icon-guitar-filled::before {
  content: '\E452';
}
.t-icon-guitar::before {
  content: '\E453';
}
.t-icon-hamburger-filled::before {
  content: '\E454';
}
.t-icon-hamburger::before {
  content: '\E455';
}
.t-icon-happy-filled::before {
  content: '\E456';
}
.t-icon-happy::before {
  content: '\E457';
}
.t-icon-hard-disk-storage-filled::before {
  content: '\E458';
}
.t-icon-hard-disk-storage::before {
  content: '\E459';
}
.t-icon-hard-drive-filled::before {
  content: '\E45A';
}
.t-icon-hard-drive::before {
  content: '\E45B';
}
.t-icon-hashtag::before {
  content: '\E45C';
}
.t-icon-hd-filled::before {
  content: '\E45D';
}
.t-icon-hd::before {
  content: '\E45E';
}
.t-icon-heart-filled::before {
  content: '\E45F';
}
.t-icon-heart::before {
  content: '\E460';
}
.t-icon-help-circle-filled::before {
  content: '\E461';
}
.t-icon-help-circle::before {
  content: '\E462';
}
.t-icon-help-rectangle-filled::before {
  content: '\E463';
}
.t-icon-help-rectangle::before {
  content: '\E464';
}
.t-icon-help::before {
  content: '\E465';
}
.t-icon-high-level-filled::before {
  content: '\E466';
}
.t-icon-high-level::before {
  content: '\E467';
}
.t-icon-highlight-1-filled::before {
  content: '\E468';
}
.t-icon-highlight-1::before {
  content: '\E469';
}
.t-icon-highlight::before {
  content: '\E46A';
}
.t-icon-highlighted-block-filled::before {
  content: '\E46B';
}
.t-icon-highlighted-block::before {
  content: '\E46C';
}
.t-icon-history-setting::before {
  content: '\E46D';
}
.t-icon-history::before {
  content: '\E46E';
}
.t-icon-home-filled::before {
  content: '\E46F';
}
.t-icon-home::before {
  content: '\E470';
}
.t-icon-horizontal-filled::before {
  content: '\E471';
}
.t-icon-horizontal::before {
  content: '\E472';
}
.t-icon-hospital-1-filled::before {
  content: '\E473';
}
.t-icon-hospital-1::before {
  content: '\E474';
}
.t-icon-hospital-filled::before {
  content: '\E475';
}
.t-icon-hospital::before {
  content: '\E476';
}
.t-icon-hotspot-wave-filled::before {
  content: '\E477';
}
.t-icon-hotspot-wave::before {
  content: '\E478';
}
.t-icon-hourglass-filled::before {
  content: '\E479';
}
.t-icon-hourglass::before {
  content: '\E47A';
}
.t-icon-houses-1-filled::before {
  content: '\E47B';
}
.t-icon-houses-1::before {
  content: '\E47C';
}
.t-icon-houses-2-filled::before {
  content: '\E47D';
}
.t-icon-houses-2::before {
  content: '\E47E';
}
.t-icon-houses-filled::before {
  content: '\E47F';
}
.t-icon-houses::before {
  content: '\E480';
}
.t-icon-html5-filled::before {
  content: '\E481';
}
.t-icon-html5::before {
  content: '\E482';
}
.t-icon-https-filled::before {
  content: '\E483';
}
.t-icon-https::before {
  content: '\E484';
}
.t-icon-ice-cream-filled::before {
  content: '\E485';
}
.t-icon-ice-cream::before {
  content: '\E486';
}
.t-icon-icon-filled::before {
  content: '\E487';
}
.t-icon-icon::before {
  content: '\E488';
}
.t-icon-image-1-filled::before {
  content: '\E489';
}
.t-icon-image-1::before {
  content: '\E48A';
}
.t-icon-image-add-filled::before {
  content: '\E48B';
}
.t-icon-image-add::before {
  content: '\E48C';
}
.t-icon-image-carousel-filled::before {
  content: '\E48D';
}
.t-icon-image-carousel::before {
  content: '\E48E';
}
.t-icon-image-edit-filled::before {
  content: '\E48F';
}
.t-icon-image-edit::before {
  content: '\E490';
}
.t-icon-image-error-filled::before {
  content: '\E491';
}
.t-icon-image-error::before {
  content: '\E492';
}
.t-icon-image-filled::before {
  content: '\E493';
}
.t-icon-image-off-filled::before {
  content: '\E494';
}
.t-icon-image-off::before {
  content: '\E495';
}
.t-icon-image-search-filled::before {
  content: '\E496';
}
.t-icon-image-search::before {
  content: '\E497';
}
.t-icon-image::before {
  content: '\E498';
}
.t-icon-import::before {
  content: '\E499';
}
.t-icon-indent-left::before {
  content: '\E49A';
}
.t-icon-indent-right::before {
  content: '\E49B';
}
.t-icon-indicator-filled::before {
  content: '\E49C';
}
.t-icon-indicator::before {
  content: '\E49D';
}
.t-icon-info-circle-filled::before {
  content: '\E49E';
}
.t-icon-info-circle::before {
  content: '\E49F';
}
.t-icon-ink-filled::before {
  content: '\E4A0';
}
.t-icon-ink::before {
  content: '\E4A1';
}
.t-icon-install-desktop-filled::before {
  content: '\E4A2';
}
.t-icon-install-desktop::before {
  content: '\E4A3';
}
.t-icon-install-filled::before {
  content: '\E4A4';
}
.t-icon-install-mobile-filled::before {
  content: '\E4A5';
}
.t-icon-install-mobile::before {
  content: '\E4A6';
}
.t-icon-install::before {
  content: '\E4A7';
}
.t-icon-institution-checked-filled::before {
  content: '\E4A8';
}
.t-icon-institution-checked::before {
  content: '\E4A9';
}
.t-icon-institution-filled::before {
  content: '\E4AA';
}
.t-icon-institution::before {
  content: '\E4AB';
}
.t-icon-internet-filled::before {
  content: '\E4AC';
}
.t-icon-internet::before {
  content: '\E4AD';
}
.t-icon-ipod-filled::before {
  content: '\E4AE';
}
.t-icon-ipod::before {
  content: '\E4AF';
}
.t-icon-japanese-rectangle-filled::before {
  content: '\E4B0';
}
.t-icon-japanese-rectangle::before {
  content: '\E4B1';
}
.t-icon-joyful-filled::before {
  content: '\E4B2';
}
.t-icon-joyful::before {
  content: '\E4B3';
}
.t-icon-jump-double::before {
  content: '\E4B4';
}
.t-icon-jump-off::before {
  content: '\E4B5';
}
.t-icon-jump::before {
  content: '\E4B6';
}
.t-icon-key-filled::before {
  content: '\E4B7';
}
.t-icon-key::before {
  content: '\E4B8';
}
.t-icon-keyboard-1::before {
  content: '\E4B9';
}
.t-icon-keyboard-filled::before {
  content: '\E4BA';
}
.t-icon-keyboard::before {
  content: '\E4BB';
}
.t-icon-korean-rectangle-filled::before {
  content: '\E4BC';
}
.t-icon-korean-rectangle::before {
  content: '\E4BD';
}
.t-icon-laptop-filled::before {
  content: '\E4BE';
}
.t-icon-laptop::before {
  content: '\E4BF';
}
.t-icon-layers-filled::before {
  content: '\E4C0';
}
.t-icon-layers::before {
  content: '\E4C1';
}
.t-icon-layout-filled::before {
  content: '\E4C2';
}
.t-icon-layout::before {
  content: '\E4C3';
}
.t-icon-leaderboard-filled::before {
  content: '\E4C4';
}
.t-icon-leaderboard::before {
  content: '\E4C5';
}
.t-icon-lemon-filled::before {
  content: '\E4C6';
}
.t-icon-lemon-slice-filled::before {
  content: '\E4C7';
}
.t-icon-lemon-slice::before {
  content: '\E4C8';
}
.t-icon-lemon::before {
  content: '\E4C9';
}
.t-icon-less-than-or-equal::before {
  content: '\E4CA';
}
.t-icon-less-than::before {
  content: '\E4CB';
}
.t-icon-letters-a::before {
  content: '\E4CC';
}
.t-icon-letters-b::before {
  content: '\E4CD';
}
.t-icon-letters-c::before {
  content: '\E4CE';
}
.t-icon-letters-d::before {
  content: '\E4CF';
}
.t-icon-letters-e::before {
  content: '\E4D0';
}
.t-icon-letters-f::before {
  content: '\E4D1';
}
.t-icon-letters-g::before {
  content: '\E4D2';
}
.t-icon-letters-h::before {
  content: '\E4D3';
}
.t-icon-letters-i::before {
  content: '\E4D4';
}
.t-icon-letters-j::before {
  content: '\E4D5';
}
.t-icon-letters-k::before {
  content: '\E4D6';
}
.t-icon-letters-l::before {
  content: '\E4D7';
}
.t-icon-letters-m::before {
  content: '\E4D8';
}
.t-icon-letters-n::before {
  content: '\E4D9';
}
.t-icon-letters-o::before {
  content: '\E4DA';
}
.t-icon-letters-p::before {
  content: '\E4DB';
}
.t-icon-letters-q::before {
  content: '\E4DC';
}
.t-icon-letters-r::before {
  content: '\E4DD';
}
.t-icon-letters-s::before {
  content: '\E4DE';
}
.t-icon-letters-t::before {
  content: '\E4DF';
}
.t-icon-letters-u::before {
  content: '\E4E0';
}
.t-icon-letters-v::before {
  content: '\E4E1';
}
.t-icon-letters-w::before {
  content: '\E4E2';
}
.t-icon-letters-x::before {
  content: '\E4E3';
}
.t-icon-letters-y::before {
  content: '\E4E4';
}
.t-icon-letters-z::before {
  content: '\E4E5';
}
.t-icon-lightbulb-circle-filled::before {
  content: '\E4E6';
}
.t-icon-lightbulb-circle::before {
  content: '\E4E7';
}
.t-icon-lightbulb-filled::before {
  content: '\E4E8';
}
.t-icon-lightbulb::before {
  content: '\E4E9';
}
.t-icon-lighthouse-1-filled::before {
  content: '\E4EA';
}
.t-icon-lighthouse-1::before {
  content: '\E4EB';
}
.t-icon-lighthouse-2-filled::before {
  content: '\E4EC';
}
.t-icon-lighthouse-2::before {
  content: '\E4ED';
}
.t-icon-lighthouse-filled::before {
  content: '\E4EE';
}
.t-icon-lighthouse::before {
  content: '\E4EF';
}
.t-icon-lighting-circle-filled::before {
  content: '\E4F0';
}
.t-icon-lighting-circle::before {
  content: '\E4F1';
}
.t-icon-line-height::before {
  content: '\E4F2';
}
.t-icon-link-1::before {
  content: '\E4F3';
}
.t-icon-link-transform::before {
  content: '\E4F4';
}
.t-icon-link-unlink::before {
  content: '\E4F5';
}
.t-icon-link::before {
  content: '\E4F6';
}
.t-icon-liquor-filled::before {
  content: '\E4F7';
}
.t-icon-liquor::before {
  content: '\E4F8';
}
.t-icon-list-bug-filled::before {
  content: '\E4F9';
}
.t-icon-list-bug::before {
  content: '\E4FA';
}
.t-icon-list-demand::before {
  content: '\E4FB';
}
.t-icon-list-numbered::before {
  content: '\E4FC';
}
.t-icon-load::before {
  content: '\E4FD';
}
.t-icon-loading::before {
  content: '\E4FE';
}
.t-icon-location-1-filled::before {
  content: '\E4FF';
}
.t-icon-location-1::before {
  content: '\E500';
}
.t-icon-location-enlargement-filled::before {
  content: '\E501';
}
.t-icon-location-enlargement::before {
  content: '\E502';
}
.t-icon-location-error-filled::before {
  content: '\E503';
}
.t-icon-location-error::before {
  content: '\E504';
}
.t-icon-location-filled::before {
  content: '\E505';
}
.t-icon-location-parking-place-filled::before {
  content: '\E506';
}
.t-icon-location-parking-place::before {
  content: '\E507';
}
.t-icon-location-reduction-filled::before {
  content: '\E508';
}
.t-icon-location-reduction::before {
  content: '\E509';
}
.t-icon-location-setting-filled::before {
  content: '\E50A';
}
.t-icon-location-setting::before {
  content: '\E50B';
}
.t-icon-location::before {
  content: '\E50C';
}
.t-icon-lock-checked-filled::before {
  content: '\E50D';
}
.t-icon-lock-checked::before {
  content: '\E50E';
}
.t-icon-lock-off-filled::before {
  content: '\E50F';
}
.t-icon-lock-off::before {
  content: '\E510';
}
.t-icon-lock-on-filled::before {
  content: '\E511';
}
.t-icon-lock-on::before {
  content: '\E512';
}
.t-icon-lock-time-filled::before {
  content: '\E513';
}
.t-icon-lock-time::before {
  content: '\E514';
}
.t-icon-login::before {
  content: '\E515';
}
.t-icon-logo-adobe-illustrate-filled::before {
  content: '\E516';
}
.t-icon-logo-adobe-illustrate::before {
  content: '\E517';
}
.t-icon-logo-adobe-lightroom-filled::before {
  content: '\E518';
}
.t-icon-logo-adobe-lightroom::before {
  content: '\E519';
}
.t-icon-logo-adobe-photoshop-filled::before {
  content: '\E51A';
}
.t-icon-logo-adobe-photoshop::before {
  content: '\E51B';
}
.t-icon-logo-alipay-filled::before {
  content: '\E51C';
}
.t-icon-logo-alipay::before {
  content: '\E51D';
}
.t-icon-logo-android-filled::before {
  content: '\E51E';
}
.t-icon-logo-android::before {
  content: '\E51F';
}
.t-icon-logo-apple-filled::before {
  content: '\E520';
}
.t-icon-logo-apple::before {
  content: '\E521';
}
.t-icon-logo-behance-filled::before {
  content: '\E522';
}
.t-icon-logo-behance::before {
  content: '\E523';
}
.t-icon-logo-chrome-filled::before {
  content: '\E524';
}
.t-icon-logo-chrome::before {
  content: '\E525';
}
.t-icon-logo-cinema4d-filled::before {
  content: '\E526';
}
.t-icon-logo-cinema4d::before {
  content: '\E527';
}
.t-icon-logo-cnb-filled::before {
  content: '\E528';
}
.t-icon-logo-cnb::before {
  content: '\E529';
}
.t-icon-logo-codepen::before {
  content: '\E52A';
}
.t-icon-logo-codesandbox::before {
  content: '\E52B';
}
.t-icon-logo-codesign::before {
  content: '\E52C';
}
.t-icon-logo-dribbble-filled::before {
  content: '\E52D';
}
.t-icon-logo-dribbble::before {
  content: '\E52E';
}
.t-icon-logo-facebook-filled::before {
  content: '\E52F';
}
.t-icon-logo-facebook::before {
  content: '\E530';
}
.t-icon-logo-figma-filled::before {
  content: '\E531';
}
.t-icon-logo-figma::before {
  content: '\E532';
}
.t-icon-logo-framer-filled::before {
  content: '\E533';
}
.t-icon-logo-framer::before {
  content: '\E534';
}
.t-icon-logo-github-filled::before {
  content: '\E535';
}
.t-icon-logo-github::before {
  content: '\E536';
}
.t-icon-logo-gitlab-filled::before {
  content: '\E537';
}
.t-icon-logo-gitlab::before {
  content: '\E538';
}
.t-icon-logo-hiflow-filled::before {
  content: '\E539';
}
.t-icon-logo-hiflow::before {
  content: '\E53A';
}
.t-icon-logo-ie-filled::before {
  content: '\E53B';
}
.t-icon-logo-ie::before {
  content: '\E53C';
}
.t-icon-logo-instagram-filled::before {
  content: '\E53D';
}
.t-icon-logo-instagram::before {
  content: '\E53E';
}
.t-icon-logo-iwiki-filled::before {
  content: '\E53F';
}
.t-icon-logo-iwiki::before {
  content: '\E540';
}
.t-icon-logo-markdown-filled::before {
  content: '\E541';
}
.t-icon-logo-markdown::before {
  content: '\E542';
}
.t-icon-logo-miniprogram-filled::before {
  content: '\E543';
}
.t-icon-logo-miniprogram::before {
  content: '\E544';
}
.t-icon-logo-qq-filled::before {
  content: '\E545';
}
.t-icon-logo-qq::before {
  content: '\E546';
}
.t-icon-logo-stackblitz-filled::before {
  content: '\E547';
}
.t-icon-logo-stackblitz::before {
  content: '\E548';
}
.t-icon-logo-tapd-filled::before {
  content: '\E549';
}
.t-icon-logo-tapd::before {
  content: '\E54A';
}
.t-icon-logo-tbeacon-filled::before {
  content: '\E54B';
}
.t-icon-logo-tbeacon::before {
  content: '\E54C';
}
.t-icon-logo-tdesign-filled::before {
  content: '\E54D';
}
.t-icon-logo-tdesign::before {
  content: '\E54E';
}
.t-icon-logo-tencentcode::before {
  content: '\E54F';
}
.t-icon-logo-tencentmeeting-filled::before {
  content: '\E550';
}
.t-icon-logo-tencentmeeting::before {
  content: '\E551';
}
.t-icon-logo-twitter-filled::before {
  content: '\E552';
}
.t-icon-logo-twitter::before {
  content: '\E553';
}
.t-icon-logo-wechat-stroke-filled::before {
  content: '\E554';
}
.t-icon-logo-wechat-stroke::before {
  content: '\E555';
}
.t-icon-logo-wechat-workdocs-filled::before {
  content: '\E556';
}
.t-icon-logo-wechat-workdocs::before {
  content: '\E557';
}
.t-icon-logo-wechatpay-filled::before {
  content: '\E558';
}
.t-icon-logo-wechatpay::before {
  content: '\E559';
}
.t-icon-logo-wecom-filled::before {
  content: '\E55A';
}
.t-icon-logo-wecom::before {
  content: '\E55B';
}
.t-icon-logo-windows-filled::before {
  content: '\E55C';
}
.t-icon-logo-windows::before {
  content: '\E55D';
}
.t-icon-logo-xiaomareport-filled::before {
  content: '\E55E';
}
.t-icon-logo-xiaomareport::before {
  content: '\E55F';
}
.t-icon-logo-youtube-filled::before {
  content: '\E560';
}
.t-icon-logo-youtube::before {
  content: '\E561';
}
.t-icon-logout::before {
  content: '\E562';
}
.t-icon-look-around-filled::before {
  content: '\E563';
}
.t-icon-look-around::before {
  content: '\E564';
}
.t-icon-loudspeaker-filled::before {
  content: '\E565';
}
.t-icon-loudspeaker::before {
  content: '\E566';
}
.t-icon-mail-filled::before {
  content: '\E567';
}
.t-icon-mail::before {
  content: '\E568';
}
.t-icon-map-3d-filled::before {
  content: '\E569';
}
.t-icon-map-3d::before {
  content: '\E56A';
}
.t-icon-map-add-filled::before {
  content: '\E56B';
}
.t-icon-map-add::before {
  content: '\E56C';
}
.t-icon-map-aiming-filled::before {
  content: '\E56D';
}
.t-icon-map-aiming::before {
  content: '\E56E';
}
.t-icon-map-blocked-filled::before {
  content: '\E56F';
}
.t-icon-map-blocked::before {
  content: '\E570';
}
.t-icon-map-bubble-filled::before {
  content: '\E571';
}
.t-icon-map-bubble::before {
  content: '\E572';
}
.t-icon-map-cancel-filled::before {
  content: '\E573';
}
.t-icon-map-cancel::before {
  content: '\E574';
}
.t-icon-map-chat-filled::before {
  content: '\E575';
}
.t-icon-map-chat::before {
  content: '\E576';
}
.t-icon-map-checked-filled::before {
  content: '\E577';
}
.t-icon-map-checked::before {
  content: '\E578';
}
.t-icon-map-collection-filled::before {
  content: '\E579';
}
.t-icon-map-collection::before {
  content: '\E57A';
}
.t-icon-map-connection-filled::before {
  content: '\E57B';
}
.t-icon-map-connection::before {
  content: '\E57C';
}
.t-icon-map-distance-filled::before {
  content: '\E57D';
}
.t-icon-map-distance::before {
  content: '\E57E';
}
.t-icon-map-double-filled::before {
  content: '\E57F';
}
.t-icon-map-double::before {
  content: '\E580';
}
.t-icon-map-edit-filled::before {
  content: '\E581';
}
.t-icon-map-edit::before {
  content: '\E582';
}
.t-icon-map-filled::before {
  content: '\E583';
}
.t-icon-map-grid-filled::before {
  content: '\E584';
}
.t-icon-map-grid::before {
  content: '\E585';
}
.t-icon-map-information-1-filled::before {
  content: '\E586';
}
.t-icon-map-information-1::before {
  content: '\E587';
}
.t-icon-map-information-2-filled::before {
  content: '\E588';
}
.t-icon-map-information-2::before {
  content: '\E589';
}
.t-icon-map-information-filled::before {
  content: '\E58A';
}
.t-icon-map-information::before {
  content: '\E58B';
}
.t-icon-map-location-filled::before {
  content: '\E58C';
}
.t-icon-map-location::before {
  content: '\E58D';
}
.t-icon-map-locked-filled::before {
  content: '\E58E';
}
.t-icon-map-locked::before {
  content: '\E58F';
}
.t-icon-map-marked-filled::before {
  content: '\E590';
}
.t-icon-map-marked::before {
  content: '\E591';
}
.t-icon-map-navigation-filled::before {
  content: '\E592';
}
.t-icon-map-navigation::before {
  content: '\E593';
}
.t-icon-map-outline-filled::before {
  content: '\E594';
}
.t-icon-map-outline::before {
  content: '\E595';
}
.t-icon-map-route-planning-filled::before {
  content: '\E596';
}
.t-icon-map-route-planning::before {
  content: '\E597';
}
.t-icon-map-ruler-filled::before {
  content: '\E598';
}
.t-icon-map-ruler::before {
  content: '\E599';
}
.t-icon-map-safety-filled::before {
  content: '\E59A';
}
.t-icon-map-safety::before {
  content: '\E59B';
}
.t-icon-map-search-1-filled::before {
  content: '\E59C';
}
.t-icon-map-search-1::before {
  content: '\E59D';
}
.t-icon-map-search-filled::before {
  content: '\E59E';
}
.t-icon-map-search::before {
  content: '\E59F';
}
.t-icon-map-setting-filled::before {
  content: '\E5A0';
}
.t-icon-map-setting::before {
  content: '\E5A1';
}
.t-icon-map-unlocked-filled::before {
  content: '\E5A2';
}
.t-icon-map-unlocked::before {
  content: '\E5A3';
}
.t-icon-map::before {
  content: '\E5A4';
}
.t-icon-mark-as-unread-filled::before {
  content: '\E5A5';
}
.t-icon-mark-as-unread::before {
  content: '\E5A6';
}
.t-icon-markup-filled::before {
  content: '\E5A7';
}
.t-icon-markup::before {
  content: '\E5A8';
}
.t-icon-mathematics-filled::before {
  content: '\E5A9';
}
.t-icon-mathematics::before {
  content: '\E5AA';
}
.t-icon-measurement-1-filled::before {
  content: '\E5AB';
}
.t-icon-measurement-1::before {
  content: '\E5AC';
}
.t-icon-measurement-2-filled::before {
  content: '\E5AD';
}
.t-icon-measurement-2::before {
  content: '\E5AE';
}
.t-icon-measurement-filled::before {
  content: '\E5AF';
}
.t-icon-measurement::before {
  content: '\E5B0';
}
.t-icon-meat-pepper-filled::before {
  content: '\E5B1';
}
.t-icon-meat-pepper::before {
  content: '\E5B2';
}
.t-icon-media-library-filled::before {
  content: '\E5B3';
}
.t-icon-media-library::before {
  content: '\E5B4';
}
.t-icon-member-filled::before {
  content: '\E5B5';
}
.t-icon-member::before {
  content: '\E5B6';
}
.t-icon-mentioned-filled::before {
  content: '\E5B7';
}
.t-icon-mentioned::before {
  content: '\E5B8';
}
.t-icon-menu-application::before {
  content: '\E5B9';
}
.t-icon-menu-filled::before {
  content: '\E5BA';
}
.t-icon-menu-fold::before {
  content: '\E5BB';
}
.t-icon-menu-unfold::before {
  content: '\E5BC';
}
.t-icon-menu::before {
  content: '\E5BD';
}
.t-icon-merge-cells-filled::before {
  content: '\E5BE';
}
.t-icon-merge-cells::before {
  content: '\E5BF';
}
.t-icon-mermaid-filled::before {
  content: '\E5C0';
}
.t-icon-mermaid::before {
  content: '\E5C1';
}
.t-icon-microphone-1-filled::before {
  content: '\E5C2';
}
.t-icon-microphone-1::before {
  content: '\E5C3';
}
.t-icon-microphone-2-filled::before {
  content: '\E5C4';
}
.t-icon-microphone-2::before {
  content: '\E5C5';
}
.t-icon-microphone-filled::before {
  content: '\E5C6';
}
.t-icon-microphone::before {
  content: '\E5C7';
}
.t-icon-milk-filled::before {
  content: '\E5C8';
}
.t-icon-milk::before {
  content: '\E5C9';
}
.t-icon-mind-map-filled::before {
  content: '\E5CA';
}
.t-icon-mind-map::before {
  content: '\E5CB';
}
.t-icon-minus-circle-filled::before {
  content: '\E5CC';
}
.t-icon-minus-circle::before {
  content: '\E5CD';
}
.t-icon-minus-rectangle-filled::before {
  content: '\E5CE';
}
.t-icon-minus-rectangle::before {
  content: '\E5CF';
}
.t-icon-minus::before {
  content: '\E5D0';
}
.t-icon-mirror-filled::before {
  content: '\E5D1';
}
.t-icon-mirror::before {
  content: '\E5D2';
}
.t-icon-mobile-blocked-filled::before {
  content: '\E5D3';
}
.t-icon-mobile-blocked::before {
  content: '\E5D4';
}
.t-icon-mobile-filled::before {
  content: '\E5D5';
}
.t-icon-mobile-list-filled::before {
  content: '\E5D6';
}
.t-icon-mobile-list::before {
  content: '\E5D7';
}
.t-icon-mobile-navigation-filled::before {
  content: '\E5D8';
}
.t-icon-mobile-navigation::before {
  content: '\E5D9';
}
.t-icon-mobile-shortcut-filled::before {
  content: '\E5DA';
}
.t-icon-mobile-shortcut::before {
  content: '\E5DB';
}
.t-icon-mobile-vibrate-filled::before {
  content: '\E5DC';
}
.t-icon-mobile-vibrate::before {
  content: '\E5DD';
}
.t-icon-mobile::before {
  content: '\E5DE';
}
.t-icon-mode-dark-filled::before {
  content: '\E5DF';
}
.t-icon-mode-dark::before {
  content: '\E5E0';
}
.t-icon-mode-embedding-filled::before {
  content: '\E5E1';
}
.t-icon-mode-embedding::before {
  content: '\E5E2';
}
.t-icon-mode-light-filled::before {
  content: '\E5E3';
}
.t-icon-mode-light::before {
  content: '\E5E4';
}
.t-icon-mode-preview-filled::before {
  content: '\E5E5';
}
.t-icon-mode-preview::before {
  content: '\E5E6';
}
.t-icon-mode-text-filled::before {
  content: '\E5E7';
}
.t-icon-mode-text::before {
  content: '\E5E8';
}
.t-icon-module-filled::before {
  content: '\E5E9';
}
.t-icon-module::before {
  content: '\E5EA';
}
.t-icon-money-filled::before {
  content: '\E5EB';
}
.t-icon-money::before {
  content: '\E5EC';
}
.t-icon-monument-filled::before {
  content: '\E5ED';
}
.t-icon-monument::before {
  content: '\E5EE';
}
.t-icon-moon-fall-filled::before {
  content: '\E5EF';
}
.t-icon-moon-fall::before {
  content: '\E5F0';
}
.t-icon-moon-filled::before {
  content: '\E5F1';
}
.t-icon-moon-rising-filled::before {
  content: '\E5F2';
}
.t-icon-moon-rising::before {
  content: '\E5F3';
}
.t-icon-moon::before {
  content: '\E5F4';
}
.t-icon-more::before {
  content: '\E5F5';
}
.t-icon-mosaic-filled::before {
  content: '\E5F6';
}
.t-icon-mosaic::before {
  content: '\E5F7';
}
.t-icon-mosque-1-filled::before {
  content: '\E5F8';
}
.t-icon-mosque-1::before {
  content: '\E5F9';
}
.t-icon-mosque-filled::before {
  content: '\E5FA';
}
.t-icon-mosque::before {
  content: '\E5FB';
}
.t-icon-mouse-filled::before {
  content: '\E5FC';
}
.t-icon-mouse::before {
  content: '\E5FD';
}
.t-icon-move-1::before {
  content: '\E5FE';
}
.t-icon-move::before {
  content: '\E5FF';
}
.t-icon-movie-clapper-filled::before {
  content: '\E600';
}
.t-icon-movie-clapper::before {
  content: '\E601';
}
.t-icon-multiply::before {
  content: '\E602';
}
.t-icon-museum-1-filled::before {
  content: '\E603';
}
.t-icon-museum-1::before {
  content: '\E604';
}
.t-icon-museum-2-filled::before {
  content: '\E605';
}
.t-icon-museum-2::before {
  content: '\E606';
}
.t-icon-museum-filled::before {
  content: '\E607';
}
.t-icon-museum::before {
  content: '\E608';
}
.t-icon-mushroom-1-filled::before {
  content: '\E609';
}
.t-icon-mushroom-1::before {
  content: '\E60A';
}
.t-icon-mushroom-filled::before {
  content: '\E60B';
}
.t-icon-mushroom::before {
  content: '\E60C';
}
.t-icon-music-1-filled::before {
  content: '\E60D';
}
.t-icon-music-1::before {
  content: '\E60E';
}
.t-icon-music-2-filled::before {
  content: '\E60F';
}
.t-icon-music-2::before {
  content: '\E610';
}
.t-icon-music-filled::before {
  content: '\E611';
}
.t-icon-music-rectangle-add-filled::before {
  content: '\E612';
}
.t-icon-music-rectangle-add::before {
  content: '\E613';
}
.t-icon-music::before {
  content: '\E614';
}
.t-icon-navigation-arrow-filled::before {
  content: '\E615';
}
.t-icon-navigation-arrow::before {
  content: '\E616';
}
.t-icon-next-filled::before {
  content: '\E617';
}
.t-icon-next::before {
  content: '\E618';
}
.t-icon-no-expression-filled::before {
  content: '\E619';
}
.t-icon-no-expression::before {
  content: '\E61A';
}
.t-icon-no-result-filled::before {
  content: '\E61B';
}
.t-icon-no-result::before {
  content: '\E61C';
}
.t-icon-noodle-filled::before {
  content: '\E61D';
}
.t-icon-noodle::before {
  content: '\E61E';
}
.t-icon-notification-add-filled::before {
  content: '\E61F';
}
.t-icon-notification-add::before {
  content: '\E620';
}
.t-icon-notification-circle-filled::before {
  content: '\E621';
}
.t-icon-notification-circle::before {
  content: '\E622';
}
.t-icon-notification-error-filled::before {
  content: '\E623';
}
.t-icon-notification-error::before {
  content: '\E624';
}
.t-icon-notification-filled::before {
  content: '\E625';
}
.t-icon-notification::before {
  content: '\E626';
}
.t-icon-numbers-0-1::before {
  content: '\E627';
}
.t-icon-numbers-0::before {
  content: '\E628';
}
.t-icon-numbers-1-1::before {
  content: '\E629';
}
.t-icon-numbers-1::before {
  content: '\E62A';
}
.t-icon-numbers-2-1::before {
  content: '\E62B';
}
.t-icon-numbers-2::before {
  content: '\E62C';
}
.t-icon-numbers-3-1::before {
  content: '\E62D';
}
.t-icon-numbers-3::before {
  content: '\E62E';
}
.t-icon-numbers-4-1::before {
  content: '\E62F';
}
.t-icon-numbers-4::before {
  content: '\E630';
}
.t-icon-numbers-5-1::before {
  content: '\E631';
}
.t-icon-numbers-5::before {
  content: '\E632';
}
.t-icon-numbers-6-1::before {
  content: '\E633';
}
.t-icon-numbers-6::before {
  content: '\E634';
}
.t-icon-numbers-7-1::before {
  content: '\E635';
}
.t-icon-numbers-7::before {
  content: '\E636';
}
.t-icon-numbers-8-1::before {
  content: '\E637';
}
.t-icon-numbers-8::before {
  content: '\E638';
}
.t-icon-numbers-9-1::before {
  content: '\E639';
}
.t-icon-numbers-9::before {
  content: '\E63A';
}
.t-icon-numbers-circle-1-filled::before {
  content: '\E63B';
}
.t-icon-numbers-circle-1::before {
  content: '\E63C';
}
.t-icon-numbers-circle-2-filled::before {
  content: '\E63D';
}
.t-icon-numbers-circle-2::before {
  content: '\E63E';
}
.t-icon-numbers-circle-3-filled::before {
  content: '\E63F';
}
.t-icon-numbers-circle-3::before {
  content: '\E640';
}
.t-icon-numbers-circle-4-filled::before {
  content: '\E641';
}
.t-icon-numbers-circle-4::before {
  content: '\E642';
}
.t-icon-nut-filled::before {
  content: '\E643';
}
.t-icon-nut::before {
  content: '\E644';
}
.t-icon-object-storage::before {
  content: '\E645';
}
.t-icon-open-mouth-filled::before {
  content: '\E646';
}
.t-icon-open-mouth::before {
  content: '\E647';
}
.t-icon-opera-filled::before {
  content: '\E648';
}
.t-icon-opera::before {
  content: '\E649';
}
.t-icon-order-adjustment-column::before {
  content: '\E64A';
}
.t-icon-order-ascending::before {
  content: '\E64B';
}
.t-icon-order-descending::before {
  content: '\E64C';
}
.t-icon-order-list::before {
  content: '\E64D';
}
.t-icon-order::before {
  content: '\E64E';
}
.t-icon-outbox-filled::before {
  content: '\E64F';
}
.t-icon-outbox::before {
  content: '\E650';
}
.t-icon-page-first::before {
  content: '\E651';
}
.t-icon-page-head-filled::before {
  content: '\E652';
}
.t-icon-page-head::before {
  content: '\E653';
}
.t-icon-page-included-filled::before {
  content: '\E654';
}
.t-icon-page-included::before {
  content: '\E655';
}
.t-icon-page-last::before {
  content: '\E656';
}
.t-icon-page-tab-filled::before {
  content: '\E657';
}
.t-icon-page-tab::before {
  content: '\E658';
}
.t-icon-palace-1-filled::before {
  content: '\E659';
}
.t-icon-palace-1::before {
  content: '\E65A';
}
.t-icon-palace-2-filled::before {
  content: '\E65B';
}
.t-icon-palace-2::before {
  content: '\E65C';
}
.t-icon-palace-3-filled::before {
  content: '\E65D';
}
.t-icon-palace-3::before {
  content: '\E65E';
}
.t-icon-palace-4-filled::before {
  content: '\E65F';
}
.t-icon-palace-4::before {
  content: '\E660';
}
.t-icon-palace-filled::before {
  content: '\E661';
}
.t-icon-palace::before {
  content: '\E662';
}
.t-icon-palette-1-filled::before {
  content: '\E663';
}
.t-icon-palette-1::before {
  content: '\E664';
}
.t-icon-palette-filled::before {
  content: '\E665';
}
.t-icon-palette::before {
  content: '\E666';
}
.t-icon-panorama-horizontal-filled::before {
  content: '\E667';
}
.t-icon-panorama-horizontal::before {
  content: '\E668';
}
.t-icon-panorama-vertical-filled::before {
  content: '\E669';
}
.t-icon-panorama-vertical::before {
  content: '\E66A';
}
.t-icon-pantone-filled::before {
  content: '\E66B';
}
.t-icon-pantone::before {
  content: '\E66C';
}
.t-icon-parabola::before {
  content: '\E66D';
}
.t-icon-parentheses::before {
  content: '\E66E';
}
.t-icon-paste-filled::before {
  content: '\E66F';
}
.t-icon-paste::before {
  content: '\E670';
}
.t-icon-patio-filled::before {
  content: '\E671';
}
.t-icon-patio::before {
  content: '\E672';
}
.t-icon-pause-circle-filled::before {
  content: '\E673';
}
.t-icon-pause-circle-stroke-filled::before {
  content: '\E674';
}
.t-icon-pause-circle-stroke::before {
  content: '\E675';
}
.t-icon-pause-circle::before {
  content: '\E676';
}
.t-icon-pause::before {
  content: '\E677';
}
.t-icon-pea-filled::before {
  content: '\E678';
}
.t-icon-pea::before {
  content: '\E679';
}
.t-icon-peach-filled::before {
  content: '\E67A';
}
.t-icon-peach::before {
  content: '\E67B';
}
.t-icon-pear-filled::before {
  content: '\E67C';
}
.t-icon-pear::before {
  content: '\E67D';
}
.t-icon-pearl-of-the-orient-filled::before {
  content: '\E67E';
}
.t-icon-pearl-of-the-orient::before {
  content: '\E67F';
}
.t-icon-pen-ball-filled::before {
  content: '\E680';
}
.t-icon-pen-ball::before {
  content: '\E681';
}
.t-icon-pen-brush-filled::before {
  content: '\E682';
}
.t-icon-pen-brush::before {
  content: '\E683';
}
.t-icon-pen-filled::before {
  content: '\E684';
}
.t-icon-pen-fluorescence-filled::before {
  content: '\E685';
}
.t-icon-pen-fluorescence::before {
  content: '\E686';
}
.t-icon-pen-mark-filled::before {
  content: '\E687';
}
.t-icon-pen-mark::before {
  content: '\E688';
}
.t-icon-pen-quill-filled::before {
  content: '\E689';
}
.t-icon-pen-quill::before {
  content: '\E68A';
}
.t-icon-pen::before {
  content: '\E68B';
}
.t-icon-pending-filled::before {
  content: '\E68C';
}
.t-icon-pending::before {
  content: '\E68D';
}
.t-icon-percent::before {
  content: '\E68E';
}
.t-icon-personal-information-filled::before {
  content: '\E68F';
}
.t-icon-personal-information::before {
  content: '\E690';
}
.t-icon-phone-locked-filled::before {
  content: '\E691';
}
.t-icon-phone-locked::before {
  content: '\E692';
}
.t-icon-phone-search-filled::before {
  content: '\E693';
}
.t-icon-phone-search::before {
  content: '\E694';
}
.t-icon-pi::before {
  content: '\E695';
}
.t-icon-piano-filled::before {
  content: '\E696';
}
.t-icon-piano::before {
  content: '\E697';
}
.t-icon-pin-filled::before {
  content: '\E698';
}
.t-icon-pin::before {
  content: '\E699';
}
.t-icon-placeholder-filled::before {
  content: '\E69A';
}
.t-icon-placeholder::before {
  content: '\E69B';
}
.t-icon-plantuml-filled::before {
  content: '\E69C';
}
.t-icon-plantuml::before {
  content: '\E69D';
}
.t-icon-play-chart-filled::before {
  content: '\E69E';
}
.t-icon-play-chart::before {
  content: '\E69F';
}
.t-icon-play-circle-filled::before {
  content: '\E6A0';
}
.t-icon-play-circle-stroke-add-filled::before {
  content: '\E6A1';
}
.t-icon-play-circle-stroke-add::before {
  content: '\E6A2';
}
.t-icon-play-circle-stroke-filled::before {
  content: '\E6A3';
}
.t-icon-play-circle-stroke::before {
  content: '\E6A4';
}
.t-icon-play-circle::before {
  content: '\E6A5';
}
.t-icon-play-demo-filled::before {
  content: '\E6A6';
}
.t-icon-play-demo::before {
  content: '\E6A7';
}
.t-icon-play-rectangle-filled::before {
  content: '\E6A8';
}
.t-icon-play-rectangle::before {
  content: '\E6A9';
}
.t-icon-play::before {
  content: '\E6AA';
}
.t-icon-plus::before {
  content: '\E6AB';
}
.t-icon-popsicle-filled::before {
  content: '\E6AC';
}
.t-icon-popsicle::before {
  content: '\E6AD';
}
.t-icon-portrait-filled::before {
  content: '\E6AE';
}
.t-icon-portrait::before {
  content: '\E6AF';
}
.t-icon-pout-filled::before {
  content: '\E6B0';
}
.t-icon-pout::before {
  content: '\E6B1';
}
.t-icon-poweroff::before {
  content: '\E6B2';
}
.t-icon-precise-monitor::before {
  content: '\E6B3';
}
.t-icon-previous-filled::before {
  content: '\E6B4';
}
.t-icon-previous::before {
  content: '\E6B5';
}
.t-icon-print-filled::before {
  content: '\E6B6';
}
.t-icon-print::before {
  content: '\E6B7';
}
.t-icon-pumpkin-filled::before {
  content: '\E6B8';
}
.t-icon-pumpkin::before {
  content: '\E6B9';
}
.t-icon-pyramid-filled::before {
  content: '\E6BA';
}
.t-icon-pyramid-maya-filled::before {
  content: '\E6BB';
}
.t-icon-pyramid-maya::before {
  content: '\E6BC';
}
.t-icon-pyramid::before {
  content: '\E6BD';
}
.t-icon-qrcode::before {
  content: '\E6BE';
}
.t-icon-quadratic::before {
  content: '\E6BF';
}
.t-icon-questionnaire-double-filled::before {
  content: '\E6C0';
}
.t-icon-questionnaire-double::before {
  content: '\E6C1';
}
.t-icon-questionnaire-filled::before {
  content: '\E6C2';
}
.t-icon-questionnaire::before {
  content: '\E6C3';
}
.t-icon-queue-filled::before {
  content: '\E6C4';
}
.t-icon-queue::before {
  content: '\E6C5';
}
.t-icon-quote-filled::before {
  content: '\E6C6';
}
.t-icon-quote::before {
  content: '\E6C7';
}
.t-icon-radar::before {
  content: '\E6C8';
}
.t-icon-radio-1-filled::before {
  content: '\E6C9';
}
.t-icon-radio-1::before {
  content: '\E6CA';
}
.t-icon-radio-2-filled::before {
  content: '\E6CB';
}
.t-icon-radio-2::before {
  content: '\E6CC';
}
.t-icon-radish-filled::before {
  content: '\E6CD';
}
.t-icon-radish::before {
  content: '\E6CE';
}
.t-icon-rain-heavy::before {
  content: '\E6CF';
}
.t-icon-rain-light-filled::before {
  content: '\E6D0';
}
.t-icon-rain-light::before {
  content: '\E6D1';
}
.t-icon-rain-medium::before {
  content: '\E6D2';
}
.t-icon-rainbow::before {
  content: '\E6D3';
}
.t-icon-rectangle-filled::before {
  content: '\E6D4';
}
.t-icon-rectangle::before {
  content: '\E6D5';
}
.t-icon-refresh::before {
  content: '\E6D6';
}
.t-icon-relation::before {
  content: '\E6D7';
}
.t-icon-relativity-filled::before {
  content: '\E6D8';
}
.t-icon-relativity::before {
  content: '\E6D9';
}
.t-icon-remote-wave-filled::before {
  content: '\E6DA';
}
.t-icon-remote-wave::before {
  content: '\E6DB';
}
.t-icon-remove::before {
  content: '\E6DC';
}
.t-icon-rename-filled::before {
  content: '\E6DD';
}
.t-icon-rename::before {
  content: '\E6DE';
}
.t-icon-replay-filled::before {
  content: '\E6DF';
}
.t-icon-replay::before {
  content: '\E6E0';
}
.t-icon-rice-ball-filled::before {
  content: '\E6E1';
}
.t-icon-rice-ball::before {
  content: '\E6E2';
}
.t-icon-rice-filled::before {
  content: '\E6E3';
}
.t-icon-rice::before {
  content: '\E6E4';
}
.t-icon-roast-filled::before {
  content: '\E6E5';
}
.t-icon-roast::before {
  content: '\E6E6';
}
.t-icon-robot-1-filled::before {
  content: '\E6E7';
}
.t-icon-robot-1::before {
  content: '\E6E8';
}
.t-icon-robot-2-filled::before {
  content: '\E6E9';
}
.t-icon-robot-2::before {
  content: '\E6EA';
}
.t-icon-robot-filled::before {
  content: '\E6EB';
}
.t-icon-robot::before {
  content: '\E6EC';
}
.t-icon-rocket-filled::before {
  content: '\E6ED';
}
.t-icon-rocket::before {
  content: '\E6EE';
}
.t-icon-rollback::before {
  content: '\E6EF';
}
.t-icon-rollfront::before {
  content: '\E6F0';
}
.t-icon-root-list-filled::before {
  content: '\E6F1';
}
.t-icon-root-list::before {
  content: '\E6F2';
}
.t-icon-rotate-locked-filled::before {
  content: '\E6F3';
}
.t-icon-rotate-locked::before {
  content: '\E6F4';
}
.t-icon-rotate::before {
  content: '\E6F5';
}
.t-icon-rotation::before {
  content: '\E6F6';
}
.t-icon-round-filled::before {
  content: '\E6F7';
}
.t-icon-round::before {
  content: '\E6F8';
}
.t-icon-router-wave-filled::before {
  content: '\E6F9';
}
.t-icon-router-wave::before {
  content: '\E6FA';
}
.t-icon-rss::before {
  content: '\E6FB';
}
.t-icon-ruler-filled::before {
  content: '\E6FC';
}
.t-icon-ruler::before {
  content: '\E6FD';
}
.t-icon-sailing-hotel-filled::before {
  content: '\E6FE';
}
.t-icon-sailing-hotel::before {
  content: '\E6FF';
}
.t-icon-sandwich-filled::before {
  content: '\E700';
}
.t-icon-sandwich::before {
  content: '\E701';
}
.t-icon-saturation-filled::before {
  content: '\E702';
}
.t-icon-saturation::before {
  content: '\E703';
}
.t-icon-sausage-filled::before {
  content: '\E704';
}
.t-icon-sausage::before {
  content: '\E705';
}
.t-icon-save-filled::before {
  content: '\E706';
}
.t-icon-save::before {
  content: '\E707';
}
.t-icon-saving-pot-filled::before {
  content: '\E708';
}
.t-icon-saving-pot::before {
  content: '\E709';
}
.t-icon-scan::before {
  content: '\E70A';
}
.t-icon-screen-4k-filled::before {
  content: '\E70B';
}
.t-icon-screen-4k::before {
  content: '\E70C';
}
.t-icon-screen-mirroring-filled::before {
  content: '\E70D';
}
.t-icon-screen-mirroring::before {
  content: '\E70E';
}
.t-icon-screencast-filled::before {
  content: '\E70F';
}
.t-icon-screencast::before {
  content: '\E710';
}
.t-icon-screenshot::before {
  content: '\E711';
}
.t-icon-scroll-bar-filled::before {
  content: '\E712';
}
.t-icon-scroll-bar::before {
  content: '\E713';
}
.t-icon-sd-card-1-filled::before {
  content: '\E714';
}
.t-icon-sd-card-1::before {
  content: '\E715';
}
.t-icon-sd-card-filled::before {
  content: '\E716';
}
.t-icon-sd-card::before {
  content: '\E717';
}
.t-icon-seal-filled::before {
  content: '\E718';
}
.t-icon-seal::before {
  content: '\E719';
}
.t-icon-search-error-filled::before {
  content: '\E71A';
}
.t-icon-search-error::before {
  content: '\E71B';
}
.t-icon-search-filled::before {
  content: '\E71C';
}
.t-icon-search::before {
  content: '\E71D';
}
.t-icon-secured-filled::before {
  content: '\E71E';
}
.t-icon-secured::before {
  content: '\E71F';
}
.t-icon-send-cancel-filled::before {
  content: '\E720';
}
.t-icon-send-cancel::before {
  content: '\E721';
}
.t-icon-send-filled::before {
  content: '\E722';
}
.t-icon-send::before {
  content: '\E723';
}
.t-icon-sensors-1::before {
  content: '\E724';
}
.t-icon-sensors-2::before {
  content: '\E725';
}
.t-icon-sensors-off::before {
  content: '\E726';
}
.t-icon-sensors::before {
  content: '\E727';
}
.t-icon-sequence-filled::before {
  content: '\E728';
}
.t-icon-sequence::before {
  content: '\E729';
}
.t-icon-serenity-filled::before {
  content: '\E72A';
}
.t-icon-serenity::before {
  content: '\E72B';
}
.t-icon-server-filled::before {
  content: '\E72C';
}
.t-icon-server::before {
  content: '\E72D';
}
.t-icon-service-filled::before {
  content: '\E72E';
}
.t-icon-service::before {
  content: '\E72F';
}
.t-icon-setting-1-filled::before {
  content: '\E730';
}
.t-icon-setting-1::before {
  content: '\E731';
}
.t-icon-setting-filled::before {
  content: '\E732';
}
.t-icon-setting::before {
  content: '\E733';
}
.t-icon-share-1-filled::before {
  content: '\E734';
}
.t-icon-share-1::before {
  content: '\E735';
}
.t-icon-share-filled::before {
  content: '\E736';
}
.t-icon-share::before {
  content: '\E737';
}
.t-icon-sharpness-filled::before {
  content: '\E738';
}
.t-icon-sharpness::before {
  content: '\E739';
}
.t-icon-shield-error-filled::before {
  content: '\E73A';
}
.t-icon-shield-error::before {
  content: '\E73B';
}
.t-icon-shimen-filled::before {
  content: '\E73C';
}
.t-icon-shimen::before {
  content: '\E73D';
}
.t-icon-shop-1-filled::before {
  content: '\E73E';
}
.t-icon-shop-1::before {
  content: '\E73F';
}
.t-icon-shop-2-filled::before {
  content: '\E740';
}
.t-icon-shop-2::before {
  content: '\E741';
}
.t-icon-shop-3-filled::before {
  content: '\E742';
}
.t-icon-shop-3::before {
  content: '\E743';
}
.t-icon-shop-4-filled::before {
  content: '\E744';
}
.t-icon-shop-4::before {
  content: '\E745';
}
.t-icon-shop-5-filled::before {
  content: '\E746';
}
.t-icon-shop-5::before {
  content: '\E747';
}
.t-icon-shop-filled::before {
  content: '\E748';
}
.t-icon-shop::before {
  content: '\E749';
}
.t-icon-shortcut::before {
  content: '\E74A';
}
.t-icon-shrimp-filled::before {
  content: '\E74B';
}
.t-icon-shrimp::before {
  content: '\E74C';
}
.t-icon-shrink-horizontal::before {
  content: '\E74D';
}
.t-icon-shrink-vertical::before {
  content: '\E74E';
}
.t-icon-shutter-filled::before {
  content: '\E74F';
}
.t-icon-shutter::before {
  content: '\E750';
}
.t-icon-shutup-filled::before {
  content: '\E751';
}
.t-icon-shutup::before {
  content: '\E752';
}
.t-icon-sim-card-1-filled::before {
  content: '\E753';
}
.t-icon-sim-card-1::before {
  content: '\E754';
}
.t-icon-sim-card-2-filled::before {
  content: '\E755';
}
.t-icon-sim-card-2::before {
  content: '\E756';
}
.t-icon-sim-card-filled::before {
  content: '\E757';
}
.t-icon-sim-card::before {
  content: '\E758';
}
.t-icon-sinister-smile-filled::before {
  content: '\E759';
}
.t-icon-sinister-smile::before {
  content: '\E75A';
}
.t-icon-sip-filled::before {
  content: '\E75B';
}
.t-icon-sip::before {
  content: '\E75C';
}
.t-icon-sitemap-filled::before {
  content: '\E75D';
}
.t-icon-sitemap::before {
  content: '\E75E';
}
.t-icon-size-change::before {
  content: '\E75F';
}
.t-icon-slash::before {
  content: '\E760';
}
.t-icon-sleep-filled::before {
  content: '\E761';
}
.t-icon-sleep::before {
  content: '\E762';
}
.t-icon-slice-filled::before {
  content: '\E763';
}
.t-icon-slice::before {
  content: '\E764';
}
.t-icon-slideshow-filled::before {
  content: '\E765';
}
.t-icon-slideshow::before {
  content: '\E766';
}
.t-icon-smile-filled::before {
  content: '\E767';
}
.t-icon-smile::before {
  content: '\E768';
}
.t-icon-sneer-filled::before {
  content: '\E769';
}
.t-icon-sneer::before {
  content: '\E76A';
}
.t-icon-snowflake::before {
  content: '\E76B';
}
.t-icon-sonic::before {
  content: '\E76C';
}
.t-icon-sound-down-filled::before {
  content: '\E76D';
}
.t-icon-sound-down::before {
  content: '\E76E';
}
.t-icon-sound-filled::before {
  content: '\E76F';
}
.t-icon-sound-high-filled::before {
  content: '\E770';
}
.t-icon-sound-high::before {
  content: '\E771';
}
.t-icon-sound-low-filled::before {
  content: '\E772';
}
.t-icon-sound-low::before {
  content: '\E773';
}
.t-icon-sound-mute-1-filled::before {
  content: '\E774';
}
.t-icon-sound-mute-1::before {
  content: '\E775';
}
.t-icon-sound-mute-filled::before {
  content: '\E776';
}
.t-icon-sound-mute::before {
  content: '\E777';
}
.t-icon-sound-up-filled::before {
  content: '\E778';
}
.t-icon-sound-up::before {
  content: '\E779';
}
.t-icon-sound::before {
  content: '\E77A';
}
.t-icon-space::before {
  content: '\E77B';
}
.t-icon-speechless-1-filled::before {
  content: '\E77C';
}
.t-icon-speechless-1::before {
  content: '\E77D';
}
.t-icon-speechless-filled::before {
  content: '\E77E';
}
.t-icon-speechless::before {
  content: '\E77F';
}
.t-icon-star-filled::before {
  content: '\E780';
}
.t-icon-star::before {
  content: '\E781';
}
.t-icon-statue-of-jesus-filled::before {
  content: '\E782';
}
.t-icon-statue-of-jesus::before {
  content: '\E783';
}
.t-icon-sticky-note-filled::before {
  content: '\E784';
}
.t-icon-sticky-note::before {
  content: '\E785';
}
.t-icon-stop-circle-filled::before {
  content: '\E786';
}
.t-icon-stop-circle-stroke-filled::before {
  content: '\E787';
}
.t-icon-stop-circle-stroke::before {
  content: '\E788';
}
.t-icon-stop-circle::before {
  content: '\E789';
}
.t-icon-stop::before {
  content: '\E78A';
}
.t-icon-store-filled::before {
  content: '\E78B';
}
.t-icon-store::before {
  content: '\E78C';
}
.t-icon-street-road-1-filled::before {
  content: '\E78D';
}
.t-icon-street-road-1::before {
  content: '\E78E';
}
.t-icon-street-road-filled::before {
  content: '\E78F';
}
.t-icon-street-road::before {
  content: '\E790';
}
.t-icon-subscript::before {
  content: '\E791';
}
.t-icon-subtitle-filled::before {
  content: '\E792';
}
.t-icon-subtitle::before {
  content: '\E793';
}
.t-icon-subway-line-filled::before {
  content: '\E794';
}
.t-icon-subway-line::before {
  content: '\E795';
}
.t-icon-sum::before {
  content: '\E796';
}
.t-icon-summary::before {
  content: '\E797';
}
.t-icon-sun-fall-filled::before {
  content: '\E798';
}
.t-icon-sun-fall::before {
  content: '\E799';
}
.t-icon-sun-rising-filled::before {
  content: '\E79A';
}
.t-icon-sun-rising::before {
  content: '\E79B';
}
.t-icon-sunny-filled::before {
  content: '\E79C';
}
.t-icon-sunny::before {
  content: '\E79D';
}
.t-icon-superscript::before {
  content: '\E79E';
}
.t-icon-support-filled::before {
  content: '\E79F';
}
.t-icon-support::before {
  content: '\E7A0';
}
.t-icon-surprised-1-filled::before {
  content: '\E7A1';
}
.t-icon-surprised-1::before {
  content: '\E7A2';
}
.t-icon-surprised-filled::before {
  content: '\E7A3';
}
.t-icon-surprised::before {
  content: '\E7A4';
}
.t-icon-swap-left::before {
  content: '\E7A5';
}
.t-icon-swap-right::before {
  content: '\E7A6';
}
.t-icon-swap::before {
  content: '\E7A7';
}
.t-icon-swear-1-filled::before {
  content: '\E7A8';
}
.t-icon-swear-1::before {
  content: '\E7A9';
}
.t-icon-swear-2-filled::before {
  content: '\E7AA';
}
.t-icon-swear-2::before {
  content: '\E7AB';
}
.t-icon-system-2::before {
  content: '\E7AC';
}
.t-icon-system-3-filled::before {
  content: '\E7AD';
}
.t-icon-system-3::before {
  content: '\E7AE';
}
.t-icon-system-application-filled::before {
  content: '\E7AF';
}
.t-icon-system-application::before {
  content: '\E7B0';
}
.t-icon-system-blocked-filled::before {
  content: '\E7B1';
}
.t-icon-system-blocked::before {
  content: '\E7B2';
}
.t-icon-system-code-filled::before {
  content: '\E7B3';
}
.t-icon-system-code::before {
  content: '\E7B4';
}
.t-icon-system-components-filled::before {
  content: '\E7B5';
}
.t-icon-system-components::before {
  content: '\E7B6';
}
.t-icon-system-coordinate-filled::before {
  content: '\E7B7';
}
.t-icon-system-coordinate::before {
  content: '\E7B8';
}
.t-icon-system-device-filled::before {
  content: '\E7B9';
}
.t-icon-system-device::before {
  content: '\E7BA';
}
.t-icon-system-interface-filled::before {
  content: '\E7BB';
}
.t-icon-system-interface::before {
  content: '\E7BC';
}
.t-icon-system-location-filled::before {
  content: '\E7BD';
}
.t-icon-system-location::before {
  content: '\E7BE';
}
.t-icon-system-locked-filled::before {
  content: '\E7BF';
}
.t-icon-system-locked::before {
  content: '\E7C0';
}
.t-icon-system-log-filled::before {
  content: '\E7C1';
}
.t-icon-system-log::before {
  content: '\E7C2';
}
.t-icon-system-marked-filled::before {
  content: '\E7C3';
}
.t-icon-system-marked::before {
  content: '\E7C4';
}
.t-icon-system-messages-filled::before {
  content: '\E7C5';
}
.t-icon-system-messages::before {
  content: '\E7C6';
}
.t-icon-system-regulation-filled::before {
  content: '\E7C7';
}
.t-icon-system-regulation::before {
  content: '\E7C8';
}
.t-icon-system-search-filled::before {
  content: '\E7C9';
}
.t-icon-system-search::before {
  content: '\E7CA';
}
.t-icon-system-setting-filled::before {
  content: '\E7CB';
}
.t-icon-system-setting::before {
  content: '\E7CC';
}
.t-icon-system-storage-filled::before {
  content: '\E7CD';
}
.t-icon-system-storage::before {
  content: '\E7CE';
}
.t-icon-system-sum::before {
  content: '\E7CF';
}
.t-icon-system-unlocked-filled::before {
  content: '\E7D0';
}
.t-icon-system-unlocked::before {
  content: '\E7D1';
}
.t-icon-tab-filled::before {
  content: '\E7D2';
}
.t-icon-tab::before {
  content: '\E7D3';
}
.t-icon-table-1-filled::before {
  content: '\E7D4';
}
.t-icon-table-1::before {
  content: '\E7D5';
}
.t-icon-table-2-filled::before {
  content: '\E7D6';
}
.t-icon-table-2::before {
  content: '\E7D7';
}
.t-icon-table-add-filled::before {
  content: '\E7D8';
}
.t-icon-table-add::before {
  content: '\E7D9';
}
.t-icon-table-filled::before {
  content: '\E7DA';
}
.t-icon-table-split-filled::before {
  content: '\E7DB';
}
.t-icon-table-split::before {
  content: '\E7DC';
}
.t-icon-table::before {
  content: '\E7DD';
}
.t-icon-tag-filled::before {
  content: '\E7DE';
}
.t-icon-tag-state-filled::before {
  content: '\E7DF';
}
.t-icon-tag-state::before {
  content: '\E7E0';
}
.t-icon-tag::before {
  content: '\E7E1';
}
.t-icon-tangerinr-filled::before {
  content: '\E7E2';
}
.t-icon-tangerinr::before {
  content: '\E7E3';
}
.t-icon-tape-filled::before {
  content: '\E7E4';
}
.t-icon-tape::before {
  content: '\E7E5';
}
.t-icon-task-1-filled::before {
  content: '\E7E6';
}
.t-icon-task-1::before {
  content: '\E7E7';
}
.t-icon-task-add-1::before {
  content: '\E7E8';
}
.t-icon-task-add-filled::before {
  content: '\E7E9';
}
.t-icon-task-add::before {
  content: '\E7EA';
}
.t-icon-task-checked-1::before {
  content: '\E7EB';
}
.t-icon-task-checked-filled::before {
  content: '\E7EC';
}
.t-icon-task-checked::before {
  content: '\E7ED';
}
.t-icon-task-double-filled::before {
  content: '\E7EE';
}
.t-icon-task-double::before {
  content: '\E7EF';
}
.t-icon-task-error-filled::before {
  content: '\E7F0';
}
.t-icon-task-error::before {
  content: '\E7F1';
}
.t-icon-task-filled::before {
  content: '\E7F2';
}
.t-icon-task-location-filled::before {
  content: '\E7F3';
}
.t-icon-task-location::before {
  content: '\E7F4';
}
.t-icon-task-marked-filled::before {
  content: '\E7F5';
}
.t-icon-task-marked::before {
  content: '\E7F6';
}
.t-icon-task-setting-filled::before {
  content: '\E7F7';
}
.t-icon-task-setting::before {
  content: '\E7F8';
}
.t-icon-task-time-filled::before {
  content: '\E7F9';
}
.t-icon-task-time::before {
  content: '\E7FA';
}
.t-icon-task-visible-filled::before {
  content: '\E7FB';
}
.t-icon-task-visible::before {
  content: '\E7FC';
}
.t-icon-task::before {
  content: '\E7FD';
}
.t-icon-tea-filled::before {
  content: '\E7FE';
}
.t-icon-tea::before {
  content: '\E7FF';
}
.t-icon-teahouse-filled::before {
  content: '\E800';
}
.t-icon-teahouse::before {
  content: '\E801';
}
.t-icon-template-filled::before {
  content: '\E802';
}
.t-icon-template::before {
  content: '\E803';
}
.t-icon-temple-filled::before {
  content: '\E804';
}
.t-icon-temple::before {
  content: '\E805';
}
.t-icon-terminal-rectangle-1-filled::before {
  content: '\E806';
}
.t-icon-terminal-rectangle-1::before {
  content: '\E807';
}
.t-icon-terminal-rectangle-filled::before {
  content: '\E808';
}
.t-icon-terminal-rectangle::before {
  content: '\E809';
}
.t-icon-terminal-window-filled::before {
  content: '\E80A';
}
.t-icon-terminal-window::before {
  content: '\E80B';
}
.t-icon-terminal::before {
  content: '\E80C';
}
.t-icon-text-drawing-filled::before {
  content: '\E80D';
}
.t-icon-text-drawing::before {
  content: '\E80E';
}
.t-icon-text-style::before {
  content: '\E80F';
}
.t-icon-text::before {
  content: '\E810';
}
.t-icon-textbox-filled::before {
  content: '\E811';
}
.t-icon-textbox::before {
  content: '\E812';
}
.t-icon-textformat-bold::before {
  content: '\E813';
}
.t-icon-textformat-color::before {
  content: '\E814';
}
.t-icon-textformat-italic::before {
  content: '\E815';
}
.t-icon-textformat-longer::before {
  content: '\E816';
}
.t-icon-textformat-shorter::before {
  content: '\E817';
}
.t-icon-textformat-strikethrough::before {
  content: '\E818';
}
.t-icon-textformat-underline::before {
  content: '\E819';
}
.t-icon-textformat-wrap::before {
  content: '\E81A';
}
.t-icon-theaters-filled::before {
  content: '\E81B';
}
.t-icon-theaters::before {
  content: '\E81C';
}
.t-icon-thumb-down-1-filled::before {
  content: '\E81D';
}
.t-icon-thumb-down-1::before {
  content: '\E81E';
}
.t-icon-thumb-down-2-filled::before {
  content: '\E81F';
}
.t-icon-thumb-down-2::before {
  content: '\E820';
}
.t-icon-thumb-down-filled::before {
  content: '\E821';
}
.t-icon-thumb-down::before {
  content: '\E822';
}
.t-icon-thumb-up-1-filled::before {
  content: '\E823';
}
.t-icon-thumb-up-1::before {
  content: '\E824';
}
.t-icon-thumb-up-2-filled::before {
  content: '\E825';
}
.t-icon-thumb-up-2::before {
  content: '\E826';
}
.t-icon-thumb-up-filled::before {
  content: '\E827';
}
.t-icon-thumb-up::before {
  content: '\E828';
}
.t-icon-thunder::before {
  content: '\E829';
}
.t-icon-thunderstorm-night-filled::before {
  content: '\E82A';
}
.t-icon-thunderstorm-night::before {
  content: '\E82B';
}
.t-icon-thunderstorm-sunny-filled::before {
  content: '\E82C';
}
.t-icon-thunderstorm-sunny::before {
  content: '\E82D';
}
.t-icon-thunderstorm::before {
  content: '\E82E';
}
.t-icon-ticket-filled::before {
  content: '\E82F';
}
.t-icon-ticket::before {
  content: '\E830';
}
.t-icon-time-filled::before {
  content: '\E831';
}
.t-icon-time::before {
  content: '\E832';
}
.t-icon-tips-double-filled::before {
  content: '\E833';
}
.t-icon-tips-double::before {
  content: '\E834';
}
.t-icon-tips-filled::before {
  content: '\E835';
}
.t-icon-tips::before {
  content: '\E836';
}
.t-icon-tomato-filled::before {
  content: '\E837';
}
.t-icon-tomato::before {
  content: '\E838';
}
.t-icon-tools-circle-filled::before {
  content: '\E839';
}
.t-icon-tools-circle::before {
  content: '\E83A';
}
.t-icon-tools-filled::before {
  content: '\E83B';
}
.t-icon-tools::before {
  content: '\E83C';
}
.t-icon-tornado::before {
  content: '\E83D';
}
.t-icon-tower-1-filled::before {
  content: '\E83E';
}
.t-icon-tower-1::before {
  content: '\E83F';
}
.t-icon-tower-2-filled::before {
  content: '\E840';
}
.t-icon-tower-2::before {
  content: '\E841';
}
.t-icon-tower-3-filled::before {
  content: '\E842';
}
.t-icon-tower-3::before {
  content: '\E843';
}
.t-icon-tower-clock-filled::before {
  content: '\E844';
}
.t-icon-tower-clock::before {
  content: '\E845';
}
.t-icon-tower-filled::before {
  content: '\E846';
}
.t-icon-tower::before {
  content: '\E847';
}
.t-icon-town-filled::before {
  content: '\E848';
}
.t-icon-town::before {
  content: '\E849';
}
.t-icon-traffic-events-filled::before {
  content: '\E84A';
}
.t-icon-traffic-events::before {
  content: '\E84B';
}
.t-icon-traffic-filled::before {
  content: '\E84C';
}
.t-icon-traffic::before {
  content: '\E84D';
}
.t-icon-transform-1-filled::before {
  content: '\E84E';
}
.t-icon-transform-1::before {
  content: '\E84F';
}
.t-icon-transform-2::before {
  content: '\E850';
}
.t-icon-transform-3::before {
  content: '\E851';
}
.t-icon-transform-filled::before {
  content: '\E852';
}
.t-icon-transform::before {
  content: '\E853';
}
.t-icon-translate-1::before {
  content: '\E854';
}
.t-icon-translate::before {
  content: '\E855';
}
.t-icon-tree-catalog-filled::before {
  content: '\E856';
}
.t-icon-tree-catalog::before {
  content: '\E857';
}
.t-icon-tree-list::before {
  content: '\E858';
}
.t-icon-tree-round-dot-filled::before {
  content: '\E859';
}
.t-icon-tree-round-dot-vertical-filled::before {
  content: '\E85A';
}
.t-icon-tree-round-dot-vertical::before {
  content: '\E85B';
}
.t-icon-tree-round-dot::before {
  content: '\E85C';
}
.t-icon-tree-square-dot-filled::before {
  content: '\E85D';
}
.t-icon-tree-square-dot-vertical-filled::before {
  content: '\E85E';
}
.t-icon-tree-square-dot-vertical::before {
  content: '\E85F';
}
.t-icon-tree-square-dot::before {
  content: '\E860';
}
.t-icon-trending-down::before {
  content: '\E861';
}
.t-icon-trending-up::before {
  content: '\E862';
}
.t-icon-tv-1-filled::before {
  content: '\E863';
}
.t-icon-tv-1::before {
  content: '\E864';
}
.t-icon-tv-2-filled::before {
  content: '\E865';
}
.t-icon-tv-2::before {
  content: '\E866';
}
.t-icon-tv-filled::before {
  content: '\E867';
}
.t-icon-tv::before {
  content: '\E868';
}
.t-icon-typography-filled::before {
  content: '\E869';
}
.t-icon-typography::before {
  content: '\E86A';
}
.t-icon-uncomfortable-1-filled::before {
  content: '\E86B';
}
.t-icon-uncomfortable-1::before {
  content: '\E86C';
}
.t-icon-uncomfortable-2-filled::before {
  content: '\E86D';
}
.t-icon-uncomfortable-2::before {
  content: '\E86E';
}
.t-icon-uncomfortable-filled::before {
  content: '\E86F';
}
.t-icon-uncomfortable::before {
  content: '\E870';
}
.t-icon-undertake-delivery-filled::before {
  content: '\E871';
}
.t-icon-undertake-delivery::before {
  content: '\E872';
}
.t-icon-undertake-environment-protection-filled::before {
  content: '\E873';
}
.t-icon-undertake-environment-protection::before {
  content: '\E874';
}
.t-icon-undertake-filled::before {
  content: '\E875';
}
.t-icon-undertake-hold-up-filled::before {
  content: '\E876';
}
.t-icon-undertake-hold-up::before {
  content: '\E877';
}
.t-icon-undertake-transaction-filled::before {
  content: '\E878';
}
.t-icon-undertake-transaction::before {
  content: '\E879';
}
.t-icon-undertake::before {
  content: '\E87A';
}
.t-icon-unfold-less::before {
  content: '\E87B';
}
.t-icon-unfold-more::before {
  content: '\E87C';
}
.t-icon-unhappy-1-filled::before {
  content: '\E87D';
}
.t-icon-unhappy-1::before {
  content: '\E87E';
}
.t-icon-unhappy-filled::before {
  content: '\E87F';
}
.t-icon-unhappy::before {
  content: '\E880';
}
.t-icon-uninstall-filled::before {
  content: '\E881';
}
.t-icon-uninstall::before {
  content: '\E882';
}
.t-icon-upload-1::before {
  content: '\E883';
}
.t-icon-upload::before {
  content: '\E884';
}
.t-icon-upscale::before {
  content: '\E885';
}
.t-icon-usb-filled::before {
  content: '\E886';
}
.t-icon-usb::before {
  content: '\E887';
}
.t-icon-user-1-filled::before {
  content: '\E888';
}
.t-icon-user-1::before {
  content: '\E889';
}
.t-icon-user-add-filled::before {
  content: '\E88A';
}
.t-icon-user-add::before {
  content: '\E88B';
}
.t-icon-user-arrow-down-filled::before {
  content: '\E88C';
}
.t-icon-user-arrow-down::before {
  content: '\E88D';
}
.t-icon-user-arrow-left-filled::before {
  content: '\E88E';
}
.t-icon-user-arrow-left::before {
  content: '\E88F';
}
.t-icon-user-arrow-right-filled::before {
  content: '\E890';
}
.t-icon-user-arrow-right::before {
  content: '\E891';
}
.t-icon-user-arrow-up-filled::before {
  content: '\E892';
}
.t-icon-user-arrow-up::before {
  content: '\E893';
}
.t-icon-user-avatar-filled::before {
  content: '\E894';
}
.t-icon-user-avatar::before {
  content: '\E895';
}
.t-icon-user-blocked-filled::before {
  content: '\E896';
}
.t-icon-user-blocked::before {
  content: '\E897';
}
.t-icon-user-business-filled::before {
  content: '\E898';
}
.t-icon-user-business::before {
  content: '\E899';
}
.t-icon-user-checked-1-filled::before {
  content: '\E89A';
}
.t-icon-user-checked-1::before {
  content: '\E89B';
}
.t-icon-user-checked-filled::before {
  content: '\E89C';
}
.t-icon-user-checked::before {
  content: '\E89D';
}
.t-icon-user-circle-filled::before {
  content: '\E89E';
}
.t-icon-user-circle::before {
  content: '\E89F';
}
.t-icon-user-clear-filled::before {
  content: '\E8A0';
}
.t-icon-user-clear::before {
  content: '\E8A1';
}
.t-icon-user-error-1-filled::before {
  content: '\E8A2';
}
.t-icon-user-error-1::before {
  content: '\E8A3';
}
.t-icon-user-filled::before {
  content: '\E8A4';
}
.t-icon-user-invisible-filled::before {
  content: '\E8A5';
}
.t-icon-user-invisible::before {
  content: '\E8A6';
}
.t-icon-user-list-filled::before {
  content: '\E8A7';
}
.t-icon-user-list::before {
  content: '\E8A8';
}
.t-icon-user-locked-filled::before {
  content: '\E8A9';
}
.t-icon-user-locked::before {
  content: '\E8AA';
}
.t-icon-user-marked-filled::before {
  content: '\E8AB';
}
.t-icon-user-marked::before {
  content: '\E8AC';
}
.t-icon-user-password-filled::before {
  content: '\E8AD';
}
.t-icon-user-password::before {
  content: '\E8AE';
}
.t-icon-user-safety-filled::before {
  content: '\E8AF';
}
.t-icon-user-safety::before {
  content: '\E8B0';
}
.t-icon-user-search-filled::before {
  content: '\E8B1';
}
.t-icon-user-search::before {
  content: '\E8B2';
}
.t-icon-user-setting-filled::before {
  content: '\E8B3';
}
.t-icon-user-setting::before {
  content: '\E8B4';
}
.t-icon-user-talk-1-filled::before {
  content: '\E8B5';
}
.t-icon-user-talk-1::before {
  content: '\E8B6';
}
.t-icon-user-talk-filled::before {
  content: '\E8B7';
}
.t-icon-user-talk-off-1-filled::before {
  content: '\E8B8';
}
.t-icon-user-talk-off-1::before {
  content: '\E8B9';
}
.t-icon-user-talk::before {
  content: '\E8BA';
}
.t-icon-user-time-filled::before {
  content: '\E8BB';
}
.t-icon-user-time::before {
  content: '\E8BC';
}
.t-icon-user-transmit-filled::before {
  content: '\E8BD';
}
.t-icon-user-transmit::before {
  content: '\E8BE';
}
.t-icon-user-unknown-filled::before {
  content: '\E8BF';
}
.t-icon-user-unknown::before {
  content: '\E8C0';
}
.t-icon-user-unlocked-filled::before {
  content: '\E8C1';
}
.t-icon-user-unlocked::before {
  content: '\E8C2';
}
.t-icon-user-vip-filled::before {
  content: '\E8C3';
}
.t-icon-user-vip::before {
  content: '\E8C4';
}
.t-icon-user-visible-filled::before {
  content: '\E8C5';
}
.t-icon-user-visible::before {
  content: '\E8C6';
}
.t-icon-user::before {
  content: '\E8C7';
}
.t-icon-usercase-filled::before {
  content: '\E8C8';
}
.t-icon-usercase-link-filled::before {
  content: '\E8C9';
}
.t-icon-usercase-link::before {
  content: '\E8CA';
}
.t-icon-usercase::before {
  content: '\E8CB';
}
.t-icon-usergroup-add-filled::before {
  content: '\E8CC';
}
.t-icon-usergroup-add::before {
  content: '\E8CD';
}
.t-icon-usergroup-circle-filled::before {
  content: '\E8CE';
}
.t-icon-usergroup-circle::before {
  content: '\E8CF';
}
.t-icon-usergroup-clear-filled::before {
  content: '\E8D0';
}
.t-icon-usergroup-clear::before {
  content: '\E8D1';
}
.t-icon-usergroup-filled::before {
  content: '\E8D2';
}
.t-icon-usergroup::before {
  content: '\E8D3';
}
.t-icon-vehicle-filled::before {
  content: '\E8D4';
}
.t-icon-vehicle::before {
  content: '\E8D5';
}
.t-icon-verified-filled::before {
  content: '\E8D6';
}
.t-icon-verified::before {
  content: '\E8D7';
}
.t-icon-verify-filled::before {
  content: '\E8D8';
}
.t-icon-verify::before {
  content: '\E8D9';
}
.t-icon-vertical-filled::before {
  content: '\E8DA';
}
.t-icon-vertical::before {
  content: '\E8DB';
}
.t-icon-video-camera-1-filled::before {
  content: '\E8DC';
}
.t-icon-video-camera-1::before {
  content: '\E8DD';
}
.t-icon-video-camera-2-filled::before {
  content: '\E8DE';
}
.t-icon-video-camera-2::before {
  content: '\E8DF';
}
.t-icon-video-camera-dollar-filled::before {
  content: '\E8E0';
}
.t-icon-video-camera-dollar::before {
  content: '\E8E1';
}
.t-icon-video-camera-filled::before {
  content: '\E8E2';
}
.t-icon-video-camera-minus-filled::before {
  content: '\E8E3';
}
.t-icon-video-camera-minus::before {
  content: '\E8E4';
}
.t-icon-video-camera-music-filled::before {
  content: '\E8E5';
}
.t-icon-video-camera-music::before {
  content: '\E8E6';
}
.t-icon-video-camera-off-filled::before {
  content: '\E8E7';
}
.t-icon-video-camera-off::before {
  content: '\E8E8';
}
.t-icon-video-camera::before {
  content: '\E8E9';
}
.t-icon-video-filled::before {
  content: '\E8EA';
}
.t-icon-video-library-filled::before {
  content: '\E8EB';
}
.t-icon-video-library::before {
  content: '\E8EC';
}
.t-icon-video::before {
  content: '\E8ED';
}
.t-icon-view-agenda-filled::before {
  content: '\E8EE';
}
.t-icon-view-agenda::before {
  content: '\E8EF';
}
.t-icon-view-column::before {
  content: '\E8F0';
}
.t-icon-view-gantt-filled::before {
  content: '\E8F1';
}
.t-icon-view-gantt::before {
  content: '\E8F2';
}
.t-icon-view-image-filled::before {
  content: '\E8F3';
}
.t-icon-view-image::before {
  content: '\E8F4';
}
.t-icon-view-in-ar-filled::before {
  content: '\E8F5';
}
.t-icon-view-in-ar::before {
  content: '\E8F6';
}
.t-icon-view-list::before {
  content: '\E8F7';
}
.t-icon-view-module-filled::before {
  content: '\E8F8';
}
.t-icon-view-module::before {
  content: '\E8F9';
}
.t-icon-view-organization-filled::before {
  content: '\E8FA';
}
.t-icon-view-organization::before {
  content: '\E8FB';
}
.t-icon-visual-recognition-filled::before {
  content: '\E8FC';
}
.t-icon-visual-recognition::before {
  content: '\E8FD';
}
.t-icon-voice-wave::before {
  content: '\E8FE';
}
.t-icon-wallet-filled::before {
  content: '\E8FF';
}
.t-icon-wallet::before {
  content: '\E900';
}
.t-icon-watch-filled::before {
  content: '\E901';
}
.t-icon-watch::before {
  content: '\E902';
}
.t-icon-watermelon-filled::before {
  content: '\E903';
}
.t-icon-watermelon::before {
  content: '\E904';
}
.t-icon-wave-bye-filled::before {
  content: '\E905';
}
.t-icon-wave-bye::before {
  content: '\E906';
}
.t-icon-wave-left-filled::before {
  content: '\E907';
}
.t-icon-wave-left::before {
  content: '\E908';
}
.t-icon-wave-right-filled::before {
  content: '\E909';
}
.t-icon-wave-right::before {
  content: '\E90A';
}
.t-icon-wealth-1-filled::before {
  content: '\E90B';
}
.t-icon-wealth-1::before {
  content: '\E90C';
}
.t-icon-wealth-filled::before {
  content: '\E90D';
}
.t-icon-wealth::before {
  content: '\E90E';
}
.t-icon-web-filled::before {
  content: '\E90F';
}
.t-icon-web::before {
  content: '\E910';
}
.t-icon-widget-filled::before {
  content: '\E911';
}
.t-icon-widget::before {
  content: '\E912';
}
.t-icon-wifi-1-filled::before {
  content: '\E913';
}
.t-icon-wifi-1::before {
  content: '\E914';
}
.t-icon-wifi-no-filled::before {
  content: '\E915';
}
.t-icon-wifi-no::before {
  content: '\E916';
}
.t-icon-wifi-off-1-filled::before {
  content: '\E917';
}
.t-icon-wifi-off-1::before {
  content: '\E918';
}
.t-icon-wifi-off::before {
  content: '\E919';
}
.t-icon-wifi::before {
  content: '\E91A';
}
.t-icon-window-1-filled::before {
  content: '\E91B';
}
.t-icon-window-1::before {
  content: '\E91C';
}
.t-icon-window-filled::before {
  content: '\E91D';
}
.t-icon-window::before {
  content: '\E91E';
}
.t-icon-windy-rain::before {
  content: '\E91F';
}
.t-icon-windy::before {
  content: '\E920';
}
.t-icon-wink-filled::before {
  content: '\E921';
}
.t-icon-wink::before {
  content: '\E922';
}
.t-icon-work-filled::before {
  content: '\E923';
}
.t-icon-work-history-filled::before {
  content: '\E924';
}
.t-icon-work-history::before {
  content: '\E925';
}
.t-icon-work-off-filled::before {
  content: '\E926';
}
.t-icon-work-off::before {
  content: '\E927';
}
.t-icon-work::before {
  content: '\E928';
}
.t-icon-wry-smile-filled::before {
  content: '\E929';
}
.t-icon-wry-smile::before {
  content: '\E92A';
}
.t-icon-zoom-in-filled::before {
  content: '\E92B';
}
.t-icon-zoom-in::before {
  content: '\E92C';
}
.t-icon-zoom-out-filled::before {
  content: '\E92D';
}
.t-icon-zoom-out::before {
  content: '\E92E';
}
```

### index.wxss

```css

```

### index.wxss

```css
.hotspot-expanded.relative {
  position: relative;
}
.hotspot-expanded::after {
  bottom: 0;
  content: '';
  display: block;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  transform: scale(1.5);
}
```

### index.wxss

```css
.van-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.van-multi-ellipsis--l2 {
  -webkit-line-clamp: 2;
}
.van-multi-ellipsis--l2,
.van-multi-ellipsis--l3 {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
}
.van-multi-ellipsis--l3 {
  -webkit-line-clamp: 3;
}
.van-clearfix::after {
  clear: both;
  content: '';
  display: table;
}
.van-hairline,
.van-hairline--bottom,
.van-hairline--left,
.van-hairline--right,
.van-hairline--surround,
.van-hairline--top,
.van-hairline--top-bottom {
  position: relative;
}
.van-hairline--bottom::after,
.van-hairline--left::after,
.van-hairline--right::after,
.van-hairline--surround::after,
.van-hairline--top-bottom::after,
.van-hairline--top::after,
.van-hairline::after {
  border: 0 solid #ebedf0;
  bottom: -50%;
  box-sizing: border-box;
  content: ' ';
  left: -50%;
  pointer-events: none;
  position: absolute;
  right: -50%;
  top: -50%;
  transform: scale(0.5);
  transform-origin: center;
}
.van-hairline--top::after {
  border-top-width: 1px;
}
.van-hairline--left::after {
  border-left-width: 1px;
}
.van-hairline--right::after {
  border-right-width: 1px;
}
.van-hairline--bottom::after {
  border-bottom-width: 1px;
}
.van-hairline--top-bottom::after {
  border-width: 1px 0;
}
.van-hairline--surround::after {
  border-width: 1px;
}
```

### index.wxss

```css
.van-icon {
  font: normal normal normal 14px/1 var(--van-icon-font-family, 'vant-icon');
  font-size: inherit;
  position: relative;
  text-rendering: auto;
}
.van-icon,
.van-icon::before {
  display: inline-block;
}
.van-icon-contact::before {
  content: '\e753';
}
.van-icon-notes::before {
  content: '\e63c';
}
.van-icon-records::before {
  content: '\e63d';
}
.van-icon-cash-back-record::before {
  content: '\e63e';
}
.van-icon-newspaper::before {
  content: '\e63f';
}
.van-icon-discount::before {
  content: '\e640';
}
.van-icon-completed::before {
  content: '\e641';
}
.van-icon-user::before {
  content: '\e642';
}
.van-icon-description::before {
  content: '\e643';
}
.van-icon-list-switch::before {
  content: '\e6ad';
}
.van-icon-list-switching::before {
  content: '\e65a';
}
.van-icon-link-o::before {
  content: '\e751';
}
.van-icon-miniprogram-o::before {
  content: '\e752';
}
.van-icon-qq::before {
  content: '\e74e';
}
.van-icon-wechat-moments::before {
  content: '\e74f';
}
.van-icon-weibo::before {
  content: '\e750';
}
.van-icon-cash-o::before {
  content: '\e74d';
}
.van-icon-guide-o::before {
  content: '\e74c';
}
.van-icon-invitation::before {
  content: '\e6d6';
}
.van-icon-shield-o::before {
  content: '\e74b';
}
.van-icon-exchange::before {
  content: '\e6af';
}
.van-icon-eye::before {
  content: '\e6b0';
}
.van-icon-enlarge::before {
  content: '\e6b1';
}
.van-icon-expand-o::before {
  content: '\e6b2';
}
.van-icon-eye-o::before {
  content: '\e6b3';
}
.van-icon-expand::before {
  content: '\e6b4';
}
.van-icon-filter-o::before {
  content: '\e6b5';
}
.van-icon-fire::before {
  content: '\e6b6';
}
.van-icon-fail::before {
  content: '\e6b7';
}
.van-icon-failure::before {
  content: '\e6b8';
}
.van-icon-fire-o::before {
  content: '\e6b9';
}
.van-icon-flag-o::before {
  content: '\e6ba';
}
.van-icon-font::before {
  content: '\e6bb';
}
.van-icon-font-o::before {
  content: '\e6bc';
}
.van-icon-gem-o::before {
  content: '\e6bd';
}
.van-icon-flower-o::before {
  content: '\e6be';
}
.van-icon-gem::before {
  content: '\e6bf';
}
.van-icon-gift-card::before {
  content: '\e6c0';
}
.van-icon-friends::before {
  content: '\e6c1';
}
.van-icon-friends-o::before {
  content: '\e6c2';
}
.van-icon-gold-coin::before {
  content: '\e6c3';
}
.van-icon-gold-coin-o::before {
  content: '\e6c4';
}
.van-icon-good-job-o::before {
  content: '\e6c5';
}
.van-icon-gift::before {
  content: '\e6c6';
}
.van-icon-gift-o::before {
  content: '\e6c7';
}
.van-icon-gift-card-o::before {
  content: '\e6c8';
}
.van-icon-good-job::before {
  content: '\e6c9';
}
.van-icon-home-o::before {
  content: '\e6ca';
}
.van-icon-goods-collect::before {
  content: '\e6cb';
}
.van-icon-graphic::before {
  content: '\e6cc';
}
.van-icon-goods-collect-o::before {
  content: '\e6cd';
}
.van-icon-hot-o::before {
  content: '\e6ce';
}
.van-icon-info::before {
  content: '\e6cf';
}
.van-icon-hotel-o::before {
  content: '\e6d0';
}
.van-icon-info-o::before {
  content: '\e6d1';
}
.van-icon-hot-sale-o::before {
  content: '\e6d2';
}
.van-icon-hot::before {
  content: '\e6d3';
}
.van-icon-like::before {
  content: '\e6d4';
}
.van-icon-idcard::before {
  content: '\e6d5';
}
.van-icon-like-o::before {
  content: '\e6d7';
}
.van-icon-hot-sale::before {
  content: '\e6d8';
}
.van-icon-location-o::before {
  content: '\e6d9';
}
.van-icon-location::before {
  content: '\e6da';
}
.van-icon-label::before {
  content: '\e6db';
}
.van-icon-lock::before {
  content: '\e6dc';
}
.van-icon-label-o::before {
  content: '\e6dd';
}
.van-icon-map-marked::before {
  content: '\e6de';
}
.van-icon-logistics::before {
  content: '\e6df';
}
.van-icon-manager::before {
  content: '\e6e0';
}
.van-icon-more::before {
  content: '\e6e1';
}
.van-icon-live::before {
  content: '\e6e2';
}
.van-icon-manager-o::before {
  content: '\e6e3';
}
.van-icon-medal::before {
  content: '\e6e4';
}
.van-icon-more-o::before {
  content: '\e6e5';
}
.van-icon-music-o::before {
  content: '\e6e6';
}
.van-icon-music::before {
  content: '\e6e7';
}
.van-icon-new-arrival-o::before {
  content: '\e6e8';
}
.van-icon-medal-o::before {
  content: '\e6e9';
}
.van-icon-new-o::before {
  content: '\e6ea';
}
.van-icon-free-postage::before {
  content: '\e6eb';
}
.van-icon-newspaper-o::before {
  content: '\e6ec';
}
.van-icon-new-arrival::before {
  content: '\e6ed';
}
.van-icon-minus::before {
  content: '\e6ee';
}
.van-icon-orders-o::before {
  content: '\e6ef';
}
.van-icon-new::before {
  content: '\e6f0';
}
.van-icon-paid::before {
  content: '\e6f1';
}
.van-icon-notes-o::before {
  content: '\e6f2';
}
.van-icon-other-pay::before {
  content: '\e6f3';
}
.van-icon-pause-circle::before {
  content: '\e6f4';
}
.van-icon-pause::before {
  content: '\e6f5';
}
.van-icon-pause-circle-o::before {
  content: '\e6f6';
}
.van-icon-peer-pay::before {
  content: '\e6f7';
}
.van-icon-pending-payment::before {
  content: '\e6f8';
}
.van-icon-passed::before {
  content: '\e6f9';
}
.van-icon-plus::before {
  content: '\e6fa';
}
.van-icon-phone-circle-o::before {
  content: '\e6fb';
}
.van-icon-phone-o::before {
  content: '\e6fc';
}
.van-icon-printer::before {
  content: '\e6fd';
}
.van-icon-photo-fail::before {
  content: '\e6fe';
}
.van-icon-phone::before {
  content: '\e6ff';
}
.van-icon-photo-o::before {
  content: '\e700';
}
.van-icon-play-circle::before {
  content: '\e701';
}
.van-icon-play::before {
  content: '\e702';
}
.van-icon-phone-circle::before {
  content: '\e703';
}
.van-icon-point-gift-o::before {
  content: '\e704';
}
.van-icon-point-gift::before {
  content: '\e705';
}
.van-icon-play-circle-o::before {
  content: '\e706';
}
.van-icon-shrink::before {
  content: '\e707';
}
.van-icon-photo::before {
  content: '\e708';
}
.van-icon-qr::before {
  content: '\e709';
}
.van-icon-qr-invalid::before {
  content: '\e70a';
}
.van-icon-question-o::before {
  content: '\e70b';
}
.van-icon-revoke::before {
  content: '\e70c';
}
.van-icon-replay::before {
  content: '\e70d';
}
.van-icon-service::before {
  content: '\e70e';
}
.van-icon-question::before {
  content: '\e70f';
}
.van-icon-search::before {
  content: '\e710';
}
.van-icon-refund-o::before {
  content: '\e711';
}
.van-icon-service-o::before {
  content: '\e712';
}
.van-icon-scan::before {
  content: '\e713';
}
.van-icon-share::before {
  content: '\e714';
}
.van-icon-send-gift-o::before {
  content: '\e715';
}
.van-icon-share-o::before {
  content: '\e716';
}
.van-icon-setting::before {
  content: '\e717';
}
.van-icon-points::before {
  content: '\e718';
}
.van-icon-photograph::before {
  content: '\e719';
}
.van-icon-shop::before {
  content: '\e71a';
}
.van-icon-shop-o::before {
  content: '\e71b';
}
.van-icon-shop-collect-o::before {
  content: '\e71c';
}
.van-icon-shop-collect::before {
  content: '\e71d';
}
.van-icon-smile::before {
  content: '\e71e';
}
.van-icon-shopping-cart-o::before {
  content: '\e71f';
}
.van-icon-sign::before {
  content: '\e720';
}
.van-icon-sort::before {
  content: '\e721';
}
.van-icon-star-o::before {
  content: '\e722';
}
.van-icon-smile-comment-o::before {
  content: '\e723';
}
.van-icon-stop::before {
  content: '\e724';
}
.van-icon-stop-circle-o::before {
  content: '\e725';
}
.van-icon-smile-o::before {
  content: '\e726';
}
.van-icon-star::before {
  content: '\e727';
}
.van-icon-success::before {
  content: '\e728';
}
.van-icon-stop-circle::before {
  content: '\e729';
}
.van-icon-records-o::before {
  content: '\e72a';
}
.van-icon-shopping-cart::before {
  content: '\e72b';
}
.van-icon-tosend::before {
  content: '\e72c';
}
.van-icon-todo-list::before {
  content: '\e72d';
}
.van-icon-thumb-circle-o::before {
  content: '\e72e';
}
.van-icon-thumb-circle::before {
  content: '\e72f';
}
.van-icon-umbrella-circle::before {
  content: '\e730';
}
.van-icon-underway::before {
  content: '\e731';
}
.van-icon-upgrade::before {
  content: '\e732';
}
.van-icon-todo-list-o::before {
  content: '\e733';
}
.van-icon-tv-o::before {
  content: '\e734';
}
.van-icon-underway-o::before {
  content: '\e735';
}
.van-icon-user-o::before {
  content: '\e736';
}
.van-icon-vip-card-o::before {
  content: '\e737';
}
.van-icon-vip-card::before {
  content: '\e738';
}
.van-icon-send-gift::before {
  content: '\e739';
}
.van-icon-wap-home::before {
  content: '\e73a';
}
.van-icon-wap-nav::before {
  content: '\e73b';
}
.van-icon-volume-o::before {
  content: '\e73c';
}
.van-icon-video::before {
  content: '\e73d';
}
.van-icon-wap-home-o::before {
  content: '\e73e';
}
.van-icon-volume::before {
  content: '\e73f';
}
.van-icon-warning::before {
  content: '\e740';
}
.van-icon-weapp-nav::before {
  content: '\e741';
}
.van-icon-wechat-pay::before {
  content: '\e742';
}
.van-icon-warning-o::before {
  content: '\e743';
}
.van-icon-wechat::before {
  content: '\e744';
}
.van-icon-setting-o::before {
  content: '\e745';
}
.van-icon-youzan-shield::before {
  content: '\e746';
}
.van-icon-warn-o::before {
  content: '\e747';
}
.van-icon-smile-comment::before {
  content: '\e748';
}
.van-icon-user-circle-o::before {
  content: '\e749';
}
.van-icon-video-o::before {
  content: '\e74a';
}
.van-icon-add-square::before {
  content: '\e65c';
}
.van-icon-add::before {
  content: '\e65d';
}
.van-icon-arrow-down::before {
  content: '\e65e';
}
.van-icon-arrow-up::before {
  content: '\e65f';
}
.van-icon-arrow::before {
  content: '\e660';
}
.van-icon-after-sale::before {
  content: '\e661';
}
.van-icon-add-o::before {
  content: '\e662';
}
.van-icon-alipay::before {
  content: '\e663';
}
.van-icon-ascending::before {
  content: '\e664';
}
.van-icon-apps-o::before {
  content: '\e665';
}
.van-icon-aim::before {
  content: '\e666';
}
.van-icon-award::before {
  content: '\e667';
}
.van-icon-arrow-left::before {
  content: '\e668';
}
.van-icon-award-o::before {
  content: '\e669';
}
.van-icon-audio::before {
  content: '\e66a';
}
.van-icon-bag-o::before {
  content: '\e66b';
}
.van-icon-balance-list::before {
  content: '\e66c';
}
.van-icon-back-top::before {
  content: '\e66d';
}
.van-icon-bag::before {
  content: '\e66e';
}
.van-icon-balance-pay::before {
  content: '\e66f';
}
.van-icon-balance-o::before {
  content: '\e670';
}
.van-icon-bar-chart-o::before {
  content: '\e671';
}
.van-icon-bars::before {
  content: '\e672';
}
.van-icon-balance-list-o::before {
  content: '\e673';
}
.van-icon-birthday-cake-o::before {
  content: '\e674';
}
.van-icon-bookmark::before {
  content: '\e675';
}
.van-icon-bill::before {
  content: '\e676';
}
.van-icon-bell::before {
  content: '\e677';
}
.van-icon-browsing-history-o::before {
  content: '\e678';
}
.van-icon-browsing-history::before {
  content: '\e679';
}
.van-icon-bookmark-o::before {
  content: '\e67a';
}
.van-icon-bulb-o::before {
  content: '\e67b';
}
.van-icon-bullhorn-o::before {
  content: '\e67c';
}
.van-icon-bill-o::before {
  content: '\e67d';
}
.van-icon-calendar-o::before {
  content: '\e67e';
}
.van-icon-brush-o::before {
  content: '\e67f';
}
.van-icon-card::before {
  content: '\e680';
}
.van-icon-cart-o::before {
  content: '\e681';
}
.van-icon-cart-circle::before {
  content: '\e682';
}
.van-icon-cart-circle-o::before {
  content: '\e683';
}
.van-icon-cart::before {
  content: '\e684';
}
.van-icon-cash-on-deliver::before {
  content: '\e685';
}
.van-icon-cash-back-record-o::before {
  content: '\e686';
}
.van-icon-cashier-o::before {
  content: '\e687';
}
.van-icon-chart-trending-o::before {
  content: '\e688';
}
.van-icon-certificate::before {
  content: '\e689';
}
.van-icon-chat::before {
  content: '\e68a';
}
.van-icon-clear::before {
  content: '\e68b';
}
.van-icon-chat-o::before {
  content: '\e68c';
}
.van-icon-checked::before {
  content: '\e68d';
}
.van-icon-clock::before {
  content: '\e68e';
}
.van-icon-clock-o::before {
  content: '\e68f';
}
.van-icon-close::before {
  content: '\e690';
}
.van-icon-closed-eye::before {
  content: '\e691';
}
.van-icon-circle::before {
  content: '\e692';
}
.van-icon-cluster-o::before {
  content: '\e693';
}
.van-icon-column::before {
  content: '\e694';
}
.van-icon-comment-circle-o::before {
  content: '\e695';
}
.van-icon-cluster::before {
  content: '\e696';
}
.van-icon-comment::before {
  content: '\e697';
}
.van-icon-comment-o::before {
  content: '\e698';
}
.van-icon-comment-circle::before {
  content: '\e699';
}
.van-icon-completed-o::before {
  content: '\e69a';
}
.van-icon-credit-pay::before {
  content: '\e69b';
}
.van-icon-coupon::before {
  content: '\e69c';
}
.van-icon-debit-pay::before {
  content: '\e69d';
}
.van-icon-coupon-o::before {
  content: '\e69e';
}
.van-icon-contact-o::before {
  content: '\e69f';
}
.van-icon-descending::before {
  content: '\e6a0';
}
.van-icon-desktop-o::before {
  content: '\e6a1';
}
.van-icon-diamond-o::before {
  content: '\e6a2';
}
.van-icon-description-o::before {
  content: '\e6a3';
}
.van-icon-delete::before {
  content: '\e6a4';
}
.van-icon-diamond::before {
  content: '\e6a5';
}
.van-icon-delete-o::before {
  content: '\e6a6';
}
.van-icon-cross::before {
  content: '\e6a7';
}
.van-icon-edit::before {
  content: '\e6a8';
}
.van-icon-ellipsis::before {
  content: '\e6a9';
}
.van-icon-down::before {
  content: '\e6aa';
}
.van-icon-discount-o::before {
  content: '\e6ab';
}
.van-icon-ecard-pay::before {
  content: '\e6ac';
}
.van-icon-envelop-o::before {
  content: '\e6ae';
}
@font-face {
  font-display: auto;
  font-family: vant-icon;
  font-style: normal;
  font-weight: 400;
  src:
    url(//at.alicdn.com/t/c/font_2553510_kfwma2yq1rs.woff2?t=1694918397022) format('woff2'),
    url(//at.alicdn.com/t/c/font_2553510_kfwma2yq1rs.woff?t=1694918397022) format('woff');
}
:host {
  align-items: center;
  display: inline-flex;
  justify-content: center;
}
.van-icon--custom {
  position: relative;
}
.van-icon--image {
  height: 1em;
  width: 1em;
}
.van-icon__image {
  height: 100%;
  width: 100%;
}
.van-icon__info {
  z-index: 1;
}
```

### index.wxss

```css
.van-info {
  align-items: center;
  background-color: var(--info-background-color, #ee0a24);
  border: var(--info-border-width, 1px) solid #fff;
  border-radius: var(--info-size, 16px);
  box-sizing: border-box;
  color: var(--info-color, #fff);
  display: inline-flex;
  font-family: var(--info-font-family, -apple-system-font, Helvetica Neue, Arial, sans-serif);
  font-size: var(--info-font-size, 12px);
  font-weight: var(--info-font-weight, 500);
  height: var(--info-size, 16px);
  justify-content: center;
  min-width: var(--info-size, 16px);
  padding: var(--info-padding, 0 3px);
  position: absolute;
  right: 0;
  top: 0;
  transform: translate(50%, -50%);
  transform-origin: 100%;
  white-space: nowrap;
}
.van-info--dot {
  background-color: var(--info-dot-color, #ee0a24);
  border-radius: 100%;
  height: var(--info-dot-size, 8px);
  min-width: 0;
  width: var(--info-dot-size, 8px);
}
```

### index.wxss

```css
/* tokens: van-button <= src/pages/index.mpx */
.van-button {
  align-items: center;
  border-radius: var(--button-border-radius, 2px);
  box-sizing: border-box;
  display: inline-flex;
  font-size: var(--button-default-font-size, 16px);
  height: var(--button-default-height, 44px);
  justify-content: center;
  line-height: var(--button-line-height, 20px);
  padding: 0;
  position: relative;
  text-align: center;
  transition: opacity 0.2s;
  vertical-align: middle;
}
/* tokens: van-button <= src/pages/index.mpx */
.van-button::before {
  background-color: #000;
  border: inherit;
  border-color: #000;
  border-radius: inherit;
  content: ' ';
  height: 100%;
  left: 50%;
  opacity: 0;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
}
/* tokens: van-button <= src/pages/index.mpx */
.van-button::after {
  border-width: 0;
}
.van-button--active::before {
  opacity: 0.15;
}
.van-button--unclickable::after {
  display: none;
}
.van-button--default {
  background: var(--button-default-background-color, #fff);
  border: var(--button-border-width, 1px) solid var(--button-default-border-color, #ebedf0);
  color: var(--button-default-color, #323233);
}
.van-button--primary {
  background: var(--button-primary-background-color, #07c160);
  border: var(--button-border-width, 1px) solid var(--button-primary-border-color, #07c160);
  color: var(--button-primary-color, #fff);
}
.van-button--info {
  background: var(--button-info-background-color, #1989fa);
  border: var(--button-border-width, 1px) solid var(--button-info-border-color, #1989fa);
  color: var(--button-info-color, #fff);
}
.van-button--danger {
  background: var(--button-danger-background-color, #ee0a24);
  border: var(--button-border-width, 1px) solid var(--button-danger-border-color, #ee0a24);
  color: var(--button-danger-color, #fff);
}
.van-button--warning {
  background: var(--button-warning-background-color, #ff976a);
  border: var(--button-border-width, 1px) solid var(--button-warning-border-color, #ff976a);
  color: var(--button-warning-color, #fff);
}
.van-button--plain {
  background: var(--button-plain-background-color, #fff);
}
.van-button--plain.van-button--primary {
  color: var(--button-primary-background-color, #07c160);
}
.van-button--plain.van-button--info {
  color: var(--button-info-background-color, #1989fa);
}
.van-button--plain.van-button--danger {
  color: var(--button-danger-background-color, #ee0a24);
}
.van-button--plain.van-button--warning {
  color: var(--button-warning-background-color, #ff976a);
}
.van-button--large {
  height: var(--button-large-height, 50px);
  width: 100%;
}
.van-button--normal {
  font-size: var(--button-normal-font-size, 14px);
  padding: 0 15px;
}
.van-button--small {
  font-size: var(--button-small-font-size, 12px);
  height: var(--button-small-height, 30px);
  min-width: var(--button-small-min-width, 60px);
  padding: 0 var(--padding-xs, 8px);
}
.van-button--mini {
  display: inline-block;
  font-size: var(--button-mini-font-size, 10px);
  height: var(--button-mini-height, 22px);
  min-width: var(--button-mini-min-width, 50px);
}
.van-button--mini + .van-button--mini {
  margin-left: 5px;
}
.van-button--block {
  display: flex;
  width: 100%;
}
.van-button--round {
  border-radius: var(--button-round-border-radius, 999px);
}
.van-button--square {
  border-radius: 0;
}
.van-button--disabled {
  opacity: var(--button-disabled-opacity, 0.5);
}
.van-button__text {
  display: inline;
}
.van-button__icon + .van-button__text:not(:empty),
.van-button__loading-text {
  margin-left: 4px;
}
.van-button__icon {
  line-height: inherit !important;
  min-width: 1em;
  vertical-align: top;
}
.van-button--hairline {
  border-width: 0;
  padding-top: 1px;
}
.van-button--hairline::after {
  border-color: inherit;
  border-radius: calc(var(--button-border-radius, 2px) * 2);
  border-width: 1px;
}
.van-button--hairline.van-button--round::after {
  border-radius: var(--button-round-border-radius, 999px);
}
.van-button--hairline.van-button--square::after {
  border-radius: 0;
}
```

### index.wxss

```css
:host {
  font-size: 0;
  line-height: 1;
}
.van-loading {
  align-items: center;
  color: var(--loading-spinner-color, #c8c9cc);
  display: inline-flex;
  justify-content: center;
}
.van-loading__spinner {
  animation: van-rotate var(--loading-spinner-animation-duration, 0.8s) linear infinite;
  box-sizing: border-box;
  height: var(--loading-spinner-size, 30px);
  max-height: 100%;
  max-width: 100%;
  position: relative;
  width: var(--loading-spinner-size, 30px);
}
.van-loading__spinner--spinner {
  animation-timing-function: steps(12);
}
.van-loading__spinner--circular {
  border: 1px solid transparent;
  border-radius: 100%;
  border-top-color: currentcolor;
  border-top-color: initial;
}
.van-loading__text {
  color: var(--loading-text-color, #969799);
  font-size: var(--loading-text-font-size, 14px);
  line-height: var(--loading-text-line-height, 20px);
  margin-left: var(--padding-xs, 8px);
}
.van-loading__text:empty {
  display: none;
}
.van-loading--vertical {
  flex-direction: column;
}
.van-loading--vertical .van-loading__text {
  margin: var(--padding-xs, 8px) 0 0;
}
.van-loading__dot {
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}
.van-loading__dot::before {
  background-color: currentColor;
  border-radius: 40%;
  content: ' ';
  display: block;
  height: 25%;
  margin: 0 auto;
  width: 2px;
}
.van-loading__dot:first-of-type {
  opacity: 1;
  transform: rotate(30deg);
}
.van-loading__dot:nth-of-type(2) {
  opacity: 0.9375;
  transform: rotate(60deg);
}
.van-loading__dot:nth-of-type(3) {
  opacity: 0.875;
  transform: rotate(90deg);
}
.van-loading__dot:nth-of-type(4) {
  opacity: 0.8125;
  transform: rotate(120deg);
}
.van-loading__dot:nth-of-type(5) {
  opacity: 0.75;
  transform: rotate(150deg);
}
.van-loading__dot:nth-of-type(6) {
  opacity: 0.6875;
  transform: rotate(180deg);
}
.van-loading__dot:nth-of-type(7) {
  opacity: 0.625;
  transform: rotate(210deg);
}
.van-loading__dot:nth-of-type(8) {
  opacity: 0.5625;
  transform: rotate(240deg);
}
.van-loading__dot:nth-of-type(9) {
  opacity: 0.5;
  transform: rotate(270deg);
}
.van-loading__dot:nth-of-type(10) {
  opacity: 0.4375;
  transform: rotate(300deg);
}
.van-loading__dot:nth-of-type(11) {
  opacity: 0.375;
  transform: rotate(330deg);
}
.van-loading__dot:nth-of-type(12) {
  opacity: 0.3125;
  transform: rotate(1turn);
}
@keyframes van-rotate {
  0% {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(1turn);
  }
}
```

### loading.wxss

```css
.t-loading {
  display: inline-flex;
}
.t-loading,
.t-loading--fullscreen {
  align-items: center;
  justify-content: center;
}
.t-loading--fullscreen {
  background-color: var(--td-loading-full-bg-color, hsla(0, 0%, 100%, 0.6));
  display: flex;
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  vertical-align: middle;
  width: 100%;
  z-index: var(--td-loading-z-index, 3500);
}
.t-loading__spinner {
  animation: rotate 0.8s linear infinite;
  box-sizing: border-box;
  color: var(--td-loading-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  position: relative;
  width: 100%;
}
.t-loading__spinner.reverse {
  animation-name: rotateReverse;
}
.t-loading__spinner--spinner {
  animation-timing-function: steps(12);
  color: var(--td-text-color-primary, var(--td-font-gray-1, rgba(0, 0, 0, 0.9)));
}
.t-loading__spinner--spinner .t-loading__dot {
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}
.t-loading__spinner--spinner .t-loading__dot::before {
  background-color: var(--td-loading-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
  border-radius: 40%;
  content: ' ';
  display: block;
  height: 25%;
  margin: 0 auto;
  width: 5rpx;
}
.t-loading__spinner--circular .t-loading__circular {
  background: conic-gradient(from 180deg at 50% 50%, hsla(0, 0%, 100%, 0) 0deg, hsla(0, 0%, 100%, 0) 60deg, currentColor 330deg, hsla(0, 0%, 100%, 0) 1turn);
  border-radius: 100%;
  height: 100%;
  mask: radial-gradient(transparent calc(50% - 1rpx), #fff 50%);
  -webkit-mask: radial-gradient(transparent calc(50% - 1rpx), #fff 50%);
  width: 100%;
}
.t-loading__spinner--dots {
  align-items: center;
  animation: none;
  display: flex;
  justify-content: space-between;
}
.t-loading__spinner--dots .t-loading__dot {
  animation-duration: 1.8s;
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  animation-name: dotting;
  animation-timing-function: linear;
  background-color: var(--td-loading-color, var(--td-brand-color, var(--td-primary-color-7, #0052d9)));
  border-radius: 50%;
  height: 20%;
  width: 20%;
}
.t-loading__text {
  color: var(--td-loading-text-color, var(--td-text-color-primary, var(--td-font-gray-1, rgba(0, 0, 0, 0.9))));
  font: var(--td-loading-text-font, var(--td-font-body-small, 24rpx/40rpx var(--td-font-family, PingFang SC, Microsoft YaHei, Arial Regular)));
}
.t-loading__text--vertical:not(:first-child):not(:empty) {
  margin-top: 12rpx;
}
.t-loading__text--horizontal:not(:first-child):not(:empty) {
  margin-left: 16rpx;
}
.t-loading--vertical {
  flex-direction: column;
}
.t-loading--horizontal {
  flex-direction: row;
  vertical-align: top;
}
@keyframes t-bar {
  0% {
    width: 0;
  }
  50% {
    width: 70%;
  }
  to {
    width: 80%;
  }
}
@keyframes t-bar-loaded {
  0% {
    height: 6rpx;
    opacity: 1;
    width: 90%;
  }
  50% {
    height: 6rpx;
    opacity: 1;
    width: 100%;
  }
  to {
    height: 0;
    opacity: 0;
    width: 100%;
  }
}
.t-loading__dot-1 {
  opacity: 0;
  transform: rotate(30deg);
}
.t-loading__dot-2 {
  opacity: 0.08333333;
  transform: rotate(60deg);
}
.t-loading__dot-3 {
  opacity: 0.16666667;
  transform: rotate(90deg);
}
.t-loading__dot-4 {
  opacity: 0.25;
  transform: rotate(120deg);
}
.t-loading__dot-5 {
  opacity: 0.33333333;
  transform: rotate(150deg);
}
.t-loading__dot-6 {
  opacity: 0.41666667;
  transform: rotate(180deg);
}
.t-loading__dot-7 {
  opacity: 0.5;
  transform: rotate(210deg);
}
.t-loading__dot-8 {
  opacity: 0.58333333;
  transform: rotate(240deg);
}
.t-loading__dot-9 {
  opacity: 0.66666667;
  transform: rotate(270deg);
}
.t-loading__dot-10 {
  opacity: 0.75;
  transform: rotate(300deg);
}
.t-loading__dot-11 {
  opacity: 0.83333333;
  transform: rotate(330deg);
}
.t-loading__dot-12 {
  opacity: 0.91666667;
  transform: rotate(1turn);
}
@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  to {
    transform: rotate(1turn);
  }
}
@keyframes rotateReverse {
  0% {
    transform: rotate(1turn);
  }
  to {
    transform: rotate(0);
  }
}
@keyframes dotting {
  0% {
    opacity: 0.15;
  }
  1% {
    opacity: 0.8;
  }
  33% {
    opacity: 0.8;
  }
  34% {
    opacity: 0.15;
  }
  to {
    opacity: 0.15;
  }
}
```

### utilities.wxss

```css
/* tokens: h-[43rpx] <= src/pages/index.mpx */
.h-_b43rpx_B {
  height: 43rpx;
}
/* tokens: bg-[#123456] <= src/pages/index.mpx */
.bg-_b_h123456_B {
  --tw-bg-opacity: 1;
  background-color: rgba(18, 52, 86, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[#929292] <= src/pages/index.mpx */
.bg-_b_h929292_B {
  --tw-bg-opacity: 1;
  background-color: rgba(146, 146, 146, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[red] <= src/pages/index.mpx */
.bg-_bred_B {
  --tw-bg-opacity: 1;
  background-color: rgba(255, 0, 0, var(--tw-bg-opacity, 1));
}
/* tokens: bg-[url('https://xxx.com/xx.webp')] <= src/pages/index.mpx */
.bg-_burl_p_ahttps_c_f_fxxx_dcom_fxx_dwebp_a_P_B {
  background-image: url('https://xxx.com/xx.webp');
}
/* tokens: text-[#e67240] <= src/components/list.mpx */
.text-_b_he67240_B {
  --tw-text-opacity: 1;
  color: rgba(230, 114, 64, var(--tw-text-opacity, 1));
}
/* tokens: text-[blue] <= src/components/list.mpx */
.text-_bblue_B {
  --tw-text-opacity: 1;
  color: rgba(0, 0, 255, var(--tw-text-opacity, 1));
}
/* tokens: before:content-['independent_subpackage_mpx-tailwindcss-v3'] <= src/sub-independent/pages/index.mpx */
.before_ccontent-_b_aindependent_subpackage_mpx-tailwindcss-v3_a_B::before {
  --tw-content: 'independent subpackage mpx-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: before:content-['normal_subpackage_mpx-tailwindcss-v3'] <= src/sub-normal/pages/index.mpx */
.before_ccontent-_b_anormal_subpackage_mpx-tailwindcss-v3_a_B::before {
  --tw-content: 'normal subpackage mpx-tailwindcss-v3';
  content: var(--tw-content);
}
/* tokens: after:ml-0.5 <= src/pages/index.mpx */
.after_cml-0_d5::after {
  content: var(--tw-content);
  margin-left: 4rpx;
}
/* tokens: after:text-red-500 <= src/pages/index.mpx */
.after_ctext-red-500::after {
  content: var(--tw-content);
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity, 1));
}
/* tokens: after:content-["你好啊，我很无聊"] <= src/pages/index.mpx */
.after_ccontent-_b_qu_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x5f88_u_x65e0_u_x804a__q_B::after {
  --tw-content: '你好啊，我很无聊';
  content: var(--tw-content);
}
/* tokens: after:content-['你好啊，我这是中文字符串'] <= src/pages/index.mpx */
.after_ccontent-_b_au_x4f60_u_x597d_u_x554a_u_xff0c_u_x6211_u_x8fd9_u_x662f_u_x4e2d_u_x6587_u_x5b57_u_x7b26_u_x4e32__a_B::after {
  --tw-content: '你好啊，我这是中文字符串';
  content: var(--tw-content);
}
```
