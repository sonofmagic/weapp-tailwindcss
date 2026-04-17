export type ResetPreset = 'minimal' | 'form' | 'content' | 'media' | 'all'
export type BuiltInResetName
  = | 'buttonReset'
    | 'imageReset'
    | 'inputReset'
    | 'textareaReset'
    | 'listReset'
    | 'navigatorReset'
    | 'videoReset'

export interface ResetOptions {
  /**
   * 启用一组内置 reset 预设；默认不传时保持最小行为，仅注入 button/image。
   */
  preset?: ResetPreset | ResetPreset[]
  /**
   * 控制 `button` reset 的注入与选择器，传入 `false` 可跳过该规则。
   */
  buttonReset?: false | ResetConfig
  /**
   * 控制 `image` reset（同时覆盖 `<image>` 与 `<img>`）。
   */
  imageReset?: false | ResetConfig
  /**
   * 控制常见输入框 reset（`input`）。
   */
  inputReset?: false | ResetConfig
  /**
   * 控制多行输入框 reset（`textarea`）。
   */
  textareaReset?: false | ResetConfig
  /**
   * 控制列表 reset（`ul` / `ol`）。
   */
  listReset?: false | ResetConfig
  /**
   * 控制链接 reset（`navigator` / `a`）。
   */
  navigatorReset?: false | ResetConfig
  /**
   * 控制 `video` reset。
   */
  videoReset?: false | ResetConfig
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
