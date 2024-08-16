module.exports = {
  isPhone: str => /^1[3|4578]\d{9}$/.test(str),
  isVrcode: str => /^\d{6}$/.test(str), // 6位数字验证码
  isEmpty: str => /^\s+$/.test(str), // 全是空白符
  isISBN: str => /^\d{13}$/.test(str), // ISBN
}
