import { twMerge } from '@weapp-tailwindcss/merge'

const textColor = 'text-[#0000ff]'

const defaultClass = `weapp-reset-button ${textColor} px-6 py-2 font-medium tracking-wide capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80`

Component({
  options: {
    virtualHost: true,
    styleIsolation: 'apply-shared',
  },
  externalClasses: ['class'],
  properties: {
    class: {
      type: String,
      value: '',
    },
    twClass: {
      type: String,
      value: '',
    },
    hoverClass: {
      type: String,
      value: '',
    },
    twHoverClass: {
      type: String,
      value: '',
    },
    style: {
      type: String,
      value: '',
    },
  },
  data: {
    mergedClass: defaultClass,
  },
  observers: {
    twClass(val) {
      this.setData({
        mergedClass: twMerge(defaultClass, val),
      })
    },
  },
  lifetimes: {
    ready() {
      console.log(this.properties.mergedClass)
      console.log(this.data.mergedClass)
    },
  },
  // externalClasses: ['class'],
})
