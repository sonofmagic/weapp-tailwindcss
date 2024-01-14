import transform from '../src/transform'

describe('transform', () => {
  it('case 0', () => {
    expect(transform('<p></p>', { prefix: '' })).toBe('<p class="p"></p>')
  })

  it('case 1', () => {
    expect(transform('<p><a></a></p>', { prefix: '' })).toBe('<p class="p"><a class="a"></a></p>')
  })

  it('case 2', () => {
    expect(transform('<p><a></a></p>', { prefix: '' })).toBe('<p class="p"><a class="a"></a></p>')
  })

  it('case 3', () => {
    expect(
      transform(
        `<pre><code class="language-js">module.exports = {
      plugins: {
        '@pandacss/dev/postcss': {}
      }
    }
    </code></pre>`,
        { prefix: '' }
      )
    ).toBe(`<pre class="pre"><code class="code language-js">module.exports = {
      plugins: {
        '@pandacss/dev/postcss': {}
      }
    }
    </code></pre>`)
  })

  it('case 4', () => {
    expect(
      transform(
        `<pre class="b"><code class="language-js">module.exports = {
      plugins: {
        '@pandacss/dev/postcss': {}
      }
    }
    </code></pre>`,
        { prefix: '' }
      )
    ).toBe(`<pre class="pre b"><code class="code language-js">module.exports = {
      plugins: {
        '@pandacss/dev/postcss': {}
      }
    }
    </code></pre>`)
  })

  it('case 5', () => {
    expect(
      transform(
        `<pre class="b"><code >module.exports = {
      plugins: {
        '@pandacss/dev/postcss': {}
      }
    }
    </code></pre>`,
        { prefix: '' }
      )
    ).toBe(`<pre class="pre b"><code class="code" >module.exports = {
      plugins: {
        '@pandacss/dev/postcss': {}
      }
    }
    </code></pre>`)
  })
})
