function getSymbol () {
  const contentDom = document.getElementById('content')
  let v
  const p = Array.from(contentDom.querySelectorAll('td')).reduce((acc, cur, idx) => {
    const text = cur.innerText
    if (idx % 2 === 0) {
      v = text
    } else {
      acc[text.toUpperCase()] = v
    }
    return acc
  }, {})
  console.log(JSON.stringify(p))
}
export { getSymbol }
