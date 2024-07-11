/**
 * rd-tag
 */
Component({
  externalClasses: ["rd-tag-class", "rd-tag-text-class"],
  properties: {
    text: String,
    radiusType: {
      type: String, // 圆角样式 square[方]， round[圆], halfRound[半圆], single[单直角]
      value: "square",
    },
    /**
     * dark: 深色模式 边框透明
     * light: 边框透明 背景浅色*
     * outline: 背景透明，边框高亮
     * light-outline:背景浅色，边框高亮
     */
    type: {
      // tag 类型  dark/light/outline/light-outline
      type: String,
      value: "dark",
    },
    theme: {
      // 类型，可选值为: primary success danger warning grey
      type: String,
      value: "danger",
    },
    disabled: {
      type: Boolean,
      value: false,
    },
    iconProps: {
      // 左侧图标配置项
      type: Object,
      value: null,
    },
    closeIcon: {
      // 是否展示关闭按钮
      type: Boolean,
      value: false,
    },
    closeIconProps: {
      // 关闭图标配置
      type: Object,
      value: null,
    },
    size: {
      type: String,
      value: "m", // xl l m s xs
    },
  },

  data: {
    sizeIconFont: {
      xl: 16,
      l: 16,
      m: 14,
      s: 14,
      xs: 12,
    },
  },

  methods: {
    handleClick() {
      this.triggerEvent("onClick", "");
    },
    handleClose() {
      this.triggerEvent("onClose", "");
    },
  },
});
