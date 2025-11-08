const isPlainObject = require('lodash.isplainobject')

const parser = require('postcss-selector-parser')

const parseSelector = parser()

module.exports = {
  isUsableColor(color, values) {
    return isPlainObject(values) && color !== 'gray' && values[600]
  },

  /**
   * @param {string} selector
   */
  commonTrailingPseudos(selector) {
    const ast = parseSelector.astSync(selector)

    /** @type {import('postcss-selector-parser').Pseudo[][]} */
    const matrix = []

    // Put the pseudo elements in reverse order in a sparse, column-major 2D array
    for (const [i, sel] of ast.nodes.entries()) {
      for (const [j, child] of [...sel.nodes].reverse().entries()) {
        // We only care about pseudo elements
        if (child.type !== 'pseudo' || !child.value.startsWith('::')) {
          break
        }

        matrix[j] = matrix[j] || []
        matrix[j][i] = child
      }
    }

    const trailingPseudos = parser.selector()

    // At this point the pseudo elements are in a column-major 2D array
    // This means each row contains one "column" of pseudo elements from each selector
    // We can compare all the pseudo elements in a row to see if they are the same
    for (const pseudos of matrix) {
      // It's a sparse 2D array so there are going to be holes in the rows
      // We skip those
      if (!pseudos) {
        continue
      }

      const values = new Set(pseudos.map(p => p.value))

      // The pseudo elements are not the same
      if (values.size > 1) {
        break
      }

      for (const pseudo of pseudos) {
        pseudo.remove()
      }
      trailingPseudos.prepend(pseudos[0])
    }

    if (trailingPseudos.nodes.length > 0) {
      return [trailingPseudos.toString(), ast.toString()]
    }

    return [null, selector]
  },
}
