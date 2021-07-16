/*
 * @Descripttion: ly-table公共方法
 * @version: 1.0.0
 * @Author: lw
 * @Date: 2021-03-23 17:48:08
 * @LastEditTime: 2021-06-02 16:18:24
 */
export default {
  data () {
    return {
      IMMEDIATE: true,
      tableData: [],
      selected: [],
      loading: false,
      page: 1,
      per_page: 10,
      total: 0,
      listData: null,
      params: {},
      sort: {}
    }
  },
  mounted () {},
  methods: {
    // 查询数据
    async queryData () {
      this.loading = true
      // 获取自定义参数
      this.params = this.formatterParams
        ? this.formatterParams(this.params)
        : this.params
      const res = await this.COMM_HTTP.reqQuery({
        page: this.page,
        per_page: this.per_page,
        ...this.sort,
        ...this.params
      })
      this.loading = false
      if (res.code !== 0) {
        this.tableData = res.list || res.data || res[this.DATA_LOCATION]
        this.total = res.total
        this.listData = res
        return res
      } else this.$message.error(res.msg)
    },
    searchChange (params) {
      this.params = params
      this.page = 1
      this.IMMEDIATE && this.queryData()
      this.IMMEDIATE = true
    },
    handleSizeChange (size) {
      this.page = 1
      this.per_page = size
      this.queryData()
    },
    handleSortChange ({ prop, order }) {
      if (order) {
        this.sort.order_by = prop
        this.sort.direction = order === 'descending' ? 'desc' : 'asc'
      } else {
        delete this.sort.order_by
        delete this.sort.direction
      }
      this.page = 1
      this.queryData()
    },
    handleCurrentChange (page) {
      console.log(page)
      this.page = page
      this.queryData()
    },
    handleSelectionChange (select) {
      this.selected = select
    },
    // 处理table组件传过来的事件
    handleEvents (e) {
      switch (e.event) {
        case 'delete':
          this.handleDelete(e.data)
          break
        case 'detail':
          this.handleDetail(e.data)
          break
        case 'edit':
          this.handleEdit(e.data)
          break
        default:
          break
      }
    },
    handleDelete (row) {
      const field = this.FIELD || 'id'
      const params = {
        [field]: row[field]
      }
      this.COMM_HTTP.reqDelete(params).then(res => {
        if (res.code !== 0) this.$message.success('删除成功')
        else this.$message.error(res.msg)
        this.queryData()
      })
    },
    handleDetail (row) {
      console.error('内置详情功能开发中')
    },
    handleEdit (row) {
      console.error('内置编辑功能开发中')
    }
  }
}
