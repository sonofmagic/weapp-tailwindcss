# H5 端原生 toast 样式偏移问题

在使用 `tailwindcss` 的时候，编译到 `h5` 平台，使用 `uni.toast` / `taro.toast` 时，出现下列的效果

![](./toast-svg-bug.jpg)

`tailwindcss` 的 `base` 中的 `preflight` 影响这个 `uni.toast` 的样式

这是由于 `preflight.css` 中默认会添加下方的样式

```css
img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block; /* 1 */
  vertical-align: middle; /* 2 */
}
```

这导致了 `svg` 变成了 `display: block;` 的状态

解决方案也非常的简单, 在 `app.wxss` 使用样式进行覆盖:

```scss
.uni-toast{
  svg {
    display: initial; // 重新初始化 uni-toast 里的样式进行覆盖 覆盖
  }
}
```

假如你使用的是 `uni-app`，那么还可以使用样式条件编译的方式来做:

```scss
/*  #ifdef  H5  */
svg {
  display: initial;
}
/*  #endif  */
```
