import { useState } from "react";
import { Text, View } from "@tarojs/components";
import { clsx } from "clsx";
import "./index.scss";

const capabilities = [
  ["极速原子", "Tailwind class 直接写进 Taro 组件。", "border-sky-200/70 bg-sky-50/80 text-sky-700"],
  ["动态 class", "clsx + state 仍然能被稳定转换。", "border-violet-200/70 bg-violet-50/80 text-violet-700"],
  ["小程序兼容", "hover-class、伪元素和 @apply 都保留。", "border-emerald-200/70 bg-emerald-50/80 text-emerald-700"],
];

const Index = () => {
  const [flag, setFlag] = useState(true);
  const className = clsx(
    flag ? "bg-[#123456]" : "bg-[#654321]",
    "text-white",
    "after:content-['点击切换动态_className']",
    "after:block after:text-center after:text-[24rpx]",
    "flex h-[88rpx] items-center justify-center rounded-[24rpx] px-[28rpx] py-[16rpx] shadow-lg"
  );

  return (
    <View className="min-h-screen bg-[radial-gradient(circle_at_18%_20%,#e0f2fe,#fdf4ff_70%)] px-[32rpx] py-[40rpx] text-slate-800">
      <View className="rounded-[32rpx] border border-slate-100/70 bg-white/90 p-[40rpx] shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <View className="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">
          Taro React · Tailwind CSS 3
        </View>
        <View className="mt-[16rpx] text-[52rpx] font-semibold leading-[1.12] text-slate-900">
          React 小程序原子设计模板
        </View>
        <View className="mt-[20rpx] text-[28rpx] leading-relaxed text-slate-500">
          一份页面同时覆盖任意值、伪元素、hover-class 和运行时拼类，适合直接作为业务首页的 Tailwind 写法参考。
        </View>

        <View className="mt-[32rpx] flex flex-col gap-[16rpx]">
          {capabilities.map(([title, detail, tone]) => (
            <View key={title} className={clsx("rounded-[24rpx] border px-[24rpx] py-[20rpx]", tone)}>
              <Text className="text-[28rpx] font-semibold">{title}</Text>
              <Text className="mt-[8rpx] block text-[24rpx] opacity-80">{detail}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-[24rpx] rounded-[32rpx] border border-slate-100/70 bg-white/85 p-[32rpx] shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
        <View className="text-[24rpx] uppercase tracking-[6rpx] text-slate-400">即时体验</View>
        <View className="mt-[16rpx] text-[36rpx] font-semibold text-slate-900">交互态与宏样式</View>
        <View
          className="mt-[24rpx] flex h-[128rpx] items-center justify-center rounded-[24rpx] border border-dashed border-slate-200 bg-slate-50/80 px-[24rpx] text-center text-[24rpx] text-slate-500 after:text-[24rpx] after:content-['hover_here_have_a_try']"
          hoverClass="bg-sky-500 text-white"
        />
        <View
          className={clsx("mt-[20rpx]", className)}
          onClick={() => {
            setFlag(!flag);
          }}
        />
        <View className="test mt-[20rpx]"></View>
      </View>
    </View>
  );
};

export default Index;
