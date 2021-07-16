<!--
 * @Descripttion: 表格组件搜索部分
 * @version: 1.0.0
 * @Author: lw
 * @Date: 2021-03-16 19:06:43
 * @LastEditTime: 2021-07-02 15:01:03
-->
<template>
  <el-form ref="form" :model="form" inline size="medium">
    <el-form-item
      :label="item.label + '：'"
      v-for="item in fields"
      :key="item.prop"
    >
      <!-- 插槽形式 -->
      <template v-if="item.searchSlot">
        <form-slot :node="slots[item.searchSlot]" />
      </template>

      <template v-else>
        <!-- 下拉框 -->
        <el-select
          v-model="form[item.key || item.prop]"
          v-if="item.type === 'select'"
          :clearable="item.clearable === 0 ? false : true"
          :placeholder="item.placeholder || '请选择'"
        >
          <el-option
            v-for="op in selectOption[item.prop]"
            :key="op[item.sourceField ? item.sourceField.value : 'value']"
            :value="op[item.sourceField ? item.sourceField.value : 'value']"
            :label="op[item.sourceField ? item.sourceField.label : 'label']"
          ></el-option>
        </el-select>
        <!-- 日期选择器 -->
        <el-date-picker
          v-else-if="item.type === 'daterange'"
          v-model="temp[item.prop]"
          type="daterange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          @change="handleDateChange(item)"
          :picker-options="item.pickerOptions || pickerOptions"
          v-bind="item.formItemProps"
        >
        </el-date-picker>
        <!-- 日期时间选择器 -->
        <el-date-picker
          v-else-if="item.type === 'datetimerange'"
          v-model="temp[item.prop]"
          type="datetimerange"
          range-separator="~"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          @change="handleDateTimeChange(item)"
          :picker-options="pickerOptions"
          v-bind="item.formItemProps"
        >
        </el-date-picker>
        <!-- 时间段选择器 -->
        <time-select-range
          v-model="temp[item.prop]"
          @change="handleTimeChange(item)"
          v-else-if="item.type === 'timeintervalrange'"
          v-bind="item.formItemProps"
        ></time-select-range>
        <!-- 员工选择器 -->
        <emp-select
          @getEmpId="(ids) => setEmpId(ids, item)"
          :checkProp="form[item.key]"
          v-else-if="item.type === 'emp'"
        ></emp-select>
        <!-- 输入框 -->
        <el-input
          v-model.trim="form[item.key || item.prop]"
          v-else
          clearable
          :placeholder="item.placeholder || '请输入'"
        ></el-input>
      </template>
    </el-form-item>
    <el-form-item v-if="fields.length > 0 && hasSearch">
      <el-button @click="fn_search">查询</el-button>
    </el-form-item>
    <el-form-item v-if="fields.length > 0 && hasSearch">
      <el-button @click="fn_reset">重置</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import { debounce } from 'throttle-debounce'
import empSelect from '@/components/EmpSelectNew'
import TimeSelectRange from '@/components/TimeSelectRange'
export default {
  // props: ['fields', 'slots', 'label-width'],
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    slots: {
      type: Object,
      default: () => { }
    },
    labelWidth: {
      type: String,
      default: '70px'
    },
    hasSearch: { // 是否显示查询和重置按钮，单只有一个下拉框条件的时候，两个按钮使得操作繁琐
      type: Boolean,
      default: true
    }
  },
  components: {
    empSelect,
    TimeSelectRange,
    formSlot: {
      render (h) {
        return h('div', { className: 'form-item-slot' }, this.node)
      },
      props: ['node']
    }
  },
  data () {
    const disabledDate = (time) => {
      let _date = new Date()
      if (_date.toString().indexOf('GMT-08:00') > -1) {
        _date = new Date((_date.getTime() + (1 / 24 * 16 * 8.64e7)))
      }
      const _times = this.$day(this.$day(_date).format('YYYY-MM-DD') + ' 23:59:59')
      return time.getTime() > _times.valueOf()
    }
    return {
      form: {},
      temp: {},
      selectOption: {},
      pickerOptions: {
        disabledDate: (time) => {
          return disabledDate(time)
        }
      }
    }
  },
  watch: {
    form: {
      handler (n, o) {
        if (!this.hasSearch) {
          this.debounceChange(n, o)
        }
      },
      deep: true
    }
  },
  mounted () {
    this.debounceChange = debounce(300, this.handlerChange)
    this.initFrom()
    this.debounceChange(this.form)
  },
  methods: {
    fn_search () {
      this.debounceChange(this.form)
    },
    fn_reset () {
      for (const key in this.fields) {
        const _type = this.fields[key].type
        if (_type === 'daterange' || _type === 'datetimerange' || _type === 'timeintervalrange') {
          if (this.fields[key].formItemProps && this.fields[key].formItemProps.clearable !== undefined && !this.fields[key].formItemProps.clearable) {
            this.temp[this.fields[key].prop] = this.fields[key].default
            this.fields[key].key.map((e, i) => {
              if (i === 0) {
                this.form[this.fields[key].key[i]] = parseInt(this.temp[this.fields[key].prop][0] / 1000)
              } else {
                this.form[this.fields[key].key[i]] = parseInt(this.temp[this.fields[key].prop][1] / 1000)
              }
            })
          } else {
            this.temp[this.fields[key].prop] = []
            for (const date in this.fields[key].key) {
              this.form[this.fields[key].key[date]] = ''
            }
          }
        } else {
          if (this.fields[key].key) {
            this.form[this.fields[key].key] = this.fields[key].default || ''
          } else {
            this.form[this.fields[key].prop] = this.fields[key].default || ''
          }
        }
      }
      this.debounceChange(this.form)
    },
    initFrom () {
      if (!this.fields.length) {
        this.$emit('change', {})
      }
      this.fields.map(e => {
        if (e.key || e.prop) {
          if (e.key && e.key instanceof Array) {
            this.$set(this.temp, e.prop, e.default || [])
            e.key.map(key => {
              this.$set(this.form, key, '')
            })
          } else {
            this.$set(this.form, e.key || e.prop, e.default === undefined ? '' : e.default)
          }

          if (e.type === 'select') {
            if (e.source instanceof Array) {
              this.selectOption[e.prop] = e.source
            } else {
              e.source().then((res) => {
                if ((res && res.code) || (res && res.code === 0)) {
                  this.$message.error(res.msg)
                  return false
                }
                this.selectOption[e.prop] = res
              })
            }
          }

          if (e.type === 'daterange' || e.type === 'datetimerange' || e.type === 'timeintervalrange') {
            if (e.default) {
              this.$set(this.form, e.key[0], e.type === 'timeintervalrange' ? e.default[0] : parseInt(e.default[0] / 1000))
              this.$set(this.form, e.key[1], e.type === 'timeintervalrange' ? e.default[1] : parseInt(e.default[1] / 1000))
            }
          }
        }
      })
    },
    setEmpId (ids, item) {
      this.form[item.key || item.prop] = ids && ids.length > 0 ? ids.join(',') : null
    },
    handlerChange (newForm) {
      const params = {}
      for (const key in newForm) {
        if (newForm[key] !== null && newForm[key] !== '') {
          params[key] = newForm[key]
        }
      }
      this.$emit('change', params)
    },
    handleDateChange (item) {
      item.key.map((e, i) => {
        if (i === 0) {
          this.form[e] = this.temp[item.prop] ? this.temp[item.prop][i] / 1000 : ''
        } else {
          this.form[e] = this.temp[item.prop] ? this.temp[item.prop][i] / 1000 + 24 * 60 * 60 - 1 : ''
        }
      })
    },
    handleDateTimeChange (item) {
      item.key.map((e, i) => {
        this.form[e] = this.temp[item.prop] ? this.temp[item.prop][i] / 1000 : ''
      })
    },
    handleTimeChange (item) {
      item.key.map((e, i) => {
        this.form[e] = this.temp[item.prop][i]
      })
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-form-item__label {
    padding: 0;
  }
  .el-form-item {
    margin-bottom: 24px;
    margin-right: 20px !important;
  }
  .el-input--medium .el-input__inner {
    width: 224px;
  }
  .el-date-editor--daterange.el-input__inner {
    width: 224px !important;
  }
  .el-date-editor--datetimerange.el-input__inner {
    width: 300px;
  }
  .el-date-editor .el-range-separator {
    padding: 0 2px;
  }
  .el-date-editor .el-range__close-icon {
    width: 13px;
  }
}
</style>
