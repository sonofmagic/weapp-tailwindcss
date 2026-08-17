# Lynx 原生报告

这里的 `ios.json` 与 `android.json` 只能由 Lynx Engine `4.0.1` 的真实原生 e2e 产出。报告必须记录实际设备名、型号、系统版本/build、runtime、Android API、ABI、视口和像素比；本地模拟器与 CI 允许使用不同系统版本，case 结论变化仍需显式审查。

原生命令先把报告写入 `e2e/.artifacts/lynx-native/`，并把 probe/control 的 PNG 裁剪写入 `crops/`。审查截图、裁剪、运行时错误和逐 case checkpoint 后，将两份报告作为 `LYNX_IOS_REPORT`、`LYNX_ANDROID_REPORT` 传给 `pnpm e2e:lynx:update`。更新器会拒绝单端报告、过期 catalog、版本不一致、重复 ID、缺失 case、`not-tested` 或无 checkpoint 的结果。

几何 case 必须同时有 probe 与 control 的尺寸测量；像素 case 必须有两个局部截图；动画/transition 必须有时间序列 checkpoint。需要真实输入注入的 `active`、`hover`、`pointer-events` case 在 host 尚未注入时保持 `not-tested`，不能手工改成不支持或支持。

禁止根据 `@lynx-js/css-defines` 或静态 encoder 结果手工填写这里的报告。
