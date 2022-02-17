webpack5 还是 false 时为 4 ?

swc esbuild

postcss 6,7,8 ?

整迷糊了，感觉技术很强，相比其他几个框架来说很激进

@import "./default.wxss";@import "./bundle.wxss";

default.wxss 其实就是 preflight

bundle.wxss 才是 main css chunk

selector .space-y-\[1\.6rem\] > :not([hidden]) ~ :not([hidden]) is not supported in miniapp css, so it will be deleted

selector .divide-x-\[10px\] > :not([hidden]) ~ :not([hidden]) is not supported in miniapp css, so it will be deleted

selector .divide-solid > :not([hidden]) ~ :not([hidden]) is not supported in miniapp css, so it will be deleted

selector .divide-\[\#010101\] > :not([hidden]) ~ :not([hidden]) is not supported in miniapp css, so it will be deleted

居然也去 walk rule ，然后 remove 了

build.plugin.js webpack5?

获取到版本为 compiler.webpack.version 5.65.0
