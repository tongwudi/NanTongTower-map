<template>
  <div id="map">
    <LeftBottomOperation @changePoint="changePoint" />
    <RightBottomOperation />

    <ul class="point-modal" :style="pointStyles" v-show="showPointModal">
      <li>
        <span>船名：</span><span>{{ pointInfo.name }}</span>
      </li>
      <li>
        <span>船长：</span><span>{{ pointInfo.length }}米</span>
      </li>
      <li>
        <span>航向：</span><span>{{ pointInfo.course }}</span>
      </li>
      <li>
        <span>航速：</span><span>{{ pointInfo.speed }}</span>
      </li>
      <li>
        <span>经度：</span><span>{{ pointInfo.longitude }}</span>
      </li>
      <li>
        <span>纬度：</span><span>{{ pointInfo.latitude }}</span>
      </li>
      <li>
        <span>状态：</span><span>{{ pointInfo.state | filterState }}</span>
      </li>
      <li>
        <span>时间：</span><span>{{ pointInfo.timestamp | fommatDate }}</span>
      </li>
      <li>
        <span>mmsi：</span><span>{{ pointInfo.mmsi }}</span>
      </li>
    </ul>

    <ul class="marker-modal" :style="markerStyles" v-show="showMarkerModal">
      <li class="bold">{{ markerInfo.name }}</li>
      <li>
        告警数量:
        <span class="red bold">{{ markerInfo.num }}</span>
        个
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
import { getShipName, getByRegion, getMarkerPoint } from '@/api/index'
import {
  initMap,
  renderForbidden,
  renderMarkerFeature,
  renderWsPoints,
  renderYjPoints,
  removePointsLayer,
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
      showPointModal: false,
      pointStyles: {},
      pointInfo: {},
      showMarkerModal: false,
      markerStyles: {},
      markerInfo: {},
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

    this.initWebSocket()
    // 渲染禁区图形
    renderForbidden()
    // 获取标记点位信息
    this.getMarkerPoint()
    // 挂载点位单击事件
    this.mountSingleClick()
    // 挂载标记点鼠标滑过事件
    this.mountPointerMove()

    // 地址实例：http://localhost:8080/#/?lot=12&lat=15
    const params = this.$route.query
    if (params.lot && params.lat) {
      this.showCamera = true
    }
  },
  destroyed() {
    this.socket && this.socket.close()
  },
  methods: {
    async getMarkerPoint() {
      const res = await getMarkerPoint()
      const markers = res.data || []
      if (markers.length > 0) {
        // 色块区域覆盖   type  1涉险  2采砂
        const areas = [
          { lon: 120.867117, lat: 31.963577, name: '滨江公园北', type: 1 },
          { lon: 120.968597, lat: 31.814501, name: '开发区正大农药', type: 1 },
          { lon: 121.029814, lat: 31.795243, name: '新通海沙西搬迁', type: 1 },
          { lon: 120.870082, lat: 31.957349, name: '狼山水厂', type: 1 },
          { lon: 120.809163, lat: 32.014143, name: '通吕运河口', type: 2 },
          { lon: 120.867117, lat: 31.963577, name: '滨江公园北', type: 2 },
          { lon: 120.934619, lat: 31.857711, name: '南通惠生重工', type: 2 },
          {
            lon: 120.741801,
            lat: 32.041311,
            name: '九圩港船闸管理所南',
            type: 2
          },
          { lon: 120.946811, lat: 31.819622, name: '王子造纸', type: 2 },
          { lon: 121.054611, lat: 31.792236, name: '新通海沙南', type: 2 }
        ]
        renderMarkerFeature(markers, areas)
      }
    },
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
        // 监听socket消息
        this.socket.onclose = this.close
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
      renderWsPoints(points)
    },
    close() {
      console.log('socket已经关闭')
    },
    async getYJRegion() {
      const res = await getByRegion()
      const points = res.result.targets?.filter((item) => item.stp != 0) || []
      renderYjPoints(points)
    },
    changePoint(isYj) {
      removePointsLayer(isYj)
      if (isYj) {
        this.socket && this.socket.close()
        this.getYJRegion()
      } else {
        this.initWebSocket()
      }
    },
    mountSingleClick() {
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
              }
            })
          }
          this.pointInfo = featureInfo
          const pixel = this.map.getEventPixel(e.originalEvent)
          this.pointStyles.left = pixel[0] + 'px'
          this.pointStyles.top = pixel[1] + 'px'
          this.showPointModal = true
        } else {
          this.showPointModal = false
        }
      })
    },
    mountPointerMove() {
      this.map.on('pointermove', (e) => {
        let feature = this.map.forEachFeatureAtPixel(
          e.pixel,
          (feature) => feature
        )
        if (feature && feature.values_.marker) {
          const featureInfo = { ...feature.values_.marker }
          if (featureInfo.status !== 0 && featureInfo.alarmList?.length > 0) {
            this.map.getTargetElement().style.cursor = 'pointer'
            this.markerInfo = {
              name: featureInfo.name,
              num: featureInfo.alarmList.length
            }
            const pixel = this.map.getEventPixel(e.originalEvent)
            this.markerStyles.left = pixel[0] + 'px'
            this.markerStyles.top = pixel[1] + 'px'
            this.showMarkerModal = true
          }
        } else {
          this.map.getTargetElement().style.cursor = 'auto'
          this.showMarkerModal = false
        }
      })
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
.marker-modal,
.point-modal {
  position: fixed;
  padding: 8px 10px;
  color: white;
  font-size: 20px;
  background: rgba(0, 0, 0, 0.8);
  z-index: 4;
  li {
    padding: 5px;
  }
  .red {
    color: red;
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
