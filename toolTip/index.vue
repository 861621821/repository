<!--
 * @Descripttion:
 * @version:
 * @Author: lw
 * @Date: 2021-05-19 11:48:01
 * @LastEditTime: 2021-06-03 15:23:06
-->
<template>
  <div id="tooltip">
    <el-tooltip
      ref="tlp"
      :content="content"
      effect="dark"
      :disabled="!tooltipFlag"
      :placement="placement"
      class="tooltip"
    >
      <span :class="className" @mouseenter="visibilityChange($event)">{{
        content
      }}</span>
    </el-tooltip>
    <span class="contrast">{{ content }}</span>
  </div>
</template>

<script>
export default {
  props: {
    content: { type: String, default: '' }, // 字符内容
    placement: { type: String, default: 'top' },
    className: { type: String, default: 'text-content' } // class
  },
  data () {
    return {
      disabledTip: false,
      tooltipFlag: false
    }
  },
  methods: {
    // tooltip的可控
    visibilityChange (event) {
      const ev = event.target
      const ev_height = ev.offsetHeight // 文本的实际高度
      const content_height = ev.nextSibling.clientHeight // 文本容器高度
      if (content_height > ev_height) {
        // 文本容器高度 > 文本高度 => 内容溢出
        this.tooltipFlag = true // NameIsIncludeWord ? true : !!false
      } else {
        // 否则为不溢出
        this.tooltipFlag = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
#tooltip {
  display: flex;
  position: relative;
}
.text-content {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.contrast {
  position: absolute;
  visibility: hidden;
  top: 0;
  left: 0;
}
</style>
