/**
 * Tag - Taro 组件实现 (使用新的统一架构)
 * 标签组件 - 跨端统一实现
 */
import type { FC } from 'react'
import type { TagProps } from './types'
import { View } from '@tarojs/components'
import { useTag } from './use-tag'

const Tag: FC<TagProps> = (props) => {
  const { style, children, icon, closable, ...restProps } = props

  const { className: tagClassName, handleClose } = useTag(props)

  return (
    <View className={tagClassName} style={style} {...restProps}>
      {icon && <View className="wt-tag__icon">{icon}</View>}
      {children && <View className="wt-tag__content">{children}</View>}
      {closable && (
        <View className="wt-tag__close" onClick={handleClose}>
          ×
        </View>
      )}
    </View>
  )
}

export default Tag
