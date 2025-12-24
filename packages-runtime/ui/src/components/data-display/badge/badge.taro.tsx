/**
 * Badge - Taro 组件实现 (使用新的统一架构)
 * 徽章组件 - 跨端统一实现
 */
import type { FC } from 'react'
import type { BadgeProps } from './types'
import { View } from '@tarojs/components'
import { useBadge } from './use-badge'

const Badge: FC<BadgeProps> = (props) => {
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

export default Badge
