// v-emoji指令  用于替换表情字符串为真实表情

import data from './emojiList.js'
export default {
  update (el, { value }) {
    const sprite = require('./emoji.png')
    const reg = /\[[\u4e00-\u9fa5]+\]/g
    const html = value.replace(reg, (str) => {
      const i = data.indexOf(str)
      const x = i % 15
      const y = Math.floor(i / 15)
      const px = `${-29 * x - 3}px`
      const py = `${-29 * y - 3}px`
      return `
        <span 
          class="emoji-item" 
          style="display: inline-block;
          width: 22px;
          height: 22px;
          background: url(${sprite});
          vertical-align: middle;
          background-position-x: ${px};
          background-position-y: ${py}; ">
        </span>
      `
    })
    el.innerHTML = html
  }
}
