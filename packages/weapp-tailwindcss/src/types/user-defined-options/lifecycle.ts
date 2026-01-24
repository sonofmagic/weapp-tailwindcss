export interface UserDefinedOptionsLifecyclePart {
  /**
   * 插件 `apply` 初始调用时触发。
   *
   * @group 2.生命周期
   */
  onLoad?: () => void
  /**
   * 开始处理前触发。
   *
   * @group 2.生命周期
   */
  onStart?: () => void
  /**
   * 匹配并修改文件后触发。
   *
   * @group 2.生命周期
   */
  onUpdate?: (filename: string, oldVal: string, newVal: string) => void
  /**
   * 结束处理时触发。
   *
   * @group 2.生命周期
   */
  onEnd?: () => void
}
