/* eslint-disable antfu/no-import-dist */
import type {
  UseButtonLikeReturn,
  UseDisclosureReturn,
  UsePlatformEventsOptions,
} from '../dist/hooks/index.js'
import {
  expectAssignable,
  expectType,
} from 'tsd'
import {
  useButtonLike,
  useControllableState,
  useDisclosure,
  usePlatformEvents,
  usePrevious,
  useToggle,
} from '../dist/hooks/index.js'

expectType<[string | undefined, (value: string) => void, boolean]>(
  useControllableState<string>({ defaultValue: 'value' }),
)
expectType<1 | undefined>(usePrevious(1))
expectType<[boolean, () => void, (value: boolean) => void]>(useToggle())
expectAssignable<UseDisclosureReturn>(useDisclosure())
expectAssignable<UseButtonLikeReturn>(useButtonLike({ disabled: true }))

const platformEventOptions: UsePlatformEventsOptions<'click' | 'input'> = {
  events: ['click', 'input'],
  handlers: {
    click: () => {},
    input: () => {},
  },
  adapter: {
    name: 'native',
    events: {
      click: 'bindtap',
      longPress: 'bindlongpress',
      input: 'bindinput',
      focus: 'bindfocus',
      blur: 'bindblur',
      change: 'bindchange',
      touchStart: 'bindtouchstart',
      touchMove: 'bindtouchmove',
      touchEnd: 'bindtouchend',
      confirm: 'bindconfirm',
    },
    components: {
      View: 'View',
      Text: 'Text',
      Button: 'Button',
      Input: 'Input',
      Textarea: 'Textarea',
      ScrollView: 'ScrollView',
      Swiper: 'Swiper',
      Image: 'Image',
      Icon: 'Icon',
      Checkbox: 'Checkbox',
      CheckboxGroup: 'CheckboxGroup',
      Radio: 'Radio',
      RadioGroup: 'RadioGroup',
      Switch: 'Switch',
      Slider: 'Slider',
      Picker: 'Picker',
      Progress: 'Progress',
    },
    styleConfig: {},
    capabilities: {},
    getEventPropName: eventName => eventName,
    getEventProps: () => ({}),
    normalizeEvent: event => event,
    getEventDetail: event => event,
    getEventValue: event => event,
    supportsCssFeature: () => false,
    supportsApiFeature: () => false,
  },
}

expectType<Record<string, (event: any) => void>>(usePlatformEvents(platformEventOptions))
