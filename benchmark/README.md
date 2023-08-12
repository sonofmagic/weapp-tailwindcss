# benchmark

<https://www.npmjs.com/package/speed-measure-webpack-plugin>

但是这个插件已经很久没有维护了，无法兼容 `webpack`

尝试了一些代替方案:

- <https://github.com/ShuiRuTian/time-analytics-webpack-plugin>
- <https://www.npmjs.com/package/speed-measure-webpack-v5-plugin>

都不行。

## Tips

本插件提供了一些 `hook` 比如 `onLoad`,`onStart`,`onEnd`,`onUpdate` 啥的, 其中 `onStart`,`onEnd` 可以用来计算本插件转义的时间。

## References

<https://webpack.js.org/guides/build-performance/>
