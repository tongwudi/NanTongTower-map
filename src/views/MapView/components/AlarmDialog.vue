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
      <el-table
        :data="alarmTableData"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" align="center" width="60px" />
        <el-table-column prop="areaName" label="名称" align="center" />
        <el-table-column label="操作" align="center" width="160px">
          <template slot-scope="{ row }">
            <el-button size="mini" type="primary" @click="handleDelete(row)">
              确认
            </el-button>
            <el-button size="mini" type="info" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination">
      <a href="javascript:;" class="fl">上一页</a>
      <a href="javascript:;" class="fr">下一页</a>
    </div>
  </m-dialog>
</template>

<script>
import mDialog from '@/components/m-dialog.vue'
export default {
  inheritAttrs: false,
  components: { mDialog },
  data() {
    return {
      alarmTableData: [
        { areaName: 'fd' },
        { areaName: 'fd' },
        { areaName: 'fd' },
        { areaName: 'fd' },
        { areaName: 'fd' }
      ],
      value: '1'
    }
  },
  methods: {
    handleSelectionChange() {},
    handleDelete(row) {}
  }
}
</script>

<style lang="scss" scoped>
.alarm-dialog {
  width: 900px;
  height: 450px;
  padding: 33px 42px;
  background-image: url('@/assets/image/alarm-bg.png');
  z-index: 4;
}
.dialog-operation .options {
  margin-left: 20px;
}
</style>
