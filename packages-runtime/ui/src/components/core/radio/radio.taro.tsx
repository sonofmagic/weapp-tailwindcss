import type { FC } from 'react'
import type { RadioProps } from './types'
/**
 * Radio - Taro 组件实现 (使用新的统一架构)
 * 单选框组件 - 跨端统一实现
 */
import { View } from '@tarojs/components'
import { useRadio } from './use-radio'

const Radio: FC<RadioProps> = (props) => {
  const { style, children, ariaLabel, ...restProps } = props

  const { checked, className: radioClassName, inputClassName, handleClick, isDisabled }
    = useRadio(props)

  return (
    <View
      className={radioClassName}
      style={style}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-checked={checked}
      aria-disabled={isDisabled}
      role="radio"
      {...restProps}
    >
      <View className={inputClassName}>
        <View className="wt-radio__circle" />
        {checked && <View className="wt-radio__dot" />}
      </View>
      {children && <View className="wt-radio__label">{children}</View>}
    </View>
  )
}

export default Radio
