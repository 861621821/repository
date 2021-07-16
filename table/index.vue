<!--
 * @Descripttion: saas平台表格组件，基于el-table
 * @version: 1.0.0
 * @Author: lw
 * @Date: 2021-03-16 18:49:51
 * @LastEditTime: 2021-07-02 14:58:16
-->
<template>
  <div
    class="xl-ly-table"
    v-loading="tableLoading"
    element-loading-spinner="lyloading"
    element-loading-background="rgba(255, 255, 255, 0.5)"
  >
    <!-- 搜索区域 -->
    <search
      :fields="getSearchFields()"
      @change="handleSearchChange"
      :slots="$slots"
      :label-width="option.labelWidth"
      :hasSearch="option.hasSearch"
    ></search>
    <!-- 表格设置及自定义功能区域 -->
    <setting
      :columns="columns"
      :setting="option.setting"
      :tableKey="option.tableKey"
      @update="doLayout"
    >
      <slot name="handler"></slot>
      <template #handlerright>
        <slot name="handlerright"></slot>
      </template>
    </setting>
    <slot name="count"></slot>
    <!-- 表格主体 -->
    <el-table
      ref="elTable"
      stripe
      :data="data"
      v-bind="option.tableProps"
      style="width: 100%"
      :header-cell-style="{ background: 'rgba(0, 0, 0, .02', color: '#262626' }"
      @selection-change="(val) => $emit('selectionChange', val)"
      @sort-change="
        (column, prop, order) => $emit('sortChange', column, prop, order)
      "
    >
      <el-table-column
        v-if="option.showSelection"
        type="selection"
        width="54"
      ></el-table-column>
      <el-table-column
        v-if="option.showIndex"
        type="index"
        :index="getIndex"
        label="序号"
        width="80"
      ></el-table-column>
      <template v-for="column in finalColumns">
        <el-table-column
          v-if="column.slot"
          :prop="column.prop"
          :key="column.prop"
          :width="column.width"
          :fixed="column.fixed"
          :show-overflow-tooltip="column.showOverflowTooltip"
          :sortable="column.sortable"
          v-bind="column.columnProps"
        >
          <!-- 表头插槽 -->
          <template slot="header">
            <slot
              v-if="column.headerSlot"
              :label="column.label"
              :name="column.headerSlot"
            ></slot>
            <span v-else>{{ column.label }}</span>
          </template>
          <!-- 单元格插槽 -->
          <template slot-scope="scope">
            <slot :row="scope.row" :name="column.slot"></slot>
          </template>
        </el-table-column>
        <el-table-column
          v-else
          :prop="column.prop"
          :key="column.prop"
          :width="column.width"
          :fixed="column.fixed"
          :show-overflow-tooltip="column.showOverflowTooltip"
          :sortable="column.sortable"
          :formatter="column.formatter || formatter"
          v-bind="column.columnProps"
        >
          <!-- 表头插槽 -->
          <template slot="header" slot-scope="scope">
            <slot
              v-if="column.headerSlot"
              :row="scope"
              :name="column.headerSlot"
            ></slot>
            <span v-else>{{ column.label }}</span>
          </template>
        </el-table-column>
      </template>
      <!-- 操作列 -->
      <el-table-column
        v-if="option.operation !== 'hide'"
        label="操作"
        class-name="operation-cell"
        :width="option.operationWidth"
      >
        <template slot-scope="scope">
          <el-button
            :type="item.type || 'text'"
            size="small"
            @click="item.handler(scope.row)"
            v-for="item in operationMenu"
            :key="item.label"
            >{{ item.label }}</el-button
          >
          <slot :row="scope.row" name="operation"></slot>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="table-pagination-area" v-if="option.layout !== 'hide'">
      <el-pagination
        background
        :class="{ fixedPagination }"
        :current-page="page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :layout="option.layout || 'total, sizes, prev, pager, next, jumper'"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script>
import search from './search'
import setting from './setting'
import { debounce } from 'throttle-debounce'
export default {
  components: {
    search, setting
  },
  props: ['data', 'option', 'tableLoading', 'pageSize', 'page', 'total'],
  data () {
    return {
      fixedPagination: false,
      finalColumns: []
    }
  },
  watch: {
    data: {
      handler () {
        this.option.layout !== false && this.option.levitate !== false && this.initScroll()
      },
      deep: true
    }
  },
  computed: {
    columns () {
      return this.option.column.filter(e => {
        return !e.hide
      })
    },
    el () {
      return document.querySelector(this.option.scrollEl) || document.querySelector('.xl-ly-table').parentNode
    },
    scrollThrottle () {
      return debounce(50, this.handleScroll)
    },
    operationMenu () {
      const operation = this.option.operation || []
      return operation.map(e => {
        if (typeof e === 'string') {
          if (e === 'detail') {
            return {
              label: '详情',
              handler: this.detail
            }
          } else if (e === 'delete') {
            return {
              label: '删除',
              handler: this.delete
            }
          } else if (e === 'edit') {
            return {
              label: '编辑',
              handler: this.edit
            }
          }
        } else return e
      })
    }
  },
  beforeMount () {
    // 获取表格的用户设置
    this.doLayout()
  },
  mounted () {
    if (this.option.levitate !== false && this.option.layout !== 'hide') {
      this.el.onscroll = this.scrollThrottle
    }
  },
  methods: {
    // 获取搜索栏位
    getSearchFields () {
      const arr = this.option.column.filter(e => {
        return e.search
      })
      return arr.sort((a, b) => {
        return (a.sort || 999999) - (b.sort || 999999)
      })
    },
    // 搜索栏位变动的回调
    handleSearchChange (obj) {
      this.$emit('searchChange', obj)
    },
    handleSizeChange (size) {
      this.$emit('sizeChange', size)
    },
    handleCurrentChange (current) {
      this.$emit('currentChange', current)
    },
    formatter (row, column, cellValue, index) {
      if (cellValue === '' || cellValue === null || cellValue === undefined || (cellValue instanceof Array && cellValue.length === 0)) {
        return '-'
      }
      return cellValue
    },
    getIndex (i) {
      return (this.page - 1) * this.pageSize + i + 1
    },
    handleScroll () {
      const clientHeight = document.documentElement.clientHeight
      const pageingBottom = document.querySelector('.table-pagination-area').getBoundingClientRect().bottom
      this.fixedPagination = clientHeight - pageingBottom < 30
    },
    initScroll () {
      // 手动触发一次scroll
      const event = document.createEvent('Event')
      event.initEvent('scroll', true, true)
      this.el.dispatchEvent(event)
    },
    // 内置按钮回调
    detail (row) {
      this.$emit('events', { event: 'detail', data: row })
    },
    delete (row) {
      this.$confirm('此操作无法撤销, 是否确定删除?', '确认要删除吗？', {
        customClass: 'delconfirm',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('events', { event: 'delete', data: row })
      }).catch(() => { })
    },
    edit (row) {
      this.$emit('events', { event: 'edit', data: row })
    },
    // 表格设置改变的回调
    doLayout () {
      const { hide = [], sort = {} } = (JSON.parse(localStorage.getItem('tableField')) || {})[this.option.tableKey] || {}
      const arr = this.columns.filter(e => {
        return hide.indexOf(e.prop) < 0
      })
      arr.sort((a, b) => {
        const aS = sort[a.prop] || 0
        const bS = sort[b.prop] || 0
        return aS - bS
      })
      // 不知道为啥  只有这么写才能刷新
      this.finalColumns = []
      this.$nextTick(() => {
        this.finalColumns = arr
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.xl-ly-table {
  display: flex;
  flex-direction: column;
  ::v-deep {
    .el-table {
      flex: 1;
    }
    .el-table td {
      padding: 15px 0;
    }
    .el-table thead th {
      line-height: 48px;
    }
    .el-table .cell {
      padding: 0 16px;
    }
    .el-pagination {
      text-align: right;
      margin-top: 10px;
    }
    .el-button--text {
      padding: 0;
      height: unset;
    }
  }
  .table-pagination-area {
    width: 100%;
    height: 60px;
    display: flex;
    justify-content: flex-end;
    transition: all 0.3s;
    .el-pagination {
      width: 100%;
      height: 60px;
      text-align: right;
      display: flex;
      left: 0;
      justify-content: flex-end;
      align-items: center;
      box-sizing: border-box;
    }
  }
  .fixedPagination {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
    position: fixed;
    bottom: 0;
    background: #fff;
    z-index: 99;
    // transition: all 0.2s;
    padding-right: 50px;
    li,
    button,
    input {
      background: #f5f7fa;
    }
  }
}
</style>
<style>
.delconfirm {
  position: relative;
}
.delconfirm .el-message-box__header {
  padding-left: 60px;
}
.delconfirm .el-message-box__status {
  position: absolute;
  top: -28px;
}
</style>
