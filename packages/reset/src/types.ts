export interface ResetOptions {
  /**
   * 控制 `button` reset 的注入与选择器，传入 `false` 可跳过该规则。
   */
  buttonReset?: false | ResetConfig
  /**
   * 控制 `image` reset（同时覆盖 `<image>` 与 `<img>`）。
   */
  imageReset?: false | ResetConfig
  /**
   * 额外的 reset 规则，可根据业务自定义。
   */
  extraResets?: ResetConfig[]
}

export interface ResetConfig {
  selectors?: string[]
  declarations?: Record<string, string | number | false | null | undefined>
  pseudo?: Record<string, string | number | false | null | undefined>
}
