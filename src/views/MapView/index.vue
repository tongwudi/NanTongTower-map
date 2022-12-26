<template>
  <div id="map">
    <LeftBottomOperation @changeForbidden="changeForbidden" />
    <RightBottomOperation />

    <ul class="ws-modal" :style="styles" v-show="showWSModal">
      <li>
        <span>船名：</span><span>{{ featureInfo.name }}</span>
      </li>
      <li>
        <span>船长：</span><span>{{ featureInfo.length }}米</span>
      </li>
      <li>
        <span>航向：</span><span>{{ featureInfo.course }}</span>
      </li>
      <li>
        <span>航速：</span><span>{{ featureInfo.speed }}</span>
      </li>
      <li>
        <span>经度：</span><span>{{ featureInfo.longitude }}</span>
      </li>
      <li>
        <span>纬度：</span><span>{{ featureInfo.latitude }}</span>
      </li>
      <li>
        <span>状态：</span><span>{{ featureInfo.state | filterState }}</span>
      </li>
      <li>
        <span>时间：</span><span>{{ featureInfo.timestamp | fommatDate }}</span>
      </li>
      <li>
        <span>mmsi：</span><span>{{ featureInfo.mmsi }}</span>
      </li>
    </ul>

    <!-- 弹框-摄像 -->
    <m-dialog className="camera-dialog" title="报警" :visible.sync="showCamera">
      <div class="left fl">
        <div class="box box1"></div>
        <div class="box box2"></div>
        <div class="box box3"></div>
      </div>
      <div class="right fl">
        <ul>
          <li><span>报警内容：</span><span>XXXXXXXXXXXXXXXXXXXX</span></li>
          <li><span>报警时间：</span><span>XXXXXXXXXXXXXXXXXXXX</span></li>
          <li><span>报警类型：</span><span>XXXXXXXXXXXXXXXXXXXX</span></li>
          <li><span>经度：</span><span>XXXXXXXXXXXXXXXXXXXX</span></li>
          <li><span>纬度：</span><span>XXXXXXXXXXXXXXXXXXXX</span></li>
        </ul>
        <div class="box box4"></div>
      </div>
    </m-dialog>
  </div>
</template>

<script>
import LeftBottomOperation from './components/LeftBottomOperation'
import RightBottomOperation from './components/RightBottomOperation'
import { getShipName } from '@/api/index'
import {
  initMap,
  renderArea,
  destroyForbiddenLayer,
  renderPoints,
  timestampToTime
} from '@/utils/map'

export default {
  components: {
    LeftBottomOperation,
    RightBottomOperation
  },
  data() {
    return {
      socket: null,
      WSPATH: `${process.env.VUE_APP_WS}/ID=9999`,
      showWSModal: false,
      styles: {},
      featureInfo: {},
      showCamera: false
    }
  },
  filters: {
    filterState(val) {
      let str = ''
      switch (val) {
        case 1:
          str = '正常'
          break
        case 2:
          str = '预测'
          break
        default:
          str = '丢失'
      }
      return str
    },
    fommatDate(val) {
      return timestampToTime(val)
    }
  },
  mounted() {
    this.map = initMap('map')
    this.map.on('singleclick', (e) => {
      let feature = this.map.forEachFeatureAtPixel(
        e.pixel,
        (feature) => feature
      )
      if (feature && feature.values_.isws_point) {
        const featureInfo = { ...feature.values_.isws_point }
        if (!featureInfo.name) {
          const params = {
            targetId: featureInfo.targetId,
            mmsi: featureInfo.mmsi
          }
          getShipName(params).then((res) => {
            if (res.code === 0) {
              featureInfo.name = res.data.vesselName
              this.featureInfo = featureInfo
            }
          })
        }
        const pixel = this.map.getEventPixel(e.originalEvent)
        this.styles.left = pixel[0] + 'px'
        this.styles.top = pixel[1] + 'px'
        this.showWSModal = true
      } else {
        this.showWSModal = false
      }
    })
    renderArea()
    this.initWebSocket()

    // http://localhost:8080/#/?lot=12&lat=15
    const params = this.$route.query
    if (params.lot && params.lat) {
      this.showCamera = true
    }
  },
  destroyed() {
    this.socket && (this.socket.onclose = this.close)
  },
  methods: {
    initWebSocket() {
      if (typeof WebSocket === 'undefined') {
        alert('您的浏览器不支持socket')
      } else {
        // 实例化socket
        this.socket = new WebSocket(this.WSPATH)
        // 监听socket连接
        this.socket.onopen = this.open
        // 监听socket错误信息
        this.socket.onerror = this.error
        // 监听socket消息
        this.socket.onmessage = this.getMessage
      }
    },
    open() {
      console.log('socket连接成功')
    },
    error() {
      console.log('连接错误')
    },
    getMessage(msg) {
      const points = JSON.parse(msg.data)
      renderPoints(points)
    },
    // send(params) {
    //   this.socket.send(params)
    // },
    close() {
      console.log('socket已经关闭')
    },
    changeForbidden(isHide) {
      destroyForbiddenLayer(isHide)
    }
  }
}
</script>

<style lang="scss" scoped>
#map {
  width: 100%;
  height: 100%;
  position: relative;
}
.ws-modal {
  position: fixed;
  width: fit-content;
  max-width: 350px;
  height: fit-content;
  padding: 8px 10px;
  color: white;
  font-size: 20px;
  background: rgba(0, 0, 0, 0.8);
  z-index: 4;
  li {
    padding: 5px;
  }
}
.camera-dialog {
  padding: 20px 45px;
  background-image: url('@/assets/image/camera-bg.png');
  color: #fff;
  z-index: 4;
  :deep(.dialog-body) {
    overflow: hidden;
    padding-bottom: 30px;
  }
  .box {
    background-color: #043464;
  }
  .left {
    width: 610px;
    margin-right: 20px;
  }
  .box1 {
    width: 100%;
    height: 300px;
  }
  .box2 {
    margin-right: 10px;
  }
  .box2,
  .box3 {
    display: inline-block;
    margin-top: 10px;
    width: 300px;
    height: 200px;
  }
  .right {
    display: flex;
    flex-direction: column;
  }
  .box4 {
    width: 300px;
    height: 300px;
  }
  ul {
    flex: 1;
    margin-bottom: 15px;
  }
  li {
    margin: 15px 0;
    span {
      display: inline-block;
      &:first-child {
        width: 5em;
        text-align: right;
      }
    }
  }
}
</style>
