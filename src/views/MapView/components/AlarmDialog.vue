<template>
  <m-dialog
    className="alarm-dialog"
    title="报警列表"
    v-on="$listeners"
    v-bind="$attrs"
  >
    <el-row type="flex" align="center" class="dialog-operation">
      <el-select style="width: 130px" v-model="value" placeholder="请选择">
        <el-option label="报警类型" value="1" />
        <el-option label="处理状态" value="2" />
        <el-option label="报警等级" value="3" />
      </el-select>
      <div class="options">
        <el-tag effect="dark">一级(5)</el-tag>
        <el-tag effect="dark">二级(10)</el-tag>
      </div>
    </el-row>
    <div class="dialog-table">
      <el-table :data="alarmTableData">
        <template v-if="isYj">
          <el-table-column
            prop="alarmCategory"
            label="告警类型"
            align="center"
            width="220"
          />
          <el-table-column
            prop="subject"
            label="告警目标"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="alarmTime"
            label="告警时间"
            align="center"
            width="180"
          />
          <el-table-column label="操作" align="center" width="180px">
            <template slot-scope="{ row }">
              <el-button size="mini" type="primary">确认</el-button>
              <el-button size="mini" type="info" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column
            prop="areaName"
            label="告警区域"
            align="center"
            width="200"
          />
          <el-table-column
            prop="alarmName"
            label="告警类型"
            align="center"
            width="110"
          />
          <el-table-column
            prop="targetName"
            label="告警目标"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="alarmTime"
            label="告警时间"
            align="center"
            width="180"
          />
          <el-table-column label="操作" align="center" width="170px">
            <template slot-scope="{ row }">
              <el-button size="mini" type="primary">确认</el-button>
              <el-button size="mini" type="info" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </div>
    <div class="pagination">
      <a
        href="javascript:;"
        class="fl"
        v-if="pagination.pageNum > 1"
        @click="prevPage"
      >
        上一页
      </a>
      <a
        href="javascript:;"
        class="fr"
        v-if="pagination.pageNum < pagination.pager"
        @click="nextPage"
      >
        下一页
      </a>
    </div>
  </m-dialog>
</template>

<script>
import { getPage } from '@/api/index'

export default {
  inheritAttrs: false,
  data() {
    return {
      pagination: {
        pageNum: 1,
        pageSize: 5,
        pager: 0
      },
      isYj: false,
      url: '',
      alarmTableData: [],
      value: '1'
    }
  },
  methods: {
    getList(isYj) {
      this.isYj = isYj
      this.url = isYj ? '/alarmInfo/yjPage' : '/alarmInfo/page'
      this.pagination.pageNum = 1
      this.getDataList()
    },
    prevPage() {
      this.pagination.pageNum--
      this.getDataList()
    },
    nextPage() {
      this.pagination.pageNum++
      this.getDataList()
    },
    async getDataList() {
      const { pageNum, pageSize } = this.pagination
      const params = { pageNum, pageSize }
      const { data } = await getPage(this.url, params)
      this.pagination.pager = Math.ceil(data.total / pageSize)
      this.alarmTableData = data.list
    },
    handleDelete(row) {}
  }
}
</script>

<style lang="scss" scoped>
.alarm-dialog {
  width: 940px;
  height: 450px;
  padding: 33px 42px;
  background-image: url('@/assets/image/alarm-bg.png');
  z-index: 4;
}
.dialog-operation .options {
  margin-left: 20px;
}
</style>
