<template>
  <div class="section">
    <span class="click-active alarm-region" @click="alarmRegionClick"></span>
    <span class="click-active alarm-icon1" @click="alarmClick(false)"></span>
    <span class="click-active alarm-icon2" @click="alarmClick(true)"></span>

    <!-- 弹框-报警模块 -->
    <m-dialog
      className="region-dialog"
      title="报警模块"
      :visible.sync="showAlarmModule"
    >
      <el-row
        type="flex"
        align="middle"
        justify="space-between"
        class="dialog-operation"
      >
        <el-button
          type="primary"
          plain
          icon="el-icon-circle-plus-outline"
          @click="addAreaClick"
          >新增
        </el-button>
        <div class="hide-all-area">
          <el-checkbox @change="hideAllArea">隐藏所有区域</el-checkbox>
        </div>
      </el-row>
      <div class="dialog-table">
        <el-table :data="tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" align="center" width="60px" />
          <el-table-column label="名称" align="center">
            <template slot-scope="{ $index, row }">
              <el-link :underline="false" @click="positionClick($index)">
                {{ row.areaName }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="110px">
            <template slot-scope="{ row }">
              <el-button size="mini" type="danger" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
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

    <!-- 弹框-新增 -->
    <m-dialog
      className="add-dialog"
      title="新增"
      :visible.sync="showAddArea"
      @close="reset"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="区域名称" prop="areaName">
          <el-input
            v-model.trim="form.areaName"
            placeholder="请输入区域名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="绘制形状" prop="areaScopeType">
          <el-input v-show="false" v-model="form.areaScopeType" disabled />
          <el-tag
            v-for="(item, index) in shapes"
            :key="index"
            :class="{ active: shapeType === item.type }"
            @click="changeShape(item.type)"
          >
            <img :src="item.shapePath" alt="" />
          </el-tag>
        </el-form-item>
        <el-form-item label="模板下载">
          <el-button>导入坐标</el-button>
        </el-form-item>
        <div class="divider"></div>
        <el-row :gutter="20">
          <el-col :span="13">
            <el-form-item label="边框颜色" prop="areaOutsideColor">
              <el-input v-model="form.areaOutsideColor" disabled>
                <el-color-picker
                  slot="suffix"
                  size="small"
                  v-model="form.areaOutsideColor"
                />
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="边框透明度" prop="areaOutsideOpacity">
              <el-input-number
                style="width: 100%"
                controls-position="right"
                v-model="form.areaOutsideOpacity"
                :min="1"
                :max="100"
              />
              <!-- <el-input v-model.trim="form.areaOutsideOpacity" /> -->
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="边框样式" prop="areaOutsideStyle">
          <el-select
            style="width: 150px"
            v-model="form.areaOutsideStyle"
            placeholder="请选择"
          >
            <el-option label="实线" value="solid" />
            <el-option label="虚线" value="dashed" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="13">
            <el-form-item label="填充颜色" prop="areaInsideColor">
              <el-input v-model="form.areaInsideColor" disabled>
                <el-color-picker
                  slot="suffix"
                  size="small"
                  v-model="form.areaInsideColor"
                />
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="11">
            <el-form-item label="填充透明度" prop="areaInsideOpacity">
              <el-input-number
                style="width: 100%"
                controls-position="right"
                v-model="form.areaInsideOpacity"
                :min="1"
                :max="100"
              />
              <!-- <el-input v-model.trim="form.areaInsideOpacity" /> -->
            </el-form-item>
          </el-col>
        </el-row>
        <div class="divider"></div>
        <el-form-item label-width="0" style="text-align: center">
          <el-button type="primary" size="medium" @click="save">保存</el-button>
          <el-button type="info" size="medium" @click="reset">取消</el-button>
        </el-form-item>
      </el-form>
    </m-dialog>

    <!-- 弹框-报警列表 -->
    <alarm-dialog ref="alarmDialog" :visible.sync="showAlarm" />
  </div>
</template>

<script>
import alarmDialog from './AlarmDialog.vue'
import { getPage, getByRegion, saveArea } from '@/api/index'
import {
  renderDrawFeature,
  destroyDrawLayer,
  positionFeature,
  drawGraph,
  removeInteraction,
  renderYjPoints
} from '@/utils/map'

export default {
  components: { alarmDialog },
  data() {
    var validAreaScopeType = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择绘制形状'))
      } else if (this.areaScope.length === 0) {
        callback(new Error('请绘制区域'))
      } else {
        callback()
      }
    }
    return {
      showAlarmModule: false,
      tableData: [],
      pagination: {
        pageNum: 1,
        pageSize: 10,
        pager: 0
      },
      showAddArea: false,
      form: {
        areaOutsideColor: '#445DA7',
        areaOutsideOpacity: 100,
        areaOutsideStyle: 'solid',
        areaInsideColor: '#445DA7',
        areaInsideOpacity: 100
      },
      rules: {
        areaName: [
          { required: true, message: '请输入区域名称', trigger: 'blur' }
        ],
        areaScopeType: [{ validator: validAreaScopeType, trigger: 'blur' }],
        areaOutsideColor: [
          { required: true, message: '请选择边框颜色', trigger: 'blur' }
        ],
        areaInsideColor: [
          { required: true, message: '请选择填充颜色', trigger: 'blur' }
        ]
      },
      shapes: [
        { type: 'Polygon', shapePath: require('@/assets/image/polygon.png') },
        { type: 'Circle', shapePath: require('@/assets/image/circle.png') }
      ],
      shapeType: '',
      areaScope: [],
      radius: '',
      showAlarm: false
    }
  },
  mounted() {
    this.getYJRegion()
  },
  methods: {
    alarmRegionClick() {
      let data = {}
      data.type = '关闭大屏UI'
      this.$parent.socket.send(JSON.stringify(data))

      this.showAlarmModule = true
      this.getAreaPage()
    },
    async getAreaPage() {
      const { pageNum, pageSize } = this.pagination
      const params = { pageNum, pageSize }
      const { data } = await getPage('/api/alarmInfo/areaList', params)
      this.pagination.pager = Math.ceil(data.total / pageSize)
      this.tableData = data.list

      const points = data.list.reduce((cur, item) => {
        const areaScope = JSON.parse(item.areaScope)
        const curItem = areaScope.map((v) => {
          const { longitude, latitude } = v
          return [longitude, latitude]
        })
        cur.push({
          ...item,
          areaScope: item.areaScopeType === 1 ? curItem : curItem[0]
        })
        return cur
      }, [])
      renderDrawFeature(points)
    },
    prevPage() {
      this.pagination.pageNum--
      this.getAreaPage()
    },
    nextPage() {
      this.pagination.pageNum++
      this.getAreaPage()
    },
    hideAllArea(val) {
      destroyDrawLayer(val)
    },
    positionClick(idx) {
      positionFeature(idx)
    },
    handleSelectionChange() {},
    handleDelete(row) {},
    addAreaClick() {
      this.showAddArea = true
    },
    changeShape(type) {
      this.shapeType = type
      this.draw(type)
    },
    async getYJRegion() {
      const { result } = await getByRegion()
      const points = result.targets
      renderYjPoints(points)
    },
    draw(type) {
      this.$set(this.form, 'areaScopeType', type === 'Polygon' ? 1 : 2)
      removeInteraction()

      drawGraph(type, (res) => {
        const { areaScope, radius } = res
        this.areaScope = areaScope.map((item) => {
          return {
            longitude: item[0],
            latitude: item[1]
          }
        })
        this.radius = radius
      })
    },
    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const { areaScope, radius } = this
          const params = {
            ...this.form,
            areaScope: JSON.stringify(areaScope),
            radius
          }
          saveArea(params).then((res) => {
            this.reset()
            this.getAreaPage()
          })
        }
      })
    },
    reset() {
      removeInteraction()
      this.shapeType = ''
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    },
    async alarmClick(isYj) {
      this.showAlarm = true
      this.$refs.alarmDialog.getList(isYj)
    }
  }
}
</script>

<style lang="scss" scoped>
.section {
  position: absolute;
  right: 10px;
  bottom: 20px;
  .click-active {
    display: inline-block;
    margin-left: 20px;
    background-size: 100% 100%;
    cursor: pointer;
    &:first-child {
      margin-left: 0;
    }
  }
  .alarm-region {
    width: 38px;
    height: 38px;
    background-image: url('@/assets/image/alarm-region.png');
  }
  .alarm-icon1 {
    width: 47px;
    height: 46px;
    background-image: url('@/assets/image/alarm-icon1.png');
  }
  .alarm-icon2 {
    width: 47px;
    height: 46px;
    background-image: url('@/assets/image/alarm-icon2.png');
  }
}
.region-dialog {
  width: 480px;
  height: 680px;
  padding: 30px 45px;
  background-image: url('@/assets/image/add-bg.png');
  z-index: 4;
}
.add-dialog {
  width: 480px;
  padding: 25px 45px;
  background-image: url('@/assets/image/add-bg.png');
  z-index: 5;
  .divider {
    margin-left: 15px;
    margin-bottom: 25px;
    border-bottom: 1px dashed #007aff;
  }
  :deep(.dialog-body) {
    padding-left: 0;
    padding-right: 16px;
  }
}

/* 按钮样式 */
.el-button {
  :deep(i) {
    font-size: 18px;
    color: #1acbfe;
    vertical-align: bottom;
  }
  // 功能按钮
  &--primary.is-plain {
    padding: 10px 16px;
    font-size: 16px;
  }
}
</style>
