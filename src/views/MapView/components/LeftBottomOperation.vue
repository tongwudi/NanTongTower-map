<template>
  <div class="section">
    <el-tooltip effect="dark" content="切换图例" placement="right">
      <span class="click-active legend-btn" @click="legendControl"></span>
    </el-tooltip>
    <el-tooltip effect="dark" content="切换雷达" placement="right">
      <span class="click-active radar-btn" @click="changeRadar"></span>
    </el-tooltip>
    <el-tooltip effect="dark" content="隐藏" placement="right">
      <span class="click-active area-btn" @click="changeForbidden"></span>
    </el-tooltip>

    <transition>
      <div class="legend legend-2" key="box2" v-if="showLegend && showYj"></div>
      <div class="legend legend-1" key="box1" v-else-if="showLegend && !showYj"></div>
    </transition>
  </div>
</template>

<script>
import { destroyForbiddenLayer } from '@/utils/map'

export default {
  data() {
    return {
      showLegend: false,
      showYj: false,
      isHide: false
    }
  },
  methods: {
    legendControl() {
      this.showLegend = !this.showLegend
    },
    changeRadar() {
      this.showYj = !this.showYj

      this.$emit('changePoint', this.showYj)
    },
    changeForbidden() {
      this.isHide = !this.isHide

      destroyForbiddenLayer(this.isHide)
    }
  }
}
</script>

<style lang="scss" scoped>
.section {
  position: absolute;
  left: 10px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  span {
    width: 38px;
    height: 38px;
    margin-top: 20px;
    background-size: 100% 100%;
    cursor: pointer;
    &:first-child {
      margin-top: 0;
    }
  }
  .legend-btn {
    background-image: url('@/assets/image/legend-icon.png');
  }
  .radar-btn {
    background-image: url('@/assets/image/radar-icon.png');
  }
  .area-btn {
    width: 36px;
    height: 32px;
    background-image: url('@/assets/image/area-icon.png');
  }
  .legend {
    position: absolute;
    left: calc(38px + 10px);
    bottom: -5px;
    background-size: 100% 100%;
    &-1 {
      width: 520px;
      height: 490px;
      background-image: url('@/assets/image/legend1.png');
    }
    &-2 {
      width: 320px;
      height: 220px;
      background-image: url('@/assets/image/legend2.png');
    }
  }
}
</style>
