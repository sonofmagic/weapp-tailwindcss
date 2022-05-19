export const arbitraryValuesMap = {
  Layout: {
    'Aspect Ratio': ['aspect-[4/3]'],
    Columns: ['columns-[10rem]'],
    'Object Position': ['object-[center_bottom]'],
    'Top / Right / Bottom / Left': ['top-[3px]'],
    'Z-Index': ['z-[100]']
  },
  'Flexbox & Grid': {
    'Flex Basis': ['basis-[14.2857143%]'],
    Flex: ['flex-[2_2_0%]'],
    'Flex Grow': ['grow-[2]'],
    'Flex Shrink': ['shrink-[2]'],
    Order: ['order-[13]'],
    'Grid Template Columns': ['grid-cols-[200px_minmax(900px,_1fr)_100px]'],
    'Grid Column Start / End': ['col-[16_/_span_16]'],
    'Grid Template Rows': ['grid-rows-[200px_minmax(900px,_1fr)_100px]'],
    'Grid Row Start / End': ['row-[span_16_/_span_16]'],
    'Grid Auto Columns': ['auto-cols-[minmax(0,_2fr)]'],
    'Grid Auto Rows': ['auto-rows-[minmax(0,_2fr)]'],
    Gap: ['gap-[2.75rem]']
  },
  Spacing: {
    Padding: ['p-[5px]'],
    Margin: ['m-[5px]'],
    'Space Between': ['space-y-[5px]']
  },
  Sizing: {
    Width: ['w-[32rem]'],
    'Min-Width': ['min-w-[50%]'],
    'Max-Width': ['max-w-[50%]'],
    Height: ['h-[32rem]'],
    'Min-Height': ['min-h-[50%]'],
    'Max-Height': ['max-h-[32rem]']
  },
  Typography: {
    'Font Family': ["font-['Open_Sans']"],
    'Font Size': ['text-[14px]'],
    'Font Weight': ['font-[1100]'],
    'Letter Spacing': ['tracking-[.25em]'],
    'Line Height': ['leading-[3rem]'],
    'List Style Type': ['list-[upper-roman]'],
    'Text Color': ['text-[#50d71e]'],
    'Text Decoration Color': ['decoration-[#50d71e]'],
    'Text Decoration Thickness': ['decoration-[3px]'],
    'Text Underline Offset': ['underline-offset-[3px]'],
    'Text Indent': ['indent-[50%]'],
    Content: ["before:content-['Hello_World']"]
  },
  Backgrounds: {
    'Background Color': ['bg-[#50d71e]'],
    'Background Position': ['bg-[center_top_1rem]'],
    'Background Size': ['bg-[length:200px_100px]'],
    'Background Image': ["bg-[url('/img/hero-pattern.svg')]"],
    'Gradient Color Stops': ['from-[#243c5a]']
  },
  Borders: {
    'Border Radius': ['rounded-[12px]'],
    'Border Width': ['border-t-[3px]'],
    'Border Color': ['border-[#243c5a]'],
    'Divide Width': ['divide-x-[3px]'],
    'Divide Color': ['divide-[#243c5a]'],
    'Outline Width': ['outline-[5px]'],
    'Outline Color': ['outline-[#243c5a]'],
    'Outline Offset': ['outline-offset-[3px]'],
    'Ring Width': ['ring-[10px]'],
    'Ring Color': ['ring-[#243c5a]'],
    'Ring Offset Width': ['ring-offset-[10px]'],
    'Ring Offset Color': ['ring-offset-[#243c5a]']
  },
  Effects: {
    'Box Shadow': ['shadow-[inset_0_0_0_0_#50d71e]', 'shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]'],
    'Box Shadow Color': ['shadow-[#50d71e]'],
    Opacity: ['opacity-[0.5]', 'opacity-[.67]', 'opacity-[1]']
  },
  Filters: {
    Blur: ['blur-[10px]'],
    Brightness: ['brightness-[50%]', 'brightness-[1.75]'],
    Contrast: ['contrast-[50%]', 'contrast-[1.75]', 'contrast-[.25]'],
    'Drop Shadow': ['drop-shadow-[0_0_0_0_#50d71e]', 'drop-shadow-[0_35px_35px_rgba(0,0,0,0.25)]'],
    Grayscale: ['grayscale-[50%]', 'grayscale-[1.75]', 'grayscale-[.25]'],
    'Hue Rotate': ['hue-rotate-[90deg]', 'hue-rotate-[270deg]'],
    Invert: ['invert-[50%]', 'invert-[1.75]', 'invert-[.25]'],
    Saturate: ['saturate-[50%]', 'saturate-[1.75]', 'saturate-[.25]'],
    Sepia: ['sepia-[50%]', 'sepia-[1.75]', 'sepia-[.25]'],
    'Backdrop Blur': ['backdrop-blur-[10px]'],
    'Backdrop Brightness': ['backdrop-brightness-[50%]', 'backdrop-brightness-[1.75]'],
    'Backdrop Contrast': ['backdrop-contrast-[50%]', 'backdrop-contrast-[1.75]', 'backdrop-contrast-[.25]'],
    'Backdrop Grayscale': ['backdrop-grayscale-[50%]', 'backdrop-grayscale-[1.75]', 'backdrop-grayscale-[.25]'],
    'Backdrop Hue Rotate': ['backdrop-hue-rotate-[90deg]', 'backdrop-hue-rotate-[270deg]'],
    'Backdrop Invert': ['backdrop-invert-[50%]', 'backdrop-invert-[1.75]', 'backdrop-invert-[.25]'],
    'Backdrop Opacity': ['backdrop-opacity-[0.5]', 'backdrop-opacity-[.67]', 'backdrop-opacity-[1]'],
    'Backdrop Saturate': ['backdrop-saturate-[50%]', 'backdrop-saturate-[1.75]', 'backdrop-saturate-[.25]'],
    'Backdrop Sepia': ['backdrop-sepia-[50%]', 'backdrop-sepia-[1.75]', 'backdrop-sepia-[.25]']
  },
  'Transitions & Animation': {
    'Transition Property': ['transition-property-[all]', 'transition-property-[background-color]', 'transition-[height]'],
    'Transition Duration': ['duration-[2000ms]', 'duration-[1s]', 'duration-[2s]'],
    'Transition Timing Function': ['ease-[cubic-bezier(0.95,0.05,0.795,0.035)]'],
    'Transition Delay': ['delay-[2000ms]', 'delay-[1s]', 'delay-[2s]'],
    Animation: ['animate-[wiggle_1s_ease-in-out_infinite]', 'animate-[slide_1s_ease-in-out_infinite]', 'animate-[slide_1s_ease-in-out_infinite_backwards]']
  },
  Transforms: {
    Scale: ['scale-[1.5]', 'scale-[2]'],
    Rotate: ['rotate-[90deg]', 'rotate-[180deg]'],
    Skew: ['skew-[10deg]', 'skew-[20deg]'],
    Translate: ['translate-[10px_20px]', 'translate-[20px_30px]', 'translate-y-[17rem]'],
    'Transform Origin': [
      'origin-[center_center]',
      'origin-[center_top]',
      'origin-[center_bottom]',
      'origin-[left_center]',
      'origin-[left_top]',
      'origin-[left_bottom]',
      'origin-[right_center]',
      'origin-[right_top]',
      'origin-[right_bottom]',
      'origin-[top_center]',
      'origin-[top_left]',
      'origin-[top_right]',
      'origin-[bottom_center]',
      'origin-[bottom_left]',
      'origin-[bottom_right]',
      'origin-[33%_75%]'
    ]
  },
  Interactivity: {
    'Accent Color': ['accent-[#50d71e]'],
    Cursor: ['cursor-[url(hand.cur),_pointer]', 'cursor-[pointer]', 'cursor-[zoom-in]', 'cursor-[zoom-out]', 'cursor-[grab]', 'cursor-[grabbing]', 'cursor-[not-allowed]'],
    'Caret Color': ['caret-[#50d71e]'],
    'Caret Size': ['caret-[10px]', 'caret-[20px]', 'caret-[30px]', 'caret-[40px]', 'caret-[50px]', 'caret-[60px]', 'caret-[70px]', 'caret-[80px]', 'caret-[90px]', 'caret-[100px]'],
    'Pointer Events': ['pointer-events-[auto]', 'pointer-events-[none]', 'pointer-events-[box-only]', 'pointer-events-[box-none]', 'pointer-events-[all]'],
    'User Select': ['user-select-[none]', 'user-select-[text]', 'user-select-[all]'],
    'Touch Action': ['touch-action-[auto]', 'touch-action-[pan-x]', 'touch-action-[pan-y]', 'touch-action-[pan-x-y]', 'touch-action-[none]'],
    'Tap Highlight Color': ['tap-highlight-color-[#50d71e]'],
    'Tap Highlight Color Opacity': ['tap-highlight-color-opacity-[0.5]', 'tap-highlight-color-opacity-[.67]', 'tap-highlight-color-opacity-[1]'],
    'Touch Callout': [
      'touch-callout-[none]',
      'touch-callout-[default]',
      'touch-callout-[none_default]',
      'touch-callout-[default_none]',
      'touch-callout-[none_default_auto]',
      'touch-callout-[auto_none_default]'
    ],
    'User Drag': ['user-drag-[auto]', 'user-drag-[element]', 'user-drag-[element_none]', 'user-drag-[none_element]', 'user-drag-[element_auto]', 'user-drag-[auto_element]'],
    'Scroll Margin': ['scroll-m-[24rem]', 'scroll-margin-[10px_20px]', 'scroll-margin-[20px_30px]', 'scroll-margin-y-[17rem]'],
    'Scroll Padding': ['scroll-p-[24rem]', 'scroll-padding-[10px_20px]', 'scroll-padding-[20px_30px]', 'scroll-padding-y-[17rem]'],
    'Will Change': ['will-change-[top,left]']
  },
  SVG: {
    Fill: ['fill-[#243c5a]'],
    Stroke: ['stroke-[#243c5a]'],
    'Stroke Width': ['stroke-[2px]']
  }
}
