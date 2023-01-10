<template>
  <transition>
    <div class="dialog" :class="className" v-drag v-if="visible">
      <div class="dialog-header">
        <div class="dialog-title">
          <span class="line"></span>
          <span>{{ title }}</span>
        </div>
        <div class="dialog-close" @click="close"></div>
      </div>
      <div class="dialog-body">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    className: {
      type: String,
      default: '',
      require: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
/* 弹窗公共样式 */
.dialog {
  padding: 30px 45px;
  position: fixed;
  left: 20%;
  top: 80px;
  background-size: 100% 100%;
  z-index: 5;
  &-header {
    padding: 10px 0 20px;
    position: relative;
    cursor: move;
  }
  &-title {
    height: 34px;
    line-height: 34px;
    font-size: 24px;
    display: flex;
    align-items: center;
    color: #fff;
    .line {
      width: 4px;
      height: 22px;
      background-color: #1acbfe;
      margin-right: 6px;
    }
  }
  &-close {
    width: 36px;
    height: 36px;
    position: absolute;
    right: -6px;
    top: 4px;
    background-image: url('@/assets/image/alarm-close.png');
    background-size: 100% 100%;
    cursor: pointer;
  }
  &-body {
    padding: 0 16px;
  }
}
</style>
