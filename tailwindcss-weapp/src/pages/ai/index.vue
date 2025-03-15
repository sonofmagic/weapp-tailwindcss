<script setup>
// No data needed for images since we're using CSS styling
</script>

<template>
  <view class="flex min-h-screen flex-col bg-gray-100">
    <!-- Header -->
    <view class="flex items-center bg-white px-4 py-2">
      <view class="flex flex-1 items-center rounded-full bg-gray-100 px-4 py-1.5">
        <view class="mr-2 text-gray-400">
          <text class="i-icon">
            &#128269;
          </text>
        </view>
        <input
          type="text"
          placeholder="K 歌之王(粤) 陈奕迅"
          class="flex-1 bg-transparent text-sm"
        >
      </view>
      <view class="ml-3 text-gray-600">
        <text class="i-icon">
          &#127908;
        </text>
      </view>
    </view>

    <!-- Night Banner -->
    <view class="px-4 pt-3">
      <text class="mb-2 text-xl font-bold">
        夜深了
      </text>
    </view>

    <!-- VIP Banner -->
    <view class="px-4 py-2">
      <view class="flex items-center justify-between rounded-lg bg-gradient-to-r from-amber-700 to-amber-500 p-3 text-white">
        <view class="flex items-center">
          <text class="mr-1 text-yellow-300">
            &#9733;
          </text>
          <text class="text-sm">
            VIP 会员中心打卡
          </text>
        </view>
        <text class="text-xs text-white">
          领最取SVIP &gt;
        </text>
      </view>
    </view>

    <!-- Featured Cards -->
    <scroll-view scroll-x class="whitespace-nowrap px-4 py-2">
      <!-- Daily Recommendation Card -->
      <view class="relative mr-3 inline-block w-32">
        <view class="flex h-40 w-full flex-col justify-end rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 p-2">
          <view class="absolute left-2 top-2 rounded bg-pink-400 px-2 py-1 text-xs text-white">
            <text>每日推荐</text>
          </view>
          <view class="absolute bottom-10 left-4 size-12 rounded-md bg-yellow-400" />
          <text class="mt-2 text-xs text-white">
            符合你口味的新鲜好歌
          </text>
        </view>
      </view>

      <!-- Heart Mode Card -->
      <view class="relative mr-3 inline-block w-32">
        <view class="flex h-40 w-full flex-col justify-end rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 p-2">
          <view class="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-xs text-yellow-600">
            <text>&#10084; 心动模式</text>
          </view>
          <view class="absolute inset-0 flex items-center justify-center">
            <text class="font-bold text-gray-800">
              Somebody is Watchin' Me
            </text>
          </view>
          <text class="mt-2 text-xs text-white">
            红心歌曲和相似推荐
          </text>
        </view>
      </view>

      <!-- Playlist Card -->
      <view class="relative mr-3 inline-block w-32">
        <view class="flex h-40 w-full flex-col justify-end rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 p-2">
          <text class="mt-2 text-xs text-white">
            歌单推荐
          </text>
        </view>
      </view>
    </scroll-view>

    <!-- Recommended Songs -->
    <view class="p-4">
      <text class="mb-3 text-lg font-bold">
        根据你喜爱的歌曲推荐
      </text>

      <!-- Wildest Dreams -->
      <view class="mb-4 flex items-center">
        <view class="flex size-12 items-center justify-center rounded bg-gradient-to-br from-purple-200 to-pink-200">
          <text class="text-xs">
            1989
          </text>
        </view>
        <view class="ml-3 flex-1">
          <text class="font-medium">
            Wildest Dreams
          </text>
          <view class="mt-1 flex items-center">
            <text class="mr-1 text-xs text-red-500">
              VIP
            </text>
            <text class="text-xs text-gray-500">
              Taylor Swift
            </text>
          </view>
        </view>
        <view class="text-gray-400">
          &#9654;
        </view>
      </view>

      <!-- Duvet -->
      <view class="mb-4 flex items-center">
        <view class="flex size-12 items-center justify-center rounded bg-gradient-to-br from-red-400 to-blue-400">
          <text class="text-xs text-white">
            SQ
          </text>
        </view>
        <view class="ml-3 flex-1">
          <text class="font-medium">
            Duvet
          </text>
          <view class="mt-1 flex items-center">
            <text class="mr-1 text-xs text-orange-500">
              SQ
            </text>
            <text class="text-xs text-gray-500">
              Bôa
            </text>
          </view>
        </view>
        <view class="text-gray-400">
          &#9654;
        </view>
      </view>

      <!-- Teeth -->
      <view class="mb-4 flex items-center">
        <view class="flex size-12 items-center justify-center rounded bg-gradient-to-br from-gray-700 to-gray-900">
          <text class="text-xs text-white">
            5SOS
          </text>
        </view>
        <view class="ml-3 flex-1">
          <text class="font-medium">
            Teeth
          </text>
          <view class="mt-1 flex items-center">
            <text class="mr-1 text-xs text-red-500">
              VIP
            </text>
            <text class="text-xs text-gray-500">
              5 Seconds of Summer
            </text>
          </view>
        </view>
        <view class="text-gray-400">
          &#9654;
        </view>
      </view>
    </view>

    <!-- R&B Promotion -->
    <view class="px-4 py-2">
      <text class="mb-3 text-lg font-bold">
        分享RnB单曲赢好礼
      </text>
      <view class="flex justify-between rounded-lg bg-gradient-to-r from-blue-900 to-blue-800 p-4 text-white">
        <view class="flex flex-col">
          <text class="mb-2 text-xl font-bold">
            我的音乐血型
          </text>
          <text class="mb-4 text-xl font-bold text-blue-400">
            是(R&B)型
          </text>
          <text class="mb-4 block text-sm opacity-80">
            发图文笔记，抽惊喜好礼
          </text>
          <view class="w-24 rounded-full bg-blue-500 px-4 py-1.5 text-center text-sm">
            立即参加
          </view>
        </view>
        <view class="flex w-1/3 items-center justify-center">
          <view class="relative size-24 rounded-lg bg-blue-700">
            <view class="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-blue-300 px-2 py-1 text-xs text-blue-900">
              SOTO
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Recently Played Artists -->
    <view class="p-4">
      <text class="mb-3 text-lg font-bold">
        听过的那艺娜 为你推荐
      </text>

      <!-- Artist 1 -->
      <view class="mb-4 flex items-center">
        <view class="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700">
          <text class="text-xs text-white">
            坚强
          </text>
        </view>
        <view class="ml-3 flex-1">
          <text class="font-medium">
            坚强笑女人
          </text>
          <text class="text-xs text-red-500">
            超47%人收藏 那艺娜
          </text>
        </view>
        <view class="text-gray-400">
          &#9654;
        </view>
      </view>

      <!-- Artist 2 -->
      <view class="mb-4 flex items-center">
        <view class="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500">
          <text class="text-xs text-white">
            汐
          </text>
        </view>
        <view class="ml-3 flex-1">
          <text class="font-medium">
            汐学
          </text>
          <text class="text-xs text-gray-500">
            超70%人推荐 银河系长
          </text>
        </view>
        <view class="text-gray-400">
          &#9654;
        </view>
      </view>

      <!-- Artist 3 -->
      <view class="mb-4 flex items-center">
        <view class="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-800 to-black">
          <text class="text-xs text-white">
            5:20
          </text>
        </view>
        <view class="ml-3 flex-1">
          <text class="font-medium">
            5:20AM
          </text>
          <text class="text-xs text-orange-500">
            Hi-Res 刀郎
          </text>
        </view>
        <view class="text-gray-400">
          &#9654;
        </view>
      </view>
    </view>

    <!-- Recently Played -->
    <view class="p-4">
      <text class="mb-3 text-lg font-bold">
        最近常听
      </text>
      <scroll-view scroll-x class="whitespace-nowrap">
        <view v-for="i in 5" :key="i" class="mr-3 inline-block w-20">
          <view class="size-20 rounded-lg" :class="`bg-${['red', 'yellow', 'orange', 'green', 'blue'][i - 1]}-${i % 2 ? '400' : '500'}`" />
          <text class="mt-1 truncate text-xs">
            歌单{{ i }}
          </text>
        </view>
      </scroll-view>
    </view>

    <!-- Bottom Player -->
    <view class="mt-auto flex items-center border-t bg-white px-4 py-2">
      <view class="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-red-300 to-red-500">
        <text class="text-xs text-white">
          TS
        </text>
      </view>
      <view class="ml-3 flex-1">
        <text class="font-medium">
          Anti-Hero
        </text>
        <text class="text-xs text-gray-500">
          Taylor Swift
        </text>
      </view>
      <view class="flex items-center">
        <text class="mr-4">
          &#9654;
        </text>
        <text>&#9776;</text>
      </view>
    </view>

    <!-- Navigation Bar -->
    <view class="flex justify-around border-t bg-white py-2">
      <view class="flex flex-col items-center">
        <text class="text-red-500">
          &#9835;
        </text>
        <text class="mt-1 text-xs text-red-500">
          推荐
        </text>
      </view>
      <view class="flex flex-col items-center">
        <text class="text-gray-400">
          &#128269;
        </text>
        <text class="mt-1 text-xs text-gray-400">
          发现
        </text>
      </view>
      <view class="flex flex-col items-center">
        <text class="text-gray-400">
          &#127918;
        </text>
        <text class="mt-1 text-xs text-gray-400">
          游戏
        </text>
      </view>
      <view class="flex flex-col items-center">
        <text class="text-gray-400">
          &#128196;
        </text>
        <text class="mt-1 text-xs text-gray-400">
          笔记
        </text>
      </view>
      <view class="flex flex-col items-center">
        <text class="text-gray-400">
          &#128100;
        </text>
        <text class="mt-1 text-xs text-gray-400">
          我的
        </text>
      </view>
    </view>
  </view>
</template>

<style>
/* Add any custom styles here */
.i-icon {
  font-style: normal;
}
</style>
