<!--
 * @Descripttion: saas平台表格组件，基于el-table
 * @version: 1.0.0
 * @Author: lw
 * @Date: 2021-03-16 18:49:51
 * @LastEditTime: 2022-01-20 15:58:10
-->
<template>
  <div class="xl-ly-table">
    <!-- 搜索区域 -->
    <search
      :fields="searchFields"
      @change="handleSearchChange"
      @search="isCustomerSeach = true"
      :slots="$slots"
      :label-width="option.labelWidth"
      :hasSearch="option.hasSearch"
    ></search>
    <div class="ly-table-main ly-shadow">
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
        v-show="showTable"
        :data="data"
        size="medium"
        v-bind="option.tableProps"
        :row-key="getRowKeys"
        style="width: 100%"
        @selection-change="(val) => $emit('selectionChange', val)"
        @row-click="(row, column, $event) => rowClick(row, column, $event)"
        @sort-change="
          (column, prop, order) => $emit('sortChange', column, prop, order)
        "
      >
        <el-table-column
          v-if="option.showSelection"
          :selectable="option.checkSelectable"
          :reserve-selection="true"
          type="selection"
          width="56"
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
            :align="column.align"
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
              <slot
                :row="scope.row"
                :index="scope.$index"
                :name="column.slot"
              ></slot>
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
            :align="column.align"
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
          align="right"
        >
          <template slot-scope="scope">
            <el-button
              round
              :type="item.type || 'text'"
              @click="item.handler(scope.row)"
              v-for="item in operationMenu"
              :key="item.label"
              >{{ item.label }}</el-button
            >
            <slot :row="scope.row" :index="scope.$index" name="operation"></slot>
          </template>
        </el-table-column>
        <div slot="empty" class="ly-table-empty">
          <slot name="empty">
            <template v-if="flag()">
              <template v-if="isCustomerSeach">
                <img src="@assets/svg/default/no_res.svg" alt="" />
                无搜索结果
              </template>
              <template v-else>
                <img src="@assets/svg/default/no_data.svg" alt="" />
                暂无数据
              </template>
            </template>
          </slot>
        </div>
      </el-table>
      <!-- 分页 -->
      <div class="table-pagination-area" v-if="option.layout !== 'hide'">
        <el-pagination
          background
          :class="{ fixedPagination: option.levitate !== false }"
          :current-page="page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :layout="option.layout || 'slot, sizes, prev, pager, next, jumper'"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
          <div class="pagination-slot">
            <span class="total">共{{total}}条记录</span>
            <slot name="pagination"></slot>
          </div>
        </el-pagination>
      </div>
    </div>
  </div>
</template>
<script>
import search from './search'
import setting from './setting'
// import { debounce } from 'throttle-debounce'
export default {
  components: {
    search, setting
  },
  props: ['data', 'option', 'pageSize', 'page', 'total'],
  inject: ['flag'],
  data () {
    return {
      fixedPagination: true,
      finalColumns: [],
      isCustomerSeach: false,
      showTable: false // 解决闪烁问题
    }
  },
  watch: {
    // 悬浮分页功能
    // data: {
    //   handler () {
    //     this.option.layout !== false && this.option.levitate !== false && this.initScroll()
    //   },
    //   deep: true
    // }
  },
  computed: {
    columns () {
      return this.option.column.filter(e => {
        return !e.hide
      })
    },
    // 搜索栏位
    searchFields () {
      const arr = this.option.column.filter(e => {
        return e.search
      })
      return arr.sort((a, b) => {
        return (a.sort || 999999) - (b.sort || 999999)
      })
    },
    // el () {
    //   return document.querySelector(this.option.scrollEl) || document.querySelector('.xl-ly-table').parentNode
    // },
    // 悬浮分页功能
    // scrollThrottle () {
    //   return debounce(50, this.handleScroll)
    // },
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
    // 悬浮分页功能
    // if (this.option.levitate !== false && this.option.layout !== 'hide') {
    //   this.el.onscroll = this.scrollThrottle
    // }
    setTimeout(() => {
      this.showTable = true
    })
  },
  activated () {
    // 悬浮分页功能
    // this.option.layout !== false && this.option.levitate !== false && this.initScroll()
  },
  methods: {
    // 获取row-key 默认取id字段
    getRowKeys (row) {
      return this.option.showSelection ? row[this.option.rowKey || 'id'] : undefined
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
    // 悬浮分页功能
    // handleScroll () {
    //   const clientHeight = document.documentElement.clientHeight
    //   const pageingBottom = document.querySelector('.table-pagination-area').getBoundingClientRect().bottom
    //   this.fixedPagination = clientHeight - pageingBottom < -40
    // },
    // 悬浮分页功能
    // initScroll () {
    //   // 手动触发一次scroll
    //   const event = document.createEvent('Event')
    //   event.initEvent('scroll', true, true)
    //   this.el.dispatchEvent(event)
    // },
    // 内置按钮回调
    detail (row) {
      this.$emit('events', { event: 'detail', data: row })
    },
    delete (row) {
      this.$lyConfirm({
        text: '此操作无法撤销, 是否确定删除?',
        title: '确认要删除吗？',
        type: 'warning'
      }).then(() => {
        this.$emit('events', { event: 'delete', data: row })
      }).catch(() => { })
    },
    edit (row) {
      this.$emit('events', { event: 'edit', data: row })
    },
    rowClick (row, column, event) {
      if (this.$listeners.rowClick) {
        this.$emit('rowClick', row, column, event)
      }
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
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  ::v-deep {
    .el-table {
      flex: 1;
      &::before{
        content: unset;
      }
    }
    .el-table .cell {
      padding: 0 16px;
    }
    .el-button--text {
      padding: 0;
      height: unset;
    }
    .operation-cell{
      text-align: right;
    }
  }
  .ly-table-main{
    border-radius: 16px;
    background: #fff;
    padding: 0 20px;
    margin-bottom: 80px;
    flex: 1;
    overflow: hidden;
  }
  .table-pagination-area {
    width: 100%;
    height: 20px;
    display: flex;
    justify-content: flex-end;
    transition: all 0.3s;
    .el-pagination {
      height: 61px;
      text-align: right;
      right: 0;
      box-sizing: border-box;
      padding: 16px 20px 0 20px;
      ::v-deep{
        .el-pagination__total{
          display: none;
        }
      }
    }
    .pagination-slot{
      line-height: 32px;
      float: left;
      display: flex;
      align-items: center;
      .total{
        margin-right: 10px;
        font-weight: normal;
      }
    }
  }
  .fixedPagination {
    width: calc(100% - 260px)!important;
    box-shadow: 0px -2px 6px 0px rgba(0, 0, 0, 0.05);
    position: fixed;
    bottom: 0;
    background: #fff;
    z-index: 99;
    // transition: all 0.2s;
  }
}
</style>
