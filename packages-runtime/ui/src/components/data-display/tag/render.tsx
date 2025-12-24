/**
 * render.tsx - Tag 组件的跨平台渲染层
 * 为三个平台提供统一的渲染接口
 */
import type { FC } from 'react'
import type { TagProps } from './types'
import { View } from '@tarojs/components'
import { useTag } from './use-tag'

/**
 * Taro 平台 Tag 组件实现
 */
export const TagTaro: FC<TagProps> = (props) => {
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

/**
 * Native 平台 Tag 组件实现
 */
export function TagNative(props: TagProps) {
  const { style, children, icon, closable, ...restProps } = props

  const { className: tagClassName, handleClose } = useTag(props)

  return {
    type: 'view',
    props: {
      className: tagClassName,
      style,
      ...restProps,
    },
    children: [
      icon
        ? {
            type: 'view',
            props: { className: 'wt-tag__icon' },
            children: [icon],
          }
        : null,
      children
        ? {
            type: 'view',
            props: { className: 'wt-tag__content' },
            children: [children],
          }
        : null,
      closable
        ? {
            type: 'view',
            props: { className: 'wt-tag__close', bindtap: handleClose },
            children: ['×'],
          }
        : null,
    ].filter(Boolean),
  }
}

/**
 * uni-app 平台 Tag 组件实现
 */
export function TagUniApp(props: TagProps) {
  const { style, children, icon, closable, ...restProps } = props

  const { className: tagClassName, handleClose } = useTag(props)

  return {
    template: `
      <view :class="tagClassName" :style="style" v-bind="restProps">
        <view v-if="icon" class="wt-tag__icon">{{ icon }}</view>
        <view v-if="children" class="wt-tag__content">{{ children }}</view>
        <view v-if="closable" class="wt-tag__close" @click="handleClose">×</view>
      </view>
    `,
    data() {
      return {
        tagClassName,
        style,
        icon,
        children,
        closable,
        handleClose,
        restProps,
      }
    },
  }
}
