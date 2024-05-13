function getSymbol() {
  const contentDom = document.querySelector('#content')
  let v
  const p = [...contentDom.querySelectorAll('td')].reduce((acc, cur, idx) => {
    const text = cur.textContent
    if (idx % 2 === 0) {
      v = text
    }
    else {
      acc[text.toUpperCase()] = v
    }
    return acc
  }, {})
  console.log(JSON.stringify(p))
}
export { getSymbol }
