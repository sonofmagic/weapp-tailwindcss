<script setup lang="ts">
import { ref } from 'wevu'

type CartItem = {
  id: number
  name: string
  desc: string
  price: number
  quantity: number
  checked: boolean
  image: string
}

const items = ref<CartItem[]>([
  {
    id: 1,
    name: '星云柚子冷萃',
    desc: '清爽柚子 + 冰萃拼配',
    price: 24,
    quantity: 1,
    checked: true,
    image: 'https://mmbiz.qpic.cn/mmbiz/vi_32/Q0j4TwGTfTJLTpJ5dD6Y3vR0pu2Lx5D3w1lUwLrZ7NCyKz1q8I4xA86c1k3apwFVB9C7bPBCn2iYg4JibL0z0icA/0',
  },
  {
    id: 2,
    name: '暮光可可泡芙',
    desc: '松软泡芙 · 低糖可可',
    price: 18,
    quantity: 2,
    checked: true,
    image: 'https://mmbiz.qpic.cn/mmbiz/vi_32/Q0j4TwGTfTJLTpJ5dD6Y3vR0pu2Lx5D3w1lUwLrZ7NCyKz1q8I4xA86c1k3apwFVB9C7bPBCn2iYg4JibL0z0icA/0',
  },
  {
    id: 3,
    name: '流光莓果冻',
    desc: '莓果爆浆 · 轻甜清爽',
    price: 12,
    quantity: 1,
    checked: false,
    image: 'https://mmbiz.qpic.cn/mmbiz/vi_32/Q0j4TwGTfTJLTpJ5dD6Y3vR0pu2Lx5D3w1lUwLrZ7NCyKz1q8I4xA86c1k3apwFVB9C7bPBCn2iYg4JibL0z0icA/0',
  },
])

const deliveryFee = ref(6)
const discount = ref(12)
const note = ref('')

function getSelectedCount() {
  return items.value.filter(item => item.checked).length
}

function getSubtotal() {
  return items.value
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function getTotal() {
  return Math.max(0, getSubtotal() + deliveryFee.value - discount.value)
}

function toggleSelect(item: CartItem) {
  item.checked = !item.checked
}

function toggleAll() {
  const next = !items.value.every(item => item.checked)
  items.value = items.value.map(item => ({ ...item, checked: next }))
}

function updateQuantity(item: CartItem, delta: number) {
  item.quantity = Math.max(1, item.quantity + delta)
}

function removeItem(item: CartItem) {
  items.value = items.value.filter(entry => entry.id !== item.id)
}

function checkout() {
  wx.showToast({
    title: '结算功能即将上线',
    icon: 'none',
  })
}

function goShopping() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    wx.navigateBack({ delta: 1 })
  }
  else {
    wx.reLaunch({ url: '/pages/index/index' })
  }
}
</script>

<template>
  <view class="min-h-screen bg-slate-950 px-[32rpx] pt-[72rpx] pb-[200rpx] text-white">
    <view class="flex items-end justify-between">
      <view class="text-[40rpx] font-semibold tracking-wide">购物车</view>
      <view class="text-[22rpx] text-white/60">共 {{ items.length }} 件</view>
    </view>

    <view class="mt-[28rpx] rounded-[28rpx] border border-white/10 bg-white/5 p-[24rpx]">
      <view class="flex items-center justify-between">
        <view class="flex items-center">
          <view
            class="mr-[16rpx] flex h-[32rpx] w-[32rpx] items-center justify-center rounded-full border border-white/40"
            :class="items.length && items.every(item => item.checked) ? 'border-emerald-300 bg-emerald-400' : 'bg-transparent'"
            @tap="toggleAll"
          >
            <view v-if="items.length && items.every(item => item.checked)" class="h-[12rpx] w-[12rpx] rounded-full bg-slate-950"></view>
          </view>
          <view class="text-[26rpx] font-medium">全选</view>
        </view>
        <view class="text-[22rpx] text-white/60">已选 {{ getSelectedCount() }} 件</view>
      </view>
    </view>

    <view v-if="items.length === 0" class="mt-[80rpx] flex flex-col items-center text-center">
      <view class="text-[32rpx] font-semibold">购物车空空如也</view>
      <view class="mt-[12rpx] text-[24rpx] text-white/60">去首页挑选一些好物吧</view>
      <button
        class="mt-[32rpx] rounded-[999rpx] bg-white px-[48rpx] py-[20rpx] text-[26rpx] font-semibold text-slate-950"
        @tap="goShopping"
      >
        返回首页
      </button>
    </view>

    <view v-else class="mt-[32rpx] space-y-[24rpx]">
      <view
        v-for="item in items"
        :key="item.id"
        class="rounded-[32rpx] border border-white/10 bg-white/5 p-[24rpx] backdrop-blur-[20rpx]"
      >
        <view class="flex">
          <view
            class="mr-[18rpx] mt-[8rpx] flex h-[32rpx] w-[32rpx] items-center justify-center rounded-full border border-white/40"
            :class="item.checked ? 'border-emerald-300 bg-emerald-400' : 'bg-transparent'"
            @tap="toggleSelect(item)"
          >
            <view v-if="item.checked" class="h-[12rpx] w-[12rpx] rounded-full bg-slate-950"></view>
          </view>
          <image class="h-[128rpx] w-[128rpx] rounded-[24rpx] object-cover" :src="item.image" mode="aspectFill"></image>
          <view class="ml-[20rpx] flex-1">
            <view class="text-[30rpx] font-semibold text-white">{{ item.name }}</view>
            <view class="mt-[8rpx] text-[22rpx] text-white/60">{{ item.desc }}</view>
            <view class="mt-[18rpx] flex items-center justify-between">
              <view class="text-[28rpx] font-semibold text-emerald-300">¥{{ item.price }}</view>
              <view class="flex items-center rounded-[999rpx] border border-white/15 bg-white/5 px-[10rpx] py-[6rpx]">
                <button
                  class="flex h-[32rpx] w-[32rpx] items-center justify-center rounded-full bg-white/10 text-[22rpx] text-white"
                  :disabled="item.quantity <= 1"
                  @tap="updateQuantity(item, -1)"
                >
                  -
                </button>
                <view class="mx-[12rpx] text-[24rpx]">{{ item.quantity }}</view>
                <button
                  class="flex h-[32rpx] w-[32rpx] items-center justify-center rounded-full bg-white/10 text-[22rpx] text-white"
                  @tap="updateQuantity(item, 1)"
                >
                  +
                </button>
              </view>
            </view>
            <view class="mt-[12rpx] flex justify-end">
              <view class="text-[22rpx] text-white/40" @tap="removeItem(item)">移除</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="mt-[32rpx] rounded-[28rpx] border border-white/10 bg-white/5 p-[24rpx]">
      <view class="text-[24rpx] text-white/70">订单备注</view>
      <input
        v-model="note"
        class="mt-[16rpx] w-full rounded-[20rpx] border border-white/10 bg-transparent px-[20rpx] py-[16rpx] text-[24rpx] text-white/80"
        placeholder="例如：少糖、加冰"
        placeholder-class="text-white/30"
      />
    </view>
  </view>

  <view class="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-slate-900/90 px-[32rpx] pb-[48rpx] pt-[24rpx] text-white backdrop-blur-[24rpx]">
    <view class="flex items-center justify-between text-[22rpx] text-white/60">
      <view>配送费 ¥{{ deliveryFee }}</view>
      <view>优惠 ¥{{ discount }}</view>
    </view>
    <view class="mt-[16rpx] flex items-end justify-between">
      <view>
        <view class="text-[22rpx] text-white/60">合计</view>
        <view class="mt-[6rpx] text-[40rpx] font-semibold text-white">¥{{ getTotal() }}</view>
      </view>
      <button
        class="rounded-[999rpx] bg-emerald-400 px-[48rpx] py-[20rpx] text-[26rpx] font-semibold text-slate-950"
        @tap="checkout"
      >
        去结算
      </button>
    </view>
  </view>
</template>
