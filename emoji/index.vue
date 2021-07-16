<template>
  <el-popover
    placement="bottom-start"
    class="ly-emoji"
    trigger="click"
    v-model="visible">
    <div class="emoji-list">
      <span class="item" v-for="(item,i) in 105" :key="item" :style="getPosition(i)" @click="setEmoji(i)"></span>
    </div>
    <slot slot="reference"></slot>
  </el-popover>
</template>

<script>
import data from './emojiList.js'
export default {
  data () {
    return {
      visible: false
    }
  },
  methods: {
    getPosition (i) {
      const x = i % 15
      const y = Math.floor(i / 15)
      return {
        backgroundPositionX: `${-29 * x - 1}px`,
        backgroundPositionY: `${-29 * y - 2}px`
      }
    },
    setEmoji (i) {
      this.visible = false
      this.$emit('change', data[i])
    }
  }
}
</script>

<style lang="scss" scoped>
.ly-emoji{
  line-height: 1;
}
.emoji-list{
  width: 420px;
  .item{
    display: inline-block;
    width: 26px;
    height: 24px;
    margin: 0 1px;
    background-image: url(./emoji.png);
    cursor: pointer;
    &:hover{
      background-color: #eaeaea;
    }
  }
}
</style>
