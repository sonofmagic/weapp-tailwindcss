// .sm\\:text-3xl
export function cssSelectorReplacer (selector: string) {
  return (
    selector
      .replace(/\\\[/g, '_l_')
      .replace(/\\\]/g, '_r_')
      .replace(/\\\(/g, '_p_')
      .replace(/\\\)/g, '_q_')
      .replace(/\\#/g, '_h_')
      .replace(/\\!/g, '_i_') //! important
      .replace(/\\\//g, '-div-')
      .replace(/\\\./g, '-dot-')
      // \\:
      .replace(/\\:/g, '_c_')
  )
}
