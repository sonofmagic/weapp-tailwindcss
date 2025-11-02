import { create as createRuntime, twMerge } from '@weapp-tailwindcss/merge'
import { cva } from '@weapp-tailwindcss/merge/cva'
import { tv } from '@weapp-tailwindcss/merge/variants'
import { twMerge as twMergeV3 } from '@weapp-tailwindcss/merge/v3'
import { twMerge as twMergeV4 } from '@weapp-tailwindcss/merge/v4'

const defaultMerge = twMerge
const { twMerge: mergeWithoutEscape } = createRuntime({ escape: false })
const { twMerge: mergeWithoutUnescape } = createRuntime({ unescape: false })
const { twMerge: mergePassthrough } = createRuntime({ escape: false, unescape: false })

const basePreviewItems = ['A', 'B', 'C']

const versionComparison = [
  {
    label: 'twMerge v3 (Tailwind CSS v3)',
    code: "twMergeV3('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')",
    result: twMergeV3('p-1 p-2 p-0.5 text-[34px] text-[#ececec]'),
  },
  {
    label: 'twMerge v4 (Tailwind CSS v4)',
    code: "twMergeV4('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')",
    result: twMergeV4('p-1 p-2 p-0.5 text-[34px] text-[#ececec]'),
  },
  {
    label: '默认入口 (自动选择)',
    code: "twMerge('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')",
    result: defaultMerge('p-1 p-2 p-0.5 text-[34px] text-[#ececec]'),
  },
]

const mergingExamples = [
  {
    title: '最后的冲突类胜出',
    description: '后声明的冲突类会覆盖之前的值，包括支持 rpx 的任意值。',
    samples: [
      {
        label: '基础冲突',
        code: "twMerge('p-5 p-2 p-4')",
        result: defaultMerge('p-5 p-2 p-4'),
      },
      {
        label: '小程序 rpx',
        code: "twMerge('w-[10rpx]', 'w-[24rpx]')",
        result: defaultMerge('w-[10rpx]', 'w-[24rpx]'),
      },
    ],
  },
  {
    title: '允许细分',
    description: '轴向或方向性的类可以共存，不会互相覆盖。',
    samples: [
      {
        label: 'Padding 细分',
        code: "twMerge('p-3 px-5')",
        result: defaultMerge('p-3 px-5'),
      },
      {
        label: '定位细分',
        code: "twMerge('inset-x-4 right-4')",
        result: defaultMerge('inset-x-4 right-4'),
      },
      {
        label: '自定义 rpx',
        code: "twMerge('p-[12rpx]', 'px-5')",
        result: defaultMerge('p-[12rpx]', 'px-5'),
      },
    ],
  },
  {
    title: '解决复杂冲突',
    description: '针对 inset 等组合类会自动识别更具体的取值。',
    samples: [
      {
        label: '复杂 inset',
        code: "twMerge('inset-x-px -inset-1')",
        result: defaultMerge('inset-x-px -inset-1'),
      },
      {
        label: '与 auto 组合',
        code: "twMerge('bottom-auto inset-y-6')",
        result: defaultMerge('bottom-auto inset-y-6'),
      },
      {
        label: '任意值冲突',
        code: "twMerge('inset-x-[12rpx]', '-inset-[1rpx]')",
        result: defaultMerge('inset-x-[12rpx]', '-inset-[1rpx]'),
      },
    ],
  },
  {
    title: '支持多重修饰符',
    description: '标准修饰符和堆叠修饰符都会被正确识别。',
    samples: [
      {
        label: 'Hover 保持',
        code: "twMerge('p-2 hover:p-4')",
        result: defaultMerge('p-2 hover:p-4'),
      },
      {
        label: 'Hover 覆盖',
        code: "twMerge('hover:p-2 hover:p-4')",
        result: defaultMerge('hover:p-2 hover:p-4'),
      },
      {
        label: '堆叠修饰符',
        code: "twMerge('hover:focus:w-[12rpx]', 'focus:hover:w-[16rpx]')",
        result: defaultMerge('hover:focus:w-[12rpx]', 'focus:hover:w-[16rpx]'),
      },
    ],
  },
  {
    title: '支持任意值',
    description: '支持多种任意值语法，并对 rpx 长度做了友好处理。',
    samples: [
      {
        label: '颜色推断',
        code: "twMerge('bg-black bg-(--my-color) bg-[color:var(--mystery-var)]')",
        result: defaultMerge('bg-black bg-(--my-color) bg-[color:var(--mystery-var)]'),
      },
      {
        label: 'Grid 任意值',
        code: "twMerge('grid-cols-[1fr,auto] grid-cols-2')",
        result: defaultMerge('grid-cols-[1fr,auto] grid-cols-2'),
      },
      {
        label: '长度标签',
        code: "twMerge('text-[length:32rpx]', 'text-[length:24rpx]')",
        result: defaultMerge('text-[length:32rpx]', 'text-[length:24rpx]'),
      },
    ],
  },
  {
    title: '支持任意属性',
    description: '任意属性可以互相覆盖，也可以和 Tailwind 类共存。',
    samples: [
      {
        label: '遮罩属性',
        code: "twMerge('[mask-type:luminance] [mask-type:alpha]')",
        result: defaultMerge('[mask-type:luminance] [mask-type:alpha]'),
      },
      {
        label: '断点保留',
        code: "twMerge('[--scroll-offset:56px] lg:[--scroll-offset:44px]')",
        result: defaultMerge('[--scroll-offset:56px] lg:[--scroll-offset:44px]'),
      },
      {
        label: 'Tailwind 共存',
        code: "twMerge('[padding:20rpx]', 'p-8')",
        result: defaultMerge('[padding:20rpx]', 'p-8'),
      },
    ],
  },
  {
    title: '支持任意变体',
    description: '任意变体可与标准修饰符混用，包含 rpx 案例。',
    samples: [
      {
        label: '相同选择器覆盖',
        code: "twMerge('[&:nth-child(3)]:py-0 [&:nth-child(3)]:py-4')",
        result: defaultMerge('[&:nth-child(3)]:py-0 [&:nth-child(3)]:py-4'),
      },
      {
        label: '深度修饰',
        code: "twMerge('dark:hover:[&:nth-child(3)]:py-0', 'hover:dark:[&:nth-child(3)]:py-4')",
        result: defaultMerge('dark:hover:[&:nth-child(3)]:py-0', 'hover:dark:[&:nth-child(3)]:py-4'),
      },
      {
        label: '小程序节点',
        code: "twMerge('[&_view]:p-[12rpx]', 'focus:[&_view]:p-4')",
        result: defaultMerge('[&_view]:p-[12rpx]', 'focus:[&_view]:p-4'),
      },
    ],
  },
  {
    title: '支持重要修饰符',
    description: '携带 ! 的类会按照优先级覆盖。',
    samples: [
      {
        label: 'Padding',
        code: "twMerge('p-3! p-4! p-5')",
        result: defaultMerge('p-3! p-4! p-5'),
      },
      {
        label: '定位',
        code: "twMerge('right-2! -inset-x-1!')",
        result: defaultMerge('right-2! -inset-x-1!'),
      },
      {
        label: '任意值',
        code: "twMerge('w-[12rpx]!', 'w-[24rpx]!', 'w-[10rpx]')",
        result: defaultMerge('w-[12rpx]!', 'w-[24rpx]!', 'w-[10rpx]'),
      },
    ],
  },
  {
    title: '支持后缀修饰符',
    description: '字号与行高等后缀写法会自动挑选最后的结果。',
    samples: [
      {
        label: '标准写法',
        code: "twMerge('text-sm leading-6 text-lg/7')",
        result: defaultMerge('text-sm leading-6 text-lg/7'),
      },
      {
        label: 'rpx 后缀',
        code: "twMerge('text-sm leading-6 text-[length:28rpx]/7')",
        result: defaultMerge('text-sm leading-6 text-[length:28rpx]/7'),
      },
    ],
  },
  {
    title: '保留非 Tailwind 类',
    description: '自定义类名会被原样保留，可与任意值并存。',
    samples: [
      {
        label: '原子类混合',
        code: "twMerge('p-5 p-2 my-non-tailwind-class p-4')",
        result: defaultMerge('p-5 p-2 my-non-tailwind-class p-4'),
      },
      {
        label: '任意值混合',
        code: "twMerge('p-[12rpx]', 'mina-card', 'p-[16rpx]')",
        result: defaultMerge('p-[12rpx]', 'mina-card', 'p-[16rpx]'),
      },
    ],
  },
  {
    title: '支持自定义颜色',
    description: '对定制颜色同样会按照冲突规则处理。',
    samples: [
      {
        label: '命名颜色',
        code: "twMerge('text-red', 'text-secret-sauce')",
        result: defaultMerge('text-red', 'text-secret-sauce'),
      },
      {
        label: '十六进制',
        code: "twMerge('text-[#123456]', 'text-[#654321]')",
        result: defaultMerge('text-[#123456]', 'text-[#654321]'),
      },
    ],
  },
  {
    title: '组合 API：多参数',
    description: '支持任意数量的字符串参数。',
    samples: [
      {
        label: '简单组合',
        code: "twMerge('some-class', 'another-class yet-another-class', 'so-many-classes')",
        result: defaultMerge('some-class', 'another-class yet-another-class', 'so-many-classes'),
      },
      {
        label: '与 rpx 结合',
        code: "twMerge('some-class', 'w-[12rpx]', 'w-[24rpx]')",
        result: defaultMerge('some-class', 'w-[12rpx]', 'w-[24rpx]'),
      },
    ],
  },
  {
    title: '组合 API：条件与数组',
    description: '兼容布尔短路与嵌套数组写法。',
    samples: [
      {
        label: '布尔短路',
        code: "twMerge('my-class', false && 'not-this', null && 'also-not-this', true && 'but-this')",
        result: defaultMerge('my-class', false && 'not-this', null && 'also-not-this', true && 'but-this'),
      },
      {
        label: '嵌套数组',
        code: "twMerge('hi', ['w-[12rpx]', ['w-[24rpx]']])",
        result: defaultMerge('hi', ['w-[12rpx]', ['w-[24rpx]']]),
      },
    ],
  },
]

const runtimeExamples = [
  {
    label: '默认 escape/unescape',
    code: "twMerge('text-[#ececec]', 'text-[#654321]')",
    result: defaultMerge('text-[#ececec]', 'text-[#654321]'),
  },
  {
    label: 'escape: false',
    code: "create({ escape: false }).twMerge('text-[#ececec]', 'text-[#654321]')",
    result: mergeWithoutEscape('text-[#ececec]', 'text-[#654321]'),
  },
  {
    label: 'unescape: false',
    code: "create({ unescape: false }).twMerge('text-_bhececec_B', 'text-[#ececec]')",
    result: mergeWithoutUnescape('text-_bhececec_B', 'text-[#ececec]'),
  },
  {
    label: 'escape/unescape: false',
    code: "create({ escape: false, unescape: false }).twMerge('text-_bhececec_B', 'text-[#ececec]')",
    result: mergePassthrough('text-_bhececec_B', 'text-[#ececec]'),
  },
]

const button = cva(['font-semibold', 'border', 'rounded'], {
  variants: {
    intent: {
      primary: ['bg-[#2563eb]', 'text-white', 'border-transparent'],
      secondary: ['bg-white', 'text-[#1f2937]', 'border-[#94a3b8]'],
    },
    size: {
      small: ['text-[24rpx]', 'py-[6rpx]', 'px-[16rpx]'],
      medium: ['text-[28rpx]', 'py-[10rpx]', 'px-[20rpx]'],
    },
    disabled: {
      false: null,
      true: ['opacity-50', 'cursor-not-allowed'],
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'medium',
    disabled: false,
  },
})

const cvaSamples = [
  {
    label: '默认',
    code: 'button()',
    result: button(),
    previewItems: ['主要按钮'],
  },
  {
    label: '副按钮',
    code: "button({ intent: 'secondary', size: 'small' })",
    result: button({ intent: 'secondary', size: 'small' }),
    previewItems: ['副按钮'],
  },
  {
    label: '禁用状态',
    code: "button({ disabled: true })",
    result: button({ disabled: true }),
    previewItems: ['禁用按钮'],
  },
]

const badge = tv({
  base: 'inline-flex items-center justify-center rounded-full font-medium',
  variants: {
    tone: {
      primary: ['bg-[#2563eb]', 'text-white'],
      success: ['bg-[#16a34a]', 'text-white'],
      danger: ['bg-[#dc2626]', 'text-white'],
    },
    outline: {
      false: '',
      true: ['bg-transparent', 'border', 'border-current'],
    },
    size: {
      sm: ['text-[24rpx]', 'px-[16rpx]', 'py-[8rpx]'],
      md: ['text-[28rpx]', 'px-[20rpx]', 'py-[12rpx]'],
    },
  },
  compoundVariants: [
    {
      tone: 'primary',
      outline: true,
      class: 'text-[#2563eb]',
    },
    {
      tone: 'success',
      outline: true,
      class: 'text-[#16a34a]',
    },
  ],
  defaultVariants: {
    tone: 'primary',
    outline: false,
    size: 'md',
  },
})

const variantsSamples = [
  {
    label: '默认徽章',
    code: 'badge()',
    result: badge(),
    previewItems: ['Primary'],
  },
  {
    label: '描边成功态',
    code: "badge({ tone: 'success', outline: true })",
    result: badge({ tone: 'success', outline: true }),
    previewItems: ['Success'],
  },
  {
    label: '危险小号',
    code: "badge({ tone: 'danger', size: 'sm' })",
    result: badge({ tone: 'danger', size: 'sm' }),
    previewItems: ['Danger'],
  },
]

const withPreview = (className: string, previewItems?: string[], previewBaseClass?: string) => ({
  previewClass: className,
  previewItems: previewItems ?? basePreviewItems,
  previewBaseClass: previewBaseClass ?? 'sample__preview-target--flow',
})

const versionComparisonWithPreview = versionComparison.map((item) => ({
  ...item,
  ...withPreview(item.result, item.previewItems, item.previewBaseClass),
}))

const mergingExamplesWithPreview = mergingExamples.map(({ samples, ...rest }) => ({
  ...rest,
  samples: samples.map((sample) => ({
    ...sample,
    ...withPreview(sample.result, sample.previewItems, sample.previewBaseClass),
  })),
}))

const runtimeExamplesWithPreview = runtimeExamples.map((item) => ({
  ...item,
  ...withPreview(item.result, item.previewItems, item.previewBaseClass),
}))

const cvaSamplesWithPreview = cvaSamples.map((item) => ({
  ...item,
  ...withPreview(item.result, item.previewItems, item.previewBaseClass),
}))

const variantsSamplesWithPreview = variantsSamples.map((item) => ({
  ...item,
  ...withPreview(item.result, item.previewItems, item.previewBaseClass),
}))

Page({
  data: {
    basePreviewItems,
    versionComparison: versionComparisonWithPreview,
    mergingExamples: mergingExamplesWithPreview,
    runtimeExamples: runtimeExamplesWithPreview,
    cvaSamples: cvaSamplesWithPreview,
    variantsSamples: variantsSamplesWithPreview,
  },
})
