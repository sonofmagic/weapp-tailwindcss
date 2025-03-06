import { twMerge } from '@weapp-tailwindcss/merge'
import { cva } from '@weapp-tailwindcss/merge/cva'

const button = cva(['font-semibold', 'border', 'rounded'], {
  variants: {
    intent: {
      primary: ['bg-blue-500', 'text-white', 'border-transparent'],
      // **or**
      // primary: "bg-blue-500 text-white border-transparent hover:bg-blue-600",
      secondary: ['bg-white', 'text-gray-800', 'border-gray-400'],
    },
    size: {
      small: ['text-sm', 'py-1', 'px-2'],
      medium: ['text-base', 'py-2', 'px-4'],
    },
    // `boolean` variants are also supported!
    disabled: {
      false: null,
      true: ['opacity-50', 'cursor-not-allowed'],
    },
  },
  compoundVariants: [
    {
      intent: 'primary',
      disabled: false,
      class: 'hover:bg-blue-600',
    },
    {
      intent: 'secondary',
      disabled: false,
      class: 'hover:bg-gray-100',
    },
    {
      intent: 'primary',
      size: 'medium',
      // **or** if you're a React.js user, `className` may feel more consistent:
      // className: "uppercase"
      class: 'uppercase',
    },
  ],
  defaultVariants: {
    intent: 'primary',
    size: 'medium',
    disabled: false,
  },
})

button()

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
