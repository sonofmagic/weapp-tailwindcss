<script setup lang="ts">
import { computed, ref } from 'wevu'

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
const freeDeliveryThreshold = ref(88)
const note = ref('')

const selectedItems = computed(() => items.value.filter(item => item.checked))
const selectedCount = computed(() => selectedItems.value.length)
const selectedQuantity = computed(() => selectedItems.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const total = computed(() => Math.max(0, subtotal.value + deliveryFee.value - discount.value))
const isAllSelected = computed(() => items.value.length > 0 && selectedCount.value === items.value.length)
const checkoutDisabled = computed(() => selectedCount.value === 0)
const noteCount = computed(() => note.value.length)
const freeDeliveryGap = computed(() => Math.max(0, freeDeliveryThreshold.value - subtotal.value))
const freeDeliveryProgress = computed(() => {
  if (subtotal.value <= 0) {
    return 0
  }
  return Math.min(100, Math.round((subtotal.value / freeDeliveryThreshold.value) * 100))
})

function toggleSelect(itemId: number) {
  items.value = items.value.map((item) => {
    if (item.id !== itemId) {
      return item
    }
    return {
      ...item,
      checked: !item.checked,
    }
  })
}

function toggleAll() {
  const next = !isAllSelected.value
  items.value = items.value.map(item => ({ ...item, checked: next }))
}

function updateQuantity(itemId: number, delta: number) {
  const target = items.value.find(item => item.id === itemId)
  if (!target) {
    return
  }

  if (target.quantity <= 1 && delta < 0) {
    wx.showToast({
      title: '至少保留 1 件',
      icon: 'none',
    })
    return
  }

  items.value = items.value.map((item) => {
    if (item.id !== itemId) {
      return item
    }
    return {
      ...item,
      quantity: Math.max(1, item.quantity + delta),
    }
  })
}

function removeItem(itemId: number, itemName: string) {
  wx.showModal({
    title: '移除商品',
    content: `确认移除「${itemName}」吗？`,
    success: ({ confirm }) => {
      if (!confirm) {
        return
      }
      items.value = items.value.filter(entry => entry.id !== itemId)
      wx.showToast({
        title: '已移除',
        icon: 'none',
      })
    },
  })
}

function applyQuickNote(value: string) {
  note.value = value
  wx.showToast({
    title: '备注已填入',
    icon: 'none',
  })
}

function checkout() {
  if (checkoutDisabled.value) {
    wx.showToast({
      title: '请先选择商品',
      icon: 'none',
    })
    return
  }
  wx.showToast({
    title: `已选 ${selectedQuantity.value} 件，合计 ¥${total.value}`,
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
  <view class="relative min-h-screen overflow-hidden bg-slate-950 px-[32rpx] pb-[220rpx] pt-[62rpx] text-white">
    <view class="pointer-events-none absolute -top-[220rpx] right-[-140rpx] h-[500rpx] w-[500rpx] rounded-full bg-sky-500/20 blur-[140rpx]"></view>
    <view class="pointer-events-none absolute bottom-[-220rpx] left-[-120rpx] h-[460rpx] w-[460rpx] rounded-full bg-emerald-500/10 blur-[130rpx]"></view>

    <view class="relative z-[1]">
      <view class="flex items-center justify-between">
        <view class="flex items-center gap-[14rpx]">
          <view class="flex h-[60rpx] w-[60rpx] items-center justify-center rounded-full border border-white/20 bg-white/10 active:scale-95" @tap="goShopping">
            <view class="i-mdi-arrow-left text-[32rpx] text-white/90"></view>
          </view>
          <view class="text-[40rpx] font-semibold tracking-wide">购物车</view>
        </view>
        <view class="rounded-full border border-white/20 bg-white/5 px-[18rpx] py-[8rpx] text-[22rpx] text-white/70">
          共 {{ items.length }} 件
        </view>
      </view>

      <view class="mt-[24rpx] rounded-[28rpx] border border-white/10 bg-white/5 p-[24rpx]">
        <view class="flex items-center justify-between">
          <view class="flex items-center">
            <view
              class="mr-[16rpx] flex h-[34rpx] w-[34rpx] items-center justify-center rounded-full border border-white/40"
              :class="isAllSelected ? 'border-emerald-300 bg-emerald-400' : 'bg-transparent'"
              @tap="toggleAll"
            >
              <view v-if="isAllSelected" class="h-[12rpx] w-[12rpx] rounded-full bg-slate-950"></view>
            </view>
            <view class="text-[26rpx] font-medium">全选</view>
          </view>
          <view class="text-[22rpx] text-white/60">已选 {{ selectedCount }} 类 · {{ selectedQuantity }} 件</view>
        </view>
      </view>

      <view class="mt-[20rpx] rounded-[24rpx] border border-sky-300/20 bg-sky-500/10 p-[22rpx]">
        <view class="flex items-center justify-between text-[22rpx] text-sky-100">
          <view>免配送门槛 ¥{{ freeDeliveryThreshold }}</view>
          <view v-if="freeDeliveryGap > 0">还差 ¥{{ freeDeliveryGap }}</view>
          <view v-else class="text-emerald-200">已免配送费</view>
        </view>
        <view class="mt-[12rpx] h-[10rpx] overflow-hidden rounded-full bg-white/15">
          <view class="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300" :style="`width: ${freeDeliveryProgress}%`"></view>
        </view>
      </view>
    </view>
    <view class="relative z-[1]">
      <view v-if="items.length === 0" class="mt-[80rpx] flex flex-col items-center rounded-[34rpx] border border-white/12 bg-white/5 py-[72rpx] text-center">
        <view class="i-mdi-cart-outline text-[86rpx] text-white/40"></view>
        <view class="mt-[18rpx] text-[32rpx] font-semibold">购物车空空如也</view>
        <view class="mt-[12rpx] text-[24rpx] text-white/60">去首页挑选一些好物吧</view>
        <button
          class="mt-[30rpx] rounded-[999rpx] bg-white px-[48rpx] py-[20rpx] text-[26rpx] font-semibold text-slate-950"
          @tap="goShopping"
        >
          返回首页
        </button>
      </view>

      <view v-else class="mt-[28rpx] space-y-[22rpx]">
        <view
          v-for="item in items"
          :key="item.id"
          class="rounded-[30rpx] border p-[22rpx] backdrop-blur-[20rpx]"
          :class="item.checked ? 'border-sky-300/45 bg-sky-500/10 shadow-[0_0_42rpx_rgba(56,189,248,0.2)]' : 'border-white/10 bg-white/5'"
        >
          <view class="flex">
            <view
              class="mr-[16rpx] mt-[8rpx] flex h-[34rpx] w-[34rpx] items-center justify-center rounded-full border border-white/40"
              :class="item.checked ? 'border-emerald-300 bg-emerald-400' : 'bg-transparent'"
              @tap="toggleSelect(item.id)"
            >
              <view v-if="item.checked" class="h-[12rpx] w-[12rpx] rounded-full bg-slate-950"></view>
            </view>
            <image class="h-[128rpx] w-[128rpx] rounded-[24rpx] object-cover" :src="item.image" mode="aspectFill"></image>
            <view class="ml-[20rpx] flex-1">
              <view class="text-[30rpx] font-semibold text-white">{{ item.name }}</view>
              <view class="mt-[8rpx] text-[22rpx] text-white/60">{{ item.desc }}</view>
              <view class="mt-[16rpx] flex items-center justify-between">
                <view class="text-[30rpx] font-semibold text-emerald-300">¥{{ item.price }}</view>
                <view class="flex items-center rounded-[999rpx] border border-white/15 bg-white/5 px-[10rpx] py-[6rpx]">
                  <button
                    class="flex h-[34rpx] w-[34rpx] items-center justify-center rounded-full bg-white/10 text-[22rpx] text-white"
                    :class="item.quantity <= 1 ? 'opacity-40' : 'active:scale-95'"
                    @tap="updateQuantity(item.id, -1)"
                  >
                    -
                  </button>
                  <view class="mx-[12rpx] min-w-[28rpx] text-center text-[24rpx]">{{ item.quantity }}</view>
                  <button
                    class="flex h-[34rpx] w-[34rpx] items-center justify-center rounded-full bg-white/10 text-[22rpx] text-white active:scale-95"
                    @tap="updateQuantity(item.id, 1)"
                  >
                    +
                  </button>
                </view>
              </view>
              <view class="mt-[12rpx] flex justify-end">
                <view class="rounded-full border border-rose-300/30 bg-rose-500/10 px-[14rpx] py-[6rpx] text-[20rpx] text-rose-100 active:scale-95" @tap="removeItem(item.id, item.name)">
                  移除
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="mt-[26rpx] rounded-[28rpx] border border-white/10 bg-white/5 p-[24rpx]">
        <view class="flex items-center justify-between">
          <view class="text-[24rpx] text-white/70">订单备注</view>
          <view class="text-[22rpx] text-white/40">{{ noteCount }}/24</view>
        </view>
        <input
          v-model="note"
          maxlength="24"
          class="mt-[14rpx] w-full rounded-[20rpx] border border-white/10 bg-transparent px-[20rpx] py-[16rpx] text-[24rpx] text-white/80"
          placeholder="例如：少糖、加冰"
          placeholder-class="text-white/30"
        />
        <view class="mt-[14rpx] flex flex-wrap gap-[10rpx] text-[20rpx] text-white/70">
          <view class="rounded-full border border-white/15 bg-white/10 px-[14rpx] py-[8rpx] active:scale-95" @tap="applyQuickNote('少糖少冰')">少糖少冰</view>
          <view class="rounded-full border border-white/15 bg-white/10 px-[14rpx] py-[8rpx] active:scale-95" @tap="applyQuickNote('打包带吸管')">打包带吸管</view>
          <view class="rounded-full border border-white/15 bg-white/10 px-[14rpx] py-[8rpx] active:scale-95" @tap="applyQuickNote('30 分钟后送达')">30 分钟后送达</view>
        </view>
      </view>
    </view>

    <view class="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-slate-900/90 px-[32rpx] pb-[48rpx] pt-[24rpx] text-white backdrop-blur-[24rpx]">
      <view class="flex items-center justify-between text-[22rpx] text-white/60">
        <view>小计 ¥{{ subtotal }}</view>
        <view>配送费 ¥{{ deliveryFee }} · 优惠 ¥{{ discount }}</view>
      </view>
      <view class="mt-[16rpx] flex items-end justify-between">
        <view>
          <view class="text-[22rpx] text-white/60">实付</view>
          <view class="mt-[6rpx] text-[40rpx] font-semibold text-white">¥{{ total }}</view>
        </view>
        <button
          class="rounded-[999rpx] px-[48rpx] py-[20rpx] text-[26rpx] font-semibold text-slate-950"
          :class="checkoutDisabled ? 'bg-white/35 text-white/70' : 'bg-emerald-400 active:scale-95'"
          @tap="checkout"
        >
          去结算
        </button>
      </view>
    </view>
  </view>
</template>
