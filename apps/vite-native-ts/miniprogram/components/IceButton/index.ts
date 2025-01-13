import { cn } from '@weapp-tailwindcss/merge'

Component({
  // options: {
  //   virtualHost: true,
  // },
  properties: {
    class: {
      type: String,
      value: '',
    },
    myClass: {
      type: String,
      value: '',
    },
  },
  data: {
    customClass: 'weapp-reset-button px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80',
  },
  observers: {
    myClass(val) {
      this.setData({
        customClass: cn(this.data.customClass, val),
      })
    },
  },
  lifetimes: {
    ready() {
      console.log(this.properties)
    },
  },
  // externalClasses: ['class'],
})
