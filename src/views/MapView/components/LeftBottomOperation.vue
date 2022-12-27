<template>
  <div class="section">
    <span class="click-active legend-btn" @click="changeLegend"></span>
    <transition>
      <div class="legend legend-2" key="box2" v-if="showYj"></div>
      <div class="legend legend-1" key="box1" v-else></div>
    </transition>
    <span class="click-active area-btn" @click="changeForbidden"></span>
  </div>
</template>

<script>
import { destroyForbiddenLayer } from '@/utils/map'

export default {
  data() {
    return {
      showYj: false,
      isHide: false
    }
  },
  methods: {
    changeLegend() {
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
