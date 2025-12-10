# benchmark

<https://www.npmjs.com/package/speed-measure-webpack-plugin>

但是这个插件已经很久没有维护了，无法兼容 `webpack`

尝试了一些代替方案:

- <https://github.com/ShuiRuTian/time-analytics-webpack-plugin>
- <https://www.npmjs.com/package/speed-measure-webpack-v5-plugin>

都不行。

## 项目注册

benchmark 需要知道哪些 demo 和 apps 属于采集范围。现在可以通过同步脚本自动生成注册清单：

```bash
pnpm --filter benchmark sync:projects
```

- 会扫描 `demo/*` 与 `apps/*` 目录并分析 `package.json`，生成 `benchmark/app/src/projects.generated.json`。
- 文件中记录了 `benchmarkKey`、包名、构建脚本等信息，前端和离线采集脚本可以共享这些元数据。
- 新增 demo/app 只需补全 `package.json` 并重新运行同步脚本即可完成注册。

## 数据结构

- 采集脚本仍然将每日运行结果写入 `benchmark/app/data/YYYY-MM-DD.json`。
- 每个 key 对应一个 `benchmarkKey`，内部可以包含 `build`、`babel` 等不同的指标数组，前端会优先使用 `build`，若不存在则回退到旧字段。
- 注册信息和采样数据结合后，可以展示所有 demo/app 的历史趋势，并显示哪些项目暂未产生有效样本。

## 前端展示

- 首页新增“30 天滚动窗口”图表，可直观比较最近一个窗口与上一窗口的平均构建耗时，并突出 Top 变化项目。
- 统计表会展示每个项目在窗口内的平均值、变化量、变化率以及样本数量，便于排查性能波动。
- 页首会显示当前已登记的 demo/app 数量及未登记但存在历史数据的条目数，确保 benchmark 覆盖范围透明。

## Tips

本插件提供了一些 `hook` 比如 `onLoad`,`onStart`,`onEnd`,`onUpdate` 啥的, 其中 `onStart`,`onEnd` 可以用来计算本插件转义的时间。

## References

<https://webpack.js.org/guides/build-performance/>
