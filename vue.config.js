const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.7:8083', // 需要代理的服务器地址
        // target: 'http://192.168.11.106:8083/',
        changeOrigin: true, // 为true时，发送请求头中的host会设置成target。为false，则不变。默认为true
        pathRewrite: { '/api': '' } // 发送请求时，请求路径重写：将 /a/xxx --> /xxx （去掉/a）
      }
    }
  }
})
