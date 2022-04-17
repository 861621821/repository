<!--
 * @Descripttion:
 * @version:
 * @Author: lw
 * @Date: 2021-03-26 10:46:22
 * @LastEditTime: 2021-12-06 17:46:59
-->
<template>
  <div class="xl-ly-setting">
    <div class="handler-left">
      <slot/>
    </div>
    <div class="handler-right">
      <slot name="handlerright"/>
      <div class="sys-setting" v-if="setting">
        <i class="el-icon-setting" @click="dialogVisible = true"></i>
      </div>
    </div>
    <el-dialog
      title="设置显示字段"
      :visible.sync="dialogVisible"
      width="576px"
      @open="handleOpen"
    >
      <div class="setting-warp">
        <p>当前显示字段</p>
        <div id="tags" ref="tags">
          <el-tag
            v-for="tag in finalColumns"
            :key="tag.prop"
            :prop="tag.prop"
            :closable="tag.hideable"
            size="medium"
            @close="addHide(tag)"
          >
            {{tag.label}}
          </el-tag>
        </div>
        <p>已隐藏字段</p>
        <div id="tags" ref="hideTags">
          <el-tag
            v-for="tag in finalHide"
            :key="tag.prop"
            closable
            size="medium"
            @close="removeHide(tag)"
          >
            {{tag.label}}
          </el-tag>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button round size="small" @click="dialogVisible = false">取消</el-button>
        <el-button round size="small"  type="primary" @click="hideChange">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import Sortable from 'sortablejs'
export default {
  props: ['columns', 'setting', 'tableKey'],
  data () {
    return {
      dialogVisible: false,
      hide: [],
      sort: {}
    }
  },
  computed: {
    // 最终应该显示的列
    finalColumns () {
      const arr = this.columns.filter(e => {
        return this.hide.indexOf(e.prop) < 0
      })
      arr.sort((a, b) => {
        const aS = this.sort[a.prop] || 0
        const bS = this.sort[b.prop] || 0
        return aS - bS
      })
      return arr
    },
    finalHide () {
      return this.columns.filter(e => {
        return this.hide.indexOf(e.prop) >= 0
      })
    }
  },
  beforeMount () {
    if (this.setting && !this.tableKey) {
      console.error(new Error('"tableKey" is required：当"setting"为true时,"tableKey"必填'))
    }
  },
  methods: {
    handleOpen () {
      this.$nextTick(() => {
        Sortable.create(this.$refs.tags, { animation: 150, onMove: this.handleUpdate })
      })
      this.getHideColumns()
    },
    // 获取隐藏的字段以及排序
    getHideColumns () {
      const { hide, sort } = (JSON.parse(localStorage.getItem('tableField')) || {})[this.tableKey] || {}
      this.hide = hide || []
      this.sort = sort || {}
    },
    // 隐藏列
    addHide (tag) {
      this.hide.push(tag.prop)
    },
    // 显示列
    removeHide ({ prop }) {
      const i = this.hide.indexOf(prop)
      this.hide.splice(i, 1)
      this.handleUpdate()
    },
    handleUpdate (e) {
      this.$nextTick(e => {
        const nodes = this.$refs.tags.querySelectorAll('.el-tag')
        Array.prototype.map.call(nodes, (e, i) => {
          const prop = e.getAttribute('prop')
          this.sort[prop] = i
        })
      })
    },
    hideChange () {
      const tableField = JSON.parse(localStorage.getItem('tableField')) || {}
      const params = {
        sort: this.sort,
        hide: this.hide
      }
      tableField[this.tableKey] = params
      localStorage.setItem('tableField', JSON.stringify(tableField))
      this.dialogVisible = false
      this.$emit('update')
    }
  }
}
</script>
<style lang="scss" scoped>
.xl-ly-setting{
  display: flex;
  align-items: center;
  .handler-left, .handler-right{
    margin: 20px 0;
    &:empty{
      margin: 0;
    }
  }
  .handler-right{
    margin-left: auto;
  }
  .el-icon-setting{
    display: flex;
    font-size: 22px;
    color: #6E788A;
    cursor: pointer;
  }
}
.setting-warp{
  p{
    margin: 0 0 10px;
    font-size: 12px;
  }
  #tags{
    display: flex;
    flex-wrap: wrap;
    &:nth-of-type(1) .el-tag{
      cursor: move;
    }
  }
  .el-tag{
    margin: 0 4px 8px;
    width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
    ::v-deep{
      .el-icon-close{
        position: absolute;
        top: 6px;
        right: 4px;
      }
    }
  }
}
</style>
