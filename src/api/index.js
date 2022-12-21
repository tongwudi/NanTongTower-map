import request from '@/utils/request'

// 区域列表
export const getAreaList = (params) =>
  request.get('/api/alarmInfo/areaList', { params })

// 鹰觉点位
export const getByRegion = () =>
  request.get(
    'http://221.181.113.142:32187/target/getByRegion?minLon=120.0551420838862&minLat=31.197246498871603&maxLon=122.46518797049585&maxLat=32.67199009043264&zoom=14'
  )

// 保存绘制区域
export const saveArea = (data) =>
  request.post('/api/alarmInfo/areaSave', { data })
