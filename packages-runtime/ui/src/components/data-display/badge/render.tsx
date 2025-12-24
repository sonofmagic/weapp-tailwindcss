/**
 * render.tsx - Badge 组件的跨平台渲染层
 * 为三个平台提供统一的渲染接口
 */
import type { FC } from 'react'
import type { BadgeProps } from './types'
import { View } from '@tarojs/components'
import { useBadge } from './use-badge'

/**
 * Taro 平台 Badge 组件实现
 */
export const BadgeTaro: FC<BadgeProps> = (props) => {
  const { style, children, offset, ...restProps } = props

  const { className: badgeClassName, badgeClassName: contentClassName, displayText, showBadge }
    = useBadge(props)

  const badgeStyle = offset
    ? {
        ...style,
        marginTop: `${offset[0]}px`,
        marginLeft: `${offset[1]}px`,
      }
    : style

  return (
    <View className={badgeClassName} {...restProps}>
      {children}
      {showBadge && (
        <View className={contentClassName} style={badgeStyle}>
          {displayText}
        </View>
      )}
    </View>
  )
}

/**
 * Native 平台 Badge 组件实现
 */
export function BadgeNative(props: BadgeProps) {
  const { style, children, offset, ...restProps } = props

  const { className: badgeClassName, badgeClassName: contentClassName, displayText, showBadge }
    = useBadge(props)

  const badgeStyle = offset
    ? {
        ...style,
        marginTop: `${offset[0]}px`,
        marginLeft: `${offset[1]}px`,
      }
    : style

  return {
    type: 'view',
    props: {
      className: badgeClassName,
      ...restProps,
    },
    children: [
      children,
      showBadge
        ? {
            type: 'view',
            props: { className: contentClassName, style: badgeStyle },
            children: [displayText],
          }
        : null,
    ].filter(Boolean),
  }
}

/**
 * uni-app 平台 Badge 组件实现
 */
export function BadgeUniApp(props: BadgeProps) {
  const { style, offset, ...restProps } = props

  const { className: badgeClassName, badgeClassName: contentClassName, displayText, showBadge }
    = useBadge(props)

  const badgeStyle = offset
    ? {
        ...style,
        marginTop: `${offset[0]}px`,
        marginLeft: `${offset[1]}px`,
      }
    : style

  return {
    template: `
      <view :class="badgeClassName" v-bind="restProps">
        <slot></slot>
        <view v-if="showBadge" :class="contentClassName" :style="badgeStyle">
          {{ displayText }}
        </view>
      </view>
    `,
    data() {
      return {
        badgeClassName,
        contentClassName,
        displayText,
        showBadge,
        badgeStyle,
        restProps,
      }
    },
  }
}
