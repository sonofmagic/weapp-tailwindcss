import type { FC } from 'react'
import type { SwitchProps } from './types'
/**
 * Switch - Taro 组件实现 (使用新的统一架构)
 * 开关组件 - 跨端统一实现
 */
import { View } from '@tarojs/components'
import { useSwitch } from './use-switch'

const Switch: FC<SwitchProps> = (props) => {
  const { style, children, ariaLabel, ...restProps } = props

  const { checked, className: switchClassName, handleToggle, isDisabled }
    = useSwitch(props)

  return (
    <View
      className={switchClassName}
      style={style}
      onClick={handleToggle}
      aria-label={ariaLabel}
      aria-checked={checked}
      aria-disabled={isDisabled}
      role="switch"
      {...restProps}
    >
      <View className="wt-switch__track">
        <View className="wt-switch__thumb" />
      </View>
      {children && <View className="wt-switch__label">{children}</View>}
    </View>
  )
}

export default Switch
